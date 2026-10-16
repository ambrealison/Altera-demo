"""Generate the fictitious catalogue behind the Altera AI demo.

Everything here is invented: the retailer (Harbour Market), the brands, the codes, the
volumes. Product labels imitate the STYLE of real retailer extractions — upper-case
till labels, abbreviations, pack formats such as 6X1.5L — without copying any real
product, figure or retailer.

The classification answers are not random. Each product is built from an archetype
that encodes the methodological answer the real chain would give, and the script
refuses to write a catalogue that breaks one of the rules the delivered workbook is
checked against (see `check()`).

    python scripts/generate_dataset.py      ->  src/data/catalogue.json
"""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

SEED = 20261016
TARGET = 800
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "catalogue.json"
R = random.Random(SEED)

RETAILER = "Harbour Market"
OWN = "HM"

# ---------------------------------------------------------------- vocabulary
# WWF: (included, structure, food group, source, sub-group, composite category)
def W(fg, src, sub="", struct="whole", cat=""):
    return {"in": True, "struct": struct, "fg": fg, "src": src, "sub": sub, "cat": cat}

def WC(cat):                      # a composite has no food group (assembler rule)
    return {"in": True, "struct": "composite", "fg": "", "src": "", "sub": "", "cat": cat}

def WX(reason):                   # excluded from WWF (Appendix A)
    return {"in": False, "reason": reason}

# ---------------------------------------------------------------- archetypes
# items: (till label core, long name, overrides)    sizes: (label, kg)
# split: "one_side" | "class" | "step4a" | "ingredients" | "nevo" | "convention"
# ps: plant share of protein for measured composites
A = []

def arch(key, dept, family, items, sizes, brands, *, n, prot, fat=0.0, carb=0.0,
         wwf, pt, split, ps=None, ingr=None, quid=False, pop=1.0, ref=0.35,
         stratum=False, conf=(0.90, 0.99), note=None, dairy=1, pt_scope=True,
         piece=False, weighed=False):
    A.append(dict(key=key, dept=dept, family=family, items=items, sizes=sizes,
                  brands=brands, n=n, prot=prot, fat=fat, carb=carb, wwf=wwf, pt=pt,
                  split=split, ps=ps, ingr=ingr, quid=quid, pop=pop, ref=ref,
                  stratum=stratum, conf=conf, note=note, dairy=dairy,
                  pt_scope=pt_scope, piece=piece, weighed=weighed))

# --- Fresh meat & poultry
MEAT, DELI, FISH, DAIRY, CHEESE, PLANT = ("Fresh Meat & Poultry", "Deli",
    "Fish & Seafood", "Dairy & Eggs", "Cheese", "Plant-Based")
FV, BAKE, GROC, SNACK, FROZ, READY, BEV, ALC, HOME = ("Fruit & Vegetables", "Bakery",
    "Grocery", "Breakfast & Snacks", "Frozen", "Ready Meals", "Soft Drinks & Water",
    "Beer, Wine & Spirits", "Household")

arch("beef_mince", MEAT, "Beef", [("BF MINCE 5%", "Beef mince, 5% fat", {"prot": 20.5}),
     ("BF MINCE 15%", "Beef mince, 15% fat", {"prot": 18.5}),
     ("BF MINCE 20%", "Beef mince, 20% fat", {"prot": 17.5})],
     [("500G", .5), ("1KG", 1.0), ("400G", .4), ("750G", .75)], [OWN, "TARROW"], n=10,
     prot=19, fat=12, carb=0, wwf=W("FG1", "animal", "red_meat"), pt="animal_core",
     split="one_side", ingr="Beef (100%)", pop=6, ref=.55, stratum=True)
arch("beef_steak", MEAT, "Beef", [("BF SIRLOIN STK", "Beef sirloin steak", {}),
     ("BF RUMP STK", "Beef rump steak", {}), ("BF FILLET STK", "Beef fillet steak", {}),
     ("BF DICED STEW", "Diced beef for stewing", {})],
     [("2X200G", .4), ("250G", .25), ("300G", .3), ("500G", .5)], [OWN, "TARROW"], n=10,
     prot=22, fat=7, wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="class",
     pop=2.5, ref=.5, stratum=True)
arch("pork", MEAT, "Pork", [("PORK LOIN CHOPS", "Pork loin chops", {}),
     ("PORK BELLY SLICES", "Pork belly slices", {"prot": 17}),
     ("PORK SHLDR JOINT", "Pork shoulder joint", {}), ("PORK MINCE", "Pork mince", {})],
     [("500G", .5), ("1KG", 1.0), ("400G", .4), ("4PK 600G", .6)], [OWN, "TARROW"], n=11,
     prot=20, fat=13, wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="class",
     pop=2.5, ref=.5, stratum=True)
arch("chicken", MEAT, "Poultry", [("CHKN BREAST FLT", "Chicken breast fillets", {"prot": 24}),
     ("CHKN THIGHS", "Chicken thighs", {"prot": 18}), ("WHOLE CHKN", "Whole chicken", {}),
     ("CHKN DRUMSTICKS", "Chicken drumsticks", {"prot": 19}),
     ("CHKN WINGS", "Chicken wings", {"prot": 18}), ("CHKN MINI FLT", "Chicken mini fillets", {"prot": 24})],
     [("300G", .3), ("500G", .5), ("1KG", 1.0), ("1.4KG", 1.4), ("650G", .65)], [OWN, "TARROW"],
     n=16, prot=21, fat=6, wwf=W("FG1", "animal", "poultry"), pt="animal_core",
     split="one_side", ingr="Chicken (100%)", pop=5, ref=.5, stratum=True)
arch("turkey_lamb", MEAT, "Turkey & Lamb", [("TKY BREAST STEAKS", "Turkey breast steaks", {"sub": "poultry"}),
     ("TKY MINCE", "Turkey mince", {"sub": "poultry"}), ("LAMB LEG STEAKS", "Lamb leg steaks", {}),
     ("LAMB MINCE", "Lamb mince", {"prot": 18})],
     [("300G", .3), ("400G", .4), ("500G", .5)], [OWN, "TARROW"], n=8, prot=21, fat=8,
     wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="class", pop=1.2, ref=.4,
     stratum=True)
arch("marinated", MEAT, "BBQ & Marinated", [("BBQ PORK RIBS MARIN", "Marinated BBQ pork ribs", {}),
     ("PIRI PIRI CHKN THIGH", "Piri-piri marinated chicken thighs", {"sub": "poultry"}),
     ("HONEY MUSTARD PORK", "Honey & mustard pork steaks", {})],
     [("500G", .5), ("700G", .7), ("400G", .4)], [OWN, "TARROW"], n=6, prot=16, fat=11, carb=5,
     wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="step4a",
     ingr="Pork 82%, water, sugar, tomato powder, wheat flour, spices, salt",
     pop=1.2, ref=.2, note="marinade")
arch("sausages", MEAT, "Sausages & Burgers", [("PORK SAUSAGES", "Pork sausages", {}),
     ("PORK CHIPOLATAS", "Pork chipolatas", {}), ("BF BURGERS 4PK", "Beef burgers, 4 pack", {"sub": "red_meat"}),
     ("CUMBERLAND SAUSAGES", "Cumberland sausages", {})],
     [("400G", .4), ("454G", .454), ("6PK", .4), ("12PK", .8)], [OWN, "TARROW"], n=10, prot=14,
     fat=18, carb=6, wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="step4a",
     ingr="Pork 72%, water, rusk (wheat flour, salt), seasoning, preservative",
     pop=2.5, ref=.35, note="rusk")

# --- Deli
arch("ham", DELI, "Cooked Meats", [("COOKED HAM", "Cooked ham", {}), ("SMKD HAM", "Smoked ham", {}),
     ("HONEY ROAST HAM", "Honey-roast ham", {}), ("HAM TRIM", "Ham trimmings", {})],
     [("8SL 200G", .2), ("125G", .125), ("400G", .4)], [OWN, "TARROW"], n=9, prot=18, fat=3,
     carb=1, wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="one_side",
     ingr="Pork 94%, water, salt, preservative", pop=3, ref=.5)
arch("salami", DELI, "Cured Meats", [("SALAMI MILANO", "Milano salami", {}),
     ("CHORIZO SLICES", "Chorizo slices", {}), ("PEPPERONI SLICES", "Pepperoni slices", {})],
     [("100G", .1), ("70G", .07), ("200G", .2)], [OWN, "CASTELNA"], n=7, prot=24, fat=30,
     carb=2, wwf=W("FG1", "animal", "red_meat"), pt="animal_core", split="one_side",
     ingr="Pork, salt, dextrose, spices, garlic, preservative", pop=1.5, ref=.4)
arch("chicken_slices", DELI, "Cooked Meats", [("ROAST CHKN SLICES", "Roast chicken slices", {}),
     ("TKY BREAST SLICES", "Turkey breast slices", {})], [("100G", .1), ("180G", .18)],
     [OWN, "TARROW"], n=4, prot=22, fat=2, wwf=W("FG1", "animal", "poultry"),
     pt="animal_core", split="one_side", ingr="Chicken breast 92%, water, salt", pop=2, ref=.5)
arch("pate", DELI, "Pâté", [("PORK LIVER PATE", "Pork liver pâté", {}),
     ("DUCK PATE ORANGE", "Duck pâté with orange", {"sub": "poultry"})], [("170G", .17), ("2X85G", .17)],
     [OWN, "CASTELNA"], n=3, prot=12, fat=26, carb=3, wwf=W("FG1", "animal", "red_meat"),
     pt="animal_core", split="class", pop=.6, ref=.3)
arch("houmous", DELI, "Dips", [("HOUMOUS CLASSIC", "Classic houmous", {}),
     ("HOUMOUS RED PEPPER", "Red pepper houmous", {}), ("HOUMOUS CARAMEL ONION", "Caramelised onion houmous", {})],
     [("200G", .2), ("300G", .3)], [OWN, "SOLVANE"], n=5, prot=7, fat=20, carb=11,
     wwf=W("FG1", "plant", "pulses"), pt="plant_core", split="one_side",
     ingr="Chickpeas 58%, rapeseed oil, tahini (sesame) 8%, lemon juice, garlic, salt",
     pop=2, ref=.4, note="houmous")

# --- Fish & seafood
arch("salmon", FISH, "Fresh Fish", [("SALMON FLT SKIN ON", "Salmon fillets, skin on", {}),
     ("SALMON FLT SKINLESS", "Skinless salmon fillets", {}), ("COD LOIN", "Cod loins", {"prot": 18}),
     ("SEA BASS FLT", "Sea bass fillets", {"prot": 19})],
     [("2X125G", .25), ("4X125G", .5), ("240G", .24), ("2X140G", .28)], [OWN, "KESTREL"], n=10,
     prot=20, fat=11, wwf=W("FG1", "animal", "fish_shellfish"), pt="animal_core",
     split="one_side", ingr="Salmon (fish) 100%", pop=2.5, ref=.45, stratum=True)
