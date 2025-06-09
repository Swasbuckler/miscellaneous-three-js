uniform float uTime;
uniform mat4 uCameraWorldMatrix;
uniform mat4 uCameraProjectionMatrixInverse;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

#define PI 3.141592653589793

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

mat3 rotateZ(float angle) {
    return mat3(
        cos(angle), -sin(angle), 0.0,
        sin(angle), cos(angle), 0.0,
        0.0, 0.0, 1.0
    );
}

float smoothMin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return (min(a, b) - (h * h * h * k * (1.0 / 6.0)));
}

float sdSphere(vec3 p, float s) {
    return (length(p) - s);
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return (length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0));
}

float map(vec3 p) {
    p.z -= uTime * 0.5;

    p.xy = fract(p.xy) - 0.5;
    p.z = mod(p.z, 0.4) - 0.125;

    float box = sdBox(p, vec3(0.1));

    return box;
}

void main() {
    vec2 uv = vUv;
    uv -= 0.5;
    uv *= 2.0;

    vec3 ro = cameraPosition;
    vec3 rd = (uCameraProjectionMatrixInverse * vec4(uv, 0.0, 1.0)).xyz;
    rd = (uCameraWorldMatrix * vec4(rd, 0.0)).xyz;
    rd = normalize(rd);

    vec3 color = vec3(0.0);
    float t = 0.0;

    int i;
    for (i = 0; i < 80; i++) {
        vec3 p = ro + (rd * t);

        p *= rotateZ(t * 0.15);
        p.y += sin(t) * 0.35;

        float d = map(p);

        t += d;

        if (d < 0.001 || t > 100.0) {
            break;
        }
    }

    color = vec3((t * 0.04) + (float(i) * 0.005));

    gl_FragColor = vec4(color, 1.0);
}