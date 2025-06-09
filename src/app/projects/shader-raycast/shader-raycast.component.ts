import { AfterContentInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

@Component({
  selector: 'app-shader-raycast',
  imports: [],
  templateUrl: './shader-raycast.component.html',
  styleUrl: './shader-raycast.component.css'
})
export class ShaderRaycastComponent implements AfterContentInit, OnDestroy {

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
  * Raycaster Settings
  * 
  */

  raycaster: THREE.Raycaster = new THREE.Raycaster();
  pointer: THREE.Vector2 = new THREE.Vector2();
  displacementMax: number = 0.75;

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

  geometry: THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry( 3, 10 );
  material: THREE.ShaderMaterial = new THREE.ShaderMaterial({ 
    vertexShader: vertexShader, fragmentShader: fragmentShader, side: THREE.DoubleSide,
    uniforms: {
      'uDisplacementPoint': { value: new THREE.Vector3() },
      'uDisplacementMax': { value: this.displacementMax }
    }
  });
  mesh: THREE.Mesh = new THREE.Mesh( this.geometry, this.material );

  planeGeometry: THREE.CircleGeometry = new THREE.CircleGeometry( 10 );
  planeMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  planeMesh: THREE.Mesh = new THREE.Mesh( this.planeGeometry, this.planeMaterial );

  ngAfterContentInit(): void {
      
    this.scene.background = new THREE.Color( 0x000022 );

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.threeContainer.nativeElement.appendChild( this.renderer.domElement );
    this.threeContainer.nativeElement.appendChild( this.stats.dom );
    this.threeContainer.nativeElement.appendChild( this.guiPanel.domElement );

    this.scene.add( this.mesh );

    this.planeMesh.visible = false;
    this.scene.add( this.planeMesh );

    this.camera.position.z = 10;
    this.controls.update();

    this.animate();

    this.rendered = true;

  }

  animate(): void {

    this.animationId = requestAnimationFrame( this.animate.bind( this ) );

    this.currentTime = performance.now();
    this.planeMesh.rotation.set( this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z );

    this.controls.update();

    this.raycast();

    this.renderer.render( this.scene, this.camera );

    this.stats.update();

  }

  ngOnDestroy(): void {
    
    this.rendered = false;
    cancelAnimationFrame( this.animationId );

  }

  raycast(): void {

    this.raycaster.setFromCamera( this.pointer, this.camera );

    const intersects = this.raycaster.intersectObjects( this.scene.children, true );
    let intersection = new THREE.Vector3();

    if ( intersects.length > 0 ) {

      intersection = intersects[0].point;

    }

    let displacementPoint = new THREE.Vector3().subVectors( intersection, this.mesh.position ).normalize();
    displacementPoint.multiplyScalar( this.geometry.parameters.radius + this.displacementMax );

    this.material.uniforms['uDisplacementPoint'].value = displacementPoint;

  }

  onPointerMove(event: PointerEvent): void {

    this.pointer.x = ( ( event.clientX / window.innerWidth ) * 2 ) - 1;
    this.pointer.y = -( ( event.clientY / window.innerHeight ) * 2 ) + 1;

  }

}
