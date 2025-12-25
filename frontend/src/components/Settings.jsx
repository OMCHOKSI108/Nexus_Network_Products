import React, { useEffect, useState, useRef } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { useNotification } from './Notification';
import { useNavigate } from 'react-router-dom';

const OTP_TTL = 300; // seconds

const Settings = () => {
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  const [otpPayload, setOtpPayload] = useState({ otp: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const load = async () => {
      if (!authService.isAuthenticated()) {
        addToast('Please login to access settings', 'error');
        navigate('/');
        return;
      }
      setLoading(true);
      const res = await authService.getProfile();
      if (res.success) {
        setProfile(res.user);
        setForm({
          name: res.user.name || '',
          phone: res.user.phone || '',
          company: res.user.company || '',
          gstNumber: res.user.gstNumber || '',
          dob: res.user.dob ? (new Date(res.user.dob)).toISOString().slice(0,10) : '',
          secondaryPhone: res.user.secondaryPhone || '',
          socialLinks: res.user.socialLinks || {}
        });
      }
      setLoading(false);
    };
    load();
    return () => clearInterval(timerRef.current);
  }, []);

  const startResendCountdown = (seconds = OTP_TTL) => {
    setResendTimer(seconds);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOtp = async () => {
    try {
      setSendingOtp(true);
      const email = profile.email || form.email;
      const res = await userService.requestPasswordReset({ email });
      if (res.success) {
        addToast('OTP sent to your email', 'success');
        startResendCountdown();
      } else {
        addToast(res.message || 'Failed to send OTP', 'error');
      }
    } catch (e) {
      addToast('Failed to request OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyAndReset = async (e) => {
    e.preventDefault();
    if (!otpPayload.otp || !otpPayload.newPassword) return addToast('Please provide OTP and new password', 'error');
    if (otpPayload.newPassword !== otpPayload.confirmPassword) return addToast('Passwords do not match', 'error');
    try {
      const res = await userService.verifyPasswordReset({ email: profile.email, otp: otpPayload.otp, newPassword: otpPayload.newPassword });
      if (res.success) {
        addToast('Password reset successful. Please login with your new password', 'success');
        // Log out user to force re-login
        await authService.logout();
        navigate('/');
      } else {
        addToast(res.message || 'OTP verification failed', 'error');
      }
    } catch (e) {
      addToast('Failed to reset password', 'error');
    }
  };

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onOtpChange = (e) => setOtpPayload(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    const updates = {
      name: form.name,
      phone: form.phone,
      company: form.company,
      gstNumber: form.gstNumber,
      dob: form.dob,
      secondaryPhone: form.secondaryPhone,
      socialLinks: form.socialLinks
    };
    const res = await userService.updateProfile(updates);
    if (res.success) addToast('Profile saved', 'success'); else addToast(res.message || 'Failed to save', 'error');
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account & Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" value={form.name || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input name="phone" value={form.phone || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Phone (Optional)</label>
                <input name="secondaryPhone" value={form.secondaryPhone || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                <input name="company" value={form.company || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST Number (Optional)</label>
                <input name="gstNumber" value={form.gstNumber || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input type="date" name="dob" value={form.dob || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Social Links (JSON)</label>
                <textarea name="socialLinks" value={typeof form.socialLinks === 'string' ? form.socialLinks : JSON.stringify(form.socialLinks || {}, null, 2)} onChange={onChange} className="w-full border rounded px-3 py-2" rows={3} />
                <p className="text-xs text-gray-500 mt-1">Optional JSON object like {"{"}"linkedin":"https://..."{"}"}</p>
              </div>

              <button className="bg-blue-700 text-white px-4 py-2 rounded">Save Profile</button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reset Password (OTP)</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">We'll send a one-time code to your email to reset your password. The code expires in 5 minutes.</p>
              <div className="flex gap-2">
                <button onClick={requestOtp} disabled={resendTimer > 0 || sendingOtp} className="px-4 py-2 bg-yellow-500 rounded text-black">{sendingOtp ? 'Sending...' : (resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Send OTP')}</button>
              </div>

              <form onSubmit={verifyAndReset} className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">OTP</label>
                  <input name="otp" value={otpPayload.otp} onChange={onOtpChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input type="password" name="newPassword" value={otpPayload.newPassword} onChange={onOtpChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={otpPayload.confirmPassword} onChange={onOtpChange} className="w-full border rounded px-3 py-2" />
                </div>
                <button className="bg-blue-700 text-white px-4 py-2 rounded">Reset Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
