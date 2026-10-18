/**
 * SettingsView.js — Modular View Renderer for User Preferences
 * Archival Expedition Ledger & Wayfarer Preferences
 * Designed with Stitch MCP & Trailmate Heritage Design System
 */

import { communityService } from '../services/CommunityService.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderSettingsView(container, { switchView, store }) {
  let storedCurrency = localStorage.getItem('trailmate_currency') || '₹ INR';
  let storedDiet = localStorage.getItem('trailmate_diet') || 'All';
  let storedStay = localStorage.getItem('trailmate_stay') || '🏛 Heritage / Boutique';
  let storedHome = localStorage.getItem('trailmate_home_city') || 'Delhi';
  let storedMapStyle = localStorage.getItem('trailmate_map_style') || 'atlas';
  let storedUnits = localStorage.getItem('trailmate_units') || 'metric';

  const profile = communityService?.getProfile() || {};
  const userName = profile.name || 'Pratyush Raj';
  const userRank = profile.level ? `Master Scout • Rank ${profile.level}` : 'Master Scout • Rank IV';
  const userXp = profile.xp || 2450;
  const targetXp = 3000;
  const xpPercent = Math.min(100, Math.round((userXp / targetXp) * 100));

  container.innerHTML = `
    <div class="settings-ledger-wrap pt-2">
      <!-- ── Section 1: Regional Currency ── -->
      <div class="settings-paper-panel">
        <div class="settings-panel-header">
          <div class="settings-panel-title">
            <span class="material-symbols-outlined text-base text-[#C4703D]">payments</span>
            <span>Preferred Fiscal Currency</span>
          </div>
          <span class="settings-panel-subtitle">Calculates airfares, entry fees & rail passes</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="settingsCurrencyGrid">
          <button type="button" class="settings-currency-card ${storedCurrency === '₹ INR' ? 'selected' : ''}" data-currency="₹ INR">
            <div class="flex items-center justify-between">
              <span class="font-serif font-bold text-sm ${storedCurrency === '₹ INR' ? 'text-[#C4703D]' : 'text-[#1E3A34]'}">₹ INR</span>
              ${storedCurrency === '₹ INR' ? '<span class="material-symbols-outlined text-xs text-[#C4703D]">check_circle</span>' : ''}
            </div>
            <div class="text-[11px] font-medium text-neutral-600 truncate mt-1">Indian Rupee</div>
          </button>

          <button type="button" class="settings-currency-card ${storedCurrency === '$ USD' ? 'selected' : ''}" data-currency="$ USD">
            <div class="flex items-center justify-between">
              <span class="font-serif font-bold text-sm ${storedCurrency === '$ USD' ? 'text-[#C4703D]' : 'text-[#1E3A34]'}">$ USD</span>
              ${storedCurrency === '$ USD' ? '<span class="material-symbols-outlined text-xs text-[#C4703D]">check_circle</span>' : ''}
            </div>
            <div class="text-[11px] font-medium text-neutral-600 truncate mt-1">US Dollar</div>
          </button>

          <button type="button" class="settings-currency-card ${storedCurrency === '€ EUR' ? 'selected' : ''}" data-currency="€ EUR">
            <div class="flex items-center justify-between">
              <span class="font-serif font-bold text-sm ${storedCurrency === '€ EUR' ? 'text-[#C4703D]' : 'text-[#1E3A34]'}">€ EUR</span>
              ${storedCurrency === '€ EUR' ? '<span class="material-symbols-outlined text-xs text-[#C4703D]">check_circle</span>' : ''}
            </div>
            <div class="text-[11px] font-medium text-neutral-600 truncate mt-1">Euro</div>
          </button>

          <button type="button" class="settings-currency-card ${storedCurrency === '£ GBP' ? 'selected' : ''}" data-currency="£ GBP">
            <div class="flex items-center justify-between">
              <span class="font-serif font-bold text-sm ${storedCurrency === '£ GBP' ? 'text-[#C4703D]' : 'text-[#1E3A34]'}">£ GBP</span>
              ${storedCurrency === '£ GBP' ? '<span class="material-symbols-outlined text-xs text-[#C4703D]">check_circle</span>' : ''}
            </div>
            <div class="text-[11px] font-medium text-neutral-600 truncate mt-1">British Pound</div>
          </button>
        </div>
      </div>

      <!-- ── Section 2: Preferred Stay Styles ── -->
      <div class="settings-paper-panel">
        <div class="settings-panel-header">
          <div class="settings-panel-title">
            <span class="material-symbols-outlined text-base text-[#C4703D]">holiday_village</span>
            <span>Expedition Stay Archetype</span>
          </div>
          <span class="settings-panel-subtitle">Prioritized in AI lodging curation</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="settingsStayGrid">
          <button type="button" class="settings-stay-card ${storedStay.includes('Homestay') ? 'selected' : ''}" data-stay="🏡 Homestay / Farmstay">
            <div class="settings-stay-icon-box bg-[#5B8C7B]/10 text-[#5B8C7B]">
              <span class="material-symbols-outlined text-base">cottage</span>
            </div>
            <div>
              <div class="text-xs font-bold text-[#1E3A34]">Homestay / Plantation</div>
              <p class="text-[11px] text-[#7A7670] leading-snug mt-0.5">Local host families & organic coffee estates</p>
            </div>
          </button>

          <button type="button" class="settings-stay-card ${storedStay.includes('Heritage') ? 'selected' : ''}" data-stay="🏛 Heritage / Boutique">
            <div class="settings-stay-icon-box bg-[#C4703D]/10 text-[#C4703D]">
              <span class="material-symbols-outlined text-base">castle</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-[#1E3A34]">Heritage / Boutique</span>
                <span class="px-1.5 py-0.5 bg-[#C4703D]/10 text-[#C4703D] text-[8px] font-bold rounded-sm uppercase tracking-wider">Curated</span>
              </div>
              <p class="text-[11px] text-[#7A7670] leading-snug mt-0.5">Restored colonial bungalows & royal havelis</p>
            </div>
          </button>

          <button type="button" class="settings-stay-card ${storedStay.includes('Hotel') ? 'selected' : ''}" data-stay="🏨 Standard Hotel">
            <div class="settings-stay-icon-box bg-neutral-100 text-neutral-600">
              <span class="material-symbols-outlined text-base">hotel</span>
            </div>
            <div>
              <div class="text-xs font-bold text-[#1E3A34]">Standard Hotel</div>
              <p class="text-[11px] text-[#7A7670] leading-snug mt-0.5">City-center business suites & modern amenities</p>
            </div>
          </button>

          <button type="button" class="settings-stay-card ${storedStay.includes('Resort') ? 'selected' : ''}" data-stay="⛺ Resort / Retreat">
            <div class="settings-stay-icon-box bg-[#8B5A2B]/10 text-[#8B5A2B]">
              <span class="material-symbols-outlined text-base">camping</span>
            </div>
            <div>
              <div class="text-xs font-bold text-[#1E3A34]">Luxury Glamping & Retreat</div>
              <p class="text-[11px] text-[#7A7670] leading-snug mt-0.5">Safari dome tents, tea valley retreats & infinity spas</p>
            </div>
          </button>
        </div>
      </div>

      <!-- ── Section 3: Dietary & Field Nutrition ── -->
      <div class="settings-paper-panel">
        <div class="settings-panel-header">
          <div class="settings-panel-title">
            <span class="material-symbols-outlined text-base text-[#C4703D]">restaurant_menu</span>
            <span>Dietary & Field Dining Protocol</span>
          </div>
          <span class="settings-panel-subtitle">Guides culinary recommendations</span>
        </div>

        <div class="flex flex-wrap gap-2" id="settingsDietChips">
          <button type="button" class="settings-diet-pill ${storedDiet === 'All' ? 'selected' : ''}" data-diet="All">
            <span class="material-symbols-outlined text-sm">tune</span>
            <span>All Cuisines</span>
          </button>

          <button type="button" class="settings-diet-pill ${storedDiet === 'Pure Vegetarian' ? 'selected' : ''}" data-diet="Pure Vegetarian">
            <span class="material-symbols-outlined text-sm text-[#5B8C7B]">eco</span>
            <span>Pure Vegetarian</span>
          </button>

          <button type="button" class="settings-diet-pill ${storedDiet === 'Vegan' ? 'selected' : ''}" data-diet="Vegan">
            <span class="material-symbols-outlined text-sm text-[#5B8C7B]">spa</span>
            <span>Vegan</span>
          </button>

          <button type="button" class="settings-diet-pill ${storedDiet === 'Halal' ? 'selected' : ''}" data-diet="Halal">
            <span class="material-symbols-outlined text-sm text-amber-600">dark_mode</span>
            <span>Halal</span>
          </button>

          <button type="button" class="settings-diet-pill ${storedDiet === 'Jain' ? 'selected' : ''}" data-diet="Jain">
            <span class="material-symbols-outlined text-sm text-orange-600">psychology_alt</span>
            <span>Jain Friendly</span>
          </button>
        </div>
      </div>

      <!-- ── Section 4: Base Camp Origin & Cartography ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <!-- Base Camp Origin -->
        <div class="settings-paper-panel mb-0">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-sm text-[#C4703D]">trip_origin</span>
            <span class="text-xs font-bold text-[#1E3A34]">Base Camp Origin</span>
          </div>
          <div class="relative">
            <input type="text" id="inpOriginCity" value="${escapeHtml(storedHome)}" class="w-full text-xs font-semibold px-3 py-2 pl-8 bg-white rounded-xl border border-[#D5C3B6] focus:border-[#C4703D] focus:outline-none transition shadow-2xs" placeholder="e.g. Delhi, Mumbai" />
            <span class="material-symbols-outlined absolute left-2.5 top-2.5 text-xs text-[#7A7670]">location_on</span>
          </div>
          <div class="flex items-center gap-1.5 mt-2 flex-wrap">
            <span class="text-[10px] text-[#7A7670] font-mono">Quick:</span>
            <button type="button" class="settings-city-chip" data-city="Delhi">Delhi</button>
            <button type="button" class="settings-city-chip" data-city="Mumbai">Mumbai</button>
            <button type="button" class="settings-city-chip" data-city="Bengaluru">Bengaluru</button>
            <button type="button" class="settings-city-chip" data-city="Kolkata">Kolkata</button>
            <button type="button" class="settings-city-chip" data-city="Chennai">Chennai</button>
          </div>
        </div>

        <!-- Cartographic Style & Units -->
        <div class="settings-paper-panel mb-0 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <span class="material-symbols-outlined text-sm text-[#C4703D]">map</span>
              <span class="text-xs font-bold text-[#1E3A34]">Cartographic Style & Units</span>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-2" id="settingsMapStyleGroup">
              <button type="button" class="settings-carto-btn ${storedMapStyle === 'atlas' ? 'active' : 'inactive'}" data-map-style="atlas">
                Parchment Atlas
              </button>
              <button type="button" class="settings-carto-btn ${storedMapStyle === 'topo' ? 'active' : 'inactive'}" data-map-style="topo">
                Satellite Topo
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-[#7A7670] pt-2 border-t border-[#E8E5DF]">
            <span>Measurement Units:</span>
            <button type="button" id="btnToggleUnits" class="font-bold text-[#1E3A34] hover:text-[#C4703D] transition underline cursor-pointer">
              ${storedUnits === 'metric' ? 'Metric (km • m)' : 'Imperial (mi • ft)'}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Section 5: Explorer Credentials & Profile Pass ── -->
      <div class="settings-paper-panel">
        <div class="settings-passport-card">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-[#1E3A34] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0 border border-[#BFA895]">
              ${escapeHtml(userName.charAt(0) || 'P')}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-[#1E3A34] truncate">${escapeHtml(userName)}</span>
                <span class="px-2 py-0.5 bg-[#5B8C7B]/15 text-[#2E5E4E] text-[10px] font-bold rounded-full border border-[#5B8C7B]/30 whitespace-nowrap">
                  ${escapeHtml(userRank)}
                </span>
              </div>
              <div class="settings-xp-bar-track">
                <div class="settings-xp-bar-fill" style="width: ${xpPercent}%;"></div>
              </div>
              <div class="text-[10px] text-[#7A7670] font-mono mt-1">
                ${userXp} / ${targetXp} XP to Cartographer Laureate
              </div>
            </div>
          </div>

          <button type="button" id="btnOpenLoginFromSettings" class="px-3.5 py-1.5 rounded-xl bg-white border border-[#BFA895] text-[#944a1a] hover:bg-[#FAF6EE] text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer">
            Switch Account
          </button>
        </div>
      </div>

      <!-- ── Footer Action Bar ── -->
      <div class="settings-action-bar">
        <button type="button" id="btnRestoreDefaults" class="btn-settings-restore">
          Restore Archival Defaults
        </button>

        <button type="button" id="btnSaveFullSettings" class="btn-settings-save">
          <span class="material-symbols-outlined text-base">bookmark_added</span>
          <span>Save Preferences</span>
        </button>
      </div>

      <!-- ── Interactive Toast Feedback ── -->
      <div id="settingsToast" class="settings-toast-banner hidden">
        <span class="material-symbols-outlined text-base text-[#A7F3D0]">check_circle</span>
        <span id="settingsToastText">Preferences updated in explorer ledger!</span>
      </div>
    </div>
  `;

  // ── State Variables ──
  let currentCurrency = storedCurrency;
  let currentStay = storedStay;
  let currentDiet = storedDiet;
  let currentMapStyle = storedMapStyle;
  let currentUnits = storedUnits;

  const showToast = (message) => {
    const toast = document.getElementById('settingsToast');
    const toastText = document.getElementById('settingsToastText');
    if (toast && toastText) {
      toastText.textContent = message;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 2500);
    }
  };

  // ── Currency Card Selection ──
  const currencyGrid = container.querySelector('#settingsCurrencyGrid');
  currencyGrid?.querySelectorAll('.settings-currency-card').forEach((card) => {
    card.addEventListener('click', () => {
      currencyGrid.querySelectorAll('.settings-currency-card').forEach((c) => {
        c.classList.remove('selected');
        c.querySelector('.material-symbols-outlined')?.remove();
        c.querySelector('.font-serif')?.classList.remove('text-[#C4703D]');
        c.querySelector('.font-serif')?.classList.add('text-[#1E3A34]');
      });
      card.classList.add('selected');
      const val = card.dataset.currency;
      currentCurrency = val;
      const titleSpan = card.querySelector('.font-serif');
      if (titleSpan) {
        titleSpan.classList.remove('text-[#1E3A34]');
        titleSpan.classList.add('text-[#C4703D]');
      }
      const checkIcon = document.createElement('span');
      checkIcon.className = 'material-symbols-outlined text-xs text-[#C4703D]';
      checkIcon.textContent = 'check_circle';
      card.querySelector('.flex')?.appendChild(checkIcon);
      showToast(`Preferred currency set to ${val}`);
    });
  });

  // ── Stay Style Card Selection ──
  const stayGrid = container.querySelector('#settingsStayGrid');
  stayGrid?.querySelectorAll('.settings-stay-card').forEach((card) => {
    card.addEventListener('click', () => {
      stayGrid.querySelectorAll('.settings-stay-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      currentStay = card.dataset.stay;
      showToast(`Stay archetype set to ${currentStay}`);
    });
  });

  // ── Dietary Protocol Selection ──
  const dietChips = container.querySelector('#settingsDietChips');
  dietChips?.querySelectorAll('.settings-diet-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      dietChips.querySelectorAll('.settings-diet-pill').forEach((p) => p.classList.remove('selected'));
      pill.classList.add('selected');
      currentDiet = pill.dataset.diet;
      showToast(`Dietary protocol set to ${currentDiet}`);
    });
  });

  // ── Quick City Chips ──
  container.querySelectorAll('.settings-city-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cityInput = container.querySelector('#inpOriginCity');
      if (cityInput) {
        cityInput.value = chip.dataset.city;
        showToast(`Base camp origin set to ${chip.dataset.city}`);
      }
    });
  });

  // ── Cartographic Style Selection ──
  const mapStyleGroup = container.querySelector('#settingsMapStyleGroup');
  mapStyleGroup?.querySelectorAll('.settings-carto-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      mapStyleGroup.querySelectorAll('.settings-carto-btn').forEach((b) => {
        b.classList.remove('active');
        b.classList.add('inactive');
      });
      btn.classList.remove('inactive');
      btn.classList.add('active');
      currentMapStyle = btn.dataset.mapStyle;
      showToast(`Cartographic style set to ${currentMapStyle === 'atlas' ? 'Parchment Atlas' : 'Satellite Topo'}`);
    });
  });

  // ── Toggle Units ──
  const btnToggleUnits = container.querySelector('#btnToggleUnits');
  btnToggleUnits?.addEventListener('click', () => {
    currentUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
    btnToggleUnits.textContent = currentUnits === 'metric' ? 'Metric (km • m)' : 'Imperial (mi • ft)';
    showToast(`Units set to ${currentUnits === 'metric' ? 'Metric' : 'Imperial'}`);
  });

  // ── Restore Defaults ──
  container.querySelector('#btnRestoreDefaults')?.addEventListener('click', () => {
    currentCurrency = '₹ INR';
    currentStay = '🏛 Heritage / Boutique';
    currentDiet = 'All';
    currentMapStyle = 'atlas';
    currentUnits = 'metric';

    const cityInput = container.querySelector('#inpOriginCity');
    if (cityInput) cityInput.value = 'Delhi';

    // Update UI elements
    currencyGrid?.querySelectorAll('.settings-currency-card').forEach((c) => {
      const isDefault = c.dataset.currency === '₹ INR';
      c.classList.toggle('selected', isDefault);
      c.querySelector('.material-symbols-outlined')?.remove();
      if (isDefault) {
        const checkIcon = document.createElement('span');
        checkIcon.className = 'material-symbols-outlined text-xs text-[#C4703D]';
        checkIcon.textContent = 'check_circle';
        c.querySelector('.flex')?.appendChild(checkIcon);
      }
    });

    stayGrid?.querySelectorAll('.settings-stay-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.stay.includes('Heritage'));
    });

    dietChips?.querySelectorAll('.settings-diet-pill').forEach((p) => {
      p.classList.toggle('selected', p.dataset.diet === 'All');
    });

    mapStyleGroup?.querySelectorAll('.settings-carto-btn').forEach((b) => {
      const isDefault = b.dataset.mapStyle === 'atlas';
      b.classList.toggle('active', isDefault);
      b.classList.toggle('inactive', !isDefault);
    });

    if (btnToggleUnits) btnToggleUnits.textContent = 'Metric (km • m)';

    showToast('Defaults restored (₹ INR • Heritage / Boutique • Delhi • Metric)');
  });

  // ── Save Preferences Action ──
  container.querySelector('#btnSaveFullSettings')?.addEventListener('click', () => {
    const originCity = container.querySelector('#inpOriginCity')?.value.trim() || 'Delhi';

    localStorage.setItem('trailmate_currency', currentCurrency);
    localStorage.setItem('trailmate_diet', currentDiet);
    localStorage.setItem('trailmate_stay', currentStay);
    localStorage.setItem('trailmate_home_city', originCity);
    localStorage.setItem('trailmate_map_style', currentMapStyle);
    localStorage.setItem('trailmate_units', currentUnits);

    store.pushMessage({
      role: 'bot',
      text: `⚙️ **Preferences updated:** Currency set to ${currentCurrency}, lodging archetype **${currentStay}**, diet **${currentDiet}**, base camp origin **${originCity}**.`,
    });

    showToast('Preferences bound to expedition ledger! Returning to journal...');
    setTimeout(() => {
      switchView('chat');
    }, 800);
  });

  // ── Account Switcher Action ──
  const openLogin = () => {
    if (window.__trailmate?.showLoginScreen) {
      window.__trailmate.showLoginScreen({ isFirstTime: false });
    } else {
      window.location.hash = '#login';
    }
  };

  container.querySelector('#btnOpenLoginFromSettings')?.addEventListener('click', openLogin);
}
