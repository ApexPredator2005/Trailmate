/**
 * CommunityView.js — Modular View Renderer for Community Feed, Quests & Traveler Passport
 */

import { communityService, BADGES_CATALOG, LOCATION_QUESTS } from '../services/CommunityService.js';
import { PVC_PATCHES_CATALOG, getPvcPatchesCatalog, getPvcPatchById } from '../data/PvcPatchesData.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderCommunityView(container, { switchView, store, openPassportModal }) {
  let activeTab = 'feed'; // 'feed' | 'quests' | 'badges'
  let activePvcCategory = 'all'; // 'all' | 'summit' | 'coastal' | 'overland' | 'heritage'

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

  // ── 3. Tactile 3D Molded PVC Expedition Board (12 Patches) ──────────────────
  const PATCH_PERKS = {
    'pvc-pioneers-compass': '+5% Packing Optimizer speed • Unlocks Compass Heading Overlay',
    'pvc-weekend-wanderer': '+10% Offline Route Accuracy • Topo Ridge Shading',
    'pvc-cloud-sovereign': 'Unlocks High-Altitude Alpine Weather Pack & Barometric Sensor',
    'pvc-maritime-mariner': 'Unlocks Satellite Marine Bathymetry & Coastal Tide Overlays',
    'pvc-ancient-monolith': '+15% Local Secret Archaeological & Stepwell Recommendations',
    'pvc-flaming-guild-torch': 'Featured in Global Explorer Dossier • Priority Community Pin',
    'pvc-midnight-astrologer': '+15% Night Sky Stargazing clarity & Twilight pacing',
    'pvc-high-altitude-nomad': 'Unlocks High-Altitude Overland 4x4 Trail Maps & GPS Telemetry',
    'pvc-chai-connoisseur': 'Unlocks Heritage Plantation Monograms & Vintage Tea Stamps',
    'pvc-sunken-reef-diver': 'Unlocks Tidal Chart Overlays & Marine Fauna Stickers',
    'pvc-archival-chronicler': 'Unlocks 8 Animated Dynamic Wax Seals in Scrapbook Studio',
    'pvc-phantom-trail-whisperer': 'Reveals Hidden Heritage Waypoints & Secret Scenic Overlooks',
  };

  function renderBadgesTab(earnedBadgeIds, profile) {
    const patches = getPvcPatchesCatalog(earnedBadgeIds);
    const deployedCount = patches.filter(p => p.isEarned).length;
    const totalPatches = patches.length;
    const progressPercent = Math.min(100, Math.max(10, Math.round(((profile.xp || 680) % 1000) / 10)));

    const CATEGORIES = [
      { key: 'all', label: 'All Modules', emoji: '⚡', count: patches.length },
      { key: 'summit', label: 'Summit & Alpine', emoji: '🏔️', count: patches.filter(p => p.category === 'summit').length },
      { key: 'coastal', label: 'Coastal & Marine', emoji: '🌊', count: patches.filter(p => p.category === 'coastal').length },
      { key: 'overland', label: 'Overland & Trail', emoji: '🧭', count: patches.filter(p => p.category === 'overland').length },
      { key: 'heritage', label: 'Heritage & Lore', emoji: '📜', count: patches.filter(p => p.category === 'heritage').length },
    ];

    const filteredPatches = activePvcCategory === 'all'
      ? patches
      : patches.filter(p => p.category === activePvcCategory);

    return `
      <!-- Tactical Header Stats Banner & Telemetry -->
      <section class="pvc-header-banner mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[9.5px] font-mono font-bold tracking-widest uppercase text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/25 px-2.5 py-0.5 rounded-full">
                MIL-SPEC 810G // EXPEDITION BOARD
              </span>
              <span class="text-[10px] font-mono text-neutral-400">12 Patches Catalog</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold font-headline-md text-white mt-1.5 tracking-wide">
              Level ${profile.level || 1} • Master Wayfarer
            </h2>
            <p class="text-xs text-neutral-400 font-mono mt-0.5">
              Accumulating field XP deploys 3D molded fluororubber &amp; silicone morale patches.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 self-start md:self-auto font-mono text-xs">
            <span class="pvc-telemetry-chip">
              <span class="text-[#CCFF00]">⚡</span>
              <span class="text-white font-bold">${profile.xp || 0} Total XP</span>
            </span>
            <span class="pvc-telemetry-chip border-[#CCFF00]/30 text-[#CCFF00] bg-[#CCFF00]/10 font-bold">
              <span>🎖️</span>
              <span>${deployedCount} / ${totalPatches} Patches Deployed</span>
            </span>
            <span class="pvc-telemetry-chip hidden sm:inline-flex">
              <span class="text-neutral-400">DUROMETER:</span>
              <span class="text-white">85A HIGH-TENSILE</span>
            </span>
          </div>
        </div>

        <!-- 3D Progress Bar Track -->
        <div class="relative z-10">
          <div class="h-3 w-full bg-black/60 rounded-full p-0.5 border border-white/10 relative overflow-hidden shadow-inner">
            <div class="h-full rounded-full bg-gradient-to-r from-[#CCFF00] via-[#FBBF24] to-[#FF6B00] relative transition-all duration-700" style="width: ${progressPercent}%;">
              <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div class="flex justify-between items-center text-[10px] font-mono text-neutral-400 mt-2">
            <span>Tier I: Scout</span>
            <span class="text-[#CCFF00] font-bold">${deployedCount === totalPatches ? 'All 12 Expedition Patches Deployed' : `${totalPatches - deployedCount} Modules Remaining to Deploy`}</span>
            <span>Tier V: Vanguard Sovereign</span>
          </div>
        </div>
      </section>

      <!-- Tactical Category Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        ${CATEGORIES.map(cat => `
          <button type="button" class="pvc-category-pill ${activePvcCategory === cat.key ? 'active' : ''}" data-category="${cat.key}">
            <span>${cat.emoji}</span>
            <span>${cat.label} (${cat.count})</span>
          </button>
        `).join('')}
      </div>

      <!-- 12 Tactile 3D Molded PVC Expedition Patches Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filteredPatches.map(p => {
          const perk = p.perk || PATCH_PERKS[p.id] || '+10% Expedition Capability';
          const batchNo = p.sku && p.sku.includes('//') ? p.sku.split('//')[1].trim() : p.sku;
          const skuCode = p.sku && p.sku.includes('//') ? p.sku.split('//')[0].trim() : p.sku;
          return `
            <div class="pvc-patch-card" id="${p.id}">
              <div class="pvc-card-inner">

                <!-- FRONT FACE: Tactile Molded Rubber Face -->
                <div class="pvc-face-front ${p.themeClass} border-2 ${p.isEarned ? 'border-[#CCFF00]/40' : 'border-[#2A2E35]'}">
                  <!-- Tactical Top Bar: SKU, Status, XP -->
                  <div class="flex items-center justify-between z-10">
                    <span class="text-[9px] font-mono font-bold text-neutral-400 tracking-wider">
                      ${escapeHtml(skuCode)}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md ${p.isEarned ? 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40' : 'bg-white/5 text-neutral-400 border border-white/10'}">
                        ${p.isEarned ? '✓ DEPLOYED' : 'IN PROGRESS'}
                      </span>
                      <span class="text-[9.5px] font-mono font-bold bg-black/60 text-[#CCFF00] px-2 py-0.5 rounded-md border border-white/10">
                        +${p.points} XP
                      </span>
                    </div>
                  </div>

                  <!-- Centerpiece: Tactile Molded Rubber Disk & Stitch Trench -->
                  <div class="my-auto py-2 relative z-10 flex flex-col items-center">
                    <div class="pvc-patch-disk pvc-bevel relative">
                      <div class="pvc-stitching-groove w-full h-full flex items-center justify-center">
                        ${p.svg}
                      </div>
                    </div>
                    <h3 class="text-sm font-bold font-headline-md text-white mt-3 text-center tracking-wide">${escapeHtml(p.title || p.name)}</h3>
                    <p class="text-[11px] font-mono text-neutral-400 text-center mt-0.5 leading-snug">${escapeHtml(p.subtitle)}</p>
                  </div>

                  <!-- Bottom Hardware Specs & Telemetry -->
                  <div class="pt-3 border-t border-white/10 z-10 space-y-2.5">
                    <div class="flex items-center justify-between text-[9px] font-mono">
                      <span class="pvc-spec-label bg-white/5 text-neutral-300 border border-white/10">${escapeHtml(p.durometer)}</span>
                      <span class="pvc-spec-label bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20">${escapeHtml(p.rating)}</span>
                    </div>
                    
                    <!-- Progress Indicator -->
                    <div>
                      <div class="flex justify-between text-[9.5px] font-mono text-neutral-400 mb-1">
                        <span class="truncate max-w-[200px]">Milestone: ${escapeHtml(p.milestone)}</span>
                        <span class="text-white font-bold">${p.progress}</span>
                      </div>
                      <div class="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full bg-gradient-to-r from-[#CCFF00] to-[#FF6B00] rounded-full transition-all duration-500" style="width: ${p.progress};"></div>
                      </div>
                    </div>

                    <!-- Dual Action Triggers: Flip / Hook & Loop Specs & Inspect Material -->
                    <div class="grid grid-cols-2 gap-2 pt-1">
                      <button type="button" class="btn-flip-card py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer" data-id="${p.id}" title="Flip to inspect Hook & Loop backing specs">
                        <span class="material-symbols-outlined text-xs text-[#CCFF00]">sync</span>
                        <span>Flip / Specs</span>
                      </button>
                      <button type="button" class="btn-inspect-pvc py-2 px-2 rounded-xl bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] hover:text-[#d4ff33] border border-[#CCFF00]/30 text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer" data-id="${p.id}" title="Inspect Material & Durometer Telemetry HUD">
                        <span class="material-symbols-outlined text-xs">tune</span>
                        <span>Inspect HUD</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- BACK FACE: Hook-and-Loop Velcro Specification Face -->
                <div class="pvc-face-back pvc-velcro-back text-white">
                  <div class="z-10">
                    <!-- Top Bar: Velcro Specification & Batch No -->
                    <div class="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <span class="text-[9.5px] font-mono tracking-widest uppercase text-[#CCFF00] flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">texture</span>
                        <span>HOOK &amp; LOOP VELCRO</span>
                      </span>
                      <span class="text-[10px] font-mono text-neutral-400 font-bold">${escapeHtml(batchNo)}</span>
                    </div>

                    <!-- Title & Subtitle -->
                    <div class="mt-3">
                      <h4 class="font-bold text-sm text-white font-headline-md">${escapeHtml(p.title || p.name)}</h4>
                      <p class="text-[10px] font-mono text-[#CCFF00] mt-0.5">${escapeHtml(p.subtitle)}</p>
                    </div>

                    <!-- Field Operational Lore -->
                    <div class="mt-3 p-3 rounded-xl bg-black/60 border border-white/10">
                      <span class="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">FIELD OPERATIONAL BRIEF:</span>
                      <p class="text-[11px] text-neutral-300 leading-relaxed font-sans">${escapeHtml(p.lore)}</p>
                    </div>

                    <!-- Mil-Spec Hardware & Telemetry Details -->
                    <div class="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-[10px] font-mono">
                      <div class="flex justify-between">
                        <span class="text-neutral-400">Hardness:</span>
                        <span class="text-[#CCFF00] font-bold">${escapeHtml(p.durometer)}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-neutral-400">Material Spec:</span>
                        <span class="text-white truncate max-w-[170px]">${escapeHtml(p.material)}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-neutral-400">Thermal / Seal:</span>
                        <span class="text-white">${escapeHtml(p.rating)}</span>
                      </div>
                      <div class="flex justify-between border-t border-white/10 pt-1">
                        <span class="text-neutral-400">Unlocked Perk:</span>
                        <span class="text-[#6EE7B7] font-bold text-right truncate max-w-[180px]">${escapeHtml(perk)}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom Return and Inspect Buttons -->
                  <div class="pt-2 z-10 flex gap-2">
                    <button type="button" class="btn-flip-card flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/15" data-id="${p.id}">
                      <span class="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Return to Front</span>
                    </button>
                    <button type="button" class="btn-inspect-pvc py-2 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer" data-id="${p.id}" title="Inspect Material & Durometer">
                      <span class="material-symbols-outlined text-sm">tune</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Tactical PVC Hardware Inspector Modal
  function showPvcInspectorModal(patch) {
    const perk = patch.perk || PATCH_PERKS[patch.id] || '+10% Expedition Capability';
    const modalHtml = `
      <div class="p-3 text-white">
        <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div>
            <span class="text-[9.5px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded uppercase tracking-wider">
              MIL-SPEC 810G // TACTICAL INSPECTION
            </span>
            <h3 class="text-lg font-bold font-headline-md text-white mt-1">${escapeHtml(patch.title || patch.name)}</h3>
            <p class="text-xs font-mono text-neutral-400">${escapeHtml(patch.sku)}</p>
          </div>
          <button id="btnClosePvcInspector" class="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-6 my-4">
          <!-- Tactile Patch Preview -->
          <div class="w-40 h-40 rounded-full bg-[#16181B] border-4 border-[#252930] p-3 shadow-2xl flex-shrink-0 flex items-center justify-center relative">
            <div class="w-full h-full rounded-full border-2 border-dashed border-[#CCFF00]/40 flex items-center justify-center">
              ${patch.svg}
            </div>
          </div>

          <!-- Physical Specs Table -->
          <div class="flex-1 w-full space-y-2 text-xs font-mono">
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
              <div class="flex justify-between"><span class="text-neutral-400">Hardness:</span><span class="text-[#CCFF00] font-bold">${escapeHtml(patch.durometer)}</span></div>
              <div class="flex justify-between"><span class="text-neutral-400">Material Chemistry:</span><span class="text-white">${escapeHtml(patch.material || 'Liquid Vulcanized PVC Silicone')}</span></div>
              <div class="flex justify-between"><span class="text-neutral-400">Relief Elevation:</span><span class="text-white">3.5mm Multi-Tier Relief</span></div>
              <div class="flex justify-between"><span class="text-neutral-400">Thermal Resistance:</span><span class="text-white">-40°C to +120°C</span></div>
              <div class="flex justify-between"><span class="text-neutral-400">Backing System:</span><span class="text-white">Mil-Spec Hook-and-Loop Velcro</span></div>
              <div class="flex justify-between"><span class="text-neutral-400">Perimeter Stitch:</span><span class="text-white">Recessed Trench / #69 Nylon</span></div>
              <div class="flex justify-between border-t border-white/10 pt-1.5"><span class="text-neutral-400">Unlocked Perk:</span><span class="text-[#6EE7B7] font-bold">${escapeHtml(perk)}</span></div>
            </div>
          </div>
        </div>

        <!-- Lore & Deployment Notes -->
        <div class="my-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 leading-relaxed font-sans">
          <strong class="text-white font-mono uppercase block text-[10px] mb-1 tracking-wider text-[#CCFF00]">FIELD OPERATIONAL BRIEF:</strong>
          ${escapeHtml(patch.lore)}
        </div>

        <button id="btnDismissPvcModal" class="w-full py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs font-mono tracking-wider transition-colors cursor-pointer">
          DISMISS TELEMETRY HUD
        </button>
      </div>
    `;

    const appModal = document.getElementById('appModal');
    const modalBody = document.getElementById('modalBody');
    if (appModal && modalBody) {
      modalBody.innerHTML = modalHtml;
      modalBody.className = "bg-[#121316] rounded-3xl max-w-lg w-full p-4 border-2 border-[#252930] shadow-2xl relative";
      appModal.classList.remove('hidden');

      const closeModal = () => {
        appModal.classList.add('hidden');
      };

      document.getElementById('btnClosePvcInspector')?.addEventListener('click', closeModal);
      document.getElementById('btnDismissPvcModal')?.addEventListener('click', closeModal);
    }
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

    // Tactical PVC Category Filter Clicks
    container.querySelectorAll('.pvc-category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activePvcCategory = btn.dataset.category;
        render();
      });
    });

    // Tactile 3D PVC Card Flip Buttons (Both Front and Back faces)
    container.querySelectorAll('.btn-flip-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const patchId = btn.dataset.id;
        const cardEl = document.getElementById(patchId);
        if (cardEl) {
          cardEl.classList.toggle('flipped');
        }
      });
    });

    // Tactile 3D PVC Patch Inspect Buttons (Full-screen Telemetry HUD Modal)
    container.querySelectorAll('.btn-inspect-pvc, .btn-flip-pvc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const patchId = btn.dataset.id;
        const earnedIds = new Set(communityService.getEarnedBadgeIds());
        const patch = getPvcPatchById(patchId, earnedIds);
        if (patch) {
          showPvcInspectorModal(patch);
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
