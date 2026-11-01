(() => {
  "use strict";

  const toggle = document.querySelector("[data-polarity-toggle]");
  const language = document.querySelector("[data-language-control]");
  document.documentElement.lang = "es";
  document.body.dataset.polarity = "dark";

  toggle?.addEventListener("click", () => {
    const light = document.body.dataset.polarity !== "light";
    document.body.dataset.polarity = light ? "light" : "dark";
    toggle.setAttribute("aria-pressed", String(light));
  });

  language?.addEventListener("click", () => {
    const english = document.documentElement.lang !== "en";
    document.documentElement.lang = english ? "en" : "es";
    if (toggle) toggle.textContent = english ? "B/W" : "B/N";
    language.setAttribute("aria-pressed", String(english));
  });
})();
