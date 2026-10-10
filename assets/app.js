/* ===== Настройки — меняйте здесь ===== */
const CONFIG = {
  // Ссылка на форму регистрации (Google Forms, MS Forms и т.п.). Пока пусто — кнопка показывает «скоро».
  registrationUrl: "https://forms.gle/gDgKDPFRtabXVDjP6",
  start: "2026-11-12T10:00:00+05:00",
  end: "2026-11-12T16:00:00+05:00",
  defaultLang: "ru"
};
/* ===================================== */

(function () {
  const C = window.CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const get = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);

  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && C[q]) return q;
    try { const s = localStorage.getItem("atu-lang"); if (s && C[s]) return s; } catch (e) {}
    return CONFIG.defaultLang;
  }

  let lang = pickLang();
  let tick = null;

  function fill(id, items, build) {
    const box = document.getElementById(id);
    box.replaceChildren(...items.map(build));
  }

  function render() {
    const t = C[lang];
    document.documentElement.lang = lang === "kk" ? "kk" : "ru";
    document.title = t.meta.title;
    $('meta[name="description"]').setAttribute("content", t.meta.description);

    document.querySelectorAll("[data-t]").forEach((n) => {
      const v = get(t, n.dataset.t);
      if (typeof v === "string") n.textContent = v;
    });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll("[data-loop]").forEach((n) => (n.textContent = t.hero.loop[+n.dataset.loop]));

    fill("facts", t.hero.facts, ([k, v]) => {
      const d = el("div", "fact");
      d.append(el("dt", null, k), el("dd", null, v));
      return d;
    });

    fill("blocks", t.about.blocks, ([h, p], i) => {
      const li = el("li", "block");
      li.append(el("span", "block__n", "0" + (i + 1)), el("h3", null, h), el("p", null, p));
      return li;
    });
    fill("stats", t.about.stats, ([n, txt, src]) => {
      const li = el("li", "stat");
      li.append(el("strong", null, n), el("p", null, txt), el("small", null, src));
      return li;
    });

    fill("trackList", t.tracks.list, (tr, i) => {
      const a = el("article", "track" + (tr.pending ? " track--pending" : ""));
      const head = el("header", "track__head");
      head.append(el("span", "track__num", "0" + (i + 1)), el("span", "track__en", tr.en));
      if (tr.pending) head.append(el("span", "badge", t.tracks.soon));
      a.append(head, el("h3", "track__name", tr.name));
      const body = el("div", "track__body");
      if (!tr.pending) body.append(el("p", "track__label", t.tracks.problem));
      body.append(el("p", null, tr.problem));
      if (tr.task) {
        body.append(el("p", "track__label", t.tracks.task), el("p", null, tr.task));
      }
      if (tr.directions) {
        const ol = el("ol", "dirs");
        tr.directions.forEach(([h, p]) => {
          const li = el("li");
          li.append(el("b", null, h), el("span", null, p));
          ol.append(li);
        });
        body.append(ol);
      }
      const tags = el("ul", "tags");
      tr.tags.forEach((x) => tags.append(el("li", null, x)));
      a.append(body, tags);
      return a;
    });

    fill("formatSteps", t.format.steps, ([h, p]) => {
      const li = el("li");
      li.append(el("h3", null, h), el("p", null, p));
      return li;
    });
    fill("needList", t.format.need, (x) => el("li", null, x));

    fill("timeline", t.schedule.items, ([time, h, p, kind]) => {
      const li = el("li", "tl" + (kind ? " tl--" + kind : ""));
      const [a, b] = time.split("–");
      li.dataset.start = a;
      li.dataset.end = b;
      const tm = el("time", "tl__time", time);
      const box = el("div", "tl__box");
      box.append(el("h3", null, h), el("p", null, p));
      li.append(tm, el("span", "tl__dot"), box);
      return li;
    });
    markNow();

    fill("stages", t.schedule.stages, ([h, p], i) => {
      const li = el("li");
      li.append(el("span", "stage__n", String(i + 1)), el("h3", null, h), el("p", null, p));
      return li;
    });

    fill("critList", t.criteria.list, ([h, p, pts]) => {
      const li = el("li", "crit__row");
      const top = el("div", "crit__top");
      top.append(el("h3", null, h), el("span", "crit__pts", pts + " " + t.criteria.points));
      const bar = el("div", "crit__bar");
      const fillBar = el("span");
      fillBar.style.setProperty("--w", (pts / 20) * 100 + "%");
      bar.append(fillBar);
      li.append(top, bar, el("p", null, p));
      return li;
    });
    fill("penList", t.criteria.penalties, ([n, p]) => {
      const li = el("li");
      li.append(el("b", null, n), el("span", null, p));
      return li;
    });
    fill("slides", t.criteria.pitch, (x, i) => {
      const li = el("li");
      li.append(el("span", null, String(i + 1).padStart(2, "0")), el("p", null, x));
      return li;
    });

    fill("podium", t.prizes.places, ([place, sum, dip], i) => {
      const li = el("li", "podium__" + (i + 1));
      li.append(el("span", "podium__place", place), el("strong", null, sum), el("span", "podium__dip", dip));
      return li;
    });
    fill("noms", t.prizes.noms, (x) => el("li", null, x));
    fill("after", t.prizes.after, (x) => el("li", null, x));

    fill("dates", t.register.dates, ([d, p]) => {
      const li = el("li");
      li.append(el("b", null, d), el("span", null, p));
      return li;
    });
    fill("formList", t.register.form, (x) => el("li", null, x));
    const btn = $("#regBtn");
    if (CONFIG.registrationUrl) {
      btn.href = CONFIG.registrationUrl;
      btn.textContent = t.register.button + " →";
      btn.removeAttribute("aria-disabled");
    } else {
      btn.removeAttribute("href");
      btn.textContent = t.register.pending;
      btn.setAttribute("aria-disabled", "true");
    }

    fill("orgList", t.org.list, ([h, p]) => {
      const li = el("li");
      li.append(el("h3", null, h), el("p", null, p));
      return li;
    });

    fill("faqList", t.faq.list, ([q, a]) => {
      const d = el("details", "qa");
      d.append(el("summary", null, q), el("p", null, a));
      return d;
    });

    startCountdown();
  }

  function startCountdown() {
    const t = C[lang].hero;
    const box = $("#countdown .countdown__cells");
    const label = $("#countdown .countdown__label");
    const start = new Date(CONFIG.start).getTime();
    const end = new Date(CONFIG.end).getTime();
    clearInterval(tick);
    const cells = t.units.map((u) => {
      const c = el("div", "cd");
      const n = el("span", "cd__n", "00");
      c.append(n, el("span", "cd__u", u));
      return { c, n };
    });
    box.replaceChildren(...cells.map((x) => x.c));
    function upd() {
      const now = Date.now();
      if (now >= end) { label.textContent = t.ended; box.hidden = true; clearInterval(tick); return; }
      if (now >= start) { label.textContent = t.live; box.hidden = true; markNow(); return; }
      label.textContent = t.countdownLabel;
      box.hidden = false;
      let s = Math.floor((start - now) / 1000);
      const v = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
      v.forEach((x, i) => (cells[i].n.textContent = String(x).padStart(2, "0")));
    }
    upd();
    tick = setInterval(upd, 1000);
  }

  // Подсвечивает текущий блок программы в день хакатона (по времени Алматы)
  function markNow() {
    const now = new Date();
    const almaty = new Date(now.getTime() + (now.getTimezoneOffset() + 300) * 60000);
    const day = almaty.getFullYear() === 2026 && almaty.getMonth() === 10 && almaty.getDate() === 12;
    const mins = almaty.getHours() * 60 + almaty.getMinutes();
    const toM = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
    document.querySelectorAll(".tl").forEach((li) => {
      const on = day && mins >= toM(li.dataset.start) && mins < toM(li.dataset.end);
      li.classList.toggle("is-now", on);
    });
  }

  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      try { localStorage.setItem("atu-lang", lang); } catch (e) {}
      const u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState(null, "", u);
      render();
    })
  );

  const burger = $(".burger");
  const nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
  });

  window.addEventListener("scroll", () => document.body.classList.toggle("scrolled", window.scrollY > 8), { passive: true });

  render();
})();
