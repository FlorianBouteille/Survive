import * as THREE from 'three'
import {randomColor} from './utils.js'

export class Player {
    constructor(scene, canvas) {
        // Cube du joueur
        const geometry = new THREE.BoxGeometry(1, 2, 1)
        const material = new THREE.MeshBasicMaterial({ color: randomColor() })
        console.log(material.color);
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.set(0, 1, 0)
        scene.add(this.mesh)

        this.speed = 5
        this.velocityY = 0
        this.isJumping = false;
        this.gravity = 10;
        this.jumpForce = 7;

        // Pivot pour rotation horizontale (yaw)
        this.cameraPivot = new THREE.Object3D()
        this.cameraPivot.position.set(0, 1, 0) // hauteur des yeux
        this.mesh.add(this.cameraPivot)

        // Caméra TPS
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100)
        this.camera.position.set(0, 1, -4) // recul + hauteur
        this.camera.rotation.y = Math.PI // Tourner de 180° pour regarder vers le joueur
        this.cameraPivot.add(this.camera)

        // Sensibilité souris
        this.mouseSensitivity = 0.005
        this.pitch = 0

        // Écoute souris
        document.addEventListener('mousemove', (e) => this.onMouseMove(e))
    }

    onMouseMove(event) {
        // rotation horizontale
        this.cameraPivot.rotation.y -= (event.movementX * this.mouseSensitivity)

        // rotation verticale (pitch)
        this.pitch -= event.movementY * this.mouseSensitivity
        this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI, Math.PI/8)
        this.camera.rotation.x = - this.pitch / 3
    }

    // Forward et Right sur XZ
    getMovementVectors() {
        const forward = new THREE.Vector3()
        this.cameraPivot.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()

        const right = new THREE.Vector3()
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

        return { forward, right }
    }

    update(deltaTime, keys) {
        const { forward, right, } = this.getMovementVectors()
        const move = new THREE.Vector3()

        console.log(this.velocityY);
        if (keys.w) move.add(forward)
        if (keys.s) move.sub(forward)
        if (keys.d) move.add(right)
        if (keys.a) move.sub(right)
        if (keys.space && !this.isJumping)
        {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
        if (this.isJumping)
        {
            this.velocityY -= this.gravity * deltaTime;
            this.mesh.position.y += this.velocityY * deltaTime;
        }
        if (this.mesh.position.y <= 0.5)
        {
            this.mesh.position.y = 0.5;
            this.velocityY = 0;
            this.isJumping = false;
        }
        if (move.length() > 0) {
            move.normalize()
            move.multiplyScalar(this.speed * deltaTime)
            this.mesh.position.add(move)
        }
    }
}