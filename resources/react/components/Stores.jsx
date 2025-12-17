import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Stores() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/stores');
                setStores(response.data || []);
            } catch (err) {
                console.error('Failed to load stores', err);
                setError('Failed to load stores. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading stores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stores</h1>
            {stores.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No stores found.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
                    {stores.map((store) => (
                        <li key={store.id} className="px-4 py-3">
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


