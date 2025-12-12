// Authentication service for handling JWT tokens and API calls
const API_BASE_URL = 'http://localhost:3004/api/users';

class AuthService {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token; // Convert to boolean
  }

  // Get user info from token (decode JWT)
  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Basic JWT decode (for client-side only, server validation is still required)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      this.removeToken(); // Remove invalid token
      return null;
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user info
        this.setToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  // Register user
  async register(name, email, password) {
    try {
      const requestData = { 
        name: name,
        username: name, 
        email, 
        password 
      };
      
      console.log('📤 Sending registration data:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('📥 Registration response:', data);

      if (response.ok && data.success) {
        // Store token and user info
        this.setToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Optional: Call logout endpoint to blacklist token
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from localStorage
      this.removeToken();
    }
  }

  // Get user profile (protected route)
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          user: data.user
        };
      } else {
        // Token might be expired or invalid
        if (response.status === 401) {
          this.removeToken();
        }
        return {
          success: false,
          message: data.message || 'Failed to get profile'
        };
      }
    } catch (error) {
      console.error('Profile error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
