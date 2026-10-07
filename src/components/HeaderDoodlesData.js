/**
 * HeaderDoodlesData.js — Stitch-Generated Destination Header Artworks
 * 
 * Maps every destination to its tailored, high-contrast, tightly cropped transparent PNG.
 * Renders bold, clear, fine-line doodles that rise smoothly from the bottom of the top bar.
 */

export const DESTINATION_HEADER_ART = {
  // 1. Alpine Mountain Range & Birds (Manali, Shimla, Mussoorie)
  alpine: '/images/headers/stitch_header_alpine.png',

  // 2. Coastal & Marine Doodles (Goa, Coastal)
  coastal: '/images/headers/stitch_header_coastal.png',

  // 3. Heritage Monuments Line Art (Jaipur, Delhi, Agra)
  heritage: '/images/headers/stitch_header_monuments.png',

  // 4. Tea Gardens & Toy Train (Ooty, Munnar, Darjeeling)
  tea: '/images/headers/stitch_header_tea.png',

  // 5. Lakeside Rowboat & Cable Car (Nainital, Udaipur, Kodaikanal)
  lake: '/images/headers/stitch_header_lake.png',

  // 6. Himalayan Monastery & Prayer Flags (Gangtok, Sikkim, Ladakh)
  monastery: '/images/headers/stitch_header_monastery.png',

  // 7. Coffee Estate, Treehouse & Wildlife (Coorg, Wayanad)
  coffee: '/images/headers/stitch_header_coffee.png',

  // 8. Desert Safari & Dunes (Jaisalmer, Desert Camps)
  desert: '/images/headers/stitch_header_desert.png',

  // 9. Kerala Backwaters, Houseboat & Coconut Groves (Alleppey, Kerala)
  backwaters: '/images/headers/stitch_header_backwaters.png',

  // 10. Scuba Diving, Coral Reef & Sea Turtle (Andaman, Lakshadweep)
  scuba: '/images/headers/stitch_header_scuba.png',

  // 11. Wildlife Safari & Bengal Tiger (Corbett, Ranthambore, Kaziranga)
  safari: '/images/headers/stitch_header_safari.png',

  // 12. Spiritual River Ghats, Aarti & Meditation (Varanasi, Rishikesh, Haridwar)
  spiritual: '/images/headers/stitch_header_spiritual.png',

  // 13. Alpine Snow Sports & Ski Chalet (Gulmarg, Auli, Winter Alps)
  ski: '/images/headers/stitch_header_ski.png',
};

/**
 * Destination-specific boomerang motion animation classes
 */
export const DESTINATION_HEADER_ANIMATIONS = {
  alpine: 'doodle-alpine-breeze',
  coastal: 'doodle-coastal-wave',
  heritage: 'doodle-monuments-reverence',
  tea: 'doodle-tea-sway',
  lake: 'doodle-lake-ripple',
  monastery: 'doodle-monastery-flags',
  coffee: 'doodle-coffee-rustle',
  desert: 'doodle-desert-mirage',
  backwaters: 'doodle-coastal-wave',
  scuba: 'doodle-scuba-buoyancy',
  safari: 'doodle-safari-stride',
  spiritual: 'doodle-spiritual-drift',
  ski: 'doodle-ski-glade',
};

/**
 * Full configuration associating each category with its source, title, and boomerang animation class
 */
export const DESTINATION_HEADER_CONFIG = {
  alpine: {
    src: DESTINATION_HEADER_ART.alpine,
    title: 'Alpine Peaks & Soaring Eagles',
    animationClass: 'doodle-alpine-breeze',
  },
  coastal: {
    src: DESTINATION_HEADER_ART.coastal,
    title: 'Coastal Palms & Marine Wonders',
    animationClass: 'doodle-coastal-wave',
  },
  heritage: {
    src: DESTINATION_HEADER_ART.heritage,
    title: 'Royal Heritage Monuments',
    animationClass: 'doodle-monuments-reverence',
  },
  tea: {
    src: DESTINATION_HEADER_ART.tea,
    title: 'Tea Gardens & Heritage Steam Toy Train',
    animationClass: 'doodle-tea-sway',
  },
  lake: {
    src: DESTINATION_HEADER_ART.lake,
    title: 'Lakeside Rowboats & Mountain Cable Cars',
    animationClass: 'doodle-lake-ripple',
  },
  monastery: {
    src: DESTINATION_HEADER_ART.monastery,
    title: 'Himalayan Monasteries & Prayer Flags',
    animationClass: 'doodle-monastery-flags',
  },
  coffee: {
    src: DESTINATION_HEADER_ART.coffee,
    title: 'Coffee Estates & Rainforest Treehouses',
    animationClass: 'doodle-coffee-rustle',
  },
  desert: {
    src: DESTINATION_HEADER_ART.desert,
    title: 'Desert Dunes & Camel Caravan',
    animationClass: 'doodle-desert-mirage',
  },
  backwaters: {
    src: DESTINATION_HEADER_ART.backwaters,
    title: 'Kerala Houseboats & Palm Backwaters',
    animationClass: 'doodle-coastal-wave',
  },
  scuba: {
    src: DESTINATION_HEADER_ART.scuba,
    title: 'Coral Reefs, Sea Turtles & Diving',
    animationClass: 'doodle-scuba-buoyancy',
  },
  safari: {
    src: DESTINATION_HEADER_ART.safari,
    title: 'Royal Bengal Tiger Jungle Safari',
    animationClass: 'doodle-safari-stride',
  },
  spiritual: {
    src: DESTINATION_HEADER_ART.spiritual,
    title: 'Sacred River Ghats & Meditation',
    animationClass: 'doodle-spiritual-drift',
  },
  ski: {
    src: DESTINATION_HEADER_ART.ski,
    title: 'Alpine Ski Chalet & Winter Peaks',
    animationClass: 'doodle-ski-glade',
  },
};

