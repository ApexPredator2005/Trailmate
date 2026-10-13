/**
 * PvcPatchesData.js — 3D Molded PVC Expedition Morale Patches Catalog & Visual Assets
 * Authentic Liquid Injection Molded PVC & Vulcanized Silicone Badges
 * Mil-Spec 810G Telemetry, Multi-Tier Relief SVGs & Micro-Stippled Finishes
 */

export const PVC_PATCHES_CATALOG = [
  // ── 1. The Pioneer's Compass ───────────────────────────────────────────────
  {
    id: 'pvc-pioneers-compass',
    badgeId: 'badge-first-steps',
    altBadgeId: 'badge-first-step',
    title: "The Pioneer's Compass",
    name: "The Pioneer's Compass",
    subtitle: 'Tactile Topo Contour & Footprint',
    category: 'overland',
    sku: 'PIONEER-01 // BATCH #001-P',
    durometer: '85A DUROMETER',
    material: 'VULCANIZED CHARCOAL FLUORORUBBER',
    rating: 'IP68 WATERPROOF',
    points: 250,
    themeClass: 'pvc-theme-pioneer-topo',
    milestone: 'First Decisive Step Logged',
    defaultProgress: '100%',
    lore: 'Molded in vulcanized charcoal fluororubber with neon lime injection contour ridges and deep tread footprint. Commemorates taking the first decisive step into uncharted territory.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#262A30" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#CCFF00" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.8"/>
      <!-- Topographic Elevation Contour Rings -->
      <g class="pvc-relief-layer-1" fill="none" stroke="#CCFF00" opacity="0.35">
        <path d="M 32 80 C 32 50, 50 32, 80 32 C 110 32, 128 50, 128 80 C 128 110, 110 128, 80 128 C 50 128, 32 110, 32 80 Z" stroke-width="1.2"/>
        <path d="M 40 82 C 40 58, 56 42, 80 42 C 104 42, 120 58, 120 82 C 120 106, 104 120, 80 120 C 56 120, 40 106, 40 82 Z" stroke-width="1"/>
        <path d="M 48 85 C 48 68, 62 52, 80 52 C 98 52, 112 68, 112 85 C 112 102, 98 112, 80 112 C 62 112, 48 102, 48 85 Z" stroke-width="1.4"/>
        <path d="M 58 88 C 58 76, 68 64, 80 64 C 92 64, 102 76, 102 88 C 102 98, 92 104, 80 104 C 68 104, 58 98, 58 88 Z" stroke-width="1.2" stroke-dasharray="2,2"/>
      </g>
      <!-- Elevation Numbers in Topo Rings -->
      <text x="80" y="38" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="bold" fill="#CCFF00" opacity="0.6" text-anchor="middle">1600M</text>
      <text x="80" y="48" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="bold" fill="#CCFF00" opacity="0.5" text-anchor="middle">1400M</text>
      <!-- Molded Hiking Boot Tread Footprint (Layer 3 - High Relief in Neon Lime #CCFF00) -->
      <g class="pvc-relief-layer-3">
        <!-- Boot Forefoot Sole Base -->
        <path d="M 64 64 C 60 56, 64 46, 75 42 C 86 38, 96 44, 98 54 C 100 64, 96 74, 90 82 C 84 90, 72 90, 68 84 C 64 78, 66 70, 64 64 Z" fill="#CCFF00"/>
        <!-- Deep Knobby Lug Cutouts in Boot Sole (reveal dark rubber #121417 beneath) -->
        <g fill="#121417">
          <rect x="70" y="47" width="16" height="3" rx="1.5"/>
          <rect x="68" y="53" width="20" height="3.5" rx="1.5"/>
          <rect x="67" y="60" width="22" height="3.5" rx="1.5"/>
          <rect x="69" y="67" width="18" height="3" rx="1.5"/>
          <rect x="72" y="73" width="12" height="3" rx="1.5"/>
          <polygon points="63,50 66,52 64,55"/>
          <polygon points="62,60 65,62 63,65"/>
          <polygon points="98,52 95,54 97,57"/>
          <polygon points="97,62 94,64 96,67"/>
        </g>
        <!-- Boot Heel Pad -->
        <path d="M 69 94 C 67 92, 72 91, 79 91 C 86 91, 91 92, 89 94 C 88 102, 87 110, 79 110 C 71 110, 70 102, 69 94 Z" fill="#CCFF00"/>
        <!-- Heel Lug Sipes -->
        <g fill="#121417">
          <rect x="72" y="95" width="14" height="2.5" rx="1"/>
          <rect x="73" y="100" width="12" height="2.5" rx="1"/>
          <rect x="75" y="105" width="8" height="2" rx="1"/>
        </g>
      </g>
      <!-- Miniature Compass Needle at 315° (top-right dial) -->
      <g class="pvc-relief-layer-3" transform="translate(118, 42)">
        <circle cx="0" cy="0" r="14" fill="#14171A" stroke="#CCFF00" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="11" fill="none" stroke="#2F353D" stroke-width="1"/>
        <line x1="0" y1="-11" x2="0" y2="-8" stroke="#CCFF00" stroke-width="1.5"/>
        <line x1="11" y1="0" x2="8" y2="0" stroke="#CCFF00" stroke-width="1"/>
        <line x1="0" y1="11" x2="0" y2="8" stroke="#CCFF00" stroke-width="1"/>
        <line x1="-11" y1="0" x2="-8" y2="0" stroke="#CCFF00" stroke-width="1"/>
        <g transform="rotate(-45)">
          <polygon points="0,-9 3,0 0,-1.5 -3,0" fill="#FF4444"/>
          <polygon points="0,9 3,0 0,1.5 -3,0" fill="#E2E8F0"/>
          <circle cx="0" cy="0" r="2" fill="#FFFFFF"/>
        </g>
      </g>
      <!-- Curved Bottom Badge Inscription -->
      <path id="pioneerArc" d="M 28 136 A 58 58 0 0 0 132 136" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#CCFF00" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#pioneerArc" startOffset="50%">PIONEER COMPASS • 315° NW</textPath>
      </text>
    </svg>`,
  },

  // ── 2. The Weekend Wanderer ────────────────────────────────────────────────
  {
    id: 'pvc-weekend-wanderer',
    badgeId: 'badge-weekend-wanderer',
    altBadgeId: 'badge-trail-pioneer',
    title: 'The Weekend Wanderer',
    name: 'The Weekend Wanderer',
    subtitle: 'Crossed Trekking Poles & Ridges',
    category: 'overland',
    sku: 'WANDERER-02 // BATCH #014-W',
    durometer: '90A DUROMETER',
    material: 'HIGH-TENSILE SILICONE',
    rating: 'HAZARD ORANGE // TRAIL-READY',
    points: 500,
    themeClass: 'pvc-theme-wanderer-orange',
    milestone: 'Multi-Day Trek Completed',
    defaultProgress: '75%',
    lore: 'Engineered in high-tensile silicone with hazard orange reliefs. Conferred upon pathfinders who log multi-day treks through rain, scree, and pine needle forest floors.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#221C16" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#FF6B00" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Mountain Silhouette Backdrop (Layer 1) -->
      <g class="pvc-relief-layer-1">
        <polygon points="26,112 55,62 82,100" fill="#252A30"/>
        <polygon points="55,62 64,52 74,68" fill="#FFFFFF"/>
        <polygon points="62,106 95,48 134,112" fill="#323842"/>
        <polygon points="95,48 106,62 92,66" fill="#FFFFFF"/>
        <!-- Pine Tree Silhouettes along lower ridge -->
        <polygon points="34,116 40,98 46,116" fill="#132B1D"/>
        <polygon points="42,118 48,102 54,118" fill="#0C1F14"/>
        <polygon points="108,118 114,100 120,118" fill="#132B1D"/>
        <polygon points="116,118 122,104 128,118" fill="#0C1F14"/>
      </g>
      <!-- Foreground Crossed Trekking Poles (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Pole 1: Top-Left to Bottom-Right -->
        <line x1="38" y1="36" x2="122" y2="122" stroke="#FF6B00" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="56" y1="54" x2="104" y2="104" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <!-- Pole 1 Handle & Strap (Top-Left) -->
        <rect x="34" y="32" width="14" height="6" rx="2" fill="#121316" transform="rotate(45 41 35)"/>
        <path d="M 36 34 Q 28 40 34 46" fill="none" stroke="#FF6B00" stroke-width="2"/>
        <!-- Pole 1 Basket & Carbide Tip (Bottom-Right) -->
        <circle cx="114" cy="114" r="5" fill="#121316" stroke="#FF6B00" stroke-width="1.5"/>
        <polygon points="120,120 125,125 121,126" fill="#CBD5E1"/>

        <!-- Pole 2: Top-Right to Bottom-Left -->
        <line x1="122" y1="36" x2="38" y2="122" stroke="#FF6B00" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="104" y1="54" x2="56" y2="104" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <!-- Pole 2 Handle & Strap (Top-Right) -->
        <rect x="112" y="32" width="14" height="6" rx="2" fill="#121316" transform="rotate(-45 119 35)"/>
        <path d="M 124 34 Q 132 40 126 46" fill="none" stroke="#FF6B00" stroke-width="2"/>
        <!-- Pole 2 Basket & Carbide Tip (Bottom-Left) -->
        <circle cx="46" cy="114" r="5" fill="#121316" stroke="#FF6B00" stroke-width="1.5"/>
        <polygon points="40,120 35,125 39,126" fill="#CBD5E1"/>
        <!-- Center Joint Clamp -->
        <circle cx="80" cy="79" r="5.5" fill="#121316" stroke="#FF6B00" stroke-width="2"/>
        <circle cx="80" cy="79" r="2" fill="#FFFFFF"/>
      </g>
      <!-- Inscription Banner -->
      <path id="wandererArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#FF6B00" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#wandererArc" startOffset="50%">WEEKEND WANDERER • 48H TREK</textPath>
      </text>
    </svg>`,
  },

  // ── 3. The Cloud Sovereign ─────────────────────────────────────────────────
  {
    id: 'pvc-cloud-sovereign',
    badgeId: 'badge-mile-high-club',
    altBadgeId: 'badge-scrapbook-artisan',
    title: 'The Cloud Sovereign',
    name: 'The Cloud Sovereign',
    subtitle: 'High-Altitude Summit & Raptor Wings',
    category: 'summit',
    sku: 'SOVEREIGN-03 // BATCH #029-S',
    durometer: '82A DUROMETER',
    material: 'LIQUID SILICONE INJECTION',
    rating: '3000M ELEVATION // ICE-SPEC',
    points: 1000,
    themeClass: 'pvc-theme-cloud-sovereign',
    milestone: 'Summit Above 3000M',
    defaultProgress: '60%',
    lore: 'Liquid silicone injection with ice-cyan and glacier white highlights. Conferred upon alpinists who ascend above cloud level to witness dawn over jagged ridgelines.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#16202A" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#38BDF8" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Billowing Cloud Underlayer (Layer 1) -->
      <g class="pvc-relief-layer-1" fill="#1E293B">
        <path d="M 24 116 Q 44 98 68 110 Q 94 92 118 108 Q 138 100 144 116 Z"/>
      </g>
      <!-- Sharp Himalayan Pyramidal Peak (Layer 2) -->
      <g class="pvc-relief-layer-2">
        <polygon points="80,48 48,116 80,108" fill="#0F172A"/>
        <polygon points="80,48 112,116 80,108" fill="#1E293B"/>
        <!-- Glaciated Snow Cap Facets (Ice-cyan #38BDF8 & White) -->
        <polygon points="80,48 64,80 80,74" fill="#38BDF8"/>
        <polygon points="80,48 96,80 80,74" fill="#FFFFFF"/>
        <polygon points="80,74 70,88 80,84" fill="#BAE6FD"/>
        <polygon points="80,74 90,88 80,84" fill="#F0F9FF"/>
      </g>
      <!-- Soaring Raptor / Mountain Eagle Wings Spread Wide (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Left Wing -->
        <path d="M 80 68 C 66 50, 42 46, 24 54 C 36 64, 52 70, 72 74 Z" fill="#38BDF8"/>
        <path d="M 28 58 L 22 52 M 36 64 L 30 60 M 46 68 L 42 66" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 76 72 C 64 60, 46 56, 32 62 C 44 70, 58 74, 76 75 Z" fill="#0284C7"/>
        <!-- Right Wing -->
        <path d="M 80 68 C 94 50, 118 46, 136 54 C 124 64, 108 70, 88 74 Z" fill="#38BDF8"/>
        <path d="M 132 58 L 138 52 M 124 64 L 130 60 M 114 68 L 118 66" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 84 72 C 96 60, 114 56, 128 62 C 116 70, 102 74, 84 75 Z" fill="#0284C7"/>
        <!-- Raptor Head Silhouette -->
        <polygon points="80,60 77,66 83,66" fill="#FFFFFF"/>
        <polygon points="80,58 83,61 80,62" fill="#F59E0B"/>
      </g>
      <!-- Embossed Elevation Badge '3000M' (Top Center) -->
      <g class="pvc-relief-layer-3">
        <rect x="58" y="26" width="44" height="15" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.8"/>
        <text x="80" y="37" font-family="'Impact', 'Arial Black', sans-serif" font-size="10.5" font-weight="900" fill="#38BDF8" letter-spacing="1.5" text-anchor="middle">3000M</text>
      </g>
      <!-- Inscription Banner -->
      <path id="sovereignArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#38BDF8" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#sovereignArc" startOffset="50%">CLOUD SOVEREIGN • ICE-SPEC</textPath>
      </text>
    </svg>`,
  },

  // ── 4. The Maritime Mariner ────────────────────────────────────────────────
  {
    id: 'pvc-maritime-mariner',
    badgeId: 'badge-beachcomber',
    altBadgeId: 'badge-treasure-hunter',
    title: 'The Maritime Mariner',
    name: 'The Maritime Mariner',
    subtitle: 'Deep-Sea Anchor & Coastal Surges',
    category: 'coastal',
    sku: 'MARINER-04 // BATCH #035-M',
    durometer: '88A DUROMETER',
    material: 'OCEANIC NAVY SILICONE',
    rating: 'SALT-PROOF // NAVY RUBBER',
    points: 350,
    themeClass: 'pvc-theme-maritime-navy',
    milestone: 'Coastal Surges Logged',
    defaultProgress: '40%',
    lore: 'Deep oceanic navy silicone base with embossed brass anchor and braided rope relief. Built to withstand tropical salt spray, reef currents, and coastal monsoon winds.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#0B1B33" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#F59E0B" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Rolling Ocean Wave Ridges (Layer 1 & 2 in seafoam cyan #06B6D4) -->
      <g class="pvc-relief-layer-2">
        <path d="M 22 108 Q 45 92 68 106 T 114 104 T 142 110 L 142 126 L 22 126 Z" fill="#0C4A6E"/>
        <path d="M 20 114 Q 50 102 78 114 T 128 112 T 144 118 L 144 130 L 20 130 Z" fill="#06B6D4"/>
        <path d="M 26 122 Q 54 112 84 122 T 136 120 L 136 134 L 26 134 Z" fill="#0284C7"/>
        <path d="M 64 106 Q 70 100 76 106" stroke="#E0F2FE" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M 110 104 Q 116 98 122 104" stroke="#E0F2FE" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <!-- Heavy Molded Naval Anchor in Metallic Brass/Gold (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Anchor Shackle & Ring (Top) -->
        <circle cx="80" cy="38" r="9" fill="none" stroke="#F59E0B" stroke-width="3.5"/>
        <circle cx="80" cy="38" r="4" fill="#0B1324"/>
        <rect x="76" y="44" width="8" height="5" rx="1.5" fill="#D97706"/>
        <!-- Stock (Crossbar) with rounded tips -->
        <line x1="52" y1="52" x2="108" y2="52" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="52" cy="52" r="3.5" fill="#D97706"/>
        <circle cx="108" cy="52" r="3.5" fill="#D97706"/>
        <!-- Main Shank (Vertical Beam) -->
        <line x1="80" y1="46" x2="80" y2="104" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
        <line x1="79" y1="48" x2="79" y2="102" stroke="#FDE68A" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Crown and Curved Flukes (Arms) -->
        <path d="M 44 86 C 48 108, 64 114, 80 114 C 96 114, 112 108, 116 86" fill="none" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
        <polygon points="44,84 36,88 46,96" fill="#F59E0B"/>
        <polygon points="116,84 124,88 114,96" fill="#F59E0B"/>
        <!-- Braided Rope Wrapping the Shank -->
        <path d="M 76 42 Q 68 46 72 58 Q 88 56 86 68 Q 68 70 76 82 Q 88 84 84 94 Q 72 98 78 108" fill="none" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 76 42 Q 68 46 72 58 Q 88 56 86 68 Q 68 70 76 82 Q 88 84 84 94 Q 72 98 78 108" fill="none" stroke="#B45309" stroke-width="1" stroke-dasharray="2,2"/>
      </g>
      <!-- Inscription Banner -->
      <path id="marinerArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#F59E0B" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#marinerArc" startOffset="50%">MARITIME MARINER • 88A NAVY</textPath>
      </text>
    </svg>`,
  },

  // ── 5. The Ancient Monolith ────────────────────────────────────────────────
  {
    id: 'pvc-ancient-monolith',
    badgeId: 'badge-heritage-hound',
    altBadgeId: 'badge-cartographer',
    title: 'The Ancient Monolith',
    name: 'The Ancient Monolith',
    subtitle: 'Fortress Ramparts & Carved Stupa',
    category: 'heritage',
    sku: 'MONOLITH-05 // BATCH #048-H',
    durometer: '90A DUROMETER',
    material: 'TERRACOTTA & SANDSTONE SILICONE',
    rating: 'TERRACOTTA & SANDSTONE',
    points: 700,
    themeClass: 'pvc-theme-ancient-monolith',
    milestone: 'Ancient Bastions Explored',
    defaultProgress: '70%',
    lore: 'Molded in warm terracotta and sandstone pigments with micro-stippled stone finish. Commemorates deep exploration of ancient stone citadels, stepwells, and mountain monasteries.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#261611" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#FBBF24" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Mountain Plateau Backdrop (Layer 1) -->
      <g class="pvc-relief-layer-1">
        <polygon points="26,118 42,78 90,78 134,118" fill="#431407"/>
      </g>
      <!-- Rajasthani Fort Bastion & Ramparts (Layer 2 & 3 in Terracotta #C2410C & Desert Gold #FBBF24) -->
      <g class="pvc-relief-layer-2">
        <path d="M 36 116 L 36 82 L 42 82 L 42 86 L 48 86 L 48 82 L 54 82 L 54 86 L 60 86 L 60 82 L 66 82 L 66 86 L 72 86 L 72 82 L 88 82 L 88 86 L 94 86 L 94 82 L 100 82 L 100 86 L 106 86 L 106 82 L 112 82 L 112 86 L 118 86 L 118 82 L 124 82 L 124 116 Z" fill="#9A3412"/>
        <!-- Stone Masonry Grooves -->
        <line x1="38" y1="92" x2="122" y2="92" stroke="#7C2D12" stroke-width="1.2"/>
        <line x1="38" y1="102" x2="122" y2="102" stroke="#7C2D12" stroke-width="1.2"/>
        <line x1="50" y1="86" x2="50" y2="92" stroke="#7C2D12" stroke-width="1"/>
        <line x1="70" y1="86" x2="70" y2="92" stroke="#7C2D12" stroke-width="1"/>
        <line x1="90" y1="86" x2="90" y2="92" stroke="#7C2D12" stroke-width="1"/>
        <line x1="110" y1="86" x2="110" y2="92" stroke="#7C2D12" stroke-width="1"/>
      </g>
      <!-- Grand Arched Sandstone Gateway & Carved Stupa Dome (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Central Citadel Tower -->
        <rect x="62" y="58" width="36" height="34" rx="2" fill="#C2410C" stroke="#FBBF24" stroke-width="1.5"/>
        <!-- Carved Chhatri / Stupa Dome atop Tower -->
        <path d="M 66 58 Q 80 44 94 58 Z" fill="#FBBF24"/>
        <circle cx="80" cy="43" r="2.5" fill="#FDE68A"/>
        <!-- Cusped Mughal/Rajput Arch Gateway Portal -->
        <path d="M 70 92 L 70 76 Q 75 70 80 66 Q 85 70 90 76 L 90 92 Z" fill="#1C1917" stroke="#FBBF24" stroke-width="1.8"/>
        <!-- Jharokha (Carved Overhanging Balcony) Details -->
        <rect x="74" y="60" width="12" height="4" rx="1" fill="#FBBF24"/>
        <circle cx="76" cy="62" r="1" fill="#7C2D12"/>
        <circle cx="80" cy="62" r="1" fill="#7C2D12"/>
        <circle cx="84" cy="62" r="1" fill="#7C2D12"/>
        <!-- Stepwell (Baori) stepped terraces at base -->
        <polygon points="56,116 66,104 94,104 104,116" fill="#EA580C"/>
        <polygon points="68,116 74,108 86,108 92,116" fill="#C2410C"/>
      </g>
      <!-- Inscription Banner -->
      <path id="monolithArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#FBBF24" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#monolithArc" startOffset="50%">ANCIENT MONOLITH • CITADEL</textPath>
      </text>
    </svg>`,
  },

  // ── 6. The Flaming Guild Torch ─────────────────────────────────────────────
  {
    id: 'pvc-flaming-guild-torch',
    badgeId: 'badge-local-legend',
    title: 'The Flaming Guild Torch',
    name: 'The Flaming Guild Torch',
    subtitle: 'Brazen Guild Flame & Embers',
    category: 'heritage',
    sku: 'TORCH-06 // BATCH #099-L',
    durometer: '85A DUROMETER',
    material: 'BEDROCK CRIMSON RUBBER',
    rating: 'BEDROCK CRIMSON // +120°C',
    points: 1500,
    themeClass: 'pvc-theme-flaming-torch',
    milestone: 'High Community Praise',
    defaultProgress: '50%',
    lore: 'Vulcanized in bedrock crimson rubber with three-stage flame injection (deep red, hazard orange, radiant yellow). Bestowed upon master expedition chroniclers who light the path for others.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#251010" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#EF4444" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Ambient Radiance Halo -->
      <circle cx="80" cy="62" r="38" fill="#450A0A" opacity="0.4" class="pvc-relief-layer-1"/>
      <!-- Rising Spark Embers (Layer 1 & 2) -->
      <g class="pvc-relief-layer-2">
        <circle cx="64" cy="38" r="2" fill="#FDE047"/>
        <circle cx="72" cy="24" r="1.5" fill="#F97316"/>
        <circle cx="92" cy="28" r="2.2" fill="#FDE047"/>
        <circle cx="98" cy="42" r="1.8" fill="#EF4444"/>
        <circle cx="82" cy="18" r="2" fill="#FFFBEB"/>
      </g>
      <!-- Three-Stage Injection Molded Flame (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Stage 1: Outer Bedrock Crimson Flame (#EF4444) -->
        <path d="M 80 28 C 66 38, 52 56, 56 76 C 58 88, 68 96, 80 96 C 92 96, 102 88, 104 76 C 108 56, 94 38, 80 28 Z" fill="#EF4444"/>
        <!-- Stage 2: Mid Hazard Orange Flame (#F97316) -->
        <path d="M 80 40 C 70 48, 62 60, 64 76 C 66 85, 72 90, 80 90 C 88 90, 94 85, 96 76 C 98 60, 90 48, 80 40 Z" fill="#F97316"/>
        <!-- Stage 3: Core Radiant Yellow & White-Hot Center (#FDE047 & #FFFBEB) -->
        <path d="M 80 52 C 74 58, 70 68, 72 78 C 73 83, 76 86, 80 86 C 84 86, 87 83, 88 78 C 90 68, 86 58, 80 52 Z" fill="#FDE047"/>
        <ellipse cx="80" cy="74" rx="3.5" ry="6" fill="#FFFBEB"/>
      </g>
      <!-- Heavy Molded Gunmetal Torch Handle & Fire Bowl (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <polygon points="62,94 98,94 92,106 68,106" fill="#1E2024" stroke="#475569" stroke-width="1.5"/>
        <line x1="72" y1="98" x2="72" y2="102" stroke="#EF4444" stroke-width="1.5"/>
        <line x1="80" y1="98" x2="80" y2="102" stroke="#FDE047" stroke-width="1.5"/>
        <line x1="88" y1="98" x2="88" y2="102" stroke="#EF4444" stroke-width="1.5"/>
        <rect x="74" y="106" width="12" height="26" rx="2" fill="#2B2E35" stroke="#1E2024" stroke-width="1.5"/>
        <line x1="74" y1="112" x2="86" y2="112" stroke="#475569" stroke-width="1.5"/>
        <line x1="74" y1="118" x2="86" y2="118" stroke="#475569" stroke-width="1.5"/>
        <line x1="74" y1="124" x2="86" y2="124" stroke="#475569" stroke-width="1.5"/>
        <circle cx="80" cy="133" r="4.5" fill="#D97706" stroke="#1E2024" stroke-width="1"/>
      </g>
      <!-- Inscription Banner -->
      <path id="torchArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#FDE047" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#torchArc" startOffset="50%">GUILD TORCH • +120°C SPEC</textPath>
      </text>
    </svg>`,
  },

  // ── 7. The Midnight Astrologer ─────────────────────────────────────────────
  {
    id: 'pvc-midnight-astrologer',
    badgeId: 'badge-midnight-astrologer',
    title: 'The Midnight Astrologer',
    name: 'The Midnight Astrologer',
    subtitle: 'Die-Cut Crescent Basecamp',
    category: 'summit',
    sku: 'NOCTURNAL-07 // BATCH #042-M',
    durometer: '80A SILICONE',
    material: 'MOLDED PVC SILICONE',
    rating: 'GLOW-IN-DARK STAR',
    points: 850,
    themeClass: 'pvc-theme-crescent-camp',
    milestone: '3 Twilight Expeditions',
    defaultProgress: '50%',
    lore: 'Die-cut crescent silhouette molded in midnight indigo rubber with recessed stitching groove, hazard orange tent, golden campfire flame, and swirling smoke plume.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#191B33" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#FBBF24" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Die-Cut Crescent Moon Silhouette (Layer 1) -->
      <path d="M 80 18 C 115 18 142 45 142 80 C 142 115 115 142 80 142 C 56 142 35 128 26 108 C 38 116 52 120 68 120 C 102 120 128 94 128 60 C 128 42 120 28 108 20 C 99 18 89 18 80 18 Z" fill="#0E1022" stroke="#25244C" stroke-width="2.5" class="pvc-relief-layer-1"/>
      <polygon points="38,105 56,76 74,105" fill="#1E293B" class="pvc-relief-layer-1"/>
      <polygon points="56,76 68,70 82,105 70,105" fill="#334155" class="pvc-relief-layer-1"/>
      <polygon points="34,115 42,95 50,115" fill="#064E3B" class="pvc-relief-layer-1"/>
      <polygon points="46,118 54,98 62,118" fill="#043629" class="pvc-relief-layer-1"/>
      <path d="M 28 120 Q 65 106 122 122 Z" fill="#2D4A22"/>
      <!-- Orange Expedition Tent (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <polygon points="62,78 48,114 76,114" fill="#F97316"/>
        <polygon points="62,78 76,114 88,108 72,76" fill="#EA580C"/>
        <polygon points="62,78 62,114 54,114" fill="#7C2D12"/>
        <line x1="48" y1="114" x2="76" y2="114" stroke="#FFFBEB" stroke-width="1.2"/>
      </g>
      <!-- Stone Campfire & Rising Smoke Plume (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <ellipse cx="102" cy="118" rx="14" ry="4" fill="#334155"/>
        <path d="M 98 116 Q 94 105 102 96 Q 108 106 102 116 Z" fill="#F59E0B"/>
        <path d="M 102 116 Q 100 108 104 102 Q 108 109 104 116 Z" fill="#FEF08A"/>
        <path d="M 102 96 Q 106 82 98 72 Q 90 62 100 50 Q 106 42 102 34 Q 96 26 106 24" fill="none" stroke="#A8A29E" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>
      </g>
      <!-- Glow-in-the-Dark Starlight Diamonds -->
      <polygon points="44,40 47,46 53,49 47,52 44,58 41,52 35,49 41,46" fill="#FFFFFF" class="pvc-relief-layer-3"/>
      <polygon points="106,38 108,42 112,44 108,46 106,50 104,46 100,44 104,42" fill="#FEF08A" class="pvc-relief-layer-3"/>
      <!-- Inscription Banner -->
      <path id="astrologerArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#FBBF24" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#astrologerArc" startOffset="50%">MIDNIGHT ASTROLOGER • GLOW</textPath>
      </text>
    </svg>`,
  },

  // ── 8. The High-Altitude Nomad ─────────────────────────────────────────────
  {
    id: 'pvc-high-altitude-nomad',
    badgeId: 'badge-high-altitude-nomad',
    title: 'The High-Altitude Nomad',
    name: 'The High-Altitude Nomad',
    subtitle: 'Tactical Overland 4x4 Rig',
    category: 'summit',
    sku: 'NOMAD-08 // BATCH #088-P',
    durometer: '85A DUROMETER',
    material: 'MOLDED PVC FLUORORUBBER',
    rating: 'IP68 WATERPROOF',
    points: 1400,
    themeClass: 'pvc-theme-neon-offroad',
    milestone: '4 High Passes Summited',
    defaultProgress: '30%',
    lore: 'Molded in vulcanized matte fluororubber with high-visibility neon lime injection. Designed for overland scouts navigating high alpine rock shelves above 2,500m.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#252930" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#CCFF00" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Alpine Pine Relief & Mountain Shelf (Layer 1) -->
      <g class="pvc-relief-layer-1" fill="#121316">
        <polygon points="35,72 45,52 55,72"/>
        <polygon points="45,68 55,46 65,68"/>
        <polygon points="95,72 105,48 115,72"/>
        <polygon points="105,68 115,54 125,68"/>
      </g>
      <!-- Embossed 3D Bold Lettering -->
      <text x="80" y="44" font-family="'Impact', 'Arial Black', sans-serif" font-size="9" font-weight="900" fill="#121316" text-anchor="middle" letter-spacing="1.2" class="pvc-relief-layer-1">ADVENTURE</text>
      <text x="80" y="55" font-family="'Impact', 'Arial Black', sans-serif" font-size="11" font-weight="900" fill="#121316" text-anchor="middle" letter-spacing="1.5" class="pvc-relief-layer-1">OFFROAD</text>
      <text x="80" y="32" font-family="'Brush Script MT', cursive, sans-serif" font-size="14" font-weight="bold" fill="#CCFF00" text-anchor="middle" class="pvc-relief-layer-3">Extreme</text>
      <!-- Neon 4x4 Rig Climbing Rock Shelf (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Deep Tread Off-road Wheels -->
        <circle cx="52" cy="106" r="14" fill="#0D0E11" stroke="#1F2329" stroke-width="3"/>
        <circle cx="108" cy="106" r="14" fill="#0D0E11" stroke="#1F2329" stroke-width="3"/>
        <circle cx="52" cy="106" r="6" fill="#CCFF00"/>
        <circle cx="108" cy="106" r="6" fill="#CCFF00"/>
        <!-- Rock Shelf Terrain -->
        <path d="M 26 114 Q 50 108 80 114 T 134 112 L 134 122 L 26 122 Z" fill="#121316"/>
        <!-- Rig Body in Neon Lime #CCFF00 -->
        <path d="M 42 98 L 48 80 L 68 76 L 94 76 L 114 84 L 118 98 Z" fill="#CCFF00"/>
        <!-- Tinted Windows -->
        <path d="M 52 82 L 66 78 L 66 94 L 50 94 Z" fill="#0D0E11"/>
        <path d="M 70 78 L 92 78 L 92 94 L 70 94 Z" fill="#0D0E11"/>
        <!-- Headlights & Heavy Front Bumper -->
        <rect x="112" y="86" width="6" height="10" rx="1.5" fill="#0D0E11"/>
        <circle cx="114" cy="89" r="2.5" fill="#FEF08A"/>
        <rect x="36" y="98" width="86" height="5" rx="2.5" fill="#0D0E11"/>
      </g>
      <!-- Inscription Banner -->
      <path id="nomadArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#CCFF00" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#nomadArc" startOffset="50%">TRAILMATE • EXPEDITION LAB</textPath>
      </text>
    </svg>`,
  },

  // ── 9. The Chai Guild Connoisseur ──────────────────────────────────────────
  {
    id: 'pvc-chai-connoisseur',
    badgeId: 'badge-chai-connoisseur',
    title: 'The Chai Guild Connoisseur',
    name: 'The Chai Guild Connoisseur',
    subtitle: 'Steaming Copper Kettle & Ridges',
    category: 'overland',
    sku: 'CHAI-09 // BATCH #112-C',
    durometer: '85A DUROMETER',
    material: 'MOLDED PVC SILICONE',
    rating: 'NILGIRI GUILD',
    points: 450,
    themeClass: 'pvc-theme-tea-monogram',
    milestone: '6 Estate Check-ins',
    defaultProgress: '65%',
    lore: 'Deep spruce green tactile rubber base with gold perimeter stitching, embossed hammered copper kettle with rising steam curls, and terraced tea hills.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#043629" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#F59E0B" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Terraced Tea Plantation Contour Ridges (Layer 1) -->
      <g class="pvc-relief-layer-1" stroke="#043629" stroke-width="3" fill="none">
        <path d="M 24 100 Q 80 88 136 100"/>
        <path d="M 20 114 Q 80 102 140 114"/>
        <path d="M 28 128 Q 80 116 132 128"/>
      </g>
      <!-- Embossed Guild Header -->
      <text x="80" y="38" font-family="'Impact', 'Arial Black', sans-serif" font-size="10" font-weight="900" fill="#043629" text-anchor="middle" letter-spacing="1.5" class="pvc-relief-layer-1">CHAI GUILD</text>
      <!-- Hammered Copper Kettle & Swirling Steam Curls (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Kettle Belly -->
        <ellipse cx="80" cy="98" rx="28" ry="18" fill="#D97706" stroke="#92400E" stroke-width="2"/>
        <path d="M 52 92 Q 80 78 108 92 Z" fill="#F59E0B"/>
        <!-- Lid and Finial -->
        <ellipse cx="80" cy="80" rx="10" ry="3" fill="#B45309"/>
        <circle cx="80" cy="74" r="3.5" fill="#F59E0B"/>
        <!-- Handle -->
        <path d="M 52 82 Q 34 82 38 98 Q 42 108 54 104" fill="none" stroke="#92400E" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Spout with Tea Pour -->
        <path d="M 106 90 Q 122 84 124 74 Q 124 70 118 72" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
        <!-- Swirling Fragrant Steam Curls -->
        <path d="M 74 68 Q 70 56 76 48 Q 82 40 76 34" fill="none" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
        <path d="M 86 68 Q 90 56 84 48 Q 78 40 84 34" fill="none" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
      </g>
      <!-- Inscription Banner -->
      <path id="teaArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#F59E0B" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#teaArc" startOffset="50%">NILGIRI HIGHLANDS • EST. 1888</textPath>
      </text>
    </svg>`,
  },

  // ── 10. The Sunken Reef Diver ──────────────────────────────────────────────
  {
    id: 'pvc-sunken-reef-diver',
    badgeId: 'badge-sunken-reef-diver',
    title: 'The Sunken Reef Diver',
    name: 'The Sunken Reef Diver',
    subtitle: 'Turquoise Turtle & Barrier Reef',
    category: 'coastal',
    sku: 'REEF-10 // BATCH #156-Q',
    durometer: '75A SOFT PVC',
    material: 'MOLDED PVC SILICONE',
    rating: 'DIVE 30M // SALT-PROOF',
    points: 950,
    themeClass: 'pvc-theme-reef-diver',
    milestone: '3 Coastal Reefs Explored',
    defaultProgress: '40%',
    lore: 'Deep oceanic marine rubber base with electric cyan stitching, raised sea turtle swimming over brain coral and anemones with nautical compass rose.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#0F2D35" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#14B8A6" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Nautical Compass Ticks (Layer 1) -->
      <g class="pvc-relief-layer-1" stroke="#334155" stroke-width="1.5">
        <line x1="80" y1="20" x2="80" y2="30"/>
        <line x1="80" y1="130" x2="80" y2="140"/>
        <line x1="20" y1="80" x2="30" y2="80"/>
        <line x1="130" y1="80" x2="140" y2="80"/>
      </g>
      <!-- Coral Reef Shelf (Layer 2) -->
      <path d="M 28 126 Q 40 108 56 122 Q 72 104 90 124 Q 110 110 132 126 Z" fill="#047857" class="pvc-relief-layer-2"/>
      <!-- Molded Turquoise Sea Turtle (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Carapace (Shell) -->
        <ellipse cx="80" cy="76" rx="20" ry="24" fill="#0F766E" stroke="#14B8A6" stroke-width="2"/>
        <ellipse cx="80" cy="76" rx="14" ry="18" fill="#115E59"/>
        <!-- Shell Scute Pattern -->
        <line x1="80" y1="58" x2="80" y2="94" stroke="#14B8A6" stroke-width="1.5"/>
        <line x1="66" y1="70" x2="94" y2="70" stroke="#14B8A6" stroke-width="1.2"/>
        <line x1="66" y1="82" x2="94" y2="82" stroke="#14B8A6" stroke-width="1.2"/>
        <!-- Flippers -->
        <path d="M 64 64 Q 42 52 38 68 Q 50 78 64 74 Z" fill="#14B8A6"/>
        <path d="M 96 64 Q 118 52 122 68 Q 110 78 96 74 Z" fill="#14B8A6"/>
        <path d="M 68 94 Q 52 106 56 114 Q 66 112 72 98 Z" fill="#0D9488"/>
        <path d="M 92 94 Q 108 106 104 114 Q 94 112 88 98 Z" fill="#0D9488"/>
        <!-- Head -->
        <ellipse cx="80" cy="46" rx="7" ry="9" fill="#14B8A6"/>
        <!-- Bioluminescent Bubbles -->
        <circle cx="94" cy="40" r="3" fill="#38BDF8" opacity="0.8"/>
        <circle cx="102" cy="32" r="4.5" fill="#38BDF8" opacity="0.8"/>
        <circle cx="98" cy="22" r="2.5" fill="#E0F2FE" opacity="0.9"/>
      </g>
      <!-- Inscription Banner -->
      <path id="diveArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#14B8A6" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#diveArc" startOffset="50%">ANDAMAN SANCTUARY • 30M</textPath>
      </text>
    </svg>`,
  },

  // ── 11. The Archival Chronicler ────────────────────────────────────────────
  {
    id: 'pvc-archival-chronicler',
    badgeId: 'badge-archival-chronicler',
    title: 'The Archival Chronicler',
    name: 'The Archival Chronicler',
    subtitle: 'Surveyor Theodolite & Astrolabe',
    category: 'heritage',
    sku: 'CHRONICLER-11 // BATCH #210-O',
    durometer: '90A DUROMETER',
    material: 'OBSIDIAN VULCANIZED RUBBER',
    rating: 'VELCRO BACK // EXPEDITION',
    points: 2000,
    themeClass: 'pvc-theme-archival-obsidian',
    milestone: '50 Scrapbook Elements',
    defaultProgress: '55%',
    lore: 'Tactical obsidian and gold rubber patch with perimeter double-stitch groove, 3D molded surveyor theodolite, compass rose, crossed quills, and embossed Latin motto: INVENIEMUS VIAM.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#272A30" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#CCFF00" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Concentric Astrolabe Degree Ring -->
      <circle cx="80" cy="80" r="54" fill="none" stroke="#272A30" stroke-width="4" stroke-dasharray="3,3" class="pvc-relief-layer-1"/>
      <text x="80" y="38" font-family="'Impact', 'Arial Black', sans-serif" font-size="10" font-weight="900" fill="#CCFF00" text-anchor="middle" letter-spacing="1.8" class="pvc-relief-layer-3">CHRONICLER</text>
      <!-- Molded Theodolite & Crossed Surveyors' Quills (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Crossed Quills / Compass Beams -->
        <line x1="45" y1="115" x2="115" y2="45" stroke="#E2E8F0" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="115" y1="115" x2="45" y2="45" stroke="#E2E8F0" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Theodolite Compass Dial & Cardinal Points -->
        <circle cx="80" cy="80" r="16" fill="#181A1D" stroke="#CCFF00" stroke-width="3"/>
        <polygon points="80,56 84,76 80,73 76,76" fill="#CCFF00"/>
        <polygon points="80,104 84,84 80,87 76,84" fill="#64748B"/>
        <polygon points="56,80 76,84 73,80 76,76" fill="#64748B"/>
        <polygon points="104,80 84,84 87,80 84,76" fill="#CCFF00"/>
        <circle cx="80" cy="80" r="4" fill="#FFFFFF"/>
      </g>
      <!-- Latin Motto Inscription Banner -->
      <path id="quillArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#CCFF00" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#quillArc" startOffset="50%">INVENIEMUS VIAM AUT FACIEMUS</textPath>
      </text>
    </svg>`,
  },

  // ── 12. The Phantom Trail Whisperer ────────────────────────────────────────
  {
    id: 'pvc-phantom-trail-whisperer',
    badgeId: 'badge-phantom-trail-whisperer',
    title: 'The Phantom Trail Whisperer',
    name: 'The Phantom Trail Whisperer',
    subtitle: 'Sedona Sandstone Dune Crawler',
    category: 'overland',
    sku: 'CRAWLER-12 // BATCH #777-R',
    durometer: '90A DUROMETER',
    material: 'MOLDED PVC',
    rating: 'UV RESISTANT',
    points: 3000,
    themeClass: 'pvc-theme-sunset-crawler',
    milestone: '5+ Secret Geocaches',
    defaultProgress: '20%',
    lore: 'Multi-layer molded PVC disk with stepped sunset speed-lines, bold cream 3D lettering, and a cyan & crimson 4x4 rig crawling up sandstone slickrock ledges.',
    svg: `<svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Recessed Perimeter Stitch Trench -->
      <circle cx="80" cy="80" r="74" fill="none" stroke="#2C2F36" stroke-width="3" class="pvc-relief-layer-1"/>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#F97316" stroke-width="1.6" stroke-dasharray="3.5,3" opacity="0.85"/>
      <!-- Stepped Sunset Speed-Lines (Layer 1) -->
      <g class="pvc-relief-layer-1">
        <path d="M 30 52 L 130 52 L 124 44 L 36 44 Z" fill="#F59E0B"/>
        <path d="M 34 62 L 126 62 L 122 56 L 38 56 Z" fill="#EA580C"/>
        <path d="M 40 72 L 120 72 L 116 66 L 44 66 Z" fill="#DC2626"/>
      </g>
      <!-- Embossed 3D OFF ROAD Caps -->
      <text x="80" y="40" font-family="'Impact', 'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#FFFBEB" stroke="#D97706" stroke-width="0.8" text-anchor="middle" letter-spacing="1.5" class="pvc-relief-layer-3">OFF ROAD</text>
      <!-- Sandstone Slickrock Terrain Ledges (Layer 2) -->
      <path d="M 22 122 L 45 98 L 78 104 L 108 92 L 138 122 Z" fill="#9A3412" class="pvc-relief-layer-2"/>
      <path d="M 45 106 L 72 108 L 98 98 L 126 122 L 35 122 Z" fill="#7C2D12" class="pvc-relief-layer-2"/>
      <!-- Cyan & Crimson Crawler Rig (Layer 3 - High Relief) -->
      <g class="pvc-relief-layer-3">
        <!-- Big Grippy Tires -->
        <circle cx="50" cy="100" r="14" fill="#0F172A" stroke="#334155" stroke-width="3"/>
        <circle cx="106" cy="94" r="14" fill="#0F172A" stroke="#334155" stroke-width="3"/>
        <circle cx="50" cy="100" r="5" fill="#06B6D4"/>
        <circle cx="106" cy="94" r="5" fill="#06B6D4"/>
        <!-- Body in Cyan & Crimson -->
        <path d="M 42 90 L 52 74 L 84 72 L 102 78 L 112 90 Z" fill="#06B6D4"/>
        <path d="M 40 90 L 40 82 L 54 82 L 54 90 Z" fill="#E11D48"/>
        <!-- Windows & Frame -->
        <rect x="56" y="75" width="12" height="12" rx="2" fill="#0F172A"/>
        <rect x="72" y="75" width="14" height="12" rx="2" fill="#0F172A"/>
        <rect x="36" y="92" width="76" height="5" rx="2.5" fill="#1E293B"/>
      </g>
      <!-- Inscription Banner -->
      <path id="crawlerArc" d="M 28 138 A 58 58 0 0 0 132 138" fill="none"/>
      <text font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="bold" fill="#F59E0B" letter-spacing="1.5" text-anchor="middle">
        <textPath href="#crawlerArc" startOffset="50%">TRAILMATE • ALL-TERRAIN GUILD</textPath>
      </text>
    </svg>`,
  },
];

/**
 * Normalizes input earned badge identifiers into a Set for fast lookup.
 * @param {Set|Array|string} earnedIds
 * @returns {Set<string>}
 */
function toEarnedSet(earnedIds) {
  if (!earnedIds) return new Set();
  if (earnedIds instanceof Set) return earnedIds;
  if (Array.isArray(earnedIds)) return new Set(earnedIds);
  return new Set([String(earnedIds)]);
}

/**
 * Resolves a patch item by ID (matches patch ID, badgeId, or altBadgeId)
 * and decorates it with earned status and dynamic progress.
 *
 * @param {string} id - Patch ID or Badge ID
 * @param {Set|Array|string} [earnedIds] - Collection of earned badge IDs
 * @returns {object|null} Decorated patch item or null if not found
 */
export function getPvcPatchById(id, earnedIds) {
  if (!id) return null;
  const targetId = String(id).trim();
  const rawPatch = PVC_PATCHES_CATALOG.find(
    p => p.id === targetId || p.badgeId === targetId || p.altBadgeId === targetId
  );
  if (!rawPatch) return null;

  const earnedSet = toEarnedSet(earnedIds);
  const isEarned =
    earnedSet.has(rawPatch.badgeId) ||
    earnedSet.has(rawPatch.id) ||
    (rawPatch.altBadgeId && earnedSet.has(rawPatch.altBadgeId));

  return {
    ...rawPatch,
    isEarned: Boolean(isEarned),
    progress: isEarned ? '100%' : (rawPatch.defaultProgress || '30%'),
  };
}

/**
 * Returns the entire decorated catalog of all 12 patches with real-time
 * earned status and progress based on user profile state.
 *
 * @param {Set|Array} [earnedBadgeIds]
 * @returns {Array<object>} Decorated patch objects
 */
export function getPvcPatchesCatalog(earnedBadgeIds) {
  const earnedSet = toEarnedSet(earnedBadgeIds);
  return PVC_PATCHES_CATALOG.map(p => {
    const isEarned =
      earnedSet.has(p.badgeId) ||
      earnedSet.has(p.id) ||
      (p.altBadgeId && earnedSet.has(p.altBadgeId));

    return {
      ...p,
      isEarned: Boolean(isEarned),
      progress: isEarned ? '100%' : (p.defaultProgress || '30%'),
    };
  });
}

export default PVC_PATCHES_CATALOG;
