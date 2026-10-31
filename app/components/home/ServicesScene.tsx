"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { buildShape, GEAR_MOTION, type ShapeKind } from "./serviceShapes";

const vertexShader = /* glsl */ `
  attribute vec3 aOrigin;
  attribute vec3 aScatter;
  attribute float aPart;
  attribute float aPulse;
  attribute float aRand;
  uniform float uKind;
  uniform float uTime;
  uniform float uAssemble;
  uniform float uFocus;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uNearZ;
  uniform vec4 uGear;
  varying float vDepth;
  varying float vRand;
  varying float vGlow;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

  void main() {
    vec3 p = position;
    float glow = 0.0;

    if (uKind < 0.5) {
      // Blocks: the corner block lifts out and settles back in.
      float lift = 0.5 - 0.5 * cos(uTime * 0.8);
      p.y += aPart * lift * lift * 0.7;
      glow = aPart * 0.7;
    } else if (uKind < 1.5) {
      // Gears: each turns about its own centre, the small one faster and the other way.
      float a = aPart < 0.5 ? uGear.x + uTime * uGear.z : uGear.y - uTime * uGear.z * uGear.w;
      p.xy = rot(a) * p.xy;
      p += aOrigin;
    } else if (uKind < 2.5) {
      // Layers: breathe apart and back together.
      float open = 0.5 - 0.5 * cos(uTime * 0.7);
      p.y += (aPart - 1.0) * open * 0.16;
      glow = step(1.5, aPart) * 0.25;
    } else {
      // Network: signals run along the links.
      glow = aPulse >= 0.0 ? smoothstep(0.84, 1.0, fract(aPulse - uTime * 0.4)) : 0.15;
    }

    // Each point gathers out of loose dust, a little out of step with its neighbours.
    float gather = smoothstep(0.0, 1.0, clamp(uAssemble * 1.2 - aRand * 0.2, 0.0, 1.0));
    p = mix(aScatter, p, gather);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * mix(0.8, 1.0, uFocus) / -mv.z;
    vDepth = clamp((-mv.z - uNearZ) / 4.0, 0.0, 1.0);
    vRand = aRand;
    vGlow = glow * gather;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uNear;
  uniform vec3 uFar;
  uniform float uTime;
  uniform float uFocus;
  varying float vDepth;
  varying float vRand;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= mix(1.0, 0.28, vDepth);
    alpha *= 0.75 + 0.25 * sin(uTime * 1.6 + vRand * 40.0);
    // Objects off to the side fade back so the centre one leads.
    alpha *= mix(0.32, 1.0, uFocus);
    vec3 color = mix(mix(uNear, uFar, vDepth), vec3(0.94, 0.96, 1.0), vGlow * uFocus);
    gl_FragColor = vec4(color, min(1.0, alpha * (1.0 + vGlow)) * 0.85);
  }
`;

const KIND_INDEX: Record<ShapeKind, number> = { blocks: 0, gears: 1, layers: 2, network: 3 };

/** How each object holds itself on the arc: its tilt toward the camera, and a sway (gears) or a full turn (0). */
const POSE: Record<ShapeKind, { tilt: number; sway: number }> = {
  blocks: { tilt: 0.5, sway: 0 },
  gears: { tilt: -0.28, sway: 0.6 },
  layers: { tilt: 0.55, sway: 0 },
  network: { tilt: 0.2, sway: 0 },
};

const FOV = 35;
const TAN_HALF_FOV = Math.tan(((FOV / 2) * Math.PI) / 180);
/** World units one object needs, its lift and tilt included. */
const OBJECT_SIZE = 2.6;
/** Angle between neighbours on the arc. */
const STEP = 0.6;

/**
 * The arc: objects sit on a wide circle, so neighbours step aside, sink and recede. The camera
 * distance is chosen so the centre object fills the free band between the heading and the text.
 */
function fitLayout(width: number, height: number, bandTop: number, bandHeight: number) {
  const pxPerUnit = Math.min(bandHeight / OBJECT_SIZE, (width * 0.8) / OBJECT_SIZE, 170);
  const halfWidth = width / 2 / pxPerUnit;
  // On wide screens the neighbours sit well inside the frame; on phones they peek in from the edges.
  const reach = width / height < 0.8 ? halfWidth * 1.3 : halfWidth * 0.72;
  const radius = reach / Math.sin(STEP);
  return {
    camZ: height / 2 / (pxPerUnit * TAN_HALF_FOV),
    y: (height / 2 - (bandTop + bandHeight / 2)) / pxPerUnit,
    radius,
    dip: radius * 0.4,
  };
}

