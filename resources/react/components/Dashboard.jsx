import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
            <header className="mb-6 lg:mb-8 mt-4 lg:mt-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F2937]">Dashboard</h1>
            </header>

            <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-[#E0E0E0]">
                        <h2 className="text-lg font-semibold text-[#1F2937] mb-2">
                            Welcome
                        </h2>
                        <p className="text-[#6B7280]">
                            Hello, {user?.name || 'User'}!
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-[#E0E0E0]">
                        <h2 className="text-lg font-semibold text-[#1F2937] mb-2">
                            Quick Stats
                        </h2>
                        <p className="text-[#6B7280]">
                            Your dashboard overview
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-[#E0E0E0]">
                        <h2 className="text-lg font-semibold text-[#1F2937] mb-2">
                            Recent Activity
                        </h2>
                        <p className="text-[#6B7280]">
                            View your recent tasks and updates
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

