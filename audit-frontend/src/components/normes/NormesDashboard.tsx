import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import type { Norme } from '../../types/audit';

const NormesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [normes, setNormes] = useState<Norme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';

  useEffect(() => {
    fetchNormes();
  }, []);

  const fetchNormes = async () => {
    try {
      setIsLoading(true);
      setError('');

      let allNormes: Norme[] = [];

      // Fetch normes from backend API
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://192.168.100.244:3000/api/normes', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const apiNormes = await response.json();
          console.log('📦 Fetched normes from API:', apiNormes.length);
          allNormes = Array.isArray(apiNormes) ? apiNormes : [];
        }
      } catch (apiError) {
        console.error('Error fetching normes from API:', apiError);
      }

      // Fallback: Get normes from localStorage
      try {
        const localStorageNormes: Norme[] = JSON.parse(localStorage.getItem('normes') || '[]');
        console.log('📦 Normes from localStorage:', localStorageNormes.length);
        // Always merge localStorage normes, preferring API entries on conflict
        const merged = [
          ...allNormes,
          ...localStorageNormes.filter(ls => !allNormes.some(api => api._id === ls._id))
        ];
        allNormes = merged;
      } catch (localError) {
        console.error('Error loading normes from localStorage:', localError);
      }

      console.log('✅ Total normes loaded:', allNormes.length);
      setNormes(allNormes);
    } catch (error: any) {
      setError('Erreur lors du chargement des normes');
      console.error('Error fetching normes data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNormes = normes.filter(norme => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'iso' && norme.categorie.toLowerCase().includes('iso')) ||
                         (filter === 'nist' && norme.categorie.toLowerCase().includes('nist')) ||
                         (filter === 'cis' && norme.categorie.toLowerCase().includes('cis')) ||
                         (filter === 'owasp' && norme.categorie.toLowerCase().includes('owasp')) ||
                         (filter === 'pci' && norme.categorie.toLowerCase().includes('pci')) ||
                         (filter === 'conformite' && norme.categorie.toLowerCase().includes('conformité')) ||
                         (filter === 'soc' && norme.categorie.toLowerCase().includes('soc')) ||
                         (filter === 'anssi' && norme.categorie.toLowerCase().includes('anssi'));
    const desc = (norme.description || '').toString();
    const matchesSearch = norme.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         norme.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getAuditNames = (auditIds: string[]) => {
    // Get audits from localStorage
    const localStorageAudits = JSON.parse(localStorage.getItem('audits') || '[]');
    
    // Default mock audits for demonstration
    const defaultAudits = [
      { _id: 'audit_1', nom: 'Audit de sécurité organisationnel' },
      { _id: 'audit_2', nom: 'Audit technique infrastructure' },
      { _id: 'audit_3', nom: 'Audit de conformité RGPD' }
    ];
    
    const allAudits = [...defaultAudits, ...localStorageAudits];
    
    return auditIds.map(id => {
      const audit = allAudits.find(a => a._id === id);
      return audit ? audit.nom : `Audit ${id}`;
    });
  };

  const getNormeStats = () => {
    const total = normes.length;
    const iso = normes.filter(n => n.categorie.toLowerCase().includes('iso')).length;
    const nist = normes.filter(n => n.categorie.toLowerCase().includes('nist')).length;
    const cis = normes.filter(n => n.categorie.toLowerCase().includes('cis')).length;
    const owasp = normes.filter(n => n.categorie.toLowerCase().includes('owasp')).length;
    const pci = normes.filter(n => n.categorie.toLowerCase().includes('pci')).length;
    const autres = normes.filter(n => {
      const cat = n.categorie.toLowerCase();
      return !cat.includes('iso') && !cat.includes('nist') && !cat.includes('cis') && !cat.includes('owasp') && !cat.includes('pci');
    }).length;
    const withAudits = normes.filter(n => n.audits && n.audits.length > 0).length;
    
    return { total, iso, nist, cis, owasp, pci, autres, withAudits };
  };

  const stats = getNormeStats();

  const getCategorieBadge = (categorie: string) => {
    const catLower = categorie.toLowerCase();
    
    let config;
    if (catLower.includes('iso')) {
      config = { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '📋 ' + categorie };
    } else if (catLower.includes('nist')) {
      config = { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '🏛️ ' + categorie };
    } else if (catLower.includes('cis')) {
      config = { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '🛡️ ' + categorie };
    } else if (catLower.includes('owasp')) {
      config = { bg: 'bg-red-500/20', text: 'text-red-400', label: '🔓 ' + categorie };
    } else if (catLower.includes('pci')) {
      config = { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '💳 ' + categorie };
    } else if (catLower.includes('conformité')) {
      config = { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: '⚖️ ' + categorie };
    } else if (catLower.includes('soc')) {
      config = { bg: 'bg-pink-500/20', text: 'text-pink-400', label: '📊 ' + categorie };
    } else if (catLower.includes('anssi')) {
      config = { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: '🇫🇷 ' + categorie };
    } else {
      config = { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '📋 ' + categorie };
    }
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteNorme = async (normeId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette norme ?')) {
      return;
    }

    try {
      // Remove from localStorage
      const localStorageNormes = JSON.parse(localStorage.getItem('normes') || '[]');
      const filteredNormes = localStorageNormes.filter((n: Norme) => n._id !== normeId);
      localStorage.setItem('normes', JSON.stringify(filteredNormes));

      // Update state
      setNormes(prev => prev.filter(n => n._id !== normeId));
      
      console.log('✅ Norme deleted from localStorage');
      alert('Norme supprimée avec succès !');
    } catch (error: any) {
      console.error('Error deleting norme:', error);
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

  if (error) {
    return (
      <AppLayout>
        <div className="card text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button variant="primary" onClick={fetchNormes}>
            Réessayer
          </Button>
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
              <h2 className="text-3xl font-bold text-white mb-2">📚 Normes de Conformité</h2>
              <p className="text-gray-400 text-lg">
                {isAdmin || isRSSI 
                  ? 'Gérez les normes et standards de conformité pour vos audits'
                  : 'Consultez les normes de conformité disponibles pour vos audits'
                }
              </p>
            </div>
            {(isAdmin || isRSSI) && (
              <Link to="/normes/new">
                <Button variant="primary" size="lg">
                  + Nouvelle Norme
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Normes Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Total"
            value={stats.total}
            accentColor="text-gray-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label="ISO"
            value={stats.iso}
            accentColor="text-blue-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            label="NIST"
            value={stats.nist}
            accentColor="text-emerald-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            label="CIS"
            value={stats.cis}
            accentColor="text-purple-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            label="OWASP"
            value={stats.owasp}
            accentColor="text-red-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            label="PCI"
            value={stats.pci}
            accentColor="text-yellow-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            label="Autres"
            value={stats.autres}
            accentColor="text-orange-400"
          />
          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Utilisées"
            value={stats.withAudits}
            accentColor="text-indigo-400"
          />
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Filtres et recherche</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filtrer par catégorie</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="iso">ISO (27001, 27002, 9001, etc.)</option>
                  <option value="nist">NIST (Cybersecurity Framework, SP 800-53, etc.)</option>
                  <option value="cis">CIS Controls</option>
                  <option value="owasp">OWASP (Top 10, Mobile, API, ASVS)</option>
                  <option value="pci">PCI DSS</option>
                  <option value="conformite">Conformité (RGPD, HIPAA)</option>
                  <option value="soc">SOC 2</option>
                  <option value="anssi">ANSSI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, catégorie, description..."
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Normes List */}
        {normes.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucune norme</h3>
            <p className="text-gray-400 mb-6">
              Commencez par créer votre première norme de conformité
            </p>
            {(isAdmin || isRSSI) && (
              <Link to="/normes/new">
                <Button variant="primary">Créer la première norme</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">
                Normes ({filteredNormes.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-700">
              {filteredNormes.map((norme) => (
                <div key={norme._id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getCategorieBadge(norme.categorie)}
                        <span className="text-sm text-gray-400">
                          Version {norme.version}
                        </span>
                        <span className="text-sm text-gray-400">
                          {(norme.audits?.length || 0)} audit(s) associé(s)
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-white mb-2">
                        {norme.nom}
                      </h3>
                      
                      <p className="text-sm text-gray-300 mb-3">{norme.description || 'Pas de description'}</p>
                      <p className="text-sm text-gray-300 mb-3">{norme.description}</p>
                      
                      {/* Show associated audits */}
                      {norme.audits.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-400 mb-1">Audits associés :</p>
                          <div className="flex flex-wrap gap-1">
                            {getAuditNames(norme.audits).map((auditName, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400"
                              >
                                🔍 {auditName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📅 Créée le {new Date(norme.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>🔄 Modifiée le {new Date(norme.updatedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link to={`/normes/${norme._id}`}>
                        <Button variant="secondary" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                      
                      {(isAdmin || isRSSI) && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteNorme(norme._id)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="mt-8 card border-blue-500 bg-blue-500/10">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 À propos des normes :</h4>
          <ul className="text-xs text-blue-300 space-y-1">
            <li>• <strong>Admin/RSSI :</strong> Créez et gérez les normes de conformité</li>
            <li>• <strong>SSI :</strong> Consultez les normes disponibles pour vos audits</li>
            <li>• <strong>Catégories :</strong> Organisez les normes par domaine (sécurité, qualité, etc.)</li>
            <li>• <strong>Associations :</strong> Voir quels audits utilisent chaque norme</li>
            <li>• <strong>Descriptions :</strong> Comprendre les exigences de chaque norme</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default NormesDashboard;
