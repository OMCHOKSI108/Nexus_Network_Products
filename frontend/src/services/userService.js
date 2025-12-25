import authService from './authService';
import { API_BASE_URL } from '../config/api';

const API_USERS = `${API_BASE_URL}/users`;

const userService = {
  async updateProfile(updates) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_USERS}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  }
  ,
  async uploadProfileImage(file) {
    try {
      const token = authService.getToken();
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_USERS}/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message || 'Upload failed' };
    }
  }
};

export default userService;