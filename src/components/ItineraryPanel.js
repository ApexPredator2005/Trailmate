/**
 * ItineraryPanel.js — Manages the right-hand Itinerary panel with passport stamp accents and Journey Blueprint skeleton.
 */

import { store } from '../store/state.js';
import { ItineraryDay } from './ItineraryDay.js';
import { downloadIcsCalendar } from '../views/ShareView.js';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ItineraryPanel {
  constructor({
    containerSelector = '#itineraryPane',
    bodySelector = '#itineraryBody',
    tagSelector = '#itineraryStatusTag',
    panelId,
    onSwapStop,
    onAddActivity,
    onMapClick,
  } = {}) {
    this.container = document.querySelector(panelId ? `#${panelId}` : containerSelector) || document.querySelector('#itineraryPane');
    this.body = document.querySelector(bodySelector) || document.querySelector('#itineraryBody');
    this.tag = document.querySelector(tagSelector) || document.querySelector('#itineraryStatusTag');
    this.onSwapStop = onSwapStop;
    this.onAddActivity = onAddActivity;
    this.onMapClick = onMapClick;

    // Listen to changes on itinerary, trip, and full state
    this._unsubItinerary = store.subscribe('itinerary', (itinerary) => {
      this.render(itinerary, store.getState().trip);
    });
    this._unsubTrip = store.subscribe('trip', (trip) => {
      this.render(store.getState().itinerary, trip);
    });
    this._unsubGlobal = store.subscribe((state) => {
      this.render(state.itinerary, state.trip);
    });

    const initial = store.getState();
    this.render(initial.itinerary, initial.trip);
  }

  render(itinerary, trip = {}) {
    if (!this.body) return;

    // ── 1. Final Composed Itinerary ──────────────────────────────────────
    if (itinerary && Array.isArray(itinerary.days) && itinerary.days.length > 0) {
      if (this.tag) {
        this.tag.textContent = `${itinerary.days.length} Days Planned`;
        this.tag.className =
          'bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-sm text-xs font-semibold border border-secondary/20';
      }

      const dest = trip.destination || 'INDIA';
      const year = new Date().getFullYear();

      this.body.innerHTML = `
        <!-- Retro Passport Stamp Accent -->
        <div class="passport-stamp mb-6 mx-auto w-fit py-1.5 px-4 border-2 border-dashed border-secondary/60 rounded-xl flex items-center gap-2 rotate-[-2deg] bg-secondary/5 select-none animate-stampDrop shadow-xs">
          <span class="material-symbols-outlined text-secondary text-base">flight_land</span>
          <div class="text-left font-label-sm">
            <div class="text-[10px] font-bold tracking-widest text-secondary uppercase">${esc(dest)} EXPEDITION</div>
            <div class="text-[8px] tracking-wider text-on-surface-variant font-mono">${year} • VERIFIED SCHEDULE</div>
          </div>
        </div>
      `;

      itinerary.days.forEach((dayData, dayIndex) => {
        const dayComponent = new ItineraryDay({
          dayData,
          dayIndex,
          onSwapStop: (dIdx, sIdx, stop) => {
            if (typeof this.onSwapStop === 'function') {
              this.onSwapStop(dIdx, sIdx, stop);
            }
          },
          onAddActivity: (dIdx, day) => {
            if (typeof this.onAddActivity === 'function') {
              this.onAddActivity(dIdx, day);
            }
          },
        });
        this.body.appendChild(dayComponent.el);
      });

      // ── 1b. Estimated Trip Budget Card at End of Itinerary ────────────────
      const budget = itinerary.estimatedBudget || this._calculateEstimatedBudget(trip, itinerary);
      const budgetCard = document.createElement('div');
      budgetCard.className = 'mt-6 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 shadow-xs space-y-3 animate-fadeIn';

      const targetVal = budget.customBudget || budget.targetBudget;
      const isOver = targetVal && budget.total > targetVal;
      const statusBadge = targetVal
        ? (isOver
            ? `<span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-error/15 text-error border border-error/25">Target: ₹${targetVal.toLocaleString('en-IN')} (Exceeds by ₹${(budget.total - targetVal).toLocaleString('en-IN')})</span>`
            : `<span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-[#5B8C7B]/20 text-[#2B5746] border border-[#5B8C7B]/30">Target: ₹${targetVal.toLocaleString('en-IN')} (Within Budget ✅)</span>`)
        : `<span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-secondary/10 text-secondary border border-secondary/20">${trip.budgetTier ? trip.budgetTier.toUpperCase() : 'ESTIMATED'}</span>`;

      budgetCard.innerHTML = `
        <div class="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
          <div class="flex items-center gap-1.5 font-serif font-bold text-sm text-primary">
            <span class="material-symbols-outlined text-base text-secondary">payments</span>
            <span>Estimated Trip Budget</span>
          </div>
          ${statusBadge}
        </div>

        <div class="space-y-1.5 text-xs font-mono">
          <div class="flex justify-between text-on-surface-variant">
            <span class="flex items-center gap-1.5"><span class="text-sm">✈️</span> Flights & Transit:</span>
            <span class="font-semibold text-on-surface">₹${budget.flights.toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span class="flex items-center gap-1.5"><span class="text-sm">🏨</span> Stays & Accommodation:</span>
            <span class="font-semibold text-on-surface">₹${budget.stay.toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span class="flex items-center gap-1.5"><span class="text-sm">🍜</span> Food & Dining:</span>
            <span class="font-semibold text-on-surface">₹${budget.food.toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span class="flex items-center gap-1.5"><span class="text-sm">🎟️</span> Activities & Sightseeing:</span>
            <span class="font-semibold text-on-surface">₹${budget.activities.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-outline-variant/30 pt-2.5">
          <span class="text-xs font-bold text-primary uppercase tracking-wider font-label-sm">Estimated Total:</span>
          <span class="text-base font-bold font-mono text-secondary">₹${budget.total.toLocaleString('en-IN')}</span>
        </div>
      `;

      this.body.appendChild(budgetCard);

      // ── 1c. Action Section: Export, Print & Download Itinerary ────────────
      const exportSection = document.createElement('div');
      exportSection.id = 'itineraryExportSection';
      exportSection.className = 'itinerary-panel-export mt-5 mb-8 space-y-2.5 animate-fadeIn';
      exportSection.innerHTML = `
        <div class="flex items-center justify-between text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider px-1">
          <span>Export &amp; Download</span>
          <span class="text-[10px] text-secondary">1-Click Save</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button id="btnItineraryDownloadPdf" class="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-xs font-semibold text-primary transition-all active:scale-95 cursor-pointer shadow-2xs">
            <span class="material-symbols-outlined text-sm text-secondary">picture_as_pdf</span>
            <span>Download PDF</span>
          </button>
          <button id="btnItineraryExportIcs" class="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-xs font-semibold text-primary transition-all active:scale-95 cursor-pointer shadow-2xs">
            <span class="material-symbols-outlined text-sm text-secondary">calendar_month</span>
            <span>Calendar (.ics)</span>
          </button>
          <button id="btnItineraryCopyWhatsapp" class="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-xs font-semibold text-primary transition-all active:scale-95 cursor-pointer shadow-2xs">
            <span class="material-symbols-outlined text-sm text-[#25D366]">chat</span>
            <span>WhatsApp Plan</span>
          </button>
          <button id="btnItineraryCopyMarkdown" class="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-xs font-semibold text-primary transition-all active:scale-95 cursor-pointer shadow-2xs">
            <span class="material-symbols-outlined text-sm text-secondary">content_copy</span>
            <span>Copy Markdown</span>
          </button>
        </div>
      `;

      exportSection.querySelector('#btnItineraryDownloadPdf')?.addEventListener('click', () => {
        window.print();
        store.pushMessage({
          role: 'bot',
          text: '📄 **Print / PDF export opened!** You can save this complete itinerary to PDF or print.',
        });
      });

      exportSection.querySelector('#btnItineraryExportIcs')?.addEventListener('click', () => {
        downloadIcsCalendar(trip, itinerary);
        store.pushMessage({
          role: 'bot',
          text: '📅 **Exported itinerary (.ics) file downloaded!** You can now import it to Apple or Google Calendar.',
        });
      });

      exportSection.querySelector('#btnItineraryCopyWhatsapp')?.addEventListener('click', async () => {
        const currDest = trip.destination || 'Trip';
        const summary = `🗺️ *${currDest} Trip Plan*\n\n` + (itinerary.days || []).map(d => `*Day ${d.dayNumber}: ${d.title || d.theme}*\n` + (d.stops || []).map(s => `• ${s.time}: ${s.name || s.title}`).join('\n')).join('\n\n') + '\n\n_Planned with Trailmate AI_';
        try {
          await navigator.clipboard.writeText(summary);
          store.pushMessage({ role: 'bot', text: '💬 **WhatsApp trip summary copied to clipboard!** Ready to send to travel companions.' });
        } catch {
          store.pushMessage({ role: 'bot', text: summary });
        }
      });

      exportSection.querySelector('#btnItineraryCopyMarkdown')?.addEventListener('click', async () => {
        const currDest = trip.destination || 'Trip';
        const md = `# 🗺️ ${currDest} Itinerary\n\n` + (itinerary.days || []).map(d => `## Day ${d.dayNumber}: ${d.title || d.theme}\n` + (d.stops || []).map(s => `- **${s.time}**: ${s.name || s.title} ${s.description ? `— ${s.description}` : ''}`).join('\n')).join('\n\n') + `\n\n---\n*Planned with Trailmate AI*`;
        try {
          await navigator.clipboard.writeText(md);
          store.pushMessage({ role: 'bot', text: '📋 **Full itinerary markdown copied to clipboard!**' });
        } catch {
          store.pushMessage({ role: 'bot', text: md });
        }
      });

      this.body.appendChild(exportSection);
      return;
    }

    // ── 2. Live Building Reactive Blueprint ──────────────────────────────
    const dest = trip.destination;
    const flight = trip.selectedFlight;
    const hotel = trip.selectedHotel;
    const places = trip.selectedPlaces || [];
    const restaurants = trip.selectedRestaurants || [];
    const duration = Math.max(3, trip.duration || 3);

    const hasFlight = !!flight;
    const hasHotel = !!hotel;
    const placesCount = places.length;
    const restaurantsCount = restaurants.length;

    let selectionsCount = 0;
    if (dest) selectionsCount++;
    if (hasFlight) selectionsCount++;
    if (hasHotel) selectionsCount++;
    if (placesCount > 0) selectionsCount++;
    if (restaurantsCount > 0) selectionsCount++;

    if (this.tag) {
      if (!dest) {
        this.tag.textContent = 'Itinerary';
        this.tag.className =
          'bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30';
      } else {
        this.tag.textContent = `${selectionsCount}/5 Selected`;
        this.tag.className =
          'bg-[#5B8C7B]/15 text-[#376857] px-3 py-1 rounded-full font-label-sm text-xs font-semibold border border-[#5B8C7B]/30 animate-pulse';
      }
    }

    const headerTitle = dest ? `${esc(dest)} Itinerary` : 'Journey Itinerary';
    const headerSubtitle = 'Glance at your adventure';

    this.body.innerHTML = `
      <div class="animate-fadeIn space-y-4 pb-6">

        <!-- Itinerary Header -->
        <div class="p-3.5 bg-surface-container-low rounded-2xl border ${dest ? 'border-secondary/30 shadow-xs' : 'border-dashed border-outline-variant/60'} flex items-center justify-between transition-all duration-500">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full ${dest ? 'bg-secondary/15 text-secondary' : 'bg-secondary/10 text-secondary'} flex items-center justify-center flex-shrink-0 transition-colors">
              <span class="material-symbols-outlined text-lg">explore</span>
            </div>
            <div>
              <h4 class="font-label-md text-xs font-bold text-primary uppercase tracking-wider">${headerTitle}</h4>
              <p class="font-label-sm text-[11px] text-on-surface-variant">${headerSubtitle}</p>
            </div>
          </div>
          ${dest ? `<span class="text-[10px] font-mono font-bold text-secondary uppercase bg-secondary/10 px-2.5 py-0.5 rounded-full">${duration} Days</span>` : ''}
        </div>

        <!-- ── Day 01: Arrival & Check-In ── -->
        <div class="relative pl-6 pb-4">
          <div class="absolute left-[11px] top-2 bottom-0 w-[2px] border-l-2 border-dashed border-secondary/50"></div>
          <div class="absolute left-[5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-secondary bg-white z-10 flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-secondary"></div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-secondary tracking-wider uppercase font-mono">Day 01 · Arrival &amp; Check-In</span>
              <span class="text-[10px] text-on-surface-variant font-mono">${dest ? `Day 1 of ${duration}` : 'Morning / Afternoon'}</span>
            </div>

            <!-- Flight / Transit slot -->
            <div class="p-3 rounded-xl transition-all duration-500 ${hasFlight ? 'bg-emerald-50/90 border border-emerald-300 shadow-xs' : 'bg-surface-container-low/50 border border-dashed border-outline-variant/50 opacity-90'}">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <span>${hasFlight ? '✈️' : '🚗'}</span>
                  <span>${hasFlight ? `Flight: ${esc(flight.airline)} ${esc(flight.flightNumber || '')}` : (dest ? `Transit to ${esc(dest)}` : 'Transit &amp; Boutique Check-In')}</span>
                </p>
                ${hasFlight && flight.price ? `<span class="text-[10px] font-bold text-emerald-700 font-mono">₹${Number(flight.price).toLocaleString('en-IN')}</span>` : ''}
              </div>
              <p class="text-[11px] text-on-surface-variant mt-0.5">
                ${hasFlight ? `Departure ${esc(flight.departureTime || 'Scheduled')} • Arrival ${esc(flight.arrivalTime || 'Day 1')}` : (dest ? `Flight transfer or scenic drive to ${esc(dest)}.` : 'Flight transfer, scenic mountain/coastal drive &amp; estate settling.')}
              </p>
            </div>

            <!-- Stay / Check-In slot -->
            <div class="p-3 rounded-xl transition-all duration-500 ${hasHotel ? 'bg-amber-50/90 border border-amber-300 shadow-xs' : 'bg-surface-container-low/50 border border-dashed border-outline-variant/50 opacity-85'}">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <span>🏨</span>
                  <span>${hasHotel ? `Check-in: ${esc(hotel.name)}` : 'Boutique / Heritage Stay Check-In'}</span>
                </p>
                ${hasHotel && hotel.rating ? `<span class="text-[10px] font-bold text-amber-700 font-mono">⭐ ${esc(hotel.rating)}</span>` : ''}
              </div>
              <p class="text-[11px] text-on-surface-variant mt-0.5">
                ${hasHotel ? esc(hotel.formattedAddress || 'Confirmed accommodations reserved') : 'Unpack, refresh, and settle into your accommodations.'}
              </p>
            </div>

            <!-- Day 1 Evening Sight (if selected) -->
            ${places[0] ? `
              <div class="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center gap-2.5 transition-all duration-500 animate-fadeIn">
                ${places[0].photo ? `<img src="${esc(places[0].photo)}" alt="${esc(places[0].name)}" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />` : '<span class="text-base">🏛️</span>'}
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-primary truncate">${esc(places[0].name)}</p>
                  <p class="text-[10px] text-blue-700 font-mono">Evening Orientation &amp; Sunset</p>
                </div>
              </div>
            ` : ''}

            <!-- Day 1 Dinner (if selected) -->
            ${restaurants[0] ? `
              <div class="p-2.5 rounded-xl bg-orange-50/90 border border-orange-200 flex items-center gap-2.5 transition-all duration-500 animate-fadeIn">
                <span class="text-base">🍽️</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-primary truncate">${esc(restaurants[0].name)}</p>
                  <p class="text-[10px] text-orange-700 font-mono">Welcome Dinner</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- ── Day 02: Full Day Exploration ── -->
        <div class="relative pl-6 pb-4">
          <div class="absolute left-[11px] top-2 bottom-0 w-[2px] border-l-2 border-dashed border-[#5B8C7B]/50"></div>
          <div class="absolute left-[5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#5B8C7B] bg-white z-10 flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-[#5B8C7B]"></div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-[#376857] tracking-wider uppercase font-mono">Day 02 · Signature Vibe</span>
              <span class="text-[10px] text-on-surface-variant font-mono">${dest ? `Day 2 of ${duration}` : 'Full Day Exploration'}</span>
            </div>

            <!-- Morning Sight -->
            <div class="p-3 rounded-xl transition-all duration-500 ${places[1] ? 'bg-blue-50/90 border border-blue-200 shadow-xs' : 'bg-surface-container-low/50 border border-dashed border-outline-variant/40 opacity-80'}">
              <div class="flex items-center gap-2.5">
                ${places[1]?.photo ? `<img src="${esc(places[1].photo)}" alt="${esc(places[1].name)}" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />` : '<span class="text-base">🌿</span>'}
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-primary truncate">${places[1] ? esc(places[1].name) : 'Scenic Viewpoints &amp; Landmark Trails'}</p>
                  <p class="text-[11px] text-on-surface-variant">${places[1] ? 'Morning exploration' : 'Top-rated sightseeing, viewpoints &amp; regional trails.'}</p>
                </div>
              </div>
            </div>

            <!-- Afternoon Sight -->
            <div class="p-3 rounded-xl transition-all duration-500 ${places[2] ? 'bg-blue-50/90 border border-blue-200 shadow-xs' : 'bg-surface-container-low/50 border border-dashed border-outline-variant/40 opacity-75'}">
              <div class="flex items-center gap-2.5">
                ${places[2]?.photo ? `<img src="${esc(places[2].photo)}" alt="${esc(places[2].name)}" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />` : '<span class="text-base">☕</span>'}
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-primary truncate">${places[2] ? esc(places[2].name) : 'Heritage Walks &amp; Regional Culture'}</p>
                  <p class="text-[11px] text-on-surface-variant">${places[2] ? 'Afternoon excursion' : 'Tea estate tours, historic architecture &amp; photography.'}</p>
                </div>
              </div>
            </div>

            <!-- Day 2 Dinner -->
            <div class="p-2.5 rounded-xl transition-all duration-500 ${restaurants[1] ? 'bg-orange-50/90 border border-orange-200 shadow-xs' : 'bg-surface-container-low/40 border border-dashed border-outline-variant/35 opacity-70'}">
              <div class="flex items-center gap-2">
                <span class="text-sm">🍽️</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-primary truncate">${restaurants[1] ? esc(restaurants[1].name) : 'Regional Cuisine &amp; Twilight Dining'}</p>
                  <p class="text-[10px] text-on-surface-variant font-mono">${restaurants[1] ? 'Evening Dining' : 'Authentic local dishes &amp; cafe atmosphere.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Day 03+: Heritage & Departure ── -->
        <div class="relative pl-6 pb-2">
          <div class="absolute left-[5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#8C7355] bg-white z-10 flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-[#8C7355]"></div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-[#634E35] tracking-wider uppercase font-mono">Day 0${duration} · Heritage &amp; Return</span>
              <span class="text-[10px] text-on-surface-variant font-mono">${dest ? 'Departure' : 'Culture &amp; Departure'}</span>
            </div>

            <!-- Day 3 Sights / Bazaars -->
            <div class="p-3 rounded-xl transition-all duration-500 ${places[3] ? 'bg-blue-50/90 border border-blue-200 shadow-xs' : 'bg-surface-container-low/50 border border-dashed border-outline-variant/40 opacity-70'}">
              <div class="flex items-center gap-2.5">
                ${places[3]?.photo ? `<img src="${esc(places[3].photo)}" alt="${esc(places[3].name)}" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />` : '<span class="text-base">🛍️</span>'}
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-primary truncate">${places[3] ? esc(places[3].name) : 'Local Markets &amp; Souvenirs'}</p>
                  <p class="text-[11px] text-on-surface-variant">${places[3] ? 'Morning market walk' : 'Artisanal craft shopping, historic landmark walks &amp; farewell.'}</p>
                </div>
              </div>
            </div>

            <!-- Day 3 Farewell Lunch (if selected) -->
            ${restaurants[2] ? `
              <div class="p-2.5 rounded-xl bg-orange-50/90 border border-orange-200 flex items-center gap-2.5 transition-all duration-500 animate-fadeIn">
                <span class="text-base">🍽️</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-primary truncate">${esc(restaurants[2].name)}</p>
                  <p class="text-[10px] text-orange-700 font-mono">Farewell Lunch</p>
                </div>
              </div>
            ` : ''}

            <!-- Stay Check-Out -->
            <div class="p-2.5 rounded-xl transition-all duration-500 bg-surface-container-low/50 border border-outline-variant/40 flex items-center justify-between text-[11px] text-on-surface">
              <span class="flex items-center gap-1.5">
                <span>🏨</span>
                <span>${hasHotel ? `Check-out: ${esc(hotel.name)}` : 'Check-out &amp; Departure Transfer'}</span>
              </span>
              <span class="font-mono text-[10px] text-on-surface-variant">11:00 AM</span>
            </div>
          </div>
        </div>

        <!-- Encouraging Footer Badge -->
        <div class="text-center pt-2">
          <p class="text-[11px] ${dest ? 'text-emerald-700 font-semibold' : 'text-outline'} font-label-sm transition-colors duration-300">
            ${dest ? '✨ Live Itinerary updating in real time' : '✨ Pick a destination to begin customizing your days'}
          </p>
        </div>

      </div>
    `;
  }

  _calculateEstimatedBudget(trip = {}, itinerary = {}) {
    const duration = Math.max(1, trip.duration || itinerary.days?.length || 3);
    const travelers = Math.max(1, trip.travelers || 1);
    const tier = (trip.budgetTier || 'moderate').toLowerCase();
    const customBudget = trip.customBudget || null;

    // 1. Flights / Transit
    let flightCost = 0;
    if (trip.selectedFlight?.price) {
      const rawNum = parseInt(String(trip.selectedFlight.price).replace(/[^0-9]/g, ''), 10);
      flightCost = !isNaN(rawNum) && rawNum > 0 ? rawNum * travelers : (tier === 'luxury' ? 14000 : tier === 'budget' ? 4500 : 8000) * travelers;
    } else {
      flightCost = (tier === 'luxury' ? 14000 : tier === 'budget' ? 4500 : 8000) * travelers;
    }

    // 2. Stay / Accommodation
    let stayCost = 0;
    const nights = Math.max(1, duration - 1);
    if (trip.selectedHotel?.price) {
      const rawNum = parseInt(String(trip.selectedHotel.price).replace(/[^0-9]/g, ''), 10);
      stayCost = !isNaN(rawNum) && rawNum > 0 ? rawNum * nights : (tier === 'luxury' ? 9500 : tier === 'budget' ? 1500 : 4000) * nights;
    } else {
      stayCost = (tier === 'luxury' ? 9500 : tier === 'budget' ? 1500 : 4000) * nights;
    }

    // 3. Food & Dining
    const dailyFoodRate = tier === 'luxury' ? 2400 : tier === 'budget' ? 600 : 1200;
    const foodCost = dailyFoodRate * duration * travelers;

    // 4. Activities & Sightseeing
    const dailyActivityRate = tier === 'luxury' ? 1800 : tier === 'budget' ? 400 : 900;
    const activitiesCost = dailyActivityRate * duration * travelers;

    const totalCost = flightCost + stayCost + foodCost + activitiesCost;

    return {
      flights: flightCost,
      stay: stayCost,
      food: foodCost,
      activities: activitiesCost,
      total: totalCost,
      customBudget,
      targetBudget: customBudget || (tier === 'luxury' ? 50000 : tier === 'budget' ? 10000 : 25000),
      currency: '₹ INR',
    };
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
