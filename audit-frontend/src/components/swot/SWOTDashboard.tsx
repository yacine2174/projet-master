import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import type { SWOT, Projet } from '../../types/audit';

const SWOTDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [swots, setSwots] = useState<SWOT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
          dateDebut: '2024-03-01',
          dateFin: '2024-12-31',
          statut: 'Planifié',
          creerPar: 'user1',
          risques: ['risque2'],
          constats: ['constat2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allProjects = [...defaultProjects, ...localStorageProjects];
      const foundProject = allProjects.find(p => p._id === id);

      if (!foundProject) {
        setError('Projet non trouvé');
        setIsLoading(false);
        return;
      }

      setProject(foundProject);

      // Get SWOT analyses from localStorage
      const localStorageSWOTs = JSON.parse(localStorage.getItem(`swots:${id}`) || '[]');
      
      // Default mock SWOTs for demonstration
      const defaultSWOTs: SWOT[] = [
        {
          _id: `swot_${id}_1`,
          projet: id!,
          forces: [
            'Équipe technique expérimentée',
            'Budget alloué suffisant',
            'Support de la direction'
          ],
          faiblesses: [
            'Manque de documentation existante',
            'Ressources limitées en temps'
          ],
          opportunites: [
            'Nouvelle réglementation favorable',
            'Partenariat possible avec un expert'
          ],
          menaces: [
            'Évolution rapide des technologies',
            'Risque de dépassement de budget'
          ],
          analyse: 'Analyse SWOT initiale du projet de sécurisation',
          recommandations: 'Prioriser les forces et opportunités, atténuer les faiblesses et menaces',
          creerPar: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allSWOTs = [...defaultSWOTs, ...localStorageSWOTs];
      setSwots(allSWOTs);

    } catch (error: any) {
      setError('Erreur lors du chargement des données');
      console.error('Error fetching SWOT data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSWOT = async (swotId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse SWOT ?')) {
      return;
    }

    try {
      // Remove from localStorage
      const localStorageSWOTs = JSON.parse(localStorage.getItem(`swots:${id}`) || '[]');
      const filteredSWOTs = localStorageSWOTs.filter((s: SWOT) => s._id !== swotId);
      localStorage.setItem(`swots:${id}`, JSON.stringify(filteredSWOTs));

      // Update state
      setSwots(prev => prev.filter(s => s._id !== swotId));
      
      alert('Analyse SWOT supprimée avec succès !');
    } catch (error: any) {
      console.error('Error deleting SWOT:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
        <p className="text-gray-500 mb-4">{error || 'Projet non trouvé'}</p>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          Retour aux projets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour au projet
          </button>
          <div className="text-sm text-gray-500">
            Les analyses SWOT sont créées depuis les projets
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          📊 Analyses SWOT - {project.nom}
        </h1>
        <p className="text-slate-400">
          Analysez les forces, faiblesses, opportunités et menaces de votre projet
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* SWOT Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">💪</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Forces</p>
              <p className="text-2xl font-bold text-white">
                {swots.reduce((sum, swot) => sum + swot.forces.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Faiblesses</p>
              <p className="text-2xl font-bold text-white">
                {swots.reduce((sum, swot) => sum + swot.faiblesses.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">🚀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Opportunités</p>
              <p className="text-2xl font-bold text-white">
                {swots.reduce((sum, swot) => sum + swot.opportunites.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Menaces</p>
              <p className="text-2xl font-bold text-white">
                {swots.reduce((sum, swot) => sum + swot.menaces.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Analyses List */}
      {swots.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-slate-400 text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucune analyse SWOT</h3>
          <p className="text-gray-500 mb-4">
            Commencez par créer votre première analyse SWOT pour ce projet
          </p>
          <Link to={`/projects/${id}/swot/new`}>
            <Button variant="primary">Créer la première analyse</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">
              Analyses SWOT ({swots.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {swots.map((swot) => (
              <div key={swot._id} className="px-6 py-4 hover:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Analyse SWOT
                      </span>
                      <span className="text-sm text-gray-500">
                        Créée le {new Date(swot.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-white mb-2">
                      {swot.analyse}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-sm">
                        <span className="font-medium text-green-600">Forces:</span>
                        <div className="mt-1 text-white">{swot.forces.length} élément(s)</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-red-600">Faiblesses:</span>
                        <div className="mt-1 text-white">{swot.faiblesses.length} élément(s)</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-blue-600">Opportunités:</span>
                        <div className="mt-1 text-white">{swot.opportunites.length} élément(s)</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-orange-600">Menaces:</span>
                        <div className="mt-1 text-white">{swot.menaces.length} élément(s)</div>
                      </div>
                    </div>
                    
                    {swot.recommandations && (
                      <p className="text-sm text-slate-400 mb-2">
                        <span className="font-medium">Recommandations:</span> {swot.recommandations}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/projects/${id}/swot/${swot._id}`}>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSWOT(swot._id)}
                    >
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
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Analyse SWOT :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Forces :</strong> Avantages internes et ressources positives du projet</li>
          <li>• <strong>Faiblesses :</strong> Limites internes et points d'amélioration</li>
          <li>• <strong>Opportunités :</strong> Facteurs externes favorables à exploiter</li>
          <li>• <strong>Menaces :</strong> Risques externes à anticiper et atténuer</li>
        </ul>
      </div>
    </div>
  );
};

export default SWOTDashboard;
