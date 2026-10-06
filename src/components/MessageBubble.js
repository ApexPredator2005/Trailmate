/**
 * MessageBubble.js — Renders bot, user, typing, chip, destination showcase, and card bubbles.
 */

import { CardCarousel } from './CardCarousel.js';
import { ChipGroup } from './ChipGroup.js';
import { getCachedDestinationWeather, fetchAndSyncDestinationWeather, renderWeatherBadgeContent } from '../services/api.js';

if (typeof window !== 'undefined') {
  window.addEventListener('trailmate:weather-update', (e) => {
    const { destination, weatherString } = e.detail || {};
    if (!destination || !weatherString) return;
    const badges = document.querySelectorAll(`[data-dest-weather="${destination}"]`);
    badges.forEach((badge) => {
      badge.innerHTML = renderWeatherBadgeContent(weatherString);
      badge.title = `Live weather: ${weatherString}`;
    });
  });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderText(text) {
  let safe = escapeHtml(text);
  safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-secondary font-medium underline underline-offset-2 hover:opacity-80">$1</a>');
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/_(.*?)_/g, '<em>$1</em>');
  safe = safe.replace(/\n/g, '<br/>');
  return safe;
}

export function buildMessageElement(message, callbacks = {}) {
  switch (message.role) {
    case 'bot': return _botRow(message.text);
    case 'user': return _userRow(message.text);
    case 'typing': return _typingRow();
    case 'destinations': return _destinationsRow(message, callbacks.onDestinationSelect);
    case 'chips': return _chipsRow(message, callbacks.onChipSelect);
    case 'date-picker': return _datePickerRow(message, callbacks.onChipSelect);
    case 'budget-slider': return _budgetSliderRow(message, callbacks.onChipSelect);
    case 'cards': return _cardsRow(message, callbacks.onCardSelect);
    default:
      return document.createElement('div');
  }
}

function _botRow(text = '') {
  const row = document.createElement('div');
  row.className = 'flex gap-3.5 max-w-3xl w-full chat-bubble-enter items-start';
  row.innerHTML = `
    <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm bg-transparent">
      <img src="/logo.png" alt="Trailmate" class="w-full h-full object-cover" />
    </div>
    <div class="bg-surface-container-highest rounded-2xl rounded-tl-none p-4 shadow-sm border border-surface-variant/50 max-w-2xl flex-1">
      <p class="font-body-md text-on-surface leading-relaxed">${renderText(text)}</p>
    </div>`;
  return row;
}

function _userRow(text = '') {
  const row = document.createElement('div');
  row.className = 'flex gap-4 max-w-3xl self-end justify-end w-full chat-bubble-enter';
  row.innerHTML = `
    <div class="bg-secondary rounded-2xl rounded-tr-none p-4 shadow-sm max-w-2xl">
      <p class="font-body-md text-on-secondary leading-relaxed">${escapeHtml(text)}</p>
    </div>`;
  return row;
}

function _typingRow() {
  const row = document.createElement('div');
  row.className = 'flex gap-3.5 max-w-3xl w-full chat-bubble-enter items-start';
  row.dataset.typing = 'true';
  row.innerHTML = `
    <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm bg-transparent">
      <img src="/logo.png" alt="Trailmate" class="w-full h-full object-cover animate-pulse" />
    </div>
    <div class="bg-surface-container-highest rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-surface-variant/50 flex items-center gap-2" aria-label="Trailmate is reasoning">
      <span class="text-xs font-label-sm text-on-surface-variant">Trailmate is composing</span>
      <div class="flex items-center gap-1">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>`;
  return row;
}

