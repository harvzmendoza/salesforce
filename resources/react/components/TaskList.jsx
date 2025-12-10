import { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskApi.getAll();
            setTasks(data);
        } catch (err) {
            setError('Failed to fetch tasks. Please try again.');
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreate = async (taskData) => {
        try {
            const newTask = await taskApi.create(taskData);
            setTasks([newTask, ...tasks]);
            setShowForm(false);
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
                <p className="text-[#706f6c] dark:text-[#A1A09A]">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                    Tasks
                </h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingTask(null);
                    }}
                    className="px-4 py-2 bg-[#1b1b18] dark:bg-[#eeeeec] text-white dark:text-[#1C1C1A] rounded-sm hover:bg-black dark:hover:bg-white transition-colors"
                >
                    {showForm ? 'Cancel' : 'Add Task'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-[#fff2f2] dark:bg-[#1D0002] border border-[#F53003] dark:border-[#F61500] rounded-sm text-[#F53003] dark:text-[#FF4433]">
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
                <div className="text-center p-8 bg-white dark:bg-[#161615] border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm">
                    <p className="text-[#706f6c] dark:text-[#A1A09A]">
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
    );
}

