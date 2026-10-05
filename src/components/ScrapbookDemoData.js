// src/components/ScrapbookDemoData.js
// ─────────────────────────────────────────────────────────────────────────────
// Redesigned Demo Scrapbook Page: "The Grand Indian Odyssey"
// Features full integration of authentic vintage ephemera, postage stamps,
// herbarium botanicals, food stickers, and handwritten travel reflections.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_SCRAPBOOK_PAGE = {
  id: 'demo-showcase-page',
  title: 'The Grand Indian Odyssey',
  background: 'bg-cold-press-art-paper',
  edgeStyle: 'edge-torn',
  format: 'format-spread',
  isDemo: false,
  elements: [
    // ── 1. Hero Cover Header Section ──
    // Vintage Serif Title
    {
      id: 'demo-title-text',
      type: 'text',
      content: 'The Grand Indian Odyssey',
      fontFamily: "'Noto Serif', Georgia, serif",
      fontSize: 32,
      color: '#763403',
      bold: true,
      italic: false,
      align: 'left',
      x: 48,
      y: 35,
      width: 440,
      height: 44,
      rotation: -1,
      zIndex: 3,
    },
    // Elegant Traveler Cursive Subtitle
    {
      id: 'demo-subtitle-text',
      type: 'text',
      content: 'An analog expedition through sandstone ramparts, mist-veiled tea crests & sunlit spice trails.',
      fontFamily: "'Caveat', cursive, sans-serif",
      fontSize: 20,
      color: '#3D261A',
      bold: false,
      italic: false,
      align: 'left',
      x: 50,
      y: 78,
      width: 500,
      height: 38,
      rotation: 0,
      zIndex: 3,
    },
    // Pressed Herbarium Botanical (Lavender & Fern Specimen)
    {
      id: 'demo-herbarium-specimen',
      type: 'sticker',
      category: 'botanicals',
      templateId: 'sticker-pressed-herbarium-specimen',
      x: 545,
      y: 18,
      width: 110,
      height: 110,
      rotation: 6,
      zIndex: 5,
    },
    // Royal Crimson Wax Seal
    {
      id: 'demo-crimson-wax-seal',
      type: 'sticker',
      category: 'fasteners',
      templateId: 'sticker-crimson-wax-seal',
      x: 655,
      y: 30,
      width: 78,
      height: 78,
      rotation: -8,
      zIndex: 6,
    },

    // ── 2. Hero Photography 1: Udaipur Sunset & Palace Ramparts ──
    // Polaroid Instant Photo
    {
      id: 'demo-hero-photo',
      type: 'photo',
      src: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      frameStyle: 'frame-polaroid',
      x: 45,
      y: 130,
      width: 225,
      height: 265,
      rotation: -3,
      zIndex: 2,
    },
    // Airmail Washi Tape on Top Photo Corner
    {
      id: 'demo-airmail-washi',
      type: 'sticker',
      category: 'tape',
      templateId: 'washi-airmail-diagonal',
      x: 55,
      y: 115,
      width: 80,
      height: 28,
      rotation: -22,
      zIndex: 7,
    },
    // Antique Brass Paperclip
    {
      id: 'demo-brass-paperclip',
      type: 'sticker',
      category: 'fasteners',
      templateId: 'fastener-brass-paperclip',
      x: 220,
      y: 122,
      width: 32,
      height: 60,
      rotation: 14,
      zIndex: 7,
    },

    // ── 3. Vintage Ephemera & Railway Transit Pass ──
    // Vintage Mountain Train Conductor Pass
    {
      id: 'demo-vintage-railway-ticket',
      type: 'ephemera',
      ephemeraType: 'train-ticket',
      train: 'NILGIRI MOUNTAIN RAILWAY & INDES',
      route: 'METTUPALAYAM ➔ OOTY CREST',
      class: 'SALON HERITAGE • 1ST CLASS',
      price: '₹205',
      date: '14 OCT 1928',
      x: 280,
      y: 130,
      width: 250,
      height: 115,
      rotation: 1.5,
      zIndex: 4,
    },

    // ── 4. Philatelic Stamp Collection: Perforated City & Botanical Postage ──
    // Jaipur Hawa Mahal Palace Stamp
    {
      id: 'demo-stamp-jaipur',
      type: 'sticker',
      category: 'stamps',
      templateId: 'stamp-jaipur',
      x: 545,
      y: 135,
      width: 85,
      height: 85,
      rotation: -3,
      zIndex: 5,
    },
    // Ooty Nilgiri Mountain Train Stamp
    {
      id: 'demo-stamp-ooty',
      type: 'sticker',
      category: 'stamps',
      templateId: 'stamp-ooty',
      x: 638,
      y: 140,
      width: 85,
      height: 85,
      rotation: 4,
      zIndex: 5,
    },
    // Vintage Monarch Butterfly Botanical Stamp
    {
      id: 'demo-stamp-butterfly',
      type: 'sticker',
      category: 'stamps',
      templateId: 'stamp-botanical-butterfly',
      x: 635,
      y: 232,
      width: 85,
      height: 105,
      rotation: -4,
      zIndex: 5,
    },

    // ── 5. Hero Photography 2: Munnar Tea Valleys & Mountain Ridges ──
    // Deckled-Edge Landscape Photo
    {
      id: 'demo-photo-hills',
      type: 'photo',
      src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      frameStyle: 'frame-deckled',
      x: 280,
      y: 260,
      width: 215,
      height: 160,
      rotation: -1.5,
      zIndex: 2,
    },
    // High Mountain Pass Crest Badge
    {
      id: 'demo-high-pass-badge',
      type: 'routes',
      badgeType: 'mountain-high-pass',
      pass: 'NILGIRI TEA HIGHLANDS',
      alt: '2,240 M / 7,350 FT',
      subtitle: 'MIST VALLEY SANCTUARY',
      x: 505,
      y: 260,
      width: 125,
      height: 95,
      rotation: 2.5,
      zIndex: 4,
    },

    // ── 6. Regional Provisions & Culinary Keepsakes ──
    // Masala Chai in Clay Kulhad
    {
      id: 'demo-chai-kulhad',
      type: 'sticker',
      category: 'food',
      templateId: 'sticker-masala-chai-clay-kulhad',
      x: 505,
      y: 368,
      width: 85,
      height: 85,
      rotation: -6,
      zIndex: 5,
    },
    // Goan Bebinca Layer Cake
    {
      id: 'demo-goan-bebinca',
      type: 'sticker',
      category: 'food',
      templateId: 'sticker-goan-bebinca-cake',
      x: 595,
      y: 365,
      width: 85,
      height: 85,
      rotation: 5,
      zIndex: 5,
    },

    // ── 7. Scenic Route Ribbon & Typewriter Log Reflections ──
    // Sunset Coastal Route Ribbon
    {
      id: 'demo-route-ribbon',
      type: 'routes',
      badgeType: 'sunset-coastal',
      routeTitle: 'ROYAL RAJASTHAN HIGHWAY',
      from: 'Jaipur Forts',
      to: 'Lake Pichola',
      vibe: 'Golden Dunes & Lake Sunsets',
      x: 45,
      y: 410,
      width: 220,
      height: 95,
      rotation: 1,
      zIndex: 4,
    },
    // Typewriter Expedition Coordinates Dispatch
    {
      id: 'demo-typewriter-note',
      type: 'text',
      content: 'EXPEDITION LOG • 24.5854° N, 73.7125° E\n06:45 AM: The morning mist rolls over the emerald tea terraces as the aroma of freshly brewed cardamom chai rises from our terracotta kulhad cups.',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      color: '#1B1C1A',
      bold: false,
      italic: false,
      align: 'left',
      x: 280,
      y: 435,
      width: 245,
      height: 65,
      rotation: 0,
      zIndex: 3,
    },
    // Handwritten Traveler Quote Script
    {
      id: 'demo-cursive-quote',
      type: 'text',
      content: '“Collect quiet moments, not just souvenirs.”',
      fontFamily: "'Caveat', cursive, sans-serif",
      fontSize: 17,
      color: '#763403',
      bold: false,
      italic: false,
      align: 'left',
      x: 535,
      y: 465,
      width: 195,
      height: 35,
      rotation: -2,
      zIndex: 3,
    },
  ],
};
