"""Build the fictitious deliverable offered for download in the demo.

    python scripts/build_deliverable.py

Writes, from src/data/catalogue.json:
    public/downloads/HarbourMarket_Protein_Ratio_DEMO.xlsx   formula-driven workbook
    public/downloads/HarbourMarket_products_DEMO.csv         line-level file

openpyxl writes formulas without evaluating them. The script therefore recomputes
every headline figure in Python and, when LibreOffice is installed, recalculates the
workbook and compares the two. It refuses to finish on any difference.
"""
from __future__ import annotations

import csv
import json
import shutil
import subprocess
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "data" / "catalogue.json"
OUT = ROOT / "public" / "downloads"
XLSX = OUT / "HarbourMarket_Protein_Ratio_DEMO.xlsx"
CSV = OUT / "HarbourMarket_products_DEMO.csv"

NAVY, GOLD, RED = "14264A", "8A6D1F", "B42318"
INPUT_FILL = PatternFill("solid", fgColor="FFF6E3")
HEAD_FILL = PatternFill("solid", fgColor=NAVY)
BAND_FILL = PatternFill("solid", fgColor="EEF2F9")
HEAD_FONT = Font(name="Arial", bold=True, color="FFFFFF", size=10)
BODY_FONT = Font(name="Arial", size=10)
BOLD = Font(name="Arial", size=10, bold=True)
TITLE = Font(name="Arial", size=16, bold=True, color=NAVY)
WARN = Font(name="Arial", size=11, bold=True, color=RED)
THIN = Side(style="thin", color="D9E0EC")
BOX = Border(bottom=THIN)

PT_CLASSES = ["animal_core", "composite", "plant_non_core", "plant_core"]
PT_LABEL = {"animal_core": "Animal core", "composite": "Animal & plant composite",
            "plant_non_core": "Plant-based non-core", "plant_core": "Plant-based core"}
FG = {"FG1": "Protein-rich foods", "FG2": "Dairy & alternatives", "FG3": "Fats & oils",
      "FG4": "Fruit & vegetables", "FG5": "Grains & cereals", "FG6": "Tubers & starchy vegetables",
      "FG7": "Snacks high in fat, salt & sugar"}
CATS = ["meat_based", "seafood_based", "vegetarian", "vegan"]
SPLIT_LABEL = {"one_side": "All ingredients on one side", "class": "Follows the class",
               "step4a": "First ingredient (step 4a)", "ingredients": "Ingredient list",
               "nevo": "NEVO food table (ratio only)", "convention": "50/50 convention"}
PROT_LABEL = {"declared": "Declared by the retailer", "reference_base": "Altera reference base",
              "off_ean": "Open Food Facts, by EAN", "name_match": "Name match (CIQUAL / NEVO)",
              "stratum_median": "Median of the family"}
BANNER = "FICTITIOUS DATA — demo file. Harbour Market, its brands and every figure are invented."

# product sheet columns: (header, key or None for formulas, width)
COLS = [
    ("Product ID", "id", 11), ("Code", "code", 16), ("Till label", "label", 34), ("Product name", "name", 34),
    ("Brand", "brand", 16), ("Department", "dept", 20), ("Family", "family", 18),
    ("In scope", "in_scope", 9), ("PT class", "pt", 22), ("Data level", "level", 9),
    ("Split source", "split_src", 26), ("Protein g/100g", "prot", 11), ("Protein source", "prot_src", 24),
    ("Plant protein g/100g", "plant", 11), ("Animal protein g/100g", "animal", 11),
    ("WWF in scope", "wwf_in", 9), ("WWF structure", "struct", 12), ("Food group", "fg", 9),
    ("WWF sub-group", "sub", 18), ("WWF origin", "src", 10), ("Composite category", "cat", 15),
    ("WWF exclusion", "excl", 14), ("Dairy factor", "dairy", 8), ("Net weight kg", "weight", 10),
    ("Weight source", "weight_src", 14), ("Units sold (INPUT)", "units", 13),
    ("Mass kg", None, 12), ("Protein kg", None, 12), ("Plant protein kg", None, 12),
    ("Animal protein kg", None, 12), ("WWF tonnes", None, 11), ("WWF tonnes, dairy eq.", None, 12),
]
C = {h: get_column_letter(i + 1) for i, (h, _, _) in enumerate(COLS)}


