# BSIT301 Business Intelligence Study Suite

A static, offline-friendly exam-prep app for **BSIT301 Business Intelligence**. It follows the current **100-mark** scope: Section A is **40 MCQs x 1 mark** and Section B is **60 marks** of long-answer work through **Q1 (30)** and **Q2 (30)**.

Tested chapters: **1, 2, 3, 4 and 6**. Chapter 5 is excluded from every route, question and flashcard.

## Run it

Open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 8012
```

Then visit <http://127.0.0.1:8012/>.

No build step, framework or package install is required. The question bank is bundled in `data/bsit_data.js`.

## What is inside

- **A-00 Exam brief** - 100-mark structure, question map and method.
- **C-01, C-02, C-03, C-04, C-06** - chapter study sheets with worked examples, key terms and retrieval widgets.
- **C-06 calculation element lab** - 10 descriptive and predictive formulas with clickable element meanings, exam traps, examples and an element-meaning quiz.
- **M-01 Interactive mind map** - pan, zoom and drill into every tested topic.
- **D-01 Interactive Diagram Lab** - five clickable SVG diagrams: BI architecture, Simon plus DSS, enterprise DW and ETL, the BPM loop, and the descriptive/predictive calculation plus web-analytics flow. Includes node inspection and fill-in-the-blank recall.
- **Q-01 MCQ simulator** - 94-question bank, practice/study modes and a 40-bubble OMR shading card.
- **Q1 and Q2 Section B workbenches** - five sub-questions each, mark-by-mark guidance, textareas, step-by-step model answers and self-marking chips that total 60 across the two papers.
- **Q-04 extension workbench** - extra long-answer practice and a second Chapter 6 element-meaning lab.
- **E-01 Drill Arena** - all 117 drill items in All-Mix, MCQ or Long-answer mode, filterable by chapter, grouped topic and exact source (Test 1, Test 2, 2023 Main, 2024 Main, 2026 Main, Lecture Deck), with shuffle and saved session scores.
- **P-03 Flashcards** - 68 active-recall cards across the tested chapters.

Other shell features: dark/light themes, five aesthetic presets, search, reviewed-sheet tracking, best-score persistence and a desktop collapsible sidebar (`Ctrl+B` or `[`).

## Project layout

```text
index.html
css/styles.css
js/app.js           shell, routes, study sheets, mind map
js/calculations.js  Chapter 6 calculation element lab
js/diagrams.js      D-01 interactive diagrams
js/sectionb.js      Section B workbenches
js/practice.js      Q-01 MCQ simulator
js/drillbank.js     E-01 drill arena
data/bsit_data.js   generated app data
scripts/            local content assembler (not published)
sources/            local source material (not published)
```

## Data notes

`data/bsit_data.js` is generated from the local content modules in `scripts/` by `python scripts/extract.py`. The app itself is static and does not read the source PDFs. `sources/` and `scripts/` are intentionally excluded from the public repository.

## Repository

<https://github.com/PatrickLuhanga/bsit301-study-app>
