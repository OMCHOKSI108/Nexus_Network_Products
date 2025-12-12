import authService from './authService';

const API_BASE_URL = 'http://localhost:3004/api/users';

const userService = {
  async updateProfile(updates) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/profile`, {
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
};

export default userService;