export type ServicesTrack = {
  /** Which service sits at the centre of the arc; fractional while moving. */
  pos: number;
  /** 0 → 1 as the section scrolls into view; gathers the dots into shapes. */
  enter: number;
};

type Props = {
  kinds: ShapeKind[];
  track: RefObject<ServicesTrack>;
  /** The empty space between the heading and the service text, where the centre object belongs. */
  band: RefObject<HTMLElement | null>;
  onReady?: () => void;
  onFail?: () => void;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

export default function ServicesScene({ kinds, track, band, onReady, onFail }: Props) {
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

    const small = window.innerWidth < 768;
    const count = small ? 1800 : 3600;
    const pixelRatio = Math.min(window.devicePixelRatio, small ? 1.5 : 1.75);

    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
    const world = new Group();
    scene.add(world);
    let layout = fitLayout(1600, 900, 250, 400);

    const items = kinds.map((kind) => {
      const shape = buildShape(kind, count);
      const scatter = new Float32Array(count * 3);
      const rand = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const u = Math.random() * 2 - 1;
        const a = Math.random() * Math.PI * 2;
        const r = 2.2 + Math.random() * 3.3;
        const ring = Math.sqrt(1 - u * u) * r;
        scatter.set([Math.cos(a) * ring, u * r, Math.sin(a) * ring], i * 3);
        rand[i] = Math.random();
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(shape.position, 3));
      geometry.setAttribute("aOrigin", new BufferAttribute(shape.origin, 3));
      geometry.setAttribute("aScatter", new BufferAttribute(scatter, 3));
      geometry.setAttribute("aPart", new BufferAttribute(shape.part, 1));
      geometry.setAttribute("aPulse", new BufferAttribute(shape.pulse, 1));
      geometry.setAttribute("aRand", new BufferAttribute(rand, 1));

      const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uKind: { value: KIND_INDEX[kind] },
          uTime: { value: 0 },
          uAssemble: { value: 0 },
          uFocus: { value: 0 },
          // Phones use a farther camera, so points are drawn larger to compensate.
          uSize: { value: small ? 50 : 40 },
          uPixelRatio: { value: pixelRatio },
          uNearZ: { value: layout.camZ - 1.3 },
          uGear: { value: [GEAR_MOTION.start[0], GEAR_MOTION.start[1], GEAR_MOTION.speed, GEAR_MOTION.ratio] },
          uNear: { value: new Color("#b8c6ff") },
          uFar: { value: new Color("#3a55f0") },
        },
      });
      const points = new Points(geometry, material);
      points.frustumCulled = false;
      world.add(points);
      return { points, geometry, material, pose: POSE[kind], spin: Math.random() * Math.PI * 2 };
    });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      const box = mount.getBoundingClientRect();
      const free = band.current?.getBoundingClientRect();
      layout = free
        ? fitLayout(w, h, free.top - box.top, free.height)
        : fitLayout(w, h, h * 0.25, h * 0.45);
      camera.position.set(0, 0, layout.camZ);
      camera.updateProjectionMatrix();
      for (const item of items) item.material.uniforms.uNearZ.value = layout.camZ - 1.3;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    if (band.current) ro.observe(band.current);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(mount);

    let pos = track.current?.pos ?? 0;
    let enter = track.current?.enter ?? 0;
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

      // Ease toward the scroll position so the arc glides rather than steps.
      const follow = 1 - Math.exp(-dt * 7);
      pos += ((track.current?.pos ?? 0) - pos) * follow;
      enter += ((track.current?.enter ?? 0) - enter) * follow;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      items.forEach((item, i) => {
        const d = i - pos;
        const angle = d * STEP;
        const focus = smooth(clamp01(1 - Math.abs(d)));
        item.spin += dt * (0.12 + 0.3 * focus);
        item.points.visible = Math.abs(d) < 2.4;
        item.points.position.set(
          Math.sin(angle) * layout.radius,
          layout.y - (1 - Math.cos(angle)) * layout.dip,
          (Math.cos(angle) - 1) * layout.radius,
        );
        const turn = item.pose.sway ? Math.sin(item.spin * 1.2) * item.pose.sway : item.spin;
        item.points.rotation.set(item.pose.tilt + mouse.y * 0.12, turn - angle * 0.5 + mouse.x * 0.25, 0);

        const u = item.material.uniforms;
        u.uTime.value = elapsed;
        u.uFocus.value = focus;
        // The first object gathers first as the section scrolls in.
        u.uAssemble.value = clamp01((enter - 0.15 - i * 0.05) / 0.7);
      });

      renderer.render(scene, camera);
      if (!readySent) {
        readySent = true;
        onReady?.();
      }
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      for (const item of items) {
        item.geometry.dispose();
        item.material.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Shapes and callbacks are fixed for the lifetime of the section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
