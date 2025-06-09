uniform vec3 uDisplacementPoint;
uniform float uDisplacementMax;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;

void main() {
    float displacementPercentage = clamp(dot(normalize(uDisplacementPoint - position), normal), 0.0, 1.0);
    displacementPercentage = pow(displacementPercentage, 2.0);
    float displacement = displacementPercentage * uDisplacementMax;

    // varyings
    vPosition = position;
    vNormal = normal;
    vUv = uv;
    vDisplacement = displacement;

    // MVP
    vec3 newPosition = position + (normal * displacement);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}