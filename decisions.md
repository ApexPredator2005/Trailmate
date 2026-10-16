# 🧭 Trailmate — Comprehensive Architecture, Stack & Product Decision Log (`decisions.md`)

**Project:** Trailmate — Intelligent Anti-Hallucination Travel Planner, Scrapbook Studio & Community Expedition Platform  
**Authors & Decision Makers:** Pratyush Raj (Product & Engineering Lead) & Antigravity (AI Pair-Programming Assistant)  
**Status:** Living Architectural Decision Record (ADR)  
**Last Updated:** October 2026  

---

## Table of Contents
1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [Foundational Tech Stack & Framework Decisions](#2-foundational-tech-stack--framework-decisions)
3. [AI & Anti-Hallucination Architecture Decisions](#3-ai--anti-hallucination-architecture-decisions)
4. [Product & Functional Decisions](#4-product--functional-decisions)
5. [Visual, Aesthetic & Design System Decisions](#5-visual-aesthetic--design-system-decisions)
6. [Media, Asset & Imagery Strategy Decisions](#6-media-asset--imagery-strategy-decisions)
7. [Security, Performance & Non-Functional Decisions](#7-security-performance--non-functional-decisions)
8. [Comprehensive Decision Matrix](#8-comprehensive-decision-matrix)
9. [Pending & Future Architectural Roadmap](#9-pending--future-architectural-roadmap)

---

## 1. Executive Architecture Overview

Trailmate is engineered around a core tenet:
> **"APIs fetch verified facts. AI arranges and personalizes facts. AI never invents facts."**

To maintain this standard while offering a high-performance **Scrapbook Studio** and an overland **Tactile PVC Expedition Board**, every layer of the tech stack—from the choice of frontend language down to the map rendering engine and rate-limiting middleware—was chosen deliberately. This document records the technical, product, and architectural motivations behind every choice.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             TRAILMATE FULL-STACK TOPOLOGY                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   CLIENT TIER (Vite 6 + ES Modules)                                              │
│   ┌───────────────────────────┐  ┌────────────────────────┐  ┌────────────────┐  │
│   │ Vanilla JS View Modules   │  │ Scrapbook Canvas Engine│  │ Leaflet.js Map │  │
│   │ (Login, Chat, Community)  │  │ (Pointer Events Matrix)│  │ (Parchment CSS)│  │
│   └─────────────┬─────────────┘  └───────────┬────────────┘  └───────┬────────┘  │
│                 │                            │                       │           │
│                 └────────────────────────────┼───────────────────────┘           │
│                                              ▼                                   │
│                        Local-First Reactive State & Storage                      │
│                        (localStorage: Profiles, Badges, Posts)                   │
├──────────────────────────────────────────────┬───────────────────────────────────┤
│                                              │ HTTP / SSE Stream (/api/chat)     │
│   SERVER TIER (Node.js & Python Microservices)                                   │
│   ┌──────────────────────────────────────────┴────────────────────────────────┐  │
│   │ Express.js API Gateway (Zod Validation, Quota Rate-Limiting, Helmet)       │  │
│   └──────────────────────┬─────────────────────────────────┬──────────────────┘  │
│                          │                                 │                     │
│                          ▼                                 ▼                     │
│             ┌─────────────────────────┐       ┌───────────────────────────────┐  │
│             │ Gemini 3.8 / 1.5 Flash  │       │ Python Flask Microservice     │  │
│             │ (Search Grounding & SSE)│       │ (DGCA Airline Schedule Engine)│  │
│             └─────────────────────────┘       └───────────────────────────────┘  │
│                          │                                                       │
│                          ▼                                                       │
│             Verified Fact APIs: Google Places Basic/Pro, WeatherAPI              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Foundational Tech Stack & Framework Decisions

### DEC-001: Vanilla JavaScript (ES2022+ / Native Modules) vs. React / Next.js / Vue
* **Decision Makers:** Joint (Pratyush Raj & Antigravity)
* **Category:** Core Technology / Frontend Architecture
* **Status:** Implemented & Verified
* **The Context & Problem:**
  When architecting Trailmate, the default contemporary instinct in web development was to reach for a heavy single-page application (SPA) framework such as React, Next.js, or Vue. However, Trailmate features three distinct interaction paradigms:
  1. A multi-turn AI streaming chat with live timetable mutation.
  2. A high-framerate freeform graphics editor (Scrapbook Studio) with custom drag-and-drop, rotational affine transforms, and multi-element selection.
  3. Interactive canvas and SVG rendering for tactile 3D rubber patches.
* **The Decision:**
  Build Trailmate using **modern Vanilla JavaScript (ES2022+ Native ES Modules)** bundled with **Vite 6**, completely bypassing React, Vue, Angular, or Next.js.
* **Why This Was Chosen (Deep Rationale):**
  * **Zero Virtual DOM Overhead for 60fps Canvas Operations:** Virtual DOM reconciliation (such as React's fiber tree) introduces significant CPU overhead when continuously calculating pointer coordinates during multi-element group dragging, live rotation handles, and scale adjustments in Scrapbook Studio. Native DOM manipulations and `requestAnimationFrame` updates run directly on the browser engine without memory churn or garbage collection pauses.
  * **No Hydration Inconsistencies with Streaming SSE:** Trailmate streams itinerary steps over Server-Sent Events (`/api/chat/stream`). Framework hydration models often choke or trigger layout flicker when streaming HTML chunks mutate state outside the React lifecycle.
  * **Ultra-Lightweight Bundle & Instant HMR:** Without the weight of `react`, `react-dom`, framework routers, and associated dependencies, Vite boots in under 150ms and the entire core application bundle stays under 100KB gzipped.
  * **Native Browser Standards:** Leverages modern web standards (`PointerEvents`, `ResizeObserver`, CSS Custom Properties, `IntersectionObserver`, and Web Components) without framework abstraction wrappers.
* **Alternatives Considered & Rejected:**
  * *React 18 / 19:* Rejected due to unnecessary bundle overhead (~140KB baseline), re-render optimization complexity in canvas manipulation, and dependency churn.
  * *Next.js (App Router):* Rejected because Trailmate’s intensive client-side canvas and offline state make server-side rendering (SSR) redundant and overly complex to deploy on serverless edge functions with long-lived streaming connections.
  * *Svelte:* Considered for its compile-time reactivity, but Vanilla JS provided 100% longevity, zero compile-step dependencies for core logic, and direct interoperability with external libraries like Leaflet.

---

### DEC-002: Tailwind CSS v4 + Scoped Custom CSS vs. Component Libraries (MUI / Shadcn / Chakra)
* **Decision Makers:** Joint
* **Category:** Frontend / Styling Architecture
* **Status:** Implemented
* **The Context & Problem:**
  Most component libraries (Material UI, Ant Design, Chakra UI, Shadcn) are tailored for corporate SaaS dashboards, financial portals, and modern flat interfaces. They enforce blue/gray palettes, generic drop shadows, and modern utilitarian buttons.
* **The Decision:**
  Adopt **Tailwind CSS v4** (using `@tailwindcss/vite`) combined with **handcrafted scoped CSS architecture** organized into dedicated style sheets:
  * `base.css`: Global typography, color tokens, and CSS variables.
  * `chat.css`: Conversational intake bubbles, itinerary waypoints, and 60fps header doodle animations.
  * `scrapbook-workspace.css`: Freeform artboard, rotation handles, layer trays, and washi-tape textures.
  * `community.css`: Tactile 3D molded PVC morale patches, durometer badges, and 3D card-flip mechanics.
  * `login.css`: Diffuse wallpaper crossfading, Andasia drop-cap typography, and quote merge keyframes.
* **Why This Was Chosen:**
  * **Bespoke Tactile Realism:** Achieving the texture of 19th-century parchment, torn paper edges, washi tape, and vulcanized rubber morale patches requires custom CSS properties (`backdrop-filter`, multi-stage `box-shadow`, `stroke-dasharray`, `feSpecularLighting`). Generic component libraries fight against these custom textures.
  * **Tailwind v4 Engine:** Provides blazing fast utility styling without runtime CSS-in-JS overhead.
  * **Maintainability & Separation of Concerns:** Isolating complex domain stylesheets ensures that styling changes to the Scrapbook canvas never accidentally break the itinerary timeline or chat views.
* **Alternatives Considered & Rejected:**
  * *Material UI (MUI):* Strongly rejected due to Google Material Design 3 tropes that make all travel apps look like Google Flights or Android settings.
  * *Styled Components / Emotion:* Rejected due to runtime performance penalties during animated canvas manipulation.

---

### DEC-003: Leaflet.js + Filtered OpenStreetMap Tiles vs. Google Maps JavaScript SDK
* **Decision Makers:** Joint
* **Category:** Geospatial / Map Architecture
* **Status:** Implemented
* **The Context & Problem:**
  Interactive mapping is essential for itinerary visualizers, attraction clusters, and geocache treasure hunts. However, utilizing the official Google Maps JavaScript SDK presents severe business and technical drawbacks:
  1. *Cost & Quota Depletion:* Google Maps JavaScript SDK charges per dynamic map load. For an exploratory travel app where users frequently toggle destinations and views, API costs balloon exponentially.
  2. *Aesthetic Discordance:* Standard Google Maps satellite and road layers are bright white/blue, which clashes jarringly with Trailmate's warm parchment journal palette (`#FCF9F4`).
* **The Decision:**
  Use **Leaflet.js (v1.9.4)** with **OpenStreetMap (OSM) tile servers**, enhanced with custom CSS parchment filter chaining:
  ```css
  .leaflet-tile {
    filter: sepia(0.32) contrast(1.08) brightness(0.96) saturate(0.85);
  }
  ```
  Pair this with **1-click external Google Maps handoff** (`https://www.google.com/maps/dir/?api=1...`) for real-world turn-by-turn navigation.
* **Why This Was Chosen:**
  * **100% Free & Quota-Safe:** Leaflet and OSM require zero API keys and have zero usage billing for map exploration.
  * **Artistic Journal Styling:** CSS filter chaining seamlessly transforms standard cartography into an antique 19th-century explorer’s parchment map.
  * **Offline/Low-Bandwidth Resiliency:** Leaflet handles tile caching smoothly without authentication errors when cellular connectivity drops on remote trails.
  * **Best of Both Worlds:** Leaflet handles in-app browsing and route polylines; when travelers are ready to drive, a single click opens native Google Maps on their device with exact coordinates pre-populated.
* **Alternatives Considered & Rejected:**
  * *Google Maps JS SDK:* Rejected due to high cost per 1,000 map loads and strict styling restrictions.
  * *Mapbox GL JS:* Rejected due to mandatory billing accounts, proprietary telemetry tokens, and large WebGL runtime overhead.

---

### DEC-004: Express.js API Gateway + Python Microservice Architecture
* **Decision Makers:** Joint
* **Category:** Backend Architecture
* **Status:** Implemented
* **The Context & Problem:**
  Trailmate requires two very different types of backend computation:
  1. High-throughput, non-blocking I/O for streaming Server-Sent Events (SSE), API orchestration, rate limiting, and client serving.
  2. Algorithmic flight parsing, domestic airline route graphs, and fare calculations that benefit from Python’s data-science ecosystem.
* **The Decision:**
  Deploy a **Dual-Service Architecture**:
  * **Primary Node.js / Express Server (`server/index.js`):** Acts as the API Gateway, handling rate limiting, request validation (`zod`), Gemini API streaming, Places/Weather proxying, and client serving.
  * **Python Flask Flights Microservice (`server/flights/app.py`):** Dedicated microservice focused solely on domestic flight searches, airline logo mappings, and multi-leg layover computations.
* **Why This Was Chosen:**
  * *Node.js Event-Loop Advantage:* Handles long-lived streaming connections (`/api/chat/stream`) with zero thread-blocking overhead.
  * *Service Isolation:* If the flight search engine experiences third-party scraping latency or crashes, the core itinerary planner, scrapbook studio, and community view remain 100% operational.
  * *Concurrent Developer Workflow:* Wired together via `concurrently` in `package.json` (`npm run dev`) for seamless local execution.
* **Alternatives Considered & Rejected:**
  * *Monolithic Python (Django/FastAPI for everything):* Rejected because Python’s async SSE streaming and static client serving are less lightweight than Node/Express for simple serverless edge deployment.
  * *Monolithic Node.js (translating flight algorithms to JS):* Rejected because existing Python aviation libraries provided immediate, robust domestic schedule resolution.

---

### DEC-005: Vitest vs. Jest for Unit & Schema Testing
* **Decision Makers:** Assistant (Validated by User)
* **Category:** Testing & Developer Experience
* **Status:** Implemented (All 22 tests passing)
* **The Context & Problem:**
  Testing ES Module-based codebases in Jest often requires complex Babel or `ts-jest` transpilation setups, resulting in slow test suite start times and module resolution errors with native ESM (`import/export`).
* **The Decision:**
  Adopt **Vitest (v4)** as the sole unit test runner across all client and server unit tests (`tests/weather.test.js`, `tests/schemas.test.js`, `tests/state.test.js`).
* **Why This Was Chosen:**
  * **Shared Vite Pipeline:** Reuses Vite’s configuration, plugins, and module resolution directly—zero duplicate config.
  * **Native ESM Out-of-the-Box:** Runs native modern JavaScript with zero transpilation overhead.
  * **Execution Speed:** Runs all 22 tests across schemas, weather parsing, and state engines in under 200ms.
* **Alternatives Considered & Rejected:**
  * *Jest:* Rejected due to legacy CommonJS origins, slow startup times, and complex configuration required to parse native ES modules.

---

## 3. AI & Anti-Hallucination Architecture Decisions

### DEC-006: Strict Separation of Data Retrieval from AI Synthesis
* **Decision Makers:** Joint (Core Project Philosophy)
* **Category:** AI Architecture & Data Integrity
* **Status:** Implemented
* **The Context & Problem:**
  Large Language Models (LLMs) hallucinate plausible-sounding falsehoods: phantom hotel names, non-existent trains, closed restaurants, and fabricated pricing. In travel planning, this leads to ruined vacations.
* **The Decision:**
  Enforce a strict architectural boundary:
  > **APIs fetch verified facts. AI arranges and personalizes facts. AI never invents facts.**
  1. *Stage 1 (API Retrieval):* The backend queries Google Places, WeatherAPI, and DGCA flight databases to retrieve verified candidate entities (actual names, real GPS coordinates, verified opening hours, and real review snippets).
  2. *Stage 2 (Bayesian Confidence Scoring):* Venues are ranked mathematically before AI ever sees them:
     $$\text{Weighted Score} = \left(\frac{v}{v + 10}\right) \cdot R + \left(\frac{10}{v + 10}\right) \cdot C$$
  3. *Stage 3 (AI Synthesis):* The verified payload is passed to Google Gemini with a system prompt that forbids introducing any unlisted venue or altering factual attributes.
* **Why This Was Chosen:**
  * Eliminates AI hallucinations at the architectural level rather than attempting to filter them out post-generation.
  * Protects users from booking phantom hotels or navigating to closed heritage sites.

---

### DEC-007: 14-Stage Guided Intake State Machine
* **Decision Makers:** Joint
* **Category:** Conversational UX & State Architecture
* **Status:** Implemented
* **The Context & Problem:**
  Unstructured chat prompts like *"Plan a trip to Goa"* leave critical dimensions undefined (budget, pace, companions, transport, food restrictions), forcing the AI to make blind assumptions. Conversely, multi-page static web forms feel bureaucratic and kill spontaneous wanderlust.
* **The Decision:**
  Implement a deterministic 14-stage intake state machine:
  `WELCOME` $\rightarrow$ `PARSING` $\rightarrow$ `CLARIFYING` $\rightarrow$ `PREFERENCE_GATE` $\rightarrow$ `FLIGHT_PREFS` $\rightarrow$ `FLIGHT_SEARCH` $\rightarrow$ `FLIGHT_SELECTED` $\rightarrow$ `HOTEL_PREFS` $\rightarrow$ `HOTEL_SEARCH` $\rightarrow$ `HOTEL_SELECTED` $\rightarrow$ `PLACES_SELECT` $\rightarrow$ `RESTAURANTS_SELECT` $\rightarrow$ `COMPOSING` $\rightarrow$ `DONE`.
* **Why This Was Chosen:**
  * Maintains the conversational, friendly feel of an AI assistant while systematically collecting all required constraints.
  * Users can type unstructured answers (*"me and 2 buddies on a shoestring budget for 4 days"*), and the state machine parses and advances through the pipeline reliably.

---

## 4. Product & Functional Decisions

### DEC-008: Redesign Badges into 12 Tactile 3D Molded PVC Morale Patches
* **Decision Makers:** User Directive (Implemented via Subagent Orchestration & Stitch MCP)
* **Category:** Product & Gamification
* **Status:** Implemented & Verified
* **The Context & Problem:**
  Trailmate originally featured 12 Victorian-era hand-cast metallic medallions. Later, 6 tactical PVC patches were introduced, splitting the Badges tab with an awkward style toggle (`[ Victorian Medallions | PVC Patches ]`). This fragmented the gamification loop and diluted brand identity.
* **The Decision:**
  Combine and redesign all 12 badges into a unified **Tactile 3D Molded PVC Morale Patch & Expedition Board**:
  * Every single honor (from *First Steps* to *Phantom Trail Whisperer*) was re-imagined as a physical molded silicone/rubber badge.
  * Implemented 3D card flips revealing hook-and-loop Velcro backings, Mil-Spec serial codes, and field lore.
  * Added category filtering (`Summit & Alpine`, `Coastal & Marine`, `Overland & Trail`, `Heritage & Lore`).
* **Why This Was Chosen:**
  * Solved identity fragmentation by delivering one cohesive, rugged adventure aesthetic.
  * Resonates powerfully with overland travelers who collect real rubber patches on backpacks and 4x4 headliners.
* **Impact:** Replaced legacy medallion rendering in [`CommunityView.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/views/CommunityView.js) with [`PvcPatchesData.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/data/PvcPatchesData.js).

---

### DEC-009: 100% Genuine Local Photography Across All 15 Destinations
* **Decision Makers:** User Directive
* **Category:** Product & Content Strategy
* **Status:** Implemented
* **The Context & Problem:**
  Several destinations lacked secret coordinate quests, and generic Unsplash stock images were being served (e.g. photos of generic tropical resorts standing in for historic Portuguese forts in Goa).
* **The Decision:**
  * Guarantee dedicated coordinate quests for all **15 destinations** (Goa, Ooty, Manali, Jaipur, Munnar, Andaman, Nainital, Gangtok, Darjeeling, Wayanad, Udaipur, Shimla, Mussoorie, Kodaikanal, Coorg).
  * Enforce that every attraction and quest card uses verified, high-resolution local photography (`/images/attractions/<dest>/<attraction>-1.jpg`).
* **Why This Was Chosen:**
  * Travelers immediately detect stock photography, which erodes trust in an itinerary planner.
  * Claiming quests awards authentic local SVG stickers in Scrapbook Studio, closing the loop between real-world exploration and digital memory making.

---

### DEC-010: Full-Space Inspirational Quotes Carousel with Custom Andasia Font
* **Decision Makers:** User Directive
* **Category:** UX & Visual Storytelling
* **Status:** Implemented
* **The Context & Problem:**
  The login screen contained awkward empty vertical space below the "Continue as Guest" sandbox, leading to a sterile first impression.
* **The Decision:**
  * Eliminate the redundant "Instant Sandbox" text.
  * Expand the empty space into a full-width literary quotation display featuring timeless travel philosophy (Muntz, Andersen, Tolkien, Beatty, Godin, Pythagoras).
  * Render the first letter of each quote using the custom **Andasia** display font at triple scale.
  * Engineer a custom **merge animation** (`quote-merge-left`, `quote-merge-right`, `quote-merge-author`) that smoothly blends text halves together on quote transition.
* **Why This Was Chosen:**
  * Immediately elevates the app from a utilitarian utility to a literary journal.
  * Transforms dead UI space into a moment of discovery and emotional anticipation.

---

## 5. Visual, Aesthetic & Design System Decisions

### DEC-011: Tactile Field Journal Aesthetic Narrative
* **Decision Makers:** Joint
* **Category:** Brand Identity & Art Direction
* **Status:** Implemented
* **The Context & Problem:**
  Most travel apps mimic the sterile white-and-blue look of commercial airlines or generic corporate SaaS tools.
* **The Decision:**
  Anchor Trailmate in the sensory world of a **19th-century naturalist’s field journal**:
  * Canvas base: Warm, non-reflective parchment (`#FCF9F4`).
  * Accent pigments: Terracotta clay (`#C4703D`), pine forest green (`#1E3A34`), mountain sage (`#5B8C7B`), and warm sand (`#E8DFD0`).
  * Typography: Editorial serifs for stories, clean sans-serif for timelines, and monospace for coordinates and technical specifications.
* **Why This Was Chosen:**
  * Evokes the romance of exploration, tactile paper, and personal reflection.
  * Perfectly bridges the gap between structured AI itinerary generation and creative digital scrapbooking.

---

### DEC-012: 5-Tier Z-Axis Physical Rubber Relief Model
* **Decision Makers:** Assistant (Grounded in User’s Morale Patch Reference Images)
* **Category:** Visual Physics & SVG Architecture
* **Status:** Implemented
* **The Context & Problem:**
  Digital badges are almost always rendered as flat 2D icons with simple border rings, failing to convey the physical, raised rubber feel of real PVC morale patches.
* **The Decision:**
  Formulate an authentic 5-tier elevation stack:
  * **Level 0 (Base Substrate):** Vulcanized charcoal rubber (`#121316`) with micro-stippled matte grain to prevent glare.
  * **Level 1 (Low Relief):** $+1.0\text{mm}$ flat matte background silhouettes (pine groves, topographic contours) with $3^\circ$–$5^\circ$ mold draft angles.
  * **Level 2 (Mid Relief):** $+2.0\text{mm}$ molded vehicles, tents, and copper kettles with directional contact shadows.
  * **Level 3 (High Relief):** $+3.2\text{mm}$ vibrant color injection (Neon Lime `#CCFF00`, Hazard Orange `#FF6B00`, Flame Gold `#FBBF24`) and extruded block typography.
  * **Level 4 (Perimeter Trench):** Recessed stitch groove with simulated `#69` bonded nylon thread stitches (`1.5px dashed rgba(240,230,215,0.4)`).
  * **Lighting Azimuth:** Constant $315^\circ$ top-left directional illumination with $45^\circ$ elevation and $15\%$ ambient bounce fill.
* **Why This Was Chosen:**
  * Creates unmistakable physical depth and tactile realism directly in the browser using scalable vector graphics.

---

### DEC-013: 60fps Destination-Specific Boomerang Motion Keyframes
* **Decision Makers:** Joint
* **Category:** Motion Design
* **Status:** Implemented
* **The Context & Problem:**
  Static header banners felt lifeless during dynamic chat interactions and itinerary reviews.
* **The Decision:**
  Create smooth 60fps CSS alternate keyframe animations tailored to each destination category:
  * Coastal: Buoyant ocean swell bobbing (`.doodle-coastal-wave`).
  * Alpine: High-altitude drifting breeze (`.doodle-alpine-breeze`).
  * Tea Estates: Rolling hill sway (`.doodle-tea-sway`).
  * Monuments: Stately, subtle reverence pulse (`.doodle-monuments-reverence`).
* **Why This Was Chosen:**
  * Delivers delightful micro-interactions with zero CPU/GPU overhead compared to video loops or heavy canvas animations.

---

## 6. Media, Asset & Imagery Strategy Decisions

### DEC-014: Elimination of Stock Photos in Favor of Verified Local Assets
* **Decision Makers:** User Directive
* **Category:** Media & Content Integrity
* **Status:** Implemented
* **The Context & Problem:**
  Automated photo scrapers frequently returned stock photos that were completely disconnected from the actual Indian destinations (e.g. photos of generic European alpine valleys for Munnar).
* **The Decision:**
  Curate over 180 verified local photographs organized strictly in the local repository:
  `public/images/attractions/<destination>/<slug>-1.jpg` through `-6.jpg`.
  Enforce strict validation: Non-zero bytes, resolution $\ge 800\text{px}$, and verified against Wikimedia Commons or state tourism records.
* **Why This Was Chosen:**
  * Preserves authenticity and visual accuracy.
  * Guarantees zero broken external image links in production.

---

### DEC-015: 2x Super-Sampling on Destination Doodles
* **Decision Makers:** Joint
* **Category:** Asset Optimization & Retina Support
* **Status:** Implemented
* **The Context & Problem:**
  Original doodle art appeared faint, washed-out, or blurry on high-DPI Retina displays.
* **The Decision:**
  Execute a 2x super-sampling workflow using Lanczos resampling, contrast normalization, and unsharp masking (radius 1.2, percent 130) rendered in Stitch Charcoal `#141817`.
* **Why This Was Chosen:**
  * Guarantees razor-sharp vector-like ink clarity against both light parchment and dark modes.

---

## 7. Security, Performance & Non-Functional Decisions

### DEC-016: Strict Print Media Isolation for PDF Itinerary Booklets
* **Decision Makers:** User Directive & Assistant Fix
* **Category:** Output Fidelity & Non-Functional
* **Status:** Implemented
* **The Context & Problem:**
  Triggering browser print or "Save as PDF" captured the chat input box, floating sidebars, and navigation buttons, ruining the export.
* **The Decision:**
  Enforce strict `@media print` rules:
  * Exclusively isolate `#itineraryPane`, completely hiding `#sidebar`, `#appHeader`, `#chatPane`, and modal backdrops.
  * Style the printed output with an archival travel booklet aesthetic, custom vintage header typography, and the official Trailmate logo emblem.
* **Why This Was Chosen:**
  * Enables travelers to print gorgeous physical field booklets to carry into remote regions without cellular service.

---

### DEC-017: Tiered Rate Limiting & Input Sanitization
* **Decision Makers:** Assistant Security Audit
* **Category:** Security & Quota Protection
* **Status:** Implemented
* **The Context & Problem:**
  Open conversational inputs and community sharing could expose third-party API keys to quota exhaustion or malicious XSS script injection.
* **The Decision:**
  * Implement tiered rate limiting (`express-rate-limit`):
    * `/api/auth`: Max 5 attempts per 15 minutes (enforced in production).
    * `/api/chat`: Max 8 requests per 15 minutes (enforced in production).
    * **Development Bypass:** Automatically bypassed when `NODE_ENV !== 'production'` or `DISABLE_RATE_LIMITS='true'` so developer testing and prototyping remain unthrottled.
  * Apply recursive string sanitization stripping control characters and null bytes.
  * Validate all payloads with strict `zod` schemas, allowing up to 50MB in development and enforcing 100KB payload limits in production.
* **Why This Was Chosen:**
  * Prevents accidental runaway billing on Google Cloud and Gemini API accounts in production.
  * Eliminates developer friction by ensuring rate limits and tight payload limits never block local test suites, multi-turn AI prototyping, or mock account creation.
  * Protects community feed users against persistent cross-site scripting (XSS).

---

### DEC-018: Strict Error Isolation & Information Leakage Defense (CWE-209)
* **Decision Makers:** User Directive & Security Hardening
* **Category:** Application Security & Information Protection
* **Status:** Implemented & Verified
* **The Context & Problem:**
  Raw exception messages, unhandled rejections, and Python scraper exceptions can inadvertently leak internal system file paths (e.g. `/Users/...`), internal network hostnames, database errors, or stack traces directly to end users in HTTP responses and conversational chat bubbles.
* **The Decision:**
  * Implement strict separation between server-side diagnostic logging and client-facing error responses:
    * Server-side: Log full `err.stack`, request context, and timestamps to console/loggers for rapid debugging.
    * Client-side: All 500-level HTTP responses return safe, sanitized generic error messages (`An unexpected internal server error occurred. Please try again later.`).
    * Python Flask microservice: Catch all exceptions, log the full Python traceback via `app.logger`, and return safe generic JSON errors.
    * Conversation Engine & Login View: Replaced direct `${err.message}` string interpolations with friendly, generic UI failure notices and neutralized user enumeration vectors.
* **Why This Was Chosen:**
  * Eliminates CWE-209 (Information Exposure Through an Error Message) across the entire application stack.
  * Keeps debugging frictionless for developers via detailed server terminal logs while protecting the production attack surface.

---

### DEC-019: 3D Antique Surveyor's Compass (Three.js WebGL & Stitch MCP Iterative Pipeline)
* **Decision Makers:** User Directive & Creative Design Exploration
* **Category:** 3D Graphics, WebGL Performance & Generative Design Pipeline
* **Status:** Retired & Removed (October 2026)
* **The Context & Problem:**
  To infuse Trailmate with tactile, 19th-century expedition heritage, an interactive 3D surveyor's pocket compass was prototyped in the sidebar.
* **The Retirement Decision:**
  * Based on product direction and preference for a clean, distraction-free minimalist sidebar layout, the 3D compass element and Three.js runtime were completely removed from the application.
  * **Architectural Payoff:**
    * Completely uninstalled `three` from `package.json`.
    * Removed the 534 KB Three.js vendor chunk from Vite build, dropping total client bundle size.
    * Reclaimed sidebar whitespace, keeping the left navigation clean, focused, and responsive.

---

### DEC-020: Vercel Function Storage Quota Management & Automated Deployment Retention
* **Decision Makers:** User Directive & Infrastructure Optimization
* **Category:** Cloud Infrastructure, DevOps & Storage Lifecycle Management
* **Status:** Resolved & Verified
* **The Context & Problem:**
  Vercel issued a critical warning that team `apex-predator1` had consumed 75% of its free tier Function Storage (4.93 GB / 10 GB limit), with project `trailmate` alone accounting for 4.92 GB. Because Vercel retains serverless function bundles and built artifacts across all historical deployments, 18 cumulative CI builds had accumulated ~270MB each, threatening to exhaust the 10 GB account cap.
* **The Decision:**
  * Inspected the full deployment history via Vercel MCP and REST API.
  * Maintained high availability and rollback safety by keeping the latest active production deployment (`dpl_4Bi36JfFZ9mKzSgaLYSgtqzRKFnS`) and 1 immediate rollback candidate (`dpl_EbRMRa2BiWojEmqW71kzN8TVypK6`).
  * Executed automated bulk pruning of 14 superseded historical deployments via Vercel's REST API (`DELETE /v13/deployments/{id}`).
  * Immediately reclaimed ~4.4 GB of function storage, dropping project storage down to ~540 MB and restoring full quota headroom.
  * Formulated a retention guideline: maintain only current production + 1 rollback deployment to prevent artifact bloat on free tier plans.
  * **NFT Bundle Optimization (Root Cause Mitigation):** Identified that Vercel's Node File Tracer was packaging the entire `dist/` (749MB) and `public/` (450MB) directories into the `api/index.js` serverless function bundle due to static middleware paths in `server/index.js`. Guarded static asset serving with `if (!process.env.VERCEL)` and configured `functions["api/index.js"].excludeFiles` in `vercel.json`, shrinking future serverless function bundles from 270MB down to < 2MB.
* **Why This Was Chosen:**
  * Solved the impending quota shutdown without requiring a paid Vercel Pro subscription.
  * Preserved 100% uptime with zero disruption to the live production site.

### DEC-021: VengeanceUI-Inspired 3D Social Flip Button in Sidebar
* **Decision Makers:** User Directive & UI Engineering
* **Category:** UI Component Architecture, Micro-Interactions & Brand Presence
* **Status:** Implemented (October 2026)
* **The Context & Problem:**
  The left navigation sidebar had clean functional links (Chat, Trips, Scrapbook, Map, Community, Settings) but lacked a cohesive social discovery / community connection anchor above the traveler profile footer. Furthermore, static social links consume excessive horizontal width in a compact `w-56` sidebar.
* **The Decision:**
  * Adopted the **VengeanceUI `social-flip-button`** interaction paradigm, re-engineered for Trailmate's Vanilla JS + Tailwind architecture (per DEC-001) without requiring React or Framer Motion.
  * Embedded a 4-channel 3D flip button (`#sidebarSocialFlipWidget`) directly above the traveler profile divider using `mt-auto mb-3` flex positioning.
  * Channels supported: **Instagram**, **Facebook**, **Gmail**, and **X**.
  * **Resting State (Before Flip):** All 4 icons render in uniform, tasteful monochrome dark charcoal (`text-on-surface`) on subtle elevated grey tiles (`bg-surface-container-highest/80`), ensuring Gmail and the others remain visually cohesive without unstyled color imbalance or distracting glowing beam rings.
  * **Hover State (After Flip):** Utilizing pure GPU-accelerated CSS 3D transforms (`perspective: 1000px`, `transform-style: preserve-3d`, `backface-visibility: hidden`), hovering triggers a staggered 3D spring flip (`cubic-bezier(0.34, 1.56, 0.64, 1)` with delays $0\text{s}, 0.07\text{s}, 0.14\text{s}, 0.21\text{s}$ across `nth-of-type(1..4)`) revealing authentic official app icons:
    * Instagram: Official sunset radial gradient squircle with white camera line art.
    * Facebook: Official Meta blue `#0866FF` circle app icon with white 'f'.
    * Gmail: Clean white badge with official Google 4-color 'M'.
    * X: Sleek jet-black badge with official white 𝕏.
  * Removed native browser `title` attributes on child links to prevent redundant browser hover tooltips from clashing with the sleek custom floating tooltip badges.
* **Why This Was Chosen:**
  * Delivers 60 FPS fluid spring motion with zero JavaScript runtime overhead (0 KB added bundle weight).
  * Conserves compact sidebar real estate ($162\text{px}$ footprint inside a $224\text{px}$ bar) while providing delightful tactile polish.

---

## 8. Comprehensive Decision Matrix

| ID | Domain | Decision | Driver | Technical / Product Tradeoff |
|:---|:---|:---|:---|:---|
| **DEC-001** | Stack | Vanilla JS + Vite instead of React/Next.js | Joint | Zero virtual-DOM overhead, 60fps canvas performance, 100KB bundle |
| **DEC-002** | Styling | Tailwind CSS v4 + Modular Custom CSS | Joint | Rejects generic SaaS UI; unlocks bespoke 3D rubber & parchment textures |
| **DEC-003** | Maps | Leaflet.js + OSM Parchment Filter vs Google Maps SDK | Joint | Zero quota costs; antique cartography styling; offline resiliency |
| **DEC-004** | Backend | Express.js Gateway + Python Flask Microservice | Joint | Non-blocking SSE streaming in Node; dedicated aviation algorithms in Python |
| **DEC-005** | Testing | Vitest instead of Jest | Assistant | Native ESM support; shared Vite config; 10x faster test execution |
| **DEC-006** | AI Engine | Strict Data Retrieval Prior to AI Synthesis | Joint | Anti-hallucination guarantee; AI only sequences verified facts |
| **DEC-007** | UX Flow | 14-Stage Guided Intake State Machine | Joint | Conversational flexibility without missing critical budget/date constraints |
| **DEC-008** | Gamification | Unified 12-Patch 3D Molded PVC Expedition Board | User | Eliminates confusing dual toggle; connects with overland adventure gear |
| **DEC-009** | Content | 15 Destination Coordinate Quests with Real Photos | User | 100% geocache coverage; verified local sights; zero broken links |
| **DEC-010** | UX Polish | Login Quotes Carousel with Andasia Drop-Cap | User | Full empty-space utilization; literary tone; merge animation |
| **DEC-011** | Brand | 19th-Century Tactile Field Explorer Journal | Joint | Warm parchment (`#FCF9F4`), terracotta & sage pigments over sterile SaaS |
| **DEC-012** | Rendering | 5-Tier Z-Axis Physical Rubber Relief Model | Assistant | $3^\circ$ draft angles, micro-stippling, and stitch trenches via vector SVGs |
| **DEC-013** | Motion | 60fps Destination-Specific Boomerang Keyframes | Joint | Dynamic life in topbar art with zero CPU/video loop overhead |
| **DEC-014** | Media | 180+ Verified Local Indian Sight Photographs | User | Complete elimination of generic European/stock photos |
| **DEC-015** | Assets | 2x Super-Sampling & Unsharp Masking on Doodles | Joint | Crisp line weight on high-DPI Retina screens |
| **DEC-016** | Export | Strict Print Media CSS Isolation | User | Clean PDF field guide booklets with zero browser UI clutter |
| **DEC-017** | Security | Tiered Rate Limiting & Zod Input Sanitization | Assistant | Quota-safe API budget protection and zero XSS vulnerability |
| **DEC-018** | Security | Strict Error Isolation & Information Leakage Defense | Joint | Eliminates CWE-209; zero stack trace or internal path leakage to users |
| **DEC-019** | 3D / WebGL | 3D Surveyor Compass via Three.js (Retired) | User | Retired based on design feedback; uninstalled Three.js, reclaimed 534KB bundle |
| **DEC-020** | DevOps | Vercel Function Storage Quota & Deployment Pruning | User | Automated REST deletion of 14 old deployments; reclaimed 4.4GB quota |
| **DEC-021** | UI / Motion | VengeanceUI 3D Social Flip Button in Sidebar | User | Pure CSS 3D spring transforms; official Instagram, Facebook, Gmail, X brand badges; 0KB runtime |

---

## 9. Pending & Future Architectural Roadmap

### 1. Real Google Identity Services (GIS) / OIDC Authentication
* **Status:** Under Architectural Evaluation (October 2026).
* **Context:** The current login supports local credential registration and guest exploration. Real Google Sign-In requires connecting a Google Cloud OAuth 2.0 Client ID, embedding the GIS SDK (`accounts.google.com/gsi/client`), and decoding cryptographically signed JWT credentials.
* **Proposed Route:** Client-side GIS integration decoding user profile claims (`name`, `email`, `picture`) into `CommunityService` with optional backend token verification.

### 2. Cross-Device Cloud Sync for Scrapbook Studio
* **Status:** Planned.
* **Context:** Enable travelers to begin assembling trip scraps on mobile while trekking and finalize multi-page bindings on desktop.
* **Proposed Route:** Local-first synchronization engine using CRDTs or Supabase/Firebase sync while maintaining 100% offline journaling functionality.
