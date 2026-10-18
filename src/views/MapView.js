/**
 * MapView.js — Split-Pane Dual Explorer Geospatial Map (Stitch Brand UI Edition)
 * Left 42%: Expedition Sights Ledger & Day 1 Circuit feed with search & category filters.
 * Right 58%: Full-height Leaflet map with terracotta route polyline and numbered pins.
 * Strict Brand UI Palette: Parchment (#FCF9F4), Terracotta (#C4703D / #944A1A), Forest Ink (#1E3A34).
 */

import L from 'leaflet';
import { CURATED_ATTRACTIONS } from '../data/AttractionsData.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Coordinate centers and default zooms for 15 destinations
const DESTINATION_CENTERS = {
  ooty: { lat: 11.4102, lng: 76.6950, zoom: 13, label: 'Ooty (Nilgiri Hills)' },
  goa: { lat: 15.3500, lng: 73.8500, zoom: 11, label: 'Goa Coast & Heritage' },
  manali: { lat: 32.2432, lng: 77.1892, zoom: 13, label: 'Manali & Solang Valley' },
  jaipur: { lat: 26.9124, lng: 75.7873, zoom: 13, label: 'Jaipur Pink City' },
  udaipur: { lat: 24.5854, lng: 73.7125, zoom: 13, label: 'Udaipur City of Lakes' },
  munnar: { lat: 10.0889, lng: 77.0595, zoom: 13, label: 'Munnar Tea Highlands' },
  shimla: { lat: 31.1048, lng: 77.1734, zoom: 13, label: 'Shimla Ridge & Hills' },
  andaman: { lat: 11.6234, lng: 92.7265, zoom: 11, label: 'Andaman & Nicobar' },
  coorg: { lat: 12.4244, lng: 75.7382, zoom: 12, label: 'Coorg (Kodagu)' },
  mussoorie: { lat: 30.4598, lng: 78.0644, zoom: 13, label: 'Mussoorie Hills' },
  nainital: { lat: 29.3919, lng: 79.4542, zoom: 13, label: 'Nainital Lake District' },
  kodaikanal: { lat: 10.2381, lng: 77.4892, zoom: 13, label: 'Kodaikanal Shola' },
  darjeeling: { lat: 27.0410, lng: 88.2663, zoom: 13, label: 'Darjeeling Himalayas' },
  wayanad: { lat: 11.6854, lng: 76.1320, zoom: 12, label: 'Wayanad Rainforest' },
  gangtok: { lat: 27.3389, lng: 88.6065, zoom: 13, label: 'Gangtok & Sikkim' },
};

