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
  gangtok: { lat: 27.3389, lng: 88.6065, zoom: 13, label: 'Gangtok & Sikkim Ridge' },
};

// Curated Destination Options with Geographic Regions and Elevations
const DESTINATION_OPTIONS = [
  { name: 'Ooty', key: 'ooty', region: 'Nilgiri Hills', elev: '2,240m' },
  { name: 'Goa', key: 'goa', region: 'Konkan Coast', elev: '15m' },
  { name: 'Manali', key: 'manali', region: 'Kullu Valley', elev: '2,050m' },
  { name: 'Munnar', key: 'munnar', region: 'High Range Tea', elev: '1,532m' },
  { name: 'Jaipur', key: 'jaipur', region: 'Pink City', elev: '431m' },
  { name: 'Udaipur', key: 'udaipur', region: 'City of Lakes', elev: '598m' },
  { name: 'Shimla', key: 'shimla', region: 'Himachal Ridge', elev: '2,206m' },
  { name: 'Andaman', key: 'andaman', region: 'Emerald Islands', elev: '10m' },
  { name: 'Coorg', key: 'coorg', region: 'Coffee Country', elev: '1,170m' },
  { name: 'Mussoorie', key: 'mussoorie', region: 'Garhwal Queen', elev: '2,005m' },
  { name: 'Nainital', key: 'nainital', region: 'Kumaon Lakes', elev: '2,084m' },
  { name: 'Kodaikanal', key: 'kodaikanal', region: 'Princess of Hills', elev: '2,133m' },
  { name: 'Darjeeling', key: 'darjeeling', region: 'Queen of Hills', elev: '2,042m' },
  { name: 'Wayanad', key: 'wayanad', region: 'Rainforest Hills', elev: '700m' },
  { name: 'Gangtok', key: 'gangtok', region: 'Sikkim Heights', elev: '1,650m' },
];

