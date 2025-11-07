import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { PlanAction, Recommandation, Constat } from '../../types/audit';

const PlanActionDetail: React.FC = () => {
  const { planActionId } = useParams<{ planActionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [planAction, setPlanAction] = useState<PlanAction | null>(null);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [constats, setConstats] = useState<Constat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    titre: '',
    description: '',
    priorite: 'Moyenne'
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    if (planActionId) {
      fetchPlanAction();
    }
  }, [planActionId]);

  const fetchPlanAction = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get plan action from localStorage
      const localStoragePlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      
      // Default mock plan actions
      const defaultPlanActions: PlanAction[] = [
        {
          _id: 'planaction_1',
          titre: 'Plan de mise à jour des politiques de sécurité',
          description: 'Mettre à jour toutes les politiques de sécurité pour assurer la conformité ISO 27001',
          priorite: 'Élevée',
          recommandations: ['recommandation_1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'planaction_2',
          titre: 'Plan de formation du personnel',
          description: 'Organiser des sessions de formation pour le personnel',
          priorite: 'Moyenne',
          recommandations: ['recommandation_2'],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      const allPlanActions = [...defaultPlanActions, ...localStoragePlanActions];
      const foundPlanAction = allPlanActions.find(p => p._id === planActionId);

      if (foundPlanAction) {
        setPlanAction(foundPlanAction);
        setEditData({
          titre: foundPlanAction.titre,
          description: foundPlanAction.description,
          priorite: foundPlanAction.priorite
        });
        
        // Fetch associated recommandations
        await fetchRecommandations(foundPlanAction.recommandations);
        // Fetch associated constats through recommendations
        await fetchConstats(foundPlanAction.recommandations);
      } else {
        setError('Plan d\'action non trouvé');
      }
    } catch (error: any) {
      setError('Erreur lors du chargement du plan d\'action');
      console.error('Error fetching plan action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommandations = async (recommandationIds: string[]) => {
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
      const foundRecommandations = allRecommandations.filter(r => recommandationIds.includes(r._id));
      setRecommandations(foundRecommandations);
    } catch (error: any) {
      console.error('Error fetching recommandations:', error);
    }
  };

  const fetchConstats = async (recommandationIds: string[]) => {
    try {
      // Get constats from localStorage
      const localStorageConstats = JSON.parse(localStorage.getItem('constats') || '[]');
      
      // Default mock constats
      const defaultConstats: Constat[] = [
        {
          _id: 'constat_1',
          description: 'Non-conformité majeure dans la gestion des mots de passe',
          type: 'NC maj',
          criticite: 'Élevée',
          impact: 'Risque de compromission des comptes utilisateurs',
          probabilite: 'Moyenne',
          audit: 'audit_1',
          projet: 'projet_1',
          recommandations: ['recommandation_1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'constat_2',
          description: 'Formation insuffisante du personnel sur la sécurité',
          type: 'NC min',
          criticite: 'Moyenne',
          impact: 'Risque d\'erreurs humaines',
          probabilite: 'Élevée',
          audit: 'audit_1',
          projet: 'projet_1',
          recommandations: ['recommandation_2'],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      const allConstats = [...defaultConstats, ...localStorageConstats];
      
      // Get constat IDs from recommendations
      const constatIds = recommandations
        .filter(r => recommandationIds.includes(r._id))
        .map(r => r.constat)
        .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
      
      const foundConstats = allConstats.filter(c => constatIds.includes(c._id));
      setConstats(foundConstats);
    } catch (error: any) {
      console.error('Error fetching constats:', error);
    }
  };

  const handleSave = async () => {
    if (!planAction) return;

    try {
      setIsLoading(true);
      setError('');

      const updatedPlanAction = {
        ...planAction,
        ...editData,
        updatedAt: new Date().toISOString()
      };

      // Update in localStorage
      const localStoragePlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      const updatedPlanActions = localStoragePlanActions.map((p: PlanAction) =>
        p._id === planAction._id ? updatedPlanAction : p
      );
      localStorage.setItem('planActions', JSON.stringify(updatedPlanActions));

      setPlanAction(updatedPlanAction);
      setIsEditing(false);
      console.log('✅ Plan Action updated:', updatedPlanAction);
      alert('Plan d\'action mis à jour avec succès !');
    } catch (error: any) {
      setError('Erreur lors de la mise à jour');
      console.error('Error updating plan action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!planAction) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plan d\'action ?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Remove from localStorage
      const localStoragePlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      const updatedPlanActions = localStoragePlanActions.filter((p: PlanAction) => p._id !== planAction._id);
      localStorage.setItem('planActions', JSON.stringify(updatedPlanActions));

      // Remove from recommandations
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      const updatedRecommandations = localStorageRecommandations.map((r: Recommandation) => ({
        ...r,
        plansAction: r.plansAction.filter(id => id !== planAction._id),
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem('recommandations', JSON.stringify(updatedRecommandations));

      console.log('✅ Plan Action deleted:', planAction._id);
      alert('Plan d\'action supprimé avec succès !');
      navigate('/planactions');
    } catch (error: any) {
      setError('Erreur lors de la suppression');
      console.error('Error deleting plan action:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement du plan d'action...</p>
        </div>
      </div>
    );
  }

  if (error || !planAction) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur</h2>
          <p className="text-slate-400 mb-4">{error || 'Plan d\'action non trouvé'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">📅 Détails du Plan d'Action</h1>
                <p className="text-slate-400 mt-1">ID: {planAction._id}</p>
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
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre du plan d'action
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="titre"
                      value={editData.titre}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  ) : (
                    <div className="p-4 bg-gray-800 rounded-md">
                      <p className="text-white font-medium">{planAction.titre}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-4 bg-slate-900 rounded-md">
                      <p className="text-white">{planAction.description}</p>
                    </div>
                  )}
                </div>

                {/* Recommandations associées */}
                {recommandations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Recommandations associées ({recommandations.length})
                    </label>
                    <div className="space-y-3">
                      {recommandations.map((recommandation) => (
                        <div key={recommandation._id} className="p-4 bg-blue-500/10 rounded-md border border-blue-500/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-blue-300 font-medium">{recommandation.contenu}</p>
                              <div className="mt-2 flex space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  recommandation.priorite === 'Critique' ? 'bg-red-100 text-red-800' :
                                  recommandation.priorite === 'Élevée' ? 'bg-orange-100 text-orange-800' :
                                  recommandation.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {recommandation.priorite}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  recommandation.statut === 'validée' ? 'bg-green-100 text-green-800' :
                                  recommandation.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {recommandation.statut}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                                  {recommandation.complexite}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/recommandations/${recommandation._id}`)}
                                className="text-xs"
                              >
                                Voir
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constats associés */}
                {constats.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Constats associés ({constats.length})
                    </label>
                    <div className="space-y-3">
                      {constats.map((constat) => (
                        <div key={constat._id} className="p-4 bg-orange-50 rounded-md border border-orange-200">
                          <p className="text-orange-900 font-medium">{constat.description}</p>
                          <div className="mt-2 flex space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              constat.type === 'NC maj' ? 'bg-red-100 text-red-800' :
                              constat.type === 'NC min' ? 'bg-orange-100 text-orange-800' :
                              constat.type === 'PS' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {constat.type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              constat.criticite === 'Critique' ? 'bg-red-100 text-red-800' :
                              constat.criticite === 'Élevée' ? 'bg-orange-100 text-orange-800' :
                              constat.criticite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {constat.criticite}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-200">
                              {constat.probabilite}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Priorité */}
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
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(planAction.priorite)}`}>
                          {planAction.priorite}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Recommandations</label>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {planAction.recommandations.length} associée(s)
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Constats</label>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {constats.length} associé(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Dates</h3>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div>
                      <span className="font-medium">Créé le:</span>
                      <br />
                      {new Date(planAction.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Modifié le:</span>
                      <br />
                      {new Date(planAction.updatedAt).toLocaleDateString('fr-FR', {
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
      </div>
    </AppLayout>
  );
};

export default PlanActionDetail;

