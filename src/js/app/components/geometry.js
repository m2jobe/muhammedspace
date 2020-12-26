import * as THREE from "three";

import Material from "./material";
import Config from "../../data/config";

// This helper class can be used to create and then place geometry in the scene
export default class Geometry {
  constructor(scene) {
    this.scene = scene;
    this.geo = null;
    this.mesh = null;
  }

  make(type) {
    if (type === "plane") {
      return (width, height, widthSegments = 1, heightSegments = 1) => {
        this.geo = new THREE.PlaneGeometry(
          width,
          height,
          widthSegments,
          heightSegments
        );
      };
    }

    if (type === "sphere") {
      return (radius, widthSegments = 32, heightSegments = 32) => {
        this.geo = new THREE.SphereGeometry(
          radius,
          widthSegments,
          heightSegments
        );
      };
    }

    if (type === "tetrahedron") {
      return (radius = 5, detail = null) => {
        this.geo = new THREE.TetrahedronBufferGeometry(radius, detail);
      };
    }

    if (type === "box") {
      return (radius = 7, widthSegments = 7, heightSegments = 7) => {
        this.geo = new THREE.BoxBufferGeometry(
          radius,
          widthSegments,
          heightSegments
        );
      };
    }

    if (type === "octahedron") {
      return (radius = 5, detail = null) => {
        this.geo = new THREE.OctahedronBufferGeometry(radius, detail);
      };
    }

    if (type === "dodecahedron") {
      return (radius = 5, detail = null) => {
        this.geo = new THREE.DodecahedronBufferGeometry(radius, detail);
      };
    }

    if (type === "icosahedron") {
      return (radius = 5, detail = null) => {
        this.geo = new THREE.IcosahedronBufferGeometry(radius, detail);
      };
    }

    if (type === "text") {
      return (
        text = null,
        font = null,
        size = 40,
        height = 5,
        curveSegments = 12
      ) => {
        this.geo = new THREE.TextGeometry(text, {
          font: font,
          size: size,
          height: height,
          curveSegments: curveSegments,
        });
      };
    }
  }

  place(position = null, rotation = null, meshColor = 0xeeeeee, name = null) {
    const material = new Material(meshColor).standard;
    material.roughness = 0;
    this.mesh = new THREE.Mesh(this.geo, material);

    // Use ES6 spread to set position and rotation from passed in array
    if (position) {
      this.mesh.position.set(...position);
    }
    if (rotation) {
      this.mesh.rotation.set(...rotation);
    }

    if (Config.shadow.enabled) {
      this.mesh.receiveShadow = true;
    }

    this.mesh.name = name;

    this.scene.add(this.mesh);

    return this.mesh;
  }

  rotate(rotation) {
    this.mesh.rotation.set(...rotation);
  }
}
