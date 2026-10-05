// server/services/rankingService.js
// ──────────────────────────────────────────────────────────────────────
// Wraps the rankCandidates prompt + Gemini call into a single function
// the places route can call to reorder its shortlisted candidates before
// returning them to the client.
//
// Contract:
//   - Candidates come from Places API (real, already-fetched data).
//   - Gemini may only reorder and annotate — never add or drop.
//   - If Gemini fails, the original order is returned unchanged so the
//     UI always has something to show (honest degradation, not error).
// ──────────────────────────────────────────────────────────────────────

import { generateJSON }               from './gemini.js';
import { cache }                      from './cache.js';
import {
  buildRankCandidatesPrompt,
  RANK_CANDIDATES_SYSTEM_INSTRUCTION,
} from '../prompts/rankCandidates.js';

const RANKING_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Ranks a list of real place candidates for a user using the Gemini
 * reasoning model. Returns the candidates in ranked order with flags
 * and `whyRecommended` annotations merged in.
 *
 * @param {object[]} candidates - real Places API results to rank
 * @param {object}   userContext
 * @param {'hotel'|'restaurant'} userContext.candidateType
 * @param {boolean}  [userContext.hasFoodInterest]
 * @param {'budget'|'moderate'|'luxury'} [userContext.budgetTier]
 * @param {string[]} [userContext.interests]
 * @param {string}   [userContext.anchorDescription]
 * @returns {Promise<object[]>} ranked + annotated candidates
 */
export async function rankCandidates(candidates, userContext = {}) {
  if (!candidates?.length) return candidates;

  // Single-turn bundling & deduplication cache:
  // Keyed on candidates, candidateType, budgetTier, and interests
  const candidateIds = candidates.map(c => String(c.id || c.name || '')).sort().join(',');
  const interestsKey = (userContext.interests || []).slice().sort().join('-');
  const cacheKey = `rank:${userContext.candidateType || 'place'}:${userContext.budgetTier || 'mod'}:${interestsKey}:${candidateIds}`;

  const cached = cache.get(cacheKey);
  if (cached && Array.isArray(cached)) {
    console.log(`[rankingService] Cache hit: Returning bundled AI ranking for ${userContext.candidateType} (${candidates.length} items)`);
    return cached;
  }

  const prompt = buildRankCandidatesPrompt(candidates, userContext);

  let ranked;
  try {
    const result = await generateJSON(prompt, RANK_CANDIDATES_SYSTEM_INSTRUCTION);
    ranked = result?.ranked;
  } catch (err) {
    console.warn('[rankingService] Gemini ranking failed, returning original order:', err.message);
    return candidates; // honest degradation
  }

  if (!Array.isArray(ranked) || ranked.length === 0) {
    console.warn('[rankingService] Gemini returned empty/invalid ranked array, using original order.');
    return candidates;
  }

  // Build a lookup map from the AI ranking output: id → { rank, flags, flagReason, whyRecommended }
  const rankMap = new Map(ranked.map(r => [String(r.id), r]));

  // Merge AI annotations back into the original candidate objects
  // (preserving every real field — Gemini only adds rank/flags/why)
  const annotated = candidates.map(c => {
    const info = rankMap.get(String(c.id));
    if (!info) return c; // safety: Gemini dropped the candidate — keep it as-is

    return {
      ...c,
      _rank:           info.rank ?? 999,
      isFlagged:       info.flags?.length > 0,
      flagReason:      info.flagReason || null,
      whyRecommended:  info.whyRecommended || null,
      weightedRating:  info.weightedRating ?? c.rating ?? null,
    };
  });

  // Sort by AI rank ascending
  annotated.sort((a, b) => (a._rank ?? 999) - (b._rank ?? 999));

  // Save to in-memory deduplication cache
  cache.set(cacheKey, annotated, RANKING_CACHE_TTL_MS);

  return annotated;
}