arch("prawns", FISH, "Shellfish", [("KING PRAWNS COOKED", "Cooked king prawns", {}),
     ("RAW KING PRAWNS", "Raw king prawns", {}), ("COOKED MUSSELS", "Cooked mussels", {"prot": 12})],
     [("150G", .15), ("225G", .225), ("400G", .4)], [OWN, "KESTREL"], n=7, prot=17, fat=1,
     wwf=W("FG1", "animal", "fish_shellfish"), pt="animal_core", split="class", pop=1.5, ref=.4,
     stratum=True)
arch("tuna", FISH, "Canned Fish", [("TUNA CHUNKS BRINE", "Tuna chunks in brine", {}),
     ("TUNA STEAK OLV OIL", "Tuna steak in olive oil", {"prot": 24}),
     ("MACKEREL TOM SCE", "Mackerel fillets in tomato sauce", {"prot": 15}),
     ("SARDINES OLV OIL", "Sardines in olive oil", {"prot": 23})],
     [("3X145G", .435), ("160G", .16), ("4X110G", .44), ("125G", .125)], [OWN, "KESTREL"], n=10,
     prot=25, fat=6, wwf=W("FG1", "animal", "fish_shellfish"), pt="animal_core",
     split="one_side", ingr="Tuna (fish) 70%, olive oil, salt", pop=2.5, ref=.55)
arch("smoked_salmon", FISH, "Smoked Fish", [("SMKD SALMON", "Smoked salmon", {}),
     ("SMKD SALMON TRIM", "Smoked salmon trimmings", {})], [("100G", .1), ("200G", .2)],
     [OWN, "KESTREL"], n=4, prot=22, fat=10, wwf=W("FG1", "animal", "fish_shellfish"),
     pt="animal_core", split="one_side", ingr="Salmon (fish) 97%, salt", pop=1.2, ref=.5)

# --- Dairy & eggs
arch("milk", DAIRY, "Milk", [("SEMI SKMD MILK", "Semi-skimmed milk", {}),
     ("WHOLE MILK", "Whole milk", {"prot": 3.3}), ("SKMD MILK", "Skimmed milk", {"prot": 3.5}),
     ("LACTOSE FREE MILK", "Lactose-free semi-skimmed milk", {})],
     [("1L", 1.03), ("2L", 2.06), ("4PT 2.27L", 2.34), ("500ML", .515)], [OWN, "FJELDA"], n=12,
     prot=3.4, fat=1.7, carb=4.8, wwf=W("FG2", "animal", "dairy"), pt="animal_core",
     split="one_side", ingr="Semi-skimmed milk", pop=14, ref=.7, stratum=True)
arch("yoghurt", DAIRY, "Yoghurt", [("NAT YOG", "Natural yoghurt", {}),
     ("GREEK STYLE YOG", "Greek-style yoghurt", {"prot": 6}), ("SKYR NAT", "Natural skyr", {"prot": 11})],
     [("500G", .5), ("4X125G", .5), ("450G", .45), ("1KG", 1.0)], [OWN, "FJELDA"], n=10, prot=4.5,
     fat=3, carb=6, wwf=W("FG2", "animal", "dairy"), pt="animal_core", split="one_side",
     ingr="Pasteurised milk, live yoghurt cultures", pop=4, ref=.55)
arch("fruit_yoghurt", DAIRY, "Yoghurt", [("STRAWB YOG", "Strawberry yoghurt", {}),
     ("PEACH YOG", "Peach yoghurt", {}), ("CHERRY YOG", "Cherry yoghurt", {}),
     ("SKYR STRAWB", "Strawberry skyr", {"prot": 9.5})],
     [("4X125G", .5), ("6X125G", .75), ("450G", .45)], [OWN, "FJELDA"], n=9, prot=3.6, fat=2.5,
     carb=13, wwf=W("FG2", "animal", "dairy"), pt="animal_core", split="step4a",
     ingr="Yoghurt (milk) 82%, strawberries 10%, sugar, maize starch, flavouring",
     pop=3, ref=.4, note="fruit_yoghurt")
arch("yog_cereal", DAIRY, "Yoghurt", [("YOG CEREAL MIX", "Yoghurt with cereal topping", {}),
     ("YOG GRANOLA POT", "Yoghurt & granola pot", {})], [("4X115G", .46), ("150G", .15)],
     ["FJELDA"], n=3, prot=4.4, fat=3.5, carb=16, wwf=WC("vegetarian"), pt="composite",
     split="ingredients", ps=.11, ingr="Yoghurt (milk) 84%, cereal topping 16% (oat flakes 9%, wheat flakes 5%, sugar)",
     quid=True, pop=1.2, ref=.1, conf=(.86, .95), note="level_a_composite")
arch("choc_milk", DAIRY, "Milk Drinks", [("CHOC MILK DRINK", "Chocolate milk drink", {}),
     ("STRAWB MILKSHAKE", "Strawberry milkshake", {"pt": "animal_core", "split": "step4a", "note": "fruit_yoghurt"})],
     [("6X200ML", 1.24), ("1L", 1.03), ("330ML", .34)], [OWN, "FJELDA"], n=5, prot=3.3, fat=1.5,
     carb=10, wwf=W("FG2", "animal", "dairy"), pt="composite", split="ingredients", ps=.07,
     ingr="Milk 93%, sugar, fat-reduced cocoa powder 1.4%, stabiliser", quid=True, pop=1.5,
     ref=.2, note="cocoa_counts")
arch("butter", DAIRY, "Butter & Spreads", [("SALTED BUTTER", "Salted butter", {}),
     ("UNSALTED BUTTER", "Unsalted butter", {}), ("SPREADABLE BUTTER", "Spreadable butter", {})],
     [("250G", .25), ("500G", .5)], [OWN, "FJELDA"], n=6, prot=.6, fat=82, carb=.6,
     wwf=W("FG3", "animal", "animal_fat"), pt="animal_core", split="one_side",
     ingr="Butter (milk), salt", pop=2.5, ref=.6)
arch("margarine", DAIRY, "Butter & Spreads", [("SUNFLOWER SPREAD", "Sunflower spread", {}),
     ("OLIVE SPREAD", "Olive oil spread", {})], [("500G", .5), ("1KG", 1.0)], [OWN, "SOLVANE"],
     n=4, prot=.1, fat=59, carb=.5, wwf=W("FG3", "plant", "plant_fat"), pt="plant_non_core",
     split="one_side", ingr="Plant oils (sunflower 30%, rapeseed), water, salt, emulsifier",
     pop=1.2, ref=.5)
arch("eggs", DAIRY, "Eggs", [("FREE RANGE EGGS", "Free-range eggs", {}),
     ("ORG FREE RANGE EGGS", "Organic free-range eggs", {}), ("LARGE EGGS", "Large eggs", {})],
     [("6PK", .36), ("12PK", .72), ("15PK", .9)], [OWN, "TARROW"], n=8, prot=12.5, fat=9.5,
     wwf=W("FG1", "animal", "eggs"), pt="animal_core", split="class", pop=4, ref=.6, stratum=True)

# --- Cheese
arch("hard_cheese", CHEESE, "Hard Cheese", [("MATURE CHEDDAR", "Mature cheddar", {}),
     ("MILD CHEDDAR", "Mild cheddar", {}), ("EMMENTAL SLICES", "Emmental slices", {"prot": 28}),
     ("PARMESAN WEDGE", "Parmesan wedge", {"prot": 33}), ("RED LEICESTER", "Red Leicester", {})],
     [("400G", .4), ("200G", .2), ("10SL 250G", .25), ("800G", .8)], [OWN, "ALDERWICK"], n=13,
     prot=25, fat=34, carb=.1, wwf=W("FG2", "animal", "dairy"), pt="animal_core",
     split="one_side", ingr="Cheese (milk), salt, rennet", pop=3, ref=.55, dairy=10, note="cheese_factor")
arch("soft_cheese", CHEESE, "Soft Cheese", [("BRIE", "Brie", {}), ("CAMEMBERT", "Camembert", {}),
     ("MOZZARELLA", "Mozzarella", {"prot": 18}), ("FETA", "Feta", {"prot": 17})],
     [("200G", .2), ("250G", .25), ("125G", .125)], [OWN, "ALDERWICK"], n=9, prot=20, fat=27,
     carb=.4, wwf=W("FG2", "animal", "dairy"), pt="animal_core", split="one_side",
     ingr="Pasteurised cow's milk, salt, cultures, rennet", pop=1.8, ref=.5, dairy=10, note="cheese_factor")
arch("fresh_cheese", CHEESE, "Fresh Cheese", [("SOFT CHEESE PLAIN", "Plain soft cheese", {}),
     ("COTTAGE CHEESE", "Cottage cheese", {"prot": 11}), ("QUARK", "Quark", {"prot": 12})],
     [("180G", .18), ("300G", .3), ("250G", .25)], [OWN, "ALDERWICK"], n=6, prot=7, fat=10, carb=3,
     wwf=W("FG2", "animal", "dairy"), pt="animal_core", split="one_side",
     ingr="Pasteurised skimmed milk, cream, salt, cultures", pop=1.5, ref=.45, note="fresh_cheese")
arch("herb_cheese", CHEESE, "Fresh Cheese", [("SOFT CHEESE GARLIC HERB", "Soft cheese with garlic & herbs", {})],
     [("180G", .18), ("150G", .15)], [OWN, "ALDERWICK"], n=2, prot=6.5, fat=22, carb=3,
     wwf=W("FG2", "animal", "dairy"), pt="animal_core", split="step4a",
     ingr="Soft cheese (milk) 92%, garlic 3%, herbs 2%, salt", pop=.8, ref=.3, note="cheese_herbs")

# --- Plant-based
arch("oat_drink", PLANT, "Plant Drinks", [("OAT DRINK", "Oat drink", {}),
     ("OAT DRINK BARISTA", "Oat drink, barista edition", {}),
     ("SOYA DRINK UNSWT", "Unsweetened soya drink", {"prot": 3.3}),
     ("ALMOND DRINK", "Almond drink", {"prot": .5})], [("1L", 1.03), ("6X1L", 6.18)],
     [OWN, "SOLVANE"], n=8, prot=1.0, fat=1.5, carb=6.5,
     wwf=W("FG2", "plant", "dairy_alternatives"), pt="plant_core", split="one_side",
     ingr="Water, oats 10%, rapeseed oil, calcium, salt", pop=3, ref=.4, note="plant_alt")
arch("soya_yog", PLANT, "Plant Yoghurts", [("SOYA YOG ALT NAT", "Plain soya yoghurt alternative", {}),
     ("COCONUT YOG ALT", "Coconut yoghurt alternative", {"prot": .8})], [("400G", .4), ("4X125G", .5)],
     [OWN, "SOLVANE"], n=4, prot=4, fat=2.3, carb=2, wwf=W("FG2", "plant", "dairy_alternatives"),
     pt="plant_core", split="one_side", ingr="Water, hulled soya beans 9%, sugar, cultures",
     pop=1, ref=.3, note="plant_alt")
