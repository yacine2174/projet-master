import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { Recommandation, Constat, PlanAction } from '../../types/audit';

const RecommandationDetail: React.FC = () => {
  const { recommandationId } = useParams<{ recommandationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommandation, setRecommandation] = useState<Recommandation | null>(null);
  const [constat, setConstat] = useState<Constat | null>(null);
  const [planActions, setPlanActions] = useState<PlanAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    contenu: '',
    priorite: 'Moyenne',
    complexite: 'Moyenne',
    statut: 'en attente' as 'en attente' | 'validée' | 'à revoir'
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    if (recommandationId) {
      fetchRecommandation();
    }
  }, [recommandationId]);

  const fetchRecommandation = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get recommandation from localStorage
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
      const foundRecommandation = allRecommandations.find(r => r._id === recommandationId);

      if (foundRecommandation) {
        setRecommandation(foundRecommandation);
        setEditData({
          contenu: foundRecommandation.contenu,
          priorite: foundRecommandation.priorite,
          complexite: foundRecommandation.complexite,
          statut: foundRecommandation.statut
        });
        
        // Fetch associated constat and plan actions
        await fetchConstat(foundRecommandation.constat);
        await fetchPlanActions(foundRecommandation.plansAction);
      } else {
        setError('Recommandation non trouvée');
      }
    } catch (error: any) {
      setError('Erreur lors du chargement de la recommandation');
      console.error('Error fetching recommandation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConstat = async (constatId: string) => {
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
      const foundConstat = allConstats.find(c => c._id === constatId);
      setConstat(foundConstat || null);
    } catch (error: any) {
      console.error('Error fetching constat:', error);
    }
  };

  const fetchPlanActions = async (_planActionIds: string[]) => {
    try {
      // Get plan actions from localStorage
      const localStoragePlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      
      // Default mock plan actions
      const defaultPlanActions: PlanAction[] = [
        {
          _id: 'plan_1',
          titre: 'Plan de mise à jour des politiques de sécurité',
          description: 'Mise à jour complète des politiques de sécurité pour assurer la conformité ISO 27001',
          priorite: 'Élevée',
          statut: 'en attente',
          recommandations: ['recommandation_1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allPlanActions = [...defaultPlanActions, ...localStoragePlanActions];
      
      // Filter plan actions that belong to this recommandation
      const relatedPlanActions = allPlanActions.filter(pa => pa.recommandations.includes(recommandationId || ''));
      setPlanActions(relatedPlanActions);
    } catch (error: any) {
      console.error('Error fetching plan actions:', error);
    }
  };

  const handleSave = async () => {
    if (!recommandation) return;

    try {
      setIsLoading(true);
      setError('');

      const updatedRecommandation = {
        ...recommandation,
        ...editData,
        updatedAt: new Date().toISOString()
      };

      // Update in localStorage
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      const updatedRecommandations = localStorageRecommandations.map((r: Recommandation) =>
        r._id === recommandation._id ? updatedRecommandation : r
      );
      localStorage.setItem('recommandations', JSON.stringify(updatedRecommandations));

      setRecommandation(updatedRecommandation);
      setIsEditing(false);
      console.log('✅ Recommandation updated:', updatedRecommandation);
      alert('Recommandation mise à jour avec succès !');
    } catch (error: any) {
      setError('Erreur lors de la mise à jour');
      console.error('Error updating recommandation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recommandation) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recommandation ?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Remove from localStorage
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      const updatedRecommandations = localStorageRecommandations.filter((r: Recommandation) => r._id !== recommandation._id);
      localStorage.setItem('recommandations', JSON.stringify(updatedRecommandations));

      console.log('✅ Recommandation deleted:', recommandation._id);
      alert('Recommandation supprimée avec succès !');
      navigate('/recommandations');
    } catch (error: any) {
      setError('Erreur lors de la suppression');
      console.error('Error deleting recommandation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'Critique': return 'bg-red-100 text-red-800';
      case 'Élevée': return 'bg-orange-100 text-orange-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Faible': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-800 text-slate-200';
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validée': return 'bg-green-100 text-green-800';
      case 'en attente': return 'bg-yellow-100 text-yellow-800';
      case 'à revoir': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-800 text-slate-200';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de la recommandation...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !recommandation) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur</h2>
          <p className="text-gray-400 mb-4">{error || 'Recommandation non trouvée'}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">📋 Détails de la Recommandation</h1>
                <p className="text-slate-400 mt-1">ID: {recommandation._id}</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
                  🏠 Tableau de bord
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  ← Retour
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contenu de la recommandation
                  </label>
                  {isEditing ? (
                    <textarea
                      name="contenu"
                      value={editData.contenu}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-4 bg-slate-900 rounded-md">
                      <p className="text-white">{recommandation.contenu}</p>
                    </div>
                  )}
                </div>

                {/* Constat associé */}
                {constat && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Constat associé
                    </label>
                    <div className="p-4 bg-blue-500/10 rounded-md border border-blue-500/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-blue-300 font-medium">{constat.description}</p>
                          <div className="mt-2 flex space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(constat.criticite)}`}>
                              {constat.type}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                              {constat.criticite}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status and Priority */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Informations</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Priorité</label>
                      {isEditing ? (
                        <select
                          name="priorite"
                          value={editData.priorite}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Faible">Faible</option>
                          <option value="Moyenne">Moyenne</option>
                          <option value="Élevée">Élevée</option>
                          <option value="Critique">Critique</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommandation.priorite)}`}>
                          {recommandation.priorite}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Complexité</label>
                      {isEditing ? (
                        <select
                          name="complexite"
                          value={editData.complexite}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Faible">Faible</option>
                          <option value="Moyenne">Moyenne</option>
                          <option value="Élevée">Élevée</option>
                          <option value="Très élevée">Très élevée</option>
                        </select>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-200">
                          {recommandation.complexite}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
                      {isEditing ? (
                        <select
                          name="statut"
                          value={editData.statut}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="en attente">En attente</option>
                          <option value="validée">Validée</option>
                          <option value="à revoir">À revoir</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recommandation.statut)}`}>
                          {recommandation.statut}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Dates</h3>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div>
                      <span className="font-medium">Créée le:</span>
                      <br />
                      {new Date(recommandation.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Modifiée le:</span>
                      <br />
                      {new Date(recommandation.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions - SSI and RSSI can edit/delete */}
                {(isAdmin || isRSSI || isSSI) && (
                  <div className="bg-slate-900 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Actions</h3>
                    <div className="space-y-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isLoading}
                            className="w-full"
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                            className="w-full"
                          >
                            ✏️ Modifier
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            🗑️ Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Plan Actions */}
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">📋 Plans d'Action associés</h3>
                <p className="text-sm text-gray-500">{planActions.length} plan(s) d'action</p>
              </div>
              {(isAdmin || isRSSI || isSSI) && (
                <Link to={`/planactions/new?recommandation=${recommandationId}`}>
                  <Button variant="primary" size="sm">
                    + Ajouter un plan d'action
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="px-6 py-4">
            {planActions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">📋</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">Aucun plan d'action associé à cette recommandation</p>
                {(isAdmin || isRSSI || isSSI) && (
                  <Link to={`/planactions/new?recommandation=${recommandationId}`}>
                    <Button variant="outline" size="sm">
                      + Créer le premier plan d'action
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {planActions.map((plan) => (
                  <div key={plan._id} className="p-4 bg-slate-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">{plan.titre}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        plan.priorite === 'Élevée' ? 'bg-red-100 text-red-800' :
                        plan.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {plan.priorite}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{plan.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Créé le {new Date(plan.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <Link 
                        to={`/planactions/${plan._id}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {planActions.length > 0 && (
              <div className="mt-4">
                <Link to={`/planactions?recommandation=${recommandationId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Voir tous les plans d'action
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RecommandationDetail;