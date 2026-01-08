import { useState, useEffect } from 'react';
import { productsApi } from '../services/api';

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('storage/') || imagePath.startsWith('/storage/')) {
        return `/${imagePath.replace(/^\/?storage\//, 'storage/')}`;
    }
    return `/${imagePath}`;
};

const getStockStatus = (quantity) => {
    const qty = parseInt(quantity, 10) || 0;
    if (qty === 0) {
        return { status: 'out', label: 'Out of Stock', color: 'red', dot: 'bg-red-500' };
    }
    if (qty < 10) {
        return { status: 'low', label: 'Low Stock', color: 'orange', dot: 'bg-orange-500' };
    }
    return { status: 'in', label: 'In Stock', color: 'emerald', dot: 'bg-emerald-500' };
};

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('Any');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productsApi.getAll();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalItems = products.length;
        const lowStockCount = products.filter((p) => {
            const qty = parseInt(p.product_quantity, 10) || 0;
            return qty > 0 && qty < 10;
        }).length;
        const totalValue = products.reduce((sum, p) => {
            const price = parseFloat(p.product_price) || 0;
            const qty = parseInt(p.product_quantity, 10) || 0;
            return sum + price * qty;
        }, 0);

        return { totalItems, lowStockCount, totalValue };
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.product_description?.toLowerCase().includes(searchQuery.toLowerCase());

        const stockStatus = getStockStatus(product.product_quantity);
        const matchesStatus =
            statusFilter === 'Any' ||
            (statusFilter === 'In Stock' && stockStatus.status === 'in') ||
            (statusFilter === 'Low Stock' && stockStatus.status === 'low') ||
            (statusFilter === 'Out of Stock' && stockStatus.status === 'out');

        return matchesSearch && matchesStatus;
    });

    const stats = calculateStats();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
                <p className="text-[#6B7280]">Loading inventory...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#1F2937] tracking-tight text-2xl md:text-3xl font-bold leading-tight">
                            Inventory Management
                        </h1>
                        <p className="text-[#6B7280] text-sm font-normal">
                            Effortlessly track and manage your entire product inventory, stock levels, and pricing.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6B7280] bg-[#E0E0E0] px-2 py-1 rounded">
                            Last updated: Just now
                        </span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#E0E0E0] bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#6B7280] text-sm font-medium">Total Items</p>
                            <span className="material-symbols-outlined text-[#6366F1]">inventory_2</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-[#1F2937] text-2xl font-bold">{stats.totalItems}</p>
                            <span className="text-green-600 text-xs font-medium bg-green-100 px-1.5 py-0.5 rounded">
                                +5%
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#E0E0E0] bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#6B7280] text-sm font-medium">Low Stock Alerts</p>
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-[#1F2937] text-2xl font-bold">{stats.lowStockCount}</p>
                            <span className="text-orange-500 text-xs font-medium bg-orange-100 px-1.5 py-0.5 rounded">
                                Action needed
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#E0E0E0] bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#6B7280] text-sm font-medium">Total Value</p>
                            <span className="material-symbols-outlined text-green-500">attach_money</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-[#1F2937] text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                            <span className="text-green-600 text-xs font-medium bg-green-100 px-1.5 py-0.5 rounded">
                                +8%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
                    <div className="relative w-full lg:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[#6B7280] group-focus-within:text-[#1F2937] transition-colors">
                                search
                            </span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-[#E0E0E0] rounded-lg leading-5 bg-[#F8F9FA] text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] sm:text-sm"
                            placeholder="Search by name, SKU or category..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex gap-2 overflow-x-auto">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8F9FA] hover:bg-gray-100 transition-colors border border-[#E0E0E0] shrink-0">
                                <span className="text-[#1F2937] text-xs font-medium">Category: {categoryFilter}</span>
                                <span className="material-symbols-outlined text-[#1F2937] text-[18px]">expand_more</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8F9FA] hover:bg-gray-100 transition-colors border border-[#E0E0E0] shrink-0">
                                <span className="text-[#1F2937] text-xs font-medium">Status: {statusFilter}</span>
                                <span className="material-symbols-outlined text-[#1F2937] text-[18px]">expand_more</span>
                            </button>
                        </div>
                        <div className="h-8 w-[1px] bg-[#E0E0E0] hidden sm:block mx-1"></div>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#6366F1]/20 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Add Item</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex flex-col bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E0E0E0]">
                            <thead className="bg-[#F8F9FA]">
                                <tr>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                                        scope="col"
                                    >
                                        Product
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                                        scope="col"
                                    >
                                        Category
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                                        scope="col"
                                    >
                                        Stock Status
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                                        scope="col"
                                    >
                                        Price
                                    </th>
                                    <th
                                        className="px-6 py-4 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                                        scope="col"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0] bg-white">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-[#6B7280]">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const imageUrl = getImageUrl(product.product_image);
                                        const stockStatus = getStockStatus(product.product_quantity);
                                        const quantity = parseInt(product.product_quantity, 10) || 0;
                                        const price = parseFloat(product.product_price) || 0;

                                        return (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-gray-50 transition-colors group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[#F8F9FA] flex items-center justify-center overflow-hidden border border-[#E0E0E0]">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={product.product_name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[#6B7280]">
                                                                    image
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-[#1F2937]">
                                                                {product.product_name}
                                                            </div>
                                                            <div className="text-xs text-[#6B7280]">
                                                                SKU: {product.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#6B7280]">General</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`inline-flex h-2 w-2 rounded-full ${stockStatus.dot} ${
                                                                    stockStatus.status === 'low'
                                                                        ? 'animate-pulse'
                                                                        : ''
                                                                }`}
                                                            ></span>
                                                            <span
                                                                className={`text-sm font-medium ${
                                                                    stockStatus.status === 'out'
                                                                        ? 'text-red-600'
                                                                        : stockStatus.status === 'low'
                                                                        ? 'text-orange-600'
                                                                        : 'text-emerald-600'
                                                                }`}
                                                            >
                                                                {stockStatus.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-[#6B7280] pl-4">
                                                            {quantity} units
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#1F2937] font-medium">
                                                        {formatCurrency(price)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-[#6B7280] hover:text-[#1F2937] p-1 rounded hover:bg-[#F8F9FA]">
                                                            <span className="material-symbols-outlined text-[20px]">
                                                                edit
                                                            </span>
                                                        </button>
                                                        <button className="text-[#6B7280] hover:text-[#EF4444] p-1 rounded hover:bg-[#F8F9FA]">
                                                            <span className="material-symbols-outlined text-[20px]">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between px-6 py-3 border-t border-[#E0E0E0] bg-white">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-[#6B7280]">
                                    Showing <span className="font-medium text-[#1F2937]">1</span> to{' '}
                                    <span className="font-medium text-[#1F2937]">{filteredProducts.length}</span> of{' '}
                                    <span className="font-medium text-[#1F2937]">{products.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#E0E0E0] bg-[#F8F9FA] text-sm font-medium text-[#6B7280] hover:bg-gray-100">
                                        <span className="sr-only">Previous</span>
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-[#E0E0E0] bg-[#6366F1] text-sm font-medium text-white">
                                        1
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-[#E0E0E0] bg-[#F8F9FA] text-sm font-medium text-[#6B7280] hover:bg-gray-100">
                                        2
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-[#E0E0E0] bg-[#F8F9FA] text-sm font-medium text-[#6B7280] hover:bg-gray-100">
                                        3
                                    </button>
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#E0E0E0] bg-[#F8F9FA] text-sm font-medium text-[#6B7280] hover:bg-gray-100">
                                        <span className="sr-only">Next</span>
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


