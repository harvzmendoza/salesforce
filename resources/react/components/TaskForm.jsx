import { useState, useEffect } from 'react';

export default function TaskForm({ task = null, onSubmit, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [completed, setCompleted] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setCompleted(task.completed || false);
        }
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (!title.trim()) {
            setErrors({ title: 'Title is required' });
            return;
        }

        onSubmit({
            title: title.trim(),
            description: description.trim() || null,
            completed,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#161615] border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm p-6"
        >
            <h2 className="text-xl font-medium mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                {task ? 'Edit Task' : 'Create New Task'}
            </h2>

            <div className="mb-4">
                <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                >
                    Title *
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] ${
                        errors.title
                            ? 'border-[#F53003] dark:border-[#FF4433]'
                            : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]`}
                    placeholder="Enter task title"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                        {errors.title}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm bg-white dark:bg-[#161615] text-[#1b1b18] dark:text-[#EDEDEC] focus:outline-none focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]"
                    placeholder="Enter task description (optional)"
                />
            </div>

            <div className="mb-6">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => setCompleted(e.target.checked)}
                        className="w-4 h-4 rounded border-[#e3e3e0] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]"
                    />
                    <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                        Completed
                    </span>
                </label>
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#1b1b18] dark:bg-[#eeeeec] text-white dark:text-[#1C1C1A] rounded-sm hover:bg-black dark:hover:bg-white transition-colors"
                >
                    {task ? 'Update Task' : 'Create Task'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-[#19140035] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] rounded-sm hover:border-[#1915014a] dark:hover:border-[#62605b] transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

