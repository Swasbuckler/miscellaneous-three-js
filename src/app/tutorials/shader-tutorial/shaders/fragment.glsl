uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;

void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, vNormal);

    gl_FragColor = vec4(vec3(vDisplacement) + (vNormal * fresnel * sin(uTime) * 0.5), 1.0);
}