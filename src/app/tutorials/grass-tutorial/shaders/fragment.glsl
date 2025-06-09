precision highp float;

uniform vec3 cameraPosition;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

varying vec3 rotatedNormal1;
varying vec3 rotatedNormal2;

float easeIn(float x, float power) {
    return pow(x, power);
}

float easeOut(float x, float power) {
    return 1.0 - pow(1.0 - x, power);
}

void main() {
    float normalMixFactor = vUv.x;
    vec3 normal = mix(rotatedNormal1, rotatedNormal2, normalMixFactor);
    normal = normalize(normal);

    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, normal) * 0.1;

    vec3 ambientLighting = vec3(1.0);

    vec3 baseColor = vec3(0.05, 0.3, 0.01);
    vec3 tipColor = vec3(0.7, 0.7, 0.1);

    vec3 diffuseColor = mix(baseColor, tipColor, vUv.y);

    float aoForDensity = mix(1.0, 0.75, 1.0);
    float ao = mix(aoForDensity, 1.0, easeOut(vUv.y, 2.0));
    ambientLighting *= ao;
    vec3 color = diffuseColor * ambientLighting;
    color += fresnel;

    gl_FragColor = vec4(color, 1.0);
}