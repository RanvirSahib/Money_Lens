import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists and is clean
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy all files from .output/public to dist if present.
// In SPA mode, TanStack Start prerender generates a complete index.html here
// that includes the framework's initialization scripts — do NOT overwrite it.
const outputPublicDir = path.join(rootDir, '.output', 'public');
if (fs.existsSync(outputPublicDir)) {
  fs.cpSync(outputPublicDir, distDir, { recursive: true });
}

// Copy all files from .amplify-hosting/static to dist if present
const amplifyStaticDir = path.join(rootDir, '.amplify-hosting', 'static');
if (fs.existsSync(amplifyStaticDir)) {
  fs.cpSync(amplifyStaticDir, distDir, { recursive: true, force: true });
}

// Copy public/ folder to dist/ (favicon, robots.txt, etc.)
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true, force: true });
}

// Only generate a fallback index.html if TanStack Start didn't prerender one.
// When spa: { enabled: true } is set, TanStack Start writes its own index.html
// to .output/public/ which includes the proper window.$_TSR initialization.
// Overwriting it causes "Invariant failed" / blank page at runtime.
const prerenderedIndex = path.join(distDir, 'index.html');
if (!fs.existsSync(prerenderedIndex)) {
  console.log('⚠️  No prerendered index.html found — generating fallback.');

  // Locate compiled assets in dist/assets
  const assetsDir = path.join(distDir, 'assets');
  let cssAssetTag = '';
  let jsAssetTag = '<script type="module" src="/src/main.tsx"></script>';

  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const cssFile = assetFiles.find(f => f.startsWith('styles-') && f.endsWith('.css'));
    const jsFile  = assetFiles.find(f => f.startsWith('index-')  && f.endsWith('.js'));
    if (cssFile) cssAssetTag = `<link rel="stylesheet" href="/assets/${cssFile}" />`;
    if (jsFile)  jsAssetTag  = `<script type="module" src="/assets/${jsFile}"></script>`;
  }

  const fallbackHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Monexa — Personal Financial Intelligence Platform</title>
    <meta name="description" content="Personal Financial Intelligence Platform with AI-powered simulations." />
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
  fs.writeFileSync(prerenderedIndex, fallbackHtml);
}

// Remove .amplify-hosting directory so Amplify only deploys from dist/
const amplifyDir = path.join(rootDir, '.amplify-hosting');
if (fs.existsSync(amplifyDir)) {
  fs.rmSync(amplifyDir, { recursive: true, force: true });
}

// Log what's in dist for debugging
const distContents = fs.readdirSync(distDir);
console.log(`✅ dist/ contents: ${distContents.join(', ')}`);
console.log('✅ Generated pure static SPA bundle in dist/ (AWS Amplify S3/CloudFront ready)');
