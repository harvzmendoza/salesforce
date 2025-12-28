import { useState, useEffect } from 'react';
import api from '../services/api';

const STEPS = {
    PRODUCT_SELECTION: 1,
    PRODUCT_PREVIEW: 2,
    SIGNATURE: 3,
    POST_ACTIVITY: 4,
};

export default function CallRecordingForm({ callScheduleId, storeName, onSave, onCancel }) {
    const [step, setStep] = useState(STEPS.PRODUCT_SELECTION);
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [signature, setSignature] = useState('');
    const [postActivity, setPostActivity] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errors, setErrors] = useState({});
    const [existingRecording, setExistingRecording] = useState(null);

    useEffect(() => {
        if (callScheduleId) {
            loadProducts();
            loadExistingRecording();
        }
    }, [callScheduleId]);

    const loadProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await api.get('/products');
            setProducts(response.data || []);
        } catch (err) {
            console.error('Failed to load products', err);
            setErrors({ general: 'Failed to load products. Please try again.' });
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadExistingRecording = async () => {
        try {
            const response = await api.get(`/call-recordings/schedule/${callScheduleId}`);
            setExistingRecording(response.data);
            
            // Decode product IDs
            if (response.data.product_id) {
                const productIds = typeof response.data.product_id === 'string' 
                    ? JSON.parse(response.data.product_id) 
                    : response.data.product_id;
                setSelectedProductIds(productIds);
                
                // Load product details if available
                if (response.data.products) {
                    setSelectedProducts(response.data.products);
                } else {
                    // Fetch products if not included
                    const productResponse = await api.get('/products');
                    const allProducts = productResponse.data || [];
                    setSelectedProducts(allProducts.filter(p => productIds.includes(p.id)));
                }
            }
            
            setSignature(response.data.signature || '');
            setPostActivity(response.data.post_activity || '');
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error('Failed to load existing recording', err);
            }
        }
    };

    const handleProductToggle = (productId) => {
        setSelectedProductIds((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
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
            if (!signature.trim()) {
                setErrors({ signature: 'Signature is required' });
                return;
            }
            setStep(STEPS.POST_ACTIVITY);
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
        e.preventDefault();
        setErrors({});
        
        if (!postActivity.trim()) {
            setErrors({ post_activity: 'Post activity is required' });
            return;
        }

        setLoading(true);

        try {
            const data = {
                call_schedule_id: callScheduleId,
                product_id: selectedProductIds,
                signature: signature.trim(),
                post_activity: postActivity.trim(),
            };

            let response;
            if (existingRecording) {
                response = await api.put(`/call-recordings/${existingRecording.id}`, data);
            } else {
                response = await api.post('/call-recordings', data);
            }

            if (onSave) {
                onSave(response.data);
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: 'Failed to save recording. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const renderProductSelection = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                Step 1: Select Products
            </h3>
            
            {loadingProducts ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading products...</p>
            ) : products.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No products available.</p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                        <label
                            key={product.id}
                            className="flex items-start gap-3 p-3 border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm hover:border-[#19140035] dark:hover:border-[#62605b] transition-colors cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedProductIds.includes(product.id)}
                                onChange={() => handleProductToggle(product.id)}
                                className="mt-1 w-4 h-4 rounded border-[#e3e3e0] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]"
                            />
                            <div className="flex-1">
                                <div className="flex items-start gap-3">
                                    {product.product_image && (
                                        <img
                                            src={product.product_image}
                                            alt={product.product_name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {product.product_name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {product.product_description}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Price: {product.product_price}
                                            </span>
                                            <span className="text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Qty: {product.product_quantity}
                                            </span>
                                            <span className="text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Discount: {product.product_discount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            )}
            
            {errors.products && (
                <p className="mt-2 text-sm text-[#F53003] dark:text-[#FF4433]">
                    {errors.products}
                </p>
            )}
        </div>
    );

    const renderProductPreview = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                Step 2: Review Selected Products
            </h3>
            
            {selectedProducts.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No products selected.</p>
            ) : (
                <div className="space-y-4">
                    {selectedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="p-4 border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm"
                        >
                            <div className="flex items-start gap-3">
                                {product.product_image && (
                                    <img
                                        src={product.product_image}
                                        alt={product.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-lg text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {product.product_name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {product.product_description}
                                    </p>
                                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                            <span className="ml-2 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {product.product_price}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                            <span className="ml-2 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {product.product_quantity}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                            <span className="ml-2 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {product.product_discount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSignature = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                Step 3: Signature
            </h3>
            
            <div>
                <label
                    htmlFor="signature"
                    className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                >
                    Signature *
                </label>
                <textarea
                    id="signature"
                    value={signature}
                    onChange={(e) => {
                        setSignature(e.target.value);
                        if (errors.signature) {
                            setErrors((prev) => ({ ...prev, signature: null }));
                        }
                    }}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                        errors.signature
                            ? 'border-[#F53003] dark:border-[#FF4433]'
                            : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                    placeholder="Enter signature"
                />
                {errors.signature && (
                    <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                        {errors.signature}
                    </p>
                )}
            </div>
        </div>
    );

    const renderPostActivity = () => (
        <div>
            <h3 className="text-lg font-medium mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                Step 4: Post Activity
            </h3>
            
            <div>
                <label
                    htmlFor="post_activity"
                    className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                >
                    Post Activity *
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
                    className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                        errors.post_activity
                            ? 'border-[#F53003] dark:border-[#FF4433]'
                            : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                    placeholder="Enter post activity"
                />
                {errors.post_activity && (
                    <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                        {errors.post_activity}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#161615] border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]">
                        {existingRecording ? 'Edit Call Recording' : 'Create Call Recording'}
                        {storeName && (
                            <span className="block text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                Store: {storeName}
                            </span>
                        )}
                    </h2>
                    
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3, 4].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step === stepNum
                                            ? 'bg-[#1b1b18] dark:bg-[#eeeeec] text-white dark:text-[#1C1C1A]'
                                            : step > stepNum
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {stepNum}
                                </div>
                                {stepNum < 4 && (
                                    <div
                                        className={`w-12 h-1 mx-1 ${
                                            step > stepNum
                                                ? 'bg-gray-300 dark:bg-gray-600'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {step === STEPS.PRODUCT_SELECTION && renderProductSelection()}
                    {step === STEPS.PRODUCT_PREVIEW && renderProductPreview()}
                    {step === STEPS.SIGNATURE && renderSignature()}
                    {step === STEPS.POST_ACTIVITY && renderPostActivity()}

                    <div className="flex gap-3 mt-6">
                        {step > STEPS.PRODUCT_SELECTION && (
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={loading}
                                className="px-4 py-2 border border-[#19140035] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] rounded-sm hover:border-[#1915014a] dark:hover:border-[#62605b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                        )}
                        <div className="flex-1" />
                        {step < STEPS.POST_ACTIVITY ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="px-4 py-2 bg-[#1b1b18] dark:bg-[#eeeeec] text-white dark:text-[#1C1C1A] rounded-sm hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#1b1b18] dark:bg-[#eeeeec] text-white dark:text-[#1C1C1A] rounded-sm hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : existingRecording ? 'Update Recording' : 'Create Recording'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 border border-[#19140035] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] rounded-sm hover:border-[#1915014a] dark:hover:border-[#62605b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
