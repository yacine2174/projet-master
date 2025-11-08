import React, { useState, useEffect } from 'react';
import { userAPI } from '../../api/api';
import type { User } from '../../api/api';
import Button from '../common/Button';

const UserApproval: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await userAPI.getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      console.log('Attempting to approve user:', userId);
      const userToApprove = users.find(u => u._id === userId);
      console.log('User to approve:', userToApprove);
      
      const result = await userAPI.approveUser(userId);
      console.log('Approval API response:', result);
      
      setUsers(users.map(u => 
        u._id === userId ? { ...u, status: 'approved' as const } : u
      ));
    } catch (error: any) {
      console.error('Error in handleApproveUser:', error);
      setError(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      console.log('Attempting to reject user:', userId);
      const userToReject = users.find(u => u._id === userId);
      console.log('User to reject:', userToReject);
      
      const result = await userAPI.rejectUser(userId);
      console.log('Rejection API response:', result);
      
      setUsers(users.map(u => 
        u._id === userId ? { ...u, status: 'rejected' as const } : u
      ));
    } catch (error: any) {
      console.error('Error in handleRejectUser:', error);
      setError(`Erreur lors du rejet: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En attente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejeté</span>;
      default:
        return <span className="px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-full">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Admin</span>;
      case 'RSSI':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">RSSI</span>;
      case 'SSI':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">SSI</span>;
      default:
        return <span className="px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-full">{role}</span>;
    }
  };

  const pendingUsers = users.filter(user => user.status === 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-medium text-white">Approbation des utilisateurs</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les demandes d'inscription en attente d'approbation
        </p>
      </div>
      
      {error && (
        <div className="px-6 py-3 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">Aucun utilisateur en attente d'approbation</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{user.nom}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApproveUser(user._id)}
                      >
                        Approuver
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectUser(user._id)}
                      >
                        Rejeter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserApproval;
