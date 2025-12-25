const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Product = require('../models/Product');

function normalize(str){
  return String(str||'').toLowerCase().replace(/\.[^/.]+$/,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,'-');
}
const mapping = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'cloudinary-mapping.json'),'utf8'));
const normMap = new Map();
for (const key of Object.keys(mapping)){
  const base = path.basename(key);
  normMap.set(normalize(base), mapping[key]);
}

(async()=>{
  try{
    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI;
    await mongoose.connect(uri, { useNewUrlParser:true, useUnifiedTopology:true });
    const products = await Product.find({}).limit(20);
    for(const p of products){
      const nameNorm = normalize(p.name);
      const baseNorm = normalize(require('path').basename(p.image||''));
      console.log(p._id.toString());
      console.log('nameNorm', nameNorm, 'inMap?', normMap.has(nameNorm));
      console.log('baseNorm', baseNorm, 'inMap?', normMap.has(baseNorm));
      if(!normMap.has(nameNorm) && !normMap.has(baseNorm)){
        // print some nearby mapping keys for debugging
        let found=false;
        for(const k of normMap.keys()){
          if(k.includes(nameNorm.split('-')[0]) || nameNorm.includes(k.split('-')[0])){
            console.log('nearby key:', k);
            found=true; break;
          }
        }
        if(!found) console.log('no nearby keys');
      }
      console.log('---');
    }
    await mongoose.disconnect();
  }catch(e){
    console.error(e);
  }
})();
