/* =========================================================================
   BSIT301 Study Suite — shell, routing, study sheets, mind map
   ========================================================================= */
(function () {
  "use strict";
  var D = window.BSIT_DATA;
  if (!D) { document.body.innerHTML = "<p style='padding:2rem'>Data file failed to load.</p>"; return; }

  /* ------------------------------------------------------------ storage */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("bsit301-" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("bsit301-" + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ------------------------------------------------------------ helpers */
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }
  function toast(msg) {
    var t = document.querySelector(".toast"); if (!t) { t = el('<div class="toast"></div>'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }
  window.BSIT = { store: store, esc: esc, shuffle: shuffle, el: el, toast: toast, data: D };

  /* ------------------------------------------------------------ sheet registry */
  var SHEETS = [];
  function reg(o) { SHEETS.push(o); return o; }

  reg({ code: "A-00", group: "A \u00b7 Brief", title: "Exam brief & method", render: renderBrief });
  D.chapters.forEach(function (c) {
    reg({ code: "C-0" + c.no, group: "C \u00b7 Study sheets", title: c.title, chapter: c.no, render: function () { return renderChapter(c.no); } });
  });
  reg({ code: "M-01", group: "M \u00b7 Mind map", title: "Interactive mind map", render: renderMindmap });
  reg({ code: "D-01", group: "D \u00b7 Architecture & Diagrams", title: "Interactive Diagram Lab", render: lazy("d1") });
  function lazy(name) { return function () { return window.BSIT_RENDER[name](); }; }
  reg({ code: "Q-01", group: "Q \u00b7 Section A", title: "MCQ Simulator (40 Marks)", render: lazy("q1") });
  D.sectionB.forEach(function (q) {
    var mk = typeof q.marks === "number" ? q.marks + "m" : "Extension";
    var label = typeof q.marks === "number" ? q.label : "EXT";
    reg({ code: q.code, group: "Q \u00b7 Section B", title: label + " \u00b7 " + q.title + " (" + mk + ")", render: lazy("s" + q.no) });
  });
  reg({ code: "E-01", group: "E \u00b7 Exam prep", title: "Past Paper Drill Bank", render: lazy("e1") });
  reg({ code: "P-03", group: "P \u00b7 Recall", title: "Flashcards", render: lazy("p3") });

  function sheetByCode(code) { return SHEETS.filter(function (s) { return s.code === code; })[0]; }
  function idxOf(code) { return SHEETS.map(function (s) { return s.code; }).indexOf(code); }

  /* ------------------------------------------------------------ nav */
  function buildNav() {
    var nav = document.getElementById("index");
    var html = "", lastGroup = "";
    SHEETS.forEach(function (s) {
      if (s.group !== lastGroup) {
        lastGroup = s.group;
        var groupCodes = SHEETS.filter(function (x) { return x.group === s.group; }).map(function (x) { return x.code; });
        html += '<div class="index-group"><div class="label">' + esc(s.group) + '<span data-count="' + s.group + '"></span></div>';
      }
      html += '<a href="#' + s.code + '" data-nav="' + s.code + '" class=""><span class="no">' + s.code +
        '</span><span>' + esc(s.title) + '</span><svg class="tick" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2"></path></svg></a>';
      var next = SHEETS[SHEETS.indexOf(s) + 1];
      if (!next || next.group !== s.group) html += "</div>";
    });
    nav.innerHTML = html;
  }

  function updateProgress() {
    var reviewed = store.get("reviewed", []);
    var total = SHEETS.length;
    document.getElementById("tbProgress").textContent = reviewed.length + " / " + total;
    var best = store.get("best", null);
    document.getElementById("tbBest").textContent = best ? best.score + " / " + best.out + " \u00b7 " + best.when : "\u2014";
    SHEETS.forEach(function (s) {
      var a = document.querySelector('[data-nav="' + s.code + '"]');
      if (a) a.classList.toggle("done", reviewed.indexOf(s.code) >= 0);
    });
    SHEETS.forEach(function (s, i) {
      // group counts
    });
    document.querySelectorAll(".index-group").forEach(function (g) {
      var codes = Array.prototype.map.call(g.querySelectorAll("[data-nav]"), function (a) { return a.getAttribute("data-nav"); });
      var done = codes.filter(function (c) { return reviewed.indexOf(c) >= 0; }).length;
      var span = g.querySelector("[data-count]");
      if (span) span.textContent = done + "/" + codes.length;
    });
  }
  window.BSIT.updateProgress = updateProgress;

  /* ------------------------------------------------------------ router */
  var current = null;
  function go(code) {
    if (!sheetByCode(code)) code = "A-00";
    var s = sheetByCode(code);
    current = code;
    var main = document.getElementById("main");
    main.innerHTML = "";
    main.appendChild(s.render());
    buildFooter(s);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    document.querySelectorAll("[data-nav]").forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === code); });
    document.getElementById("index").classList.remove("open");
    if (typeof syncMenuState === "function") syncMenuState();
    document.title = code + " \u00b7 " + s.title + " \u00b7 BSIT301";
    wireWidgets(main);
    if (window.BSIT.onSheet) window.BSIT.onSheet(code, main);
  }
  window.BSIT.go = go;

  function buildFooter(s) {
    var i = idxOf(s.code), prev = SHEETS[i - 1], next = SHEETS[i + 1];
    var foot = el('<footer class="sheet-foot"></footer>');
    foot.appendChild(el('<button class="foot-nav" ' + (prev ? 'data-go="' + prev.code + '"' : "disabled") + '><span class="label">\u2190 Previous' + (prev ? " \u00b7 " + prev.code : "") + '</span><b>' + (prev ? esc(prev.title) : "\u2014") + "</b></button>"));
    var mid = el('<div class="foot-mid"><button class="stamp-btn" data-stamp aria-pressed="false">Stamp as reviewed</button></div>');
    var b = mid.querySelector("button");
    var reviewed = store.get("reviewed", []);
    if (reviewed.indexOf(s.code) >= 0) { b.setAttribute("aria-pressed", "true"); b.textContent = "\u2713 Reviewed"; }
    b.addEventListener("click", function () {
      var r = store.get("reviewed", []); var i2 = r.indexOf(s.code);
      if (i2 >= 0) { r.splice(i2, 1); b.setAttribute("aria-pressed", "false"); b.textContent = "Stamp as reviewed"; }
      else { r.push(s.code); b.setAttribute("aria-pressed", "true"); b.textContent = "\u2713 Reviewed"; }
      store.set("reviewed", r); updateProgress();
    });
    foot.appendChild(mid);
    foot.appendChild(el('<button class="foot-nav next" ' + (next ? 'data-go="' + next.code + '"' : "disabled") + '><span class="label">Next' + (next ? " \u00b7 " + next.code : "") + ' \u2192</span><b>' + (next ? esc(next.title) : "\u2014") + "</b></button>"));
    document.getElementById("main").appendChild(foot);
  }

  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (g) { location.hash = "#" + g.getAttribute("data-go"); return; }
    var nav = e.target.closest("[data-nav]"); if (nav && nav.getAttribute("href")) { /* let hash handle */ }
  });

  function onHash() {
    var code = (location.hash || "#A-00").replace(/^#/, "");
    go(code);
  }
  window.addEventListener("hashchange", onHash);

  /* ------------------------------------------------------------ theme */
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-btn") === t)); });
    store.set("theme", t);
  }
  document.querySelectorAll("[data-theme-btn]").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme-btn")); });
  });
  setTheme(store.get("theme", "dark"));

  /* ------------------------------------------------ aesthetic switcher */
  var AESTHETICS = [
    { id: "obsidian", name: "Obsidian", desc: "Warm distraction-free canvas (default)", dots: ["#18191c", "#f59e0b", "#e9e6e2"] },
    { id: "blueprint", name: "Blueprint", desc: "Architectural drafting set", dots: ["#132944", "#4cc2ff", "#9ec1e6"] },
    { id: "linear", name: "Linear", desc: "Minimalist charcoal & indigo", dots: ["#0a0a0c", "#6366f1", "#a855f7"] },
    { id: "terminal", name: "Terminal", desc: "Cyber-brutalist phosphor HUD", dots: ["#050505", "#00ff66", "#ffb000"] },
    { id: "arcade", name: "Arcade", desc: "Gamified, playful & tactile", dots: ["#15172b", "#10b981", "#ff4757"] }
  ];
  var DEFAULT_AESTHETIC = "obsidian";
  function readAesthetic() {
    try { var v = localStorage.getItem("bsit_aesthetic"); return v && AESTHETICS.some(function (a) { return a.id === v; }) ? v : DEFAULT_AESTHETIC; }
    catch (e) { return DEFAULT_AESTHETIC; }
  }
  function setAesthetic(id) {
    if (!AESTHETICS.some(function (a) { return a.id === id; })) id = DEFAULT_AESTHETIC;
    document.documentElement.setAttribute("data-aesthetic", id);
    try { localStorage.setItem("bsit_aesthetic", id); } catch (e) {}
    document.querySelectorAll(".theme-opt").forEach(function (o) { o.classList.toggle("active", o.getAttribute("data-aesthetic-opt") === id); });
  }
  window.BSIT.setAesthetic = setAesthetic;

  var themeBtn = document.getElementById("themeBtn");
  var themeMenu = document.getElementById("themeMenu");
  if (themeBtn && themeMenu) {
    var menu = '<div class="tm-head">Design aesthetic</div>';
    AESTHETICS.forEach(function (a) {
      menu += '<button type="button" class="theme-opt" data-aesthetic-opt="' + a.id + '" role="menuitem">' +
        '<span class="theme-dots">' + a.dots.map(function (c) { return '<span class="dot" style="background:' + c + '"></span>'; }).join("") + "</span>" +
        '<span class="tm-meta"><span class="tm-name">' + esc(a.name) + '</span><span class="tm-desc">' + esc(a.desc) + "</span></span>" +
        '<span class="tm-tick">\u2713</span></button>';
    });
    themeMenu.innerHTML = menu;
    themeMenu.querySelectorAll("[data-aesthetic-opt]").forEach(function (o) {
      o.addEventListener("click", function () { setAesthetic(o.getAttribute("data-aesthetic-opt")); closeMenu(); });
    });
    function openMenu() { themeMenu.classList.add("open"); themeBtn.setAttribute("aria-expanded", "true"); }
    function closeMenu() { themeMenu.classList.remove("open"); themeBtn.setAttribute("aria-expanded", "false"); }
    themeBtn.addEventListener("click", function (e) { e.stopPropagation(); themeMenu.classList.contains("open") ? closeMenu() : openMenu(); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".theme-picker")) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    setAesthetic(readAesthetic());
  }

  /* ------------------------------------------------------------ menu + search */
  var SIDEBAR_KEY = "bsit_sidebar_collapsed";
  var desktopMq = window.matchMedia("(min-width: 961px)");
  var menuBtn = document.getElementById("menuBtn");
  var indexEl = document.getElementById("index");

  function sidebarIsCollapsed() {
    try { return localStorage.getItem(SIDEBAR_KEY) === "1"; } catch (e) { return false; }
  }
  function syncMenuState() {
    if (!menuBtn) return;
    var expanded = desktopMq.matches ? !sidebarIsCollapsed() : indexEl.classList.contains("open");
    menuBtn.setAttribute("aria-expanded", String(expanded));
    menuBtn.title = desktopMq.matches ? (expanded ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)") : "Open drawing index";
    menuBtn.setAttribute("aria-label", menuBtn.title);
  }
  function setSidebarCollapsed(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    try { localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0"); } catch (e) {}
    syncMenuState();
  }
  function toggleSidebar() {
    if (desktopMq.matches) {
      var next = !document.body.classList.contains("sidebar-collapsed");
      setSidebarCollapsed(next);
      toast(next ? "Sidebar collapsed \u2014 Ctrl+B or [ to reopen" : "Sidebar expanded");
    } else {
      indexEl.classList.toggle("open");
      syncMenuState();
    }
  }

  document.body.classList.toggle("sidebar-collapsed", sidebarIsCollapsed());
  menuBtn.title = "Toggle sidebar (Ctrl+B)";
  syncMenuState();
  menuBtn.addEventListener("click", toggleSidebar);
  if (desktopMq.addEventListener) desktopMq.addEventListener("change", syncMenuState);
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toUpperCase();
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault(); toggleSidebar();
    } else if (e.key === "[" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); toggleSidebar();
    }
  });

  var searchInput = document.getElementById("search");
  var searchResults = document.getElementById("searchResults");
  function doSearch(q) {
    q = q.trim().toLowerCase();
    var out = [];
    if (!q) { searchResults.classList.remove("open"); return; }
    SHEETS.forEach(function (s) {
      if (s.title.toLowerCase().indexOf(q) >= 0 || s.code.toLowerCase().indexOf(q) >= 0)
        out.push({ code: s.code, title: s.title, code2: s.code });
    });
    D.mindmap.forEach(function (ch) {
      ch.groups.forEach(function (grp) {
        grp.nodes.forEach(function (n) {
          if (n.title.toLowerCase().indexOf(q) >= 0) out.push({ code: "M-01", title: n.title, code2: "MM \u00b7 CH" + ch.no, node: n.title });
        });
      });
    });
    D.mcqs.forEach(function (m) {
      if (m.q.toLowerCase().indexOf(q) >= 0) out.push({ code: "Q-01", title: m.q, code2: m.source });
    });
    out = out.slice(0, 24);
    searchResults.innerHTML = out.length ? out.map(function (o) {
      return '<a href="#' + o.code + '" data-search-node="' + esc(o.node || "") + '"><span class="sr-code">' + esc(o.code2) + "</span>" + esc(o.title.slice(0, 90)) + "</a>";
    }).join("") : '<div class="empty">No matches.</div>';
    searchResults.classList.add("open");
  }
  searchInput.addEventListener("input", function () { doSearch(searchInput.value); });
  searchInput.addEventListener("focus", function () { if (searchInput.value) doSearch(searchInput.value); });
  searchResults.addEventListener("click", function (e) {
    var a = e.target.closest("a"); if (!a) return;
    var node = a.getAttribute("data-search-node");
    if (node) window.BSIT.pendingNode = node;
    searchResults.classList.remove("open"); searchInput.value = "";
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrap")) searchResults.classList.remove("open");
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchInput.focus(); }
    if (e.key === "Escape") searchResults.classList.remove("open");
  });

  /* =================================================================
     SHEET RENDERERS
     ================================================================= */
  function metaFor(chapter) {
    var pos = D.chapters.map(function (c) { return c.no; }).indexOf(chapter) + 1;
    return { no: chapter, pos: pos, total: CHAPTERS_TOTAL() };
  }
  function CHAPTERS_TOTAL() { return D.chapters.length; }

  /* -------- A-00 brief ---------------------------------------------- */
  function renderBrief() {
    var e = D.exam;
    var coreMarks = D.sectionB.reduce(function (a, q) { return a + (typeof q.marks === "number" ? q.marks : 0); }, 0);
    var codes = D.chapters.map(function (c) { return "C-0" + c.no; }).join(", ");
    var art = el('<article class="sheet" data-sheet="A-00"></article>');
    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">A \u00b7 Brief</span><h1>Business Intelligence (BSIT301) \u2014 100-Mark Exam Method</h1>' +
      '<p class="lede">The current scope: <strong>Section A</strong> is 40 one-mark MCQs across Chapters 1, 2, 3, 4 and 6, and <strong>Section B</strong> is 60 marks of long-form explanation through Q1 and Q2 on Chapters 1&ndash;3.</p></div>' +
      '<div class="sheet-meta"><span class="label">Paper</span><span class="big">' + esc(e.total) + '</span><span class="label">marks \u00b7 ' + esc(e.sectionA.marks) + ' + ' + esc(e.sectionB.marks) + '</span></div></div>' +
      '<div class="sheet-body">' +

      '<section class="block"><h2>Section A \u00b7 [' + esc(e.sectionA.marks) + ' marks]</h2><div class="cols-2">' +
      '<div class="prose"><p><mark>' + esc(e.sectionA.desc) + '</mark> The pattern repeats across earlier tests, so source tags matter: every question is labelled Test 1, Test 2, 2023 Main, 2024 Main, 2026 Main or Lecture Deck.</p>' +
      '<p>The tested chapter sheets are <strong>' + codes + '</strong>. Each ends with a <em>TRY IT</em> check. Chapter 6 also contains the calculation element lab: descriptive calculations use known figures; predictive calculations project future outcomes from current figures and trends.</p></div>' +
      '<div class="panel fill"><span class="label">Tested chapters</span><ul>' +
      D.chapters.map(function (c) { return '<li><strong>C-0' + c.no + '</strong> ' + esc(c.title) + '</li>'; }).join("") +
      '</ul><p class="muted small">Chapter 6 calculations are examinable in Section A and in the Q-04 extension.</p></div></div></section>' +

      '<section class="block"><h2>Section B \u00b7 [' + esc(e.sectionB.marks) + ' marks]</h2><div class="cols-2">' +
      '<div class="prose"><p><strong>Q1 [30]</strong> tests Chapters 1&ndash;2 through five 6-mark sub-questions. <strong>Q2 [30]</strong> tests Chapter 3 through five sub-questions worth 7, 6, 6, 6 and 5 marks.</p>' +
      '<p>Write in the answer box first, reveal the step-by-step model answer, then use the self-mark chips. The chips add up to the full 60. <strong>Q-04</strong> is an extension workbench for cross-chapter synthesis and Chapter 6 element meanings.</p></div>' +
      '<div class="panel fill" style="border-color:var(--warn)"><span class="label">Question map \u00b7 ' + coreMarks + ' core marks</span><ul>' +
      D.sectionB.map(function (q) { return '<li><strong>' + esc(q.label) + ' &middot; ' + esc(q.code) + ' [' + (typeof q.marks === "number" ? q.marks : "Extra") + ']</strong> ' + esc(q.title) + '</li>'; }).join("") +
      '</ul></div></div>' +
      '<div class="review"><span class="label">Chapter 6 calculation rule</span><p>' + esc(e.calcNote) + '</p></div></section>' +

      '<section class="block"><h2>How to use this app</h2><div class="cols-2">' +
      '<div class="panel"><span class="label">1 \u00b7 Study</span><p>Work through <strong>' + codes + '</strong>. Tick <em>Stamp as reviewed</em> and finish each sheet with its TRY IT widget. C-06 now carries the formula-element lab.</p></div>' +
      '<div class="panel"><span class="label">2 \u00b7 Diagrams</span><p><strong>D-01</strong> is a five-diagram interactive lab: BI architecture, Simon and DSS, enterprise DW and ETL, the BPM loop, and the descriptive-vs-predictive calculation flow. Click nodes or switch to fill-in-the-blank mode.</p></div>' +
      '<div class="panel"><span class="label">3 \u00b7 Practise</span><p><strong>Q-01</strong> is the 40-mark MCQ simulator with a 40-bubble shading card. <strong>Q-02</strong> and <strong>Q-03</strong> are the 30-mark workbenches, <strong>Q-04</strong> is the extension, and <strong>E-01</strong> is the filterable drill arena.</p></div>' +
      '<div class="panel"><span class="label">4 \u00b7 Recall</span><p><strong>M-01</strong> the mind map and <strong>P-03</strong> the flashcard deck cover the same tested chapters. Use the search box or the collapsible index to jump between them.</p></div>' +
      '</div></section>' +

      '</div>';
    return art;
  }

  /* -------- C-0n chapter -------------------------------------------- */
  function renderChapter(no) {
    var s = D.studySheets[String(no)];
    var code = "C-0" + no;
    var meta = metaFor(no);
    var art = el('<article class="sheet" data-sheet="' + code + '"></article>');
    var h = '<div class="sheet-head"><div><span class="label">C \u00b7 Study sheet</span><h1>' + esc(s.title) + '</h1>' +
      '<p class="lede">' + s.lede + '</p></div>' +
      '<div class="sheet-meta"><span class="label">Sheet</span><span class="big">' + code + '</span><span class="label">Chapter ' + meta.no + ' &middot; tested ' + meta.pos + ' of ' + meta.total + '</span></div></div>';
    h += '<div class="sheet-body">';
    h += '<div class="keyterms">' + s.subtopics.map(function (t) { return '<span class="kt"><b>Topic</b>' + esc(t) + "</span>"; }).join("") + "</div>";

    s.blocks.forEach(function (b) {
      h += '<section class="block">';
      if (b.heading) h += "<h2>" + esc(b.heading) + "</h2>";
      if (b.kind === "cols") {
        h += '<div class="cols-2">';
        if (b.left) h += panelHtml(b.left);
        if (b.right) h += panelHtml(b.right);
        h += "</div>";
      } else if (b.kind === "table") {
        h += '<div class="panel fill"><table><thead><tr>' + b.headers.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
          b.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
      }
      h += "</section>";
    });

    h += '<section class="block"><h2>Key terms</h2><div class="keyterms">' +
      s.keyTerms.map(function (k) { return '<span class="kt"><b>' + esc(k[0]) + "</b>" + esc(k[1]) + "</span>"; }).join("") + "</div></section>";
    h += '<div class="review"><span class="label">' + esc(s.review.label) + "</span><p>" + s.review.text + "</p></div>";
    h += '<div data-widget-host></div>';
    h += "</div>";
    art.innerHTML = h;
    return art;
  }
  function panelHtml(p) {
    var inner;
    if (p.html) inner = p.html;
    else if (Array.isArray(p.items)) inner = "<ul>" + p.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>";
    else inner = p.items || "";
    return '<div class="panel' + (p.items && !p.html ? " fill" : "") + '"><span class="label">' + esc(p.label) + "</span>" + inner + "</div>";
  }

  /* -------- widgets ------------------------------------------------- */
  function wireWidgets(scope) {
    scope.querySelectorAll("[data-widget-host]").forEach(function (host) {
      var code = host.closest(".sheet").getAttribute("data-sheet") || "";
      var s = D.studySheets[String(Number(String(code).replace(/\D/g, "")))];
      if (s && s.widget) host.appendChild(buildWidget(s.widget));
    });
  }
  function buildWidget(w) {
    var wrap = el('<div class="widget"></div>');
    if (w.type === "sorter") return buildSorter(w, wrap);
    if (w.type === "sequence") return buildSequence(w, wrap);
    if (w.type === "calc" && window.BSIT_CALC && D.calcLab) {
      wrap.classList.add("widget-calc");
      wrap.appendChild(el('<div class="widget-head"><span class="label">' + esc(w.prompt || "Calculation lab") + '</span><span class="pill">C-06 &middot; element meanings</span></div>'));
      var body = el('<div class="widget-body calc-widget-body"></div>');
      wrap.appendChild(body);
      window.BSIT_CALC.mount(body, D.calcLab);
      return wrap;
    }
    return wrap;
  }

  function buildSorter(w, wrap) {
    var sides = [w.left, w.right].concat(w.extra || []);
    var cards = shuffle(w.cards);
    var i = 0, score = 0;
    wrap.innerHTML = '<div class="widget-head"><span class="label">' + esc(w.prompt) + '</span><span class="label" data-score>0 / ' + cards.length + "</span></div>" +
      '<div class="widget-body"><p class="label center" data-progress></p>' +
      '<div class="sorter-card" data-card></div>' +
      '<div class="sorter-actions"></div>' +
      '<div class="fb" data-fb style="max-width:60ch;margin:.6rem auto 0"></div></div>';
    var act = wrap.querySelector(".sorter-actions");
    sides.forEach(function (side) {
      var b = el('<button class="btn">' + esc(side) + "</button>");
      b.addEventListener("click", function () { answer(side, b); });
      act.appendChild(b);
    });
    function show() {
      var c = cards[i];
      wrap.querySelector("[data-progress]").textContent = "Card " + (i + 1) + " of " + cards.length;
      wrap.querySelector("[data-card]").innerHTML = c.text;
      wrap.querySelector("[data-fb]").textContent = "";
      wrap.querySelector("[data-fb]").className = "fb";
    }
    function answer(side) {
      var c = cards[i];
      var fb = wrap.querySelector("[data-fb]");
      if (side === c.side) { score++; fb.className = "fb ok"; fb.textContent = "\u2713 Correct \u2014 " + c.side; }
      else { fb.className = "fb no"; fb.textContent = "\u2717 It is " + c.side; }
      wrap.querySelector("[data-score]").textContent = score + " / " + cards.length;
      i++;
      setTimeout(function () {
        if (i >= cards.length) {
          wrap.querySelector("[data-card]").textContent = "Round complete \u2014 " + score + " / " + cards.length + (score === cards.length ? " \u00b7 Perfect!" : "");
          wrap.querySelector("[data-progress]").textContent = "";
          wrap.querySelector(".sorter-actions").innerHTML = '<button class="btn primary" data-again>Shuffle &amp; retry</button>';
          wrap.querySelector("[data-again]").addEventListener("click", function () { var fresh = buildWidget(w); wrap.replaceWith(fresh); });
        } else show();
      }, 620);
    }
    show();
    return wrap;
  }

  function buildSequence(w, wrap) {
    var correct = w.steps;
    var pool = shuffle(correct);
    var slots = [];
    wrap.innerHTML = '<div class="widget-head"><span class="label">' + esc(w.prompt) + '</span><button class="btn small" data-check>Check order</button></div>' +
      '<div class="widget-body seq-track"><div class="seq-pool" data-pool></div><div class="seq-slots" data-slots></div><div class="fb" data-fb></div></div>';
    var poolEl = wrap.querySelector("[data-pool]");
    var slotsEl = wrap.querySelector("[data-slots]");
    pool.forEach(function (step) {
      var c = el('<button class="seq-chip">' + esc(step) + "</button>");
      c.addEventListener("click", function () {
        slots.push(step); c.remove(); renderSlots();
      });
      poolEl.appendChild(c);
    });
    function renderSlots() {
      slotsEl.innerHTML = "";
      for (var k = 0; k < correct.length; k++) {
        var val = slots[k];
        var s = el('<div class="seq-slot ' + (val ? "filled" : "") + '"><span class="idx">' + (k + 1) + "</span><span>" + (val ? esc(val) : "<em class='muted'>drop here</em>") + "</span></div>");
        if (val) {
          s.style.cursor = "pointer";
          s.addEventListener("click", function (idx) { return function () {
            var v = slots.splice(idx, 1)[0];
            var c = el('<button class="seq-chip">' + esc(v) + "</button>");
            c.addEventListener("click", function () { slots.push(v); c.remove(); renderSlots(); });
            poolEl.appendChild(c); renderSlots();
          }; }(k));
        }
        slotsEl.appendChild(s);
      }
    }
    renderSlots();
    wrap.querySelector("[data-check]").addEventListener("click", function () {
      var fb = wrap.querySelector("[data-fb]");
      if (slots.length < correct.length) { fb.className = "fb warn"; fb.textContent = "Place all " + correct.length + " stages first."; return; }
      var ok = slots.every(function (v, k) { return v === correct[k]; });
      fb.className = "fb " + (ok ? "ok" : "no");
      fb.textContent = ok ? "\u2713 Perfect sequence!" : "\u2717 Not quite \u2014 click a slot to remove it and retry.";
      if (ok) toast("Correct workflow order!");
    });
    return wrap;
  }

  /* -------- M-01 interactive visual mind map ------------------------ */
  function totalNodes() { return D.mindmap.reduce(function (a, c) { return a + c.groups.reduce(function (b, g) { return b + g.nodes.length; }, 0); }, 0); }

  function renderMindmap() {
    var COL = 300, ROW = 46, PAD = 40, NODE_W = 250, NODE_H = 34;

    /* --- build the tree --- */
    var root = { id: "root", label: "BSIT301: Business Intelligence", depth: 0, chapter: null, kind: "root", children: [] };
    D.mindmap.forEach(function (ch) {
      var chNode = { id: "ch" + ch.no, label: "Chapter " + ch.no + ": " + ch.title, depth: 1, chapter: ch.no, kind: "chapter", html: ch.overview || "", children: [] };
      chNode.parent = root;
      ch.groups.forEach(function (g, gi) {
        var pNode = { id: "ch" + ch.no + "-p" + gi, label: g.parent, depth: 2, chapter: ch.no, kind: "topic", html: g.html || "", children: [], parent: chNode };
        g.nodes.forEach(function (n, ni) {
          pNode.children.push({ id: "ch" + ch.no + "-p" + gi + "-n" + ni, label: n.title, depth: 3, chapter: ch.no, kind: "node",
            html: n.html, topic: g.parent, parent: pNode, children: [] });
        });
        chNode.children.push(pNode);
      });
      root.children.push(chNode);
    });

    var art = el('<article class="sheet" data-sheet="M-01"></article>');
    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">M \u00b7 Mind map</span><h1>Interactive Mind Map</h1>' +
      '<p class="lede">A live, pan-and-zoom branching map of every course chapter. Expand or collapse any branch, drag to pan, scroll to zoom, and click a node to read its formatted breakdown.</p></div>' +
      '<div class="sheet-meta"><span class="label">Nodes</span><span class="big">' + totalNodes() + '</span><span class="label">across ' + D.chapters.length + ' chapters</span></div></div>' +
      '<div class="sheet-body">' +
      '<div class="toolbar mm-toolbar">' +
      '<button class="btn small" data-fit>Fit</button>' +
      '<button class="btn small" data-expand>Expand all</button>' +
      '<button class="btn small" data-collapse>Collapse all</button>' +
      '<span class="seg"><button data-zoom="1">\uFF0B</button><button data-zoom="-1">\uFF0D</button></span>' +
      '<span class="pill" data-hint>Drag to pan \u00b7 scroll to zoom \u00b7 Fit for overview</span>' +
      '</div>' +
      '<div class="mmx" data-mmx>' +
      '<div class="mmx-viewport" data-vp>' +
      '<div class="mmx-canvas" data-canvas><svg class="mmx-svg" data-svg></svg><div class="mmx-layer" data-nodes></div></div>' +
      '</div>' +
      '</div>' +
      '<div class="mmx-drawer" data-drawer><div class="mmx-drawer-head"><span class="label" data-crumb>Node detail</span><button class="btn small ghost" data-close>\u2715</button></div><div class="mmx-drawer-body" data-detail><p class="muted">Click any node on the map to open its breakdown.</p></div></div>' +
      '</div>';

    var vp = art.querySelector("[data-vp]");
    var canvas = art.querySelector("[data-canvas]");
    var svg = art.querySelector("[data-svg]");
    var layer = art.querySelector("[data-nodes]");
    var drawer = art.querySelector("[data-drawer]");
    var view = { s: 1, tx: 0, ty: 0 };

    function apply() { canvas.style.transform = "translate(" + view.tx + "px," + view.ty + "px) scale(" + view.s + ")"; }

    function layout() {
      var row = 0;
      (function rec(n) {
        n.visible = true;
        var kids = n.collapsed ? [] : n.children;
        if (!kids.length) { n.y = PAD + row * ROW; row++; }
        else { kids.forEach(rec); n.y = (kids[0].y + kids[kids.length - 1].y) / 2; }
        n.x = PAD + n.depth * COL;
      })(root);
      var vis = [];
      (function collect(n) { vis.push(n); if (!n.collapsed) n.children.forEach(collect); })(root);
      return { vis: vis, w: PAD * 2 + 3 * COL + NODE_W, h: PAD * 2 + Math.max(row, 1) * ROW };
    }

    function render() {
      var L = layout();
      canvas.style.width = L.w + "px"; canvas.style.height = L.h + "px";
      svg.setAttribute("width", L.w); svg.setAttribute("height", L.h); svg.setAttribute("viewBox", "0 0 " + L.w + " " + L.h);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      L.vis.forEach(function (n) {
        if (n.collapsed) return;
        n.children.forEach(function (c) {
          if (!c.visible) return;
          var x1 = n.x + NODE_W, y1 = n.y, x2 = c.x, y2 = c.y, dx = Math.max(24, (x2 - x1) * 0.5);
          var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
          p.setAttribute("class", "mmx-edge");
          p.setAttribute("d", "M" + x1 + " " + y1 + " C" + (x1 + dx) + " " + y1 + ", " + (x2 - dx) + " " + y2 + ", " + x2 + " " + y2);
          svg.appendChild(p);
        });
      });
      var pills = "";
      L.vis.forEach(function (n) {
        var hasKids = n.children.length > 0;
        var cls = "mmx-pill k-" + n.kind + (n.collapsed ? " collapsed" : "");
        var pill = '<div class="' + cls + '" data-pill="' + n.id + '" style="left:' + n.x + 'px;top:' + n.y + 'px;max-width:' + NODE_W + 'px">' +
          '<span class="mmx-lbl">' + esc(n.label) + "</span>" +
          (hasKids ? '<button class="mmx-toggle" data-toggle="' + n.id + '" title="Expand / collapse">' + (n.collapsed ? "\u25B8" : "\u25BE") + "</button>" : "") +
          "</div>";
        pills += pill;
      });
      layer.innerHTML = pills;
      bind();
    }

    function byId(id, n) { n = n || root; if (n.id === id) return n; for (var i = 0; i < n.children.length; i++) { var r = byId(id, n.children[i]); if (r) return r; } return null; }
    function bind() {
      layer.querySelectorAll("[data-toggle]").forEach(function (b) {
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          var n = byId(b.getAttribute("data-toggle"));
          if (!n) return;
          n.collapsed = !n.collapsed;
          render();
        });
      });
      layer.querySelectorAll("[data-pill]").forEach(function (p) {
        p.addEventListener("click", function () {
          layer.querySelectorAll(".mmx-pill").forEach(function (x) { x.classList.remove("sel"); });
          p.classList.add("sel");
          openDetail(byId(p.getAttribute("data-pill")));
        });
      });
    }

    function fit() {
      var L = layout();
      var rw = vp.clientWidth || 800, rh = vp.clientHeight || 460;
      view.s = Math.min(rw / L.w, rh / L.h, 1) * 0.96;
      view.s = Math.max(view.s, 0.15);
      view.tx = (rw - L.w * view.s) / 2;
      view.ty = (rh - L.h * view.s) / 2;
      apply();
    }
    function fitWidth() {
      var L = layout();
      var rw = vp.clientWidth || 800;
      view.s = Math.min((rw - 48) / L.w, 0.9);
      view.s = Math.max(view.s, 0.35);
      view.tx = (rw - L.w * view.s) / 2;
      view.ty = 24;
      apply();
    }
    function zoomTo(newS, cx, cy) {
      var rw = vp.clientWidth, rh = vp.clientHeight;
      cx = cx == null ? rw / 2 : cx; cy = cy == null ? rh / 2 : cy;
      newS = Math.min(2.6, Math.max(0.12, newS));
      view.tx = cx - (cx - view.tx) * (newS / view.s);
      view.ty = cy - (cy - view.ty) * (newS / view.s);
      view.s = newS; apply();
    }

    /* pan + zoom */
    var drag = null;
    vp.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".mmx-pill")) return;
      drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
      vp.classList.add("grabbing"); vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener("pointermove", function (e) {
      if (!drag) return;
      view.tx = drag.tx + (e.clientX - drag.x); view.ty = drag.ty + (e.clientY - drag.y); apply();
    });
    vp.addEventListener("pointerup", function () { drag = null; vp.classList.remove("grabbing"); });
    vp.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = vp.getBoundingClientRect();
      var f = Math.exp(-e.deltaY * 0.0012);
      zoomTo(view.s * f, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    art.querySelector("[data-fit]").addEventListener("click", fit);
    art.querySelector("[data-expand]").addEventListener("click", function () { root.collapsed = false; setAll(root, false); render(); setTimeout(fitWidth, 0); });
    art.querySelector("[data-collapse]").addEventListener("click", function () {
      root.collapsed = false;
      root.children.forEach(function (ch) { ch.collapsed = true; setAll(ch, true); });
      render(); setTimeout(fitWidth, 0);
    });
    art.querySelectorAll("[data-zoom]").forEach(function (b) {
      b.addEventListener("click", function () { zoomTo(view.s * (b.getAttribute("data-zoom") === "1" ? 1.25 : 0.8)); });
    });
    art.querySelector("[data-close]").addEventListener("click", function () { drawer.classList.remove("open"); });

    function setAll(n, v) { n.children.forEach(function (c) { if (c.children.length) c.collapsed = v; setAll(c, v); }); }

    function openDetail(n) {
      if (!n) return;
      var crumb = n.kind === "root" ? "BSIT301 \u00b7 Business Intelligence"
        : "CH-" + n.chapter + " \u00b7 Chapter " + n.chapter + (n.kind === "chapter" ? "" : " \u00b7 " + (n.topic || "") + (n.kind === "node" ? " \u2192 " + n.label : ""));
      var body;
      var kidsHtml = n.children.length
        ? "<p class='muted'>" + n.children.length + " branch" + (n.children.length === 1 ? "" : "es") + " under this node.</p><ul>" +
          n.children.map(function (c) { return "<li>" + esc(c.label) + "</li>"; }).join("") + "</ul>"
        : "";
      if (n.kind === "node" && n.html) {
        var rel = D.mcqs.filter(function (m) {
          var t = (m.q + " " + m.explanation).toLowerCase();
          return m.chapter === n.chapter && tokenOverlap(t, n.label);
        }).slice(0, 4);
        body = "<h3 style='margin-top:.4rem'>" + esc(n.label) + "</h3>" + n.html +
          (rel.length ? '<div class="review"><span class="label">Linked practice questions</span><ul>' +
            rel.map(function (m) { return "<li>" + esc(m.q) + "</li>"; }).join("") + "</ul></div>" : "");
      } else if (n.html) {
        body = "<h3 style='margin-top:.4rem'>" + esc(n.label) + "</h3>" + n.html + kidsHtml;
      } else {
        body = "<h3 style='margin-top:.4rem'>" + esc(n.label) + "</h3>" + kidsHtml;
      }
      var actions = "";
      if (n.chapter) {
        actions = '<div class="mmx-actions"><button class="btn primary" data-goto-ch="' + n.chapter + '">Jump to Chapter ' + n.chapter + ' Study Sheet</button>' +
          '<button class="btn" data-goto-q="' + n.chapter + '">Practice Chapter ' + n.chapter + ' MCQs</button></div>';
      }
      art.querySelector("[data-crumb]").textContent = crumb;
      var detail = art.querySelector("[data-detail]");
      detail.innerHTML = '<div class="mmx-body">' + body + "</div>" + actions;
      if (n.chapter) {
        detail.querySelector("[data-goto-ch]").addEventListener("click", function () { location.hash = "#C-0" + n.chapter; });
        detail.querySelector("[data-goto-q]").addEventListener("click", function () { window.BSIT.q1Chapter = n.chapter; location.hash = "#Q-01"; });
      }
      drawer.classList.add("open");
      detail.scrollTop = 0;
    }

    render();
    setTimeout(fitWidth, 30);
    if (window.BSIT.pendingNode) {
      var pend = window.BSIT.pendingNode; window.BSIT.pendingNode = null;
      setTimeout(function () {
        var found = null;
        (function find(n) { if (n.label === pend && n.kind === "node") { found = n; return; } n.children.forEach(find); })(root);
        if (found) openDetail(found);
      }, 0);
    }
    return art;
  }
  function tokenOverlap(hay, needle) {
    var words = needle.toLowerCase().split(/\W+/).filter(function (w) { return w.length > 4; }).slice(0, 4);
    return words.some(function (w) { return hay.indexOf(w) >= 0; });
  }

  /* ------------------------------------------------------------ boot */
  buildNav();
  updateProgress();
  if (!location.hash) location.hash = "#A-00";
  onHash();
})();


