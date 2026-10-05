/**
 * tests/schemas.test.js — Zod API Validation Unit Tests
 * (Suggestions #25 & #34)
 */

import { describe, it, expect } from 'vitest';
import {
  chatTurnSchema,
  flightSearchSchema,
  weatherForecastSchema,
  placesQuerySchema,
} from '../server/schemas/index.js';

describe('Zod API Route Schemas', () => {
  describe('chatTurnSchema', () => {
    it('validates a valid chat turn payload', () => {
      const payload = {
        message: 'Plan a trip to Manali',
        stage: 'PARSING',
        tripState: { destination: 'Manali' },
      };
      const result = chatTurnSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects empty or missing message', () => {
      const result = chatTurnSchema.safeParse({ message: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('flightSearchSchema', () => {
    it('validates valid flight search query params', () => {
      const params = {
        from: 'DEL',
        to: 'CJB',
        date: '2026-09-15',
        passengers: '2',
        cabin: 'economy',
      };
      const result = flightSearchSchema.safeParse(params);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.passengers).toBe(2);
      }
    });

    it('rejects missing origin or destination or date', () => {
      const result = flightSearchSchema.safeParse({ from: 'DEL' });
      expect(result.success).toBe(false);
    });
  });

  describe('weatherForecastSchema', () => {
    it('validates valid weather forecast parameters with defaults', () => {
      const result = weatherForecastSchema.safeParse({ location: 'Goa', days: '4' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days).toBe(4);
      }
    });

    it('rejects invalid day ranges beyond limits', () => {
      const result = weatherForecastSchema.safeParse({ location: 'Goa', days: '25' });
      expect(result.success).toBe(false);
    });
  });

  describe('placesQuerySchema', () => {
    it('provides sensible defaults for places queries', () => {
      const result = placesQuerySchema.safeParse({ destination: 'Jaipur' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('attraction');
        expect(result.data.limit).toBe(10);
      }
    });
  });
});
