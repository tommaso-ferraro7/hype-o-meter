// ui.js — drawing helpers from the Hackathon 2 template + the red error box. DO NOT EDIT.
//   drawChart({ type:"line", title, xLabel, yLabel, x:[years], series:[{name, values:[numbers]}] }, "chart")
//       draws into <div id="chart"> (second argument = id of another div, e.g. "chart2"). Hover a point to see
//       "<series name> · <year>: <value>" — this is how you do the NUMBER CHECK.
//   renderCards([{label, value, note}])      fills <div id="cards">
//   setTakeaway(text)                        fills the yellow takeaway box
//   setMethod({how, assumptions:[], references:[]})   fills the methods box
//   fmt(n) short number (6.1M), fmtFull(n) number with up to 3 decimals, esc(text) safe text for HTML, round(x, decimals)
//   showError(text) / showWarning(text) / clearMessages()   red error box / yellow warning box (on the page, not hidden in the console)
(function () {
"use strict";
// Everything below lives inside this function, so the names $, esc, round, fmt, COLORS cannot clash with names you or the AI use in app.js.
function round(x, d = 0) { const f = Math.pow(10, d); return Math.round(x * f) / f; }
const COLORS = ["#b45309", "#1d4ed8", "#15803d", "#7c3aed", "#be123c", "#0e7490"];
const $ = id => document.getElementById(id);
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function fmtFull(v) { return typeof v === "number" ? v.toLocaleString("en", { maximumFractionDigits: 3 }) : String(v); }
function fmt(v) { if (typeof v !== "number") return String(v); const a = Math.abs(v); if (a >= 1e6) return round(v / 1e6, 1) + "M"; if (a >= 1e4) return round(v / 1e3, 0) + "k"; if (a >= 100) return round(v, 0).toString(); if (a >= 1) return round(v, 1).toString(); return round(v, 3).toString(); }

function niceTicks(lo, hi, n = 5) {
  if (hi === lo) { hi = lo + 1; }
  const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || 10 * mag;
  const ticks = []; for (let v = Math.floor(lo / step) * step; v <= hi + step * 1e-9; v += step) ticks.push(round(v, 10));
  return ticks;
}

function drawChart(chart, targetId) {
  const target = $(targetId || "chart");
  const W = 760, H = 360, L = 64, R = 16, T = 16, B = 52;
  const iw = W - L - R, ih = H - T - B;
  const all = chart.series.flatMap(s => s.values).filter(v => Number.isFinite(v));
  let lo = Math.min(0, ...all), hi = Math.max(...all);
  if (chart.yMin !== undefined) lo = chart.yMin; if (chart.yMax !== undefined) hi = chart.yMax;
  const ticks = niceTicks(lo, hi); lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
  const y = v => T + ih - (v - lo) / (hi - lo || 1) * ih;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(chart.title || "chart")}">`;
  ticks.forEach(t => { s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="#e7e5e4"/><text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`; });
  const n = chart.x.length;
  const labelEvery = Math.max(1, Math.ceil(n / 12));
  if (chart.type === "bar") {
    const k = chart.series.length, gw = iw / n, bw = Math.max(2, (gw * 0.8) / k);
    chart.x.forEach((xl, i) => {
      chart.series.forEach((ser, j) => {
        const v = ser.values[i]; if (!Number.isFinite(v)) return;
        const x0 = L + i * gw + gw * 0.1 + j * bw, y0 = y(Math.max(v, 0)), y1 = y(Math.min(v, 0));
        s += `<rect x="${x0}" y="${y0}" width="${bw - 1}" height="${Math.max(0.5, y1 - y0)}" fill="${COLORS[j % 6]}" rx="2"><title>${esc(ser.name)} · ${esc(xl)}: ${fmtFull(v)}</title></rect>`;
      });
      if (i % labelEvery === 0) s += `<text x="${L + i * gw + gw / 2}" y="${H - B + 18}" text-anchor="middle">${esc(xl)}</text>`;
    });
  } else {
    const xs = chart.x.map(Number), numeric = xs.every(Number.isFinite);
    const xmin = numeric ? Math.min(...xs) : 0, xmax = numeric ? Math.max(...xs) : n - 1;
    const xp = i => L + ((numeric ? xs[i] : i) - xmin) / ((xmax - xmin) || 1) * iw;
    chart.series.forEach((ser, j) => {
      const pts = ser.values.map((v, i) => Number.isFinite(v) ? `${xp(i)},${y(v)}` : null).filter(Boolean).join(" ");
      s += `<polyline points="${pts}" fill="none" stroke="${COLORS[j % 6]}" stroke-width="2.5" stroke-linejoin="round"/>`;
      if (n <= 120) ser.values.forEach((v, i) => { if (Number.isFinite(v)) s += `<circle cx="${xp(i)}" cy="${y(v)}" r="5" fill="${COLORS[j % 6]}" fill-opacity="0.01"><title>${esc(ser.name)} · ${esc(String(chart.x[i]))}: ${fmtFull(v)}</title></circle>`; });
    });
    chart.x.forEach((xl, i) => { if (i % labelEvery === 0 || i === n - 1) s += `<text x="${xp(i)}" y="${H - B + 18}" text-anchor="middle">${esc(numeric ? fmt(xs[i]) : xl)}</text>`; });
  }
  s += `<line x1="${L}" x2="${W - R}" y1="${y(lo)}" y2="${y(lo)}" stroke="#a8a29e"/>`;
  s += `<text x="${L + iw / 2}" y="${H - 8}" text-anchor="middle">${esc(chart.xLabel || "")}</text>`;
  s += `<text transform="translate(14 ${T + ih / 2}) rotate(-90)" text-anchor="middle">${esc(chart.yLabel || "")}</text></svg>`;
  target.innerHTML = s;
  if (!targetId || targetId === "chart") { $("chartTitle").textContent = chart.title || "Chart"; }
  if ($(targetId ? targetId + "Legend" : "legend")) $(targetId ? targetId + "Legend" : "legend").innerHTML = chart.series.length > 1 || chart.type === "bar" ? chart.series.map((ser, j) => `<span style="--c:${COLORS[j % 6]}">${esc(ser.name)}</span>`).join("") : "";
}


function renderCards(cards) { $("cards").innerHTML = (cards || []).map(c => `<div class="card"><div class="l">${esc(c.label)}</div><div class="v">${esc(c.value)}</div>${c.note ? `<div class="n">${esc(c.note)}</div>` : ""}</div>`).join(""); }
function setTakeaway(t) { $("takeaway").textContent = t || ""; }
function setMethod(md) { md = md || {}; $("method").innerHTML = `<p>${esc(md.how || "")}</p>` + (md.assumptions && md.assumptions.length ? `<p><b>Assumptions and limits</b></p><ul>${md.assumptions.map(a => `<li>${esc(a)}</li>`).join("")}</ul>` : "") + (md.references && md.references.length ? `<p><b>References</b></p><ul>${md.references.map(a => `<li>${esc(a)}</li>`).join("")}</ul>` : ""); }
function showError(t) { $("messages").innerHTML = `<div class="error">${esc(t)}\n\nCopy this message into OpenCode and ask it to fix the problem.</div>`; }
function showWarning(t) { $("messages").insertAdjacentHTML("beforeend", `<div class="warn">${esc(t)}</div>`); }
function clearMessages() { $("messages").innerHTML = ""; }
window.addEventListener("error", e => { showError("Something went wrong on the page:\n" + e.message + (e.lineno ? "  (line " + e.lineno + " of " + (e.filename || "").split("/").pop() + ")" : "")); });
window.addEventListener("unhandledrejection", e => { showError("Something went wrong:\n" + (e.reason && e.reason.message ? e.reason.message : e.reason)); });

window.drawChart = drawChart; window.renderCards = renderCards; window.setTakeaway = setTakeaway; window.setMethod = setMethod;
window.fmt = fmt; window.fmtFull = fmtFull; window.esc = esc; window.round = round;
window.showError = showError; window.showWarning = showWarning; window.clearMessages = clearMessages;
})();
