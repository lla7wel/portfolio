import type * as ThreeTypes from "three";

type SceneKind =
  | "cross-section"
  | "english-home-platform"
  | "nova-raid"
  | "pico-voice-terminal"
  | "fpga-digital-logic"
  | "smart-home-controller";

type ThreeModule = typeof import("three");
type ScenePart = ThreeTypes.Object3D & { userData: { phase?: number; pulse?: boolean } };

let THREE: ThreeModule;
let threePromise: Promise<ThreeModule> | undefined;
const loadThree = () => (threePromise ??= import("three"));

const initialized = new WeakSet<HTMLElement>();

const palettes: Record<SceneKind, { accent: number; secondary: number; board: number }> = {
  "cross-section": { accent: 0x35d58a, secondary: 0x65c8ff, board: 0x0f2621 },
  "english-home-platform": { accent: 0x35d5c8, secondary: 0xff8f78, board: 0x102624 },
  "nova-raid": { accent: 0xe65cff, secondary: 0x55d9ff, board: 0x15111f },
  "pico-voice-terminal": { accent: 0x65ff7b, secondary: 0x42b8ff, board: 0x0c2414 },
  "fpga-digital-logic": { accent: 0x7c9dff, secondary: 0xffc857, board: 0x11172b },
  "smart-home-controller": { accent: 0xffb54a, secondary: 0x50d890, board: 0x2a1c0c },
};

const material = (color: number, emissive = 0, metalness = 0.38) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 0.42 : 0,
    metalness,
    roughness: 0.42,
  });

const box = (
  size: [number, number, number],
  color: number,
  position: [number, number, number],
  emissive = 0,
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, emissive));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const node = (color: number, position: [number, number, number], scale = 0.17) => {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(scale, 2),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.25,
      roughness: 0.2,
    }),
  ) as ScenePart;
  mesh.position.set(...position);
  mesh.userData.pulse = true;
  mesh.userData.phase = Math.random() * Math.PI * 2;
  return mesh;
};

const line = (points: ThreeTypes.Vector3[], color: number, opacity = 0.68) => {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
};

function crossSection(group: ThreeTypes.Group, p: (typeof palettes)[SceneKind]) {
  const levels = [
    ["SENSORS", -2.25],
    ["FIRMWARE", -1.5],
    ["FPGA", -0.75],
    ["NETWORK", 0],
    ["SERVICES", 0.75],
    ["INTERFACE", 1.5],
    ["HUMAN", 2.25],
  ] as const;
  levels.forEach(([label, y], i) => {
    const width = 4.2 - Math.abs(i - 3) * 0.18;
    const slab = box([width, 0.16, 1.1], i < 3 ? p.board : 0x12202a, [0, y, 0]);
    slab.rotation.y = -0.12 + i * 0.035;
    slab.userData.label = label;
    group.add(slab, node(i < 3 ? p.accent : p.secondary, [-width / 2 + 0.22, y + 0.12, 0.25], 0.11));
  });
  group.add(
    line(
      levels.map(([, y]) => new THREE.Vector3(-1.7, y + 0.12, 0.26)),
      p.accent,
      0.9,
    ),
  );
}

function englishHome(group: ThreeTypes.Group, p: (typeof palettes)[SceneKind]) {
  const center = box([1.5, 0.34, 1.05], p.board, [0, 0, 0], p.accent);
  group.add(center);
  const channels: [number, number, number][] = [
    [-2.5, 1.25, 0],
    [-2.65, -1.05, 0.25],
    [2.6, 1.15, -0.1],
    [2.7, -1.1, 0.2],
  ];
  channels.forEach((pos, i) => {
    const n = node(i < 2 ? p.secondary : p.accent, pos, 0.23);
    group.add(n, line([new THREE.Vector3(...pos), new THREE.Vector3(0, 0, 0)], i < 2 ? p.secondary : p.accent));
  });
  for (let i = 0; i < 14; i++) {
    const x = -1.3 + (i % 7) * 0.43;
    const z = -1.55 - Math.floor(i / 7) * 0.42;
    group.add(box([0.31, 0.1, 0.27], 0x263d3a, [x, -0.52, z], i % 4 === 0 ? p.accent : 0));
  }
  const outbox = box([2.6, 0.12, 0.42], 0x1b2c32, [0, -1.45, 0.2], p.secondary);
  group.add(outbox, node(p.secondary, [0, -1.35, 0.26], 0.12));
}

