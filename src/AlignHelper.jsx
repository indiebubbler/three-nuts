import * as THREE from 'three'

class AlignHelper  {
    
    deltaVec = new THREE.Vector3(1,0,1);
    totalCount = 0;
    count = 0;
    cur = new THREE.Vector3();
    num = new THREE.Vector3();
    alternateRows = true;
  
    constructor(deltaVec, amountVec) {
        this.num = amountVec;
        this.deltaVec = deltaVec;
        this.totalCount = amountVec.x * amountVec.y * amountVec.z;
    }

    getPositions() {
        let o = [];
        for (let i = 0 ; i < this.totalCount ; i++) {
            o.push(this.getNextPosition());
        }
        
        // center array
        const center = o[this.totalCount - 1].clone().divideScalar(2);
        
        for (let i = 0 ; i < this.totalCount ; i++) {
            
            o[i] = o[i].clone().sub(center);

            if (this.alternateRows === true && (i % 2 === 0)) 
            {
                o[i] = o[i].clone().sub(new THREE.Vector3(0,0,this.deltaVec.z/2));// this.cur.sub(new THREE.Vector3(0,0,this.deltaVec.z/2));
            }

            
        }
        return o;
    }
    getNextPosition() {
        if (this.count++ > this.totalCount) {
            throw new Error("Maximum instances reached");
        }
        let p = new THREE.Vector3();

        p = this.deltaVec.clone().multiply(this.cur);
        

        if (++this.cur.x < this.num.x) {
        }
        else {
            this.cur.x = 0;
            this.cur.y++;
        }

        if (this.cur.y < this.num.y) {

        }
        else {
            this.cur.y = 0;
            this.cur.z++;
        }
       return p; 
    }
}
 
export default AlignHelper;