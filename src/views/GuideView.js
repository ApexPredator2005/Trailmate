/**
 * GuideView.js — Modular View Renderer for App Guide & Sample Prompts
 * (Suggestion #19)
 */

export function renderGuideView(container, { switchView, store, engine }) {
  container.innerHTML = `
    <div class="mb-5">
      <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-[#944a1a] bg-[#944a1a]/10 px-2.5 py-0.5 rounded-full">TRAVEL COMPANION</span>
      <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Trailmate Guide</h1>
      <p class="text-xs text-neutral-600 font-body-sm">Your analog-inspired, fact-first AI travel planner and expedition journal</p>
    </div>

    <div class="space-y-3">
      <p class="text-xs text-neutral-700 leading-relaxed">
        Trailmate searches live airline schedules, real lodging rates, and local weather forecasts to compose customized, stress-free itineraries.
      </p>

      <h4 class="text-xs font-bold text-neutral-900 uppercase tracking-wider pt-2">Sample Prompts to Try:</h4>
      
      <div class="space-y-2">
        <button class="sample-prompt-btn text-left w-full p-3 tactile-inset-panel hover:bg-white text-xs font-semibold text-neutral-900 transition-colors cursor-pointer">
          🏔 "3-day romantic trip to Ooty next month from Delhi with tea gardens and nature walks"
        </button>
        <button class="sample-prompt-btn text-left w-full p-3 tactile-inset-panel hover:bg-white text-xs font-semibold text-neutral-900 transition-colors cursor-pointer">
          🌊 "5 days in Goa for 2 people with beachside dining and heritage villas"
        </button>
        <button class="sample-prompt-btn text-left w-full p-3 tactile-inset-panel hover:bg-white text-xs font-semibold text-neutral-900 transition-colors cursor-pointer">
          🏰 "Weekend getaway in Jaipur exploring forts, street food, and bazaars"
        </button>
      </div>
    </div>

    <button id="btnReturnFromGuide" class="w-full mt-6 py-3.5 bg-[#8b4513] text-white rounded-xl text-sm font-bold hover:bg-[#703810] transition-all shadow-md active:scale-[0.99] cursor-pointer">
      Start Exploring in Planner
    </button>
  `;

  container.querySelectorAll('.sample-prompt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.replace(/^["'\s]+|["'\s]+$/g, '').trim();
      switchView('chat');
      store.pushMessage({ role: 'user', text });
      if (engine) engine.handleUserMessage(text);
    });
  });

  document.getElementById('btnReturnFromGuide')?.addEventListener('click', () => {
    switchView('chat');
  });
}
