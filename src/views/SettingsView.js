/**
 * SettingsView.js — Modular View Renderer for User Preferences
 * (Suggestion #19)
 */

export function renderSettingsView(container, { switchView, store }) {
  const storedCurrency = localStorage.getItem('trailmate_currency') || '₹ INR';
  const storedDiet = localStorage.getItem('trailmate_diet') || 'All';
  const storedStay = localStorage.getItem('trailmate_stay') || 'Heritage / Boutique';
  const storedHome = localStorage.getItem('trailmate_home_city') || 'Delhi';

  container.innerHTML = `
    <div class="mb-5">
      <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-[#944a1a] bg-[#944a1a]/10 px-2.5 py-0.5 rounded-full">SYSTEM PREFERENCES</span>
      <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Planner Preferences</h1>
      <p class="text-xs text-neutral-600 font-body-sm">Configure default currencies, stay styles, and origin departure city</p>
    </div>

    <div class="space-y-3.5">
      <div class="tactile-inset-panel flex items-center justify-between">
        <div>
          <label class="block text-xs font-bold text-neutral-900">Preferred Currency</label>
          <p class="text-[10px] text-neutral-600">Calculates flight and hotel totals</p>
        </div>
        <select id="fullPrefCurrency" class="text-xs font-semibold p-2 rounded-xl border border-neutral-300 bg-white cursor-pointer focus:ring-1 focus:ring-secondary">
          <option value="₹ INR" ${storedCurrency === '₹ INR' ? 'selected' : ''}>₹ INR (Indian Rupee)</option>
          <option value="$ USD" ${storedCurrency === '$ USD' ? 'selected' : ''}>$ USD (US Dollar)</option>
          <option value="€ EUR" ${storedCurrency === '€ EUR' ? 'selected' : ''}>€ EUR (Euro)</option>
          <option value="£ GBP" ${storedCurrency === '£ GBP' ? 'selected' : ''}>£ GBP (British Pound)</option>
        </select>
      </div>

      <div class="tactile-inset-panel">
        <label class="block text-xs font-bold text-neutral-900 mb-2">Preferred Stay Style</label>
        <div class="grid grid-cols-2 gap-2" id="stayStylePills">
          <button type="button" class="pref-stay-btn p-2.5 rounded-xl text-xs font-semibold text-left border ${storedStay.includes('Homestay') ? 'bg-secondary text-white border-secondary shadow-xs' : 'bg-white/90 text-neutral-800 border-neutral-200'} transition-all cursor-pointer" data-stay="🏡 Homestay / Farmstay">🏡 Homestay</button>
          <button type="button" class="pref-stay-btn p-2.5 rounded-xl text-xs font-semibold text-left border ${storedStay.includes('Hotel') ? 'bg-secondary text-white border-secondary shadow-xs' : 'bg-white/90 text-neutral-800 border-neutral-200'} transition-all cursor-pointer" data-stay="🏨 Standard Hotel">🏨 Standard Hotel</button>
          <button type="button" class="pref-stay-btn p-2.5 rounded-xl text-xs font-semibold text-left border ${storedStay.includes('Heritage') ? 'bg-secondary text-white border-secondary shadow-xs' : 'bg-white/90 text-neutral-800 border-neutral-200'} transition-all cursor-pointer" data-stay="🏛 Heritage / Boutique">🏛 Heritage / Boutique</button>
          <button type="button" class="pref-stay-btn p-2.5 rounded-xl text-xs font-semibold text-left border ${storedStay.includes('Resort') ? 'bg-secondary text-white border-secondary shadow-xs' : 'bg-white/90 text-neutral-800 border-neutral-200'} transition-all cursor-pointer" data-stay="⛺ Resort / Retreat">⛺ Luxury Resort</button>
        </div>
      </div>

      <div class="tactile-inset-panel flex items-center justify-between">
        <div>
          <label class="block text-xs font-bold text-neutral-900">Dietary Preference</label>
          <p class="text-[10px] text-neutral-600">Guides curated dining recommendations</p>
        </div>
        <select id="fullPrefDiet" class="text-xs font-semibold p-2 rounded-xl border border-neutral-300 bg-white cursor-pointer focus:ring-1 focus:ring-secondary">
          <option value="All" ${storedDiet === 'All' ? 'selected' : ''}>All Cuisines</option>
          <option value="Pure Vegetarian" ${storedDiet === 'Pure Vegetarian' ? 'selected' : ''}>Pure Vegetarian</option>
          <option value="Vegan" ${storedDiet === 'Vegan' ? 'selected' : ''}>Vegan</option>
          <option value="Halal" ${storedDiet === 'Halal' ? 'selected' : ''}>Halal</option>
          <option value="Jain" ${storedDiet === 'Jain' ? 'selected' : ''}>Jain</option>
        </select>
      </div>

      <div class="tactile-inset-panel flex items-center justify-between">
        <div>
          <label class="block text-xs font-bold text-neutral-900">Home / Origin City</label>
          <p class="text-[10px] text-neutral-600">Default departure for route searches</p>
        </div>
        <input type="text" id="fullPrefHome" value="${storedHome}" class="text-xs font-semibold p-2 rounded-xl border border-neutral-300 bg-white w-32 focus:ring-1 focus:ring-secondary" placeholder="e.g. Delhi" />
      </div>

      <div class="tactile-inset-panel flex items-center justify-between">
        <div>
          <label class="block text-xs font-bold text-neutral-900">Traveler Account</label>
          <p class="text-[10px] text-neutral-600">Switch profile, sign in, or register as explorer</p>
        </div>
        <button type="button" id="btnOpenLoginFromSettings" class="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white border border-[#BFA895] text-[#944a1a] hover:bg-[#FAF6EE] transition cursor-pointer shadow-xs">
          Switch Account
        </button>
      </div>
    </div>

    <button id="btnSaveFullSettings" class="w-full mt-6 py-3.5 bg-[#8b4513] text-white rounded-xl text-sm font-bold hover:bg-[#703810] transition-all shadow-md active:scale-[0.99] cursor-pointer">
      Save Preferences
    </button>
  `;

  let selectedStay = storedStay;
  container.querySelectorAll('.pref-stay-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.pref-stay-btn').forEach((b) => {
        b.className = 'pref-stay-btn p-2.5 rounded-xl text-xs font-semibold text-left border bg-white/90 text-neutral-800 border-neutral-200 transition-all cursor-pointer';
      });
      btn.className = 'pref-stay-btn p-2.5 rounded-xl text-xs font-semibold text-left border bg-secondary text-white border-secondary shadow-xs transition-all cursor-pointer';
      selectedStay = btn.dataset.stay;
    });
  });

  document.getElementById('btnSaveFullSettings')?.addEventListener('click', () => {
    const c = document.getElementById('fullPrefCurrency')?.value || '₹ INR';
    const d = document.getElementById('fullPrefDiet')?.value || 'All';
    const h = document.getElementById('fullPrefHome')?.value.trim() || 'Delhi';
    localStorage.setItem('trailmate_currency', c);
    localStorage.setItem('trailmate_diet', d);
    localStorage.setItem('trailmate_stay', selectedStay);
    localStorage.setItem('trailmate_home_city', h);
    switchView('chat');
    store.pushMessage({
      role: 'bot',
      text: `⚙️ **Preferences updated:** Currency set to ${c}, stay style **${selectedStay}**, home origin **${h}**.`,
    });
  });

  document.getElementById('btnOpenLoginFromSettings')?.addEventListener('click', () => {
    if (window.__trailmate?.showLoginScreen) {
      window.__trailmate.showLoginScreen({ isFirstTime: false });
    } else {
      window.location.hash = '#login';
    }
  });
}
