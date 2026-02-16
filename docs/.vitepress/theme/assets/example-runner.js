// CalcPlot Example Runner for VitePress

// Import CalcPlot to ensure it's available
import * as CalcPlot from 'calcplot';

// Export CalcPlot functions to window for example execution
function exportCalcPlotFunctions() {
    if (typeof CalcPlot !== 'undefined') {
        // Add all functions to window.CalcPlot
        window.CalcPlot = CalcPlot;
        console.log('CalcPlot functions exported to window');
    } else {
        console.error('CalcPlot not loaded!');
    }
}

// Execute example code in a specific container
function executeExample(code, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    try {
        // The code is stored as JSON string, so we need to parse it first
        let cleanCode = typeof code === 'string' && code.startsWith('"') 
              ? JSON.parse(code) 
              : code;
        
        // Transform import statements to window.CalcPlot destructuring
        const transformedCode = transformExampleImports(cleanCode);
        
        // Set default target for all visualizations
        window.CalcPlot.setDefaultTarget(containerId);
        
        // Execute the transformed code
        eval(transformedCode);
        
    } catch (error) {
        console.error('Error executing example:', error);
        if (container) {
            container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }
}

/**
 * Transform import statements to window.CalcPlot destructuring
 * Supports multi-line imports and various import styles
 */
function transformExampleImports(code) {
  // Match import statements with optional whitespace and semicolons
  // Supports: import { a, b } from 'calcplot';
  //          import { a, b } from "calcplot"
  //          import { 
  //            a, 
  //            b 
  //          } from 'calcplot';
  // Excludes: import type { ... } from 'calcplot';
  return code.replace(
    /import\s+(type\s+)?\{([^}]+)\}\s*from\s*['"][^'"]*['"];?\s*/gs,
    (match, typeKeyword, imports) => {
      // Skip type-only imports
      if (typeKeyword) {
        return match; // Keep type imports as-is (they'll be stripped by build)
      }
      
      // Clean up the imports: remove whitespace, split by comma, trim each
      // Filter out type aliases like "Type as Name"
      const cleanImports = imports
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.includes(' as '))
        .join(', ');
      
      // If no runtime imports after filtering, return empty string
      if (!cleanImports) {
        return '';
      }
      
      return `const { ${cleanImports} } = window.CalcPlot;`;
    }
  );
}

// Find default container for examples
function findDefaultContainer() {
    // Try to find existing container first
    let container = document.getElementById('calcplot-default') ||
                   document.querySelector('.calcplot-container') ||
                   document.querySelector('[data-calcplot-container]');
    
    if (container) {
        return container.id || 'calcplot-default';
    }
    
    // Create new default container if none found
    const newContainer = document.createElement('div');
    newContainer.id = 'calcplot-default';
    newContainer.className = 'calcplot-container';
    newContainer.setAttribute('data-calcplot-container', 'true');
    newContainer.style.cssText = `
        margin: 20px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
    `;
    document.body.appendChild(newContainer);
    return newContainer.id;
}

// Copy code to clipboard
function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        // Show feedback (this will be handled by the Vue component)
        console.log('Code copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy code:', err);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    exportCalcPlotFunctions();
});

// Export functions for use in Vue components
window.CalcPlotExampleRunner = {
    executeExample,
    copyCode,
    exportCalcPlotFunctions
};
