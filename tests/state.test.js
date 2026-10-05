/**
 * tests/state.test.js — State Store & Deep Change Detection Unit Tests
 * (Suggestion #34)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { store, isDeepEqual } from '../src/store/state.js';

describe('State Store & Deep Equality', () => {
  beforeEach(() => {
    store.reset();
  });

  it('should initialize with default state', () => {
    const state = store.getState();
    expect(state.stage).toBe('WELCOME');
    expect(state.isLoading).toBe(false);
    expect(state.messages).toEqual([]);
    expect(state.trip).toBeDefined();
  });

  it('isDeepEqual should correctly compare nested objects and arrays', () => {
    const a = { city: 'Ooty', tags: ['tea', 'nature'], meta: { rating: 4.8 } };
    const b = { city: 'Ooty', tags: ['tea', 'nature'], meta: { rating: 4.8 } };
    const c = { city: 'Ooty', tags: ['tea', 'hiking'], meta: { rating: 4.8 } };

    expect(isDeepEqual(a, b)).toBe(true);
    expect(isDeepEqual(a, c)).toBe(false);
    expect(isDeepEqual(null, null)).toBe(true);
    expect(isDeepEqual(null, undefined)).toBe(false);
  });

  it('getState() should return an immutable cloned snapshot', () => {
    const s1 = store.getState();
    s1.trip.destination = 'Hacked';
    
    // Internal state should not be mutated
    const s2 = store.getState();
    expect(s2.trip.destination).not.toBe('Hacked');
  });

  it('updateTrip() should patch trip fields and notify subscribers', () => {
    let notified = false;
    const unsub = store.subscribe('trip', (newVal) => {
      notified = true;
    });

    store.updateTrip({ destination: 'Goa', duration: 5 });
    const current = store.getState();

    expect(current.trip.destination).toBe('Goa');
    expect(current.trip.duration).toBe(5);
    expect(notified).toBe(true);

    unsub();
  });

  it('updateItinerary() should safely update itinerary object', () => {
    const mockItinerary = {
      days: [
        { dayNumber: 1, title: 'Arrival', stops: [{ name: 'Beach Walk', time: '10:00 AM' }] }
      ]
    };

    store.updateItinerary(mockItinerary);
    const current = store.getState();

    expect(current.itinerary).toEqual(mockItinerary);
    expect(current.itinerary.days.length).toBe(1);
  });

  it('ConversationEngine should calculate estimated budget correctly', async () => {
    const { ConversationEngine } = await import('../src/engine/conversation.js');
    const engine = new ConversationEngine();

    const trip = {
      destination: 'Manali',
      duration: 4,
      travelers: 2,
      budgetTier: 'moderate',
      customBudget: 40000,
    };
    const itinerary = {
      days: [{ day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }],
    };

    const budget = engine._calculateEstimatedBudget(trip, itinerary);
    expect(budget.flights).toBe(16000); // 8000 * 2
    expect(budget.stay).toBe(12000); // 4000 * 3 nights
    expect(budget.food).toBe(9600); // 1200 * 4 days * 2 pax
    expect(budget.activities).toBe(7200); // 900 * 4 days * 2 pax
    expect(budget.total).toBe(44800);
    expect(budget.customBudget).toBe(40000);
  });

  it('ConversationEngine should extract origin, duration, and exact date correctly', async () => {
    const { ConversationEngine } = await import('../src/engine/conversation.js');
    const engine = new ConversationEngine();

    const trip = {};
    engine._clientExtract('2 people from patna', trip);
    expect(trip.travelers).toBe(2);
    expect(trip.homeCity).toBe('Patna');
    expect(trip.originConfirmed).toBe(true);

    engine._clientExtract('29th of this month and we will stay for 2 days', trip);
    expect(trip.duration).toBe(2);
    expect(trip.startDate).toMatch(/^\d{4}-\d{2}-29$/);
    expect(trip.dates).toBeDefined();
    expect(engine._isExactDate(trip.startDate)).toBe(true);
  });
});
