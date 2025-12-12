import authService from './authService';

const API_BASE_URL = 'http://localhost:3004/api/orders';

const orderService = {
  async getMyOrders(page = 1, limit = 10) {
    try {
      const token = authService.getToken();
      const url = `${API_BASE_URL}/user?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: err.message || 'Failed to load orders' };
    }
  }
};

export default orderService;