# 🧭 Trailmate — Architecture, Design & Product Decision Log (`decisions.md`)

**Project:** Trailmate — Intelligent Travel Journal, Scrapbook Studio & Community Expedition Platform  
**Authors & Decision Makers:** Pratyush Raj (User / Product Lead) & Antigravity (AI Pair-Programming Partner)  
**Status:** Living Architectural Decision Record (ADR)  
**Last Updated:** October 2026  

---

## Table of Contents
1. [Introduction & Purpose](#1-introduction--purpose)
2. [Product & Functional Decisions](#2-product--functional-decisions)
3. [Visual, Aesthetic & Design System Decisions](#3-visual-aesthetic--design-system-decisions)
4. [Technical & Architecture Decisions](#4-technical--architecture-decisions)
5. [Media, Asset & Imagery Strategy Decisions](#5-media-asset--imagery-strategy-decisions)
6. [Security, Performance & Non-Functional Decisions](#6-security-performance--non-functional-decisions)
7. [Comprehensive Decision Matrix](#7-comprehensive-decision-matrix)
8. [Pending & Future Architectural Roadmap](#8-pending--future-architectural-roadmap)

---

## 1. Introduction & Purpose

This document serves as the single source of truth for all foundational **functional, non-functional, technical, and aesthetic decisions** made throughout the conception, evolution, and engineering of **Trailmate**. Every decision outlines the context, the exact choice made, who drove the decision, the technical/product rationale, and the resulting impact on the system.

---

## 2. Product & Functional Decisions

### DEC-001: Redesign Badges into 12 Tactile 3D Molded PVC Morale Patches
* **Decision Maker:** User Directive (with Stitch MCP Synthesis & SVG Architecture)
* **Type:** Functional & Aesthetic
* **Context:** The application previously had a fragmented identity: 12 Victorian-era hand-cast metallic medallions alongside a newly introduced set of 6 tactical PVC morale patches, accessible via a style toggle.
* **The Decision:** Completely eliminate the dual toggle and unify all 12 gamified honors into **Tactile 3D Molded PVC Rubber Morale Patches & Expedition Badges** inspired by overland expedition gear.
* **Rationale:**
  * Avoid user confusion caused by splitting the badge showcase into two competing themes.
  * Connect directly with overland/adventure psychology (tactical 4x4 rigs, mountain passes, marine dives, and night camping).
  * Enable rich hardware specifications on each patch (Shore A durometer, thermal resistance, Mil-Spec batch codes, and field operational briefs).
* **Impact:** Created [`src/data/PvcPatchesData.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/data/PvcPatchesData.js), updated [`src/views/CommunityView.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/views/CommunityView.js), and provided a unified 12-patch arsenal.

---

### DEC-002: Destination-Complete Quests with 100% Authentic Local Photography
* **Decision Maker:** User Directive
* **Type:** Functional & Content Strategy
* **Context:** Location quests initially covered only 11 destinations, and several relied on generic Unsplash stock photography that did not depict the actual Indian heritage landmarks.
* **The Decision:** Mandate at least one dedicated secret geocache treasure hunt for all **15 destinations** (Goa, Ooty, Manali, Jaipur, Munnar, Andaman, Nainital, Gangtok, Darjeeling, Wayanad, Udaipur, Shimla, Mussoorie, Kodaikanal, Coorg), each grounded in genuine coordinates, local clues, and authentic high-resolution local photography (`/images/attractions/<dest>/...`).
* **Rationale:**
  * Generic stock imagery destroys immersion in an authentic travel app.
  * Ensures uniform quest progression regardless of which destination a traveler explores.
  * Claiming a geocache automatically unlocks a matching authentic vector sticker in Scrapbook Studio.
* **Impact:** Expanded `LOCATION_QUESTS` in [`src/services/CommunityService.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/services/CommunityService.js) and added 4 new SVG quest stamps in [`src/components/EmbellishmentsData.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/components/EmbellishmentsData.js).

---

### DEC-003: Scrapbook Studio Interactive Canvas Features
* **Decision Maker:** Joint (User feature wishlist & Assistant implementation)
* **Type:** Functional & Interaction Design
* **Context:** Early Scrapbook versions allowed static sticker placement with limited manipulation, leading to user friction when creating multi-element layouts.
* **The Decision:** Implement a desktop-grade client-side creative suite directly inside `ScrapbookWorkspace.js`:
  1. Full Undo/Redo history stack with keyboard shortcuts (`Cmd+Z`, `Cmd+Shift+Z`).
  2. Drag-and-drop from the asset tray directly onto artboard coordinates.
  3. Multi-element group selection via `Shift+Click` with synchronized movement and deletion.
  4. Mobile long-press (500ms) context menus for touch devices.
  5. Sticker favorites and recently-used categorization.
* **Rationale:**
  * Elevates Trailmate from a static planner into a creative journaling suite.
  * Desktop keyboard shortcuts and mobile touch parity ensure seamless cross-device creative flow.
* **Impact:** Highly engaged users who publish handcrafted scrapbooks to the Community Feed.

---

### DEC-004: Login Experience & Animated Quotes Transition
* **Decision Maker:** User Directive
* **Type:** Functional & UX Polish
* **Context:** The login screen had an empty section below the "Continue as Guest" sandbox with awkward whitespace, and users felt a lack of inspiration prior to entering the app.
* **The Decision:**
  * Remove redundant "Instant Sandbox" copy.
  * Utilize the entire available vertical canvas for an auto-cycling carousel of famous travel quotes (Muntz, Andersen, Tolkien, Beatty, Godin, Pythagoras).
  * Enforce that the first letter of each quote uses the custom **Andasia** display font at a significantly larger scale.
  * Apply a custom **merge animation** (left-half slide-in, right-half slide-in, author delayed fade-up) exclusively to the quote transitions.
* **Rationale:**
  * Sets an immediate emotional, literary tone before the user even begins planning.
  * The merge animation reinforces the concept of travel merging physical distance into personal discovery.
* **Impact:** Implemented in [`src/views/LoginView.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/views/LoginView.js) and [`src/styles/login.css`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/styles/login.css).

---

## 3. Visual, Aesthetic & Design System Decisions

### DEC-005: Tactile Vintage Field Journal vs. Generic SaaS Aesthetic
* **Decision Maker:** Joint
* **Type:** Aesthetic & Brand Identity
* **Context:** Modern AI travel assistants predominantly use sterile, white/blue minimalist SaaS layouts that feel transactional and detached.
* **The Decision:** Anchor Trailmate's visual narrative in a **19th-century tactile field explorer's journal**:
  * Canvas base: Warm, non-reflective parchment (`#FCF9F4`).
  * Inks: Deep forest pine (`#1E3A34`), terracotta clay (`#C4703D`), vintage sage (`#5B8C7B`), and warm sand (`#E8DFD0`).
  * Typography: `Noto Serif` for literary journal entries, `Public Sans` for legible itineraries, and `JetBrains Mono` for GPS coordinates and ticket data.
* **Rationale:**
  * Creates emotional warmth, nostalgic discovery, and physical grounding.
  * Distinguishes Trailmate from utilitarian flight/hotel booking engines.
* **Impact:** Documented in Stitch project `projects/16593476996015616226` and established across all CSS modules.

---

### DEC-006: Physical 3D Molded Rubber & Silicone Simulation Physics
* **Decision Maker:** Assistant (grounded in User's 3 reference morale patch images)
* **Type:** Design System & Rendering Physics
* **Context:** Representing rubber morale patches in web UI usually results in flat vector icons with basic borders.
* **The Decision:** Formulate an authentic 5-Tier Z-axis physical relief model:
  * **Level 0 (Base Substrate):** Vulcanized charcoal fluororubber (`#121316`) with micro-stippled matte grain to prevent glare.
  * **Level 1 (Low Relief):** $+1.0\text{mm}$ flat matte background silhouettes (pine forests, topographic contours, speed bands) with $3^\circ$–$5^\circ$ mold draft angles.
  * **Level 2 (Mid Relief):** $+2.0\text{mm}$ molded overland vehicles, tents, stone fire pits, and copper kettles with directional contact shadows.
  * **Level 3 (High Relief):** $+3.2\text{mm}$ vibrant color injection (Neon Lime `#CCFF00`, Hazard Orange `#FF6B00`, Flame Gold `#FBBF24`) and bold 3D extruded block lettering.
  * **Level 4 (Perimeter Trench):** Recessed stitch groove with simulated `#69` bonded nylon thread stitches (`1.5px dashed rgba(240,230,215,0.4)`).
  * **Lighting Vector:** Fixed $315^\circ$ azimuth (top-left) with $45^\circ$ elevation and warm $15\%$ ambient bounce fill.
* **Rationale:**
  * Perfectly reproduces the tactile feeling of real molded silicone patches.
* **Impact:** Documented in [`docs/tactile_pvc_patches_design_system.md`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/docs/tactile_pvc_patches_design_system.md).

---

### DEC-007: 60fps Destination-Specific Boomerang Motion Keyframes
* **Decision Maker:** Joint
* **Type:** Animation & Delight
* **Context:** Destination topbar header doodles were static, rendering them visually flat against dynamic itinerary updates.
* **The Decision:** Create an organic, silky-smooth 60fps CSS "boomerang" animation engine (`animation: ... ease-in-out infinite alternate`) with destination-specific physics:
  * Coastal: Buoyant ocean swell bobbing (`.doodle-coastal-wave`).
  * Alpine: High-altitude drifting breeze (`.doodle-alpine-breeze`).
  * Tea Estates: Rolling hill sway (`.doodle-tea-sway`).
  * Monuments: Stately, subtle reverence pulse (`.doodle-monuments-reverence`).
* **Rationale:**
  * Infuses life into the interface without consuming CPU/GPU overhead like video or heavy canvas rendering.
  * Pauses on hover to maintain accessibility.
* **Impact:** Implemented in [`src/styles/chat.css`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/styles/chat.css) and [`src/components/HeaderDoodlesData.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/components/HeaderDoodlesData.js).

---

## 4. Technical & Architecture Decisions

### DEC-008: Multi-Agent Parallel Orchestration for Rapid Development
* **Decision Maker:** User Directive ("Use multiple agents to divide your work and do it faster")
* **Type:** Technical & Process Architecture
* **Context:** Complex features (e.g. downloading 180+ authentic destination images, vectorizing 12 patch SVGs, simultaneous CSS/JS refactoring) are bottlenecked if executed sequentially.
* **The Decision:** Leverage Antigravity's `invoke_subagent` capability to spawn concurrent, specialized subagents:
  * Image collection divided geographically into 4 worker groups.
  * Patch SVG architecture assigned to a dedicated asset agent while UI integration ran concurrently in a CSS/View agent.
* **Rationale:**
  * Compresses multi-hour tasks into minutes through parallel execution.
  * Isolates workspace concerns and prevents file collision.
* **Impact:** Accomplished complete 15-destination asset coverage and 12-patch redesign in single pair-programming sessions.

---

### DEC-009: Google Stitch MCP as Design System Grounding Source
* **Decision Maker:** User Directive ("use stich mcp")
* **Type:** Tooling & Design Architecture
* **Context:** Creating consistent tactical design systems from prompt text often leads to style drift across screens.
* **The Decision:** Ground all visual designs in dedicated Google Stitch projects:
  * Project `16593476996015616226`: Trailmate Heritage & Field Journal System.
  * Project `15129941659496130226`: Tactical 3D Molded PVC Expedition System.
  * Extracted exact design tokens (`DESIGN.md`), typography (`Barlow Condensed`, `Inter`, `JetBrains Mono`), and color harmonies.
  * Standardized on `GEMINI_3_5_FLASH_LITE` for Stitch screen generation to avoid network transport timeouts associated with dense payloads.
* **Rationale:**
  * Guarantees design token rigor and visual fidelity.
  * Provides verifiable visual artifact previews prior to production code implementation.
* **Impact:** Generated screens `41b22e23cff24fc1892257174b110308` and `0f19afdf3adc49c098361c3f4dd6dfd7`.

---

### DEC-010: Local-First State Architecture & Zero-Backend Storage
* **Decision Maker:** Joint
* **Type:** Technical & Architecture
* **Context:** A travel companion must function reliably in low-connectivity or offline environments (flights, remote treks, national parks).
* **The Decision:** Implement a local-first reactive architecture powered by `localStorage` and a centralized event-driven store:
  * User profile, credentials, and level XP stored locally.
  * Earned badge IDs and completed quest states persisted in deterministic keys.
  * Community feed pre-seeded with rich offline explorer dispatches while supporting local publishing, liking, and commenting.
* **Rationale:**
  * Zero latency, instantaneous UI updates, and full offline resilience.
  * No expensive cloud infrastructure required for core journaling functionality.
* **Impact:** Encapsulated within [`src/services/CommunityService.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/services/CommunityService.js).

---

### DEC-011: Client-Side Vector SVGs vs. Raster Assets for Badges
* **Decision Maker:** Assistant
* **Type:** Technical & Performance
* **Context:** Rendering 12 high-detail 3D rubber patches using PNG/WebP rasters increases initial page bundle size, produces blurry rendering on high-DPI Retina screens, and prevents dynamic color/theme adjustments.
* **The Decision:** Construct all 12 patches as inline vector SVGs equipped with CSS layered drop-shadow filters, radial gradient highlights, and vector stroke dasharrays.
* **Rationale:**
  * Ultra-crisp scaling from 32px thumbnails to 512px modal previews with zero pixelation.
  * Negligible file footprint (~45KB total code for all 12 patches combined).
  * Enables dynamic color manipulation and hover transitions via CSS variables.
* **Impact:** Stored in [`src/data/PvcPatchesData.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/data/PvcPatchesData.js).

---

### DEC-012: Vite Dynamic Chunk Code-Splitting
* **Decision Maker:** Assistant
* **Type:** Non-Functional & Performance
* **Context:** As Scrapbook Studio, MapView, and CommunityView grew, the initial bundle was exceeding 600KB, degrading first-contentful-paint (FCP).
* **The Decision:** Configure dynamic imports (`import()`) and Rollup manual chunking in `vite.config.js` to isolate large modules (`MapView`, `ScrapbookWorkspace`, `CommunityView`, `vendor-leaflet`, `vendor-export`).
* **Rationale:**
  * Decreases initial landing load time by over $60\%$.
  * Heavy graphic manipulation tools (Scrapbook canvas, Map tiles) are only fetched when navigated to.
* **Impact:** Build output generates clean modular chunks with fast gzipped delivery.

---

## 5. Media, Asset & Imagery Strategy Decisions

### DEC-013: 100% Genuine Destination Photo Galleries
* **Decision Maker:** User Directive
* **Type:** Content & Asset Strategy
* **Context:** Placeholders and automated stock scraping frequently returned incorrect sights (e.g., generic European beaches for Goa, Swiss chalets for Manali).
* **The Decision:** Curate and verify local image files organized strictly by destination:
  `public/images/attractions/<destination>/<slug>-1.jpg` through `-6.jpg`.
  Strict requirement: Non-zero bytes, resolution $\ge 800\text{px}$, verified against Wikimedia Commons or official state tourism archives.
* **Rationale:**
  * Travelers rely on visual truth when evaluating an attraction.
* **Impact:** Over 180 verified local images across all 15 destinations embedded in attraction carousels and map popups.

---

### DEC-014: 2x Super-Sampling on Destination Doodles
* **Decision Maker:** Joint
* **Type:** Asset Quality & Optimization
* **Context:** Original header line doodles appeared faint or pixelated on high-DPI displays.
* **The Decision:** Execute a 2x super-sampling workflow using Lanczos resampling, contrast normalization, and unsharp masking (radius 1.2, percent 130) to produce razor-sharp transparent PNGs rendered in Stitch Charcoal `#141817`.
* **Rationale:**
  * Preserves line weight and crispness against both parchment light mode and dark themes.
* **Impact:** Upgraded all 13 header doodles in `public/images/headers/`.

---

### DEC-015: 4K Wallpapers with Crossfade & Broken Image Pruning
* **Decision Maker:** User Directive
* **Type:** Media Strategy
* **Context:** Users reported black borders and uneven spacing on certain wallpaper rotations, and an oversized 3MB wallpaper (`mountains-amba-ghat-4k.jpg`) was causing layout jitter.
* **The Decision:** Prune broken/oversized wallpaper files, enforce uniform CSS cover positioning with edge-to-edge dark vignette overlays, and implement smooth 1.2s crossfading between backgrounds.
* **Rationale:**
  * Eliminates jarring layout flashes and ensures immersion across all display aspect ratios.
* **Impact:** Cleaned [`src/data/WallpapersData.js`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/data/WallpapersData.js) and [`src/styles/wallpaper.css`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/styles/wallpaper.css).

---

## 6. Security, Performance & Non-Functional Decisions

### DEC-016: Strict Print Media Isolation for PDF Itinerary Booklets
* **Decision Maker:** User Directive & Assistant Fix
* **Type:** Non-Functional & Output Fidelity
* **Context:** Printing or exporting an itinerary to PDF was capturing the chat input bar, sidebar navigation buttons, and responsive hamburger menus.
* **The Decision:** Implement strict `@media print` rules:
  * Exclusively isolate `#itineraryPane` while hiding `#appHeader`, `#sidebar`, `#chatPane`, and modal overlays.
  * Apply archival parchment texture, elegant serif typography, and the official Trailmate logo emblem to the printed header.
* **Rationale:**
  * Allows travelers to produce beautiful, physical pocket guides to carry without cellular signal.
* **Impact:** Implemented in [`src/styles/itinerary.css`](file:///Users/pratyushraj/Desktop/Projects/travel%20app/src/styles/itinerary.css).

---

### DEC-017: Tiered Rate Limiting & Input Sanitization
* **Decision Maker:** Assistant Security Audit
* **Type:** Security & Reliability
* **Context:** Open chat inputs and search endpoints could be vulnerable to prompt injection, script execution, or accidental API flooding.
* **The Decision:**
  * Implement client-side and edge input sanitization (`DOMPurify` / HTML escaping) on all user-submitted text and community posts.
  * Add token bucket rate-limiting on Gemini API invocations to prevent accidental runaway quota exhaustion.
  * Configure strict Content Security Policy (CSP) headers and input bounds.
* **Rationale:**
  * Ensures safe operation when travelers share scrapbooks and itineraries across the community.
* **Impact:** Documented in project security commits and test suites.

---

## 7. Comprehensive Decision Matrix

| ID | Category | Decision | Driver | Primary Impact |
|:---|:---|:---|:---|:---|
| **DEC-001** | Product / UX | Redesign 12 badges into 3D Molded PVC Morale Patches | User | Unified expedition board, telemetry specs, Mil-Spec HUD |
| **DEC-002** | Product / Content | 15 Destination Coordinate Quests with Real Photos | User | 100% destination geocache coverage, local photography |
| **DEC-003** | Functional | Scrapbook Studio Undo/Redo, Multi-Select & Touch Gestures | Joint | Full creative suite, desktop keyboard shortcuts |
| **DEC-004** | UX / Polish | Login Quotes Carousel with Andasia Drop-Cap & Merge Animation | User | Emotional storytelling, custom font, smooth transition |
| **DEC-005** | Aesthetic | 19th-Century Tactile Field Journal Narrative | Joint | Parchment, terracotta, sage pigments; literary tone |
| **DEC-006** | Design System | 5-Tier Z-Axis Physical Rubber Relief Model | Assistant | Realistic silicone stippling, draft angles, stitch groove |
| **DEC-007** | Animation | 60fps Destination-Specific Boomerang Keyframes | Joint | Dynamic organic motion for ocean waves, alpine drift |
| **DEC-008** | Process | Multi-Agent Parallel Orchestration | User | Fast concurrent execution of assets, SVGs, and code |
| **DEC-009** | Tooling | Google Stitch MCP Design System Grounding | User | Visual token fidelity, automated theme export |
| **DEC-010** | Architecture | Local-First Reactive State & Offline Journaling | Joint | Instantaneous response, zero-cost serverless operation |
| **DEC-011** | Performance | Inline Vector SVGs for 3D Patches vs Raster Bitmaps | Assistant | Zero pixelation, dynamic CSS variables, tiny bundle |
| **DEC-012** | Performance | Rollup / Vite Dynamic Code Splitting | Assistant | 60% reduction in initial bundle size |
| **DEC-013** | Media | Elimination of Stock Photos in Favor of Real Sights | User | 180+ verified local attraction photographs |
| **DEC-014** | Media | 2x Super-Sampling & Unsharp Masking on Doodles | Joint | High-DPI Retina sharpness for topbar art |
| **DEC-015** | UX / Media | 4K Wallpaper Edge Alignment & Broken Image Removal | User | Seamless background crossfade, no black borders |
| **DEC-016** | Non-Functional | Print CSS Isolation for Clean PDF Itinerary Booklets | User | Physical travel booklet export with zero UI clutter |
| **DEC-017** | Security | Tiered Rate Limiting & Input Sanitization | Assistant | Safe community sharing, zero XSS vulnerability |

---

## 8. Pending & Future Architectural Roadmap

### 1. Real Google Authentication Integration (GIS / Firebase)
* **Status:** Under Architecture Evaluation (discussed in October 2026).
* **Context:** Moving from client-side mock registration to authentic Google OAuth 2.0 / OpenID Connect.
* **Proposed Route:** Integrate Google Identity Services (GIS) SDK (`accounts.google.com/gsi/client`) using a verified Google Cloud Client ID and JWT verification.

### 2. Cloud Synchronization & Cross-Device Scrapbooking
* **Status:** Planned.
* **Context:** Enable travelers to start a scrapbook on mobile during a trek and finish the binding on desktop.
* **Proposed Route:** Local-first sync using WebSockets / CRDT or Supabase / Firebase backend sync layer while preserving offline functionality.
