/**
 * ShareView.js — Modular View Renderer for Itinerary Export, WhatsApp & Calendar (.ics) Sync
 */

import {
  formatItineraryMarkdown,
  downloadIcsCalendar,
  getGoogleMapsDirectionsUrl,
  getGoogleCalendarWebUrl,
} from '../utils/exportUtils.js';

export {
  formatItineraryMarkdown,
  downloadIcsCalendar,
  getGoogleMapsDirectionsUrl,
  getGoogleCalendarWebUrl,
};

export function renderShareView(container, { switchView, store }) {
  const { trip = {}, itinerary = null } = store.getState();
  const currDest = trip.destination || 'Your Journey';

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    container.innerHTML = `
      <div class="mb-5">
        <span class="text-[10px] font-mono font-bold tracking-widest uppercase text-[#944a1a] bg-[#944a1a]/10 px-2.5 py-0.5 rounded-full">SHARE &amp; COLLABORATE</span>
        <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Share Itinerary</h1>
        <p class="text-xs text-neutral-600 font-body-sm">Export and collaborate on your travel plan</p>
      </div>

      <div class="tactile-inset-panel mb-6 text-center py-4">
        <p class="text-xs text-neutral-700">
          Your itinerary for <strong class="text-primary">${currDest}</strong> is still being crafted! Once your stay, flights, and stops are composed, you can export and share it here.
        </p>
      </div>

      <button id="btnReturnFromShare" class="w-full py-3.5 bg-[#8b4513] text-white rounded-xl text-sm font-bold hover:bg-[#703810] transition-all shadow-md active:scale-[0.99] cursor-pointer">
        Continue Planning
      </button>
    `;
    document.getElementById('btnReturnFromShare')?.addEventListener('click', () => switchView('chat'));
    return;
  }

  const md = formatItineraryMarkdown(trip, itinerary);
  const mapsUrl = getGoogleMapsDirectionsUrl(trip, itinerary);
  const gcalUrl = getGoogleCalendarWebUrl(trip, itinerary);

  container.innerHTML = `
    <div class="mb-5">
      <span class="text-[10px] font-mono font-bold tracking-widest uppercase text-[#944a1a] bg-[#944a1a]/10 px-2.5 py-0.5 rounded-full">SHARE &amp; COLLABORATE</span>
      <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Share &amp; Export</h1>
      <p class="text-xs text-neutral-600 font-body-sm">Export your <strong class="text-primary">${currDest}</strong> itinerary</p>
    </div>

    <div class="space-y-3">
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" id="btnOpenGoogleMaps" class="w-full p-3.5 tactile-inset-panel hover:bg-white text-left flex items-center justify-between transition-colors cursor-pointer group">
        <div>
          <h5 class="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
            <span>🗺️ Open Multi-Stop Route in Google Maps</span>
            <span class="text-[9.5px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">Live GPS</span>
          </h5>
          <p class="text-[10px] text-neutral-600">Launches turn-by-turn navigation between all your trip stops</p>
        </div>
        <span class="material-symbols-outlined text-neutral-700 text-lg group-hover:translate-x-0.5 transition-transform">open_in_new</span>
      </a>

      <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" id="btnAddToGCal" class="w-full p-3.5 tactile-inset-panel hover:bg-white text-left flex items-center justify-between transition-colors cursor-pointer group">
        <div>
          <h5 class="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
            <span>📅 Add to Google Calendar</span>
            <span class="text-[9.5px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">1-Click</span>
          </h5>
          <p class="text-[10px] text-neutral-600">Creates an expedition schedule event directly in Google Calendar</p>
        </div>
        <span class="material-symbols-outlined text-neutral-700 text-lg group-hover:translate-x-0.5 transition-transform">event</span>
      </a>

      <button id="btnDownloadIcs" class="w-full p-3.5 tactile-inset-panel hover:bg-white text-left flex items-center justify-between transition-colors cursor-pointer group">
        <div>
          <h5 class="font-bold text-xs text-neutral-900">Download Calendar (.ics)</h5>
          <p class="text-[10px] text-neutral-600">Adds daily stops with real start dates to Apple / Outlook Calendar</p>
        </div>
        <span class="material-symbols-outlined text-neutral-700 text-lg group-hover:translate-x-0.5 transition-transform">calendar_month</span>
      </button>

      <button id="btnCopyWhatsapp" class="w-full p-3.5 tactile-inset-panel hover:bg-white text-left flex items-center justify-between transition-colors cursor-pointer group">
        <div>
          <h5 class="font-bold text-xs text-neutral-900">WhatsApp / Message Summary</h5>
          <p class="text-[10px] text-neutral-600">Compact text ready to send travel companions</p>
        </div>
        <span class="material-symbols-outlined text-neutral-700 text-lg group-hover:translate-x-0.5 transition-transform">send</span>
      </button>

      <button id="btnCopyMarkdown" class="w-full p-3.5 tactile-inset-panel hover:bg-white text-left flex items-center justify-between transition-colors cursor-pointer group">
        <div>
          <h5 class="font-bold text-xs text-neutral-900">Copy as Markdown</h5>
          <p class="text-[10px] text-neutral-600">Formatted for Notion, Notes, or Markdown docs</p>
        </div>
        <span class="material-symbols-outlined text-neutral-700 text-lg group-hover:translate-x-0.5 transition-transform">content_copy</span>
      </button>
    </div>

    <button id="btnReturnFromShare" class="w-full mt-6 py-3.5 bg-[#8b4513] text-white rounded-xl text-sm font-bold hover:bg-[#703810] transition-all shadow-md active:scale-[0.99] cursor-pointer">
      Return to Planner
    </button>
  `;

  document.getElementById('btnCopyMarkdown')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(md);
    switchView('chat');
    store.pushMessage({ role: 'bot', text: '📋 **Itinerary copied to clipboard!**' });
  });

  document.getElementById('btnCopyWhatsapp')?.addEventListener('click', async () => {
    const shortSummary = `🗺️ *${currDest} Trip Plan*\n\n` + (itinerary.days || []).map(d => `*Day ${d.dayNumber}: ${d.title || d.theme}*\n` + (d.stops || []).map(s => `• ${s.time}: ${s.name}`).join('\n')).join('\n\n') + '\n\n_Planned with Trailmate AI_';
    await navigator.clipboard.writeText(shortSummary);
    switchView('chat');
    store.pushMessage({ role: 'bot', text: '💬 **WhatsApp trip summary copied!**' });
  });

  document.getElementById('btnDownloadIcs')?.addEventListener('click', () => {
    downloadIcsCalendar(trip, itinerary);
    switchView('chat');
    store.pushMessage({ role: 'bot', text: '📅 **Trip calendar (.ics) downloaded!**' });
  });

  document.getElementById('btnReturnFromShare')?.addEventListener('click', () => switchView('chat'));
}
