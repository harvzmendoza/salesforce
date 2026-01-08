import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.jpeg';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        { path: '/attendance', label: 'Attendance', icon: 'schedule', color: 'text-primary' },
        { path: '/dashboard', label: 'Dashboard', icon: 'bar_chart', color: 'text-success' },
        { path: '/inventory', label: 'Inventory', icon: 'inventory_2', color: 'text-orange-500' },
        { path: '/collection', label: 'Collection', icon: 'attach_money', color: 'text-amber-500' },
        { path: '/stores', label: 'Stores', icon: 'storefront', color: 'text-emerald-600' },
        { path: '/off-territory', label: 'Off-Territory', icon: 'location_off', color: 'text-red-500' },
        { path: '/reports', label: 'Reports', icon: 'summarize', color: 'text-gray-500' },
    ];

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="w-64 bg-white border-r border-[#E0E0E0] min-h-screen flex flex-col">
            <div className="p-6 flex flex-col items-center border-b border-[#E0E0E0]">
                <div className="w-24 h-24 mb-3 relative flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                        src={logo} 
                        alt="Salesforce" 
                        className="h-16 w-auto"
                    />
                </div>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-[#6366F1] tracking-wider">DDF</h1>
                    <p className="text-[0.6rem] font-medium uppercase text-[#6B7280] leading-tight">International Development Inc.</p>
                </div>
            </div>

            <nav className="flex-1 mt-6 px-3 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center px-3 py-3 text-sm md:text-base font-medium rounded-md transition-colors relative ${
                            isActive(item.path)
                                ? 'bg-[#6366F1]/10 text-[#6366F1]'
                                : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#1F2937]'
                        }`}
                    >
                        <span className={`material-symbols-outlined mr-3 text-xl ${isActive(item.path) ? 'text-[#6366F1]' : item.color}`}>
                            {item.icon}
                        </span>
                        {item.label}
                        {isActive(item.path) && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#6366F1] rounded-r-md"></div>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="border-t border-[#E0E0E0] p-4">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                            {userInitial}
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm md:text-base font-medium text-[#1F2937]">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-[#6B7280] truncate w-32" title={user?.email}>
                            {user?.email || ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium text-[#EF4444] hover:bg-red-50 rounded-md transition-colors"
                >
                    <span className="material-symbols-outlined mr-2 text-lg">logout</span>
                    Logout
                </button>
            </div>
        </div>
    );
}