arch("tofu", PLANT, "Tofu & Tempeh", [("TOFU FIRM", "Firm tofu", {}), ("SMKD TOFU", "Smoked tofu", {}),
     ("TEMPEH", "Tempeh", {"prot": 19}), ("SEITAN PIECES", "Seitan pieces", {"prot": 24})],
     [("280G", .28), ("400G", .4), ("200G", .2)], [OWN, "SOLVANE"], n=7, prot=13, fat=8, carb=2,
     wwf=W("FG1", "plant", "tofu_tempeh_seitan"), pt="plant_core", split="one_side",
     ingr="Water, soya beans 44%, firming agent", pop=1, ref=.35, note="seitan")
arch("plant_meat", PLANT, "Meat Alternatives", [("PLANT BURGERS", "Plant-based burgers", {}),
     ("PLANT MINCE", "Plant-based mince", {"prot": 17}), ("PLANT SAUSAGES", "Plant-based sausages", {}),
     ("PLANT NUGGETS", "Plant-based nuggets", {"prot": 13}), ("PLANT CHKN PIECES", "Plant-based chicken-style pieces", {"prot": 19})],
     [("226G", .226), ("300G", .3), ("400G", .4), ("6PK 270G", .27)], [OWN, "SOLVANE"], n=11,
     prot=16, fat=12, carb=7, wwf=W("FG1", "plant", "alternative_products"), pt="plant_core",
     split="one_side", ingr="Water, pea protein 18%, rapeseed oil, wheat protein, spices",
     pop=1.5, ref=.25, conf=(.88, .98), note="substitute_whole")
arch("vegan_cheese", PLANT, "Dairy Alternatives", [("VEGAN CHEDDAR STYLE", "Vegan cheddar-style block", {}),
     ("VEGAN SLICES", "Vegan cheese-style slices", {})], [("200G", .2), ("10SL 180G", .18)],
     [OWN, "SOLVANE"], n=3, prot=1, fat=23, carb=21, wwf=W("FG2", "plant", "dairy_alternatives"),
     pt="plant_core", split="one_side", ingr="Water, coconut oil 23%, modified starch, salt, flavouring",
     pop=.5, ref=.2, conf=(.84, .95), note="style_marker")

# --- Fruit & vegetables
FRUIT = [("APPLES PINK LADY", "Pink Lady apples", .3), ("APPLES GALA", "Gala apples", .3),
         ("BANANAS", "Bananas", 1.1), ("ORANGES", "Oranges", .9), ("CLEMENTINES", "Clementines", .8),
         ("RED GRAPES SEEDLESS", "Seedless red grapes", .6), ("STRAWBERRIES", "Strawberries", .7),
         ("BLUEBERRIES", "Blueberries", .7), ("CONFERENCE PEARS", "Conference pears", .4),
         ("LEMONS", "Lemons", .6), ("KIWI", "Kiwi fruit", 1.1), ("RASPBERRIES", "Raspberries", 1.2)]
VEG = [("TOMATOES VINE", "Vine tomatoes", .9), ("CHERRY TOMATOES", "Cherry tomatoes", .9),
       ("CUCUMBER", "Cucumber", .6), ("CARROTS", "Carrots", .6), ("BROWN ONIONS", "Brown onions", 1.1),
       ("MIXED PEPPERS", "Mixed peppers", .9), ("BROCCOLI", "Broccoli", 2.8),
       ("CAULIFLOWER", "Cauliflower", 1.9), ("COURGETTES", "Courgettes", 1.8),
       ("CLOSED CUP MUSHROOMS", "Closed cup mushrooms", 3.1), ("ICEBERG LETTUCE", "Iceberg lettuce", 1.0),
       ("BABY SPINACH", "Baby spinach", 2.9), ("LEEKS", "Leeks", 1.5), ("GARLIC 4PK", "Garlic bulbs", 6.4),
       ("GREEN BEANS", "Fine green beans", 1.8), ("SWEETCORN COBS", "Sweetcorn cobs", 3.2)]
arch("fruit", FV, "Fruit", [(l, n, {"prot": p}) for l, n, p in FRUIT],
     [("KG", 1.0), ("1KG", 1.0), ("6PK", .9), ("500G", .5), ("250G", .25), ("LOOSE", 1.0)],
     [OWN], n=48, prot=.6, carb=12, wwf=W("FG4", "plant"), pt="plant_non_core", split="class",
     pop=6, ref=.35, stratum=True, weighed=True)
arch("veg", FV, "Vegetables", [(l, n, {"prot": p}) for l, n, p in VEG],
     [("KG", 1.0), ("500G", .5), ("1KG", 1.0), ("300G", .3), ("EACH", 1.0)], [OWN],
     n=56, prot=1.2, carb=5, wwf=W("FG4", "plant"), pt="plant_non_core", split="class",
     pop=4.5, ref=.35, stratum=True, weighed=True)
arch("piece_fruit", FV, "Exotic Fruit", [("AVOCADO RIPE", "Ripe avocado", {"prot": 1.9}),
     ("MELON GALIA", "Galia melon", {"prot": .8}), ("PINEAPPLE", "Pineapple", {"prot": .5}),
     ("MANGO RIPE", "Ripe mango", {"prot": .8})], [("EACH", 1.0)], [OWN], n=4, prot=.9, carb=12,
     wwf=W("FG4", "plant"), pt="plant_non_core", split="class", pop=3, ref=.3, piece=True,
     note="piece_weight")
arch("potatoes", FV, "Potatoes", [("WHITE POTATOES", "White potatoes", {}),
     ("BABY POTATOES", "Baby potatoes", {}), ("MARIS PIPER POTATOES", "Maris Piper potatoes", {}),
     ("SWEET POTATOES", "Sweet potatoes", {"prot": 1.6})], [("2.5KG", 2.5), ("1KG", 1.0), ("750G", .75)],
     [OWN], n=8, prot=2.0, carb=17, wwf=W("FG6", "plant"), pt="plant_non_core", split="class",
     pop=4, ref=.45, stratum=True)

# --- Bakery
arch("white_bread", BAKE, "Bread", [("WHITE BLOOMER", "White bloomer", {}),
     ("WHITE SLICED THICK", "Thick sliced white bread", {}), ("BAGUETTE", "Baguette", {}),
     ("WHITE PITTA", "White pitta bread", {}), ("TORTILLA WRAPS", "Plain tortilla wraps", {"prot": 8})],
     [("800G", .8), ("400G", .4), ("250G", .25), ("6PK 360G", .36)], [OWN, "BRAMBLECOTE"], n=11,
     prot=8.5, fat=2, carb=46, wwf=W("FG5", "plant", "refined_grain"), pt="plant_non_core",
     split="one_side", ingr="Wheat flour, water, yeast, salt, rapeseed oil", pop=5, ref=.5)
arch("whole_bread", BAKE, "Bread", [("WHOLEMEAL SLICED", "Wholemeal sliced bread", {"sub": "whole_grain"}),
     ("SEEDED BATCH", "Seeded batch loaf", {"sub": "refined_grain"}),
     ("RYE BREAD", "Rye bread", {"sub": "refined_grain", "note": "rye"})],
     [("800G", .8), ("400G", .4), ("500G", .5)], [OWN, "BRAMBLECOTE"], n=7, prot=10, fat=3,
     carb=40, wwf=W("FG5", "plant", "whole_grain"), pt="plant_non_core", split="one_side",
     ingr="Wholemeal wheat flour, water, yeast, salt", pop=2.5, ref=.45)
arch("viennoiserie", BAKE, "Pastries", [("ALL BUTTER CROISSANTS", "All-butter croissants", {}),
     ("PAIN AU CHOCOLAT", "Pains au chocolat", {}), ("BRIOCHE ROLLS", "Brioche rolls", {"ps": .55})],
     [("4PK 180G", .18), ("6PK 270G", .27), ("8PK 280G", .28)], [OWN, "BRAMBLECOTE"], n=7, prot=8,
     fat=21, carb=43, wwf=W("FG7", "plant"), pt="composite", split="nevo", ps=.72,
     ingr="Wheat flour, butter (milk) 22%, water, sugar, eggs, yeast, salt", pop=2, ref=.3,
     conf=(.86, .96), note="pastry")
arch("cakes", BAKE, "Cakes", [("VICTORIA SPONGE", "Victoria sponge cake", {}),
     ("CARROT CAKE", "Carrot cake", {}), ("CHOC FUDGE CAKE", "Chocolate fudge cake", {})],
     [("400G", .4), ("6PK 300G", .3)], [OWN, "BRAMBLECOTE"], n=5, prot=5, fat=18, carb=50,
     wwf=W("FG7", "plant"), pt="composite", split="convention",
     ingr="Sugar, wheat flour, eggs, butter (milk), raspberry jam, raising agent", pop=1.2,
     ref=.2, conf=(.82, .93), note="cakes")

# --- Grocery
arch("pasta", GROC, "Pasta", [("SPAGHETTI", "Spaghetti", {}), ("PENNE RIGATE", "Penne rigate", {}),
     ("FUSILLI", "Fusilli", {}), ("FARFALLE", "Farfalle", {}), ("LINGUINE", "Linguine", {})],
     [("500G", .5), ("1KG", 1.0), ("3KG", 3.0)], [OWN, "ORVALIS"], n=12, prot=12.5, fat=1.5,
     carb=71, wwf=W("FG5", "plant", "refined_grain"), pt="plant_non_core", split="one_side",
     ingr="Durum wheat semolina", pop=4, ref=.6)
arch("ww_pasta", GROC, "Pasta", [("WHLWHT PENNE", "Wholewheat penne", {}),
     ("WHLWHT SPAGHETTI", "Wholewheat spaghetti", {})], [("500G", .5), ("1KG", 1.0)],
     [OWN, "ORVALIS"], n=4, prot=13, fat=2.5, carb=62, wwf=W("FG5", "plant", "whole_grain"),
     pt="plant_non_core", split="one_side", ingr="Wholewheat durum wheat semolina", pop=1.2, ref=.5)
arch("egg_pasta", GROC, "Fresh Pasta", [("EGG TAGLIATELLE", "Egg tagliatelle", {}),
     ("EGG FETTUCCINE", "Egg fettuccine", {}), ("EGG LASAGNE SHEETS", "Egg lasagne sheets", {})],
     [("500G", .5), ("250G", .25)], [OWN, "ORVALIS"], n=5, prot=14, fat=3, carb=68,
     wwf=WC("vegetarian"), pt="composite", split="ingredients", ps=.78,
     ingr="Durum wheat semolina 80%, pasteurised eggs 20%", quid=True, pop=1.2, ref=.4,
     note="egg_pasta")
