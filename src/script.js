import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import GUI from 'lil-gui'
import { Player } from './player.js'
import { Coin } from './coin.js'
import {randomColor} from './utils.js'
import gsap from 'gsap'


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

// Objects
const groundGeo = new THREE.PlaneGeometry(40, 40);
groundGeo.rotateX(- Math.PI / 2);
const groundMaterial = new THREE.MeshBasicMaterial({color : randomColor()});
const ground = new THREE.Mesh(groundGeo, groundMaterial);
ground.position.y -= 0.5;
scene.add(ground);
const player = new Player(scene, canvas);
scene.add(player.mesh);
const grid = new THREE.GridHelper(50, 50);
scene.add(grid);
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

const coin = new Coin(2, 2);
const coins = new Array();
let nb_of_coins = 10;

for (let i = 0; i < nb_of_coins; i++)
{
    const posX = Math.round(Math.random() * 20 - Math.random() * 20);
    const posZ = Math.round(Math.random() * 20 - Math.random() * 20);
    console.log(posX, posZ);
    coins.push(new Coin(posX, posZ));
}
for (let i = 0; i < nb_of_coins; i++)
{
    scene.add(coins[i].mesh);
}
// GUI 
const cube = gui.addFolder('The cube');
cube.add(player.mesh.position, 'x', -10, 10, 0.1).name('cubeX');
cube.add(player.mesh.scale, 'x', 0, 10, 0.2).name('sizeX');
cube.add(player.mesh.scale, 'y', 0, 10, 0.2).name('sizeY');
cube.add(player.mesh.scale, 'z', 0, 10, 0.2).name('sizeZ');
gui.add(mouse, 'sensitivity', 0.1, 8, 0.1).name('mousePower');

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const deltaTime = clock.getDelta()

    player.update(deltaTime, keys);
    coins[2].update(deltaTime);
    mouse.deltaX = 0;
    mouse.deltaY = 0;
    // Render
    renderer.render(scene, player.camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()