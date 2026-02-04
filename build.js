#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import Prism from 'prismjs';
import http from 'http';

// Load additional language support
import 'prismjs/components/prism-javascript.js';

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
  sourcemap: isWatch,
  loader: {
    '.css': 'text'
  }
}));

// Example builder class
class ExampleBuilder {
  constructor() {
    this.examples = [];
    this.outputDir = 'dist';
    this.templatePath = 'examples/template.html';
  }

  extractFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      try {
        const frontmatter = match[1];
        const markdown = match[2];
        const meta = {};
        
        frontmatter.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            meta[key.trim()] = valueParts.join(':').trim();
          }
        });
        
        return { meta, markdown };
      } catch (e) {
        console.warn('Failed to parse frontmatter:', e);
      }
    }
    
    return { meta: {}, markdown: content };
  }

  extractExecBlocks(markdown) {
    const execRegex = /```js exec\n([\s\S]*?)\n```/g;
    const blocks = [];
    let match;
    
    while ((match = execRegex.exec(markdown)) !== null) {
      blocks.push({
        code: match[1].trim(),
        id: `exec-${blocks.length}`
      });
    }
    
    return blocks;
  }

  async processMarkdownFile(filePath, startIndex = 0) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { meta, markdown } = this.extractFrontmatter(content);
    const execBlocks = this.extractExecBlocks(markdown);
    
    let processedMarkdown = markdown;
    execBlocks.forEach((block, index) => {
      const globalIndex = startIndex + index;
      const escapedCode = block.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const execRegex = new RegExp('```js exec\\n' + escapedCode + '\\n```', 'g');
      
      const codeId = `exec-code-${globalIndex}`;
      const processedCode = block.code.replace(/from\s+['"]calcplot['"];?/g, "from './index.js';");
      processedMarkdown = processedMarkdown.replace(execRegex, 
        `\`\`\`javascript\n${processedCode}\n\`\`\`\n<script type="module" id="${codeId}" style="display:none;">\n${processedCode.replace(/<\/script>/g, '<\\/script>')}\n<\/script>\n<div class="exec-block" data-code-id="${codeId}"></div>`
      );
    });
    
    const html = marked(processedMarkdown);
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
    
    return {
      filePath,
      title,
      meta,
      html,
      execBlocks,
      filename: path.basename(filePath, '.md')
    };
  }

  async generateHTML(examples) {
    const templateContent = fs.readFileSync(this.templatePath, 'utf8');
    const examplesHTML = examples.map(example => this.generateExampleItem(example)).join('');
    
    return templateContent.replace('{{EXAMPLES}}', examplesHTML);
  }

  generateExampleItem(example) {
    return `
        <li class="example-item">
            <div class="example-content">
                ${example.html}
            </div>
        </li>
    `;
  }

  async build() {
    console.log('🚀 Building examples...');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const examplesDir = 'examples';
    const markdownFiles = fs.readdirSync(examplesDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => path.join(examplesDir, file));

    console.log(`📄 Found ${markdownFiles.length} markdown files`);

    let globalIndex = 0;
    for (const filePath of markdownFiles) {
      console.log(`📝 Processing ${filePath}`);
      const example = await this.processMarkdownFile(filePath, globalIndex);
      this.examples.push(example);
      globalIndex += example.execBlocks.length;
    }

    const html = await this.generateHTML(this.examples);
    const outputPath = path.join(this.outputDir, 'examples.html');
    
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Generated ${outputPath}`);
    
    return outputPath;
  }
}

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

  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });

  return server;
}

// Build function
async function build() {
  const start = Date.now();
  if (!fs.existsSync('./dist')) fs.mkdirSync('./dist', { recursive: true });
  
  if (!isExamplesOnly) {
    console.log('🔨 Building library...');
  }
  
  // Build library
  if (!isExamplesOnly) {
    const contexts = await Promise.all(configs.map(config => {
      if (isVerbose) console.log(`  → ${config.entryPoints[0]} → ${config.outfile}`);
      return esbuild.context(config);
    }));
    
    if (isWatch) {
      console.log('👀 Watching library... (Ctrl+C to stop)');
      await Promise.all(contexts.map(ctx => ctx.watch()));
    } else {
      await Promise.all(contexts.map(ctx => ctx.rebuild()));
      await Promise.all(contexts.map(ctx => ctx.dispose()));
      console.log(`✅ Library built in ${((Date.now() - start) / 1000).toFixed(2)}s`);
      console.log('📦 Files:', configs.map(c => c.outfile).join(', '));
    }
  }
  
  // Build examples
  const exampleBuilder = new ExampleBuilder();
  await exampleBuilder.build();
  
  if (isServe) {
    startServer(port);
  } else if (!isWatch) {
    console.log(`🎉 Build complete! Open dist/examples.html in your browser.`);
  }
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});