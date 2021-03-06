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

// Model
import Texture from "./model/texture";
import Model from "./model/model";

// data
import Config from "../data/config";
import Animation from "./components/animation";
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

    this.rayCaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // for the sun
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer.threeRenderer);

    this.prepareEnvironment();

    this.loadPlatonics();
    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.controls = new Controls(
      this.camera.threeCamera,
      this.renderer.threeRenderer.domElement
    );
    this.light = new Light(this.scene);

    this.light.place("ambient");
    // Create and place geo in scene
    /*this.geometry = new Geometry(this.scene);
    this.geometry.make("plane")(150, 150, 10, 10);
    this.geometry.place([0, -20, 0], [Math.PI / 2, 0, 0]);*/

    // Instantiate texture class
    this.texture = new Texture();

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.manager = new THREE.LoadingManager();

      // Textures loaded, load contact text and model
      this.postboxModel = new Model(this.scene, this.manager);
      this.postboxModel.load(Config.models[Config.model.selected].type, 2);

      this.resumeModel = new Model(this.scene, this.manager);
      this.resumeModel.load(Config.models[Config.model.selected].type, 4);

      // Textures loaded, load model
      this.mjModel = new Model(this.scene, this.manager);
      this.mjModel.load(Config.models[Config.model.selected].type, 3);

      // onProgress callback
      this.manager.onProgress = (item, loaded, total) => {
        console.log(`${item}: ${loaded} ${total}`);
      };

      // All loaders done now
      this.manager.onLoad = () => {
        this.mjModelAnimation = new Animation(
          this.mjModel.obj,
          this.mjModel.animations[0]
        );

        this.light.ambientLight.position.set(15, 2, 70);

        // Everything is now fully loaded
        Config.isLoaded = true;
        this.container.querySelector("#loading").style.display = "none";
      };
    });

    // Start render which does not wait for model fully loaded
    this.render();
    this.updateSun();
  }

  render() {
    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

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

    this.spinPlatonics();

    if (this.mjModelAnimation) {
      const delta = this.clock.getDelta();
      this.mjModelAnimation.update(delta);
    }

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
      waterColor: 0x9cd3db,
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

  loadPlatonics() {
    const time = performance.now() * 0.001;

    this.tetrahedron = new Geometry(this.scene);
    this.tetrahedron.make("tetrahedron")(5);
    this.tetrahedron.place(
      [-60, 20, -20],
      [time * 0.5, null, time * 0.51],
      "#A0150D",
      "tetrahedon"
    );

    this.box = new Geometry(this.scene);
    this.box.make("box")();
    this.box.place([-30, 20, -30], [time * 0.5, null, time * 0.51], "#04AC03");

    this.octahedron = new Geometry(this.scene);
    this.octahedron.make("octahedron")();
    this.octahedron.place(
      [0, 20, -40],
      [time * 0.5, null, time * 0.51],
      "#F9E82E"
    );

    this.dodecahedron = new Geometry(this.scene);
    this.dodecahedron.make("dodecahedron")();
    this.dodecahedron.place(
      [30, 20, -30],
      [-time * 0.5, null, time * 0.51],
      "#957006"
    );

    this.icosahedron = new Geometry(this.scene);
    this.icosahedron.make("icosahedron")();
    this.icosahedron.place(
      [60, 20, -20],
      [-time * 0.5, null, time * 0.51],
      "#1B63BA"
    );
  }

  spinPlatonics() {
    const time = performance.now() * 0.001;

    this.tetrahedron.rotate([time * 0.5, null, time * 0.51]);
    this.box.rotate([time * 0.5, null, time * 0.51]);
    this.octahedron.rotate([time * 0.5, null, time * 0.51]);
    this.dodecahedron.rotate([-time * 0.5, null, time * 0.51]);
    this.icosahedron.rotate([-time * 0.5, null, time * 0.51]);

    if (this.resumeModel && this.resumeModel.obj) {
      this.resumeModel.obj.rotation.y = -time * 0.2;
    }
  }
}
