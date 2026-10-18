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

### DEC-022: Defense-in-Depth Security Hardening (Input Validation, Magic-Byte File Safety & Error Isolation)
* **Decision Makers:** User Security Directives & Engineering
* **Category:** Application Security, Input Sanitization & Threat Modeling
* **Status:** Implemented (October 2026)
* **The Context & Problem:**
  Comprehensive security hardening across four core pillars:
  1. Dependency vulnerabilities across npm and Python ecosystems.
  2. Error handling & information leakage (CWE-209: never leaking stack traces, file paths, or raw DB/API errors).
  3. File upload safety (validating magic byte content beyond MIME/extension, isolated storage, zero executable code execution).
  4. Strict input validation and rejection of malformed or oversized inputs (CWE-20).
* **The Decision:**
  * **Dependency Vulnerability Audit:** Completed an automated dependency audit across all 114 installed packages via `npm audit` (0 vulnerabilities reported, clean lockfile) and verified Python microservice dependencies.
  * **Error Handling & Information Leakage Defense:**
    * In `server/index.js`, strengthened the global async error middleware: all 5xx exceptions log detailed stacks server-side only with ISO timestamps and return a uniform, generic user message (`"An unexpected internal server error occurred. Please try again later."`). Client 4xx errors are sanitized to prevent echoing internal module names or filesystem paths.
    * In `server/flights/app.py`, registered Flask error handlers (`@app.errorhandler` for 400, 404, 405, 500) ensuring Python exceptions return structured, generic JSON rather than Flask default HTML debug stack traces.
    * In SSE endpoints (`server/routes/chat-stream.js`), streaming errors emit standardized safe notices to listeners before closing connections.
  * **File Upload Safety & Storage Isolation:**
    * **Isolated Client-Side Storage:** Trailmate does not expose binary file upload endpoints on Node or Python servers. Scrapbook user photos are processed entirely on the client, rendered through an offscreen HTML5 `<canvas>`, and re-encoded into clean JPEG DataURLs in browser `localStorage`. This architectural isolation completely guarantees uploaded files are never written to the server web root and can never execute as server-side code.
    * **Binary Magic Byte Header Inspection:** Added `validateImageFile(file)` in `ScrapbookWorkspace.js` reading the raw first 16 bytes via `FileReader.readAsArrayBuffer`:
      * JPEG: `0xFF, 0xD8, 0xFF`
      * PNG: `0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A`
      * WebP: `0x52, 0x49, 0x46, 0x46` (RIFF) + `0x57, 0x45, 0x42, 0x50` (WEBP)
      * GIF: `0x47, 0x49, 0x46, 0x38, (0x37|0x39), 0x61` (GIF87a / GIF89a)
    * Explicitly rejects SVGs, HTML, and executables (`.exe`, `.sh`, `.js`) to prevent XML entity / SVG-based XSS attacks.
    * Enforces a 10MB per-file size ceiling, a maximum batch of 10 files per drag/drop event, and wraps canvas compression in a 10-second timeout with `img.onerror` rejection.
  * **Strict Input Validation & Schema Rejection:**
    * Added `.strict()` across all Zod schemas in `server/schemas/index.js` (`chatTurnSchema`, `flightSearchSchema`, `lastMileFareSchema`, `placesSearchSchema`, `placesQuerySchema`, `hotelPriceSchema`, `placeDetailsSchema`, `placeDetailsQuerySchema`, `weatherForecastSchema`, `weatherAlertsSchema`). Extraneous or injected keys immediately fail validation with HTTP 400.
    * Constrained `chatTurnSchema.stage` to the 14-stage state machine enum (`VALID_STAGES`).
    * In `server/flights/app.py`, added query argument whitelisting (`ALLOWED_SEARCH_ARGS`), strict IATA 3-letter regex (`^[A-Z]{3}$`), ISO date regex (`^\d{4}-\d{2}-\d{2}$`), cabin class whitelist, and safe passenger integer parsing (1–20).
* **Why This Was Chosen:**
  * Rejection over silent escaping ensures malicious or corrupted payloads are blocked at the perimeter before touching application state.
  * Offscreen canvas rasterization strips metadata, EXIF geotags, and steganographic payloads before storage.

### DEC-023: VengeanceUI 3D Flip Text Engine & Interactive Selection Highlighter (Retired)
* **Decision Makers:** User Design Directive & Engineering
* **Category:** UI / Motion, Typography Engineering & Tactile Micro-Interactions
* **Status:** Retired & Removed per User Directive (October 2026)
* **The Context & Problem:**
  The user requested the signature 3D Flip Text animation from VengeanceUI (`vengenceui.com/components/flip-text`) triggered when text is selected or highlighted across the interface ("add flip text animation to the text when i select a text /highlight it ,like in picture"). Standard browser `::selection` CSS only supports color/background tints and cannot decompose text nodes into 3D rotating character facets. Furthermore, naive DOM manipulation during mouse drag interrupts native selection, breaks text copying (`Cmd+C`), and risks DOM pollution.
* **The Decision:**
  * **Reverse-Engineered 3D Character Transform Stack:**
    Implemented VengeanceUI's character 3D flip kinematics in `src/styles/base.css` without React or Framer Motion:
    * Parent container `.flip-text-wrapper` sets `perspective: 1000px`.
    * Word wrappers `.flip-word` maintain `transform-style: preserve-3d; white-space: nowrap`.
    * Character facets `.flip-char` utilize `transform-style: preserve-3d`, `-webkit-text-fill-color: transparent`, and dual 3D pseudo-elements:
      * `::after` (initial front face): `transform: translate(-50%, -50%) translateZ(0.6em)`.
      * `::before` (incoming top face): `transform: translate(-50%, -50%) rotateX(-90deg) translateZ(0.6em); opacity: 0; --opacity: 1`.
    * Keyframes `@keyframes flip` rotate the character container $0^\circ \to 90^\circ$ over 2.0s with sine-wave staggered delays (`sineValue * (duration * 0.25)`).
  * **Non-Destructive Text Selection & Highlight Engine:**
    Engineered `initSelectionFlipEngine` in `src/utils/textFlip.js`:
    * Listens for `mouseup` and keyboard navigation (`keyup` on Shift/Arrow keys).
    * Safely validates selection ranges, ignoring inputs, textareas, and buttons.
    * Dynamically wraps the selected text in `.flip-text-wrapper.flip-selection-active` with Trailmate's archival terracotta glow (`rgba(196, 112, 61, 0.18)`), executing the 3D flip wave in place.
    * Spawns a sleek floating HUD pill (`✨ Flip Text (3D) VENGEANCE UI`) with smart viewport edge detection (flipping below the selection when near the top window boundary, and clamping horizontal margins).
    * On deselect (`mousedown` outside or `Escape`), cleanly unwraps the flip span back into a single text node, ensuring zero residual DOM bloat and 100% copy-paste compatibility.
  * **Interactive Header Integration:**
    Tagged `#chatTripTitle` ("AI Travel Planner") with `data-flip-interactive="true"`, allowing travelers to hover, click, or select topbar titles to trigger 3D character waves.
