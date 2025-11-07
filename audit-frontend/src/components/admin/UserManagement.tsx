import React, { useState, useEffect } from 'react';
import { userAPI } from '../../api/api';
import type { User } from '../../api/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

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

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error: any) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const updatedUser = await userAPI.updateUser(userId, updates);
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
      setEditingUser(null);
    } catch (error: any) {
      setError('Erreur lors de la mise à jour');
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

  // Calculate statistics
  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    rssi: users.filter(u => u.role === 'RSSI').length,
    ssi: users.filter(u => u.role === 'SSI').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Utilisateurs</p>
              <p className="text-2xl font-semibold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">En Attente</p>
              <p className="text-2xl font-semibold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Approuvés</p>
              <p className="text-2xl font-semibold text-white">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Rejetés</p>
              <p className="text-2xl font-semibold text-white">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Administrateurs</p>
              <p className="text-xl font-semibold text-purple-600">{stats.admin}</p>
            </div>
            <span className="text-purple-600 text-2xl">🛡️</span>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">RSSI</p>
              <p className="text-xl font-semibold text-blue-600">{stats.rssi}</p>
            </div>
            <span className="text-blue-600 text-2xl">🔐</span>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">SSI</p>
              <p className="text-xl font-semibold text-green-600">{stats.ssi}</p>
            </div>
            <span className="text-green-600 text-2xl">🔒</span>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">Liste des Utilisateurs</h2>
              <p className="mt-1 text-sm text-gray-500">
                Gérez tous les comptes utilisateurs du système ({filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''})
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                🔄 Actualiser
              </Button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="px-6 py-3 bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              label="Rechercher"
              placeholder="Nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="🔍"
            />
            
            <Select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'pending', label: 'En attente' },
                { value: 'approved', label: 'Approuvé' },
                { value: 'rejected', label: 'Rejeté' }
              ]}
              icon="📊"
            />
            
            <Select
              label="Rôle"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tous les rôles' },
                { value: 'ADMIN', label: 'Administrateur' },
                { value: 'RSSI', label: 'RSSI' },
                { value: 'SSI', label: 'SSI' }
              ]}
              icon="👤"
            />
          </div>
        </div>

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
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière modification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                      ? 'Aucun utilisateur trouvé avec les filtres actuels'
                      : 'Aucun utilisateur trouvé'
                    }
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{user.nom}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">ID: {user._id.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleTimeString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                      <div className="text-xs text-gray-400">
                        {new Date(user.updatedAt).toLocaleTimeString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          ✏️ Modifier
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            🗑️ Supprimer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-slate-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">
                Modifier l'utilisateur
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateUser(editingUser._id, {
                  nom: formData.get('nom') as string,
                  role: formData.get('role') as 'ADMIN' | 'RSSI' | 'SSI',
                  status: formData.get('status') as 'pending' | 'approved' | 'rejected'
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      defaultValue={editingUser.nom}
                      className="mt-1 block w-full border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingUser.email}
                      className="mt-1 block w-full border border-slate-600 rounded-md px-3 py-2 bg-slate-800"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Rôle</label>
                    <select
                      name="role"
                      defaultValue={editingUser.role}
                      className="mt-1 block w-full border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="RSSI">RSSI</option>
                      <option value="SSI">SSI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Status</label>
                    <select
                      name="status"
                      defaultValue={editingUser.status}
                      className="mt-1 block w-full border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvé</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Sauvegarder
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
