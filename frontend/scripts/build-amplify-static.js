import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists and is clean
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy all files from .output/public to dist if present
const outputPublicDir = path.join(rootDir, '.output', 'public');
if (fs.existsSync(outputPublicDir)) {
  fs.cpSync(outputPublicDir, distDir, { recursive: true });
}

// Copy all files from .amplify-hosting/static to dist if present
const amplifyStaticDir = path.join(rootDir, '.amplify-hosting', 'static');
if (fs.existsSync(amplifyStaticDir)) {
  fs.cpSync(amplifyStaticDir, distDir, { recursive: true });
}

// Copy public/ folder to dist/
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// Locate compiled assets in dist/assets
const assetsDir = path.join(distDir, 'assets');
let cssAssetTag = '';
let jsAssetTag = '<script type="module" src="/src/main.tsx"></script>';

if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  const cssFile = assetFiles.find(f => f.startsWith('styles-') && f.endsWith('.css'));
  const jsFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));

  if (cssFile) {
    cssAssetTag = `<link rel="stylesheet" href="/assets/${cssFile}" />`;
  }
  if (jsFile) {
    jsAssetTag = `<script type="module" src="/assets/${jsFile}"></script>`;
  }
}

// Generate production static index.html in dist/
const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Monexa — Personal Financial Intelligence Platform</title>
    <meta name="description" content="Personal Financial Intelligence Platform with AI-powered simulations and deterministic calculations." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    ${cssAssetTag}
  </head>
  <body>
    <div id="root"></div>
    ${jsAssetTag}
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtmlContent);

// Remove .amplify-hosting directory so Amplify only looks at dist/
const amplifyDir = path.join(rootDir, '.amplify-hosting');
if (fs.existsSync(amplifyDir)) {
  fs.rmSync(amplifyDir, { recursive: true, force: true });
}

console.log('✅ Generated pure static SPA bundle in dist/ (AWS Amplify S3/CloudFront ready)');
