import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const taskApi = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/tasks/${id}`);
    },
};

export default api;

