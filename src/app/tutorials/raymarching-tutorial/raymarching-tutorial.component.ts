import { AfterContentInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

@Component({
  selector: 'app-raymarching-tutorial',
  imports: [],
  templateUrl: './raymarching-tutorial.component.html',
  styleUrl: './raymarching-tutorial.component.css'
})
export class RaymarchingTutorialComponent implements AfterContentInit, OnDestroy {

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

  geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry( 5, 5 );
  material: THREE.ShaderMaterial = new THREE.ShaderMaterial({ 
    vertexShader: vertexShader, fragmentShader: fragmentShader, side: THREE.DoubleSide,
    uniforms: {
      'uTime': { value: 0.0 },
      'uCameraWorldMatrix': { value: this.camera.matrixWorld },
      'uCameraProjectionMatrixInverse': { value: this.camera.projectionMatrixInverse }
    }
  });
  mesh: THREE.Mesh = new THREE.Mesh( this.geometry, this.material );

  ngAfterContentInit(): void {
      
    this.scene.background = new THREE.Color( 0x000022 );

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.threeContainer.nativeElement.appendChild( this.renderer.domElement );
    this.threeContainer.nativeElement.appendChild( this.stats.dom );
    this.threeContainer.nativeElement.appendChild( this.guiPanel.domElement );

    this.scene.add( this.mesh );

    this.camera.position.z = 5;
    this.controls.update();

    this.animate();

    this.rendered = true;

  }

  animate(): void {

    this.animationId = requestAnimationFrame( this.animate.bind( this ) );

    this.currentTime = performance.now();
    this.material.uniforms['uTime'].value = this.currentTime * 0.001;
    this.material.uniforms['uCameraWorldMatrix'].value = this.camera.matrixWorld;
    this.material.uniforms['uCameraProjectionMatrixInverse'].value = this.camera.projectionMatrixInverse;

    this.controls.update();
    this.renderer.render( this.scene, this.camera );

    this.stats.update();

  }

  ngOnDestroy(): void {
    
    this.rendered = false;
    cancelAnimationFrame( this.animationId );

  }

}
