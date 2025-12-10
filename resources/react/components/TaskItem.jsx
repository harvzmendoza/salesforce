export default function TaskItem({ task, onEdit, onDelete, onToggleComplete }) {
    return (
        <div className="bg-white dark:bg-[#161615] border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm p-4 hover:border-[#19140035] dark:hover:border-[#62605b] transition-colors">
            <div className="flex items-start gap-4">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={onToggleComplete}
                    className="mt-1 w-4 h-4 rounded border-[#e3e3e0] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] focus:ring-2 focus:ring-[#1b1b18] dark:focus:ring-[#EDEDEC]"
                />
                <div className="flex-1">
                    <h3
                        className={`text-lg font-medium mb-1 ${
                            task.completed
                                ? 'line-through text-[#706f6c] dark:text-[#A1A09A]'
                                : 'text-[#1b1b18] dark:text-[#EDEDEC]'
                        }`}
                    >
                        {task.title}
                    </h3>
                    {task.description && (
                        <p
                            className={`text-sm ${
                                task.completed
                                    ? 'text-[#706f6c] dark:text-[#A1A09A]'
                                    : 'text-[#706f6c] dark:text-[#A1A09A]'
                            }`}
                        >
                            {task.description}
                        </p>
                    )}
                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] mt-2">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="px-3 py-1 text-sm border border-[#19140035] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] rounded-sm hover:border-[#1915014a] dark:hover:border-[#62605b] transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-1 text-sm bg-[#fff2f2] dark:bg-[#1D0002] text-[#F53003] dark:text-[#FF4433] border border-[#F53003] dark:border-[#F61500] rounded-sm hover:bg-[#F53003] dark:hover:bg-[#FF4433] hover:text-white dark:hover:text-white transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

