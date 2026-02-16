import { vi } from 'vitest';

/**
 * Smart SVG mocks that respect element attributes.
 * This allows tests to check real geometry without "tight coupling".
 */
export function setupSVGMocks() {
  const originalCreateElementNS = document.createElementNS.bind(document);
  
  (document as any).createElementNS = function(namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS(namespaceURI, qualifiedName);
    
    if (namespaceURI === 'http://www.w3.org/2000/svg') {
      
      // Dynamic getBBox
      if (!element.getBBox) {
        (element as any).getBBox = function() {
          const tagName = this.tagName.toLowerCase();
          
          // Helper function to get numeric attributes
          const getAttr = (name: string, fallback: number) => {
            const val = this.getAttribute(name);
            return val !== null ? parseFloat(val) : fallback;
          };

          switch (tagName) {
            case 'svg': {
              return { 
                x: 0, y: 0, 
                width: getAttr('width', 800), 
                height: getAttr('height', 600) 
              };
            }
            case 'rect': {
              return { 
                x: getAttr('x', 0), 
                y: getAttr('y', 0), 
                width: getAttr('width', 0), 
                height: getAttr('height', 0) 
              };
            }
            case 'text': {
              // Text width calculation based on content, but with ability to respect set attributes
              const text = this.textContent || '';
              const fontSize = parseFloat(this.style.fontSize) || 12;
              const charWidth = fontSize * 0.6; // Approximate coefficient
              return { 
                x: getAttr('x', 0), 
                y: getAttr('y', 0), 
                width: text.length * charWidth, 
                height: fontSize 
              };
            }
            case 'g': {
              // For groups (legend container) return bounding rectangle
              // In JSDOM it's difficult to count child elements, so return 
              // either fixed boundaries or boundaries of nested rect
              const childRect = this.querySelector('rect');
              if (childRect) {
                return childRect.getBBox();
              }
              return { x: 0, y: 0, width: 100, height: 100 };
            }
            case 'line': {
              const x1 = getAttr('x1', 0);
              const x2 = getAttr('x2', 0);
              const y1 = getAttr('y1', 0);
              const y2 = getAttr('y2', 0);
              return {
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1)
              };
            }
            default: {
              return { x: 0, y: 0, width: 0, height: 0 };
            }
          }
        };
      }
      
      // Synchronize with getComputedTextLength
      if ((qualifiedName === 'text' || qualifiedName === 'tspan') && !(element as any).getComputedTextLength) {
        (element as any).getComputedTextLength = function() {
          return this.getBBox().width;
        };
      }
      
      // Stubs for specific D3 methods
      if (qualifiedName === 'svg') {
        if (!(element as any).createSVGPoint) {
          (element as any).createSVGPoint = () => ({
            x: 0, y: 0,
            matrixTransform: () => ({ x: 0, y: 0 })
          });
        }
        if (!(element as any).getScreenCTM) {
          (element as any).getScreenCTM = () => ({
            a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
            inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
          });
        }
      }
    }
    
    return element;
  };
}

export function resetSVGMocks() {
  // Mocks are reset automatically between tests
}

export function mockTextWidth(widthPerChar: number = 8) {
  // To override text width, you can change the logic in getBBox
  const originalCreateElementNS = document.createElementNS.bind(document);
  
  (document as any).createElementNS = function(namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS(namespaceURI, qualifiedName);
    
    if (namespaceURI === 'http://www.w3.org/2000/svg' && qualifiedName === 'text') {
      (element as any).getBBox = function() {
        const text = this.textContent || '';
        return { x: 0, y: 0, width: text.length * widthPerChar, height: 12 };
      };
    }
    
    return element;
  };
}
