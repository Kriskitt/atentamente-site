(() => {
  "use strict";

  async function buildGallery(gallery) {
    const id = gallery.dataset.projectId;
    const project = await window.atContent.load(`work/${id}/content.json`);
    const root = `work/${id}/`;
    const track = gallery.querySelector(".project-gallery__track");
    const fragment = document.createDocumentFragment();
    project.media.forEach((name, index) => {
      const slide = document.createElement("button");
      slide.className = "project-slide";
      slide.type = "button";
      slide.setAttribute("aria-label", `Expand media ${index + 1}`);
      slide.setAttribute("aria-pressed", "false");
      const setRatio = (width, height) => {
        if (!width || !height) return;
        const ratio = width / height;
        slide.style.setProperty("--media-ratio", String(ratio));
        slide.style.setProperty("--closed-width", `min(45vw,calc(var(--closed-height) * ${ratio}))`);
      };
      const element = document.createElement(name.endsWith(".webm") ? "video" : "img");
      if (element.tagName === "VIDEO") {
        element.src = window.atContent.url(root + name);
        element.addEventListener("loadedmetadata", () => setRatio(element.videoWidth, element.videoHeight));
      } else {
        element.src = window.atContent.url(window.atContent.variant(root + name, 1000));
        element.srcset = `${element.src} 1000w, ${window.atContent.url(window.atContent.variant(root + name, 2000))} 2000w`;
        element.sizes = "(max-width: 440px) 100vw, (max-width: 1032px) 82vw, 70vw";
        element.loading = "lazy";
        element.decoding = "async";
        element.alt = `${project.title[window.atContent.lang()]} media ${index + 1}`;
        element.addEventListener("load", () => {
          setRatio(element.naturalWidth, element.naturalHeight);
        });
      }
      slide.append(element);
      fragment.append(slide);
    });
    track.replaceChildren(fragment);
    const updateText = () => {
      const lang = window.atContent.lang();
      document.title = `${project.title[lang]} — Atentamente`;
      const heading = document.querySelector(".project-main h1");
      if (heading) heading.textContent = project.title[lang];
      for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
        const meta = document.querySelector(selector);
        if (meta) meta.content = document.title;
      }
      const summary = document.querySelector(".project-header__summary");
      if (summary) summary.textContent = project.description[lang];
      if (summary) gallery.style.setProperty("--mobile-gallery-top", `${Math.max(70, Math.ceil(summary.getBoundingClientRect().bottom + 10))}px`);
      if (summary) gallery.style.setProperty("--gallery-top", `${Math.max(innerWidth <= 1032 ? 40 : 98, Math.ceil(summary.getBoundingClientRect().bottom + 12))}px`);
      gallery.setAttribute("aria-label", `${project.title[lang]} gallery`);
      gallery.querySelectorAll(".project-slide").forEach((slide, i) => {
        const img = slide.querySelector("img");
        if (img) img.alt = `${project.title[lang]} media ${i + 1}`;
      });
    };
    updateText();
    document.addEventListener("at:language", updateText);
    window.addEventListener("resize", updateText);
  }

  function initProjectGallery(gallery) {
    const track = gallery.querySelector(".project-gallery__track");
    const slides = Array.from(gallery.querySelectorAll(".project-slide"));
    const mobileQuery = matchMedia("(max-width: 440px)");

    if (!track || slides.length === 0) return;

    let expandedSlide = null;
    let pointerIsDown = false;
    let isDragging = false;
    let pointerId = null;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let startingScrollLeft = 0;
    let ignoreClickUntil = 0;

    const dragThreshold = 12;

    function updateSlideLabel(slide, expanded) {
      const index = slides.indexOf(slide) + 1;
      slide.setAttribute("aria-pressed", expanded ? "true" : "false");
      slide.setAttribute("aria-label", expanded ? `Collapse image ${index}` : `Expand image ${index}`);
    }

    function collapseSlide(slide) {
      if (!slide) return;

      slide.classList.remove("is-expanded");
      updateSlideLabel(slide, false);

      if (expandedSlide === slide) {
        expandedSlide = null;
      }

      track.classList.remove("has-expanded");
    }

    function collapseAllSlides() {
      slides.forEach(slide => {
        slide.classList.remove("is-expanded");
        updateSlideLabel(slide, false);
      });

      track.classList.remove("has-expanded");
      expandedSlide = null;
    }

    function expandSlide(slide) {
      if (expandedSlide && expandedSlide !== slide) {
        expandedSlide.classList.remove("is-expanded");
        updateSlideLabel(expandedSlide, false);
      }

      slide.classList.add("is-expanded");
      updateSlideLabel(slide, true);
      track.classList.add("has-expanded");
      expandedSlide = slide;
      if (!mobileQuery.matches) centerExpandedSlide(slide);
    }

    function centerExpandedSlide(slide, start = performance.now()) {
      if (expandedSlide !== slide || mobileQuery.matches) return;
      gallery.scrollLeft = Math.max(0, slide.offsetLeft - (gallery.clientWidth - slide.offsetWidth) / 2);
      if (performance.now() - start < 620) {
        requestAnimationFrame(() => centerExpandedSlide(slide, start));
      }
    }

    function toggleSlide(slide) {
      if (slide === expandedSlide) {
        collapseSlide(slide);
      } else {
        expandSlide(slide);
      }
    }

    function alignInitialSlide() {
      if (mobileQuery.matches) return;
      if (expandedSlide) {
        gallery.scrollLeft = Math.max(0, expandedSlide.offsetLeft - (gallery.clientWidth - expandedSlide.offsetWidth) / 2);
        return;
      }
      const initialIndex = Number(gallery.dataset.initialSlide || "0");
      const initialSlide = slides[initialIndex] || expandedSlide || slides[0];
      if (!initialSlide) return;

      const preferredLeft = window.innerWidth * 0.245;
      gallery.scrollLeft = Math.max(0, initialSlide.offsetLeft - preferredLeft);
    }

    gallery.addEventListener("click", event => {
      if (performance.now() < ignoreClickUntil) {
        event.preventDefault();
        return;
      }

      const clickedSlide = event.target.closest(".project-slide");

      if (clickedSlide) {
        toggleSlide(clickedSlide);
        return;
      }

      collapseAllSlides();
    });

    window.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !expandedSlide) return;

      const previouslyExpanded = expandedSlide;
      collapseAllSlides();
      previouslyExpanded.focus();
    });

    gallery.addEventListener("wheel", event => {
      if (mobileQuery.matches) return;
      const isMostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);

      if (!isMostlyVertical) return;

      event.preventDefault();
      gallery.scrollLeft += event.deltaY;
    }, { passive: false });

    gallery.addEventListener("pointerdown", event => {
      if (mobileQuery.matches) return;
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
        const movedFarEnough = Math.abs(distanceX) >= dragThreshold;
        const movementIsHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

        if (!movedFarEnough || !movementIsHorizontal) return;

        isDragging = true;
        gallery.classList.add("is-dragging");
        gallery.setPointerCapture(event.pointerId);
      }

      gallery.scrollLeft = startingScrollLeft - distanceX;
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

    collapseAllSlides();

    const videos = Array.from(gallery.querySelectorAll(".project-slide video"));
    videos.forEach(video => {
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.controls = false;
    });
    if (videos.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, intersectionRatio }) => {
          if (intersectionRatio >= 0.35) target.play().catch(() => {});
          else target.pause();
        });
      }, { threshold: [0, 0.35, 0.7] });
      videos.forEach(video => observer.observe(video));
    }

    window.addEventListener("resize", () => {
      window.requestAnimationFrame(alignInitialSlide);
    });

    window.requestAnimationFrame(alignInitialSlide);
  }

  document.querySelectorAll("[data-project-gallery]").forEach(gallery => {
    if (!gallery.dataset.projectId) { initProjectGallery(gallery); return; }
    buildGallery(gallery).then(() => initProjectGallery(gallery)).catch(error => console.error("Work Single content", error));
  });

})();
