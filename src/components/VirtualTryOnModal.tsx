// src/components/VirtualTryOnModal.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FiX, FiCamera, FiVideo, FiSquare, FiAlertTriangle } from 'react-icons/fi';
import { useDeepAR } from '../hooks/useDeepAR';
import TRY_ON_FRAMES from '../data/tryOnFrames';
import type { TryOnFrame } from '../data/tryOnFrames';
import '../styles/VirtualTryOn.css';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ isOpen, onClose }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [selectedFrame, setSelectedFrame] = useState<TryOnFrame>(TRY_ON_FRAMES[0]);

  const {
    isLoading,
    isInitialized,
    error,
    isRecording,
    recordingDuration,
    isCameraOnly,
    cameraStream,
    init,
    capture,
    startRecord,
    stopRecord,
    shutdown,
    changeFrame,
  } = useDeepAR();

  // ─── Keyboard: Escape to close ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    setTimeout(() => closeBtnRef.current?.focus(), 100);

    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ─── Restore focus on close ───────────────────────────────────────────────
  useEffect(() => {
    return () => { previousFocusRef.current?.focus(); };
  }, []);

  // ─── Initialise DeepAR when modal opens ──────────────────────────────────
  useEffect(() => {
    if (isOpen && previewRef.current) {
      init(previewRef.current, selectedFrame);
    }
    return () => { shutdown(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ─── Assign camera stream to <video> in 2D fallback mode ─────────────────
  useEffect(() => {
    if (isCameraOnly && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOnly, cameraStream]);

  // ─── Frame card click handler ─────────────────────────────────────────────
  const handleFrameSelect = useCallback((frame: TryOnFrame) => {
    setSelectedFrame(frame);
    if (isInitialized && !isCameraOnly) {
      // Trigger 3D style update
      changeFrame(frame);
    }
    // In 2D mode the overlay image is driven by selectedFrame state automatically
  }, [isInitialized, isCameraOnly, changeFrame]);

  if (!isOpen) return null;

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="tryon-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tryon-modal-title"
    >
      <div className="tryon-modal-content">
        {/* ── Camera / DeepAR Viewport ───────────────────────────────── */}
        <div className="tryon-viewport-container">

          {/* DeepAR canvas (hidden in 2D mode) */}
          <div
            ref={previewRef}
            className="tryon-canvas"
            style={{ display: isCameraOnly ? 'none' : 'block' }}
          />

          {/* Raw camera + 2D frame overlay */}
          {isCameraOnly && (
            <div className="tryon-fallback-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="tryon-canvas tryon-video-mirror"
              />

              {/* 2D Frame overlay — changes instantly on card click */}
              {selectedFrame && (
                <div className="tryon-glass-overlay-container" key={selectedFrame.id}>
                  <img
                    src={selectedFrame.overlayImage}
                    alt={selectedFrame.name}
                    className="tryon-glass-overlay-img"
                    draggable={false}
                  />
                  <span className="tryon-alignment-hint">
                    Centre your face with the frame guides
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Glassmorphic header ──────────────────────────────────── */}
          <div className="tryon-header">
            <div className="tryon-title-section">
              <h2 id="tryon-modal-title" className="tryon-title">Virtual Try-On</h2>
              <div className="tryon-subtitle-row">
                <span className="tryon-subtitle">
                  {selectedFrame?.name} · {selectedFrame?.style}
                </span>
                {isCameraOnly && (
                  <span className="tryon-badge-fallback">2D Mode</span>
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

          {/* Recording timer */}
          {isRecording && (
            <div className="tryon-recording-timer" aria-live="polite">
              <div className="tryon-timer-dot" />
              <span>REC {formatDuration(recordingDuration)}</span>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="tryon-status-container">
              <div className="tryon-loader-spinner" />
              <p className="tryon-status-text">
                Starting camera & face tracking — please grant camera access when prompted…
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="tryon-status-container">
              <FiAlertTriangle className="tryon-status-icon-error" />
              <p className="tryon-status-text">{error}</p>
              <button className="tryon-action-btn" onClick={onClose}>
                Close
              </button>
            </div>
          )}

          {/* ── Controls (only when initialised & no error) ───────────── */}
          {isInitialized && !error && (
            <div className="tryon-controls-overlay">

              {/* 3-Frame selector */}
              <div className="tryon-frames-carousel" aria-label="Choose eyewear frame">
                {TRY_ON_FRAMES.map((frame) => {
                  const active = selectedFrame?.id === frame.id;
                  return (
                    <button
                      key={frame.id}
                      className={`tryon-frame-card${active ? ' tryon-frame-card--active' : ''}`}
                      onClick={() => handleFrameSelect(frame)}
                      aria-label={`Try on ${frame.name}`}
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

              {/* Action buttons */}
              <div className="tryon-buttons-row">
                <button
                  className="tryon-action-btn tryon-action-btn--capture"
                  onClick={() =>
                    capture(videoRef.current, selectedFrame?.overlayImage)
                  }
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
                    aria-label="Stop recording"
                  >
                    <FiSquare />
                    <span>Stop Record</span>
                  </button>
                ) : (
                  <button
                    className="tryon-action-btn"
                    onClick={startRecord}
                    aria-label="Start recording"
                  >
                    <FiVideo />
                    <span>Record</span>
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
