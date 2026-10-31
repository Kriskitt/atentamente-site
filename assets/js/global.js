(() => {
  "use strict";

  const toggle = document.querySelector("[data-polarity-toggle]");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const active = document.body.classList.toggle("is-bw");
    toggle.setAttribute("aria-pressed", String(active));
  });
})();
