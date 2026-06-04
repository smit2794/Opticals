// src/services/DeepARService.ts

export interface DeepARInstance {
  shutdown: () => void;
  switchEffect: (effectPath: string) => Promise<void>;
  takeScreenshot: () => Promise<string>;
  startVideoRecording: () => Promise<void>;
  finishVideoRecording: () => Promise<Blob>;
  startCamera: (cameraOptions?: { mirror?: boolean }) => Promise<void>;
  stopCamera: () => void;
  changeParameter?: (nodeName: string, componentName: string, parameterName: string, value: any) => void;
  changeParameterFloat?: (gameObject: string, component: string, parameter: string, value: number) => void;
  changeParameterBool?: (gameObject: string, component: string, parameter: string, value: boolean) => void;
  changeParameterVector?: (gameObject: string, component: string, parameter: string, x: number, y: number, z: number, w: number) => void;
  changeParameterTexture?: (gameObject: string, component: string, parameter: string, textureUrl: string) => Promise<void>;
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

  /**
   * Modifies a material, texture, shader, or transform parameter on a specific 3D node.
   */
  changeParameter(
    nodeName: string,
    componentName: string,
    parameterName: string,
    value: any
  ): void {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    if (typeof (this.instance as any).changeParameter === 'function') {
      (this.instance as any).changeParameter(nodeName, componentName, parameterName, value);
    } else {
      console.warn('changeParameter method not supported on this DeepAR instance.');
    }
  }

  changeParameterFloat(
    gameObject: string,
    component: string,
    parameter: string,
    value: number
  ): void {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    if (typeof this.instance.changeParameterFloat === 'function') {
      this.instance.changeParameterFloat(gameObject, component, parameter, value);
    } else if (typeof (this.instance as any).changeParameterFloat === 'function') {
      (this.instance as any).changeParameterFloat(gameObject, component, parameter, value);
    } else {
      console.warn('changeParameterFloat method not supported on this DeepAR instance.');
    }
  }

  changeParameterBool(
    gameObject: string,
    component: string,
    parameter: string,
    value: boolean
  ): void {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    if (typeof this.instance.changeParameterBool === 'function') {
      this.instance.changeParameterBool(gameObject, component, parameter, value);
    } else if (typeof (this.instance as any).changeParameterBool === 'function') {
      (this.instance as any).changeParameterBool(gameObject, component, parameter, value);
    } else {
      console.warn('changeParameterBool method not supported on this DeepAR instance.');
    }
  }

  changeParameterVector(
    gameObject: string,
    component: string,
    parameter: string,
    x: number,
    y: number,
    z: number,
    w: number
  ): void {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    if (typeof this.instance.changeParameterVector === 'function') {
      this.instance.changeParameterVector(gameObject, component, parameter, x, y, z, w);
    } else if (typeof (this.instance as any).changeParameterVector === 'function') {
      (this.instance as any).changeParameterVector(gameObject, component, parameter, x, y, z, w);
    } else {
      console.warn('changeParameterVector method not supported on this DeepAR instance.');
    }
  }

  async changeParameterTexture(
    gameObject: string,
    component: string,
    parameter: string,
    textureUrl: string
  ): Promise<void> {
    if (!this.instance) {
      throw new Error('DeepAR is not initialized.');
    }
    if (typeof this.instance.changeParameterTexture === 'function') {
      await this.instance.changeParameterTexture(gameObject, component, parameter, textureUrl);
    } else if (typeof (this.instance as any).changeParameterTexture === 'function') {
      await (this.instance as any).changeParameterTexture(gameObject, component, parameter, textureUrl);
    } else {
      console.warn('changeParameterTexture method not supported on this DeepAR instance.');
    }
  }
}

export const deepARService = new DeepARService();
