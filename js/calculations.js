/* =========================================================================
   Chapter 6 Calculation Lab — element meanings, descriptive vs predictive
   Shared by C-06 (widget) and Q-04 (element meanings workbench).
   ========================================================================= */
(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function mount(host, lab, opts) {
    if (!host || !lab || !lab.length) return;
    opts = opts || {};
    var escFn = (window.BSIT && window.BSIT.esc) || esc;
    var group = "all";

    host.innerHTML =
      '<div class="calc-lab">' +
      '<div class="calc-head"><span class="label">Chapter 6 &middot; Calculation element lab</span>' +
      '<h3>Descriptive vs predictive: what every element means</h3>' +
      '<p>Descriptive calculations use <strong>known historical or current figures</strong>. Predictive calculations use current figures and trends to <strong>project future outcomes</strong>. Click an element inside any formula to see its business meaning.</p></div>' +
      '<div class="calc-toolbar"><div class="seg" data-calc-groups>' +
      '<button data-cg="all" aria-pressed="true">All formulas</button>' +
      '<button data-cg="descriptive" aria-pressed="false">Descriptive</button>' +
      '<button data-cg="predictive" aria-pressed="false">Predictive</button>' +
      '</div><span class="pill" data-calc-count></span></div>' +
      '<div class="calc-grid" data-calc-grid></div>' +
      '<div class="calc-quiz-wrap"><div class="toolbar"><span class="label">Element-meaning quiz</span>' +
      '<button class="btn small primary" data-calc-start>Start / reshuffle quiz</button>' +
      '<span class="pill" data-calc-score>0 / 0</span></div><div data-calc-quiz></div></div>' +
      '</div>';

    var grid = host.querySelector("[data-calc-grid]");
    var count = host.querySelector("[data-calc-count]");

    function renderCards() {
      var list = lab.filter(function (f) { return group === "all" || f.type === group; });
      count.textContent = list.length + " formula" + (list.length === 1 ? "" : "s");
      grid.innerHTML = list.map(function (f, fi) {
        return '<article class="calc-card ' + f.type + '">' +
          '<div class="calc-card-top"><span class="tag ' + (f.type === "predictive" ? "src" : "ch") + '">' + f.type + '</span>' +
          '<span class="calc-id">F' + (lab.indexOf(f) + 1) + '</span></div>' +
          '<h4>' + escFn(f.title) + '</h4>' +
          '<div class="calc-formula">' + f.formula + '</div>' +
          '<p class="calc-interp">' + escFn(f.interpretation) + '</p>' +
          '<div class="calc-elements"><span class="label">Click an element</span>' +
          f.elements.map(function (el, ei) {
            return '<button class="calc-el" data-f="' + fi + '" data-e="' + ei + '">' + escFn(el.name) + '</button>';
          }).join("") + '</div>' +
          '<div class="calc-detail" data-detail></div>' +
          '<p class="calc-example"><b>Example:</b> ' + escFn(f.example) + '</p>' +
          '</article>';
      }).join("");

      grid.querySelectorAll(".calc-el").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var f = list[Number(btn.getAttribute("data-f"))];
          var el = f.elements[Number(btn.getAttribute("data-e"))];
          var card = btn.closest(".calc-card");
          grid.querySelectorAll(".calc-el").forEach(function (b) { b.classList.remove("on"); });
          btn.classList.add("on");
          card.querySelector("[data-detail]").innerHTML =
            '<div class="calc-detail-inner"><strong>' + escFn(el.name) + '</strong>' +
            '<p>' + escFn(el.meaning) + '</p>' +
            '<p class="calc-tip"><b>Exam tip:</b> ' + escFn(el.tip) + '</p></div>';
        });
      });
    }

    function renderQuiz() {
      var els = [];
      lab.forEach(function (f) {
        f.elements.forEach(function (el) { els.push({ f: f, el: el }); });
      });
      var chosen = els.slice();
      for (var i = chosen.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = chosen[i]; chosen[i] = chosen[j]; chosen[j] = t;
      }
      chosen = chosen.slice(0, Math.min(8, chosen.length));
      var allMeanings = els.map(function (x) { return x.el.meaning; });
      var score = 0, answered = 0;
      var hostQ = host.querySelector("[data-calc-quiz]");
      var scoreEl = host.querySelector("[data-calc-score]");
      scoreEl.textContent = "0 / " + chosen.length;

      hostQ.innerHTML = chosen.map(function (item, qi) {
        var correct = item.el.meaning;
        var pool = allMeanings.filter(function (m) { return m !== correct; });
        var opts = [correct];
        while (opts.length < 4 && pool.length) {
          var m = pick(pool);
          if (opts.indexOf(m) < 0) opts.push(m);
        }
        opts = opts.sort(function () { return Math.random() - 0.5; });
        return '<div class="calc-q" data-qi="' + qi + '">' +
          '<p><b>Q' + (qi + 1) + '.</b> In <span class="mono">' + item.f.formula + '</span>, what does <strong>' + escFn(item.el.name) + '</strong> represent?</p>' +
          '<div class="opts">' + opts.map(function (o, oi) {
            return '<button class="opt" data-oi="' + oi + '"><span class="key">' + "ABCD"[oi] + '</span><span>' + escFn(o) + '</span></button>';
          }).join("") + '</div><div class="fb" data-qfb></div></div>';
      }).join("");

      hostQ.querySelectorAll(".calc-q").forEach(function (qEl) {
        var item = chosen[Number(qEl.getAttribute("data-qi"))];
        var done = false;
        qEl.querySelectorAll(".opt").forEach(function (b) {
          b.addEventListener("click", function () {
            if (done) return;
            done = true; answered++;
            var txt = b.querySelector("span:last-child").textContent;
            var ok = txt === item.el.meaning;
            if (ok) score++;
            qEl.querySelectorAll(".opt").forEach(function (x) {
              var t2 = x.querySelector("span:last-child").textContent;
              if (t2 === item.el.meaning) x.classList.add("ok");
              else if (x === b) x.classList.add("no");
            });
            var fb = qEl.querySelector("[data-qfb]");
            fb.className = "fb " + (ok ? "ok" : "no");
            fb.textContent = (ok ? "\u2713 Correct" : "\u2717 Incorrect") + " \u2014 " + item.el.tip;
            scoreEl.textContent = score + " / " + chosen.length + " \u00b7 " + answered + " answered";
          });
        });
      });
    }

    host.querySelectorAll("[data-cg]").forEach(function (b) {
      b.addEventListener("click", function () {
        group = b.getAttribute("data-cg");
        host.querySelectorAll("[data-cg]").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        renderCards();
      });
    });
    host.querySelector("[data-calc-start]").addEventListener("click", renderQuiz);

    renderCards();
    renderQuiz();
  }

  window.BSIT_CALC = { mount: mount };
})();
