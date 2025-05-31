import React from 'react';
import { Menu, Plus } from 'lucide-react';

interface MobileHeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    setIsModalOpen: (open: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    setIsModalOpen
}) => {
    return (
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
                type="button"
            >
                <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-gray-900">Cityscope</h1>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 p-2 rounded-lg text-white hover:bg-indigo-700"
                type="button"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
    );
};

export default MobileHeader;