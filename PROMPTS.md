# T4 · The hype-o-meter — copy-paste prompts (Steps 1–4 + the error prompt)

> **If the AI stops answering** (silent for 5 minutes, or "Free usage limit reached" / "rate limit"): press Esc, pick
> the next model in this order and paste the same prompt again: 1 OpenCode's free model, 2 your OpenRouter key
> (`openrouter/nvidia/nemotron-3.5-super-vl:free`), 3 NVIDIA, 4 Groq, 5 the optional ones. Set the keys up at home
> first with **AI-BACKUP.md** (in the Hackathon 3 folder). All of Step 1 (1a to 1c) used 17-38 AI requests in our tests.


Same four rules as Hackathon 2: **one change per prompt · keep a copy that works · the AI only edits `app.js` · you do the NUMBER CHECK yourself.**
Your repo folder holds: the starter files, `IDEA-CARD.md` (copy of the idea card), and `.opencode/skills/openalex-word-trends/` (the skill, see Step 0).

## Step 0a — Get your free OpenAlex key (5 minutes, you do this yourself)
This is a short lesson in how APIs limit you. **Do it before Step 1a.**
1. Open https://openalex.org/signup, create a free account with your own email, confirm the email, then open your account's API page (openalex.org/settings/api-key, or search "API key" in your settings) and copy the key. The key is like a password: **never put it in a file, in GitHub, or in a message to the AI.**
2. You will paste it into the page's "Your OpenAlex key" box in Step 1a (it stays in your browser only). Without a key the tool still works, with a smaller budget.

What the limits mean (OpenAlex help page, updated 2026-11-03; our measurements on 2026-11-15):
| | No key | Free key |
|---|---|---|
| Daily budget | about $0.10, **shared by everyone on the same network** (1,000 credits) | $1, yours alone (10,000 credits) |
| Speed | 10 requests per second | 30 requests per second |
| A search call (a word) | 10 credits | 10 credits |
| A call without a search (denominator, coverage) | 1 credit | 1 credit |

How many calls does this tool use? A preset button: **0** (saved sample). Draw with 1 word: **3 calls = 12 credits**. Draw with 3 words: **5 calls = 32 credits**. Without a key a whole class together gets about 31 three-word charts a day; with your own key you get about 310.
What "too many" looks like: OpenAlex answers **429** ("Too Many Requests") and the page shows a red box: "OpenAlex says no (error 429): … the daily budget … is used up. The budget starts again at midnight UTC." The status line under Settings shows the credits left today. Presets keep working. Your page paces its calls (about 3 per second) so it never hits the speed limit.
Ask yourself: why would a limit shared by a whole network be a problem in a classroom, and why does a key fix it?

## Step 0 — put the skill in place (1 minute)
> Copy the folder `skill/openalex-word-trends` (it is next to the starter) to `.opencode/skills/openalex-word-trends` in this project, so that the file `.opencode/skills/openalex-word-trends/SKILL.md` exists. Change nothing else. Then list the files in that folder.

## Step 1a — The core: inputs, presets, OpenAlex calls and cards (1–3 minutes)
> Load the skill openalex-word-trends and read its LESSONS.md first. Then read IDEA-CARD.md and AGENTS.md. Copy app.js into a folder called backups as backup-1.js. Then replace the example code in app.js with only the core of the tool described in IDEA-CARD.md, and keep the existing lines for the reset button and the key box (apiKey, saveKey): the title and question, the inputs word1, word2, word3, scope (with the fields from the card) and the button go ("Draw"), the three preset buttons (class preset, named exactly as on the card), the calls (the denominator with search: null, all works with withAbstract: false, and one call per word), the shares in % of works with an abstract for 1990–2025, and the cards from the card's section "Cards". Call OpenAlex only through OA.yearly(...), and only when Draw is pressed; the preset buttons must use preferSample: true and make no API call; show any error with showError. For now the charts, the takeaway and the methodology may be short placeholders: the next steps do them. Do not edit oa-helper.js, ui.js, style.css, index.html or anything in sample-data, and do not start a web server. Before you finish, run node --check app.js and fix any error it reports. Do not open the page in a browser: I will check it myself. Tell me in 2 short sentences what you changed.

Now open the page yourself, the same way as on the web: in a terminal in this folder, run
```powershell
python -m http.server 8000
```
and open `http://localhost:8000` (stop the server with Ctrl+C; double-clicking `index.html` also works). In the page,
paste your key into "Your OpenAlex key" and press "Save key" (never into the AI chat or a file).
- **Click the preset Novel:** a card shows the share of "novel" in 2025 (about 6.03%) and the works with an abstract in 2025 (8,406,552). The charts are still empty: that is Step 1b. Go to Step 1b.
- **A red box, or no preset buttons:** send the red-box prompt in Step 2, with the red text (or "there are no preset buttons") pasted in.

