import { useState, useEffect } from 'react';
import { callRecordingApi, productsApi } from '../services/api';
import SignatureCanvas from './SignatureCanvas';

const STEPS = {
    PRODUCT_SELECTION: 1,
    PRODUCT_PREVIEW: 2,
    SIGNATURE: 3,
    POST_ACTIVITY: 4,
};

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // If it's a storage path, prepend the storage URL
    if (imagePath.startsWith('storage/') || imagePath.startsWith('/storage/')) {
        return `/${imagePath.replace(/^\/?storage\//, 'storage/')}`;
    }
    // Otherwise, assume it's a relative path
    return `/${imagePath}`;
};

export default function CallRecordingForm({ callScheduleId, storeName, onSave, onCancel }) {
    const [step, setStep] = useState(STEPS.PRODUCT_SELECTION);
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [signature, setSignature] = useState('');
    const [postActivity, setPostActivity] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errors, setErrors] = useState({});
    const [existingRecording, setExistingRecording] = useState(null);
    const [submittedRecordingId, setSubmittedRecordingId] = useState(null);

    useEffect(() => {
        if (callScheduleId) {
            loadProducts();
            loadExistingRecording();
        }
    }, [callScheduleId]);

    const loadProducts = async () => {
        try {
            setLoadingProducts(true);
            setErrors({});
            const products = await productsApi.getAll();
            if (products && products.length > 0) {
                setProducts(products);
            } else {
                // If no products, try to get from cache
                const { getProducts } = await import('../services/offlineStorage');
                const cachedProducts = await getProducts();
                if (cachedProducts && cachedProducts.length > 0) {
                    setProducts(cachedProducts);
                } else {
                    setErrors({ general: 'No products available. Please check your connection.' });
                }
            }
        } catch (err) {
            console.error('Failed to load products', err);
            // Try to use cached products if available
            try {
                const { getProducts } = await import('../services/offlineStorage');
                const cachedProducts = await getProducts();
                if (cachedProducts && cachedProducts.length > 0) {
                    setProducts(cachedProducts);
                    // Clear error since we have cached products
                    setErrors({});
                } else {
                    setErrors({ general: 'No products available. Please check your connection.' });
                }
            } catch (cacheErr) {
                console.error('Failed to load cached products:', cacheErr);
                setErrors({ general: 'Failed to load products. Some features may be limited.' });
            }
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadExistingRecording = async () => {
        try {
            const recording = await callRecordingApi.getBySchedule(callScheduleId);
            if (!recording) {
                return;
            }
            
            setExistingRecording(recording);
            setSubmittedRecordingId(recording.id);
            
            // Decode product details / IDs
            if (recording.product_id) {
                let productData = recording.product_id;

                if (typeof productData === 'string') {
                    try {
                        productData = JSON.parse(productData);
                    } catch {
                        productData = [];
                    }
                }

                let productIds = [];
                const details = {};

                if (Array.isArray(productData) && productData.length > 0) {
                    // New format: array of objects with id, quantity, discount
                    if (typeof productData[0] === 'object' && productData[0] !== null && 'id' in productData[0]) {
                        productIds = productData.map((item) => item.id);
                        productData.forEach((item) => {
                            details[item.id] = {
                                quantity: item.quantity != null ? String(item.quantity) : '',
                                discount: item.discount != null ? String(item.discount) : '',
                            };
                        });
                    } else {
                        // Legacy format: array of product IDs only
                        productIds = productData;
                    }
                }

                setSelectedProductIds(productIds);
                setProductDetails(details);
                
                // Load product details if available
                if (recording.products) {
                    setSelectedProducts(recording.products);
                } else {
                    // Try to fetch products (will use cached if offline)
                    try {
                        const allProducts = await productsApi.getAll();
                        setSelectedProducts(allProducts.filter((p) => productIds.includes(p.id)));
                    } catch (err) {
                        console.warn('Failed to load products, using IDs only', err);
                    }
                }
            }
            
            setSignature(recording.signature || '');
            setPostActivity(recording.post_activity || '');
            
            // If post_activity exists, go to that step
            if (recording.post_activity) {
                setStep(STEPS.POST_ACTIVITY);
            }
        } catch (err) {
            console.warn('No existing recording found or error loading:', err);
        }
    };

    const handleProductToggle = (productId) => {
        setSelectedProductIds((prev) => {
            const isSelected = prev.includes(productId);
            const next = isSelected ? prev.filter((id) => id !== productId) : [...prev, productId];

            // If deselecting, remove any stored details for this product
            if (isSelected) {
                setProductDetails((prevDetails) => {
                    const { [productId]: _removed, ...rest } = prevDetails;
                    return rest;
                });
            }

            return next;
        });
    };

    const handleQuantityChange = (productId, value) => {
        setProductDetails((prev) => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                quantity: value,
            },
        }));
    };

    const handleDiscountChange = (productId, value) => {
        setProductDetails((prev) => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                discount: value,
            },
        }));
    };

    const handleNext = () => {
        if (step === STEPS.PRODUCT_SELECTION) {
            if (selectedProductIds.length === 0) {
                setErrors({ products: 'Please select at least one product' });
                return;
            }
            // Load selected product details
            const selected = products.filter((p) => selectedProductIds.includes(p.id));
            setSelectedProducts(selected);
            setStep(STEPS.PRODUCT_PREVIEW);
        } else if (step === STEPS.PRODUCT_PREVIEW) {
            setStep(STEPS.SIGNATURE);
        } else if (step === STEPS.SIGNATURE) {
            if (!signature || (typeof signature === 'string' && !signature.trim())) {
                setErrors({ signature: 'Signature is required' });
                return;
            }
            // Submit form without post_activity
            handleSubmit();
        }
        setErrors({});
    };

    const handleBack = () => {
        if (step === STEPS.PRODUCT_PREVIEW) {
            setStep(STEPS.PRODUCT_SELECTION);
        } else if (step === STEPS.SIGNATURE) {
            setStep(STEPS.PRODUCT_PREVIEW);
        } else if (step === STEPS.POST_ACTIVITY) {
            setStep(STEPS.SIGNATURE);
        }
        setErrors({});
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }
        setErrors({});
        
        if (!signature || (typeof signature === 'string' && !signature.trim())) {
            setErrors({ signature: 'Signature is required' });
            return;
        }

        setLoading(true);

        try {
            const productPayload = selectedProductIds.map((productId) => {
                const detail = productDetails[productId] || {};

                return {
                    id: productId,
                    quantity: detail.quantity ? parseInt(detail.quantity, 10) : null,
                    discount: detail.discount ? parseFloat(detail.discount) : null,
                };
            });

            const data = {
                call_schedule_id: callScheduleId,
                product_id: productPayload,
                signature: typeof signature === 'string' ? signature.trim() : signature,
            };

            let response;
            if (existingRecording) {
                response = await callRecordingApi.update(existingRecording.id, data);
            } else {
                response = await callRecordingApi.create(data);
            }

            setSubmittedRecordingId(response.id);
            setExistingRecording(response);
            
            // Move to post activity step after successful submission
            setStep(STEPS.POST_ACTIVITY);
        } catch (err) {
            console.error('Error saving recording:', err);
            
            // For offline, errors are less critical
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors || {};
                setErrors(validationErrors);
                
                if (Object.keys(validationErrors).length === 0) {
                    setErrors({ general: err.response.data.message || 'Validation failed. Please check your input.' });
                }
            } else if (err.response?.data?.message) {
                setErrors({ general: err.response.data.message });
            } else {
                // If offline, this is expected - recording is saved locally
                setErrors({ general: `Recording saved locally. Will sync when online.` });
                // Still proceed to next step
                if (existingRecording) {
                    setSubmittedRecordingId(existingRecording.id);
                } else {
                    // Get the saved recording
                    const { getCallRecordingBySchedule } = await import('../services/offlineStorage');
                    const saved = await getCallRecordingBySchedule(callScheduleId);
                    if (saved) {
                        setSubmittedRecordingId(saved.id);
                        setExistingRecording(saved);
                    }
                }
                setStep(STEPS.POST_ACTIVITY);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePostActivitySubmit = async () => {
        if (!submittedRecordingId) {
            setErrors({ general: 'Recording not found. Please try again.' });
            return;
        }

        setLoading(true);

        try {
            const response = await callRecordingApi.updatePostActivity(
                submittedRecordingId,
                postActivity.trim() || null
            );

            if (onSave) {
                onSave(response);
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                // If offline, this is expected
                setErrors({ general: 'Post activity saved locally. Will sync when online.' });
                if (onSave) {
                    // Still call onSave to close the form
                    const { getCallRecording } = await import('../services/offlineStorage');
                    const saved = await getCallRecording(submittedRecordingId);
                    if (saved) {
                        onSave(saved);
                    } else {
                        onSave(existingRecording);
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const renderProductSelection = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1F2937]">
                Step 1: Select Products
            </h3>
            
            {loadingProducts ? (
                <p className="text-sm text-[#6B7280]">Loading products...</p>
            ) : products.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No products available.</p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.map((product) => {
                        const imageUrl = getImageUrl(product.product_image);
                        return (
                            <label
                                key={product.id}
                                className="flex items-start gap-3 p-3 border border-[#E0E0E0] rounded-lg hover:border-[#6366F1] hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedProductIds.includes(product.id)}
                                    onChange={() => handleProductToggle(product.id)}
                                    className="mt-1 w-4 h-4 rounded border-[#E0E0E0] text-[#6366F1] focus:ring-2 focus:ring-[#6366F1]"
                                />
                                <div className="flex-1">
                                    <div className="flex items-start gap-3">
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt={product.product_name}
                                                className="w-16 h-16 object-cover rounded-lg border border-[#E0E0E0]"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-[#1F2937]">
                                                {product.product_name}
                                            </p>
                                            <p className="text-sm text-[#6B7280] mt-1">
                                                {product.product_description}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-sm">
                                                <span className="text-[#1F2937]">
                                                    Price: {product.product_price}
                                                </span>
                                                <span className="text-[#1F2937]">
                                                    Qty: {product.product_quantity}
                                                </span>
                                                <span className="text-[#1F2937]">
                                                    Discount: {product.product_discount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}
            
            {errors.products && (
                <p className="mt-2 text-sm text-[#EF4444]">
                    {errors.products}
                </p>
            )}
        </div>
    );

    const renderProductPreview = () => {
        return (
            <div>
                <h3 className="text-lg font-medium mb-4 text-[#1F2937]">
                    Step 2: Review Selected Products
                </h3>
                
                {selectedProducts.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">No products selected.</p>
                ) : (
                    <div className="space-y-4">
                        {selectedProducts.map((product) => {
                            const imageUrl = getImageUrl(product.product_image);
                            const detail = productDetails[product.id] || {};
                            return (
                                <div
                                    key={product.id}
                                    className="p-4 border border-[#E0E0E0] rounded-lg bg-gray-50"
                                >
                                    <div className="flex items-start gap-3">
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt={product.product_name}
                                                className="w-20 h-20 object-cover rounded-lg border border-[#E0E0E0]"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-lg text-[#1F2937]">
                                                {product.product_name}
                                            </p>
                                            <p className="text-sm text-[#6B7280] mt-1">
                                                {product.product_description}
                                            </p>
                                            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                <div>
                                                    <span className="text-[#6B7280]">Price:</span>
                                                    <span className="ml-2 font-medium text-[#1F2937]">
                                                        {product.product_price}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[#6B7280]">Quantity:</span>
                                                    <span className="ml-2 font-medium text-[#1F2937]">
                                                        {product.product_quantity}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[#6B7280]">Discount:</span>
                                                    <span className="ml-2 font-medium text-[#1F2937]">
                                                        {product.product_discount}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Per-product quantity & discount for this recording */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <label
                                                        htmlFor={`quantity-${product.id}`}
                                                        className="block text-sm font-medium mb-1 text-[#1F2937]"
                                                    >
                                                        Quantity for this visit
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id={`quantity-${product.id}`}
                                                        value={detail.quantity || ''}
                                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                        min="0"
                                                        step="1"
                                                        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                                                        placeholder="Enter quantity"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor={`discount-${product.id}`}
                                                        className="block text-sm font-medium mb-1 text-[#1F2937]"
                                                    >
                                                        Discount for this visit
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id={`discount-${product.id}`}
                                                        value={detail.discount || ''}
                                                        onChange={(e) => handleDiscountChange(product.id, e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                                                        placeholder="Enter discount"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderSignature = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1F2937]">
                Step 3: Digital Signature
            </h3>
            
            <div>
                <label className="block text-sm font-medium mb-2 text-[#1F2937]">
                    Draw your signature *
                </label>
                <SignatureCanvas
                    value={signature}
                    onChange={(dataUrl) => {
                        setSignature(dataUrl);
                        if (errors.signature) {
                            setErrors((prev) => ({ ...prev, signature: null }));
                        }
                    }}
                    error={errors.signature}
                />
            </div>
        </div>
    );

    const renderPostActivity = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1F2937]">
                Step 4: Post Activity (Optional)
            </h3>
            <p className="text-sm text-[#6B7280] mb-4">
                Recording has been saved. You can optionally add post activity notes.
            </p>
            
            <div>
                <label
                    htmlFor="post_activity"
                    className="block text-sm font-medium mb-2 text-[#1F2937]"
                >
                    Post Activity (Optional)
                </label>
                <textarea
                    id="post_activity"
                    value={postActivity}
                    onChange={(e) => {
                        setPostActivity(e.target.value);
                        if (errors.post_activity) {
                            setErrors((prev) => ({ ...prev, post_activity: null }));
                        }
                    }}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-md bg-white text-[#1F2937] ${
                        errors.post_activity
                            ? 'border-[#EF4444]'
                            : 'border-[#E0E0E0]'
                    } focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]`}
                    placeholder="Enter post activity"
                />
                {errors.post_activity && (
                    <p className="mt-1 text-sm text-[#EF4444]">
                        {errors.post_activity}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-[#1F2937]">
                            {existingRecording ? 'Edit Call Recording' : 'Create Call Recording'}
                        </h2>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <span className="material-symbols-outlined text-[#6B7280]">close</span>
                        </button>
                    </div>
                    {storeName && (
                        <p className="text-sm text-[#6B7280] mb-4">
                            Store: <span className="font-medium text-[#1F2937]">{storeName}</span>
                        </p>
                    )}
                    
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3, 4].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                        step === stepNum
                                            ? 'bg-[#6366F1] text-white'
                                            : step > stepNum
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {stepNum}
                                </div>
                                {stepNum < 4 && (
                                    <div
                                        className={`w-12 h-1 mx-1 rounded ${
                                            step > stepNum
                                                ? 'bg-green-100'
                                                : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                )}

                {step === STEPS.POST_ACTIVITY ? (
                    <div>
                        {renderPostActivity()}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={loading}
                                className="px-4 py-2 border border-[#E0E0E0] text-[#1F2937] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            <div className="flex-1" />
                            <button
                                type="button"
                                onClick={handlePostActivitySubmit}
                                disabled={loading}
                                className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Post Activity'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (onSave) {
                                        onSave(existingRecording);
                                    }
                                }}
                                disabled={loading}
                                className="px-4 py-2 border border-[#E0E0E0] text-[#6B7280] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {step === STEPS.PRODUCT_SELECTION && renderProductSelection()}
                        {step === STEPS.PRODUCT_PREVIEW && renderProductPreview()}
                        {step === STEPS.SIGNATURE && renderSignature()}

                        <div className="flex gap-3 mt-6">
                            {step > STEPS.PRODUCT_SELECTION && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="px-4 py-2 border border-[#E0E0E0] text-[#1F2937] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Back
                                </button>
                            )}
                            <div className="flex-1" />
                            {step < STEPS.SIGNATURE ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : existingRecording ? 'Update Recording' : 'Submit Recording'}
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
