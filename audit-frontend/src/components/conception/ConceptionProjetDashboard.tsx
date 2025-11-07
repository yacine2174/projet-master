import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import { Conception } from '../../types/audit';

const ConceptionProjetDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet');
  
  const [conceptions, setConceptions] = useState<Conception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projet, setProjet] = useState<any>(null);

  useEffect(() => {
    if (projetId) {
      loadProjet();
      loadConceptions();
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

  const loadConceptions = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Try to load from backend API first
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/conceptions/projet/${projetId}`, {
          headers
        });
        if (response.ok) {
          const apiConceptions = await response.json();
          setConceptions(apiConceptions);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage');
      }

      // Fallback to localStorage
      const storedConceptions = JSON.parse(localStorage.getItem('conceptions') || '[]') as Conception[];
      const filteredConceptions = storedConceptions.filter(c => c.projet === projetId);
      setConceptions(filteredConceptions);
    } catch (error) {
      console.error('Error loading conceptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate(`/conceptions/projet/new?projet=${projetId}`);
  };

  const handleEdit = (conceptionId: string) => {
    alert('Fonctionnalité d\'édition à implémenter');
  };

  const handleDelete = async (conceptionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conception ?')) return;

    // Try backend API first
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://192.168.100.244:3000/api/conceptions/${conceptionId}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const updated = conceptions.filter(c => c._id !== conceptionId);
        setConceptions(updated);
        // keep local caches consistent
        localStorage.setItem('conceptions', JSON.stringify((JSON.parse(localStorage.getItem('conceptions') || '[]') as any[]).filter((c:any)=> c._id !== conceptionId)));
        if (projetId) {
          const key = `conceptions:${projetId}`;
          localStorage.setItem(key, JSON.stringify((JSON.parse(localStorage.getItem(key) || '[]') as any[]).filter((c:any)=> c._id !== conceptionId)));
        }
        return;
      }
    } catch (e) {
      console.log('API delete failed, using localStorage fallback');
    }

    // Fallback: localStorage only
    const updatedConceptions = conceptions.filter(c => c._id !== conceptionId);
    setConceptions(updatedConceptions);
    localStorage.setItem('conceptions', JSON.stringify(updatedConceptions));
    if (projetId) {
      const key = `conceptions:${projetId}`;
      const projList = JSON.parse(localStorage.getItem(key) || '[]');
      const updatedProj = projList.filter((c:any)=> c._id !== conceptionId);
      localStorage.setItem(key, JSON.stringify(updatedProj));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'validée': { bg: 'bg-green-100', text: 'text-green-800', label: 'Validée' },
      'à revoir': { bg: 'bg-red-100', text: 'text-red-800', label: 'À revoir' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['en attente'];
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
            <h1 className="text-3xl font-bold text-white">🏗️ Conceptions</h1>
            <p className="text-slate-400 mt-2">
              Projet: <strong>{projet?.nom || 'Projet non trouvé'}</strong>
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateNew}>
            + Nouvelle Conception
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">🏗️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Conceptions</p>
              <p className="text-2xl font-bold text-white">{conceptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Validées</p>
              <p className="text-2xl font-bold text-white">
                {conceptions.filter(c => c.statut === 'validée').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-white">
                {conceptions.filter(c => c.statut === 'en attente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">À revoir</p>
              <p className="text-2xl font-bold text-white">
                {conceptions.filter(c => c.statut === 'à revoir').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conceptions List */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Liste des Conceptions</h2>
        </div>
        
        {conceptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">🏗️</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucune conception</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre première conception</p>
            <Button variant="primary" onClick={handleCreateNew}>
              Créer une conception
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conceptions.map((conception) => (
              <div key={conception._id} className="p-6 hover:bg-slate-900 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{conception.nomFichier}</h3>
                      {getStatusBadge(conception.statut)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Type de fichier</p>
                        <p className="text-sm text-white">{conception.typeFichier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">URL du fichier</p>
                        <a 
                          href={conception.urlFichier} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Voir le fichier →
                        </a>
                      </div>
                    </div>
                    {conception.rssiCommentaire && (
                      <div className="mt-3 p-3 bg-slate-900 rounded-lg">
                        <p className="text-sm font-medium text-slate-300 mb-1">Commentaire RSSI</p>
                        <p className="text-sm text-slate-400">{conception.rssiCommentaire}</p>
                      </div>
                    )}
                    <div className="mt-3 text-xs text-gray-500">
                      Créé le {new Date(conception.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(conception._id)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(conception._id)}
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

export default ConceptionProjetDashboard;
