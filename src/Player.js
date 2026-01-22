import * as THREE from 'three'
import { randomColor } from './utils.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class Player {
    constructor(scene, position = new THREE.Vector3(), playerColor) {
        const loader = new GLTFLoader()
        const geometry = new THREE.BoxGeometry(1, 2, 1)
        const material = new THREE.MeshBasicMaterial({ color: randomColor() , visible : false})
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.copy(position)
        this.mesh.position.y += 1;
        this.currentPlatform;
        this.checkPoint = new THREE.Vector3(0, 2, 0);

        this.box = new THREE.Box3()

        loader.load('/character.glb', (gltf) => 
        {
            this.visual = gltf.scene
            this.visual.scale.set(1, 1, 1) // à ajuster
            this.visual.rotateY(Math.PI / 2);
            this.visual.position.set(0, -1, 0) // recentrage par rapport à la box
            this.mesh.add(this.visual)

            // Animations
            this.mixer = new THREE.AnimationMixer(this.visual)
            this.actions = {}
            this.animations = gltf.animations
            this.animations.forEach(clip => {
                const action = this.mixer.clipAction(clip)
                if (clip.name === 'Idle' )
                {
                    action.setEffectiveTimeScale(0.5)  // ici tu modifies la vitesse
                }
                else if (clip.name === 'Jump')
                {
                    action.setEffectiveTimeScale(0.4)  // ici tu modifies la vitesse
                }
                this.actions[clip.name] = action
            })
            this.visual.traverse((child) => 
            {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial ({ color : playerColor })
                    this.material = child.material
                }
            })
            //this.material.color.set(playerColor) 
        })



        // Mouvement / physique
        this.speed = 5
        this.velocityY = 0
        this.gravity = 12
        this.jumpForce = 6
        this.isGrounded = true
        this.halfHeight = 1;
        this.halfDepth = 0.5;
        this.halfWidth = 0.5;
        this.tolerance = 0.05

        this.score = 0
    }

    respawn()
    {
        this.mesh.position.x = this.checkPoint.x;
        this.mesh.position.y = this.checkPoint.y + 1;
        this.mesh.position.z = this.checkPoint.z;
    }

    move(direction, deltaTime, platforms) 
    {
        if (direction.length() === 0) return

        direction.normalize()
        if (this.visual) 
        {
            const angle = Math.atan2(direction.x, direction.z)
            this.visual.rotation.y = angle
        }
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

    jump() 
    {
        if (!this.isGrounded) return
        let platformVelocityY = 0
        if (this.currentPlatform && !this.currentPlatform.isStatic) 
            platformVelocityY = (this.currentPlatform.mesh.position.y - this.currentPlatform.previousPosition.y) * 50;
        this.velocityY = this.jumpForce + Math.max(0, platformVelocityY)
        this.isGrounded = false
    }

    playAnimation(name, duration = 0.2) 
    {
        if (!this.animations) return

        const clip = this.animations.find(a => a.name === name)
        if (!clip) return

        if (this.currentAction && this.currentAction._clip === clip) return

        const newAction = this.actions[name];
        newAction.loop = THREE.LoopRepeat
        newAction.reset()
        newAction.play()

        if (this.currentAction) {
            this.currentAction.crossFadeTo(newAction, duration, false)
        }

        this.currentAction = newAction
    }

    updateAnimation(direction, deltaTime) 
    {
        if (!this.mixer) return

        this.mixer.update(deltaTime)

        if (direction.length() > 0 && this.isGrounded) 
        {
            this.playAnimation('Run')
        } 
        else if (!this.isGrounded) 
        {
            this.playAnimation('Jump')
        } 
        else 
        {
            this.playAnimation('Idle')
        }
    }

    intersectsBoxXZ(otherBox)
    {
        if (this.box.max.x <= otherBox.min.x) return false
        if (this.box.min.x >= otherBox.max.x) return false
        if (this.box.max.z <= otherBox.min.z) return false
        if (this.box.min.z >= otherBox.max.z) return false

        const toleranceY = 2;
        const playerMinY = this.box.min.y
        const playerMaxY = this.box.max.y
        const otherMinY  = otherBox.min.y
        const otherMaxY  = otherBox.max.y

        if (playerMaxY < otherMinY - toleranceY) return false
        if (playerMinY > otherMaxY + toleranceY) return false

        return true
    }

    updatePhysics(deltaTime, platforms, direction) 
    {
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

        if (!this.isGrounded) 
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
                    const playerBottomAfter  = this.mesh.position.y - this.halfHeight;
                    const platformTop = platformBox.max.y

                    if (playerBottomBefore >= platformTop - this.tolerance && playerBottomAfter <= platformTop + this.tolerance)
                    {
                        this.velocityY = 0
                        this.mesh.position.y = platformTop + this.halfHeight
                        this.isGrounded = true
                        break
                    }
                }
            }
        }

        if (this.isGrounded && this.currentPlatform && !this.currentPlatform.isStatic) 
        {
            const deltaPlatform = this.currentPlatform.mesh.position.clone().sub(this.currentPlatform.previousPosition)
            this.mesh.position.add(deltaPlatform) 
        }


        for (let i = 0; i < platforms.length; i++)
        {
            if (platforms[i] != this.currentPlatform && this.intersectsBoxXZ(platforms[i].getBox()))
            {
                const deltaPlatform = platforms[i].mesh.position.clone().sub(platforms[i].previousPosition)
                this.mesh.position.add(deltaPlatform)
                console.log(platforms[i].mesh.position);
                console.log(deltaPlatform);
                this.box.setFromObject(this.mesh);
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

