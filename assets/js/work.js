(() => {
  "use strict";

  const gallery = document.querySelector("[data-work-gallery]");
  const track = document.querySelector("[data-work-track]");

  if (!gallery || !track) return;

  const canonicalSet = track.querySelector('.work-set');
  let projects = [];

  const setCount = 3;
  const mobileQuery = matchMedia("(max-width: 440px)");
  let mobileMode = mobileQuery.matches;
  let setWidth = 0;
  let ignoreClickUntil = 0;
  let pointerIsDown = false;
  let isDragging = false;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startingScrollLeft = 0;
  let recenterFrame = null;
  const returnKey = `at:work-return:${location.pathname}`;

  function restorePosition() {
    if (sessionStorage.getItem(`${returnKey}:pending`) !== "1") return;
    sessionStorage.removeItem(`${returnKey}:pending`);
    let state;
    try { state = JSON.parse(sessionStorage.getItem(returnKey)); } catch { /* Ignore stale navigation state. */ }
    sessionStorage.removeItem(returnKey);
    if (!state) return;
    const target = Array.from(track.querySelectorAll(`.work-set[data-clone-set="${mobileMode ? 0 : 1}"] .work-card`))
      .find(card => card.dataset.slug === state.visibleSlug);
    if (mobileMode) {
      const restore = () => window.scrollTo(0, state.mobile ? state.scrollY : target?.offsetTop || 0);
      restore();
      target?.querySelector("img")?.decode?.().then(restore).catch(restore);
    } else if (state.mobile || state.viewportWidth !== innerWidth) {
      if (target) gallery.scrollLeft = target.offsetLeft - (gallery.clientWidth - target.offsetWidth) / 2;
    } else {
      gallery.scrollLeft = state.scrollLeft;
    }
    if (!mobileMode && innerWidth >= 1033) setActiveCard(target);
  }

  function formatIndex(index) {
    return `( ${index} )`;
  }

  function createCard(project, setIndex) {
    const card = document.createElement("article");
    card.className = "work-card";
    card.dataset.orientation = "landscape";
    card.dataset.slug = project.slug;

    const link = document.createElement("a");
    link.className = "work-card__link";
    link.href = `${project.slug}/`;
    link.setAttribute("aria-label", `${project.title[window.atContent.lang()]}, project ${project.number}`);
    link.dataset.projectSlug = project.slug;

    const index = document.createElement("span");
    index.className = "work-card__index";
    index.textContent = formatIndex(project.number);

    const frame = document.createElement("span");
    frame.className = "work-card__frame";

    const image = document.createElement("img");
    image.className = "work-card__image";
    const cover = `work/${project.id}/${project.cover}`;
    image.src = window.atContent.url(window.atContent.variant(cover, 1000));
    image.srcset = `${image.src} 1000w, ${window.atContent.url(window.atContent.variant(cover, 2000))} 2000w`;
    image.sizes = "(max-width: 440px) 50vw, (max-width: 1032px) 26vw, clamp(292px, 15.45vw, 594px)";
    image.alt = `${project.title[window.atContent.lang()]} project image`;
    image.addEventListener("load", () => { card.dataset.orientation = image.naturalHeight > image.naturalWidth ? "portrait" : "landscape"; });
    image.decoding = "async";
    image.draggable = false;
    image.loading = mobileMode || setIndex !== 1 ? "lazy" : "eager";

    const title = document.createElement("span");
    title.className = "work-card__title";
    title.textContent = project.title[window.atContent.lang()];

    frame.append(image);
    link.append(index, frame, title);
    card.append(link);

    return card;
  }

  function renderProjects() {
    const fragment = document.createDocumentFragment();

    for (let setIndex = 0; setIndex < (mobileMode ? 1 : setCount); setIndex += 1) {
      const useCanonical = setIndex === (mobileMode ? 0 : 1);
      const set = useCanonical ? canonicalSet : document.createElement("div");
      set.className = "work-set";
      set.dataset.cloneSet = String(setIndex);
      if (!useCanonical) projects.forEach(project => set.append(createCard(project, setIndex)));
      else set.querySelectorAll(".work-card__image").forEach(image => {
        image.loading = mobileMode ? "lazy" : "eager";
      });

      fragment.append(set);
    }

    track.replaceChildren(fragment);
  }

  function enhanceCanonicalCards() {
    canonicalSet.querySelectorAll(".work-card").forEach(card => {
      const project = projects.find(item => item.slug === card.dataset.slug);
      const image = card.querySelector(".work-card__image");
      const updateOrientation = () => {
        if (image.naturalWidth) card.dataset.orientation = image.naturalHeight > image.naturalWidth ? "portrait" : "landscape";
      };
      image.addEventListener("load", updateOrientation);
      updateOrientation();
      const lang = window.atContent.lang();
      card.querySelector(".work-card__title").textContent = project.title[lang];
      image.alt = `${project.title[lang]} project image`;
      card.querySelector(".work-card__link").setAttribute("aria-label", `${project.title[lang]}, project ${project.number}`);
    });
  }

  function measureAndCenter() {
    if (mobileMode) { setWidth = 0; gallery.scrollLeft = 0; return; }
    setWidth = track.scrollWidth / setCount;
    gallery.scrollLeft = setWidth;
  }

  function recenterIfNeeded() {
    recenterFrame = null;
    if (mobileMode || !setWidth) return;

    const lower = setWidth * 0.5;
    const upper = setWidth * 1.5;

    if (gallery.scrollLeft < lower) {
      gallery.scrollLeft += setWidth;
      return;
    }

    if (gallery.scrollLeft > upper) {
      gallery.scrollLeft -= setWidth;
    }
  }

  function requestRecenter() {
    if (recenterFrame !== null) return;
    recenterFrame = window.requestAnimationFrame(recenterIfNeeded);
  }

  function setActiveCard(card) {
    document.querySelectorAll(".work-card.is-active").forEach(activeCard => {
      activeCard.classList.remove("is-active");
    });

    if (card) card.classList.add("is-active");
  }

  gallery.addEventListener("scroll", () => { if (!mobileMode) requestRecenter(); }, { passive: true });

  gallery.addEventListener("wheel", event => {
    if (mobileMode) return;
    const isMostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);

    if (!isMostlyVertical) return;

    event.preventDefault();
    gallery.scrollLeft += event.deltaY;
    requestRecenter();
  }, { passive: false });

  gallery.addEventListener("pointerdown", event => {
    if (mobileMode || event.pointerType !== "mouse" || event.button !== 0) return;

    pointerIsDown = true;
    isDragging = false;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    startingScrollLeft = gallery.scrollLeft;
  });

  gallery.addEventListener("pointermove", event => {
    if (!pointerIsDown || event.pointerId !== pointerId) return;

    const distanceX = event.clientX - pointerStartX;
    const distanceY = event.clientY - pointerStartY;

    if (!isDragging) {
      const movedFarEnough = Math.abs(distanceX) >= 12;
      const movementIsHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

      if (!movedFarEnough || !movementIsHorizontal) return;

      isDragging = true;
      gallery.classList.add("is-dragging");
      gallery.setPointerCapture(event.pointerId);
    }

    gallery.scrollLeft = startingScrollLeft - distanceX;
    requestRecenter();
  });

  function finishPointerInteraction(event) {
    if (!pointerIsDown || event.pointerId !== pointerId) return;

    const completedDrag = isDragging;

    pointerIsDown = false;
    isDragging = false;
    pointerId = null;
    gallery.classList.remove("is-dragging");

    if (gallery.hasPointerCapture(event.pointerId)) {
      gallery.releasePointerCapture(event.pointerId);
    }

    if (completedDrag) {
      ignoreClickUntil = performance.now() + 120;
    }
  }

  gallery.addEventListener("pointerup", finishPointerInteraction);
  gallery.addEventListener("pointercancel", finishPointerInteraction);
  gallery.addEventListener("pointerleave", event => {
    if (pointerIsDown && !isDragging && event.pointerId === pointerId) {
      pointerIsDown = false;
      pointerId = null;
    }
  });

  track.addEventListener("click", event => {
    const link = event.target.closest(".work-card__link");
    if (!link) return;

    if (performance.now() < ignoreClickUntil) {
      event.preventDefault();
      return;
    }

    setActiveCard(link.closest(".work-card"));
    const cards = Array.from(track.querySelectorAll(mobileMode ? '.work-card' : '.work-set[data-clone-set="1"] .work-card'));
    const center = mobileMode ? innerHeight / 2 : gallery.scrollLeft + gallery.clientWidth / 2;
    const visible = cards.reduce((nearest, card) => {
      const distance = mobileMode
        ? Math.abs(card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2 - center)
        : Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      return !nearest || distance < nearest.distance ? { card, distance } : nearest;
    }, null)?.card;
    sessionStorage.setItem(returnKey, JSON.stringify({
      scrollLeft: gallery.scrollLeft, scrollY: window.scrollY, mobile: mobileMode,
      viewportWidth: innerWidth, visibleSlug: visible?.dataset.slug || link.dataset.projectSlug,
      projectSlug: link.dataset.projectSlug
    }));
  });

  track.addEventListener("pointerenter", event => {
    const card = event.target.closest(".work-card");
    if (!mobileMode && innerWidth >= 1033 && card) setActiveCard(card);
  }, true);

  track.addEventListener("pointerleave", event => {
    if (innerWidth >= 1033 && (!event.relatedTarget || !track.contains(event.relatedTarget))) {
      setActiveCard(null);
    }
  }, true);

  window.addEventListener("resize", () => {
    if (innerWidth < 1033) setActiveCard(null);
    const nextMobile = mobileQuery.matches;
    if (nextMobile !== mobileMode) {
      mobileMode = nextMobile;
      track.replaceChildren();
      setActiveCard(null);
      renderProjects();
      if (mobileMode) window.scrollTo(0, 0);
    }
    window.requestAnimationFrame(measureAndCenter);
  });

  document.addEventListener("at:language", () => {
    track.querySelectorAll(".work-card").forEach(card => {
      const project = projects.find(item => item.slug === card.dataset.slug);
      const lang = window.atContent.lang();
      card.querySelector(".work-card__title").textContent = project.title[lang];
      card.querySelector(".work-card__image").alt = `${project.title[lang]} project image`;
      card.querySelector(".work-card__link").setAttribute("aria-label", `${project.title[lang]}, project ${project.number}`);
    });
  });
  Promise.all(Array.from({ length: 21 }, (_, i) => window.atContent.load(`work/atte-work-${String(i + 1).padStart(2, "0")}/content.json`)))
    .then(items => { projects = items.sort((a, b) => a.number - b.number); enhanceCanonicalCards(); renderProjects(); requestAnimationFrame(() => { measureAndCenter(); restorePosition(); }); })
    .catch(error => console.error("Work content", error));
})();
