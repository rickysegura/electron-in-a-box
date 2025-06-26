// Type declarations for THREE.js when using CDN
declare global {
  const THREE: {
    Scene: new () => THREE.Scene;
    PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => THREE.PerspectiveCamera;
    WebGLRenderer: new (parameters?: { antialias?: boolean }) => THREE.WebGLRenderer;
    BoxGeometry: new (width: number, height: number, depth: number) => THREE.BoxGeometry;
    SphereGeometry: new (radius: number, widthSegments?: number, heightSegments?: number) => THREE.SphereGeometry;
    EdgesGeometry: new (geometry: THREE.BufferGeometry) => THREE.EdgesGeometry;
    LineBasicMaterial: new (parameters?: { color?: number; linewidth?: number }) => THREE.LineBasicMaterial;
    MeshLambertMaterial: new (parameters?: { color?: number; transparent?: boolean; opacity?: number }) => THREE.MeshLambertMaterial;
    MeshBasicMaterial: new (parameters?: { color?: number; transparent?: boolean; opacity?: number }) => THREE.MeshBasicMaterial;
    LineSegments: new (geometry: THREE.BufferGeometry, material: THREE.Material) => THREE.LineSegments;
    Mesh: new (geometry: THREE.BufferGeometry, material: THREE.Material) => THREE.Mesh;
    AmbientLight: new (color: number, intensity: number) => THREE.AmbientLight;
    DirectionalLight: new (color: number, intensity: number) => THREE.DirectionalLight;
    Vector3: new (x?: number, y?: number, z?: number) => THREE.Vector3;
    Color: new (color?: number | string) => THREE.Color;
  };

  namespace THREE {
    interface Scene {
      add(object: Object3D): void;
      remove(object: Object3D): void;
    }

    interface PerspectiveCamera extends Object3D {
      aspect: number;
      position: Vector3;
      lookAt(x: number | Vector3, y?: number, z?: number): void;
      updateProjectionMatrix(): void;
    }

    interface WebGLRenderer {
      domElement: HTMLCanvasElement;
      setSize(width: number, height: number): void;
      setClearColor(color: number): void;
      render(scene: Scene, camera: Camera): void;
    }

    interface Object3D {
      position: Vector3;
      scale: Vector3;
      add(object: Object3D): void;
      remove(object: Object3D): void;
    }

    interface BufferGeometry {
      // Basic geometry interface
    }

    interface Material {
      color: Color;
      opacity: number;
      transparent: boolean;
    }

    interface Vector3 {
      x: number;
      y: number;
      z: number;
      set(x: number, y: number, z: number): Vector3;
      copy(v: Vector3): Vector3;
    }

    interface Color {
      setRGB(r: number, g: number, b: number): Color;
    }

    interface Camera extends Object3D {}
    interface BoxGeometry extends BufferGeometry {}
    interface SphereGeometry extends BufferGeometry {}
    interface EdgesGeometry extends BufferGeometry {}
    interface LineBasicMaterial extends Material {}
    interface MeshLambertMaterial extends Material {}
    interface MeshBasicMaterial extends Material {}
    interface LineSegments extends Object3D {}
    interface Mesh extends Object3D {
      material: Material;
    }
    interface AmbientLight extends Object3D {}
    interface DirectionalLight extends Object3D {}
  }
}

export {};