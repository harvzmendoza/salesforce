import axios from 'axios';
import {
    getTasks,
    saveTask,
    deleteTask,
    addToSyncQueue,
    isOnline,
    saveCallRecording,
    getCallRecording,
    getCallRecordingBySchedule,
    deleteCallRecording,
    saveCallSchedule,
    getCallSchedule,
    getCallScheduleByStoreDateUser,
    saveStores,
    getStores,
    saveProducts,
    getProducts,
} from './offlineStorage';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Configure axios to automatically send CSRF token
api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    
    // Get XSRF token from cookie
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    
    return config;
});

// Helper to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

// Helper to generate temporary ID for offline tasks
const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Call Recording API
export const callRecordingApi = {
    getBySchedule: async (callScheduleId) => {
        if (isOnline()) {
            try {
                const response = await api.get(`/call-recordings/schedule/${callScheduleId}`);
                await saveCallRecording(response.data);
                return response.data;
            } catch (error) {
                // If the server explicitly reports the recording does not exist,
                // do NOT fall back to any stale local cache – just treat it as missing.
                if (error.response && error.response.status === 404) {
                    console.warn('Recording not found on server, ignoring local cache.');
                    return null;
                }

                console.warn('Failed to fetch from server, using local storage:', error);
                return await getCallRecordingBySchedule(callScheduleId);
            }
        } else {
            return await getCallRecordingBySchedule(callScheduleId);
        }
    },

    create: async (data) => {
        if (isOnline()) {
            try {
                const response = await api.post('/call-recordings', data);
                await saveCallRecording(response.data);
                return response.data;
            } catch (error) {
                console.warn('Failed to create on server, saving locally:', error);
                const tempId = generateTempId();
                const localRecording = {
                    ...data,
                    id: tempId,
                    call_schedule_id: data.call_schedule_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                await saveCallRecording(localRecording);
                await addToSyncQueue({
                    type: 'create',
                    resource: 'call-recording',
                    data: localRecording,
                });
                return localRecording;
            }
        } else {
            const tempId = generateTempId();
            const localRecording = {
                ...data,
                id: tempId,
                call_schedule_id: data.call_schedule_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            await saveCallRecording(localRecording);
            await addToSyncQueue({
                type: 'create',
                resource: 'call-recording',
                data: localRecording,
            });
            return localRecording;
        }
    },

    update: async (id, data) => {
        if (isOnline()) {
            try {
                const response = await api.put(`/call-recordings/${id}`, data);
                await saveCallRecording(response.data);
                return response.data;
            } catch (error) {
                console.warn('Failed to update on server, saving locally:', error);
                const updatedRecording = {
                    ...data,
                    id,
                    updated_at: new Date().toISOString(),
                };
                await saveCallRecording(updatedRecording);
                await addToSyncQueue({
                    type: 'update',
                    resource: 'call-recording',
                    recordingId: id,
                    data: updatedRecording,
                });
                return updatedRecording;
            }
        } else {
            const updatedRecording = {
                ...data,
                id,
                updated_at: new Date().toISOString(),
            };
            await saveCallRecording(updatedRecording);
            await addToSyncQueue({
                type: 'update',
                resource: 'call-recording',
                recordingId: id,
                data: updatedRecording,
            });
            return updatedRecording;
        }
    },

    updatePostActivity: async (id, postActivity) => {
        if (isOnline()) {
            try {
                const response = await api.put(`/call-recordings/${id}/post-activity`, {
                    post_activity: postActivity,
                });
                await saveCallRecording(response.data);
                return response.data;
            } catch (error) {
                console.warn('Failed to update post activity on server, saving locally:', error);
                const existing = await getCallRecording(id);
                const updatedRecording = {
                    ...existing,
                    post_activity: postActivity,
                    updated_at: new Date().toISOString(),
                };
                await saveCallRecording(updatedRecording);
                await addToSyncQueue({
                    type: 'update',
                    resource: 'call-recording',
                    recordingId: id,
                    data: { post_activity: postActivity },
                });
                return updatedRecording;
            }
        } else {
            const existing = await getCallRecording(id);
            const updatedRecording = {
                ...existing,
                post_activity: postActivity,
                updated_at: new Date().toISOString(),
            };
            await saveCallRecording(updatedRecording);
            await addToSyncQueue({
                type: 'update',
                resource: 'call-recording',
                recordingId: id,
                data: { post_activity: postActivity },
            });
            return updatedRecording;
        }
    },

    delete: async (id) => {
        if (isOnline()) {
            try {
                await api.delete(`/call-recordings/${id}`);
                await deleteCallRecording(id);
            } catch (error) {
                console.warn('Failed to delete on server, deleting locally:', error);
                await deleteCallRecording(id);
                await addToSyncQueue({
                    type: 'delete',
                    resource: 'call-recording',
                    recordingId: id,
                });
            }
        } else {
            await deleteCallRecording(id);
            await addToSyncQueue({
                type: 'delete',
                resource: 'call-recording',
                recordingId: id,
            });
        }
    },
};

// Call Schedule API
export const callScheduleApi = {
    getOrCreate: async (storeId, callDate, userId) => {
        if (isOnline()) {
            try {
                const response = await api.post('/call-schedules/get-or-create', {
                    store_id: storeId,
                    call_date: callDate,
                    user_id: userId,
                });
                await saveCallSchedule(response.data);
                return response.data;
            } catch (error) {
                console.warn('Failed to get/create on server, using local storage:', error);
                let schedule = await getCallScheduleByStoreDateUser(storeId, callDate, userId);
                if (!schedule) {
                    const tempId = generateTempId();
                    schedule = {
                        id: tempId,
                        store_id: storeId,
                        call_date: callDate,
                        user_id: userId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                    await saveCallSchedule(schedule);
                    await addToSyncQueue({
                        type: 'create',
                        resource: 'call-schedule',
                        data: schedule,
                    });
                }
                return schedule;
            }
        } else {
            let schedule = await getCallScheduleByStoreDateUser(storeId, callDate, userId);
            if (!schedule) {
                const tempId = generateTempId();
                schedule = {
                    id: tempId,
                    store_id: storeId,
                    call_date: callDate,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                await saveCallSchedule(schedule);
                await addToSyncQueue({
                    type: 'create',
                    resource: 'call-schedule',
                    data: schedule,
                });
            }
            return schedule;
        }
    },
};

// Stores API
export const storesApi = {
    getAll: async (callDate, userId) => {
        if (isOnline()) {
            try {
                const params = new URLSearchParams();
                if (callDate) params.append('call_date', callDate);
                if (userId) params.append('user_id', userId);
                const response = await api.get(`/stores?${params.toString()}`);
                const stores = response.data || [];
                await saveStores(stores);
                return stores;
            } catch (error) {
                console.warn('Failed to fetch from server, using local storage:', error);
                return await getStores();
            }
        } else {
            return await getStores();
        }
    },
};

// Products API
export const productsApi = {
    getAll: async () => {
        if (isOnline()) {
            try {
                const response = await api.get('/products');
                const products = response.data || [];
                await saveProducts(products);
                return products;
            } catch (error) {
                console.warn('Failed to fetch from server, using local storage:', error);
                return await getProducts();
            }
        } else {
            return await getProducts();
        }
    },
};

export const taskApi = {
    getAll: async () => {
        if (isOnline()) {
            try {
                const response = await api.get('/tasks');
                const tasks = response.data;
                // Save to local storage
                const { saveTasks } = await import('./offlineStorage');
                await saveTasks(tasks);
                return tasks;
            } catch (error) {
                // If online but request fails, fall back to local storage
                console.warn('Failed to fetch from server, using local storage:', error);
                return await getTasks();
            }
        } else {
            // Offline: return from local storage
            return await getTasks();
        }
    },

    getById: async (id) => {
        if (isOnline()) {
            try {
                const response = await api.get(`/tasks/${id}`);
                await saveTask(response.data);
                return response.data;
            } catch (error) {
                console.warn('Failed to fetch from server, using local storage:', error);
                const { getTask } = await import('./offlineStorage');
                return await getTask(id);
            }
        } else {
            const { getTask } = await import('./offlineStorage');
            return await getTask(id);
        }
    },

    create: async (data) => {
        if (isOnline()) {
            try {
                const response = await api.post('/tasks', data);
                await saveTask(response.data);
                return response.data;
            } catch (error) {
                // If online but request fails, save locally and queue for sync
                console.warn('Failed to create on server, saving locally:', error);
                const tempId = generateTempId();
                const localTask = {
                    ...data,
                    id: tempId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                await saveTask(localTask);
                await addToSyncQueue({
                    type: 'create',
                    data: localTask,
                });
                return localTask;
            }
        } else {
            // Offline: save locally and queue for sync
            const tempId = generateTempId();
            const localTask = {
                ...data,
                id: tempId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            await saveTask(localTask);
            await addToSyncQueue({
                type: 'create',
                data: localTask,
            });
            return localTask;
        }
    },

    update: async (id, data) => {
        if (isOnline()) {
            try {
                const response = await api.put(`/tasks/${id}`, data);
                await saveTask(response.data);
                return response.data;
            } catch (error) {
                // If online but request fails, save locally and queue for sync
                console.warn('Failed to update on server, saving locally:', error);
                const updatedTask = {
                    ...data,
                    id,
                    updated_at: new Date().toISOString(),
                };
                await saveTask(updatedTask);
                await addToSyncQueue({
                    type: 'update',
                    taskId: id,
                    data: updatedTask,
                });
                return updatedTask;
            }
        } else {
            // Offline: save locally and queue for sync
            const updatedTask = {
                ...data,
                id,
                updated_at: new Date().toISOString(),
            };
            await saveTask(updatedTask);
            await addToSyncQueue({
                type: 'update',
                taskId: id,
                data: updatedTask,
            });
            return updatedTask;
        }
    },

    delete: async (id) => {
        if (isOnline()) {
            try {
                await api.delete(`/tasks/${id}`);
                await deleteTask(id);
            } catch (error) {
                // If online but request fails, delete locally and queue for sync
                console.warn('Failed to delete on server, deleting locally:', error);
                await deleteTask(id);
                await addToSyncQueue({
                    type: 'delete',
                    taskId: id,
                });
            }
        } else {
            // Offline: delete locally and queue for sync
            await deleteTask(id);
            await addToSyncQueue({
                type: 'delete',
                taskId: id,
            });
        }
    },
};

export default api;

