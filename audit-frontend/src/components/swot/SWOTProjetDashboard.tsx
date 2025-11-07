import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import { SWOT } from '../../types/audit';

const SWOTProjetDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet');
  
  const [swots, setSwots] = useState<SWOT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projet, setProjet] = useState<any>(null);

  useEffect(() => {
    if (projetId) {
      loadProjet();
      loadSWOTs();
    }
  }, [projetId]);

  // Reload data when window gains focus (when navigating back from creation)
  useEffect(() => {
    const handleFocus = () => {
      if (projetId) {
        loadSWOTs();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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

  const loadSWOTs = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Try to load from backend API first
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/swots/projet/${projetId}`, {
          headers
        });
        if (response.ok) {
          const apiSWOTs = await response.json();
          setSwots(apiSWOTs);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage');
      }

      // Fallback to localStorage
      const storedSWOTs = JSON.parse(localStorage.getItem('swots') || '[]') as SWOT[];
      const filteredSWOTs = storedSWOTs.filter(s => s.projet === projetId);
      setSwots(filteredSWOTs);
    } catch (error) {
      console.error('Error loading SWOTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate(`/swot/projet/new?projet=${projetId}`);
  };

  const handleEdit = (swotId: string) => {
    // For now, just show an alert - you can implement edit functionality later
    alert('Fonctionnalité d\'édition à implémenter');
  };

  const handleDelete = (swotId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse SWOT ?')) {
      const updatedSWOTs = swots.filter(s => s._id !== swotId);
      setSwots(updatedSWOTs);
      localStorage.setItem('swots', JSON.stringify(updatedSWOTs));
    }
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
            <h1 className="text-3xl font-bold text-white">📊 Analyses SWOT</h1>
            <p className="text-slate-400 mt-2">
              Projet: <strong>{projet?.nom || 'Projet non trouvé'}</strong>
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateNew}>
            + Nouvelle Analyse SWOT
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Analyses</p>
              <p className="text-2xl font-bold text-white">{swots.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SWOT List */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Liste des Analyses SWOT</h2>
        </div>
        
        {swots.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucune analyse SWOT</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre première analyse SWOT</p>
            <Button variant="primary" onClick={handleCreateNew}>
              Créer une analyse SWOT
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {swots.map((swot) => (
              <div key={swot._id} className="p-6 hover:bg-slate-900 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-green-600 mb-1">Forces</h3>
                        <p className="text-sm text-slate-300 line-clamp-2">{swot.forces}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-red-600 mb-1">Faiblesses</h3>
                        <p className="text-sm text-slate-300 line-clamp-2">{swot.faiblesses}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-600 mb-1">Opportunités</h3>
                        <p className="text-sm text-slate-300 line-clamp-2">{swot.opportunites}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-orange-600 mb-1">Menaces</h3>
                        <p className="text-sm text-slate-300 line-clamp-2">{swot.menaces}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Créé le {new Date(swot.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(swot._id)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(swot._id)}
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

export default SWOTProjetDashboard;
