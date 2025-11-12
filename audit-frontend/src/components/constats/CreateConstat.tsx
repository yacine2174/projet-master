import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { CreateConstatData, Audit, Projet } from '../../types/audit';
import config from '../../config/config';

const CreateConstat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateConstatData>({
    description: '',
    type: 'NC maj',
    criticite: 'Élevée',
    impact: '',
    probabilite: 'Élevée',
    audit: searchParams.get('audit') || '',
    projet: '',
    recommandations: []
  });

  // Update formData when searchParams change
  useEffect(() => {
    const auditId = searchParams.get('audit');
    if (auditId) {
      setFormData(prev => ({ ...prev, audit: auditId }));
      console.log('🔗 Pre-selected audit ID from URL:', auditId);
    }
  }, [searchParams]);

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const isSSI = user?.role === 'SSI';

  useEffect(() => {
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
        const response = await fetch(`${config.apiBaseUrl}/audits`, { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (response.ok) {
          const data = await response.json();
          realAudits = data.audits || data || [];
          console.log('✅ CreateConstat loaded real audits from API:', realAudits.length);
          console.log('📋 Real audits:', realAudits.map(a => ({ id: a._id, nom: a.nom, type: a.type })));
        }
      } catch (apiError) {
        console.log('⚠️ CreateConstat could not load real audits from API, using localStorage only');
      }

      // Check if we have a pre-selected audit ID from URL
      const urlAuditId = searchParams.get('audit');
      if (urlAuditId && !realAudits.find(a => a._id === urlAuditId)) {
        console.log('🔍 URL audit ID not found in loaded audits, trying to fetch individual audit:', urlAuditId);
        try {
          const individualResponse = await fetch(`${config.apiBaseUrl}/audits/${urlAuditId}`, { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
          if (individualResponse.ok) {
            const auditData = await individualResponse.json();
            console.log('✅ CreateConstat loaded individual audit from API:', auditData);
            realAudits.unshift(auditData); // Add to beginning
          } else {
            throw new Error('Individual audit fetch failed');
          }
        } catch (individualError) {
          console.log('⚠️ Could not load individual audit, creating placeholder with correct ID');
          
          // Try to get audit name from URL parameters first
          const urlAuditName = searchParams.get('auditName');
          const urlAuditType = searchParams.get('auditType');
          
          let auditName = 'Audit sélectionné';
          let auditType = 'Organisationnel';
          
          if (urlAuditName) {
            auditName = decodeURIComponent(urlAuditName);
            auditType = urlAuditType as 'Organisationnel' | 'Technique' || 'Organisationnel';
            console.log('✅ Using audit name from URL parameters:', auditName, auditType);
          } else {
            // Try to get audit name from localStorage
            const storedAudits = JSON.parse(localStorage.getItem('audits') || '[]');
            const storedAudit = storedAudits.find((a: any) => a._id === urlAuditId);
            
            if (storedAudit) {
              auditName = storedAudit.nom || 'Audit sélectionné';
              auditType = storedAudit.type || 'Organisationnel';
              console.log('✅ Found audit in localStorage:', storedAudit);
            } else {
              // Try to get from newAudits (mock audits)
              const newAudits = JSON.parse(localStorage.getItem('newAudits') || '[]');
              const newAudit = newAudits.find((a: any) => a._id === urlAuditId);
              if (newAudit) {
                auditName = newAudit.nom || 'Audit sélectionné';
                auditType = newAudit.type || 'Organisationnel';
                console.log('✅ Found audit in newAudits:', newAudit);
              }
            }
          }
          
          // Create a placeholder audit with the correct ID and name
          const placeholderAudit: Audit = {
            _id: urlAuditId,
            nom: auditName,
            type: auditType as 'Organisationnel' | 'Technique',
            perimetre: 'Audit sélectionné',
            objectifs: 'Audit pré-sélectionné',
            dateDebut: new Date().toISOString().split('T')[0],
            dateFin: new Date().toISOString().split('T')[0],
            statut: 'En cours',
            creerPar: 'system',
            normes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          realAudits.unshift(placeholderAudit);
          console.log('✅ Created placeholder audit with correct ID and name:', placeholderAudit);
        }
      }

      const allAudits = [...realAudits, ...defaultAudits, ...localStorageAudits];
      console.log('📋 CreateConstat all available audits:', allAudits.map(a => ({ id: a._id, nom: a.nom, type: a.type })));
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

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      setError('La description du constat est requise');
      return false;
    }
    if (!formData.impact.trim()) {
      setError('L\'impact est requis');
      return false;
    }
    if (!formData.audit) {
      setError('Veuillez sélectionner un audit');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Check if this is a mock audit (starts with "mock-" or "audit_")
      const isMockAudit = formData.audit && (formData.audit.startsWith('mock-') || formData.audit.startsWith('audit_'));

      if (isMockAudit) {
        // Store in localStorage for mock audits
        const newConstat = {
          _id: `constat_${Date.now()}`,
          ...formData,
          creerPar: user?._id || 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to localStorage
        const existingConstats = JSON.parse(localStorage.getItem('constats') || '[]');
        existingConstats.push(newConstat);
        localStorage.setItem('constats', JSON.stringify(existingConstats));

        console.log('✅ Mock Constat créé et sauvegardé dans localStorage:', newConstat);
        alert('Constat créé avec succès !');
        
        // Navigate back
        const auditId = searchParams.get('audit');
        if (auditId) {
          navigate(`/audits/${auditId}`);
        } else {
          navigate('/constats');
        }
      } else {
        // Send to backend for real audits
        const token = localStorage.getItem('authToken');
        
        // Prepare data - remove empty projet so it's not sent
        const dataToSend: any = { ...formData };
        if (!dataToSend.projet || dataToSend.projet.trim() === '') {
          delete dataToSend.projet;
        }
        
        const response = await fetch(`${config.apiBaseUrl}/constats`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(dataToSend)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const createdConstat = await response.json();
        console.log('✅ Constat created in database:', createdConstat);
        alert('Constat créé avec succès !');
        
        // Navigate back to audit detail if audit was pre-selected
        const auditId = searchParams.get('audit');
        if (auditId) {
          navigate(`/audits/${auditId}`);
        } else {
          navigate('/constats');
        }
      }
    } catch (error: any) {
      setError(`Erreur lors de la création du constat: ${error.message}`);
      console.error('Error creating constat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isAdmin && !isRSSI && !isSSI) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">🚫</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Accès non autorisé</h2>
        <p className="text-slate-400 mb-4">Seuls les administrateurs, RSSI et SSI peuvent créer des constats.</p>
        <Button variant="outline" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
          🏠 Tableau de bord
        </Button>
      </div>
    );
  }

  // Check if audit ID is provided
  if (!searchParams.get('audit')) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-orange-600 text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Audit requis</h2>
        <p className="text-slate-400 mb-4">Les constats doivent être créés depuis la page d'un audit spécifique.</p>
        <Button variant="outline" onClick={() => navigate('/audits')}>
          📋 Voir les audits
        </Button>
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
                <h1 className="text-2xl font-bold text-white">🔍 Créer un Constat</h1>
                <p className="text-slate-400 mt-1">Créer un nouveau constat d'audit</p>
              </div>
              <Button variant="secondary" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
                🏠 Tableau de bord
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description du constat *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez le constat en détail..."
                required
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">
                Type de constat
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="NC maj">NC Majeure</option>
                <option value="NC min">NC Mineure</option>
                <option value="PS">Point de Satisfaction</option>
                <option value="PP">Point de Progrès</option>
              </select>
            </div>

            {/* Criticité */}
            <div>
              <label htmlFor="criticite" className="block text-sm font-medium text-slate-300 mb-2">
                Criticité
              </label>
              <select
                id="criticite"
                name="criticite"
                value={formData.criticite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Élevée">Élevée</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
            </div>

            {/* Impact */}
            <div>
              <label htmlFor="impact" className="block text-sm font-medium text-slate-300 mb-2">
                Impact *
              </label>
              <input
                type="text"
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez l'impact du constat..."
                required
              />
            </div>

            {/* Probabilité */}
            <div>
              <label htmlFor="probabilite" className="block text-sm font-medium text-slate-300 mb-2">
                Probabilité
              </label>
              <select
                id="probabilite"
                name="probabilite"
                value={formData.probabilite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Élevée">Élevée</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
            </div>

            {/* Audit - Read Only */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Audit associé *
              </label>
              <div className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm">
                <div className="flex items-center">
                  <span className="text-blue-600 text-sm mr-2">🔗</span>
                  <span className="text-white font-medium">
                    {audits.find(a => a._id === formData.audit)?.nom || 'Audit sélectionné'}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {audits.find(a => a._id === formData.audit)?.type || 'Organisationnel'}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                L'audit est automatiquement associé depuis la page d'audit
              </p>
            </div>

            {/* Projet selection removed per business rule: constats can be created without project */}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/constats')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Création...' : '✅ Créer le Constat'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateConstat;
