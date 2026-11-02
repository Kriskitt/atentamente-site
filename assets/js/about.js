(() => {
  "use strict";

  const textElement = document.getElementById("about-scaled-text");

  if (textElement) {
    const stage = textElement.closest(".about-title-stage");
    const minScale = 1;
    const maxScale = 30.3;
    const touchMinScale = 0.55;
    const touchViewport = window.matchMedia("(max-width: 1032px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastPointerX = null;
    let currentScale = 1;
    let touchMaxScale = maxScale;
    let naturalWidth = 1;
    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let startScale = 1;
    let gesture = null;
    let pendingScale = null;
    let scaleFrame = 0;
    let returnFrame = 0;

    function setScale(scale) {
      currentScale = scale;
      textElement.style.transform = `scaleX(${scale.toFixed(3)})`;
    }

    function scheduleScale(scale) {
      pendingScale = scale;
      if (scaleFrame) return;
      scaleFrame = requestAnimationFrame(() => {
        scaleFrame = 0;
        setScale(pendingScale);
        pendingScale = null;
      });
    }

    function cancelAnimation() {
      cancelAnimationFrame(returnFrame);
      cancelAnimationFrame(scaleFrame);
      returnFrame = 0;
      scaleFrame = 0;
      pendingScale = null;
    }

    function fitWordmark() {
      const availableHeight = stage.clientHeight - 6;
      const availableWidth = stage.clientWidth - 12;
      let low = 12;
      let high = 200;
      for (let i = 0; i < 12; i += 1) {
        const middle = (low + high) / 2;
        textElement.style.fontSize = `${middle}px`;
        if (textElement.scrollHeight <= availableHeight && textElement.offsetWidth <= availableWidth) low = middle;
        else high = middle;
      }
      textElement.style.fontSize = `${low}px`;
      naturalWidth = textElement.offsetWidth;
      touchMaxScale = Math.max(1, availableWidth / naturalWidth);
      if (touchViewport.matches) setScale(Math.min(currentScale, touchMaxScale));
    }

    function applyScale(clientX) {
      const centerX = window.innerWidth / 2;
      const distanceFromCenter = Math.abs(clientX - centerX);
      const factor = centerX === 0 ? 0 : distanceFromCenter / centerX;
      const currentScale = minScale + factor * (maxScale - minScale);

      setScale(currentScale);
    }

    window.addEventListener("pointermove", event => {
      if (touchViewport.matches) return;
      lastPointerX = event.clientX;
      applyScale(event.clientX);
    });

    stage.addEventListener("pointerdown", event => {
      if (!touchViewport.matches || activePointerId !== null || !event.isPrimary) return;
      cancelAnimation();
      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScale = currentScale;
      gesture = null;
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener("pointermove", event => {
      if (event.pointerId !== activePointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (gesture === null && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 3) {
        gesture = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        if (gesture === "vertical") {
          endTouch(event);
          return;
        }
      }
      if (gesture !== "horizontal") return;
      const scale = startScale + deltaX / naturalWidth;
      scheduleScale(Math.min(touchMaxScale, Math.max(touchMinScale, scale)));
    });

    function endTouch(event) {
      if (event.pointerId !== activePointerId) return;
      if (stage.hasPointerCapture(activePointerId)) stage.releasePointerCapture(activePointerId);
      activePointerId = null;
      gesture = null;
      if (scaleFrame) {
        cancelAnimationFrame(scaleFrame);
        scaleFrame = 0;
        setScale(pendingScale);
        pendingScale = null;
      }
      if (reducedMotion.matches || currentScale === 1) {
        setScale(1);
        return;
      }
      const initialScale = currentScale;
      const startTime = performance.now();
      function returnToRest(now) {
        const progress = Math.min((now - startTime) / 450, 1);
        const eased = 1 - (1 - progress) ** 3;
        setScale(initialScale + (1 - initialScale) * eased);
        returnFrame = progress < 1 ? requestAnimationFrame(returnToRest) : 0;
      }
      returnFrame = requestAnimationFrame(returnToRest);
    }

    stage.addEventListener("pointerup", endTouch);
    stage.addEventListener("pointercancel", endTouch);

    touchViewport.addEventListener("change", () => {
      if (activePointerId !== null && stage.hasPointerCapture(activePointerId)) {
        stage.releasePointerCapture(activePointerId);
      }
      activePointerId = null;
      cancelAnimation();
      setScale(1);
      fitWordmark();
    });

    window.addEventListener("resize", () => {
      fitWordmark();
      if (touchViewport.matches || lastPointerX === null) return;
      applyScale(Math.min(Math.max(lastPointerX, 0), window.innerWidth));
    });
    new ResizeObserver(fitWordmark).observe(stage);
    document.fonts.ready.then(fitWordmark);
    fitWordmark();
  }

})();
