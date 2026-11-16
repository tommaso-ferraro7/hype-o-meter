// app.js — The hype-o-meter (T4): share of abstracts containing a word, 1990–2025.
// Inputs, presets, the five OA.yearly calls, % shares, cards, warning, takeaway, methodology.
// Helpers already written (do not change): OA.yearly in oa-helper.js, drawChart / renderCards /
// setTakeaway / setMethod / showError / showWarning / clearMessages / fmt / fmtFull / round in ui.js.

const APP = {
  title: "The hype-o-meter",
  question: "How has the language of science changed? For every year from 1990 to 2025, we show how many research papers with an abstract (the short summary at the start of a paper) contain a word you pick.",
  author: "Your first name",
};

document.getElementById("title").textContent = APP.title;
document.getElementById("question").textContent = APP.question;
document.getElementById("footer").textContent = "Built by " + APP.author + " in the Meta-science course, University of Innsbruck. Data: OpenAlex (a free database of scientific papers; CC0 = free to reuse).";
document.getElementById("reset").addEventListener("click", () => location.reload());
document.getElementById("saveKey").addEventListener("click", () => { try { OA.setKey(document.getElementById("apiKey").value); document.getElementById("status").textContent = OA.getKey() ? "Key saved in this browser. It is sent with every call." : "No key: using the shared free budget."; } catch (e) { showError(e.message); } });
document.getElementById("apiKey").value = OA.getKey();

// Fields listed on the idea card (IDEA-CARD.md). "All fields" = no field filter.
const FIELDS = [
  ["all", "All fields"],
  ["field:32", "Psychology"],
  ["field:27", "Medicine"],
  ["field:33", "Social Sciences"],
  ["field:17", "Computer Science"],
  ["field:20", "Economics"],
];

// Presets from the idea card; they fill the word boxes and draw from the saved sample data.
const PRESETS = [
  ["Novel", { word1: "novel" }],
  ["Hype words", { word1: "groundbreaking", word2: "unprecedented" }],
  ["Delve", { word1: "delve" }],
];

document.getElementById("controls").innerHTML =
  '<div class="stack">'
  + '<label>Word 1 <input id="word1" type="text" autocomplete="off" spellcheck="false" placeholder="e.g. novel"></label>'
  + '<label>Word 2 (optional) <input id="word2" type="text" autocomplete="off" spellcheck="false" placeholder="blank = unused"></label>'
  + '<label>Word 3 (optional) <input id="word3" type="text" autocomplete="off" spellcheck="false" placeholder="blank = unused"></label>'
  + '<label>Field <select id="scope">'
  + FIELDS.map(f => '<option value="' + f[0] + '">' + esc(f[1]) + '</option>').join("")
  + '</select></label>'
  + '<button id="go" class="go">Draw</button>'
  + '<button id="download" class="reset" style="margin-top:8px">Download the numbers (CSV)</button>'
  + '</div>';

document.getElementById("presets").innerHTML =
  PRESETS.map(p => '<button class="preset" data-preset="' + esc(p[0]) + '">' + esc(p[0]) + '</button>').join("");
document.getElementById("presetNote").textContent =
  "Preset buttons use numbers we saved on 2026-11-15. They cost nothing: no call to OpenAlex is made.";

const YEARS = OA.years; // 1990..2025, filled and sorted by oa-helper.js (missing year = 0)
let lastData = null; // the numbers of the last drawing, for the CSV download

function readWords() {
  return ["word1", "word2", "word3"]
    .map(id => OA.cleanWord(document.getElementById(id).value))
    .filter(Boolean);
}

