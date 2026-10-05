// src/components/ScrapbookStudio.js
// ─────────────────────────────────────────────────────────────────────────────
// Scrapbook Studio Customizer Drawer:
// Manages Background, Frame, Font, and the new decorative Embellishments category.
// ─────────────────────────────────────────────────────────────────────────────

import {
  SCRAPBOOK_BACKGROUNDS,
  SCRAPBOOK_FRAMES,
  SCRAPBOOK_FONTS,
  EMBELLISHMENT_CATEGORIES,
  EMBELLISHMENTS,
} from './EmbellishmentsData.js';

export class ScrapbookStudio {
  constructor({ canvasInstance, onStyleChange } = {}) {
    this.canvas = canvasInstance;
    this.onStyleChange = onStyleChange;

    this.activeTab = 'embellishments'; // 'embellishments' | 'background' | 'frames' | 'fonts'
    this.activeSubCat = 'scraps'; // 'scraps' | 'travel' | 'food' | 'tape' | 'botanicals' | 'fasteners' | 'marks'

    this.selectedBg = localStorage.getItem('trailmate_scrapbook_bg') || 'bg-parchment';
    this.selectedFrame = localStorage.getItem('trailmate_scrapbook_frame') || 'frame-polaroid';
    this.selectedFont = localStorage.getItem('trailmate_scrapbook_font') || 'font-editorial';

    this.isOpen = false;
    this._initDrawer();
    this._applyGlobalStyles();
  }

  _initDrawer() {
    let el = document.getElementById('scrapbookStudioDrawer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'scrapbookStudioDrawer';
      el.className = 'scrapbook-studio-drawer hidden';
      document.body.appendChild(el);
    }
    this.el = el;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.el.classList.remove('hidden');
    this.render();
  }

  close() {
    this.isOpen = false;
    this.el.classList.add('hidden');
  }

  _applyGlobalStyles() {
    const itineraryBody = document.getElementById('itineraryBody');
    const itineraryPane = document.getElementById('itineraryPane');
    if (!itineraryBody) return;

    // Apply Background
    const bgPreset = SCRAPBOOK_BACKGROUNDS.find((b) => b.id === this.selectedBg);
    if (bgPreset && itineraryPane) {
      itineraryPane.style.background = bgPreset.texture || bgPreset.color;
      itineraryBody.style.background = 'transparent';
    }

    // Apply Frame Class
    SCRAPBOOK_FRAMES.forEach((f) => itineraryBody.classList.remove(f.cssClass));
    const framePreset = SCRAPBOOK_FRAMES.find((f) => f.id === this.selectedFrame);
    if (framePreset) {
      itineraryBody.classList.add(framePreset.cssClass);
    }

    // Apply Font
    const fontPreset = SCRAPBOOK_FONTS.find((f) => f.id === this.selectedFont);
    if (fontPreset) {
      itineraryBody.style.fontFamily = fontPreset.fontFamily;
    }

    if (typeof this.onStyleChange === 'function') {
      this.onStyleChange({
        bg: this.selectedBg,
        frame: this.selectedFrame,
        font: this.selectedFont,
      });
    }
  }

  render() {
    if (!this.el) return;

    this.el.innerHTML = `
      <!-- Header -->
      <div class="scrapbook-studio-header">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
          <h4 class="font-headline-md text-sm font-bold text-neutral-900">Scrapbook Studio</h4>
        </div>
        <button id="btnCloseStudio" class="p-1 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-black/5 transition-colors cursor-pointer" aria-label="Close Studio">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Main Tab Bar -->
      <div class="scrapbook-tab-bar">
        <button class="scrapbook-tab-btn ${this.activeTab === 'embellishments' ? 'is-active' : ''}" data-tab="embellishments">
          ✨ Embellishments
        </button>
        <button class="scrapbook-tab-btn ${this.activeTab === 'background' ? 'is-active' : ''}" data-tab="background">
          🖼️ Background
        </button>
        <button class="scrapbook-tab-btn ${this.activeTab === 'frames' ? 'is-active' : ''}" data-tab="frames">
          🔲 Frames
        </button>
        <button class="scrapbook-tab-btn ${this.activeTab === 'fonts' ? 'is-active' : ''}" data-tab="fonts">
          ✍️ Fonts
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="scrapbook-tab-content" id="scrapbookTabContent">
        ${this._renderActiveTabContent()}
      </div>
    `;

    this._bindEvents();
  }

