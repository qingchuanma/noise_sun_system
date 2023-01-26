import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect.js'
import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'
import sunNoiseVertexShader from './shaders/sunNoiseVertexShader.glsl'
import sunNoiseFragmentShader from './shaders/sunNoiseFragmentShader.glsl'
import sunVertexShader from './shaders/sunVertexShader.glsl'
import sunFragmentShader from './shaders/sunFragmentShader.glsl'
import sunSurfaceVertexShader from './shaders/sunSurfaceVertexShader.glsl'
import sunSurfaceFragmentShader from './shaders/sunSurfaceFragmentShader.glsl'
import { Mesh, RedFormat } from 'three'

const group = new THREE.Group();
const Pgroup = new THREE.Group();
var scene
var camera
var renderer
var axesHelper
var controls
var effect

function init(){
//setting basic environment and link render output ,the canvas, to the html file
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.01,1000);
renderer = new THREE.WebGLRenderer();
camera.position.set(0,0,3);
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);//connect renderer output(canvas) with html element

//setting light 
let light = new THREE.AmbientLight(0x404040,1);//soft white light
scene.add(light);

//setting axes
axesHelper = new THREE.AxesHelper(20);
//scene.add(axesHelper)

//setting controls
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 2;
controls.enablePan = true;

//setting group object to combine objects into one group
//group = new THREE.Group();

}

//uniform data detailed
const Clock = new THREE.Clock();
const flowTexture = new THREE.TextureLoader().load('./images/flow.png');
flowTexture.wrapS = THREE.RepeatWrapping;
flowTexture.wrapT = THREE.RepeatWrapping;
const noiseTexture = new THREE.TextureLoader().load('./images/noise.png');
noiseTexture.wrapS = THREE.RepeatWrapping;
noiseTexture.wrapT = THREE.RepeatWrapping;
const rgbaNoiseTexture = new THREE.TextureLoader().load('./images/rgba.jpg');

//define uniform data
var uniformData = {
  u_time:{
    value:0.0,
  },
  u_flowTexture:{
    value: flowTexture,
  },
  u_noiseTexture:{
    //value: noiseTexture,
    value: null,
  },
  u_resolution:{
    value:new THREE.Vector2(innerWidth,innerHeight)
  },
  u_velocity:{
    value:0.05
  },
  u_brightness:{
    value:0.3
  },
  u_stagger:{
    value:16
  },
  u_rgbaNoiseTexture:{
    value:rgbaNoiseTexture,
  },
  u_intersection:{
    value:true
  },
  u_progress:{
    value:0.
  }
}




//setting cube render scene for mapping noise texture cube render target+cube camera are needed
const cubeRT = new THREE.WebGLCubeRenderTarget(256);
const cubeCamera = new THREE.CubeCamera(0.1,10,cubeRT);



//define star points
class Point {
  constructor() {
    this.range = 1000; // distribution range
    this.center = { // distribution center
      x: 0,
      y: 0,
      z: 0,
    }
    this.position = { //point position 
      x: Math.random() *2* this.range + this.center.x - this.range,
      y: Math.random() * 2*this.range + this.center.y - this.range,
      z: Math.random() * 2* this.range + this.center.z - this.range
    };
    this.speed = { // movement speed
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: Math.random() * 10 - 5,
    }
    this.color = '#aaa';
    this.createTime = Date.now(); // create time
    this.updateTime = Date.now(); // last update time
    
  }
  updatePosition() {
    const time = Date.now() - this.updateTime
    this.updateTime = Date.now()
    this.position.x += this.speed.x * time / 1000
    this.position.y += this.speed.y * time / 1000
    this.position.z += this.speed.z * time / 1000
    
    
  }

}

 // create batch of star points
 const vertices = []
 for (let i = 0; i < (window.innerWidth >1000 ? 10000 : 2000); i++) {
   vertices.push(new Point())
 }

const geometry = new THREE.BufferGeometry(2,15,15);
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3)); 

// create texture
const textureStar = new THREE.TextureLoader().load( './images/disc.png' );
const material = new THREE.PointsMaterial({
  //color: '#000000',
  size: 8,
  map: textureStar,

  transparent: true,
  depthWrite: false,

});


const points = new THREE.Points(geometry, material);
group.add(points);
Pgroup.add(points)

// update star positions constantly
setInterval(() => {
  const list = []
  vertices.forEach(point => {
    point.updatePosition()
    const { x, y, z } = point.position
    list.push(x, y, z)
  })
  // update position in geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(list), 3));

}, 50)



//create backgroud
const materialColor = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load(
    './images/space.png'
  ),
  depthTest: false,
  side:THREE.DoubleSide,
  transparent:false
})


const bg = new THREE.Mesh(
new THREE.SphereGeometry(5,15,15),
materialColor
)




//setting sun noise texture 
const sunNoiseGeometry = new THREE.SphereGeometry(1,150,150);
const sunNoiseMaterial = new THREE.ShaderMaterial({
  vertexShader: sunNoiseVertexShader,
  fragmentShader: sunNoiseFragmentShader,
  side: THREE.DoubleSide,
  transparent:false,
  uniforms:uniformData,
})
var sunNoise = new THREE.Mesh(sunNoiseGeometry,sunNoiseMaterial);

//setting sun
const sunGeometry = new THREE.SphereGeometry(1,150,150);
const sunMaterial = new THREE.ShaderMaterial({
  uniforms:uniformData,
  vertexShader:sunVertexShader,
  fragmentShader:sunFragmentShader,
  transparent:false,
});

var sun = new THREE.Mesh(sunGeometry,sunMaterial);

group.add(sunNoise);
group.add(sun);

//group.add(bg);
// eventlistener

document.addEventListener('keydown',function(e){
  if(e.key == 'Enter'){
    console.log(e.key)
    //press one time : Mesh -> Points -> explode
    const sunPNoise = new THREE.Points(sunNoiseGeometry,sunNoiseMaterial);
    const sunP = new THREE.Points(sunGeometry,sunMaterial);

    Pgroup.add(points);
    Pgroup.add(sunPNoise);
    Pgroup.add(sunP);
    //Pgroup.add(bg);
    group.visible = false;
    Pgroup.visible = true;
    uniformData.u_intersection.value = false;
    console.log(Pgroup)
  }
  if(e.key == ' '){
    console.log(e.key)
    //press two time : explode -> Mesh
    uniformData.u_intersection.value = true;
    console.log(uniformData.u_intersection)
    uniformData.u_time.value = 0.3;
    
    //uniformData.u_time.value = 0.0;
    group.add(points)
    //group.add(bg)
    Pgroup.visible = false;
    group.visible = true;
    //group.bg.visible=false;
    console.log(group)

  }
  if(e.key == 'q'){
    group.add(bg)
    Pgroup.add(bg)
  }

})



console.log(group)

function animate(){
  scene.add(group);
  scene.add(Pgroup);
  requestAnimationFrame(animate);
  camera.lookAt(scene.position);
  cubeCamera.update(renderer,scene);//have to be implemented when using the cubeCamera
  uniformData.u_time.value = Clock.getElapsedTime();
  uniformData.u_noiseTexture.value = cubeRT.texture;
  controls.update();
  renderer.render(scene,camera);
}


  
 

window.onload = () => {
init();
animate();

};