import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { Audit } from '../../types/audit';

const CreatePreuve: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedAuditId = searchParams.get('audit');

  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    audit: preselectedAuditId || '',
    nom: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const localStorageAudits = JSON.parse(localStorage.getItem('audits') || '[]');
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
        }
      ];
      const allAudits = [...defaultAudits, ...localStorageAudits];
      setAudits(allAudits);
    } catch (error: any) {
      console.error('Error fetching audits:', error);
      setError('Erreur lors du chargement des audits');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-fill the name with the file name if not already set
      if (!formData.nom) {
        setFormData({ ...formData, nom: file.name });
      }
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    if (!formData.audit) {
      setError('Veuillez sélectionner un audit');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      const newPreuve = {
        _id: `preuve_${Date.now()}`,
        nom: formData.nom || selectedFile.name,
        nomFichier: selectedFile.name,
        typeFichier: selectedFile.type,
        urlFichier: URL.createObjectURL(selectedFile),
        audit: formData.audit,
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const existingPreuves = JSON.parse(localStorage.getItem('preuves') || '[]');
      existingPreuves.push(newPreuve);
      localStorage.setItem('preuves', JSON.stringify(existingPreuves));
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait a bit to show 100% progress
      setTimeout(() => {
        // Navigate back to the audit page if we came from one
        if (formData.audit) {
          navigate(`/audits/${formData.audit}`);
        } else {
          navigate('/preuves');
        }
      }, 500);
    } catch (error: any) {
      setError('Erreur lors de l\'upload du fichier');
      console.error('Error creating preuve:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">📎 Ajouter une Preuve</h2>
              <p className="text-gray-400">Téléchargez un document, une image ou tout autre fichier comme preuve d'audit</p>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>← Retour</Button>
          </div>
        </div>
        <div className="bg-slate-800 shadow-lg rounded-lg border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-medium text-white">Informations de la preuve</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0"><span className="text-red-400">⚠️</span></div>
                  <div className="ml-3"><p className="text-sm text-red-400">{error}</p></div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nom de la preuve <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nom de la preuve"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Fichier <span className="text-red-400">*</span></label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-emerald-500 transition-colors">
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="text-4xl">{getFileIcon(selectedFile.type)}</div>
                      <div className="text-sm text-white">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-sm text-red-400 hover:text-red-300">Supprimer</button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className="flex text-sm text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300">
                          <span>Télécharger un fichier</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS, PNG, JPG jusqu'à 50MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description (optionnelle)</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ajoutez une description..."/>
            </div>
            {isLoading && uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Upload en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
            <div className="flex space-x-3">
              <Button type="submit" variant="primary" disabled={isLoading || !selectedFile} className="flex-1">{isLoading ? 'Upload en cours...' : '📤 Télécharger la preuve'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>Annuler</Button>
            </div>
          </form>
        </div>
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 À propos des preuves :</h4>
          <ul className="text-xs text-blue-400 space-y-1">
            <li>• Les preuves sont des documents qui attestent de la conformité lors d'un audit</li>
            <li>• Chaque preuve doit être associée à un audit spécifique</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePreuve;
