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
        this.isActive = true;
    }

    getBox()
    {
        return this.box;
    }
}