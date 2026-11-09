import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

import {
  GLYPH_SIZE,
  type ContactLogo,
} from "@/components/home/previews/contact-logos";
import { floatPose, floatSpecs } from "@/lib/float-motion";

const FOV = 35;
const CAMERA_Z = 9;
// Edge length of a logo in scene units.
const LOGO_SIZE = 1.5;
const MAX_DPR = 2;
const HOVER_SCALE = 1.14;
// Where the motion is frozen for reduced motion (seconds into the cycle).
const STATIC_SECONDS = 1.5;

export type ContactScene = {
  /** Only the active scene runs its animation loop. */
  setActive(active: boolean): void;
  resize(): void;
  destroy(): void;
};

function buildGeometry(path: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GLYPH_SIZE} ${GLYPH_SIZE}"><path d="${path}"/></svg>`;
  const shapes = new SVGLoader()
    .parse(svg)
    .paths.flatMap((shapePath) => shapePath.toShapes());

  const geometry = new ExtrudeGeometry(shapes, {
    depth: 2.6,
    curveSegments: 16,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.28,
    bevelSegments: 3,
  });
  geometry.center();
  // SVG's y axis points down; a half turn about x stands the glyph upright.
  geometry.rotateX(Math.PI);
  const scale = LOGO_SIZE / GLYPH_SIZE;
  geometry.scale(scale, scale, scale);
  return geometry;
}

type ContactSceneOptions = {
  canvas: HTMLCanvasElement;
  logos: readonly ContactLogo[];
  /** One link per logo, in the same order; moved to track each logo. */
  anchors: readonly HTMLElement[];
  /** False for reduced motion: render one still frame. */
  animate: boolean;
};

/**
 * Null when WebGL is unavailable or anything about setting the scene up fails
 * (a lost context, a missing float-texture extension, ...); the caller then
 * shows a flat fallback, so the links never depend on WebGL working.
 */
export function createContactScene(
  options: ContactSceneOptions,
): ContactScene | null {
  try {
    return buildContactScene(options);
  } catch {
    // Free the context a half-built scene may still hold.
    const context = options.canvas.getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
}

function buildContactScene(options: ContactSceneOptions): ContactScene {
  const { canvas, logos, anchors, animate } = options;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAMERA_Z);

  const environment = new PMREMGenerator(renderer);
  const environmentMap = environment.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environmentMap.texture;

  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  scene.add(key, new AmbientLight(0xffffff, 0.15));

  const material = new MeshStandardMaterial({
    color: 0xe6e6e6,
    metalness: 0.9,
    roughness: 0.3,
  });

  const items = logos.map((logo, index) => {
    const geometry = buildGeometry(logo.path);
    const group = new Group();
    group.add(new Mesh(geometry, material));
    scene.add(group);
    return {
      logo,
      group,
      geometry,
      anchor: anchors[index],
      base: new Vector3(),
      scale: 1,
      hovered: false,
    };
  });

  const cleanups: (() => void)[] = [];
  for (const item of items) {
    const over = () => (item.hovered = true);
    const out = () => (item.hovered = false);
    item.anchor.style.left = "0";
    item.anchor.style.top = "0";
    for (const [type, handler] of [
      ["pointerenter", over],
      ["pointerleave", out],
      ["focus", over],
      ["blur", out],
    ] as const) {
      item.anchor.addEventListener(type, handler);
      cleanups.push(() => item.anchor.removeEventListener(type, handler));
    }
  }

  let width = 1;
  let height = 1;
  let elapsed = animate ? 0 : STATIC_SECONDS;
  let frame = 0;
  let lastTime = 0;
  const projected = new Vector3();

  function place(dt: number) {
    for (const item of items) {
      const pose = floatPose(floatSpecs[item.logo.id], elapsed);
      item.group.position.set(item.base.x + pose.x, item.base.y + pose.y, 0);
      item.group.rotation.set(pose.rotationX, pose.rotationY, pose.rotationZ);

      const target = item.hovered ? HOVER_SCALE : 1;
      item.scale = MathUtils.damp(item.scale, target, 8, dt);
      item.group.scale.setScalar(item.scale);

      projected.copy(item.group.position).project(camera);
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      item.anchor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  }

  function draw(dt: number) {
    place(dt);
    renderer.render(scene, camera);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;

    width = bounds.width;
    height = bounds.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Resting positions come from the stage's -1..1 layout.
    const halfHeight = Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
    const halfWidth = halfHeight * camera.aspect;
    for (const item of items) {
      item.base.set(item.logo.at.x * halfWidth, item.logo.at.y * halfHeight, 0);
    }
    draw(0);
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick);
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    elapsed += dt;
    draw(dt);
  }

  return {
    resize,
    setActive(active) {
      if (!animate) return;
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (active) frame = requestAnimationFrame(tick);
    },
    destroy() {
      cancelAnimationFrame(frame);
      for (const cleanup of cleanups) cleanup();
      for (const item of items) item.geometry.dispose();
      material.dispose();
      environmentMap.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