  _renderActiveTabContent() {
    if (this.activeTab === 'embellishments') {
      const query = (this.searchQuery || '').trim().toLowerCase();
      let items = [];
      if (!query) {
        items = EMBELLISHMENTS[this.activeSubCat] || [];
      } else {
        const seenIds = new Set();
        for (const cat of Object.keys(EMBELLISHMENTS)) {
          for (const item of (EMBELLISHMENTS[cat] || [])) {
            if (seenIds.has(item.id)) continue;
            if (
              (item.name && item.name.toLowerCase().includes(query)) ||
              (item.id && item.id.toLowerCase().includes(query)) ||
              (item.category && item.category.toLowerCase().includes(query))
            ) {
              items.push(item);
              seenIds.add(item.id);
            }
          }
        }
      }

      return `
        <div>
          <!-- Search Input Bar -->
          <div class="relative mb-2.5">
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-2.5 text-neutral-400 text-[18px] pointer-events-none">search</span>
              <input
                type="text"
                id="studioStickerSearchInput"
                value="${this.searchQuery || ''}"
                placeholder="Search stickers (e.g. camper, chai, flower)..."
                class="w-full pl-8 pr-8 py-2 bg-white text-xs text-neutral-800 placeholder-neutral-400 rounded-xl border border-neutral-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
              />
              ${
                this.searchQuery
                  ? `
                <button type="button" id="btnClearStudioSearch" class="absolute right-2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-100 transition-colors" title="Clear search">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Category Sub-pills -->
          <div class="embellishment-subcat-pills mb-3 ${query ? 'opacity-50' : ''}">
            ${EMBELLISHMENT_CATEGORIES.map(
              (cat) => `
              <button type="button" class="subcat-pill-btn ${!query && this.activeSubCat === cat.id ? 'is-active' : ''}" data-subcat="${cat.id}">
                ${cat.name}
              </button>
            `
            ).join('')}
          </div>

          <!-- Embellishments Grid -->
          <div class="embellishments-grid">
            ${
              items.length === 0
                ? `
              <div class="col-span-3 py-6 px-3 text-center bg-white/70 rounded-2xl border border-dashed border-neutral-300">
                <span class="material-symbols-outlined text-2xl text-neutral-400 mb-1">search_off</span>
                <p class="text-xs font-bold text-neutral-800">No stickers found</p>
                <p class="text-[10px] text-neutral-500 mt-0.5">No results matching "${this.searchQuery}"</p>
              </div>
            `
                : items
                    .map(
                      (item) => `
              <button type="button" class="embellishment-card-btn" data-template-id="${item.id}" data-cat="${item.category}" title="${item.name}">
                <div class="embellishment-card-preview">
                  ${item.svg}
                </div>
              </button>
            `
                    )
                    .join('')
            }
          </div>

          <!-- Canvas clear action -->
          <div class="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
            <span class="text-[10px] text-neutral-500 font-mono">${this.canvas?.items?.length || 0} placed items</span>
            <button id="btnClearCanvas" class="text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
              Clear All Stickers
            </button>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'background') {
      return `
        <div class="preset-swatch-grid">
          ${SCRAPBOOK_BACKGROUNDS.map(
            (bg) => `
            <div class="preset-swatch-card ${this.selectedBg === bg.id ? 'is-active' : ''}" data-bg-id="${bg.id}">
              <div class="w-full h-8 rounded-lg mb-2 border border-black/10" style="background: ${bg.texture || bg.color};"></div>
              <h5 class="text-xs font-bold text-neutral-900">${bg.name}</h5>
            </div>
          `
          ).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'frames') {
      return `
        <div class="grid grid-cols-2 gap-2.5">
          <!-- 1. Polaroid Classic Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${this.selectedFrame === 'frame-polaroid' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between" data-frame-id="frame-polaroid" title="Polaroid Classic">
            <div class="w-full h-24 bg-white p-1.5 pb-4 rounded shadow-xs border border-neutral-200 flex flex-col items-center justify-between">
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=75" class="w-full h-16 object-cover rounded-xs" alt="Polaroid Sample" />
              <span class="text-[7px] font-bold text-neutral-600 font-['Caveat'] leading-none mt-1">FIELD MEMORY</span>
            </div>
            ${this.selectedFrame === 'frame-polaroid' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 2. Deckled Torn Edge Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${this.selectedFrame === 'frame-deckled' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between" data-frame-id="frame-deckled" title="Deckled Torn Edge">
            <div class="w-full h-24 bg-[#fdfbf7] p-1.5 shadow-xs border border-neutral-200 flex items-center justify-center" style="clip-path: polygon(0% 3px, 5% 0px, 10% 4px, 20% 1px, 30% 4px, 40% 0px, 50% 3px, 60% 0px, 70% 4px, 80% 1px, 90% 4px, 100% 0px, 97% 20%, 100% 40%, 96% 60%, 100% 80%, 97% 100%, 80% 97%, 60% 100%, 40% 96%, 20% 100%, 0% 97%, 4% 80%, 0% 60%, 3% 40%, 0% 20%);">
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs" alt="Deckled Sample" />
            </div>
            ${this.selectedFrame === 'frame-deckled' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 3. Perforated Postage Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${this.selectedFrame === 'frame-postage' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between" data-frame-id="frame-postage" title="Perforated Postage">
            <div class="w-full h-24 bg-[#fbf9f4] p-1.5 rounded-lg border-2 border-dashed border-[#baa47e] shadow-xs flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs border border-black/10" alt="Postage Sample" />
            </div>
            ${this.selectedFrame === 'frame-postage' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 4. Vintage Brass Inset Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${this.selectedFrame === 'frame-brass' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between" data-frame-id="frame-brass" title="Vintage Brass Inset">
            <div class="w-full h-24 bg-[#23201d] p-1.5 rounded border-2 border-[#d1a847] shadow-xs flex items-center justify-center relative">
              <div class="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#e6ae55]"></div>
              <div class="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#e6ae55]"></div>
              <div class="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#e6ae55]"></div>
              <div class="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#e6ae55]"></div>
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs border border-[#d1a847]" alt="Brass Sample" />
            </div>
            ${this.selectedFrame === 'frame-brass' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 5. Modern Clean Cut Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${this.selectedFrame === 'frame-clean' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between col-span-2" data-frame-id="frame-clean" title="Modern Clean Cut">
            <div class="w-full h-20 rounded-lg shadow-xs border border-neutral-200 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=75" class="w-full h-full object-cover" alt="Clean Cut Sample" />
            </div>
            ${this.selectedFrame === 'frame-clean' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'fonts') {
      return `
        <div class="space-y-2">
          ${SCRAPBOOK_FONTS.map(
            (font) => `
            <div class="p-2.5 bg-white rounded-xl border ${this.selectedFont === font.id ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/30' : 'border-neutral-200'} cursor-pointer transition-all hover:border-secondary flex items-center justify-between" data-font-id="${font.id}">
              <h5 class="text-sm font-bold text-neutral-900" style="font-family: ${font.fontFamily};">${font.name}</h5>
              ${this.selectedFont === font.id ? '<span class="material-symbols-outlined text-secondary text-sm">check_circle</span>' : ''}
            </div>
          `
          ).join('')}
        </div>
      `;
    }

    return '';
  }

  _bindEvents() {
    // Close button
    this.el.querySelector('#btnCloseStudio')?.addEventListener('click', () => this.close());

    // Main tabs
    this.el.querySelectorAll('.scrapbook-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Search Input in Embellishments
    const searchInput = this.el.querySelector('#studioStickerSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const itemsContainer = this.el.querySelector('.embellishments-grid');
        if (itemsContainer) {
          this.render();
          const nextInput = this.el.querySelector('#studioStickerSearchInput');
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
          }
        }
      });
    }

    this.el.querySelector('#btnClearStudioSearch')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });

    // Subcategory pills
    this.el.querySelectorAll('.subcat-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeSubCat = btn.dataset.subcat;
        this.searchQuery = '';
        this.render();
      });
    });

    // Embellishment item click -> Place on canvas
    this.el.querySelectorAll('.embellishment-card-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tId = btn.dataset.templateId;
        const cat = btn.dataset.cat;
        if (this.canvas) {
          this.canvas.placeEmbellishment(tId, cat);
          // Re-render count
          const countEl = this.el.querySelector('.font-mono');
          if (countEl) countEl.textContent = `${this.canvas.items.length} placed items`;
        }
      });
    });

    // Clear Canvas button
    this.el.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      if (this.canvas) {
        this.canvas.clearAll();
        const countEl = this.el.querySelector('.font-mono');
        if (countEl) countEl.textContent = '0 placed items';
      }
    });

    // Background select
    this.el.querySelectorAll('[data-bg-id]').forEach((card) => {
      card.addEventListener('click', () => {
        this.selectedBg = card.dataset.bgId;
        localStorage.setItem('trailmate_scrapbook_bg', this.selectedBg);
        this._applyGlobalStyles();
        this.render();
      });
    });

    // Frame select
    this.el.querySelectorAll('[data-frame-id]').forEach((card) => {
      card.addEventListener('click', () => {
        this.selectedFrame = card.dataset.frameId;
        localStorage.setItem('trailmate_scrapbook_frame', this.selectedFrame);
        this._applyGlobalStyles();
        this.render();
      });
    });

    // Font select
    this.el.querySelectorAll('[data-font-id]').forEach((card) => {
      card.addEventListener('click', () => {
        this.selectedFont = card.dataset.fontId;
        localStorage.setItem('trailmate_scrapbook_font', this.selectedFont);
        this._applyGlobalStyles();
        this.render();
      });
    });
  }
}