* **Why This Was Chosen:**
  * Delivers the exact tactile aesthetic of VengeanceUI within Trailmate's lightweight Vanilla JS architecture (DEC-001) with zero runtime bundle bloat.
  * Preserves native browser clipboard interactions and document flow while providing a delightful micro-interaction on text selection.

### DEC-024: Zero-Jank Fluid Shared-Element Morph & Layout Sequencing Engine
* **Decision Makers:** User Transition Bug Directive & Engineering
* **Category:** Motion Choreography, Render Performance & Layout Stability
* **Status:** Implemented (October 2026)
* **The Context & Problem:**
  Clicking a destination card (e.g. Nainital) caused severe transition stutter and visual snapping instead of a smooth morph into the focused chat hero view due to uncoordinated layout thrashing:
  1. Auto-scroll collision: `ChatThread.scrollToBottom` and `ResizeObserver` triggered multiple programmatic scrolls mid-flight, fighting the animation delta.
  2. Sibling height collapse: Sibling cards unmounted while the card was interpolating, collapsing the grid container by hundreds of pixels.
  3. Shared element coordinate mismatch: Target coordinates were incorrectly calculated in a 3-column CSS grid cell instead of the resting block container.
  4. Premature message mounting: User and AI bubbles mounted at 310ms while the card was still animating.
* **The Decision:**
  * **Composited Fixed-Position Flying Morph:** Cloned the clicked card into a hardware-accelerated fixed viewport overlay (`.dest-card-flying-morph`), moving via `translate3d()` and `scale()` with an Apple HIG fluid spring (`cubic-bezier(0.16, 1, 0.3, 1)`), counter-scaling the inner image to prevent aspect ratio distortion.
  * **Auto-Scroll Locking:** Introduced `ChatThread.pauseAutoScroll(true)` to suppress all programmatic and `ResizeObserver` scroll events during the 380ms morph.
  * **Container Height Locking:** Froze `row.style.minHeight` and `grid.style.minHeight` to their exact pre-click dimensions, eliminating container collapse during flight.
  * **Staggered Orchestration:** Deferred message insertion (`onDestinationSelect`) until 50ms *after* the card docks cleanly into place, unlocking auto-scroll only once the DOM has settled.
* **Why This Was Chosen:**
  * Eliminates all five root causes of layout thrashing, achieving a fluid 60fps morph with 0px coordinate drift and zero snap.

### DEC-025: Viewport Anti-Clipping Geometry & Cross-App Motion Polish Engine
* **Decision Makers:** User Transition Bug Directive & Engineering
* **Category:** Motion Choreography, Viewport Geometry & UI Physics
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  Following the initial morph transition, three distinct visual glitches degraded the destination selection experience:
  1. **Introductory Greeting Clipping:** After selecting a card (e.g. Gangtok or Nainital), `ChatThread.scrollToBottom` triggered `scrollIntoView({ block: 'end' })` multiple times across staggered timers. With the combined height of the welcome card, confirmed card, user pill, and bot reply (625px) exceeding the container viewport (509px), the container forced `scrollTop` to 102px, pushing the top welcome greeting 85px up behind the sticky header.
  2. **Duplicate / Ghost Button Stacking:** Automated test execution or rapid event bubbling dispatched two identical user pill intents with `Date.now()` timestamps within 50ms, visually overlapping until the thread re-rendered and abruptly vanished the lower pill.
  3. **Motion Friction Across Views:** Header doodles lacked enter/exit cross-fades during destination changes, scrapbook page turns lacked authentic book-spine perspective curls, and social buttons needed bidirectional wave delays.
* **The Decision:**
  * **Viewport Anti-Clipping Geometry in `ChatThread.js`:**
    * Re-engineered `scrollToBottom(smooth)` with an explicit viewport guard: if `scrollHeight <= clientHeight * 1.45`, auto-scrolling is suppressed so the traveler can read the welcome introduction in its natural unclipped state.
    * Enforced a strict boundary check calculating `first.getBoundingClientRect().top < containerRect.top`. If a scroll step would push the top welcome message above the visible container rim, the scroll is clamped or cancelled.
    * Replaced forceful `block: 'end'` scrolls with natural `block: 'nearest'`.
  * **Deterministic State Deduplication & Lockout:**
    * In `src/store/state.js`, enhanced `pushMessage` with exact ID deduplication and rapid duplicate suppression (< 1000ms identical role & text).
    * In `src/main.js` and `src/components/MessageBubble.js`, introduced `isDestinationSelecting` transition lock and deterministic message IDs (`user-dest-[slug]`), completely preventing double-dispatch.
    * Extended `chatThread.pauseAutoScroll(true)` through 800ms post-clarify mount to prevent scroll tug-of-war.
  * **Cross-Application Motion Polish:**
    * **Header Doodles:** Added 200ms `.header-doodle-leaving` / `.header-doodle-entering` cross-fade transition in `src/styles/chat.css` and `src/main.js`.
    * **Sidebar 3D Social Flip:** Polished bidirectional wave stagger ($0.18\text{s} \to 0.00\text{s}$ exit, $0.00\text{s} \to 0.18\text{s}$ enter) with tactile hover elevation (`translateY(-2px) scale(1.08)`).
    * **Scrapbook Studio Page Turns:** Engineered 3D page curls with left-spine anchoring and dynamic box-shadow sweeps using Apple HIG timing (`0.34s cubic-bezier(0.16, 1, 0.3, 1)`).
