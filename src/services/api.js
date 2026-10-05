/**
 * api.js — Frontend Client API Service
 *
 * Interfaces with the Express backend (/api/* endpoints):
 *   - /api/chat             (POST: send user message, state, and stage)
 *   - /api/flights/search   (GET: search flights via Python microservice proxy)
 *   - /api/places/search    (GET: search hotels, sights, restaurants via Google Places)
 *   - /api/places/details   (GET: place details & verified reviews)
 *   - /api/weather/forecast (GET: destination weather forecast)
 */

const BASE_URL = '/api';

/**
 * Generic fetch wrapper with JSON error handling, abort signals, and timeout.
 * @param {string} endpoint
 * @param {RequestInit & { timeoutMs?: number }} [options]
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { timeoutMs = 30000, signal: externalSignal, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);

  // If caller provided an external abort signal, listen to it
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      throw new Error('Request aborted by caller');
    }
    externalSignal.addEventListener('abort', () => {
      controller.abort(externalSignal.reason);
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  const config = {
    ...fetchOptions,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error) errorMsg = errorData.error;
      } catch (e) {
        // Fall back to HTTP status text
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`[API Aborted] ${endpoint}: Request was aborted or timed out.`);
    } else {
      console.error(`[API Error] ${endpoint}:`, error.message);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  /**
   * Send a chat turn to the backend conversation & intake engine.
   * @param {object} payload
   * @param {string} payload.message   - User message or chip value
   * @param {object} payload.tripState - Current accumulated trip state
   * @param {string} payload.stage     - Current state machine stage
   * @returns {Promise<{reply: string, stage: string, extracted?: object, chips?: Array, cards?: Array, itinerary?: object}>}
   */
  async sendChat({ message, tripState = {}, stage = 'WELCOME' }) {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, tripState, stage }),
    });
  },

  /**
   * Stream a chat turn (e.g. COMPOSING) using SSE.
   * @param {object} payload
   * @param {string} payload.message
   * @param {object} payload.tripState
   * @param {string} payload.stage
   * @param {function} [payload.onProgress] - Called with progress status string
   * @returns {Promise<object>} - The final done payload
   */
  async sendChatStream({ message, tripState = {}, stage = 'COMPOSING', onProgress = null }) {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tripState, stage }),
    });

    if (!res.ok) {
      throw new Error(`Streaming failed: HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('ReadableStream not supported on response body');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || ''; // Keep incomplete trailing chunk

      for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split('\n');
        let eventType = 'message';
        let eventData = null;

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            try {
              eventData = JSON.parse(line.replace('data:', '').trim());
            } catch {
              eventData = line.replace('data:', '').trim();
            }
          }
        }

        if (eventType === 'progress' && onProgress && eventData?.text) {
          onProgress(eventData.text);
        } else if (eventType === 'done' && eventData) {
          finalResult = eventData;
        } else if (eventType === 'error') {
          throw new Error(eventData?.message || 'Server composition stream error');
        }
      }
    }

    return finalResult || {};
  },

  /**
   * Search flights via the backend flight service.
   * @param {object} params
   * @param {string} params.from         - Origin IATA or city
   * @param {string} params.to           - Destination IATA or city
   * @param {string} params.date         - YYYY-MM-DD
   * @param {number} [params.passengers] - Default 1
   * @param {string} [params.cabin]      - 'economy'|'premium'|'business'
   */
  async searchFlights({ from, to, date, passengers = 1, cabin = 'economy' }) {
    const query = new URLSearchParams({
      from,
      to,
      date,
      passengers: String(passengers),
      cabin,
    }).toString();

    return request(`/flights/search?${query}`);
  },

  /**
   * Search places (hotels, tourist spots, restaurants) via Places API.
   * @param {object} params
   * @param {string} params.query
   * @param {string} [params.type]
   * @param {string} [params.location] - 'lat,lng'
   * @param {number} [params.radius]   - in meters
   * @param {number} [params.maxResults]
   * @param {boolean} [params.rank]
   * @param {string} [params.candidateType]
   * @param {string} [params.budgetTier]
   * @param {string} [params.interests]
   * @param {boolean} [params.hasFoodInterest]
   */
  async searchPlaces({ query, type, location, radius, maxResults = 10, rank, candidateType, budgetTier, interests, hasFoodInterest } = {}) {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);
    if (type) searchParams.append('type', type);
    if (location) searchParams.append('location', location);
    if (radius) searchParams.append('radius', String(radius));
    if (maxResults) searchParams.append('maxResults', String(maxResults));
    if (rank) searchParams.append('rank', 'true');
    if (candidateType) searchParams.append('candidateType', candidateType);
    if (budgetTier) searchParams.append('budgetTier', budgetTier);
    if (interests) searchParams.append('interests', Array.isArray(interests) ? interests.join(',') : String(interests));
    if (hasFoodInterest) searchParams.append('hasFoodInterest', 'true');

    return request(`/places/search?${searchParams.toString()}`);
  },

  /**
   * Retrieve detailed information for a specific place.
   * @param {string} placeId
   * @param {object} [options]
   * @param {boolean} [options.includeReviews]
   * @param {boolean} [options.includePriceLevel]
   */
  async getPlaceDetails(placeId, { includeReviews = false, includePriceLevel = false } = {}) {
    const searchParams = new URLSearchParams();
    if (includeReviews) searchParams.append('includeReviews', 'true');
    if (includePriceLevel) searchParams.append('includePriceLevel', 'true');

    const qs = searchParams.toString();
    return request(`/places/details/${encodeURIComponent(placeId)}${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieve weather forecast for a destination.
   * @param {string} location - City name or 'lat,lng'
   * @param {number} [days=3]
   * @param {boolean} [force=false]
   */
  async getWeather(location, days = 3, force = false) {
    const searchParams = new URLSearchParams({
      location,
      days: String(days),
    });
    if (force) {
      searchParams.append('force', 'true');
    }

    return request(`/weather/forecast?${searchParams.toString()}`);
  },

  /**
   * Retrieve severe weather alerts for a location.
   * @param {string} location - City name or 'lat,lng'
   */
  async getWeatherAlerts(location) {
    const searchParams = new URLSearchParams({
      location,
    });

    return request(`/weather/alerts?${searchParams.toString()}`);
  },

  /**
   * Retrieve live 5-day cached hotel price from StayAPI.
   * @param {object} params
   */
  async getHotelPrice({ hotelId, hotelName, checkIn, checkOut, guests = 2 }) {
    const searchParams = new URLSearchParams();
    if (hotelId) searchParams.append('hotelId', hotelId);
    if (hotelName) searchParams.append('hotelName', hotelName);
    if (checkIn) searchParams.append('checkIn', checkIn);
    if (checkOut) searchParams.append('checkOut', checkOut);
    searchParams.append('guests', String(guests));

    return request(`/places/hotel-price?${searchParams.toString()}`);
  },

  /**
   * Retrieve StayAPI quota metrics.
   */
  async getStayQuota() {
    return request('/places/stay-quota');
  },

  /**
   * Retrieve Google Search-grounded last-mile transport fares and routing.
   * @param {object} params
   * @param {string} params.fromAirport
   * @param {string} params.fromAirportName
   * @param {string} params.destination
   * @param {string} [params.budgetTier]
   * @param {string} [params.pacePreference]
   * @param {string} [params.preferredClass]
   */
  async getLastMileFare({ fromAirport, fromAirportName, destination, budgetTier, pacePreference, preferredClass } = {}) {
    const searchParams = new URLSearchParams();
    if (fromAirport) searchParams.append('fromAirport', fromAirport);
    if (fromAirportName) searchParams.append('fromAirportName', fromAirportName);
    if (destination) searchParams.append('destination', destination);
    if (budgetTier) searchParams.append('budgetTier', budgetTier);
    if (pacePreference) searchParams.append('pacePreference', pacePreference);
    if (preferredClass) searchParams.append('preferredClass', preferredClass);

    return request(`/flights/last-mile-fare?${searchParams.toString()}`);
  },
};

/* ── Live Destination Weather Synchronization Registry ──────────────── */

const destWeatherCache = new Map();

/**
 * Format raw temperature and condition into standard card string.
 * @param {number|string} tempC
 * @param {string} [conditionText]
 * @returns {string} e.g. "27°C · Light rain shower" or "N/A · Unavailable"
 */
export function formatWeatherString(tempC, conditionText) {
  let rawTemp = tempC;
  let rawCond = conditionText;

  if (typeof tempC === 'object' && tempC !== null) {
    rawTemp = tempC.temp_c ?? tempC.temp ?? 'N/A';
    rawCond = tempC.condition?.text ?? tempC.condition ?? conditionText;
  }

  let formattedTemp = 'N/A';
  if (rawTemp != null && rawTemp !== 'N/A' && !isNaN(Number(rawTemp))) {
    formattedTemp = `${Math.round(Number(rawTemp))}°C`;
  } else if (rawTemp === 'N/A') {
    formattedTemp = 'N/A';
  }
  const cleanCond = (rawCond || '').trim();
  return cleanCond ? `${formattedTemp} · ${cleanCond}` : formattedTemp;
}

/**
 * Split weather string into temperature and condition text parts.
 * @param {string} weatherString
 * @returns {{ temp: string, cond: string }}
 */
export function parseWeatherParts(weatherString) {
  if (!weatherString) return { temp: 'N/A', cond: '' };
  const str = String(weatherString).trim();
  if (str === 'N/A' || /^(N\/A\s*·?\s*(weather\s*data\s*)?unavailable)$/i.test(str)) {
    return { temp: 'N/A', cond: '' };
  }
  const parts = str.split(' · ');
  if (parts.length >= 2) {
    const temp = parts[0].trim();
    const cond = parts.slice(1).join(' · ').trim();
    if (/unavailable|weather data/i.test(cond)) {
      return { temp, cond: '' };
    }
    return { temp, cond };
  }
  const match = str.match(/^(\d+°C|N\/A)\s*(.*)$/);
  if (match) {
    const temp = match[1];
    const cond = (match[2] || '').trim();
    if (/unavailable|weather data/i.test(cond)) {
      return { temp, cond: '' };
    }
    return { temp, cond };
  }
  return { temp: str, cond: '' };
}

/**
 * Renders HTML string for destination card weather badge.
 * @param {string} weatherString
 * @returns {string}
 */
export function renderWeatherBadgeContent(weatherString) {
  const { temp, cond } = parseWeatherParts(weatherString);
  const safeTemp = (temp || 'N/A').replace(/[<>&"]/g, '');
  const safeCond = (cond || '').replace(/[<>&"]/g, '').trim();
  if (safeTemp === 'N/A' || !safeCond || /unavailable|weather data/i.test(safeCond)) {
    return `<span class="dest-weather-temp font-mono font-bold text-[10.5px] text-white leading-none">N/A</span>`;
  }
  return `<span class="dest-weather-temp font-mono font-bold text-[10.5px] text-white leading-none">${safeTemp}</span><span class="dest-weather-cond text-[9px] text-white/90 leading-tight mt-0.5 text-right font-medium">${safeCond}</span>`;
}

/**
 * Get cached weather string for a destination if available.
 * @param {string} destination
 * @returns {string|null}
 */
export function getCachedDestinationWeather(destination) {
  if (!destination) return null;
  const entry = destWeatherCache.get(destination.trim().toLowerCase());
  return entry ? entry.formatted : null;
}

/**
 * Store destination weather in cache and dispatch a decoupled custom event for UI subscribers.
 * (Decoupled from direct DOM manipulation - Suggestion #20)
 * @param {string} destination
 * @param {string} weatherString
 */
export function setCachedDestinationWeather(destination, weatherString) {
  if (!destination || !weatherString) return;
  const destLower = destination.trim().toLowerCase();

  destWeatherCache.set(destLower, {
    formatted: weatherString,
    fetchedAt: Date.now(),
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('trailmate:weather-update', {
        detail: { destination: destLower, weatherString },
      })
    );
  }
}

// Backward-compatible alias for existing callers
export const syncDestinationCardWeather = setCachedDestinationWeather;

/**
 * Fetch live weather for a single destination and update UI state.
 * @param {string} destination
 * @param {boolean} [force=false]
 * @returns {Promise<string>}
 */
export async function fetchAndSyncDestinationWeather(destination, force = false) {
  if (!destination) return 'N/A';
  const destLower = destination.trim().toLowerCase();

  try {
    const res = await api.getWeather(destination, 1, force);
    const data = res.forecast || res;
    const current = data?.current || data;

    if (current) {
      const weatherStr = formatWeatherString(
        current.temp_c,
        current.condition?.text
      );
      setCachedDestinationWeather(destination, weatherStr);
      return weatherStr;
    }
  } catch (err) {
    console.warn(`[api] Failed to fetch weather for ${destination}:`, err.message);
  }

  const cached = getCachedDestinationWeather(destination);
  if (cached) return cached;

  const fallbackStr = 'N/A · Unavailable';
  setCachedDestinationWeather(destination, fallbackStr);
  return fallbackStr;
}



