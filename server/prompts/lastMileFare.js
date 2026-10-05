// server/prompts/lastMileFare.js
// Google Search-grounded last-mile transport pricing prompt builder.
// Searches the web via Google Search Grounding for current bus, train,
// ferry, and taxi fares/durations from arrival airport/hub to destination.

export const LAST_MILE_SYSTEM_INSTRUCTION =
  "You are Trailmate's ground transport fare specialist. Your job is to search the " +
  "web for CURRENT, verifiable last-mile transport options (bus, train, taxi, ferry) " +
  "and fare ranges between an arrival airport or transit hub and a final destination. " +
  "You must base all prices, routes, and transfer requirements strictly on live Google Search results. " +
  "Never invent or guess fares. If sources disagree, provide a realistic price range. " +
  "If a mode has no direct route (such as hill-station toy trains that start at a separate junction), " +
  "explicitly flag that it requires a connecting road leg. " +
  "Highlight iconic UNESCO World Heritage transit experiences and scenic routes so travelers " +
  "can make an informed choice between practical transit efficiency and unforgettable journeys.";

/**
 * Builds the search-grounded last-mile prompt.
 *
 * @param {object} params
 * @param {string} params.fromAirport - Airport IATA or short code (e.g. CJB, IXB, IXC, DED, COK).
 * @param {string} params.fromAirportName - Full airport name (e.g. Coimbatore International Airport).
 * @param {string} params.destination - Final destination city/town (e.g. Ooty, Darjeeling, Shimla, Manali).
 * @param {string} [params.budgetTier="moderate"] - 'budget' | 'moderate' | 'luxury'.
 * @param {string} [params.pacePreference="balanced"] - 'relaxed' | 'balanced' | 'fast'.
 * @param {string} [params.preferredClass] - Optional preferred train/seat class.
 * @returns {string}
 */
