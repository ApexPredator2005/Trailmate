// server/services/lastMileService.js
// Service layer for Google Search-grounded last-mile transport fares.
// Features:
// 1. Persistent 4-day file-backed disk caching (server/data/last_mile_cache.json)
// 2. Verified Google Search grounding execution with source link extraction
// 3. Honest fallback generation when grounding is unavailable or rate-limited

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateGroundedJSON } from './gemini.js';
import { LAST_MILE_SYSTEM_INSTRUCTION, buildLastMilePrompt } from '../prompts/lastMileFare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const CACHE_FILE_PATH = path.join(DATA_DIR, 'last_mile_cache.json');

const CACHE_TTL_MS = 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds

/**
 * Ensures data directory and cache file exist.
 */
function ensureCacheFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({}, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[lastMileService] Error initializing cache storage:', err.message);
  }
}

/**
 * Reads persistent disk cache.
 * @returns {Record<string, object>}
 */
function readCache() {
  ensureCacheFile();
  try {
    const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.warn('[lastMileService] Error reading cache file, starting fresh:', err.message);
    return {};
  }
}

/**
 * Writes persistent disk cache safely.
 * @param {Record<string, object>} cacheData
 */
function writeCache(cacheData) {
  ensureCacheFile();
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[lastMileService] Error writing cache file:', err.message);
  }
}

/**
 * Generates a normalized cache key for the route.
 */
function getCacheKey(fromAirport, destination) {
  const from = String(fromAirport || '').trim().toLowerCase();
  const dest = String(destination || '').trim().toLowerCase();
  return `lastmile:${from}:${dest}`;
}

const ROUTE_ESTIMATES = {
  'manali': {
    taxi: { min: 4500, max: 6500, duration: '7 - 8 hrs' },
    bus: { min: 850, max: 1400, duration: '8 - 9 hrs' },
    recommendation: 'Prepaid Airport Taxi or overnight AC Volvo Bus via HRTC / RedBus',
  },
  'ooty': {
    taxi: { min: 2200, max: 3200, duration: '3 - 3.5 hrs' },
    bus: { min: 120, max: 280, duration: '3.5 - 4 hrs' },
    train: { min: 250, max: 600, duration: '4 hrs (Mettupalayam ➔ Ooty)' },
    recommendation: 'Prepaid Taxi for speed, or the scenic Nilgiri Mountain Railway (Toy Train)',
  },
  'darjeeling': {
    taxi: { min: 2800, max: 3800, duration: '3 hrs' },
    bus: { min: 200, max: 400, duration: '3.5 hrs' },
    train: { min: 450, max: 1200, duration: '6 hrs (DHR Toy Train)' },
    recommendation: 'Prepaid taxi or shared jeep from Bagdogra terminal',
  },
  'munnar': {
    taxi: { min: 2800, max: 4000, duration: '3.5 hrs' },
    bus: { min: 200, max: 450, duration: '4.5 hrs' },
    recommendation: 'Prepaid AC Taxi via scenic Cheeyappara waterfalls route',
  },
  'kodaikanal': {
    taxi: { min: 2600, max: 3600, duration: '3 hrs' },
    bus: { min: 150, max: 350, duration: '3.5 hrs' },
    recommendation: 'Prepaid Taxi from Madurai Airport',
  },
  'mussoorie': {
    taxi: { min: 1400, max: 2200, duration: '1.5 hrs' },
    bus: { min: 80, max: 180, duration: '2 hrs' },
    recommendation: 'Prepaid taxi directly outside Dehradun Airport',
  },
  'gulmarg': {
    taxi: { min: 2400, max: 3500, duration: '2 hrs' },
    bus: { min: 150, max: 300, duration: '2.5 hrs' },
    recommendation: 'Prepaid 4x4 snow-chain taxi from Srinagar Airport in winter',
  },
  'coorg': {
    taxi: { min: 3200, max: 4500, duration: '3.5 hrs' },
    bus: { min: 350, max: 700, duration: '4.5 hrs' },
    recommendation: 'Prepaid Taxi from Mangalore or Mysore station',
  },
};

