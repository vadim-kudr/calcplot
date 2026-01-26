/**
 * CalcPlot Client Initialization
 * Handles setup and initialization of visualizations
 */

import { SimulationEngine } from './SimulationEngine';
import { ViewRenderer } from './ViewRenderer';
import { createSlider } from '../../ui/components/Slider';
import { createCheckbox } from '../../ui/components/Checkbox';
import { createElement } from '../../utils/html-tag';
import { deserializeFunctions, deserializeEvents } from '../serialization';
import { view } from '../../ui/ViewBuilder';

// Make components available globally for client
if (typeof globalThis !== 'undefined') {
  (globalThis as any).CalcPlotComponents = {
    createSlider: createSlider,
    createCheckbox: createCheckbox,
    view: view
  };
}

// Helper function to resolve dimensions
function resolveDimension(value: any, container: HTMLElement, fallback: number, useClientWidth = false): number {
  if (value === 'auto' && useClientWidth) {
    return container.clientWidth || fallback;
  }
  if (typeof value === 'number') {
    return value;
  }
  return fallback;
}

// Create controls for explore mode
function createControls(
  data: any,
  container: HTMLElement,
  updateSimulation: () => void,
  log: (...args: any[]) => void
): void {
  // Add CSS styles for control layout
  const style = createElement('style', {
    textContent: `
      .calcplot-controls {
        margin: 16px 12px;
        display: table;
        border-collapse: collapse;
      }
      .control-group {
        display: table-row;
        height: 24px;
      }
      .control-group label {
        display: table-cell;
        font-weight: 500;
        margin: 0;
        font-size: 14px;
        text-align: right;
        padding-right: 12px;
        padding-left: 2px;
        vertical-align: middle;
        white-space: nowrap;
      }
      .control-group input[type="range"] {
        display: table-cell;
        margin: 0;
        vertical-align: middle;
        width: 150px;
        padding-left: 12px;
        padding-right: 12px;
      }
      .control-group .value-display {
        display: table-cell;
        text-align: left;
        font-family: monospace;
        font-size: 14px;
        color: #374151;
        vertical-align: middle;
        width: 60px;
        padding-left: 12px;
        padding-right: 2px;
      }
      .control-group input[type="checkbox"] {
        display: table-cell;
        margin: 0;
        transform: scale(1.2);
        vertical-align: middle;
      }
    `
  });
  container.appendChild(style);

  const controlsDiv = createElement('div', {
    className: 'calcplot-controls'
  });
  container.appendChild(controlsDiv);

  Object.entries(data.params).forEach(([key, param]: [string, any]) => {
    if (param.type === 'slider') {
      const createSlider = (window as any).CalcPlotComponents.createSlider;
      if (createSlider) {
        createSlider(controlsDiv, {
          id: key,
          control: param,
          value: param.default, // Add initial value
          onChange: (id: string, value: number) => {
            updateSimulation();
          }
        });
      } else {
        log('createSlider not available');
      }
    } else if (param.type === 'checkbox') {
      const createCheckbox = (window as any).CalcPlotComponents.createCheckbox;
      if (createCheckbox) {
        createCheckbox(controlsDiv, {
          id: key,
          control: param,
          value: param.default,
          onChange: (id: string, value: boolean) => {
            log(`Checkbox ${id} changed to ${value}`);
            updateSimulation();
          }
        });
      } else {
        log('createCheckbox not available');
      }
    }
  });
}

// Create container wrapper for multiple views
function createWrapper(container: HTMLElement, width: string | number, height: string | number, gaps: number): HTMLElement {
  const wrapper = createElement('div', {
    style: `display: flex; width: ${width}; height: ${height}; gap: ${gaps}px;`
  });
  container.appendChild(wrapper);
  return wrapper;
}

// Initialize multiple views in container
function initializeViews(views: any[], container: HTMLElement, width: string | number, height: string | number, log: (...args: any[]) => void): ViewRenderer[] {
  return views.map((viewData: any) => {
    const viewContainer = createElement('div', {
      style: `width: 100%; height: 100%; flex: 1;`
    });
    container.appendChild(viewContainer);

    return new ViewRenderer(
      viewContainer,
      viewContainer.clientWidth,
      viewContainer.clientHeight,
      log
    );
  });
}

// Update all views with new data
function updateViews(renderers: ViewRenderer[], views: any[], timeline: any, params: any, width: number, height: number): void {
  const layout = { columns: views.length, rows: 1, gaps: 10 };

  views.forEach((viewData: any, index: number) => {
    let descriptor;
    
    // Handle ViewBuilder layers
    if (viewData.layers && Array.isArray(viewData.layers)) {
      descriptor = {
        timeline: {
          times: timeline.times,
          states: timeline.states
        },
        layers: viewData.layers
      };
    } else {
      throw new Error('Invalid view configuration: expected layers array');
    }

    renderers[index].render({
      type: 'view',
      timeline,
      layers: descriptor.layers,
      width: width / layout.columns,
      height: height / layout.rows
    });
  });
}