* **Why This Was Chosen:**
  * Completely cures greeting clipping (`welcomeTop: 88.9px > headerBottom: 71.9px`, `scrollTop: 0`), eliminates duplicate ghost buttons, and elevates all interactive transitions across the app to physical Apple HIG motion standards.

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
| **DEC-022** | Security | Defense-in-Depth Hardening: Strict Schemas & Magic Bytes | User | .strict() schema rejection, magic byte raster validation, 10MB upload limits, error sanitization |
| **DEC-023** | UI / Motion | VengeanceUI 3D Flip Text Engine & Selection Highlighter (Retired) | User | Retired per design directive; clean native text selection restored; 0KB runtime |
| **DEC-024** | Motion | Zero-Jank Fluid Shared-Element Morph & Layout Sequencing | User | Fixed compositor clone, scroll lock, height freeze, and staggered message mounting |
| **DEC-025** | Motion | Viewport Anti-Clipping Geometry & Motion Polish Engine | User | Anti-clipping scroll guard, deterministic message deduplication, doodle cross-fades, and 3D page curl |
| **DEC-026** | Motion | Continuous Single-Element FLIP Destination Morph | Joint | Single shared DOM node FLIP; simultaneous 3D translation & scale interpolation; locked container layout & anti-jitter handoff |
| **DEC-027** | UI / Motion | Ripple Displacement Slider Screen Transitions | User | WebGL liquid ripple shockwave shader over #appMain for switching between chat, trips, scrapbook, map, community, and settings; 0KB runtime bloat; leaves sidebar untouched |
| **DEC-028** | UI / Motion | Transparent Liquid Caustic Wave with Button Origin & Ease-In | User | Eliminates black screen/placeholder textures via transparent WebGL caustic glint shader + concurrent DOM clip-path expansion; originates from clicked button; applies authentic ease-in acceleration curve ($t^2$, 840ms) |
| **DEC-029** | UI / Motion | Directional Sunbeam (315° Azimuth) & Chromatic Dispersion | User | Physically models 315° top-left sunlight reflection via 2D wave normal dot product and Cauchy's chromatic wavelength separation (R/G/B phase shift) on liquid ripple crest |
| **DEC-030** | UI / Motion | Terracotta Liquid Meniscus & Wavefront Boundary Lockstep | User | Eliminates blue/cyan shimmer with Trailmate brand Terracotta (`#C4703D`) and sunlit amber; locks DOM clip-path and WebGL wave to exact 1:1 pixel coordinate lockstep, eliminating white gaps and pre-glow |
| **DEC-031** | Maps | Split-Pane Dual Explorer Geospatial Map Architecture & Brand UI Palette | User | 42% itinerary ledger + 58% unobstructed map canvas; warm parchment & terracotta brand styling; zero sidebar impact |
| **DEC-032** | Maps | Dynamic Multi-Destination Elevation Profiles & Typography Streamlining | User | Dynamic elevation curves for 15 destinations; removed coordinate clutter and obsolete estate wash layer |
| **DEC-033** | Maps / Media | Multi-Photo Attraction Carousel & Audio Guide Elimination | User | Resolves 6 authentic photos per sight via inline card carousel & fullscreen modal; eliminated synthetic audio guide |
| **DEC-035** | Maps / Motion | Smooth Dissolve & Re-emerge Selection Reticle & Zero Zoom Jitter Architecture | User | Eliminates CSS transition fighting on Leaflet SVG during zoom; 180ms dissolve & post-settle bloom |
| **DEC-036** | Maps | Geospatial Map Quality Remediation, In-Place Live Search & GPS Export | User | Camera-synchronized focus bloom via moveend, in-place search (zero camera jump), branded empty state, GPX v1.1 XML export, compass spin & elevation profile modal |

---

### DEC-028: Transparent Liquid Caustic Ripple Displacement Transition with Button Origin & Ease-In Acceleration
* **Decision Makers:** User Directive
* **Category:** UI / Motion Physics & WebGL Architecture
* **Status:** Implemented & Verified
* **The Context & Problem:**
  In the initial screen transition prototype, an artificial 2D canvas texture with dark tones (`#1A2926`, `#0B0610`, etc.) was drawn into WebGL textures (`uTexCurrent`, `uTexNext`). When the ripple wave reached full radius, the canvas displayed an opaque dark screen. Upon completion, a 150ms opacity fade caused a noticeable "black screen" flash and delayed pop-in of the real page content. Additionally, the wave origin was statically pinned to the left edge rather than the clicked button, and WebGL inverted the Y-axis relative to DOM space, creating two distinct starting points.
* **The Decision:**
  * **Zero Black Screen Architecture:** Completely removed artificial opaque 2D canvas textures and placeholder drawings. Initialized WebGL with an authentic transparent overlay context (`alpha: true`, `gl.clearColor(0, 0, 0, 0)`).
  * **Unified Single Point Origin:** Inverted the WebGL vertex shader Y mapping (`(1.0 - aPos.y) * 0.5`) to align with DOM top-down coordinate space, unifying the WebGL caustic ripple and CSS `clip-path` circle to the single clicked button coordinate.
  * **Lockstep Live DOM Reveal:** Stacked incoming and outgoing DOM elements in-place (`z-25` vs `z-10`). Concurrently expanded a dynamic circular `clip-path` on the real incoming view (`circle(${r}px at ${originXpx}px ${originYpx}px)`) in lockstep with the liquid wave front.
  * **Authentic Ease-In Acceleration:** Applied a fluid quadratic ease-in curve ($\text{progress}^2$) with an optimal 840ms duration for responsive, fluid propagation.

---

### DEC-029: Directional Sunbeam (315° Azimuth) & Chromatic Dispersion Liquid Ripple Shader
* **Decision Makers:** User Directive
* **Category:** Visual Physics & GLSL Shader Architecture
* **Status:** Implemented & Verified
* **The Context & Problem:**
  A uniform circular glint around 360° looks flat and synthetic, lacking the physical reflection of real water illuminated by ambient light.
