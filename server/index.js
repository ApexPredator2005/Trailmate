/**
 * server/index.js — Trailmate Express Backend Server
 *
 * Mounts:
 *   - /api/chat     (Conversation & intake)
 *   - /api/flights  (Flight search via fast-flights)
 *   - /api/places   (Google Places API)
 *   - /api/weather  (WeatherAPI.com)
 *   - /api/health   (Health check)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import chatRoutes       from './routes/chat.js';
import chatStreamRoutes from './routes/chat-stream.js';
import flightRoutes     from './routes/flights.js';
import placeRoutes      from './routes/places.js';
import weatherRoutes    from './routes/weather.js';
import {
  authLimiter,
  chatLimiter,
  flightLimiter,
  placesLimiter,
  globalApiLimiter,
} from './middleware/rateLimiters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxies (Render, Railway, Heroku, Cloudflare, etc.) for correct IP resolution
app.set('trust proxy', 1);

// Security: Disable X-Powered-By fingerprinting
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );
  next();
});

// Middleware with payload size limit (rejects oversized request bodies > 100kb in prod, relaxed to 50mb in dev)
const isDev = process.env.NODE_ENV !== 'production' || process.env.DISABLE_RATE_LIMITS === 'true';
const jsonPayloadLimit = isDev ? '50mb' : '100kb';
const urlencodedPayloadLimit = isDev ? '50mb' : '50kb';

app.use(cors());
app.use(express.json({ limit: jsonPayloadLimit }));
app.use(express.urlencoded({ extended: false, limit: urlencodedPayloadLimit }));

// Serve embellishments with permanent 1-year immutable cache
app.use('/embellishments', express.static('public/embellishments', {
  maxAge: '1y',
  immutable: true,
}));

// Apply global rate limiter to all API endpoints
app.use('/api', globalApiLimiter);

// Auth / Login Rate Limiting (strict 5 attempts per 15 minutes)
app.use('/api/auth', authLimiter);
app.use('/api/login', authLimiter);

// Dedicated route-level limiters (protecting Gemini, Google Places, and Flight APIs)
app.use('/api/chat/stream', chatLimiter, chatStreamRoutes);
app.use('/api/chat',        chatLimiter, chatRoutes);
app.use('/api/flights',     flightLimiter, flightRoutes);
app.use('/api/places',      placesLimiter, placeRoutes);
app.use('/api/weather',     weatherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Trailmate API',
    timestamp: Date.now(),
  });
});

// Serve static assets from dist in production
const distDir = path.join(rootDir, 'dist');
app.use(express.static(distDir));

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// SPA catch-all fallback for client-side routing (non-API GET requests)
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next();
  });
});

// Global Async Error Handler — Defends against CWE-209 Information Leakage
app.use((err, req, res, next) => {
  // Full stack trace and diagnostics logged server-side only for debugging
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: err.stack,
    status: err.status || err.statusCode || 500,
    timestamp: new Date().toISOString(),
  });

  const statusCode = Number(err.status || err.statusCode) || 500;

  // Never leak internal stack traces, system paths, or raw database errors
  if (statusCode >= 500) {
    return res.status(statusCode).json({
      error: 'An unexpected internal server error occurred. Please try again later.',
    });
  }

  // Sanitize 4xx client errors so internal paths or symbols are never echoed
  const rawMsg = typeof err.message === 'string' ? err.message : '';
  const isSafe = rawMsg && !rawMsg.includes('/') && !rawMsg.includes('\\') && !rawMsg.includes('node_modules') && !rawMsg.includes('at ');
  const safeMessage = isSafe ? rawMsg : 'Invalid request';

  res.status(statusCode).json({
    error: safeMessage,
  });
});

// Start Server (only when run directly as a standalone process, not as a serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌲 Trailmate Express server running on http://localhost:${PORT}`);
  });
}

export default app;
