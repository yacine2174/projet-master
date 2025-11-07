import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { Conception, Constat } from '../../types/audit';

const CreateConceptionConstat: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [constat, setConstat] = useState<Constat | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    nomFichier: '',
    typeFichier: '',
    rssiCommentaire: ''
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';
  const constatId = searchParams.get('constat');

  useEffect(() => {
    if (constatId) {
      fetchConstat();
    }
  }, [constatId]);

  const fetchConstat = async () => {
    try {
      // Get constats from localStorage
      const localStorageConstats = JSON.parse(localStorage.getItem('constats') || '[]');
      
      // Default mock constats
      const defaultConstats: Constat[] = [
        {
          _id: 'constat_1',
          description: 'Non-conformité majeure dans la gestion des accès',
          type: 'NC maj',
          criticite: 'Élevée',
          impact: 'Sécurité compromise',
          probabilite: 'Élevée',
          audit: 'audit_1',
          projet: '',
          recommandations: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: 'constat_2',
          description: 'Non-conformité mineure dans la documentation',
          type: 'NC min',
          criticite: 'Faible',
          impact: 'Conformité documentaire',
          probabilite: 'Moyenne',
          audit: 'audit_2',
          projet: '',
          recommandations: [],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ];

      const allConstats = [...defaultConstats, ...localStorageConstats];
      const foundConstat = allConstats.find(c => c._id === constatId);
      
      if (foundConstat) {
        setConstat(foundConstat);
      } else {
        setError('Constat non trouvé');
      }
    } catch (error: any) {
      console.error('Error fetching constat:', error);
      setError('Erreur lors du chargement du constat');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        nomFichier: selectedFile.name,
        typeFichier: selectedFile.type
      }));
    }
  };

  const validateForm = () => {
    if (!formData.nomFichier.trim()) {
      setError('Le nom du fichier est requis');
      return false;
    }
    if (!formData.typeFichier.trim()) {
      setError('Le type de fichier est requis');
      return false;
    }
    if (!file) {
      setError('Veuillez sélectionner un fichier');
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

      // Create a mock URL for the file (in a real app, this would be uploaded to a server)
      const fileUrl = `http://localhost:3000/files/${file.name}`;

      const newConception: Conception = {
        _id: `conception_${Date.now()}`,
        nomFichier: formData.nomFichier,
        typeFichier: formData.typeFichier,
        urlFichier: fileUrl,
        projet: constat?.projet || '',
        rssiCommentaire: formData.rssiCommentaire,
        statut: 'en attente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const localStorageConceptions = JSON.parse(localStorage.getItem('conceptions') || '[]');
      localStorageConceptions.push(newConception);
      localStorage.setItem('conceptions', JSON.stringify(localStorageConceptions));

      console.log('✅ Conception created:', newConception);
      alert('Conception créée avec succès !');
      navigate(`/constats/${constatId}`);
    } catch (error: any) {
      setError('Erreur lors de la création de la conception');
      console.error('Error creating conception:', error);
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
          <p className="text-slate-400 mb-4">Vous n'avez pas les permissions nécessaires pour créer une conception</p>
          <Button variant="outline" onClick={() => navigate('/constats')}>
            ← Retour aux constats
          </Button>
        </div>
      </div>
    );
  }

  if (!constatId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Constat requis</h2>
          <p className="text-slate-400 mb-4">Vous devez sélectionner un constat pour créer une conception</p>
          <Button variant="outline" onClick={() => navigate('/constats')}>
            ← Retour aux constats
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
                <h1 className="text-2xl font-bold text-white">🏗️ Créer une Conception</h1>
                <p className="text-slate-400 mt-1">Conception associée au constat sélectionné</p>
                {constat && (
                  <div className="mt-2 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Constat associé:</strong> {constat.description}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Type: {constat.type} | Criticité: {constat.criticite}
                    </p>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate(`/constats/${constatId}`)}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fichier de conception *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-slate-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Télécharger un fichier</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, XLSX, XLS jusqu'à 10MB</p>
                  </div>
                </div>
                {file && (
                  <div className="mt-2 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Fichier sélectionné:</strong> {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Taille: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom du fichier *
                </label>
                <input
                  type="text"
                  name="nomFichier"
                  value={formData.nomFichier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Conception_Architecture_Securite.pdf"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type de fichier *
                </label>
                <select
                  name="typeFichier"
                  value={formData.typeFichier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="application/pdf">PDF</option>
                  <option value="application/msword">DOC</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                  <option value="text/plain">TXT</option>
                  <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</option>
                  <option value="application/vnd.ms-excel">XLS</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Commentaire RSSI (optionnel)
                </label>
                <textarea
                  name="rssiCommentaire"
                  value={formData.rssiCommentaire}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ajoutez des commentaires pour le RSSI..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/constats/${constatId}`)}
                disabled={isLoading}
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
    </div>
  );
};

export default CreateConceptionConstat;
