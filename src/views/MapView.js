/**
 * MapView.js — Split-Pane Dual Explorer Geospatial Map (Pixel-Perfect Stitch UI Edition)
 * Left 42%: Sights Ledger & Itinerary Feed with serif typography and day circuit pacing.
 * Right 58%: Warm museum-grade CartoDB Positron map with terracotta route polyline,
 * numbered waypoint pins, compact horizontal popover, scale datum, and elevation chart.
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

// Center coordinates and zooms for 15 destinations
const DESTINATION_CENTERS = {
  ooty: { lat: 11.4102, lng: 76.7100, zoom: 13, label: 'Ooty (Nilgiri Hills)' },
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

// Rich destination editorial headlines and curated Day 1 circuit stop sequences
const DESTINATION_META = {
  ooty: {
    headline: 'Ooty, Queen of Hill Stations',
    ledgerSub: 'Nilgiris Expedition Ledger • 14 Curated Sights & High Passes',
    avgElev: '2,240m avg',
    indexCoords: '11.41° / 76.69°',
    circuitStrip: '🧭 Day 1 Circuit • 4 Stops • 18.4 km • ~4.5 hrs scenic drive & walk',
    elevRange: '2,180m - 2,637m',
    circuitStops: [
      {
        name: 'Tea Museum & Dodabetta Tea Factory',
        shortName: 'Nilgiri Tea Museum',
        altTag: '● Stop #1 • 2,180m ALT',
        status: 'Open till 6 PM',
        openStatus: '● Tasting Open Now',
        meta: '★ 4.8 (1.2k ledger notes) • Heritage & Agro-Tourism',
        desc: 'Orthodox CTC leaf processing dating back to 1902. Operates traditional wood-fueled drying kilns overlooking the Doddabetta foothills. Fresh estate tasting at the vintage cedar dispensary.',
        lat: 11.4132,
        lng: 76.7325,
        coordsText: '11.4132° N, 76.7325° E',
        audioText: 'Audio Guide (14m)',
        photo: '/images/attractions/ooty/tea-museum-4.jpg',
      },
      {
        name: 'Doddabetta Peak & Observatory',
        shortName: 'Doddabetta Peak',
        altTag: '● Stop #2 • 2,637m SUMMIT',
        status: 'Open • Closes 6 PM',
        openStatus: '● Peak Vista Clear',
        meta: '★ 4.7 (2.4k ledger notes) • Highest Vantage Point in Nilgiris',
        desc: 'Summiting at 2,637 meters with panoramic telescope views across Tamil Nadu and Kerala valleys. Mist rolls in rapidly after 3 PM.',
        lat: 11.3995,
        lng: 76.7388,
        coordsText: '11.3995° N, 76.7388° E',
        audioText: 'Clear Vista (360°)',
        photo: '/images/attractions/ooty/doddabetta-peak-1.jpg',
      },
      {
        name: 'Government Botanical Gardens',
        shortName: 'Botanical Gardens',
        altTag: '● Stop #3 • 2,240m GARDEN',
        status: 'Open till 6:30 PM',
        openStatus: '● Terraces Open',
        meta: '★ 4.5 (3.1k notes) • Victorian Terraces & Fern House',
        desc: 'Laid out in 1848 by William Graham McIvor. Features 20-million-year-old fossilized tree trunk and Italian floral garden terraces.',
        lat: 11.4180,
        lng: 76.7115,
        coordsText: '11.4180° N, 76.7115° E',
        audioText: 'Audio Guide (8m)',
        photo: '/images/attractions/ooty/botanical-gardens-1.jpg',
      },
      {
        name: 'Ooty Lake & Boathouse',
        shortName: 'Ooty Lake Boathouse',
        altTag: '● Stop #4 • 2,210m LAKE',
        status: 'Open till 5:30 PM',
        openStatus: '● Boating Active',
        meta: '★ 4.4 (1.8k notes) • Artificial Lake & Rowboats',
        desc: 'Constructed by John Sullivan in 1824. Flanked by eucalyptus groves, offering vintage paddle boating and narrow-gauge miniature train rides.',
        lat: 11.4050,
        lng: 76.6880,
        coordsText: '11.4050° N, 76.6880° E',
        audioText: 'Audio Guide (6m)',
        photo: '/images/attractions/ooty/ooty-lake-1.jpg',
      },
    ],
  },
  goa: {
    headline: 'Goa, Sun-Kissed Coast & Heritage',
    ledgerSub: 'Konkan Expedition Ledger • 14 Curated Sights & Sea Bastions',
    avgElev: '15m avg',
    indexCoords: '15.35° / 73.85°',
    circuitStrip: '🧭 Day 1 Circuit • 4 Stops • 26.2 km • ~5.0 hrs coastal drive',
    elevRange: '5m - 55m',
    circuitStops: [
      { name: 'Fort Aguada & Lighthouse', shortName: 'Fort Aguada', altTag: '● Stop #1 • 42m BASTION', status: 'Open till 6 PM', openStatus: '● Lighthouse Open', meta: '★ 4.7 • 17th Century Portuguese Citadel', desc: 'Preserved Portuguese coastal bastion overlooking Sinquerim and Arabian Sea horizons.', lat: 15.4920, lng: 73.7735, coordsText: '15.4920° N, 73.7735° E', audioText: 'Audio Guide (12m)' },
      { name: 'Basilica of Bom Jesus', shortName: 'Bom Jesus Basilica', altTag: '● Stop #2 • 18m HERITAGE', status: 'Open till 5:30 PM', openStatus: '● Sanctuary Open', meta: '★ 4.8 • UNESCO World Heritage Site', desc: 'Baroque architecture enshrining the mortal remains of St. Francis Xavier.', lat: 15.5008, lng: 73.9116, coordsText: '15.5008° N, 73.9116° E', audioText: 'Audio Guide (10m)' },
      { name: 'Anjuna Beach & Flea Market', shortName: 'Anjuna Beach', altTag: '● Stop #3 • 5m COAST', status: 'Open 24 Hours', openStatus: '● Sunset Point', meta: '★ 4.5 • Red Laterite Cliffs & Shacks', desc: 'Curved shoreline framed by coconut groves, laterite crags, and boho artisan markets.', lat: 15.5828, lng: 73.7438, coordsText: '15.5828° N, 73.7438° E', audioText: 'Audio Guide (8m)' },
      { name: 'Chapora Fort & Sunset Viewpoint', shortName: 'Chapora Fort', altTag: '● Stop #4 • 55m RIDGE', status: 'Open till 6:30 PM', openStatus: '● Sunset Prime', meta: '★ 4.6 • Vagator Bay Panoramic Bastion', desc: 'Historic red stone ramparts famous for dramatic twilight ocean horizons.', lat: 15.6058, lng: 73.7368, coordsText: '15.6058° N, 73.7368° E', audioText: 'Audio Guide (7m)' },
    ],
  },
  manali: {
    headline: 'Manali, Valley of the Gods',
    ledgerSub: 'Kullu Expedition Ledger • 14 Curated Sights & Snow Passes',
    avgElev: '2,050m avg',
    indexCoords: '32.24° / 77.19°',
    circuitStrip: '🧭 Day 1 Circuit • 4 Stops • 22.8 km • ~5.5 hrs alpine circuit',
    elevRange: '2,050m - 2,560m',
    circuitStops: [
      { name: 'Hadimba Devi Temple', shortName: 'Hadimba Temple', altTag: '● Stop #1 • 2,060m SHRINE', status: 'Open till 6 PM', openStatus: '● Forest Open', meta: '★ 4.7 • 1553 AD Pagoda Timber Sanctuary', desc: 'Four-tiered wooden pagoda temple set within ancient towering deodar pine cedar forests.', lat: 32.2483, lng: 77.1696, coordsText: '32.2483° N, 77.1696° E', audioText: 'Audio Guide (12m)' },
      { name: 'Solang Valley Adventure Point', shortName: 'Solang Valley', altTag: '● Stop #2 • 2,560m MEADOW', status: 'Open till 6 PM', openStatus: '● Cable Car Active', meta: '★ 4.6 • Glacial Meadow & Paragliding', desc: 'Expansive glacial basin offering year-round adventure sports and snow-capped peak views.', lat: 32.3167, lng: 77.1583, coordsText: '32.3167° N, 77.1583° E', audioText: 'Audio Guide (10m)' },
      { name: 'Jogini Waterfalls & Vashisht Trek', shortName: 'Jogini Falls', altTag: '● Stop #3 • 2,140m CASCADE', status: 'Daylight Access', openStatus: '● Trail Clear', meta: '★ 4.8 • Sacred Cascades & Apple Orchards', desc: 'Picturesque pine trail ascending to multiple cascading streams over granite cliffs.', lat: 32.2683, lng: 77.1925, coordsText: '32.2683° N, 77.1925° E', audioText: 'Audio Guide (9m)' },
      { name: 'Old Manali Village & Manu Temple', shortName: 'Old Manali Village', altTag: '● Stop #4 • 2,050m HERITAGE', status: 'Open till 8 PM', openStatus: '● Cafes Open', meta: '★ 4.6 • Stone & Timber Himalayan Architecture', desc: 'Narrow flagstone alleyways lined with traditional Himachali houses and bakeries.', lat: 32.2542, lng: 77.1750, coordsText: '32.2542° N, 77.1750° E', audioText: 'Audio Guide (8m)' },
    ],
  },
  munnar: {
    headline: 'Munnar, High Range Tea Realm',
    ledgerSub: 'Idukki Expedition Ledger • 14 Curated Sights & High Passes',
    avgElev: '1,532m avg',
    indexCoords: '10.09° / 77.06°',
    circuitStrip: '🧭 Day 1 Circuit • 4 Stops • 21.6 km • ~5.0 hrs highland route',
    elevRange: '1,520m - 1,880m',
    circuitStops: [
      { name: 'Tata Tea Museum & Factory', shortName: 'Tata Tea Museum', altTag: '● Stop #1 • 1,520m ALT', status: 'Open till 5 PM', openStatus: '● Rollers Active', meta: '★ 4.6 • Century-Old Tea Processing Machinery', desc: 'Live demonstration of Orthodox and CTC tea manufacturing with original Kundale valley artifacts.', lat: 10.0880, lng: 77.0580, coordsText: '10.0880° N, 77.0580° E', audioText: 'Audio Guide (14m)' },
      { name: 'Mattupetty Dam & Lake', shortName: 'Mattupetty Dam', altTag: '● Stop #2 • 1,700m BASIN', status: 'Open till 5:30 PM', openStatus: '● Speedboats Active', meta: '★ 4.5 • Hydro Reservoir & Elephant Corridor', desc: 'Concrete gravity dam surrounded by rolling tea plantations and mist-covered hills.', lat: 10.1064, lng: 77.1242, coordsText: '10.1064° N, 77.1242° E', audioText: 'Audio Guide (9m)' },
      { name: 'Top Station Nilgiri Overlook', shortName: 'Top Station', altTag: '● Stop #3 • 1,880m SUMMIT', status: 'Open till 6 PM', openStatus: '● Valley Clear', meta: '★ 4.7 • Highest Point on Munnar-Kodaikanal Ridge', desc: 'Historic terminus of the Kundala Valley Railway offering sweeping views of the Western Ghats.', lat: 10.1242, lng: 77.2444, coordsText: '10.1242° N, 77.2444° E', audioText: 'Audio Guide (11m)' },
      { name: 'Eravikulam National Park & Rajamalai', shortName: 'Eravikulam Park', altTag: '● Stop #4 • 1,750m SANCTUARY', status: 'Open till 4 PM', openStatus: '● Tahr Sighting High', meta: '★ 4.8 • Endangered Nilgiri Tahr Habitat', desc: 'Rolling shola-grassland high plateau crowned by the Anamudi peak, home to rare mountain goats.', lat: 10.1500, lng: 77.0600, coordsText: '10.1500° N, 77.0600° E', audioText: 'Audio Guide (12m)' },
    ],
  },
};

let currentMapInstance = null;
let currentMarkersGroup = null;
let currentRouteGroup = null;
let currentDistMarkersGroup = null;
let currentOverlaysGroup = null;

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
    if (d.includes('andaman')) return 'andaman';
    if (d.includes('coorg')) return 'coorg';
    if (d.includes('mussoorie')) return 'mussoorie';
    if (d.includes('nainital')) return 'nainital';
    if (d.includes('kodaikanal')) return 'kodaikanal';
    if (d.includes('darjeeling')) return 'darjeeling';
    if (d.includes('wayanad')) return 'wayanad';
    if (d.includes('gangtok')) return 'gangtok';
    return 'ooty';
  };

  let activeDestKey = getDestKey(selectedDestination);
  let activeFilter = 'Day 1 Route';
  let searchQuery = '';
  let activeCardIndex = 0;

  // Render Split-Pane DOM Shell
  container.innerHTML = `
    <div class="map-split-workspace">
      <!-- ── Left 42%: Sights Ledger & Itinerary Feed ── -->
      <aside class="map-ledger-pane" id="mapLedgerPane">
        <!-- Header -->
        <div class="map-ledger-header">
          <div class="map-header-top-row">
            <div class="relative">
              <button type="button" class="map-dest-dropdown-btn" id="btnDestPicker" aria-haspopup="true">
                <span class="text-xs text-[#C4703D]">📍</span>
                <span class="font-bold text-xs text-[#1C1C19]" id="lblActiveDestName">${escapeHtml(selectedDestination)}</span>
                <span class="material-symbols-outlined text-[14px] text-neutral-400">arrow_drop_down</span>
              </button>

              <!-- Dropdown destination menu -->
              <div class="map-dest-menu hidden" id="destPickerMenu">
                ${[
                  { name: 'Ooty', key: 'ooty' },
                  { name: 'Goa', key: 'goa' },
                  { name: 'Manali', key: 'manali' },
                  { name: 'Munnar', key: 'munnar' },
                  { name: 'Jaipur', key: 'jaipur' },
                  { name: 'Udaipur', key: 'udaipur' },
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
                    <span class="text-[9.5px] font-mono text-neutral-400">14 Sights</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="map-elevation-badge" id="destElevationBadge">
                <span class="material-symbols-outlined text-xs text-[#5B8C7B]">terrain</span>
                <span id="lblDestElevValue">2,240m avg</span>
              </div>
              <div class="map-index-tag" id="lblIndexCoords">INDEX: 11.41° / 76.69°</div>
            </div>
          </div>

          <!-- Headline -->
          <div class="map-destination-headline">
            <h2 class="map-dest-main-title" id="lblDestHeadline">Ooty, Queen of Hill Stations</h2>
            <p class="map-dest-sub-title" id="lblDestSubTitle">Nilgiris Expedition Ledger • 14 Curated Sights & High Passes</p>
          </div>

          <!-- Search Input -->
          <div class="map-ledger-search-box">
            <span class="material-symbols-outlined map-search-icon">search</span>
            <input type="text" id="mapSearchInput" placeholder="Search 14 sights, elevation, flora..." autocomplete="off" />
            <span class="map-search-cmd-k">⌘K</span>
          </div>
        </div>

        <!-- Filter Chips Bar -->
        <div class="map-ledger-filters" id="mapLedgerFiltersBar">
          <!-- Injected dynamically -->
        </div>

        <!-- Day 1 Circuit Summary Strip (Compact, Elegant) -->
        <div class="map-circuit-strip" id="mapCircuitStrip">
          <div class="map-circuit-strip-left" id="lblCircuitStripText">
            <span class="map-circuit-badge-label">🧭 Day 1 Circuit</span>
            <span>• 4 Stops</span>
            <span>• 18.4 km</span>
            <span>• ~4.5 hrs scenic drive & walk</span>
          </div>
          <button type="button" class="map-circuit-export-link" id="btnExportGpx">Export GPX</button>
        </div>

        <!-- Scrollable Sights Feed -->
        <div class="map-ledger-feed" id="mapLedgerFeed">
          <!-- Cards injected dynamically -->
        </div>
      </aside>

      <!-- ── Right 58%: Leaflet Map Canvas & HUD ── -->
      <main class="map-canvas-pane">
        <div id="fullScreenExpeditionMap" class="map-canvas-full"></div>

        <!-- Top Right Map HUD Controls -->
        <div class="map-canvas-hud">
          <div class="map-hud-segmented-card">
            <button type="button" class="map-segmented-btn active" data-layer="contours">Contours</button>
            <button type="button" class="map-segmented-btn" data-layer="satellite">Satellite</button>
            <button type="button" class="map-segmented-btn" data-layer="estate">Estate Wash</button>
          </div>

          <button type="button" class="map-compass-badge-btn" id="btnCompassRose" title="Compass Orientation">
            <span class="material-symbols-outlined text-base">explore</span>
          </button>
        </div>

        <!-- Bottom Map HUD Widgets (Scale Datum & Elevation Graph) -->
        <div class="map-canvas-bottom-hud">
          <!-- Left: Scale & Topo Relief Datum -->
          <div class="map-scale-datum-card">
            <div class="map-scale-bar-row">
              <span class="map-scale-ruler"></span>
              <span>1:25,000 Topo Relief</span>
            </div>
            <div class="map-datum-text" id="lblMapDatumText">
              Datum: GTS India 1878 • 11.4102° N, 76.6950° E
            </div>
          </div>

          <!-- Right: Mini Elevation Gradient Profile Card -->
          <div class="map-elevation-graph-card">
            <div class="map-elev-header-row">
              <span class="text-[#C4703D] flex items-center gap-1 font-bold">
                <span class="material-symbols-outlined text-xs">trending_up</span>
                <span>Elevation Gradient Profile</span>
              </span>
              <div class="flex items-center gap-1.5">
                <span class="elev-range" id="lblElevGraphRange">2,180m - 2,637m</span>
                <span class="material-symbols-outlined text-[13px] text-neutral-400 hover:text-neutral-700 cursor-pointer">open_in_full</span>
              </div>
            </div>
            <div class="map-elev-svg-container">
              <svg viewBox="0 0 240 36" class="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="elevGradientFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#5B8C7B" stop-opacity="0.32" />
                    <stop offset="100%" stop-color="#5B8C7B" stop-opacity="0.04" />
                  </linearGradient>
                </defs>
                <!-- SVG Area Curve -->
                <path d="M 0,34 L 10,24 Q 60,4 100,6 T 160,20 T 240,28 L 240,36 L 0,36 Z" fill="url(#elevGradientFill)" />
                <!-- SVG Stroke Curve -->
                <path d="M 0,34 L 10,24 Q 60,4 100,6 T 160,20 T 240,28" fill="none" stroke="#5B8C7B" stroke-width="1.8" stroke-linecap="round" />
                <!-- Peak Waypoint Dot (Doddabetta 2,637m) -->
                <circle cx="100" cy="6" r="3" fill="#C4703D" stroke="#FFFFFF" stroke-width="1.2" />
              </svg>
            </div>
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

  // Initialize Leaflet Map with CartoDB Positron (Warm museum-grade cartography)
  const map = L.map(mapElement, {
    center: [initialMeta.lat, initialMeta.lng],
    zoom: initialMeta.zoom,
    zoomControl: false,
    attributionControl: false,
  });
  currentMapInstance = map;

  // Place custom zoom controls
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Basemap Tile Layers (Zero watermark, zero API key, authentic topographic contours)
  const tileLayers = {
    contours: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri, DeLorme, NAVTEQ',
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri, DigitalGlobe',
    }),
    estate: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'National Geographic, Esri',
    }),
  };

  let activeTileLayer = tileLayers.contours;
  activeTileLayer.addTo(map);

  // Layer Switcher Buttons
  container.querySelectorAll('.map-segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layerType = btn.dataset.layer;
      if (!tileLayers[layerType]) return;

      container.querySelectorAll('.map-segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      map.removeLayer(activeTileLayer);
      activeTileLayer = tileLayers[layerType];
      activeTileLayer.addTo(map);
    });
  });

  currentMarkersGroup = L.layerGroup().addTo(map);
  currentRouteGroup = L.layerGroup().addTo(map);
  currentDistMarkersGroup = L.layerGroup().addTo(map);
  currentOverlaysGroup = L.layerGroup().addTo(map);

  // Update scale coordinates on move
  map.on('move', () => {
    const center = map.getCenter();
    const datumEl = document.getElementById('lblMapDatumText');
    if (datumEl) {
      datumEl.textContent = `Datum: GTS India 1878 • ${center.lat.toFixed(4)}° N, ${center.lng.toFixed(4)}° E`;
    }
  });

  // Safe Map Movement Helper
  function safeMoveMap(lat, lng, zoom = 14, duration = 0.8) {
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

  // Audio Guide function via SpeechSynthesis
  function playAudioGuide(place) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Now listening to the field audio guide for ${place.name}. ${place.description}. Located in ${selectedDestination}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Load and render destination data
  function loadDestinationData(destName, destKey) {
    activeDestKey = destKey;
    selectedDestination = destName;

    const destMeta = DESTINATION_META[destKey] || DESTINATION_META.ooty;
    const centerMeta = DESTINATION_CENTERS[destKey] || DESTINATION_CENTERS.ooty;

    // Update Header labels
    document.getElementById('lblActiveDestName').textContent = destName;
    document.getElementById('lblDestElevValue').textContent = destMeta.avgElev || '2,240m avg';
    document.getElementById('lblIndexCoords').textContent = `INDEX: ${destMeta.indexCoords || '11.41° / 76.69°'}`;
    document.getElementById('lblDestHeadline').textContent = destMeta.headline || `${destName}, Queen of Hill Stations`;
    document.getElementById('lblDestSubTitle').textContent = destMeta.ledgerSub || `Expedition Ledger • 14 Curated Sights`;
    document.getElementById('lblCircuitStripText').innerHTML = `
      <span class="map-circuit-badge-label">🧭 Day 1 Circuit</span>
      <span>• 4 Stops</span>
      <span>• 18.4 km</span>
      <span>• ~4.5 hrs scenic drive & walk</span>
    `;
    document.getElementById('lblElevGraphRange').textContent = destMeta.elevRange || '2,180m - 2,637m';

    // Smoothly fly map to destination center
    safeMoveMap(centerMeta.lat, centerMeta.lng, centerMeta.zoom || 13, 1.0);

    const allAttractions = CURATED_ATTRACTIONS[destKey] || CURATED_ATTRACTIONS.ooty;

    // Filter Chips: All 14, Day 1 Route (active), Day 2 Route, Categories
    const categories = [...new Set(allAttractions.map(a => a.category).filter(Boolean))].slice(0, 3);
    const filterItems = [
      { label: 'All 14', id: 'All' },
      { label: 'Day 1 Route', id: 'Day 1 Route' },
      { label: 'Day 2 Route', id: 'Day 2 Route' },
      ...categories.map(c => ({ label: c, id: c })),
    ];

    const filtersBar = document.getElementById('mapLedgerFiltersBar');
    if (filtersBar) {
      filtersBar.innerHTML = filterItems.map(item => `
        <button type="button" class="map-filter-pill ${item.id === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(item.id)}">
          ${escapeHtml(item.label)}
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
      currentMarkersGroup.clearLayers();
      currentRouteGroup.clearLayers();
      currentDistMarkersGroup.clearLayers();
      currentOverlaysGroup.clearLayers();

      // Retrieve Day 1 Curated Stops
      const day1Stops = destMeta.circuitStops || allAttractions.slice(0, 4);

      let displayedItems = [];
      let isDay1Mode = activeFilter === 'Day 1 Route' || activeFilter === 'Day 1';

      if (isDay1Mode) {
        displayedItems = day1Stops;
      } else if (activeFilter === 'Day 2 Route') {
        displayedItems = allAttractions.slice(4, 8);
      } else if (activeFilter === 'All' || activeFilter === 'All 14') {
        displayedItems = allAttractions;
      } else {
        displayedItems = allAttractions.filter(a => a.category === activeFilter);
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        displayedItems = displayedItems.filter(item =>
          item.name.toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.desc || item.description || '').toLowerCase().includes(q)
        );
      }

      // ── Topographic Water Overlays & Relief Circles (Ooty Lake & Doddabetta) ──
      if (activeDestKey === 'ooty') {
        // Soft Teal Ooty Lake polygon
        L.circle([11.4050, 76.6880], {
          radius: 650,
          color: '#5B8C7B',
          weight: 1.5,
          fillColor: '#5B8C7B',
          fillOpacity: 0.16,
        }).addTo(currentOverlaysGroup);

        // Elegant italic label inside Ooty Lake
        const lakeTextIcon = L.divIcon({
          className: 'map-lake-callout-icon',
          html: `<div class="map-lake-callout-text"><em>(Ooty Lake • 2,240m)</em></div>`,
          iconSize: [140, 22],
          iconAnchor: [70, 36],
        });
        L.marker([11.4050, 76.6880], { icon: lakeTextIcon, interactive: false }).addTo(currentOverlaysGroup);

        // Topo contour rings around Doddabetta Peak (at 11.3995, 76.7388)
        L.circle([11.3995, 76.7388], {
          radius: 1200,
          color: '#C4703D',
          weight: 1,
          dashArray: '4, 5',
          fillColor: '#5B8C7B',
          fillOpacity: 0.03,
        }).addTo(currentOverlaysGroup);

        L.circle([11.3995, 76.7388], {
          radius: 650,
          color: '#C4703D',
          weight: 1,
          dashArray: '3, 4',
          fillColor: '#5B8C7B',
          fillOpacity: 0.05,
        }).addTo(currentOverlaysGroup);

        // Topo peak label
        const doddabettaTextIcon = L.divIcon({
          className: 'map-topo-elevation-icon',
          html: `<div class="map-topo-elevation-text">DODDABETTA PEAK 2,637m</div>`,
          iconSize: [160, 20],
          iconAnchor: [80, 48],
        });
        L.marker([11.3995, 76.7388], { icon: doddabettaTextIcon, interactive: false }).addTo(currentOverlaysGroup);
      }

      // ── Terracotta Polyline Connecting Day 1 Stops in Natural Circuit Order ──
      // Geographical road order: Lake (4) -> Botanical Gardens (3) -> Tea Museum (1) -> Doddabetta Peak (2)
      let day1PolylineStops = day1Stops;
      let segmentDistances = ['3.4 km', '5.4 km', '6.8 km'];

      if (activeDestKey === 'ooty' && day1Stops.length >= 4) {
        day1PolylineStops = [day1Stops[3], day1Stops[2], day1Stops[0], day1Stops[1]];
        segmentDistances = ['5.4 km', '6.8 km'];
      }

      const day1Coords = day1PolylineStops
        .map(s => [Number(s.lat), Number(s.lng)])
        .filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]));

      if (day1Coords.length > 1) {
        L.polyline(day1Coords, {
          color: '#C4703D',
          weight: 3.5,
          opacity: 0.95,
          lineJoin: 'round',
        }).addTo(currentRouteGroup);

        // Segment distance badges on polyline
        for (let i = 0; i < day1Coords.length - 1; i++) {
          const distLabel = segmentDistances[i];
          if (!distLabel) continue;

          const p1 = day1Coords[i];
          const p2 = day1Coords[i + 1];
          const midLat = (p1[0] + p2[0]) / 2;
          const midLng = (p1[1] + p2[1]) / 2;

          const distIcon = L.divIcon({
            className: 'custom-dist-pill',
            html: `<div class="map-segment-distance-badge">${distLabel}</div>`,
            iconSize: [46, 20],
            iconAnchor: [23, 10],
          });
          L.marker([midLat, midLng], { icon: distIcon, interactive: false }).addTo(currentDistMarkersGroup);
        }
      }

      // ── Populate Left Ledger Feed ──
      const feedContainer = document.getElementById('mapLedgerFeed');
      const markerMap = new Map();

      if (feedContainer) {
        feedContainer.innerHTML = displayedItems.map((item, idx) => {
          const isStop1 = idx === 0 && isDay1Mode;
          let photoUrl = item.photo || `/images/attractions/ooty/tea-museum-4.jpg`;
          if (item.name && (item.name.includes('Tea Museum') || item.name.includes('Factory'))) {
            photoUrl = '/images/attractions/ooty/tea-museum-4.jpg';
          }
          const altTag = item.altTag || `● Stop #${idx + 1} • 2,240m ALT`;
          const statusText = item.status || 'Open till 6 PM';
          const metaText = item.meta || `★ ${item.rating || '4.6'} • Curated Landmark`;
          const descText = item.desc || item.description || '';
          const coordsText = item.coordsText || `${Number(item.lat).toFixed(4)}° N, ${Number(item.lng).toFixed(4)}° E`;
          const audioText = item.audioText || 'Audio Guide (14m)';

          return `
            <div class="map-card-wrapper" data-idx="${idx}">
              ${isStop1 ? `<div class="map-current-focus-tag">CURRENT FOCUS</div>` : ''}
              <div class="map-sight-card ${idx === activeCardIndex ? 'active' : ''}" data-idx="${idx}">
                <!-- Photo Banner -->
                <div class="map-card-photo-hero">
                  <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />
                  <span class="map-photo-tag-left">
                    <span class="tag-dot"></span>
                    <span>${escapeHtml(altTag)}</span>
                  </span>
                  <span class="map-photo-tag-right" data-action="audio">
                    <span class="material-symbols-outlined text-xs">headphones</span>
                    <span>${escapeHtml(audioText)}</span>
                  </span>
                </div>

                <!-- Title & Status -->
                <div class="map-card-title-row">
                  <h3 class="map-card-title">${escapeHtml(item.name)}</h3>
                  <span class="map-card-status-badge">${escapeHtml(statusText)}</span>
                </div>

                <!-- Rating & Meta -->
                <div class="map-card-meta-row">
                  <span>${escapeHtml(metaText)}</span>
                </div>

                <!-- Description -->
                <p class="map-card-desc">${escapeHtml(descText)}</p>

                <!-- Footer Actions -->
                <div class="map-card-footer">
                  <span class="map-card-coords">
                    <span class="material-symbols-outlined text-[11px]">location_on</span>
                    <span>${escapeHtml(coordsText)}</span>
                  </span>
                  <div class="map-card-actions">
                    <button type="button" class="map-btn-outline" data-action="directions">Directions</button>
                    <button type="button" class="map-btn-solid-terracotta" data-action="circuit">In Circuit ✓</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Card Click Interactions
        feedContainer.querySelectorAll('.map-sight-card').forEach(card => {
          const idx = parseInt(card.dataset.idx, 10);
          const item = displayedItems[idx];

          card.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="audio"]')) {
              playAudioGuide(item);
              return;
            }
            if (e.target.closest('[data-action="directions"]')) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
              window.open(url, '_blank');
              return;
            }

            activeCardIndex = idx;
            feedContainer.querySelectorAll('.map-sight-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (item && Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
              safeMoveMap(item.lat, item.lng, 14, 0.8);
              const marker = markerMap.get(idx);
              if (marker) marker.openPopup();
            }
          });
        });
      }

      // ── Plot Numbered Terracotta Waypoint Pins & Sleek Popover ──
      displayedItems.forEach((item, idx) => {
        const itemLat = Number(item.lat);
        const itemLng = Number(item.lng);
        if (!Number.isFinite(itemLat) || !Number.isFinite(itemLng)) return;

        const isStop1 = idx === 0 && isDay1Mode;
        let photoUrl = item.photo || `/images/attractions/ooty/tea-museum-4.jpg`;
        if (item.name && (item.name.includes('Tea Museum') || item.name.includes('Factory'))) {
          photoUrl = '/images/attractions/ooty/tea-museum-4.jpg';
        }
        const stopLabel = item.shortName || item.name;
        const altTag = item.altTag || `STOP #${idx + 1} • 2,240m`;
        const openStatus = item.openStatus || '● Tasting Open Now';

        // Terracotta Numbered Pin
        const pinHtml = `
          <div class="map-waypoint-pin ${isStop1 ? 'active' : ''}" id="waypointPin-${idx}">
            <div class="map-waypoint-bubble">${idx + 1}</div>
            <div class="map-waypoint-label">${escapeHtml(stopLabel)}</div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-waypoint-wrapper',
          html: pinHtml,
          iconSize: [48, 56],
          iconAnchor: [24, 28],
          popupAnchor: [0, -18],
        });

        // Sleek horizontal popover card (matching Stitch mockup)
        const popupHtml = `
          <div class="map-popover-card" data-idx="${idx}">
            <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.name)}" class="map-popover-thumb" />
            <div class="map-popover-info">
              <span class="map-popover-stop-tag">${escapeHtml(altTag.replace('● ', ''))}</span>
              <h4 class="map-popover-title">${escapeHtml(stopLabel)}</h4>
              <div class="map-popover-status">
                <span class="status-dot"></span>
                <span>${escapeHtml(openStatus.replace('● ', ''))}</span>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([itemLat, itemLng], { icon: customIcon })
          .bindPopup(popupHtml, {
            maxWidth: 240,
            minWidth: 220,
            autoPan: false, // Prevents aggressive panning that covers HUD
            offset: [0, -14],
          });

        marker.on('popupopen', () => {
          document.querySelectorAll('.map-waypoint-pin').forEach(p => p.classList.remove('active'));
          const pinEl = document.getElementById(`waypointPin-${idx}`);
          if (pinEl) pinEl.classList.add('active');
        });

        marker.on('popupclose', () => {
          const pinEl = document.getElementById(`waypointPin-${idx}`);
          if (pinEl) pinEl.classList.remove('active');
        });

        marker.on('click', () => {
          activeCardIndex = idx;
          const card = feedContainer?.querySelector(`.map-sight-card[data-idx="${idx}"]`);
          if (card) {
            feedContainer.querySelectorAll('.map-sight-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });

        marker.addTo(currentMarkersGroup);
        markerMap.set(idx, marker);

        // Open popover for Stop 1 automatically
        if (isStop1) {
          setTimeout(() => {
            marker.openPopup();
          }, 300);
        }
      });
    }

    renderFilteredFeed();

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }

  // ── Search Input Event ──
  const searchInput = document.getElementById('mapSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
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

  // Window Resize Invalidation
  const resizeHandler = () => {
    if (map) map.invalidateSize();
  };
  window.addEventListener('resize', resizeHandler);

  // Initial load
  loadDestinationData(selectedDestination, activeDestKey);
}
