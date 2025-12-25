import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

const Home = ({ isLoggedIn, onLogin, showLogin, onOpenLogin, onCloseLogin, handleSignup }) => {
  const [showSignup, setShowSignup] = useState(false);
  // Removed dynamic category preview; cartItems/productsByCategory/loading no longer used
  const navigate = useNavigate();

  // Featured categories provided by user (exact display + image mapping)
  const featuredCategoryFiles = [
    { name: 'pressure gauge parts', file: 'presaure gauge parts.jpg' }, // note: source file has misspelling
    { name: 'cable gland accessories', file: 'cable and accessories.jpg' },
    { name: 'panumatic part', file: 'panumatic parts.jpg' },
    { name: 'Air Conditioners and Refigeration Parts', file: 'air conditioner and refrigerator.jpg' },
    { name: 'brass insert', file: 'Brass insert.webp' },
    { name: 'brass fitting', file: 'Brass fitting.webp' }
  ];

  const imageBasePath = '/images/products/pressure-gauge-parts/premium';

  // Removed dynamic category fetch effect

  const handleShopNow = () => {
    if (isLoggedIn) {
      // If user is already logged in, go directly to products
      navigate('/products');
    } else {
      // If user is not logged in, show login modal
      onOpenLogin();
    }
  };

  // handleLogout kept previously for header integration; not used here after cleanup

  // addToCart removed with dynamic previews

  // Modal wrapper components
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Login 
        onLoginSuccess={onLogin} 
        onClose={onCloseLogin}
        onSwitchToSignup={() => {
          onCloseLogin();
          setShowSignup(true);
        }}
        open={showLogin}
      />
    </div>
  );

  const SignupModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Signup 
        onSignupSuccess={handleSignup} 
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          onOpenLogin();
        }}
        open={showSignup}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-5xl font-bold mb-6 leading-tight">
                    Premium Brass Parts for Every Industry
                  </h1>
                  <p className="text-xl mb-8 text-blue-100">
                    Manufacturing excellence since decades. Discover our comprehensive range of 
                    high-quality brass components designed for durability and precision.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleShopNow}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                    >
                      Shop Now
                    </button>
                    <button className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                      View Catalog
                    </button>
                  </div>
                </div>
                <div className="flex justify-center relative">
                  <div className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-sm">
                    <img 
                      src="/images/products/pressure-gauge-parts/premium/Brass%20parts%20and%20fitting.jpg" 
                      alt="Premium Brass Parts and Fittings" 
                      className="rounded-xl shadow-2xl w-full h-auto max-w-md object-cover"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.target.src = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop&crop=center";
                      }}
                    />

                    {/* Right-side brand logo placed in the blank area - visible on md+ screens */}
                    {/* <img
                      src="/img0.png"
                      alt="NexusNetwork logo"
                      className="hidden md:block absolute top-6 right-8 w-28 h-28 md:w-36 md:h-36 object-contain bg-white p-2 rounded shadow"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    /> */}

                    {/* Right-side Brand Logo — transparent background, slightly larger, blends with hero */}
                  </div>

                  {/* Right-side Brand Logo — positioned relative to the hero column */}
                  <img
                    src={import.meta.env.BASE_URL + 'img0.png'}
                    alt="NexusNetwork Logo"
                    className={
                      "hidden md:block absolute right-50 -translate-y-1/2 w-94 h-94 object-contain drop-shadow-xl"
                    }
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />

                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose NexusNetwork?</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  With decades of experience in brass manufacturing, we deliver unmatched quality and precision
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Quality Assured</h3>
                  <p className="text-gray-600">Every product undergoes rigorous quality testing to ensure premium standards</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
                  <p className="text-gray-600">Quick turnaround times with reliable shipping across the globe</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Custom Solutions</h3>
                  <p className="text-gray-600">Tailored brass components designed to meet your specific requirements</p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Categories Section (Static images user requested) */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Browse by Category</h2>
                <p className="text-gray-600 text-lg">Tap a category image to jump directly to its products</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredCategoryFiles.map(cat => (
                  <div
                    key={cat.name}
                    className="group relative rounded-xl overflow-hidden shadow hover:shadow-lg cursor-pointer bg-white border"
                    onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                  >
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={`${imageBasePath}/${encodeURIComponent(cat.file)}`}
                        alt={cat.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x250?text=Image'; e.currentTarget.onerror = null; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-semibold tracking-wide drop-shadow">{cat.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/** Removed: Popular Categories (Sample Products) grid **/}

          {/* CTA Section */}
          <section className="py-16 bg-blue-700 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust NexusNetwork for their brass component needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={onOpenLogin}
                  className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  Get Started Today
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 rounded-lg font-bold transition-colors">
                  Request Quote
                </button>
              </div>
            </div>
          </section>

          {/* Login Modal */}
          {showLogin && <LoginModal />}
          {/* Signup Modal */}
          {showSignup && <SignupModal />}
    </div>
  );
};
export default Home;

