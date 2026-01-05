import { useEffect, useState, useCallback } from 'react';
import { storesApi, callScheduleApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CallRecordingForm from './CallRecordingForm';

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
    const [selectedStore, setSelectedStore] = useState(null);
    const [callScheduleId, setCallScheduleId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchStores = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            let stores = await storesApi.getAll(callDate, user.id);
            
            // If offline or stores don't have recording status, enrich with local data
            const { isOnline, getAllCallSchedules, getCallRecordingBySchedule } = await import('../services/offlineStorage');
            if (!isOnline() || (stores.length > 0 && stores[0].has_recording === undefined)) {
                // Get call schedules from local storage
                const allSchedules = await getAllCallSchedules();
                const relevantSchedules = allSchedules.filter(
                    (s) => s.call_date === callDate && s.user_id === user.id
                );
                
                // Enrich stores with recording status
                stores = await Promise.all(
                    stores.map(async (store) => {
                        const schedule = relevantSchedules.find((s) => s.store_id === store.id);
                        if (schedule) {
                            const recording = await getCallRecordingBySchedule(schedule.id);
                            return {
                                ...store,
                                has_recording: !!recording,
                                has_post_activity: recording && !!recording.post_activity,
                                call_schedule_id: schedule.id,
                            };
                        }
                        return {
                            ...store,
                            has_recording: false,
                            has_post_activity: false,
                            call_schedule_id: null,
                        };
                    })
                );
            }
            
            setStores(stores || []);
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

    const handleStoreClick = async (store) => {
        try {
            setLoading(true);
            setError(null);
            
            // Get or create call schedule (works offline)
            const schedule = await callScheduleApi.getOrCreate(store.id, callDate, user.id);

            setCallScheduleId(schedule.id);
            setSelectedStore(store);
            setShowForm(true);
        } catch (err) {
            console.error('Failed to get call schedule', err);
            setError('Failed to open recording form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSave = () => {
        setShowForm(false);
        setSelectedStore(null);
        setCallScheduleId(null);
        // Refresh stores list to show updated indicators
        fetchStores();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedStore(null);
        setCallScheduleId(null);
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
                            <button
                                onClick={() => handleStoreClick(store)}
                                className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#1b1b18] dark:hover:text-[#EDEDEC] cursor-pointer text-left w-full flex items-center justify-between gap-3"
                            >
                                <span>{store.store_name}</span>
                                <div className="flex items-center gap-2">
                                    {store.has_recording ? (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                            title="Call recorded"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Recorded
                                        </span>
                                    ) : (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            title="Call not recorded"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            No Record
                                        </span>
                                    )}
                                    {store.has_recording && (
                                        store.has_post_activity ? (
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                                title="Post activity completed"
                                            >
                                                <svg
                                                    className="w-3 h-3"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Post Activity
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                                                title="Post activity pending"
                                            >
                                                <svg
                                                    className="w-3 h-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Pending
                                            </span>
                                        )
                                    )}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {showForm && callScheduleId && selectedStore && (
                <CallRecordingForm
                    callScheduleId={callScheduleId}
                    storeName={selectedStore.store_name}
                    onSave={handleFormSave}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
}


