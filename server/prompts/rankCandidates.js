// server/prompts/rankCandidates.js
// Builds the prompt used to rank a set of real, already-fetched
// candidates (hotels or restaurants) for a given user. This is a
// REASONING task, not a data-generation task: the model may only
// reorder and annotate the candidates it is given. It must never add,
// edit, invent, or drop a fact about any candidate.

export const RANK_CANDIDATES_SYSTEM_INSTRUCTION =
  "You are ranking real travel option candidates (hotels or " +
  "restaurants) that have already been fetched from a live data source. " +
  "You may only reorder and annotate the candidates provided — you must " +
  "never invent, edit, or add a candidate, and never state a fact about " +
  "a candidate that is not present in the data given to you. Apply the " +
  "stated priority order with judgment on close calls, but never let a " +
  "judgment call override a real safety/quality flag.";

// Bayesian-style confidence weighting: pulls a candidate's own rating
// toward the pool average when its review count is low, and trusts the
// candidate's own rating more as review count grows.
const RATING_WEIGHT_MIN_REVIEWS = 10; // "m" in the formula

// Red-flag keyword lists, English + Hinglish, per category. Matching
// 2+ of these terms across a candidate's recent (last ~3 months)
// reviews should produce a flag — never a removal.
const HOTEL_RED_FLAGS = {
  pests: {
    english: ["cockroach", "bed bugs", "bedbugs", "roaches", "rats", "mice", "insects", "pests"],
    hinglish: ["keede", "cockroach the", "chuhe"],
  },
  safetyFraud: {
    english: ["unsafe", "scam", "theft", "stolen", "robbed", "harassment", "fraud", "overcharged", "hidden charges"],
    hinglish: ["dhoka", "thagi", "chori", "fraud", "extra paisa liya", "chhupe hue charges"],
  },
  hygiene: {
    english: ["dirty", "filthy", "stink", "smell", "mold", "mould"],
    hinglish: ["ganda", "gandi jagah", "badbu", "gandagi", "fungus"],
  },
  nonFunctional: {
    english: ["no hot water", "broken ac", "non-functional", "out of order"],
    hinglish: ["paani nahi tha", "ac kharab", "kuch bhi kaam nahi kar raha tha"],
  },
};

const RESTAURANT_RED_FLAGS = {
  foodSafety: {
    english: ["food poisoning", "vomiting", "sick after eating", "stomach ache", "stale", "rotten", "spoiled", "expired"],
    hinglish: ["pet kharab ho gaya", "ulti hui", "bimaar pad gaye", "baasi", "sadi hui", "kharab khana"],
  },
  contamination: {
    english: ["cockroach", "insect in food", "hair in food", "fly in food"],
    hinglish: ["khane mein keeda", "baal mila", "machhar tha"],
  },
  hygiene: {
    english: ["unhygienic", "dirty kitchen", "dirty utensils"],
    hinglish: ["ganda kitchen", "bartan gande the"],
  },
  serviceBilling: {
    english: ["rude staff", "misbehaved", "overcharged", "billing issue"],
    hinglish: ["staff badtameez", "zyada paisa liya", "bill mein gadbad"],
  },
};

/**
 * Flattens a red-flag keyword map into a single readable block for the
 * prompt (grouped by concern category, English/Hinglish side by side).
 * @param {object} flagMap
 * @returns {string}
 */
function formatKeywordList(flagMap) {
  return Object.entries(flagMap)
    .map(([category, { english, hinglish }]) => {
      return `  - ${category}: English [${english.join(", ")}] | Hinglish [${hinglish.join(", ")}]`;
    })
    .join("\n");
}

/**
 * Builds the user-turn prompt for ranking a set of candidates.
 *
 * @param {Array<object>} candidates - real candidates already fetched
 *   from Places API (or similar), each expected to include at minimum:
 *   id, name, rating, reviewCount, recentReviews (last ~3 months, with
 *   text and language where available), priceLevel, distanceFromAnchorKm.
 * @param {object} userContext - user-specific ranking context:
 *   {
 *     candidateType: "hotel" | "restaurant",
 *     hasFoodInterest: boolean,       // only relevant for restaurants
 *     budgetTier: "budget"|"moderate"|"luxury",
 *     interests: string[],
 *     anchorDescription: string       // e.g. "near the selected hotel"
 *   }
 * @returns {string} the prompt to send to Gemini via generateJSON().
 */
