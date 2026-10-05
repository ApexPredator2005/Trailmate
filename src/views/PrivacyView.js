/**
 * PrivacyView.js — Modular View Renderer for API Sources & Integration Status
 * (Suggestion #19)
 */

export function renderPrivacyView(container, { switchView }) {
  container.innerHTML = `
    <div class="mb-5">
      <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e4433] bg-[#2e4433]/10 px-2.5 py-0.5 rounded-full">INTEGRATION STATUS</span>
      <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Security &amp; API Sources</h1>
      <p class="text-xs text-neutral-600 font-body-sm">Live service connections and data verification policies</p>
    </div>

    <div class="space-y-3">
      <div class="tactile-inset-panel flex items-center justify-between p-3.5">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-green-700 text-lg">check_circle</span>
          <div>
            <h5 class="text-xs font-bold text-neutral-900">Google Places API (New)</h5>
            <p class="text-[10px] text-neutral-600">Real venues, opening hours, photos &amp; ratings</p>
          </div>
        </div>
        <span class="text-[10px] bg-green-200/80 text-green-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Connected</span>
      </div>

      <div class="tactile-inset-panel flex items-center justify-between p-3.5">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-green-700 text-lg">check_circle</span>
          <div>
            <h5 class="text-xs font-bold text-neutral-900">WeatherAPI.com</h5>
            <p class="text-[10px] text-neutral-600">3-day temperature, conditions &amp; severe weather alerts</p>
          </div>
        </div>
        <span class="text-[10px] bg-green-200/80 text-green-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">30m Cache</span>
      </div>

      <div class="tactile-inset-panel flex items-center justify-between p-3.5">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-green-700 text-lg">check_circle</span>
          <div>
            <h5 class="text-xs font-bold text-neutral-900">Flight Search Microservice</h5>
            <p class="text-[10px] text-neutral-600">Live direct flight route schedules &amp; rates</p>
          </div>
        </div>
        <span class="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Live Direct</span>
      </div>

      <div class="tactile-inset-panel flex items-center justify-between p-3.5">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-green-700 text-lg">check_circle</span>
          <div>
            <h5 class="text-xs font-bold text-neutral-900">StayAPI Lodging Rates</h5>
            <p class="text-[10px] text-neutral-600">Hotel live pricing &amp; 5-day quota cache management</p>
          </div>
        </div>
        <span class="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">5-Day TTL</span>
      </div>
    </div>

    <button id="btnReturnFromPrivacy" class="w-full mt-6 py-4 bg-[#8b4513] text-white rounded-2xl text-base font-bold hover:bg-[#703810] transition-all shadow-lg active:scale-[0.98] cursor-pointer">
      Return to Planner
    </button>
  `;

  document.getElementById('btnReturnFromPrivacy')?.addEventListener('click', () => {
    switchView('chat');
  });
}
