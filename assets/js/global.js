(() => {
  "use strict";

  const languageKey = "atentamente-language";
  const polarityKey = "atentamente-polarity";
  const root = document.documentElement;
  const actionsPage = root.hasAttribute("data-actions-page");
  const stored = key => {
    try { return localStorage.getItem(key); }
    catch { return null; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch { /* Keep the current page usable when storage is unavailable. */ }
  };
  const browserLanguage = navigator.languages?.length ? navigator.languages[0] : navigator.language;
  const savedLanguage = stored(languageKey);
  const savedPolarity = stored(polarityKey);
  root.lang = savedLanguage === "es" || savedLanguage === "en" ? savedLanguage
    : /^es/i.test(browserLanguage || "") ? "es" : "en";
  let globalPolarity = savedPolarity === "light" ? "light" : "dark";
  const applyPolarity = () => {
    root.dataset.polarity = actionsPage
      ? (globalPolarity === "light" ? "dark" : "light") : globalPolarity;
  };
  applyPolarity();

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector("[data-polarity-toggle]");
    const language = document.querySelector("[data-language-control]");
    let content;
    function render() {
      const lang = window.atContent.lang();
      const light = root.dataset.polarity === "light";
      toggle?.setAttribute("aria-pressed", String(globalPolarity === "light"));
      language?.setAttribute("aria-pressed", String(lang === "en"));
      if (toggle) toggle.textContent = lang === "es" ? "B/N" : "B/W";
      root.dataset.interfaceReady = "";
      if (!content) return;
      const nav = document.querySelector(".site-header__nav");
      nav?.querySelectorAll("a").forEach((link, index) => {
        const item = content.navbar.items[index];
        if (!item) return;
        link.textContent = item.label[lang];
        link.href = new URL(item.href.replace(/^\/+/, ""), window.atContent.site).href;
      });
      const brand = document.querySelector(".site-header__brand");
      if (brand) brand.textContent = content.navbar.brand;
      if (toggle) toggle.textContent = content.footer.theme[light ? "light" : "dark"][lang];
      if (language) language.textContent = `${content.footer.language.en}/${content.footer.language.es}`;
    }
    render();
    window.atContent.load("global/content.json")
      .then(data => { content = data; render(); })
      .catch(console.error)
      .finally(() => { root.dataset.contentReady = ""; });

    toggle?.addEventListener("click", () => {
      globalPolarity = globalPolarity === "light" ? "dark" : "light";
      save(polarityKey, globalPolarity);
      applyPolarity();
      render();
    });

    language?.addEventListener("click", () => {
      root.lang = root.lang === "en" ? "es" : "en";
      save(languageKey, root.lang);
      render();
      document.dispatchEvent(new CustomEvent("at:language", { detail: { lang: root.lang } }));
    });
  });
})();
