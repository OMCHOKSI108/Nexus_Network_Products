const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Product = require('../models/Product');

function normalize(str){
  return String(str||'').toLowerCase().replace(/\.[^/.]+$/,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,'-');
}

(async()=>{
  try{
    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI;
    await mongoose.connect(uri, { useNewUrlParser:true, useUnifiedTopology:true });
    const products = await Product.find({}).limit(10);
    for(const p of products){
      console.log('id:', p._id);
      console.log('name:', JSON.stringify(p.name));
      console.log('image:', JSON.stringify(p.image));
      console.log('nameNorm:', normalize(p.name));
      console.log('imageBase:', require('path').basename(p.image||''));
      console.log('imageBaseNorm:', normalize(require('path').basename(p.image||'')));
      console.log('---');
    }
    await mongoose.disconnect();
  }catch(e){
    console.error(e);
  }
})();
