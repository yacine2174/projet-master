import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { auditAPI } from '../../api/api';
import { currentConfig } from '../../config/config';
import type { CreateAuditData, Norme } from '../../types/audit';

const CreateAudit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateAuditData>({
    nom: '',
    type: 'Organisationnel',
    perimetre: '',
    objectifs: '',
    dateDebut: '',
    dateFin: '',
    creerPar: user?.id || '',
    // PAS-related fields
    entrepriseNom: '',
    entrepriseContact: '',
    personnelsInternes: '',
    personnelsExternes: '',
    reglementations: []
  });
  const [availableNormes, setAvailableNormes] = useState<Norme[]>([]);
  const [selectedNormes, setSelectedNormes] = useState<string[]>([]);
  const [isLoadingNormes, setIsLoadingNormes] = useState(false);

  // Load available normes based on audit type
  useEffect(() => {
    const loadNormes = async () => {
      try {
        setIsLoadingNormes(true);
        console.log('🔄 Loading normes for audit type:', formData.type);
        
        // Fetch normes from backend API
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${currentConfig.apiBaseUrl}/normes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const normes = await response.json();
        console.log('📦 Normes from backend:', normes.length);
        
        // Log all norms with their categories for debugging
        console.log('📋 All normes from backend:', normes.map((n: Norme) => ({ nom: n.nom, categorie: n.categorie })));
        
        // Filter normes based on audit type
        const filteredNormes = normes.filter((norme: Norme) => {
          if (formData.type === 'Organisationnel') {
            // Organisational audits: ISO 27001, ISO 27002, NIST, CIS, PCI
            return norme.categorie?.includes('ISO') || 
                   norme.categorie === 'NIST' || 
                   norme.categorie === 'CIS' ||
                   norme.categorie === 'PCI';
          } else if (formData.type === 'Technique') {
            // Technical audits: OWASP, NIST, CIS, PCI
            return norme.categorie === 'OWASP' || 
                   norme.categorie === 'NIST' || 
                   norme.categorie === 'CIS' ||
                   norme.categorie === 'PCI';
          }
          return true;
        });
        
        console.log('🎯 Filtered normes for', formData.type, ':', filteredNormes.length);
        console.log('📋 Available normes:', filteredNormes.map((n: Norme) => n.nom));
        
        setAvailableNormes(filteredNormes);
      } catch (error) {
        console.error('❌ Error loading normes:', error);
        // Fallback: show empty state
        setAvailableNormes([]);
      } finally {
        setIsLoadingNormes(false);
      }
    };

    if (formData.type) {
      loadNormes();
    }
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.nom || !formData.type) {
          setError('Veuillez remplir le nom et le type d\'audit');
          return false;
        }
        break;
      case 2:
        if (!formData.perimetre || !formData.objectifs) {
          setError('Veuillez remplir le périmètre et les objectifs');
          return false;
        }
        break;
      case 3:
        if (!formData.dateDebut || !formData.dateFin) {
          setError('Veuillez sélectionner les dates de début et de fin');
          return false;
        }
        if (new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
          setError('La date de fin doit être postérieure à la date de début');
          return false;
        }
        break;
      case 4:
        if (selectedNormes.length === 0) {
          setError('Veuillez sélectionner au moins une norme pour cet audit');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleNormeToggle = (normeId: string) => {
    setSelectedNormes(prev => 
      prev.includes(normeId) 
        ? prev.filter(id => id !== normeId)
        : [...prev, normeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation aligned with backend
    const wordCount = (v: string) => v.trim().split(/\s+/).filter(Boolean).length;

    if (!formData.nom || wordCount(formData.nom) < 2 || formData.nom.trim().length < 8) {
      setError('Le nom doit contenir au moins 2 mots et 8 caractères.');
      return;
    }
    if (!formData.perimetre || wordCount(formData.perimetre) < 3 || formData.perimetre.trim().length < 8) {
      setError('Le périmètre doit contenir au moins 3 mots et 8 caractères.');
      return;
    }
    if (!formData.objectifs || wordCount(formData.objectifs) < 4 || formData.objectifs.trim().length < 8) {
      setError('Les objectifs doivent contenir au moins 4 mots et 8 caractères.');
      return;
    }
    if (!formData.dateDebut || !formData.dateFin) {
      setError('Veuillez fournir les dates de début et de fin.');
      return;
    }
    const d1 = new Date(formData.dateDebut);
    const d2 = new Date(formData.dateFin);
    const minStart = new Date(); minStart.setFullYear(minStart.getFullYear() - 10);
    const maxStart = new Date(); maxStart.setFullYear(maxStart.getFullYear() + 2);
    const maxEnd = new Date(); maxEnd.setFullYear(maxEnd.getFullYear() + 3);
    if (d1 < minStart || d1 > maxStart) {
      setError('La date de début doit être dans les 10 dernières années et au plus 2 ans à venir.');
      return;
    }
    if (d2 < minStart || d2 > maxEnd) {
      setError('La date de fin doit être dans les 10 dernières années et au plus 3 ans à venir.');
      return;
    }
    if (d1 >= d2) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }
    const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 1 || diffDays > 365) {
      setError("La durée de l'audit doit être entre 1 et 365 jours.");
      return;
    }
    if (selectedNormes.length === 0) {
      setError('Veuillez sélectionner au moins une norme pour cet audit.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Create audit via API (now supports mock IDs)
      const newAudit = await auditAPI.createAudit({
        ...formData,
        normes: selectedNormes,
        // backend required fields
        creerPar: user?.id || 'mockUserId'
      });
      console.log('✅ Audit created via API:', newAudit);
      
      navigate('/audits');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = (step: number) => {
    const titles = {
      1: 'Informations de base',
      2: 'Contexte et objectifs',
      3: 'Planification',
      4: 'Sélection des normes'
    };
    return titles[step as keyof typeof titles];
  };

  const getStepDescription = (step: number) => {
    const descriptions = {
      1: 'Définissez le nom et le type de votre audit de sécurité',
      2: 'Précisez le périmètre et les objectifs de l\'audit',
      3: 'Planifiez les dates de début et de fin de l\'audit',
      4: 'Choisissez les normes de conformité applicables'
    };
    return descriptions[step as keyof typeof descriptions];
  };

  const dashboardPath = user?.role === 'RSSI' ? '/rssi' : '/ssi';

  return (
    <div className="auth-container">
      <div className="auth-card max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">🔍 Créer un nouvel audit</h1>
          <p className="text-slate-400">Suivez les étapes pour créer votre audit de sécurité</p>
        </div>

        {/* Header actions */}
        <div className="flex justify-between mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/audits')}>
            ← Retour à la liste des audits
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(dashboardPath)}>
            🏠 Tableau de bord
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-white">{getStepTitle(currentStep)}</h3>
            <p className="text-sm text-gray-500">{getStepDescription(currentStep)}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Input
                id="nom"
                name="nom"
                type="text"
                label="Nom de l'audit"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Audit de sécurité organisationnelle Q1 2024"
                required
                icon="📋"
              />

              <Select
                  id="type"
                  name="type"
                  label="Type d'audit"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  icon="🎯"
                  options={[
                    { value: 'Organisationnel', label: 'Organisationnel' },
                    { value: 'Technique', label: 'Technique' }
                  ]}
                />

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">Types d'audit :</h4>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• <strong>Organisationnel :</strong> Processus, politiques, conformité ISO 27001, NIST SP 800-53</li>
                  <li>• <strong>Technique :</strong> Infrastructure, applications, vulnérabilités CIS, OWASP</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Context and Objectives */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Périmètre de l'audit
                </label>
                <textarea
                  name="perimetre"
                  value={formData.perimetre}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez le périmètre de votre audit (ex: Processus de gestion des accès, Infrastructure réseau, Applications critiques...)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Objectifs de l'audit
                </label>
                <textarea
                  name="objectifs"
                  value={formData.objectifs}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Définissez les objectifs de votre audit (ex: Évaluer la conformité aux normes, Identifier les vulnérabilités...)"
                  required
                />
              </div>
              
            </div>
          )}

          {/* Step 3: Planning */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-700 mb-2">⚠️ Information importante :</h4>
                <ul className="text-xs text-yellow-600 space-y-1">
                  <li>• L'audit sera créé avec le statut "Planifié"</li>
                  <li>• Vous pourrez commencer l'audit à la date de début définie</li>
                  <li>• Les dates peuvent être modifiées ultérieurement</li>
                </ul>
              </div>
              
              {/* PAS-Related Context Fields */}
              <div className="pt-6 border-t border-slate-700">
                <h3 className="text-md font-medium text-white mb-4">📄 Informations pour le PAS (Plan d'Assurance Sécurité)</h3>
                <p className="text-sm text-slate-400 mb-4">Ces informations apparaîtront automatiquement dans le PAS généré pour les projets liés à cet audit.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      🏢 Nom de l'Entreprise
                    </label>
                    <input
                      type="text"
                      name="entrepriseNom"
                      value={formData.entrepriseNom}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Acme Corp"
                    />
                    <p className="text-xs text-gray-500 mt-1">Apparaît dans "Politiques de sécurité"</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      📞 Contact Entreprise
                    </label>
                    <input
                      type="text"
                      name="entrepriseContact"
                      value={formData.entrepriseContact}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contact@entreprise.fr"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      👥 Personnels Internes
                    </label>
                    <input
                      type="text"
                      name="personnelsInternes"
                      value={formData.personnelsInternes}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 5 développeurs, 2 analysts, 1 chef de projet"
                    />
                    <p className="text-xs text-gray-500 mt-1">Apparaît dans "Champ d'application - Personnels"</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      👤 Personnels Externes
                    </label>
                    <input
                      type="text"
                      name="personnelsExternes"
                      value={formData.personnelsExternes}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 2 consultants externes en cybersécurité"
                    />
                    <p className="text-xs text-gray-500 mt-1">Apparaît dans "Champ d'application - Personnels"</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📋 Réglementations (une par ligne)
                  </label>
                  <textarea
                    name="reglementations"
                    value={formData.reglementations?.join('\n') || ''}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(l => l.trim() !== '');
                      setFormData(prev => ({ ...prev, reglementations: lines }));
                    }}
                    rows={4}
                    className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="RGPD&#10;ISO 27001&#10;Code du travail&#10;NIS 2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Apparaît dans "Références - Réglementations"</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Normes Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  Sélection des Normes
                </h3>
                <p className="text-sm text-slate-400">
                  Choisissez les normes de conformité applicables à votre audit {formData.type}
                </p>
              </div>

              {isLoadingNormes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Chargement des normes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableNormes.map((norme) => (
                    <div
                      key={norme._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedNormes.includes(norme._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => handleNormeToggle(norme._id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedNormes.includes(norme._id)}
                          onChange={() => handleNormeToggle(norme._id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{norme.nom}</h4>
                          <p className="text-xs text-gray-500 mt-1">{norme.categorie}</p>
                          <p className="text-xs text-slate-400 mt-2">{norme.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-500">Version: {norme.version}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {availableNormes.length === 0 && !isLoadingNormes && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Aucune norme disponible pour ce type d'audit</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">ℹ️ Information :</h4>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Les normes sélectionnées seront associées à cet audit</li>
                  <li>• Vous pourrez ajouter ou retirer des normes ultérieurement</li>
                  <li>• Les constats seront évalués selon ces normes</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              ← Précédent
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
              >
                Suivant →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Création...' : 'Créer l\'audit'}
              </Button>
            )}
          </div>
        </form>

        <div className="mt-8 text-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/audits')}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour à la liste des audits
          </button>
          <button
            type="button"
            onClick={() => navigate(dashboardPath)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            🏠 Aller au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAudit;
