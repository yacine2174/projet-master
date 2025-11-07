import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { CreatePlanActionData, Recommandation } from '../../types/audit';

const CreatePlanAction: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreatePlanActionData>({
    titre: '',
    description: '',
    priorite: 'Moyenne',
    statut: 'en attente', // Always starts as "en attente"
    recommandations: searchParams.get('recommandation') ? [searchParams.get('recommandation')!] : []
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';

  useEffect(() => {
    fetchRecommandations();
  }, []);

  // Update formData when searchParams change
  useEffect(() => {
    const recommandationId = searchParams.get('recommandation');
    if (recommandationId) {
      setFormData(prev => ({
        ...prev,
        recommandations: [recommandationId]
      }));
    }
  }, [searchParams]);

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
      setRecommandations(allRecommandations);
    } catch (error: any) {
      console.error('Error fetching recommandations:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.titre.trim()) {
      setError('Le titre du plan d\'action est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (formData.recommandations.length === 0) {
      setError('Veuillez sélectionner au moins une recommandation');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Create plan action data
      const newPlanAction = {
        _id: `planaction_${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const localStoragePlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      localStoragePlanActions.push(newPlanAction);
      localStorage.setItem('planActions', JSON.stringify(localStoragePlanActions));

      // Update recommandations to include this plan action
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      const updatedRecommandations = localStorageRecommandations.map((r: Recommandation) => {
        if (formData.recommandations.includes(r._id)) {
          return {
            ...r,
            plansAction: [...r.plansAction, newPlanAction._id],
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });
      localStorage.setItem('recommandations', JSON.stringify(updatedRecommandations));

      console.log('✅ Plan Action created:', newPlanAction);
      alert('Plan d\'action créé avec succès !');
      
      // Navigate back to recommendation detail if recommendation was pre-selected
      const recommandationId = searchParams.get('recommandation');
      if (recommandationId) {
        navigate(`/recommandations/${recommandationId}`);
      } else {
        navigate('/planactions');
      }
    } catch (error: any) {
      setError('Erreur lors de la création du plan d\'action');
      console.error('Error creating plan action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Prevent status changes during creation
    if (name === 'statut') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecommandationChange = (recommandationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recommandations: checked 
        ? [...prev.recommandations, recommandationId]
        : prev.recommandations.filter(id => id !== recommandationId)
    }));
  };

  if (!isAdmin && !isRSSI) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">🚫</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Accès non autorisé</h2>
        <p className="text-slate-400 mb-4">Seuls les administrateurs et RSSI peuvent créer des plans d'action.</p>
        <Button variant="outline" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
          🏠 Tableau de bord
        </Button>
      </div>
    );
  }

  // Check if recommendation ID is provided
  if (!searchParams.get('recommandation')) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-orange-600 text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Recommandation requise</h2>
        <p className="text-slate-400 mb-4">Les plans d'action doivent être créés depuis la page d'une recommandation spécifique.</p>
        <Button variant="outline" onClick={() => navigate('/recommandations')}>
          📋 Voir les recommandations
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">📅 Créer un Plan d'Action</h1>
                <p className="text-slate-400 mt-1">Créer un nouveau plan d'action basé sur des recommandations</p>
              </div>
              <Button variant="secondary" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
                🏠 Tableau de bord
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-slate-300 mb-2">
                Titre du plan d'action *
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez le titre du plan d'action..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez le plan d'action en détail..."
                required
              />
            </div>

            {/* Priorité */}
            <div>
              <label htmlFor="priorite" className="block text-sm font-medium text-slate-300 mb-2">
                Priorité
              </label>
              <select
                id="priorite"
                name="priorite"
                value={formData.priorite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Élevée">Élevée</option>
                <option value="Critique">Critique</option>
              </select>
            </div>

            {/* Statut - Read Only */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Statut
              </label>
              <div className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm">
                <div className="flex items-center">
                  <span className="text-blue-600 text-sm mr-2">⏳</span>
                  <span className="text-white font-medium">En attente</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    Par défaut
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Le statut peut être modifié après la création du plan d'action
              </p>
            </div>

            {/* Recommandations - Read Only when pre-selected */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recommandations associées *
              </label>
              {searchParams.get('recommandation') ? (
                // Read-only display when pre-selected
                <div className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-sm mr-2">🔗</span>
                    <span className="text-white font-medium">
                      {recommandations.find(r => r._id === searchParams.get('recommandation'))?.contenu || 'Recommandation sélectionnée'}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {recommandations.find(r => r._id === searchParams.get('recommandation'))?.priorite || 'Moyenne'}
                    </span>
                  </div>
                </div>
              ) : (
                // Editable checkboxes when not pre-selected
                <div className="border border-slate-600 rounded-md p-4 max-h-60 overflow-y-auto">
                  {recommandations.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucune recommandation disponible</p>
                  ) : (
                    <div className="space-y-3">
                      {recommandations.map((recommandation) => (
                        <div key={recommandation._id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`recommandation_${recommandation._id}`}
                            checked={formData.recommandations.includes(recommandation._id)}
                            onChange={(e) => handleRecommandationChange(recommandation._id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
                          />
                          <div className="flex-1">
                            <label htmlFor={`recommandation_${recommandation._id}`} className="text-sm font-medium text-white cursor-pointer">
                              {recommandation.contenu}
                            </label>
                            <div className="mt-1 flex space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                recommandation.priorite === 'Critique' ? 'bg-red-100 text-red-800' :
                                recommandation.priorite === 'Élevée' ? 'bg-orange-100 text-orange-800' :
                                recommandation.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {recommandation.priorite}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                recommandation.statut === 'validée' ? 'bg-green-100 text-green-800' :
                                recommandation.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {recommandation.statut}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {searchParams.get('recommandation') 
                  ? 'La recommandation est automatiquement associée depuis la page de recommandation'
                  : 'Sélectionnez les recommandations que ce plan d\'action doit traiter'
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/planactions')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Création...' : '✅ Créer le Plan d\'Action'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanAction;

