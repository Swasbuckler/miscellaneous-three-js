import { AfterContentInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

@Component({
  selector: 'app-cloud-tutorial',
  imports: [],
  templateUrl: './cloud-tutorial.component.html',
  styleUrl: './cloud-tutorial.component.css'
})
export class CloudTutorialComponent implements AfterContentInit, OnDestroy {

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
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

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
  * Cloud Settings
  * 
  */

  frustumHeight: number = 2.0 * this.camera.near * Math.tan( this.camera.fov * 0.5 * ( Math.PI / 180 ) );
  frustumWidth: number = this.frustumHeight * this.camera.aspect;

  noise: Noise = new Noise();
  cloudNoiseData: number[][] = this.createPerlin2dNoise( this.noise, 0, 256, 256, 3, 5, 2, 0.5, 0, 0 );
  cloudNoiseTexture: THREE.DataTexture = new THREE.DataTexture( this.generateNoiseImageData( this.cloudNoiseData ), 256, 256 );

  blueNoiseTexture: THREE.Texture = new THREE.TextureLoader().load( "/blue-noise-pattern.jpg" );

  /*
  *
  * Meshes
  * 
  */

  geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry( this.frustumWidth, this.frustumHeight );
  material: THREE.ShaderMaterial = new THREE.ShaderMaterial({ 
    vertexShader: vertexShader, fragmentShader: fragmentShader, side: THREE.DoubleSide, transparent: true,
    uniforms: {
      'uTime': { value: 0.0 },
      'uCameraWorldMatrix': { value: this.camera.matrixWorld },
      'uCameraProjectionMatrixInverse': { value: this.camera.projectionMatrixInverse },
      'uNoise': { value: this.cloudNoiseTexture },
      'uBlueNoise': { value: this.blueNoiseTexture },
      'uFrame': { value: 0 }
    }
  });
  mesh: THREE.Mesh = new THREE.Mesh( this.geometry, this.material );

  cubeGeometry: THREE.BoxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
  cubeMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  cubeMesh: THREE.Mesh = new THREE.Mesh( this.cubeGeometry, this.cubeMaterial );

  ngAfterContentInit(): void {
      
    this.scene.background = new THREE.Color( 0x000022 );

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.threeContainer.nativeElement.appendChild( this.renderer.domElement );
    this.threeContainer.nativeElement.appendChild( this.stats.dom );
    this.threeContainer.nativeElement.appendChild( this.guiPanel.domElement );

    this.cloudNoiseTexture.needsUpdate = true;
    this.cloudNoiseTexture.wrapS = THREE.RepeatWrapping;
    this.cloudNoiseTexture.wrapT = THREE.RepeatWrapping;
    this.cloudNoiseTexture.minFilter = THREE.NearestMipMapLinearFilter;
    this.cloudNoiseTexture.magFilter = THREE.LinearFilter;

    this.blueNoiseTexture.wrapS = THREE.RepeatWrapping;
    this.blueNoiseTexture.wrapT = THREE.RepeatWrapping;
    this.blueNoiseTexture.minFilter = THREE.NearestMipMapLinearFilter;
    this.blueNoiseTexture.magFilter = THREE.LinearFilter;

    this.scene.add( this.mesh );
    this.scene.add( this.cubeMesh );

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
    this.material.uniforms['uFrame'].value += 1;

    this.controls.update();

    this.mesh.position.copy( this.camera.position.clone().add( this.camera.getWorldDirection( new THREE.Vector3() ).multiplyScalar( this.camera.near ) ) );
    this.mesh.rotation.copy( this.camera.rotation );

    this.renderer.render( this.scene, this.camera );

    this.stats.update();

  }

  ngOnDestroy(): void {
    
    this.rendered = false;
    cancelAnimationFrame( this.animationId );

  }

  inverseLerp(a: number, b: number, v: number): number {

    return (v - a) / (b - a);

  }

  array2D(width: number, height: number): number[][] {
    
    let arr: number[][] = [];

      for( let i = 0; i < width; i++ ) {

        arr[i] = [];

        for( let j = 0; j < height; j++ ) {

          arr[i][j] = 0;

        }

      }
    
    return arr;

  }

  createPerlin2dNoise(noise: Noise, seed: number, width: number, height: number, scale: number, octaves: number, persistence: number, lacunarity: number, offsetX: number, offsetY: number): number[][] {
    
    if ( width < 1 ) {

      width = 1;

    }

    if ( height < 1 ) {

      height = 1;

    }

    if ( scale <= 0 ) {

      scale = 0.0001;

    }

    if ( octaves <= 0 ) {

      octaves = 1;

    }

    if ( persistence < 0 ) {

      persistence = 0;

    } else if ( persistence > 1 ) {

      persistence = 1;

    }

    if ( lacunarity < 1 ) {

      lacunarity = 1;

    }
    
    const noiseMap = this.array2D( width, height );

    let maxNoiseHeight = Number.MIN_VALUE;
    let minNoiseHeight = Number.MAX_VALUE;

    const halfWidth = width / 2.0;
    const halfHeight = height / 2.0;

    noise.setSeed(seed);
    
    for ( let y = 0; y < height; y++ ) {

      for ( let x = 0; x < width; x++ ) {

        let amplitude = 1;
        let frequency = 1;
        let noiseHeight = 0;

        for ( let i = 0; i < octaves; i++ ) {

          let sampleX = ( x - halfWidth ) / scale * frequency + offsetX;
          let sampleY = ( y - halfHeight ) / scale * frequency + offsetY;

          let value = noise.simplex2( sampleX, sampleY );
          noiseHeight += value * amplitude;

          amplitude *= persistence;
          frequency *= lacunarity;

        }

        if ( noiseHeight > maxNoiseHeight ) {

          maxNoiseHeight = noiseHeight;

        } else if ( noiseHeight < minNoiseHeight ) {
                
          minNoiseHeight = noiseHeight;
        
        }

        noiseMap[x][y] = noiseHeight;

      }

    }

    for ( let y = 0; y < height; y++ ) {

      for ( let x = 0; x < width; x++ ) {

        noiseMap[x][y] = this.inverseLerp( minNoiseHeight, maxNoiseHeight, noiseMap[x][y] );
      
      }

    }

    return noiseMap;

  }

  generateNoiseImageData(noiseMap: number[][]): Uint8Array {

    const width = noiseMap.length;
    const height = noiseMap[0].length;

    const size = width * height;
    const data = new Uint8Array( 4 * size );

    for ( let y = 0; y < height; y++ ) {
      
      for ( let x = 0; x < width; x++ ) {

        let value = noiseMap[x][y];

        let cell = (x + y * width) * 4;
        data[cell] = value * 255;
        data[cell + 1] = value * 255;
        data[cell + 2] = value * 255;
        data[cell + 3] = 255;

      }

    }

    return data;

  }

}

class Grad {

  constructor(readonly x: number, readonly y: number, readonly z: number) {  }

  dot2(x: number, y: number): number {

    return this.x * x + this.y * y;
  
  }

  dot3(x: number, y: number, z: number): number {

    return this.x * x + this.y * y + this.z * z;
  
  }

}

class Noise {

  readonly p: number[] = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,
    142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,
    203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
    74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,
    220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,
    132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,
    186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,
    59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,
    70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
    178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,
    241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,
    176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,
    128,195,78,66,215,61,156,180
  ];

  readonly grad3: Grad[] = [
    new Grad( 1, 1, 0 ), new Grad( -1, 1, 0 ), new Grad( 1, -1, 0 ), new Grad( -1, -1, 0 ),
    new Grad( 1, 0, 1 ), new Grad( -1, 0, 1 ), new Grad( 1, 0, -1 ), new Grad( -1, 0, -1 ),
    new Grad( 0, 1, 1 ), new Grad( 0, -1, 1 ), new Grad( 0, 1, -1 ), new Grad( 0, -1, -1 )
  ];

  readonly perm: number[] = new Array( 512 );
  readonly gradP: Grad[] = new Array( 512 );

  readonly F2: number = 0.5 * ( Math.sqrt( 3 ) - 1 );
  readonly G2: number = ( 3 - Math.sqrt( 3 ) ) / 6;

  readonly F3: number = 1 / 3;
  readonly G3: number = 1 / 6;

  constructor(seed: number = 0) {

    this.setSeed( seed );

  }

  setSeed(seed: number = 0): void {

    if ( seed > 0 && seed < 1 ) {

      seed *= 65536;

    }

    seed = Math.floor(seed);

    if ( seed < 256 ) {

      seed |= seed << 8;

    }

    for( let i = 0; i < 256; i++ ) {

      let v;

      if ( i & 1 ) {
        
        v = this.p[i] ^ ( seed & 255 );
        
      } else {
        
        v = this.p[i] ^ ( ( seed >> 8 ) & 255 );
        
      }
    
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];

    }

  }

  private fade(t: number): number {

    return t * t * t * ( t * ( t * 6 - 15 ) + 10 );

  }

  private lerp(a: number, b: number, t: number): number {
    
    return ( 1 - t ) * a + t * b;
  
  }
  
  simplex2(xin: number, yin: number): number {
    
    let n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    const s = ( xin + yin ) * this.F2; // Hairy factor for 2D
    let i = Math.floor( xin + s );
    let j = Math.floor( yin + s );
    const t = ( i + j ) * this.G2;
    const x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
    const y0 = yin - j + t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords

    if ( x0 > y0 ) {

      i1 = 1; // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      j1 = 0;

    } else {

      i1 = 0; // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      j1 = 1;

    }

    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    const x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1 + 2 * this.G2; // Offsets for last corner in (x,y) unskewed coords
    const y2 = y0 - 1 + 2 * this.G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    const gi0 = this.gradP[i + this.perm[j]];
    const gi1 = this.gradP[i + i1 + this.perm[j + j1]];
    const gi2 = this.gradP[i + 1 + this.perm[j + 1]];
    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;

    if ( t0 < 0 ) {

      n0 = 0;

    } else {

      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2( x0, y0 ); // (x,y) of grad3 used for 2D gradient

    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;

    if ( t1 < 0 ) {

      n1 = 0;

    } else {

      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2( x1, y1 );

    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;

    if ( t2 < 0 ) {

      n2 = 0;

    } else {

      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2( x2, y2 );

    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].

    return 70 * ( n0 + n1 + n2 );

  }

  simplex3(xin: number, yin: number, zin: number): number {

    let n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    const s = ( xin + yin + zin ) * this.F3; // Hairy factor for 2D
    let i = Math.floor( xin + s );
    let j = Math.floor( yin + s );
    let k = Math.floor( zin + s );

    const t = ( i + j + k ) * this.G3;
    const x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
    const y0 = yin - j + t;
    const z0 = zin - k + t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords

    if ( x0 >= y0 ) {

      if ( y0 >= z0 ) {

        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;

      } else if ( x0 >= z0 ) {

        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;

      } else {

        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;

      }

    } else {

      if ( y0 < z0 ) {
        
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;

      } else if ( x0 < z0 ) {

        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;

      } else {

        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;

      }

    }

    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    const x1 = x0 - i1 + this.G3; // Offsets for second corner
    const y1 = y0 - j1 + this.G3;
    const z1 = z0 - k1 + this.G3;

    const x2 = x0 - i2 + 2 * this.G3; // Offsets for third corner
    const y2 = y0 - j2 + 2 * this.G3;
    const z2 = z0 - k2 + 2 * this.G3;

    const x3 = x0 - 1 + 3 * this.G3; // Offsets for fourth corner
    const y3 = y0 - 1 + 3 * this.G3;
    const z3 = z0 - 1 + 3 * this.G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    const gi0 = this.gradP[i + this.perm[j + this.perm[k]]];
    const gi1 = this.gradP[i + i1 + this.perm[j + j1 + this.perm[k + k1]]];
    const gi2 = this.gradP[i + i2 + this.perm[j + j2 + this.perm[k + k2]]];
    const gi3 = this.gradP[i + 1 + this.perm[j + 1 + this.perm[k + 1]]];

    // Calculate the contribution from the four corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;

    if ( t0 < 0 ) {

      n0 = 0;

    } else {

      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3( x0, y0, z0 ); // (x,y) of grad3 used for 2D gradient

    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;

    if ( t1 < 0 ) {

      n1 = 0;

    } else {

      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3( x1, y1, z1 );

    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;

    if ( t2 < 0 ) {

      n2 = 0;

    } else {

      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3( x2, y2, z2 );

    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;

    if ( t3 < 0 ) {

      n3 = 0;

    } else {

      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3( x3, y3, z3 );

    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].

    return 32 * ( n0 + n1 + n2 + n3 );

  }

  perlin2(x: number, y: number): number {

    let X = Math.floor( x ), Y = Math.floor( y );
    // Get relative xy coordinates of point within that cell
    x = x - X;
    y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    const n00 = this.gradP[X + this.perm[Y]].dot2( x, y );
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2( x, y - 1 );
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2( x - 1, y );
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2( x - 1, y - 1 );

    // Compute the fade curve value for x
    const u = this.fade( x );

    // Interpolate the four results
    return this.lerp( this.lerp( n00, n10, u ), this.lerp( n01, n11, u ), this.fade( y ) );

  }

  perlin3(x: number, y: number, z: number): number {
    // Find unit grid cell containing point
    let X = Math.floor( x ), Y = Math.floor( y ), Z = Math.floor( z );
    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    const n000 = this.gradP[X + this.perm[Y + this.perm[Z]]].dot3( x, y, z );
    const n001 = this.gradP[X + this.perm[Y + this.perm[Z + 1]]].dot3( x, y, z - 1 );
    const n010 = this.gradP[X + this.perm[Y + 1 + this.perm[Z]]].dot3( x, y - 1, z );
    const n011 = this.gradP[X + this.perm[Y + 1 + this.perm[Z + 1]]].dot3( x, y - 1, z - 1 );
    const n100 = this.gradP[X + 1 + this.perm[Y + this.perm[Z]]].dot3( x - 1, y, z );
    const n101 = this.gradP[X + 1 + this.perm[Y + this.perm[Z + 1]]].dot3( x - 1, y, z - 1 );
    const n110 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z]]].dot3( x - 1, y - 1, z );
    const n111 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]].dot3( x - 1, y - 1, z - 1 );

    // Compute the fade curve value for x, y, z
    const u = this.fade( x );
    const v = this.fade( y );
    const w = this.fade( z );

    // Interpolate
    return this.lerp(
      this.lerp( this.lerp( n000, n100, u ), this.lerp( n001, n101, u ), w ),
      this.lerp( this.lerp( n010, n110, u ), this.lerp( n011, n111, u ), w ),
      v
    );

  }

}
