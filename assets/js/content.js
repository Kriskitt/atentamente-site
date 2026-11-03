(() => {
  "use strict";
  const root = new URL("../content/", document.currentScript.src);
  const site = new URL("../../", root);
  const pending = new Map();
  const url = path => new URL(path, root).href;
  const load = path => {
    if (!pending.has(path)) pending.set(path, fetch(url(path)).then(response => {
      if (!response.ok) throw new Error(`Content ${path}: ${response.status}`);
      return response.json();
    }));
    return pending.get(path);
  };
  const variant = (name, size) => name.replace(/\.webp$/i, `-${size}.webp`);
  window.atContent = { root, site, url, load, variant, lang: () => document.documentElement.lang === "en" ? "en" : "es" };
})();
