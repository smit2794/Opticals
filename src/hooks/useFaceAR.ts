// src/hooks/useFaceAR.ts
//
// Loads MediaPipe FaceMesh + Camera from CDN (bypasses Vite WASM bundling issues).
// Tracks 468 face landmarks in real-time → positions Three.js 3D glasses on eyes,
// rotates with head tilt (roll) and head turn (yaw).

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { createGlassesGroup, GEOMETRY_IPD } from '../utils/GlassesGeometry';
import type { TryOnFrame } from '../data/tryOnFrames';

// ── MediaPipe landmark indices ──────────────────────────────────────────────
const LM_LEFT_PUPIL    = 468;   // refined iris landmark
const LM_RIGHT_PUPIL   = 473;
const LM_LEFT_EYE_OUT  = 33;    // outer eye corners (for yaw estimation)
const LM_RIGHT_EYE_OUT = 263;
const LM_NOSE_TIP      = 1;     // nose tip (for yaw estimation)

// Smoothing factor — higher = snappier but jittery
const LERP = 0.40;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Load MediaPipe scripts from CDN ────────────────────────────────────────
const FACE_MESH_VERSION = '0.4.1633559619';
const CAM_UTILS_VERSION = '0.3.1675466862';

const CDN = (pkg: string, ver: string, file: string) =>
  `https://cdn.jsdelivr.net/npm/${pkg}@${ver}/${file}`;

async function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) return; // already loaded
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`CDN load failed: ${src}`));
    document.head.appendChild(s);
  });
}

async function loadMediaPipe(): Promise<{ FaceMesh: any; Camera: any }> {
  await loadScript(CDN('@mediapipe/face_mesh', FACE_MESH_VERSION, 'face_mesh.js'));
  await loadScript(CDN('@mediapipe/camera_utils', CAM_UTILS_VERSION, 'camera_utils.js'));
  const win = window as any;
  if (!win.FaceMesh || !win.Camera) throw new Error('MediaPipe globals not found after load');
  return { FaceMesh: win.FaceMesh, Camera: win.Camera };
}

// ── Three.js scene ─────────────────────────────────────────────────────────
function buildScene(canvas: HTMLCanvasElement, w: number, h: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  // 1 unit = 1 pixel in the orthographic camera → landmarks map directly
  const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 2000);
  cam.position.z = 500;

  // Lighting for 3D glasses
  const ambient = new THREE.AmbientLight(0xffffff, 0.70);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 0.90);
  key.position.set(0.4, 1.0, 2.0);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffeecc, 0.25);
  fill.position.set(-1, 0, 1);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xaaaaff, 0.20);
  rim.position.set(0, -1, -1);
  scene.add(rim);

  return { renderer, scene, cam };
}

// ── Landmark → Three.js world coordinate ──────────────────────────────────
// MediaPipe: x,y ∈ [0,1], origin top-left, y-down
// Three.js ortho: origin centre, y-up
// Both video and canvas have CSS scaleX(-1), so x-mapping is direct.
function lmXY(lx: number, ly: number, vw: number, vh: number) {
  return { x: (lx - 0.5) * vw, y: -(ly - 0.5) * vh };
}

// ── Hook ───────────────────────────────────────────────────────────────────
export interface UseFaceARReturn {
  videoRef:  React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading:    boolean;
  isReady:      boolean;
  faceDetected: boolean;
  error:        string | null;
  changeFrame: (frame: TryOnFrame) => void;
  shutdown:    () => void;
}

