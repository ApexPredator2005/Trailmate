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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Middleware with payload size limit (rejects oversized request bodies > 100kb)
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// Serve embellishments with permanent 1-year immutable cache
app.use('/embellishments', express.static('public/embellishments', {
  maxAge: '1y',
  immutable: true,
}));

// API Routes
app.use('/api/chat/stream', chatStreamRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/flights',     flightRoutes);
app.use('/api/places',      placeRoutes);
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
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// SPA catch-all fallback for client-side routing (non-API GET requests)
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next();
  });
});

// Global Async Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌲 Trailmate Express server running on http://localhost:${PORT}`);
});

export default app;
