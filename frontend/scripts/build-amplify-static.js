import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const amplifyDir = path.join(rootDir, '.amplify-hosting');
const staticDir = path.join(amplifyDir, 'static');

// Ensure static directory exists
fs.mkdirSync(staticDir, { recursive: true });

// Copy all files from .output/public to .amplify-hosting/static
const outputPublicDir = path.join(rootDir, '.output', 'public');
if (fs.existsSync(outputPublicDir)) {
  fs.cpSync(outputPublicDir, staticDir, { recursive: true });
}

// Copy public/ folder to static/
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, staticDir, { recursive: true });
}

// Locate compiled assets in static/assets
const assetsDir = path.join(staticDir, 'assets');
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

// Generate production static index.html
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

fs.writeFileSync(path.join(staticDir, 'index.html'), indexHtmlContent);

// Remove compute/ directory if generated so AWS Amplify never provisions a failing Lambda
const computeDir = path.join(amplifyDir, 'compute');
if (fs.existsSync(computeDir)) {
  fs.rmSync(computeDir, { recursive: true, force: true });
}

// Write the official static-only deploy-manifest.json for AWS Amplify CDN
const manifest = {
  version: 1,
  routes: [
    {
      path: "/*.*",
      target: {
        kind: "Static",
      },
    },
    {
      path: "/*",
      target: {
        kind: "Static",
      },
      fallback: {
        kind: "Static",
        src: "/index.html",
      },
    },
  ],
};

fs.writeFileSync(
  path.join(amplifyDir, 'deploy-manifest.json'),
  JSON.stringify(manifest, null, 2),
);

console.log('✅ Generated AWS Amplify Static CDN bundle in .amplify-hosting/ (zero Lambda compute)');
