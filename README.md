# 🗺️ Trailmate — AI Travel Planner & Vintage Scrapbook Studio

> **"APIs fetch verified facts. AI arranges and personalizes facts. AI never invents facts."**

Trailmate is a full-stack, anti-hallucination travel planner and tactile memory studio. It blends verified live APIs (Google Places, WeatherAPI, flight engines) with Google Gemini AI models to compose authentic, day-by-day travel itineraries without fabricating places, prices, ratings, or facts. 

Beyond itinerary planning, Trailmate features a bespoke **Vintage Scrapbook Studio** where travelers can turn their journeys into handcrafted digital mementos with vintage washi tapes, retro stamps, postal marks, and stickers.

---

## ✨ Features

### 🧠 Anti-Hallucination AI Itinerary Engine
- **14-Stage Guided Intake State Machine**:
  `WELCOME` → `PARSING` → `CLARIFYING` → `PREFERENCE_GATE` → `FLIGHT_PREFS` → `FLIGHT_SEARCH` → `FLIGHT_SELECTED` → `HOTEL_PREFS` → `HOTEL_SEARCH` → `HOTEL_SELECTED` → `PLACES_SELECT` → `RESTAURANTS_SELECT` → `COMPOSING` → `DONE`.
- **Intelligent Last-Mile & Airport Resolution**:
  Automatically resolves nearest commercial airports for remote destinations (e.g., *Ooty → Coimbatore (CJB) ~2.5 hrs*, *Manali → Chandigarh (IXC) ~7 hrs*) with search-grounded road transfers and realistic cab/bus fares.
- **Cost-Disciplined Verification & Bayesian Hotel Ranking**:
  - Employs Google Places Basic/Pro field masks for broad search and fetches detailed reviews only for top shortlists to preserve API quotas.
  - Computes Bayesian confidence-weighted scores: `weighted = (v / (v + 10)) * R + (10 / (v + 10)) * C`.
  - Flags potential issues (hygiene, amenities, noise) in English and Hinglish reviews without removing candidates.
  - Highlights budget stretch options with a *"Worth a look"* tag.
- **Interactive Live Timeline & Itinerary**:
  - Live day-by-day schedule updating interactively as choices are made.
  - Interactive **Stop Swapping** (🔄) and **Add Activity** (+) directly from timeline buttons.
  - Server-Sent Events (SSE) streaming for step-by-step composition updates.

### 🎨 Scrapbook Studio & Creative Canvas
- **Tactile Scrapbook Workspace**:
  - Drag-and-drop embellishments (washi tapes, vintage stamps, postmarks, travel scraps, and monthly badges).
  - Multi-element selection (Shift + Click), group translation, duplication, depth ordering, and full Undo/Redo (`Cmd+Z` / `Cmd+Shift+Z`) history stack.
  - Touch-friendly controls with long-press radial context menus on mobile devices.
  - Sticker favorites and recently-used quick-access drawers.
- **Export & Sharing**:
  - Download custom scrapbooks as high-resolution PNGs or JSON project files.
  - One-click itinerary export to Markdown, clipboard, and print/PDF.

### 🛡️ Production Security & Performance Hardening
- **Tiered Quota-Safe Rate Limiting**: Dedicated rate limiters on `/api/auth` (max 5 attempts / 15 min), `/api/chat` (max 8 requests / 15 min), and global routes to protect Google Cloud and Gemini API budgets.
- **Recursive Input Sanitization**: Strips control characters, null bytes, and defends against object prototype pollution.
- **Zod Schema Validation**: Rejects malformed and oversized payloads (>100 KB).
- **Security Headers & Reverse Proxy**: Equipped with `X-Frame-Options`, `X-Content-Type-Options: nosniff`, and `trust proxy` configured for Vercel, Render, and Railway.

---

## 🧗 Challenges Faced

Building Trailmate into a cohesive, dependable application brought exciting hurdles across both technical architecture and project design:

### ⚙️ Technical Challenges
1. **The Anti-Hallucination Dilemma (Grounding vs. Flexibility)**:
   - *Problem:* Large Language Models inherently love to invent hotel names, flight numbers, and operating hours that sound plausible but do not exist in reality.
   - *Solution:* We strictly divorced **data retrieval** from **data synthesis**. The Express backend queries real APIs (Google Places, WeatherAPI, DGCA domestic flight schedules) first. Gemini is then passed the exact verified candidate payloads with strict system prompts forbidding it from introducing any venue or price outside the payload.
