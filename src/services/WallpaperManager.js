/**
 * WallpaperManager.js — Orchestrates automatic 4K wallpaper rotation
 * with smooth diffusing cross-dissolve transitions, progress timers,
 * category filtering, and offline fallbacks.
 */

import { WALLPAPERS, WALLPAPER_CATEGORIES } from '../data/WallpapersData.js';

export class WallpaperManager {
  constructor({
    containerId = 'fullViewBackground',
    intervalMs = 9000,
    autoStart = true,
  } = {}) {
    this.containerId = containerId;
    this.intervalMs = intervalMs;
    this.autoStart = autoStart;

    this.wallpapers = [...WALLPAPERS];
    this.currentCategory = localStorage.getItem('trailmate_wallpaper_category') || 'All';
    this.filteredWallpapers = this._getFilteredList();

    this.currentIndex = 0;
    this.activeLayer = 'a'; // 'a' or 'b'
    this.isPlaying = localStorage.getItem('trailmate_wallpaper_paused') !== 'true';

    this.timer = null;
    this.progressInterval = null;
    this.elapsedMs = 0;
    this.isTransitioning = false;

    // DOM references
    this.container = null;
    this.slideA = null;
    this.slideB = null;
    this.overlay = null;

    // Cache decoded Image objects & resolved URLs
    this._decodedUrls = new Set();
    this._resolvedUrls = new Map();
  }

  _getFilteredList() {
    if (!this.currentCategory || this.currentCategory === 'All') {
      return [...this.wallpapers];
    }
    const filtered = this.wallpapers.filter(w => w.category === this.currentCategory);
    return filtered.length > 0 ? filtered : [...this.wallpapers];
  }

