/**
 * Sync Service
 * Handles synchronization between local storage and server
 */

import api from './api';
import {
    getTasks,
    saveTasks,
    saveTask,
    deleteTask,
    getSyncQueue,
    removeFromSyncQueue,
    clearSyncQueue,
    isOnline,
} from './offlineStorage';

/**
 * Sync pending changes to server
 */
export const syncToServer = async () => {
    if (!isOnline()) {
        throw new Error('Cannot sync: device is offline');
    }

    const queue = await getSyncQueue();
    const results = {
        success: [],
        failed: [],
    };

    for (const item of queue) {
        try {
            let result;

            switch (item.type) {
                case 'create':
                    // Create on server directly (bypass taskApi to avoid queuing)
                    const createData = { ...item.data };
                    // Remove temp ID and local-only fields
                    if (createData.id && createData.id.toString().startsWith('temp_')) {
                        delete createData.id;
                    }
                    delete createData.created_at;
                    delete createData.updated_at;
                    
                    const createResponse = await api.post('/tasks', createData);
                    result = createResponse.data;
                    
                    // If local task had temp ID, delete it and save with real ID
                    if (item.data.id && item.data.id.toString().startsWith('temp_')) {
                        await deleteTask(item.data.id);
                    }
                    await saveTask(result); // Update local with server response
                    break;

                case 'update':
                    // Handle temp IDs - if taskId is temp, it means it was created offline
                    // and hasn't been synced yet, so we need to create it first
                    if (item.taskId && item.taskId.toString().startsWith('temp_')) {
                        // This shouldn't happen, but handle it gracefully
                        const updateData = { ...item.data };
                        if (updateData.id && updateData.id.toString().startsWith('temp_')) {
                            delete updateData.id;
                        }
                        delete updateData.created_at;
                        delete updateData.updated_at;
                        
                        const createResponse = await api.post('/tasks', updateData);
                        result = createResponse.data;
                        await deleteTask(item.taskId);
                    } else {
                        // Update on server directly
                        const updateData = { ...item.data };
                        delete updateData.id;
                        delete updateData.created_at;
                        delete updateData.updated_at;
                        
                        const updateResponse = await api.put(`/tasks/${item.taskId}`, updateData);
                        result = updateResponse.data;
                    }
                    await saveTask(result);
                    break;

                case 'delete':
                    // Only delete if it's not a temp ID (temp IDs don't exist on server)
                    if (!item.taskId.toString().startsWith('temp_')) {
                        await api.delete(`/tasks/${item.taskId}`);
                    }
                    await deleteTask(item.taskId);
                    break;

                default:
                    console.warn('Unknown sync operation type:', item.type);
                    continue;
            }

            // Remove from queue on success
            await removeFromSyncQueue(item.id);
            results.success.push(item);
        } catch (error) {
            console.error('Sync error for operation:', item, error);
            results.failed.push({ item, error: error.message });
        }
    }

    return results;
};

/**
 * Sync data from server to local storage
 */
export const syncFromServer = async () => {
    if (!isOnline()) {
        throw new Error('Cannot sync: device is offline');
    }

    try {
        // Use API directly to avoid queuing
        const response = await api.get('/tasks');
        const serverTasks = response.data;
        await saveTasks(serverTasks);
        return serverTasks;
    } catch (error) {
        console.error('Error syncing from server:', error);
        throw error;
    }
};

/**
 * Full sync: both directions
 */
export const fullSync = async () => {
    if (!isOnline()) {
        throw new Error('Cannot sync: device is offline');
    }

    const results = {
        toServer: null,
        fromServer: null,
        error: null,
    };

    try {
        // First, sync pending changes to server
        results.toServer = await syncToServer();

        // Then, get latest data from server
        results.fromServer = await syncFromServer();

        return results;
    } catch (error) {
        results.error = error.message;
        throw error;
    }
};

/**
 * Get sync status
 */
export const getSyncStatus = async () => {
    const queue = await getSyncQueue();
    const localTasks = await getTasks();

    return {
        pendingOperations: queue.length,
        localTaskCount: localTasks.length,
        isOnline: isOnline(),
    };
};

