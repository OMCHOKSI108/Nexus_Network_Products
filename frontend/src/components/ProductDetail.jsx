import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import cartService from '../services/cartService';
import { useNotification } from './Notification';

const ProductDetail = ({ isLoggedIn, onUpdateCartCount }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await productService.getProduct(id);
        if (res.success) setProduct(res.product);
        else setError(res.message || 'Failed to load product');
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Local premium images manifest for fallback gallery
  const [imageManifest, setImageManifest] = useState([]);
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const res = await fetch('/images/products/pressure-gauge-parts/premium/manifest.json');
        if (!res.ok) throw new Error('Manifest fetch failed');
        const data = await res.json();
        if (Array.isArray(data)) setImageManifest(data);
      } catch (e) {
        console.warn('ProductDetail manifest load issue:', e.message);
      }
    };
    loadManifest();
  }, []);

  const slugify = (str='') => str.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,'-');
  const filenameIndexBySlug = useMemo(() => {
    const m = {};
    imageManifest.forEach(f => {
      const base = f.replace(/\.(avif|webp|jpe?g|png)$/i,'');
      m[slugify(base)] = f;
    });
    return m;
  }, [imageManifest]);

  const chooseImage = () => {
    if (!product) return '/placeholder.png';
    if (product.image) return product.image;
    if (!imageManifest.length) return '/placeholder.png';

    const slug = slugify(product.name || '');
    if (filenameIndexBySlug[slug]) {
      return `/images/products/pressure-gauge-parts/premium/${encodeURIComponent(filenameIndexBySlug[slug])}`;
    }
    const words = slug.split('-').filter(w => w.length > 2);
    const fuzzy = imageManifest.find(f => {
      const fslug = slugify(f.replace(/\.(avif|webp|jpe?g|png)$/i,''));
      return words.every(w => fslug.includes(w));
    });
    if (fuzzy) return `/images/products/pressure-gauge-parts/premium/${encodeURIComponent(fuzzy)}`;
    // fallback random deterministic by hash
    const idx = Math.abs(slug.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % imageManifest.length;
    return `/images/products/pressure-gauge-parts/premium/${encodeURIComponent(imageManifest[idx])}`;
  };

  const { addToast } = useNotification();

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/');
    try {
      setAdding(true);
      const res = await cartService.addToCart(product._id, 1);
      if (res.success) {
        if (onUpdateCartCount) onUpdateCartCount();
        addToast('Added to cart', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    // Add to cart then redirect to checkout
    try {
      await handleAddToCart();
      navigate('/checkout');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={chooseImage()} alt={product.name} onError={(e)=>{e.currentTarget.src='https://via.placeholder.com/600x400?text=Image+Not+Found'; e.currentTarget.onerror=null;}} className="w-full object-cover rounded-md shadow bg-gray-100" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-blue-700 font-bold mb-4">₹{product.price.toFixed(0)}</p>
          <p className="mb-4 text-gray-700">{product.description}</p>

          <div className="mb-4">
            <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm mr-2">Category: {product.category}</span>
            <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm">Stock: {product.stockQuantity}</span>
          </div>

          {product.specifications && (
            <div className="mb-4 text-gray-700">
              {product.specifications.material && <div>Material: {product.specifications.material}</div>}
              {product.specifications.dimensions && <div>Size: {product.specifications.dimensions}</div>}
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={handleAddToCart} disabled={adding} className="px-6 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800">
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