def flat(p: dict) -> dict:
    w = p.get("wwf", {})
    return {
        **p,
        "in_scope": "yes" if p.get("in_scope") else "no",
        "wwf_in": "yes" if p.get("wwf_in") else "no",
        "pt": PT_LABEL.get(p.get("pt", ""), "") if p.get("pt_in") else "",
        "level": p.get("level", "") or "",
        "split_src": SPLIT_LABEL.get(p.get("split_src", ""), ""),
        "prot_src": PROT_LABEL.get(p.get("prot_src", ""), ""),
        "prot": p.get("prot", 0) if p.get("pt_in") else None,
        "plant": p.get("plant", 0) if p.get("pt_in") else None,
        "animal": p.get("animal", 0) if p.get("pt_in") else None,
        "struct": w.get("struct", "") if p.get("wwf_in") else "",
        "fg": w.get("fg", "") if p.get("wwf_in") else "",
        "sub": (w.get("sub", "") or "").replace("_", " ") if p.get("wwf_in") else "",
        "src": w.get("src", "") if p.get("wwf_in") and w.get("struct") == "whole" else "",
        "cat": (w.get("cat", "") or "").replace("_", "-") if p.get("wwf_in") else "",
        "excl": (w.get("excl", "") or "").replace("_", " "),
        "dairy": p.get("dairy", 1),
        "units": p.get("units", 0),
    }


# ------------------------------------------------------------ expected figures, in Python
def expected(products: list[dict]) -> dict:
    tot = pl = an = 0.0
    by_class = defaultdict(float)
    by_dept = defaultdict(lambda: [0.0, 0.0])
    level = defaultdict(float)
    fg = defaultdict(lambda: [0.0, 0.0])          # plant, animal (dairy eq. for FG2)
    whole = comp = excl = 0.0
    cats = defaultdict(float)
    for p in products:
        if not p.get("in_scope"):
            continue
        kg = p.get("units", 0) * p["weight"]
        if p.get("pt_in"):
            t = kg * p.get("prot", 0) / 100
            tot += t
            pl += kg * p.get("plant", 0) / 100
            an += kg * p.get("animal", 0) / 100
            by_class[p["pt"]] += t
            by_dept[p["dept"]][0] += kg * p.get("plant", 0) / 100
            by_dept[p["dept"]][1] += t
            level[p["level"]] += t
        tn = kg / 1000
        w = p.get("wwf", {})
        if not p.get("wwf_in"):
            excl += tn
        elif w.get("struct") == "composite":
            comp += tn
            cats[w.get("cat")] += tn
        else:
            whole += tn
            eq = tn * p.get("dairy", 1) if w.get("fg") == "FG2" else tn
            fg[w["fg"]][0 if w.get("src") == "plant" else 1] += eq
    fg12 = sum(fg[g][0] for g in ("FG1", "FG2")) / sum(sum(fg[g]) for g in ("FG1", "FG2"))
    return {"pt_ratio": pl / tot, "pt_total_t": tot / 1000, "pt_plant_t": pl / 1000,
            "by_class": dict(by_class), "level_a": level["A"] / tot, "whole_t": whole,
            "composite_t": comp, "excluded_t": excl, "wwf_fg12_plant": fg12, "fg": dict(fg), "cats": dict(cats),
            "by_dept": {d: v[0] / v[1] for d, v in by_dept.items() if v[1]}}


