// Light / night mode switch. Loaded in <head> on both pages so the saved
// theme is applied before the page is drawn (no white flash).
// Light is the default; the choice is remembered in this browser.

(function () {
  var KEY = "voltgo-theme";

  function readSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* storage blocked: ignore */ }
  }

  var root = document.documentElement;
  root.setAttribute("data-theme", readSaved() === "dark" ? "dark" : "light");

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("themeToggle");
    if (!button) return;

    function refresh() {
      var dark = root.getAttribute("data-theme") === "dark";
      button.setAttribute("aria-pressed", dark ? "true" : "false");
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to night mode");
    }

    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      refresh();
    });

    refresh();
  });
})();
