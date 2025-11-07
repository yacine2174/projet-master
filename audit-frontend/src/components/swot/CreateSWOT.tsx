import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import type { CreateSWOTData, Projet } from '../../types/audit';

const CreateSWOT: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateSWOTData>({
    projet: id || '',
    forces: [''],
    faiblesses: [''],
    opportunites: [''],
    menaces: [''],
    analyse: '',
    recommandations: ''
  });

  const [existingSWOT, setExistingSWOT] = useState<any | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
      checkExistingSWOT();
    }
  }, [id]);

  const checkExistingSWOT = async () => {
    try {
      setLoadingCheck(true);
      const token = localStorage.getItem('authToken');
      let found = false;
      
      // Check API for existing SWOT (with timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`http://192.168.100.244:3000/api/swots/projet/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 API SWOT check result:', data);
          if (data && data.length > 0) {
            console.log('✅ Found existing SWOT from API');
            setExistingSWOT(data[0]);
            found = true;
          }
        }
      } catch (err) {
        console.log('⚠️ API check failed or timed out, checking localStorage');
      }

      // Check localStorage for existing SWOT if not found in API
      if (!found) {
        const localSWOTs = JSON.parse(localStorage.getItem(`swots:${id}`) || '[]');
        console.log('📦 localStorage SWOT check result:', localSWOTs);
        if (localSWOTs.length > 0) {
          console.log('✅ Found existing SWOT from localStorage');
          setExistingSWOT(localSWOTs[0]);
        } else {
          console.log('✅ No existing SWOT found - can create new one');
        }
      }
    } catch (error) {
      console.error('❌ Error checking existing SWOT:', error);
    } finally {
      setLoadingCheck(false);
    }
  };

  const fetchProject = async () => {
    try {
      // Get project data from localStorage
      const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const defaultProjects: Projet[] = [
        {
          _id: '1',
          nom: 'Sécurisation de l\'infrastructure réseau',
          perimetre: 'Infrastructure réseau et équipements',
          budget: 50000,
          priorite: 'Élevée',
          dateDebut: '2024-01-01',
          dateFin: '2024-06-30',
          statut: 'En cours',
          creerPar: 'user1',
          risques: ['risque1'],
          constats: ['constat1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          nom: 'Formation sécurité pour les utilisateurs',
          perimetre: 'Formations et sensibilisation',
          budget: 15000,
          priorite: 'Moyenne',
          dateDebut: '2024-03-01',
          dateFin: '2024-12-31',
          statut: 'Planifié',
          creerPar: 'user1',
          risques: ['risque2'],
          constats: ['constat2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allProjects = [...defaultProjects, ...localStorageProjects];
      const foundProject = allProjects.find(p => p._id === id);

      if (foundProject) {
        setProject(foundProject);
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: keyof Pick<CreateSWOTData, 'forces' | 'faiblesses' | 'opportunites' | 'menaces'>, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof Pick<CreateSWOTData, 'forces' | 'faiblesses' | 'opportunites' | 'menaces'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: keyof Pick<CreateSWOTData, 'forces' | 'faiblesses' | 'opportunites' | 'menaces'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.analyse.trim()) {
      setError('Le titre de l\'analyse est requis');
      return false;
    }
    if (formData.analyse.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères');
      return false;
    }
    
    const hasContent = formData.forces.some(f => f.trim()) ||
                      formData.faiblesses.some(f => f.trim()) ||
                      formData.opportunites.some(f => f.trim()) ||
                      formData.menaces.some(f => f.trim());
    
    if (!hasContent) {
      setError('Au moins un élément doit être renseigné dans les catégories SWOT');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if SWOT already exists
    if (existingSWOT) {
      setError('Une analyse SWOT existe déjà pour ce projet. Un seul SWOT est autorisé par projet.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Filter out empty items
      const filteredData = {
        ...formData,
        forces: formData.forces.filter(f => f.trim()),
        faiblesses: formData.faiblesses.filter(f => f.trim()),
        opportunites: formData.opportunites.filter(f => f.trim()),
        menaces: formData.menaces.filter(f => f.trim())
      };

      // Create new SWOT with mock ID
      const newSWOT = {
        _id: `swot_${id}_${Date.now()}`,
        ...filteredData,
        creerPar: 'user1', // Mock user ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingSWOTs = JSON.parse(localStorage.getItem(`swots:${id}`) || '[]');
      existingSWOTs.push(newSWOT);
      localStorage.setItem(`swots:${id}`, JSON.stringify(existingSWOTs));

      console.log('✅ SWOT created and saved to localStorage:', newSWOT);
      
      // Show success message
      alert('Analyse SWOT créée avec succès !');
      
      // Use window.location to ensure proper navigation
      window.location.href = `/projets/${id}`;
    } catch (err: any) {
      console.error('Error creating SWOT:', err);
      setError('Erreur lors de la création de l\'analyse SWOT');
    } finally {
      setIsLoading(false);
    }
  };

  const renderArrayField = (
    field: keyof Pick<CreateSWOTData, 'forces' | 'faiblesses' | 'opportunites' | 'menaces'>,
    label: string,
    icon: string,
    color: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          {icon} {label}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field)}
        >
          + Ajouter
        </Button>
      </div>
      
      {formData[field].map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayChange(field, index, e.target.value)}
            placeholder={`${label.toLowerCase()} ${index + 1}`}
            className={`flex-1 px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500`}
          />
          {formData[field].length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => removeArrayItem(field, index)}
            >
              ✕
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Vérification...</p>
        </div>
      </div>
    );
  }

  if (existingSWOT) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Analyse SWOT déjà existante</h3>
          <p className="text-slate-400 mb-4">
            Une analyse SWOT existe déjà pour ce projet. Un seul SWOT est autorisé par projet.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/projects/${id}`)}
            >
              Retour au projet
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/swot/${existingSWOT._id}`)}
            >
              Voir le SWOT existant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/projects/${id}/swot`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour aux analyses SWOT
          </button>
          <Button variant="secondary" onClick={() => navigate(`/projects/${id}`)}>
            🏠 Projet
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">📊 Créer une analyse SWOT</h1>
        <p className="text-slate-400">
          {project ? `Pour le projet: ${project.nom}` : 'Analysez les forces, faiblesses, opportunités et menaces'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* SWOT Creation Form */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations de l'analyse</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* Analysis Title */}
          <div className="mb-6">
            <Input
              id="analyse"
              name="analyse"
              type="text"
              label="Titre de l'analyse"
              value={formData.analyse}
              onChange={handleChange}
              placeholder="Ex: Analyse SWOT initiale du projet de sécurisation"
              required
              icon="📊"
            />
          </div>

          {/* SWOT Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Internal Factors */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">
                Facteurs Internes
              </h3>
              
              {renderArrayField('forces', 'Forces', '💪', 'green')}
              {renderArrayField('faiblesses', 'Faiblesses', '⚠️', 'red')}
            </div>

            {/* External Factors */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">
                Facteurs Externes
              </h3>
              
              {renderArrayField('opportunites', 'Opportunités', '🚀', 'blue')}
              {renderArrayField('menaces', 'Menaces', '⚡', 'orange')}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              💡 Recommandations
            </label>
            <textarea
              name="recommandations"
              value={formData.recommandations}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez vos recommandations basées sur l'analyse SWOT..."
              className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}/swot`)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer l\'analyse SWOT'}
            </Button>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Conseils pour une bonne analyse SWOT :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Forces :</strong> Avantages internes, ressources, compétences, atouts du projet</li>
          <li>• <strong>Faiblesses :</strong> Limites internes, manques, points d'amélioration</li>
          <li>• <strong>Opportunités :</strong> Tendances externes favorables, nouvelles possibilités</li>
          <li>• <strong>Menaces :</strong> Risques externes, obstacles, concurrence, réglementation</li>
          <li>• <strong>Objectif :</strong> Maximiser les forces et opportunités, minimiser les faiblesses et menaces</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateSWOT;
