import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Products from './components/Products';
import Contact from './components/Contact';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import authService from './services/authService';
import { NotificationProvider, useNotification } from './components/Notification';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useNotification();

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        if (authService.isAuthenticated()) {
          console.log('🔑 Token found, getting profile...');
          const profileResult = await authService.getProfile();
          if (profileResult.success) {
            setUser(profileResult.user);
            setIsLoggedIn(true);
            console.log('✅ User authenticated:', profileResult.user);
          } else {
            // Token is invalid, clear it
            console.log('❌ Invalid token, clearing...');
            authService.removeToken();
          }
        } else {
          console.log('🚫 No token found');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        // Clear any invalid tokens
        authService.removeToken();
      } finally {
        console.log('✅ Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth check timeout, forcing loading to false');
      setLoading(false);
    }, 5000);

    checkAuthStatus().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogin = async (loginData) => {
    try {
      // If this is called from our updated Login component, it will have user and token
      if (loginData.user && loginData.token) {
        setUser(loginData.user);
        setIsLoggedIn(true);
        setShowLogin(false);
        console.log("✅ User logged in successfully:", loginData.user);
        // Redirect to home page after successful login
        navigate('/');
        return;
      }

      // Legacy support for old login flow
      let result;
      
      if (loginData.username && loginData.email) {
        // This is signup data
        result = await authService.register(loginData.username, loginData.email, loginData.password || 'defaultPassword123');
      } else {
        // This is login data (from current implementation)
        // For now, we'll treat any login as successful with mock data
        // In a real app, you'd get email/password from the form
        result = {
          success: true,
          user: { email: loginData.email, username: loginData.name || loginData.email.split('@')[0] }
        };
      }

      if (result.success) {
        setUser(result.user);
        setIsLoggedIn(true);
        setShowLogin(false);
        // Redirect to home page after successful login
        navigate('/');
      } else {
        addToast(result.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast('Login failed. Please try again.', 'error');
    }
  };

  const handleSignup = async (signupData) => {
    try {
      // Handle signup success callback
      if (signupData.user && signupData.token) {
        setUser(signupData.user);
        setIsLoggedIn(true);
        setShowLogin(false);
        console.log("✅ User registered successfully:", signupData.user);
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout on frontend even if server call fails
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const openLoginModal = () => {
    setShowLogin(true);
  };

  const closeLoginModal = () => {
    setShowLogin(false);
  };

  const openCartModal = () => {
    setShowCart(true);
  };

  const closeCartModal = () => {
    setShowCart(false);
  };

  const updateCartCount = () => {
    // Trigger cart updates by incrementing a counter
    setCartUpdateTrigger(prev => prev + 1);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
      <div>
        <Navbar 
        user={user} 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout} 
        onOpenLogin={openLoginModal}
        onOpenCart={openCartModal}
        cartUpdateTrigger={cartUpdateTrigger}
      />
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                user={user} 
                isLoggedIn={isLoggedIn} 
                onLogin={handleLogin} 
                onLogout={handleLogout}
                showLogin={showLogin}
                onOpenLogin={openLoginModal}
                onCloseLogin={closeLoginModal}
                handleSignup={handleSignup}
              />
            } 
          />
          <Route path="/about" element={<About />} />
          <Route 
            path="/products" 
            element={
              <Products 
                user={user} 
                isLoggedIn={isLoggedIn} 
                onUpdateCartCount={updateCartCount}
                showLogin={showLogin}
                onOpenLogin={openLoginModal}
                onCloseLogin={closeLoginModal}
                onLogin={handleLogin}
                handleSignup={handleSignup}
              />
            } 
          />
          <Route path="/product/:id" element={<ProductDetail isLoggedIn={isLoggedIn} onUpdateCartCount={updateCartCount} />} />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                user={user} 
                isLoggedIn={isLoggedIn} 
                onUpdateCartCount={updateCartCount}
              />
            } 
          />
          <Route 
            path="/order-success" 
            element={<OrderSuccess />} 
          />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
  <Footer />
        
        {/* Cart Modal */}
        <Cart 
          isOpen={showCart}
          onClose={closeCartModal}
          user={user}
          isLoggedIn={isLoggedIn}
          cartUpdateTrigger={cartUpdateTrigger}
        />
      </div>
    
  );
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Router>
  );
}

export default App;