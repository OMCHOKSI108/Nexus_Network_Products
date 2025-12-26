import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import { UPLOADS_BASE } from '../config/api';
import cartService from '../services/cartService';
import { useNotification } from './Notification';

const ProductDetail = ({ isLoggedIn, onUpdateCartCount }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [productQty, setQty] = useState(1);

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
        const res = await fetch('/products/manifest.json');
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
    if (product.image) {
      const img = product.image;
      if (/^https?:\/\//i.test(img)) return img;
      const base = UPLOADS_BASE.replace(/\/+$/,'');
      if (img.startsWith('/')) return `${base}${img}`;
      return `${base}/${img.replace(/^\/+/, '')}`;
    }
    if (!imageManifest.length) return '/placeholder.png';

    const slug = slugify(product.name || '');
    if (filenameIndexBySlug[slug]) {
      return `/products/${encodeURIComponent(filenameIndexBySlug[slug])}`;
    }
    const words = slug.split('-').filter(w => w.length > 2);
    const fuzzy = imageManifest.find(f => {
      const fslug = slugify(f.replace(/\.(avif|webp|jpe?g|png)$/i,''));
      return words.every(w => fslug.includes(w));
    });
    if (fuzzy) return `/products/${encodeURIComponent(fuzzy)}`;
    // fallback random deterministic by hash
    const idx = Math.abs(slug.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % imageManifest.length;
    return `/products/${encodeURIComponent(imageManifest[idx])}`;
  };

  const { addToast } = useNotification();

  const handleAddToCart = async (p = product, qty = productQty) => {
    if (!isLoggedIn) return navigate('/');
    try {
      setAdding(true);
      const res = await cartService.addToCart(p._id, qty);
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

  const handleBuyNow = async (p = product, qty = productQty) => {
    try {
      await handleAddToCart(p, qty);
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
          <img src={chooseImage()} alt={product.name} onError={(e)=>{e.currentTarget.src='https://via.placeholder.com/600x400?text=Image+Not+Found'; e.currentTarget.onerror=null;}} className="w-full object-cover rounded-md shadow bg-gray-100 max-h-96" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl md:text-2xl text-blue-700 font-bold mb-2">₹{product.price.toFixed(0)}</p>
          {product.deliveryInfo && (
            <div className="text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h13v10H3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 11h4l-1.5 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>Delivery: {product.deliveryInfo.deliveryTime || '2-4 business days'}</span></div>
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10H3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{product.deliveryInfo.codAvailable ? 'Cash on Delivery available' : 'Prepaid only'}</span></div>
              {product.deliveryInfo.returnPolicy && <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 11a8 8 0 10-2.5 5.5L21 21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{product.deliveryInfo.returnPolicy}</span></div>}
            </div>
          )}
          <p className="mb-4 text-gray-700">{product.description}</p>

          {/* SKU */}
          {product.sku && (
            <div className="mb-3 text-sm text-gray-700">SKU: <span className="font-medium">{product.sku}</span></div>
          )}

          <div className="mb-4">
            <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm mr-2">Category: {product.category}</span>
            {/* Stock status badge */}
            {(() => {
              const status = product.stockStatus || (product.inStock ? 'in_stock' : 'out_of_stock');
              if (status === 'in_stock') return <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded text-sm"><svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="6" strokeWidth="1.5"/></svg>In Stock (Ships in 24 hrs)</span>;
              if (status === 'limited') return <span className="inline-flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded text-sm"><svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="6" strokeWidth="1.5"/></svg>Limited Stock</span>;
              return <span className="inline-flex items-center bg-red-50 text-red-700 px-3 py-1 rounded text-sm"><svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="6" strokeWidth="1.5"/></svg>Out of Stock</span>;
            })()}
          </div>

          {/* Quantity selector */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center">
              <button className="w-9 h-9 bg-gray-200 rounded-l flex items-center justify-center" onClick={() => setQty(q => Math.max(1, q-1))}>-</button>
              <input type="number" value={productQty} onChange={(e)=>setQty(Math.max(1, parseInt(e.target.value)||1))} className="w-16 text-center border-t border-b border-gray-200" />
              <button className="w-9 h-9 bg-gray-200 rounded-r flex items-center justify-center" onClick={() => setQty(q => Math.min(product.stockQuantity || 9999, q+1))}>+</button>
            </div>
            <div className="text-sm text-gray-500">Available: {product.stockQuantity || 0}</div>
          </div>

          {/* Specifications table */}
          {product.specifications && Object.keys(product.specifications || {}).length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <tbody>
                    {Array.from(Object.entries(product.specifications)).map(([k, v]) => (
                      <tr key={k} className="border-t">
                        <td className="px-3 py-2 font-medium bg-gray-50 whitespace-nowrap">{k}</td>
                        <td className="px-3 py-2">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="mb-4">
              {product.certifications.map((c,i)=>(<span key={i} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 mr-2 rounded text-xs">{c}</span>))}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button onClick={() => handleAddToCart(product, productQty)} disabled={adding} className="w-full md:w-auto px-6 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800">
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={() => handleBuyNow(product, productQty)} className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">Buy Now</button>
            <button onClick={() => { /* request quote modal placeholder */ }} className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-800 rounded-md">Request a Quote</button>
          </div>
        </div>
      </div>
      {/* Lower content: related, applications, FAQs, bulk pricing, datasheet */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Related / Similar products */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">You may also need</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(product.relatedProducts && product.relatedProducts.length > 0) ? (
                product.relatedProducts.slice(0,4).map((rpId) => (
                  <Link key={rpId} to={`/product/${rpId}`} className="block bg-white p-2 rounded border text-sm text-center">View</Link>
                ))
              ) : (
                // Fallback: show links by category (simple)
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="block bg-white p-2 rounded border text-sm">See similar products</Link>
              )}
            </div>
          </div>

          {/* Usage / Applications */}
          {product.usageAreas && product.usageAreas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Usage / Applications</h3>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {product.usageAreas.map((u,i)=>(<li key={i}>{u}</li>))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {product.faqs && product.faqs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">FAQ</h3>
              <div className="space-y-3 text-sm">
                {product.faqs.map((f,i)=> (
                  <div key={i}>
                    <div className="font-medium">Q: {f.question}</div>
                    <div className="text-gray-700">A: {f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Datasheet & Bulk Pricing */}
          {product.datasheetUrl && (
            <div className="mb-4">
              <a href={product.datasheetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-100 rounded text-sm"><svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeWidth="1.2"/></svg>Download Technical Datasheet</a>
            </div>
          )}

          {product.bulkPricing && product.bulkPricing.length > 0 && (
            <div className="mb-4 border p-3 rounded">
              <h4 className="font-semibold mb-2">Bulk pricing</h4>
              <table className="w-full text-sm">
                <tbody>
                  {product.bulkPricing.map((b, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{b.minQty}–{b.maxQty} pcs</td>
                      <td className="py-1 font-medium text-right">₹{b.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Trust & policy links */}
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 17v-4" strokeWidth="1.5"/><rect x="3" y="7" width="18" height="10" rx="2" strokeWidth="1.2"/></svg><span>Secure checkout</span></div>
            <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18v10H3z" strokeWidth="1.2"/></svg><span>GST invoice available</span></div>
            <div className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11a8 8 0 10-2.5 5.5L21 21" strokeWidth="1.2"/></svg><span>Return policy: {product.deliveryInfo?.returnPolicy || '7-day replacement'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