function nova(group: ThreeTypes.Group, p: (typeof palettes)[SceneKind]) {
  const board = box([4.1, 0.18, 2.6], 0x173927, [0, -0.42, 0]);
  const screen = box([2.9, 0.2, 1.72], 0x06070b, [0.35, 0.15, 0.05], p.secondary);
  screen.rotation.x = -0.1;
  group.add(board, screen);
  for (let i = 0; i < 22; i++) {
    const color = i % 3 === 0 ? p.accent : i % 3 === 1 ? p.secondary : 0xffffff;
    const pixel = box([0.14, 0.055, 0.14], color, [-0.7 + (i % 8) * 0.26, 0.29, -0.48 + Math.floor(i / 8) * 0.34], color);
    group.add(pixel);
  }
  const chip = box([0.75, 0.2, 0.75], 0x0b1013, [-1.35, -0.18, 0.55], p.accent);
  group.add(chip);
  for (let i = 0; i < 8; i++) {
    const x = -1.82 + i * 0.52;
    group.add(box([0.08, 0.07, 0.32], 0xc4a665, [x, -0.25, -1.15]));
  }
}

function pico(group: ThreeTypes.Group, p: (typeof palettes)[SceneKind]) {
  const base = box([4, 0.16, 2.4], 0x17211d, [0, -0.65, 0]);
  const display = box([2.8, 0.22, 1.65], 0x07140c, [0.5, 0.5, 0], p.accent);
  const pico = box([0.75, 0.18, 1.55], 0x174d35, [-1.25, -0.1, 0.05], p.accent);
  const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 32), material(0x20262c, p.secondary));
  mic.position.set(-1.45, 0.85, 0.25);
  group.add(base, display, pico, mic);
  const stages: [number, number, number][] = [
    [-1.45, 1.25, 0.25],
    [-1.25, 0.25, 0.05],
    [-0.45, -0.15, 0.1],
    [0.55, 0.05, 0.05],
    [1.25, 0.55, 0],
  ];
  group.add(line(stages.map((x) => new THREE.Vector3(...x)), p.accent, 0.95));
  stages.forEach((x, i) => group.add(node(i === 3 ? p.secondary : p.accent, x, 0.1)));
}

function fpga(group: ThreeTypes.Group, p: (typeof palettes)[SceneKind]) {
  const stages: ThreeTypes.Vector3[] = [];
  for (let i = 0; i < 4; i++) {
    const x = -2.05 + i * 1.36;
    const adder = box([0.92, 0.78, 0.9], 0x18264a, [x, 0, 0], p.accent);
    adder.rotation.y = -0.14;
    group.add(adder);
    stages.push(new THREE.Vector3(x, 0.14, 0.56));
    group.add(node(i === 3 ? p.secondary : p.accent, [x, 0.14, 0.56], 0.1));
  }
  group.add(line(stages, p.secondary, 0.95));
  for (let i = 0; i < 8; i++) {
    const x = -2.45 + i * 0.7;
    group.add(box([0.16, 0.42 + (i % 3) * 0.22, 0.16], i % 2 ? p.accent : p.secondary, [x, -1.18, 0], i % 2 ? p.accent : p.secondary));
  }
}

function smartHome(group: ThreeTypes.Group, p: (typeof palettes)[SceneKind]) {
  const board = box([3.7, 0.16, 2.45], 0x274c38, [0, -0.52, 0]);
  const uno = box([1.25, 0.22, 1.45], 0x176f8b, [-0.75, -0.18, 0.12], p.secondary);
  const lcd = box([1.75, 0.23, 0.78], 0x132133, [0.95, 0.15, 0.72], p.accent);
  const sensor = box([0.48, 0.78, 0.35], 0xe6e4de, [-1.45, 0.44, -0.68]);
  group.add(board, uno, lcd, sensor);
  const fan = new THREE.Group();
  const hub = node(p.secondary, [0, 0, 0], 0.2);
  fan.add(hub);
  for (let i = 0; i < 5; i++) {
    const blade = box([0.18, 0.75, 0.08], 0x30383d, [0, 0.47, 0]);
    blade.rotation.z = (i / 5) * Math.PI * 2;
    fan.add(blade);
  }
  fan.position.set(1.45, 0.75, -0.62);
  fan.rotation.x = -0.75;
  fan.userData.spin = true;
  group.add(fan);
  [p.accent, 0xffca55, 0xff5c62].forEach((color, i) => group.add(node(color, [-0.25 + i * 0.38, -0.23, -0.95], 0.08)));
}

