import * as THREE from 'three'
import { Player } from './Player.js'

export class LocalPlayer extends Player {
    constructor(scene, canvas) {
        super(scene, new THREE.Vector3(0, 1, 0))

        // Pivot yaw
        this.cameraPivot = new THREE.Object3D()
        this.cameraPivot.position.set(0, 1, 0)
        this.mesh.add(this.cameraPivot)

        // Caméra TPS
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        )
        this.camera.position.set(0, 0, -4)
        this.camera.rotation.y = Math.PI
        this.cameraPivot.add(this.camera)

        // Mouse
        this.pitch = 0
        this.mouseSensitivity = 0.005

        document.addEventListener('mousemove', e => this.onMouseMove(e))
        canvas.addEventListener('click', () => canvas.requestPointerLock())
    }

    onMouseMove(event) {
        this.cameraPivot.rotation.y -= event.movementX * this.mouseSensitivity

        this.pitch += event.movementY * this.mouseSensitivity
        this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 6, Math.PI / 4)
        this.camera.rotation.x = this.pitch
    }

    getMovementVectors() {
        const forward = new THREE.Vector3()
        this.cameraPivot.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()

        const right = new THREE.Vector3()
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

        return { forward, right }
    }

    update(deltaTime, keys, platforms) {
        const { forward, right } = this.getMovementVectors()
        const move = new THREE.Vector3()
        let directions = new THREE.Vector3(0, 0, 0);

        if (keys.w)
        {
            move.add(forward)
            directions.z += 1;
        } 
        if (keys.s) 
        {
            move.sub(forward);
            directions.z -= 1;
        }
        if (keys.d) 
        {
            move.add(right)
            directions.x += 1;
        } 
        if (keys.a) 
        {
            move.sub(right)
            directions.x -= 1;
        }

        if (keys.space) this.jump()

        this.move(move, deltaTime, platforms)
        this.updatePhysics(deltaTime, platforms, directions)
    }
}