async function draw(preferSample) {
  clearMessages();
  const scopeSelect = document.getElementById("scope");
  const scope = scopeSelect.value;
  const scopeName = scopeSelect.options[scopeSelect.selectedIndex].text;
  const words = readWords();
  if (!words.length) { showError("Type at least one word, or press a preset button."); return; }

  // The five calls (idea card): denominator (works with an abstract), coverage (all works),
  // then one call per word. Never a loop beyond these, only on Draw / preset.
  const calls = [
    { search: null, scope },                          // denominator: works with an abstract
    { search: null, scope, withAbstract: false },     // coverage: all works
  ].concat(words.map(w => ({ search: w, scope })));

  if (preferSample) {
    const missing = calls.some(c => !OA.sample(c));
    if (missing) {
      showError("The saved numbers do not cover this preset for the field you picked. Press Draw instead (this asks OpenAlex and uses up part of the daily free budget).");
      return;
    }
  }

  let res;
  try {
    res = await Promise.all(calls.map(c => preferSample ? OA.yearly(Object.assign({ preferSample: true }, c)) : OA.yearly(c)));
  } catch (e) {
    showError(e.message); // OA.yearly messages are already plain English (incl. 429 budget)
    return;
  }
  res.filter(r => r.note).forEach(r => showWarning(r.note));

  const denom = res[0].counts;  // works with an abstract per year
  const total = res[1].counts;  // all works per year  // Share in % of works WITH an abstract (never of all works: coverage varies 38%–69% by year).
  const share = words.map((w, i) => res[2 + i].counts.map((c, k) => denom[k] > 0 ? c / denom[k] * 100 : NaN));
  const coverage = total.map((t, k) => t > 0 ? denom[k] / t * 100 : NaN);
  // Remember this drawing so the CSV download button can export it.
  lastData = { words, counts: words.map((w, i) => res[2 + i].counts), share, denom, total, coverage, scopeName, source: res[0].source };

  drawChart({
    type: "line",
    title: "How many abstracts (short paper summaries) contain the word",
    xLabel: "Year", yLabel: "% of works with an abstract",
    x: YEARS, yMin: 0,
    series: words.map((w, i) => ({ name: w, values: share[i] })),
  }, "chart");
  drawChart({
    type: "line",
    title: "Data check: how many works have an abstract at all",
    xLabel: "Year", yLabel: "% of all works with an abstract",
    x: YEARS, yMin: 0, yMax: 100,
    series: [{ name: "with an abstract", values: coverage }],
  }, "chart2");

  const last = YEARS.length - 1; // 2025
  const y2000 = YEARS.indexOf(2000);
  const cards = words.map((w, i) => ({
    label: "\u201C" + w + "\u201D in " + YEARS[last] + " (how many abstracts contain it)",
    value: Number.isFinite(share[i][last]) ? fmtFull(share[i][last]) + "%" : "no data",
    note: Number.isFinite(share[i][y2000]) ? "in " + YEARS[y2000] + ": " + fmtFull(share[i][y2000]) + "%" : "no matches in " + YEARS[y2000],
  }));
  cards.push({
    label: "Works with an abstract in " + YEARS[last] + " (share of all works)",
    value: Number.isFinite(coverage[last]) ? fmtFull(coverage[last]) + "%" : "no data",
    note: Number.isFinite(coverage[y2000]) ? "in " + YEARS[y2000] + ": " + fmtFull(coverage[y2000]) + "%" : "no data",
  });
  cards.push({
    label: "Papers with an abstract in " + YEARS[last] + " (" + scopeName + ")",
    value: fmtFull(denom[last]),
    note: "this is the total every share above is divided by (the denominator)",
  });
  renderCards(cards);

  // Fairness warning from the idea card: under 1,000 works with an abstract in 2025
  // or abstract coverage under 50% (either one).
  const warns = [];
  if (denom[last] < 1000) warns.push("only " + fmtFull(denom[last]) + " papers with an abstract in " + YEARS[last] + " (under 1,000)");
  if (Number.isFinite(coverage[last]) && coverage[last] < 50) warns.push("only " + fmtFull(coverage[last]) + "% of all works in " + YEARS[last] + " have an abstract");
  if (warns.length) showWarning("Be careful with this curve: " + warns.join(", and ") + ". A change in the curve can come from the data (what is counted) rather than from the language scientists use.");

  // Takeaway, computed from the results every time (idea card "Takeaway"):
  // rose / fell / stayed about the same, 2000 -> 2025, with the factor.
  const parts = words.map((w, i) => {
    const s = share[i], a = s[y2000], b = s[last];
    const label = "\u201C" + w + "\u201D";
    if (denom[y2000] === 0 || denom[last] === 0) return label + ": not enough data (a year with no works).";
    if (a === 0 && b === 0) return label + " has no matches in " + YEARS[y2000] + " or " + YEARS[last] + ".";
    if (a === 0) return label + " has no matches in " + YEARS[y2000] + "; in " + YEARS[last] + " it is " + fmtFull(b) + "%. ";
    if (b === 0) return label + " fell to no matches in " + YEARS[last] + " (" + fmtFull(a) + "% in " + YEARS[y2000] + "). ";
    const factor = fmtFull(round(b / a, 2));
    const factorText = "a factor of " + factor + " (how many times the " + YEARS[y2000] + " value it is)";
    if (b > 1.05 * a) return label + " rose from " + fmtFull(a) + "% (" + YEARS[y2000] + ") to " + fmtFull(b) + "% (" + YEARS[last] + "), " + factorText + ". ";
    if (b < 0.95 * a) return label + " fell from " + fmtFull(a) + "% (" + YEARS[y2000] + ") to " + fmtFull(b) + "% (" + YEARS[last] + "), " + factorText + ". ";
    return label + " stayed about the same from " + fmtFull(a) + "% (" + YEARS[y2000] + ") to " + fmtFull(b) + "% (" + YEARS[last] + "), " + factorText + ". ";
  });
  setTakeaway(parts.join("") + "These are shares among works that have an abstract, so more publishing alone does not explain them.");

  setMethod({
    how: "We use OpenAlex, a free database of scientific papers. For every year from 1990 to 2025 it knows how many papers have an abstract (the short summary at the start of a paper) and how many of those papers contain your word, in the field you picked. We divide the second number by the first and show the result in percent. The second chart shows how many papers have an abstract at all, because that share changes from year to year and would otherwise fake a trend.",
    assumptions: [
      "We only count papers that have an abstract, both for the word count and for the total we divide by. Only 38% to 69% of papers in OpenAlex have an abstract, and that share changes by year.",
      "The search also finds word variants (this is called stemming): novel also finds novels, delve also finds delving and delves, but novel does not find novelty.",
      "Words can mean more than one thing (\u201Cnovel\u201D is also a book), so a rising share is not only about language.",
      "The last year, 2026, is not finished yet, so the charts stop at 2025.",
    ],
    references: [
      "Vinkers, C. H., Tijdink, J. K., & Otte, W. M. (2015). Use of positive and negative words in scientific PubMed abstracts between 1974 and 2014: retrospective analysis. BMJ, h6467. https://doi.org/10.1136/bmj.h6467",
      "Kobak, D., Gonz\u00E1lez-M\u00E1rquez, R., Horv\u00E1t, E.-\u00C1., & Lause, J. (2025). Delving into LLM-assisted writing in biomedical publications through excess vocabulary. Science Advances, 11(27), eadt3813. https://doi.org/10.1126/sciadv.adt3813",
      "Millar, N., Batalo, B., & Budgell, B. (2022). Trends in the use of promotional language (hype) in abstracts of successful National Institutes of Health grant applications, 1985\u20132020. JAMA Network Open, 5(8), e2228676. https://doi.org/10.1001/jamanetworkopen.2022.28676",
      "OpenAlex: https://openalex.org",
    ],
  });
}

