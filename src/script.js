import * as THREE from 'three'
import GUI from 'lil-gui'
import { LocalPlayer } from './LocalPlayer.js'
import { Coin } from './coin.js'
import { Platform } from './Platform.js'
import {randomColor} from './utils.js'
import { Vector2 } from 'three'


const gui = new GUI({
    width: 300,
    title: "tweak shit here"
});

gui.hide();
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//scene.add(gui);

const mouse = 
{
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    sensitivity: 1
}

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('mousemove', (event) =>
{
    let newX = (event.clientX / sizes.width) * 2 - 1
    let newY =  - (event.clientY / sizes.height) * 2 + 1
    mouse.deltaX = mouse.x - newX;
    mouse.deltaY = mouse.y - newY;
    mouse.x = newX;
    mouse.y = newY;
})

window.addEventListener('keydown', (event) => {
    if (event.key == 'h')
        gui.show(gui._hidden);
})

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
{
    console.log('loading started')
}
loadingManager.onLoad = () =>
{
    console.log('loading finished')
}
loadingManager.onProgress = () =>
{
    console.log('loading progressing')
}
loadingManager.onError = () =>
{
    console.log('loading error')
}

function placeMarker(posX, posZ, theColor)
{
    const material = new THREE.MeshBasicMaterial({color : theColor});
    const geo = new THREE.BoxGeometry(1, 2, 1);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.x = posX;
    mesh.position.z = posZ;
    scene.add(mesh);
}

placeMarker(0, -20, 0xff0000);
placeMarker(0, 20, 0x0000ff);
placeMarker(-20, 0, 0x000000);
placeMarker(20, 0, 0xffffff);

const coins = new Array();
function addPlatforms(scene)
{
    let Platforms = new Array();
    Platforms.push(new Platform(scene, new THREE.Vector3(0, 0, 0), 5, 1, 5))
    let posY = 0;
    for (let i = 0; i < 15; i++)
    {
        let posX = 2 + i * 7 + Math.random() * 2;
        posY += Math.random();
        let size = Math.random() * 3 + 2;
        Platforms.push(new Platform(scene, new THREE.Vector3(posX, posY, 0), size, 1, size));
        coins.push(new Coin(posX, posY + 1.3, 0));
        scene.add(coins[i].mesh);
    }
    Platforms[1].isStatic = false;
    return (Platforms)
}

// Objects
const player = new LocalPlayer(scene, canvas, 0xffffff);
scene.add(player.mesh);
const grid = new THREE.GridHelper(50, 50);
scene.add(grid);

const platforms = addPlatforms(scene);
// Sizes

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const keys =
{
    w : false,
    s : false,
    a : false,
    d : false,
    space : false
}
const light = new THREE.HemisphereLight(0xaa1212, 50);
scene.add(light);
// Camera

function onKey(event) 
{
    if (event.code === 'KeyW')
        keys.w = (event.type === 'keydown')
    if (event.code === 'KeyS')
        keys.s = (event.type === 'keydown')
    if (event.code === 'KeyA')
        keys.a = (event.type === 'keydown')
    if (event.code === 'KeyD')
        keys.d = (event.type === 'keydown')
    if (event.code === 'Space')
        keys.space = (event.type === 'keydown')
    //console.log(keys);
}

window.addEventListener('keydown', onKey)
window.addEventListener('keyup', onKey)

// Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// GUI 
const cube = gui.addFolder('The cube');
const platformsGui = gui.addFolder('Plateformes')
for (let i = 0; i < platforms.length; i++)
{
    const platformFolder = platformsGui.addFolder('Plateforme $(i)')
    {
        platformFolder.add(platforms[i].mesh.position, 'x', -30, 30, 1).name('posX');
        platformFolder.add(platforms[i].mesh.position, 'z', -30, 30, 1).name('posZ');
        platformFolder.add(platforms[i].mesh.scale, 'x', -30, 30, 1).name('sizeX');
        platformFolder.add(platforms[i].mesh.scale, 'z', -30, 30, 1).name('sizeZ');
    }
}

cube.add(player.mesh.position, 'x', -10, 10, 0.1).name('cubeX');
cube.add(player.mesh.scale, 'x', 0, 10, 0.2).name('sizeX');
cube.add(player.mesh.scale, 'y', 0, 10, 0.2).name('sizeY');
cube.add(player.mesh.scale, 'z', 0, 10, 0.2).name('sizeZ');
gui.add(mouse, 'sensitivity', 0.1, 8, 0.1).name('mousePower');

// Animate
const clock = new THREE.Clock()

let movingPlatforms = new Array();
movingPlatforms.push(platforms[1])

const tick = () =>
{
    const deltaTime = clock.getDelta()
    const elapsedTime = clock.getElapsedTime();

    for (let i = 0; i < movingPlatforms.length; i++)
    {
        movingPlatforms[i].update(elapsedTime);
    }
    player.update(deltaTime, keys, platforms);
    //platforms[1].update(elapsedTime);
    for (let i = 0; i < coins.length; i++)
    {
        coins[i].update(deltaTime);
        if (coins[i].getBox().intersectsBox(player.getBox()))
        {
            scene.remove(coins[i].mesh);
            coins.splice(i, 1);
            player.addScore(10);
            break ;
        }
    }
    // Render
    renderer.render(scene, player.camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()