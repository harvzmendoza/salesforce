/**
 * Offline Storage Service using IndexedDB
 * Stores tasks locally for offline access
 */

const DB_NAME = 'salesforce-tasks-db';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';
const SYNC_QUEUE_STORE = 'syncQueue';

let db = null;

/**
 * Initialize IndexedDB
 */
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create tasks store
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const taskStore = database.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                });
                taskStore.createIndex('updated_at', 'updated_at', { unique: false });
            }

            // Create sync queue store
            if (!database.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
                const syncStore = database.createObjectStore(SYNC_QUEUE_STORE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                syncStore.createIndex('type', 'type', { unique: false });
                syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

/**
 * Get database instance
 */
const getDB = async () => {
    if (!db) {
        await initDB();
    }
    return db;
};

/**
 * Save tasks to local storage
 */
export const saveTasks = async (tasks) => {
    const database = await getDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing tasks
    await store.clear();

    // Save all tasks
    const promises = tasks.map((task) => store.put({
        ...task,
        updated_at: task.updated_at || new Date().toISOString(),
    }));

    await Promise.all(promises);
    return tasks;
};

/**
 * Get all tasks from local storage
 */
export const getTasks = async () => {
    const database = await getDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get a single task by ID
 */
export const getTask = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Save a single task to local storage
 */
export const saveTask = async (task) => {
    const database = await getDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put({
            ...task,
            updated_at: task.updated_at || new Date().toISOString(),
        });
        request.onsuccess = () => resolve(task);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Delete a task from local storage
 */
export const deleteTask = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Add operation to sync queue
 */
export const addToSyncQueue = async (operation) => {
    const database = await getDB();
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    const queueItem = {
        ...operation,
        timestamp: new Date().toISOString(),
        retries: 0,
    };

    return new Promise((resolve, reject) => {
        const request = store.add(queueItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get all pending sync operations
 */
export const getSyncQueue = async () => {
    const database = await getDB();
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Remove operation from sync queue
 */
export const removeFromSyncQueue = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = async () => {
    const database = await getDB();
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Check if online
 */
export const isOnline = () => {
    return navigator.onLine;
};



