(() => {
  "use strict";

  const itemPool = [
    { id: "white", image: "../assets/images/action-white.webp", alt: "White sculptural artwork on dark ground", width: 748, height: 919 },
    { id: "blue", image: "../assets/images/action-blue.webp", alt: "Blue painted graphic detail", width: 678, height: 1208 },
    { id: "relief", image: "../assets/images/action-relief.webp", alt: "White embossed artwork on a tree", width: 1054, height: 1329 }
  ];
  // Authored descriptions and distinct collections have not been supplied yet.
  const collections = ["00", "01", "02", "03"].map(id => ({ id, label: id, description: "", items: itemPool }));
  const desktopQuery = matchMedia("(min-width: 1033px)");
  const tabs = document.querySelector("[data-actions-tabs]");
  const subtitle = document.querySelector("[data-actions-subtitle]");
  const container = document.querySelector("[data-actions-collections]");
  const overlay = document.querySelector("[data-actions-overlay]");
  const overlayImage = document.querySelector("[data-actions-image]");
  const mediaZone = document.querySelector("[data-actions-media]");
  const cursor = document.querySelector("[data-actions-cursor]");
  const closeButton = document.querySelector("[data-actions-close]");
  if (!tabs || !container || !overlay || !mediaZone) return;

  const batchSize = 10;
  const maxBatches = 4;
  const finiteOrder = ["white", "blue", "relief", "blue", "relief", "blue", "white", "blue", "white"];
  let activeCollection = collections[0];
  let currentItemIndex = -1;
  let lastItemId = null;
  let batchCount = 0;
  let scrollFrame = null;
  let savedScrollY = 0;
  let opener = null;
  let desktopMode = desktopQuery.matches;

  function itemById(id) { return activeCollection.items.find(item => item.id === id); }

  function randomizedItems(count) {
    const result = [];
    for (let i = 0; i < count; i += 1) {
      const choices = activeCollection.items.filter(item => item.id !== lastItemId);
      const item = choices[Math.floor(Math.random() * choices.length)] || activeCollection.items[0];
      result.push(item);
      lastItemId = item.id;
    }
    return result;
  }

  function makeItem(item, eager) {
    const button = document.createElement("button");
    button.className = "actions-item";
    button.type = "button";
    button.dataset.itemId = item.id;
    button.setAttribute("aria-label", `Open ${item.alt}`);
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.alt;
    image.width = item.width;
    image.height = item.height;
    image.loading = eager ? "eager" : "lazy";
    image.decoding = "async";
    button.append(image);
    return button;
  }

  function makeBatch() {
    const batch = document.createElement("div");
    batch.className = "actions-grid";
    batch.dataset.batch = String(batchCount++);
    const items = batchCount === 1
      ? finiteOrder.concat(["blue"]).map(itemById)
      : randomizedItems(batchSize);
    if (batchCount === 1) lastItemId = items.at(-1).id;
    items.forEach((item, index) => batch.append(makeItem(item, batchCount === 1 && index < 5)));
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

  function renderCollection(resetScroll = false) {
    lastItemId = null;
    batchCount = 0;
    renderTabs();
    subtitle.textContent = activeCollection.description || "";
    subtitle.hidden = !activeCollection.description;
    container.replaceChildren();
    if (desktopMode) {
      for (let i = 0; i < 3; i += 1) makeBatch();
    } else {
      const grid = document.createElement("div");
      grid.className = "actions-grid";
      finiteOrder.forEach((id, index) => grid.append(makeItem(itemById(id), index < 3)));
      container.append(grid);
    }
    if (resetScroll) window.scrollTo(0, 0);
  }

  function maintainWindow() {
    scrollFrame = null;
    if (!desktopMode || !overlay.hidden) return;
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

  function preloadAdjacent() {
    [-1, 1].forEach(offset => {
      const item = activeCollection.items[currentItemIndex + offset];
      if (item) { const image = new Image(); image.src = item.image; }
    });
  }

  function showItem(index) {
    if (index < 0 || index >= activeCollection.items.length) return;
    currentItemIndex = index;
    const item = activeCollection.items[index];
    overlayImage.src = item.image;
    overlayImage.alt = item.alt;
    overlay.setAttribute("aria-label", `${item.alt}, item ${index + 1} of ${activeCollection.items.length}`);
    preloadAdjacent();
    cursor.style.opacity = "0";
  }

  function openItem(item, button) {
    opener = button;
    savedScrollY = window.scrollY;
    showItem(activeCollection.items.indexOf(item));
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
    cursor.style.opacity = "0";
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
    if (!tab) return;
    activeCollection = collections.find(collection => collection.id === tab.dataset.collectionId);
    renderCollection(true);
  });
  container.addEventListener("click", event => {
    const button = event.target.closest(".actions-item");
    if (button) openItem(itemById(button.dataset.itemId), button);
  });
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeOverlay();
  });
  mediaZone.addEventListener("click", event => {
    if (event.target.closest("button, a")) return;
    const direction = event.clientX < innerWidth / 2 ? -1 : 1;
    showItem(currentItemIndex + direction);
  });
  mediaZone.addEventListener("pointermove", event => {
    if (!desktopMode || !matchMedia("(pointer:fine)").matches) return;
    const direction = event.clientX < innerWidth / 2 ? -1 : 1;
    const available = currentItemIndex + direction >= 0 && currentItemIndex + direction < activeCollection.items.length;
    cursor.textContent = direction < 0 ? "←" : "→";
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = available ? "1" : "0";
  });
  mediaZone.addEventListener("pointerleave", () => { cursor.style.opacity = "0"; });
  closeButton.addEventListener("click", closeOverlay);
  window.addEventListener("keydown", event => {
    if (overlay.hidden) return;
    if (event.key === "Escape") closeOverlay();
    if (event.key === "ArrowLeft") showItem(currentItemIndex - 1);
    if (event.key === "ArrowRight") showItem(currentItemIndex + 1);
  });
  window.addEventListener("scroll", () => {
    if (desktopMode && scrollFrame === null) scrollFrame = requestAnimationFrame(maintainWindow);
  }, { passive: true });
  desktopQuery.addEventListener("change", () => {
    desktopMode = desktopQuery.matches;
    renderCollection();
  });
  renderCollection();
})();
