// server/services/weatherApi.js
// Wrapper around WeatherAPI.com — used for the general seasonal note
// (Section 4.18, part 1) and for severe weather alerts (Section 4.18,
// part 2 — the red/orange/yellow-level warning feature). Chosen over
// IMD's direct API because IMD's official registration is currently on
// hold, and the available unofficial wrappers around IMD data are too
// fragile for a safety-relevant feature. Severe weather alerts are a
// standard (not premium) part of WeatherAPI.com's free tier.

const BASE_URL = "https://api.weatherapi.com/v1";

function getApiKey() {
  return process.env.WEATHER_API_KEY;
}

/**
 * Performs a raw fetch against the WeatherAPI.com API and throws a
 * descriptive error on a non-OK response.
 *
 * @param {URL} url
 * @returns {Promise<object>} parsed JSON response
 */
async function weatherFetch(url) {
  const response = await fetch(url.toString());

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `WeatherAPI request failed (${response.status} ${response.statusText}): ${bodyText}`
    );
  }

  return response.json();
}

/**
 * Fetches a multi-day forecast (plus current conditions and any active
 * severe weather alerts) for a location.
 *
 * @param {string} location - a place name, "lat,lon" string, or any
 *   other query WeatherAPI.com's `q` parameter accepts.
 * @param {number} [days=3] - number of forecast days (WeatherAPI.com's
 *   free tier typically supports up to 3 days ahead).
 * @returns {Promise<{ current: object, forecast: object, alerts: object[] }>}
 */
export async function getForecast(location, days = 3) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("WEATHER_API_KEY is not set.");
  }

  const url = new URL(`${BASE_URL}/forecast.json`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", location);
  url.searchParams.set("days", String(days));
  url.searchParams.set("aqi", "no");
  url.searchParams.set("alerts", "yes");

  const data = await weatherFetch(url);

  return {
    current: data.current ?? null,
    forecast: data.forecast ?? null,
    alerts: data.alerts?.alert ?? [],
  };
}

/**
 * Fetches only the active severe weather alerts for a location, for
 * the immediate/current day. Use this for the Section 4.18 severe
 * weather alert check when you don't need the full multi-day forecast.
 *
 * Per the honesty rule in the project spec, only real alerts returned
 * here should ever be surfaced to the user as a warning — never infer
 * or fabricate a severity level that isn't present in this response.
 *
 * @param {string} location
 * @returns {Promise<object[]>} array of alert objects as returned by
 *   WeatherAPI.com (empty array if none are active).
 */
export async function getAlerts(location) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("WEATHER_API_KEY is not set.");
  }

  const url = new URL(`${BASE_URL}/forecast.json`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", location);
  url.searchParams.set("days", "1");
  url.searchParams.set("alerts", "yes");

  const data = await weatherFetch(url);

  return data.alerts?.alert ?? [];
}

export default { getForecast, getAlerts };
