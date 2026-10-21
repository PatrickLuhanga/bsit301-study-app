/* =========================================================================
   D-01 Interactive Diagram & Architecture Lab
   Five clickable SVG diagrams with inspection and fill-in-the-blank recall.
   ========================================================================= */
(function () {
  "use strict";
  window.BSIT_RENDER = window.BSIT_RENDER || {};

  var DIAGRAMS = [
    {
      id: "bi", short: "BI Architecture", title: "High-Level BI Architecture",
      purpose: "Shows how raw operational data becomes a managerial decision. Use it to explain the end-to-end BI chain and where the warehouse, analytics and performance-management layers sit.",
      when: "Use when a question asks you to describe a BI architecture, explain the role of the data warehouse, or trace how source data reaches decision makers.",
      flow: "Data sources &rarr; ETL &rarr; data warehouse / marts &rarr; business analytics &rarr; BPM and dashboards &rarr; decision makers, with feedback into the next cycle.",
      height: 340, nodes: [
        { label: "Data Sources", x: 20, y: 130, w: 140, h: 100,
          purpose: "Capture raw operational transactions",
          definition: "Operational systems such as sales, inventory, finance, ERP, CRM and web platforms that capture day-to-day transactions.",
          how: "Receives business events, stores detailed current records and passes raw data to ETL. It does not perform historical analysis itself.",
          tip: "MCQs ask for the first layer of a BI architecture or contrast source systems with the warehouse." },
        { label: "ETL", x: 180, y: 130, w: 140, h: 100,
          purpose: "Cleanse, integrate and move data",
          definition: "Extract, Transform, Load: the pipeline that pulls source data, cleanses and standardises it, then loads it into the warehouse.",
          how: "Receives raw source extracts, resolves inconsistent codes and formats, applies business rules and passes integrated data to the warehouse.",
          tip: "Section B often asks why transformation matters: it is the quality gate that prevents inconsistent reporting." },
        { label: "Data Warehouse|/ Data Marts", x: 340, y: 130, w: 140, h: 100,
          purpose: "Store integrated historical data",
          definition: "A subject-oriented, integrated, time-variant and nonvolatile repository; data marts are focused subsets.",
          how: "Receives cleansed data from ETL, stores history by subject and supplies stable, governed data to analytical tools.",
          tip: "Name the four warehouse characteristics and distinguish dependent from independent marts." },
        { label: "Business Analytics|/ OLAP", x: 500, y: 130, w: 140, h: 100,
          purpose: "Turn stored data into insight",
          definition: "Query, reporting, OLAP, visualisation, statistical and predictive tools used to analyse warehouse data.",
          how: "Receives warehouse data, aggregates and slices it, and passes insight such as trends, exceptions and forecasts to performance management.",
          tip: "Classify the analysis as descriptive, predictive or prescriptive and name the OLAP operations." },
        { label: "BPM /|Dashboards", x: 660, y: 130, w: 140, h: 100,
          purpose: "Monitor strategy and performance",
          definition: "Business performance management, KPIs, scorecards and dashboards that monitor performance against targets.",
          how: "Receives analytical results, compares them with targets and alerts managers to exceptions that require action.",
          tip: "Link dashboards to operational monitoring and scorecards to long-term strategy; know the BPM cycle." },
        { label: "Decision|Makers", x: 820, y: 130, w: 140, h: 100,
          purpose: "Act on the insight",
          definition: "Managers and executives who interpret insight, choose a course of action and are accountable for results.",
          how: "Receives dashboards and analyses, makes a decision, acts and feeds outcomes back into the next intelligence cycle.",
          tip: "BI success is measured by widespread use that improves decisions, not by the number of reports." },
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    },
    {
      id: "simon", short: "Simon + DSS", title: "Simon's Decision Process & DSS Architecture",
      purpose: "Connects the real-world decision problem to the model and then to Simon's four phases, while showing the four DSS subsystems that support the process.",
      when: "Use for questions on Simon's phases, the relationship between reality and a model, or the components of a decision support system.",
      flow: "Reality &rarr; assumption &rarr; model &rarr; Intelligence &rarr; Design &rarr; Choice &rarr; Implementation &rarr; Validation, supported by data, model, knowledge and user-interface subsystems.",
      height: 560, nodes: [
        { label: "Reality", x: 20, y: 80, w: 105, h: 90, purpose: "The real problem situation",
          definition: "The actual business situation, with all its complexity, uncertainty and missing information.",
          how: "Provides the problem context; it cannot be analysed directly, so assumptions simplify it into a model.",
          tip: "A model is a simplification of reality; assumptions are the bridge between them." },
        { label: "Assumption", x: 140, y: 80, w: 105, h: 90, purpose: "Simplify reality for analysis",
          definition: "Statements accepted as true for modelling, such as a stable price or a known growth rate.",
          how: "Receives the complex real situation and selects the factors to include, producing a tractable model.",
          tip: "Sensitivity analysis tests how changes in assumptions affect the recommendation." },
        { label: "Model", x: 260, y: 80, w: 105, h: 90, purpose: "Formal representation of the problem",
          definition: "A simplified quantitative or qualitative representation of the decision problem.",
          how: "Receives assumptions and data, calculates outcomes for alternatives and supplies evidence to the decision phases.",
          tip: "A model is not reality; validation checks whether it represents the problem well enough." },
        { label: "Intelligence", x: 380, y: 80, w: 105, h: 90, purpose: "Identify and define the problem",
          definition: "The first Simon phase: scanning the environment, recognising a problem or opportunity and defining its scope.",
          how: "Receives signals from the model and environment, frames the decision problem and passes it to design.",
          tip: "Do not confuse intelligence with data intelligence; here it means problem diagnosis." },
        { label: "Design", x: 500, y: 80, w: 105, h: 90, purpose: "Generate alternatives and criteria",
          definition: "The second phase: develop possible courses of action and the criteria for comparing them.",
          how: "Receives the problem statement, generates alternatives and evaluation criteria, and passes them to choice.",
          tip: "List at least two alternatives; a single option is not a design phase." },
        { label: "Choice", x: 620, y: 80, w: 105, h: 90, purpose: "Select a course of action",
          definition: "The third phase: evaluate alternatives against the criteria and commit to one.",
          how: "Receives alternatives and criteria, compares expected outcomes and selects the preferred option.",
          tip: "Choice is selection, not implementation; the two are separate marks." },
        { label: "Implementation", x: 740, y: 80, w: 105, h: 90, purpose: "Put the decision into action",
          definition: "The fourth phase: execute the chosen alternative, communicate it and monitor results.",
          how: "Receives the selected alternative, allocates resources, acts and measures outcomes against targets.",
          tip: "Implementation includes monitoring and corrective action, not just announcing the decision." },
        { label: "Validation", x: 860, y: 80, w: 105, h: 90, purpose: "Check the model and outcome",
          definition: "Testing whether the model, assumptions and implemented results still represent reality.",
          how: "Receives actual outcomes, compares them with model predictions and feeds corrections back into assumptions or the model.",
          tip: "Validation closes the loop; without it the organisation may keep using a flawed model." },
        { label: "Data|Management", x: 40, y: 360, w: 200, h: 100, purpose: "Supply organisational data",
          definition: "The DSS database, data directory, DBMS and query facility that store and retrieve decision data.",
          how: "Receives data from internal and external sources, retrieves and organises it, and supplies it to models and the user interface.",
          tip: "Data management supplies the data; it does not execute the forecasting model." },
        { label: "Model|Management", x: 280, y: 360, w: 200, h: 100, purpose: "Hold and execute models",
          definition: "The model base, model directory and MBMS that build, store, integrate and execute analytical models.",
          how: "Receives data and model specifications, runs forecasting or optimisation routines and passes results to the user interface.",
          tip: "If the question mentions a forecasting or LP model, the answer is model management." },
        { label: "Knowledge-Based|Management", x: 520, y: 360, w: 200, h: 100, purpose: "Supply rules and expertise",
          definition: "An optional subsystem holding rules, heuristics, expert knowledge and domain constraints.",
          how: "Receives domain expertise, applies rules to data or model output and advises the user or constrains the solution.",
          tip: "Knowledge-based management is optional and qualitative; it is not the same as the model base." },
        { label: "User|Interface", x: 760, y: 360, w: 200, h: 100, purpose: "Let the manager interact",
          definition: "The presentation and dialogue layer: screens, menus, dashboards and natural-language interaction.",
          how: "Receives user input, sends requests to data and models, and presents results and explanations to the decision maker.",
          tip: "The user interface is the interaction layer, not the analytical engine." },
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
      notes: [{ x: 500, y: 335, text: "DSS ARCHITECTURE \u2014 FOUR SUBSYSTEMS SUPPORTING THE DECISION PROCESS" }],
    },
    {
      id: "dw", short: "DW + ETL", title: "Enterprise Data Warehouse & ETL Pipeline",
      purpose: "Shows how operational systems are integrated into an enterprise warehouse and then served to dependent marts and analytical tools.",
      when: "Use for three-tier warehouse architecture, ETL, staging, metadata, data marts and the flow from ERP/CRM to reporting.",
      flow: "Operational systems &rarr; staging and ETL &rarr; enterprise data warehouse plus metadata &rarr; dependent data marts &rarr; OLAP, reporting and mining.",
      height: 440, nodes: [
        { label: "Operational Systems|ERP / CRM", x: 20, y: 170, w: 170, h: 100, purpose: "Capture source transactions",
          definition: "ERP, CRM and other operational systems that record current business transactions.",
          how: "Capture orders, customers and inventory events and pass raw extracts to the staging area.",
          tip: "Source systems are current and detailed; they are not the historical warehouse." },
        { label: "Staging & ETL", x: 210, y: 170, w: 170, h: 100, purpose: "Cleanse and integrate source data",
          definition: "A temporary landing area plus extract, transform and load processes.",
          how: "Receives raw extracts, cleanses and standardises them, applies business rules and loads transformed data into the warehouse.",
          tip: "Transformation is the quality gate; the staging area is temporary, not a reporting layer." },
        { label: "Enterprise Data|Warehouse + Metadata", x: 400, y: 170, w: 170, h: 100, purpose: "Store integrated history",
          definition: "The central subject-oriented, integrated, time-variant, nonvolatile repository plus metadata describing it.",
          how: "Receives transformed data, stores historical facts and dimensions, and supplies governed data to dependent marts.",
          tip: "Metadata describes definitions, lineage and acquisition rules; it is not the data itself." },
        { label: "Dependent|Data Marts", x: 590, y: 170, w: 170, h: 100, purpose: "Serve departmental subsets",
          definition: "Subject or department-focused subsets created from the enterprise warehouse.",
          how: "Receive governed warehouse data, restrict it to a business area and supply it to departmental analytical tools.",
          tip: "Dependent marts come from the EDW; independent marts come straight from source systems." },
        { label: "OLAP / Reporting|/ Mining", x: 780, y: 170, w: 170, h: 100, purpose: "Analyse and present data",
          definition: "Multidimensional analysis, reports, dashboards and data-mining tools used by analysts and managers.",
          how: "Receive mart or warehouse data, aggregate and explore it, and present insight for decisions.",
          tip: "OLAP operations include slice, dice, drill-down, roll-up and pivot." },
        { label: "Data Governance|& Metadata", x: 400, y: 330, w: 200, h: 80, purpose: "Govern definitions and quality",
          definition: "Ownership, quality rules, access controls and metadata that make warehouse data trustworthy.",
          how: "Sets standards for ETL and warehouse content and records lineage so every figure can be traced.",
          tip: "Governance answers who owns the data and which definition is authoritative." },
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 1, "dashed"], [5, 2, "dashed"]],
    },
    {
      id: "bpm", short: "BPM Cycle", title: "Business Performance Management Closed Loop",
      purpose: "Shows performance management as a continuous loop from strategy to action, linked to KPIs and the Balanced Scorecard.",
      when: "Use for BPM cycle questions, the link between strategy and execution, and the role of KPIs and scorecards.",
      flow: "Strategize &rarr; Plan &rarr; Monitor / Analyse &rarr; Act &amp; Adjust &rarr; back to strategy, with KPIs and the Balanced Scorecard at the centre.",
      height: 500, nodes: [
        { label: "Strategize", x: 410, y: 30, w: 180, h: 85, purpose: "Set vision, objectives and targets",
          definition: "The first BPM stage: define the mission, strategic objectives and the targets that express them.",
          how: "Receives organisational direction, sets goals and KPIs and passes them to planning.",
          tip: "Strategy sets the destination; planning converts it into budgets and initiatives." },
        { label: "Plan", x: 760, y: 210, w: 160, h: 80, purpose: "Translate strategy into plans",
          definition: "The second stage: convert strategic objectives into budgets, initiatives, targets and accountability.",
          how: "Receives strategic goals, allocates resources and sets operational targets for monitoring.",
          tip: "Planning is where KPIs receive concrete target values and owners." },
        { label: "Monitor /|Analyse", x: 410, y: 390, w: 180, h: 85, purpose: "Measure and explain performance",
          definition: "The third stage: collect performance data, compare it with targets and analyse variances.",
          how: "Receives actual results, compares them with plan and explains why performance differs.",
          tip: "Monitoring detects variance; analysis explains its cause before action is taken." },
        { label: "Act &|Adjust", x: 80, y: 210, w: 160, h: 80, purpose: "Take corrective action",
          definition: "The fourth stage: intervene, reallocate resources and adjust plans or targets in response to performance.",
          how: "Receives analysed variances, triggers corrective action and feeds learning back into strategy and planning.",
          tip: "BPM is a closed loop; act and adjust is not the end of the process." },
        { label: "KPIs &|Balanced Scorecard", x: 380, y: 205, w: 240, h: 80, purpose: "Measure strategy across perspectives",
          definition: "KPIs and the four BSC perspectives: financial, customer, internal process, learning and growth.",
          how: "Receives targets and actuals, measures performance across perspectives and signals whether strategy is on track.",
          tip: "Leading KPIs predict; lagging KPIs report results. The BSC balances both." },
      ],
      edges: [
        [0, 1, "M590 72 C690 82 780 130 800 210"],
        [1, 2, "M800 290 C780 360 690 405 590 412"],
        [2, 3, "M410 412 C300 405 220 360 200 290"],
        [3, 0, "M200 210 C220 130 300 82 410 72"],
      ],
    },
    {
      id: "calc", short: "Calc + Web Flow", title: "Descriptive vs Predictive Calculations & Web Analytics Flow",
      purpose: "Contrasts descriptive calculations on known figures with predictive projections, and places web metrics such as CTR, conversion and bounce rate in the analytics flow.",
      when: "Use when asked what a formula element represents, whether a calculation is descriptive or predictive, or how web metrics relate to business outcomes.",
      flow: "Historical inputs (revenue, cost) &rarr; descriptive engine (profit, rates) &rarr; baseline and drivers &rarr; predictive engine (future projection). Web traffic &rarr; clicks &rarr; conversions, with bounce measured at entry.",
      height: 520, nodes: [
        { label: "Historical Inputs|Revenue, Cost", x: 20, y: 70, w: 220, h: 95, purpose: "Known figures from the past or present",
          definition: "Observed values such as actual revenue earned, actual cost incurred, sessions, impressions and conversions.",
          how: "Receives recorded business transactions and passes known figures to the descriptive engine.",
          tip: "If every element is a known figure, the calculation is descriptive." },
        { label: "Descriptive Engine|Profit = Revenue - Cost", x: 250, y: 70, w: 220, h: 95, purpose: "Report what has already happened",
          definition: "Calculations that summarise known performance, such as profit, bounce rate, conversion rate, CTR and engagement rate.",
          how: "Receives known inputs, computes the metric and passes the result as a baseline for interpretation.",
          tip: "Revenue is income before expenses; Cost is total expense; Profit is the difference." },
        { label: "Baseline & Drivers|Trends, rates", x: 480, y: 70, w: 220, h: 95, purpose: "Establish the starting point",
          definition: "The current metric values, growth rates and drivers used as the baseline for projection.",
          how: "Receives descriptive results, identifies trends and assumptions and passes them to the predictive engine.",
          tip: "A growth rate is an assumption, which makes the next calculation predictive." },
        { label: "Predictive Engine|Future Projection", x: 710, y: 70, w: 220, h: 95, purpose: "Project future outcomes",
          definition: "Calculations that estimate future revenue, profit, churn, CLV or conversions from current figures and trends.",
          how: "Receives the baseline and assumptions, applies the projection formula and passes forecast values to planning.",
          tip: "Forecast Revenue and Forecast Cost are projections, not historical actuals." },
        { label: "Impressions|& Traffic", x: 30, y: 340, w: 190, h: 100, purpose: "Count content displays and visits",
          definition: "Impressions are displays of an ad or content; traffic counts visits or sessions.",
          how: "Receives audience exposure and passes impressions and sessions to the click and bounce metrics.",
          tip: "Impressions are not unique people; reach counts unique people." },
        { label: "Clicks (CTR)", x: 270, y: 340, w: 190, h: 100, purpose: "Measure click-through response",
          definition: "Clicks are user responses; CTR = (Clicks / Impressions) x 100.",
          how: "Receives impressions and clicks, computes CTR and passes engaged visitors to conversion analysis.",
          tip: "Clicks are the numerator; impressions are the denominator." },
        { label: "Conversions", x: 510, y: 340, w: 190, h: 100, purpose: "Measure completed goals",
          definition: "Completed desired actions such as purchases or sign-ups; Conversion Rate = (Conversions / Total visitors) x 100.",
          how: "Receives visitors and completed goals, computes the conversion rate and supplies a baseline for projections.",
          tip: "Define the goal; a conversion is not any click." },
        { label: "Bounce /|Single-Page", x: 750, y: 340, w: 190, h: 100, purpose: "Measure early exit",
          definition: "Bounce Rate = (Single-page sessions / Total sessions) x 100.",
          how: "Receives sessions, counts single-page exits and reports the share of visits that leave without further interaction.",
          tip: "Single-page sessions is the numerator; total sessions is the denominator." },
      ],
      edges: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [4, 7], [6, 3, "dashed"]],
    },
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function edgePath(s, t, custom) {
    if (custom) return custom;
    var scx = s.x + s.w / 2, scy = s.y + s.h / 2;
    var tcx = t.x + t.w / 2, tcy = t.y + t.h / 2;
    var dx = tcx - scx, dy = tcy - scy;
    var sx, sy, ex, ey;
    if (Math.abs(dx) >= Math.abs(dy)) {
      sx = s.x + (dx > 0 ? s.w : 0); sy = scy;
      ex = t.x + (dx > 0 ? 0 : t.w); ey = tcy;
    } else {
      sx = scx; sy = s.y + (dy > 0 ? s.h : 0);
      ex = tcx; ey = t.y + (dy > 0 ? 0 : t.h);
    }
    return "M" + sx + " " + sy + " L" + ex + " " + ey;
  }

  function svgFor(d, quiz, selected) {
    var out = '<svg class="dgm-svg" viewBox="0 0 1000 ' + d.height + '" role="img" aria-label="' + esc(d.title) + '">';
    out += '<defs><marker id="arw-' + d.id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 z" class="dgm-arrowhead"/></marker></defs>';
    d.edges.forEach(function (e) {
      var s = d.nodes[e[0]], t = d.nodes[e[1]];
      out += '<path class="dgm-edge' + (e[2] === "dashed" ? " dashed" : "") + '" d="' + edgePath(s, t, e[2] && e[2] !== "dashed" ? e[2] : null) + '" marker-end="url(#arw-' + d.id + ')"/>';
    });
    d.nodes.forEach(function (n, i) {
      var lines = n.label.split("|");
      var startY = n.y + n.h / 2 - (lines.length - 1) * 7 + 4;
      var label = quiz ? "[ ? #" + (i + 1) + " ]" : lines.map(function (l) { return esc(l); }).join("|");
      var shown = quiz ? label : lines.map(function (l) { return '<tspan x="' + (n.x + n.w / 2) + '" dy="' + (lines.indexOf(l) === 0 ? 0 : 15) + '">' + esc(l) + "</tspan>"; }).join("");
      out += '<g class="dgm-node' + (quiz ? " masked" : "") + (selected === i ? " sel" : "") + '" data-node="' + i + '" tabindex="0" role="button">' +
        '<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="9"/>' +
        '<circle class="dgm-num" cx="' + (n.x + 16) + '" cy="' + (n.y + 16) + '" r="10"/>' +
        '<text class="dgm-numtxt" x="' + (n.x + 16) + '" y="' + (n.y + 20) + '">' + (i + 1) + '</text>' +
        (quiz
          ? '<text class="dgm-label" x="' + (n.x + n.w / 2) + '" y="' + (n.y + n.h / 2 + 4) + '" text-anchor="middle">' + esc(label) + '</text>'
          : '<text class="dgm-label" x="' + (n.x + n.w / 2) + '" y="' + startY + '" text-anchor="middle">' + shown + '</text>') +
        '</g>';
    });
    (d.notes || []).forEach(function (note) {
      out += '<text class="dgm-note" x="' + note.x + '" y="' + note.y + '" text-anchor="middle">' + esc(note.text) + "</text>";
    });
    out += "</svg>";
    return out;
  }

  function renderD1() {
    var M = window.BSIT, D = M.data;
    var art = M.el('<article class="sheet" data-sheet="D-01"></article>');
    var state = { idx: 0, quiz: false, selected: null, answers: {} };

    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">D &middot; Architecture &amp; diagrams</span><h1>Interactive Diagram Lab</h1>' +
      '<p class="lede">Five exam-ready architecture diagrams. Click any node to inspect what it is, how it works in the flow, and how it is examined. Switch to fill-in-the-blank mode for active recall.</p></div>' +
      '<div class="sheet-meta"><span class="label">Diagrams</span><span class="big">5</span><span class="label">interactive SVG models</span></div></div>' +
      '<div class="sheet-body">' +
      '<div class="dgm-tabs" data-tabs></div>' +
      '<div class="dgm-purpose" data-purpose></div>' +
      '<div class="dgm-toolbar"><span class="pill" data-mode-label>Mode: Inspect</span>' +
      '<button class="btn small primary" data-mode>Mode: Inspect</button>' +
      '<span class="pill" data-score>Fill-in score: 0 / 0</span>' +
      '<button class="btn small ghost" data-reset-quiz>Reset quiz</button></div>' +
      '<div class="dgm-stage"><div class="dgm-canvas" data-svg></div>' +
      '<aside class="dgm-inspect" data-inspect><span class="label">Node inspection</span><p class="muted">Click any box on the diagram to inspect its role, inputs, outputs and exam tip.</p></aside></div>' +
      '<div class="dgm-quiz hidden" data-quiz></div>' +
      '</div>';

    var tabs = art.querySelector("[data-tabs]");
    var purpose = art.querySelector("[data-purpose]");
    var svgHost = art.querySelector("[data-svg]");
    var inspect = art.querySelector("[data-inspect]");
    var quizHost = art.querySelector("[data-quiz]");
    var modeBtn = art.querySelector("[data-mode]");
    var modeLabel = art.querySelector("[data-mode-label]");
    var scoreEl = art.querySelector("[data-score]");

    tabs.innerHTML = DIAGRAMS.map(function (d, i) {
      return '<button class="dgm-tab" data-dgm="' + i + '" aria-pressed="false">' + (i + 1) + " &middot; " + esc(d.short) + "</button>";
    }).join("");

    function current() { return DIAGRAMS[state.idx]; }

    function renderInspect() {
      var d = current();
      if (state.quiz) {
        inspect.innerHTML = '<span class="label">Fill-in-the-Blank Mode</span><p class="muted">Node names are masked. Identify slot #' + (state.selected != null ? state.selected + 1 : "n") + ' using the quiz below. Switch back to Inspect to reveal the answer.</p>';
        return;
      }
      if (state.selected == null) {
        inspect.innerHTML = '<span class="label">Node inspection</span><p class="muted">Click any box on the diagram to inspect its role, inputs, outputs and exam tip.</p>';
        return;
      }
      var n = d.nodes[state.selected];
      inspect.innerHTML = '<span class="label">Node #' + (state.selected + 1) + " &middot; " + esc(d.short) + '</span>' +
        '<h3>' + esc(n.label.replace("|", " ")) + '</h3>' +
        '<div class="dgm-inspect-block"><span class="label">What this component is</span><p>' + esc(n.definition) + '</p></div>' +
        '<div class="dgm-inspect-block"><span class="label">How it works inside this diagram</span><p>' + esc(n.how) + '</p></div>' +
        '<div class="dgm-inspect-block tip"><span class="label">Exam tip</span><p>' + esc(n.tip) + '</p></div>';
    }

    function renderQuiz() {
      var d = current();
      var answers = state.answers;
      scoreEl.textContent = "Fill-in score: " + Object.keys(answers).filter(function (k) {
        var a = answers[k];
        return a && a.name === d.nodes[Number(k)].label && a.purpose === d.nodes[Number(k)].purpose;
      }).length + " / " + d.nodes.length;
      if (!state.quiz) { quizHost.classList.add("hidden"); quizHost.innerHTML = ""; return; }
      quizHost.classList.remove("hidden");
      var names = d.nodes.map(function (n) { return n.label; });
      var purposes = d.nodes.map(function (n) { return n.purpose; });
      quizHost.innerHTML = '<div class="dgm-quiz-head"><div><span class="label">Active recall</span><h3>Match each masked slot to its component and purpose</h3>' +
        '<p class="muted">Choose a component name and its purpose. Each row is marked instantly.</p></div><span class="pill" data-quiz-score>0 / ' + d.nodes.length + ' full matches</span></div>' +
        '<div class="dgm-quiz-grid">' + d.nodes.map(function (n, i) {
          var saved = answers[i] || {};
          return '<div class="dgm-qrow" data-row="' + i + '"><span class="dgm-qmask">[ ? #' + (i + 1) + ' ]</span>' +
            '<select data-qname="' + i + '"><option value="">Component name&hellip;</option>' +
            names.map(function (x) { return '<option value="' + esc(x) + '"' + (saved.name === x ? " selected" : "") + '>' + esc(x.replace("|", " ")) + '</option>'; }).join("") + '</select>' +
            '<select data-qpurpose="' + i + '"><option value="">Purpose&hellip;</option>' +
            purposes.map(function (x) { return '<option value="' + esc(x) + '"' + (saved.purpose === x ? " selected" : "") + '>' + esc(x) + '</option>'; }).join("") + '</select>' +
            '<span class="fb" data-qv></span></div>';
        }).join("") + '</div>';

      function updateScore() {
        var full = 0;
        d.nodes.forEach(function (n, i) {
          var a = answers[i];
          if (a && a.name === n.label && a.purpose === n.purpose) full++;
        });
        var pill = quizHost.querySelector("[data-quiz-score]");
        if (pill) pill.textContent = full + " / " + d.nodes.length + " full matches";
        scoreEl.textContent = "Fill-in score: " + full + " / " + d.nodes.length;
      }

      quizHost.querySelectorAll("[data-qname]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          var i = Number(sel.getAttribute("data-qname"));
          answers[i] = answers[i] || {};
          answers[i].name = sel.value;
          verify(i);
        });
      });
      quizHost.querySelectorAll("[data-qpurpose]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          var i = Number(sel.getAttribute("data-qpurpose"));
          answers[i] = answers[i] || {};
          answers[i].purpose = sel.value;
          verify(i);
        });
      });
      function verify(i) {
        var n = d.nodes[i];
        var a = answers[i] || {};
        var row = quizHost.querySelector('[data-row="' + i + '"]');
        var v = row.querySelector("[data-qv]");
        if (!a.name || !a.purpose) { v.className = "fb"; v.textContent = ""; return; }
        var okName = a.name === n.label, okPurpose = a.purpose === n.purpose;
        row.classList.toggle("ok", okName && okPurpose);
        row.classList.toggle("no", !(okName && okPurpose));
        v.className = "fb " + (okName && okPurpose ? "ok" : "no");
        v.textContent = okName && okPurpose ? "\u2713 Both correct" : (okName ? "\u2717 Name right, purpose wrong" : okPurpose ? "\u2717 Purpose right, name wrong" : "\u2717 Both wrong");
        updateScore();
      }
      Object.keys(answers).forEach(function (k) { verify(Number(k)); });
    }

    function render() {
      var d = current();
      tabs.querySelectorAll("[data-dgm]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-dgm")) === state.idx));
      });
      purpose.innerHTML = '<div class="dgm-purpose-head"><span class="label">Overall purpose of this diagram</span><h3>' + esc(d.title) + '</h3></div>' +
        '<p class="dgm-purpose-main">' + esc(d.purpose) + '</p>' +
        '<div class="dgm-purpose-cols"><div><span class="label">When it is used</span><p>' + esc(d.when) + '</p></div>' +
        '<div><span class="label">How to explain the flow in a written answer</span><p>' + d.flow + '</p></div></div>';
      svgHost.innerHTML = svgFor(d, state.quiz, state.selected);
      modeLabel.textContent = state.quiz ? "Mode: Fill-in-the-Blank Quiz" : "Mode: Inspect";
      modeBtn.textContent = state.quiz ? "Back to Inspect mode" : "Switch to Fill-in-the-Blank quiz";
      modeBtn.setAttribute("aria-pressed", String(state.quiz));
      svgHost.querySelectorAll("[data-node]").forEach(function (g) {
        function choose() {
          state.selected = Number(g.getAttribute("data-node"));
          svgHost.innerHTML = svgFor(d, state.quiz, state.selected);
          bindNodes();
          renderInspect();
        }
        g.addEventListener("click", choose);
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(); } });
      });
      renderInspect();
      renderQuiz();
    }
    function bindNodes() { render(); }

    tabs.querySelectorAll("[data-dgm]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.idx = Number(b.getAttribute("data-dgm"));
        state.selected = null; state.answers = {}; state.quiz = false;
        render();
      });
    });
    modeBtn.addEventListener("click", function () { state.quiz = !state.quiz; state.selected = null; render(); });
    art.querySelector("[data-reset-quiz]").addEventListener("click", function () {
      state.answers = {}; state.quiz = true; render(); M.toast("Fill-in quiz reset");
    });

    render();
    return art;
  }

  window.BSIT_RENDER.d1 = renderD1;
})();
