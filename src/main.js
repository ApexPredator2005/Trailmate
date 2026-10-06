/**
 * Trailmate — main.js
 * App entry point. Mounts all UI components, wires store interactions,
 * dynamic header state, itinerary sharing, voice input, profile, and interactive modals.
 */

import { store }              from './store/state.js';
import { ChatThread }         from './components/ChatThread.js';
import { ChatInput }          from './components/ChatInput.js';
import { Sidebar }            from './components/Sidebar.js';
import { ItineraryPanel }     from './components/ItineraryPanel.js';
import { EmbellishmentCanvas } from './components/EmbellishmentCanvas.js';
import { ScrapbookStudio }    from './components/ScrapbookStudio.js';
import { initSplitView }      from './engine/splitView.js';
import { ConversationEngine } from './engine/conversation.js';
import { api, syncDestinationCardWeather, formatWeatherString } from './services/api.js';
import { communityService }   from './services/CommunityService.js';
import { getDestinationHeaderArt } from './components/HeaderDoodlesData.js';

document.addEventListener('DOMContentLoaded', () => {

  // ── 0. Conversation engine ──────────────────────────────────────────
  const engine = new ConversationEngine();
  window.__trailmate = { engine, store };

  // ── 1. Resizable split-view ─────────────────────────────────────────
  initSplitView({
    containerSelector: '#appMain',
    resizerSelector:   '#splitResizer',
    itinerarySelector: '#itineraryPane',
    defaultWidth:      320,
    minItineraryWidth: 250,
    minChatWidth:      320,
  });

  // ── Modal Helper ────────────────────────────────────────────────────
  const modal = document.getElementById('appModal');
  const modalBody = document.getElementById('modalBody');
  const btnModalClose = document.getElementById('btnModalClose');

  function openModal(title, htmlContent) {
    if (!modal || !modalBody) return;
    if (title) {
      modalBody.innerHTML = `
        <h3 class="font-headline-md text-xl font-bold text-primary mb-4">${title}</h3>
        <div class="font-body-md text-on-surface leading-relaxed text-sm space-y-3">
          ${htmlContent}
        </div>
      `;
    } else {
      modalBody.innerHTML = htmlContent;
    }
    modal.classList.remove('hidden');
  }

  let sidebarInstance = null;
  let chatThread = null;

  function closeModal() {
    if (modal) modal.classList.add('hidden');
    if (sidebarInstance) sidebarInstance.setActiveView('chat');
  }

  if (btnModalClose) {
    btnModalClose.addEventListener('click', closeModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ── 2. Full-View Swap Navigation Controller ────────────────────────
  const chatPane = document.getElementById('chatPane');
  const splitResizer = document.getElementById('splitResizer');
  const itineraryPane = document.getElementById('itineraryPane');
  // ── 2. Full-View Swap Navigation Controller with Smooth Transitions ──
  const splitChatView = document.getElementById('splitChatView');
  const fullViewSection = document.getElementById('fullViewSection');
  const fullViewBackground = document.getElementById('fullViewBackground');
  const fullViewScrollContainer = document.getElementById('fullViewScrollContainer');
  const fullViewCard = document.getElementById('fullViewCard');
  const fullViewBody = document.getElementById('fullViewBody');
  const btnFullViewClose = document.getElementById('btnFullViewClose');

  const SECTION_BACKGROUNDS = {
    settings: '/backgrounds/bg-settings-instruments.svg',
    privacy: '/backgrounds/bg-settings-instruments.svg',
    map: '/backgrounds/bg-map-mountains.svg',
    trips: '/backgrounds/bg-trips-heritage.svg',
    guide: '/backgrounds/bg-trips-heritage.svg',
    share: '/backgrounds/bg-trips-heritage.svg',
  };

  function updateFullViewBackground(viewName) {
    const bgImg = document.getElementById('fullViewBgImg');
    if (!bgImg) return;
    const targetSrc = SECTION_BACKGROUNDS[viewName] || SECTION_BACKGROUNDS.trips;
    if (!bgImg.src.endsWith(targetSrc)) {
      bgImg.style.opacity = '0';
      setTimeout(() => {
        bgImg.src = targetSrc;
        bgImg.style.opacity = '1';
      }, 120);
    }
  }

  let currentActiveView = 'chat';
  let pendingTransitionTimer = null;
  let isTransitioning = false;

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  async function renderCardContent(viewName) {
    updateFullViewBackground(viewName);

    const viewProps = {
      switchView,
      store,
      chatThread,
      engine,
    };

    switch (viewName) {
      case 'settings': {
        const { renderSettingsView } = await import('./views/SettingsView.js');
        renderSettingsView(fullViewBody, viewProps);
        break;
      }
      case 'trips': {
        const { renderTripsView } = await import('./views/TripsView.js');
        renderTripsView(fullViewBody, viewProps);
        break;
      }
      case 'map': {
        const { renderMapView } = await import('./views/MapView.js');
        renderMapView(fullViewBody, viewProps);
        break;
      }
      case 'guide': {
        const { renderGuideView } = await import('./views/GuideView.js');
        renderGuideView(fullViewBody, viewProps);
        break;
      }
      case 'privacy': {
        const { renderPrivacyView } = await import('./views/PrivacyView.js');
        renderPrivacyView(fullViewBody, viewProps);
        break;
      }
      case 'share': {
        const { renderShareView } = await import('./views/ShareView.js');
        renderShareView(fullViewBody, viewProps);
        break;
      }
      default: {
        const { renderTripsView } = await import('./views/TripsView.js');
        renderTripsView(fullViewBody, viewProps);
        break;
      }
    }
  }

  const scrapbookView = document.getElementById('scrapbookWorkspaceView');
  const mapWorkspaceView = document.getElementById('mapWorkspaceView');
  const communityWorkspaceView = document.getElementById('communityWorkspaceView');
  let scrapbookWorkspace = null;

  function clearTransitionClasses() {
    splitChatView?.classList.remove('view-section-exit', 'view-section-enter');
    fullViewSection?.classList.remove('view-section-exit', 'view-section-enter');
    fullViewBackground?.classList.remove('view-section-enter');
    fullViewCard?.classList.remove('view-card-stagger-in', 'view-card-sub-swap');
    scrapbookView?.classList.remove('view-section-enter', 'view-section-exit');
    mapWorkspaceView?.classList.remove('view-section-enter', 'view-section-exit');
    communityWorkspaceView?.classList.remove('view-section-enter', 'view-section-exit');
  }

  async function switchView(viewName) {
    if (viewName === currentActiveView) return;

    if (pendingTransitionTimer) {
      clearTimeout(pendingTransitionTimer);
      pendingTransitionTimer = null;
    }
    clearTransitionClasses();

    const previousView = currentActiveView;
    currentActiveView = viewName;
    if (sidebarInstance) sidebarInstance.setActiveView(viewName);

    const reduced = isReducedMotion();

    if (viewName === 'scrapbook') {
      // Show full-screen Canva-like Scrapbook Studio
      splitChatView?.classList.add('hidden');
      fullViewSection?.classList.add('hidden');
      if (mapWorkspaceView) mapWorkspaceView.classList.add('hidden');
      if (communityWorkspaceView) communityWorkspaceView.classList.add('hidden');
      if (scrapbookView) scrapbookView.classList.remove('hidden');

      if (!scrapbookWorkspace) {
        const { ScrapbookWorkspace } = await import('./components/ScrapbookWorkspace.js');
        scrapbookWorkspace = new ScrapbookWorkspace({ containerId: 'scrapbookWorkspaceView' });
      } else {
        scrapbookWorkspace.render();
      }

      if (reduced) return;

      isTransitioning = true;
      scrapbookView?.classList.add('view-section-enter');
      pendingTransitionTimer = setTimeout(() => {
        clearTransitionClasses();
        isTransitioning = false;
        pendingTransitionTimer = null;
      }, 220);
      return;
    } else {
      if (scrapbookView) scrapbookView.classList.add('hidden');
    }

    if (viewName === 'map') {
      // Show full-screen interactive MapView covering all space right of sidebar
      splitChatView?.classList.add('hidden');
      fullViewSection?.classList.add('hidden');
      if (scrapbookView) scrapbookView.classList.add('hidden');
      if (communityWorkspaceView) communityWorkspaceView.classList.add('hidden');
      if (mapWorkspaceView) {
        mapWorkspaceView.classList.remove('hidden');
        const { renderMapView } = await import('./views/MapView.js');
        renderMapView(mapWorkspaceView, { switchView, store });
      }

      if (reduced) return;

      isTransitioning = true;
      mapWorkspaceView?.classList.add('view-section-enter');
      pendingTransitionTimer = setTimeout(() => {
        clearTransitionClasses();
        isTransitioning = false;
        pendingTransitionTimer = null;
      }, 220);
      return;
    } else {
      if (mapWorkspaceView) mapWorkspaceView.classList.add('hidden');
    }

    if (viewName === 'community') {
      // Show full-screen Community Hub, Quests & Badges
      splitChatView?.classList.add('hidden');
      fullViewSection?.classList.add('hidden');
      if (scrapbookView) scrapbookView.classList.add('hidden');
      if (mapWorkspaceView) mapWorkspaceView.classList.add('hidden');
      if (communityWorkspaceView) {
        communityWorkspaceView.classList.remove('hidden');
        const { renderCommunityView } = await import('./views/CommunityView.js');
        renderCommunityView(communityWorkspaceView, {
          switchView,
          store,
          openPassportModal,
        });
      }

      if (reduced) return;

      isTransitioning = true;
      communityWorkspaceView?.classList.add('view-section-enter');
      pendingTransitionTimer = setTimeout(() => {
        clearTransitionClasses();
        isTransitioning = false;
        pendingTransitionTimer = null;
      }, 220);
      return;
    } else {
      if (communityWorkspaceView) communityWorkspaceView.classList.add('hidden');
    }

    if (viewName === 'chat') {
      // Switching back to Chat
      if (fullViewScrollContainer) fullViewScrollContainer.scrollTop = 0;
      if (splitChatView) splitChatView.classList.remove('hidden');

      if (reduced) {
        fullViewSection?.classList.add('hidden');
        return;
      }

      isTransitioning = true;
      fullViewSection?.classList.add('view-section-exit');
      splitChatView?.classList.add('view-section-enter');

      pendingTransitionTimer = setTimeout(() => {
        fullViewSection?.classList.add('hidden');
        clearTransitionClasses();
        isTransitioning = false;
        pendingTransitionTimer = null;
      }, 190);

    } else {
      // Switching to a standard FullView section (settings, trips, guide, privacy, share)
      if (fullViewSection) fullViewSection.classList.remove('hidden');
      if (fullViewScrollContainer) fullViewScrollContainer.scrollTop = 0;

      const isSubNav = previousView !== 'chat' && previousView !== null && previousView !== 'scrapbook' && previousView !== 'map';

      if (isSubNav) {
        // Instant calm cross-fade between subviews (Trips <-> Settings)
        renderCardContent(viewName);
        splitChatView?.classList.add('hidden');
        if (reduced) return;

        isTransitioning = true;
        fullViewCard?.classList.add('view-card-sub-swap');

        pendingTransitionTimer = setTimeout(() => {
          clearTransitionClasses();
          isTransitioning = false;
          pendingTransitionTimer = null;
        }, 190);

      } else {
        // Switching from Chat to FullView
        renderCardContent(viewName);

        if (reduced) {
          splitChatView?.classList.add('hidden');
          return;
        }

        isTransitioning = true;
        splitChatView?.classList.add('view-section-exit');
        fullViewBackground?.classList.add('view-section-enter');
        fullViewCard?.classList.add('view-card-stagger-in');

        pendingTransitionTimer = setTimeout(() => {
          splitChatView?.classList.add('hidden');
          clearTransitionClasses();
          isTransitioning = false;
          pendingTransitionTimer = null;
        }, 220);
      }
    }
  }

  if (btnFullViewClose) {
    btnFullViewClose.addEventListener('click', () => {
      switchView('chat');
    });
  }

  sidebarInstance = new Sidebar({
    sidebarId: 'sidebar',
    onNewTrip: () => {
      store.reset();
      chatThread.clear();
      engine.sendWelcome();
      switchView('chat');
    },
    onNavChange: (view) => {
      switchView(view);
    },
  });

  // ── Traveler Passport & Profile Modal ───────────────────────────────
  function openPassportModal() {
    const profile = communityService.getProfile();
    const earnedBadges = communityService.getEarnedBadges();
    const earnedIds = new Set(communityService.getEarnedBadgeIds());
    const unlockedStickers = communityService.getUnlockedStickerIds();

    const passportHtml = `
      <div class="p-1">
        <!-- Passport Header -->
        <div class="flex items-start justify-between pb-4 pr-7 border-b border-[#BFA895]/30">
          <div class="flex items-center gap-3.5">
            <img src="${profile.avatar}" alt="${profile.name}" class="w-14 h-14 rounded-full object-cover border-2 border-[#BFA895] shadow-sm" />
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-neutral-900 font-headline-md">${profile.name}</h3>
                <span class="text-[10px] font-mono text-neutral-500">${profile.handle}</span>
              </div>
              <p class="text-[11px] font-mono font-bold text-[#8B4513] mt-0.5">
                Level ${profile.level || 1} Adventurer · ${profile.xp || 0} Total XP
              </p>
              <p class="text-[10.5px] text-neutral-600 font-medium">From ${profile.homeCity || 'Delhi'}, India</p>
            </div>
          </div>
          <span class="hidden sm:inline-block bg-[#5B8C7B]/10 text-[#2E4433] text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-full border border-[#5B8C7B]/30 whitespace-nowrap">
            PASSPORT
          </span>
        </div>

        <!-- Editable Bio & One-Word Micro Tags -->
        <div class="my-4 p-3 bg-white/70 rounded-xl border border-[#BFA895]/35">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-mono font-bold uppercase text-neutral-500">ONE-WORD BIO TAGS (#INSTA-STYLE):</span>
            <button id="btnEditBioTags" class="text-[10px] font-bold text-[#8B4513] hover:underline cursor-pointer">
              Edit Tags
            </button>
          </div>
          <div class="flex flex-wrap gap-1.5" id="passportBioTagsList">
            ${(profile.bioTags || []).map(tag => `
              <span class="bio-tag-pill text-xs py-0.5 px-2">#${tag}</span>
            `).join('')}
          </div>
          <p class="text-[11px] text-neutral-700 italic mt-2.5 pt-2 border-t border-black/5">
            "${profile.bioNote || 'Roaming through mountain valleys & coastal forts.'}"
          </p>
        </div>

        <!-- Earned Medallions & Trophy Shelf -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-mono font-bold uppercase text-neutral-500">
              EARNED TROPHIES &amp; MEDALLIONS (${earnedBadges.length})
            </span>
            <button id="btnViewAllBadgesFromPassport" class="text-[10px] font-bold text-[#5B8C7B] hover:underline cursor-pointer">
              Open Trophy Hall
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            ${earnedBadges.map(b => `
              <div class="flex items-center gap-2 p-2 bg-[#F6F3EE] rounded-xl border border-black/5">
                <span class="material-symbols-outlined text-lg text-[#C4703D]">${b.icon}</span>
                <div class="min-w-0">
                  <h5 class="text-[11px] font-bold text-neutral-900 truncate">${b.name}</h5>
                  <p class="text-[9px] font-mono text-neutral-500 capitalize">+${b.points} XP · ${b.tier}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Unlocked Coordinate Quest Stickers -->
        <div class="mb-4 p-3 bg-[#FBF3DB]/60 rounded-xl border border-[#C4703D]/25">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-mono font-bold uppercase text-[#944A1A]">
              QUEST TREASURE STICKERS UNLOCKED:
            </span>
            <span class="text-[10px] font-mono text-[#944A1A] font-bold">${unlockedStickers.length} in Scrapbook</span>
          </div>
          <p class="text-[10.5px] text-neutral-600">
            ${unlockedStickers.length > 0 ? 'Your unlocked quest emblems are ready to paste in Scrapbook Studio!' : 'Complete coordinate quests on the Community tab to unlock rare seals.'}
          </p>
        </div>

        <div class="flex gap-2 pt-2 border-t border-[#BFA895]/20">
          <button id="btnGoToCommunityFromPassport" class="flex-1 py-2.5 bg-[#8b4513] text-white rounded-xl text-xs font-bold hover:bg-[#703810] cursor-pointer">
            Explore Community &amp; Quests
          </button>
          <button id="btnClosePassportModal" class="py-2.5 px-4 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    `;

    if (modal && modalBody) {
      modalBody.innerHTML = passportHtml;
      modal.classList.remove('hidden');

      document.getElementById('btnClosePassportModal')?.addEventListener('click', closeModal);
      document.getElementById('btnGoToCommunityFromPassport')?.addEventListener('click', () => {
        closeModal();
        switchView('community');
      });
      document.getElementById('btnViewAllBadgesFromPassport')?.addEventListener('click', () => {
        closeModal();
        switchView('community');
      });
      document.getElementById('btnEditBioTags')?.addEventListener('click', () => {
        const current = (profile.bioTags || []).join(', ');
        const input = prompt('Enter your one-word bio tags (separated by commas):', current);
        if (input !== null) {
          const tags = input.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
          communityService.saveProfile({ bioTags: tags });
          openPassportModal();
        }
      });
    }
  }

  // ── Footer Profile, Help & Privacy ──────────────────────────────────
  const btnProfile = document.getElementById('btnProfile');
  const btnHelp = document.getElementById('btnHelp');
  const btnPrivacy = document.getElementById('btnPrivacy');

  if (btnProfile) {
    btnProfile.addEventListener('click', () => {
      openPassportModal();
    });
  }

  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      switchView('guide');
    });
  }

  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', () => {
      switchView('privacy');
    });
  }

  // Itinerary View Map Button
  const mapPreview = document.getElementById('mapPreview');
  const btnViewMap = document.getElementById('btnViewMap');
  mapPreview?.addEventListener('click', () => switchView('map'));
  btnViewMap?.addEventListener('click', (e) => {
    e.stopPropagation();
    switchView('map');
  });

  // ── 3. Chat Thread ──────────────────────────────────────────────────
  chatThread = new ChatThread({
    threadId: 'chatThread',

    onDestinationSelect: (dest, rowEl) => {
      const destName = typeof dest === 'object' ? dest.name : dest;
      store.setState({ trip: { ...store.getState().trip, destination: destName } });
      store.pushMessage({ role: 'user', text: `I'd love to visit ${destName}!` });
      engine.handleUserMessage(destName, destName);
    },

    onChipSelect: (chip) => {
      if (Array.isArray(chip)) {
        const labels = chip.map(c => c.label).join(', ');
        const values = chip.map(c => c.value ?? c.label).join(',');
        store.pushMessage({ role: 'user', text: labels });
        engine.handleUserMessage(labels, values);
      } else {
        store.pushMessage({ role: 'user', text: chip.label });
        engine.handleUserMessage(chip.label, chip.value);
      }
    },

    onCardSelect: (card, cardEl) => {
      if (engine.isMultiSelectStage()) {
        cardEl?.classList.toggle('is-selected');
      } else {
        cardEl?.closest('.cards-carousel')
          ?.querySelectorAll('.option-card')
          .forEach(c => c.classList.remove('is-selected'));
        cardEl?.classList.add('is-selected');

        store.pushMessage({
          role: 'user',
          text: `I'd like to go with ${card.name}.`,
        });
      }

      engine.handleCardSelected(card);
    },
  });
  if (window.__trailmate) window.__trailmate.chatThread = chatThread;

  // ── 4. Chat Input & Voice Recognition ───────────────────────────────
  const chatInput = new ChatInput({
    formId:    'chatForm',
    inputId:   'chatInput',
    sendBtnId: 'btnSend',
    onSend: (text) => {
      store.pushMessage({ role: 'user', text });
      chatThread.scrollToBottom(true);
      engine.handleUserMessage(text);
    },
  });

  // Voice Recognition (Speech-to-Text)
  const btnVoice = document.getElementById('btnVoiceInput');
  const micIcon = document.getElementById('micIcon');
  const inputEl = document.getElementById('chatInput');
  let recognition = null;
  let isListening = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && btnVoice) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      isListening = true;
      btnVoice.classList.add('bg-secondary/15', 'text-secondary', 'animate-pulse');
      if (micIcon) micIcon.textContent = 'graphic_eq';
      inputEl.setAttribute('placeholder', 'Listening... speak your travel thoughts');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      if (inputEl) {
        inputEl.value = transcript;
        inputEl.style.height = 'auto';
        inputEl.style.height = inputEl.scrollHeight + 'px';
      }
    };

    recognition.onend = () => {
      isListening = false;
      btnVoice.classList.remove('bg-secondary/15', 'text-secondary', 'animate-pulse');
      if (micIcon) micIcon.textContent = 'mic';
      inputEl.setAttribute('placeholder', 'Ask about places to eat, things to do...');
    };

    recognition.onerror = (e) => {
      isListening = false;
      btnVoice.classList.remove('bg-secondary/15', 'text-secondary', 'animate-pulse');
      if (micIcon) micIcon.textContent = 'mic';
      inputEl.setAttribute('placeholder', 'Ask about places to eat, things to do...');
      if (e.error !== 'no-speech') {
        console.warn('[VoiceInput] Speech error:', e.error);
      }
    };

    btnVoice.addEventListener('click', () => {
      if (!isListening) {
        try { recognition.start(); } catch (_) {}
      } else {
        try { recognition.stop(); } catch (_) {}
      }
    });
  } else if (btnVoice) {
    btnVoice.addEventListener('click', () => {
      store.pushMessage({
        role: 'bot',
        text: "🎤 Voice input is supported on modern desktop browsers (Chrome, Edge, Safari).",
      });
    });
  }

  // ── 5. Itinerary Panel ──────────────────────────────────────────────
  const itineraryPanel = new ItineraryPanel({
    panelId: 'itineraryPane',
    onSwapStop: (dayIdx, stopIdx, stop) => {
      engine.handleSwapStop(dayIdx, stopIdx, stop);
    },
    onAddActivity: (dayIdx) => {
      engine.handleAddActivity(dayIdx);
    },
    onMapClick: () => {
      switchView('map');
    },
  });


  // ── 6. Dynamic Header, Weather, Ambient, Doodle & Budget Updates ──
  const titleEl = document.getElementById('chatTripTitle');
  const metaEl = document.getElementById('chatTripMeta');
  const ambientEl = document.getElementById('chatAmbientBackdrop');
  const doodleContainer = document.getElementById('chatHeaderDoodleContainer');
  const weatherPill = document.getElementById('headerWeatherPill');
  const budgetFill = document.getElementById('budgetProgressFill');

  function updateHeaderDoodle(destination) {
    if (!doodleContainer) return;
    if (!destination) {
      doodleContainer.innerHTML = '';
      return;
    }
    const { src, title } = getDestinationHeaderArt(destination);
    // Smooth rise-up animation starting from the bottom of the top bar (ease-out)
    doodleContainer.innerHTML = `
      <div class="relative w-full h-full flex items-center justify-center">
        <img 
          src="${src}" 
          alt="${title}" 
          title="${title}"
          class="h-full w-auto max-h-[52px] object-contain header-doodle-rising" 
        />
      </div>
    `;
  }

  function updateAmbientTheme(destination) {
    if (!ambientEl) return;
    const d = (destination || '').toLowerCase();
    if (d.includes('ooty') || d.includes('munnar') || d.includes('wayanad')) {
      ambientEl.className = 'absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none transition-all duration-700 bg-gradient-to-b from-[#5B8C7B]/40 to-transparent';
    } else if (d.includes('manali') || d.includes('shimla') || d.includes('ladakh')) {
      ambientEl.className = 'absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none transition-all duration-700 bg-gradient-to-b from-[#7097A8]/40 to-transparent';
    } else if (d.includes('goa') || d.includes('andaman') || d.includes('kerala')) {
      ambientEl.className = 'absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none transition-all duration-700 bg-gradient-to-b from-[#2A7B88]/40 to-transparent';
    } else if (d.includes('jaipur') || d.includes('rajasthan') || d.includes('udaipur')) {
      ambientEl.className = 'absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none transition-all duration-700 bg-gradient-to-b from-[#C4703D]/40 to-transparent';
    } else {
      ambientEl.className = 'absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none transition-all duration-700 bg-gradient-to-b from-primary/20 to-transparent';
    }
  }

  let lastWeatherDest = null;
  let lastWeatherTime = 0;
  let cachedWeatherResult = null;

  async function updateWeatherPill(destination, forceRefresh = false) {
    if (!weatherPill) return;
    if (!destination) {
      weatherPill.classList.add('hidden');
      weatherPill.classList.remove('flex');
      return;
    }
    weatherPill.classList.remove('hidden');
    weatherPill.classList.add('flex');

    const destLower = destination.trim().toLowerCase();
    const now = Date.now();

    // Use cached in-memory response if same destination within 20s and not forced
    if (!forceRefresh && destLower === lastWeatherDest && (now - lastWeatherTime) < 20000 && cachedWeatherResult) {
      applyWeatherData(destination, cachedWeatherResult);
      return;
    }

    try {
      lastWeatherDest = destLower;
      lastWeatherTime = now;
      const res = await api.getWeather(destination, 3, forceRefresh);
      cachedWeatherResult = res;
      applyWeatherData(destination, res);
    } catch {
      // Fallback
      if (weatherIcon) weatherIcon.textContent = '🌤️';
      if (weatherText) weatherText.textContent = '18°C · Pleasant';
    }
  }

  // Click weather pill to trigger instant live refresh
  weatherPill?.addEventListener('click', () => {
    const dest = store.getState().trip?.destination;
    if (dest) {
      if (weatherIcon) weatherIcon.textContent = '⏳';
      updateWeatherPill(dest, true);
    }
  });

  // ── Smart, Rate-Protected Weather Lifecycle ─────────────────────────
  // 1. Instant fetch on page load / app open
  // 2. Active 30-minute timer ONLY while user is actively browsing on this tab
  // 3. Zero API requests when tab is hidden, closed, or server is idle
  // 4. Instant refresh when user returns to an active tab after 30+ minutes

  // Active 30-minute poll interval (only runs if tab is active and visible)
  setInterval(() => {
    if (document.hidden) return; // Zero API calls if tab is hidden / minimized
    const dest = store.getState().trip?.destination;
    if (dest) {
      updateWeatherPill(dest, true);
    }
  }, 30 * 60 * 1000);

  // When user returns to tab after being away, check if 30+ minutes passed
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const dest = store.getState().trip?.destination;
      const now = Date.now();
      if (dest && (now - lastWeatherTime) >= 30 * 60 * 1000) {
        updateWeatherPill(dest, true);
      }
    }
  });

  // Initial load check: if a trip was restored from session/storage, fetch fresh weather immediately on app open / reload
  const initialTripDest = store.getState().trip?.destination;
  if (initialTripDest) {
    updateWeatherPill(initialTripDest, true);
  }

  function applyWeatherData(destination, res) {
    const data = res.forecast || res;
    const current = data?.current || data;

    const temp = current?.temp_c != null ? `${Math.round(current.temp_c)}°C` : '18°C';
    const condition = current?.condition?.text || 'Pleasant';
    const cardWeatherText = formatWeatherString(current?.temp_c, condition);

    let icon = '🌤️';
    const condLower = condition.toLowerCase();
    if (condLower.includes('rain') || condLower.includes('drizzle')) icon = '🌧️';
    else if (condLower.includes('snow') || condLower.includes('ice') || condLower.includes('frost')) icon = '❄️';
    else if (condLower.includes('sunny') || condLower.includes('clear')) icon = '☀️';
    else if (condLower.includes('thunder') || condLower.includes('storm')) icon = '⛈️';
    else if (condLower.includes('mist') || condLower.includes('fog')) icon = '🌫️';

    if (weatherIcon) weatherIcon.textContent = icon;
    if (weatherText) weatherText.textContent = `${temp} · ${condition}`;
    if (weatherPill) weatherPill.title = `Weather for ${destination}: ${temp}, ${condition} • Click to refresh`;

    // Keep destination cards in chat 100% in sync with the top bar weather info
    syncDestinationCardWeather(destination, cardWeatherText);
  }

  function updateBudgetBar(trip, itinerary) {
    if (!budgetFill) return;
    let pct = 0;
    if (trip?.destination) pct += 20;
    if (trip?.selectedFlight) pct += 30;
    if (trip?.selectedHotel) pct += 30;
    if (itinerary && itinerary.days && itinerary.days.length > 0) pct = 100;
    budgetFill.style.width = `${pct}%`;
  }

  store.subscribe('trip', (trip) => {
    if (!trip) return;
    const dest = trip.destination;
    const travelers = trip.travelers ? `${trip.travelers} traveler${trip.travelers > 1 ? 's' : ''}` : null;
    const duration = trip.duration ? `${trip.duration} days` : null;
    const dates = trip.startDate || trip.dates || null;

    if (titleEl) {
      titleEl.textContent = dest ? `Trip to ${dest}` : 'AI Travel Planner';
    }
    if (metaEl) {
      const origin = trip.homeCity ? `from ${trip.homeCity}` : null;
      const metaParts = [dates, duration, origin, travelers].filter(Boolean);
      metaEl.textContent = metaParts.length > 0 ? metaParts.join(' · ') : '';
    }

    updateAmbientTheme(dest);
    updateHeaderDoodle(dest);
    updateWeatherPill(dest);
    updateBudgetBar(trip, store.getState().itinerary);
  });

  store.subscribe('itinerary', (itinerary) => {
    updateBudgetBar(store.getState().trip, itinerary);
  });

  // ── 7. Header Actions (Share & More Options Popovers) ────────────────
  const btnShare = document.getElementById('btnShareItinerary');
  const shareOptionsMenu = document.getElementById('shareOptionsMenu');
  const shareDestBadge = document.getElementById('shareDestBadge');
  const btnDropdownCopyMarkdown = document.getElementById('btnDropdownCopyMarkdown');
  const btnDropdownCopyWhatsapp = document.getElementById('btnDropdownCopyWhatsapp');
  const btnDropdownDownloadIcs = document.getElementById('btnDropdownDownloadIcs');

  const btnMore = document.getElementById('btnMoreOptions');
  const moreOptionsMenu = document.getElementById('moreOptionsMenu');
  const btnDropdownScrapbook = document.getElementById('btnDropdownScrapbook');
  const btnDropdownPrint = document.getElementById('btnDropdownPrint');
  const btnDropdownReset = document.getElementById('btnDropdownReset');
  const dropdownBudgetTotal = document.getElementById('dropdownBudgetTotal');

  function updateShareBadge() {
    if (!shareDestBadge) return;
    const { trip } = store.getState();
    shareDestBadge.textContent = trip.destination ? `${trip.destination} Plan` : 'Trip Plan';
  }

  if (btnShare && shareOptionsMenu) {
    btnShare.addEventListener('click', (e) => {
      e.stopPropagation();
      updateShareBadge();
      moreOptionsMenu?.classList.add('hidden');
      shareOptionsMenu.classList.toggle('hidden');
    });

    btnDropdownCopyMarkdown?.addEventListener('click', async (e) => {
      e.stopPropagation();
      shareOptionsMenu.classList.add('hidden');
      const { trip, itinerary } = store.getState();
      if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
        store.pushMessage({
          role: 'bot',
          text: `📋 **Itinerary Draft**: Your trip to **${trip.destination || 'your destination'}** (${trip.duration || 3} days, ${trip.travelers || 2} travelers) is currently being planned! Once your stay, flights, and stops are composed, the full day-by-day plan will be copied here.`,
        });
      } else {
        const md = formatItineraryMarkdown(trip, itinerary);
        try {
          await navigator.clipboard.writeText(md);
          store.pushMessage({ role: 'bot', text: '📋 **Complete Markdown itinerary copied to clipboard!** Ready to paste into Notion, Notes, or Docs.' });
        } catch {
          store.pushMessage({ role: 'bot', text: '📋 **Itinerary formatted:**\n\n' + md });
        }
      }
    });

    btnDropdownCopyWhatsapp?.addEventListener('click', async (e) => {
      e.stopPropagation();
      shareOptionsMenu.classList.add('hidden');
      const { trip, itinerary } = store.getState();
      const currDest = trip.destination || 'Destination';
      let summary = '';
      if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
        summary = `🗺️ *${currDest} Trip Draft*\n• Duration: ${trip.duration || 3} Days\n• Travelers: ${trip.travelers || 2}\n• Status: Planning in progress\n\n_Planned with Trailmate AI_`;
      } else {
        summary = `🗺️ *${currDest} Trip Plan*\n\n` + (itinerary.days || []).map(d => `*Day ${d.dayNumber}: ${d.title || d.theme}*\n` + (d.stops || []).map(s => `• ${s.time}: ${s.name}`).join('\n')).join('\n\n') + '\n\n_Planned with Trailmate AI_';
      }
      try {
        await navigator.clipboard.writeText(summary);
        store.pushMessage({ role: 'bot', text: '💬 **WhatsApp trip summary copied to clipboard!** Ready to send to travel companions.' });
      } catch {
        store.pushMessage({ role: 'bot', text: summary });
      }
    });

    btnDropdownDownloadIcs?.addEventListener('click', (e) => {
      e.stopPropagation();
      shareOptionsMenu.classList.add('hidden');
      const { trip, itinerary } = store.getState();
      if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
        store.pushMessage({ role: 'bot', text: '📅 Calendar export (.ics) will be available once your day-by-day stops are generated!' });
      } else {
        downloadIcsCalendar(trip, itinerary);
        store.pushMessage({ role: 'bot', text: '📅 **Exported itinerary (.ics) file downloaded!** You can now import it to Apple or Google Calendar.' });
      }
    });
  }

  function updateDropdownBudget() {
    if (!dropdownBudgetTotal) return;
    const { trip, itinerary } = store.getState();
    const duration = Math.max(1, trip.duration || itinerary?.days?.length || 3);
    const travelers = Math.max(1, trip.travelers || 1);
    const tier = (trip.budgetTier || 'moderate').toLowerCase();

    let flightCost = 0;
    if (trip.selectedFlight?.price) {
      const raw = parseInt(String(trip.selectedFlight.price).replace(/[^0-9]/g, ''), 10);
      flightCost = !isNaN(raw) && raw > 0 ? raw * travelers : (tier === 'luxury' ? 14000 : tier === 'budget' ? 4500 : 8000) * travelers;
    } else if (trip.budgetTier) {
      flightCost = (tier === 'luxury' ? 14000 : tier === 'budget' ? 4500 : 8000) * travelers;
    }

    let stayCost = 0;
    const nights = Math.max(1, duration - 1);
    if (trip.selectedHotel?.price) {
      const raw = parseInt(String(trip.selectedHotel.price).replace(/[^0-9]/g, ''), 10);
      stayCost = !isNaN(raw) && raw > 0 ? raw * nights : (tier === 'luxury' ? 9500 : tier === 'budget' ? 1500 : 4000) * nights;
    } else if (trip.budgetTier) {
      stayCost = (tier === 'luxury' ? 9500 : tier === 'budget' ? 1500 : 4000) * nights;
    }

    const dailyFood = tier === 'luxury' ? 2400 : tier === 'budget' ? 600 : 1200;
    const dailyAct = tier === 'luxury' ? 1800 : tier === 'budget' ? 400 : 900;
    const total = flightCost + stayCost + ((dailyFood + dailyAct) * duration * travelers);

    if (total > 0) {
      dropdownBudgetTotal.textContent = `Estimated: ₹${total.toLocaleString('en-IN')}` + (trip.customBudget ? ` (Target: ₹${trip.customBudget.toLocaleString('en-IN')})` : '');
    } else {
      dropdownBudgetTotal.textContent = 'Configured during selection';
    }
  }

  if (btnMore && moreOptionsMenu) {
    btnMore.addEventListener('click', (e) => {
      e.stopPropagation();
      updateDropdownBudget();
      shareOptionsMenu?.classList.add('hidden');
      moreOptionsMenu.classList.toggle('hidden');
    });

    btnDropdownScrapbook?.addEventListener('click', () => {
      moreOptionsMenu.classList.add('hidden');
      switchView('scrapbook');
    });

    btnDropdownPrint?.addEventListener('click', () => {
      moreOptionsMenu.classList.add('hidden');
      window.print();
    });

    btnDropdownReset?.addEventListener('click', () => {
      moreOptionsMenu.classList.add('hidden');
      store.reset();
      chatThread.clear();
      engine.sendWelcome();
    });
  }

  // Close both popovers on outside click
  document.addEventListener('click', (e) => {
    if (shareOptionsMenu && !shareOptionsMenu.contains(e.target) && e.target !== btnShare && !btnShare?.contains(e.target)) {
      shareOptionsMenu.classList.add('hidden');
    }
    if (moreOptionsMenu && !moreOptionsMenu.contains(e.target) && e.target !== btnMore && !btnMore?.contains(e.target)) {
      moreOptionsMenu.classList.add('hidden');
    }
  });

  // ── 7.5. Scrapbook & Embellishments Studio ──────────────────────────
  const embellishmentCanvas = new EmbellishmentCanvas({
    containerSelector: '#itineraryBody',
  });

  const scrapbookStudio = new ScrapbookStudio({
    canvasInstance: embellishmentCanvas,
  });

  // Re-render canvas overlay whenever itinerary updates
  store.subscribe('itinerary', () => {
    setTimeout(() => {
      embellishmentCanvas.render();
    }, 100);
  });

  const btnOpenScrapbook = document.getElementById('btnOpenScrapbookStudio');
  btnOpenScrapbook?.addEventListener('click', (e) => {
    e.stopPropagation();
    switchView('scrapbook');
  });

  // ── 8. Boot ─────────────────────────────────────────────────────────
  if (store.getState().messages.length === 0) {
    engine.sendWelcome();
  } else {
    const restoredTrip = store.getState().trip || {};
    if (restoredTrip.selectedPlaces && Array.isArray(restoredTrip.selectedPlaces)) {
      engine._selectedPlaces = [...restoredTrip.selectedPlaces];
    }
    if (restoredTrip.selectedRestaurants && Array.isArray(restoredTrip.selectedRestaurants)) {
      engine._selectedRestaurants = [...restoredTrip.selectedRestaurants];
    }
    if (restoredTrip.interests && Array.isArray(restoredTrip.interests)) {
      engine._collectedInterests = [...restoredTrip.interests];
    }
  }

});

