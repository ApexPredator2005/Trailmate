// server/services/gemini.js
// Thin wrapper around the Gemini API for Trailmate's AI composition/
// reasoning steps. This client is only ever used to REASON over data
// already fetched from real APIs (Places, flights, hotels) — see
// server/prompts/* for the actual prompt templates and their
// anti-fabrication constraints.

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.8-flash",
  "gemini-3.8-flash",
  "gemini-3-flash-preview",
  "gemini-3.7-flash",
];

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 8000;

/**
 * Calculates exponential backoff duration with full jitter (Suggestion #27).
 * Formula: delay = min(maxDelay, baseDelay * (2 ^ attempt)) * (0.75 + Math.random() * 0.5)
 * @param {number} attempt
 * @param {number} [baseDelayMs]
 * @param {number} [maxDelayMs]
 * @returns {number}
 */
export function calculateBackoffWithJitter(attempt, baseDelayMs = BASE_RETRY_DELAY_MS, maxDelayMs = MAX_RETRY_DELAY_MS) {
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  const jitterFactor = 0.75 + Math.random() * 0.5;
  return Math.round(exponential * jitterFactor);
}

function getApiKey() {
  return process.env.GEMINI_API_KEY;
}

/**
 * Initialize Gemini client supporting both @google/genai and @google/generative-ai SDKs.
 */
let genAIClient = null;
let sdkType = 'legacy'; // 'modern' (@google/genai) or 'legacy' (@google/generative-ai)

async function getClient() {
  const key = getApiKey();
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set.');
  }

  if (genAIClient) return genAIClient;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    genAIClient = new GoogleGenAI({ apiKey: key });
    sdkType = 'modern';
  } catch (e) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      genAIClient = new GoogleGenerativeAI(key);
      sdkType = 'legacy';
    } catch (err) {
      console.warn('[gemini.js] Neither @google/genai nor @google/generative-ai is available.');
    }
  }

  return genAIClient;
}

/**
 * Sleep helper for retry backoff.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns true if the error looks like a rate-limit (HTTP 429) or transient spike.
 * @param {unknown} err
 * @returns {boolean}
 */
function isTransientError(err) {
  if (!err || typeof err !== "object") return false;
  const status = err.status ?? err.code ?? err.response?.status;
  if (status === 429 || status === 503) return true;
  const message = String(err.message ?? "");
  return message.includes("429") || message.includes("503") || /rate limit/i.test(message) || /high demand/i.test(message);
}

/**
 * Calls generateContent once with fallback over candidate models.
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @param {object} [generationConfig]
 */
