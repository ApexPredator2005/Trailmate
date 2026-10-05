/**
 * server/schemas/index.js — Zod Request Validation Schemas
 * (Suggestion #25 — Request Schema Validation on API Routes)
 */

import { z } from 'zod';

export const chatTurnSchema = z.object({
  message: z.string().min(1, 'message is required and must not be empty.'),
  stage: z.string().optional().default('WELCOME'),
  tripState: z.record(z.any()).optional().default({}),
});

export const flightSearchSchema = z.object({
  from: z.string().min(1, 'from (origin city/airport) is required.'),
  to: z.string().min(1, 'to (destination city/airport) is required.'),
  date: z.string().min(1, 'date (YYYY-MM-DD) is required.'),
  passengers: z.coerce.number().int().min(1).max(20).optional().default(1),
  cabin: z.enum(['economy', 'premium', 'business', 'first']).optional().default('economy'),
  currency: z.string().optional().default('₹ INR'),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const placesQuerySchema = z.object({
  query: z.string().optional(),
  destination: z.string().optional(),
  category: z.string().optional().default('attraction'),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const weatherForecastSchema = z.object({
  location: z.string().optional().default('Ooty'),
  days: z.coerce.number().int().min(1).max(14).optional().default(3),
  force: z.string().optional().default('false'),
});
