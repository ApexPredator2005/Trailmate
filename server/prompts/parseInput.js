// server/prompts/parseInput.js
// Builds the prompt used to extract structured trip details from the
// user's free-form opening message (e.g. "3 day trip to Tokyo next
// month, love animals, street food, historic monuments, moderate
// budget"). This is a pure extraction task: the model must only surface
// what the user actually said, never fill in or guess a value.

export const PARSE_INPUT_SYSTEM_INSTRUCTION =
  "You are a travel planner assistant. Extract trip details from the " +
  "user's message. Only extract what is explicitly stated. Never guess " +
  "or assume.";

// Fields that are always required to proceed with planning, regardless
// of what the user did or didn't mention. If any of these are absent
// from the extracted data, they must appear in `missing`.
const ALWAYS_CRITICAL_FIELDS = ["travelers", "homeCity", "dates"];

/**
 * Builds the user-turn prompt for parsing a free-form trip request.
 *
 * @param {string} userMessage - the raw text the user typed.
 * @param {object} [existingTrip] - optional existing trip context
 * @returns {string} the prompt to send to Gemini via generateJSON().
 */
export function buildParseInputPrompt(userMessage, existingTrip = {}) {
  const contextLines = [];
  if (existingTrip.destination) contextLines.push(`Already selected destination: "${existingTrip.destination}"`);
  if (existingTrip.travelers) contextLines.push(`Already known travelers: ${existingTrip.travelers}`);
  if (existingTrip.dates || existingTrip.startDate) contextLines.push(`Already known travel dates: "${existingTrip.dates || existingTrip.startDate}"`);
  if (existingTrip.duration) contextLines.push(`Already known duration: ${existingTrip.duration} days`);

  const contextBlock = contextLines.length > 0
    ? `\nEXISTING TRIP CONTEXT ALREADY CONFIRMED BY USER:\n${contextLines.join('\n')}\n`
    : '';

  return `
Extract trip planning details from the traveler's message below.
${contextBlock}
TRAVELER'S MESSAGE:
"""
${userMessage}
"""

INSTRUCTIONS
- Only extract information the traveler explicitly stated. Do not infer,
  guess, or fill in a plausible-sounding value for anything they did not
  say. If something is not mentioned, leave it null/omitted — do not
  invent a default.
- If the traveler is already planning a trip to a destination (e.g., Destination is already known as "${existingTrip.destination || ''}") and says a city name (like "Patna", "Delhi", "from Mumbai", etc.), extract this city as "homeCity" (departure city), NOT as a replacement destination.
- "duration" should be extracted as a number of days if stated (e.g.
  "3 day trip" -> 3). If not stated, leave it null.
- "timing" is whatever the user said about when they're traveling,
  verbatim in meaning (e.g. "next month", "in December", specific
  dates) — do not convert a vague timing phrase into a specific date
  yourself.
- "interests" is an array of short strings, using the traveler's own
  categories/wording where possible (e.g. "street food", "historic
  monuments", "nature", "tea gardens", "beaches").
- "budgetTier" must be exactly one of: "budget", "moderate", "luxury",
  or null if not stated or not clearly implied.
- "pacePreference" must be one of: "relaxed", "balanced", "fast", or null.
- "cabinClass" must be one of: "economy", "premium", "business", or null.
- "hotelStyle" must be one of: "hotel", "resort", "villa", "homestay", "heritage", or null.
- "dietary" is an array of dietary preferences (e.g. ["pure_veg", "jain", "halal", "seafood", "vegan"]).
- "travelers" is the number of people traveling, if stated.
- "homeCity" is the traveler's departure city, if stated.
- "intent" must be one of: "plan_trip", "ask_question", "greeting", "modify_trip".
- "suggestedReply" is a concise, natural, and friendly conversational response (1-2 sentences, professional tone, NO emoji overuse — do not use multiple emojis, at most 1 subtle emoji if appropriate) confirming what was understood or politely asking for missing details.
- The following fields are ALWAYS considered critical/required to
  proceed with planning, regardless of what was said: ${ALWAYS_CRITICAL_FIELDS.join(", ")}.
  If any of them are not present in what you extracted, they MUST be
  listed in "missing", even if other fields were filled in confidently.
- Also include in "missing" any other field from the schema below that
  the traveler did not mention.

Return ONLY a JSON object with this exact shape:
{
  "extracted": {
    "destination": string | null,
    "duration": number | null,
    "timing": string | null,
    "interests": string[],
    "budgetTier": "budget" | "moderate" | "luxury" | null,
    "pacePreference": "relaxed" | "balanced" | "fast" | null,
    "cabinClass": "economy" | "premium" | "business" | null,
    "hotelStyle": "hotel" | "resort" | "villa" | "homestay" | "heritage" | null,
    "dietary": string[],
    "travelers": number | null,
    "homeCity": string | null,
    "intent": "plan_trip" | "ask_question" | "greeting" | "modify_trip"
  },
  "suggestedReply": string | null,
  "missing": string[]
}
`.trim();
}

export default buildParseInputPrompt;
