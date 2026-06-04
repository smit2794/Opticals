// src/hooks/useDeepAR.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { deepARService } from '../services/DeepARService';
import type { TryOnFrame } from '../data/tryOnFrames';

interface UseDeepARReturn {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isRecording: boolean;
  recordingDuration: number;
  isCameraOnly: boolean;
  cameraStream: MediaStream | null;
  init: (previewElement: HTMLElement, frame: TryOnFrame) => Promise<void>;
  changeFrame: (frame: TryOnFrame) => Promise<void>;
  capture: (videoElement?: HTMLVideoElement | null, overlayImageUrl?: string) => Promise<void>;
  startRecord: () => Promise<void>;
  stopRecord: () => Promise<void>;
  shutdown: () => void;
}

export function useDeepAR(): UseDeepARReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isCameraOnly, setIsCameraOnly] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentEffectRef = useRef<string | null>(null);
  const isCameraOnlyRef = useRef(false);

  const clearRecordingTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRecordingTimer();
      deepARService.shutdown();
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [clearRecordingTimer]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearRecordingTimer();
    }
    return () => clearRecordingTimer();
  }, [isRecording, clearRecordingTimer]);

  /** Apply 3D scale transforms to morph the aviator base model per frame shape */
  const applyFrameStyling = useCallback(async (frame: TryOnFrame) => {
    if (isCameraOnlyRef.current) return;
    const instance = deepARService.getInstance();
    if (!instance) return;

    const { x, y, z } = frame.deepARScale;

    // Lenses: clear for eyeglasses
    const la = frame.lensOpacity;

    try {
      // Apply scale via all known component/param variations for compatibility
      const nodes = ['frame', 'lens1', 'lens2', 'Glasses', 'glasses', 'Frame'];
      const components = ['', 'transform', 'Transform'];
      const params = ['scale', 'Scale'];

      for (const node of nodes) {
        for (const comp of components) {
          for (const param of params) {
            try {
              deepARService.changeParameterVector(node, comp, param, x, y, z, 1.0);
            } catch (_) {
              // silently skip unsupported combinations
            }
          }
        }
      }

      // Apply lens color (clear / tinted)
      const lensNodes = ['lens1', 'lens2', 'Lens1', 'Lens2', 'lens', 'Lens'];
      for (const n of lensNodes) {
        try {
          deepARService.changeParameterVector(n, 'MeshRenderer', 'u_color', frame.lensColor.r, frame.lensColor.g, frame.lensColor.b, la);
          deepARService.changeParameterVector(n, 'MeshRenderer', 'color', frame.lensColor.r, frame.lensColor.g, frame.lensColor.b, la);
        } catch (_) { /* skip */ }
      }

      // Apply frame color
      const frameColorNodes = ['frame', 'Frame', 'Glasses', 'glasses'];
      for (const n of frameColorNodes) {
        try {
          deepARService.changeParameterVector(n, 'MeshRenderer', 'u_color', frame.frameColor.r, frame.frameColor.g, frame.frameColor.b, 1.0);
          deepARService.changeParameterVector(n, 'MeshRenderer', 'color', frame.frameColor.r, frame.frameColor.g, frame.frameColor.b, 1.0);
        } catch (_) { /* skip */ }
      }

      console.log(`[TryOn] Applied styling for frame "${frame.name}" — scale:(${x},${y},${z})`);
    } catch (err) {
      console.warn('[TryOn] applyFrameStyling error:', err);
    }
  }, []);

  /** Initialize DeepAR or fall back to raw webcam */
  const init = useCallback(async (previewElement: HTMLElement, frame: TryOnFrame) => {
    setIsLoading(true);
    setIsInitialized(false);
    setError(null);
    setIsCameraOnly(false);
    isCameraOnlyRef.current = false;
    setCameraStream(null);
    currentEffectRef.current = null;

    const rawKey = import.meta.env.VITE_DEEPAR_LICENSE_KEY;
    const licenseKey = rawKey ? String(rawKey).trim() : '';

    if (!licenseKey) {
      setError('DeepAR license key is missing. Add VITE_DEEPAR_LICENSE_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    // Step 1: request camera permission
    let initialStream: MediaStream | null = null;
    try {
      initialStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (camErr: any) {
      const isPermissionDenied =
        camErr?.name === 'NotAllowedError' ||
        String(camErr).includes('NotAllowedError') ||
        String(camErr).includes('Permission denied');
      setError(
        isPermissionDenied
          ? 'Camera access was denied. Please allow camera access in your browser settings.'
          : `Could not access camera: ${camErr?.message || camErr}`,
      );
      setIsLoading(false);
      return;
    }

    // Step 2: choose DeepAR or raw fallback based on domain
    const host = window.location.hostname;
    const isDeepARDomain =
      host === 'divyangopticals.netlify.app' || host === 'divyang123.netlify.app' || host === 'localhost' || host === '127.0.0.1';

    const EFFECT_URL = 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators';

    if (isDeepARDomain) {
      try {
        // Stop the pre-flight stream before DeepAR takes over camera
        initialStream.getTracks().forEach((t) => t.stop());
        initialStream = null;

        await deepARService.initialize(previewElement, licenseKey, EFFECT_URL);
        currentEffectRef.current = EFFECT_URL;
        setIsInitialized(true);

        // Apply frame styling (with retry to handle WebGL compile lag)
        await applyFrameStyling(frame);
        setTimeout(() => applyFrameStyling(frame), 200);
        setTimeout(() => applyFrameStyling(frame), 600);
      } catch (err: any) {
        console.warn('[TryOn] DeepAR init failed, falling back to raw camera:', err);
        // Fall through to raw camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          cameraStreamRef.current = stream;
          setCameraStream(stream);
          setIsCameraOnly(true);
          isCameraOnlyRef.current = true;
          setIsInitialized(true);
        } catch (camErr2: any) {
          setError('Could not start camera. Please refresh and try again.');
        }
      }
    } else {
      // Non-licensed domain → raw camera fallback
      cameraStreamRef.current = initialStream;
      setCameraStream(initialStream);
      setIsCameraOnly(true);
      isCameraOnlyRef.current = true;
      setIsInitialized(true);
    }

    setIsLoading(false);
  }, [applyFrameStyling]);

  /** Switch to a different frame (3D mode only skips re-init, just re-styles) */
  const changeFrame = useCallback(async (frame: TryOnFrame) => {
    if (isCameraOnlyRef.current) {
      // In 2D mode, frame switch is handled by React state in the component — nothing to do here
      return;
    }

    const EFFECT_URL = 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators';
    try {
      // Only call switchEffect if the effect URL actually changes (all frames use same base)
      if (currentEffectRef.current !== EFFECT_URL) {
        await deepARService.switchEffect(EFFECT_URL);
        currentEffectRef.current = EFFECT_URL;
      }

      // Apply new frame styling immediately and with retries
      await applyFrameStyling(frame);
      setTimeout(() => applyFrameStyling(frame), 150);
      setTimeout(() => applyFrameStyling(frame), 450);
    } catch (err) {
      console.error('[TryOn] changeFrame error:', err);
    }
  }, [applyFrameStyling]);

  /** Capture screenshot */
  const capture = useCallback(async (
    videoElement?: HTMLVideoElement | null,
    overlayImageUrl?: string,
  ) => {
    try {
      let dataUrl = '';

      if (isCameraOnlyRef.current && videoElement) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Mirror the video
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          // Overlay the frame image
          if (overlayImageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = overlayImageUrl;
            await new Promise<void>((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            });
            const frameW = canvas.width * 0.55;
            const frameH = frameW * (img.naturalHeight / img.naturalWidth || 0.5);
            const frameX = (canvas.width - frameW) / 2;
            const frameY = canvas.height * 0.30;
            ctx.drawImage(img, frameX, frameY, frameW, frameH);
          }

          dataUrl = canvas.toDataURL('image/png');
        }
      } else {
        dataUrl = await deepARService.takeScreenshot();
      }

      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `divyang-tryon-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('[TryOn] capture error:', err);
      alert('Could not capture screenshot. Please try again.');
    }
  }, []);

  /** Start recording */
  const startRecord = useCallback(async () => {
    try {
      setError(null);
      if (isCameraOnlyRef.current && cameraStream) {
        const recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;
        recordedChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data?.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `divyang-tryon-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };
        recorder.start();
        setIsRecording(true);
      } else {
        await deepARService.startRecording();
        setIsRecording(true);
      }
    } catch (err) {
      console.error('[TryOn] startRecord error:', err);
      setError('Failed to start recording. Please try again.');
    }
  }, [cameraStream]);

  /** Stop recording */
  const stopRecord = useCallback(async () => {
    try {
      setIsRecording(false);
      if (isCameraOnlyRef.current) {
        if (mediaRecorderRef.current?.state !== 'inactive') {
          mediaRecorderRef.current?.stop();
        }
      } else {
        const blob = await deepARService.finishRecording();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `divyang-tryon-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('[TryOn] stopRecord error:', err);
      alert('Could not finalize recording.');
    }
  }, []);

  /** Full shutdown */
  const shutdown = useCallback(() => {
    clearRecordingTimer();
    deepARService.shutdown();
    currentEffectRef.current = null;
    isCameraOnlyRef.current = false;

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }

    setIsInitialized(false);
    setIsRecording(false);
    setRecordingDuration(0);
    setError(null);
    setIsCameraOnly(false);
    setCameraStream(null);
  }, [clearRecordingTimer]);

  return {
    isLoading,
    isInitialized,
    error,
    isRecording,
    recordingDuration,
    isCameraOnly,
    cameraStream,
    init,
    changeFrame,
    capture,
    startRecord,
    stopRecord,
    shutdown,
  };
}
