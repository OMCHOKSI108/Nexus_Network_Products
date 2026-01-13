import { useState, useRef } from 'react';
import authService from '../services/authService';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import ForgotPassword from './ForgotPassword';

export default function Login({ onLoginSuccess, onClose, onSwitchToSignup, open }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const emailRef = useRef(null);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMessage('');
    try {
      const result = await authService.login(form.email, form.password);
      if (result.success) {
        setMessage('Login successful');
        setForm({ email: '', password: '' });
        if (onLoginSuccess) onLoginSuccess({ user: result.user, token: result.token });
        onClose && onClose();
      } else {
        setMessage(result.message || 'Login failed');
        // focus email for quick retry
        emailRef.current?.focus();
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Error logging in');
      emailRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className="absolute inset-0 nn-modal-backdrop transition-opacity" />
      <div className="relative w-full max-w-xl mx-4 nn-card overflow-hidden transform transition-all duration-300 scale-100">
        <div className="grid grid-cols-12">
          <div className="col-span-7 p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Sign in to NexusNetwork</h3>
                <p className="text-sm text-gray-500 mt-1">Enterprise account access — Premium Brass Parts</p>
              </div>
              <div>
                <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 ml-4">×</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Login form">
              <label className="block">
                <span className="text-sm text-gray-700">Email</span>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaEnvelope /></span>
                  <input
                    ref={emailRef}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="nn-input pl-10 pr-3 py-3 w-full border rounded-lg focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Password</span>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaLock /></span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    className="nn-input pl-10 pr-12 py-3 w-full border rounded-lg focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
                <button type="submit" disabled={isLoading} className={`nn-cta text-white font-semibold px-6 py-2 rounded-md transition transform ${isLoading ? 'opacity-60 pointer-events-none' : 'hover:brightness-105'}`}>
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${message.toLowerCase().includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{message}</div>
            )}
          </div>

          <div className="col-span-5 p-8 bg-gradient-to-b from-transparent to-white/40 flex flex-col justify-center">
            <div className="text-sm text-gray-700">New to NexusNetwork?</div>

      {showForgotPassword && (
        <ForgotPassword
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      )}
            <h4 className="mt-2 text-lg font-semibold text-gray-900">Create an enterprise account</h4>
            <p className="mt-2 text-sm text-gray-500">Secure, audited access for your procurement and operations teams.</p>
            <button onClick={() => { onSwitchToSignup && onSwitchToSignup(); }} className="mt-6 border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50">Create Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
