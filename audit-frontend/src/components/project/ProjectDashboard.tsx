import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import type { Projet } from '../../types/audit';

const ProjectDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Projet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  // Refresh projects when component becomes visible (e.g., returning from create page)
  useEffect(() => {
    const handleFocus = () => {
      fetchProjects();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch projects from backend API
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://192.168.100.244:3000/api/projets', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des projets');
      }
      
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
      
    } catch (error: any) {
      setError('Erreur lors du chargement des projets depuis la base de données');
      console.error('Error fetching projects:', error);
      setProjects([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.statut === filter;
    const matchesSearch = project.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.perimetre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getProjectStats = () => {
    const total = projects.length;
    const planifie = projects.filter(p => p.statut === 'Planifié').length;
    const enCours = projects.filter(p => p.statut === 'En cours').length;
    const termine = projects.filter(p => p.statut === 'Terminé').length;
    const enAttente = projects.filter(p => p.statut === 'En attente').length;
    
    return { total, planifie, enCours, termine, enAttente };
  };

  const stats = getProjectStats();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Planifié': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Planifié' },
      'En cours': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En cours' },
      'Terminé': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Terminé' },
      'En attente': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'En attente' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Planifié;
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">📊 Gestion des Projets</h2>
              <p className="text-gray-400 text-lg">
                Gérez vos projets de sécurité et plans d'action
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/projets/new">
                <Button variant="primary" size="lg">
                  + Nouveau Projet
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            label="Total"
            value={stats.total}
            accentColor="text-gray-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Planifiés"
            value={stats.planifie}
            accentColor="text-blue-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            label="En cours"
            value={stats.enCours}
            accentColor="text-yellow-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Terminés"
            value={stats.termine}
            accentColor="text-emerald-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="En attente"
            value={stats.enAttente}
            accentColor="text-orange-400"
          />
        </div>

        {error && (
          <div className="card mb-6 border-red-500 bg-red-500/10">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou périmètre..."
                className="input-field w-full"
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Tous les statuts</option>
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-400 mb-6">
              {filter !== 'all' 
                ? 'Aucun projet ne correspond aux filtres sélectionnés.'
                : 'Commencez par créer votre premier projet de sécurité.'
              }
            </p>
            {filter === 'all' && (
              <Link to="/projets/new">
                <Button variant="primary">Créer un projet</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="card p-0 overflow-hidden">
              <div className="professional-table">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Projet
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Périmètre
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredProjects.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white break-words leading-tight">{project.nom}</div>
                          <div className="text-xs text-gray-400 mt-1">{project.description}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300">{project.perimetre}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300 leading-tight">
                            <div>{new Date(project.dateDebut).toLocaleDateString('fr-FR')}</div>
                            <div>{new Date(project.dateFin).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-fit">{getStatusBadge(project.statut)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/projets/${project._id}`}>
                            <Button variant="secondary" size="sm">
                              Voir
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredProjects.map((project) => (
              <div key={project._id} className="card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">{project.nom}</h3>
                    <p className="text-sm text-gray-400 mt-2">{project.description}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {getStatusBadge(project.statut)}
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  <span className="font-medium text-gray-400">Périmètre:</span> {project.perimetre}
                </div>
                
                <div className="text-sm text-gray-300">
                  <span className="font-medium text-gray-400">Dates:</span> {new Date(project.dateDebut).toLocaleDateString('fr-FR')} - {new Date(project.dateFin).toLocaleDateString('fr-FR')}
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <Link to={`/projets/${project._id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectDashboard;