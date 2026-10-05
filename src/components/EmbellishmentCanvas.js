// src/components/EmbellishmentCanvas.js
// ─────────────────────────────────────────────────────────────────────────────
// Interactive Canvas Overlay for Placed Embellishments (Washi tape, Botanicals,
// Fasteners, Handwritten Marks) on top of the Journal/Itinerary panel.
//
// Interactions supported (v1 scope):
//   - Drag to reposition freely across the journal page
//   - Rotate & resize via corner handle
//   - Delete individual embellishment via '✕' handle
//   - Deselect on click outside
// ─────────────────────────────────────────────────────────────────────────────

import { EMBELLISHMENTS } from './EmbellishmentsData.js';

export class EmbellishmentCanvas {
  constructor({ containerSelector = '#itineraryBody', onUpdate } = {}) {
    this.container = document.querySelector(containerSelector);
    this.onUpdate = onUpdate;
    this.items = [];
    this.selectedId = null;

    this.activeDrag = null; // { type: 'move' | 'transform', itemId, startX, startY, startItemX, startItemY, startW, startH, startRot }

    this._initOverlay();
    this._loadSavedItems();
    this._bindEvents();
  }

  _initOverlay() {
    if (!this.container) return;

    // Ensure relative container positioning
    const computedPos = window.getComputedStyle(this.container).position;
    if (computedPos === 'static') {
      this.container.style.position = 'relative';
    }

    // Check if layer already exists
    let layer = this.container.querySelector('.embellishment-canvas-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'embellishment-canvas-layer';
      layer.id = 'embellishmentCanvasLayer';
      this.container.appendChild(layer);
    }
    this.layer = layer;
  }

  _loadSavedItems() {
    try {
      const saved = localStorage.getItem('trailmate_scrapbook_items');
      if (saved) {
        this.items = JSON.parse(saved);
        this.render();
      }
    } catch {
      this.items = [];
    }
  }

