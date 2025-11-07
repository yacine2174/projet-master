import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { Constat, Audit, Projet, Recommandation } from '../../types/audit';

const ConstatDetail: React.FC = () => {
  const { constatId } = useParams<{ constatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [constat, setConstat] = useState<Constat | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [projet, setProjet] = useState<Projet | null>(null);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    description: '',
    type: 'NC maj' as 'NC maj' | 'NC min' | 'PS' | 'PP',
    criticite: 'Élevée',
    impact: '',
    probabilite: 'Élevée'
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
    if (constatId) {
      fetchConstat();
    }
  }, [constatId]);

  const fetchConstat = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Fetching constat:', constatId);

      let foundConstat: Constat | null = null;

      // Try to fetch from backend API first (with timeout)
      try {
        const token = localStorage.getItem('authToken');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`http://192.168.100.244:3000/api/constats/${constatId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          foundConstat = await response.json();
          console.log('✅ Found constat from API');
        } else if (response.status === 404) {
          console.log('⚠️ Constat not found in API, checking localStorage');
        }
      } catch (error: any) {
        console.log('⚠️ API fetch failed or timed out, checking localStorage:', error.message);
      }

      // Fallback: check localStorage
      if (!foundConstat) {
        const localConstats = JSON.parse(localStorage.getItem('constats') || '[]') as Constat[];
        foundConstat = localConstats.find(c => c._id === constatId) || null;
        
        if (foundConstat) {
          console.log('✅ Found constat in localStorage');
        } else {
          console.log('❌ Constat not found in localStorage either');
        }
      }

      if (foundConstat) {
        setConstat(foundConstat);
        setEditData({
          description: foundConstat.description,
          type: foundConstat.type,
          criticite: foundConstat.criticite,
          impact: foundConstat.impact,
          probabilite: foundConstat.probabilite
        });
        
        // Fetch associated audit and projet
        const auditId = typeof foundConstat.audit === 'object' && foundConstat.audit?._id 
          ? foundConstat.audit._id 
          : foundConstat.audit;
        
        const projetId = typeof foundConstat.projet === 'object' && foundConstat.projet?._id 
          ? foundConstat.projet._id 
          : foundConstat.projet;
        
        console.log('🔍 Extracted IDs - Audit:', auditId, 'Projet:', projetId);
        
        if (auditId) await fetchAudit(auditId);
        if (projetId) await fetchProjet(projetId);
        if (foundConstat.recommandations) await fetchRecommandations(foundConstat.recommandations);
      } else {
        setError('Constat non trouvé');
      }
    } catch (error: any) {
      setError('Erreur lors du chargement du constat');
      console.error('Error fetching constat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudit = async (auditId: string) => {
    try {
      console.log('🔍 Fetching audit:', auditId);
      
      // Try to fetch from API first (with timeout)
      try {
        const token = localStorage.getItem('authToken');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`http://192.168.100.244:3000/api/audits/${auditId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const foundAudit = await response.json();
          console.log('✅ Found audit from API:', foundAudit.nom);
          setAudit(foundAudit);
          return;
        }
      } catch (err) {
        console.log('⚠️ API fetch failed for audit, checking localStorage');
      }
      
      // Fallback: Get audits from localStorage
      const localStorageAudits = JSON.parse(localStorage.getItem('audits') || '[]');
      const newAudits = JSON.parse(localStorage.getItem('newAudits') || '[]');
      
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
          console.log('✅ ConstatDetail loaded real audits from API:', realAudits.length);
        }
      } catch (apiError) {
        console.log('⚠️ ConstatDetail could not load real audits from API, using localStorage only');
      }

      const allAudits = [...realAudits, ...defaultAudits, ...localStorageAudits, ...newAudits];
      console.log('📋 ConstatDetail all available audits:', allAudits.map(a => ({ id: a._id, nom: a.nom, type: a.type })));
      const foundAudit = allAudits.find(a => a._id === auditId);
      console.log('🎯 ConstatDetail found audit for ID', auditId, ':', foundAudit ? foundAudit.nom : 'NOT FOUND');
      setAudit(foundAudit || null);
    } catch (error: any) {
      console.error('Error fetching audit:', error);
    }
  };

  const fetchProjet = async (projetId: string) => {
    try {
      console.log('🔍 Fetching projet:', projetId);
      
      // Try to fetch from API first (with timeout)
      try {
        const token = localStorage.getItem('authToken');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`http://192.168.100.244:3000/api/projets/${projetId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const foundProjet = await response.json();
          console.log('✅ Found projet from API:', foundProjet.nom);
          setProjet(foundProjet);
          return;
        }
      } catch (err) {
        console.log('⚠️ API fetch failed for projet, checking localStorage');
      }
      
      // Fallback: Get projets from localStorage
      const localStorageProjets = JSON.parse(localStorage.getItem('projets') || '[]');
      const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      
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

      const allProjets = [...defaultProjets, ...localStorageProjets, ...localStorageProjects];
      console.log('📋 All available projets:', allProjets.map(p => ({ id: p._id, nom: p.nom })));
      const foundProjet = allProjets.find(p => p._id === projetId);
      console.log('🎯 Found projet for ID', projetId, ':', foundProjet ? foundProjet.nom : 'NOT FOUND');
      setProjet(foundProjet || null);
    } catch (error: any) {
      console.error('Error fetching projet:', error);
    }
  };

  const fetchRecommandations = async (_recommandationIds: string[]): Promise<Recommandation[]> => {
    try {
      // Get recommandations from localStorage
      const localStorageRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      
      // Default mock recommandations
      const defaultRecommandations: Recommandation[] = [
        {
          _id: 'recommandation_1',
          contenu: 'Mise à jour des politiques de sécurité pour assurer la conformité ISO 27001',
          priorite: 'Élevée',
          complexite: 'Moyenne',
          statut: 'en attente',
          constat: 'constat_1',
          plansAction: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allRecommandations = [...defaultRecommandations, ...localStorageRecommandations];
      
      // Filter recommandations that belong to this constat
      const relatedRecommandations = allRecommandations.filter(r => r.constat === constatId);
      setRecommandations(relatedRecommandations);
      return relatedRecommandations;
    } catch (error: any) {
      console.error('Error fetching recommandations:', error);
      return [];
    }
  };


  const handleSave = async () => {
    if (!constat) return;

    try {
      setIsLoading(true);
      setError('');

      // Update in backend database
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.100.244:3000/api/constats/${constat._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const updatedConstat = await response.json();
      setConstat(updatedConstat);
      setIsEditing(false);
      console.log('✅ Constat updated:', updatedConstat);
      alert('Constat mis à jour avec succès !');
    } catch (error: any) {
      setError('Erreur lors de la mise à jour');
      console.error('Error updating constat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!constat) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce constat ?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Delete from backend database
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.100.244:3000/api/constats/${constat._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      console.log('✅ Constat deleted:', constat._id);
      alert('Constat supprimé avec succès !');
      navigate('/constats');
    } catch (error: any) {
      setError('Erreur lors de la suppression');
      console.error('Error deleting constat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NC maj': return 'bg-red-500/20 text-red-400';
      case 'NC min': return 'bg-orange-500/20 text-orange-400';
      case 'PS': return 'bg-green-500/20 text-green-400';
      case 'PP': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCriticiteColor = (criticite: string) => {
    switch (criticite) {
      case 'Élevée': return 'bg-red-500/20 text-red-400';
      case 'Moyenne': return 'bg-yellow-500/20 text-yellow-400';
      case 'Faible': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement du constat...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !constat) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur</h2>
          <p className="text-gray-400 mb-4">{error || 'Constat non trouvé'}</p>
          <Button variant="secondary" onClick={() => navigate('/constats')}>
            ← Retour aux constats
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">🔍 Détails du Constat</h1>
                <p className="text-gray-400 mt-1">ID: {constat._id}</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
                  🏠 Tableau de bord
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  ← Retour
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description du constat
                  </label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field w-full"
                    />
                  ) : (
                    <div className="p-4 bg-gray-800 rounded-md">
                      <p className="text-white">{constat.description}</p>
                    </div>
                  )}
                </div>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Impact
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="impact"
                      value={editData.impact}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  ) : (
                    <div className="p-4 bg-gray-800 rounded-md">
                      <p className="text-white">{constat.impact}</p>
                    </div>
                  )}
                </div>


                {/* Audit associé */}
                {audit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Audit associé
                    </label>
                    <div className="p-4 bg-blue-500/10 rounded-md border border-blue-500/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-blue-300 font-medium">{audit.nom}</p>
                          <p className="text-blue-400 text-sm mt-1">{audit.type} - {audit.perimetre}</p>
                          <div className="mt-2 flex space-x-2">
                            <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                              {audit.statut}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Projet associé */}
                {projet && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Projet associé
                    </label>
                    <div className="p-4 bg-green-500/10 rounded-md border border-green-500/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-green-300 font-medium">{projet.nom}</p>
                          <p className="text-green-400 text-sm mt-1">{projet.perimetre}</p>
                          <div className="mt-2 flex space-x-2">
                            <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                              {projet.statut}
                            </span>
                            <span className="px-3 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
                              {projet.priorite}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Recommandations associées ({recommandations.length})
                    </label>
                    {(isAdmin || isRSSI || isSSI) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/recommandations/new?constat=${constatId}`)}
                      >
                        + Ajouter une recommandation
                      </Button>
                    )}
                  </div>
                  
                  {recommandations.length === 0 ? (
                    <div className="p-4 bg-gray-800 rounded-md border border-gray-700 text-center">
                      <p className="text-gray-400 text-sm mb-2">Aucune recommandation associée à ce constat</p>
                      {(isAdmin || isRSSI || isSSI) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recommandations/new?constat=${constatId}`)}
                        >
                          + Créer la première recommandation
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recommandations.map((recommandation) => (
                        <div key={recommandation._id} className="p-3 bg-gray-800 rounded-md border border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white text-sm">{recommandation.contenu}</p>
                              <div className="mt-2 flex space-x-2">
                                <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                                  {recommandation.priorite}
                                </span>
                                <span className="px-3 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
                                  {recommandation.statut}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/recommandations/${recommandation._id}`)}
                                className="text-xs"
                              >
                                Voir
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Type and Criticité */}
                <div className="card p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Informations</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                      {isEditing ? (
                        <select
                          name="type"
                          value={editData.type}
                          onChange={handleInputChange}
                          className="input-field w-full"
                        >
                          <option value="NC maj">NC Majeure</option>
                          <option value="NC min">NC Mineure</option>
                          <option value="PS">Point de Satisfaction</option>
                          <option value="PP">Point de Progrès</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(constat.type)}`}>
                          {constat.type}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Criticité</label>
                      {isEditing ? (
                        <select
                          name="criticite"
                          value={editData.criticite}
                          onChange={handleInputChange}
                          className="input-field w-full"
                        >
                          <option value="Élevée">Élevée</option>
                          <option value="Moyenne">Moyenne</option>
                          <option value="Faible">Faible</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCriticiteColor(constat.criticite)}`}>
                          {constat.criticite}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Probabilité</label>
                      {isEditing ? (
                        <select
                          name="probabilite"
                          value={editData.probabilite}
                          onChange={handleInputChange}
                          className="input-field w-full"
                        >
                          <option value="Élevée">Élevée</option>
                          <option value="Moyenne">Moyenne</option>
                          <option value="Faible">Faible</option>
                        </select>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                          {constat.probabilite}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="card p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Dates</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>
                      <span className="font-medium">Créé le:</span>
                      <br />
                      {new Date(constat.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Modifié le:</span>
                      <br />
                      {new Date(constat.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions - SSI and RSSI can edit/delete */}
                {(isAdmin || isRSSI || isSSI) && (
                  <div className="card p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Actions</h3>
                    <div className="space-y-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isLoading}
                            className="w-full"
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                            className="w-full"
                          >
                            ✏️ Modifier
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            🗑️ Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConstatDetail;