export function buildRankCandidatesPrompt(candidates, userContext) {
  const {
    candidateType = "hotel",
    hasFoodInterest = false,
    budgetTier = "moderate",
    interests = [],
    anchorDescription = "the relevant anchor point",
  } = userContext ?? {};

  const isHotel = candidateType === "hotel";

  const priorityOrder = isHotel
    ? "location relevance -> price match -> confidence-weighted rating -> recent-review flags"
    : hasFoodInterest
      ? "rating -> price -> nearness to the tourist spot currently being visited"
      : "price -> nearness to the tourist spot currently being visited -> rating";

  const redFlagKeywords = isHotel
    ? formatKeywordList(HOTEL_RED_FLAGS)
    : formatKeywordList(RESTAURANT_RED_FLAGS);

  return `
Rank the following real ${isHotel ? "hotel" : "restaurant"} candidates for
this traveler. Every candidate below is real data already fetched from a
live source — you may reorder and annotate them, but you must never add
a new candidate, remove a candidate from the list, or state any fact
about a candidate (name, price, rating, review count, location) that
is not already present in the data given to you.

USER CONTEXT
- Candidate type: ${candidateType}
- Budget tier: ${budgetTier}
- Stated interests: ${interests.length ? interests.join(", ") : "none stated"}
- Has a stated interest in food: ${hasFoodInterest}
- Anchor point for "nearness": ${anchorDescription}

PRIORITY ORDER TO APPLY: ${priorityOrder}
Apply this order with judgment, not as a rigid mechanical sort — a
candidate that is dramatically better on a lower-priority factor may
reasonably outrank one with only a marginal edge on the top-priority
factor. Do not let this judgment override a real safety/quality flag
(see below): a flagged candidate should still generally rank behind an
otherwise-comparable unflagged one.

RATING CALCULATION — do not use each candidate's raw average rating.
Instead compute a confidence-weighted rating for each candidate using:
  weighted = (v / (v + m)) * R + (m / (v + m)) * C
  where:
    R = the candidate's own average rating
    v = the candidate's review count
    m = ${RATING_WEIGHT_MIN_REVIEWS} (minimum review count to fully trust a rating)
    C = the average rating across ALL candidates in this list
This prevents a candidate with very few reviews (e.g. 5.0 from 3
reviews) from outranking a candidate with a strong, high-volume track
record (e.g. 4.4 from 2,000 reviews).

RECENT-DECLINE CHECK — separately, compare each candidate's average
rating over roughly the last 3 months of reviews against its historical
average rating. If recent sentiment is significantly lower than the
historical average (roughly a 1.0-point drop or more, or a clear
negative skew despite a strong historical average), add a flag of type
"recent_decline" to that candidate, with a one-line reason. This applies
even if the candidate's overall historical rating still looks strong.

RED-FLAG KEYWORD SCAN — scan each candidate's available recent reviews
(roughly the last 3 months) for the following concern categories, in
both English and Hinglish:
${redFlagKeywords}
If 2 or more of a candidate's recent reviews match terms from the same
or related concern category, add a flag of type "keyword_redflag" to
that candidate, naming the matched concern category (e.g. "pests",
"hygiene") in the flag reason.

FLAGGING RULE — a flag (either type) must never cause you to remove,
omit, or hide a candidate from the returned list. Flagged candidates
should simply be ranked lower than they otherwise would be, and clearly
annotated so the app can show a visible warning. If a candidate has no
recent reviews available to check, do not flag it for that reason alone
— just note that no recent-review data was available.

WHY-RECOMMENDED — for every candidate, write one short sentence tying
it to the traveler's stated interests or context (e.g. "Close to the
tea gardens you're interested in" or "Matches your food-focused
budget priority"). This sentence must be grounded only in the
candidate's real supplied data and the user's stated interests — never
invent a feature or amenity the candidate data doesn't show.

CANDIDATES (real data, do not alter any field values):
${JSON.stringify(candidates, null, 2)}

Return ONLY a JSON object with this exact shape:
{
  "ranked": [
    {
      "id": string,
      "rank": number,
      "weightedRating": number,
      "flags": [
        { "type": "recent_decline" | "keyword_redflag", "reason": string }
      ],
      "flagReason": string | null,
      "whyRecommended": string
    }
  ]
}
The "ranked" array must contain exactly one entry per input candidate
(same ids, no additions or omissions), ordered by your final rank
(rank 1 = top recommendation). "flags" is an empty array for candidates
with no flags. "flagReason" is a short, single combined summary of the
flags for easy display (null if no flags).
`.trim();
}

export default buildRankCandidatesPrompt;
