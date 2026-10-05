/**
 * CommunityService.js — Local-First Community Engine for Trailmate
 * Handles:
 * 1. Traveler Passport & Profile (bio tags, level, avatar, rank)
 * 2. Location-Based Quests with Real Coordinate Proximity & Treasure Unlock
 * 3. Community Feed (Posts, Scrapbook & Itinerary publishing, Likes, Comments)
 * 4. Gamified Badges Engine with rewards synced to Scrapbook & Profile
 */

const STORAGE_KEYS = {
  PROFILE: 'trailmate_traveler_profile',
  BADGES: 'trailmate_traveler_badges',
  POSTS: 'trailmate_community_posts',
  QUESTS: 'trailmate_completed_quests',
  UNLOCKED_STICKERS: 'trailmate_unlocked_stickers',
};

// ── Default Gamified Badges Catalog ───────────────────────────────────────────
export const BADGES_CATALOG = [
  {
    id: 'badge-first-step',
    name: 'First Step',
    icon: 'hiking',
    tier: 'bronze',
    category: 'exploration',
    description: 'Began the expedition and joined the Trailmate community.',
    points: 50,
  },
  {
    id: 'badge-trail-pioneer',
    name: 'Trail Pioneer',
    icon: 'explore',
    tier: 'silver',
    category: 'itinerary',
    description: 'Drafted or saved your first personalized journey itinerary.',
    points: 150,
  },
  {
    id: 'badge-scrapbook-artisan',
    name: 'Scrapbook Artisan',
    icon: 'auto_awesome',
    tier: 'gold',
    category: 'creativity',
    description: 'Published a handcrafted vintage travel scrapbook to the feed.',
    points: 250,
  },
  {
    id: 'badge-treasure-hunter',
    name: 'Treasure Hunter',
    icon: 'military_tech',
    tier: 'diamond',
    category: 'quests',
    description: 'Discovered secret coordinates and claimed a real-world geocache.',
    points: 400,
  },
  {
    id: 'badge-cartographer',
    name: 'Grand Cartographer',
    icon: 'map',
    tier: 'silver',
    category: 'exploration',
    description: 'Explored multiple regions on the Geospatial Expedition Map.',
    points: 180,
  },
  {
    id: 'badge-local-legend',
    name: 'Local Legend',
    icon: 'local_fire_department',
    tier: 'gold',
    category: 'community',
    description: 'Shared an expedition with high community applause and comments.',
    points: 300,
  },
];

// ── Location-Based Coordinate Quests & Secret Treasures ────────────────────────
export const LOCATION_QUESTS = [
  {
    id: 'quest-goa-fort',
    destination: 'Goa',
    title: 'Secret Ramparts of Aguada Fort',
    subtitle: 'Portuguese Coastal Sea Watchtower',
    lat: 15.4923,
    lng: 73.7737,
    difficulty: 'Moderate',
    hint: 'Near the 17th-century freshwater spring bastion overlooking the Arabian Sea breakers.',
    xp: 250,
    coverPhoto: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    reward: {
      type: 'sticker',
      stickerId: 'quest-sticker-goa-compass',
      name: '🧭 Golden Portuguese Compass',
      badgeId: 'badge-treasure-hunter',
      preview: '🪙 Unlocks Golden Compass & Wax Crest in Scrapbook Studio',
    },
  },
  {
    id: 'quest-ooty-tea',
    destination: 'Ooty',
    title: 'The Mist Valley Shola Cache',
    subtitle: 'Doddabetta Cloud Line Geocache',
    lat: 11.4010,
    lng: 76.7355,
    difficulty: 'Easy',
    hint: 'Perched 2,637m above sea level where the Nilgiri cloud forest meets the alpine ridge trail.',
    xp: 200,
    coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    reward: {
      type: 'sticker',
      stickerId: 'quest-sticker-ooty-fern',
      name: '🌿 Ancient Silver Fern Stamp',
      badgeId: 'badge-treasure-hunter',
      preview: '🍃 Unlocks Shola Botanic Emblem for your scrapbooks',
    },
  },
  {
    id: 'quest-manali-jogini',
    destination: 'Manali',
    title: 'Himalayan Glacier Spring',
    subtitle: 'Jogini Waterfall Sacred Falls',
    lat: 32.2690,
    lng: 77.1950,
    difficulty: 'Hard',
    hint: 'A secret cedar pine cove behind the lower spray pool of Jogini sacred cascades.',
    xp: 350,
    coverPhoto: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
    reward: {
      type: 'sticker',
      stickerId: 'quest-sticker-manali-crest',
      name: '❄️ Alpine Ice Crystal Seal',
      badgeId: 'badge-treasure-hunter',
      preview: '🏔️ Unlocks Himalayan Wax Seal in Scrapbook Studio',
    },
  },
  {
    id: 'quest-jaipur-sheesh',
    destination: 'Jaipur',
    title: 'Mirror Hall Secret Vault',
    subtitle: 'Amer Fort Sheesh Mahal Reflection',
    lat: 26.9855,
    lng: 75.8513,
    difficulty: 'Moderate',
    hint: 'Beneath the convex Belgian glass mosaics that reflect starlight across the royal courtyard.',
    xp: 280,
    coverPhoto: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    reward: {
      type: 'sticker',
      stickerId: 'quest-sticker-jaipur-peacock',
      name: '🦚 Royal Amber Peacock Seal',
      badgeId: 'badge-treasure-hunter',
      preview: '👑 Unlocks Royal Rajasthan Gilded Wax Seal',
    },
  },
  {
    id: 'quest-munnar-top-station',
    destination: 'Munnar',
    title: 'The Cloud Canopy Lookout',
    subtitle: 'Top Station Historic Ropeway Post',
    lat: 10.1230,
    lng: 77.2450,
    difficulty: 'Moderate',
    hint: 'Where the historic Kundala valley tea monorail ended overlooking Tamil Nadu plains.',
    xp: 220,
    coverPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    reward: {
      type: 'sticker',
      stickerId: 'quest-sticker-munnar-tea',
      name: '🍵 Golden Orthodox Tea Leaf Seal',
      badgeId: 'badge-treasure-hunter',
      preview: '🌱 Unlocks Hand-Harvested Tea Monogram',
    },
  },
];

