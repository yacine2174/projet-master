import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../common/AppLayout';
import UserApproval from './UserApproval';
import UserManagement from './UserManagement';
import PasswordRequests from './PasswordRequests';
import { userAPI, passwordResetAPI } from '../../api/api'; // Implementing API calls

// Stats Card Component
const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

// Quick Action Component
const QuickAction = ({ title, description, icon, onClick, color }: { title: string; description: string; icon: string; onClick: () => void; color: string }) => (
  <button
    onClick={onClick}
    className={`bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition-all duration-200 text-left group border border-gray-700 hover:border-${color}-500`}
  >
    <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <span className="text-xl">{icon}</span>
    </div>
    <h3 className="font-semibold text-white">{title}</h3>
    <p className="text-sm text-gray-400 mt-1">{description}</p>
  </button>
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'approval' | 'management' | 'password'>('approval');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    passwordResets: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { 
      id: 'approval' as const, 
      name: 'Approbations', 
      icon: '👥', 
      count: stats.pendingApprovals > 0 ? stats.pendingApprovals : undefined 
    },
    { 
      id: 'management' as const, 
      name: 'Gestion Utilisateurs', 
      icon: '👤' 
    },
    { 
      id: 'password' as const, 
      name: 'Réinitialisation MDP', 
      icon: '🔑', 
      count: stats.passwordResets > 0 ? stats.passwordResets : undefined 
    },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all users
        const users = await userAPI.getAllUsers();
        const pendingApprovals = users.filter(u => u.status === 'pending').length;
        const activeUsers = users.filter(u => u.status === 'approved').length;
        
        // Fetch password reset requests
        const resetRequests = await passwordResetAPI.getPasswordResetRequests();
        const pendingResets = resetRequests.filter(r => r.status === 'pending').length;
        
        setStats({
          totalUsers: users.length,
          pendingApprovals,
          passwordResets: pendingResets,
          activeUsers,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Optionally set error state to show to user
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addUser':
        setActiveTab('management');
        // Additional logic to open add user modal if needed
        break;
      case 'exportData':
        // Handle export logic
        break;
      case 'settings':
        // Navigate to settings
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Tableau de Bord Admin</h1>
              <p className="mt-2 text-gray-400">Gérez les utilisateurs, les autorisations et les paramètres système</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                <span>📊 Exporter les données</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Utilisateurs Totaux" 
            value={stats.totalUsers} 
            icon="👥" 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Approbations en attente" 
            value={stats.pendingApprovals} 
            icon="⏳" 
            color="bg-yellow-500"
          />
          <StatCard 
            title="Utilisateurs Actifs" 
            value={stats.activeUsers} 
            icon="✅" 
            color="bg-green-500"
          />
          <StatCard 
            title="Réinitialisations MDP" 
            value={stats.passwordResets} 
            icon="🔑" 
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              title="Ajouter un Utilisateur"
              description="Créer un nouveau compte utilisateur"
              icon="👤"
              onClick={() => handleQuickAction('addUser')}
              color="blue"
            />
            <QuickAction
              title="Exporter les Données"
              description="Télécharger les données utilisateurs"
              icon="📥"
              onClick={() => handleQuickAction('exportData')}
              color="green"
            />
            <QuickAction
              title="Paramètres Système"
              description="Configurer les paramètres de l'application"
              icon="⚙️"
              onClick={() => handleQuickAction('settings')}
              color="purple"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                  {tab.count && tab.count > 0 && (
                    <span className="ml-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'approval' && <UserApproval />}
            {activeTab === 'management' && <UserManagement />}
            {activeTab === 'password' && <PasswordRequests />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard; 
