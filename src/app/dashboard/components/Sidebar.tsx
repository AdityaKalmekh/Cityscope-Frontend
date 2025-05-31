import React from 'react';
import { Home, Plus, MapPin, X, User } from 'lucide-react';
import { ActiveTab } from './types';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    setIsModalOpen: (open: boolean) => void;
    userCity: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    setIsModalOpen,
    userCity
}) => {
    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Cityscope</h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <button
                            onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === 'home'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            type="button"
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Home</span>
                        </button>

                        <button
                            onClick={() => { setIsModalOpen(true); setIsSidebarOpen(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            type="button"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Create Post</span>
                        </button>
                    </nav>

                    <div className="p-4 border-t">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 p-2 rounded-full">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Current User</p>
                                <p className="text-sm text-gray-500">📍 {userCity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;