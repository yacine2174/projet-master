import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateProjetData, Constat } from '../../types/audit';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateProjetData>({
    nom: '',
    perimetre: '',
    budget: 0,
    priorite: 'Moyenne',
    dateDebut: '',
    dateFin: '',
    statut: 'Planifié',
    audit: '',
    constats: []
  });
  const [constats, setConstats] = useState<Constat[]>([]);
  const [selectedConstats, setSelectedConstats] = useState<string[]>([]);
  const [isLoadingConstats, setIsLoadingConstats] = useState(false);

  useEffect(() => {
    fetchConstats();
  }, []);

  const fetchConstats = async () => {
    try {
      setIsLoadingConstats(true);
      
      // First try to fetch from API
      let apiConstats: Constat[] = [];
      try {
        const token = localStorage.getItem('authToken');
        
        console.log('🔍 Fetching constats from API...');
        console.log('- Token exists:', !!token);
        console.log('- API URL:', 'http://192.168.100.244:3000/api/constats');
        
        const res = await fetch('http://192.168.100.244:3000/api/constats', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        
        console.log('- Response status:', res.status);
        console.log('- Response ok:', res.ok);
        
        if (res.ok) {
          const data = await res.json();
          apiConstats = Array.isArray(data) ? data : [];
          console.log('- Constats from API:', apiConstats.length);
        }
      } catch (apiError) {
        console.log('⚠️ Could not load constats from API, using localStorage only');
      }

      // Then fetch from localStorage
      const storedConstats = JSON.parse(localStorage.getItem('constats') || '[]') as Constat[];
      console.log('- Constats from localStorage:', storedConstats.length);
      
      // Combine both sources and remove duplicates
      const allConstats = [...apiConstats, ...storedConstats];
      const uniqueConstats = allConstats.filter((constat, index, self) => 
        index === self.findIndex(c => c._id === constat._id)
      );
      
      console.log('- Total unique constats:', uniqueConstats.length);
      setConstats(uniqueConstats);
    } catch (error: any) {
      console.error('❌ Error loading constats:', error);
      setError(`Impossible de charger les constats: ${error.message}`);
    } finally {
      setIsLoadingConstats(false);
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
    // At least one constat is required
    if (selectedConstats.length === 0) {
      setError('Vous devez sélectionner au moins un constat pour ce projet');
      return false;
    }
    // Validate constats are valid ObjectIds
    const objectIdRegex = /^[a-f\d]{24}$/i;
    const invalid = selectedConstats.find(id => !objectIdRegex.test(id));
    if (invalid) {
      setError('Certains constats sélectionnés ne sont pas valides');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if user is authenticated
    if (!user) {
      setError('Vous devez être connecté pour créer un projet');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      console.log('🔍 CreateProject Debug:');
      console.log('- User:', user);
      console.log('- Token exists:', !!token);
      console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const objectIdRegex = /^[a-f\d]{24}$/i;
      const constatsToSend = selectedConstats.filter(id => objectIdRegex.test(id));
      
      // Derive audit from the first selected constat (all constats should belong to same audit)
      const firstConstat = constats.find(c => c._id === constatsToSend[0]);
      const auditId = firstConstat?.audit || '';
      
      const requestData = { 
        ...formData,
        audit: auditId,
        constats: constatsToSend,
        creerPar: user._id 
      };
      
      console.log('- Request data:', requestData);
      
      const res = await fetch('http://192.168.100.244:3000/api/projets', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('- Response status:', res.status);
      console.log('- Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const msg = await res.text();
        console.error('- Error response:', msg);
        throw new Error(msg || 'Erreur API');
      }
      const created = await res.json();
      console.log('- Created project:', created);
      alert('Projet créé avec succès !');
      navigate(`/projects/${created._id}`);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(`Erreur lors de la création du projet: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour à la liste des projets
          </button>
          <Button variant="secondary" onClick={() => navigate('/rssi')}>
            🏠 Tableau de bord
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">🚀 Créer un nouveau projet</h1>
        <p className="text-slate-400">
          Définissez un nouveau projet de sécurité avec ses objectifs et contraintes
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Project Creation Form */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations du projet</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="md:col-span-2">
              <Input
                id="nom"
                name="nom"
                type="text"
                label="Nom du projet"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Sécurisation de l'infrastructure réseau"
                required
                icon="📋"
              />
            </div>

            {/* Perimeter */}
            <div className="md:col-span-2">
              <Input
                id="perimetre"
                name="perimetre"
                type="text"
                label="Périmètre"
                value={formData.perimetre}
                onChange={handleChange}
                placeholder="Ex: Infrastructure réseau, Applications web, Données sensibles"
                required
                icon="🎯"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                💰 Budget (€)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget.toString()}
                onChange={handleChange}
                placeholder="50000"
                min="0"
                step="1000"
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Priority */}
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

            {/* Start Date */}
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

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                📅 Date de fin
              </label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Status */}
            <Select
              id="statut"
              name="statut"
              label="Statut initial"
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
          </div>

          {/* Constat Selection */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">
              🔍 Constats associés <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Sélectionnez les constats d'audit qui seront traités dans ce projet. L'audit sera automatiquement déterminé à partir des constats sélectionnés.
            </p>

            {isLoadingConstats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Chargement des constats...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {constats.map((constat) => (
                  <div
                    key={constat._id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedConstats.includes(constat._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => handleConstatToggle(constat._id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedConstats.includes(constat._id)}
                        onChange={() => handleConstatToggle(constat._id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-white">{constat.description}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            constat.type === 'NC maj' ? 'bg-red-100 text-red-800' :
                            constat.type === 'NC min' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {constat.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          <strong>Criticité:</strong> {constat.criticite} | 
                          <strong> Impact:</strong> {constat.impact}
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Probabilité:</strong> {constat.probabilite}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {constats.length === 0 && !isLoadingConstats && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Aucun constat disponible</p>
                <p className="text-xs text-gray-400 mt-1">
                  Créez d'abord des audits et des constats pour pouvoir les associer à ce projet
                </p>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Information :</h4>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Un projet est créé pour traiter un ou plusieurs constats d'audit</li>
                <li>• Sélectionnez au moins un constat</li>
                <li>• L'audit associé sera automatiquement déterminé à partir des constats choisis</li>
                <li>• Les constats sélectionnés détermineront les recommandations et plans d'action</li>
              </ul>
            </div>
          </div>

          {/* Form Actions */}
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
              {isLoading ? 'Création...' : 'Créer le projet'}
            </Button>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Conseils pour un bon projet :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Nom clair :</strong> Décrivez précisément l'objectif du projet</li>
          <li>• <strong>Périmètre précis :</strong> Définissez clairement ce qui est inclus/exclu du projet</li>
          <li>• <strong>Budget réaliste :</strong> Estimez les coûts en incluant les ressources humaines et techniques</li>
          <li>• <strong>Planning réaliste :</strong> Prévoyez des marges pour les imprévus</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateProject;
