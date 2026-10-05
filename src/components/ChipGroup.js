/**
 * ChipGroup.js — Renders pill-shaped quick reply and multi-select chips.
 */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ChipGroup {
  constructor({
    chips = [],
    multiSelect = false,
    label = 'Options',
    submitLabel = 'Click when done',
    onSelect,
    onChange,
  } = {}) {
    this.chips = chips;
    this.multiSelect = multiSelect;
    this.label = label;
    this.submitLabel = submitLabel;
    this.onSelect = onSelect;
    this.onChange = onChange;
    this.selected = new Set();
    this.disabled = false;
    this.el = this._build();
  }

  disable() {
    this.disabled = true;
    this.el.querySelectorAll('button').forEach((b) => {
      b.disabled = true;
      b.classList.remove('hover:bg-surface-container', 'hover:scale-102', 'active:scale-98', 'cursor-pointer');
      b.classList.add('cursor-default', 'pointer-events-none');
    });

    const submitBtn = this.el.querySelector('[data-is-submit="true"]');
    if (submitBtn) {
      submitBtn.classList.remove('bg-secondary', 'cursor-pointer', 'active:scale-95', 'hover:bg-secondary/90', 'disabled:opacity-50');
      submitBtn.classList.add('bg-[#1E3A34]', 'text-white', 'cursor-default');
      const count = this.selected.size;
      submitBtn.innerHTML = `<span>✓ Confirmed (${count} selection${count > 1 ? 's' : ''})</span> <span class="material-symbols-outlined text-sm">check_circle</span>`;
    }
  }

  _build() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-2 py-1 w-full max-w-2xl';

    const group = document.createElement('div');
    group.className = 'flex flex-wrap gap-2 items-center';
    group.setAttribute('role', this.multiSelect ? 'group' : 'radiogroup');
    group.setAttribute('aria-label', this.label);

    let submitBtn = null;
    let submitWrapper = null;

    if (this.multiSelect) {
      submitWrapper = document.createElement('div');
      submitWrapper.className = 'flex items-center gap-2 mt-1';

      submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.dataset.isSubmit = 'true';
      submitBtn.className = 'px-4 py-2 bg-secondary text-on-secondary rounded-full font-label-md text-xs font-bold hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
      submitBtn.innerHTML = `<span>${esc(this.submitLabel)}</span> <span class="material-symbols-outlined text-sm">lock_clock</span>`;
      submitBtn.disabled = true;

      submitBtn.addEventListener('click', () => {
        if (this.disabled || this.selected.size === 0) return;
        this.disable();
        if (typeof this.onSelect === 'function') {
          this.onSelect([...this.selected]);
        }
      });

      submitWrapper.appendChild(submitBtn);
    }

    const updateSubmitBtn = () => {
      if (!submitBtn) return;
      const count = this.selected.size;
      submitBtn.disabled = count === 0;
      if (count > 0) {
        submitBtn.innerHTML = `<span>${esc(this.submitLabel)} (${count})</span> <span class="material-symbols-outlined text-sm">check_circle</span>`;
      } else {
        submitBtn.innerHTML = `<span>${esc(this.submitLabel)}</span> <span class="material-symbols-outlined text-sm">lock_clock</span>`;
      }
    };

    this.chips.forEach((chip) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip transition-all';
      btn.dataset.value = chip.value ?? chip.label;
      btn.setAttribute('role', this.multiSelect ? 'checkbox' : 'radio');
      btn.setAttribute('aria-checked', 'false');

      const isSkip = chip.value && String(chip.value).startsWith('__skip');
      if (isSkip) {
        btn.classList.add('opacity-85', 'border-dashed');
      }

      const emojiSpan = chip.emoji ? `<span class="mr-1.5">${esc(chip.emoji)}</span>` : '';
      btn.innerHTML = `${emojiSpan}<span>${esc(chip.label)}</span>`;

      btn.addEventListener('click', () => {
        if (this.disabled) return;

        // Skip chip directly triggers selection
        if (isSkip) {
          this.disable();
          if (typeof this.onSelect === 'function') {
            this.onSelect(chip);
          }
          return;
        }

        if (this.multiSelect) {
          const isChecked = btn.getAttribute('aria-checked') === 'true';
          const next = !isChecked;
          btn.setAttribute('aria-checked', String(next));
          btn.classList.toggle('is-selected', next);

          if (next) this.selected.add(chip);
          else this.selected.delete(chip);

          updateSubmitBtn();

          if (typeof this.onChange === 'function') {
            this.onChange([...this.selected]);
          }
        } else {
          group.querySelectorAll('button').forEach((b) => {
            b.setAttribute('aria-checked', 'false');
            b.classList.remove('is-selected');
          });

          btn.setAttribute('aria-checked', 'true');
          btn.classList.add('is-selected');

          if (typeof this.onSelect === 'function') {
            this.onSelect(chip);
          }
        }
      });

      group.appendChild(btn);
    });

    container.appendChild(group);
    if (submitWrapper) {
      container.appendChild(submitWrapper);
      updateSubmitBtn();
    }

    return container;
  }
}
