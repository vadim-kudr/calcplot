import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import Prism from 'prismjs';
import Handlebars from 'handlebars';

// Load additional language support
import 'prismjs/components/prism-javascript.js';

// Example builder class
export class ExampleBuilder {
  constructor() {
    this.examples = [];
    this.outputDir = 'dist';
    this.templatePath = 'assets/templates/examples.hbs';
  }

  getCategoryTitle(category) {
    const titles = {
      '01-basics': '1: Basics',
      '02-with-params': '2: Parameters',
      '03-compare': '3: Compare',
      '04-interactive': '4: Interactive',
      '05-robotics': '5: Robotics',
      '06-advanced': '6: Advanced'
    };
    return titles[category] || category;
  }
  
  getCategoryDescription(category) {
    const descriptions = {
      '01-basics': 'Fundamental concepts and basic differential equations',
      '02-with-params': 'Using parameters in models',
      '03-compare': 'Comparing multiple simulations',
      '04-interactive': 'Interactive visualizations with sliders',
      '05-robotics': 'Control systems and robotic applications',
      '06-advanced': 'Sophisticated mathematical and computational examples'
    };
    return descriptions[category] || '';
  }

  generateNavigation(examples) {
    const categories = {};
    examples.forEach(example => {
      const category = example.file.split('/').slice(-2)[0]; // Extract category from path (second to last)
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(example);
    });

    return Object.entries(categories).map(([category, categoryExamples]) => {
      const categoryTitle = this.getCategoryTitle(category);
      const count = categoryExamples.length;
      const categoryId = category.replace(/^\d+_/, ''); // Remove number prefix for anchor
      
      const examplesList = categoryExamples.map(example => ({
        id: example.id,
        title: example.title
      }));
      
      return {
        categoryId,
        title: categoryTitle,
        count,
        examples: examplesList
      };
    });
  }

  parseJSDocTags(code) {
    const match = code.match(/\/\*\*([\s\S]*?)\*\//);
    if (!match) return {};
    
    const jsdoc = match[1];
    const tags = {};
    
    jsdoc.split('\n').forEach(line => {
      // Parse "Example 5: Harmonic Oscillator" pattern
      const exampleMatch = line.match(/\s*\*?\s*(?:Example\s*\d+:)?\s*(.+?)(?:\n|$)/);
      if (exampleMatch && !line.includes('@')) {
        const title = exampleMatch[1].trim();
        if (title && !tags.title) {
          tags.title = title;
        }
      }
    });
    
    return tags;
  }

  generateExampleHTML(example) {
    const category = example.file.split('/').slice(-2)[0]; // Extract category from path
    const categoryId = category.replace(/^\d+_/, ''); // Remove number prefix for anchor
    const codeId = `${categoryId}-${example.id}`; // Use category-example-id format
    
    // Generate syntax-highlighted code
    const highlightedCode = Prism.highlight(example.code, Prism.languages.javascript, 'javascript');
    
    return {
        id: example.id,
        title: example.title,
        codeId: codeId,
        categoryId: categoryId,
        highlightedCode: highlightedCode,
        rawCode: example.code
    };
  }

  async build() {
    console.log('🚀 Building examples...');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Copy assets
    console.log('📦 Copying assets...');
    if (!fs.existsSync(path.join(this.outputDir, 'assets'))) {
      fs.mkdirSync(path.join(this.outputDir, 'assets'), { recursive: true });
    }
    
    // Copy examples bundle files
    fs.copyFileSync('assets/examples-bundle.css', path.join(this.outputDir, 'examples-bundle.css'));
    
    // Copy execution script
    fs.copyFileSync('assets/examples-exec.js', path.join(this.outputDir, 'examples-exec.js'));
    
    console.log('✅ Assets copied');

    // Read template
    const templatePath = path.join(process.cwd(), 'assets', 'templates', 'examples.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    // Find all example files in subdirectories
    const exampleFiles = [];
    const categories = ['01-basics', '02-with-params', '03-compare', '04-interactive', '05-robotics', '06-advanced'];
    
    for (const category of categories) {
      const categoryDir = path.resolve('examples', category);
      try {
        const stat = fs.statSync(categoryDir);
        if (stat.isDirectory()) {
          const files = fs.readdirSync(categoryDir)
            .filter(file => file.endsWith('.js'))
            .map(file => path.join(categoryDir, file));
          exampleFiles.push(...files);
        }
      } catch (error) {
        console.log(`Error accessing ${categoryDir}:`, error.message);
      }
    }
    
    console.log(`Total example files found: ${exampleFiles.length}`);

    // Parse metadata from each file
    const examples = exampleFiles.map(file => {
      const code = fs.readFileSync(file, 'utf8');
      const meta = this.parseJSDocTags(code);
      
      return {
        id: path.basename(file, '.js'),
        file: file,
        code: code, // Keep imports for syntax highlighting
        title: meta.title || path.basename(file, '.js')
      };
    });

    // Sort by filename
    examples.sort((a, b) => a.file.localeCompare(b.file));

    // Generate data for template - group examples by category
    const examplesData = [];
    const navigationData = this.generateNavigation(examples);
    
    // Create examples with categoryId - group by category
    const categoryMap = {};
    navigationData.forEach(nav => {
      categoryMap[nav.categoryId] = {
        categoryId: nav.categoryId,
        title: nav.title,
        examples: []
      };
    });
    
    examples.forEach(example => {
      const category = example.file.split('/').slice(-2)[0];
      const categoryId = category.replace(/^\d+_/, '');
      const exampleData = this.generateExampleHTML(example);
      
      if (categoryMap[categoryId]) {
        categoryMap[categoryId].examples.push(exampleData);
      }
    });
    
    // Convert to array for template
    Object.values(categoryMap).forEach(category => {
      examplesData.push(category);
    });

    // Render template
    const finalHTML = template({
      examples: examplesData,
      navigation: navigationData
    });

    // Write output
    const outputPath = path.join(this.outputDir, 'examples.html');
    fs.writeFileSync(outputPath, finalHTML);
    
    console.log(`✅ Generated ${outputPath} with ${examples.length} examples`);
    
    return outputPath;
  }
}
