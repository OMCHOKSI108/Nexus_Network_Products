const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NexusNetwork';

const sampleProducts = [
  {
    name: 'NX Brass Elbow 90° Female-Female - 1/2 inch',
    sku: 'NX-BR-ELB-001',
    description: 'Premium brass 90° elbow, female threaded both ends. Suitable for plumbing and pneumatic connections.',
    price: 120,
    category: 'brass fitting',
    stockQuantity: 40,
    inStock: true,
    stockStatus: 'in_stock',
    specifications: {
      Material: 'Brass',
      'Thread Type': 'Female',
      'Thread Size': '1/2 inch',
      'Pressure Rating': '10 bar',
      Finish: 'Polished',
      Standard: 'IS / BSP',
      Weight: '180g'
    },
    deliveryInfo: {
      deliveryTime: '2-4 business days',
      codAvailable: true,
      returnPolicy: '7-day replacement'
    },
    certifications: ['ISO Certified', 'Pressure Tested', 'Corrosion Resistant'],
    usageAreas: ['Pneumatic systems', 'Water pipelines', 'Industrial machinery', 'HVAC connections'],
    faqs: [
      { question: 'Is this suitable for high pressure?', answer: 'Yes, rated to 10 bar.' },
      { question: 'Can it be used outdoors?', answer: 'Yes, brass is suitable but avoid prolonged exposure to corrosive environments.' },
      { question: 'Is threading BSP or NPT?', answer: 'This product uses BSP threading.' }
    ],
    datasheetUrl: '',
    bulkPricing: [ { minQty: 1, maxQty: 10, price: 120 }, { minQty: 11, maxQty: 50, price: 110 }, { minQty: 51, maxQty: 99999, price: 100 } ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    for (const p of sampleProducts) {
      const existing = await Product.findOne({ sku: p.sku });
      if (existing) {
        console.log('Skipping existing SKU', p.sku);
        continue;
      }
      const prod = new Product(p);
      await prod.save();
      console.log('Inserted', prod.name);
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
