import { useState } from 'react';

export default function Collection() {
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data - replace with actual API calls
    const collections = [
        {
            id: 'TRX-8920',
            payer: { name: 'Store 1', initials: 'S1', color: 'indigo' },
            date: 'Oct 24, 2023',
            time: '10:42 AM',
            amount: 450.00,
            status: 'paid',
        },
        {
            id: 'TRX-8919',
            payer: { name: 'Store 2', initials: 'S2', color: 'pink' },
            date: 'Oct 24, 2023',
            time: '09:15 AM',
            amount: 1200.00,
            status: 'pending',
        },
        {
            id: 'TRX-8918',
            payer: { name: 'Store 3', initials: 'S3', color: 'blue' },
            date: 'Oct 23, 2023',
            time: '04:45 PM',
            amount: 75.00,
            status: 'failed',
        },
        {
            id: 'TRX-8917',
            payer: { name: 'Store 4', initials: 'S4', color: 'teal' },
            date: 'Oct 23, 2023',
            time: '02:20 PM',
            amount: 320.50,
            status: 'paid',
        },
        {
            id: 'TRX-8916',
            payer: { name: 'Store 5', initials: 'S5', color: 'orange' },
            date: 'Oct 23, 2023',
            time: '11:10 AM',
            amount: 150.00,
            status: 'paid',
        },
    ];

    const stats = {
        totalCollected: 125000.00,
        pendingAmount: 3200.00,
        todayTotal: 12450.00,
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(collections.map((_, index) => index));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (index) => {
        setSelectedRows((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: {
                bg: 'bg-green-500/10',
                text: 'text-green-700',
                border: 'border-green-500/20',
                dot: 'bg-green-700',
                label: 'Paid',
            },
            pending: {
                bg: 'bg-yellow-500/10',
                text: 'text-yellow-700',
                border: 'border-yellow-500/20',
                dot: 'bg-yellow-700',
                label: 'Pending',
            },
            failed: {
                bg: 'bg-red-500/10',
                text: 'text-red-700',
                border: 'border-red-500/20',
                dot: 'bg-red-700',
                label: 'Failed',
            },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
            >
                <span className={`size-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };

    const getInitialsBg = (color) => {
        const colorMap = {
            indigo: 'bg-indigo-500/10 text-indigo-700',
            pink: 'bg-pink-500/10 text-pink-700',
            blue: 'bg-blue-500/10 text-blue-700',
            teal: 'bg-teal-500/10 text-teal-700',
            orange: 'bg-orange-500/10 text-orange-700',
        };
        return colorMap[color] || 'bg-gray-500/10 text-gray-700';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            <header className="sticky top-0 z-20 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-[#E0E0E0] px-4 sm:px-6 lg:px-10 py-4">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-[#1F2937] text-2xl md:text-3xl font-black tracking-tight">
                            Collections
                        </h1>
                        <button className="flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#6366F1]/20">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Add Collection</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:px-10 pb-20 max-w-7xl mx-auto w-full flex flex-col gap-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 rounded-xl p-5 bg-white border border-[#E0E0E0] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-[#6366F1]">savings</span>
                        </div>
                        <p className="text-[#6B7280] text-sm font-medium">Total Collected</p>
                        <p className="text-[#1F2937] text-2xl font-bold tracking-tight">
                            {formatCurrency(stats.totalCollected)}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>+12% from last month</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl p-5 bg-white border border-[#E0E0E0] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-orange-600">pending_actions</span>
                        </div>
                        <p className="text-[#6B7280] text-sm font-medium">Pending Amount</p>
                        <p className="text-[#1F2937] text-2xl font-bold tracking-tight">
                            {formatCurrency(stats.pendingAmount)}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>5 invoices overdue</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl p-5 bg-white border border-[#E0E0E0] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-blue-600">payments</span>
                        </div>
                        <p className="text-[#6B7280] text-sm font-medium">Today's Total</p>
                        <p className="text-[#1F2937] text-2xl font-bold tracking-tight">
                            {formatCurrency(stats.todayTotal)}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#6B7280]">
                            <span>18 transactions today</span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-[#E0E0E0]">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#6B7280]">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="block w-full p-2.5 pl-10 text-sm text-[#1F2937] bg-gray-50 border border-[#E0E0E0] rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-[#6B7280]"
                            placeholder="Search by name, ID, or amount..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1F2937] bg-gray-50 border border-[#E0E0E0] rounded-lg hover:bg-gray-100 hover:border-[#6366F1] whitespace-nowrap">
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1F2937] bg-gray-50 border border-[#E0E0E0] rounded-lg hover:bg-gray-100 hover:border-[#6366F1] whitespace-nowrap">
                            <span className="material-symbols-outlined text-lg">calendar_month</span>
                            Date Range
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1F2937] bg-gray-50 border border-[#E0E0E0] rounded-lg hover:bg-gray-100 hover:border-[#6366F1] whitespace-nowrap">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="relative overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
                    <table className="w-full text-sm text-left text-[#6B7280]">
                        <thead className="text-xs text-[#1F2937] uppercase bg-gray-50 border-b border-[#E0E0E0]">
                            <tr>
                                <th className="p-4" scope="col">
                                    <div className="flex items-center">
                                        <input
                                            className="w-4 h-4 text-[#6366F1] bg-gray-200 border-[#E0E0E0] rounded focus:ring-[#6366F1] focus:ring-2"
                                            id="checkbox-all"
                                            type="checkbox"
                                            checked={selectedRows.length === collections.length && collections.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                        <label className="sr-only" htmlFor="checkbox-all">
                                            checkbox
                                        </label>
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                                    Payer
                                </th>
                                <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                                    Date
                                </th>
                                <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                                    Amount
                                </th>
                                <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                                    Status
                                </th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right" scope="col">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E0E0]">
                            {collections.map((collection, index) => (
                                <tr
                                    key={collection.id}
                                    className="bg-white hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                className="w-4 h-4 text-[#6366F1] bg-gray-200 border-[#E0E0E0] rounded focus:ring-[#6366F1] focus:ring-2"
                                                id={`checkbox-table-${index}`}
                                                type="checkbox"
                                                checked={selectedRows.includes(index)}
                                                onChange={() => handleSelectRow(index)}
                                            />
                                            <label className="sr-only" htmlFor={`checkbox-table-${index}`}>
                                                checkbox
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#1F2937] whitespace-nowrap">
                                        #{collection.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`size-8 rounded-full ${getInitialsBg(
                                                    collection.payer.color
                                                )} flex items-center justify-center font-bold text-xs`}
                                            >
                                                {collection.payer.initials}
                                            </div>
                                            <div className="text-[#1F2937] font-medium">{collection.payer.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {collection.date}
                                        <div className="text-xs text-[#6B7280]">{collection.time}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#1F2937]">
                                        {formatCurrency(collection.amount)}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(collection.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[#6B7280] hover:text-[#1F2937] p-1 rounded hover:bg-gray-100 transition-colors">
                                            <span className="material-symbols-outlined text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between p-4 border-t border-[#E0E0E0] bg-gray-50">
                        <span className="text-sm text-[#6B7280]">
                            Showing <span className="font-semibold text-[#1F2937]">1-5</span> of{' '}
                            <span className="font-semibold text-[#1F2937]">45</span>
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm font-medium text-[#1F2937] bg-gray-100 border border-[#E0E0E0] rounded-lg hover:bg-gray-200 disabled:opacity-50">
                                Previous
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-[#1F2937] bg-gray-100 border border-[#E0E0E0] rounded-lg hover:bg-gray-200">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


