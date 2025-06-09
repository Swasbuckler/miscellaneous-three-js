uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // varyings
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    // MVP
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}