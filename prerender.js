import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

async function run() {
  // 1. Read the template index.html produced by Vite client build
  const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8');

  // 2. Import the server bundle
  const serverBuildPath = toAbsolute('dist/server/entry-server.js');
  
  if (!fs.existsSync(serverBuildPath)) {
    console.error(`Server build file not found at: ${serverBuildPath}. Please run the SSR build first.`);
    process.exit(1);
  }

  const { render } = await import('./dist/server/entry-server.js');

  // 3. Render the landing page to HTML
  const appHtml = render();

  // 4. Inject the rendered app HTML into the template
  const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  // 5. Write the final HTML file
  fs.writeFileSync(toAbsolute('dist/index.html'), html);

  console.log('Pre-rendered landing page successfully!');
}

run();
