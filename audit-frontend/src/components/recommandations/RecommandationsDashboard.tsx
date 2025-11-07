import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import type { Recommandation, Constat } from '../../types/audit';

const RecommandationsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [constats, setConstats] = useState<Constat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'Admin';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    fetchRecommandations();
    fetchConstats();
  }, []);

  const fetchConstats = async () => {
    try {
      // Get constats from localStorage
      const localStorageConstats = JSON.parse(localStorage.getItem('constats') || '[]');
      
      // Default mock constats
      const defaultConstats: Constat[] = [
        {
          _id: 'constat_1',
          description: 'Non-conformité majeure dans la gestion des accès',
          type: 'NC maj',
          criticite: 'Élevée',
          impact: 'Sécurité compromise',
          probabilite: 'Élevée',
          audit: 'audit_1',
          projet: 'projet_1',
          recommandations: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'constat_2',
          description: 'Non-conformité mineure dans la documentation',
          type: 'NC min',
          criticite: 'Faible',
          impact: 'Conformité documentaire',
          probabilite: 'Moyenne',
          audit: 'audit_2',
          projet: 'projet_2',
          recommandations: [],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      const allConstats = [...defaultConstats, ...localStorageConstats];
      setConstats(allConstats);
    } catch (error: any) {
      console.error('Error fetching constats:', error);
    }
  };

  const fetchRecommandations = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get recommandations from localStorage
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      
      // Default mock recommandations
      const defaultRecommandations: Recommandation[] = [
        {
          _id: 'recommandation_1',
          contenu: 'Mise à jour des politiques de sécurité pour assurer la conformité ISO 27001',
          priorite: 'Élevée',
          complexite: 'Moyenne',
          statut: 'en attente',
          constat: 'constat_1',
          plansAction: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'recommandation_2',
          contenu: 'Formation du personnel sur les bonnes pratiques de sécurité',
          priorite: 'Moyenne',
          complexite: 'Faible',
          statut: 'validée',
          constat: 'constat_2',
          plansAction: [],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        },
        {
          _id: 'recommandation_3',
          contenu: 'Mise en place d\'un système de monitoring des accès',
          priorite: 'Critique',
          complexite: 'Élevée',
          statut: 'à revoir',
          constat: 'constat_1',
          plansAction: [],
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z'
        }
      ];

      const allRecommandations = [...defaultRecommandations, ...localStorageRecommandations];
      console.log('📋 Loaded recommandations:', allRecommandations.length, allRecommandations);
      console.log('🔍 Recommandations with missing properties:', allRecommandations.filter(r => !r.contenu || !r.priorite || !r.statut));
      setRecommandations(allRecommandations);
    } catch (error: any) {
      setError('Erreur lors du chargement des recommandations');
      console.error('Error fetching recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConstatName = (constatId: string) => {
    const constat = constats.find(c => c._id === constatId);
    return constat ? constat.description : 'Constat non trouvé';
  };

  const getPriorityBadge = (priorite: string) => {
    const priorityConfig = {
      'Critique': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critique' },
      'Élevée': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Élevée' },
      'Moyenne': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moyenne' },
      'Faible': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Faible' }
    };

    const config = priorityConfig[priorite as keyof typeof priorityConfig] || priorityConfig['Faible'];
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'validée': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Validée' },
      'en attente': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En attente' },
      'à revoir': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'À revoir' }
    };

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['en attente'];
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredRecommandations = recommandations.filter(recommandation => {
    const matchesFilter = filter === 'all' || (recommandation.statut || 'en attente') === filter;
    const matchesSearch = searchTerm === '' || 
      (recommandation.contenu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getConstatName(recommandation.constat || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatistics = () => {
    const total = recommandations.length;
    const enAttente = recommandations.filter(r => (r.statut || 'en attente') === 'en attente').length;
    const validees = recommandations.filter(r => (r.statut || 'en attente') === 'validée').length;
    const aRevoir = recommandations.filter(r => (r.statut || 'en attente') === 'à revoir').length;
    const critiques = recommandations.filter(r => (r.priorite || 'Faible') === 'Critique').length;

    return { total, enAttente, validees, aRevoir, critiques };
  };

  const stats = getStatistics();

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
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">💡 Gestion des Recommandations</h2>
            <p className="text-gray-400 text-lg">
              {isAdmin ? 'Gérez toutes les recommandations du système' : 
               isRSSI ? 'Consultez et gérez les recommandations' : 
               'Consultez les recommandations assignées'}
            </p>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Total"
            value={stats.total}
            accentColor="text-gray-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="En attente"
            value={stats.enAttente}
            accentColor="text-yellow-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Validées"
            value={stats.validees}
            accentColor="text-emerald-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            label="À revoir"
            value={stats.aRevoir}
            accentColor="text-red-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
            label="Critiques"
            value={stats.critiques}
            accentColor="text-red-400"
          />
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Rechercher par contenu ou constat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Tous les statuts</option>
                <option value="en attente">En attente</option>
                <option value="validée">Validées</option>
                <option value="à revoir">À revoir</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recommandations List */}
        {filteredRecommandations.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">💡</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucune recommandation</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Aucune recommandation ne correspond à vos critères de recherche.'
                : 'Aucune recommandation n\'a été créée pour le moment. Les recommandations sont créées depuis les pages de constats.'
              }
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/constats'}
            >
              🔍 Voir les constats
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommandations.map((recommandation) => (
              <div key={recommandation._id} className="card p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-white">
                        {recommandation.contenu && recommandation.contenu.length > 100 
                          ? `${recommandation.contenu.substring(0, 100)}...` 
                          : recommandation.contenu || 'Contenu non disponible'
                        }
                      </h3>
                      {getPriorityBadge(recommandation.priorite || 'Faible')}
                      {getStatusBadge(recommandation.statut || 'en attente')}
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-4 space-y-2">
                      <p><span className="font-medium text-gray-400">Constat:</span> {getConstatName(recommandation.constat || '')}</p>
                      <p><span className="font-medium text-gray-400">Complexité:</span> {recommandation.complexite || 'Non définie'}</p>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <span>Créée le {recommandation.createdAt ? new Date(recommandation.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                      <span className="mx-2">•</span>
                      <span>Modifiée le {recommandation.updatedAt ? new Date(recommandation.updatedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/recommandations/${recommandation._id}`}
                      className="btn-primary text-sm"
                    >
                      👁️ Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 card border-blue-500 bg-blue-500/10">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-400">À propos des Recommandations</h3>
              <div className="mt-2 text-sm text-blue-300">
                <p>Les recommandations sont créées à partir des constats d'audit et permettent de proposer des actions correctives.</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>En attente:</strong> Recommandation en cours d'évaluation</li>
                  <li><strong>Validée:</strong> Recommandation approuvée et prête à être implémentée</li>
                  <li><strong>À revoir:</strong> Recommandation nécessitant des modifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RecommandationsDashboard;