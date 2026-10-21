/* =========================================================================
   Section B workbenches — BSIT301 Business Intelligence
   Q-02 / Q1 [30] · Q-03 / Q2 [30] · Q-04 extension + Ch 6 element lab
   ========================================================================= */
(function () {
  "use strict";
  window.BSIT_RENDER = window.BSIT_RENDER || {};

  function helpers() { return window.BSIT; }

  function findCategory(code) {
    var D = window.BSIT_DATA || {};
    return (D.sectionB || []).filter(function (q) { return q.code === code; })[0];
  }

  /* =================================================================
     Written-paper workbench: one textarea, reveal and chip per sub-question
     ================================================================= */
  function renderWorkbench(code) {
    var M = helpers();
    var cat = findCategory(code);
    var art = M.el('<article class="sheet" data-sheet="' + code + '"></article>');
    if (!cat) { art.innerHTML = "<p class='muted'>Category not found.</p>"; return art; }

    var totalMarks = cat.bank.reduce(function (a, item) {
      return a + item.parts.reduce(function (b, p) { return b + p.marks; }, 0);
    }, 0);
    var totalPoints = cat.bank.reduce(function (a, item) { return a + item.parts.length; }, 0);
    var totalSubqs = cat.bank.length;
    var isExtension = cat.role === "extension";
    var marksLabel = isExtension ? "Extension \u00b7 no fixed total" : cat.marks + " marks";

    art.innerHTML =
      '<div class="sheet-head"><div><span class="label">Q \u00b7 Section B \u00b7 ' + (isExtension ? "extension" : M.esc(cat.label)) + '</span><h1>' + M.esc(cat.title) + '</h1>' +
      '<p class="lede">' + cat.blurb + '</p></div>' +
      '<div class="sheet-meta"><span class="label">Sheet</span><span class="big">' + cat.code + '</span><span class="label">' + marksLabel + '</span></div></div>' +
      '<div class="sheet-body">' +
      '<div class="toolbar"><span class="pill">' + totalSubqs + ' sub-question' + (totalSubqs === 1 ? "" : "s") + ' \u00b7 ' + totalPoints + ' mark points</span>' +
      '<span class="pill" data-progress>0 / ' + totalSubqs + ' attempted</span>' +
      '<span class="pill" data-self-total>Self-mark 0 / ' + totalMarks + '</span>' +
      (isExtension ? "" : '<span class="pill" data-sb-total>Section B: Q1 0/30 + Q2 0/30 = 0/60</span>') +
      '<button class="btn small" data-reset>Clear all</button></div>' +
      '<div data-bank></div>' +
      (cat.lab === "calc" ? '<section class="block"><div data-lab></div></section>' : "") +
      '</div>';

    var bankHost = art.querySelector("[data-bank]");
    var attempted = 0;
    var awarded = 0;
    var totalPill = art.querySelector("[data-self-total]");
    var sbPill = art.querySelector("[data-sb-total]");
    var sbMarks = M.store.get("sbMarks", {}) || {};

    function pageAwarded() {
      return Array.prototype.reduce.call(art.querySelectorAll(".chip.on"), function (a, c) {
        return a + Number(c.getAttribute("data-mark"));
      }, 0);
    }
    function sectionMarks(label) {
      var sec = (M.data.sectionB || []).filter(function (q) { return q.label === label; })[0];
      if (!sec) return 0;
      return sec.bank.reduce(function (a, item) {
        return a + item.parts.reduce(function (b, p, pi) {
          return b + (sbMarks[sec.code + "|" + item.code + "|" + pi] ? p.marks : 0);
        }, 0);
      }, 0);
    }
    function updateSectionB() {
      if (!sbPill) return;
      var q1 = sectionMarks("Q1"), q2 = sectionMarks("Q2");
      sbPill.textContent = "Section B: Q1 " + q1 + "/30 + Q2 " + q2 + "/30 = " + (q1 + q2) + "/60";
      sbPill.style.color = q1 + q2 >= 60 ? "var(--approve)" : "";
    }

    function bumpProgress() {
      attempted++;
      art.querySelector("[data-progress]").textContent = Math.min(attempted, totalSubqs) + " / " + totalSubqs + " attempted";
    }
    function updateTotal() {
      awarded = pageAwarded();
      totalPill.textContent = "Self-mark " + awarded + " / " + totalMarks;
      totalPill.style.borderColor = awarded >= totalMarks ? "var(--approve)" : "";
      totalPill.style.color = awarded >= totalMarks ? "var(--approve)" : "";
      updateSectionB();
    }

    cat.bank.forEach(function (item, idx) {
      var itemMarks = item.parts.reduce(function (a, p) { return a + p.marks; }, 0);
      var modelHtml = (item.model || []).map(function (m) { return "<li>" + m + "</li>"; }).join("") || "<li class='muted'>No model answer supplied.</li>";
      var chipHtml = item.parts.map(function (p) {
        return '<button class="btn small chip" data-mark="' + p.marks + '">' + M.esc(p.text) + ' <b>+' + p.marks + '</b></button>';
      }).join("");

      var wrap = M.el('<section class="block"><div class="qcard">' +
        '<div class="qmeta"><span class="tag src">' + (item.source || "") + '</span><span class="tag ch">Item ' + (idx + 1) + '</span>' +
        '<span class="tag">' + itemMarks + ' marks</span></div>' +
        '<div class="qtext"><strong>' + M.esc(item.heading) + '</strong></div>' +
        '<p>' + M.esc(item.scenario) + '</p>' +
        '<div class="subq">' +
        '<div class="subq-head"><span class="subq-code">' + M.esc(item.code) + '</span>' +
        '<span class="subq-text">Answer the sub-question below.</span><b class="subq-marks">[' + itemMarks + ' marks]</b></div>' +
        '<ul class="part-list">' + item.parts.map(function (p) { return '<li><span>' + M.esc(p.text) + '</span><b class="marks">[' + p.marks + ']</b></li>'; }).join("") + '</ul>' +
        '<textarea data-ans rows="6" placeholder="Write your full answer to this ' + itemMarks + '-mark sub-question before revealing the model answer\u2026"></textarea>' +
        '<div class="toolbar subq-actions"><button class="btn primary" data-reveal>Reveal step-by-step model answer</button></div>' +
        '<div class="panel fill model hidden"><span class="label">Step-by-step model answer \u00b7 ' + itemMarks + ' marks</span>' +
        '<ol class="model-list">' + modelHtml + '</ol>' +
        '<div class="self-mark"><span class="label">Self-mark: tick each point you earned</span><div class="chip-row">' + chipHtml + '</div>' +
        '<span class="fb" data-self></span></div></div></div></div></section>');

      var ta = wrap.querySelector("textarea");
      var self = wrap.querySelector("[data-self]");
      var model = wrap.querySelector(".model");

      ta.addEventListener("input", function () {
        if (!ta._counted && ta.value.trim()) { ta._counted = true; bumpProgress(); }
      });
      wrap.querySelector("[data-reveal]").addEventListener("click", function () {
        model.classList.toggle("hidden");
        if (!ta._counted) { ta._counted = true; bumpProgress(); }
      });
      wrap.querySelectorAll("[data-mark]").forEach(function (chip, pi) {
        var markKey = cat.code + "|" + item.code + "|" + pi;
        if (sbMarks[markKey]) chip.classList.add("on");
        chip.addEventListener("click", function () {
          var on = chip.classList.toggle("on");
          if (on) sbMarks[markKey] = true;
          else delete sbMarks[markKey];
          M.store.set("sbMarks", sbMarks);
          var itemAwarded = Array.prototype.reduce.call(wrap.querySelectorAll(".chip.on"), function (a, c) {
            return a + Number(c.getAttribute("data-mark"));
          }, 0);
          self.className = "fb " + (itemAwarded >= itemMarks ? "ok" : itemAwarded > 0 ? "warn" : "");
          self.textContent = itemAwarded ? "This sub-question: " + itemAwarded + " / " + itemMarks : "";
          updateTotal();
        });
      });
      var restored = Array.prototype.reduce.call(wrap.querySelectorAll(".chip.on"), function (a, c) {
        return a + Number(c.getAttribute("data-mark"));
      }, 0);
      if (restored) {
        self.className = "fb " + (restored >= itemMarks ? "ok" : "warn");
        self.textContent = "This sub-question: " + restored + " / " + itemMarks;
      }

      bankHost.appendChild(wrap);
    });

    art.querySelector("[data-reset]").addEventListener("click", function () {
      art.querySelectorAll("textarea").forEach(function (t) { t.value = ""; t._counted = false; });
      attempted = 0;
      art.querySelector("[data-progress]").textContent = "0 / " + totalSubqs + " attempted";
      art.querySelectorAll("[data-self]").forEach(function (s) { s.textContent = ""; s.className = "fb"; });
      art.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
      art.querySelectorAll(".model").forEach(function (m) { m.classList.add("hidden"); });
      Object.keys(sbMarks).forEach(function (k) {
        if (k.indexOf(cat.code + "|") === 0) delete sbMarks[k];
      });
      M.store.set("sbMarks", sbMarks);
      updateTotal();
    });

    var labHost = art.querySelector("[data-lab]");
    if (labHost && window.BSIT_CALC && M.data.calcLab) window.BSIT_CALC.mount(labHost, M.data.calcLab);

    updateTotal();
    return art;
  }

  function makeRenderer(code) {
    return function () { return renderWorkbench(code); };
  }

  ((window.BSIT_DATA && window.BSIT_DATA.sectionB) || []).forEach(function (q) {
    window.BSIT_RENDER["s" + q.no] = makeRenderer(q.code);
  });
})();
