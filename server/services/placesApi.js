// server/services/placesApi.js
// Wrapper around Google Places API (New) — used for hotel discovery,
// tourist places, and restaurants throughout Trailmate.
//
// COST NOTE (read before calling getPlaceDetails):
//   Fields like `reviews` and `priceLevel`/`priceRange` fall under
//   Places API's paid "Enterprise" SKU tier (the free allowance is
//   1000 requests/month for this tier, separate from the much larger
//   free "Basic"/"Pro" field allowance). Broad discovery searches
//   (searchPlaces) should only request Basic/Pro fields. Only call
//   getPlaceDetails with includeReviews/includePriceLevel turned on
//   for the small shortlist of candidates you're actually about to
//   show or rank for the user — never for every raw search result.

const BASE_URL = "https://places.googleapis.com/v1";

function getApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY;
}

// Field mask for searchText — Basic + Pro tier fields only (no reviews,
// no priceLevel/priceRange). This keeps broad/candidate-pool searches
// on the cheap tier.
const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.regularOpeningHours",
  "places.photos",
  "places.types",
].join(",");

// Fields always included in a Place Details call, regardless of the
// includeReviews/includePriceLevel flags. Also Basic/Pro tier.
const DETAILS_BASE_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "websiteUri",
  "photos",
];

/**
 * Performs a raw fetch against the Places API with the required
 * headers, and throws a descriptive error on a non-OK response.
 *
 * @param {string} url
 * @param {object} options - fetch options; `headers` is merged with
 *   the mandatory X-Goog-Api-Key header.
 * @param {string} fieldMask - value for the mandatory
 *   X-Goog-FieldMask header.
 * @returns {Promise<object>} parsed JSON response
 */
async function placesFetch(url, options, fieldMask) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not set.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `Places API request failed (${response.status} ${response.statusText}): ${bodyText}`
    );
  }

  return response.json();
}

/**
 * Searches for places by free-text query (e.g. "hotels in Ooty",
 * "tea gardens near Ooty"). Uses only Basic/Pro tier fields — safe to
 * call for broad candidate-pool discovery.
 *
 * @param {string} query - free-text search query.
 * @param {object} [options]
 * @param {string} [options.type] - an included place type, e.g.
 *   "lodging", "restaurant", "tourist_attraction".
 * @param {{ latitude: number, longitude: number }} [options.locationBias]
 *   - center point to bias results toward.
 * @param {number} [options.radius] - bias radius in meters (used with
 *   locationBias). Defaults to 5000 if locationBias is given without one.
 * @param {string[]} [options.priceLevels] - e.g.
 *   ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"].
 * @param {number} [options.maxResults=10]
 * @returns {Promise<object[]>} array of place objects (raw Places API
 *   shape, Basic/Pro fields only).
 */
export async function searchPlaces(query, options = {}) {
  const {
    type,
    locationBias,
    radius = 5000,
    priceLevels,
    maxResults = 10,
  } = options;

  const body = {
    textQuery: query,
    pageSize: maxResults,
  };

  if (type) {
    body.includedType = type;
  }

  if (locationBias) {
    body.locationBias = {
      circle: {
        center: {
          latitude: locationBias.latitude,
          longitude: locationBias.longitude,
        },
        radius,
      },
    };
  }

  if (priceLevels && priceLevels.length > 0) {
    body.priceLevels = priceLevels;
  }

  const data = await placesFetch(
    `${BASE_URL}/places:searchText`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    SEARCH_FIELD_MASK
  );

  return data.places ?? [];
}

/**
 * Fetches full details for a single place by its place ID.
 *
 * COST: passing includeReviews or includePriceLevel as true adds
 * Enterprise-tier fields to this request (see the file-level note
 * above). Only do this for a small shortlist of candidates, not in a
 * loop over an entire search result set.
 *
 * @param {string} placeId
 * @param {object} [options]
 * @param {boolean} [options.includeReviews=false]
 * @param {boolean} [options.includePriceLevel=false]
 * @returns {Promise<object>} the place object (raw Places API shape).
 */
export async function getPlaceDetails(placeId, options = {}) {
  const { includeReviews = false, includePriceLevel = false } = options;

  const fields = [...DETAILS_BASE_FIELDS];

  if (includeReviews) {
    // Enterprise SKU field.
    fields.push("reviews");
  }

  if (includePriceLevel) {
    // Enterprise SKU fields.
    fields.push("priceLevel", "priceRange");
  }

  const fieldMask = fields.join(",");

  return placesFetch(
    `${BASE_URL}/places/${encodeURIComponent(placeId)}`,
    { method: "GET" },
    fieldMask
  );
}

/**
 * Builds a displayable photo URL for a Places API photo resource name
 * (the `name` field on an entry in a place's `photos` array, e.g.
 * "places/ChIJ.../photos/AWU5...").
 *
 * @param {string} photoName
 * @param {number} [maxWidthPx=400]
 * @returns {string} a URL suitable for use directly in an <img src>.
 */
export function getPhotoUrl(photoName, maxWidthPx = 400) {
  const apiKey = getApiKey();
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey || ''}`;
}

export default { searchPlaces, getPlaceDetails, getPhotoUrl };
