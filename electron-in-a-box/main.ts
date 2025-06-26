import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader';

interface BoxDimensions {
  width: number;
  height: number;
  depth: number;
}

class ParticleInBox {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private box: THREE.LineSegments | null = null;
  private particle: THREE.Mesh | null = null;
  private controls: OrbitControls | null = null;
  private energyLevel: number = 1;
  private boxDimensions: BoxDimensions = { width: 2, height: 2, depth: 2 };
  
  private trailPoints: THREE.Vector3[] = [];
  private maxTrailLength: number = 100;
  private coordinatesDisplay: HTMLElement;
  private font: Font | null = null;
  private trailGeometry: THREE.BufferGeometry;
  private trail: THREE.Line;
  private xLabel: THREE.Mesh | null = null;
  private yLabel: THREE.Mesh | null = null;
  private zLabel: THREE.Mesh | null = null;

  constructor() {
    this.coordinatesDisplay = document.getElementById('coordinates')!;
    this.trailGeometry = new THREE.BufferGeometry();
    this.trail = new THREE.Line(this.trailGeometry, new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 }));
    
    this.showModal(); // Show modal on load
    this.init();
    this.setupEventListeners();
    this.animate();
    this.loadFont();
  }

  private loadFont(): void {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font: Font) => {
      this.font = font;
      this.createAxisLabels();
    });
  }

  private init(): void {
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
    document.getElementById('app')!.appendChild(this.renderer.domElement);

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

  private createAxisLabels(): void {
    if (!this.font || !this.scene) return;

    const createLabel = (text: string, color: number, position: THREE.Vector3, rotation: THREE.Euler): THREE.Mesh => {
      const geometry = new TextGeometry(text, {
        font: this.font!,
        size: 0.2,
        height: 0.02,
      });
      const material = new THREE.MeshBasicMaterial({ color: color });
      const label = new THREE.Mesh(geometry, material);
      label.position.copy(position);
      label.rotation.copy(rotation);
      this.scene!.add(label);
      return label;
    };

    const maxDimension = Math.max(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);

    this.xLabel = createLabel('X', 0xff0000, new THREE.Vector3(maxDimension / 2 + 0.3, 0, 0), new THREE.Euler(0, 0, 0));
    this.yLabel = createLabel('Y', 0x00ff00, new THREE.Vector3(0, maxDimension / 2 + 0.3, 0), new THREE.Euler(0, 0, 0));
    this.zLabel = createLabel('Z', 0x0000ff, new THREE.Vector3(0, 0, maxDimension / 2 + 0.3), new THREE.Euler(0, Math.PI / 2, 0));
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.onWindowResize(), false);
    
    const energyLevelInput = document.getElementById('energyLevel') as HTMLInputElement;
    energyLevelInput.addEventListener('change', (e) => this.updateEnergyLevel(e));
    
    document.getElementById('boxWidth')!.addEventListener('input', () => this.updateBoxDimensions());
    document.getElementById('boxHeight')!.addEventListener('input', () => this.updateBoxDimensions());
    document.getElementById('boxDepth')!.addEventListener('input', () => this.updateBoxDimensions());
    document.getElementById('infoButton')!.addEventListener('click', () => this.showModal());
    document.getElementById('closeModal')!.addEventListener('click', () => this.hideModal());
    
    window.addEventListener('click', (event: MouseEvent) => {
      if (event.target === document.getElementById('modal')) {
        this.hideModal();
      }
    });
  }

  private showModal(): void { 
    const modal = document.getElementById('modal')!;
    modal.style.display = 'block'; 
  }

  private hideModal(): void { 
    const modal = document.getElementById('modal')!;
    modal.style.display = 'none'; 
  }

  private updateEnergyLevel(event: Event): void { 
    const target = event.target as HTMLInputElement;
    this.energyLevel = parseInt(target.value); 
  }

  private updateBoxDimensions(): void {
    const boxWidthInput = document.getElementById('boxWidth') as HTMLInputElement;
    const boxHeightInput = document.getElementById('boxHeight') as HTMLInputElement;
    const boxDepthInput = document.getElementById('boxDepth') as HTMLInputElement;
    
    this.boxDimensions.width = parseFloat(boxWidthInput.value);
    this.boxDimensions.height = parseFloat(boxHeightInput.value);
    this.boxDimensions.depth = parseFloat(boxDepthInput.value);

    // Update box geometry
    if (this.box) {
      this.box.scale.set(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);
    }

    // Update label positions
    if (this.xLabel && this.yLabel && this.zLabel) {
      const maxDimension = Math.max(this.boxDimensions.width, this.boxDimensions.height, this.boxDimensions.depth);
      this.xLabel.position.setX(maxDimension / 2 + 0.3);
      this.yLabel.position.setY(maxDimension / 2 + 0.3);
      this.zLabel.position.setZ(maxDimension / 2 + 0.3);
    }
  }

  private getQuantumPosition(t: number): THREE.Vector3 {
    const { width, height, depth } = this.boxDimensions;
    const nx = this.energyLevel;
    const ny = this.energyLevel;
    const nz = this.energyLevel;

    const x = width * Math.sin(nx * Math.PI * t / width) * Math.sin(ny * Math.PI / height) * Math.sin(nz * Math.PI / depth);
    const y = height * Math.sin(nx * Math.PI / width) * Math.sin(ny * Math.PI * t / height) * Math.sin(nz * Math.PI / depth);
    const z = depth * Math.sin(nx * Math.PI / width) * Math.sin(ny * Math.PI / height) * Math.sin(nz * Math.PI * t / depth);

    return new THREE.Vector3(x, y, z).multiplyScalar(0.5);
  }

  private updateParticle(time: number): void {
    if (!this.particle) return;
    
    const position = this.getQuantumPosition(time);
    this.particle.position.copy(position);

    // Update particle color based on position
    const color = new THREE.Color(
      Math.abs(position.x / this.boxDimensions.width),
      Math.abs(position.y / this.boxDimensions.height),
      Math.abs(position.z / this.boxDimensions.depth)
    );
    (this.particle.material as THREE.MeshBasicMaterial).color = color;

    // Update trail
    this.trailPoints.push(position.clone());
    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }
    this.trailGeometry.setFromPoints(this.trailPoints);

    // Update coordinates display
    this.updateCoordinatesDisplay(position);
  }

  private updateCoordinatesDisplay(position: THREE.Vector3): void { 
    this.coordinatesDisplay.textContent = `X: ${position.x.toFixed(3)} | Y: ${position.y.toFixed(3)} | Z: ${position.z.toFixed(3)}`; 
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;
    this.updateParticle(time);
    
    if (this.particle) {
      this.particle.position.copy(this.getQuantumPosition(time));
    }

    if (this.controls) {
      this.controls.update();
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Create an instance of the ParticleInBox class
new ParticleInBox();