# ------------------------------------------------------------ workbook
def head(ws, row: int, labels: list[str], col: int = 1):
    for i, h in enumerate(labels):
        c = ws.cell(row=row, column=col + i, value=h)
        c.font, c.fill = HEAD_FONT, HEAD_FILL
        c.alignment = Alignment(vertical="center", wrap_text=True)


def build(products: list[dict]) -> None:
    wb = Workbook()
    n = len(products)
    first, last = 3, 2 + n
    rng = lambda h: f"Products!${C[h]}${first}:${C[h]}${last}"  # noqa: E731

    # --- Read me
    ws = wb.active
    ws.title = "Read me"
    ws["A1"] = "Harbour Market — protein ratio (DEMO)"
    ws["A1"].font = TITLE
    ws["A2"] = BANNER
    ws["A2"].font = WARN
    meas = sum(1 for p in products if p.get("in_scope"))
    nonfood = sum(1 for p in products if p["dept"] == "Household" and "test_item" not in p.get("issues", []))
    tests = sum(1 for p in products if "test_item" in p.get("issues", []))
    unsold = sum(1 for p in products if "no_sales" in p.get("issues", []))
    lines = [
        ("What this file is", "An example of the workbook Altera AI delivers. It is built from an invented catalogue of "
         f"{n} products and exists only to show the structure of a real deliverable."),
        ("How to use it", "The yellow column 'Units sold (INPUT)' on the Products sheet is the only input. Change a volume "
         "and every figure on the Protein Tracker and WWF sheets recalculates."),
        ("Protein Tracker", "Green Protein Alliance / ProVeg methodology. Tonnes of protein, split plant / animal. "
         "Level A: the split is measured. Level B: it follows the class or the 50/50 convention."),
        ("WWF Planet-Based Diets", "Tonnes of product. Whole products by food group, composites by category. "
         "FG2 in dairy equivalents (hard and soft cheese x10). Appendix A exclusions apply."),
        ("Scope", f"Measured: {meas} products sold over the year. Left out: {nonfood} non-food items, {tests} test items, "
         f"{unsold} products without sales. WWF scope: alcohol, beverages other than dairy, coffee and tea, herbs and "
         "spices, condiments and stock excluded (Appendix A)."),
        ("Sources of each value", "Every protein value and every split carries its source in its own column."),
    ]
    for i, (k, v) in enumerate(lines):
        ws.cell(row=4 + i * 2, column=1, value=k).font = BOLD
        c = ws.cell(row=4 + i * 2, column=2, value=v)
        c.font, c.alignment = BODY_FONT, Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[4 + i * 2].height = 42
    ws.column_dimensions["A"].width = 24
    ws.column_dimensions["B"].width = 100

    # --- Products
    ws = wb.create_sheet("Products")
    ws["A1"] = BANNER
    ws["A1"].font = WARN
    head(ws, 2, [h for h, _, _ in COLS])
    ws.row_dimensions[2].height = 30
    for i, (_, _, w) in enumerate(COLS):
        ws.column_dimensions[get_column_letter(i + 1)].width = w
    for r, p in enumerate(products, start=first):
        f = flat(p)
        for ci, (h, key, _) in enumerate(COLS, start=1):
            if key is None:
                continue
            v = f.get(key)
            c = ws.cell(row=r, column=ci, value=v if v != "" else None)
            c.font = BODY_FONT
            if key == "code":
                c.number_format = "@"          # codes stay text: leading zeros intact
            if key == "units":
                c.fill = INPUT_FILL
                c.number_format = "#,##0"
        U, W, P = f"{C['Units sold (INPUT)']}{r}", f"{C['Net weight kg']}{r}", f"{C['In scope']}{r}"
        ws[f"{C['Mass kg']}{r}"] = f'=IF({P}="yes",{U}*{W},0)'
        ws[f"{C['Protein kg']}{r}"] = f'=IF({P}="yes",{C["Mass kg"]}{r}*N({C["Protein g/100g"]}{r})/100,0)'
        ws[f"{C['Plant protein kg']}{r}"] = f'=IF({P}="yes",{C["Mass kg"]}{r}*N({C["Plant protein g/100g"]}{r})/100,0)'
        ws[f"{C['Animal protein kg']}{r}"] = f'=IF({P}="yes",{C["Mass kg"]}{r}*N({C["Animal protein g/100g"]}{r})/100,0)'
        ws[f"{C['WWF tonnes']}{r}"] = f'=IF({C["WWF in scope"]}{r}="yes",{C["Mass kg"]}{r}/1000,0)'
        ws[f"{C['WWF tonnes, dairy eq.']}{r}"] = (
            f'=IF({C["Food group"]}{r}="FG2",{C["WWF tonnes"]}{r}*{C["Dairy factor"]}{r},{C["WWF tonnes"]}{r})')
        for h in ("Mass kg", "Protein kg", "Plant protein kg", "Animal protein kg"):
            ws[f"{C[h]}{r}"].number_format = "#,##0.0"
            ws[f"{C[h]}{r}"].font = BODY_FONT
        for h in ("WWF tonnes", "WWF tonnes, dairy eq."):
            ws[f"{C[h]}{r}"].number_format = "#,##0.000"
            ws[f"{C[h]}{r}"].font = BODY_FONT
    dv = DataValidation(type="decimal", operator="greaterThanOrEqual", formula1="0",
                        error="Units sold must be a number, zero or more.", showErrorMessage=True)
    ws.add_data_validation(dv)
    dv.add(f"{C['Units sold (INPUT)']}{first}:{C['Units sold (INPUT)']}{last}")
    ws.freeze_panes = "D3"
    ws.auto_filter.ref = f"A2:{get_column_letter(len(COLS))}{last}"

    # --- Protein Tracker
    ws = wb.create_sheet("Protein Tracker")
    ws["A1"] = "Protein Tracker — plant share of protein sold"
    ws["A1"].font = TITLE
    ws["A2"] = BANNER
    ws["A2"].font = WARN
    head(ws, 4, ["Indicator", "Value"])
    pk, pp, pa = rng("Protein kg"), rng("Plant protein kg"), rng("Animal protein kg")
    rows = [("Plant protein sold (t)", f"=SUM({pp})/1000", "#,##0.0"),
            ("Animal protein sold (t)", f"=SUM({pa})/1000", "#,##0.0"),
            ("Total protein sold (t)", f"=SUM({pk})/1000", "#,##0.0"),
            ("Protein ratio — plant share", "=IFERROR(B5/B7,0)", "0.0%"),
            ("Protein measured at level A", f'=IFERROR(SUMIFS({pk},{rng("Data level")},"A")/1000/B7,0)', "0.0%"),
            ("Check: plant + animal = total", "=IF(ABS(B5+B6-B7)<0.001,\"OK\",\"ERROR\")", "@")]
    for i, (k, fml, fmt) in enumerate(rows, start=5):
        ws.cell(row=i, column=1, value=k).font = BODY_FONT
        c = ws.cell(row=i, column=2, value=fml)
        c.number_format, c.font = fmt, BOLD if i == 8 else BODY_FONT
    head(ws, 13, ["PT class", "Protein (t)", "Share of protein"])
    for i, cl in enumerate(PT_CLASSES, start=14):
        ws.cell(row=i, column=1, value=PT_LABEL[cl]).font = BODY_FONT
        ws.cell(row=i, column=2, value=f'=SUMIFS({pk},{rng("PT class")},A{i})/1000').number_format = "#,##0.0"
        ws.cell(row=i, column=3, value=f"=IFERROR(B{i}/$B$7,0)").number_format = "0.0%"
    ws.cell(row=18, column=1, value="Total").font = BOLD
    ws.cell(row=18, column=2, value="=SUM(B14:B17)").number_format = "#,##0.0"
    ws.cell(row=18, column=3, value='=IF(ABS(B18-B7)<0.001,"covers all classes","ERROR: a class is missing")')
    depts = sorted({p["dept"] for p in products if p.get("pt_in")})
    head(ws, 20, ["Department", "Plant protein (t)", "Total protein (t)", "Plant share"])
    for i, d in enumerate(depts, start=21):
        ws.cell(row=i, column=1, value=d).font = BODY_FONT
        ws.cell(row=i, column=2, value=f'=SUMIFS({pp},{rng("Department")},A{i})/1000').number_format = "#,##0.0"
        ws.cell(row=i, column=3, value=f'=SUMIFS({pk},{rng("Department")},A{i})/1000').number_format = "#,##0.0"
        ws.cell(row=i, column=4, value=f"=IFERROR(B{i}/C{i},0)").number_format = "0.0%"
    end = 20 + len(depts)
    ws.cell(row=end + 1, column=1, value="Total").font = BOLD
    ws.cell(row=end + 1, column=3, value=f"=SUM(C21:C{end})").number_format = "#,##0.0"
    ws.cell(row=end + 1, column=4, value=f'=IF(ABS(C{end + 1}-B7)<0.001,"covers all departments","ERROR: a department is missing")')
    for col, w in zip("ABCD", (34, 18, 18, 24)):
        ws.column_dimensions[col].width = w

    # --- WWF
    ws = wb.create_sheet("WWF")
    ws["A1"] = "WWF Planet-Based Diets — tonnes of product"
    ws["A1"].font = TITLE
    ws["A2"] = BANNER
    ws["A2"].font = WARN
    wt, we = rng("WWF tonnes"), rng("WWF tonnes, dairy eq.")
    head(ws, 4, ["Indicator", "Tonnes", "Share"])
    ws["A5"], ws["B5"] = "Whole products", f'=SUMIFS({wt},{rng("WWF structure")},"whole")'
    ws["A6"], ws["B6"] = "Composite products", f'=SUMIFS({wt},{rng("WWF structure")},"composite")'
    ws["A7"], ws["B7"] = "Total in WWF scope", "=B5+B6"
    ws["A8"], ws["B8"] = "Outside the WWF scope (Appendix A)", f'=SUMIFS({rng("Mass kg")},{rng("In scope")},"yes",{rng("WWF in scope")},"no")/1000'
    ws["C5"], ws["C6"] = "=IFERROR(B5/B7,0)", "=IFERROR(B6/B7,0)"
    head(ws, 10, ["Food group (whole products)", "Plant (t)", "Animal (t)", "Total (t)", "Plant share"])
    for i, (g, name) in enumerate(FG.items(), start=11):
        ws.cell(row=i, column=1, value=f"{g} {name}").font = BODY_FONT
        ws.cell(row=i, column=6, value=g).font = Font(name="Arial", size=8, color="FFFFFF")
        crit = f'{rng("WWF structure")},"whole",{rng("Food group")},F{i}'
        ws.cell(row=i, column=2, value=f'=SUMIFS({we},{crit},{rng("WWF origin")},"plant")')
        ws.cell(row=i, column=3, value=f'=SUMIFS({we},{crit},{rng("WWF origin")},"animal")')
        ws.cell(row=i, column=4, value=f"=B{i}+C{i}")
        ws.cell(row=i, column=5, value=f"=IFERROR(B{i}/D{i},0)").number_format = "0.0%"
    ws["A18"] = "FG2 in dairy equivalents: hard and soft cheese count x10."
    ws["A18"].font = Font(name="Arial", size=9, italic=True, color="6B7280")
    ws["A20"], ws["B20"] = "Plant share, FG1 + FG2 (mandatory split)", "=IFERROR((B11+B12)/(D11+D12),0)"
    ws["A20"].font, ws["B20"].font = BOLD, BOLD
    ws["B20"].number_format = "0.0%"
    head(ws, 22, ["Composite category", "Tonnes", "Share of composites"])
    for i, cat in enumerate(CATS, start=23):
        ws.cell(row=i, column=1, value=cat.replace("_", "-")).font = BODY_FONT
        ws.cell(row=i, column=2, value=f'=SUMIFS({wt},{rng("WWF structure")},"composite",{rng("Composite category")},A{i})')
        ws.cell(row=i, column=3, value=f"=IFERROR(B{i}/$B$6,0)").number_format = "0.0%"
    for r in list(range(5, 9)) + list(range(11, 18)) + list(range(23, 27)):
        for col in "BCD":
            if ws[f"{col}{r}"].value is not None and not ws[f"{col}{r}"].number_format.endswith("%"):
                ws[f"{col}{r}"].number_format = "#,##0.0"
    ws["C5"].number_format = ws["C6"].number_format = "0.0%"
    for col, w in zip("ABCDE", (40, 14, 14, 14, 14)):
        ws.column_dimensions[col].width = w

    wb.save(XLSX)