2. **Dynamic Serverless vs. Long-Running SSE Connections on Vercel**:
   - *Problem:* Complex itineraries that sequence multiple days, weather alerts, and flights can take 5–15 seconds to compose. Traditional HTTP requests risk timing out or leaving users staring at an uninformative loading spinner.
   - *Solution:* Implemented Server-Sent Events (`/api/chat/stream`) with incremental progress emissions (`"Resolving weather..."`, `"Sequencing day 1 morning..."`). We tuned `vercel.json` rewrites and disabled response buffering (`X-Accel-Buffering: no`) so progress ticks stream to the client in real time.
3. **Canvas State Management & Fluid Scrapbook Interactions**:
   - *Problem:* Managing freeform canvas dragging, rotation handles, layer re-ordering, group selection, and undo/redo stacks in vanilla JavaScript without heavy third-party canvas engines was tricky to keep performant at 60fps.
   - *Solution:* Implemented a unified coordinate projection matrix with pointer events, bounding-box hit testing, and lightweight snapshot-based immutability for the undo/redo stack.

### 🧭 Non-Technical & Design Challenges
1. **Balancing Information Density with Warmth**:
   - Travel apps often look like sterile utility spreadsheets or corporate booking engines. Finding an aesthetic language—warm parchment surfaces (`#FBF8F3`), terracotta and sage tones, serif typography, and tactile scrapbook paper textures—while keeping flight itineraries legible was an iterative design challenge.
2. **Prompt Crafting & Intake Natural Language Processing**:
   - Guiding a user through destination, dates, budget, travel style, and pace without making it feel like filling out a bureaucratic government form required refining the conversational intake engine to intelligently parse casual responses (like *"next weekend with friends for under 20k"* or single-word replies like *"Manali"*).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your API keys in `.env`:
```ini
GOOGLE_PLACES_API_KEY=your_google_places_api_key
WEATHER_API_KEY=your_weather_api_key
GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key
NODE_ENV=development
```
> *Note: Trailmate includes rich curated datasets and deterministic route schedules, so the entire app can be run and explored locally even without active external API keys.*

### 3. Run Development Server
```bash
# Run Express backend + Vite frontend
npm run dev:node

# Run unit tests
npm test
```
Visit **`http://localhost:5173`** in your browser.

---

## 🏗️ Architecture Overview

```
trailmate/
├── api/                         # Vercel serverless entry point (index.js)
├── vercel.json                  # Vercel routing, rewrites & static asset rules
├── index.html                   # HTML shell with reactive mount points
├── vite.config.js               # Dev & Build config with API reverse-proxy
├── src/
│   ├── main.js                  # App bootstrap, view router & event binding
│   ├── store/state.js           # Pub/Sub state store
│   ├── engine/conversation.js   # 14-stage intake state machine & SSE consumer
│   ├── components/              # ChatThread, ScrapbookWorkspace, ItineraryPanel, etc.
│   ├── views/                   # TripsView, MapView, ShareView, SettingsView
│   └── styles/                  # Vintage theme tokens, scrapbook CSS, cards & chips
└── server/
    ├── index.js                 # Hardened Express server with rate limiters
    ├── middleware/              # Input sanitizers, rateLimiters, Zod validators
    ├── routes/                  # chat, chat-stream, flights, places, weather
    ├── schemas/                 # Zod payload & query schemas
    └── services/                # gemini, placesApi, weatherApi, flightService, cache
```

---

## 💛 A Personal Note from the Creator

> *Building Trailmate has been an absolute joy from start to finish. Merging two different worlds—the precision of anti-hallucinatory AI with the nostalgic, tactile charm of old-school travel scrapbooks—turned this into more than just a software project. Designing the vintage stickers, refining the conversational flow, and seeing raw API data transform into an inspiring itinerary was genuinely exciting. I hope using Trailmate brings you as much wanderlust and happiness as I felt bringing it to life!* 🎒✨

---

## 📜 License
MIT © 2026 Trailmate
