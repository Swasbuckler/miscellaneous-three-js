import { AfterContentInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

@Component({
  selector: 'app-shader-tutorial',
  imports: [],
  templateUrl: './shader-tutorial.component.html',
  styleUrl: './shader-tutorial.component.css'
})
export class ShaderTutorialComponent implements AfterContentInit, OnDestroy {

  @ViewChild('threeContainer', { static: true, read: ElementRef }) threeContainer!: ElementRef;

  rendered: boolean = false;
  animationId: number = 0;

  currentTime: number = 0;

  /*
  * 
  * Scene Properties
  * 
  */

  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

  controls: OrbitControls = new OrbitControls( this.camera, this.renderer.domElement );

  /*
  *
  * GUI
  * 
  */

  stats: Stats = new Stats();

  guiPanel: GUI = new GUI();

  /*
  *
  * Meshes
  * 
  */

  tutorialGeometry: THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry( 3, 100 );
  tutorialMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial({ 
    vertexShader: vertexShader, fragmentShader: fragmentShader, 
    uniforms: {
      'uTime': { value: 0.0 }
    }
  });
  tutorialMesh: THREE.Mesh = new THREE.Mesh( this.tutorialGeometry, this.tutorialMaterial );

  ngAfterContentInit(): void {
      
    this.scene.background = new THREE.Color( 0x000022 );

    //this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.threeContainer.nativeElement.appendChild( this.renderer.domElement );
    this.threeContainer.nativeElement.appendChild( this.stats.dom );
    this.threeContainer.nativeElement.appendChild( this.guiPanel.domElement );

    //this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    //this.tutorialMesh = new THREE.Mesh( this.tutorialGeometry, this.tutorialMaterial );

    this.scene.add( this.tutorialMesh );

    this.camera.position.z = 10;
    this.controls.update();

    this.animate();

    this.rendered = true;

  }

  animate(): void {

    this.animationId = requestAnimationFrame( this.animate.bind( this ) );

    this.currentTime = performance.now();
    this.tutorialMaterial.uniforms['uTime'].value = this.currentTime * 0.001;

    this.controls.update();
    this.renderer.render( this.scene, this.camera );

    this.stats.update();

  }

  ngOnDestroy(): void {
    
    this.rendered = false;
    cancelAnimationFrame( this.animationId );

  }

}
