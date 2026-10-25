// Tema claro / oscuro (se recuerda en el navegador)
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch { return null; }
}

const initialTheme =
  getSavedTheme() ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
root.dataset.theme = initialTheme;

toggle.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
});

// Saludo, fecha y reloj
const greeting = document.getElementById("greeting");
const dateEl = document.getElementById("date");
const clock = document.getElementById("clock");

function updateTime() {
  const now = new Date();
  const h = now.getHours();
  greeting.textContent = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const fecha = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  dateEl.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  clock.textContent = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
updateTime();
setInterval(updateTime, 1000 * 30);

// Efecto de luz que sigue al cursor en las tarjetas
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// Despierta el servidor de Render (plan gratis se duerme) en cuanto abres el índice
document.querySelectorAll("[data-wake]").forEach((el) => {
  fetch(el.dataset.wake, { mode: "no-cors", cache: "no-store" }).catch(() => {});
});
