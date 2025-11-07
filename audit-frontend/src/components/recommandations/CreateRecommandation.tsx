import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { CreateRecommandationData, Constat } from '../../types/audit';

const CreateRecommandation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [constats, setConstats] = useState<Constat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateRecommandationData>({
    contenu: '',
    priorite: 'Moyenne',
    complexite: 'Moyenne',
    statut: 'en attente', // Always starts as "en attente"
    constat: searchParams.get('constat') || '',
    plansAction: []
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';

  useEffect(() => {
    fetchConstats();
  }, []);

  // Update formData when searchParams change
  useEffect(() => {
    const constatId = searchParams.get('constat');
    if (constatId) {
      setFormData(prev => ({
        ...prev,
        constat: constatId
      }));
    }
  }, [searchParams]);

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

  const validateForm = (): boolean => {
    if (!formData.contenu.trim()) {
      setError('Le contenu de la recommandation est requis');
      return false;
    }
    if (!formData.constat) {
      setError('Veuillez sélectionner un constat');
      return false;
    }
    // Status is always "en attente" by default, no validation needed
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

      // Create recommandation data
      const newRecommandation = {
        _id: `recommandation_${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      localStorageRecommandations.push(newRecommandation);
      localStorage.setItem('recommandations', JSON.stringify(localStorageRecommandations));

      console.log('✅ Recommandation created:', newRecommandation);
      alert('Recommandation créée avec succès !');
      
      // Navigate back to constat detail if constat was pre-selected
      const constatId = searchParams.get('constat');
      if (constatId) {
        navigate(`/constats/${constatId}`);
      } else {
        navigate('/recommandations');
      }
    } catch (error: any) {
      setError('Erreur lors de la création de la recommandation');
      console.error('Error creating recommandation:', error);
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

  if (!isAdmin && !isRSSI) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">🚫</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Accès non autorisé</h2>
        <p className="text-slate-400 mb-4">Seuls les administrateurs et RSSI peuvent créer des recommandations.</p>
        <Button variant="outline" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
          🏠 Tableau de bord
        </Button>
      </div>
    );
  }

  // Check if constat ID is provided
  if (!searchParams.get('constat')) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-orange-600 text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Constat requis</h2>
        <p className="text-slate-400 mb-4">Les recommandations doivent être créées depuis la page d'un constat spécifique.</p>
        <Button variant="outline" onClick={() => navigate('/constats')}>
          🔍 Voir les constats
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
                <h1 className="text-2xl font-bold text-white">📝 Créer une Recommandation</h1>
                <p className="text-slate-400 mt-1">Créer une nouvelle recommandation basée sur un constat</p>
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

            {/* Contenu */}
            <div>
              <label htmlFor="contenu" className="block text-sm font-medium text-slate-300 mb-2">
                Contenu de la recommandation *
              </label>
              <textarea
                id="contenu"
                name="contenu"
                value={formData.contenu}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez la recommandation en détail..."
                required
              />
            </div>

            {/* Constat - Read Only */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Constat associé *
              </label>
              <div className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm">
                <div className="flex items-center">
                  <span className="text-blue-600 text-sm mr-2">🔗</span>
                  <span className="text-white font-medium">
                    {constats.find(c => c._id === formData.constat)?.description || 'Constat sélectionné'}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {constats.find(c => c._id === formData.constat)?.type || 'NC maj'}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Le constat est automatiquement associé depuis la page de constat
              </p>
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

            {/* Complexité */}
            <div>
              <label htmlFor="complexite" className="block text-sm font-medium text-slate-300 mb-2">
                Complexité
              </label>
              <select
                id="complexite"
                name="complexite"
                value={formData.complexite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Élevée">Élevée</option>
                <option value="Très élevée">Très élevée</option>
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
                Le statut peut être modifié après la création de la recommandation
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/recommandations')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Création...' : '✅ Créer la Recommandation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecommandation;