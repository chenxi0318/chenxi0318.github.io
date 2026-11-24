// 年份
document.getElementById("year").textContent = new Date().getFullYear();

// 深淺色切換（記住偏好）
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) {}
document.getElementById("themeToggle").addEventListener("click", () => {
  const isDark =
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// 手機選單
const navLinks = document.getElementById("navLinks");
document.getElementById("menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// 捲動淡入
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".section").forEach(s => { s.classList.add("reveal"); io.observe(s); });

// 訪客人次：每個瀏覽器每天（台北時間）只計一次，數字由 Cloudflare Worker 提供
(async () => {
  const box = document.getElementById("visits");
  if (!box) return;
  const day = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
  let counted = false;
  try { counted = localStorage.getItem("visit-day") === day; } catch (e) {}
  try {
    const res = await fetch("/api/visits", { method: counted ? "GET" : "POST" });
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.today !== "number" || typeof data.total !== "number") return;
    try { localStorage.setItem("visit-day", day); } catch (e) {}
    document.getElementById("visitsToday").textContent = data.today.toLocaleString("zh-TW");
    document.getElementById("visitsTotal").textContent = data.total.toLocaleString("zh-TW");
    box.hidden = false;
  } catch (e) { /* 本機預覽或 API 無法連線時不顯示 */ }
})();
