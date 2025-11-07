import React, { useState, useEffect } from 'react';
import { passwordResetAPI } from '../../api/api';
import type { PasswordResetRequest } from '../../api/api';
import Button from '../common/Button';

const PasswordRequests: React.FC = () => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('🔄 Fetching password reset requests...');
      const allRequests = await passwordResetAPI.getPasswordResetRequests();
      console.log('✅ Password reset requests received:', allRequests);
      setRequests(allRequests);
    } catch (error: any) {
      console.error('💥 Error fetching password reset requests:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, notes?: string) => {
    try {
      await passwordResetAPI.approvePasswordReset(requestId, notes);
      setRequests(requests.map(r => 
        r._id === requestId ? { ...r, status: 'approved' as const } : r
      ));
    } catch (error: any) {
      setError('Erreur lors de l\'approbation');
    }
  };

  const handleRejectRequest = async (requestId: string, notes?: string) => {
    try {
      await passwordResetAPI.rejectPasswordReset(requestId, notes);
      setRequests(requests.map(r => 
        r._id === requestId ? { ...r, status: 'rejected' as const } : r
      ));
    } catch (error: any) {
      setError('Erreur lors du rejet');
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
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Terminé</span>;
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

  const pendingRequests = requests.filter(request => request.status === 'pending');

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
        <h2 className="text-lg font-medium text-white">Demandes de réinitialisation de mot de passe</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les demandes de réinitialisation de mot de passe des utilisateurs
        </p>
      </div>
      
      {error && (
        <div className="px-6 py-3 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">Aucune demande de réinitialisation en attente</p>
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
                  Date de demande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <tr key={request._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{request.userName}</div>
                      <div className="text-sm text-gray-500">{request.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(request.userRole)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          const notes = prompt('Notes (optionnel):');
                          handleApproveRequest(request._id, notes || undefined);
                        }}
                      >
                        Approuver
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const notes = prompt('Raison du rejet (optionnel):');
                          handleRejectRequest(request._id, notes || undefined);
                        }}
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

      {/* Approved Requests */}
      {requests.filter(r => r.status === 'approved').length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Demandes approuvées</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Date d'approbation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-gray-200">
                {requests.filter(r => r.status === 'approved').map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Approuvée - L'utilisateur peut réinitialiser
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Requests History */}
      {requests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Historique complet des demandes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de traitement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.adminNotes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordRequests;
