import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { Projet, Constat, Audit } from '../../types/audit';

const CreateProjet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [constats, setConstats] = useState<Constat[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<string>('');
  const [selectedConstats, setSelectedConstats] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    nom: '',
    perimetre: '',
    budget: 0,
    priorite: 'Moyenne' as 'Faible' | 'Moyenne' | 'Élevée',
    dateDebut: '',
    dateFin: '',
    statut: 'Planifié' as 'Planifié' | 'En cours' | 'En attente' | 'Terminé',
    audit: ''
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      // First try to fetch from API
      let apiAudits: Audit[] = [];
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
          apiAudits = Array.isArray(data) ? data : [];
        }
      } catch (apiError) {
        console.log('⚠️ Could not load audits from API, using localStorage only');
      }

      // Then fetch from localStorage (both 'audits' and 'newAudits' keys)
      const storedAudits = JSON.parse(localStorage.getItem('audits') || '[]') as Audit[];
      const newAudits = JSON.parse(localStorage.getItem('newAudits') || '[]') as Audit[];
      
      // Combine all sources and remove duplicates
      const allAudits = [...apiAudits, ...storedAudits, ...newAudits];
      const uniqueAudits = allAudits.filter((audit, index, self) => 
        index === self.findIndex(a => a._id === audit._id)
      );
      
      setAudits(uniqueAudits);
    } catch (error: any) {
      console.error('Error fetching audits:', error);
      setError('Impossible de charger les audits. Vérifiez votre connexion.');
      setAudits([]);
    }
  };

  const fetchConstatsForAudit = async (auditId: string) => {
    try {
      // First try to fetch from API
      let apiConstats: Constat[] = [];
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
          const data = await response.json();
          apiConstats = Array.isArray(data) ? data : [];
        }
      } catch (apiError) {
        console.log('⚠️ Could not load constats from API, using localStorage only');
      }

      // Then fetch from localStorage
      const storedConstats = JSON.parse(localStorage.getItem('constats') || '[]') as Constat[];
      
      // Combine both sources and remove duplicates
      const allConstats = [...apiConstats, ...storedConstats];
      const uniqueConstats = allConstats.filter((constat, index, self) => 
        index === self.findIndex(c => c._id === constat._id)
      );
      
      console.log('📋 All constats (API + localStorage):', uniqueConstats);
      console.log('🔍 Selected audit ID:', auditId);
      console.log('🔍 Audit IDs in constats:', uniqueConstats.map(c => ({ id: c._id, audit: c.audit, auditType: typeof c.audit })));
      
      // Filter constats that belong to the selected audit
      // Handle both string and ObjectId comparisons
      const auditConstats = uniqueConstats.filter(c => {
        const constatAuditId = typeof c.audit === 'object' && c.audit?._id ? c.audit._id : c.audit;
        const match = constatAuditId === auditId || String(constatAuditId) === String(auditId);
        console.log(`Comparing constat ${c._id}: ${constatAuditId} === ${auditId}? ${match}`);
        return match;
      });
      console.log('✅ Filtered constats for audit:', auditConstats);
      setConstats(auditConstats);
    } catch (error: any) {
      console.error('Error fetching constats:', error);
      setConstats([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAuditChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const auditId = e.target.value;
    setSelectedAudit(auditId);
    setSelectedConstats([]); // Reset selected constats when audit changes
    setFormData(prev => ({ ...prev, audit: auditId })); // Update form data
    if (auditId) {
      fetchConstatsForAudit(auditId);
    } else {
      setConstats([]);
    }
  };

  const handleConstatToggle = (constatId: string) => {
    setSelectedConstats(prev => 
      prev.includes(constatId) 
        ? prev.filter(id => id !== constatId)
        : [...prev, constatId]
    );
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
    if (!selectedAudit) {
      setError('Veuillez sélectionner un audit');
      return false;
    }
    if (selectedConstats.length === 0) {
      setError('Veuillez sélectionner au moins un constat');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!user) {
      setError('Vous devez être connecté pour créer un projet');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Save to backend (now supports both real and mock IDs)
      const token = localStorage.getItem('authToken');
      
      // Prepare project data for backend
      const projectData = {
        nom: formData.nom,
        perimetre: formData.perimetre,
        budget: formData.budget,
        priorite: formData.priorite,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        statut: formData.statut,
        audit: selectedAudit,
        constats: selectedConstats,
        creerPar: user._id
      };
      
      console.log('📤 Sending project data to backend:', projectData);

      // Save to backend database
      const response = await fetch('http://192.168.100.244:3000/api/projets', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const newProjet = await response.json();
      console.log('✅ Projet created in database:', newProjet);
      
      alert('Projet créé avec succès !');
      navigate(`/projects/${newProjet._id}`);
    } catch (error: any) {
      setError(`Erreur lors de la création du projet: ${error.message}`);
      console.error('Error creating projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin && !isRSSI) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Accès refusé</h2>
          <p className="text-slate-400 mb-4">Vous n'avez pas les permissions nécessaires pour créer un projet</p>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            ← Retour aux projets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">🏗️ Créer un Projet</h1>
                <p className="text-slate-400 mt-1">Associez un projet à des constats du même audit</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/projects')}>
                ← Retour
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Project Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Sécurisation de l'infrastructure"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Périmètre *
                  </label>
                  <textarea
                    name="perimetre"
                    value={formData.perimetre}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Décrivez le périmètre du projet..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Budget (€) *
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priorité *
                    </label>
                    <select
                      name="priorite"
                      value={formData.priorite}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Élevée">Élevée</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Statut *
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="En attente">En attente</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              {/* Right Column - Audit and Constats Selection */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Audit associé *
                  </label>
                  <select
                    value={selectedAudit}
                    onChange={handleAuditChange}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez un audit</option>
                    {audits.length === 0 ? (
                      <option value="" disabled>Chargement des audits...</option>
                    ) : (
                      audits.map((audit) => (
                        <option key={audit._id} value={audit._id}>
                          {audit.nom} ({audit.type})
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Seuls les constats de cet audit pourront être associés au projet
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Constats à associer * ({selectedConstats.length} sélectionné(s))
                  </label>
                  {selectedAudit ? (
                    <div className="max-h-64 overflow-y-auto border border-slate-600 rounded-md p-3 space-y-2">
                      {constats.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Aucun constat disponible pour cet audit
                        </p>
                      ) : (
                        constats.map((constat) => (
                          <label key={constat._id} className="flex items-start space-x-3 p-2 hover:bg-slate-900 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedConstats.includes(constat._id)}
                              onChange={() => handleConstatToggle(constat._id)}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                  {constat.type}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  constat.criticite === 'Élevée' ? 'bg-red-100 text-red-800' :
                                  constat.criticite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {constat.criticite}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {constat.description}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="border border-slate-600 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-500">
                        Veuillez d'abord sélectionner un audit
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Création...' : '✅ Créer le projet'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjet;
