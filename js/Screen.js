"use strict";

/*

Screen is responsible for initializing the three.js renderer, scene, cameras,
as well as establishing an animation loop and handling window resizing events.

*/

class Screen {
  constructor(animate = true) {
    this.updateListeners = [];
    this.element = document.createElement("div");
    document.body.appendChild(this.element);
    this.resolution = 1;
    this.scene = new THREE.Scene();
    this.driverCamera = new THREE.PerspectiveCamera(90, 1, 0.001, 100000);
    this.driverCamera.rotation.order = "YZX";
    this.scene.add(this.driverCamera);
    this.overheadCamera = new THREE.PerspectiveCamera(90, 1, 0.001, 100000);
    this.scene.add(this.overheadCamera);
    this.worldCamera = new THREE.PerspectiveCamera(90, 1, 0.001, 100000);
    this.scene.add(this.worldCamera);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.element.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = "renderer";
    this.composer = new THREE.EffectComposer(this.renderer);
    this.renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.aaPass = new THREE.SMAAPass(1, 1);
    this.aaPass.renderToScreen = true;
    this.composer.addPass(this.aaPass);
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    this.onWindowResize();
    if (animate) {
      this.update();
      this.render();
    }
    this.camera = this.driverCamera;
    this.frameRate = 1;
    this.startFrameTime = Date.now();
    this.lastFrameTime = this.startFrameTime;
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.driverCamera.aspect = aspect;
    this.driverCamera.updateProjectionMatrix();
    this.overheadCamera.aspect = aspect;
    this.overheadCamera.updateProjectionMatrix();
    this.worldCamera.aspect = aspect;
    this.worldCamera.updateProjectionMatrix();
    this.setResolution(this.resolution);
  }

  setResolution(amount) {
    this.resolution = amount;
    const width  =  Math.ceil(window.innerWidth  * this.resolution);
    const height =  Math.ceil(window.innerHeight * this.resolution);
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.composer.setSize(width, height);
    silhouette.uniforms.resolution.value.set(width, height);
  }

  update() {
    for (const listener of this.updateListeners) {
      listener();
    }
    setTimeout(this.update.bind(this), 1000 / 60);
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    if (this.camera != null) {
      this.renderPass.camera = this.camera;
      this.composer.render();
    }

    const frameTime = Date.now() - this.startFrameTime;
    const frameDuration = frameTime - this.lastFrameTime;
    this.frameRate = 1000 / frameDuration;
    this.lastFrameTime = frameTime;
  }

  addUpdateListener(func) {
    if (!this.updateListeners.includes(func)) {
      this.updateListeners.push(func);
    }
  }

  get width() {
    return window.innerWidth;
  }

  get height() {
    return window.innerHeight;
  }

  get backgroundColor() {
    return this.scene.background;
  }

  set backgroundColor(color) {
    this.scene.background = color;
    return color;
  }
}
