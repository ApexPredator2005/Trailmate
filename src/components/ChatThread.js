/**
 * ChatThread.js — Scrollable message feed component.
 *
 * Subscribes to the store's `messages` array and incrementally
 * renders new messages using MessageBubble. Handles:
 *   - Smooth auto-scroll to the latest message
 *   - Typing indicator (show/hide)
 *   - Chip selection → dispatches to conversation engine
 *   - Card selection → dispatches to conversation engine
 */

import { store } from '../store/state.js';
import { buildMessageElement } from './MessageBubble.js';

export class ChatThread {
  /**
   * @param {object} options
   * @param {string}   options.threadId            - ID of the scrollable thread container
   * @param {Function} [options.onDestinationSelect] - (dest, rowEl) => void
   * @param {Function} [options.onChipSelect]       - (chip, rowEl) => void
   * @param {Function} [options.onCardSelect]       - (card, cardEl) => void
   */
  constructor({ threadId = 'chatThread', onDestinationSelect, onChipSelect, onCardSelect } = {}) {
    this.el = document.getElementById(threadId);
    if (!this.el) {
      console.warn('[ChatThread] Element not found:', threadId);
      return;
    }

    this.onDestinationSelect = onDestinationSelect;
    this.onChipSelect = onChipSelect;
    this.onCardSelect = onCardSelect;

    /** Track which message IDs are already rendered */
    this._renderedIds = new Set();

    /** The current typing indicator row, if visible */
    this._typingEl = null;

    // Render any messages already in the store (e.g. from a previous session
    // or pre-seeded demo content)
    this._renderAll(store.getState().messages);

    // Subscribe: only new messages trigger incremental renders
    store.subscribe('messages', (messages) => {
      this._renderIncremental(messages);
    });

    // Subscribe: show/hide typing indicator based on isLoading
    store.subscribe('isLoading', (loading) => {
      loading ? this._showTyping() : this._hideTyping();
    });

    // Auto-scroll when content inside the thread resizes (images load, cards render, text expands)
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        const threshold = 250;
        const isNearBottom = this.el.scrollHeight - this.el.scrollTop - this.el.clientHeight < threshold;
        if (isNearBottom) {
          this.el.scrollTop = this.el.scrollHeight;
        }
      });
      this._resizeObserver.observe(this.el);
    }
  }

  /* ── Public API ─────────────────────────────────────────────────────── */

  /** Programmatically scroll to the bottom of the thread */
  scrollToBottom(smooth = true) {
    if (!this.el) return;

    const performScroll = (isSmooth = smooth) => {
      if (!this.el) return;
      const last = this.el.lastElementChild;
      if (last && typeof last.scrollIntoView === 'function') {
        try {
          last.scrollIntoView({ behavior: isSmooth ? 'smooth' : 'auto', block: 'end' });
        } catch {
          this.el.scrollTop = this.el.scrollHeight;
        }
      } else {
        this.el.scrollTop = this.el.scrollHeight;
      }
    };

    performScroll(smooth);
    requestAnimationFrame(() => performScroll(false));
    setTimeout(() => performScroll(smooth), 60);
    setTimeout(() => performScroll(false), 200);
    setTimeout(() => performScroll(false), 450);
  }

  /** Remove all rendered messages and reset tracked IDs */
  clear() {
    this.el.innerHTML = '';
    this._renderedIds.clear();
    this._typingEl = null;
  }

  /* ── Private methods ─────────────────────────────────────────────────── */

  /** Render every message in the array (initial paint) */
  _renderAll(messages) {
    messages.forEach(msg => this._renderOne(msg));
    this.scrollToBottom(false);
  }

  /**
   * Compare store messages to already-rendered IDs,
   * append only the new ones or re-render if array replaced.
   */
  _renderIncremental(messages) {
    if (!messages || messages.length === 0) {
      this.clear();
      return;
    }

    const currentRendered = Array.from(this._renderedIds);
    const isDifferent = currentRendered.some(id => !messages.some(m => m.id === id));

    if (isDifferent) {
      this.clear();
      this._renderAll(messages);
      return;
    }

    const newMessages = messages.filter(m => !this._renderedIds.has(m.id));
    newMessages.forEach(msg => this._renderOne(msg));

    if (newMessages.length > 0) {
      this.scrollToBottom(true);
    }
  }

  /** Build and insert one message element, then mark it as rendered */
  _renderOne(message) {
    const el = buildMessageElement(message, {
      onDestinationSelect: (dest, rowEl) => {
        if (typeof this.onDestinationSelect === 'function') {
          this.onDestinationSelect(dest, rowEl);
        }
      },
      onChipSelect: (chip, rowEl) => {
        if (typeof this.onChipSelect === 'function') {
          this.onChipSelect(chip, rowEl);
        }
      },
      onCardSelect: (card, cardEl) => {
        if (typeof this.onCardSelect === 'function') {
          this.onCardSelect(card, cardEl);
        }
      },
    });

    el.dataset.msgId = message.id;

    // Attach load listener to images inside this message to keep scrolled to bottom
    el.querySelectorAll('img').forEach((img) => {
      img.addEventListener('load', () => {
        this.scrollToBottom(false);
      }, { once: true });
    });

    // Insert before the typing indicator if it's visible
    if (this._typingEl && this._typingEl.parentNode === this.el) {
      this.el.insertBefore(el, this._typingEl);
    } else {
      this.el.appendChild(el);
    }

    this._renderedIds.add(message.id);
  }

  /** Add an animated typing indicator at the bottom of the thread */
  _showTyping() {
    if (this._typingEl) return; // already shown

    const el = buildMessageElement({ role: 'typing', id: '__typing__', ts: Date.now() });
    this.el.appendChild(el);
    this._typingEl = el;
    this.scrollToBottom(true);
  }

  /** Remove the typing indicator */
  _hideTyping() {
    if (this._typingEl) {
      this._typingEl.remove();
      this._typingEl = null;
    }
  }
}
