import TWEEN from "@tweenjs/tween.js";

// This object contains the state of the app
export default {
  isDev: false,
  isShowingStats: false,
  isLoaded: false,
  isTweening: false,
  isRotating: true,
  isMouseMoving: false,
  isMouseOver: false,
  maxAnisotropy: 1,
  dpr: 1,
  easing: TWEEN.Easing.Quadratic.InOut,
  duration: 500,
  model: {
    selected: 2,
    initialTypes: ["gltf", "object"],
    type: "gltf",
  },
  models: [
    {
      path: "./assets/models/duck.gltf",
      scale: 20,
      type: "gltf",
    },
    {
      path: "./assets/models/Teapot.json",
      scale: 20,
      type: "object",
    },
    {
      path: "./assets/models/mailbox/scene.gltf",
      scale: 0.04,
      type: "gltf",
      position: {
        x: -4,
        y: 2,
        z: 28,
      },
      rotation: {
        x: 0,
        y: -Math.PI,
        z: 0,
      },
    },
  ],
  texture: {
    path: "./assets/textures/",
    imageFiles: [
      { name: "UV", image: "UV_Grid_Sm.jpg" },
      { name: "Water", image: "waternormals.jpg" },
    ],
  },
  mesh: {
    enableHelper: false,
    wireframe: false,
    translucent: false,
    material: {
      color: 0xffffff,
      emissive: 0xffffff,
    },
  },
  fog: {
    color: 0xffffff,
    near: 0.0008,
  },
  camera: {
    fov: 55,
    near: 1,
    far: 20000,
    aspect: window.innerWidth / window.innerHeight,
    posX: 30,
    posY: 30,
    posZ: 100,
  },
  controls: {
    autoRotate: false,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 1,
    minDistance: -Infinity,
    maxDistance: Infinity,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Infinity,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.5,
    enableZoom: true,
    target: {
      x: 0,
      y: 10,
      z: 0,
    },
  },
  ambientLight: {
    enabled: true,
    color: 0x141414,
  },
  directionalLight: {
    enabled: true,
    color: 0xf0f0f0,
    intensity: 0.4,
    x: -75,
    y: 280,
    z: 150,
  },
  shadow: {
    enabled: true,
    helperEnabled: true,
    bias: 0,
    mapWidth: 2048,
    mapHeight: 2048,
    near: 250,
    far: 400,
    top: 100,
    right: 100,
    bottom: -100,
    left: -100,
  },
  pointLight: {
    enabled: true,
    color: 0xffffff,
    intensity: 0.34,
    distance: 115,
    x: 0,
    y: 0,
    z: 0,
  },
  hemiLight: {
    enabled: true,
    color: 0xc8c8c8,
    groundColor: 0xffffff,
    intensity: 0.55,
    x: 0,
    y: 0,
    z: 0,
  },
};
