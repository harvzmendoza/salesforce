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
    saveCallRecording,
    getCallRecording,
    saveCallSchedule,
    getCallSchedule,
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

            const resource = item.resource || 'task';

            switch (item.type) {
                case 'create':
                    if (resource === 'call-recording') {
                        const createData = { ...item.data };
                        if (createData.id && createData.id.toString().startsWith('temp_')) {
                            delete createData.id;
                        }
                        delete createData.created_at;
                        delete createData.updated_at;
                        
                        const createResponse = await api.post('/call-recordings', createData);
                        result = createResponse.data;
                        
                        // Delete temp recording if it exists
                        if (item.data.id && item.data.id.toString().startsWith('temp_')) {
                            try {
                                const { initDB } = await import('./offlineStorage');
                                const db = await initDB();
                                const tx = db.transaction(['callRecordings'], 'readwrite');
                                await new Promise((resolve, reject) => {
                                    const deleteReq = tx.objectStore('callRecordings').delete(item.data.id);
                                    deleteReq.onsuccess = () => resolve();
                                    deleteReq.onerror = () => reject(deleteReq.error);
                                    tx.oncomplete = () => resolve();
                                    tx.onerror = () => reject(tx.error);
                                });
                            } catch (err) {
                                console.warn('Failed to delete temp recording:', err);
                            }
                        }
                        await saveCallRecording(result);
                    } else if (resource === 'call-schedule') {
                        const createData = { ...item.data };
                        if (createData.id && createData.id.toString().startsWith('temp_')) {
                            delete createData.id;
                        }
                        delete createData.created_at;
                        delete createData.updated_at;
                        
                        const createResponse = await api.post('/call-schedules/get-or-create', {
                            store_id: createData.store_id,
                            call_date: createData.call_date,
                            user_id: createData.user_id,
                        });
                        result = createResponse.data;
                        await saveCallSchedule(result);
                    } else {
                        // Task create
                        const createData = { ...item.data };
                        if (createData.id && createData.id.toString().startsWith('temp_')) {
                            delete createData.id;
                        }
                        delete createData.created_at;
                        delete createData.updated_at;
                        
                        const createResponse = await api.post('/tasks', createData);
                        result = createResponse.data;
                        
                        if (item.data.id && item.data.id.toString().startsWith('temp_')) {
                            await deleteTask(item.data.id);
                        }
                        await saveTask(result);
                    }
                    break;

                case 'update':
                    if (resource === 'call-recording') {
                        const recordingId = item.recordingId || item.data?.id;
                        if (!recordingId || recordingId.toString().startsWith('temp_')) {
                            // If temp ID, try to find the real ID from server by call_schedule_id
                            const existing = await getCallRecording(recordingId);
                            if (existing && existing.call_schedule_id) {
                                try {
                                    const scheduleResponse = await api.get(`/call-recordings/schedule/${existing.call_schedule_id}`);
                                    if (scheduleResponse.data && scheduleResponse.data.id) {
                                        // Found real ID, update with it
                                        const updateData = { ...item.data };
                                        delete updateData.id;
                                        delete updateData.created_at;
                                        delete updateData.updated_at;
                                        
                                        if (updateData.post_activity !== undefined) {
                                            const updateResponse = await api.put(`/call-recordings/${scheduleResponse.data.id}/post-activity`, updateData);
                                            result = updateResponse.data;
                                        } else {
                                            const updateResponse = await api.put(`/call-recordings/${scheduleResponse.data.id}`, updateData);
                                            result = updateResponse.data;
                                        }
                                        // Delete temp and save real
                                        try {
                                            const { initDB } = await import('./offlineStorage');
                                            const db = await initDB();
                                            const tx = db.transaction(['callRecordings'], 'readwrite');
                                            await new Promise((resolve, reject) => {
                                                const deleteReq = tx.objectStore('callRecordings').delete(recordingId);
                                                deleteReq.onsuccess = () => resolve();
                                                deleteReq.onerror = () => reject(deleteReq.error);
                                                tx.oncomplete = () => resolve();
                                                tx.onerror = () => reject(tx.error);
                                            });
                                        } catch (err) {
                                            console.warn('Failed to delete temp recording:', err);
                                        }
                                        await saveCallRecording(result);
                                    } else {
                                        // Not found on server, skip
                                        continue;
                                    }
                                } catch (err) {
                                    // Not found, skip
                                    continue;
                                }
                            } else {
                                continue;
                            }
                        } else {
                            const updateData = { ...item.data };
                            delete updateData.id;
                            delete updateData.created_at;
                            delete updateData.updated_at;
                            
                            if (updateData.post_activity !== undefined && Object.keys(updateData).length === 1) {
                                const updateResponse = await api.put(`/call-recordings/${recordingId}/post-activity`, updateData);
                                result = updateResponse.data;
                            } else {
                                const updateResponse = await api.put(`/call-recordings/${recordingId}`, updateData);
                                result = updateResponse.data;
                            }
                            await saveCallRecording(result);
                        }
                    } else {
                        // Task update
                        if (item.taskId && item.taskId.toString().startsWith('temp_')) {
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
                            const updateData = { ...item.data };
                            delete updateData.id;
                            delete updateData.created_at;
                            delete updateData.updated_at;
                            
                            const updateResponse = await api.put(`/tasks/${item.taskId}`, updateData);
                            result = updateResponse.data;
                        }
                        await saveTask(result);
                    }
                    break;

                case 'delete':
                    if (resource === 'call-recording') {
                        const recordingId = item.recordingId || item.data?.id;
                        if (!recordingId || recordingId.toString().startsWith('temp_')) {
                            continue;
                        }
                        await api.delete(`/call-recordings/${recordingId}`);
                    } else {
                        // Task delete
                        if (!item.taskId.toString().startsWith('temp_')) {
                            await api.delete(`/tasks/${item.taskId}`);
                        }
                        await deleteTask(item.taskId);
                    }
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

