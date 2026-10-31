// Point clouds for the services arc: one recognisable object per service, built from dots like the hero sphere.
// Every shape fits inside a radius of about 1.2 so they read at the same size on the arc.

export type ShapeKind = "blocks" | "gears" | "layers" | "network";

export type Shape = {
  /** Local positions. Gear points are relative to their own gear's centre. */
  position: Float32Array;
  /** Point each one turns around (gears only; zero elsewhere). */
  origin: Float32Array;
  /** Which moving part a point belongs to: the lifting block, gear 0/1, or layer 0–2. */
  part: Float32Array;
  /** Position along a link plus that link's phase, for travelling pulses; -1 when not on a link. */
  pulse: Float32Array;
};

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const rndInt = (a: number, b: number) => Math.floor(rnd(a, b + 1));
const fract = (v: number) => v - Math.floor(v);

function emptyShape(count: number): Shape {
  return {
    position: new Float32Array(count * 3),
    origin: new Float32Array(count * 3),
    part: new Float32Array(count),
    pulse: new Float32Array(count).fill(-1),
  };
}

/* Custom solutions: a 2×2×2 cube of blocks, with one corner block lifting out and settling back into place. */

const BLOCK = 0.78;
const BLOCK_PITCH = 0.88;

function blocks(count: number): Shape {
  const s = emptyShape(count);
  const b = [0, 0, 0];
  const f = [0, 0, 0];
  const side = () => (Math.random() < 0.5 ? -0.5 : 0.5);
  for (let i = 0; i < count; i++) {
    let axis = 0;
    let sign = 1;
    let lifting = false;
    // Only sample faces you can see: outer faces, every face of the lifting block, and the face it uncovers.
    for (;;) {
      b[0] = side();
      b[1] = side();
      b[2] = side();
      axis = rndInt(0, 2);
      sign = Math.random() < 0.5 ? -1 : 1;
      lifting = b[0] > 0 && b[1] > 0 && b[2] > 0;
      const uncovered = b[0] > 0 && b[1] < 0 && b[2] > 0 && axis === 1 && sign === 1;
      if (lifting || uncovered || Math.sign(b[axis]) === sign) break;
    }
    f[0] = rnd(-1, 1);
    f[1] = rnd(-1, 1);
    f[2] = rnd(-1, 1);
    f[axis] = sign;
    // Pull most points onto the block's edges so each cube reads crisply.
    if (Math.random() < 0.6) {
      const other = (axis + (Math.random() < 0.5 ? 1 : 2)) % 3;
      f[other] = f[other] < 0 ? -1 : 1;
    }
    for (let k = 0; k < 3; k++) s.position[i * 3 + k] = b[k] * BLOCK_PITCH + (f[k] * BLOCK) / 2;
    s.part[i] = lifting ? 1 : 0;
  }
  return s;
}

/* Automation: two gears meshing, the small one turning faster. */

const MODULE = 0.12;
const GEAR_TEETH = [12, 8] as const;
const GEAR_THICKNESS = 0.2;
/** Direction from the big gear's centre to the small one's. */
const CONTACT = -0.45;

const pitchRadius = (teeth: number) => (MODULE * teeth) / 2;

/** Where each gear sits, centred as a pair. */
const GEAR_CENTRES = (() => {
  const reach = pitchRadius(GEAR_TEETH[0]) + pitchRadius(GEAR_TEETH[1]);
  const a = [-0.5, 0.2];
  const b = [a[0] + Math.cos(CONTACT) * reach, a[1] + Math.sin(CONTACT) * reach];
  const outer = [pitchRadius(GEAR_TEETH[0]) + MODULE, pitchRadius(GEAR_TEETH[1]) + MODULE];
  const cx = (Math.min(a[0] - outer[0], b[0] - outer[1]) + Math.max(a[0] + outer[0], b[0] + outer[1])) / 2;
  const cy = (Math.min(a[1] - outer[0], b[1] - outer[1]) + Math.max(a[1] + outer[0], b[1] + outer[1])) / 2;
  return [
    [a[0] - cx, a[1] - cy],
    [b[0] - cx, b[1] - cy],
  ];
})();

