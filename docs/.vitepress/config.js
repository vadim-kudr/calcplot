import { defineConfig } from 'vitepress';
import path from 'path';
import { examplePagesPlugin } from './plugins/example-pages.js';
import { generateSidebar } from './sidebar.js';

const isDev = process.env.NODE_ENV !== 'production';

// Generate sidebar dynamically for dev mode
function getSidebar() {
  if (isDev) {
    return generateSidebar();
  }
  
  // For production, we could cache or pre-generate
  return generateSidebar();
}

export default defineConfig({
  title: 'CalcPlot',
  description: 'Interactive differential equations visualization library',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start' },
      { text: 'API', link: '/api' },
      { text: 'Examples', link: '/examples/basics' }
    ],
    
    sidebar: getSidebar(),

    // Hide "On this page" for more space
    aside: false,
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vadim-kudr/calcplot' }
    ]
  },
  
  vite: {
    plugins: [examplePagesPlugin()],
    resolve: {
      alias: {
        // Dev: import source files directly for HMR
        // Prod: use compiled bundle
        'calcplot': isDev 
          ? path.resolve(__dirname, '../../src/lib/index.ts')
          : path.resolve(__dirname, '../../dist/calcplot.js'),
        '/calcplot.js': isDev
          ? path.resolve(__dirname, '../../src/lib/index.ts')
          : path.resolve(__dirname, '../../dist/calcplot.js')
      }
    },
    
    optimizeDeps: {
      // Don't pre-bundle calcplot in dev mode
      exclude: isDev ? ['calcplot'] : []
    }
  }
});
