import { useEffect, useRef } from 'react';
import { fullSync } from '../services/syncService';
import { isOnline } from '../services/offlineStorage';

/**
 * AutoSync component - automatically syncs data when online
 * Runs in the background without user interaction
 */
export default function AutoSync() {
    const syncIntervalRef = useRef(null);
    const isSyncingRef = useRef(false);

    const performSync = async () => {
        // Prevent multiple simultaneous syncs
        if (isSyncingRef.current || !isOnline()) {
            return;
        }

        try {
            isSyncingRef.current = true;
            await fullSync();
        } catch (error) {
            // Silently handle errors - sync will retry on next interval
            console.warn('Auto-sync failed:', error);
        } finally {
            isSyncingRef.current = false;
        }
    };

    useEffect(() => {
        // Initial sync when component mounts (if online)
        if (isOnline()) {
            // Delay initial sync slightly to avoid blocking initial render
            const initialSyncTimer = setTimeout(() => {
                performSync();
            }, 2000);
            return () => clearTimeout(initialSyncTimer);
        }
    }, []);

    useEffect(() => {
        // Listen for online/offline events
        const handleOnline = () => {
            // When coming back online, sync immediately
            performSync();
        };

        const handleOffline = () => {
            // Clear sync interval when going offline
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set up periodic sync when online (every 30 seconds)
        if (isOnline()) {
            syncIntervalRef.current = setInterval(() => {
                performSync();
            }, 30000); // Sync every 30 seconds
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, []);

    // This component doesn't render anything
    return null;
}

