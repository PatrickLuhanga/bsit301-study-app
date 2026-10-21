/* =========================================================================
   E-01 Drill Arena — All-Mix / MCQ / Long-answer modes, chapter + topic +
   exact source filters, shuffle, reveal, self-marking and a saved session score.
   ========================================================================= */
(function () {
  "use strict";
  window.BSIT_RENDER = window.BSIT_RENDER || {};

  var MODES = [
    { id: "all", label: "All-Mix Arena" },
    { id: "mcq", label: "MCQ Answering Section" },
    { id: "long", label: "Long Question Answering Section" }
  ];

  function renderE1() {
    var M = window.BSIT, D = M.data;
    var BANK = D.drillBank || [];
    var TAX = D.drillTaxonomy || [];
    var PAPERS = D.papers || ["Test 1", "Test 2", "2023 Main", "2024 Main", "2026 Main", "Lecture Deck"];

    var mcqCount = BANK.filter(function (q) { return q.type === "MCQ" || q.type === "Calc"; }).length;
    var longCount = BANK.filter(function (q) { return q.type === "Written"; }).length;
    var saved = M.store.get("drillRecent", null) || {};

    var art = M.el('<article class="sheet" data-sheet="E-01"></article>');
    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">E \u00b7 Exam prep</span><h1>Past Paper Drill Arena</h1>' +
      '<p class="lede">Three ways to drill: a mixed arena, a pure MCQ section and a long-answer section. Filter by chapter, granular topic or exact source paper, shuffle the deck, then reveal the memo and self-mark.</p></div>' +
      '<div class="sheet-meta"><span class="label">Questions</span><span class="big" data-total>' + BANK.length + '</span><span class="label">' + mcqCount + ' MCQ \u00b7 ' + longCount + ' long</span></div></div>' +
      '<div class="sheet-body">' +

      '<div class="seg drill-modes" data-modes role="group" aria-label="Drill mode">' +
      MODES.map(function (m, i) {
        var n = m.id === "all" ? BANK.length : m.id === "mcq" ? mcqCount : longCount;
        return '<button data-mode="' + m.id + '" aria-pressed="' + (i === 0) + '">' + M.esc(m.label) + ' <span class="mode-n">' + n + '</span></button>';
      }).join("") + '</div>' +

      '<div class="toolbar drill-filters">' +
      '<label class="field"><span class="label">Chapter</span><select data-ch>' +
      '<option value="all">All chapters</option>' +
      TAX.map(function (g) { return '<option value="' + M.esc(g.chapter) + '">' + M.esc(g.chapter) + ' \u2014 ' + M.esc(g.title) + '</option>'; }).join("") +
      '</select></label>' +
      '<label class="field"><span class="label">Topic</span><select data-topic><option value="all">All topics</option>' +
      TAX.map(function (g) {
        return '<optgroup label="' + M.esc(g.chapter) + ' \u00b7 ' + M.esc(g.title) + '">' +
          g.topics.map(function (t) { return '<option value="' + M.esc(t) + '">' + M.esc(t) + '</option>'; }).join("") +
          '</optgroup>';
      }).join("") + '</select></label>' +
      '<label class="field"><span class="label">Source</span><select data-paper><option value="all">All papers</option>' +
      PAPERS.map(function (p) { return '<option value="' + M.esc(p) + '">' + M.esc(p) + '</option>'; }).join("") +
      '</select></label>' +
      '<button class="btn shuffle-toggle" data-shuffle aria-pressed="false">\u21bb Shuffle</button>' +
      '<button class="btn small ghost" data-reset-filters>Reset filters</button>' +
      '<span class="pill" data-shown>Showing 0 of 0 questions</span>' +
      '</div>' +

      '<div class="stats" data-stats></div>' +
      '<div data-drill class="mt2"></div>' +
      '</div>';

    var state = {
      mode: "all", ch: "all", topic: "all", paper: "all", shuffle: false,
      base: [], items: [], idx: 0, chosen: null, revealed: false,
      seen: saved.seen || 0, correct: saved.correct || 0, longDone: saved.longDone || 0,
      scored: {}
    };

    var chSel = art.querySelector("[data-ch]");
    var topicSel = art.querySelector("[data-topic]");
    var paperSel = art.querySelector("[data-paper]");
    var drillHost = art.querySelector("[data-drill]");
    var statsHost = art.querySelector("[data-stats]");

    function isMcq(q) { return q.type === "MCQ" || q.type === "Calc"; }
    function modeOk(q) {
      if (state.mode === "mcq") return isMcq(q);
      if (state.mode === "long") return q.type === "Written";
      return true;
    }
    function matches(q) {
      if (!modeOk(q)) return false;
      if (state.ch !== "all" && q.chapter !== state.ch) return false;
      if (state.topic !== "all" && q.topic !== state.topic) return false;
      if (state.paper !== "all" && q.paper !== state.paper) return false;
      return true;
    }
    function keyOf(q) { return q.type + "|" + q.chapter + "|" + q.question; }

    function saveRecent() {
      M.store.set("drillRecent", {
        seen: state.seen, correct: state.correct, longDone: state.longDone,
        when: new Date().toLocaleDateString()
      });
    }
    function renderStats() {
      var acc = state.seen ? Math.round((state.correct / state.seen) * 100) : 0;
      statsHost.innerHTML =
        '<div class="stat"><b>' + state.seen + '</b><span class="label">marked this session</span></div>' +
        '<div class="stat"><b>' + state.correct + '</b><span class="label">MCQ correct</span></div>' +
        '<div class="stat"><b>' + acc + '%</b><span class="label">accuracy</span></div>' +
        '<div class="stat"><b>' + state.longDone + '</b><span class="label">long answers self-marked</span></div>';
    }
    function recordMcq(q, ok) {
      var k = keyOf(q);
      if (state.scored[k]) return;
      state.scored[k] = true;
      state.seen++;
      if (ok) state.correct++;
      saveRecent(); renderStats();
    }
    function recordLong(q) {
      var k = keyOf(q);
      if (state.scored[k]) return;
      state.scored[k] = true;
      state.longDone++;
      saveRecent(); renderStats();
    }

    function recompute() {
      state.base = BANK.filter(matches);
      state.items = state.shuffle ? M.shuffle(state.base) : state.base.slice();
      state.idx = 0; state.chosen = null; state.revealed = false;
      art.querySelector("[data-shown]").textContent = "Showing " + state.items.length + " of " + BANK.length + " questions";
      render();
    }

    function render() {
      drillHost.innerHTML = "";
      if (!state.items.length) {
        drillHost.appendChild(M.el('<div class="panel fill"><span class="label">No questions match</span><p class="muted">Loosen the filters or switch drill mode.</p></div>'));
        return;
      }
      var q = state.items[state.idx];
      var qtype = q.type === "Calc" ? "Calculation MCQ" : q.type === "Written" ? "Long answer" : "MCQ";
      var card = M.el('<div class="qcard drill-card">' +
        '<div class="qmeta">' +
        '<span class="tag ' + (isMcq(q) ? "ch" : "src") + '">' + M.esc(qtype) + '</span>' +
        '<span class="tag ch">' + M.esc(q.chapter) + '</span>' +
        '<span class="tag src">' + M.esc(q.paper) + '</span>' +
        '<span class="tag">' + M.esc(q.topic) + '</span>' +
        (q.marks ? '<span class="tag">' + q.marks + ' marks</span>' : "") +
        '</div>' +
        '<div class="drill-qtext">' + (q.type === "Calc" ? q.question : M.esc(q.question)) + '</div>' +
        (q.type === "Written"
          ? '<ul class="part-list">' + q.parts.map(function (p) { return '<li><span>' + M.esc(p.text) + '</span><b class="marks">[' + p.marks + ']</b></li>'; }).join("") + '</ul>' +
            '<div class="panel fill mt1"><span class="label">Your answer</span><textarea data-ans rows="6" placeholder="Plan and write your long answer here before revealing the memo\u2026"></textarea></div>'
          : '<div class="opts" data-opts></div>') +
        '<div class="toolbar drill-actions mt1"><button class="btn primary" data-reveal>Reveal answer</button>' +
        '<span class="fb" data-selfmark></span></div>' +
        '<div class="drill-memo hidden" data-memo></div>' +
        '<div class="drill-nav mt2">' +
        '<button class="btn" data-prev>\u2190 Previous</button>' +
        '<span class="pill drill-pos" data-pos>' + (state.idx + 1) + ' / ' + state.items.length + '</span>' +
        '<button class="btn" data-next>Next \u2192</button>' +
        '</div></div>');

      drillHost.appendChild(card);

      if (isMcq(q)) {
        var opts = card.querySelector("[data-opts]");
        q.options.forEach(function (o, i) {
          var b = M.el('<button class="opt"><span class="key">' + "ABCD"[i] + '</span><span>' + M.esc(o) + "</span></button>");
          if (state.chosen === i) b.classList.add("sel");
          if (state.revealed) {
            if (i === q.answerIndex) b.classList.add("ok");
            else if (state.chosen === i) b.classList.add("no");
          }
          b.addEventListener("click", function () {
            if (state.revealed) return;
            state.chosen = i;
            card.querySelectorAll(".opt").forEach(function (x, xi) { x.classList.toggle("sel", xi === i); });
          });
          opts.appendChild(b);
        });
      }

      var memo = card.querySelector("[data-memo]");
      var self = card.querySelector("[data-selfmark]");

      function reveal() {
        if (state.revealed) {
          memo.classList.remove("hidden");
          if (isMcq(q)) {
            card.querySelectorAll(".opt").forEach(function (x, xi) {
              x.classList.remove("ok", "no");
              if (xi === q.answerIndex) x.classList.add("ok");
              else if (state.chosen === xi) x.classList.add("no");
            });
            var ok = state.chosen === q.answerIndex;
            if (state.chosen == null) {
              self.className = "fb warn";
              self.textContent = "Answer: " + "ABCD"[q.answerIndex] + ") " + q.answer;
            } else {
              self.className = "fb " + (ok ? "ok" : "no");
              self.textContent = ok ? "\u2713 Correct" : "\u2717 Incorrect \u2014 answer: " + "ABCD"[q.answerIndex];
              recordMcq(q, ok);
            }
            memo.innerHTML = '<div class="panel fill"><span class="label">Memo</span><p><strong>' + M.esc(q.answer) + '</strong></p><p class="muted">' + M.esc(q.memo) + '</p></div>';
          } else {
            self.className = "fb";
            self.textContent = "Compare your answer with the model, then self-mark below.";
            memo.innerHTML = '<div class="panel fill"><span class="label">Model answer</span>' + q.memo +
              '<div class="toolbar mt1"><button class="btn primary" data-long-done>Mark complete \u2713</button>' +
              '<button class="btn" data-long-retry>Needs work</button><span class="fb" data-long-fb></span></div></div>';
            memo.querySelector("[data-long-done]").addEventListener("click", function () {
              recordLong(q);
              var fb = memo.querySelector("[data-long-fb]");
              fb.className = "fb ok"; fb.textContent = "\u2713 Long answer self-marked";
            });
            memo.querySelector("[data-long-retry]").addEventListener("click", function () {
              var fb = memo.querySelector("[data-long-fb]");
              fb.className = "fb warn"; fb.textContent = "Revisit this answer before the exam.";
            });
          }
        } else {
          memo.classList.add("hidden");
          self.className = "fb"; self.textContent = "";
        }
      }

      card.querySelector("[data-reveal]").addEventListener("click", function () {
        state.revealed = !state.revealed;
        this.textContent = state.revealed ? "Hide answer" : "Reveal answer";
        reveal();
      });
      if (state.revealed) card.querySelector("[data-reveal]").textContent = "Hide answer";
      reveal();

      card.querySelector("[data-next]").addEventListener("click", function () { step(1); });
      card.querySelector("[data-prev]").addEventListener("click", function () { step(-1); });
    }

    function step(d) {
      if (!state.items.length) return;
      state.idx = (state.idx + d + state.items.length) % state.items.length;
      state.chosen = null; state.revealed = false;
      render();
    }

    art.querySelectorAll("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.mode = b.getAttribute("data-mode");
        art.querySelectorAll("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        recompute();
      });
    });
    chSel.addEventListener("change", function () {
      state.ch = chSel.value;
      if (state.ch !== "all") { state.topic = "all"; topicSel.value = "all"; }
      recompute();
    });
    topicSel.addEventListener("change", function () {
      state.topic = topicSel.value;
      if (state.topic !== "all") {
        var owner = TAX.filter(function (g) { return g.topics.indexOf(state.topic) >= 0; })[0];
        if (owner) { state.ch = owner.chapter; chSel.value = owner.chapter; }
      }
      recompute();
    });
    paperSel.addEventListener("change", function () { state.paper = paperSel.value; recompute(); });
    art.querySelector("[data-shuffle]").addEventListener("click", function () {
      state.shuffle = !state.shuffle;
      this.setAttribute("aria-pressed", String(state.shuffle));
      this.classList.toggle("is-on", state.shuffle);
      M.toast(state.shuffle ? "Deck shuffled" : "Deck in paper order");
      recompute();
    });
    art.querySelector("[data-reset-filters]").addEventListener("click", function () {
      state.ch = "all"; state.topic = "all"; state.paper = "all";
      chSel.value = "all"; topicSel.value = "all"; paperSel.value = "all";
      recompute();
    });

    renderStats();
    recompute();
    return art;
  }

  window.BSIT_RENDER.e1 = renderE1;
})();
