import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config/config';

/**
 * SecuriteProjetForm Component
 * 
 * Multi-tab form for creating/editing project security configurations.
 * Supports all fields from the SecuriteProjet model including:
 * - Physical security measures
 * - Logical security measures
 * - Organizational security measures
 * - BCP/DRP configuration
 */

const SecuriteProjetForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const projetId = searchParams.get('projet');
  const securiteId = searchParams.get('id');
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('general');

  // Form data state
  const [formData, setFormData] = useState({
    projet: projetId || '',
    version: '1.0',
    derniereRevision: new Date().toISOString().split('T')[0],
    
    // Roles and Responsibilities
    rolesEtResponsabilites: [] as Array<{ role: string; responsabilite: string }>,
    
    // Physical Security
    mesuresSecurite: {
      physique: {
        controleAcces: '',
        videoSurveillance: '',
        protectionIncendie: '',
        autresMesures: ''
      },
      // Logical Security
      logique: {
        authentification: '',
        sauvegardes: '',
        chiffrement: '',
        pareFeuxAntivirus: '',
        autresMesures: ''
      },
      // Organizational Security
      organisationnelle: {
        formationSensibilisation: '',
        proceduresHabilitation: '',
        clausesConfidentialite: '',
        autresMesures: ''
      }
    },
    
    // BCP/DRP
    pcaPra: {
      sauvegardeRestauration: {
        procedures: '',
        derniereTest: '',
        frequenceTests: ''
      },
      siteSecours: {
        description: '',
        adresse: ''
      },
      exercicesSimulation: {
        description: '',
        dernierExercice: '',
        frequence: ''
      }
    },
    
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projet, setProjet] = useState<any>(null);

  // Load project details
  useEffect(() => {
    if (projetId) {
      fetchProjet();
    }
    
    if (securiteId) {
      fetchSecurite();
    }
  }, [projetId, securiteId]);
  
  const fetchProjet = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/projets/${projetId}`, {
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjet(data);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };
  
  const fetchSecurite = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/securite-projets/${securiteId}`, {
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (err) {
      console.error('Error fetching security config:', err);
    }
  };
  
  const handleChange = (path: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projetId) {
      setError('ID de projet manquant');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const url = securiteId 
        ? `${config.apiBaseUrl}/securite-projets/${securiteId}`
        : `${config.apiBaseUrl}/securite-projets`;
      
      const method = securiteId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement');
      }

      alert('Configuration de sécurité enregistrée avec succès!');
      window.location.replace(`/projets/${projetId}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'general', label: 'Informations Générales' },
    { id: 'roles', label: 'Rôles et Responsabilités' },
    { id: 'physique', label: 'Sécurité Physique' },
    { id: 'logique', label: 'Sécurité Logique' },
    { id: 'organisationnelle', label: 'Sécurité Organisationnelle' },
    { id: 'pcapra', label: 'PCA/PRA' },
    { id: 'notes', label: 'Notes' }
  ];
  
  // Handlers for roles array
  const addRole = () => {
    setFormData(prev => ({
      ...prev,
      rolesEtResponsabilites: [...prev.rolesEtResponsabilites, { role: '', responsabilite: '' }]
    }));
  };
  
  const removeRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rolesEtResponsabilites: prev.rolesEtResponsabilites.filter((_, i) => i !== index)
    }));
  };
  
  const updateRole = (index: number, field: 'role' | 'responsabilite', value: string) => {
    setFormData(prev => ({
      ...prev,
      rolesEtResponsabilites: prev.rolesEtResponsabilites.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  
    return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Retour
          </button>
        
        <h1 className="text-3xl font-bold text-white">
          {securiteId ? 'Modifier' : 'Configurer'} la Sécurité du Projet
        </h1>
        
        {projet && (
          <p className="text-slate-400 mt-2">Projet: {projet.nom}</p>
        )}
        </div>

        {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
          </div>
        )}
      
      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-slate-300 hover:border-slate-600'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-slate-800 shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Informations Générales</h2>
            
            <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                Version
            </label>
            <input
              type="text"
              value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                placeholder="1.0"
            />
          </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dernière Révision
              </label>
              <input
                type="date"
                value={formData.derniereRevision}
                onChange={(e) => handleChange('derniereRevision', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Roles and Responsibilities Tab */}
        {activeTab === 'roles' && (
          <div className="bg-slate-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Rôles et Responsabilités</h2>
                <button
                  type="button"
                onClick={addRole}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                + Ajouter un Rôle
                </button>
            </div>
            
            {formData.rolesEtResponsabilites.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun rôle défini. Cliquez sur "Ajouter un Rôle" pour commencer.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.rolesEtResponsabilites.map((item, index) => (
                  <div key={index} className="border border-slate-700 rounded-lg p-4 bg-slate-900">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-slate-400">Rôle #{index + 1}</span>
                <button
                  type="button"
                        onClick={() => removeRole(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️ Supprimer
                </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Rôle / Fonction
                        </label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => updateRole(index, 'role', e.target.value)}
                          className="w-full border border-slate-600 rounded-md px-3 py-2"
                          placeholder="Ex: RSSI, Chef de projet, Administrateur système"
                        />
            </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Responsabilité
                        </label>
                        <textarea
                          value={item.responsabilite}
                          onChange={(e) => updateRole(index, 'responsabilite', e.target.value)}
                          className="w-full border border-slate-600 rounded-md px-3 py-2"
                          rows={2}
                          placeholder="Ex: Définit la politique de sécurité et supervise sa mise en œuvre"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Physical Security Tab */}
              {activeTab === 'physique' && (
          <div className="bg-slate-800 shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Mesures de Sécurité Physique</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Contrôle d'Accès
                    </label>
                    <textarea
                value={formData.mesuresSecurite.physique.controleAcces}
                onChange={(e) => handleChange('mesuresSecurite.physique.controleAcces', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Badge RFID, contrôle biométrique, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Vidéosurveillance
                    </label>
                    <textarea
                value={formData.mesuresSecurite.physique.videoSurveillance}
                onChange={(e) => handleChange('mesuresSecurite.physique.videoSurveillance', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Nombre de caméras, couverture, enregistrement, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Protection Incendie
                    </label>
                    <textarea
                value={formData.mesuresSecurite.physique.protectionIncendie}
                onChange={(e) => handleChange('mesuresSecurite.physique.protectionIncendie', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Détecteurs de fumée, extincteurs, sprinklers, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Autres Mesures Physiques
                    </label>
                    <textarea
                value={formData.mesuresSecurite.physique.autresMesures}
                onChange={(e) => handleChange('mesuresSecurite.physique.autresMesures', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Autres mesures de sécurité physique..."
                    />
                  </div>
                </div>
              )}

        {/* Logical Security Tab */}
              {activeTab === 'logique' && (
          <div className="bg-slate-800 shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Mesures de Sécurité Logique</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Authentification
                    </label>
                    <textarea
                value={formData.mesuresSecurite.logique.authentification}
                onChange={(e) => handleChange('mesuresSecurite.logique.authentification', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="MFA, politique de mots de passe, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sauvegardes
                    </label>
                    <textarea
                value={formData.mesuresSecurite.logique.sauvegardes}
                onChange={(e) => handleChange('mesuresSecurite.logique.sauvegardes', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Fréquence, type, stockage, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Chiffrement
                    </label>
                    <textarea
                value={formData.mesuresSecurite.logique.chiffrement}
                onChange={(e) => handleChange('mesuresSecurite.logique.chiffrement', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="AES-256, TLS, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Pare-feu et Antivirus
                    </label>
                    <textarea
                value={formData.mesuresSecurite.logique.pareFeuxAntivirus}
                onChange={(e) => handleChange('mesuresSecurite.logique.pareFeuxAntivirus', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Firewall, antivirus, mise à jour, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Autres Mesures Logiques
                    </label>
                    <textarea
                value={formData.mesuresSecurite.logique.autresMesures}
                onChange={(e) => handleChange('mesuresSecurite.logique.autresMesures', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Autres mesures de sécurité logique..."
                    />
                  </div>
                </div>
              )}

        {/* Organizational Security Tab */}
              {activeTab === 'organisationnelle' && (
          <div className="bg-slate-800 shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Mesures de Sécurité Organisationnelle</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Formation et Sensibilisation
                    </label>
                    <textarea
                value={formData.mesuresSecurite.organisationnelle.formationSensibilisation}
                onChange={(e) => handleChange('mesuresSecurite.organisationnelle.formationSensibilisation', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Formation annuelle, quiz trimestriel, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Procédures d'Habilitation
                    </label>
                    <textarea
                value={formData.mesuresSecurite.organisationnelle.proceduresHabilitation}
                onChange={(e) => handleChange('mesuresSecurite.organisationnelle.proceduresHabilitation', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="Validation, révision des accès, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Clauses de Confidentialité
                    </label>
                    <textarea
                value={formData.mesuresSecurite.organisationnelle.clausesConfidentialite}
                onChange={(e) => handleChange('mesuresSecurite.organisationnelle.clausesConfidentialite', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                placeholder="NDA, contrats, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                Autres Mesures Organisationnelles
                    </label>
                    <textarea
                value={formData.mesuresSecurite.organisationnelle.autresMesures}
                onChange={(e) => handleChange('mesuresSecurite.organisationnelle.autresMesures', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Autres mesures organisationnelles..."
                    />
                  </div>
                </div>
              )}

        {/* BCP/DRP Tab */}
              {activeTab === 'pcapra' && (
          <div className="bg-slate-800 shadow rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Plan de Continuité et Reprise d'Activité</h2>
            
            {/* Backup & Restoration */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Sauvegarde et Restauration</h3>
              
              <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Procédures
                        </label>
                        <textarea
                    value={formData.pcaPra.sauvegardeRestauration.procedures}
                    onChange={(e) => handleChange('pcaPra.sauvegardeRestauration.procedures', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="RTO, RPO, procédures testées, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dernier Test
                        </label>
                        <input
                    type="date"
                    value={formData.pcaPra.sauvegardeRestauration.derniereTest}
                    onChange={(e) => handleChange('pcaPra.sauvegardeRestauration.derniereTest', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fréquence des Tests
                        </label>
                        <input
                          type="text"
                    value={formData.pcaPra.sauvegardeRestauration.frequenceTests}
                    onChange={(e) => handleChange('pcaPra.sauvegardeRestauration.frequenceTests', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                    placeholder="Mensuel, trimestriel, etc."
                        />
                      </div>
              </div>
            </div>
            
            {/* Disaster Recovery Site */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Site de Secours</h3>
              
              <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                        </label>
                  <textarea
                    value={formData.pcaPra.siteSecours.description}
                    onChange={(e) => handleChange('pcaPra.siteSecours.description', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Data center secondaire, synchronisation, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Adresse
                        </label>
                  <input
                    type="text"
                    value={formData.pcaPra.siteSecours.adresse}
                    onChange={(e) => handleChange('pcaPra.siteSecours.adresse', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                    placeholder="Localisation du site de secours"
                        />
                      </div>
                    </div>
                  </div>

            {/* Simulation Exercises */}
            <div>
              <h3 className="font-semibold mb-3">Exercices de Simulation</h3>
              
              <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                        </label>
                  <textarea
                    value={formData.pcaPra.exercicesSimulation.description}
                    onChange={(e) => handleChange('pcaPra.exercicesSimulation.description', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Simulation de cyberattaque, exercice de crise, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dernier Exercice
                        </label>
                        <input
                    type="date"
                    value={formData.pcaPra.exercicesSimulation.dernierExercice}
                    onChange={(e) => handleChange('pcaPra.exercicesSimulation.dernierExercice', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fréquence
                        </label>
                  <input
                    type="text"
                    value={formData.pcaPra.exercicesSimulation.frequence}
                    onChange={(e) => handleChange('pcaPra.exercicesSimulation.frequence', e.target.value)}
                    className="w-full border border-slate-600 rounded-md px-3 py-2"
                    placeholder="Semestriel, annuel, etc."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
        
        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-slate-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes et Commentaires</h2>
            
            <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
            </label>
            <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full border border-slate-600 rounded-md px-3 py-2"
                rows={8}
                placeholder="Ajouter des notes ou commentaires supplémentaires..."
            />
          </div>
          </div>
        )}

        {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-900"
            >
              Annuler
            </button>
          
            <button
              type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default SecuriteProjetForm;
