(() => {
  "use strict";

  const toggle = document.querySelector("[data-polarity-toggle]");
  const language = document.querySelector("[data-language-control]");
  document.documentElement.lang = "es";
  document.body.dataset.polarity ||= "dark";
  toggle?.setAttribute("aria-pressed", String(document.body.dataset.polarity === "light"));

  let content;
  function render() {
    if (!content) return;
    const lang = window.atContent.lang();
    const nav = document.querySelector(".site-header__nav");
    nav?.querySelectorAll("a").forEach((link, index) => {
      const item = content.navbar.items[index];
      if (!item) return;
      link.textContent = item.label[lang];
      link.href = new URL(item.href.replace(/^\/+/, ""), window.atContent.site).href;
    });
    const brand = document.querySelector(".site-header__brand");
    if (brand) brand.textContent = content.navbar.brand;
    if (toggle) toggle.textContent = content.footer.theme[document.body.dataset.polarity === "light" ? "light" : "dark"][lang];
    if (language) language.textContent = `${content.footer.language.en}/${content.footer.language.es}`;
  }
  window.atContent.load("global/content.json").then(data => { content = data; render(); }).catch(console.error);

  toggle?.addEventListener("click", () => {
    const light = document.body.dataset.polarity !== "light";
    document.body.dataset.polarity = light ? "light" : "dark";
    toggle.setAttribute("aria-pressed", String(light));
    render();
  });

  language?.addEventListener("click", () => {
    const english = document.documentElement.lang !== "en";
    document.documentElement.lang = english ? "en" : "es";
    language.setAttribute("aria-pressed", String(english));
    render();
    document.dispatchEvent(new CustomEvent("at:language", { detail: { lang: document.documentElement.lang } }));
  });
})();
