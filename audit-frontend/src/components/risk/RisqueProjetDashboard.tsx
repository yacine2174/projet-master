import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import { Risque } from '../../types/audit';

const RisqueProjetDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet');
  
  const [risques, setRisques] = useState<Risque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projet, setProjet] = useState<any>(null);

  useEffect(() => {
    if (projetId) {
      loadProjet();
      loadRisques();
    }
  }, [projetId]);

  const loadProjet = async () => {
    try {
      const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const foundProjet = localStorageProjects.find((p: any) => p._id === projetId);
      setProjet(foundProjet || null);
    } catch (error) {
      console.error('Error loading projet:', error);
    }
  };

  const loadRisques = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Try to load from backend API first
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/risques/projet/${projetId}`, {
          headers
        });
        if (response.ok) {
          const apiRisques = await response.json();
          setRisques(apiRisques);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage');
      }

      // Fallback to localStorage
      const storedRisques = JSON.parse(localStorage.getItem('risques') || '[]') as Risque[];
      const filteredRisques = storedRisques.filter(r => r.projet === projetId);
      setRisques(filteredRisques);
    } catch (error) {
      console.error('Error loading risques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate(`/risques/projet/new?projet=${projetId}`);
  };

  const handleEdit = (risqueId: string) => {
    alert('Fonctionnalité d\'édition à implémenter');
  };

  const handleDelete = (risqueId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce risque ?')) {
      const updatedRisques = risques.filter(r => r._id !== risqueId);
      setRisques(updatedRisques);
      localStorage.setItem('risques', JSON.stringify(updatedRisques));
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const levelConfig = {
      'Élevé': { bg: 'bg-red-100', text: 'text-red-800', label: 'Élevé' },
      'Moyen': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyen' },
      'Faible': { bg: 'bg-green-100', text: 'text-green-800', label: 'Faible' }
    };
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig['Faible'];
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/projects/${projetId}`)}
          className="text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          ← Retour au projet
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">⚠️ Risques</h1>
            <p className="text-slate-400 mt-2">
              Projet: <strong>{projet?.nom || 'Projet non trouvé'}</strong>
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateNew}>
            + Nouveau Risque
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Risques</p>
              <p className="text-2xl font-bold text-white">{risques.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">🔴</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Risques Élevés</p>
              <p className="text-2xl font-bold text-white">
                {risques.filter(r => r.niveau === 'Élevé').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">🟡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Risques Moyens</p>
              <p className="text-2xl font-bold text-white">
                {risques.filter(r => r.niveau === 'Moyen').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">🟢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Risques Faibles</p>
              <p className="text-2xl font-bold text-white">
                {risques.filter(r => r.niveau === 'Faible').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risques List */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Liste des Risques</h2>
        </div>
        
        {risques.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucun risque</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier risque</p>
            <Button variant="primary" onClick={handleCreateNew}>
              Créer un risque
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {risques.map((risque) => (
              <div key={risque._id} className="p-6 hover:bg-slate-900 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{risque.nom}</h3>
                      {getRiskLevelBadge(risque.niveau)}
                    </div>
                    <p className="text-sm text-slate-300 mb-4">{risque.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Probabilité</p>
                        <p className="text-sm font-medium text-white">{risque.probabilite}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Impact</p>
                        <p className="text-sm font-medium text-white">{risque.impact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Niveau de risque</p>
                        <p className="text-sm font-medium text-white">{risque.niveau}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Créé le {new Date(risque.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(risque._id)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(risque._id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RisqueProjetDashboard;