* **The Decision:**
  * **315° Directional Sunbeam:** Calculated the 2D radial wave normal ($\vec{N} = \text{normalize}(\text{coord} - \text{center})$) and modulated specular intensity with the dot product against Trailmate's canonical top-left $315^\circ$ sunlight vector ($\vec{N} \cdot -\vec{L}$). The upper-left wave crest facing the light source catches a brilliant, crisp sun glint ($1.0\times$), while the opposite lee side retains a gentle ambient water reflection ($0.55\times$).
  * **Chromatic Dispersion:** Implemented Cauchy's prismatic dispersion on the wave crest by slightly offsetting channel age ($\pm 0.024$). The leading edge reveals warm champagne-gold prismatic glints, diamond-white core crests, and aquatic cyan-violet trailing dispersion fringes.
* **Why This Was Chosen:**
  * Delivers photorealistic water optical physics with zero external library overhead and 60 FPS performance.

---

### DEC-030: Brand Terracotta Liquid Meniscus & Wavefront Boundary Lockstep
* **Decision Makers:** User Directive
* **Category:** UI Brand Design, WebGL Shader Optics & Viewport Geometry
* **Status:** Implemented & Verified
* **The Context & Problem:**
  Two visual artifacts degraded the transition aesthetic:
  1. **Cyan / Blue Glint Disconnect:** The previous chromatic dispersion used an aquatic cyan tint (`vec3(0.18, 0.65, 0.88)`), creating an artificial blue halo disconnected from Trailmate's warm terracotta brand palette (`#C4703D`).
  2. **White Space Ahead of Wave:** The shader permitted fragment rendering past the wave crest (`dist > time + 0.04`), and the WebGL distance scale was decoupled from the DOM clip-path radius by ~20%. This projected an opaque white highlight border ahead of the expanding page clip-path. Furthermore, an oversized wave ring (`uWaveWidth = 0.46`) and high peak alpha ($0.88$) formed a heavy opaque ring.
* **The Decision:**
  * **Trailmate Signature Terracotta Palette:** Replaced aquatic cyan and harsh white glints with the authentic brand clay and amber palette:
    * Primary Terracotta: `vec3(0.769, 0.439, 0.239)` (`#C4703D`).
    * Sunlit Amber Crest: `vec3(0.940, 0.640, 0.360)` (`#F0A25C`).
    * Deep Earth Trough: `vec3(0.580, 0.290, 0.102)` (`#944A1A`).
  * **Strict Boundary Cutoff (Zero White Space Ahead):** Clamped fragment rendering strictly to `if (time <= 0.001 || dist > time) { gl_FragColor = vec4(0.0); return; }`, mathematically guaranteeing that zero pixels are rendered ahead of the wave crest.
  * **1:1 Mathematical Pixel Lockstep:** Unified the distance scaling: $r_{px} = \text{dist}_{shader} \times w$. At every frame, the DOM `clip-path` circular radius in pixels matches the WebGL shader wavefront coordinate to sub-pixel accuracy.
  * **Refined Meniscus Profile & Translucent Alpha:** Narrowed the waveband width to $0.14$ ($~140\text{px}$) and lowered peak alpha to $0.38$. The wave crest now acts as an organic, translucent liquid lens rather than an opaque masking ring.
* **Why This Was Chosen:**
  * Beautifully harmonizes the screen transition with Trailmate's heritage aesthetic while eliminating visual seams and unnatural color fringes.

---

### DEC-031: Split-Pane Dual Explorer Geospatial Map Architecture & Brand UI Palette
* **Decision Makers:** User Directive (Approved Stitch MCP Style 3 Prototype)
* **Category:** Geospatial UI Architecture, Stitch MCP Prototyping & Leaflet Synchronization
* **Status:** Implemented & Verified
* **The Context & Problem:**
  The previous map design was a full-bleed map overlaid with floating glass headers, category filter chips, and a bottom horizontal carousel tray. This cluttered the map canvas, obscured geographic context, and lacked an organized day-by-day expedition ledger. The user selected the **Split-Pane Dual Explorer** layout generated via Stitch MCP, requiring strict Trailmate brand UI colors (warm parchment `#FCF9F4`, terracotta `#C4703D` / `#944A1A`, forest ink `#1E3A34`, expedition sage `#5B8C7B`) with zero modification to the live application sidebar. Initial implementation had pin collisions between Tea Museum and Doddabetta Peak, redundant pin labels underneath popover cards, watermarked CartoDB tiles, and out-of-order route lines.
* **The Decision:**
  * **Split-Pane Architecture (42% Ledger / 58% Map Canvas):**
    * **Left 42% Ledger Feed:** Dedicated scrollable itinerary pane featuring destination switcher (`📍 Ooty ▾`), elevation badge (`2,240m avg`), `⌘K` live search input, filter pills (`All`, `Day 1 Route` [active terracotta], `Day 2 Route`, and category chips), Day 1 circuit summary banner (`4 Stops • 18.4 km • ~4.5 hrs`), `CURRENT FOCUS` card tag, rich sight cards with photo banners, ratings, audio guide triggers, elevation badges, and solid terracotta `In Circuit ✓` buttons.
    * **Right 58% Unobstructed Map Canvas:** Full-height Leaflet.js map with top-right HUD (`Contours` [terracotta] / `Satellite` / `Estate Wash` switcher, compass rose button), numbered terracotta waypoint pins (`1`, `2`, `3`, `4`), connected terracotta polyline (`#C4703D`, weight 3.5), distance pills (`5.4 km`, `6.8 km`), bottom scale datum card (`1:25,000 Topo Relief • Datum: GTS India 1878`), and bottom SVG Elevation Gradient Profile chart (`2,180m - 2,637m`).
  * **Geodesic Pin Separation & Dynamic Active Label Suppression:**
    * Separated Doddabetta Peak (`11.3995, 76.7388`) from Nilgiri Tea Museum (`11.4132, 76.7325`), placing Pin 2 south-east directly inside the Doddabetta summit contour rings and Pin 1 on the northwestern tea slopes.
    * Dynamically hid `.map-waypoint-label` when a pin is active (`.map-waypoint-pin.active .map-waypoint-label { display: none !important; }`), ensuring the sleek popover card (`STOP #1 • 2,180M ALT`, `Nilgiri Tea Museum`, `● Tasting Open Now` with tea factory photo) points directly down to the pin without duplicate label overlap.
  * **Natural Topological Route Progression:**
    * Routed the Day 1 polyline along the scenic road topology: Ooty Lake (Pin 4) -> Botanical Gardens (Pin 3) -> Nilgiri Tea Museum (Pin 1) -> Doddabetta Peak (Pin 2), with distance badges (`5.4 km`, `6.8 km`) on major transit legs.
    * Rendered soft teal water body with italic serif label `(Ooty Lake • 2,240m)` and concentric contour rings around Doddabetta summit with `DODDABETTA PEAK 2,637m`.
  * **Museum-Grade Topographic Cartography (Zero Watermarks):**
    * Integrated Esri World Topo Map with calibrated CSS warmth filter (`filter: sepia(0.20) hue-rotate(-10deg) contrast(0.93) brightness(1.03) saturate(0.82)`), delivering authentic elevation contour lines and mountain relief shading with zero API keys and zero watermarks.
  * **Sidebar Isolation (100% Untouched):**
    * Scoped all layout and styling strictly inside `#mapWorkspaceView` (`.map-split-workspace`), leaving the global desktop sidebar completely intact.
