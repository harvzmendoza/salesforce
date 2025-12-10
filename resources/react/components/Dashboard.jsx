import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hello, {user?.name || 'User'}!
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Quick Stats
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your dashboard overview
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Recent Activity
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        View your recent tasks and updates
                    </p>
                </div>
            </div>
        </div>
    );
}

