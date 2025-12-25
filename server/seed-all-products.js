const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Use the same connection as server
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = "NexusNetwork";
const DB_CLUSTER = process.env.DB_CLUSTER || "nexusnetwork.sz7r7g5";
const DB_APPNAME = process.env.DB_APPNAME || "NexusNetwork";

let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/NexusNetwork";
// Normalize scheme if user provided a host without scheme
if (!/^mongodb(?:\+srv)?:\/\//.test(mongoURI)) {
  mongoURI = 'mongodb://' + mongoURI;
}

// MongoDB connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => {
  console.error('Mongo connection error:', err);
  process.exit(1);
});

const products = [
  // Brass Fittings
  {
    name: 'Brass Cross Fitting',
    description: 'Durable brass cross fitting suitable for plumbing and industrial use.',
    price: 120,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-1.jpg',
    stockQuantity: 50,
    specifications: {
      material: 'Brass',
      finish: 'Natural Brass',
      application: 'Plumbing & Industrial'
    }
  },
  {
    name: 'Brass Elbow Fitting (Male-Female)',
    description: '90-degree brass elbow connector with male and female threads for secure pipe connections.',
    price: 95,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-2.jpg',
    stockQuantity: 75,
    specifications: {
      material: 'Brass',
      angle: '90°',
      thread: 'Male-Female'
    }
  },
  {
    name: 'Brass Hose Connector',
    description: 'High-strength brass hose connector designed for leak-free hose attachments.',
    price: 60,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-3.jpg',
    stockQuantity: 100,
    specifications: {
      material: 'Brass',
      type: 'Hose Connector',
      feature: 'Leak-free'
    }
  },
  {
    name: 'Brass Hose Fitting',
    description: 'Versatile brass hose fitting for general plumbing and industrial applications.',
    price: 80,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-4.jpg',
    stockQuantity: 80,
    specifications: {
      material: 'Brass',
      application: 'General Purpose',
      type: 'Hose Fitting'
    }
  },
  {
    name: 'Brass Reducer Bush',
    description: 'Precision-engineered brass reducer bush for reducing pipe sizes effectively.',
    price: 55,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-5.jpg',
    stockQuantity: 120,
    specifications: {
      material: 'Brass',
      type: 'Reducer Bush',
      feature: 'Precision-engineered'
    }
  },
  {
    name: 'Brass Straight Barbed Connector',
    description: 'Straight barbed brass connector for secure hose-to-hose connections.',
    price: 70,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-6.jpg',
    stockQuantity: 90,
    specifications: {
      material: 'Brass',
      type: 'Barbed Connector',
      shape: 'Straight'
    }
  },
  {
    name: 'Brass Tee Fitting',
    description: 'Premium brass tee fitting for T-junction pipe connections.',
    price: 85,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-7.jpg',
    stockQuantity: 70,
    specifications: {
      material: 'Brass',
      type: 'Tee Fitting',
      junction: 'T-junction'
    }
  },
  {
    name: 'Brass Y-Type Barbed Connector',
    description: 'Y-shaped brass barbed connector for splitting hoses with a secure fit.',
    price: 90,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-8.jpg',
    stockQuantity: 60,
    specifications: {
      material: 'Brass',
      type: 'Y-Type Connector',
      shape: 'Y-shaped'
    }
  },
  {
    name: 'Brass Elbow Fitting',
    description: 'Standard brass elbow fitting for angled pipe or hose connections.',
    price: 75,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-9.jpg',
    stockQuantity: 85,
    specifications: {
      material: 'Brass',
      type: 'Elbow Fitting',
      application: 'Angled connections'
    }
  },

  // Brass Inserts
  {
    name: 'Brass Adapter Bushing',
    description: 'High-quality brass adapter bushing designed for smooth fitting and durable pipe connections.',
    price: 65,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-1.jpg',
    stockQuantity: 100,
    specifications: {
      material: 'Brass',
      type: 'Adapter Bushing',
      quality: 'High-quality'
    }
  },
  {
    name: 'Brass Hex Reducer Bushing',
    description: 'Hex-shaped brass reducer bushing for reducing thread sizes securely in plumbing applications.',
    price: 70,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-2.jpg',
    stockQuantity: 80,
    specifications: {
      material: 'Brass',
      shape: 'Hex',
      type: 'Reducer Bushing'
    }
  },
  {
    name: 'Brass Knurled Insert',
    description: 'Precision-engineered knurled brass insert ensuring strong grip in plastic and wooden assemblies.',
    price: 55,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-3.jpg',
    stockQuantity: 150,
    specifications: {
      material: 'Brass',
      type: 'Knurled Insert',
      application: 'Plastic & Wood'
    }
  },
  {
    name: 'Brass Reducer Bush',
    description: 'Reliable brass reducer bush used to connect and adapt different pipe sizes.',
    price: 50,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-4.jpg',
    stockQuantity: 120,
    specifications: {
      material: 'Brass',
      type: 'Reducer Bush',
      feature: 'Reliable'
    }
  },
  {
    name: 'Brass Slotted Insert',
    description: 'Durable brass slotted insert with threaded body, ideal for high-strength fastening.',
    price: 60,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-5.jpg',
    stockQuantity: 90,
    specifications: {
      material: 'Brass',
      type: 'Slotted Insert',
      feature: 'High-strength'
    }
  },
  {
    name: 'Brass Stopping Plug',
    description: 'Solid brass stopping plug designed for sealing pipe ends securely.',
    price: 75,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-6.jpg',
    stockQuantity: 70,
    specifications: {
      material: 'Brass',
      type: 'Stopping Plug',
      feature: 'Sealing'
    }
  },
  {
    name: 'Brass Thread Adapter',
    description: 'Strong brass thread adapter for joining male and female threaded fittings.',
    price: 65,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-7.jpg',
    stockQuantity: 85,
    specifications: {
      material: 'Brass',
      type: 'Thread Adapter',
      feature: 'Strong'
    }
  },
  {
    name: 'Brass Thread Enlarger Adaptor',
    description: 'Premium brass enlarger adaptor used to increase thread size conveniently.',
    price: 80,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-8.jpg',
    stockQuantity: 60,
    specifications: {
      material: 'Brass',
      type: 'Thread Enlarger',
      quality: 'Premium'
    }
  },
  {
    name: 'Brass Thread Reducing Bushing',
    description: 'Heavy-duty brass reducing bushing designed to convert larger threads into smaller sizes.',
    price: 70,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-9.jpg',
    stockQuantity: 75,
    specifications: {
      material: 'Brass',
      type: 'Reducing Bushing',
      duty: 'Heavy-duty'
    }
  },

  // Air Conditioners and Refrigeration Parts
  {
    name: 'Air Valve Adapter',
    description: 'Durable brass air valve adapter for secure and leak-proof refrigeration and AC connections.',
    price: 85,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-1.jpg',
    stockQuantity: 60,
    specifications: {
      material: 'Brass',
      type: 'Air Valve Adapter',
      feature: 'Leak-proof'
    }
  },
  {
    name: 'Brass Thermowell Protection Tube',
    description: 'High-quality brass thermowell protection tube designed for protecting sensors in HVAC systems.',
    price: 120,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-2.jpg',
    stockQuantity: 40,
    specifications: {
      material: 'Brass',
      type: 'Thermowell Protection',
      application: 'HVAC Systems'
    }
  },
  {
    name: 'Brass Thermowell',
    description: 'Strong brass thermowell for temperature measurement and sensor safety in refrigeration and air conditioning.',
    price: 150,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-3.jpg',
    stockQuantity: 35,
    specifications: {
      material: 'Brass',
      type: 'Thermowell',
      application: 'Temperature Measurement'
    }
  },
  {
    name: 'Lead-Free Thermowell',
    description: 'Eco-friendly lead-free brass thermowell ensuring safe temperature measurement in HVAC equipment.',
    price: 160,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-4.jpg',
    stockQuantity: 30,
    specifications: {
      material: 'Lead-Free Brass',
      type: 'Thermowell',
      feature: 'Eco-friendly'
    }
  },
  {
    name: 'Sensor Installation Fitting',
    description: 'Precision brass sensor installation fitting for accurate and reliable sensor mounting.',
    price: 95,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-5.jpg',
    stockQuantity: 50,
    specifications: {
      material: 'Brass',
      type: 'Sensor Fitting',
      feature: 'Precision'
    }
  },
  {
    name: 'Swimming Pool Thermometer Brass Thermowell',
    description: 'Special brass thermowell designed for swimming pool thermometers to ensure durability and corrosion resistance.',
    price: 180,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-6.jpg',
    stockQuantity: 25,
    specifications: {
      material: 'Brass',
      type: 'Pool Thermowell',
      feature: 'Corrosion Resistant'
    }
  },
  {
    name: 'Thermowell Nipple Brass Thread',
    description: 'Brass thermowell nipple with threaded design for easy installation and long-lasting performance.',
    price: 110,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-7.jpg',
    stockQuantity: 45,
    specifications: {
      material: 'Brass',
      type: 'Thermowell Nipple',
      feature: 'Threaded'
    }
  },
  {
    name: 'Winters Brass Thermowell',
    description: 'Premium Winters brass thermowell for temperature sensors, ideal for refrigeration systems.',
    price: 170,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-8.jpg',
    stockQuantity: 30,
    specifications: {
      material: 'Brass',
      brand: 'Winters',
      type: 'Thermowell'
    }
  },
  {
    name: 'Winters TBR25 Brass Thermowell',
    description: 'High-quality Winters TBR25 brass thermowell providing accurate sensor housing for HVAC systems.',
    price: 175,
    category: 'Air Conditioners and Refigeration Parts',
    image: '/images/products/air-conditioners-refrigeration-parts/ac-part-9.jpg',
    stockQuantity: 28,
    specifications: {
      material: 'Brass',
      brand: 'Winters',
      model: 'TBR25'
    }
  },

  // Cable Gland Accessories
  {
    name: 'Brass Earthing (Grounding) Clamps',
    description: 'Strong brass earthing clamps designed for reliable grounding and electrical safety connections.',
    price: 95,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-1.jpg',
    stockQuantity: 80,
    specifications: {
      material: 'Brass',
      type: 'Earthing Clamps',
      feature: 'Electrical Safety'
    }
  },
  {
    name: 'Cable Lugs',
    description: 'Durable copper cable lugs for secure wire terminations in electrical installations.',
    price: 40,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-2.jpg',
    stockQuantity: 200,
    specifications: {
      material: 'Copper',
      type: 'Cable Lugs',
      application: 'Wire Termination'
    }
  },
  {
    name: 'Double Compression Gland (NPT2)',
    description: 'Premium brass double compression gland (NPT2) ensuring tight and secure cable fittings.',
    price: 160,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-3.jpg',
    stockQuantity: 40,
    specifications: {
      material: 'Brass',
      type: 'Double Compression',
      thread: 'NPT2'
    }
  },
  {
    name: 'Double Compression Gland (NPT3)',
    description: 'Heavy-duty brass double compression gland (NPT3) for industrial and electrical cable sealing.',
    price: 170,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-4.jpg',
    stockQuantity: 35,
    specifications: {
      material: 'Brass',
      type: 'Double Compression',
      thread: 'NPT3'
    }
  },
  {
    name: 'Double Compression Gland',
    description: 'High-strength brass double compression gland offering superior grip and sealing performance.',
    price: 150,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-5.jpg',
    stockQuantity: 50,
    specifications: {
      material: 'Brass',
      type: 'Double Compression',
      feature: 'High-strength'
    }
  },
  {
    name: 'Earthing Rods',
    description: 'Solid copper earthing rods designed for safe and efficient electrical grounding.',
    price: 200,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-6.jpg',
    stockQuantity: 30,
    specifications: {
      material: 'Copper',
      type: 'Earthing Rods',
      feature: 'Solid'
    }
  },
  {
    name: 'Hoke Torch Tip',
    description: 'Precision-engineered brass hoke torch tip for reliable gas flow and durability.',
    price: 85,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-7.jpg',
    stockQuantity: 60,
    specifications: {
      material: 'Brass',
      type: 'Torch Tip',
      brand: 'Hoke'
    }
  },
  {
    name: 'Single Compression Gland (M40-2)',
    description: 'Brass single compression gland (M40-2) ideal for simple and effective cable termination.',
    price: 120,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-8.jpg',
    stockQuantity: 70,
    specifications: {
      material: 'Brass',
      type: 'Single Compression',
      size: 'M40-2'
    }
  },
  {
    name: 'Single Compression Gland',
    description: 'Standard single compression gland designed for secure and efficient cable entry.',
    price: 110,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-9.jpg',
    stockQuantity: 80,
    specifications: {
      material: 'Brass',
      type: 'Single Compression',
      feature: 'Standard'
    }
  },
  {
    name: 'Y Connector Oxygen',
    description: 'Brass Y connector for oxygen pipelines ensuring secure and leak-free connections.',
    price: 140,
    category: 'cable gland accessories',
    image: '/images/products/cable-gland-accessories/cable-gland-10.jpg',
    stockQuantity: 45,
    specifications: {
      material: 'Brass',
      type: 'Y Connector',
      application: 'Oxygen Pipeline'
    }
  },

  // Pneumatic Parts
  {
    name: 'Brass 45-Degree Street Elbow Fitting',
    description: 'Durable brass 45° street elbow fitting for angled pipe and hose connections.',
    price: 90,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-1.jpg',
    stockQuantity: 70,
    specifications: {
      material: 'Brass',
      angle: '45°',
      type: 'Street Elbow'
    }
  },
  {
    name: 'Brass Cross Fitting (Female Threaded)',
    description: 'Premium brass cross fitting with female threading for multi-directional connections.',
    price: 120,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-2.jpg',
    stockQuantity: 50,
    specifications: {
      material: 'Brass',
      type: 'Cross Fitting',
      thread: 'Female'
    }
  },
  {
    name: 'Brass Female Thread x Hose Barb Adapter',
    description: 'Versatile brass female thread to hose barb adapter for secure hose connections.',
    price: 70,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-3.jpg',
    stockQuantity: 90,
    specifications: {
      material: 'Brass',
      type: 'Thread to Barb',
      thread: 'Female'
    }
  },
  {
    name: 'Brass Foot Valve Strainer',
    description: 'Heavy-duty brass foot valve strainer for preventing debris entry in piping systems.',
    price: 95,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-4.jpg',
    stockQuantity: 40,
    specifications: {
      material: 'Brass',
      type: 'Foot Valve Strainer',
      duty: 'Heavy-duty'
    }
  },
  {
    name: 'Brass Hose Barb Elbow',
    description: 'Strong brass hose barb elbow designed for leak-proof angled hose fittings.',
    price: 65,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-5.jpg',
    stockQuantity: 100,
    specifications: {
      material: 'Brass',
      type: 'Hose Barb Elbow',
      feature: 'Leak-proof'
    }
  },
  {
    name: 'Brass Hose Barb Splicer',
    description: 'Reliable brass splicer for connecting hoses with a secure grip.',
    price: 55,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-6.jpg',
    stockQuantity: 120,
    specifications: {
      material: 'Brass',
      type: 'Hose Barb Splicer',
      feature: 'Secure Grip'
    }
  },
  {
    name: 'Brass Jet Nozzle',
    description: 'High-performance brass jet nozzle for focused water or fluid spray applications.',
    price: 80,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-7.jpg',
    stockQuantity: 75,
    specifications: {
      material: 'Brass',
      type: 'Jet Nozzle',
      performance: 'High-performance'
    }
  },
  {
    name: 'Brass Jet Spray Nozzle Housing',
    description: 'Sturdy brass housing for spray nozzles, ensuring durability and long service life.',
    price: 100,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-8.jpg',
    stockQuantity: 60,
    specifications: {
      material: 'Brass',
      type: 'Nozzle Housing',
      feature: 'Sturdy'
    }
  },
  {
    name: 'Brass Male Elbow',
    description: 'Precision-engineered brass male elbow fitting for secure threaded connections.',
    price: 85,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-9.jpg',
    stockQuantity: 80,
    specifications: {
      material: 'Brass',
      type: 'Male Elbow',
      feature: 'Precision-engineered'
    }
  },
  {
    name: 'Brass Pipe Nipple',
    description: 'Solid brass pipe nipple designed for extending threaded connections.',
    price: 60,
    category: 'panumatic part',
    image: '/images/products/panumatic-part/panumatic-part-10.jpg',
    stockQuantity: 110,
    specifications: {
      material: 'Brass',
      type: 'Pipe Nipple',
      feature: 'Solid'
    }
  },

  // Pressure Gauge Parts
  {
    name: 'Adapter Temp Gauge',
    description: 'Brass temperature gauge adapter for secure and accurate gauge fitting.',
    price: 70,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-1.jpg',
    stockQuantity: 85,
    specifications: {
      material: 'Brass',
      type: 'Temp Gauge Adapter',
      feature: 'Accurate'
    }
  },
  {
    name: 'Brass Water Temperature Gauge',
    description: 'Reliable brass water temperature gauge for monitoring HVAC and engine systems.',
    price: 180,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-2.jpg',
    stockQuantity: 40,
    specifications: {
      material: 'Brass',
      type: 'Water Temp Gauge',
      application: 'HVAC & Engine'
    }
  },
  {
    name: 'Coolant Temperature Gauge Sender',
    description: 'Durable brass coolant temperature sender for accurate sensor readings.',
    price: 150,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-3.jpg',
    stockQuantity: 50,
    specifications: {
      material: 'Brass',
      type: 'Temp Sender',
      feature: 'Accurate'
    }
  },
  {
    name: 'Gauge Adapter Fitting',
    description: 'Strong brass gauge adapter fitting for secure installation of pressure gauges.',
    price: 90,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-4.jpg',
    stockQuantity: 70,
    specifications: {
      material: 'Brass',
      type: 'Gauge Adapter',
      feature: 'Strong'
    }
  },
  {
    name: 'Mini Pressure Gauge',
    description: 'Compact mini pressure gauge for small-scale applications and precise monitoring.',
    price: 130,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-5.jpg',
    stockQuantity: 60,
    specifications: {
      material: 'Brass',
      type: 'Mini Pressure Gauge',
      size: 'Compact'
    }
  },
  {
    name: 'Oil Pressure Gauge Hose Fitting',
    description: 'Brass hose fitting designed for oil pressure gauge connections.',
    price: 95,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-6.jpg',
    stockQuantity: 65,
    specifications: {
      material: 'Brass',
      type: 'Oil Pressure Fitting',
      application: 'Gauge Connection'
    }
  },
  {
    name: 'Oil Sender Pressure Fitting',
    description: 'High-quality brass oil sender fitting for reliable pressure monitoring.',
    price: 100,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-7.jpg',
    stockQuantity: 55,
    specifications: {
      material: 'Brass',
      type: 'Oil Sender',
      quality: 'High-quality'
    }
  },
  {
    name: 'Oil Temperature Sensor',
    description: 'Brass oil temperature sensor fitting ensuring accurate heat measurement.',
    price: 160,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-8.jpg',
    stockQuantity: 35,
    specifications: {
      material: 'Brass',
      type: 'Oil Temp Sensor',
      feature: 'Accurate'
    }
  },
  {
    name: 'Pressure Gauge Connection',
    description: 'Standard brass pressure gauge connection piece for secure installations.',
    price: 85,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-9.jpg',
    stockQuantity: 75,
    specifications: {
      material: 'Brass',
      type: 'Gauge Connection',
      standard: 'Standard'
    }
  },
  {
    name: 'Pressure Gauge S.S. Oil LM',
    description: 'Stainless steel oil pressure gauge with durable brass connection.',
    price: 200,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-10.jpg',
    stockQuantity: 30,
    specifications: {
      material: 'Stainless Steel & Brass',
      type: 'Oil Pressure Gauge',
      model: 'LM'
    }
  },
  {
    name: 'Pressure Gauge With Fitting',
    description: 'Complete pressure gauge with brass fitting for direct installation.',
    price: 210,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-11.jpg',
    stockQuantity: 25,
    specifications: {
      material: 'Brass',
      type: 'Complete Gauge',
      feature: 'Direct Installation'
    }
  },
  {
    name: 'Single Manifold with Gauge',
    description: 'Heavy-duty manifold with pressure gauge for HVAC and refrigeration use.',
    price: 250,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-12.jpg',
    stockQuantity: 20,
    specifications: {
      material: 'Brass',
      type: 'Manifold with Gauge',
      duty: 'Heavy-duty'
    }
  },
  {
    name: 'Water Temperature Sensor Switch',
    description: 'Reliable brass water temperature sensor switch for automotive and industrial use.',
    price: 175,
    category: 'pressure gauge parts',
    image: '/images/products/pressure-gauge-parts/pressure-gauge-13.jpg',
    stockQuantity: 40,
    specifications: {
      material: 'Brass',
      type: 'Temp Sensor Switch',
      application: 'Automotive & Industrial'
    }
  }
];

async function seedProducts() {
  try {
    const wipe = process.argv.includes('--wipe') || process.argv.includes('-w');

    if (wipe) {
      console.log('Wipe flag detected — clearing existing products and inserting fresh dataset.');
      await Product.deleteMany({});
      const createdProducts = await Product.insertMany(products);
      console.log(`Inserted ${createdProducts.length} products (wipe mode).`);

      const categories = {};
      createdProducts.forEach(product => {
        categories[product.category] = (categories[product.category] || 0) + 1;
      });

      console.log('\nProducts by category:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });

      process.exit(0);
    }

    // Default behavior: upsert each product by `name` + `category` to avoid destructive wipes
    console.log('Seeding products in upsert mode (safe). Use --wipe to replace all products.');
    const operations = products.map(p => ({
      updateOne: {
        filter: { name: p.name, category: p.category },
        update: { $set: p },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(operations, { ordered: false });

    const upserted = result.upsertedCount || 0;
    const modified = result.modifiedCount || 0;
    console.log(`Upsert complete — ${upserted} created, ${modified} modified.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
