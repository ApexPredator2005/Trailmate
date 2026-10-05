// src/engine/conversation.js
// ──────────────────────────────────────────────────────────────────────
// Client-side conversation state machine for Trailmate.
//
// Manages the 14-stage trip-planning flow:
//   WELCOME → PARSING → CLARIFYING → PREFERENCE_GATE → FLIGHT_PREFS
//   → FLIGHT_SEARCH → FLIGHT_SELECTED → HOTEL_PREFS → HOTEL_SEARCH
//   → HOTEL_SELECTED → PLACES_SELECT → RESTAURANTS_SELECT
//   → COMPOSING → DONE
//
// Design rules this engine enforces:
//   1. APIs fetch facts. AI arranges and personalizes facts.
//      AI never invents facts.
//   2. findNearestAirport returns null on no match → the engine asks
//      the user for their departure airport rather than guessing.
//   3. searchFlights never throws → callers always get
//      { flights: [], error: "..." } on failure, rendered honestly.
//   4. Every data gap is surfaced honestly (ask the user, show
//      fallback message) — never fabricated or silently swallowed.
// ──────────────────────────────────────────────────────────────────────

import { store } from '../store/state.js';
import { api, syncDestinationCardWeather, formatWeatherString } from '../services/api.js';
import { downloadIcsCalendar } from '../views/ShareView.js';

/* ── Constants ──────────────────────────────────────────────────────── */

export const DESTINATION_SHOWCASE = [
  {
    name: 'Goa',
    state: 'Goa',
    category: 'beaches',
    categories: ['beaches'],
    popularityRank: 1,
    vibe: 'Coastal Villas & Golden Sunsets',
    weather: '29°C · Sunny',
    icon: '🌊',
    photo: '/images/destinations/goa.jpg',
    tags: ['Beach', 'Nightlife', 'Seafood'],
  },
  {
    name: 'Manali',
    state: 'Himachal Pradesh',
    category: 'mountains',
    categories: ['mountains', 'hills'],
    popularityRank: 2,
    vibe: 'Snow Peaks & Pine Forest Cafes',
    weather: '12°C · Crisp',
    icon: '🏔️',
    photo: '/images/destinations/manali.jpg',
    tags: ['Mountains', 'Adventure', 'Snow'],
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    category: 'heritage',
    categories: ['heritage'],
    popularityRank: 3,
    vibe: 'Royal Palaces, Forts & Bazaars',
    weather: '26°C · Clear',
    icon: '🏰',
    photo: '/images/destinations/jaipur.jpg',
    tags: ['Heritage', 'Culture', 'Architecture'],
  },
  {
    name: 'Ooty',
    state: 'Tamil Nadu',
    category: 'hills',
    categories: ['hills', 'nature'],
    popularityRank: 4,
    vibe: 'Misty Tea Gardens & Heritage Bungalows',
    weather: '17°C · Misty',
    icon: '🌿',
    photo: '/images/destinations/ooty.jpg',
    tags: ['Nature', 'Cool Hills', 'Estates'],
  },
  {
    name: 'Udaipur',
    state: 'Rajasthan',
    category: 'heritage',
    categories: ['heritage'],
    popularityRank: 5,
    vibe: 'Lakeside Palaces & Sunset Boat Cruises',
    weather: '25°C · Warm',
    icon: '👑',
    photo: '/images/destinations/udaipur.jpg',
    tags: ['Lakes', 'Palaces', 'Royalty'],
  },
  {
    name: 'Shimla',
    state: 'Himachal Pradesh',
    category: 'hills',
    categories: ['hills', 'mountains'],
    popularityRank: 6,
    vibe: 'Colonial Ridges & Alpine Trails',
    weather: '16°C · Pleasant',
    icon: '🌸',
    photo: '/images/destinations/shimla.jpg',
    tags: ['Hills', 'Heritage', 'Walks'],
  },
  {
    name: 'Munnar',
    state: 'Kerala',
    category: 'hills',
    categories: ['hills', 'nature'],
    popularityRank: 7,
    vibe: 'Rolling Emerald Slopes & Waterfalls',
    weather: '18°C · Refreshing',
    icon: '🍃',
    photo: '/images/destinations/munnar.jpg',
    tags: ['Tea', 'Waterfalls', 'Clouds'],
  },
  {
    name: 'Andaman',
    state: 'Andaman & Nicobar',
    category: 'beaches',
    categories: ['beaches'],
    popularityRank: 8,
    vibe: 'Coral Reefs & Turquoise Bays',
    weather: '28°C · Tropical',
    icon: '🏝️',
    photo: '/images/destinations/andaman.jpg',
    tags: ['Islands', 'Diving', 'Pristine'],
  },
  {
    name: 'Coorg',
    state: 'Karnataka',
    category: 'nature',
    categories: ['nature', 'hills'],
    popularityRank: 9,
    vibe: 'Coffee Estates & Verdant Valleys',
    weather: '20°C · Serene',
    icon: '☕',
    photo: '/images/destinations/coorg.jpg',
    tags: ['Coffee', 'Waterfalls', 'Trek'],
  },
  {
    name: 'Mussoorie',
    state: 'Uttarakhand',
    category: 'hills',
    categories: ['hills'],
    popularityRank: 10,
    vibe: 'Queen of the Hills & Doon Valley Views',
    weather: '15°C · Cool',
    icon: '🌄',
    photo: '/images/destinations/mussoorie.jpg',
    tags: ['Valley Views', 'Waterfalls', 'Pine'],
  },
  {
    name: 'Nainital',
    state: 'Uttarakhand',
    category: 'hills',
    categories: ['hills'],
    popularityRank: 11,
    vibe: 'Pear-shaped Naini Lake & Forest Ridges',
    weather: '15°C · Mild',
    icon: '⛵',
    photo: '/images/destinations/nainital.jpg',
    tags: ['Boating', 'Cable Car', 'Lake'],
  },
  {
    name: 'Kodaikanal',
    state: 'Tamil Nadu',
    category: 'hills',
    categories: ['hills', 'nature'],
    popularityRank: 12,
    vibe: 'Star-shaped Lake & Pillar Rock Vistas',
    weather: '16°C · Misty',
    icon: '🌲',
    photo: '/images/destinations/kodaikanal.jpg',
    tags: ['Lakes', 'Forests', 'Mist'],
  },
  {
    name: 'Darjeeling',
    state: 'West Bengal',
    category: 'hills',
    categories: ['hills', 'nature'],
    popularityRank: 13,
    vibe: 'Heritage Toy Train & Himalayan Sunrises',
    weather: '13°C · Crisp',
    icon: '🚂',
    photo: '/images/destinations/darjeeling.jpg',
    tags: ['Toy Train', 'Tea', 'Kanchenjunga'],
  },
  {
    name: 'Wayanad',
    state: 'Kerala',
    category: 'nature',
    categories: ['nature', 'hills'],
    popularityRank: 14,
    vibe: 'Spice Plantations & Treehouse Stays',
    weather: '22°C · Lush',
    icon: '🌴',
    photo: '/images/destinations/wayanad.jpg',
    tags: ['Spices', 'Caves', 'Wildlife'],
  },
  {
    name: 'Gangtok',
    state: 'Sikkim',
    category: 'mountains',
    categories: ['mountains', 'hills'],
    popularityRank: 15,
    vibe: 'Himalayan Monasteries & Orchid Trails',
    weather: '14°C · Mountain Breeze',
    icon: '🛕',
    photo: '/images/destinations/gangtok.jpg',
    tags: ['Monasteries', 'Snow', 'Orchids'],
  },
];

const KNOWN_DESTINATIONS = [
  'Manali', 'Shimla', 'Mussoorie', 'Nainital', 'Darjeeling',
  'Ooty', 'Kodaikanal', 'Wayanad', 'Munnar', 'Gangtok',
  'Coorg', 'Jaipur', 'Udaipur', 'Goa', 'Andaman',
];

const INTEREST_OPTIONS = [
  { label: '🌿 Nature & Wildlife',     value: 'nature' },
  { label: '🏛 Heritage & History',     value: 'heritage' },
  { label: '🍜 Street Food & Cuisine',  value: 'food' },
  { label: '🏖 Beach & Water',          value: 'beach' },
  { label: '⛰ Adventure & Trekking',   value: 'adventure' },
  { label: '🛍 Shopping & Markets',     value: 'shopping' },
  { label: '🧘 Wellness & Spa',         value: 'wellness' },
  { label: '📸 Photography Spots',      value: 'photography' },
];

const BUDGET_CHIPS = [
  { label: '💰 Budget-friendly', value: 'budget' },
  { label: '⚖️ Moderate',        value: 'moderate' },
  { label: '✨ Luxury',           value: 'luxury' },
];

const CABIN_CHIPS = [
  { label: '💺 Economy',         value: 'economy' },
  { label: '✨ Premium Economy',  value: 'premium' },
  { label: '🥂 Business / First', value: 'business' },
];

const DESTINATION_CHIPS = [
  { label: '🏔 Manali',  value: 'Manali' },
  { label: '🌸 Shimla',  value: 'Shimla' },
  { label: '🌿 Ooty',    value: 'Ooty' },
  { label: '🏰 Jaipur',  value: 'Jaipur' },
  { label: '🌊 Goa',     value: 'Goa' },
  { label: '🏝 Andaman', value: 'Andaman' },
];

