// src/components/VirtualTryOnModal.tsx

import React, { useEffect, useRef } from 'react';
import { FiX, FiCamera, FiVideo, FiSquare, FiAlertTriangle } from 'react-icons/fi';
import { useDeepAR } from '../hooks/useDeepAR';
import '../styles/VirtualTryOn.css';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  effectUrl: string;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  productName,
  effectUrl,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const {
    isLoading,
    isInitialized,
    error,
    isRecording,
    recordingDuration,
    init,
    capture,
    startRecord,
    stopRecord,
    shutdown,
  } = useDeepAR();

  // Focus Management & Keyboard Support
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus close button on mount
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Restore Focus on Unmount
  useEffect(() => {
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Initialize DeepAR once the element becomes available
  useEffect(() => {
    if (isOpen && previewRef.current) {
      init(previewRef.current, effectUrl);
    }
    return () => {
      shutdown();
    };
  }, [isOpen, effectUrl, init, shutdown]);

  if (!isOpen) return null;

  // Format Duration Timer (e.g. 00:05)
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
        {/* viewport preview div display */}
        <div className="tryon-viewport-container">
          <div ref={previewRef} className="tryon-canvas" />

          {/* AR glassmorphic header overlay */}
          <div className="tryon-header">
            <div className="tryon-title-section">
              <h2 id="tryon-modal-title" className="tryon-title">
                Virtual Try-On
              </h2>
              <span className="tryon-subtitle">{productName}</span>
            </div>
            <button
              ref={closeBtnRef}
              className="tryon-close-btn"
              onClick={onClose}
              aria-label="Close Virtual Try-On Modal"
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

          {/* Initial Loading State */}
          {isLoading && (
            <div className="tryon-status-container">
              <div className="tryon-loader-spinner" />
              <p className="tryon-status-text">
                Initializing face tracking engine. Please permit camera access when prompted...
              </p>
            </div>
          )}

          {/* Error and permissions failure state */}
          {error && (
            <div className="tryon-status-container">
              <FiAlertTriangle className="tryon-status-icon-error" />
              <p className="tryon-status-text">{error}</p>
              <button
                className="tryon-action-btn"
                onClick={onClose}
                aria-label="Close try-on modal after error"
              >
                Close View
              </button>
            </div>
          )}

          {/* AR actions control panels */}
          {isInitialized && !error && (
            <div className="tryon-controls-overlay">
              <div className="tryon-buttons-row">
                {/* Take Photo button */}
                <button
                  className="tryon-action-btn tryon-action-btn--capture"
                  onClick={capture}
                  aria-label="Capture screenshot of try-on"
                  disabled={isRecording}
                >
                  <FiCamera />
                  <span>Snap Photo</span>
                </button>

                {/* Record video toggle button */}
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
