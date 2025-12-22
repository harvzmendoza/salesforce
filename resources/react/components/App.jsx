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

function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a] flex flex-col md:flex-row">
            {/* Desktop sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 w-full">
                {/* Mobile top bar with toggle */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span className="sr-only">Open navigation</span>
                        <span className="text-xl">☰</span>
                    </button>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Salesforce
                    </span>
                </div>

                {children}
                <OfflineIndicator />
                <AutoSync />
            </div>

            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="relative z-50 max-w-xs w-full h-full">
                        <Sidebar />
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full p-2 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200 shadow-md md:hidden"
                        >
                            <span className="sr-only">Close navigation</span>
                            ✕
                        </button>
                    </div>
                </div>
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

