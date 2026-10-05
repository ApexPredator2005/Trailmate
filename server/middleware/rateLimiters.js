/**
 * server/middleware/rateLimiters.js — Tiered Security & Quota-Safe Rate Limiters
 *
 * Configured with strict conservative limits to protect third-party API quotas
 * (Gemini AI Studio, Google Places, WeatherAPI, RapidAPI) and defend against brute-force attacks.
 */

import rateLimit from 'express-rate-limit';

/**
 * 1. Auth & Login Limiter
 * Rule: Maximum 5 attempts per 15 minutes per IP.
 * Used for login, registration, and credential verification routes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts from this IP. Please wait 15 minutes before trying again.',
    retryAfterMinutes: 15,
  },
  skipSuccessfulRequests: false,
});

/**
 * 2. AI Chat & SSE Streaming Limiter (Gemini Token Protection)
 * Rule: Maximum 8 turns per 15 minutes per IP.
 * Typical user itinerary intake finishes in 3–5 turns.
 */
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI itinerary generation limit reached (8 requests per 15 minutes). Please review your current plan or try again shortly.',
    retryAfterMinutes: 15,
  },
});

/**
 * 3. Flight Search Limiter (AeroDataBox / SerpApi Protection)
 * Rule: Maximum 10 live searches per 15 minutes per IP.
 */
export const flightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Flight search limit reached (10 searches per 15 minutes). Please try again shortly.',
  },
});

/**
 * 4. Places & Attractions Limiter (Google Places Cloud Billing Protection)
 * Rule: Maximum 20 searches per 15 minutes per IP.
 * Results are also cached server-side for 30 minutes to minimize billable API calls.
 */
export const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Places lookup limit reached (20 requests per 15 minutes). Please try again shortly.',
  },
});

/**
 * 5. Global API Envelope Limiter
 * Rule: Maximum 40 requests per 15 minutes across all /api routes per IP.
 * Prevents automated scraping and denial-of-service spam.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many API requests from this IP. Please slow down and try again in 15 minutes.',
  },
});
