// android-fix.js — يُشغَّل بعد `npx cap add android`
// يصلح مشكلة ERR_CLEARTEXT_NOT_PERMITTED تلقائياً

const fs = require('fs');
const path = require('path');

// مسار AndroidManifest.xml
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
// مسار network_security_config
const netSecSrc = path.join(__dirname, 'android-res', 'network_security_config.xml');
const netSecDst = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'xml', 'network_security_config.xml');

if (!fs.existsSync(manifestPath)) {
  console.log('❌ AndroidManifest.xml not found. Run: npx cap add android first');
  process.exit(0);
}

// إضافة networkSecurityConfig للـ AndroidManifest
let manifest = fs.readFileSync(manifestPath, 'utf-8');

// إضافة usesCleartextTraffic
if (!manifest.includes('usesCleartextTraffic')) {
  manifest = manifest.replace(
    '<application',
    '<application\n        android:usesCleartextTraffic="true"\n        android:networkSecurityConfig="@xml/network_security_config"'
  );
  fs.writeFileSync(manifestPath, manifest);
  console.log('✅ AndroidManifest.xml updated');
}

// نسخ network_security_config.xml
const xmlDir = path.dirname(netSecDst);
if (!fs.existsSync(xmlDir)) fs.mkdirSync(xmlDir, {recursive: true});
fs.copyFileSync(netSecSrc, netSecDst);
console.log('✅ network_security_config.xml copied');

console.log('✅ Android fix complete! Now run: npx cap sync android');
