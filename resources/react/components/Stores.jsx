import { useEffect, useState, useCallback } from 'react';
import { storesApi, callScheduleApi, callRecordingApi } from '../services/api';
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

    const handleEditRecording = async (store) => {
        await handleStoreClick(store);
    };

    const handleDeleteRecording = async (store, e) => {
        e.stopPropagation();
        
        if (!window.confirm(`Are you sure you want to delete the recording for ${store.store_name}?`)) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            if (store.call_schedule_id) {
                const recording = await callRecordingApi.getBySchedule(store.call_schedule_id);
                if (recording) {
                    await callRecordingApi.delete(recording.id);
                    // Refresh stores list
                    await fetchStores();
                }
            }
        } catch (err) {
            console.error('Failed to delete recording', err);
            setError('Failed to delete recording. Please try again.');
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
                <p className="text-sm text-[#6B7280]">Loading stores...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
            <header className="mb-6 lg:mb-8 mt-4 lg:mt-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F2937]">Stores</h1>
            </header>
            
            <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-4 sm:p-6 md:p-8">
                {/* Filters */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label htmlFor="call_date" className="block text-sm font-medium text-[#1F2937] mb-1">
                                Visit Date
                            </label>
                            <input
                                type="date"
                                id="call_date"
                                value={callDate}
                                onChange={handleCallDateChange}
                                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white text-[#1F2937]"
                            />
                        </div>
                        <div>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium text-[#6B7280] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Reset to Today
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {loading && stores.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-[#6B7280]">Refreshing...</p>
                    </div>
                )}

                {stores.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-[#E0E0E0]">
                        <p className="text-sm text-[#6B7280]">
                            No stores found for the selected date.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-[#E0E0E0] bg-white rounded-lg border border-[#E0E0E0] overflow-hidden">
                        {stores.map((store) => (
                            <li key={store.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-[#1F2937] mb-2">
                                            {store.store_name}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {store.has_recording ? (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                                                    title="Call recorded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    Recorded
                                                </span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                                                    title="Call not recorded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                                    No Record
                                                </span>
                                            )}
                                            {store.has_recording && (
                                                store.has_post_activity ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                                        title="Post activity completed"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">task_alt</span>
                                                        Post Activity
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                                                        title="Post activity pending"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                                        Pending
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {store.has_recording ? (
                                            <>
                                                <button
                                                    onClick={() => handleEditRecording(store)}
                                                    className="p-2 text-[#6366F1] hover:bg-[#6366F1]/10 rounded-md transition-colors"
                                                    title="Edit recording"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleStoreClick(store)}
                                                className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-base">add</span>
                                                Create Recording
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

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


