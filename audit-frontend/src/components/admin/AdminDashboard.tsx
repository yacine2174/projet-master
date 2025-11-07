import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../common/AppLayout';
import UserApproval from './UserApproval';
import UserManagement from './UserManagement';
import PasswordRequests from './PasswordRequests';
import AuditDashboard from '../audit/AuditDashboard';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'approval' | 'management' | 'password' | 'audits'>('approval');

  const tabs = [
    { id: 'approval', name: 'Approbation', icon: '✅' },
    { id: 'management', name: 'Gestion', icon: '👥' },
    { id: 'password', name: 'Réinitialisation', icon: '🔐' },
    { id: 'audits', name: 'Audits', icon: '🔍' }
  ];

  return (
    <AppLayout>
      <div className="max-w-full mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Administration 👨‍💼
          </h2>
          <p className="text-gray-400 text-lg">
            Gestion des utilisateurs, approbations et configuration système
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-6 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'approval' && <UserApproval />}
          {activeTab === 'management' && <UserManagement />}
          {activeTab === 'password' && <PasswordRequests />}
          {activeTab === 'audits' && <AuditDashboard />}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard; 
