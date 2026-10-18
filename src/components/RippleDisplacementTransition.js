/**
 * RippleDisplacementTransition.js — WebGL Liquid Ripple Displacement Engine
 * Inspired by VengeanceUI's Ripple Displacement Slider.
 * 
 * Creates a fluid liquid shockwave and ripple displacement wave across #appMain
 * when switching between views (chat, trips, scrapbook, map, community, settings).
 * Leaves the sidebar completely untouched.
 */

export class RippleDisplacementTransition {
  constructor({ containerId = 'appMain' } = {}) {
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.quadBuffer = null;
    this.isTransitioning = false;
    this.animationFrameId = null;

    // Cache textures per view
    this.textures = new Map();
    this.textureCanvases = new Map();

    // Shader uniform locations
    this.uniforms = {};

    this._init();
  }

  _init() {
    if (!this.container) return;

    // Create WebGL canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'rippleTransitionCanvas';
    this.canvas.className = 'absolute inset-0 w-full h-full pointer-events-none z-30 opacity-0 transition-opacity duration-150';
    this.canvas.style.willChange = 'opacity, transform';
    this.container.appendChild(this.canvas);

    try {
      this.gl = this.canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('[RippleDisplacement] WebGL not supported on this context.', e);
      return;
    }

    if (!this.gl) {
      console.warn('[RippleDisplacement] Failed to acquire WebGL context.');
      return;
    }

    this._setupShaders();
    this._setupGeometry();
  }