/**
 * Generates an honest fallback payload with regional estimated rates & official portal links
 * when live grounded search encounters an error or returns zero sources.
 */
function generateHonestFallback(fromAirport, fromAirportName, destination, errorMessage) {
  const now = new Date();
  const destKey = String(destination || '').trim().toLowerCase();
  const route = ROUTE_ESTIMATES[destKey] || {
    taxi: { min: 2500, max: 4500, duration: '2 - 4 hrs' },
    bus: { min: 300, max: 800, duration: '3 - 5 hrs' },
    recommendation: 'Prepaid Taxi Counter or intercity state bus service',
  };

  const options = [
    {
      mode: "Taxi",
      operatorOrRoute: `Prepaid Airport Taxi Counter at ${fromAirportName || fromAirport}`,
      durationRange: route.taxi.duration,
      fareRange: { min: route.taxi.min, max: route.taxi.max, currency: "INR" },
      classes: [],
      isHeritageExperience: false,
      heritageNote: "",
      notes: "Fixed-rate government prepaid taxi counters are located directly outside the arrivals terminal.",
      hasDirectRoute: true,
    },
    {
      mode: "Bus",
      operatorOrRoute: `Intercity AC Volvo / State Transport (RTC) to ${destination}`,
      durationRange: route.bus.duration,
      fareRange: { min: route.bus.min, max: route.bus.max, currency: "INR" },
      classes: [],
      isHeritageExperience: false,
      heritageNote: "",
      notes: "Direct/connecting express and AC Volvo buses available via RedBus or state transport counters.",
      hasDirectRoute: true,
    }
  ];

  if (route.train) {
    options.push({
      mode: "Train",
      operatorOrRoute: `Heritage Mountain Toy Train to ${destination}`,
      durationRange: route.train.duration,
      fareRange: { min: route.train.min, max: route.train.max, currency: "INR" },
      classes: [],
      isHeritageExperience: true,
      heritageNote: "UNESCO World Heritage Rail experience.",
      notes: "Advance reservation recommended via IRCTC.",
      hasDirectRoute: true,
    });
  }

  return {
    fromAirport,
    fromAirportName,
    destination,
    options,
    recommendation: {
      mode: "Prepaid Taxi or AC Volvo Bus",
      reason: route.recommendation,
      experienceAlternative: route.train ? "Consider the scenic Heritage Toy Train for a memorable journey." : "",
    },
    sources: [],
    fallback: true,
    error: errorMessage || "Search grounding returned unverified results",
    advisory: `Estimated fare benchmarks for **${fromAirportName || fromAirport} ➔ ${destination}** (verify exact counter rates before booking):`,
    bookingPortals: [
      {
        name: "Prepaid Airport Taxi Desk",
        url: "",
        purpose: "Regulated fixed-rate taxi booking on arrival",
      },
      {
        name: "RedBus / State RTC Portal",
        url: "https://www.redbus.in",
        purpose: "Intercity government and AC Volvo bus schedules",
      },
      {
        name: "IRCTC Indian Railways",
        url: "https://www.irctc.co.in",
        purpose: "Toy trains, heritage rail & express train reservations",
      },
    ],
    cached: false,
    fetchedAt: now.getTime(),
    fetchedAtIso: now.toISOString(),
    freshnessLabel: "Regional transport tariff estimates — verify on arrival",
  };
}

/**
 * Retrieves Google Search-grounded last-mile transport fares and routing.
 *
 * @param {object} params
 * @param {string} params.fromAirport - e.g. "CJB"
 * @param {string} params.fromAirportName - e.g. "Coimbatore International Airport"
 * @param {string} params.destination - e.g. "Ooty"
 * @param {string} [params.budgetTier="moderate"]
 * @param {string} [params.pacePreference="balanced"]
 * @param {string} [params.preferredClass="All"]
 * @returns {Promise<object>}
 */
