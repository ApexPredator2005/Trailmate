/**
 * TripsView.js — Modular View Renderer for Saved Journeys & Expeditions Archive
 * (Suggestion #10 — Chat Conversation History & Multi-Trip Memory)
 */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderTripsView(container, { switchView, store, chatThread, engine }) {
  const currentTrip = store.getState().trip || {};
  const currentMessages = store.getState().messages || [];
  const hasActiveSession = !!(currentTrip.destination || (currentMessages.length > 1 && store.getState().stage !== 'WELCOME'));
  const dest = currentTrip.destination || 'Custom Adventure';

  const savedTripsJson = localStorage.getItem('trailmate_saved_trips');
  const savedTrips = savedTripsJson ? JSON.parse(savedTripsJson) : [];

  let tripsListHtml = '';
  if (savedTrips.length > 0) {
    tripsListHtml = `
      <div class="mt-5 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-neutral-900 uppercase tracking-wider">Archived Expeditions (${savedTrips.length})</h4>
          <span class="text-[10px] text-neutral-500 font-mono">Multi-Trip Archive</span>
        </div>
        
        <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
          ${savedTrips.map((st, idx) => {
            const stopsCount = (st.itinerary?.days || []).reduce((acc, d) => acc + (d.stops?.length || 0), 0);
            const hotelName = st.trip?.selectedHotel?.name;
            const flightName = st.trip?.selectedFlight?.airline || st.trip?.selectedFlight?.name;

            return `
              <div class="tactile-inset-panel p-3.5 bg-white/75 hover:bg-white transition-all shadow-xs border border-[#BFA895]/30 group">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h5 class="text-sm font-bold text-neutral-900 font-headline-md">${escapeHtml(st.destination || 'Expedition')}</h5>
                    <p class="text-[10.5px] text-neutral-600 font-medium mt-0.5">
                      ${st.duration || 3} Days · ${stopsCount > 0 ? `${stopsCount} Waypoints · ` : ''}Saved ${new Date(st.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button class="btn-delete-trip p-1 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-black/5 transition-colors cursor-pointer" data-idx="${idx}" title="Delete saved expedition">
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>

                <!-- Trip Highlights Pills -->
                ${(hotelName || flightName) ? `
                  <div class="flex flex-wrap gap-1.5 mb-3">
                    ${flightName ? `<span class="text-[9.5px] font-mono bg-blue-50 text-blue-800 border border-blue-200/60 px-2 py-0.5 rounded-md">✈️ ${escapeHtml(flightName)}</span>` : ''}
                    ${hotelName ? `<span class="text-[9.5px] font-mono bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">🏨 ${escapeHtml(hotelName)}</span>` : ''}
                  </div>
                ` : ''}

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 pt-1 border-t border-black/5">
                  <button class="btn-load-trip flex-1 py-1.5 px-3 bg-[#8b4513] text-white hover:bg-[#703810] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs text-center" data-idx="${idx}">
                    Load Planner &amp; Itinerary
                  </button>
                  <button class="btn-open-scrapbook py-1.5 px-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg text-xs font-semibold transition-all cursor-pointer" data-idx="${idx}" title="Open this trip in Scrapbook">
                    🎨 Journal
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    tripsListHtml = `
      <div class="tactile-inset-panel text-center mt-4 py-5 bg-white/50">
        <span class="material-symbols-outlined text-neutral-400 text-2xl mb-1">auto_stories</span>
        <p class="text-xs font-semibold text-neutral-800">No saved journeys archived yet</p>
        <p class="text-[11px] text-neutral-500 mt-0.5">As you complete or archive trips, they will appear here so you can switch between them anytime.</p>
      </div>
    `;
  }

  const activeSessionHtml = hasActiveSession ? `
    <!-- Current Active Trip Card -->
    <div class="tactile-inset-panel p-4 bg-white/80 border border-[#BFA895]/40 shadow-xs">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-[10px] font-mono font-bold tracking-widest text-secondary uppercase bg-secondary/15 px-2 py-0.5 rounded">Active Session</span>
        <span class="text-xs text-neutral-500 font-medium">${currentTrip.duration || 3} Days Planned</span>
      </div>
      <h3 class="text-base font-bold text-neutral-900 font-headline-md">${escapeHtml(dest)} Expedition</h3>
      <p class="text-xs text-neutral-600 mt-0.5">${currentTrip.travelers || 2} Travelers · ${currentTrip.budgetTier || 'Moderate'} Tier</p>
      
      <div class="flex gap-2 mt-3.5">
        <button id="btnResumeActiveTrip" class="flex-1 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/90 transition-all cursor-pointer text-center shadow-2xs">
          Continue in Planner ➔
        </button>
        <button id="btnSaveCurrentActive" class="py-2 px-3.5 bg-white hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-bold border border-neutral-300 transition-all cursor-pointer shadow-2xs">
          Archive Session
        </button>
      </div>
    </div>
  ` : `
    <div class="tactile-inset-panel p-4 bg-white/70 border border-[#BFA895]/30 shadow-xs text-center py-5">
      <span class="material-symbols-outlined text-secondary text-2xl mb-1">travel_explore</span>
      <h3 class="text-sm font-bold text-neutral-900 font-headline-md">No Active Planning Session</h3>
      <p class="text-xs text-neutral-600 mt-0.5 mb-3">Choose a destination or chat with Trailmate to start planning.</p>
      <button id="btnStartJourneyFromEmptyActive" class="py-2 px-4 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/90 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
        <span class="material-symbols-outlined text-sm">explore</span>
        <span>Explore Destinations</span>
      </button>
    </div>
  `;

  container.innerHTML = `
    <div class="mb-5">
      <span class="text-[10px] font-mono font-bold tracking-widest uppercase text-[#944a1a] bg-[#944a1a]/10 px-2.5 py-0.5 rounded-full">JOURNAL ARCHIVES</span>
      <h1 class="text-[26px] sm:text-[30px] font-bold text-neutral-900 mt-1 font-headline-md tracking-tight">Saved Journeys &amp; Trips</h1>
      <p class="text-xs text-neutral-600 font-body-sm">Manage active itineraries, multi-trip memory, and saved expedition logs</p>
    </div>

    ${activeSessionHtml}

    ${tripsListHtml}

    <button id="btnStartNewTripFromTrips" class="w-full mt-6 py-3.5 bg-[#8b4513] text-white rounded-xl text-sm font-bold hover:bg-[#703810] transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-base">add_circle</span>
      Start a New Journey
    </button>
  `;

  document.getElementById('btnResumeActiveTrip')?.addEventListener('click', () => {
    if (chatThread) {
      chatThread.clear();
      (store.getState().messages || []).forEach(m => chatThread._renderOne(m));
      chatThread.scrollToBottom(false);
    }
    switchView('chat');
  });

  document.getElementById('btnStartJourneyFromEmptyActive')?.addEventListener('click', () => {
    store.reset();
    if (chatThread) chatThread.clear();
    if (engine) engine.sendWelcome();
    switchView('chat');
  });

  document.getElementById('btnSaveCurrentActive')?.addEventListener('click', () => {
    const currentTripState = store.getState().trip || {};
    const currentItinerary = store.getState().itinerary;
    const currentMessages = store.getState().messages;
    const currentStage = store.getState().stage;
    const newSaved = {
      destination: currentTripState.destination || 'Custom Trip',
      duration: currentTripState.duration || 3,
      date: Date.now(),
      trip: currentTripState,
      itinerary: currentItinerary,
      messages: currentMessages,
      stage: currentStage,
    };
    const allSaved = savedTripsJson ? JSON.parse(savedTripsJson) : [];
    allSaved.unshift(newSaved);
    localStorage.setItem('trailmate_saved_trips', JSON.stringify(allSaved));
    renderTripsView(container, { switchView, store, chatThread, engine });
  });

  container.querySelectorAll('.btn-delete-trip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      const allSaved = savedTripsJson ? JSON.parse(savedTripsJson) : [];
      allSaved.splice(idx, 1);
      localStorage.setItem('trailmate_saved_trips', JSON.stringify(allSaved));
      renderTripsView(container, { switchView, store, chatThread, engine });
    });
  });

  container.querySelectorAll('.btn-load-trip').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const selected = savedTrips[idx];
      if (selected) {
        store.setState({
          trip: selected.trip || { destination: selected.destination, duration: selected.duration },
          itinerary: selected.itinerary || null,
          messages: selected.messages || [],
          stage: selected.stage || 'DONE',
        });
        if (selected.trip?.selectedPlaces && engine) {
          engine._selectedPlaces = [...selected.trip.selectedPlaces];
        }
        if (selected.trip?.selectedRestaurants && engine) {
          engine._selectedRestaurants = [...selected.trip.selectedRestaurants];
        }
        if (chatThread) {
          chatThread.clear();
          (selected.messages || []).forEach(m => chatThread._renderOne(m));
          chatThread.scrollToBottom(false);
        }
        switchView('chat');
      }
    });
  });

  container.querySelectorAll('.btn-open-scrapbook').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const selected = savedTrips[idx];
      if (selected) {
        store.setState({
          trip: selected.trip || { destination: selected.destination, duration: selected.duration },
          itinerary: selected.itinerary || null,
          messages: selected.messages || [],
          stage: selected.stage || 'DONE',
        });
        switchView('scrapbook');
      }
    });
  });

  document.getElementById('btnStartNewTripFromTrips')?.addEventListener('click', () => {
    store.reset();
    if (chatThread) chatThread.clear();
    if (engine) engine.sendWelcome();
    switchView('chat');
  });
}
