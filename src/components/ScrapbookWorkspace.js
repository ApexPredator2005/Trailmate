// src/components/ScrapbookWorkspace.js
// ─────────────────────────────────────────────────────────────────────────────
// Canva-Like Travel Scrapbook Studio Workspace
// Includes:
//   1. 🎟️ Tactile Travel Ephemera (Boarding Passes, Mountain Railway Tickets, Receipts, Luggage Tags)
//   2. 🔤 Rich Typography Inspector & Customizable Postal Cancellation Stamps
//   3. 🗺️ Mini Route Snippets & Mountain Altitude Badges
//   4. 📖 Multi-Format Canvas (4:3 Spread, 9:16 Social Story, 6:4 Postcard) & HD Book Export
// ─────────────────────────────────────────────────────────────────────────────

import {
  EMBELLISHMENT_CATEGORIES,
  EMBELLISHMENTS,
  SCRAPBOOK_BACKGROUNDS,
  SCRAPBOOK_PAPER_EDGES,
  SCRAPBOOK_FRAMES,
  EPHEMERA_TEMPLATES,
  ROUTE_BADGE_TEMPLATES,
} from './EmbellishmentsData.js';
import { DEMO_SCRAPBOOK_PAGE } from './ScrapbookDemoData.js';
import { store } from '../store/state.js';

export const TEXT_PALETTE_COLORS = [
  { name: 'Slate Charcoal', value: '#1B1C1A' },
  { name: 'Warm Terracotta', value: '#C86D51' },
  { name: 'Espresso Ink', value: '#3D261A' },
  { name: 'Forest Pine', value: '#2E4433' },
  { name: 'Indigo Fountain Pen', value: '#1D3557' },
  { name: 'Antique Gold', value: '#D1A847' },
  { name: 'Crimson Stamp', value: '#BA1A1A' },
  { name: 'Plum Wine', value: '#6A1B29' },
  { name: 'Olive Moss', value: '#556B2F' },
  { name: 'Misty Sage', value: '#5B8C7B' },
  { name: 'Weathered Sepia', value: '#763403' },
  { name: 'Graphite Pencil', value: '#5A5A5A' },
];

export const SCRAPBOOK_FONTS = [
  { id: 'caveat', name: 'Traveler Script', family: "'Caveat', cursive, sans-serif" },
  { id: 'noto-serif', name: 'Editorial Serif', family: "'Noto Serif', Georgia, serif" },
  { id: 'playfair', name: 'Botanical Display', family: "'Playfair Display', Georgia, serif" },
  { id: 'jetbrains', name: 'Typewriter Log', family: "'JetBrains Mono', monospace" },
  { id: 'public-sans', name: 'Public Grotesque', family: "'Public Sans', sans-serif" },
  { id: 'jakarta', name: 'Modern Clean', family: "'Plus Jakarta Sans', sans-serif" },
];

export class ScrapbookWorkspace {
  constructor({ containerId = 'scrapbookWorkspaceView' } = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.activeDockTab = null; // Retracted by default until user clicks a dock tool button
    this.activeEmbellishmentSubcat = 'stamps';
    this.stickerSearchQuery = '';
    this.activePageIndex = 0;
    this.selectedElementId = null;
    this.selectedElementIds = new Set(); // Multi-element selection set (Shift+Click)

    // Undo / Redo History Command Stack (Max 50 snapshots)
    this._undoStack = [];
    this._redoStack = [];

    // Sticker Favorites & Recently Used (Persisted in localStorage)
    this._favoriteStickers = new Set(JSON.parse(localStorage.getItem('trailmate_sticker_favorites') || '[]'));
    this._recentStickers = JSON.parse(localStorage.getItem('trailmate_sticker_recent') || '[]');

    this.canvasFormat = 'format-spread'; // 'format-spread' (4:3) | 'format-story' (9:16) | 'format-postcard' (6:4)
    this.zoomLevel = 1.0; // In-canvas zoom level (0.35x - 2.5x)

    this.activeDrag = null; // { type: 'move' | 'resize' | 'rotate', elementId, handle, startX, startY, ... }

    // User Uploaded Photos Library (Cached in localStorage browser storage)
    this.uploadedPhotos = this._loadUploadedPhotos();

    // Multi-Page Project State
    this.pages = this._loadSavedPages();
    this.isViewingDemo = !!this.pages[this.activePageIndex]?.isDemo;

    this.render();
    this._bindEvents();
  }

