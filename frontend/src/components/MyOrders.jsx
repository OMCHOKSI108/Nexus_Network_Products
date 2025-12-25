import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useNotification } from './Notification';

import authService from '../services/authService';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
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

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      addToast('Please login to view your orders', 'error');
      navigate('/');
      return;
    }

    loadOrders(page);
  }, [page]);

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
              <div key={order._id || order.id} className="bg-white p-4 rounded shadow">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
