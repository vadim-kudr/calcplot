import { AnyDescriptor } from '../../lib/types';

export function renderToHTML(descriptor: AnyDescriptor, bundleContent?: string): string {
  const containerId = 'calcplot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  // Always include the bundle - let the bundle itself handle environment specifics
  return `
<div id="${containerId}" class="calcplot"></div>
<script>
    ${bundleContent || ''}
    
    (function() {
        const data = ${JSON.stringify(descriptor, null, 0)};
        const container = document.getElementById('${containerId}');
        
        if (window.CalcPlotComponents && container) {
            try {
                window.CalcPlotComponents.initializeClient(container, data);
            } catch (error) {
                console.error('initializeClient failed:', error);
            }
        } else {
            if (!window.CalcPlotComponents) {
                console.warn('CalcPlot Client not available');
            }
            if (!container) {
                console.error('Container not found:', '${containerId}');
            }
        }
    })();
</script>`;
}
