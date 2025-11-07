import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { Conception, Projet } from '../../types/audit';

const ConceptionDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Projet | null>(null);
  const [conceptions, setConceptions] = useState<Conception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isRSSI = user?.role === 'RSSI';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get project data from localStorage
      const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const defaultProjects: Projet[] = [
        {
          _id: '1',
          nom: 'Sécurisation de l\'infrastructure réseau',
          perimetre: 'Infrastructure réseau et équipements',
          budget: 50000,
          priorite: 'Élevée',
          dateDebut: '2024-01-01',
          dateFin: '2024-06-30',
          statut: 'En cours',
          creerPar: 'user1',
          risques: ['risque1'],
          constats: ['constat1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          nom: 'Formation sécurité pour les utilisateurs',
          perimetre: 'Formations et sensibilisation',
          budget: 15000,
          priorite: 'Moyenne',
          dateDebut: '2024-02-01',
          dateFin: '2024-04-30',
          statut: 'Planifié',
          creerPar: 'user1',
          risques: ['risque2'],
          constats: ['constat2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allProjects = [...localStorageProjects, ...defaultProjects];
      const foundProject = allProjects.find(p => p._id === id);
      
      if (foundProject) {
        setProject(foundProject);
      }

      // Get conceptions data from localStorage
      const conceptionsData = JSON.parse(localStorage.getItem(`conceptions:${id}`) || '[]');
      setConceptions(conceptionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConceptions = conceptions.filter(conception => {
    const matchesFilter = filter === 'all' || conception.statut === filter;
    const matchesSearch = conception.nomFichier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conception.typeFichier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validée':
        return 'bg-green-100 text-green-800';
      case 'à revoir':
        return 'bg-red-100 text-red-800';
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-800 text-slate-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'validée':
        return '✅';
      case 'à revoir':
        return '❌';
      case 'en attente':
        return '⏳';
      default:
        return '📄';
    }
  };

  const getFileIcon = (typeFichier: string) => {
    if (typeFichier.includes('pdf')) return '📄';
    if (typeFichier.includes('image')) return '🖼️';
    if (typeFichier.includes('word') || typeFichier.includes('document')) return '📝';
    if (typeFichier.includes('excel') || typeFichier.includes('spreadsheet')) return '📊';
    return '📁';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-400">Chargement des conceptions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={() => navigate(`/projects/${id}`)}>
            ← Retour au projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour au projet
          </button>
          <div className="text-slate-400 text-sm">
            Les conceptions sont créées depuis les projets
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">🏗️ Conceptions</h1>
        <p className="text-slate-400">
          {project ? `Projet: ${project.nom}` : 'Gestion des conceptions de projet'}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total</p>
              <p className="text-2xl font-bold text-white">{conceptions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">En attente</p>
              <p className="text-2xl font-bold text-white">
                {conceptions.filter(c => c.statut === 'en attente').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Validées</p>
              <p className="text-2xl font-bold text-white">
                {conceptions.filter(c => c.statut === 'validée').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">À revoir</p>
              <p className="text-2xl font-bold text-white">
                {conceptions.filter(c => c.statut === 'à revoir').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en attente">En attente</option>
              <option value="validée">Validées</option>
              <option value="à revoir">À revoir</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par nom de fichier ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Conceptions List */}
      {filteredConceptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-white mb-2">Aucune conception trouvée</h3>
          <p className="text-slate-400 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Aucune conception ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première conception.'
            }
          </p>
          <Button variant="primary" onClick={() => navigate(`/projects/${id}/conception/create`)}>
            ➕ Créer une conception
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConceptions.map((conception) => (
            <div key={conception._id} className="bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(conception.typeFichier)}</span>
                    <div>
                      <h3 className="text-lg font-medium text-white truncate">
                        {conception.nomFichier}
                      </h3>
                      <p className="text-sm text-gray-500">{conception.typeFichier}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conception.statut)}`}>
                    {getStatusIcon(conception.statut)} {conception.statut}
                  </span>
                </div>

                {conception.rssiCommentaire && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400">
                      <span className="font-medium">Commentaire RSSI:</span> {conception.rssiCommentaire}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  <p>Créé le {new Date(conception.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p>Modifié le {new Date(conception.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to={`/projects/${id}/conception/${conception._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    👁️ Voir détails
                  </Link>
                  
                  {(isRSSI || isAdmin) && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/projects/${id}/conception/${conception._id}`}
                        className="text-slate-400 hover:text-slate-200 text-sm"
                      >
                        ✏️ Modifier
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptionDashboard;