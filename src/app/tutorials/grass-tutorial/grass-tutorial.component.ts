import { AfterContentInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

@Component({
  selector: 'app-grass-tutorial',
  imports: [],
  templateUrl: './grass-tutorial.component.html',
  styleUrl: './grass-tutorial.component.css'
})
export class GrassTutorialComponent implements AfterContentInit, OnDestroy {

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
  * Grass Settings
  * 
  */

  grassBlades: number = 4096;
  grassBladeVertexHigh: number = 15;
  grassBladeVertexLow: number = 3;

  numGrassX: number = 64;
  numGrassY: number = 64;
  grassPatchSize: number = 8;

  numTileX: number = 10;
  numTileY: number = 10;

  /*
  *
  * Meshes
  * 
  */

  grassGeometryHigh: THREE.BufferGeometry = this.createGrassBlade( 0.1, 1.0, this.grassBladeVertexHigh );
  grassGeometryLow: THREE.BufferGeometry = this.createGrassBlade( 0.1, 1.0, this.grassBladeVertexLow );

  shaderMaterial: THREE.RawShaderMaterial = new THREE.RawShaderMaterial({ 
    vertexShader: vertexShader, fragmentShader: fragmentShader, side: THREE.DoubleSide,
    uniforms: {
      'uTime': { value: 0.0 }
    } 
  });
  
  groundGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry( 100, 100 );
  groundMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
  groundMesh: THREE.Mesh = new THREE.Mesh( this.groundGeometry, this.groundMaterial );

  ngAfterContentInit(): void {
      
    this.scene.background = new THREE.Color( 0x000022 );

    //this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.threeContainer.nativeElement.appendChild( this.renderer.domElement );
    this.threeContainer.nativeElement.appendChild( this.stats.dom );
    this.threeContainer.nativeElement.appendChild( this.guiPanel.domElement );

    //this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    let tiles = this.createTileGrid( this.numTileX, this.numTileY, this.grassPatchSize );
    for ( let i = 0; i < tiles.length; i++ ) {

      const g = this.createGrassTile( 
        this.grassGeometryHigh, this.numGrassX, this.numGrassY, this.grassPatchSize,
        new THREE.Vector3( tiles[i].x - ( ( this.numTileX * this.grassPatchSize ) / 2 ) + ( this.grassPatchSize / 2 ), tiles[i].y, tiles[i].z - ( ( this.numTileY * this.grassPatchSize ) / 2 ) + ( this.grassPatchSize / 2 ) )
      );
      const m = new THREE.Mesh( g, this.shaderMaterial );
      this.scene.add( m );

    }

    this.camera.position.y = 0.5;
    this.camera.position.z = -45;
    this.controls.update();

    this.animate();

    this.rendered = true;

  }

  animate(): void {

    this.animationId = requestAnimationFrame( this.animate.bind( this ) );

    this.currentTime = performance.now();
    this.shaderMaterial.uniforms['uTime'].value = this.currentTime * 0.001;

    this.controls.update();
    this.renderer.render( this.scene, this.camera );

    this.stats.update();

  }

  ngOnDestroy(): void {
    
    this.rendered = false;
    cancelAnimationFrame( this.animationId );

  }

  createTileGrid(numTileX: number = 10, numTileY: number = 10, tileSize: number = 16): THREE.Vector3[] {

    let tiles = [];

    for ( let i = 0; i < numTileX; i++ ) {

      const x = i * tileSize;

      for ( let j = 0; j < numTileY; j++ ) {

        const y = j * tileSize;
        tiles.push( new THREE.Vector3( x, 0.0, y ) );

      }

    }

    return tiles;

  }

  createGrassTile(grassGeometry: THREE.BufferGeometry, numGrassX: number = 32, numGrassY: number = 32, grassPatchSize: number = 16, origin: THREE.Vector3 = new THREE.Vector3()): THREE.InstancedBufferGeometry {

    let offsets = [];

    for ( let i = 0; i < numGrassX; ++i ) {

      const x = ( i /  numGrassY ) - 0.5;

      for ( let j = 0; j < numGrassY; ++j ) {

        const y = ( j /  numGrassY ) - 0.5;

        offsets.push( x * grassPatchSize + origin.x + ( ( Math.random() * 0.4 ) - 0.2 ) );
        offsets.push( 0.0 );
        offsets.push( y * grassPatchSize + origin.z + ( ( Math.random() * 0.4 ) - 0.2 ) );

      }

    }

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.instanceCount = this.grassBlades;
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( grassGeometry.getAttribute( 'position' ).array, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( grassGeometry.getAttribute( 'normal' ).array, 3 ) );
    geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( grassGeometry.getAttribute( 'uv' ).array, 2 ) );
    geometry.setIndex( grassGeometry.getIndex() );

    geometry.setAttribute( 'grassPosition', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );

    return geometry;

  }

  createGrassBlade(grassWidth: number = 0.2, grassHeight: number = 1.0, grassVertices: number = 15) {

    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    let numberOfVertices = 0;

    const grassCurve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2( grassWidth / 2, 0.0 ),
      new THREE.Vector2( grassWidth * 0.3, grassHeight * 0.9 ),
      new THREE.Vector2( 0.0, grassHeight ),
    );

    const segmentCount = ( grassVertices - 1 ) / 2;
    const grassInterval = 1 / ( segmentCount + 1 );

    for ( let i = 0; i <= segmentCount; i++ ) {

      let vertexCount = 0;

      for ( let iy = 0; iy < 2; iy++ ) {

        const progress = ( ( i - 1 ) + iy ) * grassInterval;

        for ( let ix = 0; ix < 2; ix++ ) {

          const point = grassCurve.getPoint( progress );
  
          vertices.push( ( -1 + ( 2 * ix ) ) * point.x, point.y, 0.0 );
          normals.push( 0.0, 0.0, 1.0 );
          uvs.push( ix, progress );

          vertexCount++;
  
        }

      }

      for ( let i = 0; i < 1; i++ ) {

        for ( let j = 0; j < 1; j++ ) {

          const a = numberOfVertices + 0;
          const b = numberOfVertices + 2;
          const c = numberOfVertices + 3;
          const d = numberOfVertices + 1;

          indices.push( a, b, d );
          indices.push( b, c, d );

        }

      }

      numberOfVertices += vertexCount;

    }

    for ( let i = 0; i < 2; i++ ) {

      const progress = segmentCount * grassInterval;
      const point = grassCurve.getPoint( progress );

      vertices.push( ( -1 + ( 2 * i ) ) * point.x, point.y, 0.0 );
      normals.push( 0.0, 0.0, 1.0 );
      uvs.push( i, progress );

    }

    vertices.push( 0.0, grassHeight, 0.0 );
    normals.push( 0.0, 0.0, 1.0 );
    uvs.push( 0.5, 1.0 );

    indices.push( numberOfVertices + 1, numberOfVertices, numberOfVertices + 2 );

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

    return geometry;

  }

}
