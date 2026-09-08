require('dotenv').config();
const val = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccountStr = (val || '{}').trim();
serviceAccountStr = serviceAccountStr.replace(/^['"]|['"]$/g, '');
// DO NOT replace all newlines.
try {
  JSON.parse(serviceAccountStr);
  console.log('Parsed successfully!');
} catch(e) {
  console.error(e);
}
