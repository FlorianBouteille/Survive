import * as THREE from 'three'
import {randomColor } from './utils.js'

export class Platform {
    constructor(scene, position, sizeX, sizeY, sizeZ) {
        const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ)
        const material = new THREE.MeshStandardMaterial({ color: randomColor() })
        material.roughness = 0.7
        material.metalness = 0.4
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.copy(position)
        scene.add(this.mesh)

        this.box = new THREE.Box3().setFromObject(this.mesh)
        this.basePosition = this.mesh.position.clone()
        this.previousPosition = this.mesh.position.clone()
        this.isActive = true
        this.isStatic = true
        this.enableJump = true
    }

    copy() 
    {
        const geom = this.mesh.geometry
        const clone = new Platform(
            this.mesh.parent,
            this.basePosition.clone(),
            geom.parameters.width,
            geom.parameters.height,
            geom.parameters.depth
        )
        return clone
    }


    getBox() {
        return this.box
    }
}