## Step 1b — The two charts (1–3 minutes)
> You already read the idea card and the skill; do not read them again unless you need a detail. First copy app.js into the backups folder with the next free name. Then, in app.js only, draw the two charts from the card's section "Output and chart" with drawChart from ui.js: the line chart in "chart" (x = 1990–2025, one line per word, named with the word itself, y = % of works with an abstract) and the "Data check" chart in "chart2" (the % of all works that have an abstract, per year, 0–100). Draw both after a preset and after Draw. Do not change the calls, presets or cards. Before you finish, run node --check app.js and fix any error it reports. Do not open the page in a browser: I will check it myself. Tell me in 2 short sentences what you changed.

Reload the page (F5) and click **Novel**. Hover over the line at 2025: it must say `novel · 2025: 6.034`. Hover over the "Data check" line at 2025: about 59.4.
- **No line, or a different number:** send the error prompt in Step 2 with the preset, the year and the two numbers.
- **A red box:** send the red-box prompt in Step 2.

## Step 1c — Takeaway, warning and methodology (1–3 minutes)
> You already read the idea card and the skill; do not read them again unless you need a detail. First copy app.js into the backups folder with the next free name. Then, in app.js only: (1) write the takeaway sentence exactly as in the card's section "Takeaway", calculated from the results every time, never fixed text: for each word rose / fell / stayed about the same from a% (2000) to b% (2025) with the factor (rose only if b is more than 5% above a, fell only if b is more than 5% below a), "no matches" when a word has none in either year, "not enough data" when a year has no works, and always the card's last sentence; show it with setTakeaway; (2) show the yellow warning with showWarning when the selection has under 1,000 works with an abstract in 2025 or abstract coverage under 50%; (3) write the methodology with setMethod: how it works in one paragraph, the assumptions (only works with an abstract, stemmed search, words have other senses, 2026 is incomplete), and as references exactly the four on the card and nothing else. Do not change the calls, presets, cards or charts. Before you finish, run node --check app.js and fix any error it reports. Do not open the page in a browser: I will check it myself. Tell me in 2 short sentences what you changed.

Reload the page and click **Novel**: the sentence under the charts says "novel" rose from 2.351% (2000) to 6.034% (2025) and ends with "These are shares among works that have an abstract, so more publishing alone does not explain them." Click **Delve**: the sentence changes with the numbers. "How this tool works" shows only Vinkers 2015, Kobak 2025, Millar 2022 and OpenAlex.
- **The sentence is the same for every preset, or says "undefined":** send the error prompt in Step 2 ("the takeaway says ________ but the chart shows ________").
- **All good:** go to Step 2.

## Step 2 — The NUMBER CHECK (the most important step)
Click each preset, hover over the line at the year in the NUMBER CHECK table of `IDEA-CARD.md`, and compare. Presets must show the table's values (± 0.001).

**Error prompt** (if a row is wrong, fill in the four blanks):
> First copy app.js into a folder called backups, with the next free name (backup-1.js, backup-2.js, …). Then: with the preset "________", the chart value "________" at year ________ shows ________, but IDEA-CARD.md says it should be ________. Read the idea card and the skill openalex-word-trends again, find the mistake in app.js and fix it. Change only app.js. Tell me what was wrong.

**If the page shows a red box**, send:
> First copy app.js into a folder called backups, with the next free name. Then fix this error in app.js (change only app.js): [paste the red text here]

## Step 3 — Make the words clear
> First copy app.js into a folder called backups, with the next free name. Then rewrite the texts in app.js (the question, the labels, the card notes, the takeaway sentence and the methodology) so that a first-year student with no statistics background understands them. Short sentences, no jargon, explain any technical word in brackets. Do not change numbers, calculations, ids or references, and keep the takeaway calculated from the results. Change only app.js.

Check the references: the methodology box must show only the references on the idea card (Vinkers 2015, Kobak 2025, Millar 2022, OpenAlex). AI models invent references: if one is not on the card, ask the AI to remove it.

## Step 4 — Make it yours
Pick one idea from "Make it yours" in `IDEA-CARD.md` and send:
> First copy app.js into a folder called backups, with the next free name. Then add this to my tool: "PASTE YOUR CHOSEN IDEA FROM THE CARD HERE". Keep everything that already works. Change only app.js. Then tell me how I can check that the new part is correct.

## The skill learns — last prompt of every session
> Finish the openalex-word-trends skill: append one entry to .opencode/skills/openalex-word-trends/LESSONS.md about what went wrong in this session and how it was fixed (or "no new lesson"), exactly in the format of the skill's last step. Show me the entry.
