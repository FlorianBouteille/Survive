import * as THREE from 'three'
import { Player } from './Player.js'

export class RemotePlayer extends Player {
    constructor(scene, position, color) {
        super(scene, position, color)

        // IA simple
        this.direction = new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize()

        this.changeTimer = 0
    }

    update(deltaTime, platforms) {
        this.changeTimer -= deltaTime

        if (this.changeTimer <= 0) {
            this.direction.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize()
            this.changeTimer = 2 + Math.random() * 2
        }
        if (Math.random() < 0.005)
            this.jump();

        this.move(this.direction, deltaTime, platforms)
        this.updatePhysics(deltaTime, platforms, this.direction)
        this.updateAnimation(this.direction, deltaTime)
    }
}