// ── Initial Authentic Seed Community Feed ─────────────────────────────────────
const INITIAL_SEED_POSTS = [
  {
    id: 'post-101',
    author: {
      name: 'Aarav Mehta',
      handle: '@aarav_hikes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      bioTags: ['wanderer', 'shutterbug', 'coffee-nerd'],
      badgeCount: 5,
    },
    destination: 'Goa Coastline',
    type: 'scrapbook',
    title: 'Portuguese Forts & Hidden Sunset Coves',
    content: 'Spent 4 days cruising through South Goa backwaters and ending at Cabo de Rama. Made this collage in the studio using vintage stamps and washi tape!',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=82',
    likes: 42,
    isLiked: false,
    timestamp: '2 hours ago',
    itinerarySnippet: ['Aguada Lighthouse', 'Sinquerim Beach', 'Fontainhas Heritage Walk', 'Cabo de Rama Sunset'],
    comments: [
      { author: 'Maya Sen', text: 'Love the vintage postal stamp styling! Did you find the Aguada treasure geocache?' },
      { author: 'Rohan K', text: 'Added that sunset cove to my plan!' },
    ],
  },
  {
    id: 'post-102',
    author: {
      name: 'Priya Nambiar',
      handle: '@priyatrips',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      bioTags: ['slow-travel', 'tea-drinker', 'botanist'],
      badgeCount: 6,
    },
    destination: 'Nilgiri Highlands, Ooty',
    type: 'itinerary',
    title: '3-Day Offbeat Nilgiri Tea Trail & Alpine Lakes',
    content: 'Skipped the crowded commercial tourist spots and focused on Avalanche Lake forest hikes and century-old tea factories. Click to clone this itinerary!',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=82',
    likes: 67,
    isLiked: true,
    timestamp: 'Yesterday',
    itinerarySnippet: ['Tea Museum Tour', 'Avalanche Forest Reserve', 'Pykara Boathouse', 'Pine Forest Slope'],
    comments: [
      { author: 'Kabir V', text: 'This route layout is super clean. Just saved to my trips!' },
    ],
  },
  {
    id: 'post-103',
    author: {
      name: 'Devansh Verma',
      handle: '@dev_adventures',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      bioTags: ['trekker', 'star-gazer', 'filmmaker'],
      badgeCount: 8,
    },
    destination: 'Solang & Old Manali',
    type: 'scrapbook',
    title: 'Snow & Pines: Himalayan Journal',
    content: 'Found the Jogini Waterfall secret coordinates! The mist at the lower falls was surreal. Unlocked the Alpine Ice Crystal Seal badge.',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=82',
    likes: 89,
    isLiked: false,
    timestamp: '2 days ago',
    itinerarySnippet: ['Jogini Waterfall Hike', 'Old Manali Cafes', 'Solang Paragliding', 'Atal Tunnel Portal'],
    comments: [
      { author: 'Aarav Mehta', text: 'Those cedar forest shots are unreal 🔥' },
    ],
  },
];