def write_csv(products: list[dict]) -> None:
    keys = [(h, k) for h, k, _ in COLS if k is not None]
    with CSV.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow([h.replace(" (INPUT)", "") for h, _ in keys])
        for p in products:
            f = flat(p)
            w.writerow(["" if f.get(k) is None else f.get(k) for _, k in keys])


# ------------------------------------------------------------ verification
def verify(products: list[dict], exp: dict) -> list[str]:
    errors = []
    soffice = shutil.which("soffice")
    if not soffice:
        print("  LibreOffice not found: formulas NOT recalculated, Python figures only.")
        return errors
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run([soffice, "--headless", "--calc", "--convert-to", "xlsx", "--outdir", tmp, str(XLSX)],
                       check=True, capture_output=True, timeout=180)
        wb = load_workbook(Path(tmp) / XLSX.name, data_only=True)
    pt, ww = wb["Protein Tracker"], wb["WWF"]
    got = {
        "pt_ratio": pt["B8"].value, "pt_total_t": pt["B7"].value, "pt_plant_t": pt["B5"].value,
        "level_a": pt["B9"].value, "whole_t": ww["B5"].value, "composite_t": ww["B6"].value,
        "excluded_t": ww["B8"].value, "wwf_fg12_plant": ww["B20"].value,
    }
    for k, v in got.items():
        if v is None or abs(v - exp[k]) > 1e-6 * max(1, abs(exp[k])):
            errors.append(f"{k}: workbook {v} vs python {exp[k]}")
    for i, cl in enumerate(PT_CLASSES, start=14):
        if abs(pt[f"B{i}"].value - exp["by_class"].get(cl, 0) / 1000) > 1e-6:
            errors.append(f"class {cl}")
    for txt in (pt["B10"].value, pt["C18"].value, pt[f"D{21 + len(exp['by_dept'])}"].value):
        if "ERROR" in str(txt):
            errors.append(f"workbook self-check: {txt}")
    n_formulas = sum(1 for s in wb.worksheets for row in s.iter_rows() for c in row
                     if isinstance(c.value, str) and c.value.startswith("#"))
    if n_formulas:
        errors.append(f"{n_formulas} cells evaluate to an error")
    print(f"  recalculated with LibreOffice: {len(got)} headline figures and {len(PT_CLASSES)} classes compared")
    return errors


def main() -> int:
    products = json.loads(SRC.read_text())["products"]
    OUT.mkdir(parents=True, exist_ok=True)
    exp = expected(products)
    build(products)
    write_csv(products)
    errors = verify(products, exp)
    print(f"  PT ratio {exp['pt_ratio']:.4%} · level A {exp['level_a']:.1%} · WWF FG1+FG2 plant {exp['wwf_fg12_plant']:.1%}")
    print(f"  -> {XLSX.relative_to(ROOT)} ({XLSX.stat().st_size // 1024} KB), {CSV.relative_to(ROOT)} ({CSV.stat().st_size // 1024} KB)")
    if errors:
        print("REFUSED:", *errors, sep="\n  ")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
