(() => {
  "use strict";

  const textElement = document.getElementById("about-scaled-text");

  if (textElement) {
    const minScale = 2.2;
    const maxScale = 30.3;
    let lastPointerX = null;

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
      if (lastPointerX === null) return;
      applyScale(Math.min(Math.max(lastPointerX, 0), window.innerWidth));
    });
  }

})();
