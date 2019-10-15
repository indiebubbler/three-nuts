import * as THREE from 'three'
 
import AlignHelper from './AlignHelper'; 


THREE.InstancedMesh.prototype.getMatrixAt = function (index) {
    let m = [];
    m[0] = this.instanceMatrix.array[index * 16];
    m[1] = this.instanceMatrix.array[index * 16 + 1];
    m[2] = this.instanceMatrix.array[index * 16 + 2];
    m[3] = this.instanceMatrix.array[index * 16 + 3];
    return m;
}

class TweenableMesh {
    scale = new THREE.Vector3(1, 1, 1);
 
    meshes = [];

    qTweens = []
    qTweensMap = []
    posTweens = []
    posTweensMap = [];
    dummy = new THREE.Object3D();
    initialArrangement = [];
    constructor(scene, meshes, arrangement) {
        const models = meshes.length ? meshes : [meshes]
 
        this.amount = arrangement.length;
        
        this.initialArrangement = arrangement;

        let g = new THREE.Group();

        
        for (let i = 0; i < models.length; i++) {
            // operate on clone
            const m = models[i].geometry.clone();
            
            let im = new THREE.InstancedMesh(
                m,
                models[i].material.clone(),
                this.amount
            );
            g.add(im);
            this.meshes.push(im);
        }

        scene.add(g);
    }

    setScale(scale) {
        this.scale = new THREE.Vector3(scale, scale, scale);

        for (let i = 0; i < this.meshes.length; i++) {
            for (let j = 0; j < this.amount; j++) {
                var m = this.meshes[i].getMatrixAt(j);
                this.dummy.matrix.set(m)
                this.dummy.scale.set(this.scale.x, this.scale.y, this.scale.z)
                this.dummy.updateMatrix();
                this.meshes[i].setMatrixAt(j, this.dummy.matrix)
            }
            this.meshes[i].instanceMatrix.needsUpdate = true;
        }

    }

    setPositionTweens(tweens, map) {
        this.posTweens = tweens;

        this.posTweensMap = [];
        for (let i = 0; i < this.amount && tweens.length > 0; i++) {
            let idx;
            if (map) {
                idx = map[i];
            }
            else {
                idx = Math.floor(Math.random() * 50) % tweens.length;
            }
            this.posTweensMap.push(idx)
        }
    }


    setQuaternionTweens(tweens) {
        this.qTweens = tweens;
        this.qTweensMap = [];
        for (let i = 0; i < this.amount && tweens.length > 0; i++) {
            const idx = Math.floor(Math.random() * 50) % tweens.length;
            this.qTweensMap.push(idx)
        }
    } 

    update() {
        if (this.initialArrangement.length != this.amount) {
            throw new Error("Instances number mismatch")
        }
        for (var i = 0; i < this.meshes.length; i++) {
            for (var j = 0; j < this.amount; j++) {
                // position
                this.dummy.matrix.set(this.meshes[i].getMatrixAt(j));
                this.dummy.updateMatrix();
            
                if (this.posTweensMap.length > 0) {
                    const c = this.initialArrangement[j].clone().add(this.posTweens[this.posTweensMap[j]].target);
                    this.dummy.position.set(c.x, c.y, c.z);
                }

                // rotations
                if (this.qTweensMap.length > 0) {
                    const targetRot = this.qTweens[this.qTweensMap[j]].target

                    this.dummy.rotation.x = targetRot.x;
                    this.dummy.rotation.y = targetRot.y;
                    this.dummy.rotation.z = targetRot.z;
                }
                this.dummy.updateMatrix();
                this.meshes[i].setMatrixAt(j, this.dummy.matrix)
            }
            this.meshes[i].instanceMatrix.needsUpdate = true
        }
    }
}

export default TweenableMesh;