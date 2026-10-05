/**
 * MapView.js — Full-Screen Interactive Geospatial Expedition Map
 * Powered by Leaflet.js with CartoDB Voyager tiles and custom photo-pin markers.
 * Renders verified attractions with embedded photography inside circular map pins.
 */

import L from 'leaflet';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Curated coordinate centers and photo fallbacks for supported destinations
const DESTINATION_CENTERS = {
  ooty: { lat: 11.4102, lng: 76.6950, zoom: 13, label: 'Ooty (Udhagamandalam)' },
  goa: { lat: 15.3500, lng: 73.8500, zoom: 11, label: 'Goa Coast & Heritage' },
  manali: { lat: 32.2432, lng: 77.1892, zoom: 13, label: 'Manali & Solang Valley' },
  jaipur: { lat: 26.9124, lng: 75.7873, zoom: 13, label: 'Jaipur Pink City' },
  udaipur: { lat: 24.5854, lng: 73.7125, zoom: 13, label: 'Udaipur City of Lakes' },
  munnar: { lat: 10.0889, lng: 77.0595, zoom: 13, label: 'Munnar Tea Highlands' },
  shimla: { lat: 31.1048, lng: 77.1734, zoom: 13, label: 'Shimla Ridge & Hills' },
  andaman: { lat: 11.6234, lng: 92.7265, zoom: 11, label: 'Andaman & Nicobar Islands' },
  coorg: { lat: 12.4244, lng: 75.7382, zoom: 12, label: 'Coorg (Kodagu)' },
  mussoorie: { lat: 30.4598, lng: 78.0644, zoom: 13, label: 'Mussoorie Queen of the Hills' },
  nainital: { lat: 29.3919, lng: 79.4542, zoom: 13, label: 'Nainital Lake District' },
  kodaikanal: { lat: 10.2381, lng: 77.4892, zoom: 13, label: 'Kodaikanal Princess of Hill Stations' },
  darjeeling: { lat: 27.0410, lng: 88.2663, zoom: 13, label: 'Darjeeling Queen of the Himalayas' },
  wayanad: { lat: 11.6854, lng: 76.1320, zoom: 12, label: 'Wayanad Green Paradise' },
  gangtok: { lat: 27.3389, lng: 88.6065, zoom: 13, label: 'Gangtok & Sikkim Himalayas' },
};

import { CURATED_ATTRACTIONS } from '../data/AttractionsData.js';

let currentMapInstance = null;
let currentMarkersGroup = null;

export function renderMapView(container, { switchView, store }) {
  const { trip = {} } = store.getState();
  let selectedDestination = (trip.destination || 'Ooty').trim();

  // Normalize destination key
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

  container.innerHTML = `
    <div class="map-workspace-container">
      <!-- Full-Screen Map Surface -->
      <div id="fullScreenExpeditionMap" class="map-canvas-full"></div>

      <!-- Glassmorphic Header Overlay -->
      <header class="map-glass-header">
        <div class="map-glass-card flex items-center gap-3">
          <button id="btnMapReturnToChat" class="map-return-btn" title="Back to Itinerary Planner">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Planner</span>
          </button>
          <div class="h-5 w-[1px] bg-[#BFA895]/40"></div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5B8C7B] bg-[#5B8C7B]/10 px-2 py-0.5 rounded-full">INTERACTIVE PHOTO MAP</span>
              <span class="text-[10px] text-neutral-500 font-mono" id="mapPinCountBadge">Loading sights...</span>
            </div>
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 font-headline-md tracking-tight" id="mapHeaderTitle">
              Tourist Attractions in ${escapeHtml(selectedDestination)}
            </h2>
          </div>
        </div>

        <!-- Map Style Layer Switcher & City Switcher Pills -->
        <div class="flex items-center gap-2 pointer-events-auto">
          <!-- Layer Switcher -->
          <div class="map-glass-card py-1.5 px-2 flex items-center">
            <div class="map-layer-selector" id="mapLayerSelector">
              <button type="button" class="map-layer-btn active" data-layer="voyager" title="Vibrant CartoDB Voyager">
                <span class="material-symbols-outlined text-xs">palette</span>
                <span class="hidden sm:inline">Vibrant</span>
              </button>
              <button type="button" class="map-layer-btn" data-layer="satellite" title="Esri Satellite">
                <span class="material-symbols-outlined text-xs">satellite_alt</span>
                <span class="hidden sm:inline">Satellite</span>
              </button>
            </div>
          </div>

          <!-- City Switcher Pills -->
          <div class="map-glass-card hidden md:flex items-center gap-1.5 overflow-x-auto max-w-xl scrollbar-none" id="mapDestBar">
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
              <button type="button" class="map-city-pill ${c.key === activeDestKey ? 'active' : ''}" data-dest="${c.name}" data-key="${c.key}">
                ${c.name}
              </button>
            `).join('')}
          </div>
        </div>
      </header>

      <!-- Bottom Attractions Drawer / Strip -->
      <div class="map-bottom-tray">
        <div class="map-glass-card py-2 px-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
              EXPLORE ATTRACTIONS WITH HIGH-RES PHOTO GALLERIES
            </span>
            <span class="text-[10px] text-neutral-500 font-mono">Click a pin or card for photo gallery</span>
          </div>
          <div class="map-attraction-carousel" id="mapAttractionCarousel">
            <!-- Thumb cards injected dynamically -->
          </div>
        </div>
      </div>

      <!-- Photo Gallery Modal Overlay Container -->
      <div id="mapPhotoGalleryModal" class="hidden"></div>
    </div>
  `;

  // Destroy previous map instance if existing
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

  // Place zoom control at top right (below header)
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Basemap Tile Layers: crisp, colorful, high-saturation layers with zero watermark or API key
  const tileLayers = {
    voyager: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors, Humanitarian Team',
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
    }),
  };

  // Add default vibrant voyager layer
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

  // Photo Gallery Modal Viewer
  function openPhotoGalleryModal(place, initialIdx = 0) {
    const modalContainer = document.getElementById('mapPhotoGalleryModal');
    if (!modalContainer) return;

    const photos = place.photos && place.photos.length > 0 ? place.photos : [place.photo];
    let currentPhotoIdx = initialIdx;

    function renderModalContent() {
      modalContainer.innerHTML = `
        <div class="gallery-modal-overlay" id="galleryOverlayBackdrop">
          <div class="gallery-modal-card" id="galleryCardContent">
            <button class="gallery-modal-close" id="btnCloseGalleryModal" aria-label="Close photo gallery">
              <span class="material-symbols-outlined text-base">close</span>
            </button>

            <!-- Main High-Res Viewer -->
            <div class="gallery-hero-viewer">
              <img id="galleryMainImg" src="${escapeHtml(photos[currentPhotoIdx])}" alt="${escapeHtml(place.name)}" />
              
              ${photos.length > 1 ? `
                <button class="gallery-nav-btn gallery-nav-prev" id="btnGalleryPrev" aria-label="Previous photo">
                  <span class="material-symbols-outlined text-base">arrow_back</span>
                </button>
                <button class="gallery-nav-btn gallery-nav-next" id="btnGalleryNext" aria-label="Next photo">
                  <span class="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ` : ''}

              <!-- Image counter badge -->
              <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20">
                ${currentPhotoIdx + 1} / ${photos.length} Photos
              </div>

              <!-- Category badge -->
              <div class="absolute bottom-3 left-3 bg-[#C4703D] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                ${escapeHtml(place.category || 'Tourist Attraction')}
              </div>
            </div>

            <!-- Horizontal Thumbnails Strip -->
            ${photos.length > 1 ? `
              <div class="gallery-thumbnails-strip">
                ${photos.map((p, pIdx) => `
                  <button type="button" class="gallery-thumb-btn ${pIdx === currentPhotoIdx ? 'active' : ''}" data-pidx="${pIdx}">
                    <img src="${escapeHtml(p)}" alt="Thumbnail ${pIdx + 1}" loading="lazy" />
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <!-- Body Details -->
            <div class="gallery-info-body">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-neutral-900 font-headline-md">${escapeHtml(place.name)}</h3>
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
                <button id="btnZoomToPlaceFromGallery" class="px-3.5 py-1.5 bg-[#8b4513] text-white rounded-xl text-xs font-bold hover:bg-[#703810] flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">my_location</span>
                  <span>Center On Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      modalContainer.classList.remove('hidden');

      // Bind close handlers
      document.getElementById('btnCloseGalleryModal')?.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
      });
      document.getElementById('galleryOverlayBackdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'galleryOverlayBackdrop') {
          modalContainer.classList.add('hidden');
        }
      });

      // Bind prev/next navigation
      document.getElementById('btnGalleryPrev')?.addEventListener('click', () => {
        currentPhotoIdx = (currentPhotoIdx - 1 + photos.length) % photos.length;
        renderModalContent();
      });
      document.getElementById('btnGalleryNext')?.addEventListener('click', () => {
        currentPhotoIdx = (currentPhotoIdx + 1) % photos.length;
        renderModalContent();
      });

      // Thumbnail clicks
      modalContainer.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentPhotoIdx = parseInt(btn.dataset.pidx, 10);
          renderModalContent();
        });
      });

      // Center on Map Button
      document.getElementById('btnZoomToPlaceFromGallery')?.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
        map.flyTo([place.lat, place.lng], 16, { duration: 1.0 });
      });
    }

    renderModalContent();
  }

  // Load and plot attractions for a given destination
  async function loadDestinationAttractions(destName, destKey) {
    activeDestKey = destKey;
    const titleEl = document.getElementById('mapHeaderTitle');
    const badgeEl = document.getElementById('mapPinCountBadge');
    if (titleEl) titleEl.textContent = `Tourist Attractions in ${destName}`;
    if (badgeEl) badgeEl.textContent = 'Loading sights...';

    // Highlight current city pill
    container.querySelectorAll('.map-city-pill').forEach(btn => {
      if (btn.dataset.key === destKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const meta = DESTINATION_CENTERS[destKey] || DESTINATION_CENTERS.ooty;
    map.flyTo([meta.lat, meta.lng], meta.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    // Clear existing markers
    currentMarkersGroup.clearLayers();

    // Use full curated set (14 verified sights per destination with multi-photos and accurate coordinates)
    const attractions = CURATED_ATTRACTIONS[destKey] || CURATED_ATTRACTIONS.ooty;

    if (badgeEl) badgeEl.textContent = `${attractions.length} verified attractions`;

    // Map of marker instances for carousel syncing
    const markerMap = new Map();

    // Render Bottom Carousel Cards
    const carousel = document.getElementById('mapAttractionCarousel');
    if (carousel) {
      carousel.innerHTML = attractions.map((item, idx) => `
        <div class="map-attraction-thumb-card" data-idx="${idx}" data-lat="${item.lat}" data-lng="${item.lng}">
          <div class="h-20 w-full overflow-hidden bg-neutral-200 relative">
            <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover" loading="lazy" />
            <span class="absolute top-1.5 right-1.5 bg-[#C4703D] text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full shadow-xs">
              ★ ${item.rating}
            </span>
            <span class="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[10px]">photo_library</span>
              <span>${(item.photos || []).length || 1}</span>
            </span>
          </div>
          <div class="p-2">
            <h4 class="text-xs font-bold text-neutral-900 truncate">${escapeHtml(item.name)}</h4>
            <p class="text-[9.5px] text-neutral-500 font-mono capitalize truncate">${escapeHtml(item.category)}</p>
          </div>
        </div>
      `).join('');

      carousel.querySelectorAll('.map-attraction-thumb-card').forEach(card => {
        card.addEventListener('click', () => {
          const lat = parseFloat(card.dataset.lat);
          const lng = parseFloat(card.dataset.lng);
          const idx = parseInt(card.dataset.idx, 10);
          map.flyTo([lat, lng], 15, { duration: 0.8 });
          const marker = markerMap.get(idx);
          if (marker) marker.openPopup();

          carousel.querySelectorAll('.map-attraction-thumb-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        });
      });
    }

    // Plot Photo Pins on the Map
    attractions.forEach((item, idx) => {
      const pinIconHtml = `
        <div class="photo-pin-container" title="${escapeHtml(item.name)}">
          <div class="photo-pin-bubble">
            <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" class="photo-pin-img" onerror="this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'" />
            <div class="photo-pin-badge">★${item.rating}</div>
          </div>
          <div class="photo-pin-pointer"></div>
          <div class="photo-pin-label">${escapeHtml(item.name)}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-photo-pin-wrapper',
        html: pinIconHtml,
        iconSize: [52, 74],
        iconAnchor: [26, 68],
        popupAnchor: [0, -68],
      });

      const photoCount = (item.photos && item.photos.length > 0) ? item.photos.length : 1;

      const popupHtml = `
        <div class="attraction-popup-card cursor-pointer" data-card-idx="${idx}">
          <div class="attraction-popup-hero group cursor-pointer" data-gallery-idx="${idx}">
            <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" />
            <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
              <span class="material-symbols-outlined text-xs">photo_library</span>
              <span>${photoCount} Photos</span>
            </div>
            <div class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
              <span class="material-symbols-outlined text-sm">fullscreen</span>
              <span>View Gallery</span>
            </div>
          </div>
          <div class="attraction-popup-body">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C4703D]">${escapeHtml(item.category)}</span>
              <span class="text-[10px] font-bold text-neutral-800">★ ${item.rating}</span>
            </div>
            <h3 class="text-xs font-bold text-neutral-900 mb-1 leading-snug">${escapeHtml(item.name)}</h3>
            <p class="text-[10.5px] text-neutral-600 line-clamp-2 leading-relaxed mb-2">${escapeHtml(item.description)}</p>
            <div class="pt-2 border-t border-[#BFA895]/20 flex items-center justify-between">
              <button class="popup-gallery-trigger text-[10.5px] font-bold text-[#8b4513] hover:underline flex items-center gap-1 cursor-pointer" data-idx="${idx}">
                <span class="material-symbols-outlined text-xs">photo_library</span>
                <span>See More Images</span>
              </button>
              <button class="popup-focus-btn text-[10px] font-bold text-[#5B8C7B] hover:underline cursor-pointer" data-lat="${item.lat}" data-lng="${item.lng}">
                Zoom Closer
              </button>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .bindPopup(popupHtml, { maxWidth: 280, minWidth: 260 });

      marker.on('click', () => {
        // Highlight corresponding thumb card in bottom carousel
        const card = carousel?.querySelector(`.map-attraction-thumb-card[data-idx="${idx}"]`);
        if (card) {
          carousel.querySelectorAll('.map-attraction-thumb-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      marker.on('popupopen', () => {
        // Attach gallery triggers inside Leaflet popup DOM
        const popupEl = marker.getPopup()?.getElement();
        if (popupEl) {
          // Whole popup card or hero or button click opens gallery modal
          const popupCard = popupEl.querySelector('.attraction-popup-card');
          if (popupCard) {
            popupCard.addEventListener('click', (e) => {
              // If user clicked specifically on "Zoom Closer", don't open modal
              if (e.target.closest('.popup-focus-btn')) {
                return;
              }
              openPhotoGalleryModal(item, 0);
            });
          }

          popupEl.querySelector('.popup-focus-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo([item.lat, item.lng], 16, { duration: 0.6 });
          });
        }
      });

      marker.addTo(currentMarkersGroup);
      markerMap.set(idx, marker);
    });

    // Invalidate map size after DOM settling to ensure full container coverage
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }

  // City Switcher Listeners
  container.querySelectorAll('.map-city-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const destName = btn.dataset.dest;
      const destKey = btn.dataset.key;
      loadDestinationAttractions(destName, destKey);
    });
  });

  // Return to Chat Planner Listener
  document.getElementById('btnMapReturnToChat')?.addEventListener('click', () => {
    switchView('chat');
  });

  // Initial load
  loadDestinationAttractions(selectedDestination, activeDestKey);
}
