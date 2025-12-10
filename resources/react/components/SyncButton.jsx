import { useState, useEffect } from 'react';
import { fullSync, getSyncStatus } from '../services/syncService';
import { isOnline } from '../services/offlineStorage';

export default function SyncButton({ onSyncComplete }) {
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState({
        pendingOperations: 0,
        localTaskCount: 0,
        isOnline: true,
    });
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);

    const loadSyncStatus = async () => {
        try {
            const status = await getSyncStatus();
            setSyncStatus(status);
        } catch (err) {
            console.error('Error loading sync status:', err);
        }
    };

    useEffect(() => {
        loadSyncStatus();
        const interval = setInterval(loadSyncStatus, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSync = async () => {
        if (!isOnline()) {
            setError('Cannot sync while offline');
            return;
        }

        setSyncing(true);
        setError(null);

        try {
            await fullSync();
            setLastSync(new Date());
            await loadSyncStatus();
            if (onSyncComplete) {
                onSyncComplete();
            }
        } catch (err) {
            setError(err.message || 'Sync failed. Please try again.');
            console.error('Sync error:', err);
        } finally {
            setSyncing(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleTimeString();
    };

    return (
        <div className="flex items-center gap-3">
            {syncStatus.pendingOperations > 0 && (
                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    {syncStatus.pendingOperations} pending
                </span>
            )}

            {lastSync && (
                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                    Last sync: {formatTime(lastSync)}
                </span>
            )}

            <button
                onClick={handleSync}
                disabled={syncing || !syncStatus.isOnline}
                className={`px-4 py-2 rounded-sm transition-colors flex items-center gap-2 ${
                    syncing || !syncStatus.isOnline
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
            >
                {syncing ? (
                    <>
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Syncing...</span>
                    </>
                ) : (
                    <>
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        <span>Sync</span>
                    </>
                )}
            </button>

            {error && (
                <div className="text-sm text-[#F53003] dark:text-[#FF4433]">
                    {error}
                </div>
            )}
        </div>
    );
}

