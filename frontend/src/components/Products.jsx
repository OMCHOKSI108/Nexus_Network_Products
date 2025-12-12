import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import cartService from '../services/cartService';
import Login from './Login';
import Signup from './Signup';
import { useNotification } from './Notification';

const Products = ({ isLoggedIn, onUpdateCartCount, showLogin, onOpenLogin, onCloseLogin, onLogin, handleSignup }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [quantityModal, setQuantityModal] = useState({ show: false, product: null, quantity: 1 });
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const location = useLocation();
  const [imageManifest, setImageManifest] = useState([]);
  // Track manifest load (could be used for skeletons later); underscore prefix to bypass lint unused rule
  const [_manifestLoaded, setManifestLoaded] = useState(false);

  const categories = [
    'All',
    'brass fitting',
    'brass insert',
    'panumatic part',
    'pressure gauge parts',
    'Air Conditioners and Refigeration Parts',
    'cable gland accessories'
  ];

  useEffect(() => {
    // Initialize selected category from query params (e.g., /products?category=pressure%20gauge%20parts)
    const params = new URLSearchParams(location.search);
    const categoryFromQuery = params.get('category');
    if (categoryFromQuery && categoryFromQuery !== filters.category) {
      setFilters(prev => ({ ...prev, category: categoryFromQuery }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const filterParams = {
          ...filters,
          category: filters.category === 'All' ? '' : filters.category,
          limit: 100 // Set high limit to show all products
        };
        
        const result = await productService.getProducts(filterParams);
        if (result.success) {
          setProducts(result.products);
        }
      } catch (error) {
        setError(error.message || 'Failed to load products');
        console.error('Load products error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  // Load local premium images manifest (static assets in public folder)
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const res = await fetch('/images/products/pressure-gauge-parts/premium/manifest.json');
        if (!res.ok) throw new Error('Failed to load image manifest');
        const data = await res.json();
        setImageManifest(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Image manifest load issue:', e.message);
      } finally {
        setManifestLoaded(true);
      }
    };
    loadManifest();
  }, []);

  // Helper: build slug for loose matching between product name and filename
  const slugify = (str = '') => str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, '-');

  // Pre-compute mapping for faster lookups
  // Previously used for slug/fuzzy matching; retained (prefixed) for future enhancements
  const _filenameIndexBySlug = useMemo(() => {
    const map = {};
    imageManifest.forEach((fname) => {
      const base = fname.replace(/\.(avif|webp|jpe?g|png)$/i, '');
      map[slugify(base)] = fname;
    });
    return map;
  }, [imageManifest]);

  const getImageForProduct = (product, idx) => {
    // Simple deterministic assignment by index for reliability
    if (!imageManifest.length) return 'https://via.placeholder.com/300x200?text=Product';
    const assigned = imageManifest[idx % imageManifest.length];
    return `/images/products/pressure-gauge-parts/premium/${encodeURIComponent(assigned)}`;
  };

  const handleImgError = (e) => {
    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
    e.currentTarget.onerror = null; // prevent infinite loop
  };

  const handleRetry = () => {
    window.location.reload(); // Simple retry by reloading the page
  };

  const { addToast } = useNotification();

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      // Open login modal instead of just showing alert
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        addToast('Please login to add items to cart', 'error');
      }
      return;
    }

    // Open quantity selection modal
    setQuantityModal({ show: true, product, quantity: 1 });
  };

  const handleQuantityConfirm = async () => {
    const { product, quantity } = quantityModal;
    
    try {
      setAddingToCart(product._id);
      const result = await cartService.addToCart(product._id, quantity);
      
      if (result.success) {
        addToast(`${quantity} × ${product.name} added to cart!`, 'success');
        if (onUpdateCartCount) {
          onUpdateCartCount();
        }
        setQuantityModal({ show: false, product: null, quantity: 1 });
      }
    } catch (error) {
      addToast(error.message || 'Failed to add item to cart', 'error');
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleQuantityCancel = () => {
    setQuantityModal({ show: false, product: null, quantity: 1 });
  };

  const handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxStock = quantityModal.product?.stockQuantity || 100;
    const newQuantity = Math.max(1, Math.min(maxStock, value));
    setQuantityModal(prev => ({ ...prev, quantity: newQuantity }));
  };

  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

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
          if (onOpenLogin) onOpenLogin();
        }}
      />
    </div>
  );

  const QuantityModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Add to Cart</h3>
          <p className="text-gray-600">{quantityModal.product?.name}</p>
          <p className="text-blue-700 font-bold text-lg">₹{quantityModal.product?.price?.toFixed(0)}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setQuantityModal(prev => ({ 
                ...prev, 
                quantity: Math.max(1, prev.quantity - 1) 
              }))}
              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600"
            >
              -
            </button>
            <input
              type="number"
              value={quantityModal.quantity}
              onChange={handleQuantityInputChange}
              min="1"
              max={quantityModal.product?.stockQuantity || 100}
              className="px-3 py-2 border border-gray-300 rounded-lg text-lg font-medium w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => setQuantityModal(prev => ({ 
                ...prev, 
                quantity: Math.min(quantityModal.product?.stockQuantity || 100, prev.quantity + 1) 
              }))}
              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600"
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            Available: {quantityModal.product?.stockQuantity || 0} units
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleQuantityCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleQuantityConfirm}
            disabled={addingToCart === quantityModal.product?._id}
            className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart === quantityModal.product?._id ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-blue-700">₹{((quantityModal.product?.price || 0) * quantityModal.quantity).toFixed(0)}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Products</h1>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/product/${product._id}`} className="block">
                  <img
                    src={getImageForProduct(product, idx)}
                    alt={product.name}
                    onError={handleImgError}
                    loading="lazy"
                    className="w-full h-48 object-cover bg-gray-100"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product._id}`} className="block">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-700">₹{product.price.toFixed(0)}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {product.inStock && product.stockQuantity > 0 ? (
                      <span className="text-green-600 text-sm font-medium">
                        ✓ In Stock ({product.stockQuantity} available)
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">
                        ✗ Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Specifications */}
                  {product.specifications && (
                    <div className="mb-3 text-sm text-gray-600">
                      {product.specifications.material && (
                        <div>Material: {product.specifications.material}</div>
                      )}
                      {product.specifications.dimensions && (
                        <div>Size: {product.specifications.dimensions}</div>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock || product.stockQuantity === 0 || addingToCart === product._id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      !product.inStock || product.stockQuantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : addingToCart === product._id
                        ? 'bg-blue-500 text-white cursor-wait'
                        : 'bg-blue-700 text-white hover:bg-blue-800'
                    }`}
                  >
                    {addingToCart === product._id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : !product.inStock || product.stockQuantity === 0 ? (
                      'Out of Stock'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      {showLogin && <LoginModal />}
      
      {/* Signup Modal */}
      {showSignup && <SignupModal />}

      {/* Quantity Modal */}
      {quantityModal.show && <QuantityModal />}
    </div>
  );
};

export default Products;
