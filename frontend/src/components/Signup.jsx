import { useState } from 'react';
import authService from '../services/authService';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function Signup({ onSignupSuccess, onClose, onSwitchToLogin, open }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMessage('');
    try {
      const result = await authService.register(form.username, form.email, form.password);
      if (result.success) {
        setMessage('Account created successfully');
        setForm({ username: '', email: '', password: '' });
        if (onSignupSuccess) onSignupSuccess({ user: result.user, token: result.token });
        onClose && onClose();
      } else {
        setMessage(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setMessage('Error signing up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className="absolute inset-0 nn-modal-backdrop transition-opacity" />
      <div className="relative w-full max-w-xl mx-4 nn-card overflow-hidden transform transition-all duration-300 scale-100">
        <div className="grid grid-cols-12">
          <div className="col-span-5 p-8 bg-gradient-to-b from-transparent to-white/40 flex flex-col justify-center">
            <div className="text-sm text-gray-700">Welcome to NexusNetwork</div>
            <h4 className="mt-2 text-lg font-semibold text-gray-900">Create an enterprise account</h4>
            <p className="mt-2 text-sm text-gray-500">Get secure procurement access for your organization.</p>
          </div>

          <div className="col-span-7 p-8">
            {onClose && (
              <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">×</button>
            )}
            <h3 className="text-2xl font-bold text-gray-900">Create Account</h3>
            <p className="text-sm text-gray-500 mt-1">Join NexusNetwork — Premium Brass Parts</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Signup form">
              <label className="block">
                <span className="text-sm text-gray-700">Full name</span>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaUser /></span>
                  <input name="username" type="text" required value={form.username} onChange={handleChange} placeholder="Full name" className="nn-input pl-10 pr-3 py-3 w-full border rounded-lg focus:outline-none" />
                </div>
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Email</span>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaEnvelope /></span>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="name@company.com" className="nn-input pl-10 pr-3 py-3 w-full border rounded-lg focus:outline-none" />
                </div>
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Password</span>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaLock /></span>
                  <input name="password" type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={handleChange} placeholder="Create password" className="nn-input pl-10 pr-12 py-3 w-full border rounded-lg focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum 6 characters. Use a strong password.</p>
              </label>

              <div className="flex items-center justify-between">
                <div />
                <button type="submit" disabled={isLoading} className={`nn-cta text-white font-semibold px-6 py-2 rounded-md transition transform ${isLoading ? 'opacity-60 pointer-events-none' : 'hover:brightness-105'}`}>{isLoading ? 'Creating…' : 'Create Account'}</button>
              </div>
            </form>

            {message && (<div className={`mt-4 p-3 rounded-md text-sm ${message.toLowerCase().includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{message}</div>)}

          </div>
        </div>
      </div>
    </div>
  );
}
