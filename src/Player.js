import * as THREE from 'three'
import { randomColor } from './utils.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class Player {
    constructor(scene, position = new THREE.Vector3(), playerColor) {
        console.log(playerColor);
        const loader = new GLTFLoader()
        const geometry = new THREE.BoxGeometry(1, 2, 1)
        const material = new THREE.MeshBasicMaterial({ color: randomColor() , visible : false})
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.copy(position)
        this.mesh.position.y += 1;
        this.currentPlatform;

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
            this.animations = gltf.animations
            for (let i = 0; i < this.animations.length; i++)
            {
                console.log('anim ' + i + ' = ' +  this.animations[i].name);
            }
            // Exemple : jouer la première animation
            if (this.animations.length > 0) {
                this.currentAction = this.mixer.clipAction(this.animations[0])
                this.currentAction.play()
            }
            this.visual.traverse((child) => 
            {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial ({ color : playerColor })
                    this.material = child.material
                }
            })
            this.material.color.set(playerColor) // rouge
        })



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

    jump() {
        if (!this.isGrounded) return
        this.velocityY = this.jumpForce
        this.isGrounded = false
    }

    playAnimation(name) 
    {
        if (!this.animations) return

        const clip = this.animations.find(a => a.name === name)
        if (!clip) return

        if (this.currentAction && this.currentAction._clip === clip) return

        if (this.currentAction) this.currentAction.stop();

        this.currentAction = this.mixer.clipAction(clip)
        this.currentAction.loop = THREE.LoopRepeat // pour Run/Idle continu
        this.currentAction.play()
    }

    updateAnimation(direction, deltaTime) 
    {
        if (!this.mixer) return

        // Mettre à jour le mixer
        this.mixer.update(deltaTime) // ou deltaTime si tu le passes

        // Choisir l’animation
        if (direction.length() > 0 && this.isGrounded) 
        {
            console.log('Running !');
            this.playAnimation('Run')
        } 
        else if (!this.isGrounded) 
        {
            console.log('Jumping !');
            this.playAnimation('Jump')
        } 
        else 
        {
            console.log('Idle');
            this.playAnimation('Idle')
        }
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

        // if (this.isGrounded && this.currentPlatform && !this.currentPlatform.isStatic) 
        // {
        //     console.log(this.currentPlatform.mesh.position.z);
        //     const deltaPlatform = this.currentPlatform.mesh.position.clone().sub(this.currentPlatform.previousPosition)
        //     console.log('salut ' + deltaPlatform.y);
        //     this.mesh.position.add(deltaPlatform)  // ajouter le mouvement de la plateforme
        // }
    }

    getBox() {
        return this.box
    }

    addScore(points) {
        this.score += points
    }
}