// Initialize explore mode with controls and simulation
function initializeExplore(data: any, container: HTMLElement, log: (...args: any[]) => void): void {

  try {
    const views = data.views || [];
    const isMultiView = views.length > 1;
    const containerWidth = data.options?.width || 'auto';
    const containerHeight = data.options?.height || '480px';
    
    // Ensure height has units
    const heightWithUnits = typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight;
    const widthWithUnits = typeof containerWidth === 'number' ? `${containerWidth}px` : containerWidth;

    // Create controls
    if (data.params) {
      createControls(data, container, updateSimulation, log);
    }

    const canvasContainer = isMultiView ? createWrapper(container, widthWithUnits, heightWithUnits, 10) : container;
    const renderers = isMultiView ? initializeViews(views, canvasContainer, widthWithUnits, heightWithUnits, log) : [new ViewRenderer(canvasContainer, parseInt(widthWithUnits) || 800, parseInt(heightWithUnits) || 480, log)];

    // Update simulation function
    function updateSimulation(): void {
      const currentParams: Record<string, any> = {};
      Object.entries(data.params).forEach(([key, param]: [string, any]) => {
        const slider = document.getElementById(`input-${key}`) as HTMLInputElement;
        if (slider) {
          currentParams[key] = parseFloat(slider.value);
        } else {
          currentParams[key] = param.default;
        }
      });

      try {
        const engine = new SimulationEngine(log);
        const initialFn = engine.parseInitialFunction(data.initial);
        const initialState = initialFn(currentParams);
        
        // Deserialize events if present
        if (data.model?.events) {
          data.model.events = deserializeEvents(data.model.events);
        }
        
        const trajectory = engine.simulateTrajectory(data, initialState, currentParams);

        if (isMultiView) {
          updateViews(renderers, views, trajectory, currentParams, containerWidth, containerHeight);
        } else {
          const viewData = views[0];
          if (viewData && viewData.layers && Array.isArray(viewData.layers)) {
            renderers[0].render({
              type: 'view',
              timeline: trajectory,
              layers: viewData.layers,
              width: containerWidth,
              height: containerHeight
            });
          }
        }
      } catch (error: any) {
        log('Error in simulation:', error.message);
      }
    }

    updateSimulation();
  } catch (error: any) {
    log('Error in explore initialization:', error.message);
  }
}

// Initialize show mode with pre-computed timeline
function initializeShow(data: any, container: HTMLElement, log: (...args: any[]) => void): void {

  try {
    const views = data.views || [];
    const isMultiView = views.length > 1;

    if (isMultiView) {
      // Multi-view layout
      const layout = data.layout || { columns: views.length, rows: 1, gaps: 10 };
      const containerWidth = data.width || 'auto';
      const containerHeight = data.height || '480px';

      const widthWithUnits = typeof containerWidth === 'number' ? `${containerWidth}px` : containerWidth;
      const heightWithUnits = typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight;
      
      const multiViewContainer = createElement('div', {
        style: `display: flex; flex-wrap: wrap; gap: ${layout.gaps}px; height: ${heightWithUnits};`
      });
      container.appendChild(multiViewContainer);

      // Create renderers for each view
      views.forEach((viewData: any) => {
        const viewContainer = createElement('div', {
          style: `flex: 1 1 calc(50% - 5px); min-width: 300px; height: 100%;`
        });
        multiViewContainer.appendChild(viewContainer);

        const renderer = new ViewRenderer(
          viewContainer,
          viewContainer.clientWidth || 600,
          parseInt(heightWithUnits) || 480, // Use parsed height
          log
        );

        renderer.render(viewData);
      });

    } else {
      // Single view
      const viewData = views[0];
      if (viewData) {
        const renderer = new ViewRenderer(container, 
          resolveDimension(viewData.width, container, 800, true), 
          resolveDimension(viewData.height, container, 480), 
          log);
        renderer.render(viewData);
      }
    }
  } catch (error: any) {
    log('Error in show initialization:', error.message);
  }
}

// Initialize compare mode with pre-computed timeline
function initializeCompare(data: any, container: HTMLElement, log: (...args: any[]) => void): void {

  try {
    const renderer = new ViewRenderer(container, 
      resolveDimension(data.width, container, 800, true), 
      resolveDimension(data.height, container, 480), 
      log);
    renderer.render(data);
  } catch (error: any) {
    log('Error in compare initialization:', error.message);
  }
}

// Main initialization function
export function initializeClient(
  container: HTMLElement,
  data?: any,
  debugLog?: (...args: any[]) => void
): void {
  const log =
    debugLog ||
    function (...args: any[]) {
      console.log('[calcplot]', ...args);
    };


  const calcData = data || (window as any).calcPlotData;
  if (!calcData) {
    log('No calcplot data found');
    return;
  }

  if (!container) {
    log('No container provided - visualization skipped');
    return;
  }


  // Handle different data types
  if (calcData.type === 'explore') {
    initializeExplore(calcData, container, log);
  } else if (calcData.type === 'show') {
    initializeShow(calcData, container, log);
  } else if (calcData.type === 'compare') {
    initializeCompare(calcData, container, log);
  } else {
    log('Unknown data type:', calcData.type);
  }
}