  mount(targetContainer = null) {
    this.container = targetContainer || document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`[WallpaperManager] Container #${this.containerId} not found.`);
      return;
    }

    // Render container DOM structure (clean wallpaper display without floating pill)
    this.container.innerHTML = `
      <div class="wallpaper-container" id="wallpaperContainerRoot">
        <div class="wallpaper-slide wallpaper-slide-a" id="wallpaperSlideA"></div>
        <div class="wallpaper-slide wallpaper-slide-b" id="wallpaperSlideB"></div>
        <div class="wallpaper-diffuse-overlay"></div>
      </div>
    `;

    this.slideA = this.container.querySelector('#wallpaperSlideA');
    this.slideB = this.container.querySelector('#wallpaperSlideB');

    // Show initial wallpaper immediately with fallback
    const initialItem = this.filteredWallpapers[this.currentIndex] || this.wallpapers[0];
    this.slideA.style.backgroundImage = `url('${initialItem.url}')`;
    this.slideA.classList.add('is-active');

    // Asynchronously decode initial & upcoming wallpapers in GPU memory
    this._preloadAndDecode(initialItem.url, initialItem.fallback).then(res => {
      if (this.slideA) this.slideA.style.backgroundImage = `url('${res}')`;
    }).catch(() => {});
    const upcoming = this._getNextWallpaper();
    if (upcoming) {
      this._preloadAndDecode(upcoming.url, upcoming.fallback).catch(() => {});
    }

    // Page visibility awareness: pause when user switches browser tab, resume on return
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._stopTimers();
      } else if (this.isPlaying) {
        this._startTimers();
      }
    });

    if (this.autoStart && this.isPlaying) {
      this._startTimers();
    }
  }

  _renderCategoryMenu() {}

  _bindControls() {}

  async _preloadAndDecode(url, fallback) {
    if (this._decodedUrls.has(url)) {
      return this._resolvedUrls.get(url) || url;
    }

    const loadImg = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode()
          .then(() => resolve(src))
          .catch(() => {
            img.onload = () => resolve(src);
            img.onerror = reject;
          });
      } else {
        img.onload = () => resolve(src);
        img.onerror = reject;
      }
    });

    try {
      const resolved = await loadImg(url);
      this._decodedUrls.add(url);
      this._resolvedUrls.set(url, resolved);
      return resolved;
    } catch {
      try {
        const fallbackResolved = await loadImg(fallback);
        this._decodedUrls.add(url);
        this._resolvedUrls.set(url, fallbackResolved);
        return fallbackResolved;
      } catch {
        return url;
      }
    }
  }

  _getNextWallpaper() {
    const nextIdx = (this.currentIndex + 1) % this.filteredWallpapers.length;
    return this.filteredWallpapers[nextIdx];
  }

  _updatePillMetadata() {}

  /**
   * Performs the dual-layer 800ms crossfade transition.
   * Incoming image is fully decoded in memory BEFORE opacity begins transitioning.
   */
  async _transitionTo(nextIndex) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const nextItem = this.filteredWallpapers[nextIndex];
    if (!nextItem) {
      this.isTransitioning = false;
      return;
    }

    const currentLayer = this.activeLayer === 'a' ? this.slideA : this.slideB;
    const incomingLayer = this.activeLayer === 'a' ? this.slideB : this.slideA;

    // 1. Fully decode image in memory first to prevent any blank/unbuffered cut
    let resolvedUrl = nextItem.url;
    try {
      resolvedUrl = await this._preloadAndDecode(nextItem.url, nextItem.fallback);
    } catch {}

    // 2. Set background on incoming layer while hidden (opacity: 0)
    incomingLayer.style.backgroundImage = `url('${resolvedUrl}')`;
    incomingLayer.classList.remove('is-active', 'is-fading-out');

    // Force browser style reflow before starting CSS transition
    void incomingLayer.offsetWidth;

    // 3. Trigger 800ms concurrent crossfade in next frame
    requestAnimationFrame(() => {
      // Incoming layer fades in: opacity 0 -> 1 over 800ms
      incomingLayer.classList.add('is-active');

      // Current layer fades out: opacity 1 -> 0 over 800ms
      currentLayer.classList.remove('is-active');
      currentLayer.classList.add('is-fading-out');

      this.currentIndex = nextIndex;
      this.activeLayer = this.activeLayer === 'a' ? 'b' : 'a';

      // 4. Complete transition after 850ms
      setTimeout(() => {
        currentLayer.classList.remove('is-fading-out');
        this.isTransitioning = false;

        // Preload upcoming item into memory for the next automatic cycle
        const upcomingItem = this._getNextWallpaper();
        if (upcomingItem) {
          this._preloadAndDecode(upcomingItem.url, upcomingItem.fallback).catch(() => {});
        }
      }, 850);
    });
  }

  next() {
    const nextIdx = (this.currentIndex + 1) % this.filteredWallpapers.length;
    this._transitionTo(nextIdx);
    if (this.isPlaying) {
      this._resetProgress();
    }
  }

  prev() {
    const prevIdx = (this.currentIndex - 1 + this.filteredWallpapers.length) % this.filteredWallpapers.length;
    this._transitionTo(prevIdx);
    if (this.isPlaying) {
      this._resetProgress();
    }
  }

  setCategory(category) {
    this.currentCategory = category;
    localStorage.setItem('trailmate_wallpaper_category', category);
    this.filteredWallpapers = this._getFilteredList();
    this.currentIndex = 0;
    this.next();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    this.isPlaying = false;
    localStorage.setItem('trailmate_wallpaper_paused', 'true');
    this._stopTimers();
  }

  resume() {
    this.isPlaying = true;
    localStorage.setItem('trailmate_wallpaper_paused', 'false');
    this._startTimers();
  }

  _startTimers() {
    this._stopTimers();
    this.timer = setTimeout(() => {
      this.next();
    }, this.intervalMs);
  }

  _stopTimers() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  _resetProgress() {
    this._startTimers();
  }

  destroy() {
    this._stopTimers();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Global singleton instance
export const wallpaperManager = new WallpaperManager();
export default wallpaperManager;
