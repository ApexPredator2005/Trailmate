/**
 * ==========================================================================
 * Trailmate — VengeanceUI 3D Flip Text Engine & Selection Engine
 * Reverse-engineered from VengeanceUI (vengenceui.com/components/flip-text)
 * ==========================================================================
 */

/**
 * Build a VengeanceUI 3D Flip Text DOM element from a string
 * @param {string} text 
 * @param {object} options 
 * @returns {HTMLElement}
 */
export function buildFlipTextNode(text, options = {}) {
  const duration = options.duration ?? 2.0;
  const delay = options.delay ?? 0;
  const loop = options.loop !== false;
  const separator = options.separator ?? " ";
  const together = options.together ?? false;
  const className = options.className ?? "";

  const wrapper = document.createElement("span");
  wrapper.className = `flip-text-wrapper ${className}`.trim();
  wrapper.style.perspective = "1000px";
  wrapper.setAttribute("data-original-text", text);

  const words = text.split(separator);
  const totalChars = text.length;

  const getCharIndex = (wordIndex, charIndex) => {
    let index = 0;
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length);
    }
    return index + charIndex;
  };

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "flip-word";
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";
    wordSpan.style.transformStyle = "preserve-3d";

    const chars = word.split("");
    chars.forEach((char, charIndex) => {
      const globalIdx = getCharIndex(wordIndex, charIndex);
      let calculatedDelay = delay;

      if (!together && totalChars > 1) {
        const normalizedIndex = globalIdx / (totalChars - 1 || 1);
        const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
        calculatedDelay = sineValue * (duration * 0.25) + delay;
      }

      const charSpan = document.createElement("span");
      charSpan.className = "flip-char";
      charSpan.setAttribute("data-char", char);
      charSpan.textContent = char;
      charSpan.style.setProperty("--flip-duration", `${duration}s`);
      charSpan.style.setProperty("--flip-delay", `${calculatedDelay.toFixed(3)}s`);
      charSpan.style.setProperty("--flip-iteration", loop ? "infinite" : "1");
      wordSpan.appendChild(charSpan);
    });

    wrapper.appendChild(wordSpan);

    if (separator === " " && wordIndex < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.className = "whitespace inline-block";
      spaceSpan.innerHTML = "&nbsp;";
      wrapper.appendChild(spaceSpan);
    } else if (separator !== " " && wordIndex < words.length - 1) {
      const sepSpan = document.createElement("span");
      sepSpan.className = "separator inline-block";
      sepSpan.textContent = separator;
      wrapper.appendChild(sepSpan);
    }
  });

  return wrapper;
}

/**
 * Text Selection Flip Engine
 * Detects user text selection and dynamically applies 3D character flip animation
 */
let activeFlipSpan = null;
let floatingPill = null;
let isInternalAction = false;

function removeFloatingPill() {
  if (floatingPill && floatingPill.parentNode) {
    floatingPill.parentNode.removeChild(floatingPill);
    floatingPill = null;
  }
}

function unwrapActiveSpan() {
  if (activeFlipSpan && activeFlipSpan.parentNode) {
    const originalText = activeFlipSpan.getAttribute("data-original-text");
    if (originalText !== null) {
      const textNode = document.createTextNode(originalText);
      activeFlipSpan.parentNode.replaceChild(textNode, activeFlipSpan);
    }
  }
  activeFlipSpan = null;
  removeFloatingPill();
}

