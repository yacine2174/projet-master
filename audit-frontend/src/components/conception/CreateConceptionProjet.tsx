import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import { Conception } from '../../types/audit';

const CreateConceptionProjet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet');
  
  const [formData, setFormData] = useState({
    nomFichier: '',
    nomFichierOriginal: '',
    typeFichier: 'PDF',
    fichier: null as File | null,
    rssiCommentaire: '',
    statut: 'en attente' as 'en attente' | 'validée' | 'à revoir'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [projet, setProjet] = useState<any>(null);

  useEffect(() => {
    if (projetId) {
      loadProjet();
    } else {
      setError('ID du projet manquant');
    }
  }, [projetId]);

  const loadProjet = async () => {
    try {
      // Load projet from backend API
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.100.244:3000/api/projets/${projetId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const foundProjet = await response.json();
        setProjet(foundProjet);
      } else {
        setError('Projet non trouvé dans la base de données');
      }
    } catch (error) {
      console.error('Error loading projet:', error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      fichier: file,
      // Only auto-fill if nomFichier is empty, otherwise keep user's input
      nomFichier: file && !prev.nomFichier ? file.name : prev.nomFichier,
      nomFichierOriginal: file ? file.name : prev.nomFichierOriginal,
      // Only auto-fill type if it's still the default
      typeFichier: file && prev.typeFichier === 'PDF' ? getFileType(file.name) : prev.typeFichier
    }));
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'doc': case 'docx': return 'Word';
      case 'xls': case 'xlsx': return 'Excel';
      case 'vsd': case 'vsdx': return 'Visio';
      case 'ppt': case 'pptx': return 'PowerPoint';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return 'Image';
      default: return 'PDF';
    }
  };

  const clearFile = () => {
    setFormData(prev => ({
      ...prev,
      fichier: null,
      nomFichier: '',
      nomFichierOriginal: '',
      typeFichier: 'PDF'
    }));
  };

  const validateForm = () => {
    if (!formData.nomFichier.trim()) {
      setError('Le nom du document est requis');
      return false;
    }
    if (!formData.fichier) {
      setError('Veuillez sélectionner un fichier à télécharger');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const res = await fetch('http://192.168.100.244:3000/api/conceptions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nomFichier: formData.nomFichier,
          nomFichierOriginal: formData.nomFichierOriginal,
          typeFichier: formData.typeFichier,
          rssiCommentaire: formData.rssiCommentaire,
          statut: formData.statut,
          projet: projetId
        })
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('API create conception failed:', res.status, txt);
        throw new Error('Erreur API');
      }
      const createdConception = await res.json();
      console.log('✅ Conception created:', createdConception);
      alert('Document de conception créé avec succès !');
      // Navigate back to project detail page
      window.location.href = `/projets/${projetId}`;
    } catch (error: any) {
      setError('Erreur lors de la création du document de conception');
      console.error('Error creating conception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error && !projet) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          Retour aux projets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/projects/${projetId}`)}
          className="text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          ← Retour au projet
        </button>
        <h1 className="text-3xl font-bold text-white">Créer un document de conception</h1>
        <p className="text-slate-400 mt-2">
          Document de conception pour le projet: <strong>{projet?.nom}</strong>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Nom du document */}
          <div>
            <label htmlFor="nomFichier" className="block text-sm font-medium text-slate-300 mb-2">
              Nom du document <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nomFichier"
              name="nomFichier"
              value={formData.nomFichier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: Architecture de sécurité - Module authentification"
              required
            />
            {formData.fichier && (
              <p className="text-xs text-gray-500 mt-1">
                Nom d'affichage personnalisé - sera utilisé dans toute l'application
              </p>
            )}
          </div>

          {/* Type de document */}
          <div>
            <label htmlFor="typeFichier" className="block text-sm font-medium text-slate-300 mb-2">
              Type de document
            </label>
            <select
              id="typeFichier"
              name="typeFichier"
              value={formData.typeFichier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PDF">PDF</option>
              <option value="Word">Word</option>
              <option value="Excel">Excel</option>
              <option value="Visio">Visio</option>
              <option value="PowerPoint">PowerPoint</option>
              <option value="Image">Image</option>
            </select>
            {formData.fichier && (
              <p className="text-xs text-gray-500 mt-1">
                Le type est suggéré à partir du fichier sélectionné, mais vous pouvez le modifier
              </p>
            )}
          </div>

          {/* Fichier à télécharger */}
          <div>
            <label htmlFor="fichier" className="block text-sm font-medium text-slate-300 mb-2">
              Fichier à télécharger <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-slate-500 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-slate-400">
                  <label
                    htmlFor="fichier"
                    className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Télécharger un fichier</span>
                    <input
                      id="fichier"
                      name="fichier"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.vsd,.vsdx,.ppt,.pptx,.png,.jpg,.jpeg,.gif"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, Word, Excel, Visio, PowerPoint, Images jusqu'à 10MB
                </p>
                {formData.fichier && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ {formData.fichier.name} sélectionné
                    </p>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Supprimer le fichier
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Commentaire RSSI */}
          <div>
            <label htmlFor="rssiCommentaire" className="block text-sm font-medium text-slate-300 mb-2">
              Commentaire RSSI
            </label>
            <textarea
              id="rssiCommentaire"
              name="rssiCommentaire"
              value={formData.rssiCommentaire}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Commentaires du RSSI sur le document de conception (architecture, sécurité, conformité...)"
            />
          </div>

          {/* Statut */}
          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-slate-300 mb-2">
              Statut
            </label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en attente">En attente</option>
              <option value="validée">Validée</option>
              <option value="à revoir">À revoir</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/projects/${projetId}`)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Création...' : 'Créer le document de conception'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateConceptionProjet;