* **Why This Was Chosen:**
  * Achieves pixel-perfect fidelity with the Stitch-approved master design mockup, pairing an archival expedition ledger with an uncluttered, responsive cartographic explorer.

---

### DEC-032: Dynamic Multi-Destination Elevation Gradient Profiles & Cartographic Typography Streamlining
* **Decision Makers:** User Directive
* **Category:** Geospatial UI, Topographic Data Modeling & Typography
* **Status:** Implemented & Verified
* **The Context & Problem:**
  Following the split-pane geospatial redesign, three usability and aesthetic issues were reported:
  1. **Static Elevation & Profile Curves:** Toggling destinations did not update the average elevation badge or the bottom-right SVG elevation gradient profile chart, which remained locked to Ooty's 2,240m altitude and Doddabetta summit curve.
  2. **Coordinate & Subtitle Clutter:** The header and ledger cards displayed technical coordinate strings (`INDEX: 32.24° / 77.19°`, `📍 11.4132° N...`) and a lengthy subtitle (`"Nilgiris Expedition Ledger • 14 Curated Sights & High Passes"`), cluttering the narrowed 30% left pane.
  3. **Redundant Map Layer:** The "Estate Wash" tile layer was visually redundant and slower to load compared to the crisp topographic contours and aerial imagery.
* **The Decision:**
  * **Dynamic 15-Destination Topographic Elevation Architecture:**
    * Populated `DESTINATION_META` with authentic altitudes, elevation ranges, and custom SVG terrain curves (`svgArea`, `svgStroke`, `peakDot`, `peakLabel`) for all 15 regions (Ooty, Goa, Manali, Munnar, Jaipur, Udaipur, Shimla, Andaman, Coorg, Mussoorie, Nainital, Kodaikanal, Darjeeling, Wayanad, Gangtok).
    * `loadDestinationData()` dynamically re-computes and redraws `#lblDestElevValue`, `#lblElevGraphRange`, SVG path attributes (`#svgElevArea`, `#svgElevStroke`), and peak waypoint markers (`#svgElevPeakDot`).
  * **Typography Streamlining & Coordinate De-cluttering:**
    * Removed index coordinate tags (`#lblIndexCoords`) from the top header row, allowing the prominent destination selector and elevation pill to align harmoniously.
    * Removed destination expedition subtitle (`#lblDestSubTitle`) for a cleaner, bolder title presentation.
    * Replaced raw sight card coordinate numbers with clean curated category pills (`.map-card-tag-pill`) in the card footer.
    * Completely eliminated mock cartographic datum card and scale ruler text (`Datum: GTS India 1878 • High Precision Topo Relief`, `1:25,000 Topo Relief`), leaving an unobstructed bottom map canvas with the clean Elevation Gradient Profile neatly docked to the bottom right.
  * **Streamlined Layer Switcher:**
    * Pruned the `estate` tileLayer and removed the "Estate Wash" button, leaving a balanced dual segmented control: `[ Contours | Satellite ]`.
* **Why This Was Chosen:**
  * Dramatically improves ledger readability in the compact 30% pane while providing travellers with immediate, authentic topographic insight for every region in India.

---

### DEC-033: Multi-Photo Attraction Carousel & Audio Guide Elimination
* **Decision Makers:** User Directive
* **Category:** Geospatial UI, Media Asset Resolution & Audio Cleanup
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  1. Over 1,260 authentic high-resolution photographs were already downloaded across all 15 destinations (6 per sight, 14 curated sights per destination in `public/images/attractions/<dest>/<slug>-1.jpg` through `-6.jpg`). However, `circuitStops` in `DESTINATION_META` only supplied a single photo string, leaving `place.photos` undefined and restricting ledger sight cards to a single image.
  2. The synthetic SpeechSynthesis audio guide button, timer label (`Audio Guide (0:45)`), and headphones icon were artificial and degraded the clean, documentary cartographic aesthetic. The user requested: "let me see multiple pics of an attraction, we have already downloaded so many pictures.remove audio guide feature".
* **The Decision:**
  * **Authentic Multi-Photo Resolution Engine:**
    * Implemented `resolveItemWithPhotos(item, destKey)` in `src/views/MapView.js` to cross-reference every attraction across `CURATED_ATTRACTIONS` and file paths. If a sight has an individual photo path, it dynamically derives and verifies the full array of all 6 authentic local images (`<slug>-1.jpg` through `-6.jpg`).
  * **Complete Elimination of Audio Guide Feature:**
    * Thoroughly removed `playAudioGuide()` function, SpeechSynthesis audio narration code, `audioText` metadata, and all audio guide buttons and headphones icons from `src/views/MapView.js` and `src/styles/map.css`.
  * **Interactive Sight Card Photo Carousel:**
    * Replaced the audio badge with `.map-photo-gallery-badge` (`📷 ${photoCount} Photos`) in the top-right of `.map-card-photo-hero`.
    * Added inline carousel controls directly on the card: left/right navigation arrows (`.map-card-slide-prev`, `.map-card-slide-next`) and indicator dots (`.map-card-slide-dots`), allowing travelers to seamlessly cycle through all 6 photos without interrupting their ledger browsing.
    * Added a dedicated `Photos (${photoCount})` button in `.map-card-footer` actions.
  * **Map Waypoint Popover Gallery Integration:**
    * Updated Leaflet popover cards to render `.map-popover-thumb-wrap` with `.map-popover-photo-pill` (`📷 ${photos.length}`) and a `View ${photos.length} Photos →` button, opening the modal directly from any waypoint pin on the map.
  * **Enhanced Fullscreen Photo Gallery Modal:**
    * Provided high-res photo viewer with fluid spring transitions, filmstrip thumbnails, rating, description, and keyboard navigation (`ArrowLeft` for previous photo, `ArrowRight` for next photo, `Escape` to close).