// A tooth spans the first half of each pitch (centred at 0.25), the gap the second half (centred at 0.75).
const TOOTH_CENTRE = 0.25;
const GAP_CENTRE = 0.75;

function toothProfile(angle: number, teeth: number) {
  const x = fract((angle * teeth) / TAU);
  const lift = x < 0.12 ? x / 0.12 : x < 0.38 ? 1 : x < 0.5 ? (0.5 - x) / 0.12 : 0;
  return pitchRadius(teeth) - 1.2 * MODULE + lift * 2.2 * MODULE;
}

/**
 * Start angles, speed and ratio for the shader. At the contact line the big gear shows a tooth
 * exactly where the small one shows a gap, and both pitch circles move at the same speed.
 */
export const GEAR_MOTION = {
  start: [
    CONTACT - (TOOTH_CENTRE * TAU) / GEAR_TEETH[0],
    CONTACT + Math.PI - (GAP_CENTRE * TAU) / GEAR_TEETH[1],
  ],
  speed: 0.45,
  ratio: GEAR_TEETH[0] / GEAR_TEETH[1],
};

function gears(count: number): Shape {
  const s = emptyShape(count);
  const half = GEAR_THICKNESS / 2;
  for (let i = 0; i < count; i++) {
    // The big gear gets points in proportion to its size.
    const g = Math.random() < 0.62 ? 0 : 1;
    const teeth = GEAR_TEETH[g];
    const r = pitchRadius(teeth);
    const hub = r * 0.22;
    const angle = rnd(0, TAU);
    const pick = Math.random();
    let radius: number;
    let z: number;
    if (pick < 0.42) {
      // Tooth outline on both faces
      radius = toothProfile(angle, teeth);
      z = Math.random() < 0.5 ? -half : half;
    } else if (pick < 0.6) {
      // Rim across the thickness
      radius = toothProfile(angle, teeth);
      z = rnd(-half, half);
    } else if (pick < 0.72) {
      // Inner ring on the faces
      radius = r * 0.62;
      z = Math.random() < 0.5 ? -half : half;
    } else if (pick < 0.86) {
      // Sparse web between hub and ring
      const inner = hub;
      const outer = r - 1.3 * MODULE;
      radius = Math.sqrt(rnd(inner * inner, outer * outer));
      z = Math.random() < 0.5 ? -half : half;
    } else {
      // Hub and bore
      radius = hub;
      z = rnd(-half, half);
    }
    s.position.set([Math.cos(angle) * radius, Math.sin(angle) * radius, z], i * 3);
    s.origin.set([GEAR_CENTRES[g][0], GEAR_CENTRES[g][1], 0], i * 3);
    s.part[i] = g;
  }
  return s;
}

/* SaaS platforms: three stacked rounded slabs, a product built on layers, that breathe apart and back. */

const SLAB = 0.95;
const SLAB_THICKNESS = 0.08;
const SLAB_GAP = 0.36;
const ROUNDNESS = 6;
const GRID = 0.1;

/** A point on the rounded-square outline (a superellipse). */
function outline(angle: number) {
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  return [
    Math.sign(c) * Math.abs(c) ** (2 / ROUNDNESS) * SLAB,
    Math.sign(sn) * Math.abs(sn) ** (2 / ROUNDNESS) * SLAB,
  ];
}

