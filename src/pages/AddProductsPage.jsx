import { useState } from "react";

const AddProductPage = () => {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        isImported: false
    });

    const [variants, setVariants] = useState([{
        id: 1,
        type: '',
        actualPrice: '',
        discountPrice: '',
        quantity: '',
        skuCode: '',
        barCode: '',
        images: []
    }]);

    const [invoiceData, setInvoiceData] = useState({
        enabled: false,
        file: null
    });

    const handleProductChange = (field, value) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantImageUpload = (variantId, e) => {
        const files = Array.from(e.target.files);
        const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setVariants(prev => prev.map(variant =>
          variant.id === variantId
            ? { ...variant, images: [...variant.images, ...newItems] }
            : variant
        ));
      };
      

    const removeVariantImage = (variantId, imageIndex) => {
        setVariants(prev => prev.map(variant =>
            variant.id === variantId 
                ? { ...variant, images: variant.images.filter((_, i) => i !== imageIndex) }
                : variant
        ));
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, [field]: value } : variant
        ));
    };

    const addVariant = () => {
        const newId = Math.max(...variants.map(v => v.id)) + 1;
        setVariants(prev => [...prev, {
            id: newId,
            type: '',
            actualPrice: '',
            discountPrice: '',
            quantity: '',
            skuCode: '',
            barCode: '',
            images: []
        }]);
    };

    const removeVariant = (id) => {
        if (variants.length > 1) {
            setVariants(prev => prev.filter(variant => variant.id !== id));
        }
    };

    const handleInvoiceChange = (field, value) => {
        setInvoiceData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        // Build FormData
        const form = new FormData();
        form.append('name', product.name);
        form.append('description', product.description);
        form.append('isImported', product.isImported ? 'true' : 'false');
        form.append('brand', product.brand || 'generic');
      
        // variants -> backend expects array JSON string
        const mappedVariants = variants.map(v => ({
          name: v.type || v.form || '',
          price: v.actualPrice !== '' ? Number(v.actualPrice) : 0,
          quantity: v.quantity !== '' ? Number(v.quantity) : 0,
          sku: v.skuCode || '',
          barcode: v.barCode || ''
          // images per variant (we'll not upload variant-level images separately here; see note)
        }));
        form.append('variants', JSON.stringify(mappedVariants));
      
        // Append global images (if you want to send product-level images)
        // If you want variant-level images uploaded, you must decide a naming scheme (e.g. images_variant_<variantId>[])
        variants.forEach(variant => {
          (variant.images || []).forEach(img => {
            if (img.file) {
              // send product-level images under "images" (you can adjust to per-variant if you change backend)
              form.append('images', img.file, img.file.name);
            }
          });
        });
      
        // invoice
        if (invoiceData.enabled && invoiceData.file) {
          form.append('invoice', invoiceData.file, invoiceData.file.name);
        }
      
        try {
          const token = localStorage.getItem('token') || '';
          const response = await fetch("http://localhost:4000/api/owner/add-product", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmE2YjYxNDVjOTYxYTIwZTQ3NjhjOCIsInJvbGUiOiJvd25lciIsInVzZXJuYW1lIjoib3duZXIxIiwiaWF0IjoxNzU3NzU1NDc3LCJleHAiOjE3NTgzNjAyNzd9.j1b9yt982rbXtFsyeTWlvtnfe0Hio-AQ7dD68oYntJg'}`,
                // NOTE: do NOT set Content-Type for FormData
            },
            body: form
          });
      
          if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || 'Failed to save product');
          }
      
          const result = await response.json();
          console.log('Product saved:', result);
          alert('✅ Product added successfully!');
        } catch (error) {
          console.error('Error saving product:', error);
          alert('❌ Failed to add product. Please try again.');
        }
      };
      

    return (
        <div className="min-h-screen bg-[var(--primary_clr)]">
            <div className="container mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-[var(--primary_clr)] mb-8">
                        Add New Product
                    </h1>

                    <div className="space-y-10">
                        {/* Basic Product Information */}
                        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[var(--secondary_clr)] mb-4">
                                Product Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name <span className='text-red-500 font-bold'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => handleProductChange('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                   focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isImported"
                                        checked={product.isImported}
                                        onChange={(e) => handleProductChange('isImported', e.target.checked)}
                                        className="w-4 h-4 text-[var(--secondary_clr)] border-gray-300 rounded focus:ring-[var(--secondary_clr)]"
                                    />
                                    <label
                                        htmlFor="isImported"
                                        className="ml-2 text-sm font-medium text-gray-700"
                                    >
                                        Imported Item
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={product.description}
                                    onChange={(e) => handleProductChange('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                               focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                    placeholder="Enter product description"
                                />
                            </div>
                        </div>

                        {/* Product Variants */}
                        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-[var(--secondary_clr)]">
                                    Product Variants
                                </h2>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="bg-[var(--secondary_clr)] text-white px-4 py-2 rounded-lg 
                                               hover:bg-orange-600 transition-colors shadow-sm"
                                >
                                    + Add Variant
                                </button>
                            </div>

                            <div className="space-y-6">
                                {variants.map((variant) => (
                                    <div key={variant.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-medium text-gray-800">
                                                Variant {variant.id}
                                            </h3>
                                            {variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(variant.id)}
                                                    className="text-red-500 hover:text-[var(--secondary_clr)]"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Variant Images */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Variant Images
                                            </label>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleVariantImageUpload(variant.id, e)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                           focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                            />
                                            
                                            {variant.images.length > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex flex-wrap gap-4">
                                                        {variant.images.map((image, index) => (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={image}
                                                                    alt={`Variant ${variant.id} Image ${index + 1}`}
                                                                    className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeVariantImage(variant.id, index)}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white 
                                                                               rounded-full w-6 h-6 flex items-center justify-center 
                                                                               text-xs hover:bg-[var(--secondary_clr)]"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Variant Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {/* Unit Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.type}
                                                    onChange={(e) => handleVariantChange(variant.id, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                               focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                                    placeholder="e.g. ml, kg, pieces"
                                                />
                                            </div>

                                            {/* Actual Price */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Actual Price
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.actualPrice}
                                                    onChange={(e) => handleVariantChange(variant.id, 'actualPrice', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                               focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Discount Price */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Discount Price
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={variant.discountPrice}
                                                    onChange={(e) => handleVariantChange(variant.id, 'discountPrice', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                               focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    value={variant.quantity}
                                                    onChange={(e) => handleVariantChange(variant.id, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                               focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>

                                            {/* SKU Code */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    SKU Code
                                                </label>
                                                <div className="flex">
                                                    <input
                                                        type="text"
                                                        value={variant.skuCode}
                                                        onChange={(e) => handleVariantChange(variant.id, 'skuCode', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                                                                   focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                                        placeholder="SKU"
                                                    />
                                                </div>
                                            </div>

                                            {/* Bar Code */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bar Code
                                                </label>
                                                <div className="flex">
                                                    <input
                                                        type="text"
                                                        value={variant.barCode}
                                                        onChange={(e) => handleVariantChange(variant.id, 'barCode', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                                                                   focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                                        placeholder="Barcode"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Invoice Section */}
                        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="enableInvoice"
                                    checked={invoiceData.enabled}
                                    onChange={(e) => handleInvoiceChange('enabled', e.target.checked)}
                                    className="w-4 h-4 text-[var(--secondary_clr)] border-gray-300 rounded focus:ring-[var(--secondary_clr)]"
                                />
                                <label
                                    htmlFor="enableInvoice"
                                    className="ml-2 text-xl font-semibold text-[var(--secondary_clr)]"
                                >
                                    Upload Invoice File
                                </label>
                            </div>

                            {invoiceData.enabled && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Invoice File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.png"
                                        onChange={(e) => handleInvoiceChange('file', e.target.files[0])}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                   focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 
                                           hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="px-6 py-3 bg-[var(--primary_clr)] text-white rounded-lg 
                                           hover:bg-[var(--secondary_clr)] transition-colors font-medium shadow-md"
                            >
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;