const HOTEL_STYLE_CHIPS = [
  { label: '🏡 Homestay / Farmstay', value: 'homestay' },
  { label: '🏨 Standard Hotel',      value: 'hotel' },
  { label: '🏛 Heritage / Boutique', value: 'heritage' },
  { label: '⛺ Resort / Retreat',    value: 'resort' },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Simple client-side destination detector — used as a fallback when
 * Gemini parsing is unavailable or returns nothing.
 */
function detectDestination(text) {
  const lower = text.toLowerCase();
  return KNOWN_DESTINATIONS.find((d) => lower.includes(d.toLowerCase())) ?? null;
}

/* ── Engine ──────────────────────────────────────────────────────────── */

export class ConversationEngine {
  constructor() {
    this._resetInternal();
  }

  _resetInternal() {
    this._gatePhase = 'interests';
    this._collectedInterests = [];
    this._selectedPlaces = [];
    this._selectedRestaurants = [];
    this._weatherData = null;
    this._pendingSwap = null;
    this._pendingAddDay = null;
  }

  /* ══════════════════════════════════════════════════════════════════
   * PUBLIC API — called by main.js
   * ══════════════════════════════════════════════════════════════════ */

  /** Send the welcome message and rich destination showcase cards. */
  sendWelcome() {
    this._resetInternal();
    store.reset();

    store.pushMessage({
      role: 'bot',
      text:
        "Hi there! I'm Trailmate, your AI travel planner.\n\n" +
        "Where are you dreaming of escaping to? Choose an inspiring destination below or type your travel plans to get started.",
    });

    store.pushMessage({
      role: 'destinations',
      destinations: DESTINATION_SHOWCASE,
    });
  }

  /**
   * Handle interactive stop swap requested from the Itinerary panel.
   */
  async handleSwapStop(dayIdx, stopIdx, stop) {
    const trip = store.getState().trip || {};
    const dest = trip.destination || 'Ooty';
    const stopTitle = stop.name || stop.title || 'Stop';

    this._pendingSwap = { dayIdx, stopIdx, oldStop: stop };

    store.pushMessage({
      role: 'bot',
      text: `Searching alternative options to replace **${stopTitle}** on Day ${dayIdx + 1}…`,
    });

    try {
      const isDining = /dinner|lunch|cafe|restaurant|food/i.test(stopTitle) || /dinner|lunch/i.test(stop.time || '');
      const type = isDining ? 'restaurant' : 'tourist_attraction';
      const query = isDining ? `best restaurants in ${dest}` : `top attractions in ${dest}`;

      const res = await api.searchPlaces({ query, type, maxResults: 5 });
      const places = (res.places || []).filter(p => p.name !== stopTitle);

      if (places.length === 0) {
        store.pushMessage({
          role: 'bot',
          text: `No alternative suggestions found for ${stopTitle} right now.`,
        });
        this._pendingSwap = null;
        return;
      }

      const cards = places.slice(0, 3).map((p, i) => ({
        id: p.id || `alt-${i}`,
        name: p.name,
        description: p.formattedAddress || p.description || '',
        rating: p.rating ? String(p.rating) : null,
        photo: p.photo || null,
        _raw: p,
      }));

      store.pushMessage({
        role: 'bot',
        text: `Choose an alternative option below to replace **${stopTitle}**:`,
      });
      store.pushMessage({ role: 'cards', cards });
    } catch (e) {
      store.pushMessage({
        role: 'bot',
        text: `Could not fetch swap options: ${e.message}`,
      });
      this._pendingSwap = null;
    }
  }

  /**
   * Handle interactive add-activity requested from the Itinerary panel.
   */
  async handleAddActivity(dayIdx) {
    const trip = store.getState().trip || {};
    const dest = trip.destination || 'Ooty';

    this._pendingAddDay = dayIdx;

    store.pushMessage({
      role: 'bot',
      text: `Finding activities to add to **Day ${dayIdx + 1}** in **${dest}**…`,
    });

    try {
      const res = await api.searchPlaces({
        query: `top tourist attractions in ${dest}`,
        type: 'tourist_attraction',
        maxResults: 5,
      });
      const places = res.places || [];

      if (places.length === 0) {
        store.pushMessage({
          role: 'bot',
          text: `No additional activities found for ${dest} right now.`,
        });
        this._pendingAddDay = null;
        return;
      }

      const cards = places.slice(0, 3).map((p, i) => ({
        id: p.id || `add-${i}`,
        name: p.name,
        description: p.formattedAddress || p.description || '',
        rating: p.rating ? String(p.rating) : null,
        photo: p.photo || null,
        _raw: p,
      }));

      store.pushMessage({
        role: 'bot',
        text: `Tap an activity below to add it to **Day ${dayIdx + 1}**:`,
      });
      store.pushMessage({ role: 'cards', cards });
    } catch (e) {
      store.pushMessage({
        role: 'bot',
        text: `Could not fetch activities: ${e.message}`,
      });
      this._pendingAddDay = null;
    }
  }

  /**
   * Handle any user text input or chip selection.
   * @param {string}  text      - user message or chip label
   * @param {string} [chipValue] - chip value (if user clicked a chip)
   */
  async handleUserMessage(text, chipValue) {
    const { stage } = store.getState();

    try {
      switch (stage) {
        case 'WELCOME':            return await this._onWelcome(text, chipValue);
        case 'PARSING':            return await this._onParsing(text, chipValue);
        case 'CLARIFYING':         return await this._onClarify(text, chipValue);
        case 'PREFERENCE_GATE':    return await this._onPreferenceGate(text, chipValue);
        case 'FLIGHT_PREFS':       return await this._onFlightPrefs(text, chipValue);
        case 'FLIGHT_SEARCH':      return await this._onFlightSearchInput(text, chipValue);
        case 'FLIGHT_SELECTED':    return; // transient — auto-transitions
        case 'HOTEL_PREFS':        return await this._onHotelPrefs(text, chipValue);
        case 'HOTEL_SEARCH':       return; // cards only
        case 'HOTEL_SELECTED':     return; // transient
        case 'PLACES_SELECT':      return await this._onPlacesInput(text, chipValue);
        case 'RESTAURANTS_SELECT': return await this._onRestaurantsInput(text, chipValue);
        case 'COMPOSING':          return; // automatic
        case 'DONE':               return await this._onDone(text, chipValue);
        default:
          console.warn('[Engine] Unhandled stage:', stage);
      }
    } catch (err) {
      this._surfaceError(err);
    }
  }

  /**
   * Handle a card selection (flight, hotel, place, restaurant, or swap/add).
   * @param {object} card - the card data object from OptionCard
   * @returns {{ isMultiSelect: boolean }}
   */
  async handleCardSelected(card) {
    const { stage } = store.getState();

    try {
      // Priority 1: Pending Stop Swap
      if (this._pendingSwap) {
        const { dayIdx, stopIdx, oldStop } = this._pendingSwap;
        this._pendingSwap = null;

        const itin = store.getState().itinerary;
        if (itin && itin.days && itin.days[dayIdx] && itin.days[dayIdx].stops[stopIdx]) {
          const targetStop = itin.days[dayIdx].stops[stopIdx];
          targetStop.title = card.name;
          targetStop.name = card.name;
          targetStop.description = card.description || targetStop.description;
          if (card.photo) targetStop.photo = card.photo;

          store.setState({ itinerary: { ...itin } });

          store.pushMessage({
            role: 'bot',
            text: `Replaced **${oldStop.name || oldStop.title}** with **${card.name}** on Day ${dayIdx + 1}.`,
          });
        }
        return { isMultiSelect: false };
      }

      // Priority 2: Pending Add Activity
      if (this._pendingAddDay !== null) {
        const dayIdx = this._pendingAddDay;
        this._pendingAddDay = null;

        const itin = store.getState().itinerary;
        if (itin && itin.days && itin.days[dayIdx]) {
          const newStop = {
            time: 'Afternoon',
            title: card.name,
            name: card.name,
            description: card.description || '',
            photo: card.photo || null,
            isComplete: false,
          };
          itin.days[dayIdx].stops.push(newStop);
          itin.days[dayIdx].showEmptySlot = false;

          store.setState({ itinerary: { ...itin } });

          store.pushMessage({
            role: 'bot',
            text: `Added **${card.name}** to Day ${dayIdx + 1}. Your journey timeline has been updated.`,
          });
        }
        return { isMultiSelect: false };
      }

      switch (stage) {
        case 'FLIGHT_SEARCH':
          await this._pickFlight(card);
          return { isMultiSelect: false };
        case 'HOTEL_SEARCH':
          await this._pickHotel(card);
          return { isMultiSelect: false };
        case 'PLACES_SELECT':
          this._togglePlace(card);
          return { isMultiSelect: true };
        case 'RESTAURANTS_SELECT':
          this._toggleRestaurant(card);
          return { isMultiSelect: true };
        default:
          return { isMultiSelect: false };
      }
    } catch (err) {
      this._surfaceError(err);
      return { isMultiSelect: false };
    }
  }

  /**
   * True when the current stage expects multi-select card behaviour.
   * main.js checks this to toggle instead of single-select.
   */
  isMultiSelectStage() {
    if (this._pendingSwap || this._pendingAddDay !== null) {
      return false; // Swap and Add are single select
    }
    const { stage } = store.getState();
    return stage === 'PLACES_SELECT' || stage === 'RESTAURANTS_SELECT';
  }

  /* ══════════════════════════════════════════════════════════════════
   * STAGE HANDLERS (private)
   * ══════════════════════════════════════════════════════════════════ */

  /* ── WELCOME ────────────────────────────────────────────────────── */

  async _onWelcome(text, chipValue) {
    store.setState({ isLoading: true, stage: 'PARSING' });

    if (chipValue) {
      // Quick-pick destination chip
      const trip = { ...store.getState().trip, destination: chipValue };
      store.setState({ trip });

      await sleep(300);
      store.setState({ isLoading: false, stage: 'CLARIFYING' });

      store.pushMessage({
        role: 'bot',
        text:
          `Great choice — **${chipValue}**! To plan your itinerary, please share a few details:\n\n` +
          '• How many travelers?\n' +
          '• Which city are you traveling from?\n' +
          '• Travel dates or number of days?\n\n' +
          'You can answer in one sentence, like *"2 people from Delhi, 4 days next month"*.',
      });
    } else {
      // Free-form message → backend parse
      await this._parseMessage(text);
    }
  }

  /* ── PARSING ────────────────────────────────────────────────────── */

  async _onParsing(text, chipValue) {
    store.setState({ isLoading: true });
    if (chipValue) {
      const trip = { ...store.getState().trip, destination: chipValue };
      store.setState({ trip, isLoading: false, stage: 'CLARIFYING' });
      store.pushMessage({
        role: 'bot',
        text: `Heading to **${chipValue}**! Could you tell me how many people are traveling and where you're flying from?`,
      });
      return;
    }
    await this._parseMessage(text);
  }

  /**
   * Send user text to the backend for Gemini extraction.
   * Falls back to client-side regex extraction when needed.
   */
  async _parseMessage(text) {
    const trip = { ...store.getState().trip };

    try {
      const result = await api.sendChat({
        message: text,
        tripState: trip,
        stage: 'PARSING',
      });

      store.setState({ isLoading: false });

      // Merge any extracted fields
      if (result && result.extracted && Object.keys(result.extracted).length > 0) {
        Object.assign(trip, result.extracted);
      }
      this._clientExtract(text, trip);
      store.setState({ trip });
    } catch {
      // Pure client-side fallback
      store.setState({ isLoading: false });
      this._clientExtract(text, trip);
      store.setState({ trip });
    }

    // Decide next step based on what we now have
    const missing = this._missingFields(trip);

    if (missing.length === 0) {
      await this._enterPreferenceGate();
    } else if (trip.destination) {
      store.setState({ stage: 'CLARIFYING' });
      store.pushMessage({
        role: 'bot',
        text:
          `Great choice — **${trip.destination}**! ` +
          this._clarifyPrompt(missing),
      });
    } else {
      // No destination yet
      store.setState({ stage: 'WELCOME' });

      const gathered = [];
      if (trip.travelers) gathered.push(`${trip.travelers} traveler${trip.travelers > 1 ? 's' : ''}`);
      if (trip.homeCity) gathered.push(`from ${trip.homeCity}`);
      if (trip.duration) gathered.push(`${trip.duration} days`);
      if (trip.dates || trip.startDate) gathered.push(`in ${trip.dates || trip.startDate}`);

      let botReply = '';
      if (gathered.length > 0) {
        botReply = `Got it (${gathered.join(', ')})! Where would you like to travel for this trip?`;
      } else if (/^(hi|hey|hello|greetings|howdy|namaste)\b/i.test(text.trim())) {
        botReply = "Hello! Where are you planning to travel for your next getaway? Tell me a destination or pick one of the popular spots below.";
      } else {
        botReply = "I'd love to help plan your trip! Where would you like to travel?";
      }

      store.pushMessage({ role: 'bot', text: botReply });

      // Only push destination chips if the previous message wasn't already chips
      const msgs = store.getState().messages;
      const lastMsg = msgs[msgs.length - 2];
      if (!lastMsg || lastMsg.role !== 'chips') {
        store.pushMessage({ role: 'chips', chips: DESTINATION_CHIPS });
      }
    }
  }

  /* ── CLARIFYING ─────────────────────────────────────────────────── */

  async _onClarify(text, chipValue) {
    store.setState({ isLoading: true });

    const trip = { ...store.getState().trip };
    const input = chipValue || text;

    try {
      const result = await api.sendChat({
        message: input,
        tripState: trip,
        stage: 'CLARIFYING',
      });

      if (result && result.extracted && Object.keys(result.extracted).length > 0) {
        Object.assign(trip, result.extracted);
      }
    } catch {
      // client extraction fallback
    }

    this._clientExtract(input, trip);
    store.setState({ trip, isLoading: false });

    const missing = this._missingFields(trip);
    if (missing.length === 0) {
      await this._enterPreferenceGate();
    } else {
      store.pushMessage({
        role: 'bot',
        text: this._clarifyPrompt(missing),
      });
    }
  }

  /* ── PREFERENCE_GATE ────────────────────────────────────────────── */

  _getDistantDateWarning(trip) {
    const rawDate = trip.startDate || trip.dates;
    if (!rawDate) return '';

    try {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        const diffDays = (parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (diffDays > 35) {
          return `\n\n*Distant Travel Date Notice: Since your trip is scheduled for ${rawDate}, live flight fares, hotel tariffs, and local transit rates are subject to dynamic seasonal changes closer to your departure date.*`;
        }
      }
    } catch {
      // ignore
    }

    if (/(\d+\s*months?|next year|in\s+(?:nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct))/i.test(String(rawDate))) {
      return `\n\n*Distant Travel Date Notice: Since your trip is months away, airline rates, hotel tariffs, and transit pricing are subject to dynamic rate changes closer to your travel date.*`;
    }

    return '';
  }

  async _enterPreferenceGate() {
    const trip = store.getState().trip;
    const summary = this._tripSummary(trip);
    const distantWarning = this._getDistantDateWarning(trip);

    // Non-blocking weather fetch
    this._fetchWeatherQuietly(trip.destination);

    // Single-Turn Bundled Bypass: If user already stated interests and budget in opening message,
    // lock them in immediately to save multiple round-trips and API calls
    if (trip.interests?.length > 0 && trip.budgetTier) {
      this._collectedInterests = [...trip.interests];
      store.pushMessage({
        role: 'bot',
        text:
          `Here is your trip summary:\n\n${summary}${distantWarning}\n\n` +
          `Interests: **${trip.interests.join(', ')}** · Budget: **${trip.budgetTier}** — all set.`,
      });

      if (this._weatherData) {
        this._showWeatherNote();
      }

      await sleep(400);
      return await this._enterFlightPrefs();
    }

    store.setState({ stage: 'PREFERENCE_GATE' });
    this._gatePhase = 'interests';
    this._collectedInterests = trip.interests?.length ? [...trip.interests] : [];

    store.pushMessage({
      role: 'bot',
      text:
        `Here is your trip summary:\n\n${summary}${distantWarning}\n\n` +
        "Now let's personalize your trip. Select all activities and themes you are interested in exploring:",
    });

    store.pushMessage({
      role: 'chips',
      multiSelect: true,
      label: 'Trip Interests',
      submitLabel: 'Click when done',
      chips: [
        ...INTEREST_OPTIONS,
        { label: 'Skip — general highlights', value: '__skip_interests__' },
      ],
    });
  }

  async _onPreferenceGate(text, chipValue) {
    if (this._gatePhase === 'interests') {
      return this._handleInterestPick(text, chipValue);
    }
    if (this._gatePhase === 'budget') {
      return this._handleBudgetPick(text, chipValue);
    }
  }

  _handleInterestPick(text, chipValue) {
    // "Skip" or "Done" → finalize interests
    if (
      chipValue === '__skip_interests__' ||
      chipValue === '__done_interests__'
    ) {
      if (this._collectedInterests.length === 0) {
        this._collectedInterests = ['general'];
      }
      this._finalizeInterests();
      return;
    }

    if (chipValue) {
      const values = String(chipValue).split(',').map(v => v.trim()).filter(Boolean);
      values.forEach((v) => {
        if (!this._collectedInterests.includes(v)) {
          this._collectedInterests.push(v);
        }
      });

      const matchedLabels = INTEREST_OPTIONS
        .filter((i) => this._collectedInterests.includes(i.value))
        .map(i => i.label);

      store.pushMessage({
        role: 'bot',
        text: `Great choices — **${matchedLabels.length > 0 ? matchedLabels.join(', ') : 'Custom Interests'}**!`,
      });
      this._finalizeInterests();
    } else {
      // Free-text — try to match interest keywords
      const extracted = this._matchInterests(text);
      if (extracted.length > 0) {
        this._collectedInterests.push(
          ...extracted.filter((v) => !this._collectedInterests.includes(v))
        );
      } else {
        this._collectedInterests.push('general');
      }
      this._finalizeInterests();
    }
  }

  _finalizeInterests() {
    const trip = {
      ...store.getState().trip,
      interests: [...this._collectedInterests],
    };
    store.setState({ trip });

    this._gatePhase = 'budget';

    store.pushMessage({
      role: 'bot',
      text: "What is your preferred budget comfort level for this trip? Choose a tier or slide to your custom target budget:",
    });

    store.pushMessage({
      role: 'budget-slider',
      minAmount: 2000,
      maxAmount: 50000,
      step: 1000,
      defaultAmount: 15000,
      presets: [
        { label: '💰 Budget-friendly', value: 'budget' },
        { label: '⚖️ Moderate', value: 'moderate' },
        { label: '✨ Luxury', value: 'luxury' },
      ],
    });
  }

  async _handleBudgetPick(text, chipValue) {
    let budget = 'moderate';
    let customBudget = null;

    if (chipValue && typeof chipValue === 'object') {
      budget = chipValue.value || 'moderate';
      customBudget = chipValue.customBudget || null;
    } else if (chipValue) {
      budget = chipValue;
    } else {
      budget = this._matchBudget(text) || 'moderate';
      // Check if user typed a number in free text
      const numMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d{4,6})/i);
      if (numMatch) {
        customBudget = parseInt(numMatch[1], 10);
        if (customBudget <= 10000) budget = 'budget';
        else if (customBudget >= 35000) budget = 'luxury';
      }
    }

    const trip = { ...store.getState().trip, budgetTier: budget, customBudget };
    store.setState({ trip });

    const label =
      BUDGET_CHIPS.find((b) => b.value === budget)?.label || (customBudget ? `Custom Budget (₹${customBudget.toLocaleString('en-IN')})` : budget);

    store.pushMessage({
      role: 'bot',
      text: `${label} — noted.`,
    });

    // Feasibility Check: calculate realistic bare-minimum cost for destination + duration + travelers
    const duration = Math.max(1, trip.duration || 3);
    const travelers = Math.max(1, trip.travelers || 1);
    const destLower = (trip.destination || '').toLowerCase();

    let baseDailyPerPerson = 1200;
    if (destLower.includes('andaman') || destLower.includes('lakshadweep') || destLower.includes('ladakh') || destLower.includes('gulmarg')) {
      baseDailyPerPerson = 2800;
    } else if (destLower.includes('manali') || destLower.includes('munnar') || destLower.includes('ooty') || destLower.includes('coorg')) {
      baseDailyPerPerson = 1600;
    }

    const minRealisticCost = baseDailyPerPerson * duration * travelers;

    if (customBudget && customBudget < minRealisticCost) {
      store.pushMessage({
        role: 'bot',
        text:
          `⚠️ **Budget Feasibility Advisory:**\n\n` +
          `A **${duration}-day** trip to **${trip.destination || 'your destination'}** for **${travelers} traveler${travelers > 1 ? 's' : ''}** typically requires a minimum of approximately **₹${minRealisticCost.toLocaleString('en-IN')}** for basic accommodation, local meals, and transit.\n\n` +
          `With **₹${customBudget.toLocaleString('en-IN')}**, expenses for standard flights and private stays will exceed this amount. We will design your schedule focusing on budget homestays, public transit, and free attractions, but we advise keeping a realistic buffer.`,
      });
    }

    // Surface weather note if available by now
    if (this._weatherData) {
      this._showWeatherNote();
    }

    await sleep(400);
    await this._enterFlightPrefs();
  }

  /* ── FLIGHT_PREFS ───────────────────────────────────────────────── */

  _isExactDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const s = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return true;
    if (/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(s)) return true;
    if (/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?\b/i.test(s)) return true;
    return false;
  }

  _parseToIsoDate(textOrDate) {
    if (!textOrDate) return null;
    const str = String(textOrDate).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const today = new Date();
    const currentYear = today.getFullYear();
    const lower = str.toLowerCase().trim();

    // 1. Relatives: tomorrow, day after tomorrow, this weekend
    if (lower === 'today') {
      return today.toISOString().split('T')[0];
    }
    if (lower === 'tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    }
    if (lower === 'day after tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    }
    if (lower.includes('this weekend') || lower === 'weekend') {
      const d = new Date(today);
      d.setDate(d.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
      return d.toISOString().split('T')[0];
    }

    // in X days / weeks
    const inDaysMatch = lower.match(/in\s+(\d+)\s+days?/i);
    if (inDaysMatch) {
      const d = new Date(today);
      d.setDate(d.getDate() + parseInt(inDaysMatch[1], 10));
      return d.toISOString().split('T')[0];
    }
    const inWeeksMatch = lower.match(/in\s+(\d+)\s+weeks?/i);
    if (inWeeksMatch) {
      const d = new Date(today);
      d.setDate(d.getDate() + parseInt(inWeeksMatch[1], 10) * 7);
      return d.toISOString().split('T')[0];
    }

    // next [monday..sunday]
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < weekdays.length; i++) {
      if (lower.includes(weekdays[i])) {
        const d = new Date(today);
        const targetDay = i;
        let diff = targetDay - today.getDay();
        if (diff <= 0) diff += 7;
        if (lower.includes('next') && diff < 7) diff += 7;
        d.setDate(d.getDate() + diff);
        return d.toISOString().split('T')[0];
      }
    }

    // "29th of this month", "29th of next month", "29th this month"
    const ofMonthMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(this\s+month|next\s+month)/i);
    if (ofMonthMatch) {
      const day = parseInt(ofMonthMatch[1], 10);
      let targetMonth = today.getMonth();
      let targetYear = today.getFullYear();
      if (ofMonthMatch[2].includes('next')) {
        targetMonth = (targetMonth + 1) % 12;
        if (targetMonth === 0) targetYear += 1;
      }
      const d = new Date(targetYear, targetMonth, day);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }

    // Standalone day: "29th", "on the 29th", "29th August"
    const standaloneDayMatch = lower.match(/(?:on\s+)?(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)\b/i);
    if (standaloneDayMatch) {
      const day = parseInt(standaloneDayMatch[1], 10);
      if (day >= 1 && day <= 31) {
        let targetMonth = today.getMonth();
        let targetYear = today.getFullYear();
        if (day < today.getDate()) {
          targetMonth = (targetMonth + 1) % 12;
          if (targetMonth === 0) targetYear += 1;
        }
        const d = new Date(targetYear, targetMonth, day);
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
    }

    // 2. Numeric DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?$/);
    if (dmyMatch) {
      let day = parseInt(dmyMatch[1], 10);
      let month = parseInt(dmyMatch[2], 10);
      let year = dmyMatch[3] ? parseInt(dmyMatch[3], 10) : currentYear;
      if (year < 100) year += 2000;
      if (month > 12 && day <= 12) {
        const tmp = day; day = month; month = tmp;
      }
      const d = new Date(year, month - 1, day);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }

    // 3. Natural Month names
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbrs = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    const clean = str.replace(/(?:st|nd|rd|th)/gi, '').replace(/[📅⚡,]/g, ' ').replace(/\s+/g, ' ').trim();
    
    for (let m = 0; m < 12; m++) {
      const mName = months[m];
      const mAbbr = monthAbbrs[m];
      const regex = new RegExp(`(?:(${mName}|${mAbbr})\\s+(\\d{1,2})|(\\d{1,2})\\s+(${mName}|${mAbbr}))(?:\\s+(\\d{4}))?`, 'i');
      const match = clean.match(regex);
      if (match) {
        const day = parseInt(match[2] || match[3], 10);
        let year = match[5] ? parseInt(match[5], 10) : currentYear;
        if (year === currentYear && m < today.getMonth()) {
          year += 1;
        }
        const d = new Date(year, m, day);
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
    }

    const parsed = new Date(clean.includes(String(currentYear)) ? clean : `${clean} ${currentYear}`);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    return null;
  }

  _generateExactDateSuggestions(trip) {
    const today = new Date();
    const suggestions = [];

    const datesStr = (trip.dates || '').toLowerCase();
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIdx = months.findIndex(m => datesStr.includes(m) || datesStr.includes(m.slice(0, 3)));

    let targetYear = today.getFullYear();
    let targetMonth = (today.getMonth() + 1) % 12;

    if (monthIdx !== -1) {
      targetMonth = monthIdx;
      if (targetMonth < today.getMonth()) targetYear += 1;
    } else if (datesStr.includes('next month')) {
      targetMonth = (today.getMonth() + 1) % 12;
      if (targetMonth === 0) targetYear += 1;
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mName = monthNames[targetMonth];

    const days = [12, 18, 25];
    days.forEach(d => {
      const iso = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const label = `${d} ${mName} ${targetYear}`;
      suggestions.push({ label: `📅 ${label}`, value: iso });
    });

    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
    const satIso = `${nextSaturday.getFullYear()}-${String(nextSaturday.getMonth() + 1).padStart(2, '0')}-${String(nextSaturday.getDate()).padStart(2, '0')}`;
    const satLabel = `${nextSaturday.getDate()} ${monthNames[nextSaturday.getMonth()]} (This Weekend)`;
    suggestions.unshift({ label: `⚡ ${satLabel}`, value: satIso });

    return suggestions;
  }

  async _enterFlightPrefs() {
    const trip = store.getState().trip;

    // 1. Check if we need an exact departure date before showing flight options
    if (!this._isExactDate(trip.startDate)) {
      this._flightPhase = 'exact_date';
      store.setState({ stage: 'FLIGHT_PREFS' });

      const dateChips = this._generateExactDateSuggestions(trip);
      const todayIso = new Date().toISOString().split('T')[0];

      store.pushMessage({
        role: 'bot',
        text:
          `To check real flight schedules and live seat availability for booking, please select or specify your **exact departure date**:\n\n` +
          `*(Pick any date on the calendar, choose a suggested date, or type your preferred departure date in chat)*`,
      });

      store.pushMessage({
        role: 'date-picker',
        suggestions: dateChips,
        minDate: todayIso,
        defaultDate: dateChips[0]?.value || todayIso,
      });
      return;
    }

    // 2. If origin is not confirmed/specified, ask for it
    if (!trip.originConfirmed) {
      await this._askDepartureCity();
      return;
    }

    // 3. Both date and origin are already known and confirmed -> directly ask cabin preference
    this._flightPhase = 'cabin';
    store.setState({ stage: 'FLIGHT_PREFS' });

    store.pushMessage({
      role: 'bot',
      text: `Departing from **${trip.homeCity}** on **${trip.dates || trip.startDate}** ➔ **${trip.destination || 'Destination'}**.\n\nAny cabin preference for your flight?`,
    });

    store.pushMessage({ role: 'chips', chips: CABIN_CHIPS });
  }

  async _askDepartureCity() {
    this._flightPhase = 'origin_city';
    store.setState({ stage: 'FLIGHT_PREFS' });

    const trip = store.getState().trip;
    const storedHome = (typeof localStorage !== 'undefined' ? localStorage.getItem('trailmate_home_city') : null) || trip.homeCity || 'Delhi';
    const dest = trip.destination || 'Destination';

    const popularHubs = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Lucknow', 'Kochi']
      .filter(c => c.toLowerCase() !== storedHome.toLowerCase() && c.toLowerCase() !== dest.toLowerCase())
      .slice(0, 6);

    const originChips = [
      { label: `🏠 ${storedHome} (Default Home)`, value: storedHome },
      ...popularHubs.map(c => ({ label: `🛫 ${c}`, value: c })),
    ];

    store.pushMessage({
      role: 'bot',
      text:
        `Where will you be **departing from** for this flight?\n\n` +
        `*(Your default home city from settings is **${storedHome}**. You can confirm it below, choose another major hub, or type any custom city/location in chat)*`,
    });

    store.pushMessage({
      role: 'chips',
      chips: originChips,
    });
  }

  async _onFlightPrefs(text, chipValue) {
    const input = chipValue || text;

    // 1. Handling Exact Departure Date
    if (this._flightPhase === 'exact_date') {
      const iso = this._parseToIsoDate(input) || (this._isExactDate(input) ? input : null);

      if (!iso) {
        const todayIso = new Date().toISOString().split('T')[0];
        const dateChips = this._generateExactDateSuggestions(store.getState().trip);

        store.pushMessage({
          role: 'bot',
          text: `I couldn't quite recognize **"${text}"** as a date. Please choose a departure date below or pick one on the calendar:`,
        });

        store.pushMessage({
          role: 'date-picker',
          suggestions: dateChips,
          minDate: todayIso,
          defaultDate: dateChips[0]?.value || todayIso,
        });
        return;
      }

      const parts = iso.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mName = months[parseInt(parts[1], 10) - 1] || parts[1];
      const friendlyDate = `${parseInt(parts[2], 10)} ${mName} ${parts[0]}`;

      const trip = { ...store.getState().trip, startDate: iso, dates: friendlyDate };
      store.setState({ trip });

      if (trip.homeCity && trip.originConfirmed) {
        store.pushMessage({
          role: 'bot',
          text: `Departure date confirmed for **${friendlyDate}** (\`${iso}\`). Departing from **${trip.homeCity}** ➔ **${trip.destination || 'Destination'}**.\n\nAny cabin preference for your flight?`,
        });
        this._flightPhase = 'cabin';
        store.pushMessage({ role: 'chips', chips: CABIN_CHIPS });
        return;
      }

      store.pushMessage({
        role: 'bot',
        text: `Departure date confirmed for **${friendlyDate}** (\`${iso}\`).`,
      });

      await this._askDepartureCity();
      return;
    }

    // 2. Handling Departure Origin City
    if (this._flightPhase === 'origin_city') {
      const rawCity = String(input).replace(/[🏠🛫📍]/g, '').replace(/\(Default Home\)/gi, '').trim();
      let chosenCity = rawCity;
      const match = rawCity.match(/(?:departing\s+from|flying\s+from|leaving\s+from|from|in|at)\s+([A-Za-z\s]+?)(?:[\.\,\!]|$)/i);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (!['my', 'a', 'the', 'home', 'relative', 'relatives', 'here', 'there'].includes(candidate.toLowerCase())) {
          chosenCity = candidate;
        }
      }

      if (!chosenCity || ['economy', 'premium', 'business'].includes(chosenCity.toLowerCase())) {
        chosenCity = store.getState().trip?.homeCity || 'Delhi';
      }

      const trip = { ...store.getState().trip, homeCity: chosenCity };
      store.setState({ trip });

      store.pushMessage({
        role: 'bot',
        text: `Departure city confirmed: **${chosenCity}** ➔ **${trip.destination || 'Destination'}**.\n\nAny cabin preference for your flight?`,
      });

      this._flightPhase = 'cabin';
      store.pushMessage({ role: 'chips', chips: CABIN_CHIPS });
      return;
    }

    // 3. Handling Cabin Preference
    const cabin = chipValue || 'economy';
    const trip = { ...store.getState().trip, cabinClass: cabin };
    store.setState({ trip });
    await this._runFlightSearch();
  }

  /* ── FLIGHT_SEARCH ──────────────────────────────────────────────── */

  async _runFlightSearch() {
    store.setState({ stage: 'FLIGHT_SEARCH', isLoading: true });

    const trip = store.getState().trip;
    const from = trip.homeCity || 'Delhi';
    const to = trip.destination || 'Ooty';
    const date = trip.startDate || trip.dates || this._fallbackDate();
    const passengers = trip.travelers || 1;
    const cabin = trip.cabinClass || 'economy';

    store.pushMessage({
      role: 'bot',
      text: `Searching flights from **${from}** to **${to}**…`,
    });

    try {
      const result = await api.searchFlights({
        from,
        to,
        date,
        passengers: Number(passengers),
        cabin,
      });

      store.setState({ isLoading: false });

      // result.flights is always present (searchFlights never throws on
      // the backend side — but the frontend api.js request() wrapper
      // WILL throw on 500s, so we handle that in catch below).
      const flights = result.flights ?? [];

      if (flights.length === 0) {
        const reason =
          result.error || 'No direct flights found for this route and date.';

        store.pushMessage({
          role: 'bot',
          text:
            `I couldn't find flights right now: *${reason}*.\n\n` +
            'You can try different dates, or we can skip flights and ' +
            'continue planning the rest of your trip.',
        });

        store.pushMessage({
          role: 'chips',
          chips: [
            { label: 'Try different dates', value: '__retry_flights__' },
            { label: 'Skip flights', value: '__skip_flights__' },
          ],
        });
        return;
      }

      // Airport context for hill-station destinations & transfer notes
      let airportNote = '';
      if (
        result.destination?.city &&
        result.destination.city.toLowerCase() !== to.toLowerCase()
      ) {
        const transfer = result.destination.transferNote ? ` ${result.destination.transferNote}.` : '';
        airportNote =
          `\n\n*${to} doesn't have its own commercial airport — ` +
          `showing flights to **${result.destination.airportName}** ` +
          `(${result.destination.iata}) in ${result.destination.city}.${transfer}*`;
      }

      // Format as cards
      const cards = flights.slice(0, 5).map((f, i) => ({
        id: f.id || `flight-${i}`,
        name: f.airline || `Flight ${i + 1}`,
        description: [
          f.departure_time || f.departureTime || '',
          f.arrival_time || f.arrivalTime || '',
        ]
          .filter(Boolean)
          .join(' → ') +
          (f.duration ? ` · ${f.duration}` : '') +
          (f.flightNumber ? ` · ${f.flightNumber}` : ''),
        price: f.price || '',
        badge: f.badge || (
          f.stops === 0 || f.is_nonstop
            ? 'Non-stop'
            : f.stops
              ? `${f.stops} stop${f.stops > 1 ? 's' : ''}`
              : null
        ),
        photo: null,
        rating: null,
        bookingUrl: f.bookingUrl || null,
        _raw: f,
      }));

      const freshness = result.freshnessLabel || 'Live schedule as of just now';

      store.pushMessage({
        role: 'bot',
        text:
          `Found **${flights.length}** live flight option${flights.length !== 1 ? 's' : ''} ` +
          `from **${result.origin?.city || from}** (${result.origin?.iata || ''}) to **${result.destination?.city || to}** (${result.destination?.iata || ''}) — *${freshness}*:${airportNote}`,
      });

      store.pushMessage({ role: 'cards', cards });

      // Automatically search and display Google Search-grounded last-mile transport pricing
      // if the destination does not have its own airport (e.g. Coimbatore -> Ooty, Bagdogra -> Darjeeling)
      if (
        result.destination?.city &&
        result.destination.city.toLowerCase() !== to.toLowerCase()
      ) {
        await this._fetchAndShowLastMileFares({
          fromAirport: result.destination.iata,
          fromAirportName: result.destination.airportName,
          destination: to,
          budgetTier: trip.budgetTier || 'moderate',
          pacePreference: trip.pace || 'balanced',
        });
      }

      // Always provide immediate 1-tap progression chips
      store.pushMessage({
        role: 'chips',
        chips: [
          { label: '🏨 Continue to Hotels & Stays ➔', value: '__skip_flights__' },
          { label: '🔄 Search Different Flights', value: '__retry_flights__' },
        ],
      });
    } catch (err) {
      store.setState({ isLoading: false });

      store.pushMessage({
        role: 'bot',
        text:
          `Flight search ran into a problem: *${err.message}*. ` +
          'We can try again or skip flights for now.',
      });

      store.pushMessage({
        role: 'chips',
        chips: [
          { label: 'Try again', value: '__retry_flights__' },
          { label: 'Skip flights', value: '__skip_flights__' },
        ],
      });
    }
  }

  /** Handle retry / skip chips shown after a flight search. */
  async _onFlightSearchInput(text, chipValue) {
    if (chipValue === '__retry_flights__') {
      return await this._runFlightSearch();
    }

    if (chipValue === '__skip_flights__' || /\b(skip|next|continue|move on|hotel|stay|later|go on|proceed)\b/i.test(text)) {
      store.setState({
        trip: { ...store.getState().trip, selectedFlight: store.getState().trip.selectedFlight || null },
      });

      store.pushMessage({
        role: 'bot',
        text:
          "Moving forward — let's find you a great place to stay in **" +
          (store.getState().trip?.destination || 'your destination') +
          "**.",
      });

      await sleep(400);
      return await this._enterHotelPrefs();
    }

    // User typed text while flight cards are displayed
    store.pushMessage({
      role: 'bot',
      text: 'You can pick a flight card above, or tap below to continue to accommodation & activities:',
    });

    store.pushMessage({
      role: 'chips',
      chips: [
        { label: '🏨 Continue to Hotels & Stays ➔', value: '__skip_flights__' },
        { label: '🔄 Search Different Flights', value: '__retry_flights__' },
      ],
    });
  }

  async _pickFlight(card) {
    const flight = card._raw || card;
    const trip = { ...store.getState().trip, selectedFlight: flight };
    store.setState({ trip, stage: 'FLIGHT_SELECTED' });

    const priceBit = card.price ? ` at **${card.price}**` : '';

    store.pushMessage({
      role: 'bot',
      text:
        `**${card.name}** confirmed — ${card.description}${priceBit}.\n\n` +
        "Now let's find you a great place to stay.",
    });

    await sleep(500);
    await this._enterHotelPrefs();
  }

  /**
   * Fetches and presents Google Search-grounded last-mile transport fares.
   */
  async _fetchAndShowLastMileFares({
    fromAirport,
    fromAirportName,
    destination,
    budgetTier = 'moderate',
    pacePreference = 'balanced',
    preferredClass = 'All',
  }) {
    try {
      const res = await api.getLastMileFare({
        fromAirport,
        fromAirportName,
        destination,
        budgetTier,
        pacePreference,
        preferredClass,
      });

      if (!res) return;

      if (res.fallback) {
        const destLower = String(destination || '').toLowerCase();
        const matchedKey = Object.keys(ROUTE_ESTIMATES).find((k) => destLower.includes(k));
        const defaultRoute = (matchedKey && ROUTE_ESTIMATES[matchedKey]) || {
          taxi: { min: 4500, max: 6500, duration: '7 - 8 hrs' },
          bus: { min: 850, max: 1400, duration: '8 - 9 hrs' },
        };

        const optionsList = (res.options || [])
          .map((opt) => {
            const icon = opt.mode === 'Taxi' ? '🚕' : opt.mode === 'Bus' ? '🚌' : opt.mode === 'Train' ? '🚂' : '🚗';
            let fareStr =
              opt.fareRange?.min && opt.fareRange?.max
                ? `₹${opt.fareRange.min.toLocaleString('en-IN')} – ₹${opt.fareRange.max.toLocaleString('en-IN')}`
                : opt.fareRange?.min
                  ? `from ₹${opt.fareRange.min.toLocaleString('en-IN')}`
                  : null;

            if (!fareStr) {
              if (opt.mode === 'Taxi') fareStr = `₹${defaultRoute.taxi.min.toLocaleString('en-IN')} – ₹${defaultRoute.taxi.max.toLocaleString('en-IN')}`;
              else if (opt.mode === 'Bus') fareStr = `₹${defaultRoute.bus.min.toLocaleString('en-IN')} – ₹${defaultRoute.bus.max.toLocaleString('en-IN')}`;
              else if (opt.mode === 'Train') fareStr = `₹${(defaultRoute.train?.min || 250).toLocaleString('en-IN')} – ₹${(defaultRoute.train?.max || 600).toLocaleString('en-IN')}`;
              else fareStr = 'Regulated counter tariff';
            }

            const durationStr = opt.durationRange || (opt.mode === 'Taxi' ? defaultRoute.taxi.duration : defaultRoute.bus.duration);
            return `• ${icon} **${opt.mode}:** ~**${fareStr}** *(${durationStr})* — ${opt.notes}`;
          })
          .join('\n\n');

        const portalsText = (res.bookingPortals || [])
          .map((p) => (p.url ? `• [${p.name}](${p.url}) — *${p.purpose}*` : `• **${p.name}** — *${p.purpose}*`))
          .join('\n');

        store.pushMessage({
          role: 'bot',
          text:
            `🚕 **Ground Transfer Tariff Estimates: ${fromAirportName || fromAirport} ➔ ${destination}**\n\n` +
            `⚠️ *Estimated from regional transport tariffs (verify exact counter rates before booking):*\n\n` +
            `${optionsList}\n\n` +
            `💡 **Recommendation:** ${res.recommendation?.reason || 'Official prepaid taxi counters at arrivals provide regulated fixed rates.'}\n\n` +
            `**Direct Booking & Official Portals:**\n${portalsText}\n\n` +
            `_Official counters are available at airport arrivals for regulated fares._`,
        });
        return;
      }

      // Successful Search-Grounded Response
      const optionsText = (res.options || [])
        .map((opt) => {
          const icon =
            opt.mode === 'Taxi'
              ? '🚕'
              : opt.mode === 'Bus'
                ? '🚌'
                : opt.mode === 'Train'
                  ? '🚂'
                  : opt.mode === 'Ferry'
                    ? '⛴️'
                    : '🚗';

          const fareStr =
            opt.fareRange?.min && opt.fareRange?.max
              ? `₹${opt.fareRange.min.toLocaleString('en-IN')} – ₹${opt.fareRange.max.toLocaleString('en-IN')}`
              : opt.fareRange?.min
                ? `from ₹${opt.fareRange.min.toLocaleString('en-IN')}`
                : 'Variable rate';

          const directPill = opt.hasDirectRoute ? '✅ Direct Route' : '⚠️ Connecting Leg Required';
          const heritagePill = opt.isHeritageExperience
            ? `\n   🏛️ **UNESCO / Scenic Heritage Experience:** ${opt.heritageNote || 'Historic mountain route'}`
            : '';

          const classBreakdown =
            opt.classes && opt.classes.length > 0
              ? '\n   *Class Breakdown:* ' +
                opt.classes.map((c) => `${c.className}: ₹${c.fare?.toLocaleString('en-IN') || '—'}`).join(' · ')
              : '';

          let bookingAlert = '';
          if (opt.bookingReality) {
            const br = opt.bookingReality;
            bookingAlert =
              `\n   ⏳ **Ticket Scarcity & Station Queue Reality:**\n` +
              (br.advanceBookingWindow ? `   • *Advance Booking:* ${br.advanceBookingWindow}\n` : '') +
              (br.spotQueueAdvisory ? `   • *Station Counter:* ${br.spotQueueAdvisory}\n` : '') +
              (br.actionableTip ? `   • *Smart Pro-Tip:* ${br.actionableTip}` : '');
          }

          const noteStr = opt.notes ? `\n   *Logistics:* ${opt.notes}` : '';

          return (
            `### ${icon} **${opt.mode}: ${opt.operatorOrRoute}**\n` +
            `• **Estimated Fare:** **${fareStr}** (${directPill})\n` +
            `• **Duration:** ${opt.durationRange}${classBreakdown}${heritagePill}${bookingAlert}${noteStr}`
          );
        })
        .join('\n\n');

      const recommendationText = res.recommendation?.reason
        ? `\n\n💡 **Trailmate Recommendation:** ${res.recommendation.reason}`
        : '';

      const heritageAltText = res.recommendation?.experienceAlternative
        ? `\n\n🌟 **Scenic / Heritage Highlight:** ${res.recommendation.experienceAlternative}`
        : '';

      const sourcesList =
        res.sources && res.sources.length > 0
          ? `\n\n🔗 **Public Verification Sources:**\n` +
            res.sources
              .slice(0, 4)
              .map((s) => `• [${s.title || s.uri}](${s.uri})`)
              .join('\n')
          : '';

      store.pushMessage({
        role: 'bot',
        text:
          `🚕 **Last-Mile Ground Transport: ${fromAirportName || fromAirport} (${fromAirport}) ➔ ${destination}**\n\n` +
          `🏷️ *${res.freshnessLabel || 'Estimated from public sources — verify before booking'}*\n\n` +
          `${optionsText}` +
          `${recommendationText}` +
          `${heritageAltText}` +
          `${sourcesList}`,
      });
    } catch (err) {
      console.warn('[conversation] Failed to load last-mile fares:', err.message);
    }
  }

  /* ── HOTEL_PREFS ────────────────────────────────────────────────── */

  async _enterHotelPrefs() {
    store.setState({ stage: 'HOTEL_PREFS' });

    store.pushMessage({
      role: 'bot',
      text: 'What kind of accommodation are you looking for?',
    });

    store.pushMessage({ role: 'chips', chips: HOTEL_STYLE_CHIPS });
  }

  async _onHotelPrefs(text, chipValue) {
    // Handle skip / retry chips from a previous failed hotel search
    if (chipValue === '__skip_hotel__') {
      store.setState({
        trip: { ...store.getState().trip, selectedHotel: null },
      });
      store.pushMessage({
        role: 'bot',
        text: "Skipping hotel selection. Let's explore attractions.",
      });
      await sleep(300);
      return await this._runPlacesSearch();
    }

    if (chipValue === '__retry_hotel__') {
      return await this._runHotelSearch();
    }

    this._hotelStyle = chipValue || 'hotel';
    await this._runHotelSearch();
  }

  /* ── HOTEL_SEARCH ───────────────────────────────────────────────── */

  async _runHotelSearch() {
    store.setState({ stage: 'HOTEL_SEARCH', isLoading: true });

    const trip = store.getState().trip;
    const dest = trip.destination || 'Ooty';
    const style = this._hotelStyle || 'hotel';
    const query = `best ${style} hotels in ${dest}`;

    store.pushMessage({
      role: 'bot',
      text: `Searching for ${style} stays in **${dest}**…`,
    });

    try {
      const result = await api.searchPlaces({
        query,
        type: 'lodging',
        maxResults: 6,
        rank: true,
        candidateType: 'hotel',
        budgetTier: trip.budgetTier || 'moderate',
        interests: (trip.interests || []).join(','),
      });

      store.setState({ isLoading: false });
      const places = result.places || [];

      if (places.length === 0) {
        store.pushMessage({
          role: 'bot',
          text:
            `I couldn't find ${style} accommodations in ${dest} right now. ` +
            'Try a different style, or skip ahead.',
        });
        store.pushMessage({
          role: 'chips',
          chips: [
            ...HOTEL_STYLE_CHIPS.filter((h) => h.value !== this._hotelStyle),
            { label: 'Skip hotel', value: '__skip_hotel__' },
          ],
        });
        store.setState({ stage: 'HOTEL_PREFS' });
        return;
      }

      const cards = places.map((p, i) => {
        const asOf = p.priceFetchedAt ? ` · ${formatWeatherFreshness(p.priceFetchedAt)}` : '';
        return {
          id: p.id || `hotel-${i}`,
          name: p.name,
          description: p.description || p.formattedAddress || '',
          rating: p.rating ? String(p.rating) : null,
          price: p.price || null,
          priceUnit: `/night${asOf}`,
          photo: p.photo || null,
          photos: p.photos || (p.photo ? [p.photo] : []),
          isFlagged: p.isFlagged || false,
          flagReason: p.flagReason || null,
          isStretch: p.isStretch || false,
          stretchReason: p.stretchReason || null,
          bookingUrl: p.bookingUrl || null,
          _raw: p,
        };
      });

      store.pushMessage({
        role: 'bot',
        text: `Found **${places.length}** accommodation options. Select your preferred stay:`,
      });

      store.pushMessage({ role: 'cards', cards });

      store.pushMessage({
        role: 'chips',
        chips: [
          { label: '🏛️ Skip / Continue to Attractions ➔', value: '__skip_hotel__' },
          { label: '🔄 Change Stay Style', value: '__retry_hotel__' },
        ],
      });
    } catch (err) {
      store.setState({ isLoading: false });

      store.pushMessage({
        role: 'bot',
        text: `Hotel search hit an issue: *${err.message}*. Let's try again or skip for now.`,
      });

      store.pushMessage({
        role: 'chips',
        chips: [
          { label: 'Try again', value: '__retry_hotel__' },
          { label: 'Skip', value: '__skip_hotel__' },
        ],
      });

      // Fall back to HOTEL_PREFS so chip clicks route correctly
      store.setState({ stage: 'HOTEL_PREFS' });
    }
  }

  async _pickHotel(card) {
    const hotel = card._raw || card;
    const trip = { ...store.getState().trip, selectedHotel: hotel };
    store.setState({ trip, stage: 'HOTEL_SELECTED' });

    const ratingBit = card.rating ? ` (★ ${card.rating})` : '';

    store.pushMessage({
      role: 'bot',
      text:
        `**${card.name}** confirmed as your stay${ratingBit}.\n\n` +
        "Next, let's discover the best attractions and sights.",
    });

    await sleep(500);
    await this._runPlacesSearch();
  }

  /* ── PLACES_SELECT ──────────────────────────────────────────────── */

  async _runPlacesSearch() {
    store.setState({ stage: 'PLACES_SELECT', isLoading: true });
    this._selectedPlaces = [];

    const trip = store.getState().trip;
    const dest = trip.destination || 'Ooty';
    const interests = (trip.interests || ['general']).join(' ');
    const query = `top tourist attractions in ${dest} ${interests}`.trim();

    store.pushMessage({
      role: 'bot',
      text: `Finding top sights and attractions in **${dest}**…`,
    });

    try {
      const result = await api.searchPlaces({
        query,
        type: 'tourist_attraction',
        maxResults: 14,
      });

      store.setState({ isLoading: false });
      const places = result.places || [];

      if (places.length === 0) {
        store.pushMessage({
          role: 'bot',
          text:
            "Couldn't find attraction listings right now. " +
            "We'll move on to dining options — you can always add places later.",
        });
        await sleep(300);
        return await this._runRestaurantsSearch();
      }

      const cards = places.map((p, i) => ({
        id: p.id || `place-${i}`,
        name: p.name,
        description: p.description || p.formattedAddress || '',
        rating: p.rating ? String(p.rating) : null,
        photo: p.photo || null,
        photos: p.photos || (p.photo ? [p.photo] : []),
        _raw: p,
      }));

      store.pushMessage({
        role: 'bot',
        text:
          `Here are **${places.length}** recommended attractions. ` +
          'Tap to select the ones you would like to visit, then click **Done**:',
      });

      store.pushMessage({ role: 'cards', cards, multiSelect: true });

      store.pushMessage({
        role: 'chips',
        chips: [
          { label: 'Done selecting places', value: '__done_places__' },
        ],
      });
    } catch {
      store.setState({ isLoading: false });

      store.pushMessage({
        role: 'bot',
        text:
          'Attraction search hit an issue. ' +
          "We'll move on to restaurants — you can add places later.",
      });

      await sleep(300);
      await this._runRestaurantsSearch();
    }
  }

  _togglePlace(card) {
    const idx = this._selectedPlaces.findIndex(
      (p) => (p.id && p.id === card.id) || p.name === card.name
    );

    if (idx >= 0) {
      this._selectedPlaces.splice(idx, 1);
    } else {
      this._selectedPlaces.push(card._raw || card);
    }

    // Reactive store update on every card toggle
    store.setState({
      trip: {
        ...store.getState().trip,
        selectedPlaces: [...this._selectedPlaces],
      },
    });
  }

  async _onPlacesInput(text, chipValue) {
    if (
      chipValue === '__done_places__' ||
      /\bdone\b/i.test(text)
    ) {
      const trip = {
        ...store.getState().trip,
        selectedPlaces: [...this._selectedPlaces],
      };
      store.setState({ trip });

      const n = this._selectedPlaces.length;

      store.pushMessage({
        role: 'bot',
        text:
          n > 0
            ? `Selected **${n}** attraction${n !== 1 ? 's' : ''}. Now let's explore dining options.`
            : "No attractions selected — we will curate recommended picks. Now let's find dining spots.",
      });

      await sleep(400);
      return await this._runRestaurantsSearch();
    }

    // User typed something else — prompt them
    store.pushMessage({
      role: 'bot',
      text:
        'Select attractions above, then click **"Done selecting places"** when you are ready.',
    });
  }

  /* ── RESTAURANTS_SELECT ─────────────────────────────────────────── */

  async _runRestaurantsSearch() {
    store.setState({ stage: 'RESTAURANTS_SELECT', isLoading: true });
    this._selectedRestaurants = [];

    const trip = store.getState().trip;
    const dest = trip.destination || 'Ooty';

    store.pushMessage({
      role: 'bot',
      text: `Finding recommended dining spots in **${dest}**…`,
    });

    try {
      const result = await api.searchPlaces({
        query: `best restaurants in ${dest}`,
        type: 'restaurant',
        maxResults: 8,
        rank: true,
        candidateType: 'restaurant',
        budgetTier: trip.budgetTier || 'moderate',
        hasFoodInterest: (trip.interests || []).includes('food'),
      });

      store.setState({ isLoading: false });
      const places = result.places || [];

      if (places.length === 0) {
        store.pushMessage({
          role: 'bot',
          text:
            "Couldn't find restaurant listings right now. " +
            "No problem — composing your itinerary with what we have.",
        });
        await sleep(300);
        return await this._composeItinerary();
      }

      const cards = places.map((p, i) => ({
        id: p.id || `rest-${i}`,
        name: p.name,
        description: p.description || p.formattedAddress || '',
        rating: p.rating ? String(p.rating) : null,
        photo: p.photo || null,
        photos: p.photos || (p.photo ? [p.photo] : []),
        _raw: p,
      }));

      store.pushMessage({
        role: 'bot',
        text:
          `Here are **${places.length}** dining options. ` +
          'Tap to select your preferences, then click **Done**:',
      });

      store.pushMessage({ role: 'cards', cards, multiSelect: true });

      store.pushMessage({
        role: 'chips',
        chips: [
          { label: 'Done selecting restaurants', value: '__done_restaurants__' },
        ],
      });
    } catch {
      store.setState({ isLoading: false });

      store.pushMessage({
        role: 'bot',
        text:
          'Restaurant search hit an issue. ' +
          "Composing your itinerary with what we have.",
      });

      await sleep(300);
      await this._composeItinerary();
    }
  }

  _toggleRestaurant(card) {
    const idx = this._selectedRestaurants.findIndex(
      (r) => (r.id && r.id === card.id) || r.name === card.name
    );

    if (idx >= 0) {
      this._selectedRestaurants.splice(idx, 1);
    } else {
      this._selectedRestaurants.push(card._raw || card);
    }

    // Reactive store update on every card toggle
    store.setState({
      trip: {
        ...store.getState().trip,
        selectedRestaurants: [...this._selectedRestaurants],
      },
    });
  }

  async _onRestaurantsInput(text, chipValue) {
    if (
      chipValue === '__done_restaurants__' ||
      /\bdone\b/i.test(text)
    ) {
      const trip = {
        ...store.getState().trip,
        selectedRestaurants: [...this._selectedRestaurants],
      };
      store.setState({ trip });

      const n = this._selectedRestaurants.length;

      store.pushMessage({
        role: 'bot',
        text:
          n > 0
            ? `Saved **${n}** dining spot${n !== 1 ? 's' : ''}. Composing your personalized itinerary now…`
            : "No specific restaurants chosen — adding top-rated local picks. Composing your itinerary now…",
      });

      await sleep(400);
      return await this._composeItinerary();
    }

    store.pushMessage({
      role: 'bot',
      text:
        'Tap dining options above to select, then click **"Done selecting restaurants"** when ready.',
    });
  }

  /* ── COMPOSING ──────────────────────────────────────────────────── */

  async _composeItinerary() {
    store.setState({ stage: 'COMPOSING', isLoading: true });

    store.pushMessage({
      role: 'bot',
      text: 'Arranging your schedule — sequencing stops, verifying timings, and organizing your days…',
    });

    const trip = store.getState().trip;

    try {
      let result;
      try {
        result = await api.sendChatStream({
          message: 'compose_itinerary',
          tripState: trip,
          stage: 'COMPOSING',
          onProgress: (statusText) => {
            store.pushMessage({
              role: 'bot',
              text: `⏳ *${statusText}*`,
            });
          },
        });
      } catch (streamErr) {
        console.warn('[conversation] Stream error, falling back to standard fetch:', streamErr);
        result = await api.sendChat({
          message: 'compose_itinerary',
          tripState: trip,
          stage: 'COMPOSING',
        });
      }

      store.setState({ isLoading: false });

      let finalItin = result.itinerary;
      if (!finalItin) {
        finalItin = this._buildFallbackItinerary(trip);
      }

      const budget = this._calculateEstimatedBudget(trip, finalItin);
      finalItin.estimatedBudget = budget;

      store.setState({ itinerary: finalItin, stage: 'DONE' });
      this._autoSaveCompletedTrip(trip, finalItin);

      const targetVal = budget.customBudget || budget.targetBudget;
      const budgetNote = targetVal
        ? `\n\n💰 **Estimated Trip Budget:** **₹${budget.total.toLocaleString('en-IN')}** *(Target: ₹${targetVal.toLocaleString('en-IN')})*\n` +
          `• ✈️ Flights & Transit: **₹${budget.flights.toLocaleString('en-IN')}**\n` +
          `• 🏨 Stays (${Math.max(1, (trip.duration || 3) - 1)} nights): **₹${budget.stay.toLocaleString('en-IN')}**\n` +
          `• 🍜 Food & Dining: **₹${budget.food.toLocaleString('en-IN')}**\n` +
          `• 🎟️ Activities & Sightseeing: **₹${budget.activities.toLocaleString('en-IN')}**`
        : `\n\n💰 **Estimated Total Cost:** **₹${budget.total.toLocaleString('en-IN')}**`;

      store.pushMessage({
        role: 'bot',
        text:
          `**Your ${trip.destination} itinerary is ready.**${budgetNote}\n\n` +
          'Check the right panel for your day-by-day plan with full cost breakdown. You can swap stops, add activities, or ask me to make any adjustments.',
      });
    } catch {
      store.setState({ isLoading: false });

      const fallback = this._buildFallbackItinerary(trip);
      const budget = this._calculateEstimatedBudget(trip, fallback);
      fallback.estimatedBudget = budget;

      store.setState({ itinerary: fallback, stage: 'DONE' });
      this._autoSaveCompletedTrip(trip, fallback);

      const targetVal = budget.customBudget || budget.targetBudget;
      const budgetNote = targetVal
        ? `\n\n💰 **Estimated Trip Budget:** **₹${budget.total.toLocaleString('en-IN')}** *(Target: ₹${targetVal.toLocaleString('en-IN')})*\n` +
          `• ✈️ Flights & Transit: **₹${budget.flights.toLocaleString('en-IN')}**\n` +
          `• 🏨 Stays: **₹${budget.stay.toLocaleString('en-IN')}**\n` +
          `• 🍜 Food: **₹${budget.food.toLocaleString('en-IN')}**\n` +
          `• 🎟️ Activities: **₹${budget.activities.toLocaleString('en-IN')}**`
        : `\n\n💰 **Estimated Total Cost:** **₹${budget.total.toLocaleString('en-IN')}**`;

      store.pushMessage({
        role: 'bot',
        text:
          `Composed your schedule for **${trip.destination}**.${budgetNote}\n\n` +
          'All your selections are saved. Check the right panel to view the complete schedule.',
      });
    }

    // Show post-composition action chips
    store.pushMessage({
      role: 'chips',
      chips: [
        { label: '📄 Download / Print PDF', value: '__download_pdf__' },
        { label: '📅 Export Calendar (.ics)', value: '__export_ics__' },
        { label: '💬 Copy WhatsApp Plan', value: '__copy_whatsapp__' },
        { label: '🔄 Swap a stop', value: '__swap__' },
        { label: '➕ Add an activity', value: '__add__' },
        { label: '✈️ Plan another trip', value: '__new_trip__' },
      ],
    });
  }

  /* ── DONE ───────────────────────────────────────────────────────── */

  async _onDone(text, chipValue) {
    if (chipValue === '__download_pdf__' || /\b(download|print|pdf)\b/i.test(text)) {
      window.print();
      store.pushMessage({
        role: 'bot',
        text: '📄 **Print / PDF export opened!** You can save this complete itinerary to PDF or send it to your printer.',
      });
      return;
    }

    if (chipValue === '__export_ics__' || /\b(calendar|ics)\b/i.test(text)) {
      const { trip, itinerary } = store.getState();
      downloadIcsCalendar(trip, itinerary);
      store.pushMessage({
        role: 'bot',
        text: '📅 **Exported itinerary (.ics) file downloaded!** You can now import it to Apple or Google Calendar.',
      });
      return;
    }

    if (chipValue === '__copy_whatsapp__' || /\bwhatsapp\b/i.test(text)) {
      const { trip, itinerary } = store.getState();
      const currDest = trip.destination || 'Trip';
      const summary = `🗺️ *${currDest} Trip Plan*\n\n` + (itinerary?.days || []).map(d => `*Day ${d.dayNumber}: ${d.title || d.theme}*\n` + (d.stops || []).map(s => `• ${s.time}: ${s.name || s.title}`).join('\n')).join('\n\n') + '\n\n_Planned with Trailmate AI_';
      try {
        await navigator.clipboard.writeText(summary);
        store.pushMessage({ role: 'bot', text: '💬 **WhatsApp trip summary copied to clipboard!** Ready to send to travel companions.' });
      } catch {
        store.pushMessage({ role: 'bot', text: summary });
      }
      return;
    }

    if (chipValue === '__new_trip__' || /\bnew\s*trip\b/i.test(text)) {
      store.reset();
      this.sendWelcome(); // sendWelcome calls _resetInternal
      return;
    }

    if (chipValue === '__swap__') {
      store.pushMessage({
        role: 'bot',
        text: 'Click the swap button next to any stop in your itinerary panel on the right.',
      });
      return;
    }

    if (chipValue === '__add__') {
      store.pushMessage({
        role: 'bot',
        text: 'Click the "+ Add" slot in your itinerary panel to add an activity to that day.',
      });
      return;
    }

    // General follow-up question
    store.setState({ isLoading: true });

    try {
      const result = await api.sendChat({
        message: text,
        tripState: store.getState().trip,
        stage: 'DONE',
      });

      store.setState({ isLoading: false });

      store.pushMessage({
        role: 'bot',
        text: result.reply || "I'm here if you want to adjust anything in your plan.",
      });
    } catch {
      store.setState({ isLoading: false });

      store.pushMessage({
        role: 'bot',
        text:
          "I'm here to help. You can swap or add stops in the itinerary panel, or start a new trip.",
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════
   * HELPERS (private)
   * ══════════════════════════════════════════════════════════════════ */

  _autoSaveCompletedTrip(trip, itinerary) {
    try {
      const messages = store.getState().messages || [];
      const savedTripsRaw = localStorage.getItem('trailmate_saved_trips');
      const allSaved = savedTripsRaw ? JSON.parse(savedTripsRaw) : [];

      const destination = trip.destination || 'Custom Trip';
      const duration = trip.duration || 3;

      // Avoid duplicating identical recent saves (within last 3 minutes)
      const threeMinAgo = Date.now() - 3 * 60 * 1000;
      const existsRecent = allSaved.some(
        (s) => s.destination === destination && s.date > threeMinAgo
      );

      if (!existsRecent) {
        allSaved.unshift({
          destination,
          duration,
          date: Date.now(),
          trip,
          itinerary,
          messages,
        });

        // Retain maximum 25 historical trip archives
        if (allSaved.length > 25) allSaved.splice(25);
        localStorage.setItem('trailmate_saved_trips', JSON.stringify(allSaved));
      }
    } catch (e) {
      console.warn('[conversation] Auto-save trip history notice:', e);
    }
  }

  _resetInternal() {
    this._gatePhase = 'interests';
    this._collectedInterests = [];
    this._selectedPlaces = [];
    this._selectedRestaurants = [];
    this._weatherData = null;
    this._hotelStyle = null;
  }

  _surfaceError(err) {
    console.error('[ConversationEngine]', err);
    store.setState({ isLoading: false });
    store.pushMessage({
      role: 'bot',
      text:
        `Something went wrong — *${err.message || 'please try again'}*. ` +
        'If this keeps happening, try starting a new trip.',
    });
  }

  /** Returns the list of still-missing critical fields. */
  _missingFields(trip) {
    const missing = [];
    if (!trip.destination) missing.push('destination');
    if (!trip.travelers) missing.push('travelers');
    const storedHome = typeof localStorage !== 'undefined' ? localStorage.getItem('trailmate_home_city') : null;
    if (!trip.homeCity && !storedHome) missing.push('homeCity');
    if (!trip.dates && !trip.startDate && !trip.duration) {
      missing.push('dates');
    }
    return missing;
  }

  /** Human-readable polite labels for field keys. */
  _fieldLabels(fields) {
    const map = {
      destination: 'destination',
      travelers: 'number of travelers',
      homeCity: 'departure city',
      dates: 'travel dates and how many nights you plan to stay',
    };
    return fields.map((f) => map[f] || f);
  }

  /** Build a polite clarification prompt for the given missing fields. */
  _clarifyPrompt(missing) {
    if (missing.length === 1) {
      if (missing[0] === 'dates') {
        return 'Please let me know your travel dates and how many nights you plan to stay.';
      }
      if (missing[0] === 'travelers') {
        return 'Please let me know how many travelers will be joining this trip.';
      }
      if (missing[0] === 'homeCity') {
        return 'Please let me know which city you will be departing from.';
      }
      if (missing[0] === 'destination') {
        return 'Please let me know where you would love to travel.';
      }
    }

    const labels = this._fieldLabels(missing);
    return `Could you please share ${labels.join(' and ')}?`;
  }

  /** Build a markdown trip summary. */
  _tripSummary(trip) {
    const lines = [];
    if (trip.destination) lines.push(`**Destination:** ${trip.destination}`);
    if (trip.homeCity) lines.push(`**From:** ${trip.homeCity}`);
    if (trip.travelers) lines.push(`**Travelers:** ${trip.travelers}`);
    if (trip.duration) {
      lines.push(`**Duration:** ${trip.duration} day${trip.duration > 1 ? 's' : ''}`);
    }
    if (trip.startDate) lines.push(`**Start date:** ${trip.startDate}`);
    else if (trip.dates) lines.push(`**Dates:** ${trip.dates}`);
    return lines.join('\n');
  }

  /**
   * Client-side extraction fallback when Gemini is unavailable.
   * Only extracts what it can confidently identify — never guesses.
   * @param {string} text
   * @param {object} trip - mutated in place
   */
  _clientExtract(text, trip) {
    // Destination
    if (!trip.destination) {
      const dest = detectDestination(text);
      if (dest) trip.destination = dest;
    }

    // Travelers
    if (!trip.travelers) {
      const m = text.match(
        /(\d+)\s*(?:people|travelers?|persons?|pax|adults?|guests?)/i
      );
      if (m) {
        trip.travelers = parseInt(m[1], 10);
      } else if (/\bsolo\b/i.test(text)) {
        trip.travelers = 1;
      } else if (/\bcouple\b/i.test(text)) {
        trip.travelers = 2;
      }
    }

    // Home city (look for "from <City>", "departing from <City>", "leaving from <City>", or standalone city answer)
    const originMatch = text.match(/(?:from|departing from|leaving from|out of)\s+([a-zA-Z]+(?:\s[a-zA-Z]+)*)/i);
    if (originMatch) {
      const raw = originMatch[1].trim();
      const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
      trip.homeCity = formatted;
      trip.originConfirmed = true;
    } else if (!trip.homeCity) {
      const cleaned = text.trim().replace(/[.,!?;:]+$/, '');
      const words = cleaned.split(/\s+/);
      const isShort = words.length <= 3;
      const isDate = this._parseToIsoDate(cleaned) || /(\d+|days?|nights?|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|tomorrow|weekend|today)/i.test(cleaned);
      const isTraveler = /(\d+|people|travelers?|persons?|pax|adults?|couple|solo)/i.test(cleaned);

      if (isShort && !isDate && !isTraveler && /^[a-zA-Z\s]+$/.test(cleaned)) {
        // If destination is already set, or if the user was asked for departure city, recognize this as homeCity
        if (trip.destination && cleaned.toLowerCase() !== trip.destination.toLowerCase()) {
          const formatted = cleaned
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
          trip.homeCity = formatted;
          trip.originConfirmed = true;
        }
      }

      if (!trip.homeCity && typeof localStorage !== 'undefined') {
        const storedHome = localStorage.getItem('trailmate_home_city');
        if (storedHome) trip.homeCity = storedHome;
      }
    }

    // Duration extraction
    if (!trip.duration) {
      const dayMatch = text.match(/(\d+)\s*(?:days?|nights?)/i);
      if (dayMatch) {
        trip.duration = parseInt(dayMatch[1], 10);
      }
    }

    // Date extraction
    if (!trip.startDate) {
      const iso = this._parseToIsoDate(text);
      if (iso) {
        trip.startDate = iso;
        const parts = iso.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mName = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
        trip.dates = `${parseInt(parts[2], 10)} ${mName} ${parts[0]}`;
      } else {
        const months = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december',
        ];
        const lower = text.toLowerCase();
        for (const m of months) {
          if (lower.includes(m)) {
            trip.dates = m.charAt(0).toUpperCase() + m.slice(1);
            break;
          }
        }
      }
    }
  }

  /** Match interest keywords from free-text. */
  _matchInterests(text) {
    const lower = text.toLowerCase();
    return INTEREST_OPTIONS.filter((opt) => {
      const words = opt.label
        .replace(/[^\w\s]/g, '')
        .toLowerCase()
        .split(/\s+/);
      return words.some((w) => w.length > 3 && lower.includes(w));
    }).map((opt) => opt.value);
  }

  /** Match budget tier from free-text. */
  _matchBudget(text) {
    const lower = text.toLowerCase();
    if (/budget|cheap|low.?cost/i.test(lower)) return 'budget';
    if (/luxury|premium|high.?end/i.test(lower)) return 'luxury';
    if (/moderate|mid|medium/i.test(lower)) return 'moderate';
    return null;
  }

  /** Generate a date 2 weeks from now as YYYY-MM-DD fallback. */
  _fallbackDate() {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }

  /** Fire-and-forget weather fetch. */
  async _fetchWeatherQuietly(destination) {
    try {
      const result = await api.getWeather(destination, 3);
      const forecast = result.forecast || result;
      const fetchedAt = result.fetchedAt || forecast.fetchedAt || Date.now();
      this._weatherData = { ...forecast, fetchedAt };

      const current = forecast.current || forecast;
      if (current && current.temp_c != null) {
        const cardWeatherText = formatWeatherString(current.temp_c, current.condition?.text);
        syncDestinationCardWeather(destination, cardWeatherText);
      }
    } catch {
      this._weatherData = null;
    }
  }

  /** Push a weather bot message if data is available. */
  _showWeatherNote() {
    if (!this._weatherData) return;

    const forecast = this._weatherData;
    const current = forecast.current || forecast;
    const dest =
      forecast.location?.name || forecast.location || store.getState().trip.destination;
    const fetchedAt = forecast.fetchedAt || Date.now();
    const asOf = formatWeatherFreshness(fetchedAt);

    let note = '';

    if (current.temp_c != null) {
      const conditionText = current.condition?.text || 'pleasant';
      note =
        `**Weather for ${dest}:** Currently ` +
        `${current.temp_c}°C, ${conditionText}.`;
    }

    // Severe weather alerts
    const alerts = forecast.alerts?.alert || forecast.alerts || [];
    if (Array.isArray(alerts) && alerts.length > 0) {
      const emoji = { Red: '🔴', Orange: '🟠', Yellow: '🟡' };
      const top = alerts[0];
      const icon = emoji[top.severity] || '⚠️';
      note +=
        `\n\n${icon} **Severe Weather Alert (${top.severity || 'Notice'}) — *${asOf}*:** ` +
        `${top.headline || top.event || 'Severe weather reported'}. ` +
        `\n*Please verify with official local meteorological sources (IMD/Disaster Management) before travel.*`;
    }

    if (note) {
      store.pushMessage({ role: 'bot', text: note });
    }
  }

  /**
   * Build a basic itinerary from real selections when the AI composer
   * is unavailable. Uses ONLY what the user actually selected — never
   * invents a place, price, or detail.
   */
  _buildFallbackItinerary(trip) {
    const days = trip.duration || 3;
    const result = [];

    for (let i = 0; i < days; i++) {
      const day = {
        dayNumber: i + 1,
        date: this._dayLabel(trip.startDate, i),
        title:
          i === 0 ? 'Arrival' : i === days - 1 ? 'Departure' : `Day ${i + 1}`,
        theme: i === 0 ? 'Travel' : 'Explore',
        themeType: i === 0 ? 'travel' : 'explore',
        stops: [],
      };

      if (i === 0) {
        // ── Arrival day ──
        if (trip.selectedFlight) {
          day.stops.push({
            time:
              trip.selectedFlight.arrival_time ||
              trip.selectedFlight.arrivalTime ||
              'Morning',
            title: `Arrive at ${trip.destination}`,
            description: trip.selectedFlight.airline
              ? `${trip.selectedFlight.airline} flight`
              : 'Arrival',
            isComplete: false,
          });
        }

        if (trip.selectedHotel) {
          day.stops.push({
            time: 'Afternoon',
            title: `Check in: ${trip.selectedHotel.name}`,
            description: trip.selectedHotel.formattedAddress || '',
            photo: trip.selectedHotel.photo || null,
            isComplete: false,
          });
        }
      } else if (i < days - 1) {
        // ── Middle days — distribute places evenly ──
        const middleDays = Math.max(1, days - 2);
        const perDay = Math.ceil(
          (trip.selectedPlaces?.length || 0) / middleDays
        );
        const startIdx = (i - 1) * perDay;
        const dayPlaces = (trip.selectedPlaces || []).slice(
          startIdx,
          startIdx + perDay
        );

        const timeSlots = ['Morning', 'Late Morning', 'Afternoon', 'Evening'];
        dayPlaces.forEach((p, pi) => {
          day.stops.push({
            time: timeSlots[pi] || 'Afternoon',
            title: p.name,
            description: p.formattedAddress || '',
            photo: p.photo || null,
            isComplete: false,
          });
        });

        // Add a restaurant for dinner if available
        const restIdx = i - 1;
        const restaurant = (trip.selectedRestaurants || [])[restIdx];
        if (restaurant) {
          day.stops.push({
            time: 'Evening',
            title: `Dinner: ${restaurant.name}`,
            description: restaurant.formattedAddress || '',
            isComplete: false,
          });
        }

        if (day.stops.length === 0) {
          day.showEmptySlot = true;
          day.emptySlotLabel = 'Add activity';
        }
      } else {
        // ── Departure day ──
        if (trip.selectedHotel) {
          day.stops.push({
            time: 'Morning',
            title: `Check out: ${trip.selectedHotel.name}`,
            description: '',
            isComplete: false,
          });
        }

        day.stops.push({
          time: 'Afternoon',
          title: `Depart ${trip.destination}`,
          description: '',
          isComplete: false,
        });
      }

      result.push(day);
    }

    return {
      statusText: `${days} Day${days !== 1 ? 's' : ''} Planned`,
      days: result,
    };
  }

  /** Format a day label from an optional start date + offset. */
  _dayLabel(startDate, offset) {
    if (!startDate) return `Day ${offset + 1}`;
    try {
      const d = new Date(startDate);
      d.setDate(d.getDate() + offset);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return `Day ${offset + 1}`;
    }
  }

  _calculateEstimatedBudget(trip = {}, itinerary = {}) {
    const duration = Math.max(1, trip.duration || itinerary.days?.length || 3);
    const travelers = Math.max(1, trip.travelers || 1);
    const tier = (trip.budgetTier || 'moderate').toLowerCase();
    const customBudget = trip.customBudget || null;

    // 1. Flights / Transit
    let flightCost = 0;
    if (trip.selectedFlight?.price) {
      const rawNum = parseInt(String(trip.selectedFlight.price).replace(/[^0-9]/g, ''), 10);
      flightCost = !isNaN(rawNum) && rawNum > 0 ? rawNum * travelers : (tier === 'luxury' ? 14000 : tier === 'budget' ? 4500 : 8000) * travelers;
    } else {
      flightCost = (tier === 'luxury' ? 14000 : tier === 'budget' ? 4500 : 8000) * travelers;
    }

    // 2. Stay / Accommodation
    let stayCost = 0;
    const nights = Math.max(1, duration - 1);
    if (trip.selectedHotel?.price) {
      const rawNum = parseInt(String(trip.selectedHotel.price).replace(/[^0-9]/g, ''), 10);
      stayCost = !isNaN(rawNum) && rawNum > 0 ? rawNum * nights : (tier === 'luxury' ? 9500 : tier === 'budget' ? 1500 : 4000) * nights;
    } else {
      stayCost = (tier === 'luxury' ? 9500 : tier === 'budget' ? 1500 : 4000) * nights;
    }

    // 3. Food & Dining
    const dailyFoodRate = tier === 'luxury' ? 2400 : tier === 'budget' ? 600 : 1200;
    const foodCost = dailyFoodRate * duration * travelers;

    // 4. Activities & Sightseeing
    const dailyActivityRate = tier === 'luxury' ? 1800 : tier === 'budget' ? 400 : 900;
    const activitiesCost = dailyActivityRate * duration * travelers;

    const totalCost = flightCost + stayCost + foodCost + activitiesCost;

    return {
      flights: flightCost,
      stay: stayCost,
      food: foodCost,
      activities: activitiesCost,
      total: totalCost,
      customBudget,
      targetBudget: customBudget || (tier === 'luxury' ? 50000 : tier === 'budget' ? 10000 : 25000),
      currency: '₹ INR',
    };
  }
}

/**
 * Formats a fetchedAt timestamp into a human-readable "as of [time]" freshness label.
 * @param {number|string|Date} fetchedAt
 * @returns {string} e.g. "as of 14 minutes ago" or "as of just now"
 */
export function formatWeatherFreshness(fetchedAt) {
  if (!fetchedAt) return 'as of just now';
  const now = Date.now();
  const diffMs = Math.max(0, now - Number(fetchedAt));
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'as of just now';
  if (diffMinutes === 1) return 'as of 1 minute ago';
  if (diffMinutes < 60) return `as of ${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'as of 1 hour ago';
  return `as of ${diffHours} hours ago`;
}
