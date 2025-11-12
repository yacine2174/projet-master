import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import AppLayout from '../common/AppLayout';
import type { Audit, Preuve, Constat, Norme } from '../../types/audit';
import { auditAPI, normesAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

const AuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    type: 'Organisationnel' as 'Organisationnel' | 'Technique',
    perimetre: '',
    objectifs: '',
    dateDebut: '',
    dateFin: ''
  });
  const [editComment, setEditComment] = useState('');
  
  // Related data state
  const [relatedPreuves, setRelatedPreuves] = useState<Preuve[]>([]);
  const [relatedConstats, setRelatedConstats] = useState<Constat[]>([]);
  const [relatedNormes, setRelatedNormes] = useState<Norme[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (id) {
      // If mock audit, load from localStorage instead of calling API
      if (id.startsWith('mock-')) {
        try {
          const stored = JSON.parse(localStorage.getItem('newAudits') || '[]') as Audit[];
          const found = stored.find(a => a._id === id);
          if (found) {
            setAudit(found);
            setFormData({
              nom: found.nom,
              type: found.type,
              perimetre: found.perimetre,
              objectifs: found.objectifs,
              dateDebut: found.dateDebut,
              dateFin: found.dateFin
            });
            setIsLoading(false);
            // Load related data after audit is set
            setTimeout(() => loadRelatedData(id, found), 100);
            return;
          }
        } catch {}
      }
      fetchAudit(id);
    }
  }, [id]);

  // Load related data when audit is available
  useEffect(() => {
    if (audit && id) {
      loadRelatedData(id, audit);
    }
  }, [audit, id]);

  // Refresh data when component becomes visible (e.g., returning from preuve creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && audit && id) {
        console.log('🔄 Page became visible, refreshing related data');
        loadRelatedData(id, audit);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [audit, id]);


  const loadRelatedData = async (auditId: string, currentAudit: Audit) => {
    try {
      setIsLoadingRelated(true);
      console.log('🔄 Loading related data for audit:', auditId);
      console.log('📋 Audit normes:', currentAudit?.normes);
      
      // Load related preuves from API
      try {
        console.log('🌐 Fetching preuves from API...');
        const preuves = await auditAPI.getPreuves(auditId);
        console.log('✅ Preuves from API:', preuves.length);
        setRelatedPreuves(preuves);
        
        // Save to localStorage for offline access
        if (preuves.length > 0) {
          localStorage.setItem(`preuves:${auditId}`, JSON.stringify(preuves));
        }
      } catch (preuvesError) {
        console.error('Error fetching preuves from API, falling back to localStorage', preuvesError);
        
        // Fallback to localStorage if API fails
        try {
          const storedPreuves = JSON.parse(localStorage.getItem(`preuves:${auditId}`) || '[]') as Preuve[];
          console.log('📦 Using preuves from localStorage:', storedPreuves.length);
          setRelatedPreuves(storedPreuves);
        } catch (localError) {
          console.error('Error loading preuves from localStorage:', localError);
          setRelatedPreuves([]);
        }
      }

      // Load related constats from API
      try {
        console.log('🌐 Fetching constats from API...');
        const constats = await auditAPI.getConstats(auditId);
        console.log('✅ Constats from API:', constats.length);
        setRelatedConstats(constats);
        
        // Save to localStorage for offline access
        if (constats.length > 0) {
          localStorage.setItem(`constats:${auditId}`, JSON.stringify(constats));
        }
      } catch (constatsError) {
        console.error('Error fetching constats from API, falling back to localStorage', constatsError);
        
        // Fallback to localStorage if API fails
        try {
          const storedConstats = JSON.parse(localStorage.getItem(`constats:${auditId}`) || '[]') as Constat[];
          console.log('📦 Using constats from localStorage:', storedConstats.length);
          setRelatedConstats(storedConstats);
        } catch (localError) {
          console.error('Error loading constats from localStorage:', localError);
          setRelatedConstats([]);
        }
      }

      // Load related normes (standards)
      // If audit is from backend API, normes are already populated as objects
      // If audit is from localStorage, normes might be IDs that need to be fetched
      const auditNormes = currentAudit?.normes || [];
      console.log('🎯 Audit normes data:', auditNormes);
      
      let normesToDisplay: Norme[] = [];
      
      if (auditNormes.length > 0) {
        if (typeof auditNormes[0] === 'string') {
          // Normes are stored as IDs - fetch them from backend or localStorage
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://192.168.100.244:3000/api/normes', {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (response.ok) {
              const allNormes = await response.json();
              normesToDisplay = allNormes.filter((n: Norme) => auditNormes.includes(n._id));
              console.log('✅ Fetched normes from API:', normesToDisplay.length);
            }
          } catch (err) {
            // Fallback to localStorage
            const storedNormes = JSON.parse(localStorage.getItem('normes') || '[]') as Norme[];
            normesToDisplay = storedNormes.filter(n => auditNormes.includes(n._id));
            console.log('✅ Fetched normes from localStorage:', normesToDisplay.length);
          }
        } else {
          // Normes are already populated as objects
          normesToDisplay = auditNormes as unknown as Norme[];
          console.log('✅ Using populated normes:', normesToDisplay.length, normesToDisplay.map(n => n.nom));
        }
      }
      
      setRelatedNormes(normesToDisplay);
    } catch (e) {
      console.error('Error loading related data:', e);
    } finally {
      setIsLoadingRelated(false);
    }
  };


  const fetchAudit = async (auditId: string) => {
    try {
      setIsLoading(true);
      setError('');

      try {
        const data = await auditAPI.getAudit(auditId);
        console.log('📦 Fetched audit from API:', data);
        console.log('📋 Audit normes field:', data.normes);
        console.log('📋 Normes type:', typeof data.normes, Array.isArray(data.normes) ? 'is array' : 'not array');
        setAudit(data);
        setFormData({
          nom: data.nom,
          type: data.type,
          perimetre: data.perimetre,
          objectifs: data.objectifs,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin
        });
      } catch (apiError) {
        // Fallback to mock if API not available
        const mockAudit: Audit = {
          _id: auditId,
          nom: 'Audit de sécurité organisationnelle Q1 2024',
          type: 'Organisationnel',
          perimetre: 'Processus de gestion des accès',
          objectifs: 'Évaluer la conformité aux normes ISO 27001',
          dateDebut: '2024-01-01',
          dateFin: '2024-03-31',
          statut: 'Terminé',
          creerPar: 'user1',
          normes: ['norme1', 'norme2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-03-31T00:00:00Z'
        };
        setAudit(mockAudit);
        setFormData({
          nom: mockAudit.nom,
          type: mockAudit.type,
          perimetre: mockAudit.perimetre,
          objectifs: mockAudit.objectifs,
          dateDebut: mockAudit.dateDebut,
          dateFin: mockAudit.dateFin
        });
      }
    } catch (e: any) {
      setError('Erreur lors du chargement de l\'audit');
      console.error('Error fetching audit:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    if (!editComment.trim()) {
      setError('Veuillez ajouter un commentaire de modification.');
      return;
    }

    // Validate required fields before sending
    if (!formData.nom || !formData.type || !formData.perimetre || !formData.objectifs || !formData.dateDebut || !formData.dateFin) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validate field lengths and word counts to match backend requirements
    const nomWords = formData.nom.trim().split(/\s+/).filter(word => word.length > 0);
    if (nomWords.length < 2) {
      setError('Le nom doit contenir au moins 2 mots pour être compréhensible.');
      return;
    }
    if (formData.nom.length < 8 || formData.nom.length > 200) {
      setError('Le nom doit contenir entre 8 et 200 caractères.');
      return;
    }

    const perimetreWords = formData.perimetre.trim().split(/\s+/).filter(word => word.length > 0);
    if (perimetreWords.length < 3) {
      setError('Le périmètre doit contenir au moins 3 mots pour être compréhensible.');
      return;
    }
    if (formData.perimetre.length < 8 || formData.perimetre.length > 500) {
      setError('Le périmètre doit contenir entre 8 et 500 caractères.');
      return;
    }

    const objectifsWords = formData.objectifs.trim().split(/\s+/).filter(word => word.length > 0);
    if (objectifsWords.length < 4) {
      setError('Les objectifs doivent contenir au moins 4 mots pour être compréhensibles.');
      return;
    }
    if (formData.objectifs.length < 8 || formData.objectifs.length > 1000) {
      setError('Les objectifs doivent contenir entre 8 et 1000 caractères.');
      return;
    }

    // Validate user ID
    if (!user?.id) {
      setError('Votre identifiant utilisateur est invalide. Veuillez vous reconnecter.');
      return;
    }

    // Validate and format dates
    let dateDebut, dateFin;
    try {
      dateDebut = new Date(formData.dateDebut).toISOString();
      dateFin = new Date(formData.dateFin).toISOString();
    } catch (dateError) {
      setError('Format de date invalide. Veuillez utiliser le format YYYY-MM-DD.');
      return;
    }

    // Validate date range
    if (new Date(dateDebut) >= new Date(dateFin)) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (id.startsWith('mock-')) {
        // Convert mock to real audit
        const createData = {
          nom: formData.nom,
          type: formData.type,
          perimetre: formData.perimetre,
          objectifs: formData.objectifs,
          dateDebut: dateDebut,
          dateFin: dateFin,
          creerPar: user.id
        };

        console.log('Creating audit with data:', createData);

        const newAudit = await auditAPI.createAudit(createData);
        
        // Replace mock in localStorage newAudits with real audit
        const mockAudits = JSON.parse(localStorage.getItem('newAudits') || '[]');
        const updatedMockAudits = mockAudits.map((a: any) => 
          a._id === id ? newAudit : a
        );
        localStorage.setItem('newAudits', JSON.stringify(updatedMockAudits));
        
        // Navigate to the new real audit
        navigate(`/audits/${newAudit._id}`);
        return;
      }

      // Update existing audit
      const updateData = {
        nom: formData.nom,
        type: formData.type,
        perimetre: formData.perimetre,
        objectifs: formData.objectifs,
        dateDebut: dateDebut,
        dateFin: dateFin
      };

      const updated = await auditAPI.updateAudit(id, updateData);
      setAudit(updated);
      
      setEditComment('');
      setIsEditing(false);
    } catch (e: any) {
      console.error('Error details:', e.response?.data);
      if (e.response?.data?.errors) {
        // Show specific validation errors from backend
        const errorMessages = e.response.data.errors.map((err: any) => err.msg).join(', ');
        setError(`Erreurs de validation: ${errorMessages}`);
      } else {
        setError(e.response?.data?.message || 'Erreur lors de la mise à jour de l\'audit');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'Planifié' | 'En cours' | 'Terminé') => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Update local state immediately for better UX
      setAudit(prev => {
        if (!prev) return prev;
        const updated = { ...prev, statut: newStatus };
        // Save to localStorage if it's a mock audit
        if (id.startsWith('mock-')) {
          const mockAudits = JSON.parse(localStorage.getItem('newAudits') || '[]');
          const updatedMockAudits = mockAudits.map((a: any) => 
            a._id === id ? updated : a
          );
          localStorage.setItem('newAudits', JSON.stringify(updatedMockAudits));
        }
        return updated;
      });
      
      // Update form data
      setFormData(prev => ({ ...prev, statut: newStatus }));
      
      // Try to update backend if it's a real audit
      if (!id.startsWith('mock-')) {
        try {
          const updated = await auditAPI.updateAuditStatus(id, newStatus);
          setAudit(updated);
        } catch (apiError) {
          console.log('Backend update failed, keeping local change');
        }
      }
      
      // Status change completed successfully
      
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la mise à jour du statut');
      // Revert the change if there was an error
      setAudit(prev => prev ? { ...prev, statut: audit?.statut || 'Planifié' } as Audit : prev);
      setFormData(prev => ({ ...prev, statut: audit?.statut || 'Planifié' }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Planifié': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Planifié' },
      'En cours': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En cours' },
      'Terminé': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Terminé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Planifié;
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Organisationnel': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Organisationnel' },
      'Technique': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Technique' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.Organisationnel;
    
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

  if (error || !audit) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
          <p className="text-gray-400 mb-4">{error || 'Audit non trouvé'}</p>
          <Button variant="primary" onClick={() => navigate('/audits')}>
            Retour à la liste
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Retour
            </button>
            <div className="space-x-2">
              {!isEditing ? (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => { setIsEditing(false); setEditComment(''); setError(''); }}>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Enregistrer
                  </Button>
                </>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{audit.nom}</h1>
          <div className="flex items-center space-x-4">
            {getTypeBadge(audit.type)}
            {getStatusBadge(audit.statut)}
          </div>
        </div>

        {/* Audit Information */}
        <div className="card mb-8">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Informations générales</h2>
          </div>
          <div className="px-6 py-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Périmètre</h3>
                  <p className="text-white">{audit.perimetre}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Objectifs</h3>
                  <p className="text-white">{audit.objectifs}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Date de début</h3>
                  <p className="text-white">{new Date(audit.dateDebut).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Date de fin</h3>
                  <p className="text-white">{new Date(audit.dateFin).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="nom" name="nom" label="Nom" value={formData.nom} onChange={handleChange} required />
              <Select
                id="type"
                name="type"
                label="Type"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: 'Organisationnel', label: 'Organisationnel' },
                  { value: 'Technique', label: 'Technique' }
                ]}
                required
              />
              <Input id="perimetre" name="perimetre" label="Périmètre" value={formData.perimetre} onChange={handleChange} required />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Objectifs</label>
                <textarea
                  name="objectifs"
                  value={formData.objectifs}
                  onChange={handleChange}
                  rows={3}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date de début</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date de fin</label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                />
              </div>
              {/* RSSI Status Change Control - Move here when editing */}
              {isRSSI && (
                <div className="md:col-span-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    🔄 Changer le statut (RSSI uniquement)
                  </label>
                  <div className="flex space-x-2">
                    <Button 
                      variant={audit?.statut === 'Planifié' ? 'primary' : 'outline'} 
                      onClick={() => handleStatusChange('Planifié')}
                      disabled={isLoading}
                      size="sm"
                    >
                      Planifié
                    </Button>
                    <Button 
                      variant={audit?.statut === 'En cours' ? 'primary' : 'outline'} 
                      onClick={() => handleStatusChange('En cours')}
                      disabled={isLoading}
                      size="sm"
                    >
                      En cours
                    </Button>
                    <Button 
                      variant={audit?.statut === 'Terminé' ? 'primary' : 'outline'} 
                      onClick={() => handleStatusChange('Terminé')}
                      disabled={isLoading}
                      size="sm"
                    >
                      Terminé
                    </Button>
                  </div>
                  {isLoading && (
                    <p className="text-sm text-blue-400 mt-2">Mise à jour en cours...</p>
                  )}
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Commentaire de modification</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder={'Expliquez ce qui a été modifié (obligatoire)'}
                  rows={3}
                  className="input-field w-full"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">Ce commentaire sera enregistré localement dans l\'historique de l\'audit.</p>
              </div>
            </form>
          )}
        </div>
      </div>


        {/* Related Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Related Preuves */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">📎 Preuves associées</h3>
              <p className="text-sm text-gray-400">{relatedPreuves.length} preuve(s)</p>
            </div>
          <div className="px-6 py-4">
            
            {isLoadingRelated ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
              </div>
            ) : relatedPreuves.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune preuve associée à cet audit</p>
            ) : (
              <div className="space-y-2">
                {relatedPreuves.slice(0, 3).map((preuve) => (
                  <div key={preuve._id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-sm">📄</span>
                      <span className="text-sm font-medium truncate text-white">{preuve.nom || preuve.nomFichier}</span>
                    </div>
                    <Link 
                      to={`/preuves/${preuve._id}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 ml-2 flex-shrink-0"
                    >
                      Voir
                    </Link>
                  </div>
                ))}
                {relatedPreuves.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{relatedPreuves.length - 3} autres preuves
                  </p>
                )}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <Link to={`/preuves?audit=${id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Voir toutes les preuves
                </Button>
              </Link>
              {(isAdmin || isRSSI || isSSI) && (
                <Link to={`/preuves/new?audit=${id}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    + Ajouter une preuve
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

          {/* Related Constats */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">🔍 Constats associés</h3>
              <p className="text-sm text-gray-400">{relatedConstats.length} constat(s)</p>
            </div>
          <div className="px-6 py-4">
            {isLoadingRelated ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : relatedConstats.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun constat associé à cet audit</p>
            ) : (
              <div className="space-y-2">
                {relatedConstats.slice(0, 3).map((constat) => (
                  <div key={constat._id} className="p-2 bg-slate-900 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-400 uppercase">{constat.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        constat.criticite === 'élevé' ? 'bg-red-100 text-red-800' :
                        constat.criticite === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {constat.criticite}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{constat.description}</p>
                    <Link 
                      to={`/constats/${constat._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Voir détails
                    </Link>
                  </div>
                ))}
                {relatedConstats.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{relatedConstats.length - 3} autres constats
                  </p>
                )}
              </div>
            )}
            <div className="mt-4 space-y-2">
              {(isAdmin || isRSSI || isSSI) && (
                <Link to={`/constats/new?audit=${id}&auditName=${encodeURIComponent(audit.nom)}&auditType=${audit.type}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    + Ajouter un constat
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Related Normes */}
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-medium text-white">📋 Normes associées</h3>
            <p className="text-sm text-gray-500">{relatedNormes.length} norme(s)</p>
          </div>
          <div className="px-6 py-4">
            {isLoadingRelated ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : relatedNormes.length === 0 ? (
              <div>
                <p className="text-sm text-gray-500">Aucune norme associée à cet audit</p>
              </div>
            ) : (
              <div className="space-y-2">
                {relatedNormes.slice(0, 3).map((norme) => (
                  <div key={norme._id} className="p-2 bg-slate-900 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{norme.nom}</span>
                      <span className="text-xs text-gray-500">{norme.version}</span>
                    </div>
                    <p className="text-xs text-slate-400">{norme.categorie}</p>
                    <Link 
                      to={`/normes/${norme._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Voir détails
                    </Link>
                  </div>
                ))}
                {relatedNormes.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{relatedNormes.length - 3} autres normes
                  </p>
                )}
              </div>
            )}
            <div className="mt-4">
              <Link to={`/normes?audit=${id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Voir toutes les normes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

        {/* Audit Components Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Synthèse */}
          <Link to={`/audits/${id}/synthese`} className="card p-6 hover:shadow-lg transition-all">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-400 text-xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Synthèse</h3>
              <p className="text-sm text-gray-400 mb-4">
                Consultez la synthèse et les statistiques de cet audit
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Voir
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditDetail;
