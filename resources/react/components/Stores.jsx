import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Stores() {
    const { user, loading: authLoading } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [callDate, setCallDate] = useState(getTodayDate());

    const fetchStores = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (callDate) {
                params.append('call_date', callDate);
            }
            params.append('user_id', user.id);
            const response = await api.get(`/stores?${params.toString()}`);
            setStores(response.data || []);
        } catch (err) {
            console.error('Failed to load stores', err);
            setError('Failed to load stores. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [callDate, user?.id]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleCallDateChange = (e) => {
        setCallDate(e.target.value);
    };

    const clearFilters = () => {
        setCallDate(getTodayDate());
    };

    if (authLoading || (loading && stores.length === 0)) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading stores...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stores</h1>
            
            {/* Filters */}
            <div className="mb-6 p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label htmlFor="call_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Visit Date
                        </label>
                        <input
                            type="date"
                            id="call_date"
                            value={callDate}
                            onChange={handleCallDateChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC] focus:border-[#1b1b18] dark:focus:border-[#EDEDEC] bg-white dark:bg-[#161615] text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                            Reset to Today
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {loading && stores.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Refreshing...</p>
                </div>
            )}

            {stores.length === 0 ? (
                <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        No stores found for the selected date.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1a1a1a] rounded-lg shadow border border-gray-200 dark:border-gray-800">
                    {stores.map((store) => (
                        <li key={store.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#161615] transition-colors">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {store.store_name}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


