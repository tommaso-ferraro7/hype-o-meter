# T4 · The hype-o-meter

**Platform:** Metaventory  ·  **Tool id:** `hype-o-meter`  ·  **API:** OpenAlex (free, no key)

**The question:** How has the language of science changed?

## The idea in plain words
Scientific abstracts increasingly use strongly positive words ("novel", "groundbreaking", "unprecedented") and, since 2023, words typical of AI-written text ("delve"). Counting how many abstracts contain a word is easy; counting it *fairly* is the point. Science publishes more every year, so a raw count of "novel" always rises. The tool therefore shows the **share**: of all works that have an abstract in a year, how many contain the word. Only about 38% (1990) to 69% (2023) of works in OpenAlex have an abstract at all, and that share changes by year (and by publisher), so the tool shows the abstract coverage next to the curve. You type up to three words, pick a field, press Draw, and read the curves.

## The exact API calls (OpenAlex, from the browser with `fetch`, no key, no email)
All are `GET https://api.openalex.org/works?...` and return `group_by` rows `{key: "2024", count: 408965}` (year as text, count as number). Always use a year range (the answer is cut at 200 groups) and sort by year yourself; a year with zero matches is **missing**, not 0.

| Call | Filter | Credits |
|---|---|---|
| Denominator: works with an abstract, per year | `group_by=publication_year&filter=publication_year:1990-2025,has_abstract:true` | 1 |
| Coverage: all works, per year | `group_by=publication_year&filter=publication_year:1990-2025` | 1 |
| Numerator: one word | `group_by=publication_year&filter=publication_year:1990-2025,has_abstract:true,title_and_abstract.search:novel` | 10 |
| A field (optional) | add `,primary_topic.field.id:32` (Psychology) to each filter above | same |

Three words = 5 calls = 32 credits. Keyless access gives the **whole network** only 1,000 credits a day (about 31 such charts), so in class the preset buttons use the saved sample (0 calls), repeated questions come from the browser cache, and **every student signs up for their own free key** ($1/day, 30 requests/second) and pastes it into the key box (keyless still works as the fallback). The starter's `OA.yearly()` does all of this; ask the AI to use it.
Search facts (measured): stemmed (`novel` = `novels`; `delve` = `delving`/`delves`), not case sensitive, `novel` does **not** find `novelty`, quotes make a phrase.

## Before Step 1: get your free OpenAlex key (see PROMPTS.md, Step 0a)
Sign up at openalex.org/signup (your own email), copy the key from your account's API page, paste it into the page's "Your OpenAlex key" box (saved only in your browser, sent as `?api_key=`). Never put it in a file, in GitHub, or in a message to the AI. Free key: $1 a day (10,000 credits) and 30 requests/second, yours alone; no key: about $0.10 a day (1,000 credits) shared by your whole network and 10 requests/second. This tool: preset = 0 calls; 1 word = 3 calls (12 credits); 3 words = 5 calls (32 credits). A 429 answer = budget used up; the page says so in a red box and shows the credits left.

## Inputs
| id | what | start value |
|---|---|---|
| `word1`, `word2`, `word3` | word or phrase (blank = unused) | empty (a preset fills them) |
| `scope` | drop-down: "All fields" or one of OpenAlex's 26 fields (Psychology = `field:32`, Medicine = `field:27`, Social Sciences = `field:33`, Computer Science = `field:17`, Economics = `field:20` …) | All fields |
| `go` | button "Draw" | – |
| `apiKey`, `saveKey` | box "Your OpenAlex key" (optional) and button "Save key"; in the starter, already working | empty |

## Output and chart
Line chart, x = publication year 1990–2025 (36 points; 2026 is incomplete and is not shown), one line per word, y = **% of works with an abstract** that contain the word. Hovering a point shows `word · year: value`. A second small chart, "Data check", shows the % of all works that have an abstract per year (0–100).

## Cards (big numbers)
- For each word: its share in 2025 (note: the 2000 value)
- Abstract coverage in 2025 (note: the 2000 value)
- Works with an abstract in 2025 (the denominator, with the field name)

## Presets (buttons, work without any API call)
- **Novel**: word1 = `novel`
- **Hype words**: `groundbreaking`, `unprecedented`
- **Delve**: `delve` (AI-text marker, after 2022)