arch("rice", GROC, "Rice & Grains", [("BASMATI RICE", "Basmati rice", {}),
     ("LONG GRAIN RICE", "Long-grain rice", {}), ("ARBORIO RICE", "Arborio rice", {}),
     ("BROWN BASMATI", "Brown basmati rice", {"sub": "whole_grain"}),
     ("PORRIDGE OATS", "Porridge oats", {"sub": "whole_grain", "prot": 11}),
     ("COUSCOUS", "Couscous", {})],
     [("500G", .5), ("1KG", 1.0), ("2KG", 2.0)], [OWN, "ORVALIS"], n=14, prot=7.5, fat=1,
     carb=78, wwf=W("FG5", "plant", "refined_grain"), pt="plant_non_core", split="one_side",
     ingr="Rice", pop=3.5, ref=.6)
arch("pulses", GROC, "Pulses", [("CHICKPEAS IN WATER", "Chickpeas in water", {}),
     ("RED KIDNEY BEANS", "Red kidney beans in water", {}), ("BUTTER BEANS", "Butter beans in water", {}),
     ("BLACK BEANS", "Black beans in water", {}), ("BAKED BEANS TOM SCE", "Baked beans in tomato sauce", {"prot": 4.7})],
     [("400G", .4), ("4X400G", 1.6), ("410G", .41)], [OWN, "ORVALIS"], n=13, prot=7, fat=.5,
     carb=15, wwf=W("FG1", "plant", "pulses"), pt="plant_core", split="one_side",
     ingr="Chickpeas 60%, water, salt", pop=3, ref=.55)
arch("lentils", GROC, "Pulses", [("RED SPLIT LENTILS", "Red split lentils", {}),
     ("GREEN LENTILS", "Green lentils", {}), ("YELLOW SPLIT PEAS", "Yellow split peas", {"prot": 22})],
     [("500G", .5), ("1KG", 1.0)], [OWN, "ORVALIS"], n=5, prot=24, fat=1.5, carb=50,
     wwf=W("FG1", "plant", "pulses"), pt="plant_core", split="one_side", ingr="Red lentils",
     pop=1, ref=.5, note="dry_state")
arch("nuts", GROC, "Nuts & Seeds", [("WHOLE ALMONDS", "Whole almonds", {}),
     ("SALTED PEANUTS", "Salted peanuts", {"prot": 25}), ("WALNUT HALVES", "Walnut halves", {"prot": 15}),
     ("CASHEW NUTS", "Cashew nuts", {"prot": 18}), ("MIXED NUTS", "Mixed nuts", {})],
     [("200G", .2), ("500G", .5), ("100G", .1)], [OWN, "PENROCK"], n=12, prot=21, fat=50,
     carb=10, wwf=W("FG1", "plant", "nuts"), pt="plant_core", split="one_side",
     ingr="Almonds 100%", pop=1.5, ref=.45)
arch("seeds", GROC, "Nuts & Seeds", [("PUMPKIN SEEDS", "Pumpkin seeds", {"prot": 30}),
     ("SUNFLOWER SEEDS", "Sunflower seeds", {}), ("CHIA SEEDS", "Chia seeds", {"prot": 17})],
     [("150G", .15), ("300G", .3)], [OWN, "PENROCK"], n=5, prot=21, fat=45, carb=10,
     wwf=W("FG1", "plant", "seeds"), pt="plant_core", split="one_side", ingr="Pumpkin seeds 100%",
     pop=.6, ref=.4)
arch("nut_butter", GROC, "Spreads", [("SMOOTH PEANUT BTR", "Smooth peanut butter", {}),
     ("CRUNCHY PEANUT BTR", "Crunchy peanut butter", {})], [("340G", .34), ("1KG", 1.0)],
     [OWN, "PENROCK"], n=4, prot=25, fat=50, carb=12, wwf=W("FG1", "plant", "nuts"),
     pt="plant_core", split="one_side", ingr="Roasted peanuts 97%, palm oil, salt", pop=1, ref=.45)
arch("oils", GROC, "Oils", [("EXTRA VIRGIN OLIVE OIL", "Extra virgin olive oil", {}),
     ("SUNFLOWER OIL", "Sunflower oil", {}), ("RAPESEED OIL", "Rapeseed oil", {})],
     [("500ML", .46), ("1L", .92), ("3L", 2.76)], [OWN, "CASTELNA"], n=8, prot=0, fat=100,
     wwf=W("FG3", "plant", "plant_fat"), pt="plant_non_core", split="one_side",
     ingr="Extra virgin olive oil", pop=2, ref=.6)
arch("tomatoes_can", GROC, "Canned Vegetables", [("CHOPPED TOMATOES", "Chopped tomatoes", {}),
     ("PASSATA", "Sieved tomatoes (passata)", {}), ("TOM BASIL PASTA SCE", "Tomato & basil pasta sauce", {"prot": 1.6})],
     [("400G", .4), ("4X400G", 1.6), ("500G", .5), ("690G", .69)], [OWN, "CASTELNA"], n=9,
     prot=1.1, carb=4, wwf=W("FG4", "plant"), pt="plant_non_core", split="one_side",
     ingr="Tomatoes 99%, acidity regulator", pop=2.5, ref=.55)
arch("bolognese", GROC, "Cooking Sauces", [("BOLOGNESE SCE BF", "Beef bolognese sauce", {})],
     [("400G", .4), ("690G", .69)], [OWN, "QUILLAN"], n=3, prot=6, fat=5, carb=6,
     wwf=WC("meat_based"), pt="composite", split="nevo", ps=.18,
     ingr="Tomatoes 52%, beef 24%, onion, carrot, olive oil, salt", pop=.8, ref=.2)
arch("condiments", GROC, "Condiments", [("TOMATO KETCHUP", "Tomato ketchup", {}),
     ("DIJON MUSTARD", "Dijon mustard", {"prot": 6})], [("460G", .46), ("910G", .91), ("200G", .2)],
     [OWN, "CASTELNA"], n=5, prot=1.2, carb=24, wwf=WX("condiment"), pt="plant_non_core",
     split="one_side", ingr="Tomatoes, sugar, spirit vinegar, salt", pop=1.5, ref=.5)
arch("mayo", GROC, "Condiments", [("MAYONNAISE", "Mayonnaise", {})], [("400G", .4), ("750ML", .69)],
     [OWN, "CASTELNA"], n=3, prot=1.1, fat=75, carb=2, wwf=WX("condiment"), pt="animal_core",
     split="one_side", ingr="Rapeseed oil 78%, water, pasteurised egg yolk 6%, vinegar, salt",
     pop=1, ref=.45, note="mayo")
arch("spices", GROC, "Herbs & Spices", [("BLACK PEPPER GROUND", "Ground black pepper", {}),
     ("SMOKED PAPRIKA", "Smoked paprika", {}), ("MIXED DRIED HERBS", "Mixed dried herbs", {}),
     ("GROUND CUMIN", "Ground cumin", {})], [("50G", .05), ("100G", .1), ("40G", .04)],
     [OWN, "CASTELNA"], n=6, prot=10, fat=3, carb=40, wwf=WX("herbs_spices"), pt="plant_non_core",
     split="one_side", ingr="Black pepper", pop=.4, ref=.4)
arch("stock", GROC, "Stock & Gravy", [("CHKN STOCK CUBES", "Chicken stock cubes", {"pt": "composite"}),
     ("VEG STOCK CUBES", "Vegetable stock cubes", {})], [("8PK 80G", .08), ("12PK 120G", .12)],
     [OWN, "CASTELNA"], n=4, prot=8, fat=15, carb=30, wwf=WX("stock"), pt="plant_non_core",
     split="one_side", ingr="Salt, maize starch, palm fat, vegetable powder, yeast extract",
     pop=.6, ref=.4)
arch("flour", GROC, "Baking", [("PLAIN FLOUR", "Plain wheat flour", {}),
     ("SELF RAISING FLOUR", "Self-raising flour", {})], [("1.5KG", 1.5), ("500G", .5)],
     [OWN, "BRAMBLECOTE"], n=4, prot=10, fat=1.3, carb=72, wwf=W("FG5", "plant", "refined_grain"),
     pt="plant_non_core", split="one_side", ingr="Wheat flour", pop=.9, ref=.55)
arch("coffee", GROC, "Tea & Coffee", [("GROUND COFFEE MEDIUM", "Medium roast ground coffee", {}),
     ("COFFEE BEANS", "Whole coffee beans", {}), ("INSTANT COFFEE", "Instant coffee", {"prot": 7.8}),
     ("ENGLISH BREAKFAST TEA", "English breakfast tea bags", {"prot": 0}), ("GREEN TEA", "Green tea bags", {"prot": 0})],
     [("227G", .227), ("1KG", 1.0), ("200G", .2), ("80PK 250G", .25)], [OWN, "VELOCE"], n=9,
     prot=13, fat=15, carb=3, wwf=WX("coffee_tea"), pt="plant_non_core", split="one_side",
     ingr="Roasted ground coffee", pop=1.5, ref=.5, note="dry_state")

# --- Breakfast & snacks
arch("cereals", SNACK, "Cereals", [("CORN FLAKES", "Corn flakes", {}),
     ("CHOC RICE POPS", "Chocolate rice pops", {"prot": 5}), ("BRAN FLAKES", "Bran flakes", {"sub": "whole_grain", "prot": 10}),
     ("FRUIT NUT MUESLI", "Fruit & nut muesli", {"sub": "whole_grain", "prot": 9})],
     [("500G", .5), ("750G", .75), ("1KG", 1.0)], [OWN, "ORVALIS"], n=10, prot=7, fat=1, carb=84,
     wwf=W("FG5", "plant", "refined_grain"), pt="plant_non_core", split="one_side",
     ingr="Maize, sugar, barley malt extract, salt, vitamins", pop=2, ref=.5)
arch("biscuits_plain", SNACK, "Biscuits", [("DIGESTIVE BISCUITS", "Digestive biscuits", {}),
     ("RICH TEA BISCUITS", "Rich tea biscuits", {}), ("GINGER NUTS", "Ginger nut biscuits", {})],
     [("400G", .4), ("300G", .3)], [OWN, "BRAMBLECOTE"], n=6, prot=7, fat=20, carb=63,
     wwf=W("FG7", "plant"), pt="plant_non_core", split="one_side",
     ingr="Wheat flour, palm oil, sugar, wholemeal wheat flour, raising agents, salt", pop=1.8, ref=.5)
arch("biscuits_butter", SNACK, "Biscuits", [("BUTTER SHORTBREAD", "All-butter shortbread", {"ps": .93}),
     ("MILK CHOC DIGESTIVES", "Milk chocolate digestives", {}), ("CHOC CHIP COOKIES", "Chocolate chip cookies", {})],
     [("300G", .3), ("400G", .4), ("200G", .2)], [OWN, "BRAMBLECOTE", "MARLOWE"], n=8, prot=6.5,
     fat=24, carb=62, wwf=W("FG7", "plant"), pt="composite", split="convention",
     ingr="Wheat flour, milk chocolate 30% (sugar, cocoa butter, whole milk powder, cocoa mass), palm oil, sugar",
     pop=1.8, ref=.35, conf=(.85, .95), note="milk_choc")
