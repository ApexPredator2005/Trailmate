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
 * Procedurally generates high-DPI antique astrolabe dial canvas texture.
 */
function createCompassDialTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  // 1. Aged Parchment Gradient Base
  const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
  bgGrad.addColorStop(0.00, '#FCF8EE');
  bgGrad.addColorStop(0.65, '#F5EDE0');
  bgGrad.addColorStop(0.88, '#EAE0CF');
  bgGrad.addColorStop(1.00, '#DACFBC');

  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Vintage Concentric Rings
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#8C6D37';
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#A38146';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#BBA06B';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 38, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 70, 0, Math.PI * 2);
  ctx.stroke();

  // 3. 360 Degree Ticks
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    const isCardinal = i % 90 === 0;
    const isMajor = i % 30 === 0;
    const isMedium = i % 10 === 0;
    const isFive = i % 5 === 0;

    const rOuter = radius - 8;
    let rInner = radius - 18;

    if (isCardinal) {
      rInner = radius - 34;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#6E4E20';
    } else if (isMajor) {
      rInner = radius - 30;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#7D5A27';
    } else if (isMedium) {
      rInner = radius - 24;
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#997339';
    } else if (isFive) {
      rInner = radius - 18;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#B39154';
    } else {
      rInner = radius - 13;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = '#C9AA72';
    }

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(cx + cos * rInner, cy + sin * rInner);
    ctx.lineTo(cx + cos * rOuter, cy + sin * rOuter);
    ctx.stroke();

    // Degree numbers on major 30-deg marks
    if (isMajor && !isCardinal) {
      const textR = radius - 52;
      const tx = cx + Math.cos(angle) * textR;
      const ty = cy + Math.sin(angle) * textR;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(angle + Math.PI / 2);
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = '#6E4E20';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Compass angles standard: 0 at top
      const compassDeg = (i + 90) % 360;
      ctx.fillText(`${compassDeg}°`, 0, 0);
      ctx.restore();
    }
  }

  // 4. Astrolabe 8-Pointed Star in Center
  const innerR = radius - 80;
  const starPoints = 8;
  ctx.save();
  for (let s = 0; s < starPoints; s++) {
    const starAngle = (s * Math.PI * 2) / starPoints - Math.PI / 2;
    const nextAngle = ((s + 0.5) * Math.PI * 2) / starPoints - Math.PI / 2;

    const tipX = cx + Math.cos(starAngle) * innerR;
    const tipY = cy + Math.sin(starAngle) * innerR;
    const midX = cx + Math.cos(nextAngle) * (innerR * 0.38);
    const midY = cy + Math.sin(nextAngle) * (innerR * 0.38);

    // Left half facet (dark)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fillStyle = s % 2 === 0 ? '#9E783B' : '#7A5B27';
    ctx.fill();

    // Right half facet (light)
    const prevMidAngle = ((s - 0.5) * Math.PI * 2) / starPoints - Math.PI / 2;
    const prevMidX = cx + Math.cos(prevMidAngle) * (innerR * 0.38);
    const prevMidY = cy + Math.sin(prevMidAngle) * (innerR * 0.38);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(prevMidX, prevMidY);
    ctx.closePath();
    ctx.fillStyle = s % 2 === 0 ? '#CDB179' : '#B8995C';
    ctx.fill();
  }
  ctx.restore();

  // 5. Victorian Cardinal Lettering
  ctx.font = 'bold 54px "Noto Serif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // North (Vermilion with Fleur-de-lis accent)
  ctx.fillStyle = '#C2410C';
  ctx.fillText('N', cx, cy - radius + 55);

  // South, East, West (Rich antique ink)
  ctx.fillStyle = '#1C1C19';
  ctx.fillText('S', cx, cy + radius - 55);
  ctx.fillText('E', cx + radius - 55, cy);
  ctx.fillText('W', cx - radius + 55, cy);

  // Subtle inter-cardinals (NE, SE, SW, NW)
  ctx.font = 'bold 26px "Noto Serif", serif';
  ctx.fillStyle = '#6E532D';
  const icDist = radius - 58;
  const sqrt2 = Math.SQRT1_2;
  ctx.fillText('NE', cx + icDist * sqrt2, cy - icDist * sqrt2);
  ctx.fillText('SE', cx + icDist * sqrt2, cy + icDist * sqrt2);
  ctx.fillText('SW', cx - icDist * sqrt2, cy + icDist * sqrt2);
  ctx.fillText('NW', cx - icDist * sqrt2, cy - icDist * sqrt2);

  // 6. Fleur-de-lis arrow at North
  ctx.fillStyle = '#C2410C';
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius + 14);
  ctx.lineTo(cx - 9, cy - radius + 28);
  ctx.lineTo(cx, cy - radius + 24);
  ctx.lineTo(cx + 9, cy - radius + 28);
  ctx.closePath();
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
    const height = this.container.clientHeight || 140;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (perspective with tight FOV for tactile tabletop look)
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, -0.4, 6.2);
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
    this.renderer.toneMappingExposure = 1.15;
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
    // Warm ambient light
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.6);
    this.scene.add(ambientLight);

    // Primary warm sunlight (catches brass bevels)
    const keyLight = new THREE.DirectionalLight(0xfffaea, 2.8);
    keyLight.position.set(3, 4, 5);
    this.scene.add(keyLight);

    // Secondary cool sky reflection
    const fillLight = new THREE.DirectionalLight(0x90b0d8, 0.9);
    fillLight.position.set(-3, -2, 2.5);
    this.scene.add(fillLight);

    // Specular rim light (catches glass dome curvature)
    const rimLight = new THREE.PointLight(0xffd17a, 1.4, 10);
    rimLight.position.set(0, 3, 2);
    this.scene.add(rimLight);
  }

  buildCompassModel() {
    this.compassGroup = new THREE.Group();

    // PBR Antique Brass Materials
    const brassCaseMaterial = new THREE.MeshStandardMaterial({
      color: 0xC5A059,
      roughness: 0.32,
      metalness: 0.88,
    });

    const brassPolishedMaterial = new THREE.MeshStandardMaterial({
      color: 0xE6C163,
      roughness: 0.22,
      metalness: 0.92,
    });

    const darkBrassMaterial = new THREE.MeshStandardMaterial({
      color: 0x7A5B27,
      roughness: 0.45,
      metalness: 0.80,
    });

    // 1. Heavy Base Casing
    const baseGeo = new THREE.CylinderGeometry(2.10, 1.96, 0.38, 48);
    const baseMesh = new THREE.Mesh(baseGeo, brassCaseMaterial);
    baseMesh.rotation.x = Math.PI / 2;
    this.compassGroup.add(baseMesh);

    // 2. Beveled Knurled Rim
    const rimGeo = new THREE.TorusGeometry(2.12, 0.09, 16, 56);
    const rimMesh = new THREE.Mesh(rimGeo, brassPolishedMaterial);
    rimMesh.position.z = 0.16;
    this.compassGroup.add(rimMesh);

    // 3. Antique Pocket Watch Suspension Loop (at top/North)
    const ringGroup = new THREE.Group();
    const loopGeo = new THREE.TorusGeometry(0.42, 0.065, 16, 32);
    const loopMesh = new THREE.Mesh(loopGeo, brassPolishedMaterial);
    loopMesh.position.y = 2.45;
    ringGroup.add(loopMesh);

    const mountGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16);
    const mountMesh = new THREE.Mesh(mountGeo, darkBrassMaterial);
    mountMesh.position.y = 2.15;
    mountMesh.rotation.x = Math.PI / 2;
    ringGroup.add(mountMesh);
    this.compassGroup.add(ringGroup);

    // 4. Dial Face with Texture (Stitch-generated authentic horology dial with procedural fallback)
    const dialGeo = new THREE.CircleGeometry(1.98, 48);
    const fallbackTex = createCompassDialTexture();
    const dialMat = new THREE.MeshStandardMaterial({
      map: fallbackTex,
      roughness: 0.55,
      metalness: 0.10,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/images/compass_dial_texture.png',
      (stitchTex) => {
        stitchTex.colorSpace = THREE.SRGBColorSpace;
        stitchTex.anisotropy = 4;
        dialMat.map = stitchTex;
        dialMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('[Compass3D] Using procedural dial texture:', err);
      }
    );

    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.position.z = 0.12;
    this.compassGroup.add(dialMesh);

    // 5. 3D Magnetic Needle Assembly
    this.needleGroup = new THREE.Group();
    this.needleGroup.position.z = 0.18;

    // 5a. North Pointer (Vermilion Faceted Diamond)
    const northShape = new THREE.Shape();
    northShape.moveTo(0, 0);
    northShape.lineTo(-0.16, 0.10);
    northShape.lineTo(0, 1.55);
    northShape.lineTo(0.16, 0.10);
    northShape.closePath();

    const northExtrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.03,
    };
    const northGeo = new THREE.ExtrudeGeometry(northShape, northExtrudeSettings);
    const northMat = new THREE.MeshStandardMaterial({
      color: 0xC2410C,
      roughness: 0.28,
      metalness: 0.40,
    });
    const northMesh = new THREE.Mesh(northGeo, northMat);
    this.needleGroup.add(northMesh);

    // 5b. South Pointer (Blued Steel Faceted Diamond)
    const southShape = new THREE.Shape();
    southShape.moveTo(0, 0);
    southShape.lineTo(-0.16, -0.10);
    southShape.lineTo(0, -1.45);
    southShape.lineTo(0.16, -0.10);
    southShape.closePath();

    const southExtrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.03,
    };
    const southGeo = new THREE.ExtrudeGeometry(southShape, southExtrudeSettings);
    const southMat = new THREE.MeshStandardMaterial({
      color: 0x1E3A5F,
      roughness: 0.22,
      metalness: 0.85,
    });
    const southMesh = new THREE.Mesh(southGeo, southMat);
    this.needleGroup.add(southMesh);

    // 5c. Brass Pivot Boss & Gem Bearing
    const pivotGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 24);
    const pivotMat = brassPolishedMaterial;
    const pivotMesh = new THREE.Mesh(pivotGeo, pivotMat);
    pivotMesh.rotation.x = Math.PI / 2;
    pivotMesh.position.z = 0.04;
    this.needleGroup.add(pivotMesh);

    const rubyGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0x991B1B,
      roughness: 0.15,
      metalness: 0.10,
    });
    const rubyMesh = new THREE.Mesh(rubyGeo, rubyMat);
    rubyMesh.position.z = 0.11;
    this.needleGroup.add(rubyMesh);

    // 5d. Needle Subtle Drop Shadow on Dial
    const shadowGeo = new THREE.PlaneGeometry(0.24, 2.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.z = -0.04;
    this.needleGroup.add(shadowMesh);

    this.compassGroup.add(this.needleGroup);

    // 6. Protective Domed Glass Crystal
    const glassGeo = new THREE.SphereGeometry(2.02, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.26);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.52,
      reflectivity: 0.75,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.z = 0.14;
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
      const h = this.container.clientHeight || 140;
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