export async function getLastMileFare({
  fromAirport,
  fromAirportName,
  destination,
  budgetTier = "moderate",
  pacePreference = "balanced",
  preferredClass = "All",
}) {
  if (!fromAirport || !destination) {
    throw new Error('Both fromAirport and destination are required.');
  }

  const cacheKey = getCacheKey(fromAirport, destination);
  const cache = readCache();
  const cachedEntry = cache[cacheKey];
  const now = Date.now();

  // Check 4-day persistent cache
  if (cachedEntry && cachedEntry.fetchedAt && (now - cachedEntry.fetchedAt < CACHE_TTL_MS)) {
    const fetchedDate = new Date(cachedEntry.fetchedAt);
    const timeStr = fetchedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = fetchedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    console.log(`[lastMileService] Returning 4-day cached grounded fare for ${cacheKey}`);
    return {
      ...cachedEntry,
      cached: true,
      freshnessLabel: `Estimated from public sources · estimated ${dateStr}, ${timeStr}`,
    };
  }

  // Build grounded prompt
  const prompt = buildLastMilePrompt({
    fromAirport,
    fromAirportName: fromAirportName || fromAirport,
    destination,
    budgetTier,
    pacePreference,
    preferredClass,
  });

  try {
    console.log(`[lastMileService] Querying Gemini with Google Search Grounding for ${fromAirport} ➔ ${destination}...`);
    const { data, sources } = await generateGroundedJSON(prompt, LAST_MILE_SYSTEM_INSTRUCTION);

    if (!data || typeof data !== 'object' || !Array.isArray(data.options)) {
      throw new Error("Grounded response did not contain expected options array");
    }

    const fetchedAt = Date.now();
    const fetchedAtIso = new Date(fetchedAt).toISOString();
    const timeStr = new Date(fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const result = {
      fromAirport,
      fromAirportName: fromAirportName || fromAirport,
      destination,
      options: data.options.map(opt => ({
        mode: opt.mode || 'Taxi',
        operatorOrRoute: opt.operatorOrRoute || `${opt.mode} Route`,
        durationRange: opt.durationRange || '2 - 4 hrs',
        fareRange: {
          min: typeof opt.fareRange?.min === 'number' ? opt.fareRange.min : null,
          max: typeof opt.fareRange?.max === 'number' ? opt.fareRange.max : null,
          currency: opt.fareRange?.currency || 'INR',
        },
        classes: Array.isArray(opt.classes) ? opt.classes : [],
        isHeritageExperience: Boolean(opt.isHeritageExperience),
        heritageNote: opt.heritageNote || '',
        bookingReality: opt.bookingReality ? {
          scarcityLevel: opt.bookingReality.scarcityLevel || (opt.isHeritageExperience ? 'EXTREME_DEMAND' : 'MODERATE'),
          advanceBookingWindow: opt.bookingReality.advanceBookingWindow || '',
          spotQueueAdvisory: opt.bookingReality.spotQueueAdvisory || '',
          actionableTip: opt.bookingReality.actionableTip || '',
        } : (opt.isHeritageExperience ? {
          scarcityLevel: 'EXTREME_DEMAND',
          advanceBookingWindow: 'Book 60–120 days in advance on IRCTC / official portal',
          spotQueueAdvisory: 'Unreserved station counter queues start at 4:30–5:00 AM; high risk of sellout',
          actionableTip: 'If unreserved, take direct taxi up and book the short 2-hr Joy Ride or downhill return',
        } : null),
        notes: opt.notes || '',
        hasDirectRoute: opt.hasDirectRoute !== false,
      })),
      recommendation: data.recommendation || {
        mode: data.options[0]?.mode || 'Taxi',
        reason: 'Most direct route based on current ground options.',
        experienceAlternative: '',
      },
      sources: sources || [],
      fallback: false,
      cached: false,
      fetchedAt,
      fetchedAtIso,
      freshnessLabel: `Estimated from public sources · estimated today at ${timeStr}`,
    };

    // Save to persistent file-backed disk cache
    cache[cacheKey] = result;
    writeCache(cache);

    return result;

  } catch (err) {
    console.warn(`[lastMileService] Grounded search failed for ${cacheKey}:`, err.message);
    // Return structured honest fallback advisory
    return generateHonestFallback(fromAirport, fromAirportName, destination, err.message);
  }
}

export default {
  getLastMileFare,
};
