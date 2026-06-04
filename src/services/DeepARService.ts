// src/services/DeepARService.ts

export interface DeepARInstance {
  shutdown: () => void;
  switchEffect: (effectPath: string) => Promise<void>;
  takeScreenshot: () => Promise<string>;
  startVideoRecording: () => Promise<void>;
  finishVideoRecording: () => Promise<Blob>;
  startCamera: (cameraOptions?: { mirror?: boolean }) => Promise<void>;
  stopCamera: () => void;
}

class DeepARService {
  private instance: DeepARInstance | null = null;
  private isInitializing = false;

  /**
   * Lazy loads the DeepAR SDK and initializes it on the target canvas.
   */
  async initialize(
    previewElement: HTMLElement,
    licenseKey: string,
    effectUrl: string
  ): Promise<DeepARInstance> {
    if (this.instance) {
      return this.instance;
    }

    if (this.isInitializing) {
      throw new Error('DeepAR is already in the process of initializing.');
    }

    this.isInitializing = true;

    try {
      if (!licenseKey) {
        throw new Error('DeepAR license key is missing in environment variables.');
      }

      // Lazy load DeepAR SDK
      const deeparModule = await import('deepar');
      
      // Initialize the SDK
      const deepARInstance = await deeparModule.initialize({
        licenseKey: licenseKey,
        previewElement: previewElement,
        effect: effectUrl,
      });

      this.instance = deepARInstance as unknown as DeepARInstance;

      // Start the live camera feed with mirroring enabled
      await this.instance.startCamera({ mirror: true });

      return this.instance;
    } catch (error) {
      console.error('DeepAR initialization failed:', error);
      this.shutdown();
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Switches the active AR eyeglasses effect.
   */
  async switchEffect(effectUrl: string): Promise<void> {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    await this.instance.switchEffect(effectUrl);
  }

  /**
   * Captures a screenshot of the current try-on view.
   * Returns a base64 Data URL (png).
   */
  async takeScreenshot(): Promise<string> {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    return await this.instance.takeScreenshot();
  }

  /**
   * Starts video recording.
   */
  async startRecording(): Promise<void> {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    await this.instance.startVideoRecording();
  }

  /**
   * Finishes video recording and returns the video Blob.
   */
  async finishRecording(): Promise<Blob> {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    return await this.instance.finishVideoRecording();
  }

  /**
   * Shutdown the active instance and release camera locks and WebGL context.
   */
  shutdown(): void {
    if (this.instance) {
      try {
        this.instance.shutdown();
      } catch (err) {
        console.warn('Error during DeepAR shutdown cleanup:', err);
      }
      this.instance = null;
    }
    this.isInitializing = false;
  }

  /**
   * Get current active DeepAR instance if initialized.
   */
  getInstance(): DeepARInstance | null {
    return this.instance;
  }
}

export const deepARService = new DeepARService();
