import "./style.css";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import mask from "./img/particle_mask.jpg";
import canTexture from "./img/cans.png";
import me from "./img/me.jpg";
import { gsap } from "gsap";
import * as dat from "dat.gui";

const app = document.getElementById("app");

export default class Sketch {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    app.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.point = new THREE.Vector2();

    this.textures = [
      new THREE.TextureLoader().load(canTexture),
      new THREE.TextureLoader().load(me),
    ];

    this.mask = new THREE.TextureLoader().load(mask);
    this.time = 0;
    this.move = 0;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.settings();
    this.addMesh();

    this.mouseEffect();

    this.render();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  mouseEffect() {
    this.test = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshBasicMaterial()
    );

    window.addEventListener("mousedown", () => {
      gsap.to(this.mesh.material.uniforms.mousePressed, {
        value: 1,
        duration: 1,
        ease: "elastic.out(1,0.3)",
      });
    });

    window.addEventListener("mouseup", () => {
      gsap.to(this.mesh.material.uniforms.mousePressed, {
        value: 0,
        duration: 1,
        ease: "elastic.out(1,0.3)",
      });
    });

    window.addEventListener("mousewheel", (e) => {
      if (e.wheelDeltaY < 0) {
        this.move += 0.01;
      } else {
        this.move -= 0.01;
      }
    });

    window.addEventListener(
      "mousemove",
      (event) => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // calculate objects intersecting the picking ray
        let intersects = this.raycaster.intersectObjects([this.test]);
        this.point.x = intersects[0].point.x;
        this.point.y = intersects[0].point.y;
      },
      false
    );
  }

  addMesh() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms: {
        progress: { type: "f", value: 0 },
        transition: { type: "f", value: null },
        t1: { type: "t", value: this.textures[0] },
        t2: { type: "t", value: this.textures[1] },
        mask: { type: "t", value: this.mask },
        mouse: { type: "v2", value: null },
        mousePressed: { type: "f", value: null },
        move: { type: "f", value: 0 },
        time: { type: "f", value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    let number = 512 * 512;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
    this.speeds = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.direction = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.press = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.coordinates = new THREE.BufferAttribute(
      new Float32Array(number * 3),
      3
    );

    const randomNum = function (a, b) {
      return a + (b - a) * Math.random();
    };

    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX * 2, (j - 256) * 2, 0);
        this.coordinates.setXYZ(index, i, j, 0);
        this.offset.setX(index, randomNum(-1000, 1000));
        this.speeds.setX(index, randomNum(0.4, 1));
        this.direction.setX(index, Math.random() > 0.5 ? 1 : -1);
        this.press.setX(index, randomNum(0.4, 1));
        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);
    this.geometry.setAttribute("aSpeed", this.speeds);
    this.geometry.setAttribute("aOffset", this.offset);
    this.geometry.setAttribute("aPress", this.press);
    this.geometry.setAttribute("aDirection", this.direction);
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.time++;

    let next = Math.floor(this.move + 40) % 2;
    let prev = (Math.floor(this.move) + 1 + 40) % 2;

    this.material.uniforms.t1.value = this.textures[prev];
    this.material.uniforms.t2.value = this.textures[next];
    this.material.uniforms.transition.value = this.settings.progress;

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move;
    this.material.uniforms.mouse.value = this.point;

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
