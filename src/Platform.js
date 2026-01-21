import * as THREE from 'three'
import {randomColor } from './utils.js'

// export class Platform 
// {
//     constructor(scene, position, sizeX, sizeY, sizeZ)
//     {
//         const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ)
//         const material = new THREE.MeshStandardMaterial( { color : randomColor ()})
//         material.roughness = 0.7;
//         material.metalness = 0.4;
//         this.mesh = new THREE.Mesh(geometry, material)
//         this.mesh.position.copy(position)
//         scene.add(this.mesh)
//         this.box = new THREE.Box3();
//         this.box.setFromObject(this.mesh);
//         this.isStatic = true;
//         this.basePosition = this.mesh.position.clone();
//         this.amplitude = new THREE.Vector3()
//         this.speed     = new THREE.Vector3()
//         this.phase     = new THREE.Vector3()
//         this.previousPosition = this.mesh.position.clone();
//         this.isActive = true;
//     }

//     update(elapsedTime) 
//     {
//         this.previousPosition = this.mesh.position.clone();
//         this.mesh.position.x = this.basePosition.x + this.amplitude.x * Math.sin(elapsedTime * this.speed.x + this.phase.x)
//         this.mesh.position.y = this.basePosition.y + this.amplitude.y * Math.sin(elapsedTime * this.speed.y + this.phase.y)
//         this.mesh.position.z = this.basePosition.z + this.amplitude.z * Math.sin(elapsedTime * this.speed.z + this.phase.z)
//         this.box.setFromObject(this.mesh)
//     }

//     copy()
//     {

//     }

//     // update(elapsedTime)
//     // {
//     //     this.previousPosition = this.mesh.position.clone();
//     //     this.mesh.position.z += Math.sin(elapsedTime - this.delayZ) / 20 * this.moveZ;
//     //     this.mesh.position.y += Math.sin(elapsedTime - this.delayY) / 20 * this.moveY;
//     //     this.mesh.position.x += Math.sin(elapsedTime - this.delayX) / 20 * this.moveX;
//     //     this.box.setFromObject(this.mesh);
//     // }

//     getBox()
//     {
//         return this.box;
//     }
// }
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
        this.isStatic = true
        this.basePosition = this.mesh.position.clone()
        this.amplitude = new THREE.Vector3()
        this.speed     = new THREE.Vector3()
        this.phase     = new THREE.Vector3()
        this.previousPosition = this.mesh.position.clone()
        this.isActive = true
    }

    // ---------------------------
    // Factory pour plateforme mobile
    // ---------------------------
    static createMoving(scene, position, sizeX, sizeY, sizeZ, amplitude, speed, phase) {
        const plat = new Platform(scene, position, sizeX, sizeY, sizeZ)
        plat.isStatic = false
        plat.amplitude = amplitude.clone()
        plat.speed     = speed.clone()
        plat.phase     = phase.clone()
        return plat
    }

    update(elapsedTime) {
        this.previousPosition = this.mesh.position.clone()
        if (!this.isStatic) {
            this.mesh.position.x = this.basePosition.x + this.amplitude.x * Math.sin(elapsedTime * this.speed.x + this.phase.x)
            this.mesh.position.y = this.basePosition.y + this.amplitude.y * Math.sin(elapsedTime * this.speed.y + this.phase.y)
            this.mesh.position.z = this.basePosition.z + this.amplitude.z * Math.sin(elapsedTime * this.speed.z + this.phase.z)
        }
        this.box.setFromObject(this.mesh)
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
        clone.isStatic = this.isStatic
        clone.amplitude = this.amplitude.clone()
        clone.speed = this.speed.clone()
        clone.phase = this.phase.clone()
        return clone
    }


    getBox() {
        return this.box
    }
}

