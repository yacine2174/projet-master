import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { NotificationBell } from './NotificationSystem';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[var(--gray-bg)] text-white">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-[var(--gray-900)] border-b border-[var(--gray-border)] h-16 flex items-center justify-between px-6 shadow-lg">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="flex items-center space-x-2 px-3 py-2 bg-[var(--gray-800)] rounded-lg">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
                </span>
              </div>
              <div className="text-sm">
                <div className="text-white font-medium">{user?.nom} {user?.prenom}</div>
                <div className="text-gray-300 text-xs">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-[var(--gray-900)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;


