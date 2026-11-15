// Read the theme before the page is drawn to prevent a flash of the wrong mode.
const themeKey = "voltgo-theme";
const root = document.documentElement;
const queryTheme = new URLSearchParams(location.search).get("theme");
let theme = queryTheme === "light" || queryTheme === "dark" ? queryTheme : "dark";

try {
  if (!queryTheme) theme = localStorage.getItem(themeKey) === "light" ? "light" : "dark";
} catch (error) {
  // The URL still lets the chosen theme travel between pages if storage is blocked.
}
root.dataset.theme = theme;

function updateThemeButton() {
  const button = document.getElementById("themeToggle");
  if (!button) return;
  const isDark = root.dataset.theme === "dark";
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to night mode");
}

function addThemeToLinks() {
  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin) return;
    destination.searchParams.set("theme", root.dataset.theme);
    link.href = destination.href;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateThemeButton();
  addThemeToLinks();
  const button = document.getElementById("themeToggle");
  if (!button) return;
  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(themeKey, root.dataset.theme); } catch (error) {}
    const url = new URL(location.href);
    url.searchParams.set("theme", root.dataset.theme);
    history.replaceState(null, "", url.href);
    addThemeToLinks();
    updateThemeButton();
  });
});

window.addEventListener("storage", (event) => {
  if (event.key !== themeKey || !["light", "dark"].includes(event.newValue)) return;
  root.dataset.theme = event.newValue;
  addThemeToLinks();
  updateThemeButton();
});
