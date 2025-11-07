import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import type { PlanAction, Recommandation } from '../../types/audit';

const PlanActionsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [planActions, setPlanActions] = useState<PlanAction[]>([]);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    fetchPlanActions();
    fetchRecommandations();
  }, []);

  const fetchRecommandations = async () => {
    try {
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
        }
      ];

      const allRecommandations = [...defaultRecommandations, ...localStorageRecommandations];
      setRecommandations(allRecommandations);
    } catch (error: any) {
      console.error('Error fetching recommandations:', error);
    }
  };

  const fetchPlanActions = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get plan actions from localStorage
      const localStoragePlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      
      // Default mock plan actions
      const defaultPlanActions: PlanAction[] = [
        {
          _id: 'planaction_1',
          titre: 'Plan de mise à jour des politiques de sécurité',
          description: 'Mettre à jour toutes les politiques de sécurité pour assurer la conformité ISO 27001',
          priorite: 'Élevée',
          statut: 'en cours',
          recommandations: ['recommandation_1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'planaction_2',
          titre: 'Plan de formation du personnel',
          description: 'Organiser des sessions de formation pour le personnel',
          priorite: 'Moyenne',
          statut: 'en attente',
          recommandations: ['recommandation_2'],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        },
        {
          _id: 'planaction_3',
          titre: 'Plan de monitoring des accès',
          description: 'Mettre en place un système de monitoring continu des accès utilisateurs',
          priorite: 'Critique',
          statut: 'en cours',
          recommandations: ['recommandation_1'],
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z'
        }
      ];

      const allPlanActions = [...defaultPlanActions, ...localStoragePlanActions];
      setPlanActions(allPlanActions);
    } catch (error: any) {
      setError('Erreur lors du chargement des plans d\'action');
      console.error('Error fetching plan actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommandationNames = (recommandationIds: string[]) => {
    return recommandationIds.map(id => {
      const recommandation = recommandations.find(r => r._id === id);
      return recommandation ? recommandation.contenu.substring(0, 50) + '...' : 'Recommandation non trouvée';
    });
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

  const filteredPlanActions = planActions.filter(planAction => {
    const matchesFilter = filter === 'all' || planAction.priorite === filter;
    const matchesSearch = searchTerm === '' || 
      (planAction.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (planAction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRecommandationNames(planAction.recommandations).some(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesFilter && matchesSearch;
  });

  const getStatistics = () => {
    const total = planActions.length;
    const critique = planActions.filter(p => p.priorite === 'Critique').length;
    const elevee = planActions.filter(p => p.priorite === 'Élevée').length;
    const moyenne = planActions.filter(p => p.priorite === 'Moyenne').length;
    const faible = planActions.filter(p => p.priorite === 'Faible').length;

    return { total, critique, elevee, moyenne, faible };
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">📅 Gestion des Plans d'Action</h2>
              <p className="text-gray-400 text-lg">
                {isAdmin ? 'Gérez tous les plans d\'action du système' : 
                 isRSSI ? 'Consultez et gérez les plans d\'action' : 
                 'Consultez les plans d\'action assignés'}
              </p>
            </div>
            {(isAdmin || isRSSI) && (
              <Link to="/planactions/new">
                <Button variant="primary" size="lg">
                  ➕ Nouveau Plan d'Action
                </Button>
              </Link>
            )}
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
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
            label="Critiques"
            value={stats.critique}
            accentColor="text-red-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Élevées"
            value={stats.elevee}
            accentColor="text-orange-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label="Moyennes"
            value={stats.moyenne}
            accentColor="text-yellow-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Faibles"
            value={stats.faible}
            accentColor="text-emerald-400"
          />
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Rechercher par titre, description ou recommandation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Priorité</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Toutes les priorités</option>
                <option value="Critique">Critique</option>
                <option value="Élevée">Élevée</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Plan Actions List */}
        {filteredPlanActions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucun plan d'action</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Aucun plan d\'action ne correspond à vos critères de recherche.'
                : 'Aucun plan d\'action n\'a été créé pour le moment.'
              }
            </p>
            {(isAdmin || isRSSI) && (
              <Link to="/planactions/new">
                <Button variant="primary">
                  ➕ Créer le premier plan d'action
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlanActions.map((planAction) => (
              <div key={planAction._id} className="card p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-white">
                        {planAction.titre || 'Plan d\'action sans titre'}
                      </h3>
                      {getPriorityBadge(planAction.priorite)}
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-4 space-y-2">
                      <p>{planAction.description}</p>
                      <div>
                        <p className="font-medium text-gray-400">Recommandations associées:</p>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {getRecommandationNames(planAction.recommandations).map((name, index) => (
                            <li key={index} className="text-xs text-gray-400">{name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <span>Créé le {new Date(planAction.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span className="mx-2">•</span>
                      <span>Modifié le {new Date(planAction.updatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/planactions/${planAction._id}`}
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
              <h3 className="text-sm font-medium text-blue-400">À propos des Plans d'Action</h3>
              <div className="mt-2 text-sm text-blue-300">
                <p>Les plans d'action permettent d'organiser et de structurer les actions correctives basées sur les recommandations.</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>Critique:</strong> Actions nécessitant une intervention immédiate</li>
                  <li><strong>Élevée:</strong> Actions importantes à traiter rapidement</li>
                  <li><strong>Moyenne:</strong> Actions standard à planifier</li>
                  <li><strong>Faible:</strong> Actions d'amélioration continue</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanActionsDashboard;