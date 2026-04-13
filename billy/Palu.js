const state = {
  credits: Number(localStorage.getItem("fa_credits") || 1250),
  timer: null,
};

function setActiveNav() {
  const current = document.body.dataset.page;
  document.querySelectorAll(".nav a").forEach((link) => {
    if (link.dataset.page === current) {
      link.classList.add("active");
    }
  });
}

function wireMobileMenu() {
  const btn = document.getElementById("mobile-menu-toggle");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;
  btn.addEventListener("click", () => sidebar.classList.toggle("open"));
}

function setYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function setupStudentDashboard() {
  const checks = document.querySelectorAll("[data-assignment-check]");
  const progressFill = document.getElementById("assignment-progress");
  const progressText = document.getElementById("assignment-progress-text");
  if (!checks.length || !progressFill || !progressText) return;

  function recalc() {
    const done = [...checks].filter((c) => c.checked).length;
    const pct = Math.round((done / checks.length) * 100);
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${pct}% complete`;
  }

  checks.forEach((c) => c.addEventListener("change", recalc));
  recalc();
}

function setupAssessment() {
  const root = document.getElementById("assessment-app");
  if (!root) return;

  const questions = [
    { q: "Which fraction is equivalent to 3/4?", opts: ["6/10", "9/12", "4/3", "12/15"], answer: 1 },
    { q: "Solve: 6x = 42", opts: ["x = 6", "x = 7", "x = 8", "x = 9"], answer: 1 },
    { q: "What is 30% of 200?", opts: ["20", "40", "60", "80"], answer: 2 },
  ];

  let idx = 0;
  const picks = new Array(questions.length).fill(null);
  let seconds = 15 * 60;

  const qText = document.getElementById("q-text");
  const options = document.getElementById("q-options");
  const meta = document.getElementById("q-meta");
  const timer = document.getElementById("timer");
  const next = document.getElementById("next-q");
  const prev = document.getElementById("prev-q");

  function render() {
    const q = questions[idx];
    meta.textContent = `Question ${idx + 1} of ${questions.length}`;
    qText.textContent = q.q;
    options.innerHTML = "";
    q.opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = `quiz-option ${picks[idx] === i ? "selected" : ""}`;
      b.textContent = o;
      b.addEventListener("click", () => {
        picks[idx] = i;
        render();
      });
      options.appendChild(b);
    });
    prev.disabled = idx === 0;
    next.textContent = idx === questions.length - 1 ? "Submit" : "Next";
  }

  function finish() {
    let score = 0;
    picks.forEach((p, i) => {
      if (p === questions[i].answer) score += 1;
    });
    const pct = Math.round((score / questions.length) * 100);
    localStorage.setItem("fa_last_score", String(pct));
    root.innerHTML = `<div class="card"><h2>Assessment Complete</h2><p>You scored <strong>${pct}%</strong>.</p><a class="btn btn-primary" href="progress-rewards.html">View rewards</a></div>`;
    clearInterval(state.timer);
  }

  next.addEventListener("click", () => {
    if (idx === questions.length - 1) {
      finish();
      return;
    }
    idx += 1;
    render();
  });

  prev.addEventListener("click", () => {
    if (idx > 0) idx -= 1;
    render();
  });

  state.timer = setInterval(() => {
    seconds -= 1;
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    timer.textContent = `${mm}:${ss}`;
    if (seconds <= 0) finish();
  }, 1000);

  render();
}

function setupRewards() {
  const creditText = document.getElementById("credits");
  if (!creditText) return;

  function renderCredits() {
    creditText.textContent = `${state.credits} credits`;
    localStorage.setItem("fa_credits", String(state.credits));
  }

  document.querySelectorAll("[data-cost]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cost = Number(btn.dataset.cost || 0);
      if (cost > state.credits) {
        btn.textContent = "Not enough credits";
        return;
      }
      state.credits -= cost;
      btn.disabled = true;
      btn.textContent = "Purchased";
      renderCredits();
    });
  });

  const lastScore = Number(localStorage.getItem("fa_last_score") || 0);
  const scoreText = document.getElementById("last-score");
  if (scoreText) scoreText.textContent = `${lastScore}%`;

  renderCredits();
}

function setupAdminDashboard() {
  const periodBtns = document.querySelectorAll("[data-period]");
  const bars = document.querySelectorAll(".metric-bar");
  const filter = document.getElementById("alert-filter");
  const rows = document.querySelectorAll("[data-alert-status]");

  if (periodBtns.length && bars.length) {
    const sets = {
      daily: [35, 48, 42, 58, 62, 70, 66],
      monthly: [40, 52, 49, 67, 64, 82, 88],
      yearly: [50, 63, 67, 71, 80, 90, 96],
    };

    function updateBars(period) {
      const vals = sets[period];
      bars.forEach((bar, i) => {
        bar.style.height = `${vals[i]}%`;
      });
    }

    periodBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        periodBtns.forEach((x) => x.classList.remove("btn-primary"));
        periodBtns.forEach((x) => x.classList.add("btn-secondary"));
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
        updateBars(btn.dataset.period);
      });
    });

    updateBars("monthly");
  }

  if (filter && rows.length) {
    filter.addEventListener("change", () => {
      rows.forEach((r) => {
        if (filter.value === "all" || r.dataset.alertStatus === filter.value) {
          r.style.display = "table-row";
        } else {
          r.style.display = "none";
        }
      });
    });
  }
}

function setupClassManagement() {
  const input = document.getElementById("student-search");
  const rows = document.querySelectorAll("[data-student-row]");
  if (!input || !rows.length) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    rows.forEach((r) => {
      r.style.display = r.dataset.studentRow.includes(q) ? "table-row" : "none";
    });
  });
}

function setupAnalytics() {
  const slider = document.getElementById("heat-threshold");
  const cells = document.querySelectorAll("[data-heat]");
  const readout = document.getElementById("threshold-value");
  if (!slider || !cells.length || !readout) return;

  function apply() {
    const t = Number(slider.value);
    readout.textContent = `${t}%`;
    cells.forEach((cell) => {
      const v = Number(cell.dataset.heat);
      cell.style.opacity = v >= t ? "1" : "0.35";
    });
  }

  slider.addEventListener("input", apply);
  apply();
}

function init() {
  setActiveNav();
  wireMobileMenu();
  setYear();

  const page = document.body.dataset.page;
  if (page === "student") setupStudentDashboard();
  if (page === "assessment") setupAssessment();
  if (page === "rewards") setupRewards();
  if (page === "admin") setupAdminDashboard();
  if (page === "class") setupClassManagement();
  if (page === "analytics") setupAnalytics();
}

document.addEventListener("DOMContentLoaded", init);
