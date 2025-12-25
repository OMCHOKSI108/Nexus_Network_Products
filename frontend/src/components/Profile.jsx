import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import { useNotification } from './Notification';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', addressLine1: '', city: '', state: '', pincode: '', company: '', gstNumber: '', secondaryPhone: '', socialLinks: '{}' });
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (!authService.isAuthenticated()) {
        addToast('Please login to view your profile', 'error');
        navigate('/');
        return;
      }
      const res = await authService.getProfile();
      if (res.success) {
        setUser(res.user);
        setForm({
          name: res.user.name || res.user.username || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
          addressLine1: res.user.address?.addressLine1 || res.user.address?.address || '',
          city: res.user.address?.city || '',
          state: res.user.address?.state || '',
          pincode: res.user.address?.postalCode || res.user.address?.pincode || '',
          company: res.user.company || '',
          gstNumber: res.user.gstNumber || '',
          secondaryPhone: res.user.secondaryPhone || '',
          socialLinks: JSON.stringify(res.user.socialLinks || {}, null, 2)
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    addToast('Uploading image...', 'info');
    const res = await userService.uploadProfileImage(file);
    if (res.success) {
      addToast('Profile image uploaded', 'success');
      setForm(prev => ({ ...prev, profileImage: res.profileImage }));
      setUser(prev => ({ ...prev, profileImage: res.profileImage }));
    } else {
      addToast(res.message || 'Upload failed', 'error');
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    // Build address object
    let social = {};
    try { social = JSON.parse(form.socialLinks || '{}'); } catch (e) { /* ignore */ }
    const updates = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        postalCode: form.pincode
      },
      company: form.company,
      gstNumber: form.gstNumber,
      secondaryPhone: form.secondaryPhone,
      socialLinks: social
    };
    const res = await userService.updateProfile(updates);
    if (res.success) {
      addToast('Profile updated successfully', 'success');
      // Emit event so App can update its user state without full reload
      try {
        const updatedUser = res.user || (await authService.getProfile()).user;
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));
      } catch (e) {
        window.location.reload();
      }
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
              <label className="block text-sm font-medium mb-1">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {form.profileImage || user?.profileImage ? (
                    <img src={form.profileImage || user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500">No image</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={onFileChange} />
              </div>
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input name="addressLine1" value={form.addressLine1} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input name="city" value={form.city} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input name="state" value={form.state} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                <input name="pincode" value={form.pincode} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input name="company" value={form.company} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <input name="gstNumber" value={form.gstNumber} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Secondary Phone</label>
              <input name="secondaryPhone" value={form.secondaryPhone} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Social Links (JSON)</label>
              <textarea name="socialLinks" value={form.socialLinks} onChange={onChange} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            <button className="bg-blue-700 text-white px-4 py-2 rounded">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;