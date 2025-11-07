import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import type { Constat, Audit, Projet } from '../../types/audit';

const ConstatsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [constats, setConstats] = useState<Constat[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [auditFilter, setAuditFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'Admin';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    fetchConstats();
    fetchAudits();
    fetchProjets();
  }, []);

  const fetchAudits = async () => {
    try {
      // Get audits from localStorage
      const localStorageAudits = JSON.parse(localStorage.getItem('audits') || '[]');
      
      // Default mock audits
      const defaultAudits: Audit[] = [
        {
          _id: 'audit_1',
          nom: 'Audit de sécurité organisationnel',
          type: 'Organisationnel',
          perimetre: 'Sécurité de l\'information',
          objectifs: 'Évaluer la conformité aux normes ISO 27001',
          dateDebut: '2024-01-01',
          dateFin: '2024-01-31',
          statut: 'Terminé',
          creerPar: 'admin1',
          normes: ['norme_1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'audit_2',
          nom: 'Audit technique infrastructure',
          type: 'Technique',
          perimetre: 'Infrastructure réseau et systèmes',
          objectifs: 'Vérifier la sécurité des équipements',
          dateDebut: '2024-02-01',
          dateFin: '2024-02-28',
          statut: 'En cours',
          creerPar: 'admin1',
          normes: ['norme_2'],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      // Try to get real audits from API
      let realAudits: Audit[] = [];
      try {
        const response = await fetch('http://192.168.100.244:3000/api/audits');
        if (response.ok) {
          const data = await response.json();
          realAudits = data.audits || data || [];
        }
      } catch (apiError) {
      }

      const allAudits = [...realAudits, ...defaultAudits, ...localStorageAudits];
      setAudits(allAudits);
    } catch (error: any) {
      console.error('Error fetching audits:', error);
    }
  };

  const fetchProjets = async () => {
    try {
      // Get projets from localStorage
      const localStorageProjets = JSON.parse(localStorage.getItem('projets') || '[]');
      
      // Default mock projets
      const defaultProjets: Projet[] = [
        {
          _id: 'projet_1',
          nom: 'Projet de sécurisation',
          perimetre: 'Sécurité informatique',
          budget: 50000,
          priorite: 'Élevée',
          dateDebut: '2024-01-01',
          dateFin: '2024-06-30',
          statut: 'En cours',
          creerPar: 'admin1',
          validePar: 'admin1',
          swot: 'swot_1',
          conception: 'conception_1',
          risques: ['risque_1'],
          constats: ['constat_1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'projet_2',
          nom: 'Projet de documentation',
          perimetre: 'Documentation technique',
          budget: 25000,
          priorite: 'Moyenne',
          dateDebut: '2024-02-01',
          dateFin: '2024-04-30',
          statut: 'Planifié',
          creerPar: 'admin1',
          risques: ['risque_2'],
          constats: ['constat_2'],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      const allProjets = [...defaultProjets, ...localStorageProjets];
      setProjets(allProjets);
    } catch (error: any) {
      console.error('Error fetching projets:', error);
    }
  };

  const fetchConstats = async () => {
    try {
      setIsLoading(true);
      setError('');

      let allConstats: Constat[] = [];

      // Fetch constats from backend database
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://192.168.100.244:3000/api/constats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          const apiConstats = await response.json();
          console.log('🔍 Constats from API:', Array.isArray(apiConstats) ? apiConstats.length : 0);
          allConstats = [...allConstats, ...(Array.isArray(apiConstats) ? apiConstats : [])];
        }
      } catch (apiError) {
        console.error('Error fetching constats from API:', apiError);
      }

      // Fetch constats from localStorage (for mock audits)
      try {
        const localConstats = JSON.parse(localStorage.getItem('constats') || '[]') as Constat[];
        console.log('🔍 Constats from localStorage:', localConstats.length);
        allConstats = [...allConstats, ...localConstats];
      } catch (localError) {
        console.error('Error loading constats from localStorage:', localError);
      }

      console.log('📊 Total constats loaded:', allConstats.length);
      setConstats(allConstats);
    } catch (error: any) {
      setError('Erreur lors du chargement des constats');
      console.error('Error fetching constats:', error);
      setConstats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuditName = (auditId: string) => {
    const audit = audits.find(a => a._id === auditId);
    return audit ? audit.nom : 'Audit non trouvé';
  };

  const getProjetName = (projetId: string) => {
    const projet = projets.find(p => p._id === projetId);
    return projet ? projet.nom : 'Projet non trouvé';
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'NC maj': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'NC maj' },
      'NC min': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'NC min' },
      'PS': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'PS' },
      'PP': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'PP' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['NC maj'];
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getCriticiteBadge = (criticite: string) => {
    const criticiteConfig = {
      'Élevée': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Élevée' },
      'Moyenne': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moyenne' },
      'Faible': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Faible' }
    };

    const config = criticiteConfig[criticite as keyof typeof criticiteConfig] || criticiteConfig['Moyenne'];
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredConstats = constats.filter(constat => {
    const matchesFilter = filter === 'all' || constat.type === filter;
    const matchesAudit = auditFilter === 'all' || constat.audit === auditFilter;
    const matchesSearch = searchTerm === '' || 
      constat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAuditName(constat.audit).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjetName(constat.projet).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesAudit && matchesSearch;
  });

  const getStatistics = () => {
    const total = constats.length;
    const ncMaj = constats.filter(c => c.type === 'NC maj').length;
    const ncMin = constats.filter(c => c.type === 'NC min').length;
    const ps = constats.filter(c => c.type === 'PS').length;
    const pp = constats.filter(c => c.type === 'PP').length;

    return { total, ncMaj, ncMin, ps, pp };
  };

  const stats = getStatistics();

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
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🔍 Gestion des Constats</h2>
            <p className="text-gray-400 text-lg">
              {isAdmin ? 'Gérez tous les constats d\'audit du système' : 
               isRSSI ? 'Consultez et gérez les constats d\'audit' : 
               'Consultez les constats d\'audit'}
            </p>
          </div>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Total"
            value={stats.total}
            accentColor="text-gray-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
            label="NC Majeures"
            value={stats.ncMaj}
            accentColor="text-red-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="NC Mineures"
            value={stats.ncMin}
            accentColor="text-orange-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Points de Satisfaction"
            value={stats.ps}
            accentColor="text-emerald-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            label="Points de Progrès"
            value={stats.pp}
            accentColor="text-blue-400"
          />
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Rechercher par description, audit ou projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Audit</label>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Tous les audits</option>
                {audits.map((audit) => (
                  <option key={audit._id} value={audit._id}>
                    {audit.nom} ({audit.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Tous les types</option>
                <option value="NC maj">NC Majeures</option>
                <option value="NC min">NC Mineures</option>
                <option value="PS">Points de Satisfaction</option>
                <option value="PP">Points de Progrès</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(auditFilter !== 'all' || filter !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {auditFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  🔍 Audit: {getAuditName(auditFilter)}
                  <button
                    onClick={() => setAuditFilter('all')}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              )}
              {filter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                  📊 Type: {filter}
                  <button
                    onClick={() => setFilter('all')}
                    className="ml-2 text-orange-400 hover:text-orange-300"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                  🔍 Recherche: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-gray-400 hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Constats List */}
        {filteredConstats.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucun constat</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Aucun constat ne correspond à vos critères de recherche.'
                : 'Aucun constat n\'a été créé pour le moment. Les constats sont créés depuis les pages d\'audit.'
              }
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/audits'}
            >
              📋 Voir les audits
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConstats.map((constat) => (
              <div key={constat._id} className="card p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-white">
                        {constat.description}
                      </h3>
                      {getTypeBadge(constat.type)}
                      {getCriticiteBadge(constat.criticite)}
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-4 space-y-2">
                      <p><span className="font-medium text-gray-400">Impact:</span> {constat.impact}</p>
                      <p><span className="font-medium text-gray-400">Probabilité:</span> {constat.probabilite}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-medium">🔍 Audit:</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                          {getAuditName(constat.audit)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-400 font-medium">📁 Projet:</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
                          {getProjetName(constat.projet)}
                        </span>
                      </div>
                      <p><span className="font-medium text-gray-400">Recommandations:</span> {constat.recommandations.length}</p>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <span>Créé le {new Date(constat.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span className="mx-2">•</span>
                      <span>Modifié le {new Date(constat.updatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/audits/${constat.audit}`}
                      className="btn-secondary text-sm"
                    >
                      🔍 Audit
                    </Link>
                    <Link
                      to={`/constats/${constat._id}`}
                      className="btn-primary text-sm"
                    >
                      👁️ Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 card border-blue-500 bg-blue-500/10">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-400">À propos des Constats</h3>
              <div className="mt-2 text-sm text-blue-300">
                <p>Les constats sont les résultats des audits et permettent d'identifier les points d'amélioration.</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>NC maj:</strong> Non-conformité majeure nécessitant une action immédiate</li>
                  <li><strong>NC min:</strong> Non-conformité mineure à corriger</li>
                  <li><strong>PS:</strong> Point de satisfaction à maintenir</li>
                  <li><strong>PP:</strong> Point de progrès pour améliorer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConstatsDashboard;