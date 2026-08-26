(() => {
  "use strict";

  function initProjectGallery(gallery) {
    const track = gallery.querySelector(".project-gallery__track");
    const slides = Array.from(gallery.querySelectorAll(".project-slide"));

    if (!track || slides.length === 0) return;

    let expandedSlide = slides.find(slide => slide.classList.contains("is-expanded")) || null;
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
    }

    function toggleSlide(slide) {
      if (slide === expandedSlide) {
        collapseSlide(slide);
      } else {
        expandSlide(slide);
      }
    }

    function alignInitialSlide() {
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
      const isMostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);

      if (!isMostlyVertical) return;

      event.preventDefault();
      gallery.scrollLeft += event.deltaY;
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

    if (expandedSlide) {
      track.classList.add("has-expanded");
      slides.forEach(slide => updateSlideLabel(slide, slide === expandedSlide));
    } else {
      slides.forEach(slide => updateSlideLabel(slide, false));
    }

    window.addEventListener("resize", () => {
      window.requestAnimationFrame(alignInitialSlide);
    });

    window.requestAnimationFrame(alignInitialSlide);
  }

  document.querySelectorAll("[data-project-gallery]").forEach(initProjectGallery);

  document.querySelectorAll(".project-bw-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("is-bw");
      button.setAttribute("aria-pressed", String(enabled));
    });
  });
})();
