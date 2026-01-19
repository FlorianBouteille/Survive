import * as THREE from 'three'
import { Player } from './Player.js'

export class RemotePlayer extends Player {
    constructor(scene, position) {
        super(scene, position)

        // IA simple
        this.direction = new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize()

        this.changeTimer = 0
    }

    update(deltaTime) {
        this.changeTimer -= deltaTime

        if (this.changeTimer <= 0) {
            this.direction.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize()
            this.changeTimer = 2 + Math.random() * 2
        }

        this.move(this.direction, deltaTime)
        this.updatePhysics(deltaTime)
    }
}