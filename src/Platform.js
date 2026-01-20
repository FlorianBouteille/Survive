import * as THREE from 'three'
import {randomColor } from './utils.js'

export class Platform 
{
    constructor(scene, position, sizeX, sizeY, sizeZ)
    {
        const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ)
        const material = new THREE.MeshBasicMaterial( { color : randomColor ()})

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.copy(position)
        scene.add(this.mesh)
        this.box = new THREE.Box3();
        this.box.setFromObject(this.mesh);
        this.isStatic = true;
        this.moveX = 0;
        this.moveY = 0;
        this.moveZ = 1;
        this.isActive = true;
    }

    update(elapsedTime)
    {
        this.mesh.position.z += Math.sin(elapsedTime) / 20 * this.moveZ;
        this.mesh.position.y += Math.sin(elapsedTime) / 20 * this.moveX;
        this.mesh.position.x += Math.sin(elapsedTime) / 20 * this.moveY;
        this.box.setFromObject(this.mesh);
    }

    getBox()
    {
        return this.box;
    }
}