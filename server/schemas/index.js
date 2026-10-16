/**
 * server/schemas/index.js — Zod Request Validation Schemas
 * Strict schema validation and defense against parameter tampering / CWE-20
 */

import { z } from 'zod';

export const VALID_STAGES = [
  'WELCOME',
  'PARSING',
  'CLARIFYING',
  'PREFERENCE_GATE',
  'FLIGHT_PREFS',
  'FLIGHT_SEARCH',
  'FLIGHT_SELECTED',
  'HOTEL_PREFS',
  'HOTEL_SEARCH',
  'HOTEL_SELECTED',
  'PLACES_SELECT',
  'RESTAURANTS_SELECT',
  'COMPOSING',
  'DONE',
];

export const chatTurnSchema = z
  .object({
    message: z
      .string()
      .min(1, 'message is required and must not be empty.')
      .max(4000, 'message cannot exceed 4000 characters.'),
    stage: z.enum(VALID_STAGES).optional().default('WELCOME'),
    tripState: z.record(z.string().max(100), z.any()).optional().default({}),
  })
  .strict();

export const flightSearchSchema = z
  .object({
    from: z.string().min(1, 'from (origin city/airport) is required.').max(100),
    to: z.string().min(1, 'to (destination city/airport) is required.').max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format.'),
    passengers: z.coerce.number().int().min(1).max(20).optional().default(1),
    cabin: z.enum(['economy', 'premium', 'business', 'first']).optional().default('economy'),
    currency: z.string().max(20).optional().default('₹ INR'),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  })
  .strict();

export const lastMileFareSchema = z
  .object({
    fromAirport: z.string().min(1, 'fromAirport is required.').max(10),
    fromAirportName: z.string().max(100).optional(),
    destination: z.string().min(1, 'destination is required.').max(100),
    budgetTier: z.enum(['budget', 'moderate', 'luxury', 'stretch']).optional().default('moderate'),
    pacePreference: z.string().max(50).optional().default('balanced'),
    preferredClass: z.string().max(50).optional().default('All'),
  })
  .strict();

export const placesSearchSchema = z
  .object({
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
  })
  .strict()
  .refine((data) => data.query || data.type, {
    message: 'Either "query" or "type" parameter is required.',
  });

export const placesQuerySchema = z
  .object({
    query: z.string().max(200).optional(),
    destination: z.string().max(100).optional(),
    category: z.string().max(50).optional().default('attraction'),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  })
  .strict();

export const hotelPriceSchema = z
  .object({
    hotelId: z.string().max(100).optional(),
    hotelName: z.string().max(200).optional().default('Hotel'),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkIn must be in YYYY-MM-DD format.').optional(),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkOut must be in YYYY-MM-DD format.').optional(),
    guests: z.coerce.number().int().min(1).max(20).optional().default(2),
  })
  .strict();

export const placeDetailsSchema = z
  .object({
    placeId: z.string().min(1).max(150).regex(/^[\w\-\.]+$/, 'Invalid placeId format.'),
  })
  .strict();

export const placeDetailsQuerySchema = z
  .object({
    includeReviews: z.enum(['true', 'false']).optional().default('false'),
    includePriceLevel: z.enum(['true', 'false']).optional().default('false'),
  })
  .strict();

export const weatherForecastSchema = z
  .object({
    location: z.string().min(1).max(100).optional().default('Ooty'),
    days: z.coerce.number().int().min(1).max(14).optional().default(3),
    force: z.enum(['true', 'false', '1', '0']).optional().default('false'),
  })
  .strict();

export const weatherAlertsSchema = z
  .object({
    location: z.string().min(1).max(100).optional().default('Ooty'),
  })
  .strict();

