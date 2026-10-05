/**
 * CardCarousel.js — Horizontal scroll container for OptionCards.
 */

import { OptionCard } from './OptionCard.js';
import { store } from '../store/state.js';

export class CardCarousel {
  constructor({ cards = [], onSelect, label = 'Options', multiSelect = false } = {}) {
    this.cardsData = cards;
    this.onSelect = onSelect;
    this.label = label;
    this.multiSelect = multiSelect;
    this.cardInstances = [];
    this.el = this._build();
  }

  _build() {
    const container = document.createElement('div');
    container.className = 'w-full my-2 cards-carousel';

    const track = document.createElement('div');
    track.className = 'flex gap-4 overflow-x-auto px-2 pt-1.5 pb-4 snap-x snap-mandatory scroll-smooth';
    track.setAttribute('role', 'list');
    track.setAttribute('aria-label', this.label);

    const trip = store.getState().trip || {};

    this.cardsData.forEach((cardData) => {
      const card = new OptionCard({
        data: cardData,
        multiSelect: this.multiSelect,
        onSelect: (selectedData, cardEl) => {
          if (this.multiSelect) {
            card.toggle();
          } else {
            this.cardInstances.forEach((c) => c.deselect());
            card.select();
          }
          if (typeof this.onSelect === 'function') {
            this.onSelect(selectedData, card.el);
          }
        },
      });

      // Restore active selection state for flights, hotels, attractions, and restaurants
      const isSelectedHotel = trip.selectedHotel && (trip.selectedHotel.id === cardData.id || trip.selectedHotel.name === cardData.name);
      const isSelectedFlight = trip.selectedFlight && (trip.selectedFlight.id === cardData.id || trip.selectedFlight.flightNumber === cardData._raw?.flightNumber || trip.selectedFlight.name === cardData.name);
      const isSelectedPlace = Array.isArray(trip.selectedPlaces) && trip.selectedPlaces.some((p) => p.id === cardData.id || p.name === cardData.name);
      const isSelectedRest = Array.isArray(trip.selectedRestaurants) && trip.selectedRestaurants.some((r) => r.id === cardData.id || r.name === cardData.name);

      if (isSelectedHotel || isSelectedFlight || isSelectedPlace || isSelectedRest) {
        card.select();
      }

      this.cardInstances.push(card);
      track.appendChild(card.el);
    });

    container.appendChild(track);
    return container;
  }
}