function buildScene(kind: SceneKind, group: ThreeTypes.Group) {
  const p = palettes[kind];
  if (kind === "cross-section") crossSection(group, p);
  if (kind === "english-home-platform") englishHome(group, p);
  if (kind === "nova-raid") nova(group, p);
  if (kind === "pico-voice-terminal") pico(group, p);
  if (kind === "fpga-digital-logic") fpga(group, p);
  if (kind === "smart-home-controller") smartHome(group, p);
}

async function mount(root: HTMLElement) {
  if (initialized.has(root)) return;
  initialized.add(root);

  const canvas = root.querySelector("canvas");
  const toggle = root.querySelector<HTMLButtonElement>("[data-scene-toggle]");
  const state = root.querySelector<HTMLElement>("[data-scene-state]");
  const kind = root.dataset.scene as SceneKind;
  if (!canvas || !kind) return;

  THREE = await loadThree();
  let renderer: ThreeTypes.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    root.dataset.ready = "fallback";
    if (state) state.textContent = "Static visualization";
    toggle?.setAttribute("hidden", "");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 2.2, 8.2);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group();
  group.rotation.set(-0.18, -0.24, 0.02);
  scene.add(group);
  buildScene(kind, group);

  scene.add(new THREE.HemisphereLight(0xc8fff0, 0x050709, 1.6));
  const key = new THREE.DirectionalLight(palettes[kind].accent, 4.2);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.PointLight(palettes[kind].secondary, 9, 18);
  rim.position.set(-4, 1, 4);
  scene.add(rim);

  const grid = new THREE.GridHelper(12, 24, palettes[kind].accent, 0x182224);
  grid.position.y = -1.8;
  (grid.material as ThreeTypes.Material).transparent = true;
  (grid.material as ThreeTypes.Material).opacity = 0.18;
  scene.add(grid);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = !reduced;
  let visible = false;
  let targetRotation = group.rotation.y;
  let dragging = false;
  let lastX = 0;
  let frame = 0;
  const startedAt = performance.now();

  const resize = () => {
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, root.querySelector<HTMLElement>(".scene-stage")?.clientHeight ?? rect.height);
    const ratio = Math.min(devicePixelRatio, 1.75);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const render = () => {
    frame = 0;
    const time = (performance.now() - startedAt) / 1000;
    group.rotation.y += (targetRotation - group.rotation.y) * 0.07;
    if (playing && visible) {
      targetRotation += 0.0017;
      group.children.forEach((child) => {
        const part = child as ScenePart;
        if (part.userData.pulse) {
          const phase = part.userData.phase ?? 0;
          part.scale.setScalar(1 + Math.sin(time * 2.3 + phase) * 0.08);
        }
        if (part.userData.spin) part.rotation.z += 0.035;
      });
    }
    renderer.render(scene, camera);
    if (visible) frame = requestAnimationFrame(render);
  };

  const schedule = () => {
    if (!frame && visible) frame = requestAnimationFrame(render);
  };

  new ResizeObserver(() => {
    resize();
    schedule();
  }).observe(root);

  new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) schedule();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0.08 },
  ).observe(root);

  root.addEventListener("pointerdown", (event) => {
    if ((event.target as Element).closest("[data-scene-toggle]")) return;
    dragging = true;
    lastX = event.clientX;
    root.setPointerCapture(event.pointerId);
  });
  root.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    targetRotation += (event.clientX - lastX) * 0.008;
    lastX = event.clientX;
    schedule();
  });
  root.addEventListener("pointerup", (event) => {
    dragging = false;
    root.releasePointerCapture(event.pointerId);
  });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    targetRotation += event.key === "ArrowLeft" ? -0.22 : 0.22;
    schedule();
  });

  if (reduced) {
    playing = false;
    toggle?.setAttribute("aria-pressed", "false");
  }
  toggle?.addEventListener("pointerdown", (event) => event.stopPropagation());
  toggle?.addEventListener("pointerup", (event) => event.stopPropagation());
  toggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    playing = !playing;
    toggle.setAttribute("aria-pressed", String(playing));
    schedule();
  });

  resize();
  renderer.render(scene, camera);
  root.dataset.ready = "true";
}

export function initEngineeringScenes() {
  document.querySelectorAll<HTMLElement>("[data-engineering-scene]").forEach((root) => {
    if (initialized.has(root)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void mount(root);
      },
      { rootMargin: "280px 0px" },
    );
    observer.observe(root);
  });
}
