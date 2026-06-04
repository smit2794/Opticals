// src/hooks/useDeepAR.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { deepARService } from '../services/DeepARService';

interface UseDeepARReturn {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isRecording: boolean;
  recordingDuration: number;
  init: (previewElement: HTMLElement, effectUrl: string) => Promise<void>;
  changeEffect: (effectUrl: string) => Promise<void>;
  capture: () => Promise<void>;
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

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up recording timer if any
  const clearRecordingTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Shutdown DeepAR on unmount
  useEffect(() => {
    return () => {
      clearRecordingTimer();
      deepARService.shutdown();
    };
  }, [clearRecordingTimer]);

  // Handle Recording Timer
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

  /**
   * Initializes the DeepAR instance.
   */
  const init = useCallback(async (previewElement: HTMLElement, effectUrl: string) => {
    setIsLoading(true);
    setIsInitialized(false);
    setError(null);

    const licenseKey = import.meta.env.VITE_DEEPAR_LICENSE_KEY;

    if (!licenseKey) {
      setError(
        'DeepAR License Key is missing. Please add VITE_DEEPAR_LICENSE_KEY to your environment configuration.'
      );
      setIsLoading(false);
      return;
    }

    try {
      await deepARService.initialize(previewElement, licenseKey, effectUrl);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('Failed to initialize try-on:', err);
      
      const errMsg = err?.toString() || '';
      if (
        errMsg.includes('NotAllowedError') ||
        errMsg.includes('Permission denied') ||
        err?.name === 'NotAllowedError'
      ) {
        setError(
          'Camera access was denied. Please allow camera access in your browser settings to try on frames.'
        );
      } else if (
        errMsg.includes('NotFoundError') ||
        errMsg.includes('DevicesNotFoundError') ||
        err?.name === 'NotFoundError'
      ) {
        setError('No webcam device was found. Please connect a camera and try again.');
      } else if (
        errMsg.includes('NotSupportedError') ||
        errMsg.includes('WebGl') ||
        err?.name === 'NotSupportedError'
      ) {
        setError(
          'WebGL 2 or webcam video capture is not supported by your browser. Please try Chrome, Safari, or Firefox.'
        );
      } else {
        setError(
          `Could not initialize the virtual try-on engine: ${err?.message || err?.toString() || 'Unknown error'}. Please verify your device settings and refresh to try again.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Changes the active eyeglass model.
   */
  const changeEffect = useCallback(async (effectUrl: string) => {
    try {
      await deepARService.switchEffect(effectUrl);
    } catch (err) {
      console.error('Failed to change frame effect:', err);
      setError('Failed to load the selected frame model.');
    }
  }, []);

  /**
   * Takes a screenshot and automatically downloads it.
   */
  const capture = useCallback(async () => {
    try {
      const dataUrl = await deepARService.takeScreenshot();
      
      // Auto download screenshot
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `optica-tryon-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to capture photo:', err);
      alert('Could not capture screenshot. Please try again.');
    }
  }, []);

  /**
   * Starts video recording.
   */
  const startRecord = useCallback(async () => {
    try {
      setError(null);
      await deepARService.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start video recording:', err);
      setError('Failed to start video recording. Make sure camera feed is active.');
    }
  }, []);

  /**
   * Stops video recording and downloads the resulting file.
   */
  const stopRecord = useCallback(async () => {
    try {
      setIsRecording(false);
      const videoBlob = await deepARService.finishRecording();
      
      // Auto download video
      const videoUrl = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `optica-tryon-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(videoUrl);
    } catch (err) {
      console.error('Failed to finish video recording:', err);
      alert('Could not finalize video recording.');
    }
  }, []);

  /**
   * Shuts down DeepAR, releasing camera streams and clearing state.
   */
  const shutdown = useCallback(() => {
    clearRecordingTimer();
    deepARService.shutdown();
    setIsInitialized(false);
    setIsRecording(false);
    setRecordingDuration(0);
    setError(null);
  }, [clearRecordingTimer]);

  return {
    isLoading,
    isInitialized,
    error,
    isRecording,
    recordingDuration,
    init,
    changeEffect,
    capture,
    startRecord,
    stopRecord,
    shutdown,
  };
}
