const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mapping = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'cloudinary-mapping.json'),'utf8'));
function normalize(str){
  return String(str||'').toLowerCase().replace(/\.[^/.]+$/,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,'-');
}
const normMap = new Map();
for (const key of Object.keys(mapping)){
  const base = path.basename(key);
  normMap.set(normalize(base), mapping[key]);
}
const Product = require('../models/Product');
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment (.env)');
  process.exit(1);
}
(async()=>{
  try{
    await mongoose.connect(MONGODB_URI, { useNewUrlParser:true, useUnifiedTopology:true });
    const products = await Product.find({});
    let updated=0;
    for(const p of products){
      const nameNorm = normalize(p.name);
      if(normMap.has(nameNorm)){
        const url = normMap.get(nameNorm);
        if(p.image !== url){
          console.log('Updating', p._id.toString(), p.name, '->', url);
          p.image = url;
          await p.save();
          updated++;
        }
      }
    }
    console.log('Done. Updated', updated);
    await mongoose.disconnect();
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
