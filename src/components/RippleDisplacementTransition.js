/**
 * RippleDisplacementTransition.js — WebGL Liquid Ripple Displacement Engine
 * Inspired by VengeanceUI's Ripple Displacement Slider.
 * 
 * Creates a fluid liquid shockwave and caustic ripple displacement wave across #appMain
 * originating directly from the clicked button, applying a smooth ease-in acceleration.
 * Leaves the sidebar completely untouched and ensures zero black screens or delay.
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

    // Uniform locations
    this.uniforms = {};

    this._init();
  }

  _init() {
    if (!this.container) return;

    // Create transparent WebGL overlay canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'rippleTransitionCanvas';
    this.canvas.className = 'absolute inset-0 w-full h-full pointer-events-none z-30';
    this.container.appendChild(this.canvas);

    try {
      this.gl = this.canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
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

    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    this._setupShaders();
    this._setupGeometry();
  }

  _setupShaders() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        // Map Y so 0.0 is at the TOP, exactly matching DOM coordinate system
        vUv = vec2((aPos.x + 1.0) * 0.5, (1.0 - aPos.y) * 0.5);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    // Authentic Liquid Caustic Shockwave Fragment Shader with Directional Sunbeam,
    // Prismatic Chromatic Dispersion, Organic Micro-Turbulence, and Thematic Mineral Tint
    const fsSource = `
      precision highp float;
      uniform float uProgress;      // Current wave distance
      uniform vec2 uResolution;     // Canvas width and height
      uniform vec2 uCenter;         // Normalized wave origin (x, y)
      uniform float uWaveFreq;       // Ripple undulation frequency
      uniform float uWaveWidth;      // Total width of the shockwave ring
      uniform float uBoostStrength;  // Specular caustic glint intensity
      uniform vec3 uTint;           // Thematic liquid mineral refraction tint
      varying vec2 vUv;

      void main() {
        float aspectRatio = uResolution.y / uResolution.x;
        vec2 coord = vec2(vUv.x, vUv.y * aspectRatio);
        vec2 center = vec2(uCenter.x, uCenter.y * aspectRatio);

        float dist = distance(coord, center);
        float time = uProgress;

        if (time <= 0.001 || dist > time + 0.05) {
          gl_FragColor = vec4(0.0);
          return;
        }

        // 1. Organic Micro-Turbulence: subtle harmonic undulation breaks mathematical circularity
        float angle = atan(coord.y - center.y, coord.x - center.x);
        float turbulence = sin(angle * 7.0 + time * 3.2) * 0.006 + sin(angle * 13.0 - time * 2.0) * 0.003;
        float distortedDist = dist + turbulence;
        float trailing = distortedDist - time;

        // Active waveband behind the leading shockwave crest
        if (trailing < 0.0 && trailing > -uWaveWidth) {
          float age = -trailing;
          float normAge = age / uWaveWidth; // 0.0 (leading crest) -> 1.0 (trailing tail)
          
          // 2. 315° Directional Sunbeam Glint: highlights crest facing top-left sunlight
          vec2 waveNormal = (dist > 0.0001) ? normalize(coord - center) : vec2(1.0, 0.0);
          vec2 sunDir = normalize(vec2(-0.7071, -0.7071)); // 315° illumination azimuth
          float sunAlignment = max(0.0, dot(waveNormal, -sunDir));
          float directionalFactor = 0.55 + 0.70 * pow(sunAlignment, 1.8);

          // Physical exponential decay
          float decay = exp(-normAge * 3.4);
          float wave = sin(normAge * 3.14159265 * 4.6) * decay;

          // 3. Chromatic Dispersion (Prismatic wave split)
          float dispOffset = 0.016 * (1.0 - normAge);
          float rAge = clamp(normAge + dispOffset, 0.0, 1.0);
          float bAge = clamp(normAge - dispOffset, 0.0, 1.0);
          float rWave = sin(rAge * 3.14159265 * 4.6) * exp(-rAge * 3.4);
          float bWave = sin(bAge * 3.14159265 * 4.6) * exp(-bAge * 3.4);

          // Leading shockwave caustic gleam
          float leadingEdge = smoothstep(0.0, 0.05, normAge) * (1.0 - smoothstep(0.05, 0.28, normAge));
          float glint = leadingEdge * uBoostStrength * 1.7 * directionalFactor;

          // Multi-harmonic ripples with prismatic dispersion
          float rRipples = max(0.0, rWave) * uBoostStrength * 0.95;
          float gRipples = max(0.0, wave)  * uBoostStrength * 0.95;
          float bRipples = max(0.0, bWave) * uBoostStrength * 0.95;

          // 4. Volumetric Caustic Trough Shadow
          float shadow = max(0.0, -wave) * 0.30 * decay;

          // Liquid color synthesis: crystalline white + chromatic dispersion + thematic mineral tint
          vec3 baseWhite = vec3(1.0) * glint;
          vec3 prismaticColor = vec3(rRipples * 1.05, gRipples * 0.98, bRipples * 1.18);
          vec3 mineralGlow = uTint * (glint * 0.45 + gRipples * 0.25);
          vec3 liquidRgb = baseWhite + prismaticColor + mineralGlow;

          // Combined liquid alpha
          float alpha = clamp(glint * 1.2 + gRipples * 0.72 + shadow * 0.45, 0.0, 0.90);

          // Fade out cleanly as the wave clears the viewport perimeter
          float edgeFade = smoothstep(2.6, 1.4, time);
          alpha *= edgeFade;

          gl_FragColor = vec4(liquidRgb, alpha);
        } else {
          gl_FragColor = vec4(0.0);
        }
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
      uProgress: gl.getUniformLocation(prog, 'uProgress'),
      uResolution: gl.getUniformLocation(prog, 'uResolution'),
      uCenter: gl.getUniformLocation(prog, 'uCenter'),
      uWaveFreq: gl.getUniformLocation(prog, 'uWaveFreq'),
      uWaveWidth: gl.getUniformLocation(prog, 'uWaveWidth'),
      uBoostStrength: gl.getUniformLocation(prog, 'uBoostStrength'),
      uTint: gl.getUniformLocation(prog, 'uTint'),
    };

    gl.uniform1f(this.uniforms.uWaveFreq, 28.0);
    gl.uniform1f(this.uniforms.uWaveWidth, 0.46);
    gl.uniform1f(this.uniforms.uBoostStrength, 0.88);
    gl.uniform3f(this.uniforms.uTint, 0.96, 0.92, 0.82);
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
   * Executes the liquid ripple displacement transition from outgoing to incoming view.
   * Originates directly from the clicked button with an authentic ease-in curve.
   * Reveals the real incoming view in real time with zero black screen.
   * 
   * @param {Object} options
   * @param {string} [options.currentView] - Outgoing view key
   * @param {string} [options.nextView] - Incoming view key
   * @param {number} [options.clickX] - Screen X coordinate of clicked button
   * @param {number} [options.clickY] - Screen Y coordinate of clicked button
   * @param {HTMLElement} [options.incomingElement] - Target DOM element being revealed
   * @param {HTMLElement} [options.outgoingElement] - Outgoing DOM element being hidden
   * @param {Function} [options.onComplete] - Callback on transition settlement
   */
  transition({
    currentView = 'chat',
    nextView = 'trips',
    clickX = null,
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

    const mainRect = this.container.getBoundingClientRect();
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    gl.viewport(0, 0, w, h);

    // Calculate exact ripple origin point based on the clicked button
    let originXpx = 0;
    let originYpx = h / 2;

    if (typeof clickX === 'number' && typeof clickY === 'number') {
      // If clicked on sidebar, emerge from the junction with #appMain at the button's vertical center
      if (clickX < mainRect.left) {
        originXpx = 0;
      } else {
        originXpx = Math.max(0, Math.min(w, clickX - mainRect.left));
      }
      originYpx = Math.max(0, Math.min(h, clickY - mainRect.top));
    } else if (typeof clickY === 'number') {
      originXpx = 0;
      originYpx = Math.max(0, Math.min(h, clickY - mainRect.top));
    }

    const originXPercent = originXpx / Math.max(w, 1);
    const originYPercent = originYpx / Math.max(h, 1);

    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uResolution, w, h);
    gl.uniform2f(this.uniforms.uCenter, originXPercent, originYPercent);

    // Thematic mineral water refraction tints per view
    const VIEW_TINTS = {
      chat: [0.96, 0.92, 0.82],      // Sunlit mountain spring (warm amber/sandstone glint)
      trips: [0.30, 0.82, 0.72],     // Glacial alpine stream (pine emerald/teal)
      scrapbook: [0.72, 0.52, 0.95], // Archival mineral spring (twilight amethyst)
      map: [0.28, 0.78, 0.68],       // Cartographic river emerald
      community: [0.98, 0.78, 0.35], // Overland mineral spring (warm gold/amber)
      settings: [0.65, 0.80, 0.92],  // Titanium cool spring
    };
    const tint = VIEW_TINTS[nextView] || VIEW_TINTS.chat;
    gl.uniform3f(this.uniforms.uTint, tint[0], tint[1], tint[2]);

    // Calculate maximum radius to fully clear the viewport
    const maxPixelRadius = Math.hypot(
      Math.max(originXpx, w - originXpx),
      Math.max(originYpx, h - originYpx)
    ) * 1.15;

    const ratio = h / w;
    const maxDist = Math.hypot(
      Math.max(originXPercent, 1.0 - originXPercent),
      Math.max(originYPercent, 1.0 - originYPercent) * ratio
    ) + 0.45;

    // Stack views for seamless in-place liquid reveal
    if (outgoingElement) {
      outgoingElement.style.zIndex = '10';
    }

    if (incomingElement) {
      incomingElement.classList.remove('hidden');
      incomingElement.style.zIndex = '25';
      incomingElement.style.willChange = 'clip-path';
      incomingElement.style.clipPath = `circle(0px at ${originXpx}px ${originYpx}px)`;

      // Ensure splitChatView overlaps seamlessly if incoming
      if (incomingElement.id === 'splitChatView') {
        incomingElement.style.position = 'absolute';
        incomingElement.style.inset = '0';
        incomingElement.style.width = '100%';
        incomingElement.style.height = '100%';
      }
    }

    const DURATION = 840; // ms (slightly faster, responsive & fluid)
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / DURATION, 1.0);

      // Authentic physical ease-in acceleration curve:
      // Starts gently from the button, smoothly gathers momentum, and accelerates across the canvas
      const ease = progress * progress;

      // Expand incoming DOM element with exact circular wavefront
      if (incomingElement) {
        const currentRadius = Math.round(ease * maxPixelRadius);
        incomingElement.style.clipPath = `circle(${currentRadius}px at ${originXpx}px ${originYpx}px)`;
      }

      // Render liquid caustic shockwave in WebGL directly over the boundary
      const currentWaveDist = ease * maxDist;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(this.uniforms.uProgress, currentWaveDist);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (progress < 1.0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Complete transition: clean settlement with zero residual clip-path
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (incomingElement) {
          incomingElement.style.clipPath = '';
          incomingElement.style.willChange = '';
          incomingElement.style.zIndex = '';
          if (incomingElement.id === 'splitChatView') {
            incomingElement.style.position = '';
            incomingElement.style.inset = '';
            incomingElement.style.width = '';
            incomingElement.style.height = '';
          }
        }

        if (outgoingElement && outgoingElement !== incomingElement) {
          outgoingElement.classList.add('hidden');
          outgoingElement.style.zIndex = '';
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
