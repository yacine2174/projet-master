import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import type { Risque, Projet } from '../../types/audit';

const RiskDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [risks, setRisks] = useState<Risque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

      // Get risks from localStorage
      const localStorageRisks = JSON.parse(localStorage.getItem(`risks:${id}`) || '[]');
      
      // Default mock risks for demonstration
      const defaultRisks: Risque[] = [
        {
          _id: `risk_${id}_1`,
          projet: id!,
          actifCible: 'Serveurs de production',
          menace: 'Attaque par déni de service (DDoS)',
          vulnerabilite: 'Absence de protection DDoS',
          impact: 'Élevé',
          probabilite: 'Moyenne',
          niveau: 'Élevé',
          decision: 'À traiter',
          description: 'Risque de saturation des serveurs par des attaques DDoS',
          preuves: ['Logs de tentatives d\'attaque', 'Rapport de sécurité'],
          mesures: ['Mise en place d\'un pare-feu DDoS', 'Surveillance 24/7'],
          responsable: 'Équipe sécurité',
          echeance: '2024-03-15',
          statut: 'En cours',
          creerPar: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: `risk_${id}_2`,
          projet: id!,
          actifCible: 'Données sensibles',
          menace: 'Fuite de données',
          vulnerabilite: 'Chiffrement insuffisant',
          impact: 'Critique',
          probabilite: 'Faible',
          niveau: 'Moyen',
          decision: 'À accepter',
          description: 'Risque de compromission des données sensibles',
          preuves: ['Audit de sécurité', 'Test de pénétration'],
          mesures: ['Renforcement du chiffrement', 'Formation des utilisateurs'],
          responsable: 'Équipe IT',
          echeance: '2024-04-30',
          statut: 'Planifié',
          creerPar: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allRisks = [...defaultRisks, ...localStorageRisks];
      setRisks(allRisks);

    } catch (error: any) {
      setError('Erreur lors du chargement des données');
      console.error('Error fetching risk data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRisks = risks.filter(risk => {
    const matchesFilter = filter === 'all' || risk.niveau === filter || risk.statut === filter;
    const matchesSearch = risk.actifCible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.menace.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.vulnerabilite.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRiskStats = () => {
    const total = risks.length;
    const critique = risks.filter(r => r.niveau === 'Critique').length;
    const eleve = risks.filter(r => r.niveau === 'Élevé').length;
    const moyen = risks.filter(r => r.niveau === 'Moyen').length;
    const faible = risks.filter(r => r.niveau === 'Faible').length;
    const aTraiter = risks.filter(r => r.decision === 'À traiter').length;
    const enCours = risks.filter(r => r.statut === 'En cours').length;
    
    return { total, critique, eleve, moyen, faible, aTraiter, enCours };
  };

  const stats = getRiskStats();

  const getRiskBadge = (niveau: string) => {
    const config = {
      'Critique': { bg: 'bg-red-100', text: 'text-red-800', label: 'Critique' },
      'Élevé': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Élevé' },
      'Moyen': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyen' },
      'Faible': { bg: 'bg-green-100', text: 'text-green-800', label: 'Faible' }
    };

    const riskConfig = config[niveau as keyof typeof config] || config['Moyen'];
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskConfig.bg} ${riskConfig.text}`}>
        {riskConfig.label}
      </span>
    );
  };

  const getStatusBadge = (statut: string) => {
    const config = {
      'En cours': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      'Planifié': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Planifié' },
      'Terminé': { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminé' },
      'En attente': { bg: 'bg-slate-800', text: 'text-slate-200', label: 'En attente' }
    };

    const statusConfig = config[statut as keyof typeof config] || config['Planifié'];
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
        {statusConfig.label}
      </span>
    );
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce risque ?')) {
      return;
    }

    try {
      // Remove from localStorage
      const localStorageRisks = JSON.parse(localStorage.getItem(`risks:${id}`) || '[]');
      const filteredRisks = localStorageRisks.filter((r: Risque) => r._id !== riskId);
      localStorage.setItem(`risks:${id}`, JSON.stringify(filteredRisks));

      // Update state
      setRisks(prev => prev.filter(r => r._id !== riskId));
      
      alert('Risque supprimé avec succès !');
    } catch (error: any) {
      console.error('Error deleting risk:', error);
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
          <div className="text-slate-400 text-sm">
            Les risques sont créés depuis les projets
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          ⚠️ Analyse des Risques - {project.nom}
        </h1>
        <p className="text-slate-400">
          Identifiez, évaluez et gérez les risques de sécurité de votre projet
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Risk Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critique}</div>
            <div className="text-sm text-slate-400">Critique</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.eleve}</div>
            <div className="text-sm text-slate-400">Élevé</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.moyen}</div>
            <div className="text-sm text-slate-400">Moyen</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.faible}</div>
            <div className="text-sm text-slate-400">Faible</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.aTraiter}</div>
            <div className="text-sm text-slate-400">À traiter</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.enCours}</div>
            <div className="text-sm text-slate-400">En cours</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Filtres et recherche</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Filtrer par niveau</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les niveaux</option>
                <option value="Critique">Critique</option>
                <option value="Élevé">Élevé</option>
                <option value="Moyen">Moyen</option>
                <option value="Faible">Faible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Actif, menace, vulnérabilité..."
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risks List */}
      {risks.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-slate-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun risque identifié</h3>
          <p className="text-gray-500 mb-4">
            Commencez par identifier les premiers risques de votre projet
          </p>
          <Link to={`/projects/${id}/risks/new`}>
            <Button variant="primary">Identifier le premier risque</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">
              Risques identifiés ({filteredRisks.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredRisks.map((risk) => (
              <div key={risk._id} className="px-6 py-4 hover:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getRiskBadge(risk.niveau)}
                      {getStatusBadge(risk.statut)}
                      <span className="text-sm text-gray-500">
                        Créé le {new Date(risk.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-white mb-2">
                      {risk.actifCible} - {risk.menace}
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-3">{risk.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Vulnérabilité:</span>
                        <div className="text-white">{risk.vulnerabilite}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Impact:</span>
                        <div className="text-white">{risk.impact}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Probabilité:</span>
                        <div className="text-white">{risk.probabilite}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Décision:</span>
                        <div className="text-white">{risk.decision}</div>
                      </div>
                    </div>
                    
                    {risk.responsable && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Responsable:</span> {risk.responsable}
                        {risk.echeance && (
                          <span className="ml-4">
                            <span className="font-medium">Échéance:</span> {new Date(risk.echeance).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/projects/${id}/risks/${risk._id}`}>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteRisk(risk._id)}
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
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Analyse des risques :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Identification :</strong> Détectez tous les risques potentiels du projet</li>
          <li>• <strong>Évaluation :</strong> Analysez l'impact et la probabilité de chaque risque</li>
          <li>• <strong>Priorisation :</strong> Classez les risques par niveau de criticité</li>
          <li>• <strong>Mitigation :</strong> Définissez des mesures de prévention et de correction</li>
        </ul>
      </div>
    </div>
  );
};

export default RiskDashboard;