arch("chocolate", SNACK, "Chocolate", [("MILK CHOC BAR", "Milk chocolate bar", {}),
     ("MILK CHOC HAZELNUT", "Milk chocolate with hazelnuts", {}), ("MILK CHOC BUTTONS", "Milk chocolate buttons", {})],
     [("100G", .1), ("200G", .2), ("4X40G", .16)], [OWN, "MARLOWE"], n=8, prot=7.5, fat=30,
     carb=57, wwf=W("FG7", "plant"), pt="composite", split="ingredients", ps=.46,
     ingr="Sugar, cocoa butter, whole milk powder 20%, cocoa mass 12%, emulsifier", quid=False,
     pop=2.2, ref=.4, note="milk_choc")
arch("dark_choc", SNACK, "Chocolate", [("DARK CHOC 70%", "70% dark chocolate", {}),
     ("DARK CHOC ORANGE", "Dark chocolate with orange", {})], [("100G", .1), ("200G", .2)],
     [OWN, "MARLOWE"], n=4, prot=8, fat=42, carb=34, wwf=W("FG7", "plant"), pt="plant_non_core",
     split="one_side", ingr="Cocoa mass 70%, sugar, cocoa butter, emulsifier (soya)", pop=.8, ref=.4)
arch("crisps", SNACK, "Crisps", [("READY SALTED CRISPS", "Ready salted crisps", {}),
     ("SALT VINEGAR CRISPS", "Salt & vinegar crisps", {}), ("TORTILLA CHIPS", "Tortilla chips", {"prot": 7})],
     [("6PK 150G", .15), ("150G", .15), ("200G", .2)], [OWN, "PENROCK"], n=7, prot=6, fat=33,
     carb=52, wwf=W("FG7", "plant"), pt="plant_non_core", split="one_side",
     ingr="Potatoes, sunflower oil, salt", pop=2.5, ref=.5)
arch("crisps_dairy", SNACK, "Crisps", [("SOUR CRM ONION CRISPS", "Sour cream & onion crisps", {}),
     ("CHEESE ONION CRISPS", "Cheese & onion crisps", {})], [("6PK 150G", .15), ("150G", .15)],
     [OWN, "PENROCK"], n=4, prot=6, fat=33, carb=52, wwf=W("FG7", "animal"), pt="composite",
     split="nevo", ps=.93, ingr="Potatoes, sunflower oil, sour cream & onion seasoning (whey powder (milk), onion, salt)",
     pop=1.6, ref=.3, conf=(.84, .94), note="origin_vs_split")
arch("bars", SNACK, "Cereal Bars", [("OAT RAISIN BARS", "Oat & raisin bars", {}),
     ("NUT CHOC BARS", "Nut & dark chocolate bars", {})], [("5X35G", .175), ("4X30G", .12)],
     [OWN, "PENROCK"], n=4, prot=6, fat=15, carb=62, wwf=W("FG7", "plant"), pt="plant_non_core",
     split="one_side", ingr="Oats 40%, glucose syrup, raisins 15%, sunflower oil", pop=1, ref=.35)

# --- Frozen
arch("fish_fingers", FROZ, "Frozen Fish", [("COD FISH FINGERS", "Cod fish fingers", {}),
     ("BREADED HADDOCK", "Breaded haddock fillets", {}), ("SCAMPI", "Breaded scampi", {"prot": 10})],
     [("10PK 280G", .28), ("20PK 560G", .56), ("4PK 440G", .44)], [OWN, "KESTREL"], n=7, prot=12,
     fat=8, carb=17, wwf=W("FG1", "animal", "fish_shellfish"), pt="animal_core", split="step4a",
     ingr="Cod (fish) 58%, breadcrumb (wheat flour, water, yeast, salt), rapeseed oil, wheat flour",
     pop=2.5, ref=.45, note="breaded")
arch("frozen_peas", FROZ, "Frozen Vegetables", [("GARDEN PEAS", "Garden peas", {}),
     ("PETITS POIS", "Petits pois", {})], [("900G", .9), ("1.5KG", 1.5)], [OWN], n=4, prot=5.4,
     fat=1, carb=9, wwf=W("FG1", "plant", "pulses"), pt="plant_core", split="one_side",
     ingr="Garden peas", pop=2, ref=.5, note="peas")
arch("frozen_veg", FROZ, "Frozen Vegetables", [("MIXED VEG", "Mixed vegetables", {}),
     ("LEAF SPINACH", "Leaf spinach", {"prot": 2.8}), ("BROCCOLI FLORETS", "Broccoli florets", {"prot": 2.8}),
     ("SWEETCORN", "Sweetcorn", {"prot": 3})], [("1KG", 1.0), ("750G", .75), ("500G", .5)], [OWN],
     n=8, prot=2.5, fat=.5, carb=7, wwf=W("FG4", "plant"), pt="plant_non_core", split="one_side",
     ingr="Carrots, peas, green beans, sweetcorn", pop=2, ref=.5)
arch("chips", FROZ, "Frozen Potatoes", [("OVEN CHIPS", "Oven chips", {}),
     ("CRINKLE CUT CHIPS", "Crinkle-cut chips", {}), ("HASH BROWNS", "Hash browns", {})],
     [("1.5KG", 1.5), ("900G", .9), ("750G", .75)], [OWN, "PENROCK"], n=7, prot=2.5, fat=5,
     carb=25, wwf=W("FG7", "plant"), pt="plant_non_core", split="one_side",
     ingr="Potatoes 94%, sunflower oil, salt", pop=2.5, ref=.5, note="chips")
arch("ice_cream", FROZ, "Ice Cream", [("VANILLA ICE CREAM", "Vanilla ice cream", {}),
     ("CHOC ICE CREAM", "Chocolate ice cream", {}), ("STRAWB ICE CREAM", "Strawberry ice cream", {}),
     ("ICE CREAM CONES 4PK", "Vanilla ice cream cones", {})],
     [("900ML", .5), ("1.8L", 1.0), ("4X110ML", .28)], [OWN, "MARLOWE"], n=9, prot=3.5, fat=10,
     carb=26, wwf=W("FG7", "animal"), pt="animal_core", split="step4a",
     ingr="Reconstituted skimmed milk, sugar, cream (milk), glucose syrup, wafer cone (wheat flour)",
     pop=2, ref=.4, note="ice_cream")
arch("pizza", FROZ, "Pizza", [("PIZZA MARGHERITA", "Margherita pizza", {"cat": "vegetarian"}),
     ("PIZZA PEPPERONI", "Pepperoni pizza", {"cat": "meat_based"}),
     ("PIZZA 4 CHEESE", "Four cheese pizza", {"cat": "vegetarian"}),
     ("PIZZA HAM MUSHROOM", "Ham & mushroom pizza", {"cat": "meat_based"})],
     [("335G", .335), ("2X320G", .64), ("400G", .4)], [OWN, "QUILLAN"], n=10, prot=10, fat=9,
     carb=30, wwf=WC("vegetarian"), pt="composite", split="convention",
     ingr="Wheat flour, tomato, mozzarella cheese (milk) 18%, water, rapeseed oil, yeast",
     pop=2.5, ref=.35, conf=(.88, .97))

# --- Ready meals
arch("lasagne", READY, "Ready Meals", [("BF LASAGNE", "Beef lasagne", {}),
     ("SPAG BOLOGNESE", "Spaghetti bolognese", {}), ("COTTAGE PIE", "Cottage pie", {}),
     ("CHKN TIKKA MASALA RICE", "Chicken tikka masala with rice", {})],
     [("400G", .4), ("2X400G", .8), ("450G", .45)], [OWN, "QUILLAN"], n=11, prot=7, fat=6, carb=12,
     wwf=WC("meat_based"), pt="composite", split="nevo", ps=.35,
     ingr="Cooked pasta (durum wheat semolina, egg), beef 18%, tomato, milk, cheese, onion",
     pop=2, ref=.3, conf=(.9, .98))
arch("sushi", READY, "Sushi", [("SALMON SUSHI BOX", "Salmon sushi selection", {}),
     ("PRAWN SUSHI ROLLS", "Prawn sushi rolls", {})], [("200G", .2), ("12PC 300G", .3)],
     [OWN, "QUILLAN"], n=4, prot=7, fat=4, carb=27, wwf=WC("seafood_based"), pt="composite",
     split="nevo", ps=.45, ingr="Cooked rice 62%, salmon (fish) 18%, nori, rice vinegar, sugar",
     pop=1, ref=.25, conf=(.86, .96))
arch("sandwiches", READY, "Sandwiches", [("CHKN MAYO SANDWICH", "Chicken mayo sandwich", {"cat": "meat_based"}),
     ("EGG CRESS SANDWICH", "Egg & cress sandwich", {"cat": "vegetarian"}),
     ("CHEESE PICKLE SANDWICH", "Cheese & pickle sandwich", {"cat": "vegetarian"})],
     [("EACH", .18), ("170G", .17)], [OWN], n=6, prot=11, fat=9, carb=25,
     wwf=WC("meat_based"), pt="composite", split="convention",
     ingr="Wheat bread, chicken breast 24%, mayonnaise (egg), lettuce", pop=2, ref=.25,
     conf=(.88, .97))
arch("veg_meals", READY, "Ready Meals", [("VEG CURRY RICE", "Vegetable curry with rice", {}),
     ("CHICKPEA DAHL RICE", "Chickpea dahl with rice", {}), ("VEG CHILLI RICE", "Vegetable chilli with rice", {})],
     [("400G", .4), ("350G", .35)], [OWN, "QUILLAN"], n=5, prot=4, fat=4, carb=18,
     wwf=WC("vegan"), pt="plant_non_core", split="one_side",
     ingr="Cooked basmati rice, vegetables, chickpeas 8%, coconut milk, spices", pop=1.2, ref=.25,
     conf=(.86, .95), note="two_composites")
arch("mac_cheese", READY, "Ready Meals", [("MAC CHEESE", "Macaroni cheese", {}),
     ("CHEESE ONION QUICHE", "Cheese & onion quiche", {})], [("400G", .4), ("2X400G", .8)],
     [OWN, "QUILLAN"], n=4, prot=8, fat=10, carb=18, wwf=WC("vegetarian"), pt="composite",
     split="convention", ingr="Cooked macaroni (durum wheat), milk, mature cheddar (milk) 14%, butter",
     pop=1, ref=.3, conf=(.88, .96))

