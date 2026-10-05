/**
 * CommunityView.js — Modular View Renderer for Community Feed, Quests & Traveler Passport
 */

import { communityService, BADGES_CATALOG, LOCATION_QUESTS } from '../services/CommunityService.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderCommunityView(container, { switchView, store, openPassportModal }) {
  let activeTab = 'feed'; // 'feed' | 'quests' | 'badges'

  function render() {
    const profile = communityService.getProfile();
    const earnedBadgeIds = new Set(communityService.getEarnedBadgeIds());
    const completedQuestIds = new Set(communityService.getCompletedQuestIds());
    const posts = communityService.getPosts();

    container.innerHTML = `
      <div class="community-container">
        <!-- Top Sticky Header Navigation Bar -->
        <header class="community-header">
          <div class="flex items-center gap-3">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#5B8C7B] bg-[#5B8C7B]/10 px-2 py-0.5 rounded-full">GLOBAL EXPEDITIONS</span>
                <span class="text-[10px] text-neutral-500 font-mono">Level ${profile.level || 1} Adventurer</span>
              </div>
              <h1 class="text-base sm:text-lg font-bold text-neutral-900 font-headline-md tracking-tight">
                Trailmate Community &amp; Quests
              </h1>
            </div>
          </div>

          <!-- Center Navigation Tabs -->
          <nav class="community-tabs-nav" aria-label="Community Sections">
            <button class="community-tab-btn ${activeTab === 'feed' ? 'active' : ''}" data-tab="feed">
              <span class="material-symbols-outlined text-sm">dynamic_feed</span>
              <span>Expedition Feed</span>
            </button>
            <button class="community-tab-btn ${activeTab === 'quests' ? 'active' : ''}" data-tab="quests">
              <span class="material-symbols-outlined text-sm">explore</span>
              <span>Coordinate Quests</span>
            </button>
            <button class="community-tab-btn ${activeTab === 'badges' ? 'active' : ''}" data-tab="badges">
              <span class="material-symbols-outlined text-sm">military_tech</span>
              <span>Badges &amp; Hall</span>
            </button>
          </nav>

          <!-- Right Action: Open Traveler Passport & Publish -->
          <div class="flex items-center gap-2">
            <button id="btnPublishToCommunity" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8b4513] text-white rounded-xl text-xs font-bold hover:bg-[#703810] shadow-xs transition-all cursor-pointer">
              <span class="material-symbols-outlined text-xs">add_photo_alternate</span>
              <span>Share Journey</span>
            </button>
            <button id="btnViewMyPassport" class="flex items-center gap-2 p-1.5 rounded-xl border border-[#BFA895]/40 hover:bg-white transition-all cursor-pointer" title="View Traveler Passport">
              <img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}" class="w-7 h-7 rounded-full object-cover border border-[#BFA895]/50" />
              <div class="text-left hidden lg:block pr-1">
                <p class="text-[11px] font-bold text-neutral-900 leading-none">${escapeHtml(profile.name)}</p>
                <p class="text-[9px] font-mono text-[#C4703D] mt-0.5">${profile.xp || 0} XP</p>
              </div>
            </button>
          </div>
        </header>

        <!-- Main Scrollable Section -->
        <main class="community-scroll-body">
          <div class="max-w-4xl mx-auto">
            ${activeTab === 'feed' ? renderFeedTab(posts, profile) : ''}
            ${activeTab === 'quests' ? renderQuestsTab(completedQuestIds) : ''}
            ${activeTab === 'badges' ? renderBadgesTab(earnedBadgeIds, profile) : ''}
          </div>
        </main>
      </div>
    `;

    bindEvents();
  }

  // ── 1. Expedition Feed Tab ──────────────────────────────────────────────────
  function renderFeedTab(posts, profile) {
    return `
      <!-- Community Feed Header Banner -->
      <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#F4EDE1] to-[#EAE2D2] border border-[#BFA895]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-bold text-neutral-900 font-headline-md">Inspiration from Fellow Explorers</h3>
          <p class="text-xs text-neutral-600 mt-0.5">Handcrafted scrapbooks, authentic coordinate field notes, and cloneable day-by-day itineraries.</p>
        </div>
        <div class="flex items-center gap-1.5 self-start sm:self-auto">
          <span class="text-[10px] font-mono bg-white/80 px-2.5 py-1 rounded-full border border-[#BFA895]/30 text-neutral-700">
            📖 ${posts.length} Stories Posted
          </span>
        </div>
      </div>

      <!-- Feed Posts Stream -->
      <div class="space-y-6">
        ${posts.map(post => `
          <article class="community-post-card" data-post-id="${post.id}">
            <!-- Author Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img src="${escapeHtml(post.author.avatar)}" alt="${escapeHtml(post.author.name)}" class="w-10 h-10 rounded-full object-cover border border-[#BFA895]/50 shadow-xs" />
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-bold text-neutral-900">${escapeHtml(post.author.name)}</h4>
                    <span class="text-[10px] text-neutral-500 font-mono">${escapeHtml(post.author.handle)}</span>
                  </div>
                  <!-- Bio Tag Pills (Instagram-style micro tags) -->
                  <div class="flex flex-wrap gap-1 mt-1">
                    ${(post.author.bioTags || []).map(tag => `
                      <span class="bio-tag-pill">#${escapeHtml(tag)}</span>
                    `).join('')}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-mono text-neutral-500">${escapeHtml(post.timestamp)}</span>
                <span class="block text-[9px] font-mono font-bold uppercase text-[#5B8C7B] bg-[#5B8C7B]/10 px-2 py-0.5 rounded-full mt-0.5">${escapeHtml(post.type)}</span>
              </div>
            </div>

            <!-- Post Body -->
            <div class="mt-3">
              <div class="flex items-center gap-1.5 text-xs font-bold text-[#8B4513] mb-1">
                <span class="material-symbols-outlined text-sm">location_on</span>
                <span>${escapeHtml(post.destination)}</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-neutral-900 font-headline-md">${escapeHtml(post.title)}</h3>
              <p class="text-xs text-neutral-700 mt-1.5 leading-relaxed">${escapeHtml(post.content)}</p>
            </div>

            <!-- Visual Media Attachment -->
            ${post.heroImage ? `
              <div class="post-media-frame group">
                <img src="${escapeHtml(post.heroImage)}" alt="${escapeHtml(post.title)}" loading="lazy" />
                <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">auto_awesome</span>
                  <span>Made in Scrapbook Studio</span>
                </div>
              </div>
            ` : ''}

            <!-- Itinerary Waypoints Snippet -->
            ${(post.itinerarySnippet && post.itinerarySnippet.length > 0) ? `
              <div class="p-3 bg-[#F6F3EE] rounded-xl border border-[#BFA895]/25 my-3">
                <span class="text-[9.5px] font-mono font-bold uppercase text-neutral-500 block mb-1.5">HIGHLIGHT WAYPOINTS:</span>
                <div class="flex flex-wrap gap-1.5">
                  ${post.itinerarySnippet.map(stop => `
                    <span class="text-[10.5px] font-medium bg-white px-2 py-0.5 rounded-md border border-black/5 text-neutral-800">
                      📍 ${escapeHtml(stop)}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Footer: Like, Comment, Clone -->
            <div class="pt-3 border-t border-[#BFA895]/20 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <button class="btn-like-post flex items-center gap-1.5 text-neutral-700 hover:text-red-600 transition-colors cursor-pointer ${post.isLiked ? 'text-red-600 font-bold' : ''}" data-id="${post.id}">
                  <span class="material-symbols-outlined text-base ${post.isLiked ? 'material-fill' : ''}">favorite</span>
                  <span class="font-mono">${post.likes}</span>
                </button>
                <button class="btn-comment-toggle flex items-center gap-1.5 text-neutral-700 hover:text-[#5B8C7B] transition-colors cursor-pointer" data-id="${post.id}">
                  <span class="material-symbols-outlined text-base">chat_bubble</span>
                  <span class="font-mono">${(post.comments || []).length}</span>
                </button>
              </div>
              <button class="btn-clone-itinerary text-[11px] font-bold text-[#8b4513] hover:text-[#703810] flex items-center gap-1 cursor-pointer" data-dest="${escapeHtml(post.destination)}">
                <span>Plan Trip to ${escapeHtml(post.destination)}</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <!-- Comment Stream -->
            <div class="mt-3 pt-3 border-t border-black/5 space-y-2" id="comments-${post.id}">
              ${(post.comments || []).map(c => `
                <div class="text-[11px] bg-white/70 p-2 rounded-lg border border-black/5">
                  <strong class="text-neutral-900">${escapeHtml(c.author)}:</strong>
                  <span class="text-neutral-700 ml-1">${escapeHtml(c.text)}</span>
                </div>
              `).join('')}
              <form class="comment-form flex gap-1.5 mt-2" data-id="${post.id}">
                <input type="text" class="flex-1 text-xs p-2 rounded-lg border border-[#BFA895]/40 bg-white" placeholder="Leave a note or ask a question..." required />
                <button type="submit" class="px-3 py-1.5 bg-[#5B8C7B] text-white rounded-lg text-xs font-bold hover:bg-[#4a7264] cursor-pointer">
                  Reply
                </button>
              </form>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  // ── 2. Location-Based Coordinate Quests Tab ─────────────────────────────────
  function renderQuestsTab(completedQuestIds) {
    return `
      <!-- Coordinate Quests Header Banner -->
      <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FBF3DB] to-[#F5EED8] border border-[#C4703D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#944A1A] bg-[#944A1A]/10 px-2 py-0.5 rounded-full">REAL-WORLD COORDINATE GEOCACHES</span>
          </div>
          <h3 class="text-sm font-bold text-neutral-900 font-headline-md">Secret Coordinate Expeditions &amp; Treasures</h3>
          <p class="text-xs text-neutral-600 mt-0.5">
            Check in at historic landmarks or simulate proximity GPS check-in to unlock exclusive Scrapbook Studio stickers &amp; rare wax seals!
          </p>
        </div>
        <div class="text-right self-start sm:self-auto font-mono text-xs flex-shrink-0">
          <span class="inline-block whitespace-nowrap bg-white/90 px-3 py-1.5 rounded-xl border border-[#C4703D]/25 font-bold text-[#944A1A]">
            🏆 ${completedQuestIds.size} / ${LOCATION_QUESTS.length} Treasures Claimed
          </span>
        </div>
      </div>

      <!-- Quests Grid -->
      <div class="quest-grid">
        ${LOCATION_QUESTS.map(q => {
          const isDone = completedQuestIds.has(q.id);
          return `
            <div class="quest-card ${isDone ? 'is-unlocked' : ''}" data-quest-id="${q.id}">
              <div class="quest-hero-banner">
                <img src="${escapeHtml(q.coverPhoto)}" alt="${escapeHtml(q.title)}" />
                <div class="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                  📍 ${escapeHtml(q.destination)}
                </div>
                <div class="absolute top-2.5 right-2.5 ${isDone ? 'bg-[#5B8C7B]' : 'bg-[#C4703D]'} text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                  ${isDone ? '✓ CLAIMED' : `+${q.xp} XP`}
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-neutral-900 font-headline-md">${escapeHtml(q.title)}</h4>
                  <p class="text-[11px] font-mono text-[#8B4513] font-semibold mt-0.5">${escapeHtml(q.subtitle)}</p>
                  
                  <div class="my-2.5 p-2.5 rounded-xl bg-[#F6F3EE] border border-black/5 text-[10.5px] text-neutral-700 leading-relaxed">
                    <strong class="text-neutral-900">Clue:</strong> ${escapeHtml(q.hint)}
                  </div>

                  <div class="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-3">
                    <span>GPS: ${q.lat.toFixed(4)}° N, ${q.lng.toFixed(4)}° E</span>
                    <span>Difficulty: <strong>${escapeHtml(q.difficulty)}</strong></span>
                  </div>
                </div>

                <div class="pt-3 border-t border-black/5">
                  <div class="mb-3">
                    <span class="text-[9px] font-mono uppercase text-neutral-500 block mb-1">REWARD UNLOCK:</span>
                    <div class="quest-reward-pill">
                      <span>${escapeHtml(q.reward.name)}</span>
                    </div>
                  </div>

                  <button class="btn-claim-quest w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${isDone ? 'bg-[#5B8C7B]/20 text-[#2E4433] border border-[#5B8C7B]/30' : 'bg-[#8B4513] text-white hover:bg-[#703810] active:scale-98'}" data-id="${q.id}">
                    <span class="material-symbols-outlined text-sm">${isDone ? 'check_circle' : 'my_location'}</span>
                    <span>${isDone ? 'Treasure Already in Scrapbook' : 'Check In & Unlock Treasure'}</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ── 3. Badges & Hall of Fame Tab (Built with Stitch 3D Medallions) ─────────
  function renderBadgesTab(earnedBadgeIds, profile) {
    const MEDALLION_DATA = [
      {
        id: 'card-first-step',
        badgeId: 'badge-first-step',
        name: 'First Step',
        epigraph: '"Every thousand-league odyssey commences with unlacing the boots."',
        points: 250,
        metal: 'BRONZE • 1904',
        rimClass: 'rim-bronze',
        bgClass: 'from-[#8C4A21] via-[#5A2C11] to-[#361807]',
        icon: 'explore',
        iconColor: '#F7CCA7',
        textColor: '#F9DFCD',
        borderColor: 'border-brass/50',
        rarity: 'Common (94.2% of scouts)',
        unlockedAt: 'Nilgiri Highlands, Day 1',
        bonus: '+5% Packing Optimizer speed',
        cast: '#001-A',
        lore: 'The Wayfarer\'s Initial Compass: Conferred upon launching your maiden AI itinerary with Trailmate. The bronze alloy symbolizes grounding, tactile parchment maps, and initial curiosity.',
        milestone: '1/1 Itinerary Completed',
        progress: '100%',
        isEarned: earnedBadgeIds.has('badge-first-step'),
      },
      {
        id: 'card-trail-pioneer',
        badgeId: 'badge-trail-pioneer',
        name: 'Trail Pioneer',
        epigraph: '"Guiding expeditions across unchartered ridges under cold starlight."',
        points: 600,
        metal: 'SILVER • ASTRO',
        rimClass: 'rim-silver',
        bgClass: 'from-[#4A4E53] via-[#2F3235] to-[#1C1D1E]',
        icon: 'timelapse',
        iconColor: '#E2E8F0',
        textColor: '#FFFFFF',
        borderColor: 'border-sand/60',
        rarity: 'Uncommon (38.7%)',
        unlockedAt: 'Doddabetta Peak, Manali Pass',
        bonus: '+10% Offline Route Accuracy',
        cast: '#019-B',
        lore: 'The Sterling Celestial Astrolabe: Conferred upon travelers who ventured beyond major tourist circuits into remote nature preserves and high mountain passes without losing itinerary sync.',
        milestone: '5 Off-Grid Trails Navigated',
        progress: '100%',
        isEarned: earnedBadgeIds.has('badge-trail-pioneer'),
      },
      {
        id: 'card-scrapbook-artisan',
        badgeId: 'badge-scrapbook-artisan',
        name: 'Scrapbook Artisan',
        epigraph: '"Preserving the fragrance of pine and wet soil through ink, tape, and seals."',
        points: 1200,
        metal: 'GOLD • ARTISAN',
        rimClass: 'rim-gold',
        bgClass: 'from-[#694E15] via-[#483308] to-[#271B04]',
        icon: 'history_edu',
        iconColor: '#FCD34D',
        textColor: '#FEF3C7',
        borderColor: 'border-amber-200/60',
        rarity: 'Rare (18.1%)',
        unlockedAt: 'Willy\'s Coffee Pub, Ooty',
        bonus: 'Unlocks 12 Heritage Washi Stamped Tapes',
        cast: '#082-G',
        lore: 'The Gilded Quill & Wax Seal: Awarded to chroniclers who turn basic trip logs into rich field scrapbooks using decorative washi tapes, botanical stickers, and handwritten margin quotes.',
        milestone: '25 Journal Notes & Stickers',
        progress: earnedBadgeIds.has('badge-scrapbook-artisan') ? '100%' : '60%',
        isEarned: earnedBadgeIds.has('badge-scrapbook-artisan'),
      },
      {
        id: 'card-treasure-hunter',
        badgeId: 'badge-treasure-hunter',
        name: 'Treasure Hunter',
        epigraph: '"Unearthing covert stepwells, tucked-away bakeries, and silent coves."',
        points: 1800,
        metal: 'EMERALD • GPS',
        rimClass: 'rim-emerald',
        bgClass: 'from-[#165140] via-[#0D382B] to-[#062018]',
        icon: 'diamond',
        iconColor: '#6EE7B7',
        textColor: '#D1FAE5',
        borderColor: 'border-emerald-300/60',
        rarity: 'Very Rare (9.4%)',
        unlockedAt: 'Panna Meena ka Kund, Jaipur',
        bonus: '+15% Local Secret recommendations',
        cast: '#104-E',
        lore: 'The Emerald Geocache Jewel: Conferred when discovering secret coordinate destinations indexed in local lore. Verified via real-world coordinate geocache check-ins.',
        milestone: 'Secret Coordinates Claimed',
        progress: earnedBadgeIds.has('badge-treasure-hunter') ? '100%' : '40%',
        isEarned: earnedBadgeIds.has('badge-treasure-hunter'),
      },
      {
        id: 'card-cartographer',
        badgeId: 'badge-cartographer',
        name: 'Grand Cartographer',
        epigraph: '"Mapping three complete ecological biomes: Coast, Alpine, & Desert."',
        points: 2500,
        metal: 'SAPPHIRE • 80%',
        rimClass: 'rim-sapphire',
        bgClass: 'from-[#183965] via-[#102747] to-[#071324]',
        icon: 'public',
        iconColor: '#7DD3FC',
        textColor: '#E0F2FE',
        borderColor: 'border-sky-300/60',
        rarity: 'Exotic (4.1%)',
        unlockedAt: 'Survey Multi-Region Expedition',
        bonus: 'Unlocks Satellite Terrain Contour Layers',
        cast: '#220-S',
        lore: 'The Sapphire Sextant: Requires surveying and logging multi-day expeditions spanning different geographical topographies: Coastal bays, Himalayan elevations, and desert sands.',
        milestone: '3 Diverse Biomes Explored',
        progress: earnedBadgeIds.has('badge-cartographer') ? '100%' : '75%',
        isEarned: earnedBadgeIds.has('badge-cartographer'),
      },
      {
        id: 'card-local-legend',
        badgeId: 'badge-local-legend',
        name: 'Local Legend',
        epigraph: '"Beloved by local chai masters and mountain trail guides alike."',
        points: 3500,
        metal: 'TERRACOTTA • GUILD',
        rimClass: 'rim-terracotta',
        bgClass: 'from-[#692911] via-[#461907] to-[#250B02]',
        icon: 'local_fire_department',
        iconColor: '#FDBA74',
        textColor: '#FFEDD5',
        borderColor: 'border-orange-300/50',
        rarity: 'Legendary (1.2%)',
        unlockedAt: 'Top Community Expedition Hall',
        bonus: 'Featured in Global Explorer Dossier',
        cast: '#999-L',
        lore: 'The Flaming Guild Torch: Reserved for master chroniclers whose expedition dispatches inspire travelers worldwide. Conferred upon active community contributions and quest completions.',
        milestone: 'High Community Praise & Shares',
        progress: earnedBadgeIds.has('badge-local-legend') ? '100%' : '50%',
        isEarned: earnedBadgeIds.has('badge-local-legend'),
      },
    ];

    return `
      <!-- Deep-Grooved XP Master Gauge (from Stitch design) -->
      <section class="mb-8 p-6 rounded-3xl bg-[#F6F1E8] border border-[#BFA895]/40 shadow-sm relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span class="text-[10px] font-mono font-bold tracking-widest uppercase text-[#8B4513] bg-[#8B4513]/10 px-2.5 py-0.5 rounded-full">
              EXPEDITIONARY DOSSIER
            </span>
            <h2 class="text-xl sm:text-2xl font-bold font-headline-md text-neutral-900 mt-1">
              Level ${profile.level || 1} • Master Wayfarer
            </h2>
            <p class="text-xs text-neutral-600 font-serif italic mt-0.5">
              Accumulating field XP unlocks metallic medallion reliefs and vintage scrapbook embellishments.
            </p>
          </div>
          <div class="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <span class="px-3 py-1.5 rounded-xl bg-white border border-[#BFA895]/40 font-bold text-[#8B4513]">
              ⚡ ${profile.xp || 0} Total XP
            </span>
            <span class="px-3 py-1.5 rounded-xl bg-[#5B8C7B]/15 border border-[#5B8C7B]/30 font-bold text-[#2E4433]">
              🎖️ ${earnedBadgeIds.size} / ${MEDALLION_DATA.length} Medallions Cast
            </span>
          </div>
        </div>

        <!-- 3D Progress Bar Track -->
        <div class="h-4 w-full bg-sand/60 rounded-full p-0.5 border border-[#BFA895]/50 relative overflow-hidden shadow-inner">
          <div class="h-full rounded-full bg-gradient-to-r from-[#C4703D] via-[#C99A45] to-[#5B8C7B] relative transition-all duration-700" style="width: ${Math.min(100, Math.max(15, ((profile.xp || 680) % 1000) / 10))}%;">
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div class="flex justify-between items-center text-[10px] font-mono text-neutral-500 mt-2">
          <span>Tier I: Scout</span>
          <span class="text-[#8B4513] font-bold">Progressing toward Cartographer Sovereign</span>
          <span>Tier V: Legend</span>
        </div>
      </section>

      <!-- 6 Hand-Cast Relic Medallions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${MEDALLION_DATA.map(m => `
          <div class="medallion-card medallion-perspective group" id="${m.id}">
            <div class="medallion-inner relative w-full h-[470px]">

              <!-- FRONT FACE -->
              <div class="face-front absolute inset-0 bg-[#FAF6F0] rounded-3xl border border-[#BFA895]/50 p-5 flex flex-col justify-between shadow-md transition-all group-hover:border-[#C4703D]/60">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${m.isEarned ? 'bg-[#5B8C7B]/15 text-[#2E4433] border border-[#5B8C7B]/30' : 'bg-black/5 text-neutral-500 border border-black/10'}">
                    <span class="material-symbols-outlined text-[13px]">${m.isEarned ? 'check_circle' : 'lock'}</span>
                    <span>${m.isEarned ? 'UNLOCKED' : 'IN PROGRESS'}</span>
                  </span>
                  <span class="text-xs font-mono font-bold text-[#8B4513] bg-white px-2 py-0.5 rounded-md border border-[#BFA895]/40">
                    +${m.points} XP
                  </span>
                </div>

                <!-- 3D Beveled Coin Centerpiece -->
                <div class="flex flex-col items-center justify-center my-auto py-2">
                  <div class="relative w-32 h-32 rounded-full ${m.rimClass} p-2 coin-relief shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    <div class="w-full h-full rounded-full bg-gradient-to-b ${m.bgClass} p-2 flex items-center justify-center border-2 ${m.borderColor} relative overflow-hidden">
                      <svg class="absolute inset-0 w-full h-full opacity-35 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                        <circle cx="50" cy="50" r="44" stroke-dasharray="2 3" stroke-width="1.2"/>
                        <circle cx="50" cy="50" r="39" stroke-width="0.8"/>
                      </svg>
                      <div class="relative z-10 text-center" style="color: ${m.textColor}">
                        <span class="material-symbols-outlined text-4xl drop-shadow-md" style="color: ${m.iconColor}">${m.icon}</span>
                        <div class="text-[8.5px] font-mono tracking-widest uppercase mt-0.5 font-bold opacity-90">${m.metal}</div>
                      </div>
                    </div>
                  </div>

                  <h3 class="font-serif font-bold text-base text-neutral-900 mt-3 text-center font-headline-md">${escapeHtml(m.name)}</h3>
                  <p class="text-[11px] text-neutral-600 font-serif italic text-center px-2 mt-0.5 leading-snug">${m.epigraph}</p>
                </div>

                <!-- Card Bottom: Progress & Flip Trigger -->
                <div class="border-t border-[#BFA895]/30 pt-3 space-y-2">
                  <div class="flex justify-between items-center text-[10.5px] font-mono text-neutral-600">
                    <span class="truncate max-w-[180px]">${m.milestone}</span>
                    <span class="font-bold text-[#5B8C7B]">${m.progress}</span>
                  </div>
                  <div class="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div class="h-full bg-[#5B8C7B] rounded-full" style="width: ${m.progress}"></div>
                  </div>
                  <button type="button" class="btn-flip-medallion w-full mt-1 py-1.5 rounded-xl border border-[#BFA895]/40 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer" data-card="${m.id}">
                    <span class="material-symbols-outlined text-sm text-[#C4703D]">sync</span>
                    <span>Inspect Medallion Relief</span>
                  </button>
                </div>
              </div>

              <!-- BACK FACE (Historical Inscription & Lore) -->
              <div class="face-back absolute inset-0 bg-[#252826] text-white rounded-3xl p-5 flex flex-col justify-between shadow-xl border border-neutral-700">
                <div>
                  <div class="flex items-center justify-between border-b border-white/15 pb-2.5">
                    <span class="text-[9.5px] font-mono tracking-widest uppercase text-[#D4AF37]">Historical Inscription</span>
                    <span class="text-xs font-mono text-neutral-400">CAST: ${m.cast}</span>
                  </div>
                  <h4 class="font-serif font-bold text-sm text-[#F7CCA7] mt-3 font-headline-md">${escapeHtml(m.name)}</h4>
                  <p class="text-[11px] text-neutral-300 font-serif leading-relaxed mt-1.5">${m.lore}</p>

                  <div class="mt-3.5 p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 text-[10px] font-mono">
                    <div class="flex justify-between"><span class="text-neutral-400">Unlocked At:</span><span class="text-white">${m.unlockedAt}</span></div>
                    <div class="flex justify-between"><span class="text-neutral-400">Rarity:</span><span class="text-[#D4AF37]">${m.rarity}</span></div>
                    <div class="flex justify-between"><span class="text-neutral-400">Bonus Perk:</span><span class="text-[#6EE7B7]">${m.bonus}</span></div>
                  </div>
                </div>

                <button type="button" class="btn-flip-medallion w-full py-2 rounded-xl bg-white text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-neutral-100 transition-colors cursor-pointer" data-card="${m.id}">
                  <span class="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Return to Showcase</span>
                </button>
              </div>

            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Event Bindings ──────────────────────────────────────────────────────────
  function bindEvents() {
    // Tab Switching
    container.querySelectorAll('.community-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render();
      });
    });

    // Passport Button Click
    document.getElementById('btnViewMyPassport')?.addEventListener('click', () => {
      if (typeof openPassportModal === 'function') {
        openPassportModal();
      }
    });

    // Share / Publish Button
    document.getElementById('btnPublishToCommunity')?.addEventListener('click', () => {
      promptPublishDialog();
    });

    // Likes
    container.querySelectorAll('.btn-like-post').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        communityService.toggleLike(id);
        render();
      });
    });

    // Comments Submit
    container.querySelectorAll('.comment-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.dataset.id;
        const input = form.querySelector('input');
        if (input && input.value.trim()) {
          communityService.addComment(id, input.value.trim());
          render();
        }
      });
    });

    // Clone Itinerary / Plan Trip to Destination
    container.querySelectorAll('.btn-clone-itinerary').forEach(btn => {
      btn.addEventListener('click', () => {
        const dest = btn.dataset.dest;
        store.setState({ trip: { ...store.getState().trip, destination: dest } });
        switchView('chat');
        store.pushMessage({
          role: 'user',
          text: `I loved the community story about ${dest}! Can you plan an itinerary for ${dest}?`,
        });
      });
    });

    // Claim Quest / Proximity Check-in
    container.querySelectorAll('.btn-claim-quest').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const res = communityService.unlockQuest(id);
        if (res) {
          render();
          showQuestUnlockedModal(res.quest, res.isFirstTime);
        }
      });
    });

    // 3D Medallion Flip Buttons
    container.querySelectorAll('.btn-flip-medallion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = btn.dataset.card;
        const cardEl = document.getElementById(cardId);
        if (cardEl) {
          cardEl.classList.toggle('flipped');
        }
      });
    });
  }

  // Publish Dialog
  function promptPublishDialog() {
    const trip = store.getState().trip || {};
    const dest = trip.destination || 'Goa';
    const title = prompt(`Share your journey to ${dest}: Enter a title`, `My Handcrafted ${dest} Expedition`);
    if (!title) return;
    const story = prompt(`Add a personal note or recommendation for fellow travelers:`, `Discovered amazing local cafes, sunset view ramparts, and quiet nature trails.`);
    if (!story) return;

    communityService.createPost({
      title,
      content: story,
      destination: dest,
      type: 'scrapbook',
      heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=82',
      itinerarySnippet: [dest + ' Old Town', dest + ' Sights', dest + ' Culinary Trail'],
    });

    render();
  }

  // Quest Reward Celebration Modal
  function showQuestUnlockedModal(quest, isFirstTime) {
    const modalHtml = `
      <div class="text-center p-2">
        <div class="w-16 h-16 rounded-full bg-[#C4703D]/15 text-[#C4703D] flex items-center justify-center mx-auto mb-3 shadow-inner">
          <span class="material-symbols-outlined text-3xl">military_tech</span>
        </div>
        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C4703D] bg-[#C4703D]/10 px-2.5 py-0.5 rounded-full">
          TREASURE UNLOCKED!
        </span>
        <h3 class="text-lg font-bold text-neutral-900 font-headline-md mt-2">${escapeHtml(quest.title)}</h3>
        <p class="text-xs text-neutral-600 mt-1">Coordinates: ${quest.lat.toFixed(4)}° N, ${quest.lng.toFixed(4)}° E</p>

        <div class="my-4 p-3.5 rounded-xl bg-[#F4EDE1] border border-[#BFA895]/40 text-left">
          <span class="text-[9.5px] font-mono font-bold uppercase text-[#8B4513] block mb-1">REWARD CLAIMED:</span>
          <p class="text-xs font-bold text-neutral-900">${escapeHtml(quest.reward.name)}</p>
          <p class="text-[10.5px] text-neutral-600 mt-0.5">${escapeHtml(quest.reward.preview)}</p>
        </div>

        <div class="flex gap-2">
          <button id="btnGoToScrapbookFromQuest" class="flex-1 py-2.5 bg-[#8b4513] text-white rounded-xl text-xs font-bold hover:bg-[#703810] cursor-pointer">
            Open in Scrapbook Studio
          </button>
          <button id="btnCloseQuestNotice" class="py-2.5 px-4 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer">
            Awesome!
          </button>
        </div>
      </div>
    `;

    const appModal = document.getElementById('appModal');
    const modalBody = document.getElementById('modalBody');
    if (appModal && modalBody) {
      modalBody.innerHTML = modalHtml;
      appModal.classList.remove('hidden');

      document.getElementById('btnCloseQuestNotice')?.addEventListener('click', () => {
        appModal.classList.add('hidden');
      });
      document.getElementById('btnGoToScrapbookFromQuest')?.addEventListener('click', () => {
        appModal.classList.add('hidden');
        switchView('scrapbook');
      });
    }
  }

  // Initial render
  render();
}
