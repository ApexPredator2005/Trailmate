// server/prompts/composeItinerary.js
// Builds the prompt used for the final composition step: arranging the
// user's already-selected, real flight/hotel/places/restaurants into a
// sequenced, timed, day-by-day itinerary. This is a pure arrangement +
// annotation task — the model must never introduce a place, price, or
// detail that isn't already present in the trip object it's given.

export const COMPOSE_ITINERARY_SYSTEM_INSTRUCTION =
  "You are composing a day-by-day travel itinerary using ONLY the real, " +
  "user-approved selections provided to you (flight, hotel, tourist " +
  "spots, restaurants). You may sequence, group, and time these real " +
  "items, and write short personalized reasons for each — but you must " +
  "never add, invent, or infer any place, price, name, or detail that " +
  "is not already present in the trip data given to you.";

const VALID_THEME_COLORS = ["nature", "heritage", "food", "beach", "adventure"];

/**
 * Builds the user-turn prompt for composing the final itinerary.
 *
 * @param {object} trip - the full trip object built up across the
 *   conversation stages. Expected shape (only the composition-relevant
 *   parts are required):
 *   {
 *     tripSummary: { destination, dates: { start, end }, travelers, ... },
 *     selectedFlight: { ... },
 *     selectedHotel: { placeId, name, lat, lng, ... },
 *     selectedPlaces: [ { placeId, name, category, openingHours, lat, lng, ... } ],
 *     selectedRestaurants: [ { placeId, name, category, openingHours, ... } ],
 *     interests: string[],
 *     homeTimezone: string,     // e.g. "Asia/Kolkata"
 *     destinationTimezone: string // e.g. "Asia/Tokyo"
 *   }
 * @returns {string} the prompt to send to Gemini via generateJSON().
 */
export function buildComposeItineraryPrompt(trip) {
  return `
Arrange the traveler's already-selected real trip items into a
day-by-day itinerary. Every place, hotel, flight, and restaurant below
was already fetched from a real data source and explicitly chosen or
confirmed by the traveler. You are only sequencing, timing, and
annotating this real data.

TRIP DATA (real, user-approved — do not alter any field values):
${JSON.stringify(trip, null, 2)}

INSTRUCTIONS
- Use ONLY the stops, restaurants, hotel, and flight given in the trip
  data above. Do not add any place, restaurant, activity, or detail
  that is not already present in this data. If the trip data doesn't
  give you enough items to fill every day meaningfully, leave the
  remaining time open/unscheduled rather than inventing something to
  fill the gap.
- Group stops that are geographically close together (using their
  provided coordinates, if available) onto the same day, rather than
  scheduling nearby places on different days.
- For each stop, check its provided opening-hours data if available,
  and do not schedule it on a day/time it is marked as closed. If
  opening-hours data is not available for a stop, schedule it at a
  reasonable time without claiming to have verified its hours.
- Assign a specific start time (and end time where it makes sense, e.g.
  for timed activities) to each stop, in a logical order through the
  day (morning -> afternoon -> evening).
- Every time you output MUST be labeled with its timezone. Flight
  departure time uses the traveler's home timezone; flight arrival time
  and every itinerary time from arrival onward use the destination's
  timezone (both provided in the trip data above as homeTimezone /
  destinationTimezone).
- For every stop and restaurant, write one short sentence ("why") that
  ties it to the traveler's stated interests (given in the trip data as
  "interests") or another real detail already present in the trip data
  (e.g. its real rating, or proximity to the hotel). Do not invent a
  reason based on something not present in the data.
- **GEOGRAPHIC TRADE-OFF & USER PREFERENCE PRIORITY**:
  If the traveler has a strong interest (e.g. Food / Culinary, Heritage, Nature) and has selected a prized restaurant or attraction located far from their main hotel or other daily stops (e.g. a South Goa culinary spot when staying in North Goa):
  - Prioritize the traveler's choice and schedule it — do not drop it.
  - In the "why" explanation or "travelAdvisory" field, transparently inform the traveler of the travel time/distance (e.g. "~1.5 hrs drive from your North Goa base") so they are fully aware of the trade-off.
- Assign restaurants to a specific day and meal (lunch or dinner) based
  on the day's schedule and location, using only the restaurants
  already given in the trip data.
- For each day, pick one "theme" (a short descriptive label, e.g. "Tea
  Gardens & Nature") that reflects what that day's real stops actually
  are, and a matching "themeColor" chosen from exactly this list: ${VALID_THEME_COLORS.join(", ")}.
  Pick the closest fit — do not invent a new theme color value.

Return ONLY a JSON object with this exact shape:
{
  "days": [
    {
      "day": number,
      "date": string,
      "theme": string,
      "themeColor": "nature" | "heritage" | "food" | "beach" | "adventure",
      "stops": [
        {
          "placeId": string,
          "name": string,
          "time": string,
          "endTime": string | null,
          "why": string,
          "travelAdvisory": string | null,
          "category": string
        }
      ],
      "restaurants": [
        {
          "placeId": string,
          "name": string,
          "meal": "lunch" | "dinner",
          "why": string,
          "travelAdvisory": string | null
        }
      ]
    }
  ]
}
Every "placeId" and "name" in the output must exactly match a
placeId/name already present in the supplied trip data — do not
generate new ids or alter names.
`.trim();
}

export default buildComposeItineraryPrompt;
