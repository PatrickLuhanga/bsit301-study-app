/* =========================================================================
   Q-01 Section A MCQ simulator · P-03 Flashcards
   ========================================================================= */
(function () {
  "use strict";
  window.BSIT_RENDER = window.BSIT_RENDER || {};

  function helpers() { return window.BSIT; }

  /* =================================================================
     Q-01 — Section A MCQ drill + shading card + mistake bank (30 marks)
     ================================================================= */
  function renderQ1() {
    var M = helpers(), D = M.data;
    var art = M.el('<article class="sheet" data-sheet="Q-01"></article>');

    var sources = ["all"].concat(unique(D.mcqs.map(function (m) { return m.source; })));

    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">Q \u00b7 Section A</span><h1>MCQ Simulator \u2014 40 Marks</h1>' +
      '<p class="lede">Every past-paper MCQ and true/false item, tagged by source. Practise, study, or simulate the manual shading card.</p></div>' +
      '<div class="sheet-meta"><span class="label">Bank</span><span class="big" data-total>' + D.mcqs.length + '</span><span class="label">questions</span></div></div>' +
      '<div class="sheet-body">' +
      '<div class="toolbar">' +
      '<div class="seg" data-mode role="group"><button data-m="practice" aria-pressed="true">Practice</button><button data-m="study" aria-pressed="false">Study</button><button data-m="omr" aria-pressed="false">Shading card</button></div>' +
      '<select data-ch><option value="all">All chapters</option>' + D.chapters.map(function (c) { return '<option value="' + c.no + '">Chapter ' + c.no + " \u2014 " + M.esc(c.title) + "</option>"; }).join("") + "</select>" +
      '<select data-src>' + sources.map(function (s) { return '<option value="' + M.esc(s) + '">' + (s === "all" ? "All sources" : M.esc(s)) + "</option>"; }).join("") + "</select>" +
      '<label class="pill"><input type="checkbox" data-only-mistakes> Mistakes only</label>' +
      '<span class="pill" data-count></span>' +
      '</div>' +
      '<div class="stats" data-stats></div>' +
      '<div data-bank class="mt2"></div>' +
      '<div data-mistakes class="mt2"></div>' +
      "</div>";

    var state = { mode: "practice", ch: "all", src: "all", only: false, answered: {}, streak: 0, correct: 0, seen: 0 };
    var mistakes = M.store.get("mistakes", {});
    var bank = art.querySelector("[data-bank]");

    function filtered() {
      return D.mcqs.filter(function (m) {
        if (state.ch !== "all" && String(m.chapter) !== String(state.ch)) return false;
        if (state.src !== "all" && m.source !== state.src) return false;
        if (state.only && !mistakes[m.id]) return false;
        return true;
      });
    }
    function stats() {
      var acc = state.seen ? Math.round((state.correct / state.seen) * 100) : 0;
      art.querySelector("[data-stats]").innerHTML =
        '<div class="stat"><b>' + state.seen + '</b><span class="label">attempted</span></div>' +
        '<div class="stat"><b>' + state.correct + '</b><span class="label">correct</span></div>' +
        '<div class="stat"><b>' + acc + '%</b><span class="label">accuracy</span></div>' +
        '<div class="stat"><b>' + state.streak + '</b><span class="label">streak</span></div>' +
        '<div class="stat"><b>' + Object.keys(mistakes).length + '</b><span class="label">mistake bank</span></div>';
      art.querySelector("[data-count]").textContent = filtered().length + " in view";
    }
    function record(m, ok) {
      state.seen++; if (ok) { state.correct++; state.streak++; } else { state.streak = 0; mistakes[m.id] = (mistakes[m.id] || 0) + 1; M.store.set("mistakes", mistakes); }
      stats(); renderMistakes();
    }

    function renderBank() {
      bank.innerHTML = "";
      var list = filtered();
      if (!list.length) { bank.appendChild(M.el('<p class="muted">No questions match these filters.</p>')); stats(); return; }
      if (state.mode === "omr") return renderOMR(list);
      list.forEach(function (m) { bank.appendChild(card(m)); });
      stats();
    }

    function card(m) {
      var wrap = M.el('<div class="qcard"><div class="qmeta"><span class="tag ch">CH-' + m.chapter + '</span><span class="tag src">' + M.esc(m.source) + "</span>" + (m.type === "tf" ? '<span class="tag">True / False</span>' : "") + (mistakes[m.id] ? '<span class="tag" style="color:var(--warn)">\u26a0 missed \u00d7' + mistakes[m.id] + "</span>" : "") + "</div>" +
        '<div class="qtext">' + M.esc(m.q) + "</div></div>");
      var opts = M.el('<div class="opts"></div>');
      m.options.forEach(function (o, i) {
        var b = M.el('<button class="opt"><span class="key">' + "ABCD"[i] + '</span><span>' + M.esc(o) + "</span></button>");
        b.addEventListener("click", function () {
          if (wrap._done) return;
          wrap._done = true;
          var ok = i === m.answer;
          wrap.querySelectorAll(".opt").forEach(function (x, xi) {
            if (xi === m.answer) x.classList.add("ok");
            else if (xi === i) x.classList.add("no");
            x.classList.add("sel");
          });
          wrap.appendChild(M.el('<div class="explain"><strong>' + (ok ? "\u2713 Correct" : "\u2717 Incorrect") + "</strong> \u2014 correct answer: <strong>" + "ABCD"[m.answer] + ") " + M.esc(m.options[m.answer]) + "</strong><br>" + M.esc(m.explanation) + "</div>"));
          record(m, ok);
        });
        opts.appendChild(b);
      });
      wrap.appendChild(opts);
      if (state.mode === "study") {
        var rb = M.el('<button class="btn small mt1">Reveal answer</button>');
        rb.addEventListener("click", function () {
          wrap.querySelectorAll(".opt")[m.answer].classList.add("ok");
          rb.replaceWith(M.el('<div class="explain"><strong>Answer ' + "ABCD"[m.answer] + ")</strong> " + M.esc(m.options[m.answer]) + "<br>" + M.esc(m.explanation) + "</div>"));
        });
        wrap.appendChild(rb);
      }
      return wrap;
    }

    /* OMR shading card */
    function renderOMR(list) {
      list = M.shuffle(list).slice(0, 40);
      var chosen = {};
      var head = M.el('<div class="toolbar"><span class="label">40-Mark Shading Card Simulator</span>' +
        '<button class="btn small" data-clear>Clear card</button><button class="btn small" data-tip>Tip</button>' +
        '<button class="btn primary" data-mark>Mark my card</button><span class="fb" data-omrfb></span></div>');
      bank.appendChild(head);
      var grid = M.el('<div class="omr"></div>');
      bank.appendChild(grid);
      var out = M.el('<div data-omrout class="mt2"></div>');
      bank.appendChild(out);
      list.forEach(function (m, qi) {
        var item = M.el('<div class="omr-item"><span class="qn">Q' + (qi < 9 ? "0" : "") + (qi + 1) + "</span><div class=\"omr-latex\">" + M.esc(m.q.slice(0, 46)) + "\u2026</div><div class=\"omr-bubbles\"></div></div>");
        var bb = item.querySelector(".omr-bubbles");
        var nOpts = m.options.length > 4 ? 4 : m.options.length;
        for (var i = 0; i < nOpts; i++) {
          (function (i) {
            var b = M.el('<button class="bubble" data-q="' + m.id + '" data-i="' + i + '">' + "ABCD"[i] + "</button>");
            b.addEventListener("click", function () {
              var cur = chosen[m.id];
              if (cur === i) { b.classList.remove("shaded"); b.classList.add("struck"); chosen[m.id] = undefined; return; }
              if (cur != null) { var old = bb.children[cur]; if (old) { old.classList.remove("shaded"); old.classList.add("struck"); } }
              Array.prototype.forEach.call(bb.children, function (x) { if (x !== b && x.classList.contains("struck")) x.classList.remove("struck"); });
              b.classList.remove("struck"); b.classList.add("shaded"); chosen[m.id] = i;
            });
            bb.appendChild(b);
          })(i);
        }
        grid.appendChild(item);
      });
      head.querySelector("[data-clear]").addEventListener("click", function () {
        grid.querySelectorAll(".bubble").forEach(function (x) { x.classList.remove("shaded", "struck"); });
        chosen = {}; out.innerHTML = "";
      });
      head.querySelector("[data-tip]").addEventListener("click", function () {
        M.toast("Click a bubble to shade. Click a shaded bubble again to strike it off, then re-shade another.");
      });
      head.querySelector("[data-mark]").addEventListener("click", function () {
        var ans = 0, blank = 0, rows = "";
        list.forEach(function (m, qi) {
          var c = chosen[m.id];
          if (c == null) { blank++; return; }
          var ok = c === m.answer;
          if (ok) ans++;
          rows += "<tr><td>Q" + (qi + 1) + "</td><td>" + "ABCD"[c] + "</td><td>" + "ABCD"[m.answer] + "</td><td>" + (ok ? "\u2713" : "\u2717") + "</td><td>" + M.esc(m.options[m.answer].slice(0, 60)) + "</td></tr>";
        });
        var fb = head.querySelector("[data-omrfb]");
        fb.className = "fb " + (ans >= list.length * 0.6 ? "ok" : "warn");
        fb.textContent = ans + " / " + list.length + " correct \u00b7 " + blank + " blank";
        out.innerHTML = '<div class="panel fill"><span class="label">Marked card</span><table><thead><tr><th>#</th><th>Your</th><th>Key</th><th></th><th>Answer</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
        var best = M.store.get("best", null);
        if (!best || ans > best.score) {
          M.store.set("best", { score: ans, out: list.length, when: new Date().toLocaleDateString() });
          if (M.updateProgress) M.updateProgress();
        }
        M.toast("Card marked: " + ans + "/" + list.length);
      });
    }

    function renderMistakes() {
      var host = art.querySelector("[data-mistakes]");
      var ids = Object.keys(mistakes);
      if (!ids.length) { host.innerHTML = ""; return; }
      host.innerHTML = '<div class="panel fill"><div class="toolbar"><span class="label">Mistake bank</span><button class="btn small" data-retry>Retry my mistakes</button><button class="btn small ghost" data-clear>Clear bank</button></div><div data-list></div></div>';
      var list = host.querySelector("[data-list]");
      D.mcqs.filter(function (m) { return mistakes[m.id]; }).forEach(function (m) {
        list.appendChild(M.el('<p style="font-size:.85rem;margin:.35rem 0"><span class="tag ch">CH-' + m.chapter + '</span> ' + M.esc(m.q) + ' <em class="muted">\u00d7' + mistakes[m.id] + "</em></p>"));
      });
      host.querySelector("[data-retry]").addEventListener("click", function () {
        state.only = true; art.querySelector("[data-only-mistakes]").checked = true; state.mode = "practice"; setMode("practice"); renderBank();
      });
      host.querySelector("[data-clear]").addEventListener("click", function () {
        mistakes = {}; M.store.set("mistakes", {}); renderMistakes(); renderBank();
      });
    }

    function setMode(mode) {
      state.mode = mode;
      art.querySelectorAll("[data-mode] button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === mode)); });
    }
    art.querySelectorAll("[data-mode] button").forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-m")); renderBank(); });
    });
    art.querySelector("[data-ch]").addEventListener("change", function (e) { state.ch = e.target.value; renderBank(); });
    if (M.q1Chapter) { state.ch = String(M.q1Chapter); art.querySelector("[data-ch]").value = String(M.q1Chapter); M.q1Chapter = null; }
    art.querySelector("[data-src]").addEventListener("change", function (e) { state.src = e.target.value; renderBank(); });
    art.querySelector("[data-only-mistakes]").addEventListener("change", function (e) { state.only = e.target.checked; renderBank(); });

    renderBank(); renderMistakes();
    return art;
  }

  function unique(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }

  /* =================================================================
     P-03 — Flashcards
     ================================================================= */
  function renderP3() {
    var M = helpers(), D = M.data;
    var ALL = D.flashcards || [];
    var CHAPS = D.chapters.map(function (c) { return "Ch " + c.no; });

    var art = M.el('<article class="sheet" data-sheet="P-03"></article>');
    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">P \u00b7 Recall</span><h1>Flashcards</h1>' +
      '<p class="lede">Every key term, definition, and concept across every course chapter. Flip, then be honest: cards you mark &lsquo;again&rsquo; come back sooner.</p></div>' +
      '<div class="sheet-meta"><span class="label">Sheet</span><span class="big">P-03</span><span class="label" data-count>1 OF ' + ALL.length + ' IN SET</span></div></div>' +
      '<div class="sheet-body">' +
      '<div class="toolbar fc-bar">' +
      '<div class="fc-filters" data-filters>' +
      '<button class="pill-btn active" data-ch="all">All</button>' +
      CHAPS.map(function (c) { return '<button class="pill-btn" data-ch="' + c + '">' + c + "</button>"; }).join("") +
      "</div>" +
      '<div class="fc-progress"><span class="pill">Known <b data-known>0</b></span><span class="pill">Left <b data-left>0</b></span></div>' +
      "</div>" +
      '<div class="fc-stage" data-stage></div>' +
      "</div>";

    var stage = art.querySelector("[data-stage]");
    var state = { chapter: "all", deck: [], queue: [], known: 0, flipped: false };
    var cardEl = null;

    function buildDeck() {
      state.deck = state.chapter === "all" ? ALL.slice() : ALL.filter(function (c) { return c.chapter === state.chapter; });
    }
    function reset() {
      buildDeck();
      state.queue = state.deck.slice();
      state.known = 0; state.flipped = false;
      renderStage();
    }
    function shuffleReset() {
      state.queue = M.shuffle(state.deck);
      state.known = 0; state.flipped = false;
      renderStage();
      M.toast("Deck shuffled \u2014 " + state.queue.length + " cards");
    }

    function updateProgress() {
      art.querySelector("[data-known]").textContent = state.known;
      art.querySelector("[data-left]").textContent = state.queue.length;
      var total = state.deck.length || ALL.length;
      var idx = Math.min(state.known + 1, total);
      art.querySelector("[data-count]").textContent = (state.queue.length ? idx : total) + " OF " + total + " IN SET";
    }

    function renderStage() {
      if (!state.queue.length) return renderDone();
      var card = state.queue[0];
      stage.innerHTML =
        '<div class="fc-card" data-card tabindex="0" role="button" aria-label="Flashcard \u2014 tap or press space to flip">' +
        '<div class="fc-inner">' +
        '<div class="fc-face fc-front"><span class="fc-cat">' + M.esc(card.category) + '</span><div class="fc-q">' + M.esc(card.front) + '</div><span class="fc-hint">TAP OR PRESS SPACE TO FLIP</span></div>' +
        '<div class="fc-face fc-back"><span class="fc-cat">' + M.esc(card.category) + '</span><div class="fc-a">' + card.back + '</div><span class="fc-hint">DID YOU KNOW IT?</span></div>' +
        "</div></div>" +
        '<div class="fc-controls">' +
        '<button class="btn fc-again" data-again>\u2190 Again</button>' +
        '<button class="btn fc-flipbtn" data-flip>Flip</button>' +
        '<button class="btn primary fc-got" data-got>Got it \u2192</button>' +
        "</div>" +
        '<button class="btn ghost fc-shuffle" data-shuffle>Shuffle &amp; restart deck</button>';
      cardEl = stage.querySelector("[data-card]");
      cardEl.classList.toggle("flipped", state.flipped);
      cardEl.addEventListener("click", flip);
      cardEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); flip(); } });
      stage.querySelector("[data-flip]").addEventListener("click", flip);
      stage.querySelector("[data-again]").addEventListener("click", again);
      stage.querySelector("[data-got]").addEventListener("click", gotIt);
      stage.querySelector("[data-shuffle]").addEventListener("click", shuffleReset);
      updateProgress();
    }

    function renderDone() {
      stage.innerHTML =
        '<div class="fc-done"><span class="label">Deck complete</span>' +
        "<h2>Nice work \u2014 deck mastered</h2>" +
        "<p>You marked all <strong>" + state.deck.length + "</strong> card" + (state.deck.length === 1 ? "" : "s") +
        " as known" + (state.chapter === "all" ? "" : " in <strong>" + M.esc(state.chapter) + "</strong>") + ".</p>" +
        '<div class="fc-controls"><button class="btn primary" data-shuffle>Shuffle &amp; restart deck</button>' +
        '<button class="btn" data-all>Switch to all chapters</button></div></div>';
      stage.querySelector("[data-shuffle]").addEventListener("click", shuffleReset);
      stage.querySelector("[data-all]").addEventListener("click", function () { setChapter("all"); });
      updateProgress();
      M.toast("Deck complete!");
    }

    function flip() { state.flipped = !state.flipped; if (cardEl) cardEl.classList.toggle("flipped", state.flipped); }
    function again() {
      if (!state.queue.length) return;
      state.queue.push(state.queue.shift());
      state.flipped = false; renderStage();
    }
    function gotIt() {
      if (!state.queue.length) return;
      state.queue.shift(); state.known++; state.flipped = false;
      renderStage();
    }
    function setChapter(ch) {
      state.chapter = ch;
      art.querySelectorAll("[data-filters] .pill-btn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-ch") === ch); });
      reset();
    }

    art.querySelectorAll("[data-filters] .pill-btn").forEach(function (b) {
      b.addEventListener("click", function () { setChapter(b.getAttribute("data-ch")); });
    });

    /* keyboard: Space = flip, Left = again, Right = got it */
    if (window.__p3key) document.removeEventListener("keydown", window.__p3key);
    var keyHandler = function (e) {
      if (!art.isConnected) return;
      var t = (e.target && e.target.tagName) || "";
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " " || e.code === "Space") { e.preventDefault(); flip(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); again(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); gotIt(); }
    };
    window.__p3key = keyHandler;
    document.addEventListener("keydown", keyHandler);

    reset();
    return art;
  }

  window.BSIT_RENDER.q1 = renderQ1;
  window.BSIT_RENDER.p3 = renderP3;
})();



