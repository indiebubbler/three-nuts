import React from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats-js';
import * as createjs from 'createjs-module';

class Scene extends React.Component {
    constructor(props) {
        super(props)

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
    }

    componentDidMount() {
        // set title
        document.title = "Threejs demo"
        const width = this.mount.clientWidth
        const height = this.mount.clientHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            22,
            width / height,
            0.01,
            1000
        )
        camera.position.set(-40, 10, 20);
        camera.lookAt(0, -5, 0);


        const renderer = new THREE.WebGLRenderer({ antialias: true })

        // set background color
        renderer.setClearColor('#bbbbbb', 1)
        renderer.setSize(width, height)

        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        var loader = new GLTFLoader();
        loader.load('nut.glb',
            (gltf) => this.onModelLoaded(gltf),
            undefined,
            function (error) {
                console.error("EXCEPTION: " + error);
            });

        const light = new THREE.PointLight(0xffffff);
        light.position.set(8, 50, -10);
        this.scene.add(light);

        const light2 = new THREE.PointLight(0xffeeff);
        light2.position.set(2, 50, 10);
        this.scene.add(light2);

        this.mount.appendChild(this.renderer.domElement)
        this.start()

        this.orbitControl = new OrbitControls(camera, renderer.domElement);
        this.orbitControl.zoomSpeed = 5.0;

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }


    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onModelLoaded(gltf) {
        this.makeArray(20, 20, gltf.scene)
    }

    makeArray(rows, cols, model) {
        model.scale.set(1, 1, 1);
        const xGap = 2;
        const zGap = 2.55;
        let cnt = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {

                let instance = model.clone();
                instance.position.x = -(xGap * cols) / 2 + j * xGap
                instance.position.z = -(zGap * rows) / 2 + i * zGap + (j % 2 === 0 ? zGap / 2 : 0);

                // animaty every other one 
                if ((cnt++ + i) % 2 === 0) {
                    this.animateModel(instance);
                }
                this.scene.add(instance);
            }
        }
    }

    animateModel(model) {
        // full, half, quarter, sixth
        const fRot = Math.PI * 2;
       // const hRot = Math.PI;
        //const qRot = hRot / 2;
        const rot6 = fRot / 6;
        const jumpHeight = 4;

        const randomDue = Math.random() * 1000;

        const dir = 1;//Math.random() >0.5 ? 1 : -1;
        
        // position
        createjs.Tween.get(model.position, { loop: true })
            .wait(randomDue)
            .to({ y: model.position.y + jumpHeight }, 2000, createjs.Ease.backInOut)
            .wait(4000)
            .to({ y: model.position.y }, 2000, createjs.Ease.backInOut)
            .wait(2000 - randomDue);
        
        // animate rotation
        createjs.Tween.get(model.rotation, { loop: true })
            .wait(randomDue)
            .wait(1500)
            .to({ x: 3 * dir * rot6 }, 4000, createjs.Ease.backInOut)
            .wait(2500 - randomDue)
            .wait(2000);
     }

    componentWillUnmount() {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }
 
    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        this.stats.begin();
        this.renderScene();
        this.stats.end()
        this.frameId = window.requestAnimationFrame(this.animate)
        this.orbitControl.update();
    }

    renderScene() {
        this.renderer.render(this.scene, this.camera)
    }

    render() {
        return (
            <div
                style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
                ref={(mount) => { this.mount = mount }}
            />
        )
    }

}

export default Scene;