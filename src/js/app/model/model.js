import * as THREE from "three";

import Material from "../components/material";
import Helpers from "../../utils/helpers";
import { BufferGeometryUtils } from "../../utils/bufferGeometryUtils";
import { GLTFLoader } from "../loaders/GLTFLoader";
import Config from "../../data/config";

// Loads in a single object from the config file
export default class Model {
  constructor(scene, manager, textures) {
    this.scene = scene;
    this.textures = textures;
    this.manager = manager;

    this.obj = null;
    this.ref = null;
    this.animations = null;
  }

  load(type, modelIndex = null) {
    // Manager is passed in to loader to determine when loading done in main

    const model = Config.models[modelIndex || Config.model.selected];
    switch (type) {
      case "gltf":
        // Load model with selected loader
        new GLTFLoader(this.manager).load(
          model.path,
          (gltf) => {
            this.animations = gltf.animations;
            const scene = gltf.scene;

            scene.scale.multiplyScalar(model.scale);

            if (model.position) {
              scene.position.x = model.position.x;
              scene.position.y = model.position.y;
              scene.position.z = model.position.z;
            }
            if (model.rotation) {
              scene.rotation.x = model.rotation.x;
              scene.rotation.y = model.rotation.y;
              scene.rotation.z = model.rotation.z;
            }

            this.obj = scene;
            this.ref = scene;

            // Add to scene
            this.scene.add(scene);
          },
          Helpers.logProgress(),
          Helpers.logError()
        );
        break;

      case "object":
        // Load model with ObjectLoader
        new THREE.ObjectLoader(this.manager).load(
          model.path,
          (obj) => {
            obj.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                // Create material for mesh and set its map to texture by name from preloaded textures
                const material = new Material(0xffffff).standard;
                material.map = this.textures.UV;
                child.material = material;

                // Set to cast and receive shadow if enabled
                if (Config.shadow.enabled) {
                  child.receiveShadow = true;
                  child.castShadow = true;
                }
              }
            });

            // Set prop to obj so it can be accessed from outside the class
            this.obj = obj;
            this.ref = obj;

            obj.scale.multiplyScalar(model.scale);
            if (model.position) {
              obj.position = model.position;
            }
            if (model.rotation) {
              obj.rotation = model.rotation;
            }

            this.scene.add(obj);
          },
          Helpers.logProgress(),
          Helpers.logError()
        );
        break;
    }
  }

  unload() {
    this.scene.remove(this.ref);
  }
}
