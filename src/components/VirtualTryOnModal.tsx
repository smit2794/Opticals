// src/components/VirtualTryOnModal.tsx

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FiX, FiCamera, FiVideo, FiSquare, FiAlertTriangle } from 'react-icons/fi';
import { useDeepAR } from '../hooks/useDeepAR';
import TRY_ON_FRAMES from '../data/tryOnFrames';
import type { TryOnFrame } from '../data/tryOnFrames';
import '../styles/VirtualTryOn.css';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [selectedFrame, setSelectedFrame] = useState<TryOnFrame>(TRY_ON_FRAMES[0]);
  const selectedFrameRef = useRef<TryOnFrame>(TRY_ON_FRAMES[0]);

  const {
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
  } = useDeepAR();

  // Focus Management & Keyboard Support
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => { closeBtnRef.current?.focus(); }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Restore Focus on Unmount
  useEffect(() => {
    return () => previousFocusRef.current?.focus();
  }, []);

  // Handle fallback camera stream attachment
  useEffect(() => {
    if (isCameraOnly && cameraStream && fallbackVideoRef.current) {
      fallbackVideoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOnly, cameraStream]);

  // Initialize DeepAR once the element becomes available
  useEffect(() => {
    if (isOpen && previewRef.current) {
      init(previewRef.current, selectedFrameRef.current);
    }
    return () => shutdown();
  }, [isOpen, init, shutdown]);

  // Frame selection from carousel
  const handleFrameSelect = useCallback((frame: TryOnFrame) => {
    selectedFrameRef.current = frame;
    setSelectedFrame(frame);
    changeFrame(frame);
  }, [changeFrame]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="tryon-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tryon-modal-title"
    >
      <div className="tryon-modal-content">
        <div className="tryon-viewport-container">
          
          {/* DeepAR Canvas Mount Point */}
          <div ref={previewRef} className="tryon-canvas" style={{ display: isCameraOnly ? 'none' : 'block' }} />

          {/* Fallback Raw Camera Video (if DeepAR fails) */}
          {isCameraOnly && (
            <video
              ref={fallbackVideoRef}
              autoPlay
              playsInline
              muted
              className="tryon-video-feed"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          )}

          {/* Header */}
          <div className="tryon-header">
            <div className="tryon-title-section">
              <h2 id="tryon-modal-title" className="tryon-title">Virtual Try-On</h2>
              <div className="tryon-subtitle-row">
                <span className="tryon-subtitle">
                  {selectedFrame.name} · {selectedFrame.style}
                </span>
                {isCameraOnly ? (
                  <span className="tryon-badge-fallback" title="DeepAR failed to load, falling back to basic camera">2D Mode</span>
                ) : (
                  <span className="tryon-badge-3d">DeepAR</span>
                )}
              </div>
            </div>
            <button
              ref={closeBtnRef}
              className="tryon-close-btn"
              onClick={onClose}
              aria-label="Close Virtual Try-On"
            >
              <FiX />
            </button>
          </div>

          {/* Recording Timer indicator */}
          {isRecording && (
            <div className="tryon-recording-timer" aria-live="polite">
              <div className="tryon-timer-dot" />
              <span>REC {formatDuration(recordingDuration)}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="tryon-status-container">
              <div className="tryon-loader-spinner" />
              <p className="tryon-status-text">
                Initializing DeepAR face tracking engine...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="tryon-error-banner" role="alert">
              <FiAlertTriangle />
              <span>{error}</span>
            </div>
          )}

          {/* Bottom Controls Overlay */}
          {isInitialized && !error && (
            <div className="tryon-controls-overlay">
              
              {/* 8-Frame selector carousel */}
              <div className="tryon-frames-carousel" aria-label="Choose frame style">
                {TRY_ON_FRAMES.map((frame) => {
                  const active = selectedFrame.id === frame.id;
                  return (
                    <button
                      key={frame.id}
                      className={`tryon-frame-card${active ? ' tryon-frame-card--active' : ''}`}
                      onClick={() => handleFrameSelect(frame)}
                      aria-label={`Try ${frame.name}`}
                      aria-pressed={active}
                    >
                      <div className="tryon-frame-img-container">
                        <img
                          src={frame.overlayImage}
                          alt={frame.name}
                          className="tryon-frame-img"
                          loading="lazy"
                        />
                      </div>
                      <div className="tryon-frame-info">
                        <span className="tryon-frame-name">{frame.name}</span>
                        <span className="tryon-frame-style">{frame.style}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="tryon-buttons-row">
                <button
                  className="tryon-action-btn tryon-action-btn--capture"
                  onClick={() => capture()}
                  aria-label="Take a photo"
                  disabled={isRecording}
                >
                  <FiCamera />
                  <span>Snap Photo</span>
                </button>

                {isRecording ? (
                  <button
                    className="tryon-action-btn tryon-action-btn--recording-active"
                    onClick={stopRecord}
                    aria-label="Stop recording video"
                  >
                    <FiSquare />
                    <span>Stop Record</span>
                  </button>
                ) : (
                  <button
                    className="tryon-action-btn"
                    onClick={startRecord}
                    aria-label="Start recording video"
                  >
                    <FiVideo />
                    <span>Record Video</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