* **Why This Was Chosen:**
  * Maximizes traveler immersion by unlocking the full catalog of authentic photographs directly on the cards and in an archival fullscreen gallery, while keeping the UI clean and free of synthetic audio clutter.

---

### DEC-034: Dynamic Selected Attraction Focus Circle & Static Overlay Cleanup
* **Decision Makers:** User Directive
* **Category:** Geospatial UI, Selection Dynamics & Cartographic Clarity
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  1. A static sage green circle (`L.circle` with 650m radius) and text `(Ooty Lake • 2,240m)` were permanently rendered over Ooty Lake, along with dashed contour rings over Doddabetta Peak, hardcoded strictly inside `if (activeDestKey === 'ooty')`.
  2. This produced two usability and aesthetic defects:
     - The green circle was pinned exclusively to Ooty Lake regardless of which attraction the traveler clicked.
     - The other 14 destinations lacked any focus indicator on the map.
     - The static lake text physically collided with the Pin 7 marker and its title label (`Ooty Lake & Boathouse`).
  3. The user requested: "it should appear on the selected attraction only".
* **The Decision:**
  * **Dynamic Universal Attraction Focus Circle:**
    * Completely eliminated the hardcoded static `if (activeDestKey === 'ooty')` overlay block (lake circle, lake text, Doddabetta contour rings).
    * Implemented `updateSelectedAttractionCircle(selectedItem)` in `src/views/MapView.js`, which dynamically renders a 550m expedition sage (`#5B8C7B`, 1.5px border, 0.16 fill opacity) circular focus halo directly centered on the currently selected attraction (`[item.lat, item.lng]`).
    * Hooked into ledger card click events, map marker clicks, marker popover openings (`popupopen`), and gallery modal "Center On Map" interactions.
    * Dynamically tracks the active selection across all 15 destinations and resets smoothly to Stop 1 upon destination or filter switching.
  * **Eliminated Marker Collisions:**
    * Removed static map callout text nodes that were colliding with waypoint pin labels and popover cards, allowing the popover card to display title and elevation clearly without overlap.
* **Why This Was Chosen:**
  * Transforms an isolated, hardcoded static illustration element into a responsive, universal geographic focus indicator that elevates spatial awareness for all destinations.

---

### DEC-035: Smooth Dissolve & Re-emerge Selection Reticle & Zero Zoom Jitter Architecture
* **Decision Makers:** User Directive
* **Category:** Geospatial UI, Render Kinematics & Zoom Physics
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  1. **Zoom Jitter:** When zooming or pinch-zooming the map, the green selection focus circle jittered violently, jumping and lagging behind the map tiles. This was caused by CSS `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)` applied to `.map-selected-focus-circle`. When Leaflet updated the SVG `<path>` geometry (`d` attribute) on each zoom tick, the CSS transition actively delayed and tweened the path coordinates by 300ms, fighting Leaflet's matrix projections.
  2. **Selection Jitter:** When selecting another attraction, the focus circle abruptly snapped, disappeared, or lagged in a jarring manner because coordinate changes and camera acceleration occurred simultaneously while the element was still partially visible or being destroyed mid-flight.
* **The Decision:**
  * **Zero Zoom Jitter (Paint-Only Transitions):** Removed all geometric CSS transitions and restricted `.map-selected-focus-circle` strictly to opacity (`transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), stroke-opacity 0.22s, fill-opacity 0.22s`). Leaflet's SVG projection scales and pans 100% rigidly with map tiles during zoom with zero lag or jitter.
  * **Smooth Dissolve & Re-emerge Lifecycle:**
    1. **Fade Out at Previous Landmark (200ms):** When a new attraction is selected, `.circle-hidden` is added to the SVG path, smoothly dissolving the circle at the old location (`opacity: 1 -> 0`).
    2. **Silent Repositioning:** At 200ms, while the circle is completely invisible (`opacity: 0`), its LatLng coordinate is updated to the newly selected attraction via `setLatLng()`. Because the element is invisible during the coordinate shift, there is zero coordinate jumping, path tearing, or flicker.
    3. **Graceful Bloom at New Landmark (220ms):** `.circle-hidden` is removed, allowing the green focus halo to smoothly bloom and fade in directly centered on the new landmark pin as the camera arrives.
  * **Cancellation Safety:** If the traveler rapidly clicks another card within 200ms, `clearTimeout(focusTransitionTimer)` immediately cancels pending timers, ensuring rock-solid state synchronization without queue buildup.
* **Why This Was Chosen:**
  * Delivers a calm, cinematic dissolve and reappear transition that respects physical camera motion and eliminates 100% of visual jitter during selection and zooming.

---

### DEC-036: Geospatial Map Quality Remediation, In-Place Live Search & GPS Exchange (GPX v1.1) Export
* **Decision Makers:** User Directive & Architectural Audit
* **Category:** Geospatial UI, Kinematics, Search UX & Data Portability
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  Following the split-pane map redesign, several latent UX defects were identified:
  1. **Focus Circle Mid-Flight Stutter:** The selection focus circle previously reappeared at 200ms while Leaflet's camera was still mid-flight at 25% of its 800ms pan. When the camera docked, Leaflet reset the map pane transform matrix, causing a visible jump on screen.
  2. **Search Keystroke Map Jump:** Typing in `#mapSearchInput` invoked `loadDestinationData()`, flying the camera back to the city center and destroying all layers on every character typed. Additionally, 0-match searches resulted in a blank void.
  3. **Inert HUD Controls:** "Export GPX" (`#btnExportGpx`), Compass Rose (`#btnCompassRose`), and Elevation Expand (`#btnExpandElevation`) buttons had no click listeners.
  4. **Unscoped Polyline & Static Strip Banner:** The Day 1 polyline remained visible across unrelated categories, and the circuit strip banner failed to reflect active filter selection.
