const axios = require('axios');

const testProducts = [
  {
    name: 'Brass Elbow Fitting 90°',
    description: 'High-quality brass elbow fitting for 90-degree pipe connections.',
    price: 35.99,
    category: 'brass fitting',
    image: '/images/products/brass-fitting/brass-fitting-1.jpg',
    stockQuantity: 100,
    specifications: {
      material: 'Brass',
      dimensions: '1/2 inch',
      weight: '150g',
      finish: 'Natural Brass'
    }
  },
  {
    name: 'Threaded Brass Insert M6',
    description: 'Precision-manufactured brass insert for wood and plastic applications.',
    price: 15.99,
    category: 'brass insert',
    image: '/images/products/brass-insert/brass-insert-1.jpg',
    stockQuantity: 200,
    specifications: {
      material: 'Brass',
      dimensions: 'M6 x 1.0',
      weight: '8g',
      finish: 'Natural Brass'
    }
  }
];

async function addProducts() {
  try {
    for (const product of testProducts) {
      const response = await axios.post('http://localhost:5000/api/products', product);
      console.log('✅ Product created:', response.data.product.name);
    }
    console.log('All test products created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

addProducts();
