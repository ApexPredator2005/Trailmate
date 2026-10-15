/**
 * LoginView.js — Tactile Field Journal Welcome & Authentication View
 * Designed using authentic travel journal aesthetics,
 * official Trailmate app logo integration, first-time user onboarding perks,
 * robust user registration (Name, Email, Password saved to persistent store),
 * and streamlined direct email authentication & guest explorer sandbox.
 */

import { communityService } from '../services/CommunityService.js';

const STORAGE_USERS_KEY = 'trailmate_registered_users';

/**
 * Get all registered user accounts from localStorage
 */
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      // Seed default explorer account
      const seed = [
        {
          id: 'user-default-1',
          name: 'Captain James Mercer',
          email: 'traveler@trailmate.app',
          password: 'adventure2026',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
          handle: '@captain_mercer',
          bioNote: 'Roaming through mountain valleys & coastal forts.',
          authProvider: 'email',
          createdAt: Date.now() - 86400000 * 30,
        },
      ];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

/**
 * Save or update a registered user account in localStorage
 */
function saveRegisteredUser(user) {
  const users = getRegisteredUsers();
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const existingIdx = users.findIndex(u => (u.email || '').trim().toLowerCase() === normalizedEmail);
  
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  return user;
}

/**
 * Find registered user by email
 */
function findUserByEmail(email) {
  const users = getRegisteredUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  return users.find(u => (u.email || '').trim().toLowerCase() === normalizedEmail);
}

