/**
 * ChatInput.js — Sticky bottom input bar component.
 *
 * Handles:
 *   - Auto-growing textarea (up to maxHeight)
 *   - Send on Enter (Shift+Enter = newline)
 *   - Disabled state while bot is loading
 *   - onSend callback with the trimmed text
 *   - Focus management (re-focus after sending)
 */

import { store } from '../store/state.js';

export class ChatInput {
  /**
   * @param {object} options
   * @param {string}   options.formId       - ID of the <form> element
   * @param {string}   options.inputId      - ID of the <textarea>
   * @param {string}   options.sendBtnId    - ID of the submit button
   * @param {Function} options.onSend       - Called with (text: string) when submitted
   * @param {number}   [options.maxHeight]  - Max textarea height in px (default: 140)
   */
  constructor({
    formId    = 'chatForm',
    inputId   = 'chatInput',
    sendBtnId = 'btnSend',
    onSend,
    maxHeight = 140,
  } = {}) {
    this.form     = document.getElementById(formId);
    this.input    = document.getElementById(inputId);
    this.sendBtn  = document.getElementById(sendBtnId);
    this.onSend   = onSend;
    this.maxHeight = maxHeight;

    if (!this.form || !this.input) {
      console.warn('[ChatInput] Required elements not found.');
      return;
    }

    this._bind();

    // Disable input while the bot is responding
    store.subscribe('isLoading', (loading) => {
      this._setDisabled(loading);
    });
  }

  /* ── Public API ─────────────────────────────────────────────────────── */

  focus() {
    this.input?.focus();
  }

  clear() {
    if (!this.input) return;
    this.input.value = '';
    this._resize();
  }

  /* ── Private methods ─────────────────────────────────────────────────── */

  _bind() {
    // Auto-grow textarea on input
    this.input.addEventListener('input', () => this._resize());

    // Enter → submit, Shift+Enter → newline
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._submit();
      }
    });

    // Form submit (send button click or Enter)
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._submit();
    });
  }

  _submit() {
    const text = this.input?.value.trim();
    if (!text) return;

    if (typeof this.onSend === 'function') {
      this.onSend(text);
    }

    this.clear();
    this.focus();
  }

  _resize() {
    if (!this.input) return;
    this.input.style.height = 'auto';
    this.input.style.height = Math.min(this.input.scrollHeight, this.maxHeight) + 'px';
  }

  _setDisabled(disabled) {
    if (this.input)   this.input.disabled = disabled;
    if (this.sendBtn) this.sendBtn.disabled = disabled;

    if (disabled) {
      this.input?.setAttribute('aria-busy', 'true');
      this.input?.setAttribute('placeholder', 'Trailmate is thinking…');
    } else {
      this.input?.removeAttribute('aria-busy');
      this.input?.setAttribute('placeholder', 'Ask about places to eat, things to do…');
      this.focus();
    }
  }
}
