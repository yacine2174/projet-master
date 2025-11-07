import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import Select from '../common/Select';
import AppLayout from '../common/AppLayout';
import StyledCard from '../common/StyledCard';
import type { Projet, Constat, SWOT, Conception, Risque, Audit, SecuriteProjet, PAS } from '../../types/audit';

// Add auth context import for dashboard path
import { useAuth } from '../../contexts/AuthContext';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Projet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Related data state
  const [relatedConstats, setRelatedConstats] = useState<Constat[]>([]);
  const [relatedSWOTs, setRelatedSWOTs] = useState<SWOT[]>([]);
  const [relatedConceptions, setRelatedConceptions] = useState<Conception[]>([]);
  const [relatedRisques, setRelatedRisques] = useState<Risque[]>([]);
  const [relatedAudit, setRelatedAudit] = useState<Audit | null>(null);
  const [securiteConfig, setSecuriteConfig] = useState<SecuriteProjet | null>(null);
  const [relatedPAS, setRelatedPAS] = useState<PAS[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    perimetre: '',
    budget: 0,
    priorite: 'Moyenne' as 'Faible' | 'Moyenne' | 'Élevée',
    dateDebut: '',
    dateFin: '',
    statut: 'Planifié' as 'Planifié' | 'En cours' | 'En attente' | 'Terminé'
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    if (project && id) {
      loadRelatedData();
    }
  }, [project, id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://192.168.100.244:3000/api/projets/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Projet non trouvé dans la base de données');
        } else if (res.status === 401) {
          setError('Non autorisé. Veuillez vous reconnecter.');
        } else {
          setError(`Erreur lors du chargement du projet (${res.status})`);
        }
        setIsLoading(false);
        return;
      }
      
      const foundProject = await res.json();
      setProject(foundProject);
      setFormData({
        nom: foundProject.nom,
        perimetre: foundProject.perimetre,
        budget: foundProject.budget,
        priorite: foundProject.priorite as 'Faible' | 'Moyenne' | 'Élevée',
        dateDebut: foundProject.dateDebut,
        dateFin: foundProject.dateFin,
        statut: foundProject.statut as 'Planifié' | 'En cours' | 'En attente' | 'Terminé'
      });
      
    } catch (e: any) {
      setError('Erreur lors du chargement du projet');
      console.error('Error fetching project:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedData = async () => {
    try {
      setIsLoadingRelated(true);
      
      
      // Load related audit
      const storedAudits = JSON.parse(localStorage.getItem('audits') || '[]') as Audit[];

      // Try to get real audits from API
      let realAudits: Audit[] = [];
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://192.168.100.244:3000/api/audits', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (response.ok) {
          const data = await response.json();
          realAudits = data.audits || data || [];
        }
      } catch (apiError) {
        console.log('⚠️ Could not load real audits from API, using localStorage only');
      }

      const allAudits = [...realAudits, ...storedAudits];
      const foundAudit = allAudits.find(a => a._id === project?.audit);
      setRelatedAudit(foundAudit || null);
      
      // Load related constats from backend API
      try {
        const token = localStorage.getItem('authToken');
        const constatsResponse = await fetch('http://192.168.100.244:3000/api/constats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        
        if (constatsResponse.ok) {
          const allConstats = await constatsResponse.json();
          console.log('🔍 All constats from API:', allConstats);
          console.log('🔍 Project constats IDs:', project?.constats);
          
          // Filter constats that are linked to this project
          const filteredConstats = allConstats.filter((c: Constat) => {
            // Check if constat ID is in project's constats array
            const isInProject = project?.constats?.includes(c._id);
            console.log(`Constat ${c._id} in project? ${isInProject}`);
            return isInProject;
          });
          
          console.log('✅ Filtered constats for project:', filteredConstats);
          setRelatedConstats(filteredConstats);
        } else {
          console.error('Failed to fetch constats:', constatsResponse.status);
          setRelatedConstats([]);
        }
      } catch (error) {
        console.error('Error fetching constats:', error);
        setRelatedConstats([]);
      }

      // Load related SWOT analyses from backend
      try {
        const swotResponse = await fetch(`http://192.168.100.244:3000/api/swots/projet/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
          }
        });
        if (swotResponse.ok) {
          const swots = await swotResponse.json();
          console.log('✅ Loaded SWOTs for project:', swots);
          setRelatedSWOTs(swots);
        } else {
          setRelatedSWOTs([]);
        }
      } catch (error) {
        console.error('Error loading SWOTs:', error);
        setRelatedSWOTs([]);
      }

      // Load related conceptions from backend
      try {
        const conceptionResponse = await fetch(`http://192.168.100.244:3000/api/conceptions/projet/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
          }
        });
        if (conceptionResponse.ok) {
          const conceptions = await conceptionResponse.json();
          console.log('✅ Loaded Conceptions for project:', conceptions);
          setRelatedConceptions(conceptions);
        } else {
          setRelatedConceptions([]);
        }
      } catch (error) {
        console.error('Error loading Conceptions:', error);
        setRelatedConceptions([]);
      }

      // Load related risques from backend, then merge with localStorage
      try {
        const risqueResponse = await fetch(`http://192.168.100.244:3000/api/risques/projet/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
          }
        });
        let backendRisques: Risque[] = [];
        if (risqueResponse.ok) {
          backendRisques = await risqueResponse.json();
          console.log('✅ Loaded Risques for project (API):', backendRisques);
        }

        const localKey = `risks:${id}`;
        const localRisksSpecific: Risque[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const legacyAllRisques: Risque[] = JSON.parse(localStorage.getItem('risques') || '[]');
        const legacyForProject = legacyAllRisques.filter(r => (r as any).projet === id);

        const combined = [...backendRisques, ...localRisksSpecific, ...legacyForProject];
        // de-duplicate by _id
        const uniqueMap = new Map<string, Risque>();
        combined.forEach(r => {
          if (r && (r as any)._id) uniqueMap.set((r as any)._id, r);
        });
        const mergedRisques = Array.from(uniqueMap.values());
        setRelatedRisques(mergedRisques);
      } catch (error) {
        console.error('Error loading Risques:', error);
        // At least try to show local ones if API failed entirely
        const localKey = `risks:${id}`;
        const localRisksSpecific: Risque[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const legacyAllRisques: Risque[] = JSON.parse(localStorage.getItem('risques') || '[]');
        const legacyForProject = legacyAllRisques.filter(r => (r as any).projet === id);
        setRelatedRisques([...
          localRisksSpecific,
          ...legacyForProject
        ]);
      }

      // Load security configuration from backend
      try {
        const token = localStorage.getItem('authToken');
        const securiteResponse = await fetch(`http://192.168.100.244:3000/api/securite-projets/projet/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (securiteResponse.ok) {
          const securite = await securiteResponse.json();
          console.log('✅ Loaded Security Config for project:', securite);
          setSecuriteConfig(securite);
        } else {
          console.log('ℹ️ No security config found for this project');
          setSecuriteConfig(null);
        }
      } catch (error) {
        console.error('Error loading Security Config:', error);
        setSecuriteConfig(null);
      }

      // Load PAS documents from backend
      try {
        const token = localStorage.getItem('authToken');
        const pasResponse = await fetch(`http://192.168.100.244:3000/api/pas/projet/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (pasResponse.ok) {
          const pasDocs = await pasResponse.json();
          console.log('✅ Loaded PAS documents for project:', pasDocs);
          setRelatedPAS(Array.isArray(pasDocs) ? pasDocs : []);
        } else {
          setRelatedPAS([]);
        }
      } catch (error) {
        console.error('Error loading PAS documents:', error);
        setRelatedPAS([]);
      }
    } catch (e) {
      console.error('Error loading related data:', e);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleDeleteSecurite = async () => {
    if (!securiteConfig || !window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration de sécurité ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.100.244:3000/api/securite-projets/${securiteConfig._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        alert('Configuration de sécurité supprimée avec succès!');
        setSecuriteConfig(null);
      } else {
        const errorData = await response.json();
        alert('Erreur lors de la suppression: ' + (errorData.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error deleting security config:', error);
      alert('Erreur lors de la suppression de la configuration de sécurité');
    }
  };

  const handleDeletePAS = async (pasId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document PAS ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.100.244:3000/api/pas/${pasId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        alert('PAS supprimé avec succès !');
        loadRelatedData(); // Reload data
      } else {
        const errorData = await response.json();
        alert('Erreur lors de la suppression: ' + (errorData.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error deleting PAS:', error);
      alert('Erreur lors de la suppression du PAS');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom du projet est requis');
      return false;
    }
    if (formData.nom.length < 5) {
      setError('Le nom du projet doit contenir au moins 5 caractères');
      return false;
    }
    if (!formData.perimetre.trim()) {
      setError('Le périmètre du projet est requis');
      return false;
    }
    if (formData.perimetre.length < 10) {
      setError('Le périmètre doit contenir au moins 10 caractères');
      return false;
    }
    if (formData.budget < 0) {
      setError('Le budget ne peut pas être négatif');
      return false;
    }
    if (!formData.dateDebut) {
      setError('La date de début est requise');
      return false;
    }
    if (!formData.dateFin) {
      setError('La date de fin est requise');
      return false;
    }
    if (new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
      setError('La date de fin doit être postérieure à la date de début');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) return;
      
      setIsLoading(true);
      setError('');

      // Save to backend database
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.100.244:3000/api/projets/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditing(false);
      
      console.log('✅ Project updated:', updatedProject);
      alert('Projet mis à jour avec succès !');
    } catch (e: any) {
      setError(`Erreur lors de la mise à jour du projet: ${e.message}`);
      console.error('Error updating project:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Remove project from localStorage
      const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const filteredProjects = localStorageProjects.filter((p: Projet) => p._id !== id);
      localStorage.setItem('projects', JSON.stringify(filteredProjects));
      
      alert('Projet supprimé avec succès !');
      navigate('/projects');
    } catch (e: any) {
      setError('Erreur lors de la suppression du projet');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Planifié': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Planifié' },
      'En cours': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En cours' },
      'En attente': { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'En attente' },
      'Terminé': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Terminé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Planifié'];
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'Faible': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Faible' },
      'Moyenne': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moyenne' },
      'Élevée': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Élevée' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['Moyenne'];
    
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

  if (error || !project) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
          <p className="text-gray-400 mb-4">{error || 'Projet non trouvé'}</p>
          <Button variant="primary" onClick={() => navigate('/projects')}>
            Retour à la liste
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">

      {/* Clean Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white transition-colors group"
            >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Retour
            </button>
            <button
              onClick={() => navigate(user?.role === 'RSSI' ? '/rssi' : '/ssi')}
              className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors group"
            >
              <span className="mr-2">🏠</span>
              Dashboard
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {project?.statut === 'Terminé' && (
              <>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('authToken');
                      const res = await fetch(`http://192.168.100.244:3000/api/pas/projet/${project?._id || id}/auto`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 
                          'Content-Type': 'application/json',
                          'X-Requested-With': 'XMLHttpRequest',
                          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                      });
                      if (!res.ok) {
                        const errorText = await res.text();
                        console.error('PAS generation error:', errorText);
                        throw new Error('Erreur lors de la génération');
                      }
                      const pas = await res.json();
                      console.log('✅ PAS generated:', pas);
                      alert(`PAS généré avec succès !\n\nID: ${pas._id}\nVersion: ${pas.version}\n\nLe PAS a été créé dans la base de données.`);
                      // Navigate to PAS detail page to view/download
                      window.open(`/pas/${pas._id}`, '_blank');
                    } catch (e: any) {
                      console.error('Error generating PAS:', e);
                      alert('Impossible de générer automatiquement le PAS: ' + (e.message || 'Erreur inconnue'));
                    }
                  }}
                >
                  Générer PAS automatiquement
                </Button>
              </>
            )}
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1"
                >
                  <span>✏️</span>
                  <span>Éditer</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={handleDelete}
                >
                  Supprimer
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleSave}
                >
                  Enregistrer
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Project Title & Status */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">{project.nom}</h1>
              {!isEditing && (
                <p className="text-gray-400 mt-1 pr-4">{project.perimetre}</p>
              )}
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              {getPriorityBadge(project.priorite)}
              {getStatusBadge(project.statut)}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Project Information */}
      <div className="bg-slate-800 shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations du projet</h2>
        </div>
        <div className="px-6 py-6">
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Périmètre</h3>
                <p className="text-white">{project.perimetre}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                <p className="text-white">{project.budget.toLocaleString('fr-FR')} €</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Priorité</h3>
                <p className="text-white">{getPriorityBadge(project.priorite)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date de début</h3>
                <p className="text-white">{new Date(project.dateDebut).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date de fin</h3>
                <p className="text-white">{new Date(project.dateFin).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Statut</h3>
                <p className="text-white">{getStatusBadge(project.statut)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Progression</h3>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: project.statut === 'Terminé' ? '100%' : 
                             project.statut === 'En cours' ? '60%' : 
                             project.statut === 'En attente' ? '30%' : '0%' 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {project.statut === 'Terminé' ? '100%' : 
                   project.statut === 'En cours' ? '60%' : 
                   project.statut === 'En attente' ? '30%' : '0%'} complété
                </p>
              </div>
            </div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom du projet</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Périmètre</label>
                <input
                  type="text"
                  name="perimetre"
                  value={formData.perimetre}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  💰 Budget (€)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget.toString()}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <Select
                id="priorite"
                name="priorite"
                label="Priorité"
                value={formData.priorite}
                onChange={handleChange}
                required
                icon="⚡"
                options={[
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyenne', label: 'Moyenne' },
                  { value: 'Élevée', label: 'Élevée' }
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  📅 Date de début
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  📅 Date de fin
                </label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Status can only be changed by RSSI */}
              {user?.role === 'RSSI' ? (
                <Select
                  id="statut"
                  name="statut"
                  label="Statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                  icon="🔄"
                  options={[
                    { value: 'Planifié', label: 'Planifié' },
                    { value: 'En cours', label: 'En cours' },
                    { value: 'En attente', label: 'En attente' },
                    { value: 'Terminé', label: 'Terminé' }
                  ]}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    🔄 Statut
                  </label>
                  <div className="block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300">
                    {formData.statut}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Seul le RSSI peut modifier le statut</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Related Audit Information */}
      {relatedAudit && (
        <div className="bg-slate-800 shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white flex items-center">
              <span className="mr-2">🔍</span>
              Audit associé
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nom de l'audit</h3>
                <p className="text-white font-medium">{relatedAudit.nom}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                <p className="text-white">{relatedAudit.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Périmètre</h3>
                <p className="text-white">{relatedAudit.perimetre}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Statut</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  relatedAudit.statut === 'Terminé' ? 'bg-green-100 text-green-800' :
                  relatedAudit.statut === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {relatedAudit.statut}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                to={`/audits/${relatedAudit._id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <span className="mr-1">➡️</span>
                Voir les détails de l'audit
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Related Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {/* Related Constats */}
        <StyledCard
          title={
            <div className="flex items-center space-x-2">
              <span>🔍</span>
              <span>Constats associés</span>
            </div>
          }
          count={relatedConstats.length}
          footer={
            relatedAudit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/audits/${relatedAudit._id}`)}
              >
                Gérer les constats dans l'audit
              </Button>
            )
          }
        >
          {isLoadingRelated ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : relatedConstats.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun constat associé à ce projet</p>
          ) : (
            <div className="space-y-3">
              {relatedConstats.slice(0, 3).map((constat) => (
                <div key={constat._id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-300 uppercase">{constat.type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      constat.criticite === 'élevé' ? 'bg-red-500/20 text-red-300' :
                      constat.criticite === 'moyen' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {constat.criticite}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-2 mb-2">{constat.description}</p>
                  <Link 
                    to={`/constats/${constat._id}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Voir détails →
                  </Link>
                </div>
              ))}
              {relatedConstats.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{relatedConstats.length - 3} autres constats
                </p>
              )}
            </div>
          )}
        </StyledCard>

        {/* Related SWOTs */}
        <StyledCard
          title={
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Analyses SWOT</span>
            </div>
          }
          count={relatedSWOTs.length}
          footer={
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => navigate(`/swot/projet/new?projet=${project?._id || id}`)}
            >
              + Créer analyse SWOT
            </Button>
          }
        >
          {isLoadingRelated ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : relatedSWOTs.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune analyse SWOT associée à ce projet</p>
          ) : (
            <div className="space-y-3">
              {relatedSWOTs.slice(0, 3).map((swot) => (
                <div key={swot._id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs font-medium text-purple-300 mb-1">Forces</div>
                      <p className="text-gray-200 line-clamp-2 text-xs">
                        {swot.forces || 'Non spécifié'}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-purple-300 mb-1">Faiblesses</div>
                      <p className="text-gray-200 line-clamp-2 text-xs">
                        {swot.faiblesses || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600/50">
                    <Link 
                      to={`/swot/${swot._id}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Voir l'analyse complète →
                    </Link>
                  </div>
                </div>
              ))}
              {relatedSWOTs.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{relatedSWOTs.length - 3} autres analyses
                </p>
              )}
            </div>
          )}
        </StyledCard>

        {/* Related Conceptions */}
        <StyledCard
          title={
            <div className="flex items-center space-x-2">
              <span>🏗️</span>
              <span>Conceptions</span>
            </div>
          }
          count={relatedConceptions.length}
          footer={
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-900/30 hover:border-emerald-400"
              onClick={() => navigate(`/conceptions/projet/new?projet=${project?._id || id}`)}
            >
              + Ajouter une conception
            </Button>
          }
        >
          {isLoadingRelated ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : relatedConceptions.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune conception associée à ce projet</p>
          ) : (
            <div className="space-y-3">
              {relatedConceptions.slice(0, 3).map((conception) => (
                <div key={conception._id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100 truncate">{conception.nomFichier}</p>
                      <p className="text-xs text-gray-400">{conception.typeFichier}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conception.statut === 'validée' ? 'bg-green-500/20 text-green-300' :
                      conception.statut === 'en attente' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {conception.statut}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600/50">
                    <Link 
                      to={`/conceptions/${conception._id}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Voir détails →
                    </Link>
                  </div>
                </div>
              ))}
              {relatedConceptions.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{relatedConceptions.length - 3} autres conceptions
                </p>
              )}
            </div>
          )}
        </StyledCard>

        {/* Related Risques */}
        <StyledCard
          title={
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>Risques associés</span>
            </div>
          }
          count={relatedRisques.length}
          footer={
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-red-500 text-red-400 hover:bg-red-900/30 hover:border-red-400"
              onClick={() => navigate(`/projects/${project?._id || id}/risks/new`)}
            >
              + Ajouter un risque
            </Button>
          }
        >
          {isLoadingRelated ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : relatedRisques.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun risque associé à ce projet</p>
          ) : (
            <div className="space-y-3">
              {relatedRisques.slice(0, 3).map((risque) => (
                <div key={risque._id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100">{risque.nom}</p>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{risque.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      risque.niveau === 'élevé' ? 'bg-red-500/20 text-red-300' :
                      risque.niveau === 'moyen' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {risque.niveau}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600/50">
                    <Link 
                      to={`/risques/${risque._id}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Voir détails →
                    </Link>
                  </div>
                </div>
              ))}
              {relatedRisques.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{relatedRisques.length - 3} autres risques
                </p>
              )}
            </div>
          )}
        </StyledCard>
      </div>

      {/* Security Configuration - Centered and Wider */}
      <div className="max-w-4xl mx-auto mb-8">
        <StyledCard
          title={
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Configuration de Sécurité</span>
            </div>
          }
          className="border-2 border-indigo-500/30"
          footer={
            securiteConfig && (
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-indigo-400 text-indigo-300 hover:bg-indigo-900/30 hover:border-indigo-300"
                  onClick={() => navigate(`/securite-projet/new?projet=${project?._id || id}&id=${securiteConfig._id}`)}
                >
                  ✏️ Modifier
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleDeleteSecurite}
                >
                  🗑️ Supprimer
                </Button>
              </div>
            )
          }
        >
          {isLoadingRelated ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : !securiteConfig ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-6">Aucune configuration de sécurité définie pour ce projet</p>
              {project?.statut === 'Terminé' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  onClick={() => navigate(`/securite-projet/new?projet=${project?._id || id}`)}
                >
                  + Configurer la sécurité
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-medium text-indigo-300 mb-1">Version</h3>
                    <p className="text-sm text-white">{securiteConfig.version || '1.0'}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-indigo-300 mb-1">Dernière révision</h3>
                    <p className="text-sm text-white">
                      {securiteConfig.derniereRevision ? 
                        new Date(securiteConfig.derniereRevision).toLocaleDateString('fr-FR') : 
                        <span className="text-gray-400">Non spécifiée</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Aspects couverts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span className="text-sm text-gray-200">Sécurité physique</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span className="text-sm text-gray-200">Sécurité logique</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span className="text-sm text-gray-200">Sécurité organisationnelle</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-700/40 rounded">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span className="text-sm text-gray-200">Plan PCA/PRA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </StyledCard>
      </div>

      {/* PAS Documents Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-slate-800 shadow-lg rounded-xl border border-slate-700 hover:shadow-xl transition-shadow duration-200">
          <div className="px-6 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-700 to-slate-600 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📄</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Plans d'Assurance Sécurité (PAS)</h3>
                <p className="text-sm text-slate-400">{relatedPAS.length} document(s)</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            {isLoadingRelated ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : relatedPAS.length === 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-4">Aucun PAS généré pour ce projet</p>
                {project?.statut === 'Terminé' && (
                  <p className="text-xs text-gray-400">Utilisez le bouton "Générer PAS automatiquement" en haut de la page</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {relatedPAS.map((pas) => (
                  <div key={pas._id} className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Version {pas.version || '1.0'}</div>
                        <div className="text-sm text-slate-400 mt-1">{pas.objet || 'Plan d\'Assurance Sécurité'}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Créé le {pas.createdAt ? new Date(pas.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/pas/${pas._id}`, '_blank')}
                        >
                          👁️ Voir
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeletePAS(pas._id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