function _destinationsRow(message, onDestinationSelect) {
  const row = document.createElement('div');
  row.className = 'w-full max-w-3xl pl-[62px] chat-bubble-enter';

  const allDestinations = message.destinations || [];

  // Header with Category Filter Pills
  const header = document.createElement('div');
  header.className = 'mb-3 transition-opacity duration-300';
  header.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="dest-header-title font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Explore 15 Handcrafted Destinations</span>
      <span class="dest-header-subtitle text-[11px] text-outline font-label-sm">Tap any card to start</span>
    </div>
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none" id="destFilterPills">
      <button type="button" class="dest-filter-pill active px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-secondary text-white transition-colors" data-cat="all">All (15)</button>
      <button type="button" class="dest-filter-pill px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" data-cat="hills">🌿 Hills</button>
      <button type="button" class="dest-filter-pill px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" data-cat="mountains">🏔️ Mountains</button>
      <button type="button" class="dest-filter-pill px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" data-cat="heritage">🏰 Heritage</button>
      <button type="button" class="dest-filter-pill px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" data-cat="beaches">🌊 Beaches</button>
      <button type="button" class="dest-filter-pill px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" data-cat="nature">🌴 Plantations</button>
    </div>
  `;
  row.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 transition-all duration-300';

  function handleDestinationSelect(dest, selectedCard) {
    if (row.dataset.hasSelected) return;
    row.dataset.hasSelected = 'true';

    // Disable all filter pills and fade them out smoothly
    const pills = header.querySelectorAll('.dest-filter-pill');
    pills.forEach((p) => {
      p.style.pointerEvents = 'none';
      p.disabled = true;
    });

    const isReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Mark selected card & update check icon immediately
    selectedCard.classList.add('dest-card-selected');
    const arrowIcon = selectedCard.querySelector('.dest-card-arrow');
    if (arrowIcon) {
      arrowIcon.textContent = 'check_circle';
      arrowIcon.className = 'dest-card-arrow material-symbols-outlined text-base opacity-100 text-terracotta transition-all';
    }

    // Measure starting coordinates (First) relative to viewport
    const firstRect = selectedCard.getBoundingClientRect();

    // 2. Identify sibling cards and fade them out simultaneously
    const allCards = Array.from(grid.querySelectorAll('.dest-card'));
    const otherCards = allCards.filter((c) => c !== selectedCard);
    otherCards.forEach((otherCard) => {
      otherCard.style.pointerEvents = 'none';
      otherCard.classList.add('dest-card-shrink-out');
    });

    // Fade out filter pills cleanly
    const filterPillsContainer = header.querySelector('#destFilterPills');
    if (filterPillsContainer) {
      filterPillsContainer.style.opacity = '0';
      filterPillsContainer.style.transition = 'opacity 200ms ease';
      setTimeout(() => { filterPillsContainer.style.display = 'none'; }, 200);
    }

    if (isReduced) {
      // Reduced motion: immediate settlement
      otherCards.forEach((c) => c.remove());
      grid.className = 'w-full max-w-md';
      selectedCard.classList.remove('dest-card-selected');
      selectedCard.classList.add('dest-card-confirmed');
      const titleLabel = header.querySelector('.dest-header-title');
      if (titleLabel) titleLabel.textContent = 'Selected Destination';
      const subtitleLabel = header.querySelector('.dest-header-subtitle');
      if (subtitleLabel) subtitleLabel.textContent = 'Confirmed';
      if (typeof onDestinationSelect === 'function') {
        onDestinationSelect(dest, row);
      }
      return;
    }

    // 3. FRAME 1 INSTANT MORPH:
    // Create an invisible placeholder with exact target hero dimensions in the grid
    // so we can measure the final target coordinates (Last) right now!
    const targetPlaceholder = document.createElement('div');
    targetPlaceholder.style.width = '100%';
    targetPlaceholder.style.maxWidth = '480px';
    targetPlaceholder.style.height = '180px';
    targetPlaceholder.style.visibility = 'hidden';
    targetPlaceholder.style.pointerEvents = 'none';
    grid.insertBefore(targetPlaceholder, grid.firstChild);

    const lastRect = targetPlaceholder.getBoundingClientRect();
    targetPlaceholder.remove();

    // Take selectedCard out of grid flow IMMEDIATELY so sibling collapse does not alter its position
    const rowRect = row.getBoundingClientRect();
    row.style.position = 'relative';

    // Measure relative starting and target offsets inside row
    const startLeft = firstRect.left - rowRect.left;
    const startTop = firstRect.top - rowRect.top;
    const targetLeft = lastRect.left - rowRect.left;
    const targetTop = lastRect.top - rowRect.top;

    // Fix the card at its exact starting position in absolute coordinates
    selectedCard.classList.add('dest-card-morphing');
    selectedCard.style.left = `${startLeft}px`;
    selectedCard.style.top = `${startTop}px`;
    selectedCard.style.width = `${firstRect.width}px`;
    selectedCard.style.height = `${firstRect.height}px`;

    // Calculate invert delta
    const deltaX = targetLeft - startLeft;
    const deltaY = targetTop - startTop;
    const scaleX = lastRect.width / Math.max(firstRect.width, 1);
    const scaleY = lastRect.height / Math.max(firstRect.height, 1);

    // Update header labels concurrently
    const titleLabel = header.querySelector('.dest-header-title');
    if (titleLabel) titleLabel.textContent = 'Selected Destination';
    const subtitleLabel = header.querySelector('.dest-header-subtitle');
    if (subtitleLabel) subtitleLabel.textContent = 'Confirmed';

    // Remove other cards after fade completes
    setTimeout(() => {
      otherCards.forEach((c) => c.remove());
    }, 280);

    // PLAY on frame 1: Single, uninterrupted 360ms compositor tween
    const DURATION = 360;
    const EASING = 'cubic-bezier(0.2, 0, 0, 1)';

    const cardAnim = selectedCard.animate(
      [
        {
          transform: 'translate(0px, 0px) scale(1, 1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
          boxShadow: '0 0 0 2.5px var(--terracotta), 0 12px 36px -4px rgba(148, 74, 26, 0.32)',
        },
      ],
      {
        duration: DURATION,
        easing: EASING,
        fill: 'forwards',
      }
    );

    // Counter-scale inner image so aspect ratio does not distort while container expands
    const innerImg = selectedCard.querySelector('img');
    let imgAnim = null;
    if (innerImg) {
      imgAnim = innerImg.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: `scale(${1 / scaleX}, ${1 / scaleY})` },
        ],
        {
          duration: DURATION,
          easing: EASING,
          fill: 'forwards',
        }
      );
    }

    // When card expansion reaches >85% (around 310ms), trigger follow-up message creation
    let callbackTriggered = false;
    const triggerTimeout = setTimeout(() => {
      if (!callbackTriggered) {
        callbackTriggered = true;
        if (typeof onDestinationSelect === 'function') {
          onDestinationSelect(dest, row);
        }
      }
    }, Math.round(DURATION * 0.88));

    // When animation completes, settle DOM classes cleanly
    cardAnim.onfinish = () => {
      cardAnim.cancel();
      if (imgAnim) imgAnim.cancel();

      // Clean up inline styles and finalize resting layout
      selectedCard.classList.remove('dest-card-selected', 'dest-card-morphing');
      selectedCard.classList.add('dest-card-confirmed');
      selectedCard.style.left = '';
      selectedCard.style.top = '';
      selectedCard.style.width = '';
      selectedCard.style.height = '';
      selectedCard.style.transform = '';
      grid.className = 'w-full max-w-md';

      if (!callbackTriggered) {
        callbackTriggered = true;
        clearTimeout(triggerTimeout);
        if (typeof onDestinationSelect === 'function') {
          onDestinationSelect(dest, row);
        }
      }
    };
  }


  function renderCards(list) {
    grid.innerHTML = '';
    list.forEach((dest) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.dataset.destName = (dest.name || '').toLowerCase();
      card.className =
        'dest-card group text-left relative h-36 rounded-2xl overflow-hidden border border-surface-variant shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer animate-fadeIn';

      const initialWeather = getCachedDestinationWeather(dest.name) || dest.weather || '18°C · Pleasant';

      card.innerHTML = `
        <!-- Background Photo -->
        <img src="${escapeHtml(dest.photo || '/images/destinations/ooty.jpg')}" alt="${escapeHtml(dest.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.onerror=null;this.src='/images/destinations/ooty.jpg';">
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-300"></div>

        <!-- Top Badges -->
        <div class="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start gap-1.5">
          <span class="bg-black/50 backdrop-blur-md text-white text-[10.5px] font-mono font-medium px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1 min-w-0 max-w-[155px] flex-shrink" title="${escapeHtml(dest.state)}">
            <span class="flex-shrink-0">${escapeHtml(dest.icon)}</span>
            <span class="truncate">${escapeHtml(dest.state)}</span>
          </span>
          <span class="dest-card-weather bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-lg border border-white/20 flex flex-col items-end text-right flex-shrink-0 leading-none shadow-xs" data-dest-weather="${escapeHtml(dest.name.toLowerCase())}" title="Weather for ${escapeHtml(dest.name)}: ${escapeHtml(initialWeather)}">
            ${renderWeatherBadgeContent(initialWeather)}
          </span>
        </div>

        <!-- Bottom Info -->
        <div class="absolute bottom-3 left-3 right-3 text-white">
          <h4 class="font-serif text-[15px] font-bold text-white leading-tight drop-shadow-md flex items-center justify-between">
            <span>${escapeHtml(dest.name)}</span>
            <span class="dest-card-arrow material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 text-white">arrow_forward</span>
          </h4>
          <p class="font-sans text-[10.5px] text-white/80 font-normal line-clamp-1 mt-0.5 drop-shadow-xs">
            ${escapeHtml(dest.vibe)}
          </p>
        </div>
      `;

      card.addEventListener('click', () => {
        handleDestinationSelect(dest, card);
      });

      grid.appendChild(card);
    });

    // Background prefetch live weather for all currently rendered cards
    const destNames = list.map((d) => d.name).filter(Boolean);
    if (destNames.length > 0) {
      setTimeout(() => {
        (async () => {
          for (let i = 0; i < destNames.length; i += 3) {
            if (row.dataset.hasSelected) break; // stop fetching remaining if user already picked
            const chunk = destNames.slice(i, i + 3);
            await Promise.all(chunk.map((name) => fetchAndSyncDestinationWeather(name)));
            await new Promise((r) => setTimeout(r, 40));
          }
        })();
      }, 50);
    }
  }

  // Initial render (sorted by popularity)
  const sortedAll = allDestinations.slice().sort((a, b) => (a.popularityRank || 99) - (b.popularityRank || 99));
  renderCards(sortedAll);

  // Filter click handlers
  header.querySelectorAll('.dest-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      if (row.dataset.hasSelected) return;

      header.querySelectorAll('.dest-filter-pill').forEach((p) => {
        p.className = 'dest-filter-pill px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors';
      });
      pill.className = 'dest-filter-pill active px-3 py-1 rounded-full text-xs font-label-sm font-semibold bg-secondary text-white transition-colors';

      const cat = pill.dataset.cat;
      if (cat === 'all') {
        renderCards(sortedAll);
      } else {
        const filtered = allDestinations
          .filter((d) => d.category === cat || (d.categories && d.categories.includes(cat)))
          .sort((a, b) => (a.popularityRank || 99) - (b.popularityRank || 99));
        renderCards(filtered);
      }
    });
  });

  row.appendChild(grid);
  return row;
}

function _chipsRow(message, onChipSelect) {
  const row = document.createElement('div');
  row.className = 'flex gap-4 max-w-3xl w-full pl-[62px]';

  const group = new ChipGroup({
    chips: message.chips ?? [],
    multiSelect: message.multiSelect ?? false,
    label: message.label ?? 'Quick replies',
    submitLabel: message.submitLabel ?? 'Click when done',
    onSelect: (chip) => {
      group.disable();
      if (typeof onChipSelect === 'function') onChipSelect(chip, row);
    },
  });

  row.appendChild(group.el);
  return row;
}

function _datePickerRow(message, onChipSelect) {
  const row = document.createElement('div');
  row.className = 'flex flex-col gap-2.5 max-w-3xl w-full pl-[62px] chat-bubble-enter';

  const todayIso = new Date().toISOString().split('T')[0];
  const minDate = message.minDate || todayIso;
  const defaultDate = message.defaultDate || minDate;
  const suggestions = message.suggestions || [];

  let chipsWrapper = null;

  // 1. Quick suggestion chips
  if (suggestions.length > 0) {
    chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'flex flex-wrap gap-2 items-center';

    suggestions.forEach((chip) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip transition-all hover:scale-102 active:scale-98 cursor-pointer';
      btn.innerHTML = `<span>${escapeHtml(chip.label)}</span>`;
      btn.addEventListener('click', () => {
        chipsWrapper.querySelectorAll('button').forEach((b) => {
          b.disabled = true;
          b.classList.remove('hover:scale-102', 'active:scale-98', 'cursor-pointer');
          b.classList.add('cursor-default', 'pointer-events-none');
          if (b === btn) {
            b.classList.add('is-selected');
          }
        });
        if (customCard) {
          dateInput.disabled = true;
          confirmBtn.disabled = true;
          confirmBtn.classList.remove('cursor-pointer', 'active:scale-95', 'hover:bg-secondary/90');
          confirmBtn.classList.add('cursor-default');
        }
        if (typeof onChipSelect === 'function') onChipSelect(chip, row);
      });
      chipsWrapper.appendChild(btn);
    });
    row.appendChild(chipsWrapper);
  }

  // 2. Custom Date Picker Card
  const customCard = document.createElement('div');
  customCard.className = 'flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-[#F6F3EE] border border-outline-variant/50 shadow-xs max-w-lg';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'text-xs font-mono text-on-surface-variant flex items-center gap-1.5 font-bold';
  labelSpan.innerHTML = '<span class="material-symbols-outlined text-base text-secondary">edit_calendar</span> Pick custom departure date:';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.min = minDate;
  dateInput.value = defaultDate;
  dateInput.className = 'bg-[#FCF9F4] border border-outline-variant/60 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 shadow-xs focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none cursor-pointer';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'px-4 py-2 bg-secondary text-on-secondary rounded-xl font-label-md text-xs font-bold hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95';
  confirmBtn.innerHTML = `<span>Set Date</span> <span class="material-symbols-outlined text-sm">calendar_month</span>`;

  const handleConfirm = () => {
    const val = dateInput.value;
    if (!val) return;
    confirmBtn.disabled = true;
    dateInput.disabled = true;
    confirmBtn.classList.remove('bg-secondary', 'cursor-pointer', 'active:scale-95', 'hover:bg-secondary/90');
    confirmBtn.classList.add('bg-[#1E3A34]', 'text-white', 'cursor-default');

    const parts = val.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mName = months[parseInt(parts[1], 10) - 1] || parts[1];
    const formatted = `${parseInt(parts[2], 10)} ${mName} ${parts[0]}`;
    confirmBtn.innerHTML = `<span>✓ Confirmed: ${formatted}</span> <span class="material-symbols-outlined text-sm">check_circle</span>`;

    if (chipsWrapper) {
      chipsWrapper.querySelectorAll('button').forEach((b) => {
        b.disabled = true;
        b.classList.remove('hover:scale-102', 'active:scale-98', 'cursor-pointer');
        b.classList.add('cursor-default', 'pointer-events-none');
      });
    }

    if (typeof onChipSelect === 'function') {
      onChipSelect({ label: `📅 ${formatted}`, value: val }, row);
    }
  };

  confirmBtn.addEventListener('click', handleConfirm);
  dateInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleConfirm();
  });

  customCard.appendChild(labelSpan);
  customCard.appendChild(dateInput);
  customCard.appendChild(confirmBtn);

  row.appendChild(customCard);
  return row;
}

function _budgetSliderRow(message, onChipSelect) {
  const row = document.createElement('div');
  row.className = 'flex flex-col gap-3 max-w-3xl w-full pl-[62px] chat-bubble-enter';

  const defaultAmount = message.defaultAmount || 15000;
  const minAmount = message.minAmount || 2000;
  const maxAmount = message.maxAmount || 50000;
  const step = message.step || 1000;
  const presets = message.presets || [
    { label: '💰 Budget-friendly', value: 'budget' },
    { label: '⚖️ Moderate', value: 'moderate' },
    { label: '✨ Luxury', value: 'luxury' },
  ];

  let chipsWrapper = null;

  // 1. Preset chips
  if (presets.length > 0) {
    chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'flex flex-wrap gap-2 items-center';

    presets.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip transition-all hover:scale-102 active:scale-98 cursor-pointer';
      btn.innerHTML = `<span>${escapeHtml(preset.label)}</span>`;
      btn.addEventListener('click', () => {
        chipsWrapper.querySelectorAll('button').forEach((b) => {
          b.disabled = true;
          b.classList.remove('hover:scale-102', 'active:scale-98', 'cursor-pointer');
          b.classList.add('cursor-default', 'pointer-events-none');
          if (b === btn) {
            b.classList.add('is-selected');
          }
        });
        rangeInput.disabled = true;
        confirmBtn.disabled = true;
        confirmBtn.classList.remove('cursor-pointer', 'active:scale-95', 'hover:bg-secondary/90');
        confirmBtn.classList.add('cursor-default');
        if (typeof onChipSelect === 'function') {
          onChipSelect({ label: preset.label, value: preset.value }, row);
        }
      });
      chipsWrapper.appendChild(btn);
    });
    row.appendChild(chipsWrapper);
  }

  // 2. Custom Budget Slider Card
  const sliderCard = document.createElement('div');
  sliderCard.className = 'flex flex-col gap-3 p-4 rounded-2xl bg-[#F6F3EE] border border-outline-variant/60 shadow-xs max-w-lg';

  sliderCard.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 font-bold text-xs text-neutral-900 font-mono">
        <span class="material-symbols-outlined text-base text-secondary">tune</span>
        <span>Custom Budget Slider (₹2,000 – ₹50,000+)</span>
      </div>
      <div id="budgetDisplayVal" class="text-sm font-bold font-mono text-secondary px-2.5 py-0.5 rounded-lg bg-white border border-outline-variant/50 shadow-2xs">
        ₹${defaultAmount.toLocaleString('en-IN')}
      </div>
    </div>

    <div class="space-y-1 py-1">
      <input type="range" id="customBudgetRange" min="${minAmount}" max="${maxAmount}" step="${step}" value="${defaultAmount}" class="w-full accent-secondary h-2 bg-neutral-200 rounded-lg cursor-pointer transition-all" />
      <div class="flex justify-between text-[10px] font-mono text-on-surface-variant font-semibold">
        <span>₹2,000</span>
        <span>₹15,000</span>
        <span>₹30,000</span>
        <span>₹50,000+</span>
      </div>
    </div>

    <div class="flex items-center justify-between pt-1 border-t border-outline-variant/30">
      <span class="text-[11px] text-neutral-600 font-sans">Set your custom target budget</span>
      <button type="button" id="btnConfirmBudgetSlider" class="px-4 py-2 bg-secondary text-on-secondary rounded-xl font-label-md text-xs font-bold hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95">
        <span>Confirm Budget</span> <span class="material-symbols-outlined text-sm">payments</span>
      </button>
    </div>
  `;

  const rangeInput = sliderCard.querySelector('#customBudgetRange');
  const displayVal = sliderCard.querySelector('#budgetDisplayVal');
  const confirmBtn = sliderCard.querySelector('#btnConfirmBudgetSlider');

  const updateDisplay = () => {
    const val = parseInt(rangeInput.value, 10);
    displayVal.textContent = val >= maxAmount ? `₹${maxAmount.toLocaleString('en-IN')}+` : `₹${val.toLocaleString('en-IN')}`;
  };

  rangeInput.addEventListener('input', updateDisplay);

  confirmBtn.addEventListener('click', () => {
    const val = parseInt(rangeInput.value, 10);
    confirmBtn.disabled = true;
    rangeInput.disabled = true;
    const formatted = val >= maxAmount ? `₹${maxAmount.toLocaleString('en-IN')}+` : `₹${val.toLocaleString('en-IN')}`;

    confirmBtn.classList.remove('bg-secondary', 'cursor-pointer', 'active:scale-95', 'hover:bg-secondary/90');
    confirmBtn.classList.add('bg-[#1E3A34]', 'text-white', 'cursor-default');
    confirmBtn.innerHTML = `<span>✓ Confirmed: ${formatted}</span> <span class="material-symbols-outlined text-sm">check_circle</span>`;

    if (chipsWrapper) {
      chipsWrapper.querySelectorAll('button').forEach((b) => {
        b.disabled = true;
        b.classList.remove('hover:scale-102', 'active:scale-98', 'cursor-pointer');
        b.classList.add('cursor-default', 'pointer-events-none');
      });
    }

    // Map to tier
    let tier = 'moderate';
    if (val <= 10000) tier = 'budget';
    else if (val >= 35000) tier = 'luxury';

    if (typeof onChipSelect === 'function') {
      onChipSelect({
        label: `💰 Custom Budget: ${formatted}`,
        value: tier,
        customBudget: val,
      }, row);
    }
  });

  row.appendChild(sliderCard);
  return row;
}

function _cardsRow(message, onCardSelect) {
  const row = document.createElement('div');
  row.className = 'flex gap-4 max-w-3xl w-full pl-[62px]';

  const carousel = new CardCarousel({
    cards: message.cards ?? [],
    label: message.label ?? 'Options',
    multiSelect: message.multiSelect ?? false,
    onSelect: (cardData, cardEl) => {
      if (typeof onCardSelect === 'function') {
        onCardSelect(cardData, cardEl);
      }
    },
  });

  row.appendChild(carousel.el);
  return row;
}
