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
