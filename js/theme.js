// Apply the selected theme before the page is drawn. The query parameter also
// carries the choice between pages opened from file://, where storage may differ.

(function () {
  var KEY = "voltgo-theme";

  function readSaved() {
    var fromUrl = new URLSearchParams(location.search).get("theme");
    if (fromUrl === "dark" || fromUrl === "light") return fromUrl;
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* storage blocked: ignore */ }
  }

  function carryThemeOnLinks(theme) {
    document.querySelectorAll("a[href]").forEach(function (link) {
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      try {
        var destination = new URL(link.href, location.href);
        var folder = new URL(".", location.href);
        if (destination.protocol !== location.protocol || destination.host !== location.host || !destination.pathname.startsWith(folder.pathname)) return;
        destination.searchParams.set("theme", theme);
        link.href = destination.href;
      } catch (e) { /* Ignore non-page links. */ }
    });
  }

  var root = document.documentElement;
  root.setAttribute("data-theme", readSaved() === "light" ? "light" : "dark");

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
      var currentUrl = new URL(location.href);
      currentUrl.searchParams.set("theme", next);
      history.replaceState(null, "", currentUrl.href);
      carryThemeOnLinks(next);
      refresh();
    });

    carryThemeOnLinks(root.getAttribute("data-theme"));
    refresh();
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== KEY || (event.newValue !== "light" && event.newValue !== "dark")) return;
    root.setAttribute("data-theme", event.newValue);
    carryThemeOnLinks(event.newValue);
    var button = document.getElementById("themeToggle");
    if (button) {
      var dark = event.newValue === "dark";
      button.setAttribute("aria-pressed", dark ? "true" : "false");
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to night mode");
    }
  });
})();
