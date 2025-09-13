import React, { useState } from 'react';

const ManageProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [product, setProduct] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null); // for image preview modal

  // helper to read token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  };

  // normalize possible image shapes returned by backend
  // backend may return images: ["url", ...] or [{ url, filename }, ...]
  const normalizeImageArray = (arr) => {
    if (!arr) return [];
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (!item) return null;
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        if (item.url) return item.url;
        if (item.data && typeof item.data === 'string' && item.data.startsWith('http')) return item.data;
        // fallback: try common keys
        return item.filePath || item.file || item.filename || null;
      }
      return null;
    }).filter(Boolean);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return alert('Please enter product name or ID.');

    setIsFetching(true);
    setMessage('');

    try {
      const res = await fetch(
        `http://localhost:4000/api/owner/product/${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        // normalize data returned from backend into your UI shape
        const p = data.product;

        // normalize product-level images
        const prodImages = normalizeImageArray(p.images);

        setProduct({
          id: p._id,
          name: p.prodName || p.name || '',
          description: p.description || '',
          isImported: !!p.imported,
          images: prodImages,
          // convert backend variants to UI variant shape
          variants: (p.variants && p.variants.length)
            ? p.variants.map(v => ({
                id: v._id || undefined,
                type: v.name || v.form || '',
                actualPrice: v.price !== undefined ? String(v.price) : '',
                discountPrice: v.discountPrice !== undefined ? String(v.discountPrice) : '',
                quantity: v.quantity !== undefined ? String(v.quantity) : '',
                skuCode: v.sku || '',
                barCode: v.barcode || '',
                // variant images normalized
                images: normalizeImageArray(v.images)
              }))
            : [{
                type: '',
                actualPrice: '',
                discountPrice: '',
                quantity: '',
                skuCode: '',
                barCode: '',
                images: []
              }]
        });
        setMessage('✅ Product loaded successfully.');
      } else {
        setMessage(data.error || data.message || '❌ Product not found.');
        setProduct(null);
      }
    } catch (err) {
      console.error('handleSearch error', err);
      setMessage('❌ Network error.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdate = async () => {
    if (!product) return;

    setIsUpdating(true);
    setMessage('');

    try {
      // Build payload mapped to backend expected fields
      const payload = {
        // your backend expects name/prodName usually
        prodName: product.name,
        description: product.description,
        variants: (product.variants || []).map(v => ({
          name: v.type || '',
          price: v.actualPrice !== '' ? Number(v.actualPrice) : 0,
          discountPrice: v.discountPrice !== '' ? Number(v.discountPrice) : undefined,
          quantity: v.quantity !== '' ? Number(v.quantity) : 0,
          sku: v.skuCode || '',
          barcode: v.barCode || ''
          // images are not sent here; image upload requires form/multipart (not handled here)
        }))
      };

      const res = await fetch(
        `http://localhost:4000/api/owner/product/${encodeURIComponent(product.id || searchQuery)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Product updated successfully.');
        // refresh product data from server to reflect merges/auto-generated sku/barcode
        if (product.id) {
          const reload = await fetch(
            `http://localhost:4000/api/owner/product/${encodeURIComponent(product.id)}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
            }
          );
          if (reload.ok) {
            const rd = await reload.json();
            const p = rd.product;
            setProduct(prev => ({
              ...prev,
              name: p.prodName || p.name || prev.name,
              description: p.description || prev.description,
              isImported: !!p.imported,
              images: normalizeImageArray(p.images),
              variants: (p.variants && p.variants.length)
                ? p.variants.map(v => ({
                    id: v._id || undefined,
                    type: v.name || v.form || '',
                    actualPrice: v.price !== undefined ? String(v.price) : '',
                    discountPrice: v.discountPrice !== undefined ? String(v.discountPrice) : '',
                    quantity: v.quantity !== undefined ? String(v.quantity) : '',
                    skuCode: v.sku || '',
                    barCode: v.barcode || '',
                    images: normalizeImageArray(v.images)
                  }))
                : prev.variants
            }));
          }
        }
      } else {
        setMessage(data.error || data.message || '❌ Update failed.');
      }
    } catch (err) {
      console.error('handleUpdate error', err);
      setMessage('❌ Network error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setMessage('');

    try {
      const res = await fetch(
        `http://localhost:4000/api/owner/product/${encodeURIComponent(product.id || searchQuery)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Product deleted successfully.');
        setProduct(null);
        setSearchQuery('');
      } else {
        setMessage(data.error || data.message || '❌ Delete failed.');
      }
    } catch (err) {
      console.error('handleDelete error', err);
      setMessage('❌ Network error.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...product.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setProduct({ ...product, variants: updatedVariants });
  };

  // open preview modal
  const openPreview = (url) => setPreviewUrl(url);
  const closePreview = () => setPreviewUrl(null);

  return (
    <div className="min-h-screen bg-[var(--primary_clr)] text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Manage Products</h1>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto flex space-x-4 mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter Product Name or ID"
          className="flex-grow p-3 rounded border border-gray-300 text-black"
        />
        <button
          onClick={handleSearch}
          disabled={isFetching}
          className="bg-[var(--secondary_clr)] text-white px-6 rounded hover:bg-orange-700 transition"
        >
          {isFetching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {message && <p className="text-center text-green-400 mb-6">{message}</p>}

      {/* Product Form */}
      {product && (
        <div className="max-w-3xl mx-auto bg-white text-black shadow rounded p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Product Details</h2>

          {/* Product images strip */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto mb-4">
              {product.images.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openPreview(imgUrl)}
                  className="inline-block border rounded overflow-hidden"
                >
                  <img
                    src={imgUrl}
                    alt={`product-${i}`}
                    className="w-24 h-24 object-cover"
                    onError={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                  />
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            placeholder="Product Name"
            className="w-full p-3 rounded border border-gray-300"
          />

          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            placeholder="Product Description"
            className="w-full p-3 rounded border border-gray-300"
            rows="3"
          />

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={product.isImported}
              onChange={(e) => setProduct({ ...product, isImported: e.target.checked })}
              className="form-checkbox h-5 w-5 text-[#F15E18]"
            />
            <span>Imported?</span>
          </label>

          <h3 className="text-xl font-semibold mt-6">Variants</h3>
          {product.variants.map((variant, idx) => (
            <div key={idx} className="p-4 border rounded space-y-3 bg-gray-50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={variant.type}
                    onChange={(e) => handleVariantChange(idx, 'type', e.target.value)}
                    placeholder="Type"
                    className="w-full p-2 rounded border border-gray-300"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={variant.actualPrice}
                      onChange={(e) => handleVariantChange(idx, 'actualPrice', e.target.value)}
                      placeholder="Actual Price"
                      className="w-full p-2 rounded border border-gray-300"
                    />
                    <input
                      type="number"
                      value={variant.discountPrice}
                      onChange={(e) => handleVariantChange(idx, 'discountPrice', e.target.value)}
                      placeholder="Discount Price"
                      className="w-full p-2 rounded border border-gray-300"
                    />
                    <input
                      type="number"
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(idx, 'quantity', e.target.value)}
                      placeholder="Quantity"
                      className="w-full p-2 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={variant.skuCode}
                      onChange={(e) => handleVariantChange(idx, 'skuCode', e.target.value)}
                      placeholder="SKU Code"
                      className="w-full p-2 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={variant.barCode}
                      onChange={(e) => handleVariantChange(idx, 'barCode', e.target.value)}
                      placeholder="Bar Code"
                      className="w-full p-2 rounded border border-gray-300"
                    />
                  </div>
                </div>

                {/* Variant images thumbnails */}
                <div className="w-48">
                  {variant.images && variant.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {variant.images.map((vimg, vi) => (
                        <button key={vi} type="button" onClick={() => openPreview(vimg)} className="border rounded overflow-hidden">
                          <img src={vimg} alt={`var-${idx}-${vi}`} className="w-20 h-20 object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">No images</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-[var(--secondary_clr)] text-white px-6 py-2 rounded hover:bg-orange-700 transition"
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      )}

      {/* Simple image preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closePreview}>
          <div className="bg-white p-2 rounded max-w-3xl max-h-[90vh] overflow-auto" onClick={(e)=>e.stopPropagation()}>
            <button className="mb-2 px-3 py-1 bg-red-500 text-white rounded" onClick={closePreview}>Close</button>
            <img src={previewUrl} alt="preview" style={{ maxHeight: '80vh', maxWidth: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProductsPage;