/**
 * Get header image path, title, and boomerang animation class for a given destination
 * @param {string} destinationName
 * @returns {{ src: string, title: string, animationClass: string }}
 */
export function getDestinationHeaderArt(destinationName = '') {
  const key = String(destinationName || '').trim().toLowerCase();

  // 1. Backwaters / Kerala
  if (key.includes('alleppey') || key.includes('kumarakom') || key.includes('backwater') || key.includes('kerala')) {
    return { ...DESTINATION_HEADER_CONFIG.backwaters };
  }

  // 2. Scuba & Coral Islands
  if (key.includes('andaman') || key.includes('lakshadweep') || key.includes('scuba') || key.includes('coral') || key.includes('havelock')) {
    return { ...DESTINATION_HEADER_CONFIG.scuba };
  }

  // 3. Wildlife Safari
  if (key.includes('corbett') || key.includes('ranthambore') || key.includes('kaziranga') || key.includes('safari') || key.includes('tiger') || key.includes('wildlife')) {
    return { ...DESTINATION_HEADER_CONFIG.safari };
  }

  // 4. Spiritual Ghats
  if (key.includes('varanasi') || key.includes('rishikesh') || key.includes('haridwar') || key.includes('ghat') || key.includes('spiritual')) {
    return { ...DESTINATION_HEADER_CONFIG.spiritual };
  }

  // 5. Alpine Ski & Winter Chalet
  if (key.includes('gulmarg') || key.includes('auli') || key.includes('ski') || key.includes('snow') || key.includes('winter')) {
    return { ...DESTINATION_HEADER_CONFIG.ski };
  }

  // 6. Himalayan Monasteries
  if (key.includes('gangtok') || key.includes('sikkim') || key.includes('ladakh') || key.includes('leh') || key.includes('monastery')) {
    return { ...DESTINATION_HEADER_CONFIG.monastery };
  }

  // 7. Coffee Estates & Rainforest
  if (key.includes('coorg') || key.includes('wayanad') || key.includes('coffee') || key.includes('chikmagalur')) {
    return { ...DESTINATION_HEADER_CONFIG.coffee };
  }

  // 8. Lakeside Rowboats
  if (key.includes('nainital') || key.includes('udaipur') || key.includes('kodaikanal') || key.includes('lake')) {
    return { ...DESTINATION_HEADER_CONFIG.lake };
  }

  // 9. Tea Gardens & Toy Train
  if (key.includes('ooty') || key.includes('munnar') || key.includes('darjeeling') || key.includes('tea')) {
    return { ...DESTINATION_HEADER_CONFIG.tea };
  }

  // 10. Coastal & Beaches
  if (key.includes('goa') || key.includes('beach') || key.includes('coastal') || key.includes('gokarna')) {
    return { ...DESTINATION_HEADER_CONFIG.coastal };
  }

  // 11. Desert Safari
  if (key.includes('jaisalmer') || key.includes('desert') || key.includes('dune') || key.includes('bikaner')) {
    return { ...DESTINATION_HEADER_CONFIG.desert };
  }

  // 12. Heritage & Palaces
  if (key.includes('jaipur') || key.includes('rajasthan') || key.includes('delhi') || key.includes('agra') || key.includes('palace')) {
    return { ...DESTINATION_HEADER_CONFIG.heritage };
  }

  // 13. Alpine Mountains
  if (key.includes('manali') || key.includes('shimla') || key.includes('mussoorie') || key.includes('himalaya')) {
    return { ...DESTINATION_HEADER_CONFIG.alpine };
  }

  return { ...DESTINATION_HEADER_CONFIG.alpine };
}

/**
 * Helper to retrieve only the animation class for a destination
 * @param {string} destinationName
 * @returns {string}
 */
export function getDestinationAnimationClass(destinationName = '') {
  return getDestinationHeaderArt(destinationName).animationClass || 'doodle-boomerang';
}
