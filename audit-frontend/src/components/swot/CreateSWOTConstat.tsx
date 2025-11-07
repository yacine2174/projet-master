import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { SWOT, Constat } from '../../types/audit';

const CreateSWOTConstat: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [constat, setConstat] = useState<Constat | null>(null);
  
  const [formData, setFormData] = useState({
    forces: '',
    faiblesses: '',
    opportunites: '',
    menaces: ''
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.forces.trim()) {
      setError('Le champ Forces est requis');
      return false;
    }
    if (!formData.faiblesses.trim()) {
      setError('Le champ Faiblesses est requis');
      return false;
    }
    if (!formData.opportunites.trim()) {
      setError('Le champ Opportunités est requis');
      return false;
    }
    if (!formData.menaces.trim()) {
      setError('Le champ Menaces est requis');
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

      const newSWOT: SWOT = {
        _id: `swot_${Date.now()}`,
        forces: formData.forces,
        faiblesses: formData.faiblesses,
        opportunites: formData.opportunites,
        menaces: formData.menaces,
        projet: constat?.projet || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const localStorageSWOTs = JSON.parse(localStorage.getItem('swots') || '[]');
      localStorageSWOTs.push(newSWOT);
      localStorage.setItem('swots', JSON.stringify(localStorageSWOTs));

      console.log('✅ SWOT created:', newSWOT);
      alert('Analyse SWOT créée avec succès !');
      navigate(`/constats/${constatId}`);
    } catch (error: any) {
      setError('Erreur lors de la création de l\'analyse SWOT');
      console.error('Error creating SWOT:', error);
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
          <p className="text-slate-400 mb-4">Vous n'avez pas les permissions nécessaires pour créer une analyse SWOT</p>
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
          <p className="text-slate-400 mb-4">Vous devez sélectionner un constat pour créer une analyse SWOT</p>
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
                <h1 className="text-2xl font-bold text-white">📊 Créer une Analyse SWOT</h1>
                <p className="text-slate-400 mt-1">Analyse SWOT pour le constat sélectionné</p>
                {constat && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Constat associé:</strong> {constat.description}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
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
              {/* Forces */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Forces *
                </label>
                <textarea
                  name="forces"
                  value={formData.forces}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez les forces identifiées..."
                  required
                />
              </div>

              {/* Faiblesses */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Faiblesses *
                </label>
                <textarea
                  name="faiblesses"
                  value={formData.faiblesses}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez les faiblesses identifiées..."
                  required
                />
              </div>

              {/* Opportunités */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Opportunités *
                </label>
                <textarea
                  name="opportunites"
                  value={formData.opportunites}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez les opportunités identifiées..."
                  required
                />
              </div>

              {/* Menaces */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Menaces *
                </label>
                <textarea
                  name="menaces"
                  value={formData.menaces}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez les menaces identifiées..."
                  required
                />
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
                {isLoading ? '⏳ Création...' : '✅ Créer l\'analyse SWOT'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSWOTConstat;
