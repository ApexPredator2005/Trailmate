# 🗺️ Trailmate — AI Travel Planner

> **"APIs fetch verified facts. AI arranges and personalizes facts. AI never invents facts."**

Trailmate is a full-stack, anti-hallucination travel planner web app. It blends verified live APIs (Google Places, WeatherAPI, Google Flights) with Google Gemini AI models to compose personalized, day-by-day travel itineraries without fabricating places, prices, ratings, or facts.

---

## ✨ Features

- **14-Stage Intake & Planning State Machine**:
  - `WELCOME` → `PARSING` → `CLARIFYING` → `PREFERENCE_GATE` → `FLIGHT_PREFS` → `FLIGHT_SEARCH` → `FLIGHT_SELECTED` → `HOTEL_PREFS` → `HOTEL_SEARCH` → `HOTEL_SELECTED` → `PLACES_SELECT` → `RESTAURANTS_SELECT` → `COMPOSING` → `DONE`.
- **Intelligent Ground Transfer Resolution**:
  - Automatically identifies nearest airports for destinations without commercial airports (e.g., *Ooty → Coimbatore (CJB) ~2.5 hrs*, *Manali → Chandigarh (IXC) ~7 hrs*) with road transfer times.
- **Cost-Disciplined Verification & Bayesian Hotel Ranking**:
  - Uses Google Places Basic/Pro field masks for broad search and fetches detailed reviews only for top shortlists.
  - Calculates Bayesian confidence-weighted ratings: `weighted = (v / (v + 10)) * R + (10 / (v + 10)) * C`.
  - Scans reviews for bilingual (English & Hinglish) safety red flags (pests, hygiene, safety, amenities) and recent sentiment decline without removing candidates.
  - Highlights budget stretch options with a `"Worth a look"` ribbon.
- **Multi-Select Attractions & Dining**:
  - Interactive card carousel allowing flexible multi-selection before confirming.
- **Interactive Journey Timeline**:
  - Day-by-day journey line with dynamic destination color theming (`--day-accent`).
  - Interactive **Stop Swapping** (🔄) and **Add Activity** (+) directly from timeline buttons into chat card suggestions.
- **Export & Sharing**:
  - One-click Markdown copy to clipboard and print/PDF support.
- **Tactile / Organic Physical Journal UI**:
  - Warm parchment surfaces (`#FBF8F3`), terracotta and sage accents, serif headings, and resizable desktop split-view with local storage persistence.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

*(Optional) For the Python Google Flights scraper:*
```bash
pip3 install -r server/flights/requirements.txt
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your API keys when ready:
```ini
GOOGLE_PLACES_API_KEY=your_google_places_api_key
WEATHER_API_KEY=your_weather_api_key
GEMINI_API_KEY=your_gemini_api_key
```
> *Note: Trailmate includes rich curated datasets and deterministic route schedule generators, so the entire app can be run and tested without active API keys.*

### 3. Run Development Server
```bash
# Run Express backend + Vite frontend + Python flight microservice
npm run dev

# Or run Node backend + Vite frontend (standalone mode)
npm run dev:node
```

Visit **`http://localhost:5173`** in your browser.

---

## 🏗️ Architecture

```
trailmate/
├── index.html                   # HTML Shell with clean reactive mounting points
├── vite.config.js               # Dev & Build config with API proxy
├── src/
│   ├── main.js                  # Main entry point & component mounting
│   ├── store/
│   │   └── state.js             # Reactive Pub/Sub State Store
│   ├── engine/
│   │   ├── conversation.js      # 14-Stage Client State Machine & timeline editing
│   │   └── splitView.js         # Desktop Resizable Split-Pane with Drag Clamping
│   ├── services/
│   │   └── api.js               # Frontend API client
│   ├── components/              # ChatThread, ChatInput, OptionCard, CardCarousel, ItineraryPanel, etc.
│   └── styles/                  # CSS Design System Tokens & Component Styles
│
└── server/
    ├── index.js                 # Express server on port 3001
    ├── flights/                 # Python Flask microservice on port 5001
    ├── services/                # placesApi, weatherApi, flightService, gemini, chatService, rankingService
    ├── prompts/                 # parseInput, rankCandidates, composeItinerary
    └── routes/                  # chat, places, flights, weather endpoints
```

---

## 📜 License
MIT