# --- Soft drinks & water (WWF: beverages other than dairy are excluded)
arch("water", BEV, "Water", [("STILL WATER", "Still mineral water", {}),
     ("SPARKLING WATER", "Sparkling mineral water", {})],
     [("6X1.5L", 9.0), ("1.5L", 1.5), ("500ML", .5), ("12X500ML", 6.0)], [OWN, "NUVELLE"], n=9,
     prot=0, wwf=WX("beverage"), pt="plant_non_core", split="one_side", ingr="Natural mineral water",
     pop=12, ref=.7, stratum=True)
arch("soft_drinks", BEV, "Soft Drinks", [("COLA", "Cola", {}), ("COLA ZERO", "Cola, no sugar", {}),
     ("LEMONADE", "Cloudy lemonade", {}), ("ORANGE SODA", "Orange soda", {}),
     ("ICED TEA PEACH", "Peach iced tea", {})],
     [("2L", 2.0), ("1.5L", 1.5), ("6X330ML", 1.98), ("24X330ML", 7.92)], [OWN, "NUVELLE"], n=12,
     prot=0, carb=10, wwf=WX("beverage"), pt="plant_non_core", split="one_side",
     ingr="Carbonated water, sugar, colour, acid, flavouring, caffeine", pop=6, ref=.6)
arch("juice", BEV, "Juice", [("ORANGE JUICE SMOOTH", "Smooth orange juice", {}),
     ("APPLE JUICE", "Pressed apple juice", {"prot": .1}), ("ORANGE JUICE BITS", "Orange juice with bits", {})],
     [("1L", 1.04), ("1.75L", 1.82), ("6X200ML", 1.25)], [OWN, "NUVELLE"], n=7, prot=.7, carb=9,
     wwf=WX("beverage"), pt="plant_non_core", split="one_side", ingr="Orange juice from concentrate",
     pop=3, ref=.6)
arch("protein_shake", BEV, "Sports Nutrition", [("PROTEIN SHAKE CHOC", "Chocolate protein shake", {}),
     ("PROTEIN SHAKE VAN", "Vanilla protein shake", {})], [("330ML", .34), ("4X330ML", 1.36)],
     ["FJELDA"], n=3, prot=7.5, fat=1, carb=4, wwf=W("FG2", "animal", "dairy"), pt="animal_core",
     split="step4a", ingr="Skimmed milk, milk protein 5%, cocoa powder 1%, sweetener", pop=.7,
     ref=.2, note="protein_drink")

# --- Beer, wine & spirits (WWF Appendix A excludes alcohol; Protein Tracker only excludes non-food)
arch("beer", ALC, "Beer & Cider", [("LAGER", "Lager", {}), ("PALE ALE", "Pale ale", {}),
     ("APPLE CIDER", "Apple cider", {"prot": 0}), ("WHEAT BEER", "Wheat beer", {"prot": .5})],
     [("4X440ML", 1.76), ("10X330ML", 3.3), ("500ML", .5), ("12X440ML", 5.28)], [OWN, "PENWARD"], n=12,
     prot=.4, carb=3, wwf=WX("alcohol"), pt="plant_non_core", split="one_side",
     ingr="Water, barley malt, hops", pop=3, ref=.6, note="alcohol")
arch("wine", ALC, "Wine", [("RED WINE MERLOT", "Merlot red wine", {}),
     ("WHITE WINE SAUV BLANC", "Sauvignon blanc white wine", {}), ("ROSE WINE", "Rosé wine", {}),
     ("PROSECCO", "Prosecco", {})], [("75CL", .75), ("3X75CL", 2.25), ("1.5L", 1.5)],
     [OWN, "CASTELNA"], n=12, prot=.1, carb=2.5, wwf=WX("alcohol"), pt="plant_non_core",
     split="one_side", ingr="Grapes, preservative (sulphites)", pop=2.5, ref=.55, stratum=True,
     note="alcohol")
arch("spirits", ALC, "Spirits", [("VODKA", "Vodka", {}), ("LONDON DRY GIN", "London dry gin", {}),
     ("BLENDED WHISKY", "Blended whisky", {})], [("70CL", .7), ("1L", 1.0)], [OWN, "PENWARD"],
     n=5, prot=0, wwf=WX("alcohol"), pt="plant_non_core", split="one_side",
     ingr="Grain neutral spirit, water", pop=.8, ref=.5, note="alcohol")

# --- Household: non-food, out of BOTH scopes
arch("household", HOME, "Household", [("BIRTHDAY CANDLES", "Birthday candles", {}),
     ("BIN BAGS 50L", "Bin bags, 50 L", {}), ("KITCHEN ROLL", "Kitchen roll", {}),
     ("TEALIGHTS 50PK", "Tealights", {}), ("ALUMINIUM FOIL", "Aluminium foil", {}),
     ("PAPER NAPKINS", "Paper napkins", {}), ("AA BATTERIES", "AA batteries", {})],
     [("EACH", .2), ("4PK", .5), ("2PK", .3)], [OWN], n=12, prot=0, wwf=WX("non_food"),
     pt="", split="", pop=.8, ref=.3, pt_scope=False, note="non_food")

# ---------------------------------------------------------------- codes
BRAND_NAMES = {"HM": RETAILER, "TARROW": "Tarrow Farm", "CASTELNA": "Castelna",
               "KESTREL": "Kestrel Bay", "FJELDA": "Fjelda", "ALDERWICK": "Alderwick",
               "SOLVANE": "Solvane", "BRAMBLECOTE": "Bramblecote", "ORVALIS": "Orvalis",
               "PENROCK": "Penrock", "QUILLAN": "Quillan", "MARLOWE": "Marlowe",
               "NUVELLE": "Nuvelle", "VELOCE": "Veloce", "PENWARD": "Penward"}
# Typical weight of a fruit or vegetable sold by the piece
PIECE_KG = {"AVOCADO": .2, "MELON": 1.2, "PINEAPPLE": 1.1, "MANGO": .35, "CUCUMBER": .35,
            "LETTUCE": .5, "BROCCOLI": .35, "CAULIFLOWER": .6, "SWEETCORN": .25, "GARLIC": .2,
            "COURGETTE": .25, "PEPPER": .16, "LEEK": .3, "SPINACH": .2, "MUSHROOM": .25}

# GS1 documentation example company prefixes: clearly illustrative, not live products.
PREFIXES = ["5012345", "4012345", "3012345", "8712345"]


def check_digit(d12: str) -> int:
    s = sum(int(c) * (3 if i % 2 else 1) for i, c in enumerate(d12))
    return (10 - s % 10) % 10


def ean(prefix: str) -> str:
    body = prefix + "".join(str(R.randint(0, 9)) for _ in range(12 - len(prefix)))
    return body + str(check_digit(body))


# ---------------------------------------------------------------- build
def lognormal(mu, sigma):
    return math.exp(R.gauss(mu, sigma))


def allocate():
    """Scale each archetype's count so that the catalogue lands on TARGET products."""
    total = sum(a["n"] for a in A)
    scale = TARGET / total
    counts = [max(1, round(a["n"] * scale)) for a in A]
    diff = TARGET - sum(counts)
    order = sorted(range(len(A)), key=lambda i: -A[i]["n"])
    i = 0
    while diff != 0:
        k = order[i % len(order)]
        if diff > 0:
            counts[k] += 1; diff -= 1
        elif counts[k] > 1:
            counts[k] -= 1; diff += 1
        i += 1
    return counts


def build():
    products, seen_labels = [], set()
    counts = allocate()
    for a, count in zip(A, counts):
        combos = [(it, sz, br) for it in a["items"] for sz in a["sizes"] for br in a["brands"]]
        R.shuffle(combos)
        made = 0
        k = 0
        while made < count:
            (core, long_name, ov), (slab, kg), br = combos[k % len(combos)]
            k += 1
            suffix = "" if k <= len(combos) else f" {['MULTI', 'XL', 'VALUE', 'ORG', 'FT'][(k // len(combos)) % 5]}"
            if br == OWN:
                label = f"{OWN} {core}{suffix} {slab}"
            else:
                label = (f"{core}{suffix} {slab} {br}" if R.random() < .5 else f"{br} {core}{suffix} {slab}")
            if label in seen_labels:
                continue
            seen_labels.add(label)
            products.append(make(a, core, long_name, ov, slab, kg, br, label))
            made += 1
    R.shuffle(products)
    return products


