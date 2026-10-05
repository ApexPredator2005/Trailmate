/**
 * SplitView Controller for Trailmate Desktop Layout
 * 
 * Provides a user-resizable split between the center chat pane
 * and the right itinerary pane with boundary enforcement,
 * localStorage persistence, double-click reset, and accessibility.
 */

const STORAGE_KEY = 'trailmate_itinerary_width';
const DEFAULT_WIDTH = 320;
const MIN_ITINERARY_WIDTH = 250;
const MIN_CHAT_WIDTH = 320;
const SIDEBAR_WIDTH = 216;
const RESIZER_WIDTH = 6;
const MOBILE_BREAKPOINT = 768;

export class SplitViewController {
  constructor({
    containerSelector = '.app-container',
    resizerSelector = '.split-resizer',
    itinerarySelector = '.itinerary-pane',
    defaultWidth = DEFAULT_WIDTH,
    minItineraryWidth = MIN_ITINERARY_WIDTH,
    minChatWidth = MIN_CHAT_WIDTH
  } = {}) {
    this.container = document.querySelector(containerSelector);
    this.resizer = document.querySelector(resizerSelector);
    this.itinerary = document.querySelector(itinerarySelector);

    this.defaultWidth = defaultWidth;
    this.minItineraryWidth = minItineraryWidth;
    this.minChatWidth = minChatWidth;

    this.isDragging = false;
    this.currentWidth = this.getStoredWidth();

    this.init();
  }

  /**
   * Load stored width from localStorage or fallback to default
   */
  getStoredWidth() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= this.minItineraryWidth) {
          return val;
        }
      }
    } catch (e) {
      console.warn('localStorage not available for SplitView:', e);
    }
    return this.defaultWidth;
  }

  /**
   * Persist chosen width to localStorage
   */
  saveWidth(width) {
    try {
      localStorage.setItem(STORAGE_KEY, Math.round(width).toString());
    } catch (e) {
      console.warn('Failed to save width to localStorage:', e);
    }
  }

  /**
   * Calculate maximum allowable itinerary width based on current window size
   */
  getMaxItineraryWidth() {
    const windowWidth = window.innerWidth;
    const isTablet = windowWidth <= 1024;
    const currentSidebarWidth = isTablet ? 80 : SIDEBAR_WIDTH;
    const availableWidth = windowWidth - currentSidebarWidth - RESIZER_WIDTH;

    // Itinerary can take at most 50% of available space, and must leave at least minChatWidth for chat
    const maxBy50Percent = Math.floor(availableWidth * 0.5);
    const maxByChatMin = availableWidth - this.minChatWidth;

    const calculatedMax = Math.min(maxBy50Percent, maxByChatMin);
    return Math.max(this.minItineraryWidth, calculatedMax);
  }

  /**
   * Clamp width within calculated min and max boundaries
   */
  clampWidth(desiredWidth) {
    const maxWidth = this.getMaxItineraryWidth();
    return Math.max(this.minItineraryWidth, Math.min(desiredWidth, maxWidth));
  }

  /**
   * Apply width to CSS custom property on container and update ARIA attributes
   */
  applyWidth(width, save = false) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;

    const clamped = this.clampWidth(width);
    this.currentWidth = clamped;

    if (this.container) {
      this.container.style.setProperty('--itinerary-width', `${clamped}px`);
    }

    if (this.itinerary) {
      this.itinerary.style.width = `${clamped}px`;
      this.itinerary.style.flex = `0 0 ${clamped}px`;
    }

    if (this.resizer) {
      this.resizer.setAttribute('aria-valuenow', clamped.toString());
      this.resizer.setAttribute('aria-valuemin', this.minItineraryWidth.toString());
      this.resizer.setAttribute('aria-valuemax', this.getMaxItineraryWidth().toString());
    }

    if (save) {
      this.saveWidth(clamped);
    }
  }

  /**
   * Reset to default width
   */
  resetToDefault() {
    const defaultClamped = this.clampWidth(this.defaultWidth);
    this.applyWidth(defaultClamped, true);

    // Provide a subtle feedback animation
    if (this.resizer) {
      this.resizer.classList.add('is-active');
      setTimeout(() => this.resizer.classList.remove('is-active'), 200);
    }
  }

  /**
   * Bind all pointer, keyboard, and window events
   */
  init() {
    if (!this.resizer || !this.container) return;

    // Apply initial stored/default width
    this.applyWidth(this.currentWidth, false);

    // Setup Accessibility attributes
    this.resizer.setAttribute('role', 'separator');
    this.resizer.setAttribute('tabindex', '0');
    this.resizer.setAttribute('aria-orientation', 'vertical');
    this.resizer.setAttribute('aria-label', 'Resize chat and itinerary split view');
    this.resizer.title = 'Drag to resize, double-click to reset split view';

    // Pointer Events (Mouse, Touch, Pen)
    this.resizer.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
    window.addEventListener('pointercancel', this.onPointerUp.bind(this));

    // Double-click to reset
    this.resizer.addEventListener('dblclick', (e) => {
      e.preventDefault();
      this.resetToDefault();
    });

    // Keyboard accessibility (Arrow keys, Home, End, Enter, Space)
    this.resizer.addEventListener('keydown', this.onKeyDown.bind(this));

    // Window Resize clamping
    window.addEventListener('resize', () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        this.applyWidth(this.currentWidth, false);
      }
    });
  }

  onPointerDown(e) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    if (e.button !== 0) return; // Only main left click

    this.isDragging = true;
    this.resizer.setPointerCapture(e.pointerId);

    document.body.classList.add('is-resizing');
    this.resizer.classList.add('is-active');
    e.preventDefault();
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    // The itinerary is on the right side.
    // Desired width = total window width - mouse X position
    const desiredWidth = window.innerWidth - e.clientX;
    this.applyWidth(desiredWidth, false);
  }

  onPointerUp(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    try {
      this.resizer.releasePointerCapture(e.pointerId);
    } catch (_) {}

    document.body.classList.remove('is-resizing');
    this.resizer.classList.remove('is-active');

    // Save final width
    this.saveWidth(this.currentWidth);
  }

  onKeyDown(e) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;

    const step = e.shiftKey ? 40 : 10;
    let newWidth = this.currentWidth;

    switch (e.key) {
      case 'ArrowLeft':
        // Moving divider left expands itinerary
        newWidth = this.currentWidth + step;
        e.preventDefault();
        break;
      case 'ArrowRight':
        // Moving divider right shrinks itinerary
        newWidth = this.currentWidth - step;
        e.preventDefault();
        break;
      case 'Home':
        // Minimum itinerary width
        newWidth = this.minItineraryWidth;
        e.preventDefault();
        break;
      case 'End':
        // Maximum itinerary width
        newWidth = this.getMaxItineraryWidth();
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
      case 'Delete':
        // Reset to default
        this.resetToDefault();
        e.preventDefault();
        return;
      default:
        return;
    }

    this.applyWidth(newWidth, true);
  }
}

/**
 * Helper to mount the split view controller
 */
export function initSplitView(options) {
  return new SplitViewController(options);
}
