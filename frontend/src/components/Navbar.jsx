import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import cartService from "../services/cartService";

const Navbar = ({ user, isLoggedIn, onLogout, onOpenLogin, onOpenCart, cartUpdateTrigger }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const isActiveLink = (path) => location.pathname === path;

  // Load cart count when user logs in or cart updates
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCartCount();
    } else {
      setCartCount(0);
    }
  }, [isLoggedIn, user, cartUpdateTrigger]);

  const loadCartCount = async () => {
    try {
      const result = await cartService.getCartCount();
      if (result.success) {
        setCartCount(result.count);
      }
    } catch (error) {
      console.error('Load cart count error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            {/* Your custom logo */}
            <img
              src="/icon.svg"
              alt="NexusNetwork Logo"
              className="h-16 w-32 object-contain"
              onError={(e) => {
                // Fallback to text logo if image fails to load
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback text logo (hidden by default) */}
            <div className="hidden items-center space-x-2" id="fallback-logo">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">NN</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-blue-700">NexusNetwork</h1>
              <span className="text-sm text-gray-500">Premium Brass Parts</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              <li>
                <Link 
                  to="/" 
                  className={`font-medium transition-colors ${
                    isActiveLink('/') 
                      ? 'text-blue-700 border-b-2 border-blue-700 pb-1' 
                      : 'text-gray-700 hover:text-blue-700'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className={`font-medium transition-colors ${
                    isActiveLink('/products') 
                      ? 'text-blue-700 border-b-2 border-blue-700 pb-1' 
                      : 'text-gray-700 hover:text-blue-700'
                  }`}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`font-medium transition-colors ${
                    isActiveLink('/about') 
                      ? 'text-blue-700 border-b-2 border-blue-700 pb-1' 
                      : 'text-gray-700 hover:text-blue-700'
                  }`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`font-medium transition-colors ${
                    isActiveLink('/contact') 
                      ? 'text-blue-700 border-b-2 border-blue-700 pb-1' 
                      : 'text-gray-700 hover:text-blue-700'
                  }`}
                >
                  Contact
                </Link>
              </li>
            </ul>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button 
                onClick={onOpenCart}
                className="relative p-2 text-gray-700 hover:text-blue-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.64a2 2 0 001.82 2.36h9.72a2 2 0 001.82-2.36L17 13" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-700 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* User Profile Section */}
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-700 text-sm font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        My Orders
                      </Link>
                      <Link to="/settings" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                  <div className="flex items-center space-x-3">
                  <button 
                    onClick={onOpenLogin}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="px-4 pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button onClick={onOpenCart} className="relative p-2 text-gray-700 hover:text-blue-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.64a2 2 0 001.82 2.36h9.72a2 2 0 001.82-2.36L17 13" />
                  </svg>
                </button>
                <span className="text-gray-700 font-medium">Cart</span>
              </div>
              <div>
                {/* Mobile close button */}
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
            </div>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/" 
                  className={`block px-4 py-2 font-medium transition-colors ${
                    isActiveLink('/') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className={`block px-4 py-2 font-medium transition-colors ${
                    isActiveLink('/products') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`block px-4 py-2 font-medium transition-colors ${
                    isActiveLink('/about') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`block px-4 py-2 font-medium transition-colors ${
                    isActiveLink('/contact') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
            </ul>
            {!isLoggedIn && (
              <div className="px-4 mt-4 space-y-2">
                <button 
                  onClick={onOpenLogin}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Login
                </button>
                {/* Admin access is intentionally hidden from public navigation */}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
