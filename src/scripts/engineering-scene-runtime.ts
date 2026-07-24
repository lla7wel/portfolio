import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  GridHelper,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";

type SceneKind =
  | "cross-section"
  | "english-home-platform"
  | "nova-raid"
  | "pico-voice-terminal"
  | "fpga-digital-logic"
  | "smart-home-controller";

type Palette = {
  accent: number;
  secondary: number;
  board: number;
  warning: number;
};

type AnimatedPart = Object3D & {
  userData: {
    animation?: "pulse" | "spin" | "breathe";
    path?: CatmullRomCurve3;
    speed?: number;
    offset?: number;
    phase?: number;
  };
};

type SceneSpec = {
  camera: [number, number, number];
  rotation: [number, number, number];
};

const palettes: Record<SceneKind, Palette> = {
  "cross-section": { accent: 0x43e5a4, secondary: 0x6bcfff, board: 0x11342b, warning: 0xffb55c },
  "english-home-platform": { accent: 0x43ddd0, secondary: 0xff927c, board: 0x11322f, warning: 0xffc45c },
  "nova-raid": { accent: 0xef6dff, secondary: 0x63dcff, board: 0x182b25, warning: 0xffd65a },
  "pico-voice-terminal": { accent: 0x69ff8d, secondary: 0x55bfff, board: 0x123d27, warning: 0xd99a65 },
  "fpga-digital-logic": { accent: 0x88a8ff, secondary: 0xffcd61, board: 0x172348, warning: 0x66e09b },
  "smart-home-controller": { accent: 0xffbd57, secondary: 0x64dca0, board: 0x31513b, warning: 0xff6670 },
};

const sceneSpecs: Record<SceneKind, SceneSpec> = {
  "cross-section": { camera: [0.2, 2.7, 8.6], rotation: [-0.18, -0.28, 0.02] },
  "english-home-platform": { camera: [0.1, 3.25, 8.8], rotation: [-0.24, -0.24, 0] },
  "nova-raid": { camera: [0.2, 3.65, 8.15], rotation: [-0.3, -0.2, 0] },
  "pico-voice-terminal": { camera: [0, 3.1, 8.75], rotation: [-0.24, -0.26, 0] },
  "fpga-digital-logic": { camera: [0.1, 2.6, 8.45], rotation: [-0.19, -0.2, 0] },
  "smart-home-controller": { camera: [0, 3.3, 8.45], rotation: [-0.28, -0.22, 0] },
};

const physical = (color: number, emissive = 0, opacity = 1) =>
  new MeshPhysicalMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 0.52 : 0,
    metalness: 0.52,
    roughness: 0.28,
    clearcoat: 0.35,
    clearcoatRoughness: 0.32,
    transparent: opacity < 1,
    opacity,
  });

const standard = (color: number, emissive = 0, opacity = 1) =>
  new MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 0.72 : 0,
    metalness: 0.32,
    roughness: 0.46,
    transparent: opacity < 1,
    opacity,
  });

