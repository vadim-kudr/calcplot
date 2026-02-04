#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import http from 'http';
import { ExampleBuilder } from './build-examples.js';

const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || !args.includes('--no-watch');
const isVerbose = args.includes('--verbose');
const isServe = args.includes('--serve');
const isExamplesOnly = args.includes('--examples-only');
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1] || '8080';

if (args.includes('--help') || args.includes('-h')) {
  console.log(`🚀 CalcPlot Build

Usage: node build.js [options]

Options:
  --watch         Watch mode (default)
  --no-watch      Disable watch mode
  --serve         Start server after build
  --examples-only Build examples only
  --port=N        Server port (default: 8080)
  --verbose       Detailed output
  --help          Show help`);
  process.exit(0);
}

// Build configs
const configs = [
  { entryPoints: ['src/lib/index.ts'], outfile: './dist/calcplot.js', format: 'iife', globalName: 'CalcPlot' },
  { entryPoints: ['src/client/client-bundle.ts'], outfile: './dist/calcplot-client.js', format: 'iife', globalName: 'CalcPlotClient' },
  { entryPoints: ['src/client/client-bundle.ts'], outfile: './dist/calcplot-client-deno.js', format: 'esm', platform: 'neutral' },
  { entryPoints: ['src/lib/index.ts'], outfile: './dist/index.js', format: 'esm', platform: 'neutral' }
].map(config => ({
  ...config,
  bundle: true,
  minify: !isWatch,
  target: 'es2020',
  external: ['fs', 'path', 'crypto', 'os', 'util'],
  sourcemap: isWatch,
  loader: {
    '.css': 'text'
  }
}));

// Server function
function startServer(port = '8080') {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const server = http.createServer((req, res) => {
    if (isVerbose) console.log(`${req.method} ${req.url}`);

    let filePath = req.url === '/' ? '/examples.html' : req.url;
    filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    
    if (filePath.startsWith('/dist')) {
      filePath = filePath.substring(5);
    }
    
    const fullPath = path.join(process.cwd(), 'dist', filePath);
    
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>404 - File Not Found</h1>
          <p>The file ${filePath} was not found.</p>
          <p><a href="/">Go to Examples</a></p>
        `);
        return;
      }

      const ext = path.parse(fullPath).ext;
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(fullPath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 - Internal Server Error</h1>');
          return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
  });

  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📁 Serving from: ${path.join(process.cwd(), 'dist')}`);
    console.log(`⏹️  Press Ctrl+C to stop`);
  });

  
  return server;
}

// Build library function
async function buildLibrary() {
  const contexts = await Promise.all(configs.map(config => {
    if (isVerbose) console.log(`  → ${config.entryPoints[0]} → ${config.outfile}`);
    return esbuild.context(config);
  }));

  if (isWatch) {
    console.log('👀 Watching library... (Ctrl+C to stop)');
    await Promise.all(contexts.map(ctx => ctx.watch()));
  } else {
    await Promise.all(contexts.map(ctx => ctx.rebuild()));
    console.log(`✅ Library built in ${((Date.now() - Date.now()) / 1000).toFixed(2)}s`);
    console.log('📦 Files:', configs.map(c => c.outfile).join(', '));
  }
  
  return contexts;
}

// Build examples bundle function
async function buildExamplesBundle() {
  // Build examples
  const exampleBuilder = new ExampleBuilder();
  await exampleBuilder.build();
}

// Build function
async function build() {
  const start = Date.now();
  if (!fs.existsSync('./dist')) fs.mkdirSync('./dist', { recursive: true });
  
  // Build examples bundle
  if (isExamplesOnly) {
    await buildExamplesBundle();
    
    // Start server if serving
    if (isServe) {
      const server = startServer(port);
      
      // Handle cleanup for server
      if (!process.listeners('SIGINT').length) {
        process.on('SIGINT', () => {
          console.log('\n👋 Shutting down...');
          server.close(() => {
            console.log('✅ Server stopped');
            process.exit(0);
          });
        });
      }
    }
    return;
  }
  
  // Build library
  let contexts;
  contexts = await buildLibrary();
  
  if (isWatch) {
    console.log('👀 Watching library... (Ctrl+C to stop)');
    await Promise.all(contexts.map(ctx => ctx.watch()));
  } else {
    await Promise.all(contexts.map(ctx => ctx.rebuild()));
    await Promise.all(contexts.map(ctx => ctx.dispose()));
    console.log(`✅ Library built in ${((Date.now() - start) / 1000).toFixed(2)}s`);
    console.log('📦 Files:', configs.map(c => c.outfile).join(', '));
  }
  
  // Build examples
  const exampleBuilder = new ExampleBuilder();
  await exampleBuilder.build();
  
  if (isServe) {
    const server = startServer(port);
    
    // Handle cleanup for both server and esbuild contexts (only once)
    if (!process.listeners('SIGINT').length) {
      process.on('SIGINT', () => {
        console.log('\n👋 Shutting down...');
        server.close(() => {
          console.log('✅ Server stopped');
          // Clean up esbuild contexts
          if (contexts.length > 0) {
            Promise.all(contexts.map(ctx => ctx.dispose())).then(() => {
              console.log('✅ Build contexts cleaned up');
              process.exit(0);
            });
          } else {
            process.exit(0);
          }
        });
      });
    }
  } else if (!isWatch) {
    console.log(`🎉 Build complete! Open dist/examples.html in your browser.`);
  }
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});