export function renderLoginView(container, {
  onSuccess = () => {},
  onClose = null,
  isFirstTime = false,
} = {}) {
  if (!container) return;
  container.scrollTop = 0;

  container.innerHTML = `
    <div class="login-modal-overlay min-h-full w-full flex flex-col justify-start items-center py-3 sm:py-4 px-4 sm:px-6 lg:px-8 relative selection:bg-[#C4703D] selection:text-white">
      
      <!-- Top Decorative Vignette Border -->
      <div class="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3A34] via-[#C4703D] to-[#C99A45] opacity-90 z-50"></div>
      
      <!-- Ambient Background Glows -->
      <div class="pointer-events-none fixed -top-24 -right-24 w-96 h-96 rounded-full bg-[#C99A45]/10 blur-3xl"></div>
      <div class="pointer-events-none fixed -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#1E3A34]/15 blur-3xl"></div>

      <!-- Global Header Bar with App Logo -->
      <header class="w-full max-w-6xl mx-auto flex items-center justify-between pb-2 z-10 shrink-0">
        <div class="flex items-center gap-3 group cursor-pointer" id="loginHeaderBrand">
          <!-- Official Trailmate App Logo Badge -->
          <div class="relative w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md border border-[#C99A45]/40 transition-transform duration-300 group-hover:scale-105 overflow-hidden p-1 shrink-0">
            <img src="/logo.png" alt="Trailmate App Logo" class="w-full h-full object-contain rounded-xl" />
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C4703D] rounded-full ring-2 ring-[#FCF9F4]"></span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif font-bold text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm">Trailmate</span>
              <span class="text-[9.5px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-[#C99A45]/20 text-[#F5E0B7] font-semibold border border-[#C99A45]/30">Field Journal</span>
            </div>
            <p class="text-[11px] text-white/80 tracking-normal font-sans drop-shadow-sm">Your Intelligent Travel Journal &amp; Expedition Partner</p>
          </div>
        </div>

        <!-- Right Utilities & Optional Dismiss Button -->
        <div class="flex items-center gap-3">
          <button id="btnQuickGuestHeader" type="button" class="text-xs font-mono uppercase tracking-wider text-white/90 hover:text-white font-medium transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm cursor-pointer">
            <span class="material-symbols-outlined text-[15px] text-[#E2A77E]">explore</span>
            <span>Quick Preview</span>
          </button>

          ${onClose ? `
            <button id="btnLoginClose" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer" title="Close" aria-label="Close login screen">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          ` : ''}
        </div>
      </header>

      <!-- Main Tactile Card Container -->
      <main class="w-full max-w-6xl mx-auto z-10 py-0.5 mb-3">
        <div class="relative bg-[#FAF6EE] rounded-[24px] border border-[#E8DFD1] shadow-journal overflow-hidden login-view-enter">
          
          <!-- Decorative Archival Corner Marks -->
          <div class="corner-bracket corner-tl"></div>
          <div class="corner-bracket corner-tr"></div>
          <div class="corner-bracket corner-bl"></div>
          <div class="corner-bracket corner-br"></div>

          <!-- Top Washi Tape Accent -->
          <div class="washi-strip absolute top-0 left-1/2 -translate-x-1/2 w-48 h-3.5 rounded-b-sm z-20"></div>

          <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">

            <!-- ================= LEFT HERO / VALUE VIGNETTES (7 COLS) ================= -->
            <div class="lg:col-span-7 p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-[#E8DFD1] bg-gradient-to-br from-[#FAF6EE] to-[#F5EFE4] flex flex-col justify-between relative overflow-hidden">
              
              <!-- Subtle Topographic Contour Background SVG -->
              <div class="absolute right-0 bottom-0 w-80 h-80 opacity-[0.06] pointer-events-none transform translate-x-14 translate-y-14">
                <svg viewBox="0 0 200 200" fill="none" stroke="#1E3A34" stroke-width="1.2">
                  <path d="M10 100 Q 50 20, 100 100 T 190 100" />
                  <path d="M10 120 Q 50 40, 100 120 T 190 120" />
                  <path d="M10 140 Q 50 60, 100 140 T 190 140" />
                  <circle cx="100" cy="100" r="70" stroke-dasharray="3 3"/>
                  <circle cx="100" cy="100" r="85" />
                </svg>
              </div>

              <!-- Top Section: Welcome Tag & Editorial Headline -->
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-white p-1 border border-[#C99A45]/40 shadow-xs flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="Trailmate" class="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A34]/5 border border-[#1E3A34]/15">
                    <span class="material-symbols-outlined text-sm text-[#C4703D]">auto_stories</span>
                    <span class="text-xs font-mono uppercase tracking-wider text-[#1E3A34] font-semibold">First-Time Expedition Protocol</span>
                  </div>
                </div>

                <h1 class="font-serif text-2xl sm:text-3xl lg:text-[34px] leading-[1.18] font-bold text-[#1E3A34] tracking-tight mb-2.5">
                  Begin Your Journey.<br>
                  <span class="italic font-normal text-[#C4703D]">Turn Wanderlust</span> into Handcrafted Day-by-Day Adventures.
                </h1>

                <p class="text-[#6D7068] text-xs sm:text-sm leading-relaxed max-w-xl font-normal mb-6">
                  Welcome to Trailmate — where antique cartography meets conversational AI. We assemble tailored itineraries, live weather cues, and tactile scrapbook memories before you lace up your boots.
                </p>
              </div>

              <!-- The 3 Feature Badges -->
              <div class="space-y-3 my-2">
                
                <!-- Badge 1: Autonomous AI Planning -->
                <div class="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-[#E8DFD1]/80 shadow-sm transition-all duration-200 group">
                  <div class="w-9 h-9 rounded-xl bg-[#1E3A34]/10 text-[#1E3A34] flex items-center justify-center shrink-0 border border-[#1E3A34]/15 group-hover:bg-[#1E3A34] group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-lg">route</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-serif font-bold text-sm text-[#1E3A34]">Autonomous AI Planning</h4>
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#5B8C7B]/15 text-[#2C6252] font-semibold">Smart Logic</span>
                    </div>
                    <p class="text-[11.5px] text-[#6D7068] mt-0.5 leading-snug">
                      Paces multi-day walking routes, hotel halts, and scenic tea trails without overwhelming spreadsheets.
                    </p>
                  </div>
                </div>

                <!-- Badge 2: Live Travel Facts -->
                <div class="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-[#E8DFD1]/80 shadow-sm transition-all duration-200 group">
                  <div class="w-9 h-9 rounded-xl bg-[#C4703D]/10 text-[#C4703D] flex items-center justify-center shrink-0 border border-[#C4703D]/20 group-hover:bg-[#C4703D] group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-lg">thermostat</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-serif font-bold text-sm text-[#1E3A34]">Live Travel Facts &amp; Transit</h4>
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C4703D]/15 text-[#9E4E20] font-semibold">Realtime</span>
                    </div>
                    <p class="text-[11.5px] text-[#6D7068] mt-0.5 leading-snug">
                      Up-to-the-minute Nilgiri train alerts, alpine temperatures, ticket timings, and local gate passes.
                    </p>
                  </div>
                </div>

                <!-- Badge 3: Memory Scrapbook -->
                <div class="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-[#E8DFD1]/80 shadow-sm transition-all duration-200 group">
                  <div class="w-9 h-9 rounded-xl bg-[#C99A45]/15 text-[#946F25] flex items-center justify-center shrink-0 border border-[#C99A45]/25 group-hover:bg-[#C99A45] group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-lg">loyalty</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-serif font-bold text-sm text-[#1E3A34]">Tactile Memory Scrapbook</h4>
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1E3A34]/10 text-[#1E3A34] font-semibold">Archival</span>
                    </div>
                    <p class="text-[11.5px] text-[#6D7068] mt-0.5 leading-snug">
                      Digital wax seals, hand-drawn route stamps, washi tape clippings, and exportable travel memories.
                    </p>
                  </div>
                </div>

              </div>

              <!-- Editorial Quote Footer -->
              <div class="pt-3.5 mt-2 border-t border-[#E8DFD1]/70 flex items-center justify-between text-xs text-[#6D7068]">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#1E3A34]/10 flex items-center justify-center text-[#1E3A34] text-[10px] font-serif font-bold">№</span>
                  <span class="text-[11px] font-mono">Expedition Dispatch #108</span>
                </div>
                <div class="italic font-serif text-[#1E3A34]/80 text-[11.5px]">"The journey is the journal."</div>
              </div>

            </div>


            <!-- ================= RIGHT AUTH SECTION (5 COLS) ================= -->
            <div class="lg:col-span-5 p-5 sm:p-6 lg:p-7 bg-white flex flex-col justify-between relative">
              
              <div>
                <!-- Brand Badge directly above Form -->
                <div class="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#E8DFD1]/50">
                  <img src="/logo.png" alt="Trailmate" class="w-7 h-7 object-contain rounded-lg" />
                  <span class="font-serif font-bold text-sm text-[#1E3A34]">Traveler Portal</span>
                  <span class="text-[10px] font-mono text-[#6D7068] ml-auto" id="portalSubhead">Sign In or Register</span>
                </div>

                <!-- Tab Switcher: Sign In / Create Account -->
                <div class="relative bg-[#F5F0E6] p-1 rounded-2xl border border-[#E8DFD1] flex items-center mb-4">
                  <button id="tabSignIn" type="button" class="flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 text-[#1E3A34] bg-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[15px]">login</span>
                    <span>Sign In</span>
                  </button>
                  <button id="tabCreateAccount" type="button" class="flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 text-[#6D7068] hover:text-[#1E3A34] flex items-center justify-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[15px]">person_add</span>
                    <span>Create Account</span>
                  </button>
                </div>

                <!-- Inline Feedback / Error Banner -->
                <div id="loginFeedbackBanner" class="hidden mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"></div>

                <!-- Auth Form -->
                <form id="loginAuthForm" class="space-y-3">
                  
                  <!-- Full Name (Visible in Create Account mode) -->
                  <div id="groupFullName" class="hidden">
                    <label class="block text-[11px] font-semibold text-[#1E3A34] uppercase tracking-wider mb-1 font-mono flex items-center justify-between">
                      <span>Full Explorer Name</span>
                      <span class="text-[9.5px] text-[#C4703D] font-normal lowercase">*required for passport</span>
                    </label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9C94] text-[17px]">badge</span>
                      <input type="text" id="inputFullName" placeholder="e.g. Pratyush Raj" 
                        class="w-full pl-9 pr-3.5 py-2 bg-[#FAF6EE]/60 border border-[#E8DFD1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C4703D]/40 focus:border-[#C4703D] text-[#1B1C1A] placeholder:text-[#9E9C94] transition-all font-sans">
                    </div>
                  </div>

                  <!-- Email Address -->
                  <div>
                    <label class="block text-[11px] font-semibold text-[#1E3A34] uppercase tracking-wider mb-1 font-mono">
                      Email Address
                    </label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9C94] text-[17px]">alternate_email</span>
                      <input type="email" id="inputEmail" required placeholder="e.g. explorer@trailmate.app"
                        class="w-full pl-9 pr-3.5 py-2 bg-[#FAF6EE]/60 border border-[#E8DFD1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C4703D]/40 focus:border-[#C4703D] text-[#1B1C1A] placeholder:text-[#9E9C94] transition-all font-sans">
                    </div>
                  </div>

                  <!-- Password -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-[11px] font-semibold text-[#1E3A34] uppercase tracking-wider font-mono">
                        Password
                      </label>
                      <button type="button" id="btnForgotPwd" class="text-[11px] text-[#C4703D] hover:underline font-medium cursor-pointer">
                        Forgot?
                      </button>
                    </div>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9C94] text-[17px]">lock</span>
                      <input type="password" id="inputPassword" required placeholder="Enter secure passphrase"
                        class="w-full pl-9 pr-9 py-2 bg-[#FAF6EE]/60 border border-[#E8DFD1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C4703D]/40 focus:border-[#C4703D] text-[#1B1C1A] placeholder:text-[#9E9C94] transition-all font-sans">
                      <button type="button" id="btnTogglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9C94] hover:text-[#1E3A34] transition-colors cursor-pointer">
                        <span id="iconPasswordEye" class="material-symbols-outlined text-[17px]">visibility</span>
                      </button>
                    </div>
                  </div>

                  <!-- Remember Me & Demo Quick Fill & Security Badge -->
                  <div class="flex items-center justify-between pt-0.5 text-[11px]">
                    <label class="flex items-center gap-1.5 cursor-pointer group select-none">
                      <input type="checkbox" id="chkRememberMe" checked class="w-3.5 h-3.5 rounded text-[#C4703D] focus:ring-[#C4703D] border-[#E8DFD1] accent-[#C4703D]">
                      <span class="text-[#6D7068] group-hover:text-[#1E3A34] transition-colors">Remember device</span>
                    </label>
                    <button type="button" id="btnFillDemo" class="text-[10.5px] font-mono text-[#C4703D] hover:underline cursor-pointer">
                      Fill demo explorer
                    </button>
                    <span class="text-[10px] font-mono text-[#5B8C7B] font-medium bg-[#5B8C7B]/10 px-2 py-0.5 rounded">256-bit Safe</span>
                  </div>

                  <!-- Submit Action Button -->
                  <button type="submit" id="btnAuthSubmit" 
                    class="w-full py-3 px-5 rounded-2xl bg-[#C4703D] hover:bg-[#AB5C2E] text-white font-bold text-sm tracking-wide shadow-terracotta-glow transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 group mt-2 cursor-pointer">
                    <span id="btnAuthSubmitText">Start Exploring</span>
                    <span class="material-symbols-outlined text-base transition-transform group-hover:translate-x-1" id="btnAuthSubmitIcon">arrow_forward</span>
                  </button>
                </form>

                <!-- Guest Explorer Fast-Track Bypass -->
                <div class="mt-3 pt-3 border-t border-[#E8DFD1]/60 text-center">
                  <button id="btnGuestBypass" type="button" 
                    class="w-full inline-flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1E3A34] font-semibold hover:text-[#C4703D] py-2 px-3 rounded-xl hover:bg-[#1E3A34]/5 transition-colors border border-dashed border-[#1E3A34]/20 cursor-pointer">
                    <span class="material-symbols-outlined text-base text-[#C99A45]">compass_calibration</span>
                    <span>Continue as Guest / Explorer</span>
                  </button>
                </div>
              </div>

              <!-- Expedition Quotes Carousel (Fills ENTIRE remaining vertical space) -->
              <div id="loginQuotesContainer" class="login-quote-section relative flex-1 w-full flex flex-col justify-between my-3">
                <span class="absolute top-2 right-4 font-serif text-5xl sm:text-6xl text-[#C99A45]/20 select-none pointer-events-none">”</span>
                <div id="loginQuoteCard" class="quote-card-inner my-auto">
                  <div id="loginQuoteLine" class="quote-line-wrapper">
                    <span id="loginQuoteFirstLetter" class="quote-first-letter quote-merge-left font-andasia">A</span>
                    <span id="loginQuoteRestText" class="quote-rest-of-text quote-merge-right">dventure is out there.”</span>
                  </div>
                  <div id="loginQuoteAuthor" class="quote-author-line quote-merge-author">
                    <span id="loginQuoteAuthorText">Charles Muntz (Up)</span>
                  </div>
                </div>
                <!-- Interactive navigation dots -->
                <div class="quote-dots-nav mt-3" id="loginQuoteDots"></div>
              </div>

              <!-- Legal / Terms Footer -->
              <div class="pt-2 text-center border-t border-[#E8DFD1]/60 flex-shrink-0">
                <p class="text-[10.5px] text-[#6D7068] leading-tight">
                  By continuing, you agree to Trailmate’s 
                  <a href="#terms" id="linkTerms" class="underline hover:text-[#1E3A34] transition-colors">Terms of Service</a> &amp; 
                  <a href="#privacy" id="linkPrivacy" class="underline hover:text-[#1E3A34] transition-colors">Privacy Policy</a>.
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>

      <!-- Bottom Global Footer Bar -->
      <footer class="w-full max-w-6xl mx-auto pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/70 font-mono z-10 gap-2">
        <div class="flex items-center gap-2.5">
          <span>© 2026 Trailmate Expedition Systems</span>
          <span>•</span>
          <span class="text-[#F5E0B7] font-medium">Field Journal Edition</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 text-white/90">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span class="font-medium text-[#F5E0B7]">Created By Apex Predator</span>
          </span>
        </div>
      </footer>

    </div>
  `;

  // ── Interaction Wiring ───────────────────────────────────────────────
  let authMode = 'signin'; // 'signin' or 'create'

  const tabSignIn = container.querySelector('#tabSignIn');
  const tabCreateAccount = container.querySelector('#tabCreateAccount');
  const groupFullName = container.querySelector('#groupFullName');
  const inputFullName = container.querySelector('#inputFullName');
  const inputEmail = container.querySelector('#inputEmail');
  const inputPassword = container.querySelector('#inputPassword');
  const btnTogglePassword = container.querySelector('#btnTogglePassword');
  const iconPasswordEye = container.querySelector('#iconPasswordEye');
  const btnAuthSubmit = container.querySelector('#btnAuthSubmit');
  const btnAuthSubmitText = container.querySelector('#btnAuthSubmitText');
  const btnAuthSubmitIcon = container.querySelector('#btnAuthSubmitIcon');
  const loginAuthForm = container.querySelector('#loginAuthForm');
  const btnGuestBypass = container.querySelector('#btnGuestBypass');
  const btnQuickGuestHeader = container.querySelector('#btnQuickGuestHeader');
  const btnForgotPwd = container.querySelector('#btnForgotPwd');
  const btnFillDemo = container.querySelector('#btnFillDemo');
  const btnLoginClose = container.querySelector('#btnLoginClose');
  const loginFeedbackBanner = container.querySelector('#loginFeedbackBanner');
  const portalSubhead = container.querySelector('#portalSubhead');
  const linkTerms = container.querySelector('#linkTerms');
  const linkPrivacy = container.querySelector('#linkPrivacy');

  // Display informative banner message
  function showFeedback(message, type = 'error') {
    if (!loginFeedbackBanner) return;
    loginFeedbackBanner.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-amber-50', 'text-amber-800', 'border-amber-200');
    
    if (type === 'error') {
      loginFeedbackBanner.classList.add('bg-red-50', 'text-red-700', 'border', 'border-red-200');
      loginFeedbackBanner.innerHTML = `
        <span class="material-symbols-outlined text-sm shrink-0">error</span>
        <span>${message}</span>
      `;
    } else if (type === 'success') {
      loginFeedbackBanner.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200');
      loginFeedbackBanner.innerHTML = `
        <span class="material-symbols-outlined text-sm shrink-0">check_circle</span>
        <span>${message}</span>
      `;
    } else {
      loginFeedbackBanner.classList.add('bg-amber-50', 'text-amber-800', 'border', 'border-amber-200');
      loginFeedbackBanner.innerHTML = `
        <span class="material-symbols-outlined text-sm shrink-0">info</span>
        <span>${message}</span>
      `;
    }
  }

  function clearFeedback() {
    if (loginFeedbackBanner) {
      loginFeedbackBanner.classList.add('hidden');
      loginFeedbackBanner.innerHTML = '';
    }
    inputEmail?.classList.remove('border-red-400');
    inputPassword?.classList.remove('border-red-400');
    inputFullName?.classList.remove('border-red-400');
  }

  inputEmail?.addEventListener('input', clearFeedback);
  inputPassword?.addEventListener('input', clearFeedback);
  inputFullName?.addEventListener('input', clearFeedback);

  // Tab switching: Sign In vs Create Account
  function setMode(mode) {
    authMode = mode;
    clearFeedback();

    if (mode === 'create') {
      tabCreateAccount.className = 'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 text-[#1E3A34] bg-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer';
      tabSignIn.className = 'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 text-[#6D7068] hover:text-[#1E3A34] flex items-center justify-center gap-1.5 cursor-pointer';
      groupFullName.classList.remove('hidden');
      inputFullName.setAttribute('required', 'true');
      btnAuthSubmitText.textContent = 'Create Explorer Profile';
      btnAuthSubmitIcon.textContent = 'person_add';
      portalSubhead.textContent = 'Join the Explorer Guild';
      setTimeout(() => inputFullName?.focus({ preventScroll: true }), 60);
    } else {
      tabSignIn.className = 'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 text-[#1E3A34] bg-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer';
      tabCreateAccount.className = 'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 text-[#6D7068] hover:text-[#1E3A34] flex items-center justify-center gap-1.5 cursor-pointer';
      groupFullName.classList.add('hidden');
      inputFullName.removeAttribute('required');
      btnAuthSubmitText.textContent = 'Start Exploring';
      btnAuthSubmitIcon.textContent = 'arrow_forward';
      portalSubhead.textContent = 'Sign In or Register';
      setTimeout(() => inputEmail?.focus({ preventScroll: true }), 60);
    }
  }

  tabSignIn?.addEventListener('click', () => setMode('signin'));
  tabCreateAccount?.addEventListener('click', () => setMode('create'));

  // Quick fill demo explorer
  btnFillDemo?.addEventListener('click', () => {
    clearFeedback();
    if (authMode === 'create') {
      setMode('signin');
    }
    inputEmail.value = 'traveler@trailmate.app';
    inputPassword.value = 'adventure2026';
    showFeedback('Demo explorer credentials filled! Click Start Exploring.', 'info');
  });

  // Terms and Privacy click handlers
  linkTerms?.addEventListener('click', (e) => {
    e.preventDefault();
    showFeedback('Trailmate Protocol: Respect nature, honor heritage, and tread lightly on every trail.', 'info');
  });

  linkPrivacy?.addEventListener('click', (e) => {
    e.preventDefault();
    showFeedback('Privacy Promise: All your itinerary plans, photos, and journal stamps remain local on your device.', 'info');
  });

  // Show/Hide password toggle
  btnTogglePassword?.addEventListener('click', () => {
    if (inputPassword.type === 'password') {
      inputPassword.type = 'text';
      iconPasswordEye.textContent = 'visibility_off';
    } else {
      inputPassword.type = 'password';
      iconPasswordEye.textContent = 'visibility';
    }
  });

  // Forgot password
  btnForgotPwd?.addEventListener('click', () => {
    const email = (inputEmail?.value || '').trim();
    if (!email) {
      showFeedback('Please enter your email address to receive password recovery instructions.', 'info');
      inputEmail?.focus();
      return;
    }
    showFeedback(`A secure password recovery dispatch has been sent to ${email}.`, 'success');
  });

  // Complete Login Flow & Profile Sync
  function finishLogin(userData) {
    // 1. Save session to localStorage
    localStorage.setItem('trailmate_has_logged_in', 'true');
    localStorage.setItem('trailmate_user', JSON.stringify(userData));

    // 2. Update Community & Passport Profile
    communityService.saveProfile({
      name: userData.name,
      avatar: userData.avatar,
      handle: userData.handle || `@${userData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      bioNote: userData.bioNote || 'Roaming through mountain valleys & coastal forts with a camera in hand.',
      isGuest: !!userData.isGuest,
    });

    // 3. Button feedback
    btnAuthSubmit.innerHTML = `
      <span class="material-symbols-outlined text-lg">check_circle</span>
      <span>Passport Verified!</span>
    `;
    btnAuthSubmit.classList.remove('bg-[#C4703D]', 'hover:bg-[#AB5C2E]');
    btnAuthSubmit.classList.add('bg-[#1E3A34]');

    setTimeout(() => {
      onSuccess(userData);
    }, 500);
  }

  // Handle Email/Password Form Submit
  loginAuthForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    const fullName = inputFullName.value.trim();

    if (!email) {
      showFeedback('Please enter your email address.', 'error');
      inputEmail.focus();
      return;
    }

    if (!password || password.length < 4) {
      showFeedback('Please enter a password with at least 4 characters.', 'error');
      inputPassword.focus();
      return;
    }

    const existingUser = findUserByEmail(email);

    if (authMode === 'create') {
      // ── SIGN UP FLOW ──
      if (!fullName || fullName.length < 2) {
        showFeedback('Please enter your Explorer Full Name for your passport.', 'error');
        inputFullName.focus();
        inputFullName.classList.add('border-red-400');
        return;
      }

      // Check if user exists
      if (existingUser && existingUser.authProvider === 'email' && existingUser.password) {
        // User already has an account — update credentials or notify
        showFeedback(`An account with ${email} already exists. Updating your passport credentials and signing in...`, 'info');
      }

      const formattedName = fullName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const handle = `@${formattedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // Save user record to registered users store
      const newUserRecord = {
        id: existingUser ? existingUser.id : `user-${Date.now()}`,
        name: formattedName,
        email: email.toLowerCase(),
        password: password, // Properly saved in persistent account store!
        avatar: existingUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
        handle,
        bioNote: existingUser?.bioNote || 'Roaming through mountain valleys & coastal forts.',
        authProvider: 'email',
        createdAt: existingUser?.createdAt || Date.now(),
      };

      saveRegisteredUser(newUserRecord);
      showFeedback(`Welcome explorer ${formattedName}! Profile & password saved.`, 'success');

      btnAuthSubmit.innerHTML = `
        <span class="material-symbols-outlined animate-spin text-base">progress_activity</span>
        <span>Registering Passport...</span>
      `;

      setTimeout(() => {
        finishLogin({
          name: newUserRecord.name,
          email: newUserRecord.email,
          avatar: newUserRecord.avatar,
          handle: newUserRecord.handle,
          isGuest: false,
          loginMethod: 'email',
          loggedInAt: Date.now(),
        });
      }, 500);

    } else {
      // ── SIGN IN FLOW ──
      if (existingUser) {
        if (existingUser.password && existingUser.password !== password) {
          showFeedback('Invalid email or password. Please verify your credentials and try again.', 'error');
          inputPassword.classList.add('border-red-400');
          inputPassword.focus();
          return;
        }

        // Correct password / authenticated!
        btnAuthSubmit.innerHTML = `
          <span class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          <span>Signing in...</span>
        `;

        setTimeout(() => {
          finishLogin({
            name: existingUser.name,
            email: existingUser.email,
            avatar: existingUser.avatar,
            handle: existingUser.handle,
            isGuest: false,
            loginMethod: 'email',
            loggedInAt: Date.now(),
          });
        }, 400);

      } else {
        // Auto-register new user on sign-in attempt so user is never blocked
        const nameFromEmail = email.split('@')[0];
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        
        const autoUser = {
          id: `user-${Date.now()}`,
          name: formattedName,
          email: email.toLowerCase(),
          password: password,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
          handle: `@${formattedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          bioNote: 'Roaming through mountain valleys & coastal forts.',
          authProvider: 'email',
          createdAt: Date.now(),
        };

        saveRegisteredUser(autoUser);

        btnAuthSubmit.innerHTML = `
          <span class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          <span>Signing in...</span>
        `;

        setTimeout(() => {
          finishLogin({
            name: autoUser.name,
            email: autoUser.email,
            avatar: autoUser.avatar,
            handle: autoUser.handle,
            isGuest: false,
            loginMethod: 'email',
            loggedInAt: Date.now(),
          });
        }, 400);
      }
    }
  });

  // ── GUEST / SANDBOX BYPASS ──
  function enterAsGuest() {
    finishLogin({
      name: 'Guest Explorer',
      email: 'guest@trailmate.sandbox',
      isGuest: true,
      avatar: '/logo-avatar.png',
      handle: '@guest_explorer',
      loginMethod: 'guest',
      loggedInAt: Date.now(),
    });
  }

  btnGuestBypass?.addEventListener('click', enterAsGuest);
  btnQuickGuestHeader?.addEventListener('click', enterAsGuest);

  // ── INSPIRATIONAL EXPEDITION QUOTES (MERGE ANIMATION ONLY) ──
  const TRAVEL_QUOTES = [
    {
      firstLetter: 'A',
      restText: 'dventure is out there.”',
      author: 'Charles Muntz (Up)',
    },
    {
      firstLetter: 'T',
      restText: 'o Travel is to Live.”',
      author: 'Hans Christian Andersen',
    },
    {
      firstLetter: 'N',
      restText: 'ot all those who wander are lost.”',
      author: 'J.R.R. Tolkien',
    },
    {
      firstLetter: 'J',
      restText: 'obs fill your pocket, but adventures fill your soul.”',
      author: 'Jamie Lyn Beatty',
    },
    {
      firstLetter: 'I',
      restText: 'f it scares you, it might be a good thing to try.”',
      author: 'Seth Godin',
    },
    {
      firstLetter: 'L',
      restText: 'eave the road, take the trails.”',
      author: 'Pythagoras',
    },
  ];

  let currentQuoteIndex = 0;
  const quoteCard = container.querySelector('#loginQuoteCard');
  const quoteFirstLetter = container.querySelector('#loginQuoteFirstLetter');
  const quoteRestText = container.querySelector('#loginQuoteRestText');
  const quoteAuthor = container.querySelector('#loginQuoteAuthor');
  const quoteAuthorText = container.querySelector('#loginQuoteAuthorText');
  const quoteDots = container.querySelector('#loginQuoteDots');
  const quotesSection = container.querySelector('#loginQuotesContainer');

  function renderQuoteDots() {
    if (!quoteDots) return;
    quoteDots.innerHTML = TRAVEL_QUOTES.map((_, i) => `
      <button type="button" class="quote-dot ${i === currentQuoteIndex ? 'active' : ''}" data-idx="${i}" aria-label="Quote ${i + 1}"></button>
    `).join('');
  }

  function setQuote(nextIndex) {
    if (!quoteCard || !quoteFirstLetter || !quoteRestText || !quoteAuthorText) return;

    quoteCard.classList.add('quote-merging-out');

    setTimeout(() => {
      currentQuoteIndex = nextIndex;
      const q = TRAVEL_QUOTES[currentQuoteIndex];

      quoteFirstLetter.textContent = q.firstLetter;
      quoteRestText.textContent = q.restText;
      quoteAuthorText.textContent = q.author;

      if (quoteDots) {
        quoteDots.querySelectorAll('.quote-dot').forEach((d, i) => {
          d.classList.toggle('active', i === currentQuoteIndex);
        });
      }

      quoteCard.classList.remove('quote-merging-out');

      quoteFirstLetter.classList.remove('quote-merge-left');
      quoteRestText.classList.remove('quote-merge-right');
      quoteAuthor?.classList.remove('quote-merge-author');

      void quoteFirstLetter.offsetWidth; // force reflow

      quoteFirstLetter.classList.add('quote-merge-left');
      quoteRestText.classList.add('quote-merge-right');
      quoteAuthor?.classList.add('quote-merge-author');
    }, 280);
  }

  renderQuoteDots();

  quoteDots?.addEventListener('click', (e) => {
    const btn = e.target.closest('.quote-dot');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (!isNaN(idx) && idx !== currentQuoteIndex) {
      setQuote(idx);
    }
  });

  let quoteInterval = setInterval(() => {
    if (!document.body.contains(container)) {
      clearInterval(quoteInterval);
      return;
    }
    const nextIdx = (currentQuoteIndex + 1) % TRAVEL_QUOTES.length;
    setQuote(nextIdx);
  }, 5500);

  if (quotesSection) {
    quotesSection.addEventListener('mouseenter', () => clearInterval(quoteInterval));
    quotesSection.addEventListener('mouseleave', () => {
      clearInterval(quoteInterval);
      quoteInterval = setInterval(() => {
        if (!document.body.contains(container)) {
          clearInterval(quoteInterval);
          return;
        }
        const nextIdx = (currentQuoteIndex + 1) % TRAVEL_QUOTES.length;
        setQuote(nextIdx);
      }, 5500);
    });
  }

  // Close handler if provided
  if (onClose && btnLoginClose) {
    btnLoginClose.addEventListener('click', () => {
      clearInterval(quoteInterval);
      onClose();
    });
  }
}
