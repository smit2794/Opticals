import { useEffect, useRef, useState } from 'react';

// Read FaceMesh directly from the window global loaded via JSDelivr CDN in index.html
const FaceMeshConstructor = (window as any).FaceMesh;

export function useFaceMesh(
  videoRef: React.RefObject<any>,
  onResults: (results: any) => void
) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const faceMeshRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store callback in a ref so the FaceMesh thread never re-initializes on render updates
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    let active = true;
    let faceMeshInstance: any = null;

    async function initFaceMesh() {
      try {
        if (!FaceMeshConstructor) {
          const GlobalFaceMesh = (window as any).FaceMesh;
          if (!GlobalFaceMesh) {
            throw new Error(
              'FaceMesh class could not be resolved from window global. ' +
              'Check CDN script tags.'
            );
          }
          faceMeshInstance = new GlobalFaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
          });
        } else {
          faceMeshInstance = new FaceMeshConstructor({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
          });
        }

        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMeshInstance.onResults((results: any) => {
          if (active) {
            onResultsRef.current(results);
          }
        });

        faceMeshRef.current = faceMeshInstance;
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize MediaPipe FaceMesh:', err);
        setError(err.message || 'Failed to initialize Face Mesh.');
        setIsLoading(false);
      }
    }

    initFaceMesh();

    return () => {
      active = false;
      if (faceMeshInstance) {
        faceMeshInstance.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Run exactly once on mount

  // Frame processing loop feeding camera frames into Face Mesh
  useEffect(() => {
    let active = true;

    async function processFrame() {
      if (!active) return;

      const video = videoRef.current?.video || videoRef.current;
      const faceMesh = faceMeshRef.current;

      if (video && video.readyState === 4 && faceMesh && !isLoading) {
        try {
          await faceMesh.send({ image: video });
        } catch (err) {
          // Soft log to avoid cluttering, frame may be transient
          // console.warn('Frame processing skipped:', err);
        }
      }

      // Schedule next frame check
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    if (!isLoading && !error) {
      processFrame();
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoading, error, videoRef]);

  return { isLoading, error };
}
