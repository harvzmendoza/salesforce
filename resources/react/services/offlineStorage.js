/**
 * Offline Storage Service using IndexedDB
 * Stores tasks locally for offline access
 */

const DB_NAME = 'salesforce-tasks-db';
const DB_VERSION = 3;
const STORE_NAME = 'tasks';
const CALL_RECORDINGS_STORE = 'callRecordings';
const CALL_SCHEDULES_STORE = 'callSchedules';
const STORES_STORE = 'stores';
const PRODUCTS_STORE = 'products';
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
            const oldVersion = event.oldVersion;

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

            // Create call recordings store (version 2+)
            if (oldVersion < 2 && !database.objectStoreNames.contains(CALL_RECORDINGS_STORE)) {
                const recordingStore = database.createObjectStore(CALL_RECORDINGS_STORE, {
                    keyPath: 'id',
                });
                recordingStore.createIndex('call_schedule_id', 'call_schedule_id', { unique: false });
                recordingStore.createIndex('updated_at', 'updated_at', { unique: false });
            }

            // Create call schedules store (version 2+)
            if (oldVersion < 2 && !database.objectStoreNames.contains(CALL_SCHEDULES_STORE)) {
                const scheduleStore = database.createObjectStore(CALL_SCHEDULES_STORE, {
                    keyPath: 'id',
                });
                scheduleStore.createIndex('store_id', 'store_id', { unique: false });
                scheduleStore.createIndex('call_date', 'call_date', { unique: false });
                scheduleStore.createIndex('user_id', 'user_id', { unique: false });
            }

            // Create stores store (version 2+)
            if (oldVersion < 2 && !database.objectStoreNames.contains(STORES_STORE)) {
                const storesStore = database.createObjectStore(STORES_STORE, {
                    keyPath: 'id',
                });
                storesStore.createIndex('updated_at', 'updated_at', { unique: false });
            }

            // Create products store (version 3+)
            if (oldVersion < 3 && !database.objectStoreNames.contains(PRODUCTS_STORE)) {
                const productsStore = database.createObjectStore(PRODUCTS_STORE, {
                    keyPath: 'id',
                });
                productsStore.createIndex('updated_at', 'updated_at', { unique: false });
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

// Call Recordings Storage Functions
export const saveCallRecording = async (recording) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(CALL_RECORDINGS_STORE);

    return new Promise((resolve, reject) => {
        const request = store.put({
            ...recording,
            updated_at: recording.updated_at || new Date().toISOString(),
        });
        request.onsuccess = () => resolve(recording);
        request.onerror = () => reject(request.error);
    });
};

export const getCallRecording = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_RECORDINGS_STORE], 'readonly');
    const store = transaction.objectStore(CALL_RECORDINGS_STORE);

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getCallRecordingBySchedule = async (callScheduleId) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_RECORDINGS_STORE], 'readonly');
    const store = transaction.objectStore(CALL_RECORDINGS_STORE);
    const index = store.index('call_schedule_id');

    return new Promise((resolve, reject) => {
        const request = index.getAll(callScheduleId);
        request.onsuccess = () => resolve(request.result?.[0] || null);
        request.onerror = () => reject(request.error);
    });
};

export const deleteCallRecording = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(CALL_RECORDINGS_STORE);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Call Schedules Storage Functions
export const saveCallSchedule = async (schedule) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_SCHEDULES_STORE], 'readwrite');
    const store = transaction.objectStore(CALL_SCHEDULES_STORE);

    return new Promise((resolve, reject) => {
        const request = store.put({
            ...schedule,
            updated_at: schedule.updated_at || new Date().toISOString(),
        });
        request.onsuccess = () => resolve(schedule);
        request.onerror = () => reject(request.error);
    });
};

export const getCallSchedule = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_SCHEDULES_STORE], 'readonly');
    const store = transaction.objectStore(CALL_SCHEDULES_STORE);

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getCallScheduleByStoreDateUser = async (storeId, callDate, userId) => {
    const database = await getDB();
    const transaction = database.transaction([CALL_SCHEDULES_STORE], 'readonly');
    const store = transaction.objectStore(CALL_SCHEDULES_STORE);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const schedules = request.result || [];
            const found = schedules.find(
                (s) => s.store_id === storeId && s.call_date === callDate && s.user_id === userId
            );
            resolve(found || null);
        };
        request.onerror = () => reject(request.error);
    });
};

export const getAllCallSchedules = async () => {
    const database = await getDB();
    const transaction = database.transaction([CALL_SCHEDULES_STORE], 'readonly');
    const store = transaction.objectStore(CALL_SCHEDULES_STORE);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

// Stores Storage Functions
export const saveStores = async (stores) => {
    const database = await getDB();
    const transaction = database.transaction([STORES_STORE], 'readwrite');
    const store = transaction.objectStore(STORES_STORE);

    const promises = stores.map((storeItem) => {
        return new Promise((resolve, reject) => {
            const request = store.put({
                ...storeItem,
                updated_at: storeItem.updated_at || new Date().toISOString(),
            });
            request.onsuccess = () => resolve(storeItem);
            request.onerror = () => reject(request.error);
        });
    });

    await Promise.all(promises);
    return stores;
};

export const getStores = async () => {
    const database = await getDB();
    const transaction = database.transaction([STORES_STORE], 'readonly');
    const store = transaction.objectStore(STORES_STORE);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

// Products Storage Functions
export const saveProducts = async (products) => {
    const database = await getDB();
    const transaction = database.transaction([PRODUCTS_STORE], 'readwrite');
    const store = transaction.objectStore(PRODUCTS_STORE);

    const promises = products.map((product) => {
        return new Promise((resolve, reject) => {
            const request = store.put({
                ...product,
                updated_at: product.updated_at || new Date().toISOString(),
            });
            request.onsuccess = () => resolve(product);
            request.onerror = () => reject(request.error);
        });
    });

    await Promise.all(promises);
    return products;
};

export const getProducts = async () => {
    const database = await getDB();
    const transaction = database.transaction([PRODUCTS_STORE], 'readonly');
    const store = transaction.objectStore(PRODUCTS_STORE);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

export const getProduct = async (id) => {
    const database = await getDB();
    const transaction = database.transaction([PRODUCTS_STORE], 'readonly');
    const store = transaction.objectStore(PRODUCTS_STORE);

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};



