#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isVerbose = args.includes('--verbose');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`🚀 CalcPlot Build

Usage: node build.js [options]

Options:
  --watch     Watch mode
  --verbose   Detailed output
  --help      Show help`);
  process.exit(0);
}

// Build configs
const configs = [
  { entryPoints: ['src/index.ts'], outfile: './dist/calcplot.js', format: 'iife', globalName: 'CalcPlot' },
  { entryPoints: ['src/runtime/client-bundle.ts'], outfile: './dist/calcplot-client.js', format: 'iife', globalName: 'CalcPlotClient' },
  { entryPoints: ['src/runtime/client-bundle.ts'], outfile: './dist/calcplot-client-deno.js', format: 'esm', platform: 'neutral' },
  { entryPoints: ['src/index.ts'], outfile: './dist/index.js', format: 'esm', platform: 'neutral' }
].map(config => ({
  ...config,
  bundle: true,
  minify: !isWatch,
  target: 'es2020',
  external: ['fs', 'path', 'crypto', 'os', 'util'],
  sourcemap: isWatch
}));

// Process HTML templates
function processTemplates() {
  const templates = fs.readdirSync('./examples').filter(f => f.endsWith('.template.html'));
  
  console.log(`🎨 Processing ${templates.length} templates...`);
  
  // Load demo code files as text
  const showCode = fs.readFileSync('./examples/show.js', 'utf-8');
  const exploreCode = fs.readFileSync('./examples/explore.js', 'utf-8');
  const compareCode = fs.readFileSync('./examples/compare.js', 'utf-8');
  
  templates.forEach(template => {
    let content = fs.readFileSync(`./examples/${template}`, 'utf-8');
    const clientBundle = fs.readFileSync('./dist/calcplot-client.js', 'utf-8');
    const libraryBundle = fs.readFileSync('./dist/calcplot.js', 'utf-8') + '\nwindow.CalcPlot = CalcPlot;';
    
    // Insert code directly into template
    content = content
      .replace('{{ SHOW_CODE }}', showCode)
      .replace('{{ EXPLORE_CODE }}', exploreCode)
      .replace('{{ COMPARE_CODE }}', compareCode)
      .replace('{{ CLIENT_BUNDLE }}', clientBundle)
      .replace('{{ LIBRARY_BUNDLE }}', libraryBundle);
    
    fs.writeFileSync(`./examples/${template.replace('.template', '')}`, content);
    console.log(`  ✅ ${template.replace('.template', '')}`);
  });
}

// Extract code from JS file using regex
function extractCode(fileContent, exportName) {
  const match = fileContent.match(new RegExp('export const ' + exportName + ' = `([\\s\\S]*?)`;'));
  return match ? match[1] : '';
}

// Build function
async function build() {
  const start = Date.now();
  if (!fs.existsSync('./dist')) fs.mkdirSync('./dist', { recursive: true });
  
  console.log('🔨 Building...');
  
  const contexts = await Promise.all(configs.map(config => {
    if (isVerbose) console.log(`  → ${config.entryPoints[0]} → ${config.outfile}`);
    return esbuild.context(config);
  }));
  
  if (isWatch) {
    console.log('👀 Watching... (Ctrl+C to stop)');
    await Promise.all(contexts.map(ctx => ctx.watch()));
    
    // Watch for changes
    fs.watch('./dist', (_, file) => {
      if (file?.includes('calcplot')) {
        console.log('📦 Bundles changed');
        setTimeout(processTemplates, 100);
      }
    });
    
    fs.watch('./examples', (_, file) => {
      if (file?.endsWith('.template.html') || file?.endsWith('.js')) {
        console.log(`📝 ${file} changed`);
        processTemplates();
      }
    });
    
  } else {
    await Promise.all(contexts.map(ctx => ctx.rebuild()));
    await Promise.all(contexts.map(ctx => ctx.dispose()));
    processTemplates();
    
    console.log(`✅ Done in ${((Date.now() - start) / 1000).toFixed(2)}s`);
    console.log('📦 Files:', configs.map(c => c.outfile).join(', '));
  }
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});