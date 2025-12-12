import axios from 'axios';

const API_URL = 'http://localhost:3004/api';

const productService = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get products' };
    }
  },

  // Get single product by ID
  getProduct: async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Get product error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get product' };
    }
  },

  // Seed sample products (for testing)
  seedProducts: async () => {
    try {
      const response = await axios.post(`${API_URL}/products/seed`);
      return response.data;
    } catch (error) {
      console.error('Seed products error:', error);
      throw error.response?.data || { success: false, message: 'Failed to seed products' };
    }
  }
};

export default productService;
