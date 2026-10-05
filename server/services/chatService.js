// server/services/chatService.js
// ──────────────────────────────────────────────────────────────────────
// Orchestrates the AI intake pipeline for POST /api/chat.
//
// Responsibilities per stage:
//   PARSING / CLARIFYING  → Gemini extracts structured trip fields from
//                           free-form text (parseInput prompt).
//   COMPOSING             → Gemini sequences real user selections into a
//                           day-by-day itinerary (composeItinerary prompt).
//   *                     → All other stages return a lightweight
//                           acknowledgement; the conversation engine on
//                           the client drives the flow.
//
// Anti-fabrication contract (inherited from prompt templates):
//   - Parse step: only surface what the user explicitly said.
//   - Compose step: sequence only the user-approved real selections.
//   - This service never invents destinations, hotels, flights, or facts.
// ──────────────────────────────────────────────────────────────────────

import { generateJSON, generateText } from './gemini.js';
import {
  buildParseInputPrompt,
  PARSE_INPUT_SYSTEM_INSTRUCTION,
} from '../prompts/parseInput.js';
import {
  buildComposeItineraryPrompt,
  COMPOSE_ITINERARY_SYSTEM_INSTRUCTION,
} from '../prompts/composeItinerary.js';

/* ── Stage handler dispatch ──────────────────────────────────────────── */

/**
 * Main entry point called by the /api/chat route.
 *
 * @param {object} params
 * @param {string} params.message   - Raw user message text
 * @param {object} params.tripState - Current accumulated trip state from client
 * @param {string} params.stage     - Current state machine stage
 * @returns {Promise<object>}       - Response object for the client
 */
export async function handleChatTurn({ message, tripState = {}, stage = 'WELCOME', onProgress = null }) {
  switch (stage) {
    case 'PARSING':
    case 'CLARIFYING':
      return handleParseStage(message, tripState);

    case 'COMPOSING':
      // Special sentinel sent by the conversation engine to trigger AI composition
      if (message === 'compose_itinerary') {
        return handleComposeStage(tripState, onProgress);
      }
      // If a real user message arrives during COMPOSING, just acknowledge
      return { reply: "Give me a moment — composing your itinerary…", stage };

    case 'DONE':
      return handleDoneFollowUp(message, tripState);

    default:
      // WELCOME, FLIGHT_PREFS, HOTEL_PREFS, etc. — the client state machine
      // handles these stages entirely on the client side. The server just
      // acknowledges so the engine can tell the backend is alive.
      return {
        reply: null,
        stage,
        timestamp: Date.now(),
      };
  }
}

/* ── Parse & Clarify ─────────────────────────────────────────────────── */

/**
 * Calls Gemini to extract structured trip fields from a free-form message.
 * Returns extracted fields and the list of still-missing critical fields.
 *
 * @param {string} message
 * @param {object} existingTrip - already-accumulated trip state
 * @returns {Promise<{reply: string|null, extracted: object, missing: string[]}>}
 */
