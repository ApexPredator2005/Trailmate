/**
 * MapView.js — Modular View Renderer with Satellite Explorer & Interactive Journey Timeline
 * (Suggestions #19 & #38 — Trip Timeline Visualization on Map)
 */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMapView(container, { switchView, store }) {
  const { trip = {}, itinerary = null } = store.getState();
  const dest = trip.destination || 'Ooty';
  const query = encodeURIComponent(`${dest}, India`);

  const days = itinerary?.days || [];
  const hasItinerary = days.length > 0;

  let timelineHtml = '';
  if (hasItinerary) {
    timelineHtml = `
      <div class="mt-5 border-t border-[#BFA895]/30 pt-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">WAYPOINT ITINERARY</span>
            <h3 class="text-sm font-bold text-neutral-900 font-headline-md">Interactive Route Timeline</h3>
          </div>
          <span class="text-[11px] font-mono font-semibold bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full">
            ${days.length} Days · ${(days.reduce((acc, d) => acc + (d.stops?.length || 0), 0))} Stops
          </span>
        </div>

        <div class="space-y-4 max-h-72 overflow-y-auto pr-1 scroll-smooth">
          ${days.map((day, dIdx) => `
            <div class="tactile-inset-panel p-3.5 bg-white/70">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-bold font-mono text-[#8b4513] uppercase">Day ${day.dayNumber || dIdx + 1}: ${escapeHtml(day.title || day.theme || 'Expedition Route')}</span>
                <span class="text-[10px] text-neutral-500">${day.stops?.length || 0} stops</span>
              </div>

              <div class="relative pl-5 border-l-2 border-dashed border-[#8b4513]/30 space-y-3 ml-1.5 my-2">
                ${(day.stops || []).map((stop, sIdx) => `
                  <div class="relative group">
                    <span class="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-[8px] font-mono font-bold shadow-xs">
                      ${sIdx + 1}
                    </span>
                    <div class="flex justify-between items-start gap-2">
                      <div>
                        <h5 class="text-xs font-bold text-neutral-900 group-hover:text-secondary transition-colors cursor-pointer stop-jump-btn" data-location="${escapeHtml(stop.name + ', ' + dest)}">
                          ${escapeHtml(stop.name || 'Stop')}
                        </h5>
                        <p class="text-[10px] text-neutral-600 line-clamp-2 mt-0.5">
                          ${escapeHtml(stop.why || stop.description || '')}
                        </p>
                      </div>
                      <span class="text-[9.5px] font-mono text-neutral-500 bg-black/5 px-1.5 py-0.5 rounded whitespace-nowrap">
                        ${escapeHtml(stop.time || '09:00 AM')}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    timelineHtml = `
      <div class="mt-4 tactile-inset-panel text-center py-4">
        <p class="text-xs text-neutral-600">
          Finish planning your trip in the chat to generate an interactive day-by-day GPS timeline here!
        </p>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="mb-4">
      <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2e4433] bg-[#2e4433]/10 px-2.5 py-0.5 rounded-full">GEOSPATIAL EXPEDITION</span>
      <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Expedition Map</h1>
      <p class="text-xs text-neutral-600 font-body-sm">Satellite terrain &amp; route waypoint explorer for <strong class="text-primary font-bold">${dest}</strong></p>
    </div>

    <!-- Interactive Map Frame -->
    <div class="w-full h-64 rounded-2xl overflow-hidden border border-[#BFA895]/50 shadow-inner relative mb-4">
      <iframe id="fullViewMapFrame" width="100%" height="100%" frameborder="0" style="border:0"
        src="https://maps.google.com/maps?q=${query}&t=&z=12&ie=UTF8&iwloc=&output=embed"
        allowfullscreen></iframe>
    </div>

    <!-- Quick Destination City Jumpers -->
    <div class="mb-2">
      <span class="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Explore Other Cities</span>
      <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="mapCityJumper">
        ${['Manali', 'Ooty', 'Goa', 'Jaipur', 'Munnar', 'Shimla', 'Andaman', 'Udaipur'].map(city => `
          <button type="button" class="city-jump-btn text-xs font-semibold px-2.5 py-1 rounded-full border ${city.toLowerCase() === dest.toLowerCase() ? 'bg-secondary text-white border-secondary shadow-2xs' : 'bg-white/80 text-neutral-800 border-[#BFA895]/40 hover:bg-white'} transition-colors cursor-pointer" data-city="${city}">
            ${city}
          </button>
        `).join('')}
      </div>
    </div>

    ${timelineHtml}

    <button id="btnReturnToChatFromMap" class="w-full mt-5 py-3.5 bg-[#8b4513] text-white rounded-xl text-sm font-bold hover:bg-[#703810] transition-all shadow-md active:scale-[0.99] cursor-pointer">
      Return to Itinerary Planner
    </button>
  `;

  // Quick City Jump Listeners
  container.querySelectorAll('.city-jump-btn').forEach(b => {
    b.addEventListener('click', () => {
      const c = b.dataset.city;
      const mapFrame = document.getElementById('fullViewMapFrame');
      if (mapFrame) {
        mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(c + ', India')}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
      }
      container.querySelectorAll('.city-jump-btn').forEach(btn => {
        btn.className = 'city-jump-btn text-xs font-semibold px-2.5 py-1 rounded-full border bg-white/80 text-neutral-800 border-[#BFA895]/40 hover:bg-white transition-colors cursor-pointer';
      });
      b.className = 'city-jump-btn text-xs font-semibold px-2.5 py-1 rounded-full border bg-secondary text-white border-secondary shadow-2xs transition-colors cursor-pointer';
    });
  });

  // Stop Click -> Centers Map on specific waypoint stop
  container.querySelectorAll('.stop-jump-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const loc = btn.dataset.location;
      const mapFrame = document.getElementById('fullViewMapFrame');
      if (mapFrame && loc) {
        mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(loc + ', India')}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }
    });
  });

  document.getElementById('btnReturnToChatFromMap')?.addEventListener('click', () => {
    switchView('chat');
  });
}