// Elevation & Circuit metadata for rich field display
const DESTINATION_META = {
  ooty: {
    avgElev: '2,240m avg',
    circuitTitle: 'HIGHLAND HERITAGE & RIDGES',
    circuitStats: '4 Stops • 18.4 km • ~4.5 hrs • 2,637m Peak',
    profile: [
      { name: 'Tea Museum', elev: '2,180m' },
      { name: 'Doddabetta Peak', elev: '2,637m' },
      { name: 'Botanical Gardens', elev: '2,240m' },
      { name: 'Ooty Lake', elev: '2,210m' },
    ],
  },
  goa: {
    avgElev: '15m avg',
    circuitTitle: 'COASTAL FORTS & PORTUGUESE LORE',
    circuitStats: '4 Stops • 26.2 km • ~5.0 hrs • Sea Level',
    profile: [
      { name: 'Fort Aguada', elev: '42m' },
      { name: 'Basilica of Bom Jesus', elev: '18m' },
      { name: 'Anjuna Beach', elev: '5m' },
      { name: 'Chapora Fort', elev: '55m' },
    ],
  },
  manali: {
    avgElev: '2,050m avg',
    circuitTitle: 'SOLANG VALLEY & CEDAR FORESTS',
    circuitStats: '4 Stops • 22.8 km • ~5.5 hrs • 2,560m Peak',
    profile: [
      { name: 'Hadimba Temple', elev: '2,060m' },
      { name: 'Solang Valley', elev: '2,560m' },
      { name: 'Jogini Waterfall', elev: '2,140m' },
      { name: 'Old Manali', elev: '2,050m' },
    ],
  },
  jaipur: {
    avgElev: '431m avg',
    circuitTitle: 'ROYAL CITADELS & PINK CITY BASTIONS',
    circuitStats: '4 Stops • 16.5 km • ~4.5 hrs • 548m Fort Ridge',
    profile: [
      { name: 'Amber Palace', elev: '512m' },
      { name: 'Hawa Mahal', elev: '435m' },
      { name: 'City Palace', elev: '431m' },
      { name: 'Nahargarh Fort', elev: '548m' },
    ],
  },
  udaipur: {
    avgElev: '598m avg',
    circuitTitle: 'LAKE PALACES & MEWAR HERITAGE',
    circuitStats: '4 Stops • 14.2 km • ~4.0 hrs • 610m Ridge',
    profile: [
      { name: 'City Palace', elev: '598m' },
      { name: 'Lake Pichola', elev: '590m' },
      { name: 'Jag Mandir', elev: '592m' },
      { name: 'Saheliyon Ki Bari', elev: '605m' },
    ],
  },
  munnar: {
    avgElev: '1,532m avg',
    circuitTitle: 'EMERALD TEA HIGHLANDS & PEAKS',
    circuitStats: '4 Stops • 21.6 km • ~5.0 hrs • 1,880m Peak',
    profile: [
      { name: 'Tea Museum', elev: '1,520m' },
      { name: 'Mattupetty Dam', elev: '1,700m' },
      { name: 'Top Station', elev: '1,880m' },
      { name: 'Eravikulam Park', elev: '1,750m' },
    ],
  },
  shimla: {
    avgElev: '2,276m avg',
    circuitTitle: 'COLONIAL RIDGE & ALPINE LOOKOUTS',
    circuitStats: '4 Stops • 12.8 km • ~4.0 hrs • 2,455m Peak',
    profile: [
      { name: 'The Ridge', elev: '2,230m' },
      { name: 'Jakhoo Temple', elev: '2,455m' },
      { name: 'Viceregal Lodge', elev: '2,130m' },
      { name: 'Mall Road', elev: '2,200m' },
    ],
  },
  andaman: {
    avgElev: '25m avg',
    circuitTitle: 'ISLAND REEFS & COLONIAL MEMORIALS',
    circuitStats: '4 Stops • 34.0 km • ~6.0 hrs • Coastal',
    profile: [
      { name: 'Cellular Jail', elev: '32m' },
      { name: 'Radhanagar Beach', elev: '5m' },
      { name: 'Elephant Beach', elev: '4m' },
      { name: 'Ross Island', elev: '18m' },
    ],
  },
  coorg: {
    avgElev: '1,061m avg',
    circuitTitle: 'COFFEE PLANTATIONS & MISTY FALLS',
    circuitStats: '4 Stops • 28.5 km • ~5.5 hrs • 1,750m Peak',
    profile: [
      { name: 'Abbey Falls', elev: '1,020m' },
      { name: 'Raja Seat', elev: '1,120m' },
      { name: 'Dubare Camp', elev: '840m' },
      { name: 'Tadiandamol', elev: '1,750m' },
    ],
  },
  mussoorie: {
    avgElev: '2,005m avg',
    circuitTitle: 'GARHWAL RIDGELINE & CLOUD TRAILS',
    circuitStats: '4 Stops • 15.6 km • ~4.5 hrs • 2,275m Peak',
    profile: [
      { name: 'Gun Hill', elev: '2,024m' },
      { name: 'Kempty Falls', elev: '1,364m' },
      { name: 'Lal Tibba', elev: '2,275m' },
      { name: 'Camel Back', elev: '2,000m' },
    ],
  },
  nainital: {
    avgElev: '2,084m avg',
    circuitTitle: 'KUMAON LAKES & PEAK OVERLOOKS',
    circuitStats: '4 Stops • 17.2 km • ~4.5 hrs • 2,615m Peak',
    profile: [
      { name: 'Naini Lake', elev: '1,938m' },
      { name: 'Naina Peak', elev: '2,615m' },
      { name: 'Snow View', elev: '2,270m' },
      { name: 'Tiffin Top', elev: '2,292m' },
    ],
  },
  kodaikanal: {
    avgElev: '2,133m avg',
    circuitTitle: 'PALANI RIDGELINE & SHOLA CRAGS',
    circuitStats: '4 Stops • 19.4 km • ~4.5 hrs • 2,200m Peak',
    profile: [
      { name: 'Kodai Lake', elev: '2,133m' },
      { name: 'Pillar Rocks', elev: '2,200m' },
      { name: 'Coaker Walk', elev: '2,150m' },
      { name: 'Bryant Park', elev: '2,120m' },
    ],
  },
  darjeeling: {
    avgElev: '2,042m avg',
    circuitTitle: 'KANCHENJUNGA SUNRISE & TEA ESTATES',
    circuitStats: '4 Stops • 22.0 km • ~5.5 hrs • 2,590m Peak',
    profile: [
      { name: 'Tiger Hill', elev: '2,590m' },
      { name: 'Batasia Loop', elev: '2,100m' },
      { name: 'Happy Valley Tea', elev: '2,040m' },
      { name: 'Himalayan Zoo', elev: '2,080m' },
    ],
  },
  wayanad: {
    avgElev: '900m avg',
    circuitTitle: 'NEOLITHIC CAVES & RAINFOREST SHED',
    circuitStats: '4 Stops • 38.0 km • ~6.0 hrs • 2,100m Peak',
    profile: [
      { name: 'Edakkal Caves', elev: '1,200m' },
      { name: 'Banasura Dam', elev: '850m' },
      { name: 'Chembra Peak', elev: '2,100m' },
      { name: 'Soochipara Falls', elev: '780m' },
    ],
  },
  gangtok: {
    avgElev: '1,650m avg',
    circuitTitle: 'SIKKIM MONASTERIES & HIMALAYAN PASSES',
    circuitStats: '4 Stops • 32.5 km • ~6.0 hrs • 3,753m Lake',
    profile: [
      { name: 'Tsomgo Lake', elev: '3,753m' },
      { name: 'Rumtek Monastery', elev: '1,500m' },
      { name: 'MG Marg', elev: '1,650m' },
      { name: 'Tashi Viewpoint', elev: '1,780m' },
    ],
  },
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

let currentMapInstance = null;
let currentMarkersGroup = null;
let currentRouteGroup = null;
let currentDistMarkersGroup = null;

export function renderMapView(container, { switchView, store }) {
  const { trip = {} } = store.getState();
  let selectedDestination = (trip.destination || 'Ooty').trim();

  const getDestKey = (dest) => {
    const d = (dest || '').toLowerCase();
    if (d.includes('ooty') || d.includes('nilgiri')) return 'ooty';
    if (d.includes('goa') || d.includes('panaji')) return 'goa';
    if (d.includes('manali') || d.includes('kullu')) return 'manali';
    if (d.includes('jaipur')) return 'jaipur';
    if (d.includes('udaipur')) return 'udaipur';
    if (d.includes('munnar')) return 'munnar';
    if (d.includes('shimla')) return 'shimla';
    if (d.includes('andaman') || d.includes('port blair') || d.includes('havelock')) return 'andaman';
    if (d.includes('coorg') || d.includes('madikeri') || d.includes('kodagu')) return 'coorg';
    if (d.includes('mussoorie') || d.includes('landour')) return 'mussoorie';
    if (d.includes('nainital') || d.includes('bhimtal')) return 'nainital';
    if (d.includes('kodaikanal') || d.includes('kodai')) return 'kodaikanal';
    if (d.includes('darjeeling') || d.includes('ghoom')) return 'darjeeling';
    if (d.includes('wayanad') || d.includes('kalpetta')) return 'wayanad';
    if (d.includes('gangtok') || d.includes('sikkim')) return 'gangtok';
    return 'ooty';
  };

  let activeDestKey = getDestKey(selectedDestination);
  let activeFilter = 'Day 1'; // Default to active Day 1 circuit as showcased
  let searchQuery = '';
  let activeCardIndex = 0;

  // Build Split-Pane Layout
  container.innerHTML = `
    <div class="map-split-workspace">
      <!-- ── Left 42%: Sights Ledger & Itinerary Feed ── -->
      <aside class="map-ledger-pane" id="mapLedgerPane">
        <!-- Header -->
        <div class="map-ledger-header">
          <div class="map-header-top-row">
            <div class="relative">
              <button type="button" class="map-dest-dropdown-btn" id="btnDestPicker" aria-haspopup="true">
                <span class="text-sm">📍</span>
                <span class="font-bold text-xs sm:text-sm text-[#1E3A34] font-headline" id="lblActiveDestName">
                  ${escapeHtml(selectedDestination)}
                </span>
                <span class="material-symbols-outlined text-xs text-neutral-500">arrow_drop_down</span>
              </button>

              <!-- Dropdown destination menu -->
              <div class="map-dest-menu hidden" id="destPickerMenu">
                ${[
                  { name: 'Ooty', key: 'ooty' },
                  { name: 'Goa', key: 'goa' },
                  { name: 'Manali', key: 'manali' },
                  { name: 'Jaipur', key: 'jaipur' },
                  { name: 'Udaipur', key: 'udaipur' },
                  { name: 'Munnar', key: 'munnar' },
                  { name: 'Shimla', key: 'shimla' },
                  { name: 'Andaman', key: 'andaman' },
                  { name: 'Coorg', key: 'coorg' },
                  { name: 'Mussoorie', key: 'mussoorie' },
                  { name: 'Nainital', key: 'nainital' },
                  { name: 'Kodaikanal', key: 'kodaikanal' },
                  { name: 'Darjeeling', key: 'darjeeling' },
                  { name: 'Wayanad', key: 'wayanad' },
                  { name: 'Gangtok', key: 'gangtok' },
                ].map(c => `
                  <button type="button" class="map-dest-option ${c.key === activeDestKey ? 'active' : ''}" data-name="${c.name}" data-key="${c.key}">
                    <span>${c.name}</span>
                    <span class="text-[10px] font-mono text-neutral-400">14 Sights</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Elevation badge -->
            <div class="map-elevation-badge" id="destElevationBadge">
              <span class="material-symbols-outlined text-xs text-[#5B8C7B]">terrain</span>
              <span id="lblDestElevValue">${DESTINATION_META[activeDestKey]?.avgElev || '2,240m avg'}</span>
            </div>
          </div>

          <!-- Search input -->
          <div class="map-ledger-search-box">
            <span class="material-symbols-outlined map-search-icon">search</span>
            <input type="text" id="mapSearchInput" placeholder="⌘K Search sights, trails, elevation..." autocomplete="off" />
            <button type="button" class="map-search-clear-btn hidden" id="btnClearMapSearch" title="Clear search">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <!-- Horizontal filter pills -->
        <div class="map-ledger-filters" id="mapLedgerFiltersBar">
          <!-- Injected dynamically -->
        </div>

        <!-- Day 1 Circuit summary banner -->
        <div class="map-circuit-banner" id="mapCircuitBanner">
          <div class="map-circuit-header">
            <span class="map-circuit-title" id="circuitBannerTitle">DAY 1 CIRCUIT: HIGHLAND HERITAGE & RIDGES</span>
            <span class="in-circuit-pill">In Itinerary ✓</span>
          </div>
          <div class="map-circuit-stats" id="circuitBannerStats">
            4 Stops • 18.4 km • ~4.5 hrs • 2,637m Peak
          </div>
          <div class="map-circuit-actions">
            <button type="button" class="circuit-action-btn" id="btnPlayCircuitOverview">
              <span class="material-symbols-outlined text-xs">headphones</span>
              <span>Audio Overview</span>
            </button>
            <button type="button" class="circuit-action-btn" id="btnFitCircuitBounds">
              <span class="material-symbols-outlined text-xs">fit_screen</span>
              <span>Fit Route Bounds</span>
            </button>
          </div>
        </div>

        <!-- Scrollable sights feed -->
        <div class="map-ledger-feed" id="mapLedgerFeed">
          <!-- Sight cards injected dynamically -->
        </div>
      </aside>

      <!-- ── Right 58%: Leaflet Map Canvas & HUD ── -->
      <main class="map-canvas-pane">
        <div id="fullScreenExpeditionMap" class="map-canvas-full"></div>

        <!-- Top Right Map HUD Controls -->
        <div class="map-canvas-hud">
          <div class="map-hud-glass-card">
            <button type="button" class="map-layer-btn active" data-layer="voyager" title="Vibrant Contours">
              <span class="material-symbols-outlined text-xs">palette</span>
              <span>Contours</span>
            </button>
            <button type="button" class="map-layer-btn" data-layer="satellite" title="Esri Satellite">
              <span class="material-symbols-outlined text-xs">satellite_alt</span>
              <span>Satellite</span>
            </button>
          </div>

          <button type="button" class="map-return-planner-btn" id="btnMapReturnToPlanner" title="Return to Itinerary Planner">
            <span class="material-symbols-outlined text-xs">arrow_back</span>
            <span>Back to Planner</span>
          </button>
        </div>

        <!-- Bottom Map Elevation Profile Ribbon -->
        <div class="map-elevation-ribbon" id="mapElevationRibbon">
          <div class="map-ribbon-left">
            <span class="map-ribbon-tag">Elevation Track</span>
            <div class="map-profile-waypoints" id="mapRibbonWaypoints">
              <!-- Steps injected dynamically -->
            </div>
          </div>
          <div class="map-ribbon-coords" id="mapRibbonCoords">
            11.4102° N, 76.6950° E • CartoDB / OSM HOT
          </div>
        </div>
      </main>

      <!-- Multi-photo modal container -->
      <div id="mapPhotoGalleryModal" class="hidden"></div>
    </div>
  `;

  // Destroy previous map instance if any
  if (currentMapInstance) {
    currentMapInstance.remove();
    currentMapInstance = null;
  }

  const mapElement = document.getElementById('fullScreenExpeditionMap');
  if (!mapElement) return;

  const initialMeta = DESTINATION_CENTERS[activeDestKey] || DESTINATION_CENTERS.ooty;

  // Initialize Leaflet Map
  const map = L.map(mapElement, {
    center: [initialMeta.lat, initialMeta.lng],
    zoom: initialMeta.zoom,
    zoomControl: false,
    attributionControl: false,
  });
  currentMapInstance = map;

  // Zoom control top-right below HUD
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Basemap Tile Layers
  const tileLayers = {
    voyager: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors, Humanitarian Team',
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri, DigitalGlobe, GeoEye',
    }),
  };

  let activeTileLayer = tileLayers.voyager;
  activeTileLayer.addTo(map);

  // Layer Switcher Buttons
  container.querySelectorAll('.map-layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layerType = btn.dataset.layer;
      if (!tileLayers[layerType]) return;

      container.querySelectorAll('.map-layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      map.removeLayer(activeTileLayer);
      activeTileLayer = tileLayers[layerType];
      activeTileLayer.addTo(map);
    });
  });

  currentMarkersGroup = L.layerGroup().addTo(map);
  currentRouteGroup = L.layerGroup().addTo(map);
  currentDistMarkersGroup = L.layerGroup().addTo(map);

  // Update Coordinates in bottom ribbon on move
  map.on('move', () => {
    const center = map.getCenter();
    const coordsEl = document.getElementById('mapRibbonCoords');
    if (coordsEl) {
      coordsEl.textContent = `${center.lat.toFixed(4)}° N, ${center.lng.toFixed(4)}° E • Voyager`;
    }
  });

  // Audio Guide Function via SpeechSynthesis
  function playAudioGuide(place) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Welcome to Trailmate's field audio guide for ${place.name}. ${place.description}. Located in ${selectedDestination} with an elevation rating of 4.8 stars.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Safe Map Movement Helper (handles zero-dimension / unmounted states gracefully)
  function safeMoveMap(lat, lng, zoom, duration = 0.8) {
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return;
    if (mapElement && mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0) {
      try {
        map.flyTo([numLat, numLng], zoom, { duration });
      } catch {
        map.setView([numLat, numLng], zoom);
      }
    } else {
      map.setView([numLat, numLng], zoom);
    }
  }

  // Observe map container resize and visibility
  if (window.ResizeObserver && mapElement) {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          map.invalidateSize();
        }
      }
    });
    ro.observe(mapElement);
  }

  // Multi-Photo Gallery Modal
  function openPhotoGalleryModal(place, initialIdx = 0) {
    const modalContainer = document.getElementById('mapPhotoGalleryModal');
    if (!modalContainer) return;

    const photos = place.photos && place.photos.length > 0 ? place.photos : [place.photo];
    let currentPhotoIdx = initialIdx;

    function updateGallerySlide(newIdx) {
      currentPhotoIdx = (newIdx + photos.length) % photos.length;
      const mainImg = modalContainer.querySelector('#galleryMainImg');
      const counterBadge = modalContainer.querySelector('#galleryPhotoCounterBadge');
      if (mainImg) mainImg.src = photos[currentPhotoIdx];
      if (counterBadge) counterBadge.textContent = `${currentPhotoIdx + 1} / ${photos.length} Photos`;

      modalContainer.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
        const pIdx = parseInt(btn.dataset.pidx, 10);
        btn.classList.toggle('active', pIdx === currentPhotoIdx);
      });
    }

    modalContainer.innerHTML = `
      <div class="gallery-modal-overlay" id="galleryOverlayBackdrop">
        <div class="gallery-modal-card" id="galleryCardContent">
          <button class="gallery-modal-close" id="btnCloseGalleryModal" aria-label="Close photo gallery">
            <span class="material-symbols-outlined text-base">close</span>
          </button>

          <div class="gallery-hero-viewer">
            <img id="galleryMainImg" class="w-full h-full object-cover select-none" src="${escapeHtml(photos[currentPhotoIdx])}" alt="${escapeHtml(place.name)}" />
            ${photos.length > 1 ? `
              <button class="gallery-nav-btn gallery-nav-prev" id="btnGalleryPrev" aria-label="Previous photo">
                <span class="material-symbols-outlined text-base">arrow_back</span>
              </button>
              <button class="gallery-nav-btn gallery-nav-next" id="btnGalleryNext" aria-label="Next photo">
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ` : ''}
            <div id="galleryPhotoCounterBadge" class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20 select-none">
              ${currentPhotoIdx + 1} / ${photos.length} Photos
            </div>
            <div class="absolute bottom-3 left-3 bg-[#C4703D] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-xs select-none">
              ${escapeHtml(place.category || 'Sight')}
            </div>
          </div>

          ${photos.length > 1 ? `
            <div class="gallery-thumbnails-strip">
              ${photos.map((p, pIdx) => `
                <button type="button" class="gallery-thumb-btn ${pIdx === currentPhotoIdx ? 'active' : ''}" data-pidx="${pIdx}">
                  <img src="${escapeHtml(p)}" alt="Thumbnail ${pIdx + 1}" loading="lazy" />
                </button>
              `).join('')}
            </div>
          ` : ''}

          <div class="gallery-info-body">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-[#1E3A34] font-headline-md">${escapeHtml(place.name)}</h3>
                <p class="text-xs text-neutral-600 font-mono mt-0.5">${escapeHtml(place.formattedAddress || `${place.lat.toFixed(4)}° N, ${place.lng.toFixed(4)}° E`)}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="bg-[#5B8C7B]/15 text-[#2E4433] text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-[#5B8C7B]/30">
                  ★ ${place.rating} Rating
                </span>
              </div>
            </div>
            <p class="text-xs text-neutral-700 leading-relaxed my-2">${escapeHtml(place.description)}</p>
            <div class="pt-3 border-t border-[#BFA895]/25 flex items-center justify-between">
              <span class="text-[10px] font-mono text-neutral-500">Verified Trailmate Landmark</span>
              <button id="btnZoomToPlaceFromGallery" class="px-3.5 py-1.5 bg-[#C4703D] text-white rounded-xl text-xs font-bold hover:bg-[#944A1A] flex items-center gap-1.5 cursor-pointer">
                <span class="material-symbols-outlined text-xs">my_location</span>
                <span>Center On Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modalContainer.classList.remove('hidden');

    document.getElementById('btnCloseGalleryModal')?.addEventListener('click', () => {
      modalContainer.classList.add('hidden');
    });
    document.getElementById('galleryOverlayBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'galleryOverlayBackdrop') modalContainer.classList.add('hidden');
    });
    document.getElementById('btnGalleryPrev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateGallerySlide(currentPhotoIdx - 1);
    });
    document.getElementById('btnGalleryNext')?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateGallerySlide(currentPhotoIdx + 1);
    });
    modalContainer.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pidx = parseInt(btn.dataset.pidx, 10);
        if (!isNaN(pidx)) updateGallerySlide(pidx);
      });
    });
    document.getElementById('btnZoomToPlaceFromGallery')?.addEventListener('click', () => {
      modalContainer.classList.add('hidden');
      safeMoveMap(place.lat, place.lng, 15, 0.8);
    });
  }

  // Master Render Function for Active Destination
  function loadDestinationData(destName, destKey) {
    activeDestKey = destKey;
    selectedDestination = destName;

    // Update Header
    const nameEl = document.getElementById('lblActiveDestName');
    if (nameEl) nameEl.textContent = destName;

    const elevEl = document.getElementById('lblDestElevValue');
    const destMeta = DESTINATION_META[destKey] || DESTINATION_META.ooty;
    if (elevEl) elevEl.textContent = destMeta.avgElev;

    // Update Circuit Banner
    const circuitTitleEl = document.getElementById('circuitBannerTitle');
    const circuitStatsEl = document.getElementById('circuitBannerStats');
    if (circuitTitleEl) circuitTitleEl.textContent = `DAY 1 CIRCUIT: ${destMeta.circuitTitle}`;
    if (circuitStatsEl) circuitStatsEl.textContent = destMeta.circuitStats;

    // Center map
    const centerMeta = DESTINATION_CENTERS[destKey] || DESTINATION_CENTERS.ooty;
    safeMoveMap(centerMeta.lat, centerMeta.lng, centerMeta.zoom || 13, 1.0);

    // Update bottom elevation ribbon waypoints
    const ribbonWaypoints = document.getElementById('mapRibbonWaypoints');
    if (ribbonWaypoints) {
      ribbonWaypoints.innerHTML = destMeta.profile.map((step, sIdx) => `
        <span class="map-profile-step">
          <span class="step-dot"></span>
          <span class="font-bold text-[#1E3A34]">${escapeHtml(step.name)}</span>
          <span class="text-neutral-500 font-mono text-[9.5px]">(${step.elev})</span>
          ${sIdx < destMeta.profile.length - 1 ? '<span class="text-neutral-300">───</span>' : ''}
        </span>
      `).join('');
    }

    const allAttractions = CURATED_ATTRACTIONS[destKey] || CURATED_ATTRACTIONS.ooty;

    // Filter Chips: All, Day 1 Route, Day 2 Route, and Categories
    const categories = [...new Set(allAttractions.map(a => a.category).filter(Boolean))];
    const filtersBar = document.getElementById('mapLedgerFiltersBar');
    if (filtersBar) {
      const filterItems = [
        { label: 'All', count: allAttractions.length },
        { label: 'Day 1 Route', count: Math.min(4, allAttractions.length) },
        { label: 'Day 2 Route', count: Math.min(4, Math.max(0, allAttractions.length - 4)) },
        ...categories.map(c => ({
          label: c,
          count: allAttractions.filter(a => a.category === c).length,
        })),
      ];

      filtersBar.innerHTML = filterItems.map(item => `
        <button type="button" class="map-filter-pill ${item.label === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(item.label)}">
          <span>${escapeHtml(item.label)}</span>
          <span class="pill-count">${item.count}</span>
        </button>
      `).join('');

      filtersBar.querySelectorAll('.map-filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.filter;
          filtersBar.querySelectorAll('.map-filter-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderFilteredFeed();
        });
      });
    }

    function renderFilteredFeed() {
      // Clear Map Layers
      currentMarkersGroup.clearLayers();
      currentRouteGroup.clearLayers();
      currentDistMarkersGroup.clearLayers();

      // Compute Day 1 subset (top 4 sights)
      const day1Attractions = allAttractions.slice(0, 4);
      const day2Attractions = allAttractions.slice(4, 8);

      let displayedAttractions = allAttractions;
      if (activeFilter === 'Day 1 Route' || activeFilter === 'Day 1') {
        displayedAttractions = day1Attractions;
      } else if (activeFilter === 'Day 2 Route' || activeFilter === 'Day 2') {
        displayedAttractions = day2Attractions;
      } else if (activeFilter !== 'All') {
        displayedAttractions = allAttractions.filter(a => a.category === activeFilter);
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        displayedAttractions = displayedAttractions.filter(a =>
          a.name.toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q)
        );
      }

      // ── Draw Day 1 Route Polyline & Segment Distance Badges ──
      const day1Coords = day1Attractions
        .map(a => [Number(a.lat), Number(a.lng)])
        .filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]));

      if (day1Coords.length > 1) {
        // Terracotta Polyline
        L.polyline(day1Coords, {
          color: '#C4703D',
          weight: 4,
          opacity: 0.9,
          dashArray: '6, 7',
          lineJoin: 'round',
        }).addTo(currentRouteGroup);

        // Calculate and place segment midpoint distance markers
        for (let i = 0; i < day1Coords.length - 1; i++) {
          const p1 = day1Coords[i];
          const p2 = day1Coords[i + 1];
          const midLat = (p1[0] + p2[0]) / 2;
          const midLng = (p1[1] + p2[1]) / 2;
          const distKm = getDistanceKm(p1[0], p1[1], p2[0], p2[1]);

          const distIcon = L.divIcon({
            className: 'custom-dist-badge-wrapper',
            html: `<div class="map-segment-distance-badge">${distKm} km</div>`,
            iconSize: [44, 20],
            iconAnchor: [22, 10],
          });
          L.marker([midLat, midLng], { icon: distIcon, interactive: false }).addTo(currentDistMarkersGroup);
        }
      }

      // ── Populate Left Ledger Feed ──
      const feedContainer = document.getElementById('mapLedgerFeed');
      const markerMap = new Map();

      if (feedContainer) {
        if (displayedAttractions.length === 0) {
          feedContainer.innerHTML = `
            <div class="py-12 text-center text-neutral-400 font-mono text-xs">
              <span class="material-symbols-outlined text-3xl mb-1 text-neutral-300">travel_explore</span>
              <p>No sights match your search or filter.</p>
            </div>
          `;
        } else {
          feedContainer.innerHTML = displayedAttractions.map((item, idx) => {
            const day1Index = day1Attractions.findIndex(a => a.name === item.name);
            const isDay1 = day1Index !== -1;
            const photoCount = (item.photos && item.photos.length) || 1;
            const itemElev = destMeta.profile[day1Index]?.elev || destMeta.avgElev;

            // Distance calculation from previous stop in Day 1 or town center
            let distText = '+2.5 km from town';
            if (isDay1 && day1Index > 0) {
              const prev = day1Attractions[day1Index - 1];
              const d = getDistanceKm(prev.lat, prev.lng, item.lat, item.lng);
              distText = `+${d} km from Stop ${day1Index}`;
            }

            return `
              <div class="map-sight-card ${idx === activeCardIndex ? 'active' : ''}" data-idx="${idx}" data-name="${escapeHtml(item.name)}">
                <div class="map-card-head">
                  <div class="map-card-title-group">
                    ${isDay1 ? `
                      <div class="map-waypoint-num-badge">${day1Index + 1}</div>
                    ` : `
                      <div class="map-category-icon-badge">
                        <span class="material-symbols-outlined text-xs">place</span>
                      </div>
                    `}
                    <div class="min-w-0">
                      <h4 class="map-card-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h4>
                      <p class="text-[10px] font-mono text-[#5B8C7B] uppercase tracking-wider">${escapeHtml(item.category || 'Attraction')}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    ${isDay1 ? `<span class="in-circuit-pill">In Circuit ✓</span>` : ''}
                    <span class="map-card-rating">★ ${item.rating}</span>
                  </div>
                </div>

                <!-- High-Res Photo Thumbnail Banner -->
                <div class="map-card-photo-hero group" data-gallery-idx="${idx}">
                  <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" loading="lazy" />
                  <span class="map-photo-count-badge">
                    <span class="material-symbols-outlined text-[10px]">photo_library</span>
                    <span>${photoCount} Photos</span>
                  </span>
                  <span class="map-card-elev-pill">
                    ⛰️ ${itemElev}
                  </span>
                  <span class="map-card-dist-pill">
                    ${distText}
                  </span>
                </div>

                <!-- Curated Description -->
                <p class="map-card-desc">${escapeHtml(item.description)}</p>

                <!-- Footer Action Buttons -->
                <div class="map-card-footer">
                  <button type="button" class="map-audio-btn" data-idx="${idx}">
                    <span class="material-symbols-outlined text-xs">volume_up</span>
                    <span>Audio Guide (4m)</span>
                  </button>
                  <div class="flex items-center gap-2">
                    <button type="button" class="text-[11px] font-bold text-neutral-600 hover:text-[#C4703D] transition-colors" data-gallery-action="${idx}">
                      View Gallery
                    </button>
                    <button type="button" class="map-focus-btn" data-idx="${idx}">
                      <span class="material-symbols-outlined text-xs">my_location</span>
                      <span>Focus</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('');

          // Bind Card Clicks
          feedContainer.querySelectorAll('.map-sight-card').forEach(card => {
            const idx = parseInt(card.dataset.idx, 10);
            const item = displayedAttractions[idx];

            card.addEventListener('click', (e) => {
              // Don't trigger default focus if clicking audio or gallery button specifically
              if (e.target.closest('.map-audio-btn') || e.target.closest('[data-gallery-action]') || e.target.closest('.map-card-photo-hero')) return;

              activeCardIndex = idx;
              feedContainer.querySelectorAll('.map-sight-card').forEach(c => c.classList.remove('active'));
              card.classList.add('active');

              if (item && Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
                safeMoveMap(item.lat, item.lng, 15, 0.8);
                const marker = markerMap.get(idx);
                if (marker) marker.openPopup();
              }
            });

            // Focus button
            card.querySelector('.map-focus-btn')?.addEventListener('click', (e) => {
              e.stopPropagation();
              activeCardIndex = idx;
              feedContainer.querySelectorAll('.map-sight-card').forEach(c => c.classList.remove('active'));
              card.classList.add('active');
              if (item && Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
                safeMoveMap(item.lat, item.lng, 16, 0.8);
                const marker = markerMap.get(idx);
                if (marker) marker.openPopup();
              }
            });

            // Audio button
            card.querySelector('.map-audio-btn')?.addEventListener('click', (e) => {
              e.stopPropagation();
              playAudioGuide(item);
            });

            // Photo hero or gallery text
            card.querySelector('.map-card-photo-hero')?.addEventListener('click', (e) => {
              e.stopPropagation();
              openPhotoGalleryModal(item, 0);
            });
            card.querySelector('[data-gallery-action]')?.addEventListener('click', (e) => {
              e.stopPropagation();
              openPhotoGalleryModal(item, 0);
            });
          });
        }
      }

      // ── Plot Map Markers ──
      displayedAttractions.forEach((item, idx) => {
        const itemLat = Number(item.lat);
        const itemLng = Number(item.lng);
        if (!Number.isFinite(itemLat) || !Number.isFinite(itemLng)) return;

        const day1Index = day1Attractions.findIndex(a => a.name === item.name);
        const isDay1 = day1Index !== -1;
        const photoCount = (item.photos && item.photos.length) || 1;

        let iconHtml = '';
        let iconSize = [40, 52];
        let iconAnchor = [20, 50];

        if (isDay1) {
          // Numbered Terracotta Waypoint Pin
          iconHtml = `
            <div class="map-waypoint-pin" title="${escapeHtml(item.name)}">
              <div class="map-waypoint-bubble">${day1Index + 1}</div>
              <div class="map-waypoint-pointer"></div>
              <div class="map-waypoint-label">${escapeHtml(item.name)}</div>
            </div>
          `;
          iconSize = [50, 66];
          iconAnchor = [25, 60];
        } else {
          // Secondary Photo Pin
          iconHtml = `
            <div class="photo-pin-container" title="${escapeHtml(item.name)}">
              <div class="photo-pin-bubble">
                <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" class="photo-pin-img" onerror="this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'" />
              </div>
              <div class="photo-pin-pointer"></div>
              <div class="photo-pin-label">${escapeHtml(item.name)}</div>
            </div>
          `;
          iconSize = [44, 60];
          iconAnchor = [22, 54];
        }

        const customIcon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: iconHtml,
          iconSize,
          iconAnchor,
          popupAnchor: [0, -iconAnchor[1] - 4],
        });

        // Popup Content
        const popupHtml = `
          <div class="attraction-popup-card" data-idx="${idx}">
            <div class="attraction-popup-hero" data-gallery-trigger="${idx}">
              <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" />
              <div class="absolute top-2 right-2 bg-black/65 backdrop-blur-md text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                <span class="material-symbols-outlined text-xs">photo_library</span>
                <span>${photoCount} Photos</span>
              </div>
              ${isDay1 ? `
                <div class="absolute top-2 left-2 bg-[#C4703D] text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Stop #${day1Index + 1}
                </div>
              ` : ''}
            </div>
            <div class="attraction-popup-body">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C4703D]">${escapeHtml(item.category)}</span>
                <span class="text-[10px] font-bold text-neutral-800 font-mono">★ ${item.rating}</span>
              </div>
              <h3 class="text-xs font-bold text-[#1E3A34] mb-1 leading-snug">${escapeHtml(item.name)}</h3>
              <p class="text-[10.5px] text-neutral-600 line-clamp-2 leading-relaxed mb-2">${escapeHtml(item.description)}</p>
              <div class="pt-2 border-t border-[#BFA895]/20 flex items-center justify-between">
                <button class="text-[10.5px] font-bold text-[#C4703D] hover:underline flex items-center gap-1 cursor-pointer popup-gallery-btn">
                  <span class="material-symbols-outlined text-xs">photo_library</span>
                  <span>View Photos</span>
                </button>
                <button class="text-[10.5px] font-bold text-[#5B8C7B] hover:underline flex items-center gap-1 cursor-pointer popup-audio-btn">
                  <span class="material-symbols-outlined text-xs">volume_up</span>
                  <span>Audio Guide</span>
                </button>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([itemLat, itemLng], { icon: customIcon })
          .bindPopup(popupHtml, { maxWidth: 280, minWidth: 260 });

        marker.on('click', () => {
          activeCardIndex = idx;
          const card = feedContainer?.querySelector(`.map-sight-card[data-idx="${idx}"]`);
          if (card) {
            feedContainer.querySelectorAll('.map-sight-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });

        marker.on('popupopen', () => {
          const popupEl = marker.getPopup()?.getElement();
          if (popupEl) {
            popupEl.querySelector('.popup-gallery-btn')?.addEventListener('click', (e) => {
              e.stopPropagation();
              openPhotoGalleryModal(item, 0);
            });
            popupEl.querySelector('.attraction-popup-hero')?.addEventListener('click', (e) => {
              e.stopPropagation();
              openPhotoGalleryModal(item, 0);
            });
            popupEl.querySelector('.popup-audio-btn')?.addEventListener('click', (e) => {
              e.stopPropagation();
              playAudioGuide(item);
            });
          }
        });

        marker.addTo(currentMarkersGroup);
        markerMap.set(idx, marker);
      });
    }

    renderFilteredFeed();

    // Invalidate map size after DOM settling to ensure full container coverage
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }

  // ── Search Input Event ──
  const searchInput = document.getElementById('mapSearchInput');
  const clearSearchBtn = document.getElementById('btnClearMapSearch');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', !searchQuery);
      }
      // Re-trigger loadDestinationData's inner render
      loadDestinationData(selectedDestination, activeDestKey);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      loadDestinationData(selectedDestination, activeDestKey);
    });
  }

  // ── Destination Picker Menu Events ──
  const btnDestPicker = document.getElementById('btnDestPicker');
  const destPickerMenu = document.getElementById('destPickerMenu');

  if (btnDestPicker && destPickerMenu) {
    btnDestPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      destPickerMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!destPickerMenu.contains(e.target) && e.target !== btnDestPicker) {
        destPickerMenu.classList.add('hidden');
      }
    });

    destPickerMenu.querySelectorAll('.map-dest-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const destName = opt.dataset.name;
        const destKey = opt.dataset.key;
        destPickerMenu.querySelectorAll('.map-dest-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        destPickerMenu.classList.add('hidden');
        loadDestinationData(destName, destKey);
      });
    });
  }

  // ── Circuit Banner Actions ──
  document.getElementById('btnPlayCircuitOverview')?.addEventListener('click', () => {
    const destMeta = DESTINATION_META[activeDestKey] || DESTINATION_META.ooty;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Day 1 Circuit Overview for ${selectedDestination}. ${destMeta.circuitTitle}. ${destMeta.circuitStats}. Exploring our four featured heritage landmarks along the scenic route.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  });

  document.getElementById('btnFitCircuitBounds')?.addEventListener('click', () => {
    const allAttractions = CURATED_ATTRACTIONS[activeDestKey] || CURATED_ATTRACTIONS.ooty;
    const day1Attractions = allAttractions.slice(0, 4);
    const day1Coords = day1Attractions
      .map(a => [Number(a.lat), Number(a.lng)])
      .filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]));

    if (day1Coords.length > 0) {
      const bounds = L.latLngBounds(day1Coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  });

  // ── Return to Planner Button ──
  document.getElementById('btnMapReturnToPlanner')?.addEventListener('click', () => {
    switchView('chat');
  });

  // Window Resize Invalidation
  const resizeHandler = () => {
    if (map) map.invalidateSize();
  };
  window.addEventListener('resize', resizeHandler);

  // Initial load
  loadDestinationData(selectedDestination, activeDestKey);
}