async function handleParseStage(message, existingTrip = {}) {
  // Combine the new message with what we already know so Gemini
  // has full context — but instruct it to extract only what's stated.
  const enriched = buildParseInputPrompt(message, existingTrip);

  let parsed;
  try {
    parsed = await generateJSON(enriched, PARSE_INPUT_SYSTEM_INSTRUCTION);
  } catch (err) {
    console.warn('[chatService] Gemini parse failed, returning empty extracted:', err.message);
    // Graceful degradation — conversation engine has a client-side fallback
    return {
      reply: null,
      extracted: {},
      missing: ['travelers', 'homeCity', 'dates'],
      timestamp: Date.now(),
    };
  }

  const { extracted = {}, missing = [], suggestedReply = null } = parsed || {};

  // If destination was already confirmed, and Gemini extracted a destination that differs,
  // treat the new extraction as the departure city (homeCity) if homeCity was missing.
  let resolvedHomeCity = extracted.homeCity || existingTrip.homeCity || null;
  if (!resolvedHomeCity && existingTrip.destination && extracted.destination && extracted.destination.toLowerCase() !== existingTrip.destination.toLowerCase()) {
    resolvedHomeCity = extracted.destination;
  }

  // Merge extracted fields with what we already know
  const merged = {
    ...extracted,
    // Preserve already-set fields from previous turns
    destination:    existingTrip.destination || extracted.destination || null,
    travelers:      existingTrip.travelers   || extracted.travelers   || null,
    homeCity:       resolvedHomeCity,
    // Prefer new extraction for timing/dates since the user may be refining
    startDate:      extracted.timing || existingTrip.startDate || null,
    duration:       extracted.duration || existingTrip.duration || null,
    dates:          extracted.timing || existingTrip.dates || null,
    interests:      extracted.interests?.length
      ? extracted.interests
      : (existingTrip.interests || []),
    budgetTier:     extracted.budgetTier || existingTrip.budgetTier || null,
    pacePreference: extracted.pacePreference || existingTrip.pacePreference || existingTrip.pace || null,
    cabinClass:     extracted.cabinClass || existingTrip.cabinClass || null,
    hotelStyle:     extracted.hotelStyle || existingTrip.hotelStyle || null,
    dietary:        extracted.dietary?.length ? extracted.dietary : (existingTrip.dietary || []),
  };

  return {
    reply:     suggestedReply || null,
    extracted: merged,
    missing,
    timestamp: Date.now(),
  };
}

/* ── Compose Itinerary ───────────────────────────────────────────────── */

/**
 * Calls Gemini to sequence the user's real, approved selections into a
 * day-by-day itinerary. Never adds or invents items.
 *
 * @param {object} tripState - Full accumulated trip state with all selections
 * @returns {Promise<{itinerary: object, stage: string}>}
 */
async function handleComposeStage(tripState, onProgress = null) {
  // Reshape the client's trip state into the shape composeItinerary.js expects
  const tripForCompose = buildTripPayload(tripState);
  const dest = tripState.destination || 'your destination';

  if (onProgress) onProgress(`Sequencing itinerary stops and route timing for ${dest}…`);

  let raw;
  try {
    const prompt = buildComposeItineraryPrompt(tripForCompose);
    // 12-second timeout so user never waits more than 12s for composition
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Composition timed out after 12s')), 12000)
    );
    raw = await Promise.race([
      generateJSON(prompt, COMPOSE_ITINERARY_SYSTEM_INSTRUCTION),
      timeoutPromise,
    ]);
    if (onProgress) onProgress(`Organizing daily schedules and activity blocks…`);
  } catch (err) {
    console.warn('[chatService] Gemini compose failed or timed out:', err.message);
    // Return null — conversation engine has a rich client-side fallback composer
    return {
      reply: null,
      itinerary: null,
      stage: 'DONE',
      timestamp: Date.now(),
    };
  }

  if (!raw?.days || !Array.isArray(raw.days)) {
    console.warn('[chatService] Gemini compose returned unexpected shape:', raw);
    return {
      reply: null,
      itinerary: null,
      stage: 'DONE',
      timestamp: Date.now(),
    };
  }

  // Normalise the AI output into the itinerary shape ItineraryPanel expects
  const itinerary = normaliseItinerary(raw, tripState);

  return {
    reply: null,
    itinerary,
    stage: 'DONE',
    timestamp: Date.now(),
  };
}

/* ── Post-completion follow-up (DONE stage) ──────────────────────────── */

/**
 * When the user asks a follow-up question after the itinerary is done,
 * use Gemini for a grounded conversational reply.
 */
