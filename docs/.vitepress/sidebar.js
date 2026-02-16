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

// Auto-generate sidebar from generated markdown files
function generateSidebar() {
  const examplesDir = path.resolve(__dirname, '../examples');
  const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.md'));
  
  // Use keys from CATEGORIES to maintain order
  const order = Object.keys(CATEGORIES);
  
  const sidebarItems = order.map(key => {
    const categoryInfo = CATEGORIES[key];
    const filePath = path.join(examplesDir, `${categoryInfo.id}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract ## headings
    const headings = [];
    const matches = content.matchAll(/^## (.+)$/gm);
    
    for (const match of matches) {
      const title = match[1].trim();
      const anchor = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      headings.push({
        text: title,
        link: `/examples/${categoryInfo.id}#${anchor}`
      });
    }
    
    return {
      text: categoryInfo.title,
      link: `/examples/${categoryInfo.id}`,
      items: headings
    };
  }).filter(Boolean); // Filter out null items
  
  return sidebarItems;
}

export { generateSidebar };