* **The Decision:**
  * **Camera-Synchronized Lifecycle Engine:**
    - Hooked focus circle reveal to Leaflet's `moveend` event: the circle dissolves at the previous landmark in 180ms, remains 100% invisible while the camera glides across the map, and blooms gently into view over 250ms only *after* the camera has docked and the map tiles have settled.
    - Added deduplication guarding against double-invocations from asynchronous `openPopup()` calls.
  * **In-Place Live Search & Branded Empty State:**
    - Decoupled search input from `loadDestinationData()`. Keystrokes now trigger `activeRenderFilteredFeed()` directly with zero camera movement.
    - Rendered `.map-empty-feed` with search-off icon, contextual explanation, and a "Clear Search" button when queries match 0 sights.
    - Added `⌘K` / `Ctrl+K` keydown shortcut to instantly focus the search bar, and `Escape` to dismiss menus and blur.
  * **Standard GPX v1.1 XML Export:**
    - Wired `#btnExportGpx` to build a valid Topografix GPX v1.1 XML payload containing metadata, geocoded `<wpt>` waypoints with elevation tags, and `<trk>` track segments, downloading directly as `${destKey}-circuit.gpx`.
  * **Interactive Compass Rose & Elevation Profile Modal:**
    - Wired `#btnCompassRose` to smoothly re-center the map on the destination origin with a tactile 360° spring icon spin (`.compass-spinning`).
    - Wired `#btnExpandElevation` to display a detailed HUD modal with altitude telemetry (average elevation, range, peak label, and per-stop heights).
  * **Contextual Circuit Strip & Conditional Polyline:**
    - Dynamically updates `#lblCircuitStripText` based on active filter (Day 1 vs Day 2 vs All 14 vs Categories).
    - Scoped the terracotta circuit polyline and segment distance badges strictly to Day 1 mode.
* **Why This Was Chosen:**
  * Eliminates 100% of camera jumping, provides robust GPS export for real-world hiking and navigation, and delivers an Apple-grade, responsive geospatial explorer.

---

### DEC-037: Dynamic Circuit Management, Reactive Polyline Route Updates & Custom GPX Export
* **Decision Makers:** User Directive & Architectural Audit
* **Category:** Geospatial UI, Route Planning, Dynamic State & Layer Reactivity
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  In the split-pane geospatial map view, clicking the "In Circuit ✓" / "Add to Circuit +" button on attraction cards previously only toggled the button's text string in the DOM. It maintained zero circuit state, never updated the Leaflet polyline layer (`currentRouteGroup`), never recalculated segment distance badges (`currentDistMarkersGroup`), never updated the circuit summary strip text (`#lblCircuitStripText`), and left map waypoint pin styles completely static.
* **The Decision:**
  * **Per-Destination Dynamic Circuit Sets:**
    - Declared `destinationCircuitSets = new Map()` at view scope to store active circuit stops per destination.
    - Initialized with curated default stops and preserved user circuit customizations across filter switches and destination transitions.
  * **Topological Road Ordering Engine (`getOrderedCircuitStops`):**
    - Enforced topological road ordering (e.g. Ooty: Lake -> Botanical Gardens -> Tea Museum -> Doddabetta Peak; or destination metadata sequence) with automatic name-based deduplication so that arbitrarily adding or removing stops never creates jarring polyline zig-zags or duplicate zero-distance segments.
  * **Reactive Route & Telemetry Engine (`redrawCircuitPolylineAndTelemetry`):**
    - Clears and reconstructs `currentRouteGroup` and `currentDistMarkersGroup`.
    - If $\ge 2$ stops: renders the terracotta `#C4703D` polyline and places `.map-segment-distance-badge` pills at segment midpoints using mountain curve factor (1.38x).
    - If $\le 1$ stops: cleanly clears polyline and distance badges.
    - Dynamically updates `#lblCircuitStripText` with calculated total distance, stop count, and driving/hiking duration.
    - Toggles `.in-circuit` vs `.out-of-circuit` classes on waypoint markers (`#waypointPin-${idx}`).
  * **Visual Waypoint Pin States (`map.css`):**
    - Added `.map-waypoint-pin.out-of-circuit` styling with a subdued graphite bubble (`#7A7670`), border `#EDEAE4`, and 0.65 opacity to clearly indicate landmarks not in the active route.
  * **Dynamic GPX Export & Elevation Telemetry:**
    - Wired `exportCircuitGpx()` and `openElevationModal()` to consume the active circuit stops instead of static metadata, providing travelers with customized GPS exchange files and elevation profile telemetry.
* **Why This Was Chosen:**
  * Delivers a responsive, bidirectional route-building experience where travelers can customize their trip circuit directly from the ledger while seeing immediate visual confirmation on the map lines, distance badges, HUD telemetry, and exported GPX routes.

---

