/**
 * Sidebar.js — Left Navigation Sidebar Component
 */

export class Sidebar {
  constructor({ sidebarId = 'sidebar', onNewTrip, onNavChange } = {}) {
    this.el = document.getElementById(sidebarId);
    if (!this.el) return;

    this.onNewTrip = onNewTrip;
    this.onNavChange = onNavChange;

    this._bindNewTrip();
    this._bindNav();
  }

  _bindNewTrip() {
    const btn = this.el.querySelector('#btnNewTrip');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (typeof this.onNewTrip === 'function') this.onNewTrip();
    });
  }

  _bindNav() {
    const items = this.el.querySelectorAll('.sidebar-nav-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.setActiveView(view);
        if (typeof this.onNavChange === 'function') this.onNavChange(view);
      });
    });
  }

  setActiveView(viewName) {
    const items = this.el.querySelectorAll('.sidebar-nav-item');
    items.forEach(item => {
      const active = item.dataset.view === viewName;
      if (active) {
        item.className = 'sidebar-nav-item flex items-center gap-4 bg-secondary text-on-secondary rounded-lg px-4 py-3 scale-100 active:scale-95 transition-transform';
        item.setAttribute('aria-current', 'page');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('material-fill');
      } else {
        item.className = 'sidebar-nav-item flex items-center gap-4 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg scale-100 active:scale-95 transition-transform';
        item.removeAttribute('aria-current');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.remove('material-fill');
      }
    });
  }
}
