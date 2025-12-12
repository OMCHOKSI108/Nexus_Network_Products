import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { useNotification } from './Notification';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const { addToast } = useNotification();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await authService.getProfile();
      if (res.success) {
        setUser(res.user);
        setForm({
          name: res.user.name || res.user.username || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
          address: res.user.address || ''
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    const res = await userService.updateProfile(form);
    if (res.success) {
      addToast('Profile updated successfully', 'success');
    } else {
      addToast(res.message || 'Failed to update profile', 'error');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={onChange} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            <button className="bg-blue-700 text-white px-4 py-2 rounded">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;