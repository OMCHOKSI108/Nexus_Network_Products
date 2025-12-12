import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import { useNotification } from './Notification';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Get user info when component mounts
  useEffect(() => {
    const user = authService.getCurrentUser();
    console.log('Contact: Current user data:', user); // Debug log
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const { addToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3004/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast(data.message || 'Message sent successfully!', 'success');
        // Clear form
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        addToast(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      addToast('Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-blue-700 mb-8">
          Contact Us
        </h2>
        <p className="text-center text-lg text-gray-600 mb-10">
          Get in touch with us for inquiries and support
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-semibold text-blue-700 mb-6">
              Get In Touch
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <span className="text-blue-700 mr-3">📍</span>
                <p className="text-gray-600">Shed No. C2/109, GIDC, Shanker Tekri, Jamnagar - 361 004, (Guj) India</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-700 mr-3">📞</span>
                <a href="tel:9427284945" className="text-gray-600 hover:text-blue-700">9427284945</a>
              </div>
              <div className="flex items-center">
                <span className="text-blue-700 mr-3">✉️</span>
                <a href="mailto:pambhar_k@yahoo.in" className="text-gray-600 hover:text-blue-700">pambhar_k@yahoo.in</a>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    style={{
                      backgroundColor: formData.email ? '#f8f9fa' : 'white'
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you?"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell us about your needs or questions..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-medium text-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
