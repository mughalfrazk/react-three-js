import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import {
  COTTAGE,
  COTTAGE_MTL,
  GRASS,
  GUN,
  GUN_MTL,
} from "../constants/AssetConstants";
import "./Three.css";
import LoadingBar from "./LoadingBar";

const Three = () => {
  const divRef = useRef();
  let container, stats, camera, scene, renderer;
  const [loading, setLoading] = useState("");

  const params = {
    enableWind: true,
    showBall: false,
  };

  const init = () => {
    init();
    animate();

    function init() {
      container = document.createElement("div");
      divRef.current.appendChild(container);

      // scene

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcce0ff);
      scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

      // camera

      camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        0.001,
        10000
      );
      camera.position.set(0, 0, 2000);

      // lights

      scene.add(new THREE.AmbientLight(0x666666));

      const light = new THREE.DirectionalLight(0xdfebff, 1);
      light.position.set(50, 200, 100);
      light.position.multiplyScalar(1.3);

      light.castShadow = true;

      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;

      const d = 300;

      light.shadow.camera.left = -d;
      light.shadow.camera.right = d;
      light.shadow.camera.top = d;
      light.shadow.camera.bottom = -d;

      light.shadow.camera.far = 1000;

      scene.add(light);

      // ground

      const loader = new THREE.TextureLoader();
      const groundTexture = loader.load(GRASS);
      groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set(25, 25);
      groundTexture.anisotropy = 16;
      groundTexture.encoding = THREE.sRGBEncoding;

      const groundMaterial = new THREE.MeshLambertMaterial({
        map: groundTexture,
      });

      let mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(20000, 20000),
        groundMaterial
      );
      mesh.position.y = -150;
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Object Loader

      const mtlLoader = new MTLLoader();
      mtlLoader.load(COTTAGE_MTL, (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load(
          COTTAGE,
          (model) => {
            model.scale.multiplyScalar(15);
            model.position.y = -100;
            scene.add(model);
          },
          (xhr) => {
            let xhrLoading = (xhr.loaded / xhr.total) * 100;
            setLoading(xhrLoading);
            console.log(xhrLoading + "% loaded");
          },
          (err) => {
            console.log(err);
          }
        );
      });

      // renderer

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;

      // controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.maxPolarAngle = Math.PI * 0.5;
      controls.minDistance = 1000;
      controls.maxDistance = 5000;

      // performance monitor

      stats = new Stats();
      container.appendChild(stats.dom);

      window.addEventListener("resize", onWindowResize);

      const gui = new GUI();
      gui.add(params, "enableWind").name("Enable wind");
      gui.add(params, "showBall").name("Show ball");
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
      stats.update();
    }

    function render() {
      renderer.render(scene, camera);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div id="modelScene">
      {/* {loading && loading !== 100 && (
        <div className="modelScene_loading">
          <LoadingBar width={loading} />
        </div>
      )} */}
      <div ref={divRef}></div>
    </div>
  );
};

export default Three;
