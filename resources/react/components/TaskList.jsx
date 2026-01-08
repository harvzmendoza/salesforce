import { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import { initDB, getTasks } from '../services/offlineStorage';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [dbInitialized, setDbInitialized] = useState(false);

    // Initialize IndexedDB on mount
    useEffect(() => {
        const initializeDB = async () => {
            try {
                await initDB();
                setDbInitialized(true);
            } catch (err) {
                console.error('Failed to initialize database:', err);
                setError('Failed to initialize offline storage');
            }
        };

        initializeDB();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Wait for DB to be initialized
            if (!dbInitialized) {
                await new Promise((resolve) => {
                    const checkDB = setInterval(() => {
                        if (dbInitialized) {
                            clearInterval(checkDB);
                            resolve();
                        }
                    }, 100);
                });
            }

            const data = await taskApi.getAll();
            setTasks(data);
        } catch (err) {
            setError('Failed to fetch tasks. Please try again.');
            console.error('Error fetching tasks:', err);
            
            // Try to load from local storage as fallback
            try {
                const localTasks = await getTasks();
                if (localTasks.length > 0) {
                    setTasks(localTasks);
                    setError('Using offline data. Sync when online to get latest updates.');
                }
            } catch (localErr) {
                console.error('Error loading from local storage:', localErr);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dbInitialized) {
            fetchTasks();
        }
    }, [dbInitialized]);

    const handleCreate = async (taskData) => {
        try {
            const newTask = await taskApi.create(taskData);
            setTasks([newTask, ...tasks]);
            setShowForm(false);
            
            // Show message if offline
            const { isOnline } = await import('../services/offlineStorage');
            if (!isOnline()) {
                setError('Task saved offline. Sync when online to save to server.');
            }
        } catch (err) {
            setError('Failed to create task. Please try again.');
            console.error('Error creating task:', err);
        }
    };

    const handleUpdate = async (id, taskData) => {
        try {
            const updatedTask = await taskApi.update(id, taskData);
            setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
            setEditingTask(null);
            
            // Show message if offline
            const { isOnline } = await import('../services/offlineStorage');
            if (!isOnline()) {
                setError('Task updated offline. Sync when online to save to server.');
            }
        } catch (err) {
            setError('Failed to update task. Please try again.');
            console.error('Error updating task:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await taskApi.delete(id);
            setTasks(tasks.filter((task) => task.id !== id));
            
            // Show message if offline
            const { isOnline } = await import('../services/offlineStorage');
            if (!isOnline()) {
                setError('Task deleted offline. Sync when online to delete from server.');
            }
        } catch (err) {
            setError('Failed to delete task. Please try again.');
            console.error('Error deleting task:', err);
        }
    };

    const handleToggleComplete = async (task) => {
        await handleUpdate(task.id, {
            ...task,
            completed: !task.completed,
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <p className="text-[#6B7280]">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
            <header className="mb-6 lg:mb-8 mt-4 lg:mt-0">
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F2937]">
                        Tasks
                    </h1>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingTask(null);
                        }}
                        className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-md transition-colors"
                    >
                        {showForm ? 'Cancel' : 'Add Task'}
                    </button>
                </div>
            </header>

            <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-4 sm:p-6 md:p-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {showForm && (
                    <div className="mb-6">
                        <TaskForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {editingTask && (
                    <div className="mb-6">
                        <TaskForm
                            task={editingTask}
                            onSubmit={(data) => handleUpdate(editingTask.id, data)}
                            onCancel={() => setEditingTask(null)}
                        />
                    </div>
                )}

                {tasks.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 border border-[#E0E0E0] rounded-lg">
                        <p className="text-[#6B7280]">
                            No tasks yet. Create your first task!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onEdit={() => {
                                    setEditingTask(task);
                                    setShowForm(false);
                                }}
                                onDelete={() => handleDelete(task.id)}
                                onToggleComplete={() => handleToggleComplete(task)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

