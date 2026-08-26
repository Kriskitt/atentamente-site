(() => {
  "use strict";

  const gallery = document.querySelector("[data-work-gallery]");
  const track = document.querySelector("[data-work-track]");
  const bwToggle = document.querySelector(".work-bw-toggle");

  if (!gallery || !track) return;

  const projects = [
    {
      index: 1,
      title: "Mesa",
      slug: "mesa",
      image: "/assets/images/home-atte2.webp",
      width: 2400,
      height: 1080,
      orientation: "landscape"
    },
    {
      index: 2,
      title: "Clon",
      slug: "clon",
      image: "/assets/images/work-clon.webp",
      width: 2048,
      height: 2560,
      orientation: "portrait",
      position: "50% 50%"
    },
    {
      index: 3,
      title: "Luz",
      slug: "luz",
      image: "/assets/images/home-atte2.webp",
      width: 2400,
      height: 1080,
      orientation: "landscape"
    },
    {
      index: 4,
      title: "Archivo",
      slug: "archivo",
      image: "/assets/images/work-clon.webp",
      width: 2048,
      height: 2560,
      orientation: "portrait",
      position: "54% 50%"
    },
    {
      index: 5,
      title: "Turno",
      slug: "turno",
      image: "/assets/images/home-atte2.webp",
      width: 2400,
      height: 1080,
      orientation: "landscape"
    },
    {
      index: 6,
      title: "Sala",
      slug: "sala",
      image: "/assets/images/work-clon.webp",
      width: 2048,
      height: 2560,
      orientation: "portrait",
      position: "48% 50%"
    },
    {
      index: 7,
      title: "Forma",
      slug: "forma",
      image: "/assets/images/work-atte3.webp",
      width: 1920,
      height: 1080,
      orientation: "landscape"
    },
    {
      index: 8,
      title: "Ensayo 01",
      slug: "ensayo-01",
      image: "/assets/images/work-ensayo1-1.webp",
      width: 678,
      height: 1208,
      orientation: "portrait",
      position: "50% 45%"
    },
    {
      index: 9,
      title: "Piedra",
      slug: "piedra",
      image: "/assets/images/work-atte4.webp",
      width: 2560,
      height: 1440,
      orientation: "landscape"
    },
    {
      index: 10,
      title: "Secuencia",
      slug: "secuencia",
      image: "/assets/images/work-ensayo1-2.webp",
      width: 1054,
      height: 1329,
      orientation: "portrait",
      position: "50% 48%"
    },
    {
      index: 11,
      title: "Objeto",
      slug: "objeto",
      image: "/assets/images/home-atte4.webp",
      width: 471,
      height: 333,
      orientation: "landscape"
    },
    {
      index: 12,
      title: "Metal",
      slug: "metal",
      image: "/assets/images/work-ensayo1-3.webp",
      width: 748,
      height: 919,
      orientation: "portrait",
      position: "50% 48%"
    },
    {
      index: 13,
      title: "Contenido",
      slug: "contenido",
      image: "/assets/images/home-atte5.webp",
      width: 2400,
      height: 1080,
      orientation: "landscape"
    },
    {
      index: 14,
      title: "Publicacion",
      slug: "publicacion",
      image: "/assets/images/work-clon.webp",
      width: 2048,
      height: 2560,
      orientation: "portrait",
      position: "52% 50%"
    },
    {
      index: 15,
      title: "Imagen",
      slug: "imagen",
      image: "/assets/images/home-atte6.webp",
      width: 2400,
      height: 1080,
      orientation: "landscape"
    }
  ];

  const setCount = 3;
  let setWidth = 0;
  let ignoreClickUntil = 0;
  let pointerIsDown = false;
  let isDragging = false;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startingScrollLeft = 0;
  let recenterFrame = null;

  function formatIndex(index) {
    return `( ${index} )`;
  }

  function createCard(project, setIndex) {
    const card = document.createElement("article");
    card.className = "work-card";
    card.dataset.orientation = project.orientation;
    card.dataset.slug = project.slug;
    if (project.position) card.style.setProperty("--image-position", project.position);

    const link = document.createElement("a");
    link.className = "work-card__link";
    link.href = `/work/${project.slug}/`;
    link.setAttribute("aria-label", `${project.title}, project ${project.index}`);
    link.dataset.projectSlug = project.slug;

    const index = document.createElement("span");
    index.className = "work-card__index";
    index.textContent = formatIndex(project.index);

    const frame = document.createElement("span");
    frame.className = "work-card__frame";

    const image = document.createElement("img");
    image.className = "work-card__image";
    image.src = project.image;
    image.alt = `${project.title} project image`;
    image.width = project.width;
    image.height = project.height;
    image.decoding = "async";
    image.draggable = false;
    image.loading = setIndex === 1 ? "eager" : "lazy";

    const title = document.createElement("span");
    title.className = "work-card__title";
    title.textContent = project.title;

    frame.append(image);
    link.append(index, frame, title);
    card.append(link);

    return card;
  }

  function renderProjects() {
    const fragment = document.createDocumentFragment();

    for (let setIndex = 0; setIndex < setCount; setIndex += 1) {
      const set = document.createElement("div");
      set.className = "work-set";
      set.dataset.cloneSet = String(setIndex);

      projects.forEach(project => {
        set.append(createCard(project, setIndex));
      });

      fragment.append(set);
    }

    track.append(fragment);
  }

  function measureAndCenter() {
    setWidth = track.scrollWidth / setCount;
    gallery.scrollLeft = setWidth;
  }

  function recenterIfNeeded() {
    recenterFrame = null;
    if (!setWidth) return;

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

  gallery.addEventListener("scroll", requestRecenter, { passive: true });

  gallery.addEventListener("wheel", event => {
    const isMostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);

    if (!isMostlyVertical) return;

    event.preventDefault();
    gallery.scrollLeft += event.deltaY;
    requestRecenter();
  }, { passive: false });

  gallery.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

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

    event.preventDefault();

    if (performance.now() < ignoreClickUntil) return;

    setActiveCard(link.closest(".work-card"));
  });

  track.addEventListener("pointerenter", event => {
    const card = event.target.closest(".work-card");
    if (card) setActiveCard(card);
  }, true);

  track.addEventListener("pointerleave", event => {
    if (!event.relatedTarget || !track.contains(event.relatedTarget)) {
      setActiveCard(null);
    }
  }, true);

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(measureAndCenter);
  });

  bwToggle.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("is-bw");
    bwToggle.setAttribute("aria-pressed", String(enabled));
  });

  renderProjects();
  window.requestAnimationFrame(measureAndCenter);
})();
