import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatbotService {
  /**
   * Send a message to the chatbot
   */
  async sendMessage(message, sessionId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/chatbot/message`,
        { message, sessionId },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message'
      };
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${API_URL}/chatbot/conversation/${sessionId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get conversation'
      };
    }
  }

  /**
   * Get all conversations for authenticated user
   */
  async getConversations(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_URL}/chatbot/conversations`,
        {
          params: { page, limit },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get conversations'
      };
    }
  }

  /**
   * End a conversation
   */
  async endConversation(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.delete(
        `${API_URL}/chatbot/conversation/${sessionId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error ending conversation:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to end conversation'
      };
    }
  }

  /**
   * Submit feedback on a message
   */
  async submitFeedback(sessionId, messageIndex, rating, feedback) {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_URL}/chatbot/feedback`,
        { sessionId, messageIndex, rating, feedback },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit feedback'
      };
    }
  }

  /**
   * Chatbot cart actions
   */
  
  async addToCart(productId, quantity = 1) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_URL}/chatbot/cart/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart',
        naturalResponse: true
      };
    }
  }

  async getCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_URL}/chatbot/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get cart'
      };
    }
  }

  async removeFromCart(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(
        `${API_URL}/chatbot/cart/item/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from cart'
      };
    }
  }

  async updateCartItem(productId, quantity) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(
        `${API_URL}/chatbot/cart/item/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart'
      };
    }
  }

  async clearCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(
        `${API_URL}/chatbot/cart/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart'
      };
    }
  }
}

export default new ChatbotService();