## Takeaway (sentence under the chart; built from the numbers, true for any input)
For each word: "“X” rose / fell / stayed about the same from a% (2000) to b% (2025), a factor of f." Use "rose" only if b is more than 5% above a, "fell" only if more than 5% below. If a word has no matches in either year say so; if a year has no works, say "not enough data". Always end with: "These are shares among works that have an abstract, so more publishing alone does not explain them." Show a yellow warning when the selection has under 1,000 works with an abstract in 2025 or abstract coverage under 50%.

## References (put in methodology.references; each checked against Crossref on 2026-11-15)
- Vinkers, C. H., Tijdink, J. K., & Otte, W. M. (2015). Use of positive and negative words in scientific PubMed abstracts between 1974 and 2014: retrospective analysis. *BMJ*, h6467. https://doi.org/10.1136/bmj.h6467
- Kobak, D., González-Márquez, R., Horvát, E.-Á., & Lause, J. (2025). Delving into LLM-assisted writing in biomedical publications through excess vocabulary. *Science Advances*, 11(27), eadt3813. https://doi.org/10.1126/sciadv.adt3813
- Millar, N., Batalo, B., & Budgell, B. (2022). Trends in the use of promotional language (hype) in abstracts of successful National Institutes of Health grant applications, 1985–2020. *JAMA Network Open*, 5(8), e2228676. https://doi.org/10.1001/jamanetworkopen.2022.28676
- OpenAlex: https://openalex.org

## NUMBER CHECK - do this yourself after Step 1
Click a preset and hover over the line at the given year. Values are % of works with an abstract, measured live on **2026-11-15**. Pressing a preset must show these (they come from the saved sample, so they match to the third decimal; tolerance ±0.001). If anything differs, the AI made a mistake: use the error prompt.

| Preset | The screen must show |
|---|---|
| Novel | 2000: 2.351% · 2010: 3.254% · 2025: 6.034% |
| Hype words | groundbreaking 2020: 0.026%, 2025: 0.085% · unprecedented 2020: 0.357%, 2025: 0.381% |
| Delve | 2022: 0.098% · 2023: 0.421% · 2024: 1.030% · 2025: 0.490% |
| Any preset, "Data check" chart | works with an abstract in 2025: 59.4% (1990: 37.7%, 2023: 68.8%) |
| Card | Novel preset, works with an abstract in 2025: 8,406,552 |

**Live check (needs OpenAlex, uses credits: do it once, as one student per network):** type `novel`, press Draw: 2000 ≈ 2.35%, 2010 ≈ 3.25%, 2025 ≈ 6.03%. Live data drifts (OpenAlex adds records and abstracts), so accept ±10% of the value up to 2022, ±20% for 2023–2025, and ±5 points on coverage.
Other numbers measured the same day (Psychology, word `novel`, works with an abstract): 1990 0.68% · 2000 0.85% · 2010 1.16% · 2020 2.02% · 2025 2.35%; denominators 15,932 (1990) and 282,667 (2025).
A wrong-denominator mistake is easy to spot: dividing by all works instead of works with an abstract gives `novel` ≈ 3.6% in 2025, not 6.034%.

## Make it yours (Step 4)
Pick ONE: (a) add a "novelty" line next to "novel" (it is a different word in OpenAlex); (b) add a "control words" preset (e.g. "method", "analysis") to see which words did *not* change, as in Vinkers et al.; (c) a year-range choice; (d) a button that downloads the numbers as a CSV file (with the date of the data); (e) a hedging preset ("may", "might", "suggest": check first whether the search ignores such common words, and report what you find).

## Level 1 → 2 → 3 roadmap (to a tool the community would use)
1. **Level 1 (this hackathon):** up to 3 words × field, share with the right denominator, coverage chart, presets from sample data, deployed on Vercel from your own GitHub repo.
2. **Level 2:** journal and publisher scope (journal ids from OpenAlex's free `autocomplete/sources`; it fails on multi-word names and has duplicate records, so offer a picker) with an automatic "not measurable" label where abstract coverage is under ~50% (Nature has 0–4% before 2020); control words; "excess words" mode that compares a year with the years before (Kobak et al.); export with data date; permalink (`#words=…`).
3. **Level 3, a language-of-science observatory:** a small script run on your own computer (not an always-on server) pre-computes many word lists (hype, hedging, AI markers) by field and journal into JSON files in the repo, refreshed monthly; the site only reads those files (zero API calls, $0). A self-learning skill records every API trap; an MCP server lets AI assistants query the observatory.
