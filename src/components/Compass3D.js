/**
 * src/components/Compass3D.js — Tactile 3D Antique Surveyor's Field Compass
 *
 * Rendered with Three.js (WebGL PBR) in the sidebar between Settings and Traveler Profile.
 * Features:
 *   - Procedurally generated high-DPI antique astrolabe dial texture
 *   - 3D lathe/cylinder antiqued brass casing with knurled bezel and suspension ring
 *   - 3D faceted magnetic needle with vermilion North and blued-steel South
 *   - Domed glass crystal with physical transmission and specular reflections
 *   - Interactive 3D mouse parallax tilt
 *   - Click-to-flick spring-damped magnetic oscillation physics
 *   - Real geographic bearing synchronization to active destination
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { store } from '../store/state.js';

// Coordinates of destinations and default origin for bearing calculation
const DESTINATION_COORDINATES = {
  ooty:       { lat: 11.4086, lng: 76.7355, name: 'Ooty' },
  goa:        { lat: 15.4989, lng: 73.8322, name: 'Goa' },
  manali:     { lat: 32.2483, lng: 77.1802, name: 'Manali' },
  jaipur:     { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  udaipur:    { lat: 24.5854, lng: 73.7125, name: 'Udaipur' },
  munnar:     { lat: 10.0889, lng: 77.0595, name: 'Munnar' },
  shimla:     { lat: 31.1048, lng: 77.1734, name: 'Shimla' },
  andaman:    { lat: 11.6234, lng: 92.7265, name: 'Andaman' },
  coorg:      { lat: 12.4244, lng: 75.7382, name: 'Coorg' },
  mussoorie:  { lat: 30.4598, lng: 78.0664, name: 'Mussoorie' },
  nainital:   { lat: 29.3803, lng: 79.4636, name: 'Nainital' },
  kodaikanal: { lat: 10.2381, lng: 77.4892, name: 'Kodaikanal' },
  darjeeling: { lat: 27.0410, lng: 88.2663, name: 'Darjeeling' },
  wayanad:    { lat: 11.6854, lng: 76.1320, name: 'Wayanad' },
  gangtok:    { lat: 27.3389, lng: 88.6065, name: 'Gangtok' },
};

// Default departure origin (Delhi)
const DEFAULT_ORIGIN = { lat: 28.6139, lng: 77.2090, name: 'Delhi' };

/**
 * Computes forward azimuth bearing in degrees (0–360) between two coordinates.
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (toDeg(θ) + 360) % 360;
}

/**
 * Returns cardinal direction abbreviation from degrees.
 */
function getCardinalDirection(deg) {
  const cardinals = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const idx = Math.round(((deg % 360) / 22.5));
  return cardinals[idx];
}

/**
 * Procedurally generates a high-frequency linear bump texture for 96 coin-edge knurled bezel teeth.
 */
function createKnurlBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 64);
  const teeth = 96;
  const toothWidth = 512 / teeth;
  for (let i = 0; i < teeth; i++) {
    const x = i * toothWidth;
    const grad = ctx.createLinearGradient(x, 0, x + toothWidth, 0);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#202020');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, toothWidth, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

/**
 * Creates a soft radial contact shadow texture anchoring the compass to the sidebar table.
 */
function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 122);
  grad.addColorStop(0.0, 'rgba(25, 18, 10, 0.60)');
  grad.addColorStop(0.4, 'rgba(25, 18, 10, 0.32)');
  grad.addColorStop(0.75, 'rgba(25, 18, 10, 0.09)');
  grad.addColorStop(1.0, 'rgba(25, 18, 10, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Constructs a 3D faceted surveyor's North spearhead pointer with a raised central diamond spine ridge.
 */
function createFacetedNorthGeo() {
  const positions = [];
  const v = {
    c0: [0, 0, 0.03],
    bL: [-0.14, 0.18, 0.00],
    bR: [0.14, 0.18, 0.00],
    bM: [0, 0.20, 0.06],
    mL: [-0.08, 0.95, 0.00],
    mR: [0.08, 0.95, 0.00],
    mM: [0, 0.95, 0.07],
    sL: [-0.14, 1.15, 0.00],
    sR: [0.14, 1.15, 0.00],
    sM: [0, 1.18, 0.075],
    tip: [0, 1.70, 0.005],
  };

  function addTri(p1, p2, p3) {
    positions.push(...p1, ...p2, ...p3);
  }

  // Left beveled facets (angled towards top-left)
  addTri(v.c0, v.bL, v.bM);
  addTri(v.bL, v.mL, v.bM);
  addTri(v.bM, v.mL, v.mM);
  addTri(v.mL, v.sL, v.mM);
  addTri(v.mM, v.sL, v.sM);
  addTri(v.sL, v.tip, v.sM);

  // Right beveled facets (angled towards top-right)
  addTri(v.c0, v.bM, v.bR);
  addTri(v.bM, v.mR, v.bR);
  addTri(v.bM, v.mM, v.mR);
  addTri(v.mM, v.sM, v.sR);
  addTri(v.mM, v.sR, v.mR);
  addTri(v.sM, v.tip, v.sR);

  // Flat underside plate (z = 0)
  addTri(v.c0, v.bR, v.bL);
  addTri(v.bL, v.bR, v.mL);
  addTri(v.mL, v.bR, v.mR);
  addTri(v.mL, v.mR, v.sL);
  addTri(v.sL, v.mR, v.sR);
  addTri(v.sL, v.sR, v.tip);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Constructs a 3D faceted surveyor's South counterbalance pointer with a raised central diamond spine ridge.
 */
function createFacetedSouthGeo() {
  const positions = [];
  const v = {
    c0: [0, 0, 0.03],
    bL: [-0.13, -0.16, 0.00],
    bR: [0.13, -0.16, 0.00],
    bM: [0, -0.18, 0.05],
    mL: [-0.07, -0.80, 0.00],
    mR: [0.07, -0.80, 0.00],
    mM: [0, -0.80, 0.06],
    tL: [-0.16, -1.25, 0.00],
    tR: [0.16, -1.25, 0.00],
    tM: [0, -1.25, 0.065],
    tip: [0, -1.50, 0.005],
  };

  function addTri(p1, p2, p3) {
    positions.push(...p1, ...p2, ...p3);
  }

  // Left beveled facets
  addTri(v.c0, v.bL, v.bM);
  addTri(v.bL, v.mL, v.bM);
  addTri(v.bM, v.mL, v.mM);
  addTri(v.mL, v.tL, v.mM);
  addTri(v.mM, v.tL, v.tM);
  addTri(v.tL, v.tip, v.tM);

  // Right beveled facets
  addTri(v.c0, v.bM, v.bR);
  addTri(v.bM, v.mR, v.bR);
  addTri(v.bM, v.mM, v.mR);
  addTri(v.mM, v.tM, v.tR);
  addTri(v.mM, v.tR, v.mR);
  addTri(v.tM, v.tip, v.tR);

  // Flat underside plate
  addTri(v.c0, v.bR, v.bL);
  addTri(v.bL, v.bR, v.mL);
  addTri(v.mL, v.bR, v.mR);
  addTri(v.mL, v.mR, v.tL);
  addTri(v.tL, v.mR, v.tR);
  addTri(v.tL, v.tR, v.tip);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Procedurally generates museum-grade high-DPI antique astrolabe dial canvas texture.
 * Replicates 19th-century maritime & surveyor compass artwork from authentic reference pieces:
 * - Aged parchment disc with subtle radial warm vignette
 * - Concentric degree graduation tracks (360 ticks)
 * - Numerals every 10 degrees (10° to 360°)
 * - Iconic 16-point split-facet star (alternating ebony black & aged ivory/brass)
 * - Serif cardinal points (N in rich vermilion with heraldic fleur-de-lis, E/S/W in archival ink)
 * - Central brass spindle collar with needle eyelet
 */
function createCompassDialTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.47;

  // 1. Antique Spun Brass Gradient Base with subtle radial vignette
  const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
  bgGrad.addColorStop(0.00, '#FCE8B2');
  bgGrad.addColorStop(0.50, '#E8CA82');
  bgGrad.addColorStop(0.80, '#D6B567');
  bgGrad.addColorStop(0.96, '#B68D40');
  bgGrad.addColorStop(1.00, '#8E6723');

  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Spun-metal micro lathe concentric grooves
  for (let r = 20; r < radius; r += 4) {
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = r % 8 === 0 ? 'rgba(70, 48, 16, 0.12)' : 'rgba(255, 245, 200, 0.08)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer brass lip shadow
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#4A3414';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#9E7832';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Concentric Degree Calibration Tracks
  const rOuterTrack = radius - 14;
  const rInnerTrack = radius - 52;
  const rDegreeNums = radius - 70;
  const rSubTrack = radius - 88;

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#141210';
  ctx.beginPath();
  ctx.arc(cx, cy, rOuterTrack, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rInnerTrack, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#28221A';
  ctx.beginPath();
  ctx.arc(cx, cy, rSubTrack, 0, Math.PI * 2);
  ctx.stroke();

  // 3. 360 Degree Graduation Ticks
  for (let deg = 0; deg < 360; deg++) {
    const rad = ((deg - 90) * Math.PI) / 180;
    const isCardinal = deg % 90 === 0;
    const isTen = deg % 10 === 0;
    const isFive = deg % 5 === 0;

    let rStart = rOuterTrack - 14;
    let tickWidth = 1.0;
    let strokeColor = 'rgba(50, 40, 30, 0.75)';

    if (isCardinal) {
      rStart = rInnerTrack - 12;
      tickWidth = 3.5;
      strokeColor = '#141210';
    } else if (isTen) {
      rStart = rInnerTrack;
      tickWidth = 2.6;
      strokeColor = '#1A1612';
    } else if (isFive) {
      rStart = rOuterTrack - 22;
      tickWidth = 1.8;
      strokeColor = '#2D241A';
    }

    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    ctx.lineWidth = tickWidth;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(cx + cos * rStart, cy + sin * rStart);
    ctx.lineTo(cx + cos * rOuterTrack, cy + sin * rOuterTrack);
    ctx.stroke();

    // Degree numbers on every 10 degrees (excluding cardinals)
    if (isTen && !isCardinal) {
      const tx = cx + cos * (rDegreeNums - 2);
      const ty = cy + sin * (rDegreeNums - 2);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(rad + Math.PI / 2);
      ctx.font = 'bold 17px "Georgia", "Times New Roman", serif';
      ctx.fillStyle = '#1C1814';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${deg}`, 0, 0);
      ctx.restore();
    }
  }

  // 4. Inner Hairline Sunburst Guide Rays
  const rStarTip = rSubTrack - 18;
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = 'rgba(90, 72, 48, 0.35)';
  for (let i = 0; i < 32; i++) {
    const rad = (i * 11.25 * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * rStarTip, cy + Math.sin(rad) * rStarTip);
    ctx.stroke();
  }

  // Concentric accent rings
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(40, 32, 22, 0.65)';
  ctx.beginPath();
  ctx.arc(cx, cy, 260, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.0;
  ctx.strokeStyle = 'rgba(70, 55, 35, 0.45)';
  ctx.beginPath();
  ctx.arc(cx, cy, 190, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = 'rgba(35, 26, 16, 0.75)';
  ctx.beginPath();
  ctx.arc(cx, cy, 100, 0, Math.PI * 2);
  ctx.stroke();

  // 5. The Iconic 16-Point Split-Facet Wind-Rose Star (References 1, 2, 3, 4)
  // 8 Primary Star Points
  for (let p = 0; p < 8; p++) {
    const tipRad = ((p * 45 - 90) * Math.PI) / 180;
    const midRadNext = ((p * 45 - 90 + 22.5) * Math.PI) / 180;
    const midRadPrev = ((p * 45 - 90 - 22.5) * Math.PI) / 180;

    const rTip = p % 2 === 0 ? rStarTip : rStarTip * 0.78;
    const rMid = rStarTip * 0.32;

    const tx = cx + Math.cos(tipRad) * rTip;
    const ty = cy + Math.sin(tipRad) * rTip;
    const mxNext = cx + Math.cos(midRadNext) * rMid;
    const myNext = cy + Math.sin(midRadNext) * rMid;
    const mxPrev = cx + Math.cos(midRadPrev) * rMid;
    const myPrev = cy + Math.sin(midRadPrev) * rMid;

    // Left half: Deep Ebony Black / Charcoal Ink
    ctx.fillStyle = '#12100E';
    ctx.strokeStyle = '#080706';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(mxPrev, myPrev);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right half: Luminous Polished Brass Facet Highlight
    ctx.fillStyle = '#FBF0CE';
    ctx.strokeStyle = '#382A18';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(mxNext, myNext);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 8 Secondary Intermediate Star Points
  for (let s = 0; s < 8; s++) {
    const tipRad = ((s * 45 - 90 + 22.5) * Math.PI) / 180;
    const midRadNext = ((s * 45 - 90 + 22.5 + 11.25) * Math.PI) / 180;
    const midRadPrev = ((s * 45 - 90 + 22.5 - 11.25) * Math.PI) / 180;

    const rTip = rStarTip * 0.58;
    const rMid = rStarTip * 0.22;

    const tx = cx + Math.cos(tipRad) * rTip;
    const ty = cy + Math.sin(tipRad) * rTip;
    const mxNext = cx + Math.cos(midRadNext) * rMid;
    const myNext = cy + Math.sin(midRadNext) * rMid;
    const mxPrev = cx + Math.cos(midRadPrev) * rMid;
    const myPrev = cy + Math.sin(midRadPrev) * rMid;

    ctx.fillStyle = '#1C1814';
    ctx.strokeStyle = '#080706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(mxPrev, myPrev);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F4E4B9';
    ctx.strokeStyle = '#382A18';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(mxNext, myNext);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 6. Cardinal Serif Typography ('N', 'E', 'S', 'W')
  const rCardinal = rSubTrack + 26;
  ctx.font = 'bold 58px "Georgia", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // North (Rich Vermilion with heraldic fleur-de-lis)
  ctx.fillStyle = '#B91C1C';
  ctx.fillText('N', cx, cy - rCardinal);

  // Fleur-de-lis accent at North tip
  const flY = cy - rOuterTrack + 8;
  ctx.beginPath();
  ctx.moveTo(cx, flY - 16);
  ctx.lineTo(cx - 10, flY + 8);
  ctx.lineTo(cx, flY + 3);
  ctx.lineTo(cx + 10, flY + 8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, flY + 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // East, South, West in deep ebony archival ink
  ctx.fillStyle = '#120F0C';
  ctx.fillText('E', cx + rCardinal, cy);
  ctx.fillText('S', cx, cy + rCardinal);
  ctx.fillText('W', cx - rCardinal, cy);

  // Intercardinals (NE, SE, SW, NW)
  ctx.font = 'bold 26px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = '#372A1C';
  const rInter = rSubTrack + 22;
  const sqrt2 = Math.SQRT1_2;
  ctx.fillText('NE', cx + rInter * sqrt2, cy - rInter * sqrt2);
  ctx.fillText('SE', cx + rInter * sqrt2, cy + rInter * sqrt2);
  ctx.fillText('SW', cx - rInter * sqrt2, cy + rInter * sqrt2);
  ctx.fillText('NW', cx - rInter * sqrt2, cy - rInter * sqrt2);

  // 7. Central Brass Spindle Ring (with open center for 3D needle boss)
  ctx.fillStyle = '#B48E46';
  ctx.strokeStyle = '#463416';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D7AF5F';
  ctx.strokeStyle = '#826228';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EEC47A';
  ctx.strokeStyle = '#5A441C';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Center socket hole
  ctx.fillStyle = '#23180C';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export class Compass3D {
  constructor(containerId = 'sidebarCompassCanvasContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.needleGroup = null;
    this.compassGroup = null;
    this.animId = null;

    // Orientation & Physics state
    this.targetRotX = 0.28; // Default resting pitch
    this.targetRotY = 0;
    this.currentRotX = 0.28;
    this.currentRotY = 0;

    this.needleTargetAngle = 0; // In radians (0 = North)
    this.needleCurrentAngle = 0;
    this.needleAngularVelocity = 0;
    this.isHovered = false;
    this.isSpinning = false;

    // Active destination telemetry
    this.activeDestination = null;
    this.activeBearing = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 180;
    const height = this.container.clientHeight || 160;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (perspective with tight FOV for tactile tabletop look)
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    this.camera.position.set(0, 0.05, 8.0);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Meshes
    this.buildCompassModel();

    // 6. Interaction listeners
    this.bindEvents();

    // 7. Subscribe to global store for destination updates
    this.syncWithTripState();

    // 8. Start 60fps render loop
    this.render = this.render.bind(this);
    this.render();
  }

  setupLighting() {
    // 1. IBL RoomEnvironment for realistic PBR metal & glass reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 2. Balanced warm ambient light
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.90);
    this.scene.add(ambientLight);

    // 3. Key directional sunlight (warm golden glints on brass and faceted needle)
    const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.4);
    keyLight.position.set(3.6, 4.8, 5.0);
    this.scene.add(keyLight);

    // 4. Cool sky fill light for shadow contrast
    const fillLight = new THREE.DirectionalLight(0xb4d2ee, 0.50);
    fillLight.position.set(-3.2, -2.4, 2.5);
    this.scene.add(fillLight);

    // 5. Specular rim glint catching the crystal dome and coin-edge bezel
    const rimLight = new THREE.PointLight(0xffe49e, 1.3, 14);
    rimLight.position.set(0.4, 3.0, 3.2);
    this.scene.add(rimLight);
  }

  buildCompassModel() {
    this.compassGroup = new THREE.Group();
    // Center and scale so the top suspension ring and case fit with generous framing
    this.compassGroup.scale.set(0.80, 0.80, 0.80);
    this.compassGroup.position.set(0, -0.24, 0);

    // 0. Soft Tabletop Contact Shadow beneath compass
    const groundShadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const groundShadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const groundShadowMesh = new THREE.Mesh(groundShadowGeo, groundShadowMat);
    groundShadowMesh.position.set(0, -0.28, -0.32);
    this.compassGroup.add(groundShadowMesh);

    // PBR Antique Brass Materials (with high metalness reflecting the room environment!)
    const brassCaseMaterial = new THREE.MeshStandardMaterial({
      color: 0xB8934A,
      roughness: 0.28,
      metalness: 0.92,
    });

    const brassPolishedMaterial = new THREE.MeshStandardMaterial({
      color: 0xE2BA58,
      roughness: 0.18,
      metalness: 0.95,
    });

    const darkBrassMaterial = new THREE.MeshStandardMaterial({
      color: 0x5C421E,
      roughness: 0.38,
      metalness: 0.86,
    });

    // 1. Heavy Outer Base Casing (Hollowed Chamber floor at z = 0.00)
    const baseGeo = new THREE.CylinderGeometry(2.20, 2.08, 0.44, 64);
    const baseMesh = new THREE.Mesh(baseGeo, brassCaseMaterial);
    baseMesh.rotation.x = Math.PI / 2;
    baseMesh.position.z = -0.22;
    this.compassGroup.add(baseMesh);

    // 2. Deep Inner Brass Chamber (Rehaut / Chapter Ring Wall - References 2 & 4)
    const rehautGeo = new THREE.CylinderGeometry(2.01, 2.01, 0.22, 64, 1, true);
    const rehautMat = new THREE.MeshStandardMaterial({
      color: 0x947234,
      roughness: 0.22,
      metalness: 0.92,
      side: THREE.DoubleSide,
    });
    const rehautMesh = new THREE.Mesh(rehautGeo, rehautMat);
    rehautMesh.rotation.x = Math.PI / 2;
    rehautMesh.position.z = 0.11;
    this.compassGroup.add(rehautMesh);

    // 3a. Fluted Coin-Edge Knurled Bezel Track with 96 Milled Teeth (References 3 & 4)
    const knurlGeo = new THREE.CylinderGeometry(2.14, 2.14, 0.05, 96, 1, true);
    const knurlMat = new THREE.MeshStandardMaterial({
      color: 0xB8934A,
      roughness: 0.35,
      metalness: 0.92,
      bumpMap: createKnurlBumpTexture(),
      bumpScale: 0.045,
    });
    const knurlMesh = new THREE.Mesh(knurlGeo, knurlMat);
    knurlMesh.rotation.x = Math.PI / 2;
    knurlMesh.position.z = 0.20;
    this.compassGroup.add(knurlMesh);

    // 3b. Stepped Polished Top Rim (References 1 & 3)
    const outerRimGeo = new THREE.TorusGeometry(2.18, 0.08, 16, 64);
    const outerRimMesh = new THREE.Mesh(outerRimGeo, brassPolishedMaterial);
    outerRimMesh.position.z = 0.22;
    this.compassGroup.add(outerRimMesh);

    const innerRimGeo = new THREE.TorusGeometry(2.02, 0.045, 16, 64);
    const innerRimMesh = new THREE.Mesh(innerRimGeo, darkBrassMaterial);
    innerRimMesh.position.z = 0.23;
    this.compassGroup.add(innerRimMesh);

    // 4. Antique Pocket Watch Suspension Pendant (References 1, 2, 3, 4, 5)
    const ringGroup = new THREE.Group();

    // 4a. Neck mount collar attached to casing
    const mountGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.24, 24);
    const mountMesh = new THREE.Mesh(mountGeo, darkBrassMaterial);
    mountMesh.position.y = 2.24;
    mountMesh.position.z = 0.02;
    mountMesh.rotation.x = Math.PI / 2;
    ringGroup.add(mountMesh);

    // 4b. Spherical Swivel Knuckle Bead
    const beadGeo = new THREE.SphereGeometry(0.20, 24, 24);
    const beadMesh = new THREE.Mesh(beadGeo, brassPolishedMaterial);
    beadMesh.position.y = 2.48;
    beadMesh.position.z = 0.06;
    ringGroup.add(beadMesh);

    // 4c. Lateral Hinge Pin Studs
    const pinGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.46, 16);
    const pinMesh = new THREE.Mesh(pinGeo, darkBrassMaterial);
    pinMesh.position.y = 2.48;
    pinMesh.position.z = 0.06;
    pinMesh.rotation.z = Math.PI / 2;
    ringGroup.add(pinMesh);

    // 4d. Heavy Hinged Antique Brass Suspension Bow (Pocket Watch Ring)
    const loopGeo = new THREE.TorusGeometry(0.50, 0.075, 20, 48);
    const loopMesh = new THREE.Mesh(loopGeo, brassPolishedMaterial);
    loopMesh.position.y = 2.86;
    loopMesh.position.z = 0.14;
    loopMesh.rotation.x = 0.22; // Tilted forward towards viewer
    ringGroup.add(loopMesh);
    this.compassGroup.add(ringGroup);

    // 5. Dial Face with Texture (Museum-grade HD vintage dial with procedural fallback)
    const dialGeo = new THREE.CircleGeometry(2.0, 64);
    const fallbackTex = createCompassDialTexture();
    const dialMat = new THREE.MeshStandardMaterial({
      map: fallbackTex,
      roughness: 0.32,
      metalness: 0.70,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/images/compass_dial_vintage_hd.png',
      (hdTex) => {
        hdTex.colorSpace = THREE.SRGBColorSpace;
        hdTex.anisotropy = 8;
        dialMat.map = hdTex;
        dialMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('[Compass3D] Using procedural dial texture fallback:', err);
      }
    );

    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.position.z = 0.01; // Sits on top of the base floor, recessed inside the chamber
    this.compassGroup.add(dialMesh);

    // 6. 3D Antique Magnetic Needle Assembly (References 2 & 4)
    this.needleGroup = new THREE.Group();
    this.needleGroup.position.z = 0.14;

    // 6a. North Pointer: True 3D Faceted Diamond-Ridge Spearhead in Rich Vermilion
    const northGeo = createFacetedNorthGeo();
    const northMat = new THREE.MeshStandardMaterial({
      color: 0xC5221F, // Deep vermilion enamel
      roughness: 0.22,
      metalness: 0.80,
    });
    const northMesh = new THREE.Mesh(northGeo, northMat);
    this.needleGroup.add(northMesh);

    // 6b. South Pointer: True 3D Faceted Blued Steel Counterbalance Arrow
    const southGeo = createFacetedSouthGeo();
    const southMat = new THREE.MeshStandardMaterial({
      color: 0x1A2D44, // Authentic blued-steel
      roughness: 0.16,
      metalness: 0.92,
    });
    const southMesh = new THREE.Mesh(southGeo, southMat);
    this.needleGroup.add(southMesh);

    // 6c. Brass Pivot Boss & Knurled Spindle Nut (References 3 & 4)
    const pivotCollarGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.10, 32);
    const pivotCollarMesh = new THREE.Mesh(pivotCollarGeo, brassPolishedMaterial);
    pivotCollarMesh.rotation.x = Math.PI / 2;
    pivotCollarMesh.position.z = 0.04;
    this.needleGroup.add(pivotCollarMesh);

    const spindleNutGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 24);
    const spindleNutMesh = new THREE.Mesh(spindleNutGeo, darkBrassMaterial);
    spindleNutMesh.rotation.x = Math.PI / 2;
    spindleNutMesh.position.z = 0.09;
    this.needleGroup.add(spindleNutMesh);

    // Center Ruby Bearing Jewel
    const rubyGeo = new THREE.SphereGeometry(0.08, 24, 24);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0x991B1B,
      roughness: 0.05,
      metalness: 0.15,
    });
    const rubyMesh = new THREE.Mesh(rubyGeo, rubyMat);
    rubyMesh.position.z = 0.14;
    this.needleGroup.add(rubyMesh);

    // 6d. Realistic Needle Drop Shadow Cast onto Recessed Dial Bed
    const shadowGeo = new THREE.PlaneGeometry(0.28, 3.1);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x120D08,
      transparent: true,
      opacity: 0.28,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(-0.06, -0.06, -0.11);
    this.needleGroup.add(shadowMesh);

    this.compassGroup.add(this.needleGroup);

    // 7. Protective Domed Glass Crystal (References 2 & 4)
    const glassGeo = new THREE.SphereGeometry(2.02, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.24);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.02,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transmission: 0.70,
      ior: 1.52,
      reflectivity: 0.95,
      specularColor: 0xfff6ea,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.z = 0.22;
    this.compassGroup.add(glassMesh);

    this.scene.add(this.compassGroup);
  }

  bindEvents() {
    // 3D Parallax Tilt on Pointer Move
    const onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      this.isHovered = true;
      // Clamp tilt angles to subtle 3D perspective
      this.targetRotX = 0.28 - y * 0.32;
      this.targetRotY = x * 0.38;
    };

    const onPointerLeave = () => {
      this.isHovered = false;
      this.targetRotX = 0.28;
      this.targetRotY = 0;
    };

    // Flick & Spin Needle on Click
    const onPointerDown = () => {
      this.flickNeedle();
    };

    this.container.addEventListener('pointermove', onPointerMove);
    this.container.addEventListener('pointerleave', onPointerLeave);
    this.container.addEventListener('pointerdown', onPointerDown);

    // Responsive Canvas Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth || 180;
      const h = this.container.clientHeight || 160;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    resizeObserver.observe(this.container);

    this._cleanupEvents = () => {
      this.container.removeEventListener('pointermove', onPointerMove);
      this.container.removeEventListener('pointerleave', onPointerLeave);
      this.container.removeEventListener('pointerdown', onPointerDown);
      resizeObserver.disconnect();
    };
  }

  /**
   * Imparts a physical impulse flick to the magnetic needle.
   */
  flickNeedle() {
    // Strong initial spin velocity with random direction
    const impulse = (Math.random() * 8 + 6) * (Math.random() > 0.5 ? 1 : -1);
    this.needleAngularVelocity += impulse;
    this.isSpinning = true;

    // Visual tactile click scale bump
    if (this.compassGroup) {
      this.compassGroup.scale.set(0.96, 0.96, 0.96);
      setTimeout(() => {
        if (this.compassGroup) this.compassGroup.scale.set(1, 1, 1);
      }, 120);
    }
  }

  /**
   * Listens to global store for travel destination changes.
   */
  syncWithTripState() {
    const updateBearing = () => {
      const state = store.getState();
      const destRaw = state.trip?.destination;
      const headingEl = document.getElementById('compassHeadingLabel');

      if (!destRaw) {
        this.activeDestination = null;
        this.needleTargetAngle = 0; // True North
        if (headingEl) headingEl.textContent = 'True North 000°';
        return;
      }

      const destKey = String(destRaw).trim().toLowerCase();
      const coord = DESTINATION_COORDINATES[destKey];

      if (coord) {
        this.activeDestination = coord.name;
        const bearing = calculateBearing(
          DEFAULT_ORIGIN.lat,
          DEFAULT_ORIGIN.lng,
          coord.lat,
          coord.lng
        );
        this.activeBearing = Math.round(bearing);
        const card = getCardinalDirection(this.activeBearing);

        // Convert compass bearing (0 = North clockwise) to Three.js rotation (Z-axis counter-clockwise)
        this.needleTargetAngle = -((this.activeBearing * Math.PI) / 180);

        if (headingEl) {
          headingEl.textContent = `${coord.name.toUpperCase()} ${String(this.activeBearing).padStart(3, '0')}° ${card}`;
        }
      } else {
        this.needleTargetAngle = 0;
        if (headingEl) headingEl.textContent = `${String(destRaw).toUpperCase()} · ORIENTING`;
      }
    };

    // Run initial sync
    updateBearing();

    // Subscribe to future state changes
    store.subscribe('trip', updateBearing);
  }

  /**
   * 60 FPS Render & Physics Loop
   */
  render() {
    this.animId = requestAnimationFrame(this.render);

    // 1. Smooth Damped Tabletop Parallax Tilt
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.08;
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.08;

    if (this.compassGroup) {
      this.compassGroup.rotation.x = this.currentRotX;
      this.compassGroup.rotation.y = this.currentRotY;
    }

    // 2. Magnetic Needle Physics Simulation
    if (this.needleGroup) {
      // Natural magnetic micro-tremor when resting
      const microTremor = Math.sin(Date.now() * 0.003) * 0.015;
      const target = this.needleTargetAngle + microTremor;

      // Spring-damped harmonic oscillation
      const deltaAngle = target - this.needleCurrentAngle;
      const springForce = deltaAngle * 0.08;

      this.needleAngularVelocity += springForce;
      this.needleAngularVelocity *= 0.91; // Air damping friction

      this.needleCurrentAngle += this.needleAngularVelocity;
      this.needleGroup.rotation.z = this.needleCurrentAngle;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Clean memory disposal
   */
  dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this._cleanupEvents) this._cleanupEvents();

    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
