import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import authService from '../services/authService';
import { useNotification } from './Notification';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    orderNotes: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { addToast } = useNotification();

  useEffect(() => {
    const loadCartAndUserData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          addToast('Please login to proceed with checkout', 'error');
          navigate('/');
          return;
        }

        // Get user profile
        const userProfile = await authService.getProfile();
        if (userProfile.success) {
          setOrderForm(prev => ({
            ...prev,
            fullName: userProfile.user.username || '',
            email: userProfile.user.email || ''
          }));
        }

        // Load cart items
        const cart = await cartService.getCart();
        if (cart.success && cart.cart.items.length > 0) {
          setCartItems(cart.cart.items);
          calculateTotal(cart.cart.items);
        } else {
          addToast('Your cart is empty', 'error');
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        addToast('Error loading checkout data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCartAndUserData();
  }, [navigate, addToast]);

  const calculateTotal = (items) => {
    // Prefer server-provided subtotal if available; fallback to price * quantity
    const total = items.reduce((sum, item) => {
      const line = typeof item.subtotal === 'number'
        ? item.subtotal
        : ((item.productPrice || item.productId?.price || 0) * item.quantity);
      return sum + line;
    }, 0);
    setCartTotal(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!orderForm.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!orderForm.email.trim()) newErrors.email = 'Email is required';
    if (!orderForm.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!orderForm.address.trim()) newErrors.address = 'Address is required';
    if (!orderForm.city.trim()) newErrors.city = 'City is required';
    if (!orderForm.state.trim()) newErrors.state = 'State is required';
    if (!orderForm.pincode.trim()) newErrors.pincode = 'Pincode is required';

    // Phone validation
    if (orderForm.phone && !/^[0-9]{10}$/.test(orderForm.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Email validation
    if (orderForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Pincode validation
    if (orderForm.pincode && !/^[0-9]{6}$/.test(orderForm.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Re-validate cart right before placing the order
      const latestCart = await cartService.getCart();
      if (!latestCart.success || !latestCart.cart || latestCart.cart.items.length === 0) {
        addToast('Your cart is empty. Please add items before placing the order.', 'error');
        navigate('/');
        return;
      }
      // Sync local state with latest cart just in case
      setCartItems(latestCart.cart.items);
      calculateTotal(latestCart.cart.items);

      // Create order data
      const orderData = {
        items: (latestCart.cart.items || cartItems).map(item => ({
          product: item.productId?._id || item.productId, // ObjectId
          productName: item.productName || item.productId?.name,
          productImage: item.productImage || item.productId?.image || '',
          price: item.productPrice || item.productId?.price,
          quantity: item.quantity,
          subtotal: item.subtotal || ((item.productPrice || item.productId?.price || 0) * item.quantity)
        })),
        shippingAddress: {
          fullName: orderForm.fullName,
          address: orderForm.address,
          city: orderForm.city,
          state: orderForm.state,
          postalCode: orderForm.pincode,
          country: 'India',
          phone: orderForm.phone
        },
        paymentMethod: 'cod',
        notes: orderForm.orderNotes || ''
      };

      // Place order via API
      const response = await fetch('http://localhost:3004/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('🧾 Order create response:', result);

  if (response.ok && result.success) {
        // Clear cart after successful order
        await cartService.clearCart();
        
        // Redirect to success page or show success message
        const orderId = result.order?._id;
        const orderNumber = result.order?.orderNumber;
  addToast(`Order placed successfully! ${orderNumber ? `Order No: ${orderNumber}` : ''}`, 'success');
        navigate('/order-success', { 
          state: { 
            orderId,
            orderNumber,
            order: result.order 
          } 
        });
      } else {
        const serverMsg = [result.message, result.error].filter(Boolean).join(' - ');
        addToast(serverMsg || 'Failed to create order', 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      addToast('Error placing order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
            
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={orderForm.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={orderForm.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={orderForm.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your complete address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={orderForm.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={orderForm.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={orderForm.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Pincode"
                    maxLength="6"
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="orderNotes"
                  value={orderForm.orderNotes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special instructions or notes for your order"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    checked={true}
                    readOnly
                    className="mr-2"
                  />
                  <label htmlFor="cod" className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    Cash on Delivery (COD)
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Pay when your order is delivered to your doorstep.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => {
                const pid = item.productId?._id || item.productId;
                const name = item.productName || item.productId?.name || 'Product';
                const price = item.productPrice || item.productId?.price || 0;
                const image = item.productImage || item.productId?.image || '';
                const lineTotal = item.subtotal || (price * item.quantity);
                return (
                  <div key={pid} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                      {image ? (
                        <img 
                          src={`http://localhost:3004${image}`} 
                          alt={name}
                          className="w-14 h-14 object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-2xl text-gray-400">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-600">₹{price} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{lineTotal}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className={`w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                submitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Placing Order...
                </span>
              ) : (
                'Place Order'
              )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>🔒 Your order is secure and protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;