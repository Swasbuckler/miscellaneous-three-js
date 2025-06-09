uniform float uTime;
uniform mat4 uCameraWorldMatrix;
uniform mat4 uCameraProjectionMatrixInverse;
uniform sampler2D uNoise;
uniform sampler2D uBlueNoise;
uniform int uFrame;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

#define PI 3.141592653589793

#define MAX_STEP 40
const float MARCH_SIZE = 0.16;
const vec3 SUN_POSITION = vec3(1.0, 1.0, 0.0);

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

float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    vec2 uv1 = (p.xy + vec2(37.0, 239.0) * p.z) + f.xy;
    vec2 uv2 = (p.xy + vec2(37.0, 239.0) * (p.z + 1.0)) + f.xy;
    vec2 tex1 = textureLod(uNoise, (uv1 + 0.5) / 256.0, 0.0).yx;
    vec2 tex2 = textureLod(uNoise, (uv2 + 0.5) / 256.0, 0.0).yx;

    return mix(mix(tex1.x, tex2.x, f.z), mix(tex1.y, tex2.y, f.z), f.z) * 2.0 - 1.0;
}

float fbm(vec3 p) {
    vec3 q = p + uTime * 0.5 * vec3(1.0, -0.2, -1.0);
    float g = noise(q);

    float f = 0.0;
    float scale = 0.5;
    float factor = 2.02;

    for (int i = 0; i < 6; i++) {
        f += scale * noise(q);
        q *= factor;
        factor += 0.21;
        scale *= 0.5;
    }

    return f;
}

float sdSphere(vec3 p, float s) {
    return (length(p) - s);
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return (length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0));
}

float sdTorus(vec3 p, vec2 t)
{
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return (length(q) - t.y);
}

float map(vec3 p) {
    //float distance = sdSphere(p, 1.0);

    float ground = p.y + 0.5;

    float f = fbm(p);

    return -ground + f;
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

    // Sun and Sky
    vec3 sunDirection = normalize(SUN_POSITION);
    float sun = clamp(dot(sunDirection, rd), 0.0, 1.0);
    // Base sky color
    color = vec3(0.7, 0.7, 0.90);
    // Add vertical gradient
    color -= 0.8 * vec3(0.90, 0.75, 0.90) * rd.y;
    // Add sun color to sky
    color += 0.5 * vec3(1.0, 0.5, 0.3) * pow(sun, 10.0);

    float blueNoise = texture2D(uBlueNoise, vUv / 1024.0).r;
    float offset = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));

    float depth = 0.0;
    depth += MARCH_SIZE;// * offset;
    vec3 p = ro + (rd * depth);
    vec4 res = vec4(0.0);

    int i;
    for (i = 0; i < MAX_STEP; i++) {
        float density = map(p);

        if (density > 0.0) {
            float diffuse = clamp((map(p) - map(p + 0.3 * sunDirection)) / 0.3, 0.0, 1.0 );
            vec3 lin = vec3(0.60, 0.60, 0.75) * 1.1 + 0.8 * vec3(1.0, 0.6, 0.3) * diffuse;
            vec4 color = vec4(mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), density), density);
            color.rgb *= lin;
            color.rgb *= color.a;
            res += color * (1.0 - res.a);
        }

        depth += MARCH_SIZE;
        p = ro + (rd * depth);
    }

    color = color * (1.0 - res.a) + res.rgb;

    gl_FragColor = vec4(color, 1.0);
}