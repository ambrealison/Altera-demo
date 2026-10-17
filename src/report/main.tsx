// Print entry for the sample insights report: report.html?lang=en|fr, one A4 page per sheet.
import { createRoot } from "react-dom/client";
import "@fontsource/archivo/latin-800.css";
import "@fontsource/archivo/latin-900.css";
import "@fontsource/archivo/latin-900-italic.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "../styles.css";
import "./print.css";
import { ReportPages } from "./Report";

const lang = new URLSearchParams(window.location.search).get("lang") === "fr" ? "fr" : "en";
document.documentElement.lang = lang;
createRoot(document.getElementById("report")!).render(<ReportPages lang={lang} />);
