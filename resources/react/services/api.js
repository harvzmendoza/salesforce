import axios from 'axios';
import {
    getTasks,
    saveTask,
    deleteTask,
    addToSyncQueue,
    isOnline,
} from './offlineStorage';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Helper to generate temporary ID for offline tasks
const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

