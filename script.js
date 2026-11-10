const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Tema claro / oscuro (se recuerda en el navegador) ----------
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
  sky.recolor();
});

// ---------- Saludo, fecha y reloj ----------
const greeting = document.getElementById("greeting");
const dateEl = document.getElementById("date");
const clock = document.getElementById("clock");

function updateTime() {
  const now = new Date();
  const h = now.getHours();
  greeting.textContent = h < 6 ? "Buenas noches" : h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const fecha = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  dateEl.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  clock.textContent = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
updateTime();
// Se sincroniza con el cambio de minuto
setTimeout(() => { updateTime(); setInterval(updateTime, 60000); }, (60 - new Date().getSeconds()) * 1000);

// ---------- Tarjetas: luz que sigue al cursor + inclinación 3D ----------
const cards = [...document.querySelectorAll(".app")];
const canHover = window.matchMedia("(hover: hover)").matches;

cards.forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    if (canHover && !reduceMotion) {
      card.style.setProperty("--ry", `${((x / r.width) - 0.5) * 7}deg`);
      card.style.setProperty("--rx", `${((y / r.height) - 0.5) * -7}deg`);
    }
  });
  card.addEventListener("pointerenter", () => sky.focus(getComputedStyle(card).getPropertyValue("--accent")));
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
    sky.focus(null);
  });
});

// ---------- Búsqueda y atajos ----------
const appsEl = document.getElementById("apps");
const search = document.getElementById("search");
const empty = document.getElementById("empty");
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function matches() {
  return cards.filter((c) => c.classList.contains("is-match"));
}

function filter() {
  const q = norm(search.value);
  appsEl.classList.toggle("is-filtering", q.length > 0);
  let first = true;
  cards.forEach((c) => {
    const ok = !q || norm(c.dataset.search).includes(q);
    c.classList.toggle("is-match", ok && !!q);
    c.classList.toggle("is-first", ok && !!q && first);
    if (ok && q) first = false;
  });
  empty.hidden = !q || matches().length > 0;
}

function launch(card) {
  if (!card) return;
  card.classList.add("is-launching");
  const link = card.querySelector(".app__link");
  setTimeout(() => { window.location.href = link.href; }, reduceMotion ? 0 : 160);
}

search.addEventListener("input", filter);
search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") launch(matches()[0]);
  if (e.key === "Escape") { search.value = ""; filter(); search.blur(); }
});

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const typing = e.target.closest("input, textarea, [contenteditable]");
  if (e.key === "/" && !typing) { e.preventDefault(); search.focus(); return; }
  if (!typing && /^[1-9]$/.test(e.key)) launch(cards[Number(e.key) - 1]);
});

// Al volver con "atrás" el navegador puede restaurar la página tal cual
window.addEventListener("pageshow", () => cards.forEach((c) => c.classList.remove("is-launching")));

// ---------- Cielo: constelación viva con los colores de las apps ----------
const sky = (() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const appColors = ["--story", "--core", "--media", "--lifeos", "--food", "--finance", "--blog", "--homelab"];
  let w = 0, h = 0, dpr = 1, stars = [], star = "218,226,253", palette = [];
  let focusColor = null;
  const mouse = { x: -9999, y: -9999 };

  function readColors() {
    const cs = getComputedStyle(root);
    star = cs.getPropertyValue("--star").trim().replace(/\s+/g, "");
    palette = appColors.map((v) => cs.getPropertyValue(v).trim());
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(36, (w * h) / 14000)));
    stars = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * 1.3 + 0.4,
      tw: Math.random() * Math.PI * 2,
      // Una estrella por app, más grande y con su color
      app: i < appColors.length ? i : -1,
    }));
    stars.forEach((s) => { if (s.app >= 0) s.r = 2.4; });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const link = Math.min(150, Math.max(100, w / 10));

    for (const s of stars) {
      if (!reduceMotion) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < -20) s.x = w + 20; else if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20; else if (s.y > h + 20) s.y = -20;
        // El cursor atrae un poco a las estrellas cercanas
        const dx = mouse.x - s.x, dy = mouse.y - s.y, d = Math.hypot(dx, dy);
        if (d < 180 && d > 1) { s.x += (dx / d) * 0.25; s.y += (dy / d) * 0.25; }
      }
    }

    // Líneas entre estrellas cercanas (y hacia el cursor)
    ctx.lineWidth = 1;
    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      for (let j = i + 1; j < stars.length; j++) {
        const b = stars[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.strokeStyle = `rgba(${star},${(1 - d / link) * 0.16})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 190) {
        ctx.strokeStyle = focusColor || `rgba(${star},0.5)`;
        ctx.globalAlpha = (1 - dm / 190) * 0.55;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    for (const s of stars) {
      const tw = reduceMotion ? 0.8 : 0.55 + Math.sin(t / 900 + s.tw) * 0.35;
      if (s.app >= 0) {
        const c = palette[s.app];
        ctx.globalAlpha = 0.25 * tw;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = `rgba(${star},${tw * 0.7})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  let raf = 0;
  function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && !reduceMotion) raf = requestAnimationFrame(loop); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  readColors(); resize();
  if (reduceMotion) draw(0); else start();

  window.addEventListener("resize", () => { resize(); if (reduceMotion) draw(0); });
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  return {
    recolor() { readColors(); if (reduceMotion) draw(0); },
    focus(color) { focusColor = color ? color.trim() : null; },
  };
})();

// ---------- Órbita: resalta la app de la tarjeta bajo el cursor ----------
const orbit = document.querySelector(".orbit");
if (orbit) {
  const orbitIcons = [...orbit.querySelectorAll("img[data-app]")];
  cards.forEach((card, i) => {
    const on = () => { orbit.classList.add("has-focus"); orbitIcons[i]?.classList.add("is-on"); };
    const off = () => { orbit.classList.remove("has-focus"); orbitIcons[i]?.classList.remove("is-on"); };
    card.addEventListener("pointerenter", on);
    card.addEventListener("pointerleave", off);
    card.addEventListener("focusin", on);
    card.addEventListener("focusout", off);
  });
}