# ---------------------------------------------------------------- item ingredients
# An archetype's ingredient list describes its first item. Every other item that would
# read wrongly with it gets its own list here, keyed on the long name.
INGR = {
    "Ground cumin": "Ground cumin seeds",
    "Salted peanuts": "Peanuts 97%, sunflower oil, salt",
    "Mixed dried herbs": "Oregano, basil, thyme, marjoram, parsley",
    "Self-raising flour": "Wheat flour, raising agents (calcium phosphate, sodium carbonate)",
    "Apple cider": "Water, apple juice from concentrate, sugar, carbon dioxide, preservative (sulphites)",
    "Wheat beer": "Water, wheat malt, barley malt, hops, yeast",
    "All-butter shortbread": "Wheat flour, butter (milk) 32%, sugar, salt",
    "Chocolate chip cookies": "Wheat flour, chocolate chips 22% (sugar, cocoa mass, cocoa butter, emulsifier), butter (milk), sugar, eggs",
    "Ginger nut biscuits": "Wheat flour, sugar, palm oil, golden syrup, ground ginger 1.5%, raising agent",
    "Rich tea biscuits": "Wheat flour, sugar, palm oil, glucose syrup, raising agents, salt",
    "Plain tortilla wraps": "Wheat flour, water, rapeseed oil, raising agents, salt",
    "White pitta bread": "Wheat flour, water, yeast, salt, sugar",
    "Rye bread": "Rye flour 62%, water, wheat flour, sourdough, salt, yeast",
    "Seeded batch loaf": "Wholemeal wheat flour, water, mixed seeds 10% (sunflower, linseed, millet), yeast, salt",
    "Spreadable butter": "Butter (milk) 75%, rapeseed oil, salt",
    "Unsalted butter": "Butter (milk)",
    "Carrot cake": "Sugar, wheat flour, carrots 18%, eggs, rapeseed oil, soft cheese frosting (milk), walnuts",
    "Chocolate fudge cake": "Sugar, wheat flour, eggs, butter (milk), fat-reduced cocoa powder 6%, raising agent",
    "Mackerel fillets in tomato sauce": "Mackerel (fish) 65%, tomato puree, water, sunflower oil, salt",
    "Sardines in olive oil": "Sardines (fish) 75%, olive oil, salt",
    "Tuna chunks in brine": "Tuna (fish) 75%, water, salt",
    "Sieved tomatoes (passata)": "Sieved tomatoes",
    "Tomato & basil pasta sauce": "Tomatoes 88%, onion, olive oil, basil 1%, sugar, garlic, salt",
    "Nut & dark chocolate bars": "Oats 32%, peanuts 20%, glucose syrup, dark chocolate 12% (cocoa mass, sugar, cocoa butter), almonds 6%",
    "Chocolate rice pops": "Rice 87%, sugar, fat-reduced cocoa powder 5%, salt, vitamins",
    "Bran flakes": "Wholegrain wheat 70%, wheat bran 18%, sugar, barley malt extract, salt",
    "Fruit & nut muesli": "Wholegrain oat flakes 52%, raisins, wheat flakes, hazelnuts 6%, almonds 4%",
    "Dark chocolate with orange": "Cocoa mass 55%, sugar, cocoa butter, orange oil, emulsifier (soya)",
    "Milk chocolate with hazelnuts": "Sugar, whole milk powder 18%, cocoa butter, hazelnuts 15%, cocoa mass 10%, emulsifier",
    "Dijon mustard": "Water, mustard seeds 25%, spirit vinegar, salt, acid (citric acid)",
    "Turkey breast slices": "Turkey breast 91%, water, salt, dextrose",
    "Honey-roast ham": "Pork 92%, water, honey 2%, salt, preservative",
    "Smoked ham": "Pork 93%, water, salt, preservative",
    "Tortilla chips": "Maize 72%, sunflower oil, salt",
    "Salt & vinegar crisps": "Potatoes, sunflower oil, salt & vinegar seasoning (salt, acid, rice flour)",
    "Cheese & onion crisps": "Potatoes, sunflower oil, cheese & onion seasoning (cheese powder (milk), onion powder, whey powder (milk), salt)",
    "Chorizo slices": "Pork 90%, paprika, salt, garlic, dextrose, preservative",
    "Pepperoni slices": "Pork, beef, salt, paprika, dextrose, spices, preservative",
    "Caramelised onion houmous": "Chickpeas 52%, rapeseed oil, caramelised onion 12%, tahini (sesame) 7%, lemon juice, garlic, salt",
    "Quark": "Pasteurised skimmed milk, cultures, rennet",
    "Sea bass fillets": "Sea bass (fish) 100%",
    "Breaded haddock fillets": "Haddock (fish) 60%, breadcrumb (wheat flour, water, yeast, salt), rapeseed oil, wheat flour",
    "Breaded scampi": "Scampi (langoustine) 55%, breadcrumb (wheat flour, water, yeast, salt), rapeseed oil",
    "Broccoli florets": "Broccoli",
    "Leaf spinach": "Spinach",
    "Sweetcorn": "Sweetcorn",
    "Petits pois": "Petits pois",
    "Emmental slices": "Emmental cheese (milk)",
    "Strawberry ice cream": "Reconstituted skimmed milk, sugar, strawberry puree 10%, cream (milk), glucose syrup",
    "Chocolate ice cream": "Reconstituted skimmed milk, sugar, cream (milk), glucose syrup, cocoa powder",
    "Vanilla ice cream": "Reconstituted skimmed milk, sugar, cream (milk), glucose syrup, vanilla extract",
    "Pressed apple juice": "Pressed apple juice",
    "Orange juice with bits": "Orange juice from concentrate, orange pulp",
    "Smooth orange juice": "Orange juice",
    "Plant-based nuggets": "Water, wheat protein 16%, breadcrumb (wheat flour), pea protein 6%, rapeseed oil, spices",
    "Plant-based sausages": "Water, pea protein 15%, rapeseed oil, wheat flour, spices, casing (alginate)",
    "Plant-based mince": "Water, pea protein 20%, rapeseed oil, spices",
    "Whole milk": "Whole milk",
    "Skimmed milk": "Skimmed milk",
    "Lactose-free semi-skimmed milk": "Semi-skimmed milk, lactase enzyme",
    "Strawberry milkshake": "Semi-skimmed milk 95%, sugar, strawberry puree 1%, stabiliser, colour",
    "Chia seeds": "Chia seeds 100%",
    "Sunflower seeds": "Sunflower seeds 100%",
    "Rapeseed oil": "Rapeseed oil",
    "Sunflower oil": "Sunflower oil",
    "Pains au chocolat": "Wheat flour, butter (milk) 20%, water, dark chocolate 10% (sugar, cocoa mass), sugar, eggs, yeast, salt",
    "Brioche rolls": "Wheat flour, eggs 15%, sugar, butter (milk) 10%, yeast, milk, salt",
    "Ham & mushroom pizza": "Wheat flour, tomato, mozzarella cheese (milk) 15%, ham (pork) 10%, mushrooms 8%, water, rapeseed oil, yeast",
    "Pepperoni pizza": "Wheat flour, tomato, mozzarella cheese (milk) 16%, pepperoni (pork) 10%, water, rapeseed oil, yeast",
    "Four cheese pizza": "Wheat flour, tomato, cheeses (milk) 24% (mozzarella, cheddar, emmental, blue cheese), water, rapeseed oil, yeast",
    "Almond drink": "Water, almonds 2.3%, sea salt, stabiliser",
    "Unsweetened soya drink": "Water, hulled soya beans 8%, calcium, stabiliser",
    "Coconut yoghurt alternative": "Water, coconut cream 20%, modified starch, cultures",
    "Red kidney beans in water": "Red kidney beans 60%, water, firming agent",
    "Black beans in water": "Black beans 60%, water, salt",
    "Butter beans in water": "Butter beans 60%, water, salt",
    "Baked beans in tomato sauce": "Haricot beans 51%, tomatoes 34%, water, sugar, spirit vinegar, salt",
    "Green lentils": "Green lentils",
    "Yellow split peas": "Yellow split peas",
    "Vegetable chilli with rice": "Cooked rice, red kidney beans 14%, tomatoes, peppers, onion, spices",
    "Chickpea dahl with rice": "Cooked basmati rice, red lentils 18%, tomatoes, onion, coconut milk, spices",
    "Cheese & onion quiche": "Wheat flour, milk, eggs 18%, cheddar cheese (milk) 14%, onion 10%, butter (milk)",
    "Spaghetti bolognese": "Cooked spaghetti (durum wheat semolina) 45%, beef 16%, tomatoes, onion, carrot, olive oil",
    "Cottage pie": "Mashed potato 50%, beef 20%, carrots, onion, gravy (wheat flour), butter (milk)",
    "Chicken tikka masala with rice": "Cooked basmati rice 45%, chicken breast 20%, tomato, cream (milk), onion, spices",
    "Prawn sushi rolls": "Cooked rice 64%, prawns (crustacean) 15%, nori, rice vinegar, sugar",
    "Egg & cress sandwich": "Wheat bread, free-range egg 30%, mayonnaise (egg), cress",
    "Cheese & pickle sandwich": "Wheat bread, mature cheddar (milk) 28%, pickle (vegetables, sugar, vinegar), butter (milk)",
    "Beef burgers": "Beef 85%, water, onion, rusk (wheat flour, salt), seasoning",
    "Cloudy lemonade": "Carbonated water, sugar, lemon juice from concentrate 5%, acid, flavouring",
    "Orange soda": "Carbonated water, sugar, orange juice from concentrate 4%, acid, flavouring, colour",
    "Peach iced tea": "Water, sugar, peach juice 3%, black tea extract, acid, flavouring",
    "Blended whisky": "Blended grain and malt whisky",
    "London dry gin": "Grain neutral spirit, botanicals",
    "Vanilla protein shake": "Skimmed milk, milk protein 5%, flavouring, sweetener",
    "Chicken stock cubes": "Salt, maize starch, palm fat, yeast extract, sugar, flavourings, onion powder",
    "English breakfast tea bags": "Black tea",
    "Green tea bags": "Green tea",
    "Instant coffee": "Instant coffee",
    "Whole coffee beans": "Roasted coffee beans",
    "Tempeh": "Soya beans 98%, water, tempeh culture",
    "Smoked tofu": "Water, soya beans 45%, firming agent, natural smoke",
    "Sparkling mineral water": "Natural mineral water, carbon dioxide",
    "Greek-style yoghurt": "Pasteurised milk, cream (milk), live yoghurt cultures",
    "Natural skyr": "Pasteurised skimmed milk, live cultures",
    "Cherry yoghurt": "Yoghurt (milk) 82%, cherries 10%, sugar, maize starch, flavouring",
    "Peach yoghurt": "Yoghurt (milk) 82%, peaches 10%, sugar, maize starch, flavouring",
    "Strawberry skyr": "Skyr (milk) 85%, strawberries 9%, sugar, maize starch",
    "Porridge oats": "Wholegrain rolled oats",
    "Couscous": "Durum wheat semolina",
    "Brown basmati rice": "Brown basmati rice",
    "Basmati rice": "Basmati rice",
    "Arborio rice": "Arborio rice",
    "Long-grain rice": "Long-grain rice",
    "Piri-piri marinated chicken thighs": "Chicken thighs 85%, water, piri-piri marinade (sugar, chilli, garlic, paprika, salt, rapeseed oil)",
    "Honey & mustard pork steaks": "Pork 84%, honey & mustard glaze (sugar, honey, mustard seeds, wheat flour, salt)",
}


def make(a, core, long_name, ov, slab, kg, br, label):
    prot = ov.get("prot", a["prot"]) * R.uniform(.94, 1.06) if a["prot"] else 0.0
    prot = round(prot, 1) if prot >= 1 else round(prot, 2)
    wwf = dict(a["wwf"])
    if "sub" in ov and wwf.get("in"):
        wwf["sub"] = ov["sub"]
    if "cat" in ov and wwf.get("in"):
        wwf["cat"] = ov["cat"]
    pt = ov.get("pt", a["pt"])
    p = {
        "label": label, "name": long_name + (f", {slab.lower()}" if slab not in ("KG", "LOOSE", "EACH") else ""),
        "brand": BRAND_NAMES[br], "own": br == OWN, "dept": a["dept"], "family": a["family"],
        "arch": a["key"], "note": ov.get("note", a["note"]), "prot": prot,
        "fat": round(a["fat"] * R.uniform(.9, 1.1), 1), "carb": round(a["carb"] * R.uniform(.9, 1.1), 1),
        "wwf": wwf, "pt": pt if a["pt_scope"] else "", "pt_scope": a["pt_scope"],
        "split_route": ov.get("split", a["split"]), "ps": ov.get("ps", a["ps"]), "dairy": a["dairy"],
        "weighed": a["weighed"] and slab in ("KG", "LOOSE"), "piece": a["piece"] or slab == "EACH",
        "kg_true": kg,
    }
    # --- code: genuine EAN, or in-store code for weighed products
    if p["weighed"]:
        p["code"] = "2" + "".join(str(R.randint(0, 9)) for _ in range(11)) + "0"
        p["code_kind"] = "instore"
    else:
        p["code"] = ean(R.choice(PREFIXES))
        p["code_kind"] = "ean"
    # --- ingredients: absent on loose fresh produce and some fresh counters
    has_ingr = a["ingr"] is not None and not p["weighed"] and R.random() < (.92 if a["split"] in ("ingredients", "step4a") else .72)
    base_ingr = INGR.get(long_name.split(",")[0], a["ingr"] or "")
    p["ingredients"] = base_ingr.replace("Almonds", long_name.split(",")[0]) if has_ingr else ""
    p["quid"] = a["quid"] and has_ingr
    # --- popularity
    base = a["pop"] * 9000 / max(kg, .15) ** .35
    p["units"] = int(lognormal(math.log(base), .85))
    p["ref_p"], p["stratum"], p["conf_range"] = a["ref"], a["stratum"], a["conf"]
    return p


