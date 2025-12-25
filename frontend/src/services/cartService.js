import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error);
      throw error.response?.data || { success: false, message: 'Failed to get cart' };
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        productId,
        quantity
      }, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error);
      throw error.response?.data || { success: false, message: 'Failed to add item to cart' };
    }
  },

  // Update item quantity in cart
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await axios.put(`${API_URL}/cart/update`, {
        productId,
        quantity
      }, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Update cart error:', error);
      throw error.response?.data || { success: false, message: 'Failed to update cart item' };
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error.response?.data || { success: false, message: 'Failed to remove item from cart' };
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await axios.delete(`${API_URL}/cart/clear`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error.response?.data || { success: false, message: 'Failed to clear cart' };
    }
  },

  // Get cart item count (for navbar badge)
  getCartCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/count`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get cart count error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get cart count' };
    }
  }
};

export default cartService;
