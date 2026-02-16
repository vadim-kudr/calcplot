#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import * as fs from 'fs';

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');

// ---------- Build Targets ----------
const BUILD_TARGETS = [
  {
    entryPoints: ['src/lib/index.ts'],
    outfile: 'dist/calcplot.js',
    format: 'iife',
    globalName: 'CalcPlot'
  },
  {
    entryPoints: ['src/client/client-bundle.ts'],
    outfile: 'dist/calcplot-client.js',
    format: 'iife',
    globalName: 'CalcPlotClient'
  },
  {
    entryPoints: ['src/client/client-bundle.ts'],
    outfile: 'dist/calcplot-client-deno.js',
    format: 'esm',
    platform: 'neutral',
    external: ['fs', 'path', 'url'], // Exclude Node.js dependencies
  },
  {
    entryPoints: ['src/lib/index.ts'],
    outfile: 'dist/index.js',
    format: 'esm',
    platform: 'neutral'
  }
];

// ---------- Base Config ----------
const baseConfig = {
  bundle: true,
  sourcemap: isWatch,
  minify: !isWatch,
  target: 'es2020',
  loader: { '.css': 'text' }
};

// ---------- Build ----------
async function build() {
  console.log('🚀 Building library...');

  // Generate TypeScript declaration files
  console.log('📝 Generating type declarations...');
  try {
    execSync('tsc --project tsconfig.types.json', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Type generation failed:', error);
    process.exit(1);
  }

  if (isWatch) {
    // Watch mode
    const contexts = await Promise.all(
      BUILD_TARGETS.map((target) =>
        esbuild.context({
          ...baseConfig,
          ...target,
          plugins: [{
            name: 'build-log',
            setup(build) {
              build.onEnd(() => {
                console.log(`✅ ${build.initialOptions.outfile}`);
              });
            }
          }]
        })
      )
    );

    await Promise.all(contexts.map((ctx) => ctx.watch()));
    console.log('👀 Watching for changes...');

    process.on('SIGINT', () => {
      console.log('\n👋 Stopping...');
      contexts.forEach((ctx) => ctx.dispose());
      process.exit();
    });
  } else {
    // One-time build
    await Promise.all(
      BUILD_TARGETS.map((target) => 
        esbuild.build({ ...baseConfig, ...target })
      )
    );
    
    console.log('✅ Build complete!');
    console.log('\nOutputs:');
    BUILD_TARGETS.forEach(t => console.log(`  - ${t.outfile}`));
  }
}

build().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});