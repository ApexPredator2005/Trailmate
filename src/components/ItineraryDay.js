/**
 * ItineraryDay.js — Renders a single day block in the Itinerary timeline with dynamic theme colors.
 */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getThemeStyle(themeText, index) {
  const t = (themeText || '').toLowerCase();
  if (t.includes('tea') || t.includes('nature') || t.includes('garden') || t.includes('green')) {
    return {
      badgeClass: 'bg-[#5B8C7B] text-white',
      pillClass: 'bg-[#5B8C7B]/15 text-[#376857] border border-[#5B8C7B]/30',
      lineColor: 'rgba(91, 140, 123, 0.4)',
      markerBorder: 'border-[#5B8C7B]',
    };
  }
  if (t.includes('heritage') || t.includes('history') || t.includes('market') || t.includes('church') || t.includes('fort')) {
    return {
      badgeClass: 'bg-[#8C7355] text-white',
      pillClass: 'bg-[#8C7355]/15 text-[#634E35] border border-[#8C7355]/30',
      lineColor: 'rgba(140, 115, 85, 0.4)',
      markerBorder: 'border-[#8C7355]',
    };
  }
  if (t.includes('beach') || t.includes('lake') || t.includes('water') || t.includes('boat')) {
    return {
      badgeClass: 'bg-[#2A7B88] text-white',
      pillClass: 'bg-[#2A7B88]/15 text-[#1A5B66] border border-[#2A7B88]/30',
      lineColor: 'rgba(42, 123, 136, 0.4)',
      markerBorder: 'border-[#2A7B88]',
    };
  }
  if (t.includes('adventure') || t.includes('trek') || t.includes('peak') || t.includes('hike')) {
    return {
      badgeClass: 'bg-[#C4703D] text-white',
      pillClass: 'bg-[#C4703D]/15 text-[#944A1A] border border-[#C4703D]/30',
      lineColor: 'rgba(196, 112, 61, 0.4)',
      markerBorder: 'border-[#C4703D]',
    };
  }
  // Default / Arrival
  return {
    badgeClass: index === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-[#1E3A34] text-white',
    pillClass: 'bg-[#1E3A34]/10 text-primary border border-outline-variant/40',
    lineColor: 'rgba(30, 58, 52, 0.3)',
    markerBorder: 'border-primary',
  };
}

export class ItineraryDay {
  constructor({ dayData, dayIndex = 0, onSwapStop, onAddActivity } = {}) {
    this.day = dayData;
    this.dayIndex = dayIndex;
    this.onSwapStop = onSwapStop;
    this.onAddActivity = onAddActivity;
    this.el = this._build();
  }

  _build() {
    const { day, dayIndex } = this;
    const block = document.createElement('div');
    block.className = 'mb-stack-lg relative animate-fadeIn';
    block.setAttribute('role', 'region');
    block.setAttribute('aria-label', `Day ${day.dayNumber || dayIndex + 1}`);

    const dayTheme = day.theme || day.title || '';
    const themeStyle = getThemeStyle(dayTheme, dayIndex);

    const dayNumLabel = `D${day.dayNumber || dayIndex + 1}`;
    const dayDateLabel = day.date || `Day ${day.dayNumber || dayIndex + 1}`;

    let headerHtml = `
      <div class="flex items-center justify-between mb-5">
        <h4 class="font-headline-sm text-base font-semibold text-on-surface flex items-center gap-2">
          <span class="${themeStyle.badgeClass} w-7 h-7 rounded-full flex items-center justify-center font-label-md text-xs shadow-sm">${esc(dayNumLabel)}</span>
          <span>${esc(dayDateLabel)}</span>
        </h4>
        ${dayTheme ? `
          <span class="${themeStyle.pillClass} px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold">
            ${esc(dayTheme)}
          </span>` : ''}
      </div>`;

    block.innerHTML = headerHtml;

    const stops = day.stops || [];
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'flex flex-col';

    stops.forEach((stop, idx) => {
      const isLast = idx === stops.length - 1;
      const stopEl = document.createElement('div');
      stopEl.className = `relative pl-6 ${isLast ? 'pb-2' : 'pb-7'}`;

      const isHotel = stop.category === 'lodging' || stop.name?.toLowerCase().includes('check-in') || stop.confirmed;
      const hasPhoto = !!stop.photo;

      stopEl.innerHTML = `
        <!-- Vertical Line -->
        <div class="absolute left-[11px] top-2 ${isLast ? 'bottom-8' : 'bottom-0'} w-[2px]" style="background-color: ${themeStyle.lineColor};"></div>
        <!-- Marker -->
        <div class="absolute left-[6px] top-1 w-3 h-3 rounded-full border-2 ${isHotel ? 'border-secondary' : themeStyle.markerBorder} bg-surface z-10 shadow-xs"></div>
        
        <!-- Card -->
        <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
          ${isHotel ? `<div class="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>` : ''}
          
          <div class="flex justify-between items-start mb-1.5">
            <span class="font-label-sm text-xs text-primary font-medium tracking-wide">
              ${esc(stop.time || 'Flexible')}
            </span>
            <div class="flex items-center gap-1.5">
              ${isHotel ? `
                <span class="bg-secondary/10 text-secondary text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold">
                  Confirmed
                </span>` : ''}
              <button class="btn-swap-stop text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-container" title="Swap this stop" aria-label="Swap ${esc(stop.name)}">
                <span class="material-symbols-outlined text-sm">swap_horiz</span>
              </button>
            </div>
          </div>

          <h5 class="font-body-md text-sm font-semibold text-on-surface">${esc(stop.name)}</h5>
          ${stop.why || stop.description ? `
            <p class="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed ${hasPhoto ? 'mb-2.5' : ''}">
              ${esc(stop.why || stop.description)}
            </p>` : ''}

          ${hasPhoto ? `
            <div class="h-20 w-full rounded-lg overflow-hidden relative mt-1 shadow-inner">
              <img class="w-full h-full object-cover" src="${esc(stop.photo)}" alt="${esc(stop.name)}" loading="lazy">
            </div>` : ''}
        </div>`;

      const swapBtn = stopEl.querySelector('.btn-swap-stop');
      if (swapBtn) {
        swapBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof this.onSwapStop === 'function') {
            this.onSwapStop(dayIndex, idx, stop);
          }
        });
      }

      timelineContainer.appendChild(stopEl);
    });

    // Add activity button
    const addBtnContainer = document.createElement('div');
    addBtnContainer.className = 'pl-6 pt-1';
    addBtnContainer.innerHTML = `
      <button class="btn-add-activity w-full py-1.5 px-3 border border-dashed border-outline-variant/60 hover:border-primary text-on-surface-variant hover:text-primary rounded-xl text-xs font-label-sm flex items-center justify-center gap-1.5 transition-colors">
        <span class="material-symbols-outlined text-sm">add</span>
        Add activity to Day ${day.dayNumber || dayIndex + 1}
      </button>`;

    addBtnContainer.querySelector('.btn-add-activity').addEventListener('click', () => {
      if (typeof this.onAddActivity === 'function') {
        this.onAddActivity(dayIndex, day);
      }
    });

    timelineContainer.appendChild(addBtnContainer);
    block.appendChild(timelineContainer);
    return block;
  }
}
