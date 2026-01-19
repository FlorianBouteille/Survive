import * as THREE from 'three'
import { randomColor } from './utils.js'

export class Player {
    constructor(scene, position = new THREE.Vector3()) {
        const geometry = new THREE.BoxGeometry(1, 2, 1)
        const material = new THREE.MeshBasicMaterial({ color: randomColor() })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.copy(position)
        this.mesh.position.y += 1;
        this.currentPlatform;
        scene.add(this.mesh)

        this.box = new THREE.Box3()

        // Mouvement / physique
        this.speed = 5
        this.velocityY = 0
        this.gravity = 10
        this.jumpForce = 7
        this.isGrounded = true
        this.halfHeight = 1;
        this.halfDepth = 0.5;
        this.halfWidth = 0.5;
        this.tolerance = 0.05

        this.score = 0
    }

    respawn()
    {
        this.mesh.position.x = 0;
        this.mesh.position.y = 2;
        this.mesh.position.z = 0;
    }

    move(direction, deltaTime, platforms) 
    {
        if (direction.length() === 0) return

        direction.normalize()
        direction.multiplyScalar(this.speed * deltaTime)

        // --- Axe X ---
        if (direction.x !== 0) {
            const tempBoxX = this.box.clone()
            tempBoxX.translate(new THREE.Vector3(direction.x, 0, 0))

            let canMoveX = true
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i]
                if (!platform.isActive || platform === this.currentPlatform) continue

                if (platform.getBox().intersectsBox(tempBoxX)) {
                    canMoveX = false
                    break
                }
            }

            if (canMoveX) this.mesh.position.x += direction.x
        }

        // --- Axe Z ---
        if (direction.z !== 0) {
            const tempBoxZ = this.box.clone()
            tempBoxZ.translate(new THREE.Vector3(0, 0, direction.z))

            let canMoveZ = true
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i]
               if (!platform.isActive || platform === this.currentPlatform) continue

                if (platform.getBox().intersectsBox(tempBoxZ)) {
                    canMoveZ = false
                    break
                }
            }

            if (canMoveZ) this.mesh.position.z += direction.z
        }

        // --- Mise à jour finale de la box ---
        this.box.setFromObject(this.mesh)
    }

    jump() {
        if (!this.isGrounded) return
        this.velocityY = this.jumpForce
        this.isGrounded = false
    }

    updatePhysics(deltaTime, platforms, direction) 
    {
        console.log(this.isGrounded);
        if (this.mesh.position.y < -5)
        {
            this.respawn();
        }
        const previousY = this.mesh.position.y
        const previousX = this.mesh.position.x
        const previousZ = this.mesh.position.z

        if (!this.isGrounded) 
        {
            this.velocityY -= this.gravity * deltaTime
            this.mesh.position.y += this.velocityY * deltaTime
        }
        this.isGrounded = false

        this.box.setFromObject(this.mesh)

        if (this.velocityY <= 0) 
        {
            for (let i = 0; i < platforms.length; i++)
            {
                const platform = platforms[i]
                if (!platform.isActive) 
                    continue

                const platformBox = platform.getBox()
                if (platformBox.intersectsBox(this.box))
                {
                    this.currentPlatform = platform;
                    const playerBottomBefore = previousY - this.halfHeight
                    const platformTop = platformBox.max.y

                    // Atterrissage valide seulement si on arrive par le dessus
                    if (playerBottomBefore >= platformTop - this.tolerance)
                    {
                        this.velocityY = 0
                        this.mesh.position.y = platformTop + this.halfHeight
                        this.isGrounded = true
                        break
                    }
                }
            }
        }
    }

    getBox() {
        return this.box
    }

    addScore(points) {
        this.score += points
    }
}

