(() => {
  "use strict";

  const itemPool = [
    { id: "blue", image: "../assets/images/action-blue.webp", alt: "Blue painted graphic detail", width: 678, height: 1208, metadata: {} },
    { id: "relief", image: "../assets/images/action-relief.webp", alt: "White embossed artwork on a tree", width: 1054, height: 1329, metadata: {} },
    { id: "white", image: "../assets/images/action-white.webp", alt: "White sculptural artwork on dark ground", width: 748, height: 919, metadata: {} }
  ];

  // Tabs 01–03 reuse available imagery until their authored collections arrive.
  const collections = ["00", "01", "02", "03"].map(id => ({
    id,
    label: id,
    title: "Random - Discarded proposals",
    items: itemPool
  }));

  const tabs = document.querySelector("[data-actions-tabs]");
  const subtitle = document.querySelector("[data-actions-subtitle]");
  const container = document.querySelector("[data-actions-collections]");
  const overlay = document.querySelector("[data-actions-overlay]");
  const overlayImage = document.querySelector("[data-actions-image]");
  const closeButton = document.querySelector("[data-actions-close]");
  if (!tabs || !container || !overlay) return;

  const batchSize = 10;
  const maxBatches = 4;
  let activeCollection = collections[0];
  let lastItemId = null;
  let batchCount = 0;
  let scrollFrame = null;
  let savedScrollY = 0;
  let opener = null;

  function randomizedItems(pool, count) {
    const result = [];
    for (let i = 0; i < count; i += 1) {
      const choices = pool.filter(item => item.id !== lastItemId);
      const source = choices[Math.floor(Math.random() * choices.length)] || pool[0];
      result.push(source);
      lastItemId = source.id;
    }
    return result;
  }

  function makeBatch() {
    const batch = document.createElement("div");
    batch.className = "actions-grid";
    batch.dataset.batch = String(batchCount++);
    const fragment = document.createDocumentFragment();

    const initialOrder = ["white", "blue", "relief", "blue", "white", "blue", "white", "blue", "white", "blue"];
    const items = batchCount === 1
      ? initialOrder.map(id => activeCollection.items.find(item => item.id === id))
      : randomizedItems(activeCollection.items, batchSize);
    if (batchCount === 1) lastItemId = items.at(-1).id;
    items.forEach(item => {
      const button = document.createElement("button");
      button.className = "actions-item";
      button.type = "button";
      button.setAttribute("aria-label", `Open ${item.alt}`);
      button.dataset.itemId = item.id;

      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.alt;
      image.width = item.width;
      image.height = item.height;
      image.loading = batchCount <= 2 ? "eager" : "lazy";
      image.decoding = "async";
      button.append(image);
      fragment.append(button);
    });
    batch.append(fragment);
    container.append(batch);
  }

  function renderTabs() {
    tabs.replaceChildren();
    collections.forEach(collection => {
      const button = document.createElement("button");
      button.className = "actions-tab";
      button.type = "button";
      button.role = "tab";
      button.dataset.collectionId = collection.id;
      button.setAttribute("aria-selected", String(collection === activeCollection));
      button.textContent = collection === activeCollection ? `[ ${collection.label} ]` : collection.label;
      tabs.append(button);
    });
  }

  function activate(collection) {
    if (!collection || collection === activeCollection && container.children.length) return;
    activeCollection = collection;
    lastItemId = null;
    batchCount = 0;
    renderTabs();
    subtitle.textContent = collection.title;
    container.replaceChildren();
    for (let i = 0; i < 3; i += 1) makeBatch();
    window.scrollTo(0, 0);
  }

  function maintainWindow() {
    scrollFrame = null;
    if (!overlay.hidden) return;
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight > doc.scrollHeight - window.innerHeight * 1.5) makeBatch();
    while (container.children.length > maxBatches) {
      const first = container.firstElementChild;
      const second = first.nextElementSibling;
      const shift = second.offsetTop - first.offsetTop;
      if (window.scrollY < second.offsetTop) break;
      first.remove();
      window.scrollTo(0, window.scrollY - shift);
    }
  }

  function openItem(item, button) {
    opener = button;
    savedScrollY = window.scrollY;
    overlayImage.src = item.image;
    overlayImage.alt = item.alt;
    overlay.hidden = false;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    closeButton.focus();
  }

  function closeOverlay() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    overlayImage.removeAttribute("src");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo(0, savedScrollY);
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  tabs.addEventListener("click", event => {
    const tab = event.target.closest("[data-collection-id]");
    if (tab) activate(collections.find(collection => collection.id === tab.dataset.collectionId));
  });

  container.addEventListener("click", event => {
    const button = event.target.closest(".actions-item");
    if (!button) return;
    const item = activeCollection.items.find(source => source.id === button.dataset.itemId);
    if (item) openItem(item, button);
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeOverlay();
  });
  closeButton.addEventListener("click", closeOverlay);
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeOverlay();
  });
  window.addEventListener("scroll", () => {
    if (scrollFrame === null) scrollFrame = requestAnimationFrame(maintainWindow);
  }, { passive: true });

  activate(activeCollection);
})();
