/**
 * VitePress plugin to convert JS examples to pages with HMR
 */

import fs from 'fs';
import path from 'path';

const CATEGORIES = {
  '01-basics': { title: 'Basics', id: 'basics' },
  '02-with-params': { title: 'With Parameters', id: 'with-params' },
  '03-compare': { title: 'Compare', id: 'compare' },
  '04-interactive': { title: 'Interactive', id: 'interactive' },
  '05-robotics': { title: 'Robotics', id: 'robotics' },
  '06-advanced': { title: 'Advanced', id: 'advanced' }
};

function extractTitle(code) {
  const match = code.match(/\/\*\*.*?Example.*?:\s*(.+?)[\n*]/);
  return match ? match[1].trim() : null;
}

function jsToMarkdown(jsCode, title) {
  return `# ${title}

<script setup>
const exampleCode = \`${jsCode.replace(/`/g, '\\`')}\`;
</script>

\`\`\`javascript
${jsCode}
\`\`\`

<ExampleRunner :code="exampleCode" />
`;
}

export function examplePagesPlugin() {
  const examplesDir = path.join(process.cwd(), 'docs/examples');
  const sourceExamplesDir = path.join(process.cwd(), 'examples');
  
  // Создаем директорию examples, если её нет
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }
  
  // Функция генерации всех страниц
  function generateAllPages() {
    console.log('Regenerating example pages...');
    const generatedFiles = [];
    
    for (const [jsDirName, categoryInfo] of Object.entries(CATEGORIES)) {
      const jsDirPath = path.join(sourceExamplesDir, jsDirName);
      const outputPath = path.join(examplesDir, `${categoryInfo.id}.md`);
      
      if (!fs.existsSync(jsDirPath)) {
        continue;
      }
      
      // Use all JS files for the page
      const jsFiles = fs.readdirSync(jsDirPath)
        .filter(f => f.endsWith('.js'))
        .sort();
      
      if (jsFiles.length === 0) {
        continue;
      }
      
      // Generate single component with all examples
      const examplesData = jsFiles.map(jsFile => {
        const jsCode = fs.readFileSync(path.join(jsDirPath, jsFile), 'utf-8');
        const exampleTitle = extractTitle(jsCode) || path.basename(jsFile, '.js');
        const fileName = path.basename(jsFile, '.js');
        const exampleId = 'example' + fileName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanTitle = fileName.replace(/^\d+-/, ''); // Убираем префикс 01-
        
        return {
          title: exampleTitle,
          cleanTitle: cleanTitle,
          id: exampleId,
          code: jsCode.replace(/`/g, '\\`')
        };
      });
      
      const markdown = `# ${categoryInfo.title}

<script setup>
${examplesData.map(example => `const ${example.id}Code = \`${example.code}\`;`).join('\n')}
</script>

${examplesData.map(example => `## ${example.cleanTitle}

\`\`\`js
${example.code}
\`\`\`

<ExampleRunner :code="${example.id}Code" />`).join('\n')}`;
      
      fs.writeFileSync(outputPath, markdown);
      generatedFiles.push(outputPath);
    }
    
    return generatedFiles;
  }
  
  // Генерируем при запуске
  generateAllPages();
  
  return {
    name: 'example-pages',
    
    configureServer(server) {
      // Следим за изменениями в директории examples
      server.watcher.add(path.join(sourceExamplesDir, '**/*.js'));
      
      // При изменении JS файлов
      server.watcher.on('change', (changedPath) => {
        if (changedPath.endsWith('.js') && changedPath.includes(sourceExamplesDir)) {
          console.log(`JS example changed: ${changedPath}`);
          
          // Определяем, какую страницу нужно обновить
          for (const [jsDirName, categoryInfo] of Object.entries(CATEGORIES)) {
            if (changedPath.includes(jsDirName)) {
              const outputPath = path.join(examplesDir, `${categoryInfo.id}.md`);
              
              // Перегенерируем только эту страницу
              const jsDirPath = path.join(sourceExamplesDir, jsDirName);
              const jsFiles = fs.readdirSync(jsDirPath)
                .filter(f => f.endsWith('.js'))
                .sort();
              
              if (jsFiles.length > 0) {
                // Используем ту же логику что и в generateAllPages
                const examplesData = jsFiles.map(jsFile => {
                  const jsCode = fs.readFileSync(path.join(jsDirPath, jsFile), 'utf-8');
                  const exampleTitle = extractTitle(jsCode) || path.basename(jsFile, '.js');
                  const fileName = path.basename(jsFile, '.js');
                  const exampleId = 'example' + fileName.replace(/[^a-zA-Z0-9]/g, '');
                  const cleanTitle = fileName.replace(/^\d+-/, ''); // Убираем префикс 01-
                  
                  return {
                    title: exampleTitle,
                    cleanTitle: cleanTitle,
                    id: exampleId,
                    code: jsCode.replace(/`/g, '\\`')
                  };
                });
                
                const markdown = `# ${categoryInfo.title}

<script setup>
${examplesData.map(example => `const ${example.id}Code = \`${example.code}\`;`).join('\n')}
</script>

${examplesData.map(example => `## ${example.cleanTitle}

\`\`\`js
${example.code}
\`\`\`

<ExampleRunner :code="${example.id}Code" />`).join('\n')}`;
                
                fs.writeFileSync(outputPath, markdown);
                console.log(`Updated: ${outputPath}`);
                
                // Сообщаем Vite, что файл изменился для HMR
                const moduleGraph = server.moduleGraph;
                const module = moduleGraph.getModuleById(outputPath);
                if (module) {
                  server.reloadModule(module);
                }
              }
              break;
            }
          }
        }
      });
      
      // При добавлении/удалении файлов
      server.watcher.on('add', (changedPath) => {
        if (changedPath.endsWith('.js') && changedPath.includes(sourceExamplesDir)) {
          console.log('JS example added, regenerating all pages...');
          generateAllPages();
          
          // Перезагружаем все связанные модули
          setTimeout(() => {
            server.ws.send({ type: 'full-reload' });
          }, 100);
        }
      });
      
      server.watcher.on('unlink', (changedPath) => {
        if (changedPath.endsWith('.js') && changedPath.includes(sourceExamplesDir)) {
          console.log('JS example removed, regenerating all pages...');
          generateAllPages();
          
          // Перезагружаем все связанные модули
          setTimeout(() => {
            server.ws.send({ type: 'full-reload' });
          }, 100);
        }
      });
    },
    
    // Опционально: очистка при завершении
    buildEnd() {
      if (process.env.NODE_ENV === 'development') {
        // В dev режиме не удаляем
        return;
      }
      
      // В production можно удалить сгенерированные файлы
      // или оставить их - зависит от ваших needs
    }
  };
}