import * as THREE from 'three'

export class Coin
{
    constructor(posX, posZ)
    {
        this.material = new THREE.MeshBasicMaterial({color : 0xedc80e + (Math.random() * 50) })
        this.geo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 20);
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.mesh.position.x = posX;
        this.mesh.position.z = posZ;
        this.mesh.rotation.x = Math.PI / 2;
    }

    update(deltaTime)
    {
        this.mesh.rotation.z += deltaTime * 3;
    }
}