(() => {
  "use strict";

  const textElement = document.getElementById("about-scaled-text");

  if (textElement) {
    const stage = textElement.closest(".about-title-stage");
    const minScale = 1;
    const maxScale = 30.3;
    let lastPointerX = null;

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
    }

    function applyScale(clientX) {
      const centerX = window.innerWidth / 2;
      const distanceFromCenter = Math.abs(clientX - centerX);
      const factor = centerX === 0 ? 0 : distanceFromCenter / centerX;
      const currentScale = minScale + factor * (maxScale - minScale);

      textElement.style.transform = `scaleX(${currentScale.toFixed(3)})`;
    }

    window.addEventListener("pointermove", event => {
      lastPointerX = event.clientX;
      applyScale(event.clientX);
    });

    window.addEventListener("resize", () => {
      fitWordmark();
      if (lastPointerX === null) return;
      applyScale(Math.min(Math.max(lastPointerX, 0), window.innerWidth));
    });
    new ResizeObserver(fitWordmark).observe(stage);
    document.fonts.ready.then(fitWordmark);
    fitWordmark();
  }

})();
