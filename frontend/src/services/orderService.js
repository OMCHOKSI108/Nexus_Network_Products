import authService from './authService';
import { API_BASE_URL } from '../config/api';

const API_ORDERS = `${API_BASE_URL}/orders`;

const orderService = {
  async getMyOrders(page = 1, limit = 10) {
    try {
      const token = authService.getToken();
      const url = `${API_ORDERS}/user?page=${page}&limit=${limit}`;
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
  ,
  async verifyOtp(orderId, otp) {
    try {
      const token = authService.getToken();
      const url = `${API_ORDERS}/${orderId}/verify-otp`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      return await resp.json();
    } catch (err) {
      return { success: false, message: err.message || 'Failed to verify OTP' };
    }
  },
  async pay(orderId, paymentMethod = 'card') {
    try {
      const token = authService.getToken();
      const url = `${API_ORDERS}/${orderId}/pay`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod })
      });
      return await resp.json();
    } catch (err) {
      return { success: false, message: err.message || 'Payment failed' };
    }
  }
  ,
  async getOrder(orderId) {
    try {
      const token = authService.getToken();
      const url = `${API_ORDERS}/${orderId}`;
      const resp = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return await resp.json();
    } catch (err) {
      return { success: false, message: err.message || 'Failed to fetch order' };
    }
  }
};

export default orderService;