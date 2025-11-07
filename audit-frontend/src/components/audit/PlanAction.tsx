import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { auditAPI } from '../../api/api';
import type { PlanAction, CreatePlanActionData } from '../../types/audit';

const PlanActionComponent: React.FC = () => {
  const { id: auditId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [planActions, setPlanActions] = useState<PlanAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreatePlanActionData>({
    titre: '',
    description: '',
    priorite: 'Moyenne',
    recommandations: []
  });

  const storageKey = `planActions:${auditId}`;

  useEffect(() => {
    if (auditId) {
      fetchPlanActions();
    }
  }, [auditId]);

  const fetchPlanActions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const storageKey = `planActions:${auditId}`;
      const localPlans: PlanAction[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Try to fetch from real API first
      try {
        const apiPlanActions = await auditAPI.getPlanActions(auditId!);
        const merged = [
          ...apiPlanActions,
          ...localPlans.filter(lp => !apiPlanActions.some(ap => ap._id === lp._id))
        ];
        setPlanActions(merged);
      } catch (apiError) {
        console.log('API not available, using mock data');
        
        // Fallback to mock data if API is not available
        const mockPlanActions: PlanAction[] = [
          {
            _id: '1',
            titre: 'Mise en place d\'une politique de mots de passe',
            description: 'Implémenter une politique de gestion des mots de passe conforme aux normes',
            priorite: 'Élevée',
            recommandations: ['Définir les exigences de complexité', 'Mettre en place la rotation automatique'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ];
        
        const merged = [
          ...mockPlanActions,
          ...localPlans.filter(lp => !mockPlanActions.some(mp => mp._id === lp._id))
        ];
        setPlanActions(merged);
      }
    } catch (error: any) {
      setError('Erreur lors du chargement du plan d\'action');
      console.error('Error fetching plan actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.description || !formData.priorite) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setError('');
      
      // Try to create plan action via API first
      try {
        const newPlanAction = await auditAPI.createPlanAction(formData);
        console.log('✅ Plan action created via API:', newPlanAction);
        setPlanActions(prev => [newPlanAction, ...prev]);
        const storageKey = `planActions:${auditId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([newPlanAction, ...existing]));
      } catch (apiError) {
        console.log('API not available, using mock data');
        
        // Fallback to mock creation if API is not available
        const newPlanAction: PlanAction = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setPlanActions(prev => [newPlanAction, ...prev]);
        const storageKey = `planActions:${auditId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([newPlanAction, ...existing]));
      }
      
      // Reset form
      setFormData({
        titre: '',
        description: '',
        priorite: 'Moyenne',
        recommandations: []
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      try {
        await auditAPI.deletePlanAction(planId);
      } catch (apiErr) {
        console.log('API delete failed or unavailable, removing locally');
      }
      setPlanActions(prev => prev.filter(p => p._id !== planId));
      const existing: PlanAction[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify(existing.filter(p => p._id !== planId)));
    } catch (e) {
      console.error('Delete plan action error:', e);
    }
  };

  const getPrioriteBadge = (priorite: string) => {
    const prioriteConfig = {
      'Faible': { bg: 'bg-green-100', text: 'text-green-800', label: 'Faible' },
      'Moyenne': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyenne' },
      'Élevée': { bg: 'bg-red-100', text: 'text-red-800', label: 'Élevée' }
    };

    const config = prioriteConfig[priorite as keyof typeof prioriteConfig] || prioriteConfig.Faible;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/audits/${auditId}`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour à l'audit
          </button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Créer un plan d'action
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Plan d'Action de l'Audit</h1>
        <p className="text-slate-400">
          Générez et suivez votre plan d'action basé sur les constats identifiés
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Plan Action Form */}
      {showForm && (
        <div className="mb-8 bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Créer un plan d'action</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-slate-400"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="titre"
              name="titre"
              type="text"
              label="Titre du plan d'action"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Renforcement de la politique de mots de passe"
              required
              icon="📋"
            />

            <Select
              id="priorite"
              name="priorite"
              label="Priorité"
              value={formData.priorite}
              onChange={handleChange}
              required
              icon="⚡"
              options={[
                { value: 'Faible', label: 'Faible' },
                { value: 'Moyenne', label: 'Moyenne' },
                { value: 'Élevée', label: 'Élevée' }
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description détaillée
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez en détail les actions à entreprendre, les objectifs et les résultats attendus..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Créer
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Plans Action List */}
      {planActions.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-blue-600 text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun plan d'action créé</h3>
          <p className="text-gray-500 mb-4">
            Commencez par créer votre premier plan d'action basé sur les constats identifiés
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Créer le premier plan d'action
          </Button>
        </div>
      ) : (
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">
              Plans d'Action ({planActions.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {planActions.map((planAction) => (
              <div key={planAction._id} className="px-6 py-4 hover:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{planAction.titre}</h3>
                      {getPrioriteBadge(planAction.priorite)}
                    </div>
                    <p className="text-slate-400 mb-3">{planAction.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {new Date(planAction.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">🔗</span>
                        {planAction.recommandations.length} recommandation(s) associée(s)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(planAction._id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Plan d'Action automatisé :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Les plans d'action sont générés automatiquement à partir des constats</li>
          <li>• Ils regroupent les recommandations non redondantes par priorité</li>
          <li>• Chaque action est liée aux contrôles de sécurité normatifs appropriés</li>
          <li>• La priorité est calculée en fonction de la criticité et de l'impact des constats</li>
          <li>• Les délais sont estimés selon la complexité des actions à entreprendre</li>
        </ul>
      </div>

      {/* Generate Automated Plan Button */}
      <div className="mt-8 text-center">
        <Button variant="secondary" size="lg">
          🔄 Générer le plan d'action automatisé
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Analyse automatique des constats pour créer un plan d'action optimisé
        </p>
      </div>
    </div>
  );
};

export default PlanActionComponent;
