(() => {
  "use strict";

  const stage = document.querySelector("[data-ensayo]");
  const scrollArea = document.querySelector("[data-ensayo-scroll]");
  const track = document.querySelector("[data-ensayo-track]");
  const controls = document.querySelector("[data-ensayo-controls]");
  const label = document.querySelector("[data-ensayo-label]");
  const slideList = document.querySelector("[data-ensayo-slide-list]");
  const closeButton = document.querySelector("[data-ensayo-close]");
  const essayButtons = Array.from(document.querySelectorAll("[data-essay-open]"));

  if (!stage || !scrollArea || !track || !controls || !label || !slideList || !closeButton) return;

  const essays = [
    {
      id: 1,
      slug: "forma",
      title: "Forma x Asiel Núñez",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      images: [
        {
          src: "/assets/images/ensayo/forma/03.webp",
          width: 748,
          height: 919,
          alt: "White sculptural form on dark stone"
        },
        {
          src: "/assets/images/ensayo/forma/01.webp",
          width: 678,
          height: 1208,
          alt: "Blue graphic surface detail"
        },
        {
          src: "/assets/images/ensayo/forma/02.webp",
          width: 1054,
          height: 1329,
          alt: "White relief object on weathered wood"
        }
      ]
    },
    {
      id: 2,
      slug: "secuencia",
      title: "Secuencia",
      description: "Secuencia gathers temporary studies of image rhythm, texture, and repetition across a single editorial plane.",
      images: [
        {
          src: "/assets/images/ensayo/secuencia/01.webp",
          width: 2400,
          height: 1080,
          alt: "Long table with arranged objects",
          position: "center center"
        },
        {
          src: "/assets/images/ensayo/secuencia/02.webp",
          width: 2400,
          height: 1080,
          alt: "Editorial table composition",
          position: "center center"
        },
        {
          src: "/assets/images/ensayo/secuencia/03.webp",
          width: 471,
          height: 333,
          alt: "Small landscape study",
          position: "center center"
        }
      ]
    },
    {
      id: 3,
      slug: "metal",
      title: "Metal",
      description: "Metal is a temporary image essay assembled from material, reflection, and restaurant atmosphere studies.",
      images: [
        {
          src: "/assets/images/ensayo/metal/01.webp",
          width: 2048,
          height: 2560,
          alt: "Interior wall and seating detail",
          position: "center center"
        },
        {
          src: "/assets/images/ensayo/metal/02.webp",
          width: 1920,
          height: 1080,
          alt: "Restaurant table scene",
          position: "center center"
        },
        {
          src: "/assets/images/ensayo/metal/03.webp",
          width: 2560,
          height: 1440,
          alt: "Dining room composition",
          position: "center center"
        }
      ]
    }
  ];

  let activeEssay = null;
  let activeSlide = 1;
  let pointerIsDown = false;
  let isDragging = false;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startingScrollLeft = 0;
  let ignoreClickUntil = 0;
  let scrollFrame = null;
  let suppressUrlUpdate = false;

  function getEssay(id) {
    return essays.find(essay => essay.id === Number(id)) || null;
  }

  function formatEssayLabel(id) {
    return `[ Ensayo ${id} ]`;
  }

  function cleanUrl() {
    return `${window.location.pathname}`;
  }

  function stateUrl(essayId, slide) {
    const params = new URLSearchParams();
    params.set("essay", String(essayId));
    params.set("slide", String(slide));
    return `${window.location.pathname}?${params.toString()}`;
  }

  function clampSlide(essay, slide) {
    const requested = Number(slide);
    if (!Number.isFinite(requested)) return 1;
    return Math.min(Math.max(Math.round(requested), 1), essay.images.length);
  }

  function updateIndexState() {
    essayButtons.forEach(button => {
      const isCurrent = activeEssay && Number(button.dataset.essayOpen) === activeEssay.id;
      button.classList.toggle("is-current", Boolean(isCurrent));
      button.setAttribute("aria-pressed", String(Boolean(isCurrent)));
    });
  }

  function updateControls() {
    if (!activeEssay) {
      controls.hidden = true;
      label.textContent = "";
      slideList.replaceChildren();
      return;
    }

    controls.hidden = false;
    label.textContent = formatEssayLabel(activeEssay.id);
    slideList.replaceChildren();

    activeEssay.images.forEach((image, index) => {
      const button = document.createElement("button");
      const slideNumber = index + 1;
      button.type = "button";
      button.textContent = String(slideNumber);
      button.className = "ensayo-slide-button";
      button.dataset.slide = String(slideNumber);
      button.setAttribute("aria-label", `Go to slide ${slideNumber}`);
      button.classList.toggle("is-current", slideNumber === activeSlide);
      button.addEventListener("click", () => {
        goToSlide(slideNumber, true);
      });
      slideList.append(button);
    });
  }

  function createLeadSpace() {
    const lead = document.createElement("div");
    lead.className = "ensayo-lead-space";
    lead.setAttribute("aria-hidden", "true");
    return lead;
  }

  function createSlide(image, index) {
    const slide = document.createElement("figure");
    slide.className = "ensayo-slide";
    slide.dataset.slide = String(index + 1);

    if (image.position) {
      slide.style.setProperty("--image-position", image.position);
    }

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.width = image.width;
    img.height = image.height;
    img.decoding = "async";
    img.draggable = false;
    img.loading = index === 0 ? "eager" : "lazy";

    slide.append(img);
    return slide;
  }

  function createTextPanel(essay) {
    const panel = document.createElement("aside");
    panel.className = "ensayo-text-panel";

    const copy = document.createElement("p");
    copy.className = "ensayo-text-panel__copy";
    copy.textContent = essay.description || "";

    panel.append(copy);
    return panel;
  }

  function renderEssay(essay) {
    const fragment = document.createDocumentFragment();
    fragment.append(createLeadSpace());
    essay.images.forEach((image, index) => {
      fragment.append(createSlide(image, index));
    });
    fragment.append(createTextPanel(essay));
    track.replaceChildren(fragment);
  }

  function setUrl(essay, slide, mode) {
    const state = essay ? { essay: essay.id, slide } : { essay: null, slide: null };
    const url = essay ? stateUrl(essay.id, slide) : cleanUrl();

    if (mode === "push") {
      window.history.pushState(state, "", url);
      return;
    }

    window.history.replaceState(state, "", url);
  }

  function setActiveSlide(slide, updateUrl) {
    if (!activeEssay) return;

    activeSlide = clampSlide(activeEssay, slide);
    Array.from(slideList.querySelectorAll("button")).forEach(button => {
      button.classList.toggle("is-current", Number(button.dataset.slide) === activeSlide);
    });

    if (updateUrl && !suppressUrlUpdate) {
      setUrl(activeEssay, activeSlide, "replace");
    }
  }

  function goToSlide(slide, updateUrl) {
    if (!activeEssay) return;

    const targetSlide = clampSlide(activeEssay, slide);
    const slideElement = track.querySelector(`[data-slide="${targetSlide}"]`);
    const lead = track.querySelector(".ensayo-lead-space");
    const leadWidth = lead ? lead.offsetWidth : 0;

    if (slideElement) {
      scrollArea.scrollTo({
        left: Math.max(0, slideElement.offsetLeft - leadWidth),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }

    setActiveSlide(targetSlide, updateUrl);
  }

  function openEssay(essayId, slide, mode) {
    const essay = getEssay(essayId);
    if (!essay) return;

    activeEssay = essay;
    activeSlide = clampSlide(essay, slide);
    suppressUrlUpdate = true;

    document.body.classList.add("has-active-essay");
    scrollArea.hidden = false;
    renderEssay(essay);
    updateIndexState();
    updateControls();

    if (mode) {
      setUrl(essay, activeSlide, mode);
    }

    window.requestAnimationFrame(() => {
      goToSlide(activeSlide, false);
      window.requestAnimationFrame(() => {
        suppressUrlUpdate = false;
      });
    });
  }

  function closeEssay(mode) {
    activeEssay = null;
    activeSlide = 1;
    suppressUrlUpdate = false;

    document.body.classList.remove("has-active-essay");
    scrollArea.hidden = true;
    track.replaceChildren();
    scrollArea.scrollLeft = 0;
    updateIndexState();
    updateControls();

    if (mode) {
      setUrl(null, null, mode);
    }
  }

  function nearestSlideFromScroll() {
    if (!activeEssay) return activeSlide;

    const slides = Array.from(track.querySelectorAll(".ensayo-slide"));
    if (slides.length === 0) return activeSlide;

    const lead = track.querySelector(".ensayo-lead-space");
    const leadWidth = lead ? lead.offsetWidth : 0;
    const target = scrollArea.scrollLeft + leadWidth;
    let nearest = 1;
    let nearestDistance = Infinity;

    slides.forEach(slide => {
      const distance = Math.abs(slide.offsetLeft - target);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = Number(slide.dataset.slide);
      }
    });

    return nearest;
  }

  function requestScrollUpdate() {
    if (scrollFrame !== null) return;

    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = null;
      setActiveSlide(nearestSlideFromScroll(), true);
    });
  }

  function stateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const essay = getEssay(params.get("essay"));

    if (!essay) return null;

    return {
      essay,
      slide: clampSlide(essay, params.get("slide") || "1")
    };
  }

  essayButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (performance.now() < ignoreClickUntil) return;
      openEssay(button.dataset.essayOpen, 1, "push");
    });
  });

  closeButton.addEventListener("click", () => {
    closeEssay("push");
  });

  scrollArea.addEventListener("scroll", requestScrollUpdate, { passive: true });

  scrollArea.addEventListener("wheel", event => {
    if (!activeEssay) return;

    const isMostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
    if (!isMostlyVertical) return;

    event.preventDefault();
    scrollArea.scrollLeft += event.deltaY;
    requestScrollUpdate();
  }, { passive: false });

  scrollArea.addEventListener("pointerdown", event => {
    if (!activeEssay || event.pointerType !== "mouse" || event.button !== 0) return;

    pointerIsDown = true;
    isDragging = false;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    startingScrollLeft = scrollArea.scrollLeft;
  });

  scrollArea.addEventListener("pointermove", event => {
    if (!pointerIsDown || event.pointerId !== pointerId) return;

    const distanceX = event.clientX - pointerStartX;
    const distanceY = event.clientY - pointerStartY;

    if (!isDragging) {
      const movedFarEnough = Math.abs(distanceX) >= 12;
      const movementIsHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

      if (!movedFarEnough || !movementIsHorizontal) return;

      isDragging = true;
      scrollArea.classList.add("is-dragging");
      scrollArea.setPointerCapture(event.pointerId);
    }

    scrollArea.scrollLeft = startingScrollLeft - distanceX;
    requestScrollUpdate();
  });

  function finishPointerInteraction(event) {
    if (!pointerIsDown || event.pointerId !== pointerId) return;

    const completedDrag = isDragging;

    pointerIsDown = false;
    isDragging = false;
    pointerId = null;
    scrollArea.classList.remove("is-dragging");

    if (scrollArea.hasPointerCapture(event.pointerId)) {
      scrollArea.releasePointerCapture(event.pointerId);
    }

    if (completedDrag) {
      ignoreClickUntil = performance.now() + 120;
    }
  }

  scrollArea.addEventListener("pointerup", finishPointerInteraction);
  scrollArea.addEventListener("pointercancel", finishPointerInteraction);
  scrollArea.addEventListener("pointerleave", event => {
    if (pointerIsDown && !isDragging && event.pointerId === pointerId) {
      pointerIsDown = false;
      pointerId = null;
    }
  });

  window.addEventListener("keydown", event => {
    if (!activeEssay) return;

    if (event.key === "Escape") {
      closeEssay("push");
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(activeSlide - 1, true);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(activeSlide + 1, true);
    }
  });

  window.addEventListener("popstate", () => {
    const state = stateFromUrl();

    if (state) {
      openEssay(state.essay.id, state.slide, null);
    } else {
      closeEssay(null);
    }
  });

  window.addEventListener("resize", () => {
    if (!activeEssay) return;
    window.requestAnimationFrame(() => {
      goToSlide(activeSlide, false);
    });
  });

  const initialState = stateFromUrl();

  if (initialState) {
    openEssay(initialState.essay.id, initialState.slide, "replace");
  } else {
    closeEssay(null);
    setUrl(null, null, "replace");
  }
})();
