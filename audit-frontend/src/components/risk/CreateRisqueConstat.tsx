import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { Risque, Constat } from '../../types/audit';

const CreateRisqueConstat: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [constat, setConstat] = useState<Constat | null>(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    probabilite: 'Faible',
    impact: 'Faible',
    niveau: 'Faible'
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const constatId = searchParams.get('constat');

  useEffect(() => {
    if (constatId) {
      fetchConstat();
    }
  }, [constatId]);

  const fetchConstat = async () => {
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
          projet: '',
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
          projet: '',
          recommandations: [],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      const allConstats = [...defaultConstats, ...localStorageConstats];
      const foundConstat = allConstats.find(c => c._id === constatId);
      
      if (foundConstat) {
        setConstat(foundConstat);
      } else {
        setError('Constat non trouvé');
      }
    } catch (error: any) {
      console.error('Error fetching constat:', error);
      setError('Erreur lors du chargement du constat');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateNiveau = () => {
    const probabilite = formData.probabilite;
    const impact = formData.impact;
    
    if (probabilite === 'Critique' || impact === 'Critique') {
      return 'Critique';
    } else if (probabilite === 'Élevée' || impact === 'Élevée') {
      return 'Élevé';
    } else if (probabilite === 'Moyenne' || impact === 'Moyenne') {
      return 'Moyen';
    } else {
      return 'Faible';
    }
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom du risque est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description du risque est requise');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError('');

      const niveau = calculateNiveau();
      const newRisque: Risque = {
        _id: `risque_${Date.now()}`,
        nom: formData.nom,
        description: formData.description,
        probabilite: formData.probabilite,
        impact: formData.impact,
        niveau: niveau,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const localStorageRisques = JSON.parse(localStorage.getItem('risques') || '[]');
      localStorageRisques.push(newRisque);
      localStorage.setItem('risques', JSON.stringify(localStorageRisques));

      console.log('✅ Risque created:', newRisque);
      alert('Risque créé avec succès !');
      navigate(`/constats/${constatId}`);
    } catch (error: any) {
      setError('Erreur lors de la création du risque');
      console.error('Error creating risque:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin && !isRSSI) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Accès refusé</h2>
          <p className="text-slate-400 mb-4">Vous n'avez pas les permissions nécessaires pour créer un risque</p>
          <Button variant="outline" onClick={() => navigate('/constats')}>
            ← Retour aux constats
          </Button>
        </div>
      </div>
    );
  }

  if (!constatId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Constat requis</h2>
          <p className="text-slate-400 mb-4">Vous devez sélectionner un constat pour créer un risque</p>
          <Button variant="outline" onClick={() => navigate('/constats')}>
            ← Retour aux constats
          </Button>
        </div>
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
                <h1 className="text-2xl font-bold text-white">⚠️ Créer un Risque</h1>
                <p className="text-slate-400 mt-1">Risque associé au constat sélectionné</p>
                {constat && (
                  <div className="mt-2 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Constat associé:</strong> {constat.description}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Type: {constat.type} | Criticité: {constat.criticite}
                    </p>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate(`/constats/${constatId}`)}>
                ← Retour
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom du risque *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Risque de compromission des données"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez le risque en détail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Probabilité *
                </label>
                <select
                  name="probabilite"
                  value={formData.probabilite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Faible">Faible</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Élevée">Élevée</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Impact *
                </label>
                <select
                  name="impact"
                  value={formData.impact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Faible">Faible</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Élevé">Élevé</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="p-4 bg-slate-900 rounded-md">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Niveau de risque calculé</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      calculateNiveau() === 'Critique' ? 'bg-red-100 text-red-800' :
                      calculateNiveau() === 'Élevé' ? 'bg-orange-100 text-orange-800' :
                      calculateNiveau() === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {calculateNiveau()}
                    </span>
                    <span className="text-sm text-slate-400">
                      (Probabilité: {formData.probabilite} × Impact: {formData.impact})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/constats/${constatId}`)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Création...' : '✅ Créer le risque'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRisqueConstat;
