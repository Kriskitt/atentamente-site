(async () => {
  "use strict";

  const stage = document.querySelector("[data-home-slider]");
  if (!stage) return;

  const data = await window.atContent.load("home/content.json");
  const desktopFit = new Set(["04-home.webp", "06-home.webp", "08-home.webp", "09-home.webp", "10-home.webp"]);
  const desktopQuery = matchMedia("(min-width: 1033px)");
  const mobileQuery = matchMedia("(max-width: 500px)");
  const preloadedImages = new Map();
  const source = (group, file) => ({ type: file.endsWith(".webm") ? "video" : "image", file,
    src: window.atContent.url(`home/${data.media[group].path}${file}`) });
  const media = data.media["desktop-tablet"].files.map((file, index) => ({
    alt: `Atentamente media ${index + 1}`,
    desktop: source("desktop-tablet", file),
    mobile: source("mobile", data.media.mobile.files[index])
  }));
  let blockedVideo = null;

  function playVideo(video) {
    if (!video || !video.isConnected || document.hidden) return;
    video.play().then(() => {
      if (blockedVideo === video) blockedVideo = null;
    }).catch(error => {
      if (error.name === "NotAllowedError") blockedVideo = video;
      else if (error.name !== "AbortError") console.warn("Home video playback", error);
    });
  }

  function populateLayer(layer, slideIndex) {
    const shell = layer.querySelector(".home-media-shell");
    const previousVideo = shell.querySelector("video");
    previousVideo?.pause();
    if (blockedVideo === previousVideo) blockedVideo = null;
    const item = media[slideIndex];
    const source = mobileQuery.matches ? item.mobile : item.desktop;
    const element = document.createElement(source.type === "video" ? "video" : "img");
    const fit = source.type === "video" ? (mobileQuery.matches ? "cover" : "contain")
      : (mobileQuery.matches || (desktopQuery.matches && desktopFit.has(source.file)) ? "cover" : "contain");
    element.style.setProperty("--media-fit", fit);
    if (source.type === "video") {
      element.autoplay = true;
      element.muted = true;
      element.defaultMuted = true;
      element.loop = true;
      element.playsInline = true;
      element.setAttribute("playsinline", "");
      element.controls = false;
      element.preload = "auto";
      element.setAttribute("aria-label", item.alt);
    } else {
      element.alt = item.alt;
      element.decoding = "async";
      element.draggable = false;
    }
    element.src = source.src;
    shell.replaceChildren(element);
    return source.type === "video" ? element : null;
  }

  function preloadAdjacentImages(slideIndex) {
    const needed = new Set();
    for (const offset of [-1, 1]) {
      const item = media[(slideIndex + offset + media.length) % media.length];
      const source = mobileQuery.matches ? item.mobile : item.desktop;
      if (source.type === "image") needed.add(source.src);
    }
    for (const src of preloadedImages.keys()) {
      if (!needed.has(src)) preloadedImages.delete(src);
    }
    for (const src of needed) {
      if (!preloadedImages.has(src)) {
        const image = new Image();
        image.src = src;
        preloadedImages.set(src, image);
      }
    }
  }

  const layers = [
    document.querySelector(".home-layer-a"),
    document.querySelector(".home-layer-b")
  ];
  const counter = document.querySelector(".home-counter");
  const status = document.querySelector("#home-slider-status");
  const cursor = document.querySelector(".home-cursor");

  let index = 0;
  let activeLayer = 0;
  let animating = false;
  let wheelLock = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartedAt = 0;
  let sourceChangePending = false;

  const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 650;
  const easing = "cubic-bezier(.77, 0, .175, 1)";
  const total = String(media.length).padStart(3, "0");
  const format = number => String(number + 1).padStart(3, "0");

  playVideo(populateLayer(layers[0], 0));
  preloadAdjacentImages(0);

  function updateCounter() {
    counter.textContent = `${format(index)} / ${total}`;
  }

  async function go(direction) {
    if (animating) return;
    animating = true;

    const nextIndex = (index + direction + media.length) % media.length;
    const outgoing = layers[activeLayer];
    const incoming = layers[1 - activeLayer];

    const forward = direction > 0;

    const incomingVideo = populateLayer(incoming, nextIndex);
    incoming.setAttribute("aria-hidden", "false");
    playVideo(incomingVideo);

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
      status.textContent = `${media[index].alt}, media ${index + 1} of ${media.length}`;
    }, duration * 0.56);

    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    animations.forEach(animation => animation.cancel());

    outgoing.style.transform = "";
    incoming.style.transform = "";
    outgoing.style.transformOrigin = "";
    incoming.style.transformOrigin = "";

    outgoing.setAttribute("aria-hidden", "true");
    const outgoingVideo = outgoing.querySelector("video");
    outgoingVideo?.pause();
    if (blockedVideo === outgoingVideo) blockedVideo = null;
    outgoing.style.zIndex = "1";
    incoming.style.zIndex = "2";

    activeLayer = 1 - activeLayer;
    animating = false;
    preloadAdjacentImages(index);
    if (sourceChangePending) {
      sourceChangePending = false;
      playVideo(populateLayer(layers[activeLayer], index));
    }
  }

  function retryBlockedVideo() {
    if (blockedVideo?.closest(".home-layer")?.getAttribute("aria-hidden") === "false") {
      playVideo(blockedVideo);
    }
  }
  document.addEventListener("pointerdown", retryBlockedVideo, { capture: true });
  document.addEventListener("touchend", retryBlockedVideo, { capture: true });
  document.addEventListener("keydown", retryBlockedVideo, { capture: true });

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
      cursor.textContent = leftSide ? "←" : "→";
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = "1";
    });

    stage.addEventListener("pointerleave", () => {
      cursor.style.opacity = "0";
    });
  }

  mobileQuery.addEventListener("change", () => {
    if (animating) { sourceChangePending = true; return; }
    playVideo(populateLayer(layers[activeLayer], index));
    preloadAdjacentImages(index);
    layers[1 - activeLayer].querySelector("video")?.pause();
    layers[1 - activeLayer].querySelector(".home-media-shell").replaceChildren();
  });
  document.addEventListener("visibilitychange", () => {
    const activeVideo = layers[activeLayer].querySelector("video");
    if (document.hidden) activeVideo?.pause();
    else playVideo(activeVideo);
  });
  desktopQuery.addEventListener("change", () => {
    if (mobileQuery.matches) return;
    const element = layers[activeLayer].querySelector(".home-media-shell img, .home-media-shell video");
    const source = media[index].desktop;
    if (element) element.style.setProperty("--media-fit", source.type === "image" && desktopQuery.matches && desktopFit.has(source.file) ? "cover" : "contain");
  });

  updateCounter();
})().catch(error => console.error("Home content", error));
