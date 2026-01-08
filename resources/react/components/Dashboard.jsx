import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsApi } from '../services/api';
import api from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAttendance: 95,
        todayCollections: 12450,
        lowStockItems: 12,
        pendingReports: 5,
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch products to calculate low stock
            const products = await productsApi.getAll();
            const lowStockCount = products.filter((p) => {
                const qty = parseInt(p.product_quantity, 10) || 0;
                return qty > 0 && qty < 10;
            }).length;

            // Fetch attendance data
            let attendanceRate = 95;
            try {
                const attendanceResponse = await api.get('/attendances');
                const attendances = attendanceResponse.data || [];
                if (attendances.length > 0) {
                    // Calculate attendance rate (simplified)
                    const today = new Date().toISOString().split('T')[0];
                    const todayAttendances = attendances.filter(
                        (a) => a.timestamp?.startsWith(today)
                    );
                    attendanceRate = Math.round((todayAttendances.length / 1) * 100);
                }
            } catch (err) {
                console.warn('Failed to fetch attendance:', err);
            }

            setStats({
                totalAttendance: attendanceRate,
                todayCollections: 12450, // This would come from collections API
                lowStockItems: lowStockCount,
                pendingReports: 5, // This would come from reports API
            });
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `Today, ${date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })}`;
        } else if (diffDays === 1) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })}`;
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Sample recent activity data - replace with actual API call
    const recentActivities = [
        {
            id: 1,
            user: { name: 'Sarah Johnson', role: 'Staff', initials: 'SJ', avatar: null },
            action: { type: 'Inventory', label: 'Restocked Office Supplies', color: 'blue' },
            date: new Date().toISOString(),
            status: 'Completed',
            amount: null,
        },
        {
            id: 2,
            user: { name: 'Michael Chen', role: 'Manager', initials: 'MC', avatar: null },
            action: { type: 'Collection', label: 'Payment Received', color: 'green' },
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: null,
            amount: 1250.0,
        },
        {
            id: 3,
            user: { name: 'David Smith', role: 'Admin', initials: 'DS', avatar: null },
            action: { type: 'Alert', label: 'Low Stock Warning: Paper', color: 'orange' },
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'Pending Review',
            amount: null,
        },
        {
            id: 4,
            user: { name: 'Emily Rose', role: 'HR', initials: 'ER', avatar: null },
            action: { type: 'Attendance', label: 'Monthly Report Generated', color: 'purple' },
            date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
            status: 'Available',
            amount: null,
        },
    ];

    const getActionBadgeColor = (color) => {
        const colorMap = {
            blue: 'bg-blue-50 text-blue-700',
            green: 'bg-green-50 text-green-700',
            orange: 'bg-orange-50 text-orange-700',
            purple: 'bg-purple-50 text-purple-700',
        };
        return colorMap[color] || 'bg-gray-50 text-gray-700';
    };

    const attendanceData = [60, 100, 85, 75, 90, 40, 20]; // Weekly attendance percentages
    const maxAttendance = Math.max(...attendanceData);

    if (loading) {
        return (
            <div className="bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
                <p className="text-[#6B7280]">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            <div className="mx-auto max-w-7xl flex flex-col gap-8 p-4 sm:p-8">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-[#1F2937]">Overview</h3>
                        <p className="text-[#6B7280] mt-1">
                            Here's what's happening with your store today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 rounded-lg bg-white border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: Total Attendance */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E0E0E0]">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                +2.5%
                                <span className="material-symbols-outlined text-[14px] ml-0.5">trending_up</span>
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-[#6B7280]">Total Attendance</p>
                            <h4 className="mt-1 text-2xl font-bold text-[#1F2937]">{stats.totalAttendance}%</h4>
                        </div>
                    </div>

                    {/* Stat 2: Today's Collections */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E0E0E0]">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-green-50 p-2 text-green-600">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                +$1.2k
                                <span className="material-symbols-outlined text-[14px] ml-0.5">trending_up</span>
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-[#6B7280]">Today's Collections</p>
                            <h4 className="mt-1 text-2xl font-bold text-[#1F2937]">
                                {formatCurrency(stats.todayCollections)}
                            </h4>
                        </div>
                    </div>

                    {/* Stat 3: Low Stock Items */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E0E0E0]">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-[#6366F1]/10 p-2 text-[#6366F1]">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <span className="flex items-center text-xs font-medium text-[#6366F1] bg-[#6366F1]/10 px-2 py-1 rounded-full">
                                Urgent
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-[#6B7280]">Low Stock Items</p>
                            <h4 className="mt-1 text-2xl font-bold text-[#1F2937]">{stats.lowStockItems}</h4>
                        </div>
                    </div>

                    {/* Stat 4: Pending Reports */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E0E0E0]">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            <span className="flex items-center text-xs font-medium text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full">
                                {stats.pendingReports} pending
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-[#6B7280]">Pending Reports</p>
                            <h4 className="mt-1 text-2xl font-bold text-[#1F2937]">{stats.pendingReports}</h4>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Weekly Attendance */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E0E0E0]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-bold text-[#1F2937]">Weekly Attendance</h4>
                                <p className="text-sm text-[#6B7280]">Avg. 92% this week</p>
                            </div>
                            <button className="text-[#6B7280] hover:text-[#1F2937]">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>
                        <div className="grid h-48 grid-cols-7 items-end gap-2 sm:gap-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                const height = attendanceData[index];
                                const isToday = index === 2; // Wednesday as example
                                return (
                                    <div
                                        key={day}
                                        className="group relative flex h-full flex-col justify-end items-center gap-2"
                                    >
                                        <div
                                            className={`w-full max-w-[40px] rounded-t-sm transition-all duration-300 ${
                                                isToday
                                                    ? 'bg-[#6366F1] hover:bg-[#4F46E5]'
                                                    : 'bg-[#6366F1]/20 hover:bg-[#6366F1]'
                                            }`}
                                            style={{ height: `${(height / maxAttendance) * 100}%` }}
                                        ></div>
                                        <span
                                            className={`text-xs font-medium ${
                                                isToday ? 'text-[#1F2937] font-bold' : 'text-[#6B7280]'
                                            }`}
                                        >
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chart 2: Collection History */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-[#E0E0E0]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-bold text-[#1F2937]">Collection History</h4>
                                <p className="text-sm text-[#6B7280]">Last 30 days performance</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-[#6366F1] mt-1.5"></span>
                                <span className="text-xs text-[#6B7280]">Revenue</span>
                            </div>
                        </div>
                        <div className="relative h-48 w-full">
                            <svg
                                className="h-full w-full overflow-visible"
                                preserveAspectRatio="none"
                                viewBox="0 0 400 150"
                            >
                                <defs>
                                    <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 0.2 }}></stop>
                                        <stop offset="100%" style={{ stopColor: '#6366F1', stopOpacity: 0 }}></stop>
                                    </linearGradient>
                                </defs>
                                {/* Area */}
                                <path
                                    d="M0 100 C 50 100, 50 40, 100 40 C 150 40, 150 80, 200 80 C 250 80, 250 30, 300 30 C 350 30, 350 60, 400 60 V 150 H 0 Z"
                                    fill="url(#gradient)"
                                ></path>
                                {/* Line */}
                                <path
                                    d="M0 100 C 50 100, 50 40, 100 40 C 150 40, 150 80, 200 80 C 250 80, 250 30, 300 30 C 350 30, 350 60, 400 60"
                                    fill="none"
                                    stroke="#6366F1"
                                    strokeLinecap="round"
                                    strokeWidth="3"
                                ></path>
                            </svg>
                            <div className="absolute bottom-0 flex w-full justify-between text-xs text-[#6B7280]">
                                <span>Week 1</span>
                                <span>Week 2</span>
                                <span>Week 3</span>
                                <span>Week 4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="rounded-xl bg-white shadow-sm border border-[#E0E0E0]">
                    <div className="flex items-center justify-between border-b border-[#E0E0E0] px-6 py-4">
                        <h3 className="text-lg font-bold text-[#1F2937]">Recent Activity</h3>
                        <a className="text-sm font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors" href="#">
                            View All
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#6B7280]">
                            <thead className="bg-gray-50 text-xs uppercase text-[#1F2937]">
                                <tr>
                                    <th className="px-6 py-3 font-semibold" scope="col">
                                        User
                                    </th>
                                    <th className="px-6 py-3 font-semibold" scope="col">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 font-semibold" scope="col">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 font-semibold" scope="col">
                                        Amount/Status
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-right" scope="col">
                                        More
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {recentActivities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {activity.user.avatar ? (
                                                    <div
                                                        className="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center"
                                                        style={{
                                                            backgroundImage: `url(${activity.user.avatar})`,
                                                        }}
                                                    ></div>
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]/10 text-xs font-bold text-[#6366F1]">
                                                        {activity.user.initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-[#1F2937]">
                                                        {activity.user.name}
                                                    </div>
                                                    <div className="text-xs">{activity.user.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${getActionBadgeColor(
                                                    activity.action.color
                                                )}`}
                                            >
                                                {activity.action.type}
                                            </span>
                                            <span className="ml-2 text-[#1F2937]">{activity.action.label}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">{formatTime(activity.date)}</td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                                            {activity.amount ? (
                                                <span className="font-bold text-[#1F2937]">
                                                    {formatCurrency(activity.amount)}
                                                </span>
                                            ) : (
                                                <span
                                                    className={
                                                        activity.status === 'Completed' || activity.status === 'Available'
                                                            ? 'text-green-600'
                                                            : activity.status === 'Pending Review'
                                                            ? 'text-orange-600'
                                                            : 'text-[#1F2937]'
                                                    }
                                                >
                                                    {activity.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button className="text-[#6B7280] hover:text-[#6366F1] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">
                                                    chevron_right
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