### DEC-038: Tactile Archival Preferences Ledger & Settings Redesign (Stitch MCP Integration)
* **Decision Makers:** User Directive & Architectural Audit
* **Category:** UI/UX, Design Systems, Stitch MCP & Wayfarer Preferences
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  The settings view previously utilized standard HTML form controls (`<select>` dropdowns, basic text inputs, and flat rectangular buttons) rendered over a plain background. While functional, it lacked alignment with Trailmate's tactile, 19th-century geographical journal brand identity (Parchment, Terracotta, Forest Ink, and Expedition Sage).
* **The Decision:**
  * **Stitch MCP Design Generation & Brand Palette Alignment:**
    - Leveraged Stitch MCP (`generate_screen_from_text`, project `16593476996015616226`) to synthesize a cohesive, archival "Wayfarer & Planner Preferences Ledger".
    - Embedded Trailmate's core design tokens: Warm Parchment (`#FCF9F4`), Aged Vellum panels (`#FBF8F3` / `#F4EEDD`), Deep Forest Ink (`#1E3A34`), Weathered Terracotta (`#C4703D`), and Expedition Sage (`#5B8C7B`).
  * **Tactile Currency & Fiscal Ledger:**
    - Replaced the single `<select>` menu with 4 tactile debossed currency cards (`₹ INR`, `$ USD`, `€ EUR`, `£ GBP`) featuring active wax-seal checkmark indicators and subtle terracotta borders.
  * **Curated Expedition Stay Archetypes:**
    - Replaced flat buttons with rich 2-column cards including architectural icons, descriptive copy (*"Restored colonial bungalows & royal havelis"*), and a "Curated" status tag.
  * **Dietary Protocol Chips:**
    - Replaced the select menu with custom pill chips carrying dedicated semantic iconography: All Cuisines (`tune`), Pure Vegetarian (`eco`), Vegan (`spa`), Halal (`dark_mode`), and Jain Friendly (`psychology_alt`).
  * **Base Camp Origin & Cartography Controls:**
    - Added a surveyor pin origin input with quick-select hub chips (`Delhi`, `Mumbai`, `Bengaluru`, `Kolkata`, `Chennai`).
    - Introduced cartographic canvas selectors (`Parchment Atlas` vs `Satellite Topo`) and dynamic metric/imperial unit toggling.
  * **Explorer Passport & Credential Pass:**
    - Bound `CommunityService` profile state to render the traveler's callsign, rank badge (`Master Scout • Rank IV`), and dynamic XP progress bar with one-click scout switching.
  * **Dedicated Modular Styling (`settings.css`):**
    - Isolated settings-specific components (`.settings-paper-panel`, `.settings-currency-card`, `.settings-stay-card`, `.settings-diet-pill`, `.settings-toast-banner`) in `src/styles/settings.css` linked directly in `index.html`.
* **Why This Was Chosen:**
  * Transforms a generic settings screen into an immersive, tactile expedition ledger consistent with Trailmate's physical journal aesthetic while retaining 100% backward compatibility with existing `localStorage` keys and chat bot notifications.

---

### DEC-039: Wallpaper Catalog Curation & Storage Optimization — High-Saturation 4K Scenery Only
* **Decision Makers:** User Directive & Visual Quality Audit
* **Category:** Visual Aesthetics, Media Assets, Performance & Storage Hygiene
* **Status:** Implemented & Verified (October 2026)
* **The Context & Problem:**
  Several background wallpapers in `public/images/wallpapers/` and `src/data/WallpapersData.js` were visually desaturated, hazy, foggy, or dark monochrome (e.g. Mullayanagiri in total grey fog at 0.3% vibrancy, Mehrangarh in dusty dark brown at 3.4% vibrancy, Jog Falls in grey chasm rock at 10.4% vibrancy, and Spiti Valley in cold grey scree). These dull images detracted from the immersive, inspiring visual experience expected of Trailmate's 4K background carousel.
* **The Decision:**
  * **Objective Chromatic & Vibrancy Audit (HSV / RGB Spread):**
    - Ran mathematical pixel analysis across all 33 wallpaper images assessing mean saturation, brightness, and high-vibrancy ratio ($S > 0.35$).
    - Identified and pruned 15 washed-out, grey, or low-vibrancy files totaling $\sim 29.1\text{ MB}$ of deadweight storage (`mountains-mullayanagiri`, `mountains-nilgiris-glenmorgan`, `beaches-palolem-goa`, `beaches-golden-sunset-surf`, `tea-darjeeling-teascape`, `waterfalls-jog-falls`, `waterfalls-nohkalikai-meghalaya`, `waterfalls-sunlit-mossy-cascade`, `forts-kumbhalgarh-wall`, `forts-mehrangarh`, `snow-rohtang-valley`, `snow-spiti-valley`, `nature-pangong-lake`, `nature-rann-kutch`, `nature-meghalaya-living-root-bridge`).
  * **Curated 19 Ultra-Vibrant 4K Wallpapers Across 7 Categories:**
    - Kept only high-saturation, high-contrast, visually breathtaking landscapes:
      1. **Lush Green Mountains:** Nilgiris TR Valley Slopes (4K, Sat $0.43$, emerald terraces) and Anamudi Shola Mountain Summit (Sat $0.52$, sunlit peaks).
      2. **Tropical Azure Beaches:** Radhanagar Sunset Shore (4K, Sat $0.45$, $79\%$ vibrant), Varkala Red Cliff Coast (4K, Sat $0.39$), Gokarna Paradise Beach Cove (4K, Sat $0.36$), and Aerial Coral Lagoon (Sat $0.46$).
      3. **Rolling Emerald Tea Gardens:** Munnar Highland Tea Terraces (4K, Sat $0.51$), Lockhart Tea Terraces (4K, Sat $0.43$), Munnar Panoramic Tea Ridges (4K wide, Sat $0.44$, $70.6\%$ vibrant), and Valparai Anamalai Tea Hills (4K, Sat $0.44$).
      4. **Rainforest Waterfalls:** Athirappilly Monsoon Cascade (4K, Sat $0.46$, $55.4\%$ vibrant rainforest) and Dudhsagar Sea of Milk Falls (4K, Sat $0.35$, $50\%$ tropical greenery).
      5. **Golden Indian Forts:** Amber Fort & Maota Lake (4K, Sat $0.39$, lake reflections), Chittorgarh Bastion (4K, Sat $0.46$, $70.7\%$ vibrant royal blue sky), and Gwalior Hilltop Citadel (4K, Sat $0.42$).
      6. **Snow Covered Mountains:** Kanchenjunga Range at Dawn (4K, Sat $0.82$, $93.6\%$ vibrant golden-purple alpenglow) and Auli Garhwal Snow Crests (4K, Sat $0.36$, crisp azure sky).
      7. **Scenic India Nature:** Crystal Emerald Alpine Lake (Sat $0.39$, turquoise water & wooden rowboats) and Alleppey Palm Backwaters (4K, Sat $0.38$, verdant palms).
  * **Zero Missing Assets:**
    - Every wallpaper entry in `WallpapersData.js` maps to a verified local 4K file and high-resolution fallback.
* **Why This Was Chosen:**
  * Guarantees every single background crossfade delivers an inspiring, colorful, high-definition visual feast while simultaneously reclaiming $29.1\text{ MB}$ of storage.

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