  _setupShaders() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = (aPos + 1.0) * 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    // Authentic VengeanceUI Ripple Displacement GLSL Fragment Shader
    const fsSource = `
      precision highp float;
      uniform sampler2D uTexCurrent;
      uniform sampler2D uTexNext;
      uniform float uProgress;
      uniform vec2 uResolution;
      uniform vec2 uCenter;
      uniform float uWaveFreq;
      uniform float uWavePow;
      uniform float uWaveWidth;
      uniform float uFalloff;
      uniform float uBoostStrength;
      uniform float uCrossfadeWidth;
      varying vec2 vUv;

      void main() {
        float aspectRatio = uResolution.y / uResolution.x;
        vec2 coord = vec2(vUv.x, vUv.y * aspectRatio);
        vec2 center = vec2(uCenter.x, uCenter.y * aspectRatio);
        
        float dist = distance(coord, center);
        float time = uProgress;

        vec2 displaced = coord;
        float brightness = 0.0;
        float blend = 0.0;

        if (time > 0.001) {
          float trailing = dist - time;
          if (trailing < uWaveWidth && trailing < 0.0) {
            float age = -trailing;
            float decay = exp(-age * uFalloff);
            float wave = sin(age * uWaveFreq) * decay;
            vec2 direction = normalize(coord - center);
            displaced += direction * wave * uWavePow;
            brightness = abs(wave) * uBoostStrength * decay;
          }
          blend = smoothstep(0.0, uCrossfadeWidth, -trailing);
        }
        
        vec2 finalUv = vec2(displaced.x, displaced.y / aspectRatio);
        finalUv = clamp(finalUv, 0.0, 1.0);
        
        vec4 currentColor = texture2D(uTexCurrent, finalUv);
        vec4 nextColor = texture2D(uTexNext, finalUv);

        vec4 color = mix(currentColor, nextColor, blend);
        color.rgb += color.rgb * brightness;

        gl_FragColor = color;
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('[RippleDisplacement] Shader compile error:', gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[RippleDisplacement] Program link error:', gl.getProgramInfoLog(prog));
      return;
    }

    this.program = prog;
    gl.useProgram(prog);

    // Uniform locations
    this.uniforms = {
      uTexCurrent: gl.getUniformLocation(prog, 'uTexCurrent'),
      uTexNext: gl.getUniformLocation(prog, 'uTexNext'),
      uProgress: gl.getUniformLocation(prog, 'uProgress'),
      uResolution: gl.getUniformLocation(prog, 'uResolution'),
      uCenter: gl.getUniformLocation(prog, 'uCenter'),
      uWaveFreq: gl.getUniformLocation(prog, 'uWaveFreq'),
      uWavePow: gl.getUniformLocation(prog, 'uWavePow'),
      uWaveWidth: gl.getUniformLocation(prog, 'uWaveWidth'),
      uFalloff: gl.getUniformLocation(prog, 'uFalloff'),
      uBoostStrength: gl.getUniformLocation(prog, 'uBoostStrength'),
      uCrossfadeWidth: gl.getUniformLocation(prog, 'uCrossfadeWidth'),
    };

    gl.uniform1i(this.uniforms.uTexCurrent, 0);
    gl.uniform1i(this.uniforms.uTexNext, 1);
    gl.uniform1f(this.uniforms.uWaveFreq, 26.0);
    gl.uniform1f(this.uniforms.uWavePow, 0.040);
    gl.uniform1f(this.uniforms.uWaveWidth, 0.48);
    gl.uniform1f(this.uniforms.uFalloff, 8.0);
    gl.uniform1f(this.uniforms.uBoostStrength, 0.58);
    gl.uniform1f(this.uniforms.uCrossfadeWidth, 0.07);
  }

  _setupGeometry() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(this.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  /**
   * Generates a rich, crisp thematic texture canvas matching the visual DNA of a view.
   */
  _createViewTextureCanvas(viewKey, width, height) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const w = width;
    const h = height;

    const THEMES = {
      chat: {
        bgStart: '#FCF9F4', bgMid: '#F5EFE6', bgEnd: '#EDE4D8',
        accent: '#944A1A', title: 'AI Travel Planner', icon: 'chat',
        tag: 'INTELLIGENT CONVERSATIONAL AGENT',
        desc: 'Interactive chat feed, day-by-day itineraries, and real-time destination weather.',
      },
      trips: {
        bgStart: '#1A2926', bgMid: '#121F1C', bgEnd: '#0A1311',
        accent: '#5B8C7B', title: 'Trip Vault & Blueprints', icon: 'travel_explore',
        tag: 'EXPEDITION BLUEPRINTS',
        desc: 'Saved travel itineraries, packing checklists, and flight schedules.',
      },
      scrapbook: {
        bgStart: '#1E1428', bgMid: '#140C1C', bgEnd: '#0B0610',
        accent: '#A855F7', title: 'Scrapbook Studio', icon: 'auto_awesome_mosaic',
        tag: 'VISUAL EXPEDITION JOURNAL',
        desc: 'Dynamic wax seals, Polaroid photo frames, stickers, and archival journal layouts.',
      },
      map: {
        bgStart: '#F7F3EB', bgMid: '#EFE9DE', bgEnd: '#E4DCCE',
        accent: '#064E3B', title: 'Cartographic Explorer', icon: 'map',
        tag: 'GEOGRAPHIC CARTOGRAPHY',
        desc: 'Leaflet parchment maps, verified destination waypoints, and elevation profiles.',
      },
      community: {
        bgStart: '#1C1713', bgMid: '#14100D', bgEnd: '#0C0907',
        accent: '#F59E0B', title: 'Expedition Board', icon: 'group',
        tag: '3D MOLDED PVC MORALE PATCHES',
        desc: 'Tactile rubber morale badges, Mil-Spec telemetry HUD, and trail XP milestones.',
      },
      settings: {
        bgStart: '#20232A', bgMid: '#16191E', bgEnd: '#0E1014',
        accent: '#94A3B8', title: 'Traveler Settings', icon: 'settings',
        tag: 'SYSTEM & PREFERENCES',
        desc: 'Quota rate limiting, anti-hallucination toggles, and profile customization.',
      },
    };

    const theme = THEMES[viewKey] || THEMES.chat;

    // Linear gradient background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.bgStart);
    grad.addColorStop(0.5, theme.bgMid);
    grad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative ambient radial glow
    const radial = ctx.createRadialGradient(w * 0.75, h * 0.35, 40, w * 0.75, h * 0.35, w * 0.7);
    radial.addColorStop(0, theme.accent + '28');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    // Subtle fine grid lines
    ctx.strokeStyle = theme.bgStart.startsWith('#F') ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 48;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top Category Pill
    ctx.fillStyle = theme.accent + '22';
    ctx.strokeStyle = theme.accent + '55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(64, 52, 240, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    ctx.font = '600 11px JetBrains Mono, monospace';
    ctx.fillText(theme.tag, 78, 70);

    // View Headline
    const isLight = theme.bgStart.startsWith('#F');
    ctx.fillStyle = isLight ? '#141817' : '#FFFFFF';
    ctx.font = 'bold 36px Noto Serif, serif';
    ctx.fillText(theme.title, 64, 130);

    ctx.fillStyle = isLight ? 'rgba(20, 24, 23, 0.7)' : 'rgba(255, 255, 255, 0.65)';
    ctx.font = '400 15px Public Sans, sans-serif';
    ctx.fillText(theme.desc, 64, 160);

    // Decorative floating preview card
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(64, 200, Math.min(w - 128, 640), 180, 16);
    ctx.fill();
    ctx.stroke();

    return canvas;
  }

  _getOrCreateTexture(viewKey, width, height) {
    const gl = this.gl;
    const cacheKey = `${viewKey}_${Math.round(width)}_${Math.round(height)}`;

    if (this.textures.has(cacheKey)) {
      return this.textures.get(cacheKey);
    }

    const canvas = this._createViewTextureCanvas(viewKey, width, height);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.textures.set(cacheKey, tex);
    return tex;
  }

  /**
   * Executes the Ripple Displacement Slider transition from currentView to nextView.
   * 
   * @param {Object} options
   * @param {string} options.currentView - Outgoing view key
   * @param {string} options.nextView - Incoming view key
   * @param {number} [options.clickY] - Client Y position of the clicked sidebar item
   * @param {HTMLElement} [options.incomingElement] - Target DOM element being revealed
   * @param {HTMLElement} [options.outgoingElement] - Outgoing DOM element being hidden
   * @param {Function} [options.onComplete] - Callback on transition settlement
   */
  transition({
    currentView = 'chat',
    nextView = 'trips',
    clickY = null,
    incomingElement = null,
    outgoingElement = null,
    onComplete = null,
  } = {}) {
    if (!this.gl || !this.program || !this.canvas) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    if (this.isTransitioning) {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.isTransitioning = false;
    }

    this.isTransitioning = true;
    const gl = this.gl;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    gl.viewport(0, 0, w, h);

    // Center of ripple origin: starts at left edge where sidebar connects!
    const rect = this.container.getBoundingClientRect();
    let relativeY = 0.5;
    if (clickY !== null && typeof clickY === 'number') {
      relativeY = (clickY - rect.top) / Math.max(h, 1);
      relativeY = Math.max(0.05, Math.min(0.95, relativeY));
    }

    const originXPercent = 0.04; // 4% from left edge (right where sidebar touches mainStage)
    const originYPercent = relativeY;

    // Acquire WebGL textures for current and next views
    const texCurrent = this._getOrCreateTexture(currentView, w, h);
    const texNext = this._getOrCreateTexture(nextView, w, h);

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texCurrent);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texNext);

    gl.uniform2f(this.uniforms.uResolution, w, h);
    gl.uniform2f(this.uniforms.uCenter, originXPercent, originYPercent);

    // Fade in WebGL canvas overlay
    this.canvas.style.opacity = '1';

    // Calculate maximum radius to fully clear screen
    const ratio = h / w;
    const maxDist = Math.hypot(1.0 - originXPercent, (1.0 - originYPercent) * ratio) + 0.55;

    // Setup progressive clip-path on incoming DOM element
    if (incomingElement) {
      incomingElement.classList.remove('hidden');
      const originXpx = Math.round(originXPercent * w);
      const originYpx = Math.round(originYPercent * h);
      incomingElement.style.clipPath = `circle(0px at ${originXpx}px ${originYpx}px)`;
      incomingElement.style.willChange = 'clip-path';
    }

    const DURATION = 680; // ms
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / DURATION, 1.0);

      // Apple decelerating fluid curve: cubic-bezier(0.16, 1, 0.3, 1) approximation
      const ease = 1 - Math.pow(1 - progress, 3.5);

      const currentWaveDist = ease * maxDist;
      gl.uniform1f(this.uniforms.uProgress, currentWaveDist);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Concurrently expand clip-path on the incoming DOM element
      if (incomingElement) {
        const originXpx = Math.round(originXPercent * w);
        const originYpx = Math.round(originYPercent * h);
        const maxPixelRadius = Math.hypot(w, h) * 1.15;
        const currentRadius = Math.round(ease * maxPixelRadius);
        incomingElement.style.clipPath = `circle(${currentRadius}px at ${originXpx}px ${originYpx}px)`;
      }

      if (progress < 1.0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Complete transition: clean settlement
        this.canvas.style.opacity = '0';
        if (incomingElement) {
          incomingElement.style.clipPath = '';
          incomingElement.style.willChange = '';
        }
        if (outgoingElement && outgoingElement !== incomingElement) {
          outgoingElement.classList.add('hidden');
        }

        this.isTransitioning = false;
        this.animationFrameId = null;

        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }
}

export const rippleDisplacement = new RippleDisplacementTransition();
export default rippleDisplacement;
