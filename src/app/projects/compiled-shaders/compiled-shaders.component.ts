import { AfterContentInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-compiled-shaders',
  imports: [],
  templateUrl: './compiled-shaders.component.html',
  styleUrl: './compiled-shaders.component.css'
})
export class CompiledShadersComponent implements AfterContentInit, OnDestroy {

  @ViewChild('threeContainer', { static: true, read: ElementRef }) threeContainer!: ElementRef;

  rendered: boolean = false;
  animationId: number = 0;

  currentTime: number = 0
  currentTimeMs = { value: 0 };

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

  cubeGeometry: THREE.BoxGeometry = new THREE.BoxGeometry( 1, 1, 1, 50, 50, 50 );
  //cubeGeometry: THREE.SphereGeometry = new THREE.SphereGeometry( 1, 50, 50 );
  cubeMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  cubeMesh: THREE.Mesh = new THREE.Mesh( this.cubeGeometry, this.cubeMaterial );

  ngAfterContentInit(): void {
      
    this.scene.background = new THREE.Color( 0x000022 );

    //this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.threeContainer.nativeElement.appendChild( this.renderer.domElement );
    this.threeContainer.nativeElement.appendChild( this.stats.dom );
    this.threeContainer.nativeElement.appendChild( this.guiPanel.domElement );

    //this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.cubeMaterial.onBeforeCompile = ((shader) => {
      shader.uniforms['time'] = this.currentTimeMs;
      shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
      `.replace(`#include <begin_vertex>`, `
        #include <begin_vertex>
        transformed.xz *= (sin(time + transformed.y * 2.0) + 2.0) * 0.5;
        `
      );
    });

    this.scene.add( this.cubeMesh );

    this.camera.position.y = 0;
    this.camera.position.z = -5;
    this.controls.update();

    this.animate();

    this.rendered = true;

  }

  animate(): void {

    this.animationId = requestAnimationFrame( this.animate.bind( this ) );

    this.currentTimeMs.value = performance.now() * 0.001;

    this.controls.update();
    this.renderer.render( this.scene, this.camera );

    this.stats.update();

  }

  ngOnDestroy(): void {
    
    this.rendered = false;
    cancelAnimationFrame( this.animationId );

  }
  
}
