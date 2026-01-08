import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Dashboard from './Dashboard';
import TaskList from './TaskList';
import Attendance from './Attendance';
import Stores from './Stores';
import Inventory from './Inventory';
import Collection from './Collection';
import OffTerritory from './OffTerritory';
import Reports from './Reports';
import Sidebar from './Sidebar';
import OfflineIndicator from './OfflineIndicator';
import AutoSync from './AutoSync';
import logo from '../logo.jpeg';

function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row overflow-x-hidden">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 w-full">
                {/* Mobile top bar with toggle */}
                <div className="lg:hidden flex items-center justify-between bg-white p-4 border-b border-[#E0E0E0] shadow-sm">
                    <h1 className="text-xl font-bold text-[#6366F1]">DDF</h1>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-md text-[#1F2937] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    >
                        <span className="material-symbols-outlined text-3xl">menu</span>
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto bg-[#F8F9FA]">
                    {children}
                </main>
                <OfflineIndicator />
                <AutoSync />
            </div>

            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col justify-between bg-white border-r border-[#E0E0E0] h-full transition-all duration-300 ease-in-out transform translate-x-0 lg:static lg:shadow-none shadow-xl">
                        <Sidebar />
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full p-2 bg-white text-[#1F2937] shadow-md lg:hidden"
                        >
                            <span className="sr-only">Close navigation</span>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <TaskList />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Attendance />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stores"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Stores />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Inventory />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/collection"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Collection />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/off-territory"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <OffTerritory />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

