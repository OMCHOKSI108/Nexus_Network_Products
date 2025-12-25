import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useNotification } from './Notification';

import authService from '../services/authService';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const loadOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders(p, 20);
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else if (res.success && Array.isArray(res)) {
        // legacy shape
        setOrders(res);
      } else {
        addToast(res.message || 'No orders found', 'info');
      }
    } catch (err) {
      console.error('Load orders error:', err);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (orderId) => {
    const otp = window.prompt('Enter the delivery OTP you received via email:');
    if (!otp) return;
    try {
      const res = await orderService.verifyOtp(orderId, otp);
      if (res.success) {
        addToast('OTP verified successfully', 'success');
        loadOrders(page);
      } else {
        addToast(res.message || 'OTP verification failed', 'error');
      }
    } catch (e) {
      console.error('OTP verify error', e);
      addToast('OTP verification failed', 'error');
    }
  };

  const handlePayNow = async (orderId) => {
    if (!window.confirm('Simulate payment now and generate receipt?')) return;
    try {
      const res = await orderService.pay(orderId, 'card');
      if (res.success) {
        addToast('Payment successful and receipt generated', 'success');
        loadOrders(page);
      } else {
        addToast(res.message || 'Payment failed', 'error');
      }
    } catch (e) {
      console.error('Payment error', e);
      addToast('Payment failed', 'error');
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      addToast('Please login to view your orders', 'error');
      navigate('/');
      return;
    }

    loadOrders(page);
  }, [page]);

  const openOrderDetails = async (orderId) => {
    try {
      setLoadingOrder(true);
      const res = await orderService.getOrder(orderId);
      if (res.success && res.order) {
        setSelectedOrder(res.order);
      } else {
        addToast(res.message || 'Failed to load order', 'error');
      }
    } catch (e) {
      console.error('Open order details error', e);
      addToast('Failed to load order details', 'error');
    } finally {
      setLoadingOrder(false);
    }
  };

  const closeOrderDetails = () => setSelectedOrder(null);

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-6 rounded shadow">You have no orders yet.</div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id || order.id} className="bg-white p-4 rounded shadow cursor-pointer" onClick={() => openOrderDetails(order._id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Order ID</div>
                    <div className="font-semibold">{order._id || order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="font-semibold">₹{order.total}</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  <div>Status: <span className="font-medium">{order.status || order.orderStatus || 'Processing'}</span></div>
                  <div className="mt-2">Items: {Array.isArray(order.items) ? order.items.length : (order.cart?.length || 0)}</div>
                  {order.orderStatus === 'out_for_delivery' && !order.otpVerified && (
                    <div className="mt-3">
                      <button onClick={() => handleVerifyOtp(order._id)} className="px-3 py-1 bg-yellow-500 text-white rounded">Enter OTP</button>
                    </div>
                  )}

                  {order.paymentStatus !== 'paid' && (
                    <div className="mt-3">
                      <button onClick={() => handlePayNow(order._id)} className="px-3 py-1 bg-green-600 text-white rounded">Pay Now (Simulate)</button>
                    </div>
                  )}

                  {order.paymentReceiptUrl && (
                    <div className="mt-3">
                      <a href={order.paymentReceiptUrl} target="_blank" rel="noreferrer" className="text-blue-600">Download Receipt</a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={closeOrderDetails} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{selectedOrder._id}</span></p>
              <p className="mt-2">Status: <span className="font-medium">{selectedOrder.orderStatus || selectedOrder.status || 'N/A'}</span></p>
              <p className="mt-2">Total: <span className="font-medium">₹{selectedOrder.total}</span></p>

              <h3 className="mt-4 font-semibold">Items</h3>
              <div className="space-y-2 mt-2">
                {Array.isArray(selectedOrder.items) && selectedOrder.items.map(it => (
                  <div key={it._id || it.product} className="flex items-center space-x-4 p-2 border rounded">
                    <img src={it.product?.image || it.productImage} alt={it.productName || it.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-medium">{it.productName}</div>
                      <div className="text-sm text-gray-500">Qty: {it.quantity} × ₹{it.price}</div>
                    </div>
                    <div className="text-right font-semibold">₹{it.subtotal}</div>
                  </div>
                ))}
              </div>

              <h3 className="mt-4 font-semibold">Shipping Address</h3>
              <div className="mt-2 text-sm text-gray-700">
                {selectedOrder.shippingAddress ? (
                  <div>
                    <div>{selectedOrder.shippingAddress.fullName}</div>
                    <div>{selectedOrder.shippingAddress.addressLine1}</div>
                    <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</div>
                    <div>{selectedOrder.shippingAddress.phone}</div>
                  </div>
                ) : <div>N/A</div>}
              </div>

              {selectedOrder.paymentReceiptUrl && (
                <div className="mt-4">
                  <a href={selectedOrder.paymentReceiptUrl} target="_blank" rel="noreferrer" className="text-blue-600">Download Receipt</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
