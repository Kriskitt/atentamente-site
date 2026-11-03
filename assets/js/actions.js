(() => {
  "use strict";

  let collections = [];
  const desktopQuery = matchMedia("(min-width: 1033px)");
  const mobileQuery = matchMedia("(max-width: 440px)");
  const tabs = document.querySelector("[data-actions-tabs]");
  const subtitle = document.querySelector("[data-actions-subtitle]");
  const container = document.querySelector("[data-actions-collections]");
  const overlay = document.querySelector("[data-actions-overlay]");
  let overlayMedia = document.querySelector("[data-actions-image]");
  const mediaZone = document.querySelector("[data-actions-media]");
  const cursor = document.querySelector("[data-actions-cursor]");
  const closeButton = document.querySelector("[data-actions-close]");
  if (!tabs || !container || !overlay || !mediaZone) return;

  function updateIntroTop() {
    const header = document.querySelector(".site-header");
    const main = document.querySelector(".actions-main");
    if (innerWidth <= 440 && header) main.style.setProperty("--actions-header-bottom", `${Math.ceil(header.getBoundingClientRect().bottom + 12)}px`);
    else main.style.removeProperty("--actions-header-bottom");
  }
  updateIntroTop();
  window.addEventListener("resize", updateIntroTop);

  const batchSize = 10;
  const maxBatches = 4;
  let activeCollection = null;
  let videoObserver = null;
  let currentItemIndex = -1;
  let lastItemId = null;
  let batchCount = 0;
  let scrollFrame = null;
  let savedScrollY = 0;
  let opener = null;
  let desktopMode = desktopQuery.matches;
  let selectedButton = null;

  function clearSelection() {
    if (!selectedButton) return;
    selectedButton.classList.remove("is-selected");
    selectedButton.setAttribute("aria-pressed", "false");
    selectedButton = null;
  }

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
    button.setAttribute("aria-label", `${mobileQuery.matches ? "Select" : "Open"} ${item.alt}`);
    if (mobileQuery.matches) button.setAttribute("aria-pressed", "false");
    const media = document.createElement(item.video ? "video" : "img");
    media.src = item.src;
    media.setAttribute("aria-label", item.alt);
    if (item.video) { media.muted = true; media.loop = true; media.playsInline = true; media.preload = "none"; }
    else { media.alt = item.alt; media.loading = eager ? "eager" : "lazy"; media.decoding = "async"; }
    button.append(media);
    return button;
  }

  function makeBatch() {
    const batch = document.createElement("div");
    batch.className = "actions-grid";
    batch.dataset.batch = String(batchCount++);
    const items = batchCount === 1 ? activeCollection.items : randomizedItems(batchSize);
    if (batchCount === 1) lastItemId = items.at(-1).id;
    items.forEach((item, index) => batch.append(makeItem(item, batchCount === 1 && index < 5)));
    container.append(batch);
    if (videoObserver) batch.querySelectorAll("video").forEach(video => videoObserver.observe(video));
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
    clearSelection();
    lastItemId = null;
    batchCount = 0;
    renderTabs();
    subtitle.textContent = activeCollection.description[window.atContent.lang()] || "";
    subtitle.hidden = !subtitle.textContent;
    videoObserver?.disconnect();
    container.querySelectorAll("video").forEach(video => video.pause());
    container.replaceChildren();
    if (desktopMode) {
      for (let i = 0; i < 3; i += 1) makeBatch();
    } else {
      const grid = document.createElement("div");
      grid.className = "actions-grid";
      activeCollection.items.forEach((item, index) => grid.append(makeItem(item, index < 3)));
      container.append(grid);
    }
    videoObserver = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && !document.hidden) target.play().catch(() => {}); else target.pause();
    }), { threshold: 0.2 });
    container.querySelectorAll("video").forEach(video => videoObserver.observe(video));
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
      if (item && !item.video) { const image = new Image(); image.src = item.src; }
    });
  }

  function showItem(index) {
    if (index < 0 || index >= activeCollection.items.length) return;
    currentItemIndex = index;
    const item = activeCollection.items[index];
    overlayMedia?.pause?.();
    if (!overlayMedia || overlayMedia.tagName !== (item.video ? "VIDEO" : "IMG")) {
      overlayMedia = document.createElement(item.video ? "video" : "img");
      overlayMedia.className = "actions-overlay__image";
      mediaZone.replaceChildren(overlayMedia);
    }
    overlayMedia.src = item.src;
    if (item.video) { overlayMedia.muted = true; overlayMedia.loop = true; overlayMedia.playsInline = true; overlayMedia.controls = false; overlayMedia.play().catch(() => {}); }
    else overlayMedia.alt = item.alt;
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
    overlayMedia?.pause?.();
    overlayMedia?.removeAttribute("src");
    if (overlayMedia?.tagName === "VIDEO") overlayMedia.load();
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
    if (!button) return;
    if (mobileQuery.matches) {
      if (selectedButton === button) { clearSelection(); return; }
      clearSelection();
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      selectedButton = button;
      return;
    }
    openItem(itemById(button.dataset.itemId), button);
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
  mobileQuery.addEventListener("change", () => {
    clearSelection();
    if (mobileQuery.matches) closeOverlay();
    container.querySelectorAll(".actions-item").forEach(button => {
      const item = itemById(button.dataset.itemId);
      button.setAttribute("aria-label", `${mobileQuery.matches ? "Select" : "Open"} ${item.alt}`);
      if (mobileQuery.matches) button.setAttribute("aria-pressed", "false");
      else button.removeAttribute("aria-pressed");
    });
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { overlayMedia?.pause?.(); container.querySelectorAll("video").forEach(v => v.pause()); } else if (!overlay.hidden && overlayMedia?.tagName === "VIDEO") overlayMedia.play().catch(() => {}); });
  document.addEventListener("at:language", () => {
    updateIntroTop();
    const y = window.scrollY;
    subtitle.textContent = activeCollection?.description[window.atContent.lang()] || "";
    subtitle.hidden = !subtitle.textContent;
    if (activeCollection) renderTabs();
    window.scrollTo(0, y);
  });
  Promise.all(Array.from({ length: 4 }, (_, i) => window.atContent.load(`actions/actions-${String(i).padStart(2, "0")}/content.json`)))
    .then(data => {
      collections = data.sort((a, b) => a.number - b.number).map(collection => ({
        ...collection, label: String(collection.number).padStart(2, "0"),
        items: collection.media.map((name, index) => ({ id: `${collection.id}:${index}`, alt: `${collection.id} media ${index + 1}`,
          src: window.atContent.url(`actions/${collection.id}/${name}`), video: name.endsWith(".webm") }))
      }));
      activeCollection = collections[0]; renderCollection();
    }).catch(error => console.error("Actions content", error));
})();
