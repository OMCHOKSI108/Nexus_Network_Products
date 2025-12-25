const fs = require('fs');
const path = require('path');
const mapping = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'cloudinary-mapping.json'),'utf8'));
function normalize(str){
  return String(str||'').toLowerCase().replace(/\.[^/.]+$/,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,'-');
}
const normMap = new Map();
for (const key of Object.keys(mapping)){
  const base = path.basename(key);
  normMap.set(normalize(base), mapping[key]);
}
console.log('normMap size', normMap.size);
console.log('has brass-thread-enlarger-adaptor?', normMap.has('brass-thread-enlarger-adaptor'));
console.log('sample get:', normMap.get('brass-thread-enlarger-adaptor'));
