(() => {
  "use strict";

  const stage = document.querySelector("[data-home-slider]");
  if (!stage) return;

  const images = [
    {
      src: "/assets/images/home-atte1.webp",
      alt: "Atentamente project image on a wooden table"
    },
    {
      src: "/assets/images/home-atte2.webp",
      alt: "Atentamente project detail image"
    },
    {
      src: "/assets/images/home-atte3.webp",
      alt: "Atentamente printed project detail"
    },
    {
      src: "/assets/images/home-atte4.webp",
      alt: "Atentamente project image"
    },
    {
      src: "/assets/images/home-atte5.webp",
      alt: "Atentamente publication spread"
    },
    {
      src: "/assets/images/home-atte6.webp",
      alt: "Atentamente project documentation"
    }
  ];

  const layers = [
    document.querySelector(".home-layer-a"),
    document.querySelector(".home-layer-b")
  ];
  const counter = document.querySelector(".home-counter");
  const status = document.querySelector("#home-slider-status");
  const cursor = document.querySelector(".home-cursor");
  const bwToggle = document.querySelector(".home-bw-toggle");

  let index = 0;
  let activeLayer = 0;
  let animating = false;
  let wheelLock = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartedAt = 0;

  const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 650;
  const easing = "cubic-bezier(.77, 0, .175, 1)";
  const total = String(images.length).padStart(3, "0");
  const format = number => String(number + 1).padStart(3, "0");

  layers[0].querySelector("img").src = images[0].src;
  layers[0].querySelector("img").alt = images[0].alt;
  layers[1].querySelector("img").src = images[1].src;

  images.forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });

  function updateCounter() {
    counter.textContent = `${format(index)} / ${total}`;
  }

  async function go(direction) {
    if (animating) return;
    animating = true;

    const nextIndex = (index + direction + images.length) % images.length;
    const outgoing = layers[activeLayer];
    const incoming = layers[1 - activeLayer];
    const incomingImg = incoming.querySelector("img");
    const forward = direction > 0;

    incomingImg.src = images[nextIndex].src;
    incomingImg.alt = images[nextIndex].alt;
    incoming.setAttribute("aria-hidden", "false");

    outgoing.style.zIndex = "2";
    incoming.style.zIndex = "3";
    outgoing.style.transformOrigin = forward ? "left center" : "right center";
    incoming.style.transformOrigin = forward ? "left center" : "right center";

    const outgoingFrames = forward ? [
      { transform: "translate3d(0,0,0) scaleX(1)", offset: 0 },
      { transform: "translate3d(0,0,0) scaleX(.90)", offset: 0.18 },
      { transform: "translate3d(0,0,0) scaleX(.77)", offset: 0.42 },
      { transform: "translate3d(-4vw,0,0) scaleX(.36)", offset: 0.72 },
      { transform: "translate3d(-10vw,0,0) scaleX(.001)", offset: 1 }
    ] : [
      { transform: "translate3d(0,0,0) scaleX(1)", offset: 0 },
      { transform: "translate3d(0,0,0) scaleX(.90)", offset: 0.18 },
      { transform: "translate3d(0,0,0) scaleX(.77)", offset: 0.42 },
      { transform: "translate3d(4vw,0,0) scaleX(.36)", offset: 0.72 },
      { transform: "translate3d(10vw,0,0) scaleX(.001)", offset: 1 }
    ];

    const incomingFrames = forward ? [
      { transform: "translate3d(100vw,0,0) scaleX(.001)", offset: 0 },
      { transform: "translate3d(93vw,0,0) scaleX(.07)", offset: 0.18 },
      { transform: "translate3d(86vw,0,0) scaleX(.22)", offset: 0.42 },
      { transform: "translate3d(42vw,0,0) scaleX(.64)", offset: 0.72 },
      { transform: "translate3d(0,0,0) scaleX(1)", offset: 1 }
    ] : [
      { transform: "translate3d(-100vw,0,0) scaleX(.001)", offset: 0 },
      { transform: "translate3d(-93vw,0,0) scaleX(.07)", offset: 0.18 },
      { transform: "translate3d(-86vw,0,0) scaleX(.22)", offset: 0.42 },
      { transform: "translate3d(-42vw,0,0) scaleX(.64)", offset: 0.72 },
      { transform: "translate3d(0,0,0) scaleX(1)", offset: 1 }
    ];

    incoming.style.transform = incomingFrames[0].transform;
    void incoming.offsetWidth;

    const animations = [
      outgoing.animate(outgoingFrames, { duration, easing, fill: "forwards" }),
      incoming.animate(incomingFrames, { duration, easing, fill: "forwards" })
    ];

    window.setTimeout(() => {
      index = nextIndex;
      updateCounter();
      status.textContent = `${images[index].alt}, image ${index + 1} of ${images.length}`;
    }, duration * 0.56);

    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    animations.forEach(animation => animation.cancel());

    outgoing.style.transform = "";
    incoming.style.transform = "";
    outgoing.style.transformOrigin = "";
    incoming.style.transformOrigin = "";

    outgoing.setAttribute("aria-hidden", "true");
    outgoing.querySelector("img").alt = "";
    outgoing.style.zIndex = "1";
    incoming.style.zIndex = "2";

    activeLayer = 1 - activeLayer;
    animating = false;
  }

  document.querySelectorAll(".home-nav-button.prev, .home-hit-area.prev").forEach(element => {
    element.addEventListener("click", () => go(-1));
  });

  document.querySelectorAll(".home-nav-button.next, .home-hit-area.next").forEach(element => {
    element.addEventListener("click", () => go(1));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      go(1);
    }
  });

  stage.addEventListener("wheel", event => {
    if (wheelLock || Math.abs(event.deltaX) + Math.abs(event.deltaY) < 18) return;
    wheelLock = true;
    go((event.deltaX || event.deltaY) > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLock = false;
    }, 900);
  }, { passive: true });

  stage.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartedAt = performance.now();
  }, { passive: true });

  stage.addEventListener("touchend", event => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const elapsed = performance.now() - touchStartedAt;

    if (elapsed < 650 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      go(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  if (matchMedia("(pointer:fine)").matches) {
    stage.addEventListener("pointermove", event => {
      const leftSide = event.clientX < innerWidth / 2;
      cursor.textContent = leftSide ? "<" : ">";
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = "1";
    });

    stage.addEventListener("pointerleave", () => {
      cursor.style.opacity = "0";
    });
  }

  bwToggle.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("is-bw");
    bwToggle.setAttribute("aria-pressed", String(enabled));
  });

  updateCounter();
})();