function layers(count: number): Shape {
  const s = emptyShape(count);
  const half = SLAB_THICKNESS / 2;
  const steps = Math.floor(SLAB / GRID);
  for (let i = 0; i < count; i++) {
    const layer = rndInt(0, 2);
    const y = (layer - 1) * SLAB_GAP;
    const pick = Math.random();
    let x: number;
    let z: number;
    let py: number;
    if (pick < 0.4) {
      // A regular dot grid on the top surface
      for (;;) {
        x = rndInt(-steps, steps) * GRID;
        z = rndInt(-steps, steps) * GRID;
        if (Math.abs(x / SLAB) ** ROUNDNESS + Math.abs(z / SLAB) ** ROUNDNESS <= 0.92) break;
      }
      py = y + half;
    } else if (pick < 0.78) {
      // Top and bottom edges
      [x, z] = outline(rnd(0, TAU));
      py = y + (Math.random() < 0.5 ? -half : half);
    } else {
      // Side wall
      [x, z] = outline(rnd(0, TAU));
      py = y + rnd(-half, half);
    }
    s.position.set([x, py, z], i * 3);
    s.part[i] = layer;
  }
  return s;
}

/* AI: a sphere of linked nodes, with signals running along the links. */

const NETWORK_RADIUS = 1.12;
const NODES = 46;
const NEIGHBOURS = 3;
const CHORDS = 6;

function network(count: number): Shape {
  const s = emptyShape(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes: number[][] = [];
  for (let i = 0; i < NODES; i++) {
    const y = 1 - (i / (NODES - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const k = NETWORK_RADIUS * rnd(0.9, 1);
    nodes.push([Math.cos(golden * i) * r * k, y * k, Math.sin(golden * i) * r * k]);
  }

  const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const keys = new Set<string>();
  const links: { a: number[]; b: number[]; phase: number; flip: boolean; length: number }[] = [];
  const link = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (i === j || keys.has(key)) return;
    keys.add(key);
    links.push({ a: nodes[i], b: nodes[j], phase: Math.random(), flip: Math.random() < 0.5, length: dist(nodes[i], nodes[j]) });
  };
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: dist(n, m) }))
      .sort((p, q) => p.d - q.d)
      .slice(1, NEIGHBOURS + 1)
      .forEach(({ j }) => link(i, j));
  });
  // A few long links through the middle, so it reads as thinking rather than a mesh.
  for (let c = 0; c < CHORDS; c++) link(rndInt(0, NODES - 1), rndInt(0, NODES - 1));
  const longest = Math.max(...links.map((l) => l.length));

  for (let i = 0; i < count; i++) {
    const pick = Math.random();
    if (pick < 0.3) {
      // A small cluster around a node
      const n = nodes[rndInt(0, NODES - 1)];
      const spread = () => (rnd(-1, 1) + rnd(-1, 1) + rnd(-1, 1)) * 0.028;
      s.position.set([n[0] + spread(), n[1] + spread(), n[2] + spread()], i * 3);
    } else if (pick < 0.92) {
      // A point along a link; longer links get more points so they stay evenly dotted
      let l = links[rndInt(0, links.length - 1)];
      while (Math.random() > l.length / longest) l = links[rndInt(0, links.length - 1)];
      const t = Math.random();
      const j = () => rnd(-0.006, 0.006);
      s.position.set(
        [l.a[0] + (l.b[0] - l.a[0]) * t + j(), l.a[1] + (l.b[1] - l.a[1]) * t + j(), l.a[2] + (l.b[2] - l.a[2]) * t + j()],
        i * 3,
      );
      s.pulse[i] = (l.flip ? 1 - t : t) * 0.999 + l.phase;
    } else {
      // Faint dust on the sphere's surface to hold its outline
      const u = rnd(-1, 1);
      const a = rnd(0, TAU);
      const r = Math.sqrt(1 - u * u) * NETWORK_RADIUS;
      s.position.set([Math.cos(a) * r, u * NETWORK_RADIUS, Math.sin(a) * r], i * 3);
    }
  }
  return s;
}

const builders: Record<ShapeKind, (count: number) => Shape> = { blocks, gears, layers, network };

export const buildShape = (kind: ShapeKind, count: number) => builders[kind](count);
