import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CallRecordingForm({ callScheduleId, storeName, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        discount: '',
        signature: '',
        post_activity: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [existingRecording, setExistingRecording] = useState(null);

    useEffect(() => {
        if (callScheduleId) {
            loadExistingRecording();
        }
    }, [callScheduleId]);

    const loadExistingRecording = async () => {
        try {
            const response = await api.get(`/call-recordings/schedule/${callScheduleId}`);
            setExistingRecording(response.data);
            setFormData({
                name: response.data.name || '',
                price: response.data.price || '',
                quantity: response.data.quantity || '',
                discount: response.data.discount || '',
                signature: response.data.signature || '',
                post_activity: response.data.post_activity || '',
            });
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error('Failed to load existing recording', err);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const data = {
                call_schedule_id: callScheduleId,
                ...formData,
            };

            let response;
            if (existingRecording) {
                response = await api.put(`/call-recordings/${existingRecording.id}`, formData);
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

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#161615] border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-medium mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                    {existingRecording ? 'Edit Call Recording' : 'Create Call Recording'}
                    {storeName && (
                        <span className="block text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                            Store: {storeName}
                        </span>
                    )}
                </h2>

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                                errors.name
                                    ? 'border-[#F53003] dark:border-[#FF4433]'
                                    : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                            } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                            placeholder="Enter name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Price *
                            </label>
                            <input
                                type="text"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                                    errors.price
                                        ? 'border-[#F53003] dark:border-[#FF4433]'
                                        : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                                } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                                placeholder="Enter price"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                                    {errors.price[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="quantity"
                                className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Quantity *
                            </label>
                            <input
                                type="text"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                                    errors.quantity
                                        ? 'border-[#F53003] dark:border-[#FF4433]'
                                        : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                                } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                                placeholder="Enter quantity"
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                                    {errors.quantity[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="discount"
                            className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Discount *
                        </label>
                        <input
                            type="text"
                            id="discount"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                                errors.discount
                                    ? 'border-[#F53003] dark:border-[#FF4433]'
                                    : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                            } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                            placeholder="Enter discount"
                        />
                        {errors.discount && (
                            <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                                {errors.discount[0]}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="signature"
                            className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Signature *
                        </label>
                        <input
                            type="text"
                            id="signature"
                            name="signature"
                            value={formData.signature}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                                errors.signature
                                    ? 'border-[#F53003] dark:border-[#FF4433]'
                                    : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                            } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                            placeholder="Enter signature"
                        />
                        {errors.signature && (
                            <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                                {errors.signature[0]}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="post_activity"
                            className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Post Activity *
                        </label>
                        <textarea
                            id="post_activity"
                            name="post_activity"
                            value={formData.post_activity}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                                errors.post_activity
                                    ? 'border-[#F53003] dark:border-[#FF4433]'
                                    : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                            } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                            placeholder="Enter post activity"
                        />
                        {errors.post_activity && (
                            <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                                {errors.post_activity[0]}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#1b1b18] dark:bg-[#eeeeec] text-white dark:text-[#1C1C1A] rounded-sm hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : existingRecording ? 'Update Recording' : 'Create Recording'}
                        </button>
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

