---
name: openalex-word-trends
description: Use whenever a task counts papers per year in OpenAlex (word or phrase trends in titles/abstracts, shares by field or journal, group_by=publication_year). How to query correctly, the traps that fake a trend, and a self-learning LESSONS.md that you must read first and update last.
---

# OpenAlex word trends: how to query, what goes wrong, and how this skill learns

## Step 0 — read the lessons first (always)
Read `LESSONS.md` in this skill's folder (the same folder as this file) BEFORE writing any query or code.
Lessons from earlier sessions override the general advice below. If the file is missing, create it with the header `# Lessons (newest last)`.

## The API in one paragraph
`GET https://api.openalex.org/works?filter=...&group_by=publication_year` returns one row per year: `{key:"2024", count:408965}`. No key, no email, no `mailto`. It works from the browser (CORS `*`) and from `file://`.
Useful filters (comma = AND): `publication_year:1990-2025`, `has_abstract:true`, `title_and_abstract.search:novel`, `primary_topic.field.id:32` (Psychology; list: `/fields`), `primary_location.source.id:S137773608` (a journal; ids from the free `/autocomplete/sources?q=nature`, single word only).

## Rules that keep the numbers true
1. **Share, not count.** Always divide by the number of works in the SAME year and the SAME selection. Use `has_abstract:true` in numerator AND denominator: only 38% (1990) to 69% (2023) of works have an abstract, falling to 59% in 2025. Dividing by all works fakes a rise-then-fall.
2. **Show coverage.** Draw the share of works with an abstract per year (`has_abstract:true` count / all-works count) next to every curve. Some journals have ~0% (Nature before 2020): say "not measurable".
3. **Missing year = 0 matches.** `group_by` leaves out years with no hits. Fill them with 0 (`OA.yearly` in the starter already does).
4. **Always give a year range** (`publication_year:1990-2025`): the answer is cut at 200 groups and sorted by count, not by year. Sort by year yourself.
5. **Stemming.** `title_and_abstract.search` stems words: `novel` = `novels`; `delve` = `delving` = `delves`; but `novel` does NOT match `novelty`. Not case-sensitive. A quoted phrase (`"state of the art"`) is a phrase; `OR` inside parentheses counts a work once.
6. **The newest year is incomplete.** End the chart at the last full year (2025 in 2026).
7. **Budget.** Without a key the whole network shares 1,000 credits a day. A search call costs 10, a call without search costs 1. Three words = 5 calls = 32 credits. Never loop, never call per keystroke, cache every answer (`localStorage`), and keep sample data for presets. Check `X-RateLimit-Remaining` in the response headers.
8. **Words have other senses** ("novel" is also a book). Say so next to the result.
9. **Never type a number by hand.** Every shown number comes from a call or from `sample-data`.
10. **The key is a secret.** A free key (openalex.org/signup, then the API page of your account) goes only into the page's key field (localStorage) and is sent as `?api_key=` (or the header `Authorization: Bearer <key>`). Never commit it, paste it into code, a log or a chat. A 429 means: daily budget used up (resets at midnight UTC; header `Retry-After`) or too fast (10 requests/second without a key, 30 with one); show it on the page.

## Last step — learn (always, even if all went well)
When the task is finished, append ONE entry to `LESSONS.md` in this skill's folder:
```
## <date> · <one-line title>
- Symptom: <what went wrong, or "none">
- Cause: <the real reason>
- Fix / rule: <what to do next time, in one sentence a student can follow>
- Evidence: <the URL or error text that proves it>
```
Only write what you actually observed in this session. Do not repeat a lesson that is already in the file; improve its wording instead. If nothing went wrong and nothing new was learned, append "## <date> · no new lesson". Then tell the student what you added.