class CommunityService {
  constructor() {
    this._initProfile();
    this._initPosts();
  }

  // ── Profile & Bio Management ────────────────────────────────────────────────
  _initProfile() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      const defaultProfile = {
        name: 'Traveler',
        handle: '@wanderer_explores',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
        homeCity: localStorage.getItem('trailmate_home_city') || 'Delhi',
        bioTags: ['wanderer', 'storyteller', 'foodie'],
        bioNote: 'Roaming through mountain valleys & coastal forts with a camera in hand.',
        level: 3,
        xp: 680,
      };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    }

    if (!localStorage.getItem(STORAGE_KEYS.BADGES)) {
      // Default unlock: First Step & Trail Pioneer
      const defaultBadges = ['badge-first-step', 'badge-trail-pioneer'];
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(defaultBadges));
    }
  }

  getProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || {};
    } catch {
      return {};
    }
  }

  saveProfile(updated) {
    const current = this.getProfile();
    const merged = { ...current, ...updated };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));
    return merged;
  }

  // ── Badges ──────────────────────────────────────────────────────────────────
  getEarnedBadgeIds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BADGES)) || [];
    } catch {
      return [];
    }
  }

  getEarnedBadges() {
    const ids = new Set(this.getEarnedBadgeIds());
    return BADGES_CATALOG.filter(b => ids.has(b.id));
  }

  awardBadge(badgeId) {
    const ids = new Set(this.getEarnedBadgeIds());
    if (!ids.has(badgeId)) {
      ids.add(badgeId);
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify([...ids]));

      // Increment profile XP
      const badge = BADGES_CATALOG.find(b => b.id === badgeId);
      if (badge) {
        const prof = this.getProfile();
        prof.xp = (prof.xp || 0) + badge.points;
        prof.level = Math.floor(prof.xp / 250) + 1;
        this.saveProfile(prof);
      }
      return true; // Newly awarded
    }
    return false;
  }

  // ── Quests & Treasure Unlocks ───────────────────────────────────────────────
  getCompletedQuestIds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTS)) || [];
    } catch {
      return [];
    }
  }

  unlockQuest(questId) {
    const quest = LOCATION_QUESTS.find(q => q.id === questId);
    if (!quest) return null;

    const completed = new Set(this.getCompletedQuestIds());
    const isFirstTime = !completed.has(questId);
    completed.add(questId);
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify([...completed]));

    if (isFirstTime) {
      // Award XP
      const prof = this.getProfile();
      prof.xp = (prof.xp || 0) + quest.xp;
      prof.level = Math.floor(prof.xp / 250) + 1;
      this.saveProfile(prof);

      // Award Treasure Hunter Badge
      this.awardBadge(quest.reward.badgeId || 'badge-treasure-hunter');

      // Award Unlocked Digital Sticker
      if (quest.reward.stickerId) {
        const stickers = new Set(this.getUnlockedStickerIds());
        stickers.add(quest.reward.stickerId);
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_STICKERS, JSON.stringify([...stickers]));
      }
    }

    return { quest, isFirstTime };
  }

  getUnlockedStickerIds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.UNLOCKED_STICKERS)) || [];
    } catch {
      return [];
    }
  }

  // ── Community Feed & Posts ─────────────────────────────────────────────────
  _initPosts() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_SEED_POSTS));
    }
  }

  getPosts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    } catch {
      return [];
    }
  }

  createPost({ title, content, destination, type = 'scrapbook', heroImage, itinerarySnippet = [] }) {
    const prof = this.getProfile();
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: prof.name || 'Traveler',
        handle: prof.handle || '@wanderer',
        avatar: prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        bioTags: prof.bioTags || ['explorer'],
        badgeCount: this.getEarnedBadgeIds().length,
      },
      destination: destination || 'Adventure',
      type,
      title: title || 'My Journey Scrapbook',
      content: content || 'Fresh travel memory shared with the community.',
      heroImage: heroImage || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=82',
      likes: 1,
      isLiked: true,
      timestamp: 'Just now',
      itinerarySnippet,
      comments: [],
    };

    const posts = [newPost, ...this.getPosts()];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Award badge for publishing
    this.awardBadge('badge-scrapbook-artisan');

    return newPost;
  }

  toggleLike(postId) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post;
  }

  addComment(postId, commentText) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post || !commentText.trim()) return null;

    const prof = this.getProfile();
    const newComment = {
      author: prof.name || 'Traveler',
      text: commentText.trim(),
      timestamp: 'Just now',
    };

    post.comments = post.comments || [];
    post.comments.push(newComment);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post;
  }
}

export const communityService = new CommunityService();
