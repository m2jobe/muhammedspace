// Global imports -
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

// Local imports -
// Components
import Water from "./components/water";
import Sky from "./components/sky";
import Renderer from "./components/renderer";
import Camera from "./components/camera";
import Light from "./components/light";
import Controls from "./components/controls";
import Geometry from "./components/geometry";

// Helpers
import Stats from "./helpers/stats";
import MeshHelper from "./helpers/meshHelper";

// Model
import Texture from "./model/texture";
import Model from "./model/model";

// Managers
import Interaction from "./managers/interaction";
import DatGUI from "./managers/datGUI";

// data
import Config from "../data/config";
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    // Set container property to container element
    this.container = container;

    // Start Three clock
    this.clock = new THREE.Clock();

    // Main scene creation
    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    // Get Device Pixel Ratio first for retina
    if (window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    // Main renderer constructor
    this.renderer = new Renderer(this.scene, container);

    //the sun
    this.sun = new THREE.Vector3();

    // for the sun
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer.threeRenderer);

    this.prepareEnvironment();

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.controls = new Controls(this.camera.threeCamera, container);
    this.light = new Light(this.scene);

    // Create and place lights in scene
    const lights = ["ambient", "directional", "point", "hemi"];
    //lights.forEach((light) => this.light.place(light));

    // Create and place geo in scene
    /*this.geometry = new Geometry(this.scene);
    this.geometry.make("plane")(150, 150, 10, 10);
    this.geometry.place([0, -20, 0], [Math.PI / 2, 0, 0]);*/

    // Set up rStats if dev environment
    if (Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer);
      this.stats.setUp();
    }

    // Set up gui
    if (Config.isDev) {
      this.gui = new DatGUI(this);
    }

    // Instantiate texture class
    this.texture = new Texture();

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.manager = new THREE.LoadingManager();

      // Textures loaded, load model
      this.postboxModel = new Model(this.scene, this.manager);
      this.postboxModel.load(Config.models[Config.model.selected].type, 2);

      // onProgress callback
      this.manager.onProgress = (item, loaded, total) => {
        console.log(`${item}: ${loaded} ${total}`);
      };

      // All loaders done now
      this.manager.onLoad = () => {
        // Set up interaction manager with the app now that the model is finished loading
        new Interaction(
          this.renderer.threeRenderer,
          this.scene,
          this.camera.threeCamera,
          this.controls.threeControls
        );

        // Add dat.GUI controls if dev
        if (Config.isDev) {
          this.meshHelper = new MeshHelper(this.scene, this.postboxModel.obj);
          if (Config.mesh.enableHelper) this.meshHelper.enable();

          this.gui.load(this, this.postboxModel.obj);
        }

        // Everything is now fully loaded
        Config.isLoaded = true;
        this.container.querySelector("#loading").style.display = "none";
      };
    });

    // Start render which does not wait for model fully loaded
    this.render();
    this.updateSun();
    window.addEventListener("resize", this.onWindowResize, false);
  }

  render() {
    // Render rStats if Dev
    if (Config.isDev && Config.isShowingStats) {
      Stats.start();
    }

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    // rStats has finished determining render call now
    if (Config.isDev && Config.isShowingStats) {
      Stats.end();
    }

    // Delta time is sometimes needed for certain updates
    //const delta = this.clock.getDelta();

    // Call any vendor or module frame updates here
    TWEEN.update();
    this.controls.threeControls.update();

    this.water.material.uniforms["time"].value += 1.0 / 60.0;
    if (this.water.material.uniforms["size"].value < 100) {
      this.water.material.uniforms["size"].value += 0.5;
    }
    this.renderer.threeRenderer.toneMappingExposure = 0.06;

    this.renderer.threeRenderer.render(this.scene, this.camera.threeCamera);

    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }

  prepareEnvironment() {
    // water
    const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "./assets/textures/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
    });

    this.water.rotation.x = -Math.PI / 2;

    this.scene.add(this.water);

    // Skybox

    this.sky = new Sky();
    this.sky.scale.setScalar(10000);

    this.sky.material.uniforms["turbidity"].value = 10;
    this.sky.material.uniforms["rayleigh"].value = 1.2;
    this.sky.material.uniforms["mieCoefficient"].value = 0.005;
    this.sky.material.uniforms["mieDirectionalG"].value = 0.5;

    this.scene.add(this.sky);
  }

  updateSun() {
    const parameters = {
      inclination: 0.4875,
      azimuth: 0.205,
    };

    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    this.sun.x = Math.cos(phi);
    this.sun.y = Math.sin(phi) * Math.sin(theta);
    this.sun.z = Math.sin(phi) * Math.cos(theta);

    this.sky.material.uniforms["sunPosition"].value.copy(this.sun);
    this.water.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();

    this.scene.environment = this.pmremGenerator.fromScene(this.sky).texture;
  }

  onWindowResize() {
    this.camera.threeCamera.aspect = window.innerWidth / window.innerHeight;
    this.camera.threeCamera.updateProjectionMatrix();

    this.renderer.threeRenderer.setSize(window.innerWidth, window.innerHeight);
  }
}
