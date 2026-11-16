# Lessons (newest last)

Seeded by the instructor from measurements on 2026-11-15 (keyless OpenAlex). Add your own below; the AI reads this file first.

## 2026-11-15 · Missing abstracts fake a trend
- Symptom: shares computed against all works rise until 2023, then fall.
- Cause: only 37.7% (1990), 59.8% (2020), 68.8% (2023), 59.4% (2025) of works have an abstract in OpenAlex.
- Fix / rule: use `has_abstract:true` in numerator and denominator, and draw coverage per year.
- Evidence: `group_by=publication_year` with and without `has_abstract:true`, 2026-11-15.

## 2026-11-15 · Years with no hits are missing from group_by
- Symptom: a line for a rare word or a small journal has fewer points than years (Nature + "novel" returned 23 of 37 years); the chart shows gaps or a wrong x axis.
- Cause: OpenAlex omits groups with count 0.
- Fix / rule: build the x axis yourself (1990..2025) and fill 0.

## 2026-11-15 · The free budget is shared and small
- Symptom: HTTP 429/403 or "free daily budget" notice after a few charts in class.
- Cause: keyless = $0.10/day = 1,000 credits per network; a search costs 10 credits.
- Fix / rule: presets from `sample-data` (0 calls), cache in `localStorage`, student's own free key from openalex.org/settings/api.

## 2026-11-15 · Journal lookup traps
- Symptom: `autocomplete/sources?q=psychological science` returns nothing; "BMJ" appears under three ids.
- Cause: multi-word autocomplete queries fail; OpenAlex has duplicate source records.
- Fix / rule: query with one word, let the user pick from the list, and show the works count next to each name.

## 2026-11-16 · no new lesson

## 2026-11-16 · A reported takeaway bug that was not in the code
- Symptom: The student reported that the "Hype words" takeaway compared 2020 with 2025 ("stayed about the same from 0.357% to 0.381%") instead of 2000 with 2025 as the idea card requires.
- Cause: Not reproducible. The live page already showed the correct sentence ("rose from 0.146% (2000) to 0.381% (2025), a factor of 2.6"), the code used `YEARS.indexOf(2000)`, and the sample data had 0.146% at 2000; the 0.357% value exists only at 2020. Most likely the student's browser panel was showing a stale cached copy of app.js, so the fix was a hard reload rather than a code change.
- Fix / rule: When a student reports a wrong number on the page, first read the live page's own text (browser panel or element text) and the data file before editing code; if the code and data are right, ask for a hard reload (Cmd+Shift+R) instead of "fixing" working code.
- Evidence: takeaway element on http://localhost:8000 read during the session: "“unprecedented” rose from 0.146% (2000) to 0.381% (2025), a factor of 2.6"; sample-data check: unprecedented 2000 count 2,098 / 1,434,089 = 0.146%, 2020 = 0.357%.