export function useFaceAR(initialFrame: TryOnFrame): UseFaceARReturn {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const camRef      = useRef<THREE.OrthographicCamera | null>(null);
  const glassesRef  = useRef<THREE.Group | null>(null);

  // MediaPipe
  const cameraRef   = useRef<any>(null);  // @mediapipe/camera_utils Camera instance
  const meshRef     = useRef<any>(null);  // FaceMesh instance

  // Smoothed transform values
  const smooth = useRef({ x: 0, y: 0, scale: 1, roll: 0, yaw: 0 });
  const gotFirst = useRef(false);

  const currentFrame = useRef<TryOnFrame>(initialFrame);

  const [isLoading,    setIsLoading]    = useState(false);
  const [isReady,      setIsReady]      = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Swap glasses mesh ─────────────────────────────────────────────────────
  const setGlasses = useCallback((frame: TryOnFrame) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove + dispose old
    if (glassesRef.current) {
      scene.remove(glassesRef.current);
      glassesRef.current.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => m?.dispose());
        }
      });
    }

    const group = createGlassesGroup(frame);
    group.visible = false;
    scene.add(group);
    glassesRef.current = group;
  }, []);

  // ── MediaPipe results callback (called ~30fps by Camera) ──────────────────
  const onResults = useCallback((results: any) => {
    const canvas  = canvasRef.current;
    const renderer = rendererRef.current;
    const scene    = sceneRef.current;
    const cam      = camRef.current;
    const glasses  = glassesRef.current;
    if (!canvas || !renderer || !scene || !cam || !glasses) return;

    const vw = canvas.width;
    const vh = canvas.height;

    const faces = results.multiFaceLandmarks;
    if (!faces || faces.length === 0) {
      glasses.visible = false;
      setFaceDetected(false);
      renderer.render(scene, cam);
      return;
    }

    setFaceDetected(true);
    const lm = faces[0]; // first face, 478 landmarks (refined)

    // Prefer iris landmarks (468/473) for precise pupil centres
    const lp = lm[LM_LEFT_PUPIL]  ?? lm[LM_LEFT_EYE_OUT];
    const rp = lm[LM_RIGHT_PUPIL] ?? lm[LM_RIGHT_EYE_OUT];
    if (!lp || !rp) return;

    // ── Position (world pixels) ──────────────────────────────────────────
    const lt = lmXY(lp.x, lp.y, vw, vh);
    const rt = lmXY(rp.x, rp.y, vw, vh);

    const cx = (lt.x + rt.x) / 2;
    const cy = (lt.y + rt.y) / 2;

    // ── Scale: IPD in pixels / our geometry IPD ──────────────────────────
    const ipdPx = Math.hypot(rt.x - lt.x, rt.y - lt.y);
    const sc    = ipdPx / GEOMETRY_IPD;

    // ── Roll (head tilt) ─────────────────────────────────────────────────
    const roll = Math.atan2(rt.y - lt.y, rt.x - lt.x);

    // ── Yaw (head turn) — estimated from nose lateral offset vs eye span ─
    // Outer eye landmarks
    const leo = lm[LM_LEFT_EYE_OUT]  ?? lp;
    const reo = lm[LM_RIGHT_EYE_OUT] ?? rp;
    const nt  = lm[LM_NOSE_TIP]      ?? lp;

    const leftDist  = Math.abs(leo.x - nt.x);
    const rightDist = Math.abs(reo.x - nt.x);
    const eyeSpan   = Math.max(Math.abs(leo.x - reo.x), 0.01);
    // Yaw in radians (~±0.6 for full 45° turn)
    const rawYaw = ((rightDist - leftDist) / eyeSpan) * 0.65;

    // ── Lerp for smooth animation ────────────────────────────────────────
    if (!gotFirst.current) {
      smooth.current = { x: cx, y: cy, scale: sc, roll, yaw: rawYaw };
      gotFirst.current = true;
    } else {
      const s = smooth.current;
      s.x     = lerp(s.x,     cx,     LERP);
      s.y     = lerp(s.y,     cy,     LERP);
      s.scale = lerp(s.scale, sc,     LERP);
      s.roll  = lerp(s.roll,  roll,   LERP * 0.6);
      s.yaw   = lerp(s.yaw,   rawYaw, LERP * 0.5);
    }

    const { x, y, scale, roll: r, yaw: y_rot } = smooth.current;

    // ── Apply to Three.js group ──────────────────────────────────────────
    glasses.visible = true;
    glasses.position.set(x, y, 0);
    glasses.scale.setScalar(scale);
    glasses.rotation.z = -r;         // roll
    glasses.rotation.y = y_rot;      // yaw for 3D depth effect

    renderer.render(scene, cam);
  }, []);

  // ── Initialise everything ─────────────────────────────────────────────────
  const init = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    gotFirst.current = false;

    // 1. Camera permission
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (err: any) {
      const denied = err?.name === 'NotAllowedError';
      setError(denied
        ? 'Camera access denied — allow camera in browser settings and refresh.'
        : `Camera error: ${err?.message ?? err}`);
      setIsLoading(false);
      return;
    }

    // 2. Attach stream to video element
    const video = videoRef.current;
    if (!video) { stream.getTracks().forEach(t => t.stop()); setIsLoading(false); return; }
    video.srcObject = stream;
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => video.play().then(res).catch(rej);
      video.onerror = rej;
      setTimeout(rej, 8000); // timeout
    });

    // 3. Three.js canvas
    const canvas = canvasRef.current;
    if (!canvas) { setIsLoading(false); return; }
    const vw = video.videoWidth  || 1280;
    const vh = video.videoHeight || 720;
    canvas.width  = vw;
    canvas.height = vh;

    const { renderer, scene, cam } = buildScene(canvas, vw, vh);
    rendererRef.current = renderer;
    sceneRef.current    = scene;
    camRef.current      = cam;
    setGlasses(currentFrame.current);

    // 4. Load MediaPipe from CDN
    try {
      const { FaceMesh, Camera } = await loadMediaPipe();

      // Create FaceMesh — locateFile points to CDN for WASM / model assets
      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          CDN('@mediapipe/face_mesh', FACE_MESH_VERSION, file),
      });

      faceMesh.setOptions({
        maxNumFaces:            1,
        refineLandmarks:        true,   // enables iris pupils (468/473)
        minDetectionConfidence: 0.55,
        minTrackingConfidence:  0.55,
      });

      faceMesh.onResults(onResults);
      meshRef.current = faceMesh;

      // Use Camera to feed each frame → much more reliable than RAF + send()
      const mpCamera = new Camera(video, {
        onFrame: async () => {
          if (meshRef.current) {
            await meshRef.current.send({ image: video });
          }
        },
        width:  vw,
        height: vh,
      });

      await mpCamera.start();
      cameraRef.current = mpCamera;

      setIsReady(true);
    } catch (err: any) {
      console.error('[FaceAR] MediaPipe CDN load failed:', err);
      setError('Face tracking CDN failed to load — check your internet connection.');
      // Fallback: show glasses in centre + render loop
      setIsReady(true);
      let rafId: number;
      const fallback = () => {
        if (!rendererRef.current || !sceneRef.current || !camRef.current) return;
        const g = glassesRef.current;
        if (g) {
          g.visible = true;
          g.position.set(0, 0, 0);
          g.scale.setScalar((vw * 0.18) / GEOMETRY_IPD);
          g.rotation.z = 0;
          g.rotation.y = 0;
        }
        rendererRef.current.render(sceneRef.current, camRef.current);
        rafId = requestAnimationFrame(fallback);
      };
      rafId = requestAnimationFrame(fallback);
      // store cleanup
      (cameraRef.current as any) = { stop: () => cancelAnimationFrame(rafId) };
    }

    setIsLoading(false);
  }, [onResults, setGlasses]);

  // ── Change frame ───────────────────────────────────────────────────────────
  const changeFrame = useCallback((frame: TryOnFrame) => {
    currentFrame.current = frame;
    setGlasses(frame);
  }, [setGlasses]);

  // ── Full shutdown ──────────────────────────────────────────────────────────
  const shutdown = useCallback(() => {
    // Stop MediaPipe Camera
    try { cameraRef.current?.stop(); } catch (_) {}
    cameraRef.current = null;

    // Close FaceMesh
    try { meshRef.current?.close(); } catch (_) {}
    meshRef.current = null;

    // Stop webcam tracks
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }

    // Dispose Three.js
    if (glassesRef.current) {
      glassesRef.current.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => m?.dispose());
        }
      });
      glassesRef.current = null;
    }
    rendererRef.current?.dispose();
    rendererRef.current = null;
    sceneRef.current    = null;
    camRef.current      = null;

    gotFirst.current = false;
    setIsReady(false);
    setFaceDetected(false);
    setError(null);
  }, []);

  // ── Mount / unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    init();
    return () => shutdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef, canvasRef,
    isLoading, isReady, faceDetected, error,
    changeFrame, shutdown,
  };
}
