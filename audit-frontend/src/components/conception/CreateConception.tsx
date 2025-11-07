import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import type { CreateConceptionData, Projet } from '../../types/audit';

const CreateConception: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingConception, setExistingConception] = useState<any | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [formData, setFormData] = useState<CreateConceptionData>({
    projet: id || '',
    nomFichier: '',
    typeFichier: '',
    rssiCommentaire: '',
    statut: 'en attente'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
      checkExistingConception();
    }
  }, [id]);

  const checkExistingConception = async () => {
    try {
      setLoadingCheck(true);
      const token = localStorage.getItem('authToken');
      let found = false;
      
      // Check API for existing conception (with timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`http://192.168.100.244:3000/api/conceptions/projet/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 API Conception check result:', data);
          if (data && data.length > 0) {
            console.log('✅ Found existing Conception from API');
            setExistingConception(data[0]);
            found = true;
          }
        }
      } catch (err) {
        console.log('⚠️ API check failed or timed out, checking localStorage');
      }
      
      // Check localStorage for existing conception if not found in API
      if (!found) {
        const localConceptions = JSON.parse(localStorage.getItem(`conceptions:${id}`) || '[]');
        console.log('📦 localStorage Conception check result:', localConceptions);
        if (localConceptions.length > 0) {
          console.log('✅ Found existing Conception from localStorage');
          setExistingConception(localConceptions[0]);
        } else {
          console.log('✅ No existing Conception found - can create new one');
        }
      }
    } catch (error) {
      console.error('❌ Error checking existing conception:', error);
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
          perimetre: 'Formation et sensibilisation',
          budget: 15000,
          priorite: 'Moyenne',
          dateDebut: '2024-02-01',
          dateFin: '2024-04-30',
          statut: 'Planifié',
          creerPar: 'user1',
          risques: ['risque2'],
          constats: ['constat2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allProjects = [...localStorageProjects, ...defaultProjects];
      const foundProject = allProjects.find(p => p._id === id);
      
      if (foundProject) {
        setProject(foundProject);
      } else {
        setError('Projet non trouvé');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Erreur lors du chargement du projet');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFormData(prev => ({
        ...prev,
        nomFichier: file.name,
        typeFichier: file.type || 'application/octet-stream'
      }));
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({
      ...prev,
      nomFichier: '',
      typeFichier: ''
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nomFichier.trim()) {
      setError('Le nom du fichier est requis');
      return false;
    }
    if (!formData.typeFichier.trim()) {
      setError('Le type de fichier est requis');
      return false;
    }
    if (!uploadedFile) {
      setError('Veuillez sélectionner un fichier');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if a conception already exists
    if (existingConception) {
      setError('Une conception existe déjà pour ce projet. Un seul document de conception est autorisé par projet.');
      return;
    }

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');

      // Create file URL for storage
      const fileUrl = uploadedFile ? URL.createObjectURL(uploadedFile) : '';

      // Create new conception with mock ID
      const newConception = {
        _id: `conception_${id}_${Date.now()}`,
        ...formData,
        urlFichier: fileUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingConceptions = JSON.parse(localStorage.getItem(`conceptions:${id}`) || '[]');
      existingConceptions.push(newConception);
      localStorage.setItem(`conceptions:${id}`, JSON.stringify(existingConceptions));

      
      // Show success message
      alert('Conception créée avec succès !');
      
      // Use window.location to ensure proper navigation
      window.location.href = `/projets/${id}`;
    } catch (err: any) {
      console.error('Error creating conception:', err);
      setError('Erreur lors de la création de la conception');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (existingConception) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Conception déjà existante</h3>
          <p className="text-slate-400 mb-4">
            Une conception existe déjà pour ce projet. Un seul document de conception est autorisé par projet.
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
              onClick={() => navigate(`/conceptions/${existingConception._id}`)}
            >
              Voir la conception existante
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
            onClick={() => navigate(`/projects/${id}/conception`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour aux conceptions
          </button>
          <Button variant="secondary" onClick={() => navigate(`/projects/${id}`)}>
            🏠 Projet
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">🏗️ Créer une conception</h1>
        <p className="text-slate-400">
          {project ? `Pour le projet: ${project.nom}` : 'Définissez les spécifications de votre conception'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Conception Creation Form */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations de la conception</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📄 Fichier de conception
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              
              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">📁</span>
                    <div>
                      <span className="text-white font-medium">{uploadedFile.name}</span>
                      <div className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type || 'Fichier'}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={removeFile}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* File Name */}
          <div className="mb-6">
            <Input
              id="nomFichier"
              name="nomFichier"
              type="text"
              label="Nom du fichier"
              value={formData.nomFichier}
              onChange={handleChange}
              placeholder="Ex: architecture_securite.pdf"
              required
              icon="📋"
            />
          </div>

          {/* File Type */}
          <div className="mb-6">
            <Input
              id="typeFichier"
              name="typeFichier"
              type="text"
              label="Type de fichier"
              value={formData.typeFichier}
              onChange={handleChange}
              placeholder="Ex: application/pdf, image/png"
              required
              icon="🏷️"
            />
          </div>

          {/* RSSI Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              💬 Commentaire RSSI (optionnel)
            </label>
            <textarea
              name="rssiCommentaire"
              value={formData.rssiCommentaire}
              onChange={handleChange}
              rows={4}
              placeholder="Ajoutez un commentaire pour le RSSI..."
              className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📊 Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en attente">En attente</option>
              <option value="validée">Validée</option>
              <option value="à revoir">À revoir</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}/conception`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Création...' : '✅ Créer la conception'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateConception;