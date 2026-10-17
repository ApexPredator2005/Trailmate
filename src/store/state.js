/**
 * Trailmate Reactive State Store
 *
 * A minimal pub/sub store that holds the entire app state.
 * Components subscribe to specific keys and are notified when they change.
 *
 * Usage:
 *   import { store } from './store/state.js';
 *
 *   // Read
 *   const msgs = store.getState().messages;
 *
 *   // Write (merges partial state, fires subscribers)
 *   store.setState({ isLoading: true });
 *
 *   // Subscribe to a key
 *   const unsub = store.subscribe('messages', (newVal) => { ... });
 *   unsub(); // cleanup
 */

/** @typedef {'WELCOME'|'PARSING'|'CLARIFYING'|'PREFERENCE_GATE'|'FLIGHT_PREFS'|'FLIGHT_SEARCH'|'FLIGHT_SELECTED'|'HOTEL_PREFS'|'HOTEL_SEARCH'|'HOTEL_SELECTED'|'PLACES_SELECT'|'RESTAURANTS_SELECT'|'COMPOSING'|'DONE'} Stage */

/**
 * @typedef {object} Message
 * @property {string}  id        - Unique ID (timestamp + random)
 * @property {'bot'|'user'|'chips'|'cards'} role
 * @property {string}  [text]    - Markdown-safe text (bot/user)
 * @property {Array}   [chips]   - Chip option objects { label, value }
 * @property {Array}   [cards]   - Card data objects
 * @property {number}  ts        - Unix timestamp
 */

/**
 * @typedef {object} TripState
 * @property {string}   [destination]
 * @property {string}   [homeCity]
 * @property {number}   [duration]         - Days
 * @property {string}   [startDate]
 * @property {number}   [travelers]
 * @property {string}   [budgetTier]       - 'budget'|'moderate'|'luxury'
 * @property {string[]} [interests]
 * @property {object}   [selectedFlight]
 * @property {object}   [selectedHotel]
 * @property {object[]} [selectedPlaces]
 * @property {object[]} [selectedRestaurants]
 */

/**
 * @typedef {object} AppState
 * @property {Message[]} messages
 * @property {Stage}     stage
 * @property {TripState} trip
 * @property {boolean}   isLoading
 * @property {object|null} itinerary      - Final composed itinerary (Step 16)
 * @property {string|null} error
 */

/** @type {AppState} */
const INITIAL_STATE = {
  messages: [],
  stage: 'WELCOME',
  trip: {},
  isLoading: false,
  itinerary: null,
  error: null,
};

export function isDeepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }
  return true;
}

function loadStoredSession() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('trailmate_active_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          return {
            ...INITIAL_STATE,
            messages: parsed.messages,
            trip: parsed.trip || {},
            stage: parsed.stage || 'WELCOME',
            itinerary: parsed.itinerary || null,
          };
        }
      }
    }
  } catch (e) {
    console.warn('[store] Failed to load stored session:', e);
  }
  return INITIAL_STATE;
}

class Store {
  constructor(initial) {
    const loaded = loadStoredSession();
    /** @type {AppState} */
    this._state = JSON.parse(JSON.stringify(loaded || initial));

    /** @type {Map<string, Set<Function>>} */
    this._subscribers = new Map();
  }

  /** Return a deep snapshot of the current state */
  getState() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Merge partial state and notify relevant subscribers with deep change detection.
   * (Suggestion #21 — Harden State Management)
   * @param {Partial<AppState>} partial
   */
  setState(partial) {
    const prev = this._state;
    const next = { ...prev };

    const changedKeys = [];
    for (const key of Object.keys(partial)) {
      const prevVal = prev[key];
      const nextVal = partial[key];

      if (!isDeepEqual(prevVal, nextVal)) {
        changedKeys.push(key);
      }
      next[key] = nextVal;
    }

    this._state = next;

    // Persist active session to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        if (this._state.messages && this._state.messages.length > 0) {
          localStorage.setItem('trailmate_active_session', JSON.stringify({
            messages: this._state.messages,
            trip: this._state.trip || {},
            stage: this._state.stage || 'WELCOME',
            itinerary: this._state.itinerary || null,
            savedAt: Date.now(),
          }));
        }
      }
    } catch {
      // ignore storage quota errors
    }

    // Notify subscribers for keys that actually changed structurally
    for (const key of changedKeys) {
      this._notify(key, this._state[key]);
    }
  }

  /**
   * Helper to safely update trip properties without losing nested reactivity.
   * @param {Partial<TripState>} patch
   */
  updateTrip(patch) {
    this.setState({
      trip: {
        ...(this._state.trip || {}),
        ...patch,
      },
    });
  }

  /**
   * Helper to safely update itinerary properties.
   * @param {object} itinerary
   */
  updateItinerary(itinerary) {
    this.setState({ itinerary });
  }

  /**
   * Subscribe to state changes on a specific key or globally.
   * @param {string|Function} keyOrCallback
   * @param {Function} [maybeCallback]
   * @returns {Function} Unsubscribe function
   */
  subscribe(keyOrCallback, maybeCallback) {
    if (typeof keyOrCallback === 'function') {
      const callback = keyOrCallback;
      const allKey = '*';
      if (!this._subscribers.has(allKey)) {
        this._subscribers.set(allKey, new Set());
      }
      this._subscribers.get(allKey).add(callback);

      return () => {
        this._subscribers.get(allKey)?.delete(callback);
      };
    }

    const key = keyOrCallback;
    const callback = maybeCallback;
    if (!this._subscribers.has(key)) {
      this._subscribers.set(key, new Set());
    }
    this._subscribers.get(key).add(callback);

    return () => {
      this._subscribers.get(key)?.delete(callback);
    };
  }

  /** @private */
  _notify(key, value) {
    this._subscribers.get(key)?.forEach(cb => {
      try { cb(value); } catch (e) { console.error(`[Store] Subscriber error for "${key}":`, e); }
    });
    this._subscribers.get('*')?.forEach(cb => {
      try { cb(this.getState()); } catch (e) { console.error(`[Store] Wildcard subscriber error:`, e); }
    });
  }

  /** Append a message and fire subscribers */
  pushMessage(message) {
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
      ...message,
    };
    this.setState({ messages: [...this._state.messages, msg] });
    return msg;
  }

  /** Replace the last bot message (used for streaming/typing indicator swap) */
  replaceLastBotMessage(updates) {
    const msgs = [...this._state.messages];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'bot') {
        msgs[i] = { ...msgs[i], ...updates };
        break;
      }
    }
    this.setState({ messages: msgs });
  }

  /** Reset to a clean slate for a new trip */
  reset() {
    this._state = JSON.parse(JSON.stringify({ ...INITIAL_STATE, messages: [] }));
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('trailmate_active_session');
      }
    } catch {
      // ignore
    }
    // Notify all subscribers
    for (const [key, subs] of this._subscribers) {
      subs.forEach(cb => {
        try { cb(this._state[key]); } catch (e) { /* ignore */ }
      });
    }
  }
}

export const store = new Store(INITIAL_STATE);
