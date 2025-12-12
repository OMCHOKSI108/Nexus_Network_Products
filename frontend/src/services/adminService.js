import axios from 'axios';

const API_BASE_URL = 'http://localhost:3004/api/admin';
const AUTH_API_URL = 'http://localhost:3004/api/admin/auth';

// Get auth token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add axios response interceptor to handle token expiration globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      if (message.includes('expired') || message.includes('invalid')) {
        // Token expired, clear auth data and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Admin Authentication Service
class AdminAuthService {
  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('adminToken', token);
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  // Check if admin is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp < currentTime) {
        console.log('Token expired, removing...');
        this.removeToken();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      this.removeToken();
      return false;
    }
  }

  // Get token
  getToken() {
    return getAdminToken();
  }

  // Get current admin user
  getCurrentAdmin() {
    const adminData = localStorage.getItem('adminUser');
    return adminData ? JSON.parse(adminData) : null;
  }

  // Set admin user data
  setAdminUser(admin) {
    localStorage.setItem('adminUser', JSON.stringify(admin));
  }

  // Admin login
  async login(email, password) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email,
        password
      });

      if (response.data.success) {
        this.setToken(response.data.token);
        this.setAdminUser(response.data.admin);
        return {
          success: true,
          admin: response.data.admin,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  }

  // Admin logout
  async logout() {
    try {
      if (this.getToken()) {
        await axios.post(`${AUTH_API_URL}/logout`, {}, {
          headers: createAuthHeader()
        });
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await axios.get(`${AUTH_API_URL}/verify`, {
        headers: createAuthHeader()
      });
      
      if (response.data.success) {
        this.setAdminUser(response.data.admin);
        return true;
      } else {
        this.removeToken();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      this.removeToken();
      return false;
    }
  }

  // Get admin profile
  async getProfile() {
    try {
      const response = await axios.get(`${AUTH_API_URL}/profile`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get admin profile error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get profile' };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put(`${AUTH_API_URL}/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || { success: false, message: 'Failed to change password' };
    }
  }
}

// Admin Dashboard Service
class AdminDashboardService {
  // Get dashboard overview
  async getDashboardOverview() {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/overview`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get dashboard overview error:', error);
      
      // Handle token expiration
      if (error.response?.status === 401 && 
          (error.response?.data?.message?.includes('expired') || 
           error.response?.data?.message?.includes('invalid'))) {
        // Token expired, clear auth data and redirect to login
        adminAuthService.removeToken();
        window.location.href = '/admin/login';
        return;
      }
      
      throw error.response?.data || { success: false, message: 'Failed to get dashboard data' };
    }
  }
}

// Admin Product Service
class AdminProductService {
  // Get all products
  async getProducts(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_BASE_URL}/products?${params.toString()}`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get products' };
    }
  }

  // Add new product
  async addProduct(productData) {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });

      const response = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          ...createAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Add product error:', error);
      throw error.response?.data || { success: false, message: 'Failed to add product' };
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });

      const response = await axios.put(`${API_BASE_URL}/products/${productId}`, formData, {
        headers: {
          ...createAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error.response?.data || { success: false, message: 'Failed to update product' };
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error.response?.data || { success: false, message: 'Failed to delete product' };
    }
  }
}

// Admin Order Service
class AdminOrderService {
  // Get all orders
  async getOrders(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_BASE_URL}/orders?${params.toString()}`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get orders' };
    }
  }

  // Get single order
  async getOrder(orderId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get order error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get order details' };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, comment = '') {
    try {
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        status,
        comment
      }, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error.response?.data || { success: false, message: 'Failed to update order status' };
    }
  }
}

// Admin User Service
class AdminUserService {
  // Get all users
  async getUsers(page = 1, limit = 20, search = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (search) params.append('search', search);

      const response = await axios.get(`${API_BASE_URL}/users?${params.toString()}`, {
        headers: createAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error.response?.data || { success: false, message: 'Failed to get users' };
    }
  }
}

// Export service instances
const adminAuthService = new AdminAuthService();
const adminDashboardService = new AdminDashboardService();
const adminProductService = new AdminProductService();
const adminOrderService = new AdminOrderService();
const adminUserService = new AdminUserService();

export {
  adminAuthService,
  adminDashboardService,
  adminProductService,
  adminOrderService,
  adminUserService
};