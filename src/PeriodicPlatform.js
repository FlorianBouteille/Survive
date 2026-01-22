import * as THREE from 'three'
import { Platform } from './Platform.js'

export class PeriodicPlatform extends Platform {
    constructor(scene, position, sizeX, sizeY, sizeZ, amplitude, speed, phase) {
        super(scene, position, sizeX, sizeY, sizeZ)
        this.amplitude = amplitude.clone()
        this.speed = speed.clone()
        this.phase = phase.clone()
        this.isStatic = false;
    }

    update(elapsedTime) {
        this.previousPosition = this.mesh.position.clone()
        this.mesh.position.x = this.basePosition.x + this.amplitude.x * Math.sin(elapsedTime * this.speed.x + this.phase.x)
        this.mesh.position.y = this.basePosition.y + this.amplitude.y * Math.sin(elapsedTime * this.speed.y + this.phase.y)
        this.mesh.position.z = this.basePosition.z + this.amplitude.z * Math.sin(elapsedTime * this.speed.z + this.phase.z)
        this.box.setFromObject(this.mesh)
    }

    copy() {
        const geom = this.mesh.geometry
        const clone = new PeriodicPlatform(
            this.mesh.parent,
            this.basePosition.clone(),
            geom.parameters.width,
            geom.parameters.height,
            geom.parameters.depth,
            this.amplitude.clone(),
            this.speed.clone(),
            this.phase.clone()
        )
        return clone
    }
}