  _saveItems() {
    try {
      localStorage.setItem('trailmate_scrapbook_items', JSON.stringify(this.items));
      if (typeof this.onUpdate === 'function') {
        this.onUpdate(this.items);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Places a new embellishment template onto the canvas at a sensible position.
   * @param {string} templateId - ID from EMBELLISHMENTS catalog
   * @param {string} category - 'tape' | 'botanicals' | 'fasteners' | 'marks'
   */
  placeEmbellishment(templateId, category) {
    const catList = EMBELLISHMENTS[category] || [];
    const template = catList.find((item) => item.id === templateId);
    if (!template) return;

    // Stagger position slightly based on existing items count
    const count = this.items.length;
    const scrollY = this.container ? this.container.scrollTop : 0;
    const spawnX = 60 + ((count * 25) % 180);
    const spawnY = 80 + scrollY + ((count * 30) % 220);

    const newItem = {
      id: `emb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      templateId: template.id,
      category: template.category,
      x: spawnX,
      y: spawnY,
      width: template.width,
      height: template.height,
      rotation: 0,
    };

    this.items.push(newItem);
    this.selectedId = newItem.id;
    this.render();
    this._saveItems();
  }

  deleteItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    if (this.selectedId === id) this.selectedId = null;
    this.render();
    this._saveItems();
  }

  clearAll() {
    this.items = [];
    this.selectedId = null;
    this.render();
    this._saveItems();
  }

  render() {
    if (!this.layer) {
      this._initOverlay();
      if (!this.layer) return;
    }

    this.layer.innerHTML = '';

    this.items.forEach((item) => {
      const catList = EMBELLISHMENTS[item.category] || [];
      const template = catList.find((t) => t.id === item.templateId);
      if (!template) return;

      const isSelected = item.id === this.selectedId;

      const el = document.createElement('div');
      el.className = `scrapbook-placed-item ${isSelected ? 'is-selected' : ''}`;
      el.dataset.itemId = item.id;
      el.style.left = `${item.x}px`;
      el.style.top = `${item.y}px`;
      el.style.width = `${item.width}px`;
      el.style.height = `${item.height}px`;
      el.style.transform = `rotate(${item.rotation}deg)`;

      el.innerHTML = `
        <div class="w-full h-full pointer-events-none select-none">
          ${template.svg}
        </div>
        <div class="embellishment-controls">
          <button type="button" class="embellishment-handle-delete" data-action="delete" title="Remove Sticker">✕</button>
          <div class="embellishment-handle-transform" data-action="transform" title="Drag to Resize & Rotate">⤡</div>
        </div>
      `;

      this.layer.appendChild(el);
    });
  }

  _bindEvents() {
    if (!this.layer) return;

    // Pointer Down
    this.layer.addEventListener('pointerdown', (e) => {
      const deleteBtn = e.target.closest('.embellishment-handle-delete');
      if (deleteBtn) {
        e.stopPropagation();
        e.preventDefault();
        const itemEl = deleteBtn.closest('.scrapbook-placed-item');
        if (itemEl) this.deleteItem(itemEl.dataset.itemId);
        return;
      }

      const transformHandle = e.target.closest('.embellishment-handle-transform');
      if (transformHandle) {
        e.stopPropagation();
        e.preventDefault();
        const itemEl = transformHandle.closest('.scrapbook-placed-item');
        const id = itemEl.dataset.itemId;
        const item = this.items.find((i) => i.id === id);
        if (!item) return;

        this.selectedId = id;
        this.activeDrag = {
          type: 'transform',
          itemId: id,
          startX: e.clientX,
          startY: e.clientY,
          startW: item.width,
          startH: item.height,
          startRot: item.rotation,
          centerX: item.x + item.width / 2,
          centerY: item.y + item.height / 2,
        };
        this.render();
        return;
      }

      const placedEl = e.target.closest('.scrapbook-placed-item');
      if (placedEl) {
        e.stopPropagation();
        const id = placedEl.dataset.itemId;
        const item = this.items.find((i) => i.id === id);
        if (!item) return;

        this.selectedId = id;
        this.activeDrag = {
          type: 'move',
          itemId: id,
          startX: e.clientX,
          startY: e.clientY,
          startItemX: item.x,
          startItemY: item.y,
        };
        this.render();
      }
    });

    // Global Pointer Move
    window.addEventListener('pointermove', (e) => {
      if (!this.activeDrag) return;

      const item = this.items.find((i) => i.id === this.activeDrag.itemId);
      if (!item) return;

      if (this.activeDrag.type === 'move') {
        const dx = e.clientX - this.activeDrag.startX;
        const dy = e.clientY - this.activeDrag.startY;
        item.x = Math.max(0, Math.round(this.activeDrag.startItemX + dx));
        item.y = Math.max(0, Math.round(this.activeDrag.startItemY + dy));

        const el = this.layer.querySelector(`[data-item-id="${item.id}"]`);
        if (el) {
          el.style.left = `${item.x}px`;
          el.style.top = `${item.y}px`;
        }
      } else if (this.activeDrag.type === 'transform') {
        const dx = e.clientX - this.activeDrag.startX;
        const scaleFactor = Math.max(0.4, 1 + dx / 150);
        const newW = Math.round(this.activeDrag.startW * scaleFactor);
        const newH = Math.round(this.activeDrag.startH * scaleFactor);

        // Calculate rotation delta based on pointer angle
        const dy = e.clientY - this.activeDrag.startY;
        const angleDeg = Math.round((dx - dy) * 0.15) % 360;
        const newRot = (this.activeDrag.startRot + angleDeg) % 360;

        item.width = Math.min(300, Math.max(30, newW));
        item.height = Math.min(300, Math.max(20, newH));
        item.rotation = newRot;

        const el = this.layer.querySelector(`[data-item-id="${item.id}"]`);
        if (el) {
          el.style.width = `${item.width}px`;
          el.style.height = `${item.height}px`;
          el.style.transform = `rotate(${item.rotation}deg)`;
        }
      }
    });

    // Global Pointer Up
    window.addEventListener('pointerup', () => {
      if (this.activeDrag) {
        this.activeDrag = null;
        this._saveItems();
        this.render();
      }
    });

    // Deselect on click outside canvas elements
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.scrapbook-placed-item') && !e.target.closest('.scrapbook-studio-drawer') && !e.target.closest('#btnOpenScrapbookStudio')) {
        if (this.selectedId !== null) {
          this.selectedId = null;
          this.render();
        }
      }
    });
  }
}