function box(
  size: [number, number, number],
  color: number,
  position: [number, number, number],
  emissive = 0,
  opacity = 1,
) {
  const mesh = new Mesh(new BoxGeometry(...size), physical(color, emissive, opacity));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(
  radius: number,
  height: number,
  color: number,
  position: [number, number, number],
  emissive = 0,
) {
  const mesh = new Mesh(
    new CylinderGeometry(radius, radius, height, 32),
    physical(color, emissive),
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function beacon(color: number, position: [number, number, number], scale = 0.13) {
  const mesh = new Mesh(
    new IcosahedronGeometry(scale, 2),
    new MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.6,
      roughness: 0.18,
    }),
  ) as AnimatedPart;
  mesh.position.set(...position);
  mesh.userData.animation = "breathe";
  mesh.userData.phase = position[0] + position[1] * 1.7;
  return mesh;
}

function trace(points: Vector3[], color: number, opacity = 0.72) {
  return new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function signalPath(
  group: Group,
  positions: [number, number, number][],
  color: number,
  speed = 0.15,
  packets = 2,
) {
  const points = positions.map((position) => new Vector3(...position));
  const curve = new CatmullRomCurve3(points, false, "catmullrom", 0.22);
  group.add(trace(curve.getPoints(40), color, 0.78));

  for (let index = 0; index < packets; index += 1) {
    const packet = new Mesh(
      new SphereGeometry(0.075, 12, 8),
      new MeshBasicMaterial({ color }),
    ) as AnimatedPart;
    packet.userData.animation = "pulse";
    packet.userData.path = curve;
    packet.userData.speed = speed;
    packet.userData.offset = index / packets;
    group.add(packet);
  }
}

function instancedBoxes(
  size: [number, number, number],
  color: number,
  transforms: Array<{ position: [number, number, number]; rotation?: [number, number, number] }>,
  emissive = 0,
) {
  const instances = new InstancedMesh(
    new BoxGeometry(...size),
    standard(color, emissive),
    transforms.length,
  );
  const transform = new Object3D();
  transforms.forEach((entry, index) => {
    transform.position.set(...entry.position);
    transform.rotation.set(...(entry.rotation ?? [0, 0, 0]));
    transform.updateMatrix();
    instances.setMatrixAt(index, transform.matrix);
  });
  instances.instanceMatrix.needsUpdate = true;
  return instances;
}

function addGround(group: Group, palette: Palette) {
  const ring = new Mesh(
    new RingGeometry(2.55, 3.85, 80),
    new MeshBasicMaterial({
      color: palette.accent,
      transparent: true,
      opacity: 0.075,
      side: DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -1.62;
  group.add(ring);
}

function crossSection(group: Group, palette: Palette) {
  const levels = [
    [-2.28, 4.25, palette.accent],
    [-1.52, 4.02, palette.accent],
    [-0.76, 3.82, palette.secondary],
    [0, 3.58, palette.secondary],
    [0.76, 3.92, palette.secondary],
    [1.52, 4.18, palette.accent],
    [2.28, 4.38, palette.accent],
  ] as const;

  levels.forEach(([y, width, color], index) => {
    const slab = box(
      [width, 0.13, 1.15],
      index < 3 ? palette.board : 0x132832,
      [0, y, index % 2 ? 0.13 : -0.08],
      index === 0 || index === levels.length - 1 ? color : 0,
    );
    slab.rotation.y = -0.12 + index * 0.035;
    group.add(slab);
    group.add(beacon(color, [-width / 2 + 0.25, y + 0.13, 0.3], 0.095));

    const modules = Array.from({ length: 4 }, (_, moduleIndex) => ({
      position: [
        -width * 0.24 + moduleIndex * (width * 0.16),
        y + 0.13,
        index % 2 ? -0.28 : 0.22,
      ] as [number, number, number],
    }));
    group.add(instancedBoxes([0.34, 0.045, 0.18], 0x294b47, modules, index === 3 ? color : 0));
  });

  signalPath(
    group,
    levels.map(([y], index) => [-1.72 + index * 0.08, y + 0.12, 0.34]),
    palette.accent,
    0.095,
    3,
  );
  addGround(group, palette);
}

function englishHome(group: Group, palette: Palette) {
  const app = box([1.45, 0.42, 1.1], palette.board, [-0.35, 0.2, 0], palette.accent);
  const worker = box([1.2, 0.32, 0.9], 0x18313a, [1.15, 0.2, 0], palette.secondary);
  const database = cylinder(0.64, 0.42, 0x284853, [0.42, -0.8, 0.05], palette.accent);
  database.rotation.x = Math.PI / 2;
  const outbox = box([2.35, 0.12, 0.45], 0x1d3039, [1.25, -1.35, 0.15], palette.secondary);
  group.add(app, worker, database, outbox);

  const channelPositions: [number, number, number][] = [
    [-2.85, 1.2, -0.2],
    [-2.75, -0.2, 0.25],
    [-2.45, -1.2, -0.05],
  ];
  channelPositions.forEach((position, index) => {
    group.add(beacon(index === 2 ? palette.warning : palette.secondary, position, 0.2));
    signalPath(group, [position, [-1.25, 0.22, 0], [-0.6, 0.2, 0]], palette.secondary, 0.18, 1);
  });

  const catalogTiles = Array.from({ length: 28 }, (_, index) => ({
    position: [
      1.85 + (index % 7) * 0.32,
      1.1 - Math.floor(index / 7) * 0.31,
      -0.95,
    ] as [number, number, number],
    rotation: [-0.08, -0.12, 0] as [number, number, number],
  }));
  group.add(instancedBoxes([0.23, 0.07, 0.21], 0x2d5550, catalogTiles, palette.accent));

  const handoff = beacon(palette.warning, [3.2, -0.95, 0.35], 0.22);
  group.add(handoff);
  signalPath(group, [[-0.1, 0.05, 0], [0.42, -0.55, 0], [1.1, 0.05, 0]], palette.accent, 0.14, 2);
  signalPath(group, [[1.2, 0.05, 0], [1.2, -1.25, 0.15], [3.2, -0.95, 0.35]], palette.warning, 0.12, 2);
  signalPath(group, [[2.45, 0.6, -0.7], [1.65, 0.5, -0.35], [0.55, 0.2, 0]], palette.accent, 0.1, 2);
  addGround(group, palette);
}

function nova(group: Group, palette: Palette) {
  const board = box([4.7, 0.15, 2.85], palette.board, [0, -1.05, 0]);
  const pico = box([1.12, 0.2, 1.85], 0x176a4b, [-1.5, -0.72, 0.25], palette.accent);
  const core0 = box([0.42, 0.25, 0.42], 0x17212e, [-1.68, -0.5, 0.05], palette.accent);
  const core1 = box([0.42, 0.25, 0.42], 0x17212e, [-1.2, -0.5, 0.42], palette.secondary);
  const frameA = box([1.34, 0.08, 0.72], 0x243449, [-0.15, -0.48, 0.15], palette.secondary, 0.68);
  const frameB = box([1.34, 0.08, 0.72], 0x2a2747, [-0.04, -0.27, 0.05], palette.accent, 0.68);
  const dma = box([0.72, 0.2, 0.72], 0x162733, [1.1, -0.52, 0.15], palette.secondary);
  group.add(board, pico, core0, core1, frameA, frameB, dma);

  const screen = box([3.55, 0.17, 2.08], 0x05070c, [0.55, 0.75, -0.15], palette.secondary);
  screen.rotation.x = -0.2;
  group.add(screen);

  const pixels = Array.from({ length: 54 }, (_, index) => ({
    position: [
      -0.55 + (index % 12) * 0.2,
      0.92,
      -0.86 + Math.floor(index / 12) * 0.28,
    ] as [number, number, number],
    rotation: [-0.2, 0, 0] as [number, number, number],
  }));
  group.add(instancedBoxes([0.11, 0.035, 0.11], 0x5edcff, pixels, palette.secondary));

  signalPath(group, [[-1.7, -0.42, 0.05], [-0.65, -0.28, 0.1], [0.95, -0.45, 0.15]], palette.accent, 0.2, 2);
  signalPath(group, [[-1.2, -0.42, 0.42], [-0.05, -0.5, 0.1], [1.1, -0.42, 0.15], [1.35, 0.35, 0]], palette.secondary, 0.24, 3);

  const pins = Array.from({ length: 14 }, (_, index) => ({
    position: [-2.12 + index * 0.32, -0.9, -1.18] as [number, number, number],
  }));
  group.add(instancedBoxes([0.075, 0.08, 0.28], 0xc7a969, pins));
  addGround(group, palette);
}

function pico(group: Group, palette: Palette) {
  const base = box([4.8, 0.15, 2.65], 0x1c2924, [0, -1.15, 0]);
  const mic = cylinder(0.44, 0.14, 0x28323a, [-2.15, 0.75, 0.2], palette.secondary);
  mic.rotation.x = Math.PI / 2;
  const pio = box([0.68, 0.3, 0.68], palette.board, [-1.4, -0.3, 0.1], palette.accent);
  const dmaRing = new Mesh(new TorusGeometry(0.48, 0.09, 14, 42), physical(0x296c4c, palette.accent));
  dmaRing.position.set(-0.42, -0.25, 0.05);
  dmaRing.rotation.x = Math.PI / 2;
  const tls = box([0.9, 0.22, 0.68], 0x183349, [0.62, -0.25, 0.05], palette.secondary);
  const server = box([1.05, 0.95, 0.88], 0x17252f, [1.75, -0.05, 0], palette.secondary);
  const display = box([2.8, 0.18, 1.65], 0x07140d, [0.55, 1.08, -0.18], palette.accent);
  display.rotation.x = -0.2;
  group.add(base, mic, pio, dmaRing, tls, server, display);

  const serverSlots = Array.from({ length: 3 }, (_, index) => ({
    position: [1.75, 0.23 - index * 0.28, 0.46] as [number, number, number],
  }));
  group.add(instancedBoxes([0.65, 0.08, 0.05], 0x426a80, serverSlots, palette.secondary));

  signalPath(
    group,
    [[-2.15, 0.95, 0.2], [-1.65, 0.25, 0.1], [-1.4, -0.15, 0.1], [-0.42, -0.2, 0.05], [0.62, -0.2, 0.05], [1.75, -0.05, 0]],
    palette.accent,
    0.2,
    3,
  );
  signalPath(group, [[1.75, 0.05, 0], [1.3, 0.72, -0.1], [0.55, 1.18, -0.18]], palette.secondary, 0.14, 2);
  group.add(beacon(palette.accent, [-2.15, 1.08, 0.2], 0.11));
  addGround(group, palette);
}

function fpga(group: Group, palette: Palette) {
  const board = box([5.2, 0.13, 2.65], palette.board, [0, -1.1, 0]);
  group.add(board);

  const carryPoints: [number, number, number][] = [];
  for (let index = 0; index < 4; index += 1) {
    const x = -2.05 + index * 1.36;
    const adder = box([0.96, 0.78, 0.92], 0x1b2b59, [x, -0.05, 0], palette.accent);
    adder.rotation.y = -0.12;
    group.add(adder);
    group.add(beacon(index === 3 ? palette.secondary : palette.accent, [x, 0.18, 0.55], 0.095));
    carryPoints.push([x, 0.18, 0.56]);
    signalPath(group, [[x - 0.3, -1.0, -0.85], [x - 0.2, -0.45, -0.4], [x, -0.1, 0]], palette.secondary, 0.1 + index * 0.015, 1);
  }
  signalPath(group, carryPoints, palette.secondary, 0.24, 3);

  const outputs = Array.from({ length: 8 }, (_, index) => ({
    position: [-2.45 + index * 0.7, -0.78 + (index % 3) * 0.13, 0.98] as [number, number, number],
  }));
  group.add(instancedBoxes([0.16, 0.18, 0.16], 0x63dc91, outputs, palette.warning));
  addGround(group, palette);
}

function smartHome(group: Group, palette: Palette) {
  const board = box([4.8, 0.15, 2.75], palette.board, [0, -1.08, 0]);
  const uno = box([1.28, 0.22, 1.55], 0x1b7890, [-0.55, -0.65, 0.1], palette.secondary);
  const lcd = box([1.9, 0.22, 0.86], 0x15253c, [0.95, 0.25, 0.62], palette.accent);
  const climate = box([0.48, 0.8, 0.36], 0xe7e5dc, [-1.78, 0.38, -0.56]);
  const light = cylinder(0.25, 0.18, 0xcaa154, [-1.85, -0.35, 0.76], palette.warning);
  group.add(board, uno, lcd, climate, light);

  const fan = new Group() as AnimatedPart;
  fan.add(beacon(palette.secondary, [0, 0, 0], 0.2));
  for (let index = 0; index < 5; index += 1) {
    const blade = box([0.2, 0.78, 0.08], 0x344047, [0, 0.47, 0]);
    blade.rotation.z = (index / 5) * Math.PI * 2;
    fan.add(blade);
  }
  fan.position.set(1.75, 0.75, -0.65);
  fan.rotation.x = -0.72;
  fan.userData.animation = "spin";
  group.add(fan);

  const modes: [number, number, number][] = [
    [-0.68, -0.46, -0.72],
    [-0.32, -0.46, -0.72],
    [0.04, -0.46, -0.72],
    [0.4, -0.46, -0.72],
  ];
  modes.forEach((position, index) => {
    group.add(beacon(index === 3 ? palette.warning : palette.accent, position, 0.075));
  });

  signalPath(group, [[-1.78, 0.58, -0.56], [-1.25, -0.2, -0.15], [-0.55, -0.5, 0.1]], palette.secondary, 0.12, 2);
  signalPath(group, [[-1.85, -0.2, 0.76], [-1.2, -0.55, 0.38], [-0.55, -0.5, 0.1]], palette.accent, 0.1, 1);
  signalPath(group, [[-0.1, -0.45, 0.1], [0.85, 0.2, 0.5], [1.72, 0.72, -0.55]], palette.accent, 0.16, 2);
  signalPath(group, [[-0.05, -0.5, -0.2], [0.4, -0.46, -0.72], [1.72, 0.72, -0.55]], palette.warning, 0.11, 1);
  addGround(group, palette);
}

function buildScene(kind: SceneKind, group: Group) {
  const palette = palettes[kind];
  if (kind === "cross-section") crossSection(group, palette);
  if (kind === "english-home-platform") englishHome(group, palette);
  if (kind === "nova-raid") nova(group, palette);
  if (kind === "pico-voice-terminal") pico(group, palette);
  if (kind === "fpga-digital-logic") fpga(group, palette);
  if (kind === "smart-home-controller") smartHome(group, palette);
}

function disposeObject(root: Object3D) {
  root.traverse((child) => {
    if (!(child instanceof Mesh || child instanceof Line || child instanceof InstancedMesh)) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((entry: Material) => entry.dispose());
  });
}

export async function mountEngineeringScene(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("canvas");
  const toggle = root.querySelector<HTMLButtonElement>("[data-scene-toggle]");
  const state = root.querySelector<HTMLElement>("[data-scene-state]");
  const kind = root.dataset.scene as SceneKind;
  if (!canvas || !kind || !palettes[kind]) throw new Error("Invalid engineering scene");

  const locale = document.documentElement.lang === "ar" ? "ar" : "en";
  const contextAttributes: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    failIfMajorPerformanceCaveat: true,
    powerPreference: "high-performance",
  };
  let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    context =
      canvas.getContext("webgl2", contextAttributes) ??
      canvas.getContext("webgl", contextAttributes);
  } catch {
    throw new Error("WebGL unavailable");
  }
  if (!context) throw new Error("WebGL unavailable");
  const rendererInfo = context.getExtension("WEBGL_debug_renderer_info");
  const rendererName = rendererInfo
    ? String(context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
    : "";
  if (/swiftshader|llvmpipe|software rasterizer/i.test(rendererName)) {
    context.getExtension("WEBGL_lose_context")?.loseContext();
    throw new Error("Software WebGL renderer");
  }

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      context,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
    });
  } catch {
    throw new Error("WebGL unavailable");
  }

  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.shadowMap.enabled = root.clientWidth >= 720;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  scene.fog = new FogExp2(new Color(0x071012), 0.046);
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  const spec = sceneSpecs[kind];
  camera.position.set(...spec.camera);
  camera.lookAt(0, -0.05, 0);

  const group = new Group();
  group.rotation.set(...spec.rotation);
  scene.add(group);
  buildScene(kind, group);

  scene.add(new HemisphereLight(0xd8fff4, 0x05070a, 1.75));
  const key = new DirectionalLight(palettes[kind].accent, 4.8);
  key.position.set(4.5, 7, 5.5);
  key.castShadow = renderer.shadowMap.enabled;
  scene.add(key);
  const rim = new PointLight(palettes[kind].secondary, 11, 20, 1.6);
  rim.position.set(-4.5, 1.2, 4.8);
  scene.add(rim);
  const fill = new PointLight(0xffffff, 3.8, 15, 2);
  fill.position.set(2.5, -1, 4);
  scene.add(fill);

  const grid = new GridHelper(13, 26, palettes[kind].accent, 0x263337);
  grid.position.y = -1.64;
  (grid.material as Material).transparent = true;
  (grid.material as Material).opacity = 0.16;
  scene.add(grid);

  const floor = new Mesh(
    new PlaneGeometry(13, 13),
    new MeshBasicMaterial({ color: 0x071012, transparent: true, opacity: 0.34 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.66;
  scene.add(floor);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = !reduced;
  let visible = false;
  let targetRotation = group.rotation.y;
  let dragging = false;
  let lastX = 0;
  let frame = 0;
  let disposed = false;
  const startedAt = performance.now();

  const resize = () => {
    if (disposed) return;
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(
      1,
      root.querySelector<HTMLElement>(".scene-stage")?.clientHeight ?? rect.height,
    );
    renderer.setPixelRatio(Math.min(devicePixelRatio, width < 640 ? 1.35 : 1.75));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = width >= 720;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const render = () => {
    frame = 0;
    const time = (performance.now() - startedAt) / 1000;
    group.rotation.y += (targetRotation - group.rotation.y) * 0.075;

    group.traverse((child) => {
      const part = child as AnimatedPart;
      if (!part.userData.animation) return;
      if (part.userData.animation === "pulse" && part.userData.path) {
        const position = ((time * (part.userData.speed ?? 0.12)) + (part.userData.offset ?? 0)) % 1;
        part.position.copy(part.userData.path.getPointAt(position));
      }
      if (part.userData.animation === "breathe") {
        const phase = part.userData.phase ?? 0;
        const scale = 1 + Math.sin(time * 2.1 + phase) * (playing && visible ? 0.085 : 0);
        part.scale.setScalar(scale);
      }
      if (part.userData.animation === "spin" && playing && visible) {
        part.rotation.z += 0.028;
      }
    });

    renderer.render(scene, camera);
    if (visible && playing) frame = requestAnimationFrame(render);
  };

  const schedule = () => {
    if (!frame && visible && !disposed) frame = requestAnimationFrame(render);
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    schedule();
  });
  resizeObserver.observe(root);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting) && document.visibilityState === "visible";
      if (visible) schedule();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0.08 },
  );
  visibilityObserver.observe(root);

  const onVisibility = () => {
    visible = document.visibilityState === "visible" && root.getBoundingClientRect().bottom > 0;
    if (visible) schedule();
  };
  document.addEventListener("visibilitychange", onVisibility);

  root.addEventListener("pointerdown", (event) => {
    if ((event.target as Element).closest("[data-scene-toggle]")) return;
    dragging = true;
    lastX = event.clientX;
    root.dataset.dragging = "true";
    root.setPointerCapture(event.pointerId);
  });
  root.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    targetRotation += (event.clientX - lastX) * 0.008;
    lastX = event.clientX;
    schedule();
  });
  const stopDragging = (event: PointerEvent) => {
    dragging = false;
    delete root.dataset.dragging;
    if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
  };
  root.addEventListener("pointerup", stopDragging);
  root.addEventListener("pointercancel", stopDragging);
  root.addEventListener("keydown", (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      targetRotation = spec.rotation[1];
      schedule();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    targetRotation += event.key === "ArrowLeft" ? -0.22 : 0.22;
    schedule();
  });

  if (reduced) playing = false;
  toggle?.setAttribute("aria-pressed", String(playing));
  toggle?.addEventListener("pointerdown", (event) => event.stopPropagation());
  toggle?.addEventListener("pointerup", (event) => event.stopPropagation());
  toggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    playing = !playing;
    toggle.setAttribute("aria-pressed", String(playing));
    schedule();
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    disposeObject(scene);
    renderer.dispose();
  };

  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      dispose();
      root.dataset.ready = "fallback";
      toggle?.setAttribute("hidden", "");
      if (state) state.textContent = locale === "ar" ? "تصور ثابت للنظام" : "Static system visualization";
    },
    { once: true },
  );
  window.addEventListener("pagehide", dispose, { once: true });

  resize();
  renderer.render(scene, camera);
  root.dataset.ready = "true";
  if (state) {
    state.textContent =
      locale === "ar" ? "تصور تفاعلي · اسحب للاستكشاف" : "Interactive visualization · drag to inspect";
  }
  schedule();
}