export function buildLastMilePrompt({
  fromAirport,
  fromAirportName,
  destination,
  budgetTier = "moderate",
  pacePreference = "balanced",
  preferredClass = "All",
}) {
  return `Please search the web for current ground transport options, routes, and fare ranges from ${fromAirportName} (${fromAirport}) to ${destination}, India.

### CRITICAL SEARCH & EXTRACTION INSTRUCTIONS:

1. **TRANSPORT MODES TO SEARCH**:
   - **Taxi / Private Cab**: Prepaid airport taxis, local cab operators, app cabs (Ola/Uber if available), and shared cabs. Provide fare ranges for Hatchback/Sedan vs Mountain SUV.
   - **Bus**: State Transport buses (e.g. TNSTC, KSRTC, HRTC, UTC, NBSTC) and private AC/Volvo sleeper/semi-sleeper buses. Include boarding points (e.g. Gandhipuram in Coimbatore, ISBT in Chandigarh, Siliguri Junction in Bagdogra).
   - **Train / Heritage Rail**: Check if direct or connecting trains exist. 
     - **Ooty**: Nilgiri Mountain Railway (NMR - UNESCO World Heritage Toy Train) starts at Mettupalayam Junction (~35 km / 1 hr road transfer from Coimbatore Airport). Note both First Class (FC) and Second Class (2S) fares.
     - **Darjeeling**: Darjeeling Himalayan Railway (DHR - UNESCO World Heritage) starts at New Jalpaiguri (NJP) / Kurseong. Note Steam vs Diesel and First Class / CC fares.
     - **Shimla**: Kalka-Shimla Toy Train (UNESCO World Heritage) starts at Kalka Junction (~40 km from Chandigarh).
     - **Other cities**: Search local suburban / express rail connections or scenic ghat routes.
   - **Ferry / Catamaran** (where applicable, e.g. Port Blair to Havelock/Neil in Andaman, Mandovi River in Goa, Lake Pichola in Udaipur): Check high-speed catamarans (Makruzz / Green Ocean) or government ferries with seat tiers (Royal / Premium / Economy).

2. **BERTH, SEAT CLASS & VEHICLE TIER BREAKDOWN**:
   - For trains: Provide breakdown of available classes, e.g. "First Class (FC)", "AC Chair Car (CC)", "Second Sitting (2S)", "Sleeper (SL)" with their respective fare numbers in INR.
   - For buses: Note "AC Volvo / Luxury" vs "State RTC Ordinary / Express".
   - For taxis: Note "Sedan / Hatchback" vs "Innova / SUV".
   - For ferries: Note "Premium" vs "Executive" vs "Economy".

3. **BOOKING REALITY, SCARCITY & QUEUE WARNINGS (CRITICAL)**:
   - For high-demand UNESCO World Heritage routes, permit-controlled mountain passes (e.g. Rohtang in Manali), and island catamarans (Andaman):
     - **Advance Online Window**: Note how far in advance tickets must be booked (e.g. "IRCTC quota opens 60–120 days ahead and sells out in minutes/days").
     - **On-the-Spot Queue Reality**: Explicitly warn about on-spot station counters (e.g. "Unreserved spot counter opens at 5:00 AM; requires standing in line for 2–3 hours with only ~30 tickets available and high risk of not getting a seat").
     - **Actionable Pro-Tip**: Advise practical alternatives (e.g. take a direct private cab up the ghats, and book the local scenic Joy Ride or downhill return journey instead).
   - Set "bookingReality" object accordingly for every mode.

4. **LOGISTICAL TRUTHFULNESS & CONNECTING LEGS**:
   - If a mode is NOT direct (e.g. requires taking a cab/bus from airport to a railway junction or bus terminal first), you MUST set "hasDirectRoute": false and clearly explain the connecting transfer in "notes".

5. **EXPERIENTIAL & HERITAGE VALUE**:
   - If a mode is a UNESCO World Heritage site, famous scenic mountain pass, or iconic cultural experience, set "isHeritageExperience": true and summarize its appeal in "heritageNote".

6. **OBJECTIVE DUAL RECOMMENDATION**:
   - User Profile: Budget Priority: "${budgetTier}", Pace: "${pacePreference}", Preferred Seat Class: "${preferredClass}".
   - Provide a dual-perspective recommendation:
     - "reason": Practical, grounded recommendation based strictly on the discovered transit times, luggage handling, and fare numbers for this user's budget.
     - "experienceAlternative": The must-experience heritage/scenic alternative, clearly stating the advance booking requirement so the user can make an informed choice.
   - DO NOT use generic platitudes. Every justification must cite real numbers, duration, or routing facts discovered in search.

### REQUIRED JSON SCHEMA:
Return ONLY a valid JSON object matching this exact structure:
{
  "options": [
    {
      "mode": "Taxi" | "Bus" | "Train" | "Ferry",
      "operatorOrRoute": "string (e.g. Nilgiri Mountain Railway (Mettupalayam ➔ Ooty) or Prepaid Airport Taxi via NH181)",
      "durationRange": "string (e.g. 2.5 - 3.5 hrs or 4.5 - 5 hrs)",
      "fareRange": {
        "min": number,
        "max": number,
        "currency": "INR"
      },
      "classes": [
        { "className": "string (e.g. First Class FC)", "fare": number },
        { "className": "string (e.g. Second Class 2S)", "fare": number }
      ],
      "isHeritageExperience": boolean,
      "heritageNote": "string (or empty if standard transit)",
      "bookingReality": {
        "scarcityLevel": "EXTREME_DEMAND" | "HIGH_DEMAND" | "MODERATE" | "REGULAR",
        "advanceBookingWindow": "string (e.g. Book 60-120 days ahead on IRCTC)",
        "spotQueueAdvisory": "string (e.g. Station counter queues start at 5:00 AM; 2-3 hr wait for ~30 unreserved seats)",
        "actionableTip": "string (e.g. If sold out, take direct taxi up and book the short 2-hr Joy Ride)"
      },
      "notes": "string (transfer requirements, frequency, advance booking notes)",
      "hasDirectRoute": boolean
    }
  ],
  "recommendation": {
    "mode": "string",
    "reason": "string (fact-grounded reason for this traveler)",
    "experienceAlternative": "string (heritage or scenic alternative highlight with booking reality note)"
  }
}
`;
}

export default {
  LAST_MILE_SYSTEM_INSTRUCTION,
  buildLastMilePrompt,
};
