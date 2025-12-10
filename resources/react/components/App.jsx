import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Dashboard from './Dashboard';
import TaskList from './TaskList';
import Attendance from './Attendance';
import Sidebar from './Sidebar';
import OfflineIndicator from './OfflineIndicator';

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
                                <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a] flex">
                                    <Sidebar />
                                    <div className="flex-1">
                                        <Dashboard />
                                        <OfflineIndicator />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a] flex">
                                    <Sidebar />
                                    <div className="flex-1">
                                        <TaskList />
                                        <OfflineIndicator />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a] flex">
                                    <Sidebar />
                                    <div className="flex-1">
                                        <Attendance />
                                        <OfflineIndicator />
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

