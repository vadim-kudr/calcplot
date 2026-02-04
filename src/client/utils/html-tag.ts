/**
 * HTML tag builder for component-based architecture
 */

export interface HtmlAttrs {
  [key: string]: any;
}

// DOM element creation functions
export function createElement(
  tag: string,
  attrs: HtmlAttrs = {},
  ...children: (HTMLElement | string)[]
): HTMLElement {
  const element = document.createElement(tag);

  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'className') {
      element.className = val;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, String(val));
    } else if (key in element) {
      (element as any)[key] = val;
    } else {
      element.setAttribute(key, String(val));
    }
  });

  children.flat().forEach((child) => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });

  return element;
}

// Common shortcuts for DOM elements
export const div = (attrs: HtmlAttrs = {}, ...children: (HTMLElement | string)[]) =>
  createElement('div', attrs, ...children);
export const span = (attrs: HtmlAttrs = {}, ...children: (HTMLElement | string)[]) =>
  createElement('span', attrs, ...children);
export const input = (attrs: HtmlAttrs = {}) => createElement('input', attrs);
export const label = (attrs: HtmlAttrs = {}, ...children: (HTMLElement | string)[]) =>
  createElement('label', attrs, ...children);
export const button = (attrs: HtmlAttrs = {}, ...children: (HTMLElement | string)[]) =>
  createElement('button', attrs, ...children);
export const canvas = (attrs: HtmlAttrs = {}) => createElement('canvas', attrs);

// HTML string generation function (for compatibility)
export function h(tag: string, attrs: HtmlAttrs = {}, ...children: any[]): string {
  const attrStr = Object.entries(attrs)
    .filter(([_, val]) => val !== undefined && val !== null && val !== false)
    .map(([key, val]) => {
      const attrName = key === 'className' ? 'class' : key;
      const attrValue = typeof val === 'boolean' ? '' : `="${val}"`;
      return `${attrName}${attrValue}`;
    })
    .join(' ');

  const childrenStr = children
    .flat()
    .filter((child) => child !== null && child !== undefined && child !== false)
    .map((child) => (typeof child === 'string' ? child : String(child)))
    .join('');

  return `<${tag}${attrStr ? ' ' + attrStr : ''}>${childrenStr}</${tag}>`;
}

// Common shortcuts for HTML strings
export const divStr = (attrs: HtmlAttrs = {}, ...children: any[]) => h('div', attrs, ...children);
export const spanStr = (attrs: HtmlAttrs = {}, ...children: any[]) => h('span', attrs, ...children);
export const inputStr = (attrs: HtmlAttrs = {}) => h('input', attrs);
export const labelStr = (attrs: HtmlAttrs = {}, ...children: any[]) =>
  h('label', attrs, ...children);
export const buttonStr = (attrs: HtmlAttrs = {}, ...children: any[]) =>
  h('button', attrs, ...children);
export const canvasStr = (attrs: HtmlAttrs = {}) => h('canvas', attrs);
export const style = (content: string) => h('style', {}, content);
export const script = (content: string, attrs: HtmlAttrs = {}) => h('script', attrs, content);
