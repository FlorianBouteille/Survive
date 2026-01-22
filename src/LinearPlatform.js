import * as THREE from 'three'
import { Platform } from './Platform.js'

export class LinearPlatform extends Platform {
    constructor(scene, positionA, positionB, sizeX, sizeY, sizeZ, travelTime, delay = 0, pauseTime = 0, finalStayTime = 0) {
        super(scene, positionA, sizeX, sizeY, sizeZ)
        
        this.positionA = positionA.clone()
        this.positionB = positionB.clone()
        this.travelTime = travelTime
        this.delay = delay
        this.pauseTime = pauseTime
        this.finalStayTime = finalStayTime
        this.isActive = true;
        this.isStatic = false;
        
        // Calcule le cycle total
        this.cycleTime = travelTime + finalStayTime + pauseTime
        this.totalElapsedTime = 0 // Temps global accumulé
    }

    update(elapsedTime) 
    {
        this.totalElapsedTime = elapsedTime
        
        let timeInCycle = (this.totalElapsedTime - this.delay) % this.cycleTime
        
        if (this.totalElapsedTime < this.delay) {
            this.mesh.position.copy(this.positionA)
            this.mesh.visible = true
        }
        else if (timeInCycle < this.travelTime) {
            this.mesh.visible = true
            const progress = timeInCycle / this.travelTime
            this.mesh.position.lerpVectors(this.positionA, this.positionB, progress)
        }
        else if (timeInCycle < this.travelTime + this.finalStayTime) {
            this.mesh.visible = true
            this.mesh.position.copy(this.positionB)
        }
        else {
            this.mesh.visible = false
            this.mesh.position.copy(this.positionA)
        }
        
        if (!this.mesh.visible)
            this.box.makeEmpty();
        else
            this.box.setFromObject(this.mesh)
        this.previousPosition = this.mesh.position.clone()
    }

    copy() {
        const geom = this.mesh.geometry
        const clone = new LinearPlatform(
            this.mesh.parent,
            this.positionA.clone(),
            this.positionB.clone(),
            geom.parameters.width,
            geom.parameters.height,
            geom.parameters.depth,
            this.travelTime,
            this.delay,
            this.pauseTime,
            this.finalStayTime
        )
        return clone
    }
}
