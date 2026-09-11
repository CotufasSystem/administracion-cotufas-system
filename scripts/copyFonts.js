const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'dist', 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');

if (!fs.existsSync(srcDir)) {
  console.log('No vector-icons font build directory found in dist.');
  process.exit(0);
}

const targets = [
  path.join(__dirname, '..', 'dist', 'assets', 'node_modules', '@expo', 'vector-icons', 'Fonts'),
  path.join(__dirname, '..', 'dist', 'assets', 'Fonts'),
  path.join(__dirname, '..', 'dist', 'Fonts')
];

targets.forEach((targetDir) => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const files = fs.readdirSync(srcDir);
  files.forEach((file) => {
    fs.copyFileSync(path.join(srcDir, file), path.join(targetDir, file));
  });
});

console.log('Successfully aligned font asset paths for web production.');

// Ensure favicon, logo, manifest & sw in dist root
const assetsDir = path.join(__dirname, '..', 'assets');
const distDir = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distDir)) {
  const faviconSrc = path.join(assetsDir, 'favicon.png');
  const iconSrc = path.join(assetsDir, 'icon.png');
  const manifestSrc = path.join(assetsDir, 'manifest.json');
  const swSrc = path.join(assetsDir, 'sw.js');

  if (fs.existsSync(faviconSrc)) {
    fs.copyFileSync(faviconSrc, path.join(distDir, 'favicon.ico'));
    fs.copyFileSync(faviconSrc, path.join(distDir, 'favicon.png'));
  }
  if (fs.existsSync(iconSrc)) {
    const distAssetsDir = path.join(distDir, 'assets');
    if (!fs.existsSync(distAssetsDir)) fs.mkdirSync(distAssetsDir, { recursive: true });
    fs.copyFileSync(iconSrc, path.join(distAssetsDir, 'icon.png'));
  }
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, path.join(distDir, 'manifest.json'));
  }
  if (fs.existsSync(swSrc)) {
    fs.copyFileSync(swSrc, path.join(distDir, 'sw.js'));
  }

  // Inject PWA tags and prevent translation tampering into dist/index.html
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Set html lang to es and add translate="no"
    html = html.replace('<html lang="en">', '<html lang="es" class="notranslate" translate="no">');

    const pwaTags = `
    <meta name="google" content="notranslate" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Cotufas System" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <style>
      /* v0 / Framer Motion Smooth Micro-interactions & Transitions */
      * {
        -webkit-tap-highlight-color: transparent;
      }
      body {
        background-color: #f8fafc;
        transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      /* Interactive hover scaling, float movement and glow transitions for all buttons */
      [role="button"], 
      button, 
      a, 
      .r-1loqt21,
      [style*="cursor: pointer"],
      [style*="cursor:pointer"],
      [data-focusable="true"] {
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), 
                    box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                    filter 0.2s ease !important;
        cursor: pointer !important;
      }
      
      /* Subtle float lift, upward movement and glow on hover */
      [role="button"]:hover, 
      button:hover, 
      a:hover, 
      .r-1loqt21:hover,
      [style*="cursor: pointer"]:hover,
      [style*="cursor:pointer"]:hover,
      [data-focusable="true"]:hover {
        transform: translateY(-2.5px) scale(1.02) !important;
        filter: brightness(1.05);
      }

      /* Tactile spring press effect when clicked / touched */
      [role="button"]:active, 
      button:active, 
      a:active, 
      .r-1loqt21:active,
      [style*="cursor: pointer"]:active,
      [style*="cursor:pointer"]:active,
      [data-focusable="true"]:active {
        transform: translateY(1px) scale(0.96) !important;
        transition-duration: 0.08s !important;
      }

      /* Prevent nested transform conflicts */
      [role="button"] [role="button"],
      .r-1loqt21 .r-1loqt21 {
        transform: none !important;
      }

      /* Pulse animation for notifications / badges */
      @keyframes v0-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.18); opacity: 0.85; }
      }
      .v0-pulse {
        animation: v0-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      /* Shimmer glow effect */
      @keyframes v0-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Custom scrollbar styled like modern devtools/v0 */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    </style>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration error:', err));
        });
      }
    </script>
  </head>`;
    
    if (!html.includes('rel="manifest"')) {
      html = html.replace('</head>', pwaTags);
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Injected PWA manifest and service worker into dist/index.html');
    } else {
      html = html.replace(/<style>[\s\S]*?<\/style>/, '');
      html = html.replace('</head>', pwaTags);
      fs.writeFileSync(indexPath, html, 'utf8');
    }
  }
  console.log('Copied favicon, manifest and sw to dist root.');
}

