interface BoxSize {
  width: number;
  height: number;
  depth: number;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface ControlConfig {
  slider: string;
  value: string;
  prop: keyof BoxSize;
}

class SimpleElectronBox {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private energy: number;
  private boxSize: BoxSize;
  private particle: THREE.Mesh | null;
  private box: THREE.LineSegments | null;
  private trail: THREE.Mesh[];
  private maxTrailLength: number;
  private time: number;

  constructor() {
    // Core components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Quantum state
    this.energy = 1;
    this.boxSize = { width: 2, height: 2, depth: 2 };
    
    // Visual elements
    this.particle = null;
    this.box = null;
    this.trail = [];
    this.maxTrailLength = 50;
    
    // Animation
    this.time = 0;
    
    this.init();
    this.setupControls();
    this.animate();
  }
  
  private init(): void {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x111111);
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.appendChild(this.renderer.domElement);
    }
    
    // Setup camera
    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(0, 0, 0);
    
    // Add lighting
    const light = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Create box
    this.createBox();
    
    // Create particle
    this.createParticle();
    
    // Mouse controls (simple orbit)
    this.setupMouseControls();
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  private createBox(): void {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 2 
    });
    
    this.box = new THREE.LineSegments(edges, lineMaterial);
    this.updateBoxScale();
    this.scene.add(this.box);
  }
  
  private createParticle(): void {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0xff4444,
      transparent: true,
      opacity: 0.8
    });
    
    this.particle = new THREE.Mesh(geometry, material);
    this.scene.add(this.particle);
  }
  
  private setupMouseControls(): void {
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let currentRotationX = 0, currentRotationY = 0;
    
    this.renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    this.renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
  }
  
  private setupControls(): void {
    // Energy control
    const energySlider = document.getElementById('energy') as HTMLInputElement;
    const energyValue = document.getElementById('energyValue');
    
    if (energySlider && energyValue) {
      energySlider.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.energy = parseInt(target.value);
        energyValue.textContent = this.energy.toString();
        this.clearTrail();
      });
    }
    
    // Box dimension controls
    const controls: ControlConfig[] = [
      { slider: 'width', value: 'widthValue', prop: 'width' },
      { slider: 'height', value: 'heightValue', prop: 'height' },
      { slider: 'depth', value: 'depthValue', prop: 'depth' }
    ];
    
    controls.forEach(control => {
      const slider = document.getElementById(control.slider) as HTMLInputElement;
      const valueDisplay = document.getElementById(control.value);
      
      if (slider && valueDisplay) {
        slider.addEventListener('input', (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = parseFloat(target.value);
          this.boxSize[control.prop] = value;
          valueDisplay.textContent = value.toFixed(1);
          this.updateBoxScale();
          this.clearTrail();
        });
      }
    });
    
    // Help button
    const helpButton = document.getElementById('help');
    if (helpButton) {
      helpButton.addEventListener('click', () => {
        alert(`Electron in a Box Simulation

This demonstrates quantum mechanics - an electron confined in a 3D box.

Controls:
• Energy Level: Changes the quantum state (n=1,2,3,4,5)
• Box Dimensions: Adjust the confining potential well
• Mouse: Drag to rotate the view

The red sphere shows the electron's probable position based on its wave function. Higher energy levels create more complex motion patterns.

The particle's position oscillates according to quantum mechanical principles, not classical physics.`);
      });
    }
  }
  
  private updateBoxScale(): void {
    if (this.box) {
      this.box.scale.set(
        this.boxSize.width,
        this.boxSize.height,
        this.boxSize.depth
      );
    }
  }
  
  private clearTrail(): void {
    // Remove old trail points
    this.trail.forEach(point => this.scene.remove(point));
    this.trail = [];
  }
  
  private calculateQuantumPosition(time: number): Position {
    const { width, height, depth } = this.boxSize;
    const n = this.energy;
    
    // Simplified quantum wave function
    // ψ(x,y,z,t) = sin(nπx/L) * sin(nπy/L) * sin(nπz/L) * cos(ωt)
    const frequency = 0.5 + n * 0.3; // Energy-dependent frequency
    const amplitude = 0.3; // Keep particle within box bounds
    
    const x = amplitude * width * Math.sin(n * Math.PI * time * frequency) * 
                Math.cos(n * Math.PI * time * frequency * 0.7);
    const y = amplitude * height * Math.cos(n * Math.PI * time * frequency * 0.8) * 
                Math.sin(n * Math.PI * time * frequency * 0.6);
    const z = amplitude * depth * Math.sin(n * Math.PI * time * frequency * 0.9) * 
                Math.sin(n * Math.PI * time * frequency * 0.5);
    
    return { x, y, z };
  }
  
  private updateParticle(time: number): void {
    if (!this.particle) return;
    
    const position = this.calculateQuantumPosition(time);
    this.particle.position.set(position.x, position.y, position.z);
    
    // Update particle color based on energy and position
    const intensity = 0.5 + 0.5 * Math.sin(time * 2);
    const r = 1.0;
    const g = 0.2 + 0.3 * (this.energy / 5);
    const b = 0.2 + 0.5 * intensity;
    
    this.particle.material.color.setRGB(r, g, b);
    
    // Add trail point occasionally
    if (Math.floor(time * 10) % 3 === 0 && this.trail.length < this.maxTrailLength) {
      const trailGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const trailMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff44,
        transparent: true,
        opacity: 0.3
      });
      const trailPoint = new THREE.Mesh(trailGeometry, trailMaterial);
      trailPoint.position.copy(this.particle.position);
      this.scene.add(trailPoint);
      this.trail.push(trailPoint);
      
      // Remove old trail points
      if (this.trail.length > this.maxTrailLength) {
        const oldPoint = this.trail.shift();
        if (oldPoint) {
          this.scene.remove(oldPoint);
        }
      }
    }
    
    // Update info display
    this.updateInfoDisplay(position);
  }
  
  private updateInfoDisplay(position: Position): void {
    const info = document.getElementById('info');
    if (!info) return;
    
    const probability = Math.abs(Math.sin(this.time * (0.5 + this.energy * 0.3))) * 100;
    
    info.innerHTML = `Position: (${position.x.toFixed(3)}, ${position.y.toFixed(3)}, ${position.z.toFixed(3)})<br>
                        Energy: n=${this.energy} | Probability: ${probability.toFixed(1)}%`;
  }
  
  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    this.time += 0.016; // ~60fps
    
    this.updateParticle(this.time);
    
    // Fade trail points
    this.trail.forEach((point, index) => {
      const age = (this.trail.length - index) / this.trail.length;
      point.material.opacity = age * 0.3;
    });
    
    this.renderer.render(this.scene, this.camera);
  }
  
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Start the simulation
new SimpleElectronBox();