function showFloatingPill(rect, text) {
  removeFloatingPill();

  floatingPill = document.createElement("div");
  floatingPill.className = "flip-floating-pill";
  floatingPill.setAttribute("data-no-flip", "true");
  floatingPill.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:13px; color:#c4703d;">auto_awesome</span>
    <span>Flip Text (3D)</span>
    <span style="opacity:0.6; font-size:9px; margin-left:2px;">VENGEANCE UI</span>
  `;

  // Determine vertical placement (above selection, or below if near top of window)
  const isNearTop = rect.top < 45;
  const top = isNearTop
    ? Math.max(10, rect.bottom + window.scrollY + 8)
    : Math.max(10, rect.top + window.scrollY - 8);

  // Determine horizontal placement and clamp within viewport
  const centerLeft = rect.left + rect.width / 2 + window.scrollX;
  const clampedLeft = Math.max(90, Math.min(window.innerWidth - 90, centerLeft));

  floatingPill.style.top = `${top}px`;
  floatingPill.style.left = `${clampedLeft}px`;
  floatingPill.style.transform = isNearTop ? "translate(-50%, 0%)" : "translate(-50%, -100%)";

  // Re-trigger wave on clicking pill
  floatingPill.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeFlipSpan) {
      const chars = activeFlipSpan.querySelectorAll(".flip-char");
      chars.forEach((c) => {
        c.style.animation = "none";
        // Force reflow
        void c.offsetWidth;
        c.style.animation = "";
      });
    }
  });

  document.body.appendChild(floatingPill);
}

/**
 * Handle selection completion on mouseup or keyup
 */
function handleSelection() {
  if (isInternalAction) return;

  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    unwrapActiveSpan();
    return;
  }

  const text = selection.toString().trim();
  if (!text || text.length < 1 || text.length > 250) {
    return;
  }

  // Prevent wrapping inside inputs, textareas, buttons, or scripts
  const anchorNode = selection.anchorNode;
  const parent = anchorNode?.nodeType === 3 ? anchorNode.parentElement : anchorNode;
  if (!parent) return;

  if (parent.closest("input, textarea, [contenteditable='true'], button, .flip-floating-pill, .social-flip-container")) {
    return;
  }

  // If already inside our active flip span, just update pill position
  if (parent.closest(".flip-selection-active")) {
    const range = selection.getRangeAt(0);
    showFloatingPill(range.getBoundingClientRect(), text);
    return;
  }

  try {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check if range is valid and visible
    if (rect.width === 0 || rect.height === 0) return;

    // Clean up previous span if one was active
    unwrapActiveSpan();

    isInternalAction = true;
    const flipNode = buildFlipTextNode(text, {
      duration: 1.8,
      delay: 0,
      loop: true,
      className: "flip-selection-active",
    });

    range.deleteContents();
    range.insertNode(flipNode);
    activeFlipSpan = flipNode;

    // Show floating pill above the selection
    showFloatingPill(flipNode.getBoundingClientRect(), text);

    // Keep text selection active over the new flip node
    const newRange = document.createRange();
    newRange.selectNodeContents(flipNode);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } catch (err) {
    // If complex multi-element selection fails, fail silently
    console.debug("[FlipTextSelectionEngine] Selection span bypass:", err);
  } finally {
    isInternalAction = false;
  }
}

/**
 * Initialize global Text Selection Flip Engine
 */
export function initSelectionFlipEngine() {
  if (typeof window === "undefined" || window.__trailmateFlipEngineInitialized) {
    return;
  }
  window.__trailmateFlipEngineInitialized = true;

  document.addEventListener("mouseup", () => {
    setTimeout(handleSelection, 20);
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Shift" || e.key.startsWith("Arrow")) {
      setTimeout(handleSelection, 20);
    } else if (e.key === "Escape") {
      unwrapActiveSpan();
      window.getSelection()?.removeAllRanges();
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (floatingPill && !floatingPill.contains(e.target) && !activeFlipSpan?.contains(e.target)) {
      unwrapActiveSpan();
    }
  });

  // Also bind to interactive header titles if present
  enhanceInteractiveFlipHeaders();
}

/**
 * Attach flip text hover/click to key titles and badges
 */
export function enhanceInteractiveFlipHeaders() {
  const titles = document.querySelectorAll("[data-flip-interactive]");
  titles.forEach((el) => {
    if (el.__flipEnhanced) return;
    el.__flipEnhanced = true;
    const originalText = el.textContent.trim();
    if (!originalText) return;

    el.addEventListener("mouseenter", () => {
      const flipNode = buildFlipTextNode(originalText, {
        duration: 1.6,
        loop: false,
        together: false,
      });
      el.innerHTML = "";
      el.appendChild(flipNode);
    });

    el.addEventListener("mouseleave", () => {
      el.textContent = originalText;
    });
  });
}
