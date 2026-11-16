// oa-helper.js — the OpenAlex fetch helper. Written and tested by the instructor. DO NOT EDIT (ask the AI to use it, not change it).
//
// Your key: OA.setKey(text) saves it in this browser only; OA.getKey() reads it. Never put a key in a file.
// What it does for you:
//   * calls OpenAlex from the browser (no key needed; an optional free key of your own can be pasted in the page)
//   * gives up after 15 seconds and shows a plain-English message instead of waiting forever
//   * remembers every answer in your browser (localStorage) for 7 days, so asking the same question again costs nothing
//   * waits 350 ms between calls (polite pacing)
//   * falls back to sample-data/openalex-sample.js (real numbers measured on 2026-11-15) when the live call fails
//   * fixes the three traps of group_by=publication_year: years with no match are MISSING (it fills in 0),
//     the answer comes sorted by size (it sorts by year), and it is cut at 200 groups (it always sets a year range)
//
// The one function you need:
//   OA.yearly({ search: "novel" | null, scope: "all" | "field:32" })  ->  Promise of
//     { years: [1990..2025], counts: [..], source: "live" | "cache" | "sample", note: "" }
//   search = null  -> ALL works with an abstract (the denominator).  search = "novel" -> works with an abstract whose
//   title or abstract contains the word. scope = "all" or "field:<id>" (id 11-36, e.g. field:32 = Psychology).
//   Add preferSample: true (preset buttons do this) to use the saved sample when it has the answer: 0 calls, 0 credits.
//   OA.yearly({ search: null, scope: "all", withAbstract: false }) -> ALL works (used to show abstract coverage).
(function () {
  "use strict";
  const BASE = "https://api.openalex.org";
  const FROM = 1990, TO = 2025;
  const PACE_MS = 350, TIMEOUT_MS = 15000, TTL_MS = 7 * 24 * 3600 * 1000;
  let lastCall = 0;

  const OA = { FROM, TO, stats: { live: 0, cache: 0, sample: 0, creditsLeft: null, creditsLimit: null } };
  OA.years = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i);

  // Your own free OpenAlex key lives ONLY in this browser (localStorage), is sent as the documented ?api_key= parameter,
  // and is never written into any file, log or the cache. Keyless still works (smaller daily budget).
  OA.getKey = () => { try { return localStorage.getItem("oa_api_key") || ""; } catch (e) { return ""; } };
  OA.setKey = k => { k = String(k || "").trim(); if (k && !/^[A-Za-z0-9_-]{8,80}$/.test(k)) throw new Error("That does not look like an OpenAlex key (letters and digits only). Nothing was saved."); try { k ? localStorage.setItem("oa_api_key", k) : localStorage.removeItem("oa_api_key"); } catch (e) { /* ignore */ } };

  function cacheGet(url) {
    try { const raw = localStorage.getItem("oa:" + url); if (!raw) return null; const o = JSON.parse(raw); return Date.now() - o.t < TTL_MS ? o.v : null; } catch (e) { return null; }
  }
  function cacheSet(url, v) { try { localStorage.setItem("oa:" + url, JSON.stringify({ t: Date.now(), v })); } catch (e) { /* storage full: fine */ } }

  // Make a safe search term: no comma, colon, pipe or angle brackets (they break OpenAlex filters).
  OA.cleanWord = w => String(w || "").replace(/[,:|<>{}\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);

  OA.url = function (opts) {
    const filters = ["publication_year:" + FROM + "-" + TO];
    if (opts.withAbstract !== false) filters.push("has_abstract:true");
    if (opts.scope && opts.scope !== "all") {
      const m = /^field:(\d+)$/.exec(opts.scope); if (!m) throw new Error("Unknown scope: " + opts.scope);
      filters.push("primary_topic.field.id:" + m[1]);
    }
    const word = OA.cleanWord(opts.search);
    if (opts.search && !word) throw new Error("Please type a word.");
    if (word) filters.push("title_and_abstract.search:" + encodeURIComponent(word));
    return BASE + "/works?group_by=publication_year&filter=" + filters.join(",");
  };
  const withKey = u => { const key = OA.getKey(); return key ? u + "&api_key=" + encodeURIComponent(key) : u; };   // added only when sending, never cached

  let queue = Promise.resolve();   // calls are made one after the other, even if the page asks for several at once (Promise.all)
  function fetchJson(url) { const p = queue.then(() => fetchJsonNow(url)); queue = p.catch(() => {}); return p; }
  async function fetchJsonNow(url, retried) {
    const wait = lastCall + PACE_MS - Date.now(); if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCall = Date.now();
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    let res;
    try { res = await fetch(withKey(url), { signal: ctl.signal }); }
    catch (e) { throw new Error(e.name === "AbortError" ? "OpenAlex did not answer within 15 seconds." : "Could not reach OpenAlex (no internet, or it is down)."); }
    finally { clearTimeout(timer); }
    const left = res.headers.get("x-ratelimit-remaining"); if (left !== null) OA.stats.creditsLeft = Number(left);
    const lim = res.headers.get("x-ratelimit-limit"); if (lim !== null) OA.stats.creditsLimit = Number(lim);
    if (res.status === 429 || res.status === 403) {
      const wait = Number(res.headers.get("retry-after"));
      if (res.status === 429 && wait > 0 && wait <= 5 && !retried) { retried = true; await new Promise(r => setTimeout(r, wait * 1000)); return fetchJsonNow(url, true); }   // too fast, not out of budget: wait and try once more
      throw new Error("OpenAlex says no (error " + res.status + "): " + (OA.getKey() ? "the daily budget of your key is used up" : "the free daily budget of this network (no key) is used up") + (wait > 0 ? "; it asks to wait " + Math.round(wait / 60) + " minutes" : "") + ". The budget starts again at midnight UTC. " + (OA.getKey() ? "" : "Sign up for your own free key (openalex.org/signup) and paste it into the key box, or ") + "use the preset buttons: they work without a call.");
    }
    if (!res.ok) throw new Error("OpenAlex returned error " + res.status + ".");
    return res.json();
  }

  function toSeries(groupBy) {
    const m = {}; (groupBy || []).forEach(g => { m[String(g.key)] = g.count; });
    return OA.years.map(y => m[String(y)] || 0);          // missing year = 0 matches
  }

  OA.sample = function (opts) {
    const S = window.OA_SAMPLE; if (!S) return null;
    const sc = S[opts.scope === "all" || !opts.scope ? "all" : opts.scope.replace(":", "")]; if (!sc) return null;
    const k = opts.search ? "w:" + OA.cleanWord(opts.search).toLowerCase() : (opts.withAbstract === false ? "total" : "withAbstract");
    const o = sc[k]; if (!o) return null;
    return { years: OA.years.slice(), counts: OA.years.map(y => o[String(y)] || 0), source: "sample", note: "" };
  };

  OA.yearly = async function (opts) {
    if (opts.preferSample) { const s0 = OA.sample(opts); if (s0) { OA.stats.sample++; return s0; } }   // preset buttons: no call, no credits
    const url = OA.url(opts);
    const cached = cacheGet(url);
    if (cached) { OA.stats.cache++; return { years: OA.years.slice(), counts: cached, source: "cache", note: "" }; }
    try {
      const j = await fetchJson(url);
      const counts = toSeries(j.group_by);
      cacheSet(url, counts); OA.stats.live++;
      return { years: OA.years.slice(), counts, source: "live", note: "" };
    } catch (e) {
      const s = OA.sample(opts);
      if (s) { OA.stats.sample++; s.note = e.message + " Showing the saved sample data (measured 2026-11-15) instead."; return s; }
      throw e;
    }
  };

  window.OA = OA;
})();