# ---------------------------------------------------------------- the chain
def run(products):
    """Apply the Altera chain to the fictitious catalogue, step by step.

    Every outcome is stored on the product so that the demo can replay the steps and
    the product drawer can show how each answer was reached.
    """
    # Step 1 — data quality traps, seeded deliberately
    idx = list(range(len(products)))
    R.shuffle(idx)
    pick = iter(idx)

    def take(n, cond=lambda p: True):
        out = []
        for i in pick:
            if cond(products[i]):
                out.append(products[i])
                if len(out) == n:
                    break
        return out

    for p in products:
        p["issues"] = []
    for p in take(5, lambda p: p["code_kind"] == "ean"):
        bad = (int(p["code"][-1]) + 3) % 10
        p["code"] = p["code"][:-1] + str(bad)
        p["code_kind"] = "bad_check"
        p["issues"].append("bad_check_digit")
    for p in take(14, lambda p: p["code_kind"] == "ean"):
        p["code"] = "0" + p["code"][1:-1]
        p["code"] = p["code"] + str(check_digit(p["code"]))
        p["issues"].append("leading_zero")
    pairs = take(4, lambda p: p["code_kind"] == "ean")
    for a_, b_ in zip(pairs[::2], pairs[1::2]):
        b_["code"] = a_["code"]
        a_["issues"].append("shared_code"); b_["issues"].append("shared_code")
    for p in take(3, lambda p: p["pt_scope"]):
        p["units"] = 0
        p["issues"].append("no_sales")
    tests = take(2, lambda p: p["arch"] == "household")
    for t, (lab, nm) in zip(tests, [("TEST ITEM DO NOT USE", "Test item"), ("CUSTOMER ORDER 0042", "Customer order")]):
        t["label"], t["name"], t["note"] = lab, nm, "test_item"
        t["issues"].append("test_item")

    # Step 2 — net weights: read, then qualified
    for p in products:
        lab_has_size = any(ch.isdigit() for ch in p["label"].split()[-1]) or any(
            u in p["label"] for u in ("G ", "KG", "ML", "L ", "CL"))
        r = R.random()
        if p["weighed"]:
            p["weight_raw"], p["weight"], p["weight_src"] = None, 1.0, "variable"
        elif p["piece"] and p["dept"] == FV:
            # « 1.0 » is the default the extraction writes when it knows nothing: never
            # used as is. The piece is qualified by its typical weight.
            p["weight_raw"] = 1.0
            p["weight"] = next((kg for word, kg in PIECE_KG.items() if word in p["label"]), .3)
            p["weight_src"] = "typical_piece"
            p["issues"].append("default_weight")
        elif r < .09 and lab_has_size:
            p["weight_raw"], p["weight"], p["weight_src"] = None, p["kg_true"], "label"
            p["issues"].append("missing_weight")
        else:
            p["weight_raw"], p["weight"], p["weight_src"] = p["kg_true"], p["kg_true"], "declared"
        p["weight"] = round(p["weight"], 3)

    # Scope
    for p in products:
        # Step 2 removes test items, customer orders and non-food before anything is
        # classified: they never reach a model.
        p["in_scope"] = p["units"] > 0 and "test_item" not in p["issues"] and p["pt_scope"]
        p["pt_in"] = p["in_scope"] and p["pt_scope"]
        p["wwf_in"] = p["in_scope"] and p["wwf"].get("in", False)
        if not p["pt_scope"]:
            p["wwf_in"] = False

    # Step 3 — classification route
    for p in products:
        if not p["in_scope"]:
            p["route"] = ""
            continue
        if p["code_kind"] == "ean" and R.random() < p["ref_p"]:
            p["route"], p["conf"] = "inherited", round(R.uniform(.93, .99), 2)
        elif p["stratum"] and p["note"] not in ("plant_alt", "substitute_whole") and R.random() < .55:
            p["route"], p["conf"] = "stratum", .75
        else:
            lo, hi = p["conf_range"]
            p["route"], p["conf"] = "model", round(R.uniform(lo, hi), 2)
            if R.random() < .04:
                p["requeried"] = True
    # a handful of low-confidence model answers go to human review
    for p in take(9, lambda p: p.get("route") == "model"):
        p["conf"] = round(R.uniform(.62, .79), 2)
        p["review"] = True

    # Step 4 — protein content cascade
    for p in products:
        if not p["pt_in"]:
            p["prot_src"] = ""
            continue
        r = R.random()
        if p["route"] == "inherited" and r < .25:
            p["prot_src"] = "reference_base"
        elif r < .66:
            p["prot_src"] = "declared"
        elif r < .78 and p["code_kind"] == "ean":
            p["prot_src"] = "off_ean"
        elif r < .9:
            p["prot_src"] = "name_match"
        else:
            p["prot_src"] = "stratum_median"
    for p in take(4, lambda p: p.get("prot_src") == "declared" and p["prot"] >= 3 and p["weight"] >= .3):
        p["prot_declared_bad"] = round(p["prot"] * p["weight"] * 10, 1)   # declared per pack
        p["issues"].append("per_pack_protein")
        p["prot_src"] = "off_ean" if p["code_kind"] == "ean" else "name_match"

    # Step 5 — the plant / animal split
    for p in products:
        if not p["pt_in"]:
            p.update(plant=None, animal=None, level="", split_src="")
            continue
        t = p["prot"]
        cls, route = p["pt"], p["split_route"]
        if cls == "composite":
            if route == "ingredients" and p["ingredients"]:
                ps, level, src = p["ps"], "A", "ingredients"
            elif route == "nevo" and R.random() < .8:
                ps, level, src = p["ps"], "A", "nevo"
            else:
                ps, level, src = .5, "B", "convention"
            plant = round(t * ps, 2)
            p.update(plant=plant, animal=round(t - plant, 2), level=level, split_src=src)
            if plant <= 0 or p["animal"] <= 0:
                raise SystemExit(f"composite without both sides: {p['label']}")
        elif cls == "animal_core":
            src = ("step4a" if route == "step4a" else
                   "one_side" if p["ingredients"] else "class")
            level = "A" if src == "one_side" else "B"
            p.update(plant=0.0, animal=t, level=level, split_src=src)
        else:
            src = "one_side" if p["ingredients"] else "class"
            p.update(plant=t, animal=0.0, level="A" if src == "one_side" else "B", split_src=src)

    # Step 6 — volumes, sales rank
    sold = sorted([p for p in products if p["units"] > 0], key=lambda p: -p["units"] * p["weight"])
    for i, p in enumerate(sold, 1):
        p["rank"] = i
    for p in products:
        p.setdefault("rank", None)
    return products


# ---------------------------------------------------------------- checks
def check(products):
    """Refuse to write a catalogue that breaks a rule the real workbook is checked on."""
    errors = []
    for p in products:
        w = p["wwf"]
        if p["pt_in"]:
            t, pl, an = p["prot"], p["plant"], p["animal"]
            if abs(pl + an - t) > .011:
                errors.append(f"mass balance {p['label']}")
            if p["pt"] == "animal_core" and pl > 0:
                errors.append(f"animal core with plant protein {p['label']}")
            if p["pt"] in ("plant_core", "plant_non_core") and an > 0:
                errors.append(f"plant class with animal protein {p['label']}")
            if p["pt"] == "composite" and not (pl > 0 and an > 0):
                errors.append(f"composite on one side {p['label']}")
            if p["level"] == "B" and p["pt"] == "composite" and abs(pl - an) > .011:
                errors.append(f"level B composite not 50/50 {p['label']}")
        if p["wwf_in"]:
            if w["struct"] == "composite" and w["fg"]:
                errors.append(f"composite with a food group {p['label']}")
            if w["sub"] and w["fg"] not in ("FG1", "FG2", "FG3", "FG5"):
                errors.append(f"sub-group outside FG1/2/3/5 {p['label']}")
            if p["dairy"] == 10 and not (w["fg"] == "FG2" and w["sub"] == "dairy"):
                errors.append(f"factor 10 outside cheese {p['label']}")
    if len(products) != TARGET:
        errors.append(f"{len(products)} products, {TARGET} expected")
    if errors:
        raise SystemExit("REFUSED:\n  " + "\n  ".join(errors[:20]))


def export(products):
    keep = ["code", "code_kind", "label", "name", "brand", "own", "dept", "family", "note",
            "ingredients", "quid", "weight_raw", "weight", "weight_src", "units", "rank",
            "issues", "in_scope", "pt_in", "wwf_in", "route", "conf", "review", "requeried",
            "prot", "prot_src", "prot_declared_bad", "fat", "carb", "pt", "plant", "animal",
            "level", "split_src", "dairy"]
    rows = []
    for i, p in enumerate(products, 1):
        r = {k: p.get(k) for k in keep}
        r["id"] = f"HM{i:05d}"
        w = p["wwf"]
        r["wwf"] = ({"struct": w["struct"], "fg": w["fg"], "src": w["src"], "sub": w["sub"],
                     "cat": w["cat"]} if p["wwf_in"] else
                    {"excl": w.get("reason", "") if p["in_scope"] else ""})
        rows.append({k: v for k, v in r.items() if v not in (None, "", False, [])})
    meta = {"retailer": RETAILER, "products": len(rows), "seed": SEED,
            "generated_by": "scripts/generate_dataset.py"}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"meta": meta, "products": rows}, ensure_ascii=False,
                              separators=(",", ":")), encoding="utf-8")
    return rows


if __name__ == "__main__":
    prods = run(build())
    check(prods)
    rows = export(prods)
    from collections import Counter
    print(f"{len(rows)} products -> {OUT.relative_to(OUT.parents[2])}")
    print("  departments :", dict(Counter(p['dept'] for p in prods)))
    print("  routes      :", dict(Counter(p.get('route') or 'out_of_scope' for p in prods)))
    print("  PT classes  :", dict(Counter(p['pt'] or 'non_food' for p in prods if p['in_scope'])))
    print("  split level :", dict(Counter(p['level'] for p in prods if p['pt_in'])))
    print("  issues      :", dict(Counter(i for p in prods for i in p['issues'])))
    T = sum(p["units"] * p["weight"] * p["prot"] / 100 for p in prods if p["pt_in"])
    V = sum(p["units"] * p["weight"] * p["plant"] / 100 for p in prods if p["pt_in"])
    print(f"  plant share : {V / T:.1%}  (fictitious — not a measurement)")
