import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

class ParticleInBox {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.box = null;
    this.particle = null;
    this.controls = null;
    this.energyLevel = 1;
    this.boxDimensions = { width: 2, height: 2, depth: 2 };

    this.trailPoints = [];
    this.maxTrailLength = 100;
    this.coordinatesDisplay = document.getElementById('coordinates');
    this.showModal(); // Show modal on load
    this.init();
    this.setupEventListeners();
    this.animate();
    this.font = null;
    this.loadFont();
  }

  loadFont() {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      this.createAxisLabels();
    });
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('app').appendChild(this.renderer.domElement);

    // Create transparent box with glowing edges
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
    this.box = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    this.box.scale.set(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);
    this.scene.add(this.box);

    // Create particle
    const particleGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.particle = new THREE.Mesh(particleGeometry, particleMaterial);
    this.scene.add(this.particle);

    // Create particle trail
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
    this.trailGeometry = new THREE.BufferGeometry();
    this.trail = new THREE.Line(this.trailGeometry, trailMaterial);
    this.scene.add(this.trail);

    // Add OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
  }

  createAxisLabels() {
    if (!this.font) return;

    const createLabel = (text, color, position, rotation) => {
      const geometry = new TextGeometry(text, {
        font: this.font,
        size: 0.2,
        height: 0.02,
      });
      const material = new THREE.MeshBasicMaterial({ color: color });
      const label = new THREE.Mesh(geometry, material);
      label.position.copy(position);
      label.rotation.copy(rotation);
      this.scene.add(label);
      return label;
    };

    const maxDimension = Math.max(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);

    this.xLabel = createLabel('X', 0xff0000, new THREE.Vector3(maxDimension / 2 + 0.3, 0, 0), new THREE.Euler(0, 0, 0));
    this.yLabel = createLabel('Y', 0x00ff00, new THREE.Vector3(0, maxDimension / 2 + 0.3, 0), new THREE.Euler(0, 0, 0));
    this.zLabel = createLabel('Z', 0x0000ff, new THREE.Vector3(0, 0, maxDimension / 2 + 0.3), new THREE.Euler(0, Math.PI / 2, 0));
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize(), false);
    document.getElementById('energyLevel').addEventListener('change', (e) => this.updateEnergyLevel(e));
    document.getElementById('boxWidth').addEventListener('input', () => this.updateBoxDimensions());
    document.getElementById('boxHeight').addEventListener('input', () => this.updateBoxDimensions());
    document.getElementById('boxDepth').addEventListener('input', () => this.updateBoxDimensions());
    document.getElementById('infoButton').addEventListener('click', () => this.showModal());
    document.getElementById('closeModal').addEventListener('click', () => this.hideModal());
    window.addEventListener('click', (event) => {
      if (event.target === document.getElementById('modal')) {
        this.hideModal();
      }
    });
  }

  showModal() { document.getElementById('modal').style.display = 'block'; }

  hideModal() { document.getElementById('modal').style.display = 'none'; }

  updateEnergyLevel(event) { this.energyLevel = parseInt(event.target.value); }

  updateBoxDimensions() {
    this.boxDimensions.width = parseFloat(document.getElementById('boxWidth').value);
    this.boxDimensions.height = parseFloat(document.getElementById('boxHeight').value);
    this.boxDimensions.depth = parseFloat(document.getElementById('boxDepth').value);

    // Update box geometry
    this.box.scale.set(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);

    // Update label positions
    if (this.xLabel && this.yLabel && this.zLabel) {
      const maxDimension = Math.max(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);
      this.xLabel.position.setX(maxDimension / 2 + 0.3);
      this.yLabel.position.setY(maxDimension / 2 + 0.3);
      this.zLabel.position.setZ(maxDimension / 2 + 0.3);
    }
  }

  getQuantumPosition(t) {
    const { width, height, depth } = this.boxDimensions;
    const nx = this.energyLevel;
    const ny = this.energyLevel;
    const nz = this.energyLevel;

    const x = width * Math.sin(nx * Math.PI * t / width) * Math.sin(ny * Math.PI / height) * Math.sin(nz * Math.PI / depth);
    const y = height * Math.sin(nx * Math.PI / width) * Math.sin(ny * Math.PI * t / height) * Math.sin(nz * Math.PI / depth);
    const z = depth * Math.sin(nx * Math.PI / width) * Math.sin(ny * Math.PI / height) * Math.sin(nz * Math.PI * t / depth);

    return new THREE.Vector3(x, y, z).multiplyScalar(0.5);
  }

  updateParticle(time) {
    const position = this.getQuantumPosition(time);
    this.particle.position.copy(position);

    // Update particle color based on position
    const color = new THREE.Color(
      Math.abs(position.x / this.boxDimensions.width),
      Math.abs(position.y / this.boxDimensions.height),
      Math.abs(position.z / this.boxDimensions.depth)
    );
    this.particle.material.color = color;

    // Update trail
    this.trailPoints.push(position.clone());
    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }
    this.trailGeometry.setFromPoints(this.trailPoints);

    // Update coordinates display
    this.updateCoordinatesDisplay(position);
  }

  updateCoordinatesDisplay(position) { this.coordinatesDisplay.textContent = `X: ${position.x.toFixed(3)} | Y: ${position.y.toFixed(3)} | Z: ${position.z.toFixed(3)}`; }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;
    this.updateParticle(time);
    this.particle.position.copy(this.getQuantumPosition(time));

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Create an instance of the ParticleInBox class
new ParticleInBox();