/**
 * server/routes/weather.js — Weather Forecast & Alerts Route
 *
 * GET /api/weather/forecast?location=Ooty&days=3
 * GET /api/weather/alerts?location=Ooty
 */

import { Router } from 'express';
import { cache } from '../services/cache.js';
import { getForecast, getAlerts } from '../services/weatherApi.js';
import { validateQuery } from '../middleware/validate.js';
import { weatherForecastSchema } from '../schemas/index.js';

const router = Router();

// EXACTLY 30-minute Cache TTL (1,800,000 ms)
const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;

// GET /api/weather/forecast
router.get('/forecast', validateQuery(weatherForecastSchema), async (req, res, next) => {
  try {
    const { location = 'Ooty', days = 3, force = 'false' } = req.query;
    const cleanLocation = String(location).trim().toLowerCase();
    const cleanDays = Number(days) || 3;
    const isForce = force === 'true' || force === '1';

    // Per-location & per-days composite cache key
    const cacheKey = `weather:forecast:${cleanLocation}:${cleanDays}`;
    const cached = cache.get(cacheKey);

    if (cached && !isForce) {
      return res.json({
        forecast: cached.forecast,
        fetchedAt: cached.fetchedAt,
        cached: true,
        source: 'cache',
      });
    }

    try {
      const data = await getForecast(location, cleanDays);
      const fetchedAt = Date.now();
      const payload = { forecast: data, fetchedAt };
      cache.set(cacheKey, payload, WEATHER_CACHE_TTL_MS); // Exactly 30 min cache
      return res.json({
        forecast: data,
        fetchedAt,
        cached: false,
        source: 'weather-api-live',
      });
    } catch (apiErr) {
      console.warn(`[weather route] Weather API failed (${apiErr.message}). Using fallback forecast.`);

      const fetchedAt = Date.now();
      const fallback = {
        location,
        current: {
          temp_c: 'N/A',
          condition: { text: 'Weather data unavailable', icon: null },
          humidity: null,
          wind_kph: null,
        },
        forecast: {
          forecastday: [
            { date: 'Day 1', day: { maxtemp_c: 'N/A', mintemp_c: 'N/A', condition: { text: 'Weather unavailable' } } },
            { date: 'Day 2', day: { maxtemp_c: 'N/A', mintemp_c: 'N/A', condition: { text: 'Weather unavailable' } } },
            { date: 'Day 3', day: { maxtemp_c: 'N/A', mintemp_c: 'N/A', condition: { text: 'Weather unavailable' } } },
          ],
        },
        alerts: [],
      };

      const payload = { forecast: fallback, fetchedAt };
      cache.set(cacheKey, payload, WEATHER_CACHE_TTL_MS);
      return res.json({
        forecast: fallback,
        fetchedAt,
        cached: false,
        source: 'weather-fallback',
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/weather/alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const { location = 'Ooty' } = req.query;
    const cleanLocation = String(location).trim().toLowerCase();

    // Per-location cache key
    const cacheKey = `weather:alerts:${cleanLocation}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        alerts: cached.alerts,
        fetchedAt: cached.fetchedAt,
        cached: true,
        source: 'cache',
      });
    }

    try {
      const alerts = await getAlerts(location);
      const fetchedAt = Date.now();
      const payload = { alerts, fetchedAt };
      cache.set(cacheKey, payload, WEATHER_CACHE_TTL_MS); // Exactly 30 min cache
      return res.json({
        alerts,
        fetchedAt,
        cached: false,
        source: 'weather-api-live',
      });
    } catch (apiErr) {
      const fetchedAt = Date.now();
      return res.json({
        alerts: [],
        fetchedAt,
        cached: false,
        source: 'weather-fallback',
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
