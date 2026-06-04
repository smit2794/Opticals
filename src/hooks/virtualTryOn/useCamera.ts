import { useState, useCallback } from 'react';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setIsCameraActive(true);
      
      // Enumerate available video inputs
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !activeDeviceId) {
        // Default to the first camera
        setActiveDeviceId(videoDevices[0].deviceId);
      }
      
      // Release the temporary stream
      stream.getTracks().forEach(track => track.stop());
      setError(null);
    } catch (err) {
      setHasPermission(false);
      setIsCameraActive(false);
      setError('Camera permission denied or camera not available.');
      console.error('Error requesting camera permission:', err);
    }
  }, [activeDeviceId]);

  const toggleCamera = useCallback((active: boolean) => {
    setIsCameraActive(active);
  }, []);

  return {
    hasPermission,
    isCameraActive,
    devices,
    activeDeviceId,
    setActiveDeviceId,
    error,
    requestPermission,
    toggleCamera
  };
}
