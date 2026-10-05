/**
 * OptionCard.js — A single selectable option card styled with Tailwind.
 */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAirlineBrand(airlineName = '') {
  const name = String(airlineName).toLowerCase();
  if (name.includes('indigo')) {
    return {
      bg: 'bg-gradient-to-br from-[#001B94] to-[#0A32B8]',
      badgeColor: 'bg-white/20 text-white',
      accent: '#38BDF8',
      code: '6E',
      logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#001B94" stroke="#ffffff" stroke-width="1.5"/><path d="M10 18L16 12L22 18M16 12V24" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
  }
  if (name.includes('air india express')) {
    return {
      bg: 'bg-gradient-to-br from-[#D9381E] to-[#EA580C]',
      badgeColor: 'bg-white/20 text-white',
      accent: '#FEF08A',
      code: 'IX',
      logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#D9381E" stroke="#ffffff" stroke-width="1.5"/><path d="M8 16H24M18 10L24 16L18 22" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
  }
  if (name.includes('air india')) {
    return {
      bg: 'bg-gradient-to-br from-[#8B1E28] to-[#B91C1C]',
      badgeColor: 'bg-black/25 text-amber-300',
      accent: '#FDE047',
      code: 'AI',
      logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#8B1E28" stroke="#FBBF24" stroke-width="1.5"/><path d="M12 20L16 8L20 20M13.5 16H18.5" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
  }
  if (name.includes('vistara')) {
    return {
      bg: 'bg-gradient-to-br from-[#4B1738] to-[#6B21A8]',
      badgeColor: 'bg-white/20 text-amber-200',
      accent: '#FDE047',
      code: 'UK',
      logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#4B1738" stroke="#FBBF24" stroke-width="1.5"/><path d="M10 11L16 22L22 11" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
  }
  if (name.includes('akasa')) {
    return {
      bg: 'bg-gradient-to-br from-[#EA580C] to-[#C2410C]',
      badgeColor: 'bg-white/20 text-white',
      accent: '#FED7AA',
      code: 'QP',
      logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#EA580C" stroke="#ffffff" stroke-width="1.5"/><path d="M9 22L16 10L23 22M12 17L16 13L20 17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
  }
  if (name.includes('spicejet')) {
    return {
      bg: 'bg-gradient-to-br from-[#DC2626] to-[#991B1B]',
      badgeColor: 'bg-white/20 text-yellow-300',
      accent: '#FEF08A',
      code: 'SG',
      logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#DC2626" stroke="#ffffff" stroke-width="1.5"/><circle cx="16" cy="16" r="5" fill="#FBBF24"/><circle cx="23" cy="16" r="2.5" fill="#ffffff"/></svg>`,
    };
  }
  return {
    bg: 'bg-gradient-to-br from-[#1E3A34] to-[#06241F]',
    badgeColor: 'bg-white/20 text-white',
    accent: '#A7F3D0',
    code: 'FL',
    logoSvg: `<svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1E3A34" stroke="#ffffff" stroke-width="1.5"/><path d="M16 8L20 16L24 18L16 20L8 18L12 16L16 8Z" fill="#ffffff"/></svg>`,
  };
}const LANDMARK_PHOTOS = {
  'hadimba': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
  'hidimba': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
  'himachal culture': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
  'museum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
  'van vihar': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
  'national park': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
  'solang': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  'rohtang': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'jogini': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
  'waterfall': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
  'vashisht': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
  'hot spring': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
  'old manali': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
  'mall road': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
  'tea museum': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'tea factory': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'tea garden': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'botanical': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
  'doddabetta': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
  'avalanche': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'fort aguada': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
  'baga': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'calangute': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'dudhsagar': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
  'amber fort': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
  'hawa mahal': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
  'city palace': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
  'lake pichola': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'cafe 1947': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  'johnson': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  'earl': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  'nahar': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
};

function resolvePlacePhoto(name = '', description = '', givenPhoto = null) {
  if (givenPhoto && !givenPhoto.includes('photo-1566073771259-6a8506099945') && !givenPhoto.startsWith('places/')) {
    return givenPhoto;
  }
  const text = `${name} ${description}`.toLowerCase();
  for (const [key, photo] of Object.entries(LANDMARK_PHOTOS)) {
    if (text.includes(key)) {
      return photo;
    }
  }
  if (/temple|mandir|sanctuary|church|monastery|mosque|gurudwara|shrine/i.test(text)) {
    return 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=600&q=80';
  }
  if (/museum|gallery|heritage|palace|fort|monument|ruin/i.test(text)) {
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80';
  }
  if (/park|garden|forest|woods|sanctuary|reserve|vihar/i.test(text)) {
    return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80';
  }
  if (/waterfall|falls|lake|river|dam|stream|beach/i.test(text)) {
    return 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80';
  }
  if (/snow|peak|valley|trek|hiking|viewpoint|pass|alpine|mountain/i.test(text)) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';
  }
  if (/restaurant|cafe|bar|bistro|dining|dhaba|bakery|coffee|tea|food/i.test(text)) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
  }
  if (/hotel|resort|homestay|cottage|villa|inn|lodge|stay/i.test(text)) {
    return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
}

export class OptionCard {
  constructor({ data = {}, onSelect, multiSelect = false } = {}) {
    this.data = data;
    this.onSelect = onSelect;
    this.multiSelect = multiSelect;
    this.el = this._build();
  }

  isSelected() {
    return this.el.classList.contains('is-selected');
  }

  select() {
    this.el.classList.add('is-selected');
    const icon = this.el.querySelector('.option-card-select .material-symbols-outlined');
    if (icon) icon.textContent = 'check_circle';
  }

  deselect() {
    this.el.classList.remove('is-selected');
    const icon = this.el.querySelector('.option-card-select .material-symbols-outlined');
    if (icon) icon.textContent = this.multiSelect ? 'add_circle' : 'check_circle';
  }

  toggle() {
    if (this.isSelected()) {
      this.deselect();
      return false;
    } else {
      this.select();
      return true;
    }
  }

  _build() {
    const { data } = this;
    const el = document.createElement('div');
    
    const isFlight = !!(
      data.isFlight ||
      data.type === 'flight' ||
      data.airline ||
      data._raw?.airline ||
      data._raw?.flightNumber ||
      (data.description && data.description.includes('→'))
    );

    // Stretch vs Normal
    if (data.isStretch) {
      el.className = 'option-card snap-start flex-shrink-0 w-64 bg-surface rounded-xl border border-dashed border-secondary overflow-hidden group hover:shadow-md transition-shadow cursor-pointer relative';
    } else {
      el.className = 'option-card snap-start flex-shrink-0 w-64 bg-surface rounded-xl border border-surface-variant overflow-hidden group hover:shadow-md transition-shadow cursor-pointer relative';
    }

    el.setAttribute('role', 'listitem');
    if (data.isFlagged) el.classList.add('is-flagged');

    if (isFlight) {
      const airlineName = data.name || data._raw?.airline || 'Airline';
      const brand = getAirlineBrand(airlineName);
      const flightNum = data._raw?.flightNumber || `${brand.code} Direct`;
      const origin = data._raw?.origin || 'DEP';
      const dest = data._raw?.destination || 'ARR';
      const depTime = data._raw?.departureTime || data._raw?.departure_time || '';
      const arrTime = data._raw?.arrivalTime || data._raw?.arrival_time || '';
      const duration = data._raw?.duration || 'Non-stop';
      const badge = data.badge || data._raw?.badge || (data._raw?.stops === 0 ? 'Non-stop' : null);

      el.innerHTML = `
        ${data.isStretch ? `
          <div class="absolute top-0 left-0 bg-secondary text-surface text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-br-lg z-30 shadow-sm">
            Worth a look
          </div>` : ''}

        <!-- Aviation Airline Logo Header (No generic scenery photo) -->
        <div class="h-32 relative overflow-hidden ${brand.bg} p-3 flex flex-col justify-between text-white select-none">
          <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none"></div>

          <!-- Top row: Airline logo & Flight Number / Baggage badge -->
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              ${brand.logoSvg}
              <div class="min-w-0">
                <span class="text-xs font-bold font-headline-sm tracking-wide block leading-tight truncate">${esc(airlineName)}</span>
                <span class="text-[10px] font-mono text-white/80 font-semibold block leading-none mt-0.5">${esc(flightNum)}</span>
              </div>
            </div>
            ${badge ? `
              <span class="bg-black/35 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border border-white/20 flex-shrink-0 max-w-[130px] truncate" title="${esc(badge)}">
                ${esc(badge)}
              </span>` : ''}
          </div>

          <!-- Route & Aviation Visual -->
          <div class="relative z-10 flex items-center justify-between pt-1">
            <div class="text-left">
              <span class="text-base font-mono font-bold leading-none block">${esc(origin)}</span>
              <span class="text-[10px] text-white/80 font-medium block mt-0.5">${esc(depTime)}</span>
            </div>
            
            <div class="flex flex-col items-center flex-1 px-2">
              <span class="text-[9px] font-mono text-white/80 mb-0.5">${esc(duration)}</span>
              <div class="w-full flex items-center gap-1 opacity-80">
                <div class="h-[1px] bg-white/50 flex-1"></div>
                <span class="material-symbols-outlined text-xs transform rotate-90 text-white">flight</span>
                <div class="h-[1px] bg-white/50 flex-1"></div>
              </div>
            </div>

            <div class="text-right">
              <span class="text-base font-mono font-bold leading-none block">${esc(dest)}</span>
              <span class="text-[10px] text-white/80 font-medium block mt-0.5">${esc(arrTime)}</span>
            </div>
          </div>
        </div>

        <div class="p-3">
          <h4 class="font-label-md text-label-md text-on-surface font-semibold truncate">${esc(data.name)}</h4>
          <p class="font-label-sm text-label-sm text-on-surface-variant mt-0.5 line-clamp-1 font-mono text-xs">${esc(data.description ?? '')}</p>
          
          <div class="mt-2.5 flex justify-between items-center">
            <div>
              <span class="font-label-md text-label-md text-primary font-bold">
                ${esc(data.price ?? '')}
              </span>
              <span class="text-[10px] text-outline font-normal block font-mono">Verified Flight Fare</span>
            </div>
            <button class="option-card-select text-secondary hover:bg-secondary/10 p-1.5 rounded-full transition-colors flex items-center justify-center" type="button" aria-label="Select flight with ${esc(data.name)}">
              <span class="material-symbols-outlined text-lg">check_circle</span>
            </button>
          </div>
        </div>`;
    } else {
      // Hotel or Activity Card
      let photos = [];
      if (Array.isArray(data.photos) && data.photos.length > 0) {
        photos = data.photos;
      } else if (data._raw?.photos && Array.isArray(data._raw.photos) && data._raw.photos.length > 0) {
        photos = data._raw.photos;
      } else {
        const singlePhoto = resolvePlacePhoto(data.name, data.description, data.photo);
        photos = [singlePhoto];
      }

      const selectIcon = this.multiSelect ? 'add_circle' : 'check_circle';

      el.innerHTML = `
        ${data.isStretch ? `
          <div class="absolute top-0 left-0 bg-secondary text-surface text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-br-lg z-30 shadow-sm">
            Worth a look
          </div>` : ''}

        <div class="h-32 relative overflow-hidden bg-surface-container group/photo select-none">
          <div class="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-10 pointer-events-none"></div>
          <img class="option-card-main-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${esc(photos[0])}" alt="${esc(data.name)}" loading="lazy" onerror="this.onerror=null;this.src='${resolvePlacePhoto(data.name, data.description, null)}';">
          
          ${photos.length > 1 ? `
            <!-- Multi-photo Previous Button -->
            <button type="button" class="option-card-prev-photo absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer shadow-md" aria-label="Previous photo">
              <span class="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>

            <!-- Multi-photo Next Button -->
            <button type="button" class="option-card-next-photo absolute right-1.5 top-1/2 -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer shadow-md" aria-label="Next photo">
              <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>

            <!-- Multi-photo Dot Indicators -->
            <div class="option-card-dots absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs pointer-events-auto">
              ${photos.map((_, i) => `<span class="option-card-dot transition-all ${i === 0 ? 'w-2.5 h-1.5 rounded-full bg-white scale-110' : 'w-1.5 h-1.5 rounded-full bg-white/60 hover:bg-white cursor-pointer'}" data-photo-idx="${i}"></span>`).join('')}
            </div>
          ` : ''}

          ${data.rating ? `
            <div class="absolute top-2 right-2 bg-surface/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 z-20 shadow-sm">
              <span class="material-symbols-outlined material-fill text-secondary text-[12px]">star</span>
              <span class="font-label-sm text-label-sm text-on-surface font-bold">${esc(data.rating)}</span>
            </div>` : ''}

          ${data.isFlagged ? `
            <div class="absolute bottom-2 left-2 z-20 bg-error/15 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm" role="alert">
              ${esc(data.flagReason ?? 'Recent reviews declining')}
            </div>` : ''}
        </div>

        <div class="p-3">
          <h4 class="font-label-md text-label-md text-on-surface font-semibold truncate">${esc(data.name)}</h4>
          <p class="font-label-sm text-label-sm text-on-surface-variant mt-1 line-clamp-2">${esc(data.description ?? '')}</p>
          
          <div class="mt-3 flex flex-col gap-1">
            <div class="flex justify-between items-center">
              <span class="font-label-md text-label-md text-primary font-bold">
                ${esc(data.price ?? '')}<span class="text-[10px] font-normal text-outline">${esc(data.priceUnit ?? '')}</span>
              </span>
              <button class="option-card-select text-secondary hover:bg-secondary/10 p-1.5 rounded-full transition-colors flex items-center justify-center" type="button" aria-label="Select ${esc(data.name)}">
                <span class="material-symbols-outlined text-lg">${selectIcon}</span>
              </button>
            </div>
            ${data.isStretch && data.stretchReason ? `
              <span class="font-label-sm text-[10px] text-secondary font-medium">${esc(data.stretchReason)}</span>` : ''}
          </div>
        </div>`;

      if (photos.length > 1) {
        let activeIdx = 0;
        const mainImg = el.querySelector('.option-card-main-img');
        const prevBtn = el.querySelector('.option-card-prev-photo');
        const nextBtn = el.querySelector('.option-card-next-photo');
        const dots = el.querySelectorAll('.option-card-dot');

        const updatePhoto = (newIdx) => {
          activeIdx = (newIdx + photos.length) % photos.length;
          if (mainImg) {
            mainImg.src = photos[activeIdx];
          }
          dots.forEach((dot, idx) => {
            if (idx === activeIdx) {
              dot.className = 'option-card-dot w-2.5 h-1.5 rounded-full bg-white scale-110 transition-all';
            } else {
              dot.className = 'option-card-dot w-1.5 h-1.5 rounded-full bg-white/60 hover:bg-white cursor-pointer transition-all';
            }
          });
        };

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updatePhoto(activeIdx - 1);
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updatePhoto(activeIdx + 1);
          });
        }
        dots.forEach((dot) => {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(dot.getAttribute('data-photo-idx'), 10);
            if (!isNaN(idx)) updatePhoto(idx);
          });
        });
      }
    }

    el.addEventListener('click', () => {
      if (typeof this.onSelect === 'function') this.onSelect(data, el);
    });

    return el;
  }
}