/**
 * Format the itinerary as clean markdown for sharing.
 */
function formatItineraryMarkdown(trip = {}, itinerary = {}) {
  const dest = trip.destination || 'Trip';
  const lines = [
    `# 🗺️ Trailmate Itinerary: ${dest}`,
    `**Travelers:** ${trip.travelers || 1} | **Budget:** ${trip.budgetTier || 'Moderate'}`,
    '',
  ];

  if (trip.selectedFlight) {
    lines.push(`### ✈️ Flight`);
    lines.push(`- **${trip.selectedFlight.airline || 'Flight'}:** ${trip.selectedFlight.departureTime || ''} → ${trip.selectedFlight.arrivalTime || ''} (${trip.selectedFlight.price || ''})`);
    lines.push('');
  }

  if (trip.selectedHotel) {
    lines.push(`### 🏨 Accommodation`);
    lines.push(`- **${trip.selectedHotel.name}:** ${trip.selectedHotel.formattedAddress || ''} (${trip.selectedHotel.price || ''})`);
    lines.push('');
  }

  (itinerary.days || []).forEach((day) => {
    lines.push(`### Day ${day.dayNumber}: ${day.title || day.date || ''} (${day.theme || ''})`);
    (day.stops || []).forEach((s) => {
      lines.push(`- **${s.time || ''}**: ${s.name || s.title} — ${s.description || ''}`);
    });
    lines.push('');
  });

  lines.push('---');
  lines.push('*Planned with Trailmate AI Travel Assistant*');
  return lines.join('\n');
}

