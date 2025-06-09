precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

uniform float uTime;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec3 grassPosition;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

varying vec3 rotatedNormal1;
varying vec3 rotatedNormal2;

#define PI 3.141592653589793

float hash(vec2 uv) {
    return fract(sin(7.289 * uv.x + 11.23 * uv.y) * 23758.5453);
}

float easeIn(float x, float power) {
    return pow(x, power);
}

float easeOut(float x, float power) {
    return 1.0 - pow(1.0 - x, power);
}

mat3 rotateX(float angle) {
    return mat3(
        1.0, 0.0, 0.0,
        0.0, cos(angle), -sin(angle),
        0.0, sin(angle), cos(angle)
    );
}

mat3 rotateY(float angle) {
    return mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );
}

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

float perlinNoise2d(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;

    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));

    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

float fit (float value, float oldMin, float oldMax, float newMin, float newMax) {
    return (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
}

void main() {
    float perBladeHash1 = hash(grassPosition.xz) * 0.04 + 0.03;
    float randomLean = perBladeHash1 * 2.0 * PI;
    float curveAmount = randomLean * uv.y;

    float noiseSample = perlinNoise2d(vec2(uTime * 0.35) + grassPosition.xz);
    curveAmount += noiseSample * 0.1;

    vec3 worldPosition = rotateX(curveAmount) * position;
    vec3 worldNormal = rotateX(curveAmount) * normal;

    float perBladeHash2 = hash(grassPosition.zx);
    float randomAngle = perBladeHash2 * 2.0 * PI;
    worldPosition = rotateY(randomAngle) * worldPosition;
    worldNormal = rotateY(randomAngle) * worldNormal;

    float windDirection = perlinNoise2d(grassPosition.xz * 0.05 + 0.05 * uTime);
    windDirection = fit(windDirection, -1.0, 1.0, 0.0, 2.0 * PI);
    //worldPosition = rotateY(windDirection) * worldPosition;
    //worldNormal = rotateY(windDirection) * worldNormal;

    float windNoiseSample = perlinNoise2d(grassPosition.xz * 0.1 + 0.5 * uTime);
    float windLeanAngle = fit(windNoiseSample, -1.0, 1.0, 0.25, 1.0);
    windLeanAngle = easeIn(windLeanAngle, 2.0) * 1.25;
    worldPosition = rotateX(windLeanAngle) * worldPosition;
    worldNormal = rotateX(windLeanAngle) * worldNormal;

    worldPosition += grassPosition;

    rotatedNormal1 = rotateY(PI * 0.3) * worldNormal;
    rotatedNormal2 = rotateY(PI * -0.3) * worldNormal;

    //vec3 viewDirection = normalize(cameraPosition - worldPosition);
    //float viewDotNormal = clamp(dot(worldNormal.xz, viewDirection.xz), 0.0, 1.0);
    //float viewSpaceThickenFactor = easeOut(1.0 - viewDotNormal, 4.0);
    //viewSpaceThickenFactor *= smoothstep(0.0, 0.2, viewDotNormal);
    vec4 mvPosition = modelViewMatrix * vec4(worldPosition, 1.0);
    //mvPosition.x += viewSpaceThickenFactor * position.x * 0.4;

    // varyings
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    // MVP
    gl_Position = projectionMatrix * mvPosition;
}