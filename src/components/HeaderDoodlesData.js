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
 * Get header image path and title for a given destination
 * @param {string} destinationName
 * @returns {{ src: string, title: string }}
 */
export function getDestinationHeaderArt(destinationName = '') {
  const key = String(destinationName || '').trim().toLowerCase();

  // 1. Backwaters / Kerala
  if (key.includes('alleppey') || key.includes('kumarakom') || key.includes('backwater') || key.includes('kerala')) {
    return { src: DESTINATION_HEADER_ART.backwaters, title: 'Kerala Houseboats & Palm Backwaters' };
  }

  // 2. Scuba & Coral Islands
  if (key.includes('andaman') || key.includes('lakshadweep') || key.includes('scuba') || key.includes('coral') || key.includes('havelock')) {
    return { src: DESTINATION_HEADER_ART.scuba, title: 'Coral Reefs, Sea Turtles & Diving' };
  }

  // 3. Wildlife Safari
  if (key.includes('corbett') || key.includes('ranthambore') || key.includes('kaziranga') || key.includes('safari') || key.includes('tiger') || key.includes('wildlife')) {
    return { src: DESTINATION_HEADER_ART.safari, title: 'Royal Bengal Tiger Jungle Safari' };
  }

  // 4. Spiritual Ghats
  if (key.includes('varanasi') || key.includes('rishikesh') || key.includes('haridwar') || key.includes('ghat') || key.includes('spiritual')) {
    return { src: DESTINATION_HEADER_ART.spiritual, title: 'Sacred River Ghats & Meditation' };
  }

  // 5. Alpine Ski & Winter Chalet
  if (key.includes('gulmarg') || key.includes('auli') || key.includes('ski') || key.includes('snow') || key.includes('winter')) {
    return { src: DESTINATION_HEADER_ART.ski, title: 'Alpine Ski Chalet & Winter Peaks' };
  }

  // 6. Himalayan Monasteries
  if (key.includes('gangtok') || key.includes('sikkim') || key.includes('ladakh') || key.includes('leh') || key.includes('monastery')) {
    return { src: DESTINATION_HEADER_ART.monastery, title: 'Himalayan Monasteries & Prayer Flags' };
  }

  // 7. Coffee Estates & Rainforest
  if (key.includes('coorg') || key.includes('wayanad') || key.includes('coffee') || key.includes('chikmagalur')) {
    return { src: DESTINATION_HEADER_ART.coffee, title: 'Coffee Estates & Rainforest Treehouses' };
  }

  // 8. Lakeside Rowboats
  if (key.includes('nainital') || key.includes('udaipur') || key.includes('kodaikanal') || key.includes('lake')) {
    return { src: DESTINATION_HEADER_ART.lake, title: 'Lakeside Rowboats & Mountain Cable Cars' };
  }

  // 9. Tea Gardens & Toy Train
  if (key.includes('ooty') || key.includes('munnar') || key.includes('darjeeling') || key.includes('tea')) {
    return { src: DESTINATION_HEADER_ART.tea, title: 'Tea Gardens & Heritage Steam Toy Train' };
  }

  // 10. Coastal & Beaches
  if (key.includes('goa') || key.includes('beach') || key.includes('coastal') || key.includes('gokarna')) {
    return { src: DESTINATION_HEADER_ART.coastal, title: 'Coastal Palms & Marine Wonders' };
  }

  // 11. Desert Safari
  if (key.includes('jaisalmer') || key.includes('desert') || key.includes('dune') || key.includes('bikaner')) {
    return { src: DESTINATION_HEADER_ART.desert, title: 'Desert Dunes & Camel Caravan' };
  }

  // 12. Heritage & Palaces
  if (key.includes('jaipur') || key.includes('rajasthan') || key.includes('delhi') || key.includes('agra') || key.includes('palace')) {
    return { src: DESTINATION_HEADER_ART.heritage, title: 'Royal Heritage Monuments' };
  }

  // 13. Alpine Mountains
  if (key.includes('manali') || key.includes('shimla') || key.includes('mussoorie') || key.includes('himalaya')) {
    return { src: DESTINATION_HEADER_ART.alpine, title: 'Alpine Peaks & Soaring Eagles' };
  }

  return { src: DESTINATION_HEADER_ART.alpine, title: 'Alpine Peaks & Soaring Eagles' };
}
