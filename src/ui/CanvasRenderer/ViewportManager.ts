import { Bounds } from './types';

export class ViewportManager {
  private scale = 1.0;
  private offset = { x: 0, y: 0 };
  private isPanning = false;
  private lastMousePos = { x: 0, y: 0 };
  private originalBounds?: Bounds;
  private isSettingBounds = false; // Prevent recursion
  private isShiftPressed = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private onBoundsChange: (bounds: Bounds) => void
  ) {
    this.setupEvents();
  }

  private setupEvents(): void {
    // Keyboard event listeners for visual feedback
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !this.isShiftPressed) {
        this.isShiftPressed = true;
        this.canvas.style.cursor = 'zoom-in';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        this.isShiftPressed = false;
        if (!this.isPanning) {
          this.canvas.style.cursor = 'grab';
        }
      }
    };

    // Add global keyboard listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up on canvas removal
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };

    // Store cleanup function for potential future use
    (this.canvas as any)._viewportCleanup = cleanup;

    // Wheel zoom - prevent default browser behavior
    this.canvas.addEventListener(
      'wheel',
      (e) => {
        // Only handle wheel events for zoom when Shift is pressed
        if (!e.shiftKey) {
          return; // Let browser handle normal scrolling
        }

        e.preventDefault();
        e.stopPropagation();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom with Shift+wheel
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoomAt(mouseX, mouseY, zoomFactor);
      },
      { passive: false }
    ); // Important: prevent default

    // Pan with mouse drag (left button without Shift)
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        this.isPanning = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
        return false;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;

        // Invert direction - pull towards cursor
        this.offset.x -= dx;
        this.offset.y -= dy;

        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.updateBounds();
        return false;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (this.isPanning) {
        e.preventDefault();
        e.stopPropagation();
        this.isPanning = false;

        // Restore cursor based on Shift state
        if (this.isShiftPressed) {
          this.canvas.style.cursor = 'zoom-in';
        } else {
          this.canvas.style.cursor = 'grab';
        }
        return false;
      }
    });

    this.canvas.addEventListener('mouseleave', (e) => {
      if (this.isPanning) {
        e.preventDefault();
        e.stopPropagation();
        this.isPanning = false;

        // Reset to default cursor when leaving canvas
        this.canvas.style.cursor = 'grab';
      }
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    this.canvas.style.cursor = 'grab';
  }

  setOriginalBounds(bounds: Bounds): void {
    this.originalBounds = { ...bounds };

    // Don't automatically reset view - preserve current viewport state
    // This prevents recursive bounds updates
    if (this.scale !== 1.0 || this.offset.x !== 0 || this.offset.y !== 0) {
      this.applyTransformToBounds();
    } else {
      // Only reset view if we had previous bounds (not first time setup)
      if (this.originalBounds && (this.scale !== 1.0 || this.offset.x !== 0 || this.offset.y !== 0)) {
        this.resetView();
      }
    }
  }

  private applyTransformToBounds(): void {
    if (!this.originalBounds) return;

    const [xMin, xMax] = this.originalBounds.x;
    const [yMin, yMax] = this.originalBounds.y;

    const xRange = (xMax - xMin) / this.scale;
    const yRange = (yMax - yMin) / this.scale;

    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;

    // Convert pixel offset to data offset
    const rect = this.canvas.getBoundingClientRect();
    const dataOffsetX = (this.offset.x / rect.width) * xRange;
    const dataOffsetY = -(this.offset.y / rect.height) * yRange;

    const newBounds: Bounds = {
      x: [xCenter - xRange / 2 + dataOffsetX, xCenter + xRange / 2 + dataOffsetX],
      y: [yCenter - yRange / 2 + dataOffsetY, yCenter + yRange / 2 + dataOffsetY]
    };

    this.onBoundsChange(newBounds);
  }

  private zoomAt(pixelX: number, pixelY: number, factor: number): void {
    if (!this.originalBounds) return;

    // Save world coordinates under cursor
    const currentBounds = this.getCurrentVisibleBounds();
    if (!currentBounds) return;

    const [curXMin, curXMax] = currentBounds.x;
    const [curYMin, curYMax] = currentBounds.y;

    const rect = this.canvas.getBoundingClientRect();

    // Point under cursor in world coordinates
    const worldX = curXMin + (pixelX / rect.width) * (curXMax - curXMin);
    const worldY = curYMin + ((rect.height - pixelY) / rect.height) * (curYMax - curYMin);

    // Apply scale
    const oldScale = this.scale;
    this.scale *= factor;
    this.scale = Math.max(0.1, Math.min(20, this.scale));

    // Calculate how much the point under cursor moved
    const newBounds = this.getCurrentVisibleBounds();
    if (!newBounds) return;

    const [newXMin, newXMax] = newBounds.x;
    const [newYMin, newYMax] = newBounds.y;

    // New position of the same point in world coordinates
    const newWorldX = newXMin + (pixelX / rect.width) * (newXMax - newXMin);
    const newWorldY = newYMin + ((rect.height - pixelY) / rect.height) * (newYMax - newYMin);

    // Adjust offset to keep point under cursor
    const dx = worldX - newWorldX;
    const dy = worldY - newWorldY;

    // Convert offset to pixels
    const xRange = (this.originalBounds.x[1] - this.originalBounds.x[0]) / this.scale;
    const yRange = (this.originalBounds.y[1] - this.originalBounds.y[0]) / this.scale;

    this.offset.x += (dx / xRange) * rect.width;
    this.offset.y -= (dy / yRange) * rect.height;

    this.updateBounds();
  }

  private updateBounds(): void {
    if (!this.originalBounds || this.isSettingBounds) return;

    this.isSettingBounds = true;

    const [xMin, xMax] = this.originalBounds.x;
    const [yMin, yMax] = this.originalBounds.y;

    const xRange = (xMax - xMin) / this.scale;
    const yRange = (yMax - yMin) / this.scale;

    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;

    // Convert pixel offset to data offset
    const rect = this.canvas.getBoundingClientRect();
    const dataOffsetX = (this.offset.x / rect.width) * xRange;
    const dataOffsetY = -(this.offset.y / rect.height) * yRange;

    const newBounds: Bounds = {
      x: [xCenter - xRange / 2 + dataOffsetX, xCenter + xRange / 2 + dataOffsetX],
      y: [yCenter - yRange / 2 + dataOffsetY, yCenter + yRange / 2 + dataOffsetY]
    };

    this.onBoundsChange(newBounds);

    // Reset flag after callback
    setTimeout(() => {
      this.isSettingBounds = false;
    }, 0);
  }

  // Additional method for debugging
  getCurrentVisibleBounds(): Bounds | null {
    if (!this.originalBounds) return null;
    
    const [xMin, xMax] = this.originalBounds.x;
    const [yMin, yMax] = this.originalBounds.y;
    
    const xRange = (xMax - xMin) / this.scale;
    const yRange = (yMax - yMin) / this.scale;
    
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    
    const rect = this.canvas.getBoundingClientRect();
    const dataOffsetX = (this.offset.x / rect.width) * xRange;
    const dataOffsetY = -(this.offset.y / rect.height) * yRange;
    
    return {
      x: [xCenter - xRange / 2 + dataOffsetX, xCenter + xRange / 2 + dataOffsetX],
      y: [yCenter - yRange / 2 + dataOffsetY, yCenter + yRange / 2 + dataOffsetY]
    };
  }

  resetView(): void {
    this.scale = 1.0;
    this.offset = { x: 0, y: 0 };
    if (this.originalBounds) {
      this.onBoundsChange({ ...this.originalBounds });
    }
  }

  getScale(): number {
    return this.scale;
  }

  getOffset(): { x: number; y: number } {
    return { ...this.offset };
  }
}
