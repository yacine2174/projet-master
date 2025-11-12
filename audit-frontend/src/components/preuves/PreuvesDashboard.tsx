import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import type { Preuve, Audit } from '../../types/audit';

const PreuvesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditFilter, setAuditFilter] = useState(searchParams.get('audit') || 'all');

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    fetchAudits();
    fetchPreuves();
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Refresh data when component becomes visible (e.g., returning from preuve creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPreuves();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        // Use localStorage only if API fails
      }

      const allAudits = [...realAudits, ...defaultAudits, ...localStorageAudits];
      setAudits(allAudits);
    } catch (error: any) {
      console.error('Error fetching audits:', error);
    }
  };

  const fetchPreuves = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Fetching preuves...');
      
      // First try to get from API
      try {
        console.log('🌐 Attempting to fetch preuves from API...');
        const response = await fetch('http://192.168.100.244:3000/api/preuves');
        
        if (response.ok) {
          const apiPreuves = await response.json();
          console.log('✅ API preuves received:', apiPreuves.length);
          
          // Save API data to localStorage for offline access
          if (apiPreuves.length > 0) {
            localStorage.setItem('preuves', JSON.stringify(apiPreuves));
            console.log('💾 Saved API preuves to localStorage');
          }
          
          setPreuves(apiPreuves);
          return; // Exit after successful API fetch
        } else {
          console.log('⚠️ API returned non-OK status:', response.status);
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('⚠️ API fetch failed, falling back to localStorage');
        // Continue to localStorage fallback
      }
      
      // Fallback to localStorage if API fails
      try {
        console.log('🔍 Checking localStorage for preuves...');
        const localStoragePreuves = JSON.parse(localStorage.getItem('preuves') || '[]') as Preuve[];
        
        // Default mock preuves (only used if localStorage is empty)
        const defaultPreuves: Preuve[] = [];
        
        // Combine and deduplicate
        const allPreuves = [
          ...localStoragePreuves,
          ...defaultPreuves.filter(dp => !localStoragePreuves.some(lp => lp._id === dp._id))
        ];
        
        console.log('📦 Local preuves found:', allPreuves.length);
        
        if (allPreuves.length > 0) {
          setPreuves(allPreuves);
          return; // Exit after successful localStorage load
        }
        
        console.log('ℹ️ No preuves found in localStorage or default data');
        setPreuves([]);
    } catch (error: any) {
      setError('Erreur lors du chargement des preuves');
      console.error('Error fetching preuves data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuditName = (auditId: string) => {
    const audit = audits.find(a => a._id === auditId);
    return audit ? audit.nom : `Audit ${auditId}`;
  };

  const filteredPreuves = preuves.filter(preuve => {
    // Add null checks to prevent errors
    if (!preuve || !preuve.typeFichier || !preuve.nomFichier) {
      return false;
    }
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'document' && preuve.typeFichier.includes('document')) ||
                         (filter === 'image' && preuve.typeFichier.includes('image')) ||
                         (filter === 'video' && preuve.typeFichier.includes('video')) ||
                         (filter === 'audio' && preuve.typeFichier.includes('audio'));
    const matchesSearch = preuve.nomFichier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preuve.typeFichier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getAuditName(preuve.audit).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudit = auditFilter === 'all' || preuve.audit === auditFilter;
    return matchesFilter && matchesSearch && matchesAudit;
  });

  const getPreuveStats = () => {
    const total = preuves.length;
    const documents = preuves.filter(p => p && p.typeFichier && p.typeFichier.includes('document')).length;
    const images = preuves.filter(p => p && p.typeFichier && p.typeFichier.includes('image')).length;
    const videos = preuves.filter(p => p && p.typeFichier && p.typeFichier.includes('video')).length;
    const audio = preuves.filter(p => p && p.typeFichier && p.typeFichier.includes('audio')).length;
    
    return { total, documents, images, videos, audio };
  };

  const stats = getPreuveStats();

  const getFileIcon = (typeFichier: string) => {
    if (!typeFichier) return '📁';
    if (typeFichier.includes('pdf')) return '📄';
    if (typeFichier.includes('image')) return '🖼️';
    if (typeFichier.includes('word') || typeFichier.includes('document')) return '📝';
    if (typeFichier.includes('excel') || typeFichier.includes('spreadsheet')) return '📊';
    if (typeFichier.includes('powerpoint') || typeFichier.includes('presentation')) return '📽️';
    if (typeFichier.includes('video')) return '🎥';
    if (typeFichier.includes('audio')) return '🎵';
    if (typeFichier.includes('zip') || typeFichier.includes('archive')) return '📦';
    return '📁';
  };

  const handleDeletePreuve = async (preuveId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette preuve ?')) {
      return;
    }

    try {
      // Remove from localStorage
      const localStoragePreuves = JSON.parse(localStorage.getItem('preuves') || '[]');
      const filteredPreuves = localStoragePreuves.filter((p: Preuve) => p._id !== preuveId);
      localStorage.setItem('preuves', JSON.stringify(filteredPreuves));
      
      // Update state
      setPreuves(prev => prev.filter(p => p._id !== preuveId));
      
      alert('Preuve supprimée avec succès !');
    } catch (error: any) {
      console.error('Error deleting preuve:', error);
      alert('Erreur lors de la suppression');
    }
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

  if (!user) {
    return (
      <AppLayout>
        <div className="card border-red-500 bg-red-500/10">
          <h3 className="text-lg font-medium text-red-400">Authentication Error</h3>
          <p className="text-red-300">No user found. Please log in again.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-2 btn-primary"
          >
            Go to Login
          </button>
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
              <h2 className="text-3xl font-bold text-white mb-2">📁 Gestion des Preuves</h2>
              <p className="text-gray-400 text-lg">
                Gérez les preuves et documents d'audit
              </p>
            </div>
            {(isAdmin || isRSSI) && (
              <Link to="/preuves/new">
                <Button variant="primary" size="lg">
                  + Nouvelle Preuve
                </Button>
              </Link>
            )}
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

        {/* Preuves Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Total"
            value={stats.total}
            accentColor="text-gray-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label="Documents"
            value={stats.documents}
            accentColor="text-blue-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            label="Images"
            value={stats.images}
            accentColor="text-emerald-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
            label="Vidéos"
            value={stats.videos}
            accentColor="text-purple-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>}
            label="Audio"
            value={stats.audio}
            accentColor="text-yellow-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            label="Total des preuves"
            value={stats.total}
            accentColor="text-indigo-400"
          />
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Filtres et recherche</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filtrer par type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Tous les types</option>
                  <option value="document">Documents</option>
                  <option value="image">Images</option>
                  <option value="video">Vidéos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filtrer par audit</label>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Tous les audits</option>
                  {audits.map(audit => (
                    <option key={audit._id} value={audit._id}>
                      {audit.nom} ({audit.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, description, audit..."
                  className="input-field w-full"
                />
              </div>
            </div>
            {auditFilter !== 'all' && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500 rounded-md">
                <p className="text-sm text-blue-400">
                  🔍 Filtrage par audit: <strong>{getAuditName(auditFilter)}</strong>
                  <button
                    onClick={() => setAuditFilter('all')}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Afficher tous les audits
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preuves List */}
        {preuves.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucune preuve</h3>
            <p className="text-gray-400 mb-6">
              Commencez par ajouter votre première preuve d'audit
            </p>
            {(isAdmin || isRSSI) && (
              <Link to="/preuves/new">
                <Button variant="primary">Ajouter la première preuve</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">
                Preuves ({filteredPreuves.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-700">
              {filteredPreuves.map((preuve) => {
                // Skip invalid preuves
                if (!preuve || !preuve._id) {
                  return null;
                }
                
                return (
                  <div key={preuve._id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getFileIcon(preuve.typeFichier || '')}</span>
                          <span className="text-sm text-gray-400">
                            {preuve.typeFichier || 'Unknown type'}
                          </span>
                          <span className="text-sm text-gray-400">
                            {getAuditName(preuve.audit || '')}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-white mb-2">
                          {preuve.nom || preuve.nomFichier || 'Unknown file'}
                        </h3>
                      
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📅 Créée le {new Date(preuve.createdAt || new Date()).toLocaleDateString('fr-FR')}</span>
                          <span>🔄 Modifiée le {new Date(preuve.updatedAt || new Date()).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link to={`/preuves/${preuve._id}`}>
                          <Button variant="secondary" size="sm">
                            Voir détails
                          </Button>
                        </Link>
                        
                        {(isAdmin || isRSSI) && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeletePreuve(preuve._id)}
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="mt-8 card border-blue-500 bg-blue-500/10">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 À propos des preuves :</h4>
          <ul className="text-xs text-blue-300 space-y-1">
            <li>• <strong>Admin/RSSI :</strong> Ajoutez et gérez les preuves d'audit</li>
            <li>• <strong>SSI :</strong> Consultez les preuves disponibles pour vos audits</li>
            <li>• <strong>Types :</strong> Documents, images, vidéos, audio</li>
            <li>• <strong>Associations :</strong> Liez les preuves aux audits spécifiques</li>
            <li>• <strong>Stockage :</strong> Gestion sécurisée des fichiers d'audit</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default PreuvesDashboard;