// Rich destination editorial headlines and curated Day 1 circuit stop sequences
const DESTINATION_META = {
  ooty: {
    headline: 'Ooty, Queen of Hill Stations',
    avgElev: '2,240m avg',
    elevRange: '2,180m - 2,637m',
    circuitDistance: '18.4 km',
    circuitDuration: '~4.5 hrs scenic drive & walk',
    peakLabel: 'Doddabetta Peak 2,637m',
    peakDot: { x: 100, y: 6 },
    svgArea: 'M 0,34 L 10,24 Q 60,4 100,6 T 160,20 T 240,28 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,34 L 10,24 Q 60,4 100,6 T 160,20 T 240,28',
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
        photo: '/images/attractions/ooty/tea-museum-1.jpg',
        photos: [
          '/images/attractions/ooty/tea-museum-1.jpg',
          '/images/attractions/ooty/tea-museum-2.jpg',
          '/images/attractions/ooty/tea-museum-3.jpg',
          '/images/attractions/ooty/tea-museum-4.jpg',
          '/images/attractions/ooty/tea-museum-5.jpg',
          '/images/attractions/ooty/tea-museum-6.jpg',
        ],
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
        photo: '/images/attractions/ooty/doddabetta-peak-1.jpg',
        photos: [
          '/images/attractions/ooty/doddabetta-peak-1.jpg',
          '/images/attractions/ooty/doddabetta-peak-2.jpg',
          '/images/attractions/ooty/doddabetta-peak-3.jpg',
          '/images/attractions/ooty/doddabetta-peak-4.jpg',
          '/images/attractions/ooty/doddabetta-peak-5.jpg',
          '/images/attractions/ooty/doddabetta-peak-6.jpg',
        ],
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
        photo: '/images/attractions/ooty/botanical-gardens-1.jpg',
        photos: [
          '/images/attractions/ooty/botanical-gardens-1.jpg',
          '/images/attractions/ooty/botanical-gardens-2.jpg',
          '/images/attractions/ooty/botanical-gardens-3.jpg',
          '/images/attractions/ooty/botanical-gardens-4.jpg',
          '/images/attractions/ooty/botanical-gardens-5.jpg',
          '/images/attractions/ooty/botanical-gardens-6.jpg',
        ],
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
        photo: '/images/attractions/ooty/ooty-lake-1.jpg',
        photos: [
          '/images/attractions/ooty/ooty-lake-1.jpg',
          '/images/attractions/ooty/ooty-lake-2.jpg',
          '/images/attractions/ooty/ooty-lake-3.jpg',
          '/images/attractions/ooty/ooty-lake-4.jpg',
          '/images/attractions/ooty/ooty-lake-5.jpg',
          '/images/attractions/ooty/ooty-lake-6.jpg',
        ],
      },
    ],
  },
  goa: {
    headline: 'Goa, Sun-Kissed Coast & Heritage',
    avgElev: '15m avg',
    elevRange: '5m - 55m',
    circuitDistance: '26.2 km',
    circuitDuration: '~5.0 hrs coastal drive',
    peakLabel: 'Chapora Fort 55m',
    peakDot: { x: 190, y: 16 },
    svgArea: 'M 0,32 Q 50,30 90,32 T 150,26 Q 190,16 210,22 T 240,30 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,32 Q 50,30 90,32 T 150,26 Q 190,16 210,22 T 240,30',
    circuitStops: [
      {
        name: 'Fort Aguada & Lighthouse',
        shortName: 'Fort Aguada',
        altTag: '● Stop #1 • 42m BASTION',
        status: 'Open till 6 PM',
        openStatus: '● Lighthouse Open',
        meta: '★ 4.7 • 17th Century Portuguese Citadel',
        desc: 'Preserved Portuguese coastal bastion overlooking Sinquerim and Arabian Sea horizons.',
        lat: 15.4920,
        lng: 73.7735,
        photo: '/images/attractions/goa/aguada-fort-1.jpg',
        photos: [
          '/images/attractions/goa/aguada-fort-1.jpg',
          '/images/attractions/goa/aguada-fort-2.jpg',
          '/images/attractions/goa/aguada-fort-3.jpg',
          '/images/attractions/goa/aguada-fort-4.jpg',
          '/images/attractions/goa/aguada-fort-5.jpg',
          '/images/attractions/goa/aguada-fort-6.jpg',
        ],
      },
      {
        name: 'Basilica of Bom Jesus',
        shortName: 'Bom Jesus Basilica',
        altTag: '● Stop #2 • 18m HERITAGE',
        status: 'Open till 5:30 PM',
        openStatus: '● Sanctuary Open',
        meta: '★ 4.8 • UNESCO World Heritage Site',
        desc: 'Baroque architecture enshrining the mortal remains of St. Francis Xavier.',
        lat: 15.5008,
        lng: 73.9116,
        photo: '/images/attractions/goa/basilica-bom-jesus-1.jpg',
        photos: [
          '/images/attractions/goa/basilica-bom-jesus-1.jpg',
          '/images/attractions/goa/basilica-bom-jesus-2.jpg',
          '/images/attractions/goa/basilica-bom-jesus-3.jpg',
          '/images/attractions/goa/basilica-bom-jesus-4.jpg',
          '/images/attractions/goa/basilica-bom-jesus-5.jpg',
          '/images/attractions/goa/basilica-bom-jesus-6.jpg',
        ],
      },
      {
        name: 'Anjuna Beach & Flea Market',
        shortName: 'Anjuna Beach',
        altTag: '● Stop #3 • 5m COAST',
        status: 'Open 24 Hours',
        openStatus: '● Sunset Point',
        meta: '★ 4.5 • Red Laterite Cliffs & Shacks',
        desc: 'Curved shoreline framed by coconut groves, laterite crags, and boho artisan markets.',
        lat: 15.5828,
        lng: 73.7438,
        photo: '/images/attractions/goa/anjuna-beach-1.jpg',
        photos: [
          '/images/attractions/goa/anjuna-beach-1.jpg',
          '/images/attractions/goa/anjuna-beach-2.jpg',
          '/images/attractions/goa/anjuna-beach-3.jpg',
          '/images/attractions/goa/anjuna-beach-4.jpg',
          '/images/attractions/goa/anjuna-beach-5.jpg',
          '/images/attractions/goa/anjuna-beach-6.jpg',
        ],
      },
      {
        name: 'Chapora Fort & Sunset Viewpoint',
        shortName: 'Chapora Fort',
        altTag: '● Stop #4 • 55m RIDGE',
        status: 'Open till 6:30 PM',
        openStatus: '● Sunset Prime',
        meta: '★ 4.6 • Vagator Bay Panoramic Bastion',
        desc: 'Historic red stone ramparts famous for dramatic twilight ocean horizons.',
        lat: 15.6058,
        lng: 73.7368,
        photo: '/images/attractions/goa/chapora-fort-1.jpg',
        photos: [
          '/images/attractions/goa/chapora-fort-1.jpg',
          '/images/attractions/goa/chapora-fort-2.jpg',
          '/images/attractions/goa/chapora-fort-3.jpg',
          '/images/attractions/goa/chapora-fort-4.jpg',
          '/images/attractions/goa/chapora-fort-5.jpg',
          '/images/attractions/goa/chapora-fort-6.jpg',
        ],
      },
    ],
  },
  manali: {
    headline: 'Manali, Valley of the Gods',
    avgElev: '2,050m avg',
    elevRange: '2,050m - 3,978m',
    circuitDistance: '22.8 km',
    circuitDuration: '~5.5 hrs alpine circuit',
    peakLabel: 'Rohtang Pass 3,978m',
    peakDot: { x: 145, y: 4 },
    svgArea: 'M 0,32 Q 40,26 80,18 L 115,12 Q 145,4 175,14 L 210,22 L 240,16 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,32 Q 40,26 80,18 L 115,12 Q 145,4 175,14 L 210,22 L 240,16',
    circuitStops: [
      {
        name: 'Hadimba Devi Temple',
        shortName: 'Hadimba Temple',
        altTag: '● Stop #1 • 2,060m SHRINE',
        status: 'Open till 6 PM',
        openStatus: '● Forest Open',
        meta: '★ 4.7 • 1553 AD Pagoda Timber Sanctuary',
        desc: 'Four-tiered wooden pagoda temple set within ancient towering deodar pine cedar forests.',
        lat: 32.2483,
        lng: 77.1696,
        photo: '/images/attractions/manali/hadimba-temple-1.jpg',
        photos: [
          '/images/attractions/manali/hadimba-temple-1.jpg',
          '/images/attractions/manali/hadimba-temple-2.jpg',
          '/images/attractions/manali/hadimba-temple-3.jpg',
          '/images/attractions/manali/hadimba-temple-4.jpg',
          '/images/attractions/manali/hadimba-temple-5.jpg',
          '/images/attractions/manali/hadimba-temple-6.jpg',
        ],
      },
      {
        name: 'Solang Valley Adventure Point',
        shortName: 'Solang Valley',
        altTag: '● Stop #2 • 2,560m MEADOW',
        status: 'Open till 6 PM',
        openStatus: '● Cable Car Active',
        meta: '★ 4.6 • Glacial Meadow & Paragliding',
        desc: 'Expansive glacial basin offering year-round adventure sports and snow-capped peak views.',
        lat: 32.3167,
        lng: 77.1583,
        photo: '/images/attractions/manali/solang-valley-1.jpg',
        photos: [
          '/images/attractions/manali/solang-valley-1.jpg',
          '/images/attractions/manali/solang-valley-2.jpg',
          '/images/attractions/manali/solang-valley-3.jpg',
          '/images/attractions/manali/solang-valley-4.jpg',
          '/images/attractions/manali/solang-valley-5.jpg',
          '/images/attractions/manali/solang-valley-6.jpg',
        ],
      },
      {
        name: 'Jogini Waterfalls & Vashisht Trek',
        shortName: 'Jogini Falls',
        altTag: '● Stop #3 • 2,140m CASCADE',
        status: 'Daylight Access',
        openStatus: '● Trail Clear',
        meta: '★ 4.8 • Sacred Cascades & Apple Orchards',
        desc: 'Picturesque pine trail ascending to multiple cascading streams over granite cliffs.',
        lat: 32.2683,
        lng: 77.1925,
        photo: '/images/attractions/manali/jogini-waterfalls-1.jpg',
        photos: [
          '/images/attractions/manali/jogini-waterfalls-1.jpg',
          '/images/attractions/manali/jogini-waterfalls-2.jpg',
          '/images/attractions/manali/jogini-waterfalls-3.jpg',
          '/images/attractions/manali/jogini-waterfalls-4.jpg',
          '/images/attractions/manali/jogini-waterfalls-5.jpg',
          '/images/attractions/manali/jogini-waterfalls-6.jpg',
        ],
      },
      {
        name: 'Old Manali Village & Manu Temple',
        shortName: 'Old Manali Village',
        altTag: '● Stop #4 • 2,050m HERITAGE',
        status: 'Open till 8 PM',
        openStatus: '● Cafes Open',
        meta: '★ 4.6 • Stone & Timber Himalayan Architecture',
        desc: 'Narrow flagstone alleyways lined with traditional Himachali houses and bakeries.',
        lat: 32.2542,
        lng: 77.1750,
        photo: '/images/attractions/manali/manu-temple-1.jpg',
        photos: [
          '/images/attractions/manali/manu-temple-1.jpg',
          '/images/attractions/manali/manu-temple-2.jpg',
          '/images/attractions/manali/manu-temple-3.jpg',
          '/images/attractions/manali/manu-temple-4.jpg',
          '/images/attractions/manali/manu-temple-5.jpg',
          '/images/attractions/manali/manu-temple-6.jpg',
        ],
      },
    ],
  },
  munnar: {
    headline: 'Munnar, High Range Tea Realm',
    avgElev: '1,532m avg',
    elevRange: '1,520m - 2,695m',
    circuitDistance: '21.6 km',
    circuitDuration: '~5.0 hrs highland route',
    peakLabel: 'Anamudi Peak 2,695m',
    peakDot: { x: 120, y: 5 },
    svgArea: 'M 0,30 Q 30,22 65,18 T 120,5 Q 160,12 195,22 T 240,26 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,30 Q 30,22 65,18 T 120,5 Q 160,12 195,22 T 240,26',
    circuitStops: [
      {
        name: 'Tata Tea Museum & Factory',
        shortName: 'Tata Tea Museum',
        altTag: '● Stop #1 • 1,520m ALT',
        status: 'Open till 5 PM',
        openStatus: '● Rollers Active',
        meta: '★ 4.6 • Century-Old Tea Processing Machinery',
        desc: 'Live demonstration of Orthodox and CTC tea manufacturing with original Kundale valley artifacts.',
        lat: 10.0880,
        lng: 77.0580,
        photo: '/images/attractions/munnar/tea-museum-1.jpg',
        photos: [
          '/images/attractions/munnar/tea-museum-1.jpg',
          '/images/attractions/munnar/tea-museum-2.jpg',
          '/images/attractions/munnar/tea-museum-3.jpg',
          '/images/attractions/munnar/tea-museum-4.jpg',
          '/images/attractions/munnar/tea-museum-5.jpg',
          '/images/attractions/munnar/tea-museum-6.jpg',
        ],
      },
      {
        name: 'Mattupetty Dam & Lake',
        shortName: 'Mattupetty Dam',
        altTag: '● Stop #2 • 1,700m BASIN',
        status: 'Open till 5:30 PM',
        openStatus: '● Speedboats Active',
        meta: '★ 4.5 • Hydro Reservoir & Elephant Corridor',
        desc: 'Concrete gravity dam surrounded by rolling tea plantations and mist-covered hills.',
        lat: 10.1064,
        lng: 77.1242,
        photo: '/images/attractions/munnar/mattupetty-dam-1.jpg',
        photos: [
          '/images/attractions/munnar/mattupetty-dam-1.jpg',
          '/images/attractions/munnar/mattupetty-dam-2.jpg',
          '/images/attractions/munnar/mattupetty-dam-3.jpg',
          '/images/attractions/munnar/mattupetty-dam-4.jpg',
          '/images/attractions/munnar/mattupetty-dam-5.jpg',
          '/images/attractions/munnar/mattupetty-dam-6.jpg',
        ],
      },
      {
        name: 'Top Station Nilgiri Overlook',
        shortName: 'Top Station',
        altTag: '● Stop #3 • 1,880m SUMMIT',
        status: 'Open till 6 PM',
        openStatus: '● Valley Clear',
        meta: '★ 4.7 • Highest Point on Munnar-Kodaikanal Ridge',
        desc: 'Historic terminus of the Kundala Valley Railway offering sweeping views of the Western Ghats.',
        lat: 10.1242,
        lng: 77.2444,
        photo: '/images/attractions/munnar/top-station-1.jpg',
        photos: [
          '/images/attractions/munnar/top-station-1.jpg',
          '/images/attractions/munnar/top-station-2.jpg',
          '/images/attractions/munnar/top-station-3.jpg',
          '/images/attractions/munnar/top-station-4.jpg',
          '/images/attractions/munnar/top-station-5.jpg',
          '/images/attractions/munnar/top-station-6.jpg',
        ],
      },
      {
        name: 'Eravikulam National Park & Rajamalai',
        shortName: 'Eravikulam Park',
        altTag: '● Stop #4 • 1,750m SANCTUARY',
        status: 'Open till 4 PM',
        openStatus: '● Tahr Sighting High',
        meta: '★ 4.8 • Endangered Nilgiri Tahr Habitat',
        desc: 'Rolling shola-grassland high plateau crowned by the Anamudi peak, home to rare mountain goats.',
        lat: 10.1500,
        lng: 77.0600,
        photo: '/images/attractions/munnar/eravikulam-national-park-1.jpg',
        photos: [
          '/images/attractions/munnar/eravikulam-national-park-1.jpg',
          '/images/attractions/munnar/eravikulam-national-park-2.jpg',
          '/images/attractions/munnar/eravikulam-national-park-3.jpg',
          '/images/attractions/munnar/eravikulam-national-park-4.jpg',
          '/images/attractions/munnar/eravikulam-national-park-5.jpg',
          '/images/attractions/munnar/eravikulam-national-park-6.jpg',
        ],
      },
    ],
  },
  jaipur: {
    headline: 'Jaipur, Pink City & Aravalli Citadels',
    avgElev: '431m avg',
    elevRange: '431m - 648m',
    circuitDistance: '19.8 km',
    circuitDuration: '~4.2 hrs royal heritage circuit',
    peakLabel: 'Nahargarh Ridge 648m',
    peakDot: { x: 160, y: 12 },
    svgArea: 'M 0,32 L 40,30 Q 90,28 120,20 L 160,12 Q 185,16 210,24 L 240,28 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,32 L 40,30 Q 90,28 120,20 L 160,12 Q 185,16 210,24 L 240,28',
  },
  udaipur: {
    headline: 'Udaipur, City of Lakes & Palaces',
    avgElev: '598m avg',
    elevRange: '580m - 930m',
    circuitDistance: '17.2 km',
    circuitDuration: '~4.0 hrs lakefront tour',
    peakLabel: 'Monsoon Palace 930m',
    peakDot: { x: 80, y: 8 },
    svgArea: 'M 0,34 L 35,26 Q 55,14 80,8 L 115,22 Q 160,28 200,24 L 240,30 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,34 L 35,26 Q 55,14 80,8 L 115,22 Q 160,28 200,24 L 240,30',
  },
  shimla: {
    headline: 'Shimla, Pine Ridges & Mall Road',
    avgElev: '2,206m avg',
    elevRange: '2,100m - 2,454m',
    circuitDistance: '15.6 km',
    circuitDuration: '~4.8 hrs mountain circuit',
    peakLabel: 'Jakhoo Hill 2,454m',
    peakDot: { x: 130, y: 6 },
    svgArea: 'M 0,30 Q 40,22 85,15 L 130,6 Q 165,14 200,20 L 240,24 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,30 Q 40,22 85,15 L 130,6 Q 165,14 200,20 L 240,24',
  },
  andaman: {
    headline: 'Andaman, Coral Lagoons & Islands',
    avgElev: '10m avg',
    elevRange: '0m - 732m',
    circuitDistance: '24.5 km',
    circuitDuration: '~5.2 hrs coastal trail',
    peakLabel: 'Saddle Peak 732m',
    peakDot: { x: 170, y: 15 },
    svgArea: 'M 0,34 Q 45,33 80,31 T 140,24 Q 170,15 195,22 T 240,32 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,34 Q 45,33 80,31 T 140,24 Q 170,15 195,22 T 240,32',
  },
  coorg: {
    headline: 'Coorg, Mist-Veiled Coffee Country',
    avgElev: '1,170m avg',
    elevRange: '900m - 1,748m',
    circuitDistance: '21.0 km',
    circuitDuration: '~4.6 hrs plantation drive',
    peakLabel: 'Tadiandamol Peak 1,748m',
    peakDot: { x: 110, y: 7 },
    svgArea: 'M 0,32 Q 35,24 75,18 L 110,7 Q 150,15 185,22 L 240,26 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,32 Q 35,24 75,18 L 110,7 Q 150,15 185,22 L 240,26',
  },
  mussoorie: {
    headline: 'Mussoorie, Queen of the Garhwal Hills',
    avgElev: '2,005m avg',
    elevRange: '1,880m - 2,290m',
    circuitDistance: '16.4 km',
    circuitDuration: '~4.4 hrs scenic hill tour',
    peakLabel: 'Lal Tibba 2,290m',
    peakDot: { x: 150, y: 6 },
    svgArea: 'M 0,33 Q 45,26 90,19 L 125,12 Q 150,6 185,16 L 240,24 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,33 Q 45,26 90,19 L 125,12 Q 150,6 185,16 L 240,24',
  },
  nainital: {
    headline: 'Nainital, Lake District of Kumaon',
    avgElev: '2,084m avg',
    elevRange: '1,938m - 2,615m',
    circuitDistance: '14.8 km',
    circuitDuration: '~4.2 hrs lake & viewpoint circuit',
    peakLabel: 'Naina Peak 2,615m',
    peakDot: { x: 95, y: 5 },
    svgArea: 'M 0,31 L 30,22 Q 60,12 95,5 L 140,18 Q 185,26 215,22 L 240,28 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,31 L 30,22 Q 60,12 95,5 L 140,18 Q 185,26 215,22 L 240,28',
  },
  kodaikanal: {
    headline: 'Kodaikanal, Princess of Hill Stations',
    avgElev: '2,133m avg',
    elevRange: '2,000m - 2,517m',
    circuitDistance: '18.2 km',
    circuitDuration: '~4.5 hrs shola forest trail',
    peakLabel: 'Vandaravu Peak 2,517m',
    peakDot: { x: 125, y: 6 },
    svgArea: 'M 0,33 Q 40,25 80,18 L 125,6 Q 160,14 195,20 L 240,25 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,33 Q 40,25 80,18 L 125,6 Q 160,14 195,20 L 240,25',
  },
  darjeeling: {
    headline: 'Darjeeling, Queen of the Himalayas',
    avgElev: '2,042m avg',
    elevRange: '2,042m - 2,590m',
    circuitDistance: '17.6 km',
    circuitDuration: '~4.7 hrs tea & toy train route',
    peakLabel: 'Tiger Hill 2,590m',
    peakDot: { x: 105, y: 5 },
    svgArea: 'M 0,34 L 25,24 Q 65,10 105,5 L 155,16 Q 190,22 220,18 L 240,26 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,34 L 25,24 Q 65,10 105,5 L 155,16 Q 190,22 220,18 L 240,26',
  },
  wayanad: {
    headline: 'Wayanad, Rainforests & Waterfalls',
    avgElev: '700m avg',
    elevRange: '700m - 2,100m',
    circuitDistance: '25.0 km',
    circuitDuration: '~5.3 hrs ghats expedition',
    peakLabel: 'Chembra Peak 2,100m',
    peakDot: { x: 140, y: 6 },
    svgArea: 'M 0,32 Q 40,26 80,20 L 110,12 Q 140,6 170,16 L 210,24 L 240,28 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,32 Q 40,26 80,20 L 110,12 Q 140,6 170,16 L 210,24 L 240,28',
  },
  gangtok: {
    headline: 'Gangtok, Monasteries & Sikkim Heights',
    avgElev: '1,650m avg',
    elevRange: '1,650m - 4,310m',
    circuitDistance: '28.0 km',
    circuitDuration: '~5.8 hrs mountain pass route',
    peakLabel: 'Nathu La Pass 4,310m',
    peakDot: { x: 155, y: 4 },
    svgArea: 'M 0,34 L 35,26 Q 80,18 120,11 L 155,4 Q 185,12 215,20 L 240,25 L 240,36 L 0,36 Z',
    svgStroke: 'M 0,34 L 35,26 Q 80,18 120,11 L 155,4 Q 185,12 215,20 L 240,25',
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
  let updateActiveFocusCircle = null;
  let activeRenderFilteredFeed = null;
  const destinationCircuitSets = new Map();

  function getOrderedCircuitStops(destKey, circuitSet, attractions) {
    if (!circuitSet) return [];
    const seenNames = new Set();
    const activeStops = [];
    (attractions || []).forEach(a => {
      if (circuitSet.has(a.name) && !seenNames.has(a.name)) {
        seenNames.add(a.name);
        activeStops.push(a);
      }
    });

    if (destKey === 'ooty') {
      const ootyOrder = [
        'Ooty Lake & Boathouse',
        'Government Botanical Gardens',
        'Tea Museum & Dodabetta Tea Factory',
        'Doddabetta Peak & Observatory'
      ];
      return activeStops.sort((a, b) => {
        const idxA = ootyOrder.indexOf(a.name);
        const idxB = ootyOrder.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }
    const metaStops = DESTINATION_META[destKey]?.circuitStops;
    if (metaStops && metaStops.length > 0) {
      const orderNames = metaStops.map(s => s.name);
      return activeStops.sort((a, b) => {
        const idxA = orderNames.indexOf(a.name);
        const idxB = orderNames.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }
    return activeStops;
  }

  // Render Split-Pane DOM Shell
  container.innerHTML = `
    <div class="map-split-workspace">
      <!-- Gooey Search SVG Metablobs Filter -->
      <svg class="sr-only" aria-hidden="true" style="position: absolute; width: 0; height: 0; pointer-events: none;">
        <defs>
          <filter id="map-gooey-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 19 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <!-- ── Left 42%: Sights Ledger & Itinerary Feed ── -->
      <aside class="map-ledger-pane" id="mapLedgerPane">
        <!-- Header -->
        <div class="map-ledger-header">
          <div class="map-header-top-row">
            <div class="relative">
              <button type="button" class="map-dest-dropdown-btn" id="btnDestPicker" aria-haspopup="true" aria-expanded="false" title="Switch Destination Circuit">
                <span class="map-dest-pin-badge">
                  <span class="material-symbols-outlined text-[13px]">location_on</span>
                </span>
                <div class="map-dest-btn-text">
                  <span class="map-dest-btn-sub">Destination</span>
                  <span class="map-dest-btn-title" id="lblActiveDestName">${escapeHtml(selectedDestination)}</span>
                </div>
                <span class="material-symbols-outlined map-dest-btn-arrow">expand_more</span>
              </button>

              <!-- Prominently Highlighted Destination Menu Popover -->
              <div class="map-dest-menu hidden" id="destPickerMenu">
                <div class="map-dest-menu-header">
                  <div class="map-dest-menu-header-title">
                    <span class="material-symbols-outlined text-xs text-[#C4703D]">travel_explore</span>
                    <span>Curated Circuits</span>
                  </div>
                  <span class="map-dest-menu-badge">15 Regions</span>
                </div>
                <div class="map-dest-menu-list">
                  ${DESTINATION_OPTIONS.map(c => `
                    <button type="button" class="map-dest-option ${c.key === activeDestKey ? 'active' : ''}" data-name="${c.name}" data-key="${c.key}">
                      <div class="map-dest-opt-left">
                        <span class="map-dest-opt-name">${c.name}</span>
                        <span class="map-dest-opt-sub">${c.region}</span>
                      </div>
                      <div class="map-dest-opt-right">
                        <span class="map-dest-opt-elev">${c.elev}</span>
                        ${c.key === activeDestKey ? '<span class="material-symbols-outlined text-[13px] font-bold text-white">check</span>' : ''}
                      </div>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <div class="map-elevation-badge" id="destElevationBadge" title="Average Destination Elevation">
                <span class="material-symbols-outlined text-[11px] text-[#5B8C7B]">terrain</span>
                <span id="lblDestElevValue">2,240m avg</span>
              </div>
            </div>
          </div>

          <!-- Headline -->
          <div class="map-destination-headline">
            <h2 class="map-dest-main-title" id="lblDestHeadline">Ooty, Queen of Hill Stations</h2>
          </div>

          <!-- Gooey Search Animated Input -->
          <div class="map-gooey-search-wrapper" id="mapGooeySearchWrapper">
            <!-- Gooey Liquid Metablobs Stage (SVG filtered shapes) -->
            <div class="map-gooey-liquid-stage" aria-hidden="true">
              <div class="map-gooey-base-capsule"></div>
              <div class="map-gooey-satellite-orb" id="mapGooeyOrb"></div>
            </div>

            <!-- Crisp Foreground UI (Zero blur on typography/icons) -->
            <div class="map-ledger-search-box">
              <span class="material-symbols-outlined map-search-icon" id="mapSearchIcon">search</span>
              <input type="text" id="mapSearchInput" placeholder="Search 14 sights, elevation, flora..." autocomplete="off" />
              <button type="button" class="map-search-clear-btn" id="mapSearchClearBtn" title="Clear search" style="display: none;">
                <span class="material-symbols-outlined text-[13px]">close</span>
              </button>
              <span class="map-search-cmd-k" id="mapSearchCmdK">⌘K</span>
              <div class="map-gooey-satellite-badge" id="mapGooeySatelliteBadge" title="Click to clear or search">
                <span class="material-symbols-outlined text-[14px] text-white">travel_explore</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Chips Bar -->
        <div class="map-ledger-filters" id="mapLedgerFiltersBar">
          <!-- Injected dynamically -->
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
          </div>

          <button type="button" class="map-compass-badge-btn" id="btnCompassRose" title="Compass Orientation">
            <span class="material-symbols-outlined text-base">explore</span>
          </button>
        </div>

        <!-- Bottom Map HUD Widgets (Elevation Graph) -->
        <div class="map-canvas-bottom-hud">
          <!-- Right: Mini Elevation Gradient Profile Card -->
          <div class="map-elevation-graph-card">
            <div class="map-elev-header-row">
              <span class="text-[#C4703D] flex items-center gap-1 font-bold">
                <span class="material-symbols-outlined text-xs">trending_up</span>
                <span>Elevation Gradient Profile</span>
              </span>
              <div class="flex items-center gap-1.5">
                <span class="elev-range" id="lblElevGraphRange">2,180m - 2,637m</span>
                <span class="material-symbols-outlined text-[13px] text-neutral-400 hover:text-neutral-700 cursor-pointer" id="btnExpandElevation" title="View Detailed Elevation Profile">open_in_full</span>
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
                <!-- Dynamic SVG Area Curve -->
                <path id="svgElevArea" d="M 0,34 L 10,24 Q 60,4 100,6 T 160,20 T 240,28 L 240,36 L 0,36 Z" fill="url(#elevGradientFill)" />
                <!-- Dynamic SVG Stroke Curve -->
                <path id="svgElevStroke" d="M 0,34 L 10,24 Q 60,4 100,6 T 160,20 T 240,28" fill="none" stroke="#5B8C7B" stroke-width="1.8" stroke-linecap="round" />
                <!-- Peak Waypoint Dot -->
                <circle id="svgElevPeakDot" cx="100" cy="6" r="3" fill="#C4703D" stroke="#FFFFFF" stroke-width="1.2" />
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

  // Helper to guarantee 100% authentic multi-photo resolution for every attraction
  function resolveItemWithPhotos(item, destKey) {
    const destAttractions = CURATED_ATTRACTIONS[destKey] || CURATED_ATTRACTIONS.ooty || [];
    const itemNorm = (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortNorm = (item.shortName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const matched = destAttractions.find(a => {
      if (item.id && a.id === item.id) return true;
      const aNorm = (a.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (aNorm === itemNorm) return true;
      if (shortNorm && (aNorm.includes(shortNorm) || shortNorm.includes(aNorm))) return true;
      if (itemNorm && (aNorm.includes(itemNorm) || itemNorm.includes(aNorm))) return true;
      return false;
    });

    let photos = [];
    if (matched && Array.isArray(matched.photos) && matched.photos.length > 0) {
      photos = matched.photos;
    } else if (Array.isArray(item.photos) && item.photos.length > 0) {
      photos = item.photos;
    } else if (item.photo) {
      const m = item.photo.match(/^(.*\/)([^\/]+)-(\d+)\.jpg$/);
      if (m) {
        const base = m[1] + m[2];
        photos = [1, 2, 3, 4, 5, 6].map(num => `${base}-${num}.jpg`);
      } else {
        photos = [item.photo];
      }
    } else if (matched && matched.photo) {
      photos = [matched.photo];
    }

    return {
      ...(matched || {}),
      ...item,
      photo: photos[0] || item.photo || (matched && matched.photo) || '/images/attractions/ooty/tea-museum-1.jpg',
      photos: photos.length > 0 ? photos : [item.photo || (matched && matched.photo) || '/images/attractions/ooty/tea-museum-1.jpg'],
      category: item.category || (matched && matched.category) || 'Curated Landmark',
      rating: item.rating || (matched && matched.rating) || 4.7,
      description: item.desc || item.description || (matched && matched.description) || '',
    };
  }

  // Multi-Photo Gallery Modal (Authentic high-resolution carousel with thumbnails & keyboard nav)
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

    const closeModal = () => {
      modalContainer.classList.add('hidden');
      window.removeEventListener('keydown', handleKeyNav);
    };

    const handleKeyNav = (e) => {
      if (modalContainer.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft') updateGallerySlide(currentPhotoIdx - 1);
      else if (e.key === 'ArrowRight') updateGallerySlide(currentPhotoIdx + 1);
    };

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
                <button type="button" class="gallery-thumb-btn ${pIdx === currentPhotoIdx ? 'active' : ''}" data-pidx="${pIdx}" title="View photo ${pIdx + 1}">
                  <img src="${escapeHtml(p)}" alt="Thumbnail ${pIdx + 1}" loading="lazy" />
                </button>
              `).join('')}
            </div>
          ` : ''}

          <div class="gallery-info-body">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-[#1E3A34] font-headline-md">${escapeHtml(place.name)}</h3>
                <p class="text-xs text-neutral-600 font-mono mt-0.5">${escapeHtml(place.formattedAddress || `${Number(place.lat).toFixed(4)}° N, ${Number(place.lng).toFixed(4)}° E`)}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="bg-[#5B8C7B]/15 text-[#2E4433] text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-[#5B8C7B]/30">
                  ★ ${place.rating || 4.7} Rating
                </span>
              </div>
            </div>
            <p class="text-xs text-neutral-700 leading-relaxed my-2">${escapeHtml(place.description)}</p>
            <div class="pt-3 border-t border-[#BFA895]/25 flex items-center justify-between">
              <span class="text-[10px] font-mono text-neutral-500">Verified Trailmate Landmark (${photos.length} photos)</span>
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
    window.addEventListener('keydown', handleKeyNav);

    document.getElementById('btnCloseGalleryModal')?.addEventListener('click', closeModal);
    document.getElementById('galleryOverlayBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'galleryOverlayBackdrop') closeModal();
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
      closeModal();
      safeMoveMap(place.lat, place.lng, 15, 0.8);
      updateActiveFocusCircle?.(place);
    });
  }

  // Load and render destination data
  function loadDestinationData(destName, destKey) {
    activeDestKey = destKey;
    selectedDestination = destName;
    activeCardIndex = 0;

    const destMeta = DESTINATION_META[destKey] || DESTINATION_META.ooty;
    const centerMeta = DESTINATION_CENTERS[destKey] || DESTINATION_CENTERS.ooty;

    // Update Header labels
    const lblActiveDestName = document.getElementById('lblActiveDestName');
    if (lblActiveDestName) lblActiveDestName.textContent = destName;

    const lblDestElevValue = document.getElementById('lblDestElevValue');
    if (lblDestElevValue) lblDestElevValue.textContent = destMeta.avgElev || '2,240m avg';

    const lblDestHeadline = document.getElementById('lblDestHeadline');
    if (lblDestHeadline) lblDestHeadline.textContent = destMeta.headline || `${destName}, Queen of Hill Stations`;


    const lblElevGraphRange = document.getElementById('lblElevGraphRange');
    if (lblElevGraphRange) lblElevGraphRange.textContent = destMeta.elevRange || '2,180m - 2,637m';

    // Update Elevation Profile SVG curve and peak waypoint dot
    const svgArea = document.getElementById('svgElevArea');
    const svgStroke = document.getElementById('svgElevStroke');
    const svgPeakDot = document.getElementById('svgElevPeakDot');
    if (svgArea && destMeta.svgArea) svgArea.setAttribute('d', destMeta.svgArea);
    if (svgStroke && destMeta.svgStroke) svgStroke.setAttribute('d', destMeta.svgStroke);
    if (svgPeakDot && destMeta.peakDot) {
      svgPeakDot.setAttribute('cx', destMeta.peakDot.x);
      svgPeakDot.setAttribute('cy', destMeta.peakDot.y);
      if (destMeta.peakLabel) svgPeakDot.setAttribute('title', destMeta.peakLabel);
    }

    // Smoothly fly map to destination center
    safeMoveMap(centerMeta.lat, centerMeta.lng, centerMeta.zoom || 13, 1.0);

    const allAttractions = CURATED_ATTRACTIONS[destKey] || CURATED_ATTRACTIONS.ooty;
    const defaultCircuitStops = destMeta.circuitStops || allAttractions.slice(0, 4);
    const combinedAttractions = [...defaultCircuitStops, ...allAttractions];

    if (!destinationCircuitSets.has(destKey)) {
      destinationCircuitSets.set(destKey, new Set(defaultCircuitStops.map(s => s.name)));
    }
    const activeCircuitSet = destinationCircuitSets.get(destKey);

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
          activeCardIndex = 0;
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

      // Ensure every attraction has authentic photos resolved
      displayedItems = displayedItems.map(item => resolveItemWithPhotos(item, activeDestKey));

      activeRenderFilteredFeed = renderFilteredFeed;

      // ── Persistent Focus Reticle with Jitter-Free Dissolve & Re-emerge Lifecycle ──
      let focusCircleInstance = null;
      let focusTransitionTimer = null;
      let focusMoveEndHandler = null;
      let activeFocusKey = null;

      function updateSelectedAttractionCircle(selectedItem, instant = false) {
        if (!selectedItem) return;
        const targetLat = Number(selectedItem.lat);
        const targetLng = Number(selectedItem.lng);
        if (!Number.isFinite(targetLat) || !Number.isFinite(targetLng)) return;

        const targetKey = `${targetLat.toFixed(5)},${targetLng.toFixed(5)}`;

        // If circle doesn't exist yet, instantiate it at target coordinate
        if (!focusCircleInstance || !currentOverlaysGroup.hasLayer(focusCircleInstance)) {
          currentOverlaysGroup.clearLayers();
          focusCircleInstance = L.circle([targetLat, targetLng], {
            radius: 550,
            color: '#5B8C7B',
            weight: 1.5,
            fillColor: '#5B8C7B',
            fillOpacity: 0.16,
            interactive: false,
            className: 'map-selected-focus-circle',
          }).addTo(currentOverlaysGroup);
          activeFocusKey = targetKey;
          return;
        }

        // Clean up any ongoing transition or event listeners
        if (focusTransitionTimer) {
          clearTimeout(focusTransitionTimer);
          focusTransitionTimer = null;
        }
        if (focusMoveEndHandler) {
          map.off('moveend', focusMoveEndHandler);
          focusMoveEndHandler = null;
        }

        const el = focusCircleInstance.getElement();

        // If already at target coordinate and currently visible, no-op
        if (activeFocusKey === targetKey && el && !el.classList.contains('circle-hidden')) {
          return;
        }

        const startLatLng = focusCircleInstance.getLatLng();
        const dist = Math.hypot(targetLat - startLatLng.lat, targetLng - startLatLng.lng);

        // Instant repositioning (initial load, or cross-city destination switch)
        if (instant || dist > 1.0) {
          activeFocusKey = targetKey;
          focusCircleInstance.setLatLng([targetLat, targetLng]);
          if (el) el.classList.remove('circle-hidden');
          return;
        }

        activeFocusKey = targetKey;

        // If element is not in DOM for some reason, just set coordinates
        if (!el) {
          focusCircleInstance.setLatLng([targetLat, targetLng]);
          return;
        }

        // 1. Immediately dissolve (fade out) at old landmark (180ms)
        el.classList.add('circle-hidden');

        // Determine if map camera is going to move significantly
        let willFly = false;
        try {
          const mapCenter = map.getCenter();
          const currentZoom = map.getZoom();
          const targetZoom = 14;
          const centerDistMeters = mapCenter.distanceTo([targetLat, targetLng]);
          willFly = centerDistMeters > 80 || Math.abs(currentZoom - targetZoom) > 0.5;
        } catch {
          willFly = false;
        }

        const revealAtNewLandmark = () => {
          if (focusTransitionTimer) {
            clearTimeout(focusTransitionTimer);
            focusTransitionTimer = null;
          }
          if (focusMoveEndHandler) {
            map.off('moveend', focusMoveEndHandler);
            focusMoveEndHandler = null;
          }

          // Silently set target coordinate while completely hidden
          focusCircleInstance.setLatLng([targetLat, targetLng]);

          // Wait one RAF frame so Leaflet post-settle DOM projection is complete
          requestAnimationFrame(() => {
            // Only reveal if this is still the active target
            if (activeFocusKey === targetKey) {
              el.classList.remove('circle-hidden');
            }
          });
        };

        if (willFly) {
          // Fade out takes 180ms. While fading / faded, wait for map camera to settle.
          focusMoveEndHandler = () => {
            revealAtNewLandmark();
          };
          map.once('moveend', focusMoveEndHandler);

          // Fallback safety timer in case moveend doesn't fire or map was cancelled
          focusTransitionTimer = setTimeout(() => {
            revealAtNewLandmark();
          }, 700);
        } else {
          // Stationary or micro-move: fade out (180ms), reposition silently, then fade in
          focusTransitionTimer = setTimeout(() => {
            revealAtNewLandmark();
          }, 180);
        }
      }
      updateActiveFocusCircle = updateSelectedAttractionCircle;

      // Initialize focus circle on active attraction
      const initialSelectedItem = displayedItems[activeCardIndex] || displayedItems[0];
      if (initialSelectedItem) {
        updateSelectedAttractionCircle(initialSelectedItem, true);
      }

      // ── Dynamic Terracotta Polyline Connecting Active Circuit Stops ──
      function redrawCircuitPolylineAndTelemetry() {
        currentRouteGroup.clearLayers();
        currentDistMarkersGroup.clearLayers();

        const orderedStops = getOrderedCircuitStops(activeDestKey, activeCircuitSet, combinedAttractions);
        const coords = orderedStops
          .map(s => [Number(s.lat), Number(s.lng)])
          .filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]));

        let totalDistKm = 0;

        if (coords.length > 1) {
          L.polyline(coords, {
            color: '#C4703D',
            weight: 3.5,
            opacity: 0.95,
            lineJoin: 'round',
          }).addTo(currentRouteGroup);

          // Segment distance badges on polyline
          for (let i = 0; i < coords.length - 1; i++) {
            const p1 = coords[i];
            const p2 = coords[i + 1];
            const segDistMeters = L.latLng(p1[0], p1[1]).distanceTo(L.latLng(p2[0], p2[1]));
            const roadDistKm = (segDistMeters * 1.38) / 1000;
            totalDistKm += roadDistKm;

            const distLabel = `${roadDistKm.toFixed(1)} km`;
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


        // Update waypoint pin styles to reflect active circuit membership
        displayedItems.forEach((it, idx) => {
          const pinEl = document.getElementById(`waypointPin-${idx}`);
          if (pinEl) {
            const inCircuit = activeCircuitSet.has(it.name);
            pinEl.classList.toggle('in-circuit', inCircuit);
            pinEl.classList.toggle('out-of-circuit', !inCircuit);
          }
        });
      }

      // ── Populate Left Ledger Feed ──
      const feedContainer = document.getElementById('mapLedgerFeed');
      const markerMap = new Map();

      if (feedContainer) {
        if (displayedItems.length === 0) {
          feedContainer.innerHTML = `
            <div class="map-empty-feed">
              <span class="material-symbols-outlined map-empty-icon">search_off</span>
              <h4 class="map-empty-title">No matching sights found</h4>
              <p class="map-empty-desc">No landmarks match "${escapeHtml(searchQuery)}" in ${escapeHtml(selectedDestination)}.</p>
              <button type="button" class="map-empty-clear-btn" id="btnClearMapSearch">Clear Search</button>
            </div>
          `;
          feedContainer.querySelector('#btnClearMapSearch')?.addEventListener('click', () => {
            searchQuery = '';
            const sInput = document.getElementById('mapSearchInput');
            if (sInput) sInput.value = '';
            renderFilteredFeed();
          });
          return;
        }

        feedContainer.innerHTML = displayedItems.map((item, idx) => {
          const isStop1 = idx === 0 && isDay1Mode;
          const photos = item.photos && item.photos.length > 0 ? item.photos : [item.photo];
          const photoCount = photos.length;
          const photoUrl = photos[0];
          const altTag = item.altTag || `● Stop #${idx + 1} • ${destMeta.avgElev.replace(' avg', '')} ALT`;
          const statusText = item.status || 'Open till 6 PM';
          const metaText = item.meta || `★ ${item.rating || '4.6'} • Curated Landmark`;
          const descText = item.desc || item.description || '';
          const categoryTag = item.category || 'Curated Landmark';

          return `
            <div class="map-card-wrapper" data-idx="${idx}">
              <div class="map-sight-card ${idx === activeCardIndex ? 'active' : ''}" data-idx="${idx}">
                <!-- Photo Banner with Inline Slider & Fullscreen Gallery Trigger -->
                <div class="map-card-photo-hero" data-action="open-gallery" title="Click to view all ${photoCount} photos">
                  <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.name)}" class="map-card-hero-img" loading="lazy" data-current-idx="0" />
                  <span class="map-photo-tag-left">
                    <span class="tag-dot"></span>
                    <span>${escapeHtml(altTag)}</span>
                  </span>
                  <button type="button" class="map-photo-tag-right map-photo-gallery-badge" data-action="open-gallery" title="View all ${photoCount} photos">
                    <span class="material-symbols-outlined text-[13px]">photo_library</span>
                    <span>${photoCount} Photos</span>
                  </button>
                  ${photoCount > 1 ? `
                    <button type="button" class="map-card-slide-nav map-card-slide-prev" data-action="slide-prev" title="Previous photo" aria-label="Previous photo">
                      <span class="material-symbols-outlined text-[13px]">chevron_left</span>
                    </button>
                    <button type="button" class="map-card-slide-nav map-card-slide-next" data-action="slide-next" title="Next photo" aria-label="Next photo">
                      <span class="material-symbols-outlined text-[13px]">chevron_right</span>
                    </button>
                    <div class="map-card-slide-dots">
                      ${photos.slice(0, 6).map((_, pIdx) => `
                        <span class="map-card-slide-dot ${pIdx === 0 ? 'active' : ''}" data-dot-idx="${pIdx}"></span>
                      `).join('')}
                    </div>
                  ` : ''}
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
                  <span class="map-card-tag-pill">
                    <span class="material-symbols-outlined text-[11px]">local_activity</span>
                    <span>${escapeHtml(categoryTag)}</span>
                  </span>
                  <div class="map-card-actions">
                    <button type="button" class="${activeCircuitSet.has(item.name) ? 'map-btn-solid-terracotta' : 'map-btn-outline'}" data-action="circuit">${activeCircuitSet.has(item.name) ? 'In Circuit ✓' : 'Add to Circuit +'}</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Card Click & Carousel Interactions
        feedContainer.querySelectorAll('.map-sight-card').forEach(card => {
          const idx = parseInt(card.dataset.idx, 10);
          const item = displayedItems[idx];
          const photos = item.photos || [item.photo];
          let currentCardPhotoIdx = 0;

          const heroImg = card.querySelector('.map-card-hero-img');
          const dots = card.querySelectorAll('.map-card-slide-dot');

          const updateCardSlide = (newIdx) => {
            currentCardPhotoIdx = (newIdx + photos.length) % photos.length;
            if (heroImg) {
              heroImg.src = photos[currentCardPhotoIdx];
              heroImg.dataset.currentIdx = currentCardPhotoIdx;
            }
            dots.forEach((dot, dIdx) => {
              dot.classList.toggle('active', dIdx === currentCardPhotoIdx);
            });
          };

          card.addEventListener('click', (e) => {
            // Slide Prev button on hero
            if (e.target.closest('[data-action="slide-prev"]')) {
              e.stopPropagation();
              updateCardSlide(currentCardPhotoIdx - 1);
              return;
            }

            // Slide Next button on hero
            if (e.target.closest('[data-action="slide-next"]')) {
              e.stopPropagation();
              updateCardSlide(currentCardPhotoIdx + 1);
              return;
            }

            // Open Fullscreen Photo Gallery Modal
            if (e.target.closest('[data-action="open-gallery"]') || e.target.closest('.map-card-photo-hero')) {
              e.stopPropagation();
              openPhotoGalleryModal(item, currentCardPhotoIdx);
              return;
            }


            // Circuit toggle
            if (e.target.closest('[data-action="circuit"]')) {
              e.stopPropagation();
              const btn = e.target.closest('[data-action="circuit"]');
              if (!btn || !item) return;

              const isCurrentlyIn = activeCircuitSet.has(item.name);
              if (isCurrentlyIn) {
                activeCircuitSet.delete(item.name);
                btn.textContent = 'Add to Circuit +';
                btn.classList.remove('map-btn-solid-terracotta');
                btn.classList.add('map-btn-outline');
              } else {
                activeCircuitSet.add(item.name);
                btn.textContent = 'In Circuit ✓';
                btn.classList.add('map-btn-solid-terracotta');
                btn.classList.remove('map-btn-outline');
              }

              redrawCircuitPolylineAndTelemetry();
              return;
            }

            // Select card and center map
            activeCardIndex = idx;
            feedContainer.querySelectorAll('.map-sight-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (item && Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
              updateSelectedAttractionCircle(item);
              safeMoveMap(item.lat, item.lng, 14, 0.65);
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
        const inCircuit = activeCircuitSet.has(item.name);
        const photos = item.photos && item.photos.length > 0 ? item.photos : [item.photo];
        const photoUrl = photos[0];
        const stopLabel = item.shortName || item.name;
        const altTag = item.altTag || `STOP #${idx + 1} • ${destMeta.avgElev.replace(' avg', '')}`;
        const openStatus = item.openStatus || '● Open Today';

        // Terracotta Numbered Pin
        const pinHtml = `
          <div class="map-waypoint-pin ${isStop1 ? 'active' : ''} ${inCircuit ? 'in-circuit' : 'out-of-circuit'}" id="waypointPin-${idx}">
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

        // Sleek horizontal popover card with photo counter badge and gallery button
        const popupHtml = `
          <div class="map-popover-card" data-idx="${idx}">
            <div class="map-popover-thumb-wrap" data-action="open-popover-gallery" title="View all ${photos.length} photos">
              <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.name)}" class="map-popover-thumb" />
              <span class="map-popover-photo-pill">
                <span class="material-symbols-outlined text-[9px]">photo_library</span>
                <span>${photos.length}</span>
              </span>
            </div>
            <div class="map-popover-info">
              <span class="map-popover-stop-tag">${escapeHtml(altTag.replace('● ', ''))}</span>
              <h4 class="map-popover-title">${escapeHtml(stopLabel)}</h4>
              <div class="map-popover-status">
                <span class="status-dot"></span>
                <span>${escapeHtml(openStatus.replace('● ', ''))}</span>
              </div>
              <button type="button" class="map-popover-gallery-btn" data-action="open-popover-gallery">
                <span class="material-symbols-outlined text-[10px]">photo_library</span>
                <span>View ${photos.length} Photos →</span>
              </button>
            </div>
          </div>
        `;

        const marker = L.marker([itemLat, itemLng], { icon: customIcon })
          .bindPopup(popupHtml, {
            maxWidth: 250,
            minWidth: 220,
            autoPan: false, // Prevents aggressive panning that covers HUD
            offset: [0, -14],
          });

        marker.on('popupopen', (e) => {
          activeCardIndex = idx;
          updateSelectedAttractionCircle(item);
          document.querySelectorAll('.map-waypoint-pin').forEach(p => p.classList.remove('active'));
          const pinEl = document.getElementById(`waypointPin-${idx}`);
          if (pinEl) pinEl.classList.add('active');

          const popupEl = e.popup?.getElement();
          if (popupEl) {
            popupEl.querySelectorAll('[data-action="open-popover-gallery"]').forEach(btn => {
              btn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                openPhotoGalleryModal(item, 0);
              });
            });
          }
        });

        marker.on('popupclose', () => {
          const pinEl = document.getElementById(`waypointPin-${idx}`);
          if (pinEl) pinEl.classList.remove('active');
        });

        marker.on('click', () => {
          activeCardIndex = idx;
          updateSelectedAttractionCircle(item);
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

      // Redraw dynamic circuit polyline and update HUD telemetry
      redrawCircuitPolylineAndTelemetry();
    }

    renderFilteredFeed();

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }

  // ── Gooey Search Input & Animation Engine ──
  const searchInput = document.getElementById('mapSearchInput');
  const gooeyWrapper = document.getElementById('mapGooeySearchWrapper');
  const searchClearBtn = document.getElementById('mapSearchClearBtn');
  const searchCmdK = document.getElementById('mapSearchCmdK');
  const satelliteBadge = document.getElementById('mapGooeySatelliteBadge');
  const satelliteIcon = satelliteBadge?.querySelector('.material-symbols-outlined');

  if (searchInput && gooeyWrapper) {
    const updateGooeyState = (isFocused) => {
      if (isFocused) {
        gooeyWrapper.classList.add('is-focused');
        if (searchInput.value) {
          if (satelliteIcon) satelliteIcon.textContent = 'close';
        } else {
          if (satelliteIcon) satelliteIcon.textContent = 'arrow_forward';
        }
      } else {
        if (!searchInput.value) {
          gooeyWrapper.classList.remove('is-focused');
          gooeyWrapper.classList.remove('has-query');
          if (satelliteIcon) satelliteIcon.textContent = 'travel_explore';
        } else {
          gooeyWrapper.classList.remove('is-focused');
          gooeyWrapper.classList.add('has-query');
          if (satelliteIcon) satelliteIcon.textContent = 'close';
        }
      }
    };

    searchInput.addEventListener('focus', () => updateGooeyState(true));
    searchInput.addEventListener('blur', () => {
      setTimeout(() => updateGooeyState(false), 160);
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      activeCardIndex = 0;
      activeRenderFilteredFeed?.();

      if (e.target.value) {
        gooeyWrapper.classList.add('has-query');
        if (satelliteIcon) satelliteIcon.textContent = 'close';
        if (searchClearBtn) searchClearBtn.style.display = 'flex';
        if (searchCmdK) searchCmdK.style.display = 'none';
      } else {
        gooeyWrapper.classList.remove('has-query');
        if (satelliteIcon) satelliteIcon.textContent = 'arrow_forward';
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        if (searchCmdK) searchCmdK.style.display = 'inline-block';
      }
    });

    // Clicking satellite badge acts as an organic liquid clear / focus trigger
    satelliteBadge?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (searchInput.value) {
        searchInput.value = '';
        searchQuery = '';
        activeCardIndex = 0;
        activeRenderFilteredFeed?.();
        gooeyWrapper.classList.remove('has-query');
        if (satelliteIcon) satelliteIcon.textContent = 'travel_explore';
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        if (searchCmdK) searchCmdK.style.display = 'inline-block';
        searchInput.focus();
      } else {
        searchInput.focus();
      }
    });

    searchClearBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      searchQuery = '';
      activeCardIndex = 0;
      activeRenderFilteredFeed?.();
      gooeyWrapper.classList.remove('has-query');
      if (satelliteIcon) satelliteIcon.textContent = 'arrow_forward';
      searchClearBtn.style.display = 'none';
      if (searchCmdK) searchCmdK.style.display = 'inline-block';
      searchInput.focus();
    });
  }

  // ── GPX Export Generator (Standard GPX v1.1 XML) ──
  function exportCircuitGpx() {
    const destMeta = DESTINATION_META[activeDestKey] || DESTINATION_META.ooty;
    const allAttractions = CURATED_ATTRACTIONS[activeDestKey] || CURATED_ATTRACTIONS.ooty;
    const defaultCircuitStops = destMeta.circuitStops || allAttractions.slice(0, 4);
    const combinedAttractions = [...defaultCircuitStops, ...allAttractions];
    const activeCircuitSet = destinationCircuitSets.get(activeDestKey) || new Set();
    const circuitStops = getOrderedCircuitStops(activeDestKey, activeCircuitSet, combinedAttractions);

    if (circuitStops.length === 0) {
      alert('Please select at least 1 attraction in the circuit to export GPX.');
      return;
    }

    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trailmate Explorer https://trailmate.app" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(selectedDestination)} Day 1 Circuit</name>
    <desc>Scenic expedition circuit for ${escapeXml(selectedDestination)} curated by Trailmate.</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
`;

    circuitStops.forEach((stop, i) => {
      const lat = Number(stop.lat).toFixed(6);
      const lng = Number(stop.lng).toFixed(6);
      gpx += `  <wpt lat="${lat}" lon="${lng}">
    <name>${escapeXml(stop.name)}</name>
    <desc>${escapeXml(stop.desc || stop.description || '')}</desc>
    <sym>Scenic Area</sym>
    <type>Waypoint #${i + 1}</type>
  </wpt>
`;
    });

    gpx += `  <trk>
    <name>${escapeXml(selectedDestination)} Day 1 Trail</name>
    <trkseg>
`;
    circuitStops.forEach(stop => {
      const lat = Number(stop.lat).toFixed(6);
      const lng = Number(stop.lng).toFixed(6);
      gpx += `      <trkpt lat="${lat}" lon="${lng}"></trkpt>\n`;
    });

    gpx += `    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDestKey}-circuit.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeXml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }



  // ── Compass Rose Button (Re-center & 360° Spring Spin) ──
  const btnCompassRose = document.getElementById('btnCompassRose');
  if (btnCompassRose) {
    btnCompassRose.addEventListener('click', () => {
      btnCompassRose.classList.remove('compass-spinning');
      void btnCompassRose.offsetWidth;
      btnCompassRose.classList.add('compass-spinning');
      setTimeout(() => {
        btnCompassRose.classList.remove('compass-spinning');
      }, 700);

      const centerMeta = DESTINATION_CENTERS[activeDestKey] || DESTINATION_CENTERS.ooty;
      safeMoveMap(centerMeta.lat, centerMeta.lng, centerMeta.zoom || 13, 0.7);

      const allAttractions = CURATED_ATTRACTIONS[activeDestKey] || CURATED_ATTRACTIONS.ooty;
      const initialItem = allAttractions[0];
      if (initialItem) {
        updateActiveFocusCircle?.(initialItem, false);
      }
    });
  }

  // ── Detailed Elevation Gradient Modal ──
  function openElevationModal() {
    const destMeta = DESTINATION_META[activeDestKey] || DESTINATION_META.ooty;
    const allAttractions = CURATED_ATTRACTIONS[activeDestKey] || CURATED_ATTRACTIONS.ooty;
    const defaultCircuitStops = destMeta.circuitStops || allAttractions.slice(0, 4);
    const combinedAttractions = [...defaultCircuitStops, ...allAttractions];
    const activeCircuitSet = destinationCircuitSets.get(activeDestKey) || new Set();
    const circuitStops = getOrderedCircuitStops(activeDestKey, activeCircuitSet, combinedAttractions);

    const existing = document.getElementById('mapElevModal');
    if (existing) existing.remove();

    const modalHtml = `
      <div class="map-elev-modal-backdrop" id="mapElevModal">
        <div class="map-elev-modal-dialog">
          <div class="map-elev-modal-header">
            <h3 class="map-elev-modal-title">
              <span class="material-symbols-outlined text-[#C4703D]">trending_up</span>
              <span>${escapeHtml(selectedDestination)} Elevation Profile</span>
            </h3>
            <button type="button" class="text-neutral-400 hover:text-neutral-700 p-1 flex items-center justify-center rounded" id="btnCloseElevModal" aria-label="Close">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div class="map-elev-modal-body">
            <div class="map-elev-modal-stat-grid">
              <div class="map-elev-modal-stat-card">
                <div class="map-elev-modal-stat-label">Average Altitude</div>
                <div class="map-elev-modal-stat-val text-[#5B8C7B]">${escapeHtml(destMeta.avgElev)}</div>
              </div>
              <div class="map-elev-modal-stat-card">
                <div class="map-elev-modal-stat-label">Elevation Range</div>
                <div class="map-elev-modal-stat-val text-[#C4703D]">${escapeHtml(destMeta.elevRange)}</div>
              </div>
              <div class="map-elev-modal-stat-card">
                <div class="map-elev-modal-stat-label">Highest Landmark</div>
                <div class="map-elev-modal-stat-val text-[#1E3A34]">${escapeHtml(destMeta.peakLabel || 'Summit Peak')}</div>
              </div>
            </div>

            <div class="map-elev-modal-stops-list">
              <div class="text-[10px] font-bold uppercase tracking-wider text-[#7A7670] mb-1">Circuit Stops Altitude Telemetry</div>
              ${circuitStops.length > 0 ? circuitStops.map((stop, idx) => `
                <div class="map-elev-modal-stop-row">
                  <span class="font-medium text-[#1C1C19]">Stop #${idx + 1} — ${escapeHtml(stop.name)}</span>
                  <span class="font-mono font-bold text-[#5B8C7B]">${escapeHtml((stop.altTag || '').replace('● ', ''))}</span>
                </div>
              `).join('') : '<div class="text-xs text-neutral-500 py-2">No attractions currently in circuit. Add attractions from the ledger to view their altitude telemetry.</div>'}
            </div>

            <div class="text-[11px] text-[#7A7670] leading-relaxed bg-white/70 p-3 rounded-lg border border-[#E5E2DD]">
              💡 <strong>Acclimatization Tip:</strong> Pace your ascents gradually. Always carry warm layers and hydrate frequently when exploring above 2,000 meters.
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById('mapElevModal');
    const closeBtn = document.getElementById('btnCloseElevModal');

    const closeModal = () => modalEl?.remove();
    closeBtn?.addEventListener('click', closeModal);
    modalEl?.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });
  }

  const btnExpandElevation = document.getElementById('btnExpandElevation');
  if (btnExpandElevation) {
    btnExpandElevation.addEventListener('click', (e) => {
      e.stopPropagation();
      openElevationModal();
    });
  }

  // ── Keyboard Shortcuts (⌘K for Search, Escape for Menu & Modals) ──
  const keydownHandler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    if (e.key === 'Escape') {
      if (destPickerMenu && !destPickerMenu.classList.contains('hidden')) {
        destPickerMenu.classList.add('hidden');
        btnDestPicker?.setAttribute('aria-expanded', 'false');
      }
      const elevModal = document.getElementById('mapElevModal');
      if (elevModal) elevModal.remove();
      if (document.activeElement === searchInput) {
        searchInput.blur();
      }
    }
  };
  document.addEventListener('keydown', keydownHandler);

  // ── Destination Picker Menu Events ──
  const btnDestPicker = document.getElementById('btnDestPicker');
  const destPickerMenu = document.getElementById('destPickerMenu');

  if (btnDestPicker && destPickerMenu) {
    btnDestPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = destPickerMenu.classList.toggle('hidden');
      btnDestPicker.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    });

    document.addEventListener('click', (e) => {
      if (!destPickerMenu.contains(e.target) && e.target !== btnDestPicker) {
        destPickerMenu.classList.add('hidden');
        btnDestPicker.setAttribute('aria-expanded', 'false');
      }
    });

    destPickerMenu.querySelectorAll('.map-dest-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const destName = opt.dataset.name;
        const destKey = opt.dataset.key;
        destPickerMenu.querySelectorAll('.map-dest-option').forEach(o => {
          o.classList.remove('active');
          const checkIcon = o.querySelector('.map-dest-opt-right .material-symbols-outlined');
          if (checkIcon) checkIcon.remove();
        });
        opt.classList.add('active');
        const rightWrap = opt.querySelector('.map-dest-opt-right');
        if (rightWrap && !rightWrap.querySelector('.material-symbols-outlined')) {
          rightWrap.insertAdjacentHTML('beforeend', '<span class="material-symbols-outlined text-[13px] font-bold text-white">check</span>');
        }
        destPickerMenu.classList.add('hidden');
        btnDestPicker.setAttribute('aria-expanded', 'false');
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
