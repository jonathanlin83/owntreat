(function () {
  const canvas = document.querySelector('.bg-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  // ── Shaders ────────────────────────────────────────────────────────────────

  const vertSrc = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;

    uniform float u_time;
    uniform vec2  u_resolution;
    uniform vec2  u_mouse;

    /* ── Site background ── */
    const vec3 C_BG = vec3(0.980, 0.980, 0.973);

    /* ── Speed: lower = slower drift ── */
    const float SPEED = 0.10;

    /* ── Aurora intensity: 0.0–1.0, lower = more subtle ── */
    const float INTENSITY = 0.42;

    /* ── HSL → RGB conversion ── */
    vec3 hsl2rgb(vec3 c) {
      vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }

    float blob(vec2 uv, vec2 center, float radius) {
      return smoothstep(radius, 0.0, length(uv - center));
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float aspect = u_resolution.x / u_resolution.y;
      uv.x *= aspect;

      float t = u_time * SPEED;

      /* Organic warp for liquid edge feel */
      float warp = noise(uv * 1.6 + t * 0.25) * 0.07;
      vec2 wuv = uv + warp;

      /* Blob centers — Lissajous paths */
      vec2 b1 = vec2(aspect * (0.75 + 0.22 * sin(t * 0.65)), 0.20 + 0.20 * cos(t * 0.48));
      vec2 b2 = vec2(aspect * (0.18 + 0.20 * cos(t * 0.41)), 0.68 + 0.22 * sin(t * 0.55));
      vec2 b3 = vec2(aspect * (0.52 + 0.22 * sin(t * 0.88)), 0.82 + 0.14 * cos(t * 0.33));
      vec2 b4 = vec2(aspect * (0.38 + 0.26 * cos(t * 0.50)), 0.06 + 0.16 * sin(t * 0.72));
      vec2 b5 = vec2(aspect * (0.88 + 0.10 * sin(t * 0.60)), 0.50 + 0.28 * cos(t * 0.42));

      /* Accumulated blob mask — determines where aurora shows */
      float mask = 0.0;
      mask += blob(wuv, b1, 0.55);
      mask += blob(wuv, b2, 0.52);
      mask += blob(wuv, b3, 0.46);
      mask += blob(wuv, b4, 0.42);
      mask += blob(wuv, b5, 0.38);
      mask = clamp(mask, 0.0, 1.0);

      /* Holographic hue shift across canvas + time             */
      /* Starts near pink (hue ≈ 0.92), sweeps full spectrum.   */
      /* Edit the x/y multipliers to change color spread.       */
      float hue = fract(
        (uv.x / aspect) * 0.35     /* horizontal sweep    */
        + uv.y          * 0.18     /* vertical tilt       */
        + t             * 0.04     /* slow time rotation  */
        + noise(wuv * 1.2 + t * 0.15) * 0.28  /* organic variation */
        + 0.92                     /* phase offset — starts at pink */
      );

      /* High lightness = pastel/dreamy; lower sat = softer.   */
      /* Edit lightness (0.84) and saturation (0.62) below.    */
      vec3 aurora = hsl2rgb(vec3(hue, 0.62, 0.84));

      /* Mouse bloom — warm hue near cursor */
      vec2 mouse = vec2(u_mouse.x * aspect, u_mouse.y);
      float mouseBloom = smoothstep(0.50, 0.0, length(wuv - mouse)) * 0.22;
      float mouseHue = fract(hue + 0.05);
      aurora = mix(aurora, hsl2rgb(vec3(mouseHue, 0.70, 0.82)), mouseBloom);

      /* Blend aurora into background using blob mask */
      vec3 col = mix(C_BG, aurora, mask * INTENSITY);

      /* Fine grain for glassy texture (edit 0.015 to adjust) */
      col += (noise(uv * 200.0 + t) - 0.5) * 0.015;

      /* Vignette */
      vec2 vig = uv / vec2(aspect, 1.0) - 0.5;
      col *= 1.0 - dot(vig, vig) * 0.28;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  // ── Compile ────────────────────────────────────────────────────────────────

  function compileShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER,   vertSrc));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // ── Full-screen quad ───────────────────────────────────────────────────────

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // ── Uniforms ───────────────────────────────────────────────────────────────

  const uTime       = gl.getUniformLocation(prog, 'u_time');
  const uResolution = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse      = gl.getUniformLocation(prog, 'u_mouse');

  // ── State ──────────────────────────────────────────────────────────────────

  const mouse       = { x: 0.5, y: 0.5 };
  const lerpMouse   = { x: 0.5, y: 0.5 };
  const LERP        = 0.04;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startTime   = performance.now();

  // ── Resize ─────────────────────────────────────────────────────────────────

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // ── Render loop ────────────────────────────────────────────────────────────

  function render(now) {
    if (!reducedMotion) requestAnimationFrame(render);
    lerpMouse.x += (mouse.x - lerpMouse.x) * LERP;
    lerpMouse.y += (mouse.y - lerpMouse.y) * LERP;
    gl.uniform1f(uTime,       (now - startTime) / 1000);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uMouse,      lerpMouse.x, lerpMouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  // ── Init ───────────────────────────────────────────────────────────────────

  resize();
  reducedMotion ? render(performance.now()) : requestAnimationFrame(render);
})();