async function handleDoneFollowUp(message, tripState) {
  const dest = tripState.destination || 'your destination';

  const systemInstruction =
    `You are Trailmate, an AI travel assistant. The traveler has already ` +
    `completed their trip plan for ${dest}. Answer their follow-up question ` +
    `helpfully and concisely. Only reference places and facts that are in ` +
    `their confirmed itinerary or stated trip data — never fabricate new ` +
    `recommendations. If you don't have enough data to answer, say so honestly.`;

  const prompt =
    `TRIP SUMMARY:\n${JSON.stringify(tripState, null, 2)}\n\n` +
    `TRAVELER'S QUESTION:\n"${message}"`;

  try {
    const reply = await generateText(prompt, systemInstruction);
    return { reply: reply || "I'm here to help — ask me anything about your trip!", stage: 'DONE', timestamp: Date.now() };
  } catch {
    return {
      reply: "I'm here to help! Try the swap or add buttons in the itinerary panel.",
      stage: 'DONE',
      timestamp: Date.now(),
    };
  }
}

/* ── Shape helpers ───────────────────────────────────────────────────── */

/**
 * Reshapes the client trip state into the payload composeItinerary.js expects.
 */
function buildTripPayload(trip) {
  return {
    tripSummary: {
      destination: trip.destination,
      travelers:   trip.travelers,
      duration:    trip.duration,
      dates: {
        start: trip.startDate || trip.dates || null,
        end:   null, // client doesn't track end date separately
      },
      budgetTier:  trip.budgetTier,
      interests:   trip.interests || [],
    },
    selectedFlight:      trip.selectedFlight      || null,
    selectedHotel:       trip.selectedHotel       || null,
    selectedPlaces:      trip.selectedPlaces      || [],
    selectedRestaurants: trip.selectedRestaurants || [],
    interests:           trip.interests           || [],
    homeTimezone:        'Asia/Kolkata',         // All demo cities are IST
    destinationTimezone: 'Asia/Kolkata',
  };
}

/**
 * Converts Gemini's compose output into the ItineraryPanel component shape.
 * Only passes through fields that are present — never fabricates.
 */
function normaliseItinerary(raw, trip) {
  const dest = trip.destination || 'Your Trip';
  const duration = raw.days.length;

  const days = raw.days.map((d, idx) => {
    // Map themeColor → themeType for ItineraryDay
    const themeTypeMap = {
      nature:    'nature',
      heritage:  'heritage',
      food:      'food',
      beach:     'beach',
      adventure: 'adventure',
    };

    const stops = [
      ...(d.stops || []).map(s => ({
        time:        s.time || 'Morning',
        title:       s.name,
        description: s.why || '',
        isComplete:  false,
      })),
      ...(d.restaurants || []).map(r => ({
        time:        r.meal === 'lunch' ? 'Lunch' : 'Dinner',
        title:       r.name,
        description: r.why || '',
        isComplete:  false,
      })),
    ];

    // Arrival day: prepend flight stop if present
    if (idx === 0 && trip.selectedFlight) {
      const f = trip.selectedFlight;
      stops.unshift({
        time:        f.arrival_time || f.arrivalTime || 'Morning',
        title:       `Arrive ${dest}`,
        description: f.airline ? `${f.airline} flight` : 'Arrival',
        isComplete:  false,
      });
    }

    // Arrival day: hotel check-in if present
    if (idx === 0 && trip.selectedHotel) {
      const h = trip.selectedHotel;
      stops.push({
        time:        'Afternoon',
        title:       `Check in: ${h.name}`,
        description: h.formattedAddress || '',
        photo:       h.photo || null,
        isComplete:  false,
      });
    }

    return {
      dayNumber: d.day || idx + 1,
      date:      d.date || `Day ${idx + 1}`,
      title:     d.theme || `Day ${idx + 1}`,
      theme:     d.theme || 'Explore',
      themeType: themeTypeMap[d.themeColor] || 'explore',
      stops,
    };
  });

  return {
    statusText: `${duration} Day${duration !== 1 ? 's' : ''} Planned`,
    days,
  };
}
