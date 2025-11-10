import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: '🏠', path: user?.role === 'ADMIN' ? '/admin' : (user?.role === 'RSSI' ? '/rssi' : '/ssi'), roles: ['ADMIN', 'SSI', 'RSSI'] },
    { name: 'Projets', icon: '📋', path: '/projects', roles: ['SSI', 'RSSI'] },
    { name: 'Constats', icon: '📌', path: '/constats', roles: ['SSI', 'RSSI'] },
    { name: 'Recommandations', icon: '💡', path: '/recommandations', roles: ['SSI', 'RSSI'] },
    { name: "Plans d'Action", icon: '📅', path: '/planactions', roles: ['SSI', 'RSSI'] },
    { name: 'Preuves', icon: '📁', path: '/preuves', roles: ['SSI', 'RSSI'] },
    { name: 'Rapports', icon: '📊', path: '/reports', roles: ['SSI', 'RSSI'] },
    { name: 'Admin', icon: '⚙️', path: '/admin', roles: ['ADMIN'] },
  ];

  return (
    <aside className={`sidebar fixed top-0 left-0 h-full z-30 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-[var(--gray-900)] border-r border-[var(--gray-border)] flex flex-col`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--gray-border)]">
        <Link to={user?.role === 'ADMIN' ? '/admin' : (user?.role === 'RSSI' ? '/rssi' : '/ssi')} className={`flex items-center space-x-3 ${!isSidebarOpen && 'justify-center'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          {isSidebarOpen && <span className="text-white font-semibold text-lg">CybriX</span>}
        </Link>
        {isSidebarOpen && (
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          if (item.roles.includes(user?.role || '')) {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[var(--gray-800)] hover:text-white'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          }
          return null;
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[var(--gray-border)]">
        <Link to="/profile" className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[var(--gray-800)] hover:text-white transition-colors duration-200 ${!isSidebarOpen && 'justify-center'}`}>
          <span className="text-xl">⚙️</span>
          {isSidebarOpen && <span className="font-medium">Paramètres</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;