document.getElementById("go").addEventListener("click", () => draw(false));

// Option (d) from the idea card: download the numbers as a CSV file, with the date of the data.
function csvCell(v) {
  if (v === undefined || v === null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function num3(v) { return Number.isFinite(v) ? String(round(v, 3)) : ""; }
function downloadCsv() {
  if (!lastData) { showError("Nothing to download yet: press Draw or a preset button first."); return; }
  const d = lastData;
  const today = new Date().toISOString().slice(0, 10); // the day of the download
  // The date of the data itself: the saved sample was measured 2026-11-15 (from its own note);
  // the browser cache keeps answers for 7 days but not their date; live data was fetched today.
  let dateNote;
  if (d.source === "sample") {
    const m = /on (\d{4}-\d{2}-\d{2})/.exec((window.OA_SAMPLE && window.OA_SAMPLE._about) || "");
    dateNote = m ? "saved sample, measured " + m[1] : "saved sample";
  } else if (d.source === "cache") {
    dateNote = "from this browser's cache (fetched within the last 7 days, exact date not stored)";
  } else {
    dateNote = "fetched live from OpenAlex on " + today;
  }
  const rows = [
    ["The hype-o-meter: share of works with an abstract that contain a word"],
    ["Data date: " + dateNote],
    ["Downloaded: " + today],
    ["Field: " + d.scopeName],
  ];
  const head = ["year", "works with an abstract", "all works", "coverage %"];
  d.words.forEach(w => head.push(w + " count", w + " % of works with an abstract"));
  rows.push(head);
  YEARS.forEach((y, k) => {
    const r = [y, d.denom[k], d.total[k], num3(d.coverage[k])];
    d.words.forEach((w, i) => r.push(d.counts[i][k], num3(d.share[i][k])));
    rows.push(r);
  });
  const csv = rows.map(r => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }); // BOM so Excel shows the quotes right
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "hype-o-meter-" + today + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
document.getElementById("download").addEventListener("click", downloadCsv);

Array.from(document.querySelectorAll("#presets .preset")).forEach(btn => {
  btn.addEventListener("click", () => {
    const p = PRESETS.find(x => x[0] === btn.dataset.preset);
    ["word1", "word2", "word3"].forEach(id => { document.getElementById(id).value = (p[1][id] || ""); });
    draw(true); // preferSample: sample data only, 0 calls, 0 credits
  });
});
