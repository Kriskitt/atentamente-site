(() => {
  "use strict";

  window.atContent.load("about/content.json").then(content => {
    const statement = document.querySelector(".about-statement");
    const details = document.querySelector(".about-details");
    const wordmark = document.getElementById("about-scaled-text");
    const render = () => {
      const y = window.scrollY;
      const lang = window.atContent.lang();
      statement.textContent = content.statement[lang];
      statement.style.whiteSpace = "pre-line";
      wordmark.replaceChildren(...Array.from(content.title[lang]).flatMap((letter, index) => index ? [document.createElement("br"), document.createTextNode(letter)] : [document.createTextNode(letter)]));
      const columns = document.createDocumentFragment();
      content.columns.forEach(column => {
        const wrapper = document.createElement("div");
        wrapper.className = "about-column";
        column.sections.forEach(section => {
          const heading = document.createElement("h2");
          heading.textContent = section.heading[lang];
          const body = document.createElement("p");
          section.items.forEach((item, index) => {
            if (index) body.append(document.createElement("br"));
            const text = item.text[lang];
            if (item.href) {
              const link = document.createElement("a");
              link.href = item.href;
              link.textContent = text;
              if (/^https?:/.test(item.href)) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
              body.append(link);
            } else body.append(document.createTextNode(text));
          });
          wrapper.append(heading, body);
        });
        columns.append(wrapper);
      });
      details.replaceChildren(columns);
      requestAnimationFrame(() => { window.dispatchEvent(new Event("resize")); window.scrollTo(0, y); });
    };
    render();
    document.addEventListener("at:language", render);
  }).catch(error => console.error("About content", error));

  const textElement = document.getElementById("about-scaled-text");

  if (textElement) {
    const stage = textElement.closest(".about-title-stage");
    const minScale = 1;
    const maxScale = 30.3;
    const touchViewport = window.matchMedia("(max-width: 1032px)");
    let lastPointerX = null;
    let currentScale = 1;
    let touchMaxScale = maxScale;
    let naturalWidth = 1;
    let scaleFrame = 0;

    function setScale(scale) {
      currentScale = scale;
      textElement.style.transform = `scaleX(${scale.toFixed(3)})`;
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

    function applyScrollScale() {
      scaleFrame = 0;
      if (!touchViewport.matches) return;
      const distance = Math.max(1, stage.clientHeight * 1.5);
      const progress = Math.min(1, Math.max(0, window.scrollY / distance));
      setScale(1 + progress * (touchMaxScale - 1));
    }

    window.addEventListener("scroll", () => {
      if (!touchViewport.matches || scaleFrame) return;
      scaleFrame = requestAnimationFrame(applyScrollScale);
    }, { passive: true });

    touchViewport.addEventListener("change", () => {
      fitWordmark();
      if (touchViewport.matches) applyScrollScale();
      else if (lastPointerX !== null) applyScale(Math.min(Math.max(lastPointerX, 0), window.innerWidth));
      else setScale(1);
    });

    window.addEventListener("resize", () => {
      fitWordmark();
      if (touchViewport.matches) { applyScrollScale(); return; }
      if (lastPointerX === null) return;
      applyScale(Math.min(Math.max(lastPointerX, 0), window.innerWidth));
    });
    new ResizeObserver(fitWordmark).observe(stage);
    document.fonts.ready.then(fitWordmark);
    fitWordmark();
    applyScrollScale();
  }

})();
