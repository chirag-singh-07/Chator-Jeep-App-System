const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../assets/Main-App-logo.png');
const iconsDir = path.join(__dirname, '../assets/icons');
const imagesDir = path.join(__dirname, '../assets/images');

// Create directories
[iconsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Icon sizes needed
const iosIcons = [
  { size: 1024, name: 'ios-icon-1024x1024.png' },
  { size: 180, name: 'ios-icon-120x120.png' },
  { size: 120, name: 'ios-icon-60x60.png' },
  { size: 167, name: 'ios-icon-167x167.png' },
  { size: 152, name: 'ios-icon-152x152.png' },
  { size: 80, name: 'ios-icon-80x80.png' },
  { size: 87, name: 'ios-icon-87x87.png' },
  { size: 58, name: 'ios-icon-58x58.png' },
  { size: 40, name: 'ios-icon-40x40.png' },
  { size: 29, name: 'ios-icon-29x29.png' },
  { size: 20, name: 'ios-icon-20x20.png' },
  { size: 16, name: 'ios-icon-16x16.png' },
];

const androidIcons = [
  { size: 512, name: 'android-icon-512x512.png' },
  { size: 192, name: 'android-icon-192x192.png' },
  { size: 144, name: 'android-icon-144x144.png' },
  { size: 96, name: 'android-icon-96x96.png' },
  { size: 72, name: 'android-icon-72x72.png' },
  { size: 48, name: 'android-icon-48x48.png' },
  { size: 36, name: 'android-icon-36x36.png' },
];

const webIcons = [
  { size: 512, name: 'favicon.png' },
  { size: 192, name: 'web-icon-192x192.png' },
  { size: 180, name: 'web-icon-180x180.png' },
  { size: 152, name: 'web-icon-152x152.png' },
  { size: 144, name: 'web-icon-144x144.png' },
  { size: 128, name: 'web-icon-128x128.png' },
  { size: 114, name: 'web-icon-114x114.png' },
  { size: 72, name: 'web-icon-72x72.png' },
  { size: 57, name: 'web-icon-57x57.png' },
  { size: 32, name: 'web-icon-32x32.png' },
  { size: 16, name: 'web-icon-16x16.png' },
];

async function generateIcons() {
  console.log('Loading logo...');
  const logo = await sharp(logoPath).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  console.log('Generating iOS icons...');
  for (const icon of iosIcons) {
    await sharp(logo).resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(iconsDir, icon.name));
    console.log(`  Created ${icon.name}`);
  }

  console.log('Generating Android icons...');
  for (const icon of androidIcons) {
    await sharp(logo).resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(iconsDir, icon.name));
    console.log(`  Created ${icon.name}`);
  }

  console.log('Generating web icons...');
  for (const icon of webIcons) {
    await sharp(logo).resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(imagesDir, icon.name));
    console.log(`  Created ${icon.name}`);
  }

  // Generate Android adaptive icon background - white for main user app
  for (const size of [1024, 512]) {
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
      .png().toFile(path.join(imagesDir, `android-icon-background-${size}.png`));
  }
  fs.copyFileSync(path.join(imagesDir, 'android-icon-background-512.png'), path.join(imagesDir, 'android-icon-background.png'));

  // Generate dark background
  for (const size of [1024, 512]) {
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
      .png().toFile(path.join(imagesDir, `android-icon-background-dark-${size}.png`));
  }
  fs.copyFileSync(path.join(imagesDir, 'android-icon-background-dark-512.png'), path.join(imagesDir, 'android-icon-background-dark.png'));

  // Generate monochrome
  await sharp(logo).grayscale().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(imagesDir, 'android-icon-monochrome.png'));

  console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);