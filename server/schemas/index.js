/**
 * server/schemas/index.js — Zod Request Validation Schemas
 * (Suggestion #25 — Request Schema Validation on API Routes)
 */

import { z } from 'zod';
 
export const chatTurnSchema = z.object({
  message: z.string().min(1, 'message is required and must not be empty.').max(4000, 'message cannot exceed 4000 characters.'),
  stage: z.string().max(50).optional().default('WELCOME'),
  tripState: z.record(z.any()).optional().default({}),
});

export const flightSearchSchema = z.object({
  from: z.string().min(1, 'from (origin city/airport) is required.').max(100),
  to: z.string().min(1, 'to (destination city/airport) is required.').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format.'),
  passengers: z.coerce.number().int().min(1).max(20).optional().default(1),
  cabin: z.enum(['economy', 'premium', 'business', 'first']).optional().default('economy'),
  currency: z.string().max(20).optional().default('₹ INR'),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const lastMileFareSchema = z.object({
  fromAirport: z.string().min(1, 'fromAirport is required.').max(10),
  fromAirportName: z.string().max(100).optional(),
  destination: z.string().min(1, 'destination is required.').max(100),
  budgetTier: z.enum(['budget', 'moderate', 'luxury', 'stretch']).optional().default('moderate'),
  pacePreference: z.string().max(50).optional().default('balanced'),
  preferredClass: z.string().max(50).optional().default('All'),
});

export const placesSearchSchema = z.object({
  query: z.string().max(200).optional(),
  type: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  radius: z.coerce.number().min(100).max(100000).optional(),
  maxResults: z.coerce.number().int().min(1).max(50).optional().default(14),
  rank: z.enum(['true', 'false']).optional().default('false'),
  candidateType: z.enum(['hotel', 'restaurant', 'attraction']).optional().default('hotel'),
  budgetTier: z.enum(['budget', 'moderate', 'luxury', 'stretch']).optional().default('moderate'),
  interests: z.string().max(500).optional().default(''),
  hasFoodInterest: z.enum(['true', 'false']).optional().default('false'),
}).refine(data => data.query || data.type, {
  message: 'Either "query" or "type" parameter is required.',
});

export const placesQuerySchema = z.object({
  query: z.string().max(200).optional(),
  destination: z.string().max(100).optional(),
  category: z.string().max(50).optional().default('attraction'),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const hotelPriceSchema = z.object({
  hotelId: z.string().max(100).optional(),
  hotelName: z.string().max(200).optional().default('Hotel'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guests: z.coerce.number().int().min(1).max(20).optional().default(2),
});

export const placeDetailsSchema = z.object({
  placeId: z.string().min(1).max(150),
});

export const weatherForecastSchema = z.object({
  location: z.string().min(1).max(100).optional().default('Ooty'),
  days: z.coerce.number().int().min(1).max(14).optional().default(3),
  force: z.string().max(10).optional().default('false'),
});

export const weatherAlertsSchema = z.object({
  location: z.string().min(1).max(100).optional().default('Ooty'),
});
