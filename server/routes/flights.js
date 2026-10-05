/**
 * flights.js — Flight Search Route (Live Microservice, Never Cached)
 * GET /api/flights/search
 *
 * Query parameters:
 *   - from: Origin IATA/city (e.g. DEL, Delhi)
 *   - to: Destination IATA/city (e.g. CJB, Ooty)
 *   - date: YYYY-MM-DD
 *   - passengers: number (default 1)
 *   - cabin: 'economy'|'premium'|'business'
 *
 * Note: Flight data is NEVER cached. Every request hits flightService.js live.
 */

import { Router } from 'express';
import { searchFlights, findNearestAirport } from '../services/flightService.js';
import { getLastMileFare } from '../services/lastMileService.js';
import { validateQuery } from '../middleware/validate.js';
import { flightSearchSchema } from '../schemas/index.js';

const router = Router();

router.get('/search', validateQuery(flightSearchSchema), async (req, res, next) => {
  try {
    const { from, to, date, passengers = 1, cabin = 'economy' } = req.query;

    const originInfo = findNearestAirport(from);
    const destInfo = findNearestAirport(to);

    if (!originInfo) {
      return res.status(400).json({
        flights: [],
        error: `Could not identify an airport for origin "${from}". Please specify a departure airport or nearest major city.`,
      });
    }

    if (!destInfo) {
      return res.status(400).json({
        flights: [],
        error: `Could not identify an airport for destination "${to}". Please specify a destination airport or nearest major city.`,
      });
    }

    const now = new Date();
    const fetchedAt = now.getTime();
    const fetchedAtIso = now.toISOString();

    // Directly search flights live via microservice (never cached)
    const result = await searchFlights(
      originInfo.iata,
      destInfo.iata,
      date,
      Number(passengers),
      cabin
    );

    const flightsList = result.flights || [];

    res.json({
      flights: flightsList,
      error: result.error || null,
      cached: false,
      source: result.source || 'microservice-live',
      count: flightsList.length,
      origin: originInfo,
      destination: destInfo,
      fetchedAt,
      fetchedAtIso,
      freshnessLabel: `Live schedule as of ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      params: { from, to, date, passengers: Number(passengers), cabin },
    });
  } catch (error) {
    console.error('[Flight Route Error]', error.message);
    res.status(500).json({
      flights: [],
      error: error.message || 'Flight search service error',
    });
  }
});

/**
 * GET /api/flights/last-mile-fare
 * Google Search-grounded last-mile transport pricing and routing.
 */
router.get('/last-mile-fare', async (req, res) => {
  try {
    const {
      fromAirport,
      fromAirportName,
      destination,
      budgetTier = 'moderate',
      pacePreference = 'balanced',
      preferredClass = 'All',
    } = req.query;

    if (!fromAirport || !destination) {
      return res.status(400).json({
        error: 'Missing required query parameters: "fromAirport" and "destination" are mandatory.',
      });
    }

    const result = await getLastMileFare({
      fromAirport,
      fromAirportName,
      destination,
      budgetTier,
      pacePreference,
      preferredClass,
    });

    res.json(result);
  } catch (err) {
    console.error('[Last-Mile Route Error]', err.message);
    res.status(500).json({
      error: err.message || 'Failed to retrieve last-mile ground transport fares.',
      fallback: true,
    });
  }
});

export default router;

