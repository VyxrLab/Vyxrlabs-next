"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

const vertexShader = /* glsl */ `
  attribute vec3 aRing;
  attribute vec3 aWave;
  attribute float aRand;
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  varying float vDepth;
  varying float vRand;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    float toRing = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float toWave = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));

    vec3 wave = aWave;
    wave.y += sin(wave.x * 1.4 + uTime * 0.9) * 0.28 + cos(wave.z * 2.2 + uTime * 0.6) * 0.16;

    vec3 p = mix(position, aRing, toRing);
    p = mix(p, wave, toWave);
    p *= 1.0 + sin(uTime * 0.8 + aRand * 6.2831) * 0.012 * (1.0 - toWave);

    // Spin the sphere/ring; the wave stays flat and only tilts toward the cursor.
    p.xz = rot(uTime * 0.07 * (1.0 - toWave) + uMouse.x * 0.35) * p.xz;
    p.yz = rot(-uMouse.y * 0.22 + toRing * (1.0 - toWave) * 1.1) * p.yz;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) / -mv.z;
    vDepth = clamp((-mv.z - 3.5) / 5.0, 0.0, 1.0);
    vRand = aRand;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uNear;
  uniform vec3 uFar;
  uniform float uTime;
  varying float vDepth;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= mix(1.0, 0.25, vDepth);
    alpha *= 0.7 + 0.3 * sin(uTime * 1.6 + vRand * 40.0);
    gl_FragColor = vec4(mix(uNear, uFar, vDepth), alpha * 0.9);
  }
`;

function buildShapes(count: number) {
  const sphere = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const cols = Math.ceil(Math.sqrt(count * 2.6));
  const rows = Math.ceil(count / cols);

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    sphere.set([Math.cos(theta) * r * 1.75, y * 1.75, Math.sin(theta) * r * 1.75], i * 3);

    // Torus ("ring"), tube points spread by index
    const u = (i / count) * Math.PI * 2 * 1;
    const v = golden * i * 7;
    const R = 2.3;
    const tube = 0.32 + Math.random() * 0.06;
    ring.set(
      [(R + tube * Math.cos(v)) * Math.cos(u), tube * Math.sin(v), (R + tube * Math.cos(v)) * Math.sin(u)],
      i * 3,
    );

    // Wide flowing plane below the horizon
    const cx = i % cols;
    const cz = Math.floor(i / cols);
    wave.set([(cx / cols - 0.5) * 11, -1.15, (cz / rows - 0.5) * 6 - 0.6], i * 3);

    rand[i] = Math.random();
  }
  return { sphere, ring, wave, rand };
}

type Props = {
  /** 0 → 1 progress through the hero; drives sphere → ring → wave. */
  progress: RefObject<number>;
  onReady?: () => void;
  onFail?: () => void;
};

export default function ParticleField({ progress, onReady, onFail }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      onFail?.();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const count = small ? 6000 : 14000;
    const pixelRatio = Math.min(window.devicePixelRatio, small ? 1.5 : 1.75);

    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 7);

    const { sphere, ring, wave, rand } = buildShapes(count);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(sphere, 3));
    geometry.setAttribute("aRing", new BufferAttribute(ring, 3));
    geometry.setAttribute("aWave", new BufferAttribute(wave, 3));
    geometry.setAttribute("aRand", new BufferAttribute(rand, 1));

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        // Phones use a farther camera (see resize), so points are drawn larger to compensate.
        uSize: { value: small ? 46 : 34 },
        uPixelRatio: { value: pixelRatio },
        uMouse: { value: [0, 0] },
        uNear: { value: new Color("#b8c6ff") },
        uFar: { value: new Color("#3a55f0") },
      },
    });
    const points = new Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // Keep the shape fully in frame on tall phone screens.
      camera.position.z = w / h < 0.8 ? 10.5 : 7;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(mount);

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let readySent = false;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;

      const target = (progress.current ?? 0) * 2;
      const u = material.uniforms;
      u.uTime.value = elapsed;
      u.uMorph.value += (target - u.uMorph.value) * 0.07;
      // On wide screens the sphere sits right of the headline, then drifts to centre as it morphs.
      const sphereWeight = 1 - Math.min(u.uMorph.value, 1);
      points.position.x = (camera.aspect > 1.1 ? 1.7 : 0) * sphereWeight;
      points.position.y = (camera.aspect > 1.1 ? 0.45 : 0.6) * sphereWeight;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      u.uMouse.value = [mouse.x, mouse.y];

      renderer.render(scene, camera);
      if (!readySent) {
        readySent = true;
        onReady?.();
      }
    };

    if (reduced) {
      // One still frame, no animation loop.
      renderer.render(scene, camera);
      onReady?.();
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Callbacks are stable for the lifetime of the hero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