async function callGemini(prompt, systemInstruction, generationConfig = {}) {
  const client = await getClient();
  if (!client) {
    throw new Error('Gemini client failed to initialize. Check GEMINI_API_KEY and installed SDKs.');
  }

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      if (sdkType === 'modern') {
        const request = {
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          config: {
            ...generationConfig,
            ...(systemInstruction
              ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
              : {}),
          },
        };
        const res = await client.models.generateContent(request);
        return res.text;
      } else {
        // @google/generative-ai SDK
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            responseMimeType: generationConfig.responseMimeType,
          },
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (err) {
      lastError = err;
      if (err.message?.includes('404') || err.message?.includes('503')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/**
 * Calls Gemini with Google Search Grounding tool attached and extracts both
 * the parsed JSON answer and verified web citation sources.
 *
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<{ data: object, sources: Array<{ uri: string, title: string }> }>}
 */
async function callGeminiGrounded(prompt, systemInstruction) {
  const client = await getClient();
  if (!client) {
    throw new Error('Gemini client failed to initialize. Check GEMINI_API_KEY and installed SDKs.');
  }

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      if (sdkType === 'modern') {
        const request = {
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          config: {
            tools: [{ googleSearch: {} }],
            ...(systemInstruction
              ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
              : {}),
          },
        };
        const res = await client.models.generateContent(request);
        const text = res.text;
        const candidate = res.candidates?.[0];
        const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
          .map(c => c.web)
          .filter(Boolean)
          .map(w => ({ uri: w.uri, title: w.title || w.uri }));

        return { text, sources };
      } else {
        // @google/generative-ai SDK
        const model = client.getGenerativeModel({
          model: modelName,
          tools: [{ googleSearch: {} }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const candidate = result.response.candidates?.[0];
        const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
          .map(c => c.web)
          .filter(Boolean)
          .map(w => ({ uri: w.uri, title: w.title || w.uri }));

        return { text, sources };
      }
    } catch (err) {
      lastError = err;
      if (err.message?.includes('404') || err.message?.includes('503')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/**
 * Runs callGemini with one retry on transient errors.
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @param {object} [generationConfig]
 */
async function callWithRetry(prompt, systemInstruction, generationConfig) {
  let attempt = 0;

  while (true) {
    try {
      return await callGemini(prompt, systemInstruction, generationConfig);
    } catch (err) {
      const canRetry = attempt < MAX_RETRIES && isTransientError(err);
      if (!canRetry) {
        throw err;
      }
      const delay = calculateBackoffWithJitter(attempt);
      console.warn(`[gemini.js] Transient error (${err.message || err}). Retrying attempt ${attempt + 1}/${MAX_RETRIES} in ${delay}ms...`);
      attempt += 1;
      await sleep(delay);
    }
  }
}

/**
 * Calls Gemini with Google Search Grounding with transient retry logic,
 * parses JSON, and strictly verifies that grounding sources exist.
 *
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<{ data: object, sources: Array<{ uri: string, title: string }> }>}
 */
export async function generateGroundedJSON(prompt, systemInstruction) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    try {
      const { text, sources } = await callGeminiGrounded(prompt, systemInstruction);

      if (!sources || sources.length === 0) {
        throw new Error("No grounding sources returned from Google Search grounding (Gemini answered without web verification).");
      }

      if (typeof text !== "string" || text.trim() === "") {
        throw new Error("Gemini returned an empty response for a grounded JSON request.");
      }

      // Clean JSON text (strip markdown ```json fences if present)
      const cleanJson = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      try {
        const data = JSON.parse(cleanJson);
        return { data, sources };
      } catch (parseErr) {
        // Attempt substring extraction if model emitted extra commentary
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          return { data, sources };
        }
        throw new Error(`Gemini grounded response was not valid JSON: ${parseErr.message}`);
      }
    } catch (err) {
      lastError = err;
      const canRetry = attempt < MAX_RETRIES && isTransientError(err);
      if (!canRetry) {
        break;
      }
      const delay = calculateBackoffWithJitter(attempt);
      console.warn(`[gemini.js] Grounded search retry attempt ${attempt + 1}/${MAX_RETRIES} in ${delay}ms...`);
      attempt += 1;
      await sleep(delay);
    }
  }

  console.error("[gemini.js] generateGroundedJSON failed:", lastError?.message ?? lastError);
  throw lastError;
}

/**
 * Calls Gemini and returns a parsed JSON object.
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<object>} parsed JSON response
 */
export async function generateJSON(prompt, systemInstruction) {
  try {
    const text = await callWithRetry(prompt, systemInstruction, {
      responseMimeType: "application/json",
    });

    if (typeof text !== "string" || text.trim() === "") {
      throw new Error("Gemini returned an empty response for a JSON request.");
    }

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      throw new Error(
        `Gemini returned a response that was not valid JSON: ${parseErr.message}`
      );
    }
  } catch (err) {
    console.error("[gemini.js] generateJSON failed:", err.message ?? err);
    throw err;
  }
}

/**
 * Calls Gemini with Google Search Grounding for rich, grounded answers with citations.
 * Gracefully falls back to plain text if search grounding is unavailable.
 *
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<{ text: string, sources: Array<{ uri: string, title: string }> }>}
 */
export async function generateGroundedText(prompt, systemInstruction) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    try {
      const { text, sources } = await callGeminiGrounded(prompt, systemInstruction);
      if (typeof text !== "string" || text.trim() === "") {
        throw new Error("Gemini returned an empty response for a grounded text request.");
      }
      return { text: text.trim(), sources: sources || [] };
    } catch (err) {
      lastError = err;
      const canRetry = attempt < MAX_RETRIES && isTransientError(err);
      if (!canRetry) {
        break;
      }
      const delay = calculateBackoffWithJitter(attempt);
      console.warn(`[gemini.js] Grounded text search retry attempt ${attempt + 1}/${MAX_RETRIES} in ${delay}ms...`);
      attempt += 1;
      await sleep(delay);
    }
  }

  console.warn("[gemini.js] Grounded search fallback to plain text:", lastError?.message ?? lastError);
  try {
    const fallbackText = await generateText(prompt, systemInstruction);
    return { text: fallbackText, sources: [] };
  } catch (fallbackErr) {
    throw lastError || fallbackErr;
  }
}

/**
 * Calls Gemini and returns a plain text string.
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<string>}
 */
export async function generateText(prompt, systemInstruction) {
  try {
    const text = await callWithRetry(prompt, systemInstruction);
    return text ?? "";
  } catch (err) {
    console.error("[gemini.js] generateText failed:", err.message ?? err);
    throw err;
  }
}

export default { generateJSON, generateGroundedJSON, generateGroundedText, generateText };

