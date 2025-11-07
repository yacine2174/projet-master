import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { Audit } from '../../types/audit';
import { useAuth } from '../../contexts/AuthContext';
import { auditAPI } from '../../api/api';

const AuditDashboard: React.FC = () => {
  const { user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch audits from backend API
      const apiAudits = await auditAPI.getAudits();
      setAudits(apiAudits);
    } catch (error: any) {
      setError('Erreur lors du chargement des audits');
      console.error('Error fetching audits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Planifié': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Planifié' },
      'En cours': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En cours' },
      'Terminé': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Terminé' },
      'En attente': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'En attente' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Planifié;
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Organisationnel': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Organisationnel' },
      'Technique': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Technique' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.Organisationnel;
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredAudits = audits.filter(audit => {
    const typeMatch = filterType === 'all' || audit.type === filterType;
    const statusMatch = filterStatus === 'all' || audit.statut === filterStatus;
    const searchMatch = !searchTerm || 
      (audit.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (audit.objectifs || '').toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🔍 Gestion des Audits</h2>
              <p className="text-gray-400 text-lg">
                Gérez vos audits de sécurité organisationnels et techniques
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/audits/new">
                <Button variant="primary" size="lg">
                  + Nouvel Audit
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="card mb-6 border-red-500 bg-red-500/10">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou objectifs..."
                className="input-field w-full"
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Type d'audit</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Tous les types</option>
                <option value="Organisationnel">Organisationnel</option>
                <option value="Technique">Technique</option>
              </select>
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Tous les statuts</option>
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audits List */}
        {filteredAudits.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucun audit trouvé</h3>
            <p className="text-gray-400 mb-6">
              {filterType !== 'all' || filterStatus !== 'all' 
                ? 'Aucun audit ne correspond aux filtres sélectionnés.'
                : 'Commencez par créer votre premier audit de sécurité.'
              }
            </p>
            {filterType === 'all' && filterStatus === 'all' && (
              <Link to="/audits/new">
                <Button variant="primary">Créer un audit</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="card p-0 overflow-hidden">
              <div className="professional-table">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Audit
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredAudits.map((audit) => (
                      <tr key={audit._id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white break-words leading-tight">{audit.nom}</div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">{audit.objectifs}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-fit">{getTypeBadge(audit.type)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300 leading-tight">
                            <div>{new Date(audit.dateDebut).toLocaleDateString('fr-FR')}</div>
                            <div>{new Date(audit.dateFin).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-fit">{getStatusBadge(audit.statut)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/audits/${audit._id}`}>
                            <Button variant="secondary" size="sm">
                              Voir
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredAudits.map((audit) => (
              <div key={audit._id} className="card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">{audit.nom}</h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{audit.objectifs}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {getStatusBadge(audit.statut)}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {getTypeBadge(audit.type)}
                  <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    {new Date(audit.dateDebut).toLocaleDateString('fr-FR')} - {new Date(audit.dateFin).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300">
                  <span className="font-medium text-gray-400">Périmètre:</span> {audit.perimetre}
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <Link to={`/audits/${audit._id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AuditDashboard;