  setZoom(level) {
    this.zoomLevel = Math.max(0.35, Math.min(2.5, Math.round(level * 100) / 100));
    const artboard = this.container.querySelector('#scrapbookArtboard');
    if (artboard) {
      artboard.style.transform = `scale(${this.zoomLevel})`;
    }
    const zoomLabel = this.container.querySelector('#btnZoomReset');
    if (zoomLabel) {
      zoomLabel.innerText = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  _getTabIcon(tab) {
    const icons = {
      photos: 'cloud_upload',
      embellishments: 'auto_awesome',
      ephemera: 'confirmation_number',
      routes: 'alt_route',
      text: 'title',
      background: 'palette',
      frames: 'crop_portrait',
    };
    return icons[tab] || 'layers';
  }

  _getTabTitle(tab) {
    const titles = {
      photos: 'Upload',
      embellishments: 'Stickers & Scraps',
      ephemera: 'Tickets & Keepsakes',
      routes: 'Routes & Badges',
      text: 'Typography',
      background: 'Paper & Edges',
      frames: 'Frames',
    };
    return titles[tab] || 'Assets';
  }

  _loadSavedPages() {
    try {
      const saved = localStorage.getItem('trailmate_scrapbook_pages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((p) => {
            if (p.title) p.title = p.title.replace(/^✨\s*DEMO:\s*/i, '');
          });
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Default to fully realized, rich showcase scrapbook page
    return [JSON.parse(JSON.stringify(DEMO_SCRAPBOOK_PAGE))];
  }

  _savePages() {
    try {
      localStorage.setItem('trailmate_scrapbook_pages', JSON.stringify(this.pages));
    } catch {
      // ignore
    }
  }

  _loadUploadedPhotos() {
    try {
      const saved = localStorage.getItem('trailmate_scrapbook_user_photos');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    ];
  }

  _saveUploadedPhotos() {
    try {
      localStorage.setItem('trailmate_scrapbook_user_photos', JSON.stringify(this.uploadedPhotos));
    } catch {
      // ignore
    }
  }

  _getAllLibraryPhotos() {
    const trip = store.getState()?.trip || {};
    const tripPhotos = [];

    // Collect all authentic photos from user-selected places & attractions
    if (Array.isArray(trip.selectedPlaces)) {
      trip.selectedPlaces.forEach((p) => {
        if (Array.isArray(p.photos) && p.photos.length > 0) {
          tripPhotos.push(...p.photos);
        } else if (p.photo) {
          tripPhotos.push(p.photo);
        }
      });
    }

    // Collect from itinerary days & activities if populated
    if (Array.isArray(trip.itinerary?.days)) {
      trip.itinerary.days.forEach((day) => {
        if (Array.isArray(day.activities)) {
          day.activities.forEach((act) => {
            if (Array.isArray(act.photos)) {
              tripPhotos.push(...act.photos);
            } else if (act.photo) {
              tripPhotos.push(act.photo);
            }
          });
        }
      });
    }

    const combined = [...(this.uploadedPhotos || []), ...tripPhotos];
    const unique = Array.from(new Set(combined.filter((s) => typeof s === 'string' && s.length > 5)));
    return unique.length > 0 ? unique : (this.uploadedPhotos || []);
  }


  loadDemoShowcase() {
    this.pages = [JSON.parse(JSON.stringify(DEMO_SCRAPBOOK_PAGE))];
    this.activePageIndex = 0;
    this.isViewingDemo = true;
    this.selectedElementId = null;
    this._savePages();
    this.render();
  }

  startBlankTrip() {
    this.pages = [
      {
        id: `page-${Date.now()}`,
        title: 'Expedition Journal — Page 1',
        background: 'bg-heritage-parchment',
        edgeStyle: 'edge-torn',
        format: 'format-spread',
        isDemo: false,
        elements: [],
      },
    ];
    this.activePageIndex = 0;
    this.isViewingDemo = false;
    this.selectedElementId = null;
    this._savePages();
    this.render();
  }

  startFromItinerary() {
    // Generate initial trip elements from planner itinerary
    const sampleTripPage = {
      id: `page-${Date.now()}`,
      title: 'My Journey Journal — Page 1',
      background: 'bg-cold-press-art-paper',
      edgeStyle: 'edge-torn',
      format: 'format-spread',
      isDemo: false,
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          content: 'Our Signature Travel Itinerary',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26,
          color: '#1B1C1A',
          bold: true,
          italic: false,
          align: 'left',
          x: 40,
          y: 40,
          width: 380,
          height: 40,
          rotation: 0,
          zIndex: 2,
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'ephemera',
          ephemeraType: 'boarding-pass',
          passenger: 'EXPLORER',
          flight: 'AI-802',
          from: 'START',
          to: 'DEST',
          seat: '02A',
          gate: '01',
          date: 'DAY 01',
          x: 40,
          y: 95,
          width: 320,
          height: 120,
          rotation: -2,
          zIndex: 3,
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'photo',
          src: this.uploadedPhotos[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
          frameStyle: 'frame-polaroid',
          x: 400,
          y: 50,
          width: 250,
          height: 290,
          rotation: 3,
          zIndex: 2,
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'sticker',
          category: 'washi',
          templateId: 'washi-terracotta-check',
          x: 410,
          y: 35,
          width: 85,
          height: 30,
          rotation: -20,
          zIndex: 5,
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'routes',
          badgeType: 'route-card',
          pointA: 'Day 01 Check-In',
          pointB: 'Day 02 Scenic Trail',
          pointC: 'Day 03 Golden View',
          x: 40,
          y: 235,
          width: 240,
          height: 100,
          rotation: 1,
          zIndex: 3,
        },
      ],
    };

    this.pages = [sampleTripPage];
    this.activePageIndex = 0;
    this.isViewingDemo = false;
    this.selectedElementId = null;
    this._savePages();
    this.render();
  }

  getCurrentPage() {
    return this.pages[this.activePageIndex] || this.pages[0];
  }

  render() {
    if (!this.container) return;

    const page = this.getCurrentPage();
    const isDemoPage = !!page.isDemo;
    const bgPreset = SCRAPBOOK_BACKGROUNDS.find((b) => b.id === page.background) || SCRAPBOOK_BACKGROUNDS[0];
    const formatClass = page.format || this.canvasFormat;
    const edgeClass = page.edgeStyle || 'edge-torn';

    this.container.innerHTML = `
      <div class="scrapbook-workspace">
        
        <!-- Top Toolbar (Minimalist Title & Export Bar) -->
        <header class="scrapbook-top-bar">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-2xl">auto_awesome_mosaic</span>
            <input type="text" class="scrapbook-title-input" id="scrapbookPageTitle" value="${page.title || 'Travel Scrapbook'}" title="Click to rename page" />
          </div>

          <!-- Center: Page Controls -->
          <div class="flex items-center gap-2 bg-[#ece7de] px-3 py-1 rounded-full border border-black/5">
            <button id="btnPrevPage" class="p-1 rounded-full hover:bg-white transition-colors cursor-pointer ${this.activePageIndex === 0 ? 'opacity-40 pointer-events-none' : ''}" title="Previous Page">
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span class="font-mono text-xs font-bold text-neutral-800">Page ${this.activePageIndex + 1} of ${this.pages.length}</span>
            <button id="btnNextPage" class="p-1 rounded-full hover:bg-white transition-colors cursor-pointer ${this.activePageIndex === this.pages.length - 1 ? 'opacity-40 pointer-events-none' : ''}" title="Next Page">
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <div class="w-[1px] h-4 bg-neutral-300 mx-1"></div>
            <button id="btnAddPage" class="text-[11px] font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 cursor-pointer" title="Add Blank Page">
              <span class="material-symbols-outlined text-xs">add</span> Add Page
            </button>
            <button id="btnDeletePage" class="p-1 text-neutral-500 hover:text-red-700 transition-colors cursor-pointer ${this.pages.length <= 1 ? 'hidden' : ''}" title="Delete Current Page">
              <span class="material-symbols-outlined text-xs">delete</span>
            </button>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex items-center gap-2">
            <button id="btnExportScrapbook" class="py-2 px-3.5 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95">
              <span class="material-symbols-outlined text-sm">print</span>
              <span>Export HD</span>
            </button>
          </div>
        </header>

        <!-- Main Stage (Full-Bleed Center Canvas Viewport + Hovering Bottom Dock) -->
        <div class="scrapbook-main-stage">
          
          <!-- Center Canvas Viewport -->
          <div class="scrapbook-canvas-viewport" id="scrapbookViewport">
            <div
              class="scrapbook-artboard ${formatClass} ${edgeClass}"
              id="scrapbookArtboard"
              style="background: ${bgPreset.texture || bgPreset.color}; transform: scale(${this.zoomLevel});"
            >
              <!-- Subtle Paper Watermark Logo -->
              <div class="scrapbook-paper-watermark" aria-hidden="true">
                <img src="/logo.png" alt="" />
              </div>

              ${this._renderCanvasElements(page)}
            </div>
          </div>


          <!-- Floating Asset Drawer Tray (Opens above bottom dock) -->
          ${this.activeDockTab ? `
            <div class="scrapbook-floating-tray" id="scrapbookFloatingTray">
              <div class="floating-tray-header">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary text-base">${this._getTabIcon(this.activeDockTab)}</span>
                  <h4 class="text-xs font-bold text-neutral-900">${this._getTabTitle(this.activeDockTab)}</h4>
                </div>
                <button type="button" id="btnCloseFloatingTray" class="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer" title="Retract Tray">
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div class="floating-tray-body">
                ${this._renderDockPanelContent()}
              </div>
            </div>
          ` : ''}

          <!-- Floating Bottom Hovering Capsule Dock -->
          <div class="scrapbook-floating-dock" id="scrapbookFloatingDock">
            
            <!-- Asset Drawer Buttons -->
            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'photos' ? 'is-active' : ''}" data-tab="photos" title="Upload Photos">
              <span class="material-symbols-outlined text-base">cloud_upload</span>
              <span>Upload</span>
              ${this.uploadedPhotos.length > 0 ? `<span class="floating-dock-badge">${this.uploadedPhotos.length}</span>` : ''}
            </button>

            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'embellishments' ? 'is-active' : ''}" data-tab="embellishments" title="Stickers & Scraps">
              <span class="material-symbols-outlined text-base">auto_awesome</span>
              <span>Stickers</span>
            </button>

            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'ephemera' ? 'is-active' : ''}" data-tab="ephemera" title="Tickets & Passes">
              <span class="material-symbols-outlined text-base">confirmation_number</span>
              <span>Tickets</span>
            </button>

            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'routes' ? 'is-active' : ''}" data-tab="routes" title="Routes & Badges">
              <span class="material-symbols-outlined text-base">alt_route</span>
              <span>Routes</span>
            </button>

            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'text' ? 'is-active' : ''}" data-tab="text" title="Typography">
              <span class="material-symbols-outlined text-base">title</span>
              <span>Text</span>
            </button>

            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'background' ? 'is-active' : ''}" data-tab="background" title="Paper & Edges">
              <span class="material-symbols-outlined text-base">palette</span>
              <span>Paper</span>
            </button>

            <button type="button" class="floating-dock-btn ${this.activeDockTab === 'frames' ? 'is-active' : ''}" data-tab="frames" title="Frames">
              <span class="material-symbols-outlined text-base">crop_portrait</span>
              <span>Frames</span>
            </button>

            <div class="floating-dock-divider"></div>

            <!-- Canvas Format Aspect Ratio Switcher -->
            <div class="flex items-center gap-1">
              <button type="button" class="px-2 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${formatClass === 'format-spread' ? 'bg-[#c86d51] text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'}" data-format="format-spread" title="4:3 Spread">
                4:3
              </button>
              <button type="button" class="px-2 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${formatClass === 'format-story' ? 'bg-[#c86d51] text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'}" data-format="format-story" title="9:16 Story">
                9:16
              </button>
              <button type="button" class="px-2 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${formatClass === 'format-postcard' ? 'bg-[#c86d51] text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'}" data-format="format-postcard" title="6:4 Postcard">
                6:4
              </button>
            </div>

            <div class="floating-dock-divider"></div>

            <!-- In-Canvas Zoom Controls -->
            <div class="floating-zoom-group">
              <button type="button" class="floating-zoom-btn" id="btnZoomOut" title="Zoom Out">
                <span class="material-symbols-outlined text-xs">remove</span>
              </button>
              <button type="button" class="floating-zoom-label hover:text-secondary cursor-pointer" id="btnZoomReset" title="Reset Zoom">
                ${Math.round(this.zoomLevel * 100)}%
              </button>
              <button type="button" class="floating-zoom-btn" id="btnZoomIn" title="Zoom In">
                <span class="material-symbols-outlined text-xs">add</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    this._bindDynamicHandlers();
  }

  _getFilteredEmbellishments() {
    const query = (this.stickerSearchQuery || '').trim().toLowerCase();
    const subcat = this.activeEmbellishmentSubcat;

    // Handle Favorites subcategory
    if (subcat === 'favorites' && !query) {
      if (this._favoriteStickers.size === 0) return [];
      const results = [];
      const seenIds = new Set();
      for (const cat of Object.values(EMBELLISHMENTS)) {
        for (const item of cat) {
          if (this._favoriteStickers.has(item.id) && !seenIds.has(item.id)) {
            results.push(item);
            seenIds.add(item.id);
          }
        }
      }
      return results;
    }

    // Handle Recent subcategory
    if (subcat === 'recent' && !query) {
      if (this._recentStickers.length === 0) return [];
      const results = [];
      const seenIds = new Set();
      for (const { id, category } of this._recentStickers) {
        const catList = EMBELLISHMENTS[category] || [];
        const item = catList.find((t) => t.id === id);
        if (item && !seenIds.has(id)) {
          results.push(item);
          seenIds.add(id);
        }
      }
      return results;
    }

    if (!query) {
      return EMBELLISHMENTS[this.activeEmbellishmentSubcat] || [];
    }

    const allCategories = Object.keys(EMBELLISHMENTS);
    const matched = [];
    const seenIds = new Set();

    for (const cat of allCategories) {
      const items = EMBELLISHMENTS[cat] || [];
      for (const item of items) {
        if (seenIds.has(item.id)) continue;
        const nameMatch = item.name && item.name.toLowerCase().includes(query);
        const idMatch = item.id && item.id.toLowerCase().includes(query);
        const catMatch = item.category && item.category.toLowerCase().includes(query);
        if (nameMatch || idMatch || catMatch) {
          matched.push(item);
          seenIds.add(item.id);
        }
      }
    }
    return matched;
  }

  _renderStickerCardItem(item) {
    const isFav = this._favoriteStickers.has(item.id);
    let previewHtml = item.svg || '';
    // Ensure img tags have lazy loading and async decoding (Feature #15)
    if (previewHtml.includes('<img ') && !previewHtml.includes('loading="lazy"')) {
      previewHtml = previewHtml.replace('<img ', '<img loading="lazy" decoding="async" ');
    }

    return `
      <div class="embellishment-card-wrapper relative group" role="gridcell">
        <button
          type="button"
          class="embellishment-card-btn ${isFav ? 'is-favorited' : ''} w-full"
          draggable="true"
          tabindex="0"
          role="button"
          aria-label="Add sticker: ${item.name}"
          data-template-id="${item.id}"
          data-cat="${item.category}"
          title="${item.name} (Click or press Enter/Space to add, or drag to canvas)"
        >
          <div class="embellishment-card-preview">
            ${previewHtml}
          </div>
        </button>
        <button
          type="button"
          class="sticker-fav-btn ${isFav ? 'is-active' : ''}"
          tabindex="0"
          aria-label="${isFav ? 'Remove ' + item.name + ' from favorites' : 'Add ' + item.name + ' to favorites'}"
          data-fav-id="${item.id}"
          data-fav-cat="${item.category}"
          title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
        >
          <span class="material-symbols-outlined text-[13px]">
            ${isFav ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>
    `;
  }

  _renderEmbellishmentsGridItems() {
    const query = (this.stickerSearchQuery || '').trim();
    const items = this._getFilteredEmbellishments();

    if (items.length === 0) {
      const emptyNote = this.activeEmbellishmentSubcat === 'favorites'
        ? 'No favorited stickers yet. Tap the ❤️ icon on any sticker to add it here.'
        : this.activeEmbellishmentSubcat === 'recent'
          ? 'No recently placed stickers yet. Placed stickers will appear here.'
          : (query ? `No stickers match "${query}"` : 'No stickers in this category');

      return `
        <div class="col-span-3 py-6 px-3 text-center bg-white/70 rounded-2xl border border-dashed border-neutral-300">
          <span class="material-symbols-outlined text-3xl text-neutral-400 mb-1">
            ${this.activeEmbellishmentSubcat === 'favorites' ? 'favorite_border' : this.activeEmbellishmentSubcat === 'recent' ? 'history' : 'search_off'}
          </span>
          <p class="text-xs font-bold text-neutral-800">
            ${this.activeEmbellishmentSubcat === 'favorites' ? 'No Favorites Yet' : this.activeEmbellishmentSubcat === 'recent' ? 'No Recent Items' : 'No stickers found'}
          </p>
          <p class="text-[11px] text-neutral-500 mt-0.5">${emptyNote}</p>
          ${
            query
              ? `
            <button type="button" id="btnResetStickerSearch" class="mt-2.5 px-3 py-1 bg-secondary text-white text-xs font-semibold rounded-lg hover:bg-secondary/90 transition-all cursor-pointer shadow-2xs">
              Clear Search
            </button>
          `
              : ''
          }
        </div>
      `;
    }

    const countHeader = query
      ? `<div class="col-span-3 flex items-center justify-between px-1 pb-1 text-[11px] font-mono text-neutral-600 font-bold border-b border-neutral-200/80 mb-1">
          <span>Found ${items.length} sticker${items.length === 1 ? '' : 's'}</span>
          <span class="text-secondary cursor-pointer hover:underline" id="btnQuickClearSearch">Clear</span>
        </div>`
      : '';

    // Render first chunk of 24 items for instantaneous UI responsiveness (Feature #14)
    const CHUNK_SIZE = 24;
    const initialItems = items.slice(0, CHUNK_SIZE);
    const initialCardsHtml = initialItems.map((item) => this._renderStickerCardItem(item)).join('');

    const sentinelHtml = items.length > CHUNK_SIZE
      ? `<div class="sticker-grid-sentinel col-span-3" data-offset="${CHUNK_SIZE}"></div>`
      : '';

    return countHeader + initialCardsHtml + sentinelHtml;
  }

  _renderDockPanelContent() {
    if (this.activeDockTab === 'photos') {
      const allPhotos = this._getAllLibraryPhotos();
      return `
        <div>
          <!-- Direct Upload Photos Button / Dropzone -->
          <div class="photo-upload-dropzone mb-3" id="photoDropzone">
            <input type="file" id="filePhotoInput" accept="image/*" multiple class="hidden" />
            <span class="material-symbols-outlined text-secondary text-2xl mb-1">cloud_upload</span>
            <h4 class="text-xs font-bold text-neutral-900">Upload Photos</h4>
          </div>

          <h5 class="text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2 font-mono">Trip &amp; Photo Library (${allPhotos.length})</h5>
          <div class="dock-photo-grid">
            ${allPhotos
              .map(
                (src, idx) => `
              <div class="dock-photo-item" data-photo-src="${src}" title="Place on canvas">
                <img src="${src}" alt="Photo ${idx + 1}" loading="lazy" />
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (this.activeDockTab === 'embellishments') {
      const isSearching = !!(this.stickerSearchQuery && this.stickerSearchQuery.trim());
      return `
        <div>
          <!-- Sticker Search Bar -->
          <div class="relative mb-2.5">
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-2.5 text-neutral-400 text-[18px] pointer-events-none">search</span>
              <input
                type="text"
                id="stickerSearchInput"
                value="${this.stickerSearchQuery || ''}"
                placeholder="Search stickers (e.g. camper, chai, flower, stamp)..."
                class="w-full pl-8 pr-8 py-2 bg-white text-xs text-neutral-800 placeholder-neutral-400 rounded-xl border border-neutral-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all outline-none shadow-2xs"
              />
              ${
                isSearching
                  ? `
                <button type="button" id="btnClearStickerSearchInput" class="absolute right-2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer" title="Clear search">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Subcategory Filter Pills with smooth center scroll -->
          <div class="flex gap-1.5 overflow-x-auto pb-2 mb-3 scroll-smooth no-scrollbar ${isSearching ? 'opacity-50 pointer-events-auto' : ''}" id="subcatBar">
            ${EMBELLISHMENT_CATEGORIES.map(
              (cat) => `
              <button type="button" class="subcat-pill-btn shrink-0 ${!isSearching && this.activeEmbellishmentSubcat === cat.id ? 'is-active' : ''}" data-subcat="${cat.id}">
                ${cat.name}
              </button>
            `
            ).join('')}
          </div>

          <!-- Embellishments Grid (Keyboard Accessible - Suggestion #31) -->
          <div class="grid grid-cols-3 gap-2" id="embellishmentsItemsGrid" role="grid" aria-label="Sticker Catalog" tabindex="0">
            ${this._renderEmbellishmentsGridItems()}
          </div>
        </div>
      `;
    }

    if (this.activeDockTab === 'ephemera') {
      return `
        <div class="grid grid-cols-1 gap-2.5">
          <!-- 1. 1920s French Railway Conductor Ticket -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-ephemera overflow-hidden" data-ephemera-id="ephemera-railway-vintage" title="1920s French Railway Conductor Ticket">
            <div class="w-full rounded-lg p-2 font-serif text-[9px] relative shadow-2xs" style="background: #fdfaf3; color: #3b2c1a; border: 1.5px solid #c2b199; border-left: 5px solid #8e3f29;">
              <div class="flex justify-between items-center border-b border-[#c2b199] pb-0.5 mb-1">
                <span class="font-bold text-[7px] uppercase tracking-widest text-[#8e3f29]">★ CHEMINS DE FER DU NORD ★</span>
                <span class="font-mono text-[6px] font-bold text-red-600 border border-red-300 px-1 rounded">VALIDE</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-bold text-[9px] uppercase tracking-wide">CHEMINS DE FER DU NORD</div>
                <div class="text-[7px] italic text-[#5c401f]">PARIS GARE DU NORD ➔ CALAIS</div>
              </div>
              <div class="flex justify-between items-center text-[6px] font-mono border-t border-[#c2b199] pt-0.5 mt-1 text-[#5c401f]">
                <span>VOITURE 03 · PLACE 18</span>
                <span class="font-bold">14 OCT 1928</span>
              </div>
            </div>
          </div>

          <!-- 2. Antique Botanical Royal Garden Admit Pass -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-ephemera overflow-hidden" data-ephemera-id="ephemera-botanical-garden" title="Antique Botanical Royal Garden Admit Pass">
            <div class="w-full rounded-lg p-2 font-serif text-[9px] relative shadow-2xs" style="background: #f4f6ee; color: #2b3d2b; border: 1.5px dashed #6b8e23;">
              <div class="flex justify-between items-center border-b border-[#6b8e23]/40 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] uppercase tracking-widest text-[#2b3d2b]">ROYAL BOTANICAL GLASSHOUSE</span>
                <span class="material-symbols-outlined text-[10px] text-[#4a6b22]">local_florist</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-serif italic font-bold text-[9px] text-[#2b3d2b]">ROYAL BOTANICAL GLASSHOUSE</div>
                <div class="text-[7px] text-[#4a6b22]">ADMIT ONE HERBARIUM GUEST</div>
              </div>
              <div class="flex justify-between items-center text-[6px] font-serif italic border-t border-[#6b8e23]/40 pt-0.5 mt-0.5 text-[#2b3d2b]">
                <span>SEASON OF 1934</span>
                <span class="font-bold text-[#4a6b22] uppercase">ALL-ACCESS PASS</span>
              </div>
            </div>
          </div>

          <!-- 3. Transatlantic Ocean Liner Steamship Pass -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-ephemera overflow-hidden" data-ephemera-id="ephemera-steamship-pass" title="Transatlantic Ocean Liner Steamship Pass">
            <div class="w-full rounded-lg p-2 font-serif text-[9px] relative shadow-2xs" style="background: #fdfbf7; color: #112233; border: 1.5px solid #1d3557;">
              <div class="flex justify-between items-center border-b border-[#1d3557]/30 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] uppercase tracking-widest text-[#1d3557]">ROYAL STEAM NAVIGATION</span>
                <span class="material-symbols-outlined text-[10px] text-[#1d3557]">anchor</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-bold text-[9px] uppercase text-[#1d3557] tracking-wider">S.S. ATLANTIC VOYAGER</div>
                <div class="text-[7px] italic text-neutral-600">SOUTHAMPTON ➔ NEW YORK PIER</div>
              </div>
              <div class="flex justify-between items-center text-[6px] font-mono border-t border-[#1d3557]/30 pt-0.5 mt-0.5 text-[#1d3557]">
                <span>STATEROOM B-42</span>
                <span class="font-bold text-red-700">★ FIRST CLASS ★</span>
              </div>
            </div>
          </div>

          <!-- 4. Old World European Museum Admission Slip -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-ephemera overflow-hidden" data-ephemera-id="ephemera-museum-admission" title="Old World European Museum Admission Slip">
            <div class="w-full rounded-lg p-2 font-mono text-[8px] relative shadow-2xs" style="background: #ebe3d5; color: #2b2520; border: 1.5px solid #baa894;">
              <div class="flex justify-between items-center border-b border-[#baa894] pb-0.5 mb-0.5">
                <span class="font-bold text-[6px] uppercase tracking-widest text-[#5c401f]">MUSEUM ADMISSION SLIP</span>
                <span class="material-symbols-outlined text-[10px] text-[#5c401f]">account_balance</span>
              </div>
              <div class="my-0.5">
                <div class="font-bold text-[8px] uppercase">GALLERIA NAZIONALE D'ARTE</div>
                <div class="text-[6px] italic text-[#5c401f]">CLASSICAL SCULPTURE</div>
              </div>
              <div class="flex justify-between items-center text-[6px] border-t border-[#baa894] pt-0.5 mt-0.5">
                <span>NO. 004829</span>
                <span class="font-bold text-purple-800">22.09.1952</span>
              </div>
            </div>
          </div>

          <!-- 5. 1950s Alpine Mountain Funicular Stub -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-ephemera overflow-hidden" data-ephemera-id="ephemera-alpine-funicular" title="1950s Alpine Mountain Funicular Stub">
            <div class="w-full rounded-lg p-2 font-sans text-[8px] relative shadow-2xs" style="background: #f9f1d8; color: #332a1e; border: 1.5px solid #b8860b;">
              <div class="flex justify-between items-center border-b border-[#b8860b]/40 pb-0.5 mb-0.5">
                <span class="font-bold text-[6px] uppercase tracking-widest text-[#78350f]">ALPINE COGWHEEL PASS</span>
                <span class="material-symbols-outlined text-[10px] text-[#78350f]">terrain</span>
              </div>
              <div class="my-0.5 text-center">
                <div class="font-bold text-[8px] uppercase">ZERMATT ALPINE COGWHEEL</div>
                <div class="text-[6px] font-mono font-bold text-[#78350f]">ELEVATION 1,890M</div>
              </div>
              <div class="flex justify-between items-center text-[6px] font-mono border-t border-[#b8860b]/40 pt-0.5 mt-0.5">
                <span>BILLET DE RETOUR</span>
                <span class="font-bold text-red-700">CHF 8.50</span>
              </div>
            </div>
          </div>

          <!-- 6. Italian Trattoria & Cafe Espresso Paper Receipt -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-ephemera overflow-hidden" data-ephemera-id="ephemera-trattoria-receipt" title="Italian Trattoria & Cafe Espresso Paper Receipt">
            <div class="w-full rounded-lg p-2 font-mono text-[7px] shadow-2xs" style="background: #faf8f5; color: #3a2e28; border-top: 3px solid #7c2d12; border-bottom: 2px dashed #bcaaa4; border-left: 1px solid #e0d6ce; border-right: 1px solid #e0d6ce;">
              <div class="text-center pb-0.5 border-b border-[#e0d6ce]">
                <div class="font-bold text-[8px] uppercase">TRATTORIA &amp; CAFFE FIRENZE</div>
                <div class="text-[5px] text-neutral-500">10:45 AM · FIRENZE</div>
              </div>
              <div class="space-y-0.5 my-1">
                <div class="flex justify-between"><span>2x Caffe Espresso</span><span>L. 1,200</span></div>
                <div class="flex justify-between"><span>1x Cantucci di Prato</span><span>L. 650</span></div>
              </div>
              <div class="flex justify-between items-center font-bold text-[7px] border-t border-[#e0d6ce] pt-0.5">
                <span>TOTALE LIRE 1,850</span>
                <span class="text-purple-700 font-bold border border-purple-400 px-1 rounded">PAGATO ★</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeDockTab === 'routes') {
      return `
        <div class="grid grid-cols-1 gap-2.5">
          <!-- 1. Amalfi Cliffside Panoramic Drive Ribbon -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-route overflow-hidden" data-badge-id="badge-amalfi-drive" title="Amalfi Cliffside Panoramic Drive Ribbon">
            <div class="w-full rounded-lg p-2 text-white font-sans text-[9px] shadow-2xs" style="background: linear-gradient(135deg, #fef08a 0%, #38bdf8 50%, #ea580c 100%); border: 1.5px solid #ffffff;">
              <div class="flex items-center justify-between border-b border-white/40 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] tracking-widest uppercase">PANORAMIC COASTAL DRIVE</span>
                <span class="material-symbols-outlined text-[10px]">directions_car</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-extrabold text-[9px]">AMALFI COASTAL DRIVE</div>
                <div class="text-[7px] opacity-90">Positano ➔ Amalfi ➔ Ravello</div>
              </div>
              <div class="text-center text-[6px] font-bold text-amber-200 uppercase tracking-wider">Scenic Cliffside Golden Hour</div>
            </div>
          </div>

          <!-- 2. Kyoto Torii & Sakura Shrine Pilgrimage Trail -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-route overflow-hidden" data-badge-id="badge-kyoto-trail" title="Kyoto Torii & Sakura Shrine Pilgrimage Trail">
            <div class="w-full rounded-lg p-2 font-serif text-[9px] shadow-2xs" style="background: #fff5f5; color: #991b1b; border: 1.5px solid #dc2626;">
              <div class="flex items-center justify-between border-b border-red-200 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] tracking-widest uppercase text-red-800">SHRINE PILGRIMAGE TRAIL</span>
                <span class="material-symbols-outlined text-[10px] text-red-700">temple_buddhist</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-serif font-bold text-[9px] text-red-900">KYOTO SHRINE PILGRIMAGE</div>
                <div class="text-[7px] font-serif italic text-red-700">Fushimi Inari ➔ Gion ➔ Arashiyama</div>
              </div>
              <div class="text-center text-[6px] font-bold text-red-800 uppercase tracking-widest">SPRING BLOSSOM WAYPOINTS</div>
            </div>
          </div>

          <!-- 3. Route 66 Retro Diner & Neon Shield -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-route overflow-hidden" data-badge-id="badge-route66-strip" title="Route 66 Retro Diner & Neon Shield">
            <div class="w-full rounded-lg p-2 font-sans text-[9px] shadow-2xs" style="background: #0f172a; color: #38bdf8; border: 1.5px solid #f97316;">
              <div class="flex items-center justify-between border-b border-orange-400/40 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] tracking-widest uppercase text-orange-400">HISTORIC HIGHWAY ROUTE</span>
                <span class="material-symbols-outlined text-[10px] text-sky-400">local_gas_station</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-extrabold text-[9px] text-sky-300 uppercase">HISTORIC US ROUTE 66</div>
                <div class="text-[7px] text-orange-200 font-mono">Chicago ➔ Kingman ➔ Santa Monica</div>
              </div>
              <div class="text-center text-[6px] font-mono font-bold text-sky-400 uppercase tracking-wider">2,448 MILES • MOTEL &amp; DINER PASS</div>
            </div>
          </div>

          <!-- 4. Alpine Glacier & Wildflower High Pass Trek -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-route overflow-hidden" data-badge-id="badge-alpine-pass" title="Alpine Glacier & Wildflower High Pass Trek">
            <div class="w-full rounded-lg p-2 font-serif text-center shadow-2xs" style="background: #064e3b; color: #ecfdf5; border: 1.5px solid #a7f3d0;">
              <span class="material-symbols-outlined text-emerald-300 text-xs">terrain</span>
              <div class="font-bold text-[8px] uppercase tracking-wider text-emerald-100 mt-0.5">HIGH GLACIER RIDGEWAY</div>
              <div class="font-mono text-[9px] font-bold text-emerald-300 my-0.5">2,850 M / 9,350 FT</div>
              <div class="text-[5px] font-mono uppercase tracking-widest text-emerald-200">EDELWEISS SANCTUARY</div>
            </div>
          </div>

          <!-- 5. Great Barrier Reef Catamaran Sail Route -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-route overflow-hidden" data-badge-id="badge-tropical-sail" title="Great Barrier Reef Catamaran Sail Route">
            <div class="w-full rounded-lg p-2 text-white font-sans text-[9px] shadow-2xs" style="background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); border: 1.5px solid #bae6fd;">
              <div class="flex items-center justify-between border-b border-white/40 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] tracking-widest uppercase text-sky-100">CATAMARAN REEF SAIL</span>
                <span class="material-symbols-outlined text-[10px]">sailing</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-extrabold text-[9px] text-white">AZURE CORAL REEF SAIL</div>
                <div class="text-[7px] opacity-90 text-sky-100">Palm Cove ➔ Coral Bay ➔ Lighthouse</div>
              </div>
              <div class="text-center text-[6px] font-mono font-bold text-sky-200 uppercase tracking-wider">ANCHOR DEPTH 14M • CATAMARAN</div>
            </div>
          </div>

          <!-- 6. Desert Oasis Starry Night Camel Caravan -->
          <div class="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-add-route overflow-hidden" data-badge-id="badge-desert-caravan" title="Desert Oasis Starry Night Camel Caravan">
            <div class="w-full rounded-lg p-2 text-amber-100 font-sans text-[9px] shadow-2xs" style="background: linear-gradient(135deg, #78350f 0%, #1e1b4b 100%); border: 1.5px solid #fde68a;">
              <div class="flex items-center justify-between border-b border-[#fde68a]/30 pb-0.5 mb-0.5">
                <span class="font-bold text-[7px] tracking-widest uppercase text-amber-200">SILK DUNE CARAVAN TRAIL</span>
                <span class="material-symbols-outlined text-[10px] text-amber-200">bedtime</span>
              </div>
              <div class="text-center my-0.5">
                <div class="font-extrabold text-[9px] text-amber-100 uppercase">SILK DUNE CARAVAN TRAIL</div>
                <div class="text-[7px] opacity-90 text-amber-200">Oasis Outpost ➔ Sunken Well ➔ Fort</div>
              </div>
              <div class="text-center text-[6px] font-bold text-[#fde68a] uppercase tracking-wider">24°48'N · 55°32'E • STARRY VISTA</div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeDockTab === 'text') {
      const page = this.getCurrentPage();
      const selectedTextEl = page.elements.find((e) => e.id === this.selectedElementId && e.type === 'text');
      const currentColor = selectedTextEl ? (selectedTextEl.color || '#1b1c1a') : '#1b1c1a';

      return `
        <div class="space-y-4">
          <!-- Live Color Selector Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-[11px] font-bold uppercase tracking-wider text-neutral-600 font-mono">Ink Colors</h5>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-mono text-neutral-500">${currentColor}</span>
                <div class="w-3.5 h-3.5 rounded-full border border-black/20" style="background: ${currentColor};"></div>
              </div>
            </div>
            <div class="grid grid-cols-6 gap-2">
              ${TEXT_PALETTE_COLORS.map(
                (c) => `
                <button type="button" class="drawer-color-swatch w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${currentColor.toLowerCase() === c.value.toLowerCase() ? 'border-neutral-900 scale-110 shadow-xs' : 'border-transparent hover:scale-105'}" style="background: ${c.value};" data-color-val="${c.value}" title="${c.name}">
                  ${currentColor.toLowerCase() === c.value.toLowerCase() ? '<span class="material-symbols-outlined text-[12px] text-white drop-shadow-xs">check</span>' : ''}
                </button>
              `
              ).join('')}

              <!-- Custom Color Picker Native Input -->
              <label class="w-7 h-7 rounded-full relative cursor-pointer overflow-hidden flex items-center justify-center bg-linear-to-tr from-rose-500 via-amber-400 to-indigo-500 hover:scale-110 transition-transform shadow-xs" title="Custom Hex Color">
                <input type="color" id="drawerCustomColorInput" value="${currentColor}" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <span class="material-symbols-outlined text-[12px] text-white pointer-events-none drop-shadow-xs">colorize</span>
              </label>
            </div>
          </div>

          <!-- Typography Preset Styles -->
          <div>
            <h5 class="text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2 font-mono">Journal Styles</h5>
            <div class="space-y-2">
              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="heading">
                <div>
                  <div class="font-headline-md font-bold text-sm text-neutral-900">Chapter Heading</div>
                  <div class="text-[10px] text-neutral-500 font-serif">Editorial classic display serif</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="script">
                <div>
                  <div class="font-bold text-base text-secondary" style="font-family: 'Caveat', cursive;">Traveler's Script</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Organic handwriting &amp; musings</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="botanical">
                <div>
                  <div class="italic text-sm text-[#2e4433]" style="font-family: 'Playfair Display', serif;">Botanical Inscription</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Graceful naturalist label</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="note-block">
                <div>
                  <div class="text-xs text-[#3d261a] font-['Caveat'] leading-snug">Field Log Notebook Entries</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Multi-line observation notes</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="dispatch">
                <div>
                  <div class="font-bold text-xs text-[#763403] tracking-wider uppercase font-serif">Antique Dispatch</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Gazette headline style</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="quote">
                <div>
                  <div class="text-xs italic text-neutral-700 font-serif">Wax-Sealed Journal Quote</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Quotations &amp; reflections</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="typewriter">
                <div>
                  <div class="font-mono text-xs font-semibold text-neutral-800">Typewriter Mechanical Log</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Courier typewriter coordinates</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>

              <button type="button" class="btn-add-text w-full p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between" data-text-type="pencil">
                <div>
                  <div class="text-xs text-[#5a5a5a] font-['Caveat']">Pencil Field Annotation</div>
                  <div class="text-[10px] text-neutral-500 font-sans">Soft graphite pencil note</div>
                </div>
                <span class="material-symbols-outlined text-sm text-neutral-400">add</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeDockTab === 'background') {
      const page = this.getCurrentPage();
      const currentEdge = page.edgeStyle || 'edge-torn';
      return `
        <div class="space-y-4">
          <!-- 1. Paper Edge Finish / Cut -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-[11px] font-bold uppercase tracking-wider text-neutral-600 font-mono">Paper Edge</h5>
              <span class="text-[10px] text-secondary font-semibold">${currentEdge.replace('edge-', '').toUpperCase()}</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              ${SCRAPBOOK_PAPER_EDGES.map(
                (edge) => `
                <div class="p-2 bg-white rounded-xl border ${currentEdge === edge.id ? 'border-secondary bg-secondary/5 font-bold shadow-xs' : 'border-neutral-200'} hover:border-secondary cursor-pointer transition-all btn-apply-edge flex items-center gap-2" data-edge-id="${edge.id}">
                  <span class="material-symbols-outlined text-secondary text-sm">${edge.icon}</span>
                  <h6 class="text-[11px] text-neutral-900 truncate">${edge.name}</h6>
                </div>
              `
              ).join('')}
            </div>
          </div>

          <!-- 2. Archival Paper Varieties -->
          <div>
            <h5 class="text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2 font-mono">Paper Variety</h5>
            <div class="grid grid-cols-2 gap-2">
              ${SCRAPBOOK_BACKGROUNDS.map(
                (bg) => `
                <div class="preset-swatch-card ${page.background === bg.id ? 'is-active border-secondary ring-1 ring-secondary' : 'border-neutral-200'} p-2 rounded-xl border hover:border-secondary transition-all cursor-pointer bg-white" data-bg-id="${bg.id}">
                  <div class="w-full h-8 rounded-lg mb-1 border border-black/10 shadow-inner" style="background: ${bg.texture || bg.color};"></div>
                  <h5 class="text-xs font-semibold text-neutral-900 truncate">${bg.name}</h5>
                </div>
              `
              ).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeDockTab === 'frames') {
      const page = this.getCurrentPage();
      const selectedEl = page.elements.find((e) => e.id === this.selectedElementId && e.type === 'photo');
      const activeFrameClass = selectedEl ? (selectedEl.frameStyle || 'frame-polaroid') : (this.defaultPhotoFrame || 'frame-polaroid');

      return `
        <div class="grid grid-cols-2 gap-2.5">
          <!-- 1. Polaroid Classic Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-polaroid' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-polaroid" title="Polaroid Classic">
            <div class="w-full h-24 bg-white p-1.5 pb-4 rounded shadow-xs border border-neutral-200 flex flex-col items-center justify-between">
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=75" class="w-full h-16 object-cover rounded-xs" alt="Polaroid Sample" />
              <span class="text-[7px] font-bold text-neutral-600 font-['Caveat'] leading-none mt-1">FIELD MEMORY</span>
            </div>
            ${activeFrameClass === 'frame-polaroid' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 2. Deckled Torn Edge Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-deckled' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-deckled" title="Deckled Torn Edge">
            <div class="w-full h-24 bg-[#fdfbf7] p-1.5 shadow-xs border border-neutral-200 flex items-center justify-center" style="clip-path: polygon(0% 3px, 5% 0px, 10% 4px, 20% 1px, 30% 4px, 40% 0px, 50% 3px, 60% 0px, 70% 4px, 80% 1px, 90% 4px, 100% 0px, 97% 20%, 100% 40%, 96% 60%, 100% 80%, 97% 100%, 80% 97%, 60% 100%, 40% 96%, 20% 100%, 0% 97%, 4% 80%, 0% 60%, 3% 40%, 0% 20%);">
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs" alt="Deckled Sample" />
            </div>
            ${activeFrameClass === 'frame-deckled' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 3. Perforated Postage Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-postage' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-postage" title="Perforated Postage">
            <div class="w-full h-24 bg-[#fbf9f4] p-1.5 rounded-lg border-2 border-dashed border-[#baa47e] shadow-xs flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs border border-black/10" alt="Postage Sample" />
            </div>
            ${activeFrameClass === 'frame-postage' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 4. 35mm Film Slide Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-film-slide' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-film-slide" title="35mm Film Slide">
            <div class="w-full h-24 bg-[#1a1918] p-1.5 pt-3 pb-3 rounded shadow-xs flex items-center justify-center relative">
              <span class="absolute top-0.5 text-[5px] text-[#888] font-mono tracking-widest">■ ■ ■ ■ ■</span>
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=75" class="w-full h-16 object-cover rounded-xs" alt="Film Slide Sample" />
              <span class="absolute bottom-0.5 text-[5px] text-[#888] font-mono tracking-widest">■ ■ ■ ■ ■</span>
            </div>
            ${activeFrameClass === 'frame-film-slide' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 5. Washi Taped Corners Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-washi-taped' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-washi-taped" title="Washi Taped Corners">
            <div class="w-full h-24 bg-white p-1.5 shadow-xs border border-neutral-200 flex items-center justify-center relative">
              <div class="absolute -top-1 -left-1 w-6 h-2 bg-[#e0b983] opacity-85 rotate-[-35deg]"></div>
              <div class="absolute -top-1 -right-1 w-6 h-2 bg-[#944a1a] opacity-80 rotate-[35deg]"></div>
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs" alt="Washi Sample" />
            </div>
            ${activeFrameClass === 'frame-washi-taped' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 6. Vintage Brass Inset Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-brass' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-brass" title="Vintage Brass Inset">
            <div class="w-full h-24 bg-[#23201d] p-1.5 rounded border-2 border-[#d1a847] shadow-xs flex items-center justify-center relative">
              <div class="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#e6ae55]"></div>
              <div class="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#e6ae55]"></div>
              <div class="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#e6ae55]"></div>
              <div class="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#e6ae55]"></div>
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs border border-[#d1a847]" alt="Brass Sample" />
            </div>
            ${activeFrameClass === 'frame-brass' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 7. Deep Archival Shadowbox Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-shadowbox' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-shadowbox" title="Deep Archival Shadowbox">
            <div class="w-full h-24 bg-[#fbf9f4] p-2 rounded border-4 border-[#2e261f] shadow-xs flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs border border-black/10" alt="Shadowbox Sample" />
            </div>
            ${activeFrameClass === 'frame-shadowbox' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 8. Victorian Gilt Lace Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-victorian' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-victorian" title="Victorian Gilt Lace">
            <div class="w-full h-24 bg-[#fdfaf2] p-1.5 rounded border-2 border-double border-[#b8860b] shadow-xs flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs border border-[#d4af37]" alt="Victorian Sample" />
            </div>
            ${activeFrameClass === 'frame-victorian' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 9. Kraft Corner Mount Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-kraft-mount' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between" data-frame-class="frame-kraft-mount" title="Kraft Corner Mount">
            <div class="w-full h-24 bg-[#d8c2a7] p-2 rounded shadow-xs border border-[#bba387] flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=75" class="w-full h-full object-cover rounded-xs" alt="Kraft Sample" />
            </div>
            ${activeFrameClass === 'frame-kraft-mount' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>

          <!-- 10. Modern Clean Cut Picture Preview -->
          <div class="p-2 bg-white rounded-xl border ${activeFrameClass === 'frame-clean' ? 'border-secondary ring-2 ring-secondary bg-secondary/5 shadow-xs' : 'border-neutral-200'} hover:border-secondary hover:shadow-md transition-all cursor-pointer btn-apply-frame flex flex-col items-center justify-between col-span-2" data-frame-class="frame-clean" title="Modern Clean Cut">
            <div class="w-full h-20 rounded-lg shadow-xs border border-neutral-200 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=75" class="w-full h-full object-cover" alt="Clean Cut Sample" />
            </div>
            ${activeFrameClass === 'frame-clean' ? '<span class="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>' : ''}
          </div>
        </div>
      `;
    }

    return '';
  }

  _renderCanvasElements(page) {
    return page.elements
      .map((el) => {
        const isSelected = el.id === this.selectedElementId;
        const frameClass = el.frameStyle || 'frame-polaroid';

        let innerContent = '';
        if (el.type === 'photo') {
          innerContent = `
            <div class="canvas-photo-wrapper ${frameClass}">
              <img src="${el.src}" alt="Scrapbook photo" />
            </div>
          `;
        } else if (el.type === 'sticker') {
          const catList = EMBELLISHMENTS[el.category] || [];
          const template = catList.find((t) => t.id === el.templateId) || { svg: '' };
          innerContent = `
            <div class="w-full h-full pointer-events-none select-none">
              ${template.svg}
            </div>
          `;
        } else if (el.type === 'text') {
          innerContent = `
            <div
              class="canvas-text-content"
              contenteditable="true"
              style="font-family: ${el.fontFamily}; font-size: ${el.fontSize}px; color: ${el.color}; font-weight: ${el.bold ? 'bold' : 'normal'}; font-style: ${el.italic ? 'italic' : 'normal'}; text-align: ${el.align || 'left'};"
            >${el.content || 'Double-click to write'}</div>
          `;
        } else if (el.type === 'ephemera') {
          innerContent = this._renderEphemeraCard(el);
        } else if (el.type === 'routes') {
          innerContent = this._renderRouteCard(el);
        }

        return `
          <div
            class="canvas-element ${isSelected ? 'is-selected' : ''} ${el.type === 'text' ? 'is-text' : ''}"
            data-element-id="${el.id}"
            style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; transform: rotate(${el.rotation}deg); z-index: ${el.zIndex || 1};"
          >
            ${innerContent}

            <!-- Floating Quick Actions Bar -->
            <div class="canvas-selection-toolbar">
              <button type="button" class="canvas-tool-btn" data-action="rotate-ccw" title="Rotate -15°">
                <span class="material-symbols-outlined text-xs">rotate_left</span>
              </button>
              <button type="button" class="canvas-tool-btn" data-action="rotate-cw" title="Rotate +15°">
                <span class="material-symbols-outlined text-xs">rotate_right</span>
              </button>
              <div class="w-[1px] h-3 bg-neutral-300 my-auto"></div>
              <button type="button" class="canvas-tool-btn" data-action="duplicate" title="Duplicate">
                <span class="material-symbols-outlined text-xs">content_copy</span>
              </button>
              <button type="button" class="canvas-tool-btn" data-action="bring-forward" title="Bring to Front">
                <span class="material-symbols-outlined text-xs">flip_to_front</span>
              </button>
              <button type="button" class="canvas-tool-btn" data-action="send-backward" title="Send to Back">
                <span class="material-symbols-outlined text-xs">flip_to_back</span>
              </button>
              <button type="button" class="canvas-tool-btn text-red-600 hover:text-red-700 hover:bg-red-50" data-action="delete" title="Delete">
                <span class="material-symbols-outlined text-xs">delete</span>
              </button>
            </div>

            <!-- Floating Typography Inspector (For Text Elements) -->
            ${el.type === 'text' ? this._renderTextInspector(el) : ''}

            <!-- Resize Corner Handles -->
            <div class="canvas-resize-handle handle-nw" data-handle="nw"></div>
            <div class="canvas-resize-handle handle-ne" data-handle="ne"></div>
            <div class="canvas-resize-handle handle-sw" data-handle="sw"></div>
            <div class="canvas-resize-handle handle-se" data-handle="se"></div>

            <!-- Rotation Stem Handle -->
            <div class="canvas-rotate-handle" data-handle="rotate" title="Drag to freely rotate (Shift: 15° snap)">
              <span class="material-symbols-outlined text-[10px] pointer-events-none select-none">sync</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  _renderTextInspector(el) {
    const currentFont = SCRAPBOOK_FONTS.find(
      (f) =>
        el.fontFamily &&
        (el.fontFamily.toLowerCase().includes(f.id.toLowerCase()) ||
          el.fontFamily.toLowerCase().includes(f.name.toLowerCase().split(' ')[0].toLowerCase()) ||
          el.fontFamily === f.family)
    ) || SCRAPBOOK_FONTS[0];

    return `
      <div class="text-inspector-bar" data-element-id="${el.id}">
        <!-- Custom Font Family Dropdown Button & Menu -->
        <div class="relative font-picker-wrapper">
          <button
            type="button"
            class="canvas-font-btn flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-md px-2.5 py-1 border border-neutral-300 transition-colors cursor-pointer"
            data-text-action="toggle-font-menu"
            title="Choose Typography Style"
          >
            <span class="font-current-name">${currentFont.name}</span>
            <span class="material-symbols-outlined text-[14px] text-neutral-500">expand_more</span>
          </button>

          <!-- Floating Font Options Menu -->
          <div class="canvas-font-dropdown hidden absolute left-0 top-full mt-1.5 w-52 bg-white border border-neutral-200 shadow-2xl rounded-xl p-1.5 z-[10000] text-left">
            <div class="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Typography Styles</div>
            ${SCRAPBOOK_FONTS.map(
              (f) => `
              <button
                type="button"
                class="font-option-item w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer my-0.5 ${
                  currentFont.id === f.id ? 'bg-[#c86d51]/10 text-[#c86d51] font-bold' : 'text-neutral-800 hover:bg-neutral-100'
                }"
                data-font-val="${f.family}"
                data-font-name="${f.name}"
                style="font-family: ${f.family}; font-size: 14px;"
              >
                <span>${f.name}</span>
                ${currentFont.id === f.id ? '<span class="material-symbols-outlined text-sm text-[#c86d51]">check</span>' : ''}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <div class="w-[1px] h-3 bg-neutral-300"></div>

        <!-- Font size decrease/increase -->
        <button type="button" class="canvas-tool-btn font-bold text-xs" data-text-action="dec-size" title="Decrease Font Size">A-</button>
        <span class="text-[10px] font-mono text-neutral-600 font-semibold">${el.fontSize || 18}px</span>
        <button type="button" class="canvas-tool-btn font-bold text-xs" data-text-action="inc-size" title="Increase Font Size">A+</button>
        
        <div class="w-[1px] h-3 bg-neutral-300"></div>

        <!-- Bold & Italic -->
        <button type="button" class="canvas-tool-btn ${el.bold ? 'text-secondary font-bold bg-secondary/10' : ''}" data-text-action="toggle-bold" title="Bold">
          <span class="material-symbols-outlined text-xs">format_bold</span>
        </button>
        <button type="button" class="canvas-tool-btn ${el.italic ? 'text-secondary font-bold bg-secondary/10' : ''}" data-text-action="toggle-italic" title="Italic">
          <span class="material-symbols-outlined text-xs">format_italic</span>
        </button>

        <div class="w-[1px] h-3 bg-neutral-300"></div>

        <!-- Color Palette Dots -->
        <div class="flex items-center gap-1.5">
          ${TEXT_PALETTE_COLORS.slice(0, 8).map(
            (c) => `
            <div class="color-swatch-dot ${el.color?.toLowerCase() === c.value.toLowerCase() ? 'ring-2 ring-neutral-800 scale-115' : ''}" style="background: ${c.value};" data-color-val="${c.value}" title="${c.name}"></div>
          `
          ).join('')}

          <!-- Custom Color Picker Native Input -->
          <label class="color-swatch-dot relative cursor-pointer overflow-hidden flex items-center justify-center bg-linear-to-tr from-rose-500 via-amber-400 to-indigo-500 hover:scale-115 transition-transform" title="Custom Hex Color">
            <input type="color" value="${el.color || '#1b1c1a'}" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-custom-color-input" />
            <span class="material-symbols-outlined text-[10px] text-white pointer-events-none drop-shadow-xs">colorize</span>
          </label>
        </div>
      </div>
    `;
  }

  _renderEphemeraCard(el) {
    if (el.customInnerHtml) {
      return el.customInnerHtml;
    }
    if (el.ephemeraType === 'hot-air-balloon') {
      return `
        <div class="ephemera-hot-air-balloon-card">
          <div class="flex justify-between items-center border-b border-white/40 pb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-widest text-amber-200">★ SUNRISE BALLOON EXPEDITION ★</span>
            <span class="material-symbols-outlined text-xs text-white">wb_sunny</span>
          </div>
          <div class="my-0.5 text-center">
            <div class="font-extrabold text-[10px] text-white tracking-wide" contenteditable="true">${el.flightName || 'DAWN SUNRISE BALLOON FLIGHT'}</div>
            <div class="text-[7px] font-semibold text-white/90" contenteditable="true">${el.zone || 'Valley of the Winds · 3,500ft'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono border-t border-white/40 pt-0.5">
            <span contenteditable="true">${el.time || '05:30 AM · BASKET 04'}</span>
            <span class="font-bold text-amber-200" contenteditable="true">${el.tier || 'FIRST PILOT TIER'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'night-cinema') {
      return `
        <div class="ephemera-night-cinema-card">
          <div class="flex justify-between items-center border-b border-[#f59e0b]/40 pb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-widest text-[#f59e0b]">ROOFTOP STARLIT CINEMA</span>
            <span class="material-symbols-outlined text-xs text-[#f59e0b]">movie</span>
          </div>
          <div class="my-0.5 text-center">
            <div class="font-extrabold text-[10px] text-amber-300 uppercase tracking-wider" contenteditable="true">${el.film || 'MIDNIGHT IN THE DUNES'}</div>
            <div class="text-[7px] italic text-[#f59e0b]/90" contenteditable="true">${el.theater || 'ROOFTOP OPEN-AIR THEATRE'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono text-amber-200/90 border-t border-[#f59e0b]/40 pt-0.5">
            <span contenteditable="true">${el.seat || 'DECK 08 · STARLIGHT'}</span>
            <span class="font-bold text-[#f59e0b]" contenteditable="true">${el.date || '09:00 PM · ADMIT ONE'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'tasting-flight') {
      return `
        <div class="ephemera-tasting-flight-card">
          <div class="flex justify-between items-center border-b border-[#b45309]/30 pb-0.5">
            <span class="font-bold text-[7px] uppercase tracking-wider text-[#b45309]">HIGHLAND TASTING FLIGHT</span>
            <span class="material-symbols-outlined text-xs text-[#b45309]">local_cafe</span>
          </div>
          <div class="my-0.5">
            <div class="font-bold text-[10px] uppercase text-[#7c2d12]" contenteditable="true">${el.estate || 'HERITAGE TEA & SPICE CELLAR'}</div>
            <div class="text-[7px] italic text-[#b45309]" contenteditable="true">${el.tasting || '6-Course Highland Brew Tasting'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono border-t border-[#b45309]/30 pt-0.5 text-[#7c2d12]">
            <span contenteditable="true">${el.date || 'AFTERNOON RESERVE'}</span>
            <span class="font-bold" contenteditable="true">${el.sommelier || 'ESTATE CURATOR SELECTION'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'vintage-cable-car') {
      return `
        <div class="ephemera-vintage-cable-car-card">
          <div class="flex justify-between items-center border-b border-white/40 pb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-widest text-[#fef08a]">ALPINE SKYLINE ROPEWAY</span>
            <span class="material-symbols-outlined text-xs text-white">tram</span>
          </div>
          <div class="my-0.5 text-center">
            <div class="font-bold text-[10px] text-white uppercase" contenteditable="true">${el.route || 'Base Valley ➔ Cloud Ridge Peak'}</div>
            <div class="text-[7px] font-semibold text-[#fef08a]" contenteditable="true">${el.cabin || 'CABIN #14 • RETURN TICKET'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono border-t border-white/40 pt-0.5">
            <span contenteditable="true">${el.valid || 'ALL-DAY PEAK ACCESS'}</span>
            <span class="font-bold text-[#fef08a]">PASS VALID</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'festival-ticket') {
      return `
        <div class="ephemera-festival-ticket-card">
          <div class="flex justify-between items-center border-b border-white/30 pb-1">
            <span class="font-bold text-[9px] uppercase tracking-widest">★ MUSIC &amp; CULTURE PASS ★</span>
            <span class="font-mono font-bold text-[9px]" contenteditable="true">${el.ticketNo || 'VIP-7709'}</span>
          </div>
          <div class="text-center my-1">
            <div class="font-extrabold text-[11px] tracking-wide" contenteditable="true">${el.eventName || 'SUNSET LANTERN FESTIVAL'}</div>
            <div class="text-[8px] font-medium opacity-90" contenteditable="true">${el.venue || 'Golden Dunes Amphitheatre'}</div>
          </div>
          <div class="flex justify-between items-center text-[8px] font-mono border-t border-white/30 pt-1">
            <span contenteditable="true">${el.date || 'OCT 24 · STAGE A'}</span>
            <span class="tracking-tighter">||||||||||||||||||</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'palace-pass') {
      return `
        <div class="ephemera-palace-pass-card">
          <div class="flex justify-between items-center border-b border-[#e5b970]/40 pb-1">
            <span class="font-bold text-[8px] tracking-widest text-[#e5b970] uppercase">ROYAL HERITAGE BANQUET</span>
            <span class="material-symbols-outlined text-xs text-[#e5b970]">local_activity</span>
          </div>
          <div class="text-center my-1">
            <div class="font-bold text-[11px] text-[#fce4b8] uppercase tracking-wider" contenteditable="true">${el.palaceName || 'MAHARAJA ROYAL COURTYARD'}</div>
            <div class="text-[8px] italic text-[#e5b970]" contenteditable="true">${el.access || 'Candlelight Banquet &amp; Music'}</div>
          </div>
          <div class="flex justify-between items-center text-[8px] font-mono text-[#fce4b8]/90 border-t border-[#e5b970]/40 pt-1">
            <span contenteditable="true">${el.time || '07:30 PM · PAVILION'}</span>
            <span class="font-bold text-[#e5b970]" contenteditable="true">${el.tier || 'HERITAGE GOLD'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'safari-pass') {
      return `
        <div class="ephemera-safari-pass-card">
          <div class="flex justify-between items-center border-b border-[#8c5b11]/30 pb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-wider text-[#8c5b11]">WILDLIFE EXPEDITION PERMIT</span>
            <span class="material-symbols-outlined text-xs text-[#8c5b11]">nature_people</span>
          </div>
          <div class="my-1">
            <div class="font-bold text-[10px] uppercase text-[#2b220d]" contenteditable="true">${el.park || 'TIGER TRAIL SAFARI ZONE'}</div>
            <div class="text-[8px] font-bold text-[#8c5b11]" contenteditable="true">${el.vehicle || 'CANTER 4X4 • PERMIT #418'}</div>
          </div>
          <div class="flex justify-between items-center text-[8px] font-mono border-t border-[#8c5b11]/30 pt-0.5">
            <span contenteditable="true">${el.slot || 'DAWN SAFARI 05:45 AM'}</span>
            <span contenteditable="true">${el.guide || 'OFFICIAL NATURALIST'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'ferry-pass') {
      return `
        <div class="ephemera-ferry-pass-card">
          <div class="flex justify-between items-center border-b border-white/30 pb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-widest text-[#caf0f8]">COASTAL CRUISE &amp; JETFOIL</span>
            <span class="material-symbols-outlined text-xs text-white">directions_boat</span>
          </div>
          <div class="my-1 text-center">
            <div class="font-bold text-[10px] text-white" contenteditable="true">${el.ferryName || 'Royal Azure Coastal Jetfoil'}</div>
            <div class="text-[8px] font-semibold text-[#90e0ef]" contenteditable="true">${el.voyage || 'Backwater Pier ➔ Palm Point'}</div>
          </div>
          <div class="flex justify-between items-center text-[8px] font-mono border-t border-white/30 pt-0.5">
            <span contenteditable="true">${el.date || 'DAY 04 · SUNSET DECK'}</span>
            <span class="font-bold text-[#caf0f8]" contenteditable="true">${el.fare || 'CONFIRMED PASS'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'boarding-pass') {
      return `
        <div class="ephemera-boarding-pass-card">
          <div class="flex justify-between items-center border-b border-black/10 pb-1">
            <span class="font-bold text-[10px] text-[#944a1a] tracking-wider">BOARDING PASS</span>
            <span class="text-[10px] font-bold text-neutral-800" contenteditable="true">${el.flight || '6E-452'}</span>
          </div>
          <div class="flex justify-between items-center my-1">
            <div>
              <div class="text-[8px] text-neutral-400">PASSENGER</div>
              <div class="text-xs font-bold text-neutral-900 uppercase" contenteditable="true">${el.passenger || 'TRAVELER'}</div>
            </div>
            <div class="text-center">
              <div class="text-[8px] text-neutral-400">ROUTE</div>
              <div class="text-xs font-bold text-neutral-900" contenteditable="true">${el.from || 'DEL'} ➔ ${el.to || 'CJB'}</div>
            </div>
            <div class="text-right pr-6">
              <div class="text-[8px] text-neutral-400">SEAT</div>
              <div class="text-xs font-bold text-secondary" contenteditable="true">${el.seat || '12F'}</div>
            </div>
          </div>
          <div class="flex justify-between items-center text-[9px] text-neutral-500 pt-1 border-t border-black/10">
            <span contenteditable="true">GATE ${el.gate || '04'}</span>
            <span contenteditable="true">${el.date || 'AUG 18'}</span>
            <span class="font-mono text-[8px] pr-2">||||||||||||</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'train-ticket') {
      return `
        <div class="ephemera-train-ticket-card">
          <div class="text-center font-bold text-xs text-[#a84e34] my-1" contenteditable="true">${el.train || 'Nilgiri Mountain Express'}</div>
          <div class="text-center text-[10px] font-mono font-semibold text-neutral-800 border-y border-[#a84e34]/30 py-1" contenteditable="true">
            ${el.route || 'Mettupalayam ➔ Ooty'}
          </div>
          <div class="flex justify-between items-center text-[9px] text-neutral-700 mt-1">
            <span contenteditable="true">${el.class || 'First Class Heritage'}</span>
            <span class="font-bold text-[#a84e34]" contenteditable="true">${el.price || '₹205'}</span>
            <span contenteditable="true">${el.date || 'AUG 19, 2026'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'cafe-receipt') {
      return `
        <div class="ephemera-cafe-receipt-card">
          <div class="text-center pb-1 border-b border-black/10">
            <div class="font-bold text-xs text-neutral-900 uppercase" contenteditable="true">${el.store || 'Nilgiri Roast &amp; Bakery'}</div>
            <div class="text-[8px] text-neutral-500" contenteditable="true">${el.date || '10:15 AM · Aug 19'}</div>
          </div>
          <div class="space-y-1 text-[10px] text-neutral-800 my-2">
            <div class="flex justify-between"><span contenteditable="true">${el.item1 || '2x High-Grown Tea'}</span><span>₹180</span></div>
            <div class="flex justify-between"><span contenteditable="true">${el.item2 || '1x Cardamom Scone'}</span><span>₹160</span></div>
          </div>
          <div class="flex justify-between font-bold text-xs text-neutral-900 border-t border-black/10 pt-1">
            <span>TOTAL</span>
            <span class="text-secondary" contenteditable="true">${el.total || '₹340'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'railway-vintage') {
      return `
        <div class="ephemera-railway-vintage-card">
          <div class="flex justify-between items-center border-b border-[#c2b199] pb-0.5 mb-1">
            <span class="font-bold text-[8px] uppercase tracking-widest text-[#8e3f29]" contenteditable="true">${el.stamp || '★ CHEMINS DE FER DU NORD ★'}</span>
            <span class="font-mono text-[7px] font-bold text-red-600 border border-red-300 px-1 rounded">VALIDE</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-bold text-[10px] uppercase tracking-wide" contenteditable="true">${el.line || 'CHEMINS DE FER DU NORD'}</div>
            <div class="text-[8px] italic text-[#5c401f]" contenteditable="true">${el.route || 'PARIS GARE DU NORD ➔ CALAIS'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono border-t border-[#c2b199] pt-0.5 mt-1 text-[#5c401f]">
            <span contenteditable="true">${el.seat || 'VOITURE 03 · PLACE 18'}</span>
            <span class="font-bold" contenteditable="true">${el.date || '14 OCTOBRE 1928'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'botanical-garden') {
      return `
        <div class="ephemera-botanical-garden-card">
          <div class="flex justify-between items-center border-b border-[#6b8e23]/40 pb-0.5 mb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-widest text-[#2b3d2b]" contenteditable="true">${el.garden || 'ROYAL BOTANICAL GLASSHOUSE'}</span>
            <span class="material-symbols-outlined text-[12px] text-[#4a6b22]">local_florist</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-serif italic font-bold text-[10px] text-[#2b3d2b]" contenteditable="true">${el.tier || 'CONSERVATORY ALL-ACCESS'}</div>
            <div class="text-[8px] text-[#4a6b22]" contenteditable="true">${el.admit || 'ADMIT ONE HERBARIUM GUEST'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-serif italic border-t border-[#6b8e23]/40 pt-0.5 mt-0.5 text-[#2b3d2b]">
            <span contenteditable="true">${el.time || 'SEASON OF 1934'}</span>
            <span class="font-bold text-[#4a6b22] uppercase">ALL-ACCESS PASS</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'steamship-pass') {
      return `
        <div class="ephemera-steamship-pass-card">
          <div class="flex justify-between items-center border-b border-[#1d3557]/30 pb-0.5 mb-0.5">
            <span class="font-bold text-[8px] uppercase tracking-widest text-[#1d3557]" contenteditable="true">${el.seal || 'ROYAL STEAM NAVIGATION CO.'}</span>
            <span class="material-symbols-outlined text-[12px] text-[#1d3557]">anchor</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-bold text-[10px] uppercase text-[#1d3557] tracking-wider" contenteditable="true">${el.vessel || 'S.S. ATLANTIC VOYAGER'}</div>
            <div class="text-[8px] italic text-neutral-600" contenteditable="true">${el.voyage || 'SOUTHAMPTON ➔ NEW YORK PIER'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono border-t border-[#1d3557]/30 pt-0.5 mt-0.5 text-[#1d3557]">
            <span contenteditable="true">${el.cabin || 'STATEROOM B-42 · FIRST CLASS'}</span>
            <span class="font-bold text-red-700">★ FIRST CLASS ★</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'museum-admission') {
      return `
        <div class="ephemera-museum-admission-card">
          <div class="flex justify-between items-center border-b border-[#baa894] pb-0.5 mb-0.5">
            <span class="font-bold text-[7px] uppercase tracking-widest text-[#5c401f]">MUSEUM ADMISSION SLIP</span>
            <span class="material-symbols-outlined text-[12px] text-[#5c401f]">account_balance</span>
          </div>
          <div class="my-0.5">
            <div class="font-bold text-[9px] uppercase" contenteditable="true">${el.museum || "GALLERIA NAZIONALE D'ARTE"}</div>
            <div class="text-[7px] italic text-[#5c401f]" contenteditable="true">${el.exhibit || 'CLASSICAL SCULPTURE & ARTIFACTS'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] border-t border-[#baa894] pt-0.5 mt-0.5">
            <span contenteditable="true">${el.serial || 'NO. 004829 / TARIFFA INTERA'}</span>
            <span class="font-bold text-purple-800" contenteditable="true">${el.date || 'INGRESSO · 22.09.1952'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'alpine-funicular') {
      return `
        <div class="ephemera-alpine-funicular-card">
          <div class="flex justify-between items-center border-b border-[#b8860b]/40 pb-0.5 mb-0.5">
            <span class="font-bold text-[7px] uppercase tracking-widest text-[#78350f]">ALPINE COGWHEEL PASS</span>
            <span class="material-symbols-outlined text-[12px] text-[#78350f]">terrain</span>
          </div>
          <div class="my-0.5 text-center">
            <div class="font-bold text-[9px] uppercase" contenteditable="true">${el.mountain || 'ZERMATT ALPINE COGWHEEL'}</div>
            <div class="text-[7px] font-mono font-bold text-[#78350f]" contenteditable="true">${el.elev || 'ELEVATION 1,890M / GORNERGRAT'}</div>
          </div>
          <div class="flex justify-between items-center text-[7px] font-mono border-t border-[#b8860b]/40 pt-0.5 mt-0.5">
            <span contenteditable="true">${el.valid || 'BILLET DE RETOUR • VALABLE CE JOUR'}</span>
            <span class="font-bold text-red-700" contenteditable="true">${el.fare || 'CHF 8.50'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'trattoria-receipt') {
      return `
        <div class="ephemera-trattoria-receipt-card">
          <div class="text-center pb-0.5 border-b border-[#e0d6ce]">
            <div class="font-bold text-[9px] uppercase" contenteditable="true">${el.trattoria || 'TRATTORIA & CAFFE FIRENZE'}</div>
            <div class="text-[6px] text-neutral-500">10:45 AM · FIRENZE</div>
          </div>
          <div class="space-y-0.5 my-1 text-[8px]">
            <div class="flex justify-between"><span contenteditable="true">${el.item1 || '2x Caffe Espresso Doppio'}</span><span>L. 1,200</span></div>
            <div class="flex justify-between"><span contenteditable="true">${el.item2 || '1x Cantucci di Prato'}</span><span>L. 650</span></div>
          </div>
          <div class="flex justify-between items-center font-bold text-[8px] border-t border-[#e0d6ce] pt-0.5">
            <span contenteditable="true">${el.total || 'TOTALE LIRE 1,850'}</span>
            <span class="text-purple-700 font-bold border border-purple-400 px-1 rounded" contenteditable="true">${el.stamp || 'PAGATO ★'}</span>
          </div>
        </div>
      `;
    }

    if (el.ephemeraType === 'luggage-tag') {
      return `
        <div class="ephemera-luggage-tag-card pl-8">
          <div>
            <div class="text-[8px] text-white/80 uppercase font-mono">DESTINATION</div>
            <div class="text-xs font-bold text-white tracking-wider" contenteditable="true">${el.dest || 'OOTY / 2,240m'}</div>
          </div>
          <div class="text-right">
            <span class="material-symbols-outlined text-white text-base">flight_takeoff</span>
          </div>
        </div>
      `;
    }

    // Universal Ephemera Fallback Card (Never empty or transparent)
    return `
      <div class="ephemera-boarding-pass-card">
        <div class="flex justify-between items-center border-b border-black/10 pb-1">
          <span class="font-bold text-[10px] text-[#944a1a] tracking-wider uppercase">${el.name || 'TRAVEL EPHEMERA'}</span>
          <span class="text-[9px] font-bold text-neutral-700">★ EXPEDITION ★</span>
        </div>
        <div class="my-1 text-center">
          <div class="text-xs font-bold text-neutral-900 uppercase" contenteditable="true">${el.name || 'Travel Pass & Keepsake'}</div>
          <div class="text-[8px] text-neutral-500" contenteditable="true">Documented Field Memory</div>
        </div>
        <div class="flex justify-between items-center text-[8px] text-neutral-500 pt-1 border-t border-black/10">
          <span>MEMOIR</span>
          <span class="font-mono">||||||||||||</span>
        </div>
      </div>
    `;
  }

  _renderRouteCard(el) {
    if (el.customInnerHtml) {
      return el.customInnerHtml;
    }
    if (el.badgeType === 'coral-reef') {
      return `
        <div class="badge-coral-reef-card">
          <div class="flex items-center justify-between border-b border-white/30 pb-0.5">
            <span class="font-bold text-[7px] tracking-widest uppercase text-cyan-100">SCUBA &amp; DIVE WAYPOINT</span>
            <span class="material-symbols-outlined text-xs">scuba_diving</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-extrabold text-[9px] text-white" contenteditable="true">${el.routeTitle || 'AZURE CORAL REEF EXPEDITION'}</div>
            <div class="text-[7px] opacity-90 text-cyan-100" contenteditable="true">${el.from || 'Turtle Bay'} ➔ ${el.to || 'Manta Point Ridge'}</div>
          </div>
          <div class="text-center text-[6px] font-mono font-bold text-[#a5f3fc] uppercase tracking-wider" contenteditable="true">${el.depth || 'DEPTH 18M • VISIBILITY 25M'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'desert-caravan') {
      return `
        <div class="badge-desert-caravan-card">
          <div class="flex items-center justify-between border-b border-[#fde68a]/30 pb-0.5">
            <span class="font-bold text-[7px] tracking-widest uppercase text-amber-200">SILK DUNE CARAVAN TRAIL</span>
            <span class="material-symbols-outlined text-xs text-amber-200">wb_sunny</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-extrabold text-[9px] text-amber-100 uppercase" contenteditable="true">${el.routeTitle || 'SILK DUNE CARAVAN TRAIL'}</div>
            <div class="text-[7px] opacity-90 text-amber-200" contenteditable="true">${el.from || 'Oasis Outpost'} ➔ ${el.to || 'Sunken Fort Well'}</div>
          </div>
          <div class="text-center text-[6px] font-bold text-[#fde68a] uppercase tracking-wider" contenteditable="true">${el.vibe || 'Sunset Camel Crossing'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'starlit-camp') {
      return `
        <div class="badge-starlit-camp-card">
          <span class="material-symbols-outlined text-indigo-300 text-sm">bedtime</span>
          <div class="font-bold text-[9px] uppercase tracking-wider text-indigo-200 mt-0.5" contenteditable="true">${el.camp || 'STARGAZER CAMPGROUND'}</div>
          <div class="text-[7px] font-mono text-indigo-300 my-0.5" contenteditable="true">${el.alt || 'ELEVATION 2,180M'}</div>
          <div class="text-[6px] font-mono uppercase tracking-widest text-indigo-400" contenteditable="true">${el.night || '02:00 AM • MILKY WAY VISTA'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'mountain-high-pass') {
      return `
        <div class="badge-mountain-high-pass-card">
          <span class="material-symbols-outlined text-blue-200 text-sm">terrain</span>
          <div class="font-bold text-[9px] uppercase tracking-wider text-blue-100 mt-0.5" contenteditable="true">${el.pass || 'KHARDUNG LA HIGH PASS'}</div>
          <div class="font-mono text-[10px] font-bold text-blue-200 my-0.5" contenteditable="true">${el.alt || '5,359 M / 17,582 FT'}</div>
          <div class="text-[6px] font-mono uppercase tracking-widest text-blue-300" contenteditable="true">${el.subtitle || 'WINDY SUMMIT RIDGEWAY'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'sunset-coastal') {
      return `
        <div class="badge-sunset-coastal-card">
          <div class="flex items-center justify-between border-b border-white/30 pb-0.5">
            <span class="font-bold text-[8px] tracking-widest uppercase">SCENIC COASTAL ROUTE</span>
            <span class="material-symbols-outlined text-xs">wb_twilight</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-extrabold text-[10px]" contenteditable="true">${el.routeTitle || 'SUNSET HIGHWAY 66'}</div>
            <div class="text-[8px] opacity-90" contenteditable="true">${el.from || 'Palm Cove'} ➔ ${el.to || 'Cliff Lighthouse'}</div>
          </div>
          <div class="text-center text-[7px] font-bold text-[#fce4b8] uppercase tracking-wider" contenteditable="true">${el.vibe || 'Scenic Golden Hour Cruise'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'spice-plantation') {
      return `
        <div class="badge-spice-plantation-card">
          <span class="material-symbols-outlined text-[#c9e89d] text-sm">spa</span>
          <div class="font-bold text-[9px] uppercase tracking-wider text-[#c9e89d] mt-0.5" contenteditable="true">${el.estate || 'CARDAMOM &amp; VANILLA ESTATE'}</div>
          <div class="text-[7px] italic text-[#a3b18a] my-0.5" contenteditable="true">${el.loc || 'Misty Rain Slopes'}</div>
          <div class="text-[6px] font-mono uppercase tracking-widest text-[#dad7cd]" contenteditable="true">${el.badgeText || 'ESTD 1908 • ORGANIC'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'route-card') {
      return `
        <div class="badge-route-card">
          <div class="flex items-center gap-1 text-[9px] font-bold text-[#2e4433] uppercase tracking-wider mb-1">
            <span class="material-symbols-outlined text-xs text-secondary">explore</span>
            <span>Scenic Trail Waypoints</span>
          </div>
          <div class="flex items-center justify-between text-[10px] font-semibold text-neutral-800 my-1">
            <span contenteditable="true">${el.pointA || 'Coimbatore'}</span>
            <span class="text-secondary font-mono">➔</span>
            <span contenteditable="true">${el.pointB || 'Coonoor'}</span>
            <span class="text-secondary font-mono">➔</span>
            <span contenteditable="true">${el.pointC || 'Ooty'}</span>
          </div>
        </div>
      `;
    }

    if (el.badgeType === 'altitude-badge') {
      return `
        <div class="badge-altitude-card">
          <span class="material-symbols-outlined text-secondary text-sm">landscape</span>
          <div class="font-headline-md text-xs font-bold text-white uppercase tracking-wider" contenteditable="true">${el.peak || 'Doddabetta Peak'}</div>
          <div class="font-mono text-sm font-bold text-[#e6ae55] my-0.5" contenteditable="true">${el.elevation || '2,637 m'}</div>
          <div class="text-[9px] text-white/80 font-mono" contenteditable="true">${el.temp || '16°C · Misty'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'postal-stamp') {
      return `
        <div class="badge-postal-stamp-card">
          <div class="text-[8px] font-bold tracking-widest uppercase border-b border-[#ba1a1a] pb-0.5" contenteditable="true">${el.city || 'OOTY NILGIRIS'}</div>
          <div class="text-xs font-bold my-1" contenteditable="true">${el.date || '18 AUG 2026'}</div>
          <div class="text-[7px] tracking-widest">★ EXPEDITION ★</div>
        </div>
      `;
    }

    if (el.badgeType === 'passport-stamp') {
      return `
        <div class="badge-passport-stamp-card">
          <div class="flex justify-between items-center text-[7px] font-bold tracking-widest uppercase border-b border-[#1d3557]/30 pb-0.5">
            <span contenteditable="true">${el.country || 'EXPEDITION PERMIT'}</span>
            <span class="material-symbols-outlined text-[10px]">flight</span>
          </div>
          <div class="text-[9px] font-bold my-1 text-center" contenteditable="true">${el.entry || 'PORT OF ENTRY • IMMIGRATION'}</div>
          <div class="flex justify-between items-center text-[8px] font-mono font-bold border-t border-[#1d3557]/30 pt-0.5">
            <span contenteditable="true">${el.date || '18.08.2026'}</span>
            <span class="text-secondary" contenteditable="true">${el.status || '★ VALIDATED ★'}</span>
          </div>
        </div>
      `;
    }

    if (el.badgeType === 'national-park') {
      return `
        <div class="badge-national-park-card">
          <span class="material-symbols-outlined text-secondary text-xs">forest</span>
          <div class="font-bold text-[10px] uppercase tracking-wider text-[#d4af37]" contenteditable="true">${el.park || 'NILGIRI BIOSPHERE'}</div>
          <div class="text-[8px] tracking-widest text-white/90 my-0.5" contenteditable="true">${el.sub || 'WILDLIFE SANCTUARY'}</div>
          <div class="text-[7px] font-mono text-white/70" contenteditable="true">${el.year || 'EST. 1986'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'coordinates') {
      return `
        <div class="badge-coordinates-card">
          <div class="flex items-center justify-center gap-1 text-[7px] font-bold uppercase tracking-widest text-[#5c401f] mb-0.5">
            <span class="material-symbols-outlined text-[10px]">explore</span>
            <span contenteditable="true">${el.tag || 'WESTERN GHATS EXPEDITION'}</span>
          </div>
          <div class="font-mono text-[10px] font-bold tracking-wider my-0.5" contenteditable="true">${el.coords || '11°24\'08"N · 76°41\'42"E'}</div>
          <div class="text-[7px] font-mono font-bold text-[#8e6c38]" contenteditable="true">${el.elev || 'ELEVATION 2,240M'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'odometer') {
      return `
        <div class="badge-odometer-card">
          <div class="text-[7px] font-bold tracking-widest uppercase text-neutral-400 mb-1" contenteditable="true">${el.stage || 'STAGE 02 • HIGHWAY PASS'}</div>
          <div class="bg-black/60 px-3 py-1 rounded border border-neutral-700 font-mono text-sm font-bold tracking-[0.25em] text-[#e6ae55] shadow-inner" contenteditable="true">
            ${el.km || '0 0 1 4 8'}
          </div>
          <div class="text-[6px] tracking-widest uppercase text-neutral-400 mt-1" contenteditable="true">${el.unit || 'KILOMETERS JOURNEYED'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'amalfi-drive') {
      return `
        <div class="badge-amalfi-drive-card">
          <div class="flex items-center justify-between border-b border-white/40 pb-0.5 mb-0.5">
            <span class="font-bold text-[8px] tracking-widest uppercase">PANORAMIC COASTAL DRIVE</span>
            <span class="material-symbols-outlined text-[12px]">directions_car</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-extrabold text-[10px]" contenteditable="true">${el.title || 'AMALFI COASTAL DRIVE'}</div>
            <div class="text-[8px] opacity-90" contenteditable="true">${el.route || 'Positano ➔ Amalfi ➔ Ravello'}</div>
          </div>
          <div class="text-center text-[7px] font-bold text-amber-200 uppercase tracking-wider" contenteditable="true">${el.vibe || 'Scenic Cliffside Golden Hour'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'kyoto-trail') {
      return `
        <div class="badge-kyoto-trail-card">
          <div class="flex items-center justify-between border-b border-red-200 pb-0.5 mb-0.5">
            <span class="font-bold text-[8px] tracking-widest uppercase text-red-800">SHRINE PILGRIMAGE TRAIL</span>
            <span class="material-symbols-outlined text-[12px] text-red-700">temple_buddhist</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-serif font-bold text-[10px] text-red-900" contenteditable="true">${el.shrine || 'KYOTO SHRINE PILGRIMAGE'}</div>
            <div class="text-[8px] font-serif italic text-red-700" contenteditable="true">${el.trail || 'Fushimi Inari ➔ Gion ➔ Arashiyama'}</div>
          </div>
          <div class="text-center text-[7px] font-bold text-red-800 uppercase tracking-widest" contenteditable="true">${el.season || 'SPRING BLOSSOM WAYPOINTS'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'route66-strip') {
      return `
        <div class="badge-route66-strip-card">
          <div class="flex items-center justify-between border-b border-orange-400/40 pb-0.5 mb-0.5">
            <span class="font-bold text-[8px] tracking-widest uppercase text-orange-400">HISTORIC HIGHWAY ROUTE</span>
            <span class="material-symbols-outlined text-[12px] text-sky-400">local_gas_station</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-extrabold text-[10px] text-sky-300 uppercase" contenteditable="true">${el.shield || 'HISTORIC US ROUTE 66'}</div>
            <div class="text-[8px] text-orange-200 font-mono" contenteditable="true">${el.route || 'Chicago ➔ Kingman ➔ Santa Monica'}</div>
          </div>
          <div class="text-center text-[7px] font-mono font-bold text-sky-400 uppercase tracking-wider" contenteditable="true">${el.meter || '2,448 MILES • MOTEL & DINER PASS'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'alpine-pass') {
      return `
        <div class="badge-alpine-pass-card">
          <span class="material-symbols-outlined text-emerald-300 text-sm">terrain</span>
          <div class="font-bold text-[9px] uppercase tracking-wider text-emerald-100 mt-0.5" contenteditable="true">${el.pass || 'HIGH GLACIER RIDGEWAY'}</div>
          <div class="font-mono text-[10px] font-bold text-emerald-300 my-0.5" contenteditable="true">${el.alt || '2,850 M / 9,350 FT'}</div>
          <div class="text-[6px] font-mono uppercase tracking-widest text-emerald-200" contenteditable="true">${el.tag || 'EDELWEISS SANCTUARY'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'tropical-sail') {
      return `
        <div class="badge-tropical-sail-card">
          <div class="flex items-center justify-between border-b border-white/40 pb-0.5 mb-0.5">
            <span class="font-bold text-[8px] tracking-widest uppercase text-sky-100">CATAMARAN REEF SAIL</span>
            <span class="material-symbols-outlined text-[12px]">sailing</span>
          </div>
          <div class="text-center my-0.5">
            <div class="font-extrabold text-[10px] text-white" contenteditable="true">${el.sail || 'AZURE CORAL REEF SAIL'}</div>
            <div class="text-[8px] opacity-90 text-sky-100" contenteditable="true">${el.route || 'Palm Cove ➔ Coral Bay ➔ Lighthouse'}</div>
          </div>
          <div class="text-center text-[7px] font-mono font-bold text-sky-200 uppercase tracking-wider" contenteditable="true">${el.depth || 'ANCHOR DEPTH 14M • CATAMARAN'}</div>
        </div>
      `;
    }

    if (el.badgeType === 'railway-ribbon') {
      return `
        <div class="badge-railway-ribbon-card">
          <span class="material-symbols-outlined text-[#d4af37] text-sm">train</span>
          <div class="font-bold text-[10px] text-[#fbf9f4] uppercase tracking-wider mt-0.5" contenteditable="true">${el.title || 'HERITAGE STEAM LINE'}</div>
          <div class="text-[8px] text-[#d4af37] font-semibold my-0.5" contenteditable="true">${el.subtitle || 'NILGIRI MOUNTAIN TOY TRAIN'}</div>
          <div class="text-[6px] text-white/70 uppercase tracking-widest font-mono" contenteditable="true">${el.track || 'RACK & PINION SYSTEM'}</div>
        </div>
      `;
    }

    // Universal Route Badge Fallback Card (Never empty or transparent)
    return `
      <div class="badge-route-card">
        <div class="flex items-center gap-1 text-[9px] font-bold text-[#2e4433] uppercase tracking-wider mb-1">
          <span class="material-symbols-outlined text-xs text-secondary">explore</span>
          <span>${el.name || 'Expedition Route Trail'}</span>
        </div>
        <div class="text-[10px] font-semibold text-neutral-800 text-center my-1" contenteditable="true">
          ${el.title || el.name || 'Scenic Expedition Waypoint'}
        </div>
      </div>
    `;
  }

  // ── Page Management ──────────────────────────────────────────────────

  addPage() {
    const newPage = {
      id: `page-${Date.now()}`,
      title: `Expedition Journal — Page ${this.pages.length + 1}`,
      background: 'bg-heritage-parchment',
      edgeStyle: 'edge-torn',
      format: this.canvasFormat,
      elements: [],
    };
    this.pages.push(newPage);
    this._savePages();
    this.activePageIndex = this.pages.length - 1;
    this.selectedElementId = null;
    this.selectedElementIds.clear();
    this._undoStack = [];
    this._redoStack = [];
    this.render();

    const artboard = this.container.querySelector('#scrapbookArtboard');
    if (artboard) {
      artboard.classList.add('page-flip-forward');
      setTimeout(() => artboard.classList.remove('page-flip-forward'), 290);
    }
  }

  deletePage(pageIndex = this.activePageIndex) {
    if (this.pages.length <= 1) return;
    this.pages.splice(pageIndex, 1);
    if (this.activePageIndex >= this.pages.length) {
      this.activePageIndex = this.pages.length - 1;
    }
    this.selectedElementId = null;
    this.selectedElementIds.clear();
    this._undoStack = [];
    this._redoStack = [];
    this._savePages();
    this.render();

    const artboard = this.container.querySelector('#scrapbookArtboard');
    if (artboard) {
      artboard.classList.add('page-flip-backward');
      setTimeout(() => artboard.classList.remove('page-flip-backward'), 290);
    }
  }

  // ── Animated Page Transitions (Feature #11) ─────────────────────────

  _switchPageWithAnimation(targetIndex, direction = 'forward') {
    if (targetIndex === this.activePageIndex || targetIndex < 0 || targetIndex >= this.pages.length) return;
    const animClass = direction === 'forward' ? 'page-flip-forward' : 'page-flip-backward';

    this.activePageIndex = targetIndex;
    this.selectedElementId = null;
    this.selectedElementIds.clear();
    this._undoStack = [];
    this._redoStack = [];
    this.render();

    const artboard = this.container.querySelector('#scrapbookArtboard');
    if (artboard) {
      artboard.classList.add(animClass);
      setTimeout(() => {
        artboard.classList.remove(animClass);
      }, 290);
    }
  }

  // ── Undo / Redo Command Stack ────────────────────────────────────────

  _pushUndo() {
    const page = this.getCurrentPage();
    if (!page) return;
    this._undoStack.push(JSON.parse(JSON.stringify(page.elements)));
    if (this._undoStack.length > 50) this._undoStack.shift(); // Cap at 50 snapshots
    this._redoStack = []; // Reset forward redo history upon a new user action
  }

  _undo() {
    if (this._undoStack.length === 0) return;
    const page = this.getCurrentPage();
    if (!page) return;
    this._redoStack.push(JSON.parse(JSON.stringify(page.elements)));
    page.elements = this._undoStack.pop();
    this.selectedElementId = null;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  _redo() {
    if (this._redoStack.length === 0) return;
    const page = this.getCurrentPage();
    if (!page) return;
    this._undoStack.push(JSON.parse(JSON.stringify(page.elements)));
    page.elements = this._redoStack.pop();
    this.selectedElementId = null;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  // ── Element Actions ──────────────────────────────────────────────────

  addPhotoElement(src, dropX = null, dropY = null) {
    this._pushUndo();
    const page = this.getCurrentPage();
    const count = page.elements.length;

    const newEl = {
      id: `el-photo-${Date.now()}`,
      type: 'photo',
      src,
      frameStyle: this.defaultPhotoFrame || 'frame-polaroid',
      x: dropX !== null ? Math.max(0, dropX - 110) : (80 + ((count * 30) % 240)),
      y: dropY !== null ? Math.max(0, dropY - 110) : (60 + ((count * 25) % 180)),
      width: 220,
      height: 220,
      rotation: count % 2 === 0 ? 3 : -3,
      zIndex: page.elements.length + 1,
    };

    page.elements.push(newEl);
    this.selectedElementId = newEl.id;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  addStickerElement(templateId, category, dropX = null, dropY = null) {
    const page = this.getCurrentPage();
    const catList = EMBELLISHMENTS[category] || [];
    const template = catList.find((t) => t.id === templateId) ||
      Object.values(EMBELLISHMENTS).flat().find((t) => t.id === templateId);
    if (!template) return;

    this._pushUndo();

    // Update Recently Used Stickers
    this._recentStickers = this._recentStickers.filter((r) => r.id !== templateId);
    this._recentStickers.unshift({ id: templateId, category: template.category });
    if (this._recentStickers.length > 12) this._recentStickers.splice(12);
    localStorage.setItem('trailmate_sticker_recent', JSON.stringify(this._recentStickers));

    const count = page.elements.length;
    const newEl = {
      id: `el-sticker-${Date.now()}`,
      type: 'sticker',
      templateId: template.id,
      category: template.category,
      x: dropX !== null ? Math.max(0, dropX - Math.round(template.width / 2)) : (120 + ((count * 25) % 260)),
      y: dropY !== null ? Math.max(0, dropY - Math.round(template.height / 2)) : (80 + ((count * 25) % 200)),
      width: template.width,
      height: template.height,
      rotation: count % 3 === 0 ? 6 : -4,
      zIndex: page.elements.length + 1,
    };

    page.elements.push(newEl);
    this.selectedElementId = newEl.id;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  addEphemeraElement(templateId, dropX = null, dropY = null) {
    const page = this.getCurrentPage();
    const template = EPHEMERA_TEMPLATES.find((e) => e.id === templateId);
    if (!template) return;

    this._pushUndo();
    const count = page.elements.length;
    const newEl = {
      ...template,
      id: `el-ephemera-${Date.now()}`,
      type: 'ephemera',
      ephemeraType: template.type,
      x: dropX !== null ? Math.max(0, dropX - 110) : (100 + ((count * 25) % 240)),
      y: dropY !== null ? Math.max(0, dropY - 70) : (100 + ((count * 25) % 180)),
      rotation: count % 2 === 0 ? 2 : -2,
      zIndex: page.elements.length + 1,
    };

    page.elements.push(newEl);
    this.selectedElementId = newEl.id;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  addRouteElement(badgeId, dropX = null, dropY = null) {
    const page = this.getCurrentPage();
    const template = ROUTE_BADGE_TEMPLATES.find((b) => b.id === badgeId);
    if (!template) return;

    this._pushUndo();
    const count = page.elements.length;
    const newEl = {
      ...template,
      id: `el-route-${Date.now()}`,
      type: 'routes',
      badgeType: template.type,
      x: dropX !== null ? Math.max(0, dropX - 110) : (140 + ((count * 20) % 240)),
      y: dropY !== null ? Math.max(0, dropY - 45) : (120 + ((count * 20) % 180)),
      rotation: template.type === 'postal-stamp' ? -12 : (count % 2 === 0 ? 3 : -3),
      zIndex: page.elements.length + 1,
    };

    page.elements.push(newEl);
    this.selectedElementId = newEl.id;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  addTextElement(textType) {
    this._pushUndo();
    const page = this.getCurrentPage();
    let content = 'Chapter I • The High Mountains';
    let fontFamily = "'Noto Serif', Georgia, serif";
    let fontSize = 24;
    let color = '#1b1c1a';
    let bold = true;
    let italic = false;
    let w = 280;
    let h = 50;

    if (textType === 'script') {
      content = 'Whispers in the mountain mist…';
      fontFamily = "'Caveat', cursive, sans-serif";
      fontSize = 28;
      color = '#944a1a';
      bold = false;
      w = 280;
    } else if (textType === 'botanical') {
      content = 'Nilgiri Wildflowers & Pine Meadows';
      fontFamily = "'Playfair Display', Georgia, serif";
      fontSize = 22;
      color = '#2e4433';
      bold = false;
      italic = true;
      w = 300;
    } else if (textType === 'note-block') {
      content = '• 06:30 AM: Steam train whistles at Coonoor.\n• Crisp air, eucalyptus aroma fills the valleys.';
      fontFamily = "'Caveat', cursive, sans-serif";
      fontSize = 18;
      color = '#3d261a';
      bold = false;
      w = 290;
      h = 90;
    } else if (textType === 'dispatch') {
      content = 'DISPATCH NO. 04 — ELEVATION 2,240M';
      fontFamily = "'Noto Serif', serif";
      fontSize = 15;
      color = '#763403';
      bold = true;
      w = 300;
    } else if (textType === 'typewriter') {
      content = 'LAT: 11.41° N • LON: 76.69° E • CLOUDS LOW';
      fontFamily = "'JetBrains Mono', monospace";
      fontSize = 12;
      color = '#1b1c1a';
      bold = false;
      w = 280;
    } else if (textType === 'quote') {
      content = '“In every walk with nature, one receives far more than he seeks.”';
      fontFamily = "'Noto Serif', Georgia, serif";
      fontSize = 15;
      color = '#3e4438';
      bold = false;
      italic = true;
      w = 280;
      h = 75;
    } else if (textType === 'pencil') {
      content = 'Note: best chai stall near the tea factory corner!';
      fontFamily = "'Caveat', cursive, sans-serif";
      fontSize = 18;
      color = '#5a5a5a';
      bold = false;
      w = 260;
    }

    const count = page.elements.length;
    const newEl = {
      id: `el-text-${Date.now()}`,
      type: 'text',
      content,
      fontFamily,
      fontSize,
      color,
      bold,
      italic,
      align: 'left',
      x: 100 + ((count * 20) % 240),
      y: 120 + ((count * 25) % 180),
      width: w,
      height: h,
      rotation: 0,
      zIndex: page.elements.length + 1,
    };

    page.elements.push(newEl);
    this.selectedElementId = newEl.id;
    this.selectedElementIds.clear();
    this._savePages();
    this.render();
  }

  duplicateSelected() {
    this._pushUndo();
    const page = this.getCurrentPage();

    if (this.selectedElementIds.size > 1) {
      const clones = [];
      this.selectedElementIds.forEach((id) => {
        const el = page.elements.find((e) => e.id === id);
        if (el) {
          const clone = JSON.parse(JSON.stringify(el));
          clone.id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          clone.x += 20;
          clone.y += 20;
          clone.zIndex = page.elements.length + clones.length + 1;
          clones.push(clone);
        }
      });
      clones.forEach((c) => page.elements.push(c));
      this.selectedElementIds.clear();
      this.selectedElementId = null;
      this._savePages();
      this.render();
      return;
    }

    const el = page.elements.find((e) => e.id === this.selectedElementId);
    if (!el) return;

    const clone = JSON.parse(JSON.stringify(el));
    clone.id = `el-${Date.now()}`;
    clone.x += 20;
    clone.y += 20;
    clone.zIndex = page.elements.length + 1;

    page.elements.push(clone);
    this.selectedElementId = clone.id;
    this._savePages();
    this.render();
  }

  deleteSelected() {
    this._pushUndo();
    const page = this.getCurrentPage();

    if (this.selectedElementIds.size > 1) {
      page.elements = page.elements.filter((e) => !this.selectedElementIds.has(e.id));
      this.selectedElementIds.clear();
      this.selectedElementId = null;
      this._savePages();
      this.render();
      return;
    }

    page.elements = page.elements.filter((e) => e.id !== this.selectedElementId);
    this.selectedElementId = null;
    this._savePages();
    this.render();
  }

  bringForwardSelected() {
    this._pushUndo();
    const page = this.getCurrentPage();
    const el = page.elements.find((e) => e.id === this.selectedElementId);
    if (!el) return;
    const maxZ = Math.max(...page.elements.map((e) => e.zIndex || 1), 1);
    el.zIndex = maxZ + 1;
    this._savePages();
    this.render();
  }

  sendBackwardSelected() {
    this._pushUndo();
    const page = this.getCurrentPage();
    const el = page.elements.find((e) => e.id === this.selectedElementId);
    if (!el) return;
    el.zIndex = 0;
    this._savePages();
    this.render();
  }

  _showLongPressMenu(clientX, clientY, elementId) {
    document.querySelector('.canvas-long-press-menu')?.remove();

    const menu = document.createElement('div');
    menu.className = 'canvas-long-press-menu';

    const artboardRect = this.container.querySelector('#scrapbookArtboard')?.getBoundingClientRect() || { left: 0, top: 0 };
    menu.style.left = `${clientX - artboardRect.left + 8}px`;
    menu.style.top = `${clientY - artboardRect.top - 8}px`;

    menu.innerHTML = `
      <button class="lp-menu-item" data-lp-action="duplicate">
        <span class="material-symbols-outlined">content_copy</span> Duplicate
      </button>
      <button class="lp-menu-item" data-lp-action="bring-forward">
        <span class="material-symbols-outlined">flip_to_front</span> Bring Forward
      </button>
      <button class="lp-menu-item" data-lp-action="send-backward">
        <span class="material-symbols-outlined">flip_to_back</span> Send Backward
      </button>
      <button class="lp-menu-item lp-menu-item--danger" data-lp-action="delete">
        <span class="material-symbols-outlined">delete</span> Delete
      </button>
    `;

    const artboard = this.container.querySelector('#scrapbookArtboard');
    artboard?.appendChild(menu);

    const dismiss = () => menu.remove();

    menu.querySelectorAll('[data-lp-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.lpAction;
        this.selectedElementId = elementId;
        if (action === 'duplicate') this.duplicateSelected();
        else if (action === 'delete') this.deleteSelected();
        else if (action === 'bring-forward') this.bringForwardSelected();
        else if (action === 'send-backward') this.sendBackwardSelected();
        dismiss();
      });
    });

    setTimeout(() => {
      document.addEventListener('pointerdown', dismiss, { once: true });
    }, 20);
  }

  _updateMultiSelectToolbar() {
    const existing = this.container.querySelector('.multi-select-toolbar');
    if (existing) existing.remove();

    if (this.selectedElementIds.size < 2) return;

    const artboard = this.container.querySelector('#scrapbookArtboard');
    if (!artboard) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'multi-select-toolbar';
    toolbar.innerHTML = `
      <span class="multi-select-count">${this.selectedElementIds.size} SELECTED</span>
      <div class="h-3 w-px bg-neutral-300 mx-1"></div>
      <button type="button" class="multi-select-action" data-action="multi-duplicate" title="Duplicate all selected items">
        <span class="material-symbols-outlined text-[15px]">content_copy</span>
      </button>
      <button type="button" class="multi-select-action hover:text-red-600" data-action="multi-delete" title="Delete all selected items">
        <span class="material-symbols-outlined text-[15px]">delete</span>
      </button>
    `;
    artboard.appendChild(toolbar);

    toolbar.querySelector('[data-action="multi-delete"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteSelected();
    });

    toolbar.querySelector('[data-action="multi-duplicate"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.duplicateSelected();
    });
  }

  _selectElement(id, triggerJump = true) {
    const isDifferent = this.selectedElementId !== id;
    this.selectedElementId = id;

    const allElements = this.container.querySelectorAll('.canvas-element');
    allElements.forEach((domNode) => {
      if (domNode.dataset.elementId === id || this.selectedElementIds.has(domNode.dataset.elementId)) {
        domNode.classList.add('is-selected');
        if (this.selectedElementIds.has(domNode.dataset.elementId)) {
          domNode.classList.add('is-multi-selected');
        }
        if (triggerJump && domNode.dataset.elementId === id) {
          domNode.classList.remove('is-jumping');
          void domNode.offsetWidth; // Force layout reflow so the soft jump animation reliably restarts on every click
          domNode.classList.add('is-jumping');
        }
      } else {
        domNode.classList.remove('is-selected');
        domNode.classList.remove('is-jumping');
        domNode.classList.remove('is-multi-selected');
      }
    });

    // If bottom dock has inspector tab open (text/photo), update inspector controls smoothly
    if (isDifferent && (this.activeDockTab === 'text' || this.activeDockTab === 'photo')) {
      const panelContent = this.container.querySelector('#scrapbookFloatingTray .tray-body');
      if (panelContent) {
        panelContent.innerHTML = this._renderDockPanelContent();
        this._bindDynamicHandlers();
      }
    }
  }

  _deselectAll() {
    if (this.selectedElementId === null && this.selectedElementIds.size === 0) return;
    this.selectedElementId = null;
    this.selectedElementIds.clear();
    this._updateMultiSelectToolbar();

    this.container.querySelectorAll('.canvas-element').forEach((node) => {
      node.classList.remove('is-selected');
      node.classList.remove('is-jumping');
      node.classList.remove('is-multi-selected');
    });

    if (this.activeDockTab === 'text' || this.activeDockTab === 'photo') {
      const panelContent = this.container.querySelector('#scrapbookFloatingTray .tray-body');
      if (panelContent) {
        panelContent.innerHTML = this._renderDockPanelContent();
        this._bindDynamicHandlers();
      }
    }
  }

  // ── Event Handlers ───────────────────────────────────────────────────

  _bindEvents() {
    // Prevent duplicate global event listener bindings (Suggestion #22)
    if (this._globalEventsBound) return;
    this._globalEventsBound = true;

    const artboard = this.container.querySelector('#scrapbookArtboard');

    const clearSnapGuides = () => {
      this.container.querySelectorAll('.canvas-snap-guide-x, .canvas-snap-guide-y').forEach((g) => g.remove());
    };

    const renderSnapGuideX = (xPos) => {
      clearSnapGuides();
      const guide = document.createElement('div');
      guide.className = 'canvas-snap-guide-x';
      guide.style.left = `${xPos}px`;
      const board = this.container.querySelector('#scrapbookArtboard');
      board?.appendChild(guide);
    };

    const renderSnapGuideY = (yPos) => {
      const guide = document.createElement('div');
      guide.className = 'canvas-snap-guide-y';
      guide.style.top = `${yPos}px`;
      const board = this.container.querySelector('#scrapbookArtboard');
      board?.appendChild(guide);
    };

    // Canvas Zoom Interception on Viewport (Prevents zooming the entire webpage)
    const viewport = this.container.querySelector('#scrapbookViewport');
    viewport?.addEventListener('wheel', (e) => {
      // Trackpad pinch-to-zoom or mouse wheel with Ctrl/Cmd/Alt
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        this.setZoom(this.zoomLevel + delta);
      }
    }, { passive: false });

    viewport?.addEventListener('gesturestart', (e) => e.preventDefault());
    viewport?.addEventListener('gesturechange', (e) => {
      e.preventDefault();
      if (e.scale) {
        const delta = (e.scale - 1) * 0.1;
        this.setZoom(this.zoomLevel + delta);
      }
    });

    // Native Drag-and-Drop from Tray to Canvas (Feature #4)
    viewport?.addEventListener('dragover', (e) => {
      if (e.dataTransfer.types.includes('application/trailmate-sticker')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        artboard?.classList.add('is-drag-over');
      }
    });

    viewport?.addEventListener('dragleave', (e) => {
      if (!viewport.contains(e.relatedTarget)) {
        artboard?.classList.remove('is-drag-over');
      }
    });

    viewport?.addEventListener('drop', (e) => {
      e.preventDefault();
      artboard?.classList.remove('is-drag-over');

      const stickerData = e.dataTransfer.getData('application/trailmate-sticker');
      if (!stickerData) return;

      try {
        const { templateId, cat } = JSON.parse(stickerData);
        const artboardRect = artboard ? artboard.getBoundingClientRect() : { left: 0, top: 0 };
        const zoom = this.zoomLevel || 1.0;
        const dropX = Math.round((e.clientX - artboardRect.left) / zoom);
        const dropY = Math.round((e.clientY - artboardRect.top) / zoom);

        this.addStickerElement(templateId, cat, dropX, dropY);
      } catch (err) {
        console.warn('[Scrapbook] Drop parsing notice:', err);
      }
    });

    // Global pointer move & up for direct canvas manipulation
    window.addEventListener('pointermove', (e) => {
      if (!this.activeDrag) return;
      const page = this.getCurrentPage();
      const el = page.elements.find((item) => item.id === this.activeDrag.elementId);
      if (!el) return;

      const currentZoom = this.zoomLevel || 1.0;

      if (this.activeDrag.type === 'move') {
        const dx = (e.clientX - this.activeDrag.startX) / currentZoom;
        const dy = (e.clientY - this.activeDrag.startY) / currentZoom;
        let rawX = Math.round(this.activeDrag.startItemX + dx);
        let rawY = Math.round(this.activeDrag.startItemY + dy);

        // Smart Snap to Alignment Guides
        const board = this.container.querySelector('#scrapbookArtboard');
        const boardW = board ? board.clientWidth : 760;
        const boardH = board ? board.clientHeight : 520;
        const SNAP_THRESHOLD = 7;

        clearSnapGuides();
        let snappedX = false;
        let snappedY = false;

        // 1. Artboard Center X Snap
        const centerCanvasX = Math.round(boardW / 2 - el.width / 2);
        if (Math.abs(rawX - centerCanvasX) <= SNAP_THRESHOLD) {
          rawX = centerCanvasX;
          renderSnapGuideX(Math.round(boardW / 2));
          snappedX = true;
        }

        // 2. Artboard Center Y Snap
        const centerCanvasY = Math.round(boardH / 2 - el.height / 2);
        if (Math.abs(rawY - centerCanvasY) <= SNAP_THRESHOLD) {
          rawY = centerCanvasY;
          renderSnapGuideY(Math.round(boardH / 2));
          snappedY = true;
        }

        // 3. Other Elements Alignment Snap
        const otherElements = page.elements.filter((item) => item.id !== el.id);
        for (const other of otherElements) {
          // X alignment (left edge, right edge, center)
          if (!snappedX) {
            if (Math.abs(rawX - other.x) <= SNAP_THRESHOLD) {
              rawX = other.x;
              renderSnapGuideX(other.x);
              snappedX = true;
            } else if (Math.abs(rawX + el.width - (other.x + other.width)) <= SNAP_THRESHOLD) {
              rawX = other.x + other.width - el.width;
              renderSnapGuideX(other.x + other.width);
              snappedX = true;
            } else if (Math.abs(rawX + el.width / 2 - (other.x + other.width / 2)) <= SNAP_THRESHOLD) {
              rawX = Math.round(other.x + other.width / 2 - el.width / 2);
              renderSnapGuideX(Math.round(other.x + other.width / 2));
              snappedX = true;
            }
          }

          // Y alignment (top edge, bottom edge, center)
          if (!snappedY) {
            if (Math.abs(rawY - other.y) <= SNAP_THRESHOLD) {
              rawY = other.y;
              renderSnapGuideY(other.y);
              snappedY = true;
            } else if (Math.abs(rawY + el.height - (other.y + other.height)) <= SNAP_THRESHOLD) {
              rawY = other.y + other.height - el.height;
              renderSnapGuideY(other.y + other.height);
              snappedY = true;
            } else if (Math.abs(rawY + el.height / 2 - (other.y + other.height / 2)) <= SNAP_THRESHOLD) {
              rawY = Math.round(other.y + other.height / 2 - el.height / 2);
              renderSnapGuideY(Math.round(other.y + other.height / 2));
              snappedY = true;
            }
          }
        }

        el.x = rawX;
        el.y = rawY;

        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) {
          domEl.style.left = `${el.x}px`;
          domEl.style.top = `${el.y}px`;
        }

        // Group Move: Sync delta offset to all other multi-selected elements (Feature #5)
        if (this.selectedElementIds.size > 1 && this.activeDrag.multiStartPositions) {
          const moveDeltaX = el.x - this.activeDrag.startItemX;
          const moveDeltaY = el.y - this.activeDrag.startItemY;

          page.elements.forEach((otherEl) => {
            if (otherEl.id !== el.id && this.selectedElementIds.has(otherEl.id)) {
              const orig = this.activeDrag.multiStartPositions[otherEl.id];
              if (orig) {
                otherEl.x = Math.round(orig.x + moveDeltaX);
                otherEl.y = Math.round(orig.y + moveDeltaY);
                const otherDom = this.container.querySelector(`[data-element-id="${otherEl.id}"]`);
                if (otherDom) {
                  otherDom.style.left = `${otherEl.x}px`;
                  otherDom.style.top = `${otherEl.y}px`;
                }
              }
            }
          });
        }
      } else if (this.activeDrag.type === 'resize') {
        const dx = (e.clientX - this.activeDrag.startX) / currentZoom;
        const dy = (e.clientY - this.activeDrag.startY) / currentZoom;
        const handle = this.activeDrag.handle;
        const { startW, startH, startItemX, startItemY } = this.activeDrag;

        let newW = startW;
        let newH = startH;
        let newX = startItemX;
        let newY = startItemY;

        // Proportional scaling for photos and stickers
        const isProportional = el.type === 'photo' || el.type === 'sticker';
        const aspect = startW / startH;

        if (handle === 'se') {
          newW = Math.max(40, Math.min(800, startW + dx));
          newH = isProportional ? Math.round(newW / aspect) : Math.max(30, Math.min(800, startH + dy));
        } else if (handle === 'sw') {
          newW = Math.max(40, Math.min(800, startW - dx));
          newH = isProportional ? Math.round(newW / aspect) : Math.max(30, Math.min(800, startH + dy));
          newX = startItemX + (startW - newW);
        } else if (handle === 'ne') {
          newW = Math.max(40, Math.min(800, startW + dx));
          newH = isProportional ? Math.round(newW / aspect) : Math.max(30, Math.min(800, startH - dy));
          newY = startItemY + (startH - newH);
        } else if (handle === 'nw') {
          newW = Math.max(40, Math.min(800, startW - dx));
          newH = isProportional ? Math.round(newW / aspect) : Math.max(30, Math.min(800, startH - dy));
          newX = startItemX + (startW - newW);
          newY = startItemY + (startH - newH);
        }

        el.width = Math.round(newW);
        el.height = Math.round(newH);
        el.x = Math.round(newX);
        el.y = Math.round(newY);

        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) {
          domEl.style.width = `${el.width}px`;
          domEl.style.height = `${el.height}px`;
          domEl.style.left = `${el.x}px`;
          domEl.style.top = `${el.y}px`;
        }
      } else if (this.activeDrag.type === 'rotate') {
        const board = this.container.querySelector('#scrapbookArtboard');
        const artboardRect = board ? board.getBoundingClientRect() : { left: 0, top: 0 };
        const centerScreenX = artboardRect.left + (el.x + el.width / 2) * currentZoom;
        const centerScreenY = artboardRect.top + (el.y + el.height / 2) * currentZoom;

        const rad = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
        let deg = Math.round((rad * 180) / Math.PI + 90);
        deg = ((deg % 360) + 360) % 360;
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }
        el.rotation = deg;

        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) {
          domEl.style.transform = `rotate(${el.rotation}deg)`;
        }
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.activeDrag) {
        this.activeDrag = null;
        clearSnapGuides();
        this._savePages();
      }
    });

    // Deselect element on clicking outside
    document.addEventListener('pointerdown', (e) => {
      if (!this.container.contains(e.target)) return;

      // Close floating tray when clicking empty canvas viewport
      if (
        e.target.closest('#scrapbookViewport') &&
        !e.target.closest('.canvas-element') &&
        !e.target.closest('#scrapbookFloatingDock') &&
        !e.target.closest('#scrapbookFloatingTray')
      ) {
        if (this.activeDockTab !== null) {
          this.activeDockTab = null;
          this.render();
        }
      }

      if (
        !e.target.closest('.canvas-element') &&
        !e.target.closest('#scrapbookFloatingTray') &&
        !e.target.closest('#scrapbookFloatingDock') &&
        !e.target.closest('.scrapbook-top-bar')
      ) {
        if (this.selectedElementId !== null) {
          clearSnapGuides();
          this._deselectAll();
        }
      }
    });

    // Global Keyboard Shortcuts Suite
    window.addEventListener('keydown', (e) => {
      // Don't intercept when user is actively editing text or input fields
      const isEditing = document.activeElement && (
        document.activeElement.isContentEditable ||
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
      );
      if (isEditing) return;

      // 0a. Cmd+Z / Ctrl+Z (without Shift) -> Undo
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this._undo();
        return;
      }

      // 0b. Cmd+Shift+Z / Ctrl+Shift+Z / Ctrl+Y -> Redo
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        this._redo();
        return;
      }

      if (!this.selectedElementId && this.selectedElementIds.size === 0) return;
      const page = this.getCurrentPage();
      const el = page.elements.find((item) => item.id === this.selectedElementId);

      // 1. Delete / Backspace -> Delete Element(s)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        this.deleteSelected();
        return;
      }

      // 2. Cmd+D / Ctrl+D -> Duplicate Element(s)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.duplicateSelected();
        return;
      }

      if (!el) return;

      // 3. Escape -> Deselect Element & Retract Tray
      if (e.key === 'Escape') {
        this.selectedElementId = null;
        this.activeDockTab = null;
        clearSnapGuides();
        this.render();
        return;
      }

      // 4. Bracket shortcuts -> Bring forward (]) / Send backward ([)
      if (e.key === ']' || (e.metaKey && e.key === ']')) {
        e.preventDefault();
        this.bringForwardSelected();
        return;
      }
      if (e.key === '[' || (e.metaKey && e.key === '[')) {
        e.preventDefault();
        this.sendBackwardSelected();
        return;
      }

      // 5. Arrow Keys -> Precision Nudge (1px or 10px with Shift)
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        el.x -= step;
        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) domEl.style.left = `${el.x}px`;
        this._savePages();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        el.x += step;
        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) domEl.style.left = `${el.x}px`;
        this._savePages();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        el.y -= step;
        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) domEl.style.top = `${el.y}px`;
        this._savePages();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        el.y += step;
        const domEl = this.container.querySelector(`[data-element-id="${el.id}"]`);
        if (domEl) domEl.style.top = `${el.y}px`;
        this._savePages();
      }
    });
  }

  _bindDynamicHandlers() {
    // Title input
    const titleInput = this.container.querySelector('#scrapbookPageTitle');
    titleInput?.addEventListener('input', (e) => {
      const page = this.getCurrentPage();
      page.title = e.target.value;
      this._savePages();
    });

    // Format selection
    this.container.querySelectorAll('[data-format]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = this.getCurrentPage();
        this.canvasFormat = btn.dataset.format;
        page.format = this.canvasFormat;
        this._savePages();
        this.render();
      });
    });

    // Page navigation (Feature #11 - Animated Page Transitions)
    this.container.querySelector('#btnPrevPage')?.addEventListener('click', () => {
      if (this.activePageIndex > 0) {
        this._switchPageWithAnimation(this.activePageIndex - 1, 'backward');
      }
    });

    this.container.querySelector('#btnNextPage')?.addEventListener('click', () => {
      if (this.activePageIndex < this.pages.length - 1) {
        this._switchPageWithAnimation(this.activePageIndex + 1, 'forward');
      }
    });

    this.container.querySelector('#btnAddPage')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addPage();
    });

    this.container.querySelector('#btnDeletePage')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deletePage();
    });

    // DEMO Showcase Call-to-Action Event Listeners
    this.container.querySelector('#btnCtaStartItinerary')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startFromItinerary();
    });

    this.container.querySelector('#btnCtaStartBlank')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startBlankTrip();
    });

    this.container.querySelector('#btnStartBuildingNow')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startFromItinerary();
    });

    this.container.querySelector('#btnRevisitDemo')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.loadDemoShowcase();
    });

    this.container.querySelector('#btnExportScrapbook')?.addEventListener('click', () => {
      document.body.classList.add('is-printing-scrapbook');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('is-printing-scrapbook');
      }, 1000);
    });

    // In-Canvas Zoom Controls
    this.container.querySelector('#btnZoomIn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZoom(this.zoomLevel + 0.1);
    });

    this.container.querySelector('#btnZoomOut')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZoom(this.zoomLevel - 0.1);
    });

    this.container.querySelector('#btnZoomReset')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZoom(1.0);
    });

    // Floating Bottom Dock Tool Buttons (Toggles drawer open or retracted)
    this.container.querySelectorAll('.floating-dock-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tab = btn.dataset.tab;
        this.activeDockTab = this.activeDockTab === tab ? null : tab;
        this.render();
      });
    });

    // Close Floating Drawer Tray (Retracts drawer)
    this.container.querySelector('#btnCloseFloatingTray')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.activeDockTab = null;
      this.render();
    });

    // Subcategory pill switching with smooth center scroll (for embellishments) & Search
    const subcatBar = this.container.querySelector('#subcatBar');
    const itemsGrid = this.container.querySelector('#embellishmentsItemsGrid');
    const stickerSearchInput = this.container.querySelector('#stickerSearchInput');

    const setupStickerGridObserver = () => {
      const sentinel = this.container.querySelector('.sticker-grid-sentinel');
      if (!sentinel || !itemsGrid) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const offset = parseInt(sentinel.dataset.offset || '0', 10);
            const allFiltered = this._getFilteredEmbellishments();
            const nextChunk = allFiltered.slice(offset, offset + 24);

            if (nextChunk.length > 0) {
              const fragment = document.createElement('div');
              fragment.innerHTML = nextChunk.map((item) => this._renderStickerCardItem(item)).join('');
              while (fragment.firstChild) {
                itemsGrid.insertBefore(fragment.firstChild, sentinel);
              }
              sentinel.dataset.offset = String(offset + nextChunk.length);
              bindStickerButtons();

              if (offset + nextChunk.length >= allFiltered.length) {
                observer.disconnect();
                sentinel.remove();
              }
            } else {
              observer.disconnect();
              sentinel.remove();
            }
          }
        });
      }, { root: itemsGrid, rootMargin: '120px' });

      observer.observe(sentinel);
    };

    const bindStickerButtons = () => {
      this.container.querySelectorAll('.embellishment-card-btn').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          this.addStickerElement(btn.dataset.templateId, btn.dataset.cat);
        };

        // Drag-and-drop start from tray to canvas (Feature #4)
        btn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('application/trailmate-sticker', JSON.stringify({
            templateId: btn.dataset.templateId,
            cat: btn.dataset.cat,
          }));
          e.dataTransfer.effectAllowed = 'copy';
        });
      });

      // Favorite toggle button click listener (Feature #12)
      this.container.querySelectorAll('.sticker-fav-btn').forEach((favBtn) => {
        favBtn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const favId = favBtn.dataset.favId;
          if (!favId) return;

          if (this._favoriteStickers.has(favId)) {
            this._favoriteStickers.delete(favId);
          } else {
            this._favoriteStickers.add(favId);
          }

          localStorage.setItem('trailmate_sticker_favorites', JSON.stringify([...this._favoriteStickers]));

          const isNowFav = this._favoriteStickers.has(favId);
          favBtn.classList.toggle('is-active', isNowFav);
          favBtn.title = isNowFav ? 'Remove from favorites' : 'Add to favorites';
          const iconSpan = favBtn.querySelector('.material-symbols-outlined');
          if (iconSpan) {
            iconSpan.textContent = isNowFav ? 'favorite' : 'favorite_border';
          }
          const parentBtn = favBtn.closest('.embellishment-card-wrapper')?.querySelector('.embellishment-card-btn');
          if (parentBtn) {
            parentBtn.classList.toggle('is-favorited', isNowFav);
          }

          // If currently in the favorites tab, refresh the grid to reflect changes
          if (this.activeEmbellishmentSubcat === 'favorites') {
            if (itemsGrid) {
              itemsGrid.innerHTML = this._renderEmbellishmentsGridItems();
              bindStickerButtons();
              bindClearSearchEvents();
              setupStickerGridObserver();
            }
          }
        };
      });
    };

    const bindClearSearchEvents = () => {
      this.container.querySelector('#btnClearStickerSearchInput')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stickerSearchQuery = '';
        this.render();
      });

      this.container.querySelector('#btnResetStickerSearch')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stickerSearchQuery = '';
        this.render();
      });

      this.container.querySelector('#btnQuickClearSearch')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stickerSearchQuery = '';
        this.render();
      });
    };

    // Debounced sticker search input (Feature #16)
    let searchDebounceTimer = null;
    if (stickerSearchInput) {
      stickerSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          this.stickerSearchQuery = e.target.value;
          const isSearching = !!this.stickerSearchQuery.trim();

          if (subcatBar) {
            if (isSearching) {
              subcatBar.classList.add('opacity-50');
              subcatBar.querySelectorAll('.subcat-pill-btn').forEach((b) => b.classList.remove('is-active'));
            } else {
              subcatBar.classList.remove('opacity-50');
              const currentPill = subcatBar.querySelector(`[data-subcat="${this.activeEmbellishmentSubcat}"]`);
              currentPill?.classList.add('is-active');
            }
          }

          if (itemsGrid) {
            itemsGrid.innerHTML = this._renderEmbellishmentsGridItems();
            bindStickerButtons();
            bindClearSearchEvents();
            setupStickerGridObserver();
          }
        }, 150);
      });
    }

    if (subcatBar) {
      // Auto-scroll active subcategory pill to the middle on initial load/render
      const initialActivePill = subcatBar.querySelector('.subcat-pill-btn.is-active');
      if (initialActivePill) {
        setTimeout(() => {
          initialActivePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 50);
      }

      subcatBar.querySelectorAll('.subcat-pill-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeEmbellishmentSubcat = btn.dataset.subcat;
          this.stickerSearchQuery = '';
          if (stickerSearchInput) stickerSearchInput.value = '';
          subcatBar.classList.remove('opacity-50');

          // Update active pill styling
          subcatBar.querySelectorAll('.subcat-pill-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          // Smoothly center the clicked category pill in the middle
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

          // Update grid items without reloading the whole workspace
          if (itemsGrid) {
            itemsGrid.innerHTML = this._renderEmbellishmentsGridItems();
            bindStickerButtons();
            bindClearSearchEvents();
            setupStickerGridObserver();
          }
        });
      });
    }

    bindStickerButtons();
    bindClearSearchEvents();
    setupStickerGridObserver();

    // User Photo Upload Dropzone (Cached in localStorage)
    const dropzone = this.container.querySelector('#photoDropzone');
    const fileInput = this.container.querySelector('#filePhotoInput');

    dropzone?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        const compressedSrc = await compressImage(file, 1200, 0.85);
        this.uploadedPhotos.unshift(compressedSrc);
        this._saveUploadedPhotos();
        this.addPhotoElement(compressedSrc);
      }
    });

    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragging');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('is-dragging');
    });

    dropzone?.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragging');
      const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
      for (const file of files) {
        const compressedSrc = await compressImage(file, 1200, 0.85);
        this.uploadedPhotos.unshift(compressedSrc);
        this._saveUploadedPhotos();
        this.addPhotoElement(compressedSrc);
      }
    });

    // Click photo in dock -> Add to canvas
    this.container.querySelectorAll('.dock-photo-item').forEach((item) => {
      item.addEventListener('click', () => {
        this.addPhotoElement(item.dataset.photoSrc);
      });
    });

    // Click ephemera in dock -> Add to canvas
    this.container.querySelectorAll('.btn-add-ephemera').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.addEphemeraElement(btn.dataset.ephemeraId);
      });
    });

    // Click route in dock -> Add to canvas
    this.container.querySelectorAll('.btn-add-route').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.addRouteElement(btn.dataset.badgeId);
      });
    });

    // Click text in dock -> Add to canvas
    this.container.querySelectorAll('.btn-add-text').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.addTextElement(btn.dataset.textType);
      });
    });

    // Drawer text color swatch selection (Targeted DOM Mutation - Feature #18)
    this.container.querySelectorAll('.drawer-color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const val = swatch.dataset.colorVal;
        const page = this.getCurrentPage();
        let targetEl = null;
        if (this.selectedElementId) {
          targetEl = page.elements.find((e) => e.id === this.selectedElementId && e.type === 'text');
        }
        if (!targetEl) {
          const textEls = page.elements.filter((e) => e.type === 'text');
          if (textEls.length > 0) {
            targetEl = textEls[textEls.length - 1];
            this.selectedElementId = targetEl.id;
          }
        }
        if (targetEl) {
          targetEl.color = val;
          this._savePages();
          const domEl = this.container.querySelector(`[data-element-id="${targetEl.id}"] .canvas-text-content`);
          if (domEl) domEl.style.color = val;
        }
      });
    });

    // Drawer Custom Color Picker Input
    const drawerColorInput = this.container.querySelector('#drawerCustomColorInput');
    drawerColorInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      const page = this.getCurrentPage();
      const targetEl = page.elements.find((el) => el.id === this.selectedElementId && el.type === 'text');
      if (targetEl) {
        targetEl.color = val;
        this._savePages();
        const domEl = this.container.querySelector(`[data-element-id="${targetEl.id}"] .canvas-text-content`);
        if (domEl) domEl.style.color = val;
      }
    });

    // Background paper selection (Targeted DOM Mutation - Feature #18)
    this.container.querySelectorAll('[data-bg-id]').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const page = this.getCurrentPage();
        page.background = swatch.dataset.bgId;
        this._savePages();

        const artboard = this.container.querySelector('#scrapbookArtboard');
        if (artboard) {
          const bgPreset = SCRAPBOOK_BACKGROUNDS.find((b) => b.id === page.background);
          if (bgPreset) {
            artboard.style.background = bgPreset.texture || bgPreset.color || '#FAF7F0';
          }
        }
        this.container.querySelectorAll('[data-bg-id]').forEach((s) => {
          s.classList.toggle('ring-2', s.dataset.bgId === page.background);
          s.classList.toggle('ring-secondary', s.dataset.bgId === page.background);
        });
      });
    });

    // Paper edge style selection (Targeted DOM Mutation - Feature #18)
    this.container.querySelectorAll('.btn-apply-edge').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = this.getCurrentPage();
        page.edgeStyle = btn.dataset.edgeId;
        this._savePages();

        const artboard = this.container.querySelector('#scrapbookArtboard');
        if (artboard) {
          artboard.classList.remove('edge-clean', 'edge-torn', 'edge-deckle', 'edge-burnt');
          artboard.classList.add(page.edgeStyle || 'edge-torn');
        }
        this.container.querySelectorAll('.btn-apply-edge').forEach((b) => {
          b.classList.toggle('bg-secondary', b.dataset.edgeId === page.edgeStyle);
          b.classList.toggle('text-white', b.dataset.edgeId === page.edgeStyle);
        });
      });
    });

    // Photo frame style application
    this.container.querySelectorAll('.btn-apply-frame').forEach((btn) => {
      btn.addEventListener('click', () => {
        const frameClass = btn.dataset.frameClass;
        this.defaultPhotoFrame = frameClass;

        const page = this.getCurrentPage();
        let targetPhoto = null;
        if (this.selectedElementId) {
          targetPhoto = page.elements.find((e) => e.id === this.selectedElementId && e.type === 'photo');
        }

        if (!targetPhoto) {
          const photos = page.elements.filter((e) => e.type === 'photo');
          if (photos.length > 0) {
            targetPhoto = photos[photos.length - 1];
            this.selectedElementId = targetPhoto.id;
          }
        }

        if (targetPhoto) {
          targetPhoto.frameStyle = frameClass;
        }
        this._savePages();
        this.render();
      });
    });

    // Canvas Element Pointer Down (Move / Select / In-Place Edit)
    this.container.querySelectorAll('.canvas-element').forEach((domEl) => {
      domEl.addEventListener('pointerdown', (e) => {
        // 1. Font Family Dropdown Toggle
        const fontToggle = e.target.closest('[data-text-action="toggle-font-menu"], .canvas-font-btn');
        if (fontToggle) {
          e.stopPropagation();
          const dropdown = domEl.querySelector('.canvas-font-dropdown');
          if (dropdown) {
            dropdown.classList.toggle('hidden');
          }
          return;
        }

        // 2. Font Family Option Click (Targeted DOM Mutation - Feature #18)
        const fontOpt = e.target.closest('.font-option-item');
        if (fontOpt) {
          e.stopPropagation();
          const page = this.getCurrentPage();
          const el = page.elements.find((item) => item.id === domEl.dataset.elementId);
          if (el) {
            el.fontFamily = fontOpt.dataset.fontVal;
            this._savePages();
            const textNode = domEl.querySelector('.canvas-text-content');
            if (textNode) textNode.style.fontFamily = el.fontFamily;
            const fontLabel = domEl.querySelector('.canvas-font-btn span:first-child');
            if (fontLabel) fontLabel.textContent = fontOpt.querySelector('span:first-child')?.textContent || 'Font';
            const dropdown = domEl.querySelector('.canvas-font-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
          }
          return;
        }

        // 3. Custom Color Picker in Floating Inspector
        const customColorInput = e.target.closest('.text-custom-color-input');
        if (customColorInput) {
          e.stopPropagation();
          customColorInput.oninput = (ce) => {
            const page = this.getCurrentPage();
            const el = page.elements.find((item) => item.id === domEl.dataset.elementId);
            if (el) {
              el.color = ce.target.value;
              this._savePages();
              const contentNode = domEl.querySelector('.canvas-text-content');
              if (contentNode) contentNode.style.color = el.color;
            }
          };
          return;
        }

        // 4. Quick Action Buttons (Targeted DOM Mutation - Feature #18)
        const toolBtn = e.target.closest('.canvas-tool-btn');
        if (toolBtn) {
          e.stopPropagation();
          const action = toolBtn.dataset.action;
          const textAction = toolBtn.dataset.textAction;
          const page = this.getCurrentPage();
          const el = page.elements.find((item) => item.id === domEl.dataset.elementId);

          if (action === 'rotate-ccw' && el) {
            el.rotation = ((el.rotation || 0) - 15 + 360) % 360;
            this._savePages();
            domEl.style.transform = `rotate(${el.rotation}deg)`;
            return;
          }
          if (action === 'rotate-cw' && el) {
            el.rotation = ((el.rotation || 0) + 15) % 360;
            this._savePages();
            domEl.style.transform = `rotate(${el.rotation}deg)`;
            return;
          }
          if (action === 'duplicate') this.duplicateSelected();
          else if (action === 'delete') this.deleteSelected();
          else if (action === 'bring-forward') this.bringForwardSelected();
          else if (action === 'send-backward') this.sendBackwardSelected();
          else if (textAction === 'inc-size' && el) {
            el.fontSize = Math.min(72, (el.fontSize || 18) + 2);
            this._savePages();
            const textNode = domEl.querySelector('.canvas-text-content');
            if (textNode) textNode.style.fontSize = `${el.fontSize}px`;
          } else if (textAction === 'dec-size' && el) {
            el.fontSize = Math.max(10, (el.fontSize || 18) - 2);
            this._savePages();
            const textNode = domEl.querySelector('.canvas-text-content');
            if (textNode) textNode.style.fontSize = `${el.fontSize}px`;
          } else if (textAction === 'toggle-bold' && el) {
            el.bold = !el.bold;
            this._savePages();
            const textNode = domEl.querySelector('.canvas-text-content');
            if (textNode) textNode.style.fontWeight = el.bold ? 'bold' : 'normal';
            toolBtn.classList.toggle('text-secondary', el.bold);
            toolBtn.classList.toggle('bg-black/5', el.bold);
          } else if (textAction === 'toggle-italic' && el) {
            el.italic = !el.italic;
            this._savePages();
            const textNode = domEl.querySelector('.canvas-text-content');
            if (textNode) textNode.style.fontStyle = el.italic ? 'italic' : 'normal';
            toolBtn.classList.toggle('text-secondary', el.italic);
            toolBtn.classList.toggle('bg-black/5', el.italic);
          }
          return;
        }

        // 5. Color Swatch Picker for Text (Targeted DOM Mutation - Feature #18)
        const colorSwatch = e.target.closest('.color-swatch-dot');
        if (colorSwatch) {
          e.stopPropagation();
          const page = this.getCurrentPage();
          const el = page.elements.find((item) => item.id === domEl.dataset.elementId);
          if (el) {
            el.color = colorSwatch.dataset.colorVal;
            this._savePages();
            const textNode = domEl.querySelector('.canvas-text-content');
            if (textNode) textNode.style.color = el.color;
          }
          return;
        }

        // 6. Stop drag if clicking anywhere in floating toolbar bars
        if (e.target.closest('.text-inspector-bar, .canvas-selection-toolbar')) {
          e.stopPropagation();
          return;
        }

        // Resize Handles
        const resizeHandle = e.target.closest('.canvas-resize-handle');
        if (resizeHandle) {
          e.stopPropagation();
          const id = domEl.dataset.elementId;
          const page = this.getCurrentPage();
          const el = page.elements.find((item) => item.id === id);
          if (!el) return;

          this._pushUndo();
          this._selectElement(id);
          this.activeDrag = {
            type: 'resize',
            elementId: id,
            handle: resizeHandle.dataset.handle,
            startX: e.clientX,
            startY: e.clientY,
            startW: el.width,
            startH: el.height,
            startItemX: el.x,
            startItemY: el.y,
          };
          return;
        }

        // Rotate Handle
        const rotateHandle = e.target.closest('.canvas-rotate-handle');
        if (rotateHandle) {
          e.stopPropagation();
          e.preventDefault();
          const id = domEl.dataset.elementId;
          const page = this.getCurrentPage();
          const el = page.elements.find((item) => item.id === id);
          if (!el) return;

          this._pushUndo();
          this._selectElement(id);
          this.activeDrag = {
            type: 'rotate',
            elementId: id,
          };
          return;
        }

        // Move Drag (Works for Text, Photos, Stickers, Ephemera, Badges)
        e.stopPropagation();
        const id = domEl.dataset.elementId;
        const page = this.getCurrentPage();
        const el = page.elements.find((item) => item.id === id);
        if (!el) return;

        // Shift+Click Multi-Select Handling (Feature #5)
        if (e.shiftKey) {
          if (this.selectedElementIds.has(id)) {
            this.selectedElementIds.delete(id);
            domEl.classList.remove('is-selected', 'is-multi-selected');
          } else {
            if (this.selectedElementId && !this.selectedElementIds.has(this.selectedElementId)) {
              this.selectedElementIds.add(this.selectedElementId);
              const prevSelected = this.container.querySelector(`[data-element-id="${this.selectedElementId}"]`);
              prevSelected?.classList.add('is-selected', 'is-multi-selected');
            }
            this.selectedElementIds.add(id);
            domEl.classList.add('is-selected', 'is-multi-selected');
          }
          this.selectedElementId = id;
          this._updateMultiSelectToolbar();
          return;
        }

        // Normal Click: If previously in multi-selection, clear it
        if (this.selectedElementIds.size > 0 && !this.selectedElementIds.has(id)) {
          this.selectedElementIds.clear();
          this._updateMultiSelectToolbar();
        }

        this._pushUndo();
        this._selectElement(id);

        // Record initial positions of all multi-selected items for group translate
        const multiPositions = {};
        if (this.selectedElementIds.size > 1) {
          page.elements.forEach((item) => {
            if (this.selectedElementIds.has(item.id)) {
              multiPositions[item.id] = { x: item.x, y: item.y };
            }
          });
        }

        this.activeDrag = {
          type: 'move',
          elementId: id,
          startX: e.clientX,
          startY: e.clientY,
          startItemX: el.x,
          startItemY: el.y,
          multiStartPositions: multiPositions,
        };
      });

      // Long-Press Context Menu for Touch/Mobile (Feature #8)
      let longPressTimer = null;
      let touchStartX = 0;
      let touchStartY = 0;

      domEl.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        longPressTimer = setTimeout(() => {
          if (this.activeDrag) return;
          const id = domEl.dataset.elementId;
          this._selectElement(id);
          this._showLongPressMenu(touch.clientX, touch.clientY, id);
        }, 500);
      }, { passive: true });

      domEl.addEventListener('touchmove', (e) => {
        if (!longPressTimer) return;
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);
        if (dx > 8 || dy > 8) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      domEl.addEventListener('touchend', () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      // Text & Ephemera field editing and real-time autosave (Suggestion #28)
      domEl.querySelectorAll('[contenteditable="true"]').forEach((editor) => {
        const syncContent = () => {
          const id = domEl.dataset.elementId;
          const page = this.getCurrentPage();
          const el = page.elements.find((item) => item.id === id);
          if (el) {
            if (el.type === 'text') {
              el.content = editor.innerText;
            } else {
              // Autosave customized ephemera ticket or route badge inner content
              const cardContainer = domEl.querySelector('[class*="ephemera-"], [class*="badge-"]');
              if (cardContainer) {
                el.customInnerHtml = cardContainer.outerHTML;
              }
            }
            this._savePages();
          }
        };
        editor.addEventListener('input', syncContent);
        editor.addEventListener('blur', syncContent);
      });
    });

    // Keyboard-Accessible Sticker Grid Navigation (Suggestion #31)
    if (itemsGrid) {
      itemsGrid.onkeydown = (e) => {
        const btns = Array.from(itemsGrid.querySelectorAll('.embellishment-card-btn'));
        const activeIdx = btns.indexOf(document.activeElement);
        if (activeIdx === -1) return;

        const COLS = 3;
        let targetIdx = -1;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          targetIdx = activeIdx + 1 < btns.length ? activeIdx + 1 : 0;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          targetIdx = activeIdx - 1 >= 0 ? activeIdx - 1 : btns.length - 1;
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          targetIdx = activeIdx + COLS < btns.length ? activeIdx + COLS : activeIdx;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          targetIdx = activeIdx - COLS >= 0 ? activeIdx - COLS : activeIdx;
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btns[activeIdx].click();
          return;
        }

        if (targetIdx >= 0 && btns[targetIdx]) {
          btns[targetIdx].focus();
        }
      };
    }

    // Dismiss font dropdowns on clicking outside
    if (!this._hasFontDismissListener) {
      document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.font-picker-wrapper')) {
          this.container?.querySelectorAll('.canvas-font-dropdown').forEach((menu) => {
            menu.classList.add('hidden');
          });
        }
      });
      this._hasFontDismissListener = true;
    }
  }
}

/**
 * Offscreen canvas client-side image compression helper to stay well within localStorage limits.
 */
function compressImage(file, maxDimension = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
