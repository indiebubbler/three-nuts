import React from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats-js';
import * as createjs from 'createjs-module';
import AlignHelper from './AlignHelper';
import TweenableMesh from './TweenableMesh';
import { AxesHelper } from 'three';

class Scene extends React.Component {

    TWEENS_NUM = 30;
    ITEM_ROWS_NUM = 18;
    ITEM_COLS_NUM = 10;
    JUMP_HEIGHT = 2;
    JUMP_DURATION = 1000;
    ROT_DURATION = 2000;
    PIXEL_RATIO_FACTOR = 2;
    

    constructor(props) {
        super(props);
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
    }

    componentDidMount() {
        // set title
        document.title = "BUCK joe_ryba's art in threejs"
        const width = this.mount.clientWidth
        const height = this.mount.clientHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            22,
            width / height,
            0.01,
            1000
        )
        camera.position.set( 9.520364644833174, 5.164962376737971, 12.35157275260960);
        // camera.position.set(-40, 10, 20);
        camera.lookAt(0, 0, 0);

        const ah = new AxesHelper(2);
        scene.add(ah)

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(window.devicePixelRatio / this.PIXEL_RATIO_FACTOR);
        // set background color
        renderer.setClearColor('#bbbbbb', 1);

        renderer.setSize(width, height)

        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.mount.appendChild(this.renderer.domElement)

        // load models
        var loader = new GLTFLoader();
        loader.load('nut.glb',
            (gltf) => this.onModelLoaded(gltf),
            undefined,
            function (error) {
                throw error
            });

        // set up lights
        const light = new THREE.PointLight(0xffffff);
        light.position.set(8, 50, -10);
        this.scene.add(light);

        const light2 = new THREE.PointLight(0xffeeff);
        light2.position.set(2, 50, 10);
        this.scene.add(light2);

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
        const arrangeCountVec = new THREE.Vector3(this.ITEM_ROWS_NUM, 1, this.ITEM_COLS_NUM);    // how many instances in each axis
        const gapVec = new THREE.Vector3(0.65, 0, 2);
        const alignHelper = new AlignHelper(gapVec, arrangeCountVec);
        const arrangement = alignHelper.getPositions();
        const fRot = Math.PI * 2;
        const rot6 = fRot / 6;
        

        let models = gltf.scene.children[0].children;
        for (let i = 0 ; i < models.length ; i++) {
            models[i].geometry.rotateX(Math.PI / 2);
            models[i].geometry.rotateY(Math.PI / 2);
            models[i].geometry.rotateX(rot6/2);
        }
        this.models = new TweenableMesh(this.scene, models, arrangement);
        
        const tweens = []
        const qTweens = []
        const dir = 1;//Math.random() >0.5 ? 1 : -1;

        for (var i = 0; i < this.TWEENS_NUM ; i++) {
            var pos = new THREE.Vector3();
            const randomDue = Math.random() * 2000;
           
            // animate every other item
            // if (0 === 0) {
                const tween = createjs.Tween.get(pos, { loop: true })
                .wait(randomDue)
                .to({ y: this.JUMP_HEIGHT }, this.JUMP_DURATION, createjs.Ease.quadInOut)
                .wait(2000)
                .to({ y: 0 }, this.JUMP_DURATION, createjs.Ease.quadInOut)
                .wait(2000 - randomDue);
                tweens.push(tween);
            // }
            // else {
            //     tweens.push(createjs.Tween.get(pos, {loop: true}).to({x:0},100));
            // }
            // animate rotation
            let eul = new THREE.Euler()
            const qTween = createjs.Tween.get(eul, { loop: true })
                .wait(1500)
                // .wait(1500)
                .to({ x: 4 * dir * rot6 }, this.ROT_DURATION, createjs.Ease.getBackInOut(0.5))
                .wait(1500 - randomDue);
            
            // sync duration of both tweens
            if (tween.duration > qTween.duration) {
                qTween.wait(tween.duration - qTween.duration)
            }
            else {
                tween.wait(qTween.duration - tween.duration)
            }
            qTweens.push(qTween)
        }
        this.models.setPositionTweens(tweens);
        this.models.setQuaternionTweens(qTweens);

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
        if (this.models) {
            this.models.update();
        }
        // console.log(this.camera.position)
        this.orbitControl.update();
        this.stats.end()
        this.frameId = window.requestAnimationFrame(this.animate)
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