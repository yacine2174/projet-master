import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { Preuve, Audit } from '../../types/audit';

const PreuveDetail: React.FC = () => {
  const { preuveId } = useParams<{ preuveId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preuve, setPreuve] = useState<Preuve | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nomFichier: '',
    typeFichier: ''
  });

  const isAdmin = user?.role === 'ADMIN';
  const isRSSI = user?.role === 'RSSI';

  useEffect(() => {
    if (preuveId) {
      fetchPreuve();
    }
  }, [preuveId]);

  const fetchPreuve = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get preuve from localStorage
      const localStoragePreuves = JSON.parse(localStorage.getItem('preuves') || '[]');
      
      // Default mock preuves
      const defaultPreuves: Preuve[] = [
        {
          _id: 'preuve_1',
          nomFichier: 'rapport_iso27001_2024.pdf',
          typeFichier: 'application/pdf',
          urlFichier: 'blob:mock-url-1',
          audit: 'audit_1',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        },
        {
          _id: 'preuve_2',
          nomFichier: 'firewall_config.png',
          typeFichier: 'image/png',
          urlFichier: 'blob:mock-url-2',
          audit: 'audit_2',
          createdAt: '2024-02-10T00:00:00Z',
          updatedAt: '2024-02-10T00:00:00Z'
        },
        {
          _id: 'preuve_3',
          nomFichier: 'utilisateurs_actifs.xlsx',
          typeFichier: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          urlFichier: 'blob:mock-url-3',
          audit: 'audit_1',
          createdAt: '2024-01-20T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z'
        }
      ];

      const allPreuves = [...defaultPreuves, ...localStoragePreuves];
      const foundPreuve = allPreuves.find(p => p._id === preuveId);

      if (foundPreuve) {
        setPreuve(foundPreuve);
        setEditData({
          nomFichier: foundPreuve.nomFichier,
          typeFichier: foundPreuve.typeFichier
        });
        
        // Fetch associated audit
        await fetchAudit(foundPreuve.audit);
      } else {
        setError('Preuve non trouvée');
      }

      console.log('✅ Preuve data loaded:', foundPreuve);
    } catch (error: any) {
      setError('Erreur lors du chargement de la preuve');
      console.error('Error fetching preuve data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudit = async (auditId: string) => {
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

      const allAudits = [...defaultAudits, ...localStorageAudits];
      const foundAudit = allAudits.find(a => a._id === auditId);
      
      if (foundAudit) {
        setAudit(foundAudit);
      }
    } catch (error: any) {
      console.error('Error fetching audit:', error);
    }
  };

  const getFileIcon = (typeFichier: string) => {
    if (typeFichier.includes('pdf')) return '📄';
    if (typeFichier.includes('image')) return '🖼️';
    if (typeFichier.includes('word') || typeFichier.includes('document')) return '📝';
    if (typeFichier.includes('excel') || typeFichier.includes('spreadsheet')) return '📊';
    if (typeFichier.includes('powerpoint') || typeFichier.includes('presentation')) return '📽️';
    if (typeFichier.includes('video')) return '🎥';
    if (typeFichier.includes('audio')) return '🎵';
    if (typeFichier.includes('zip') || typeFichier.includes('archive')) return '📦';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!preuve) return;

    try {
      // Update in localStorage
      const localStoragePreuves = JSON.parse(localStorage.getItem('preuves') || '[]');
      const preuveIndex = localStoragePreuves.findIndex((p: Preuve) => p._id === preuveId);
      
      if (preuveIndex !== -1) {
        localStoragePreuves[preuveIndex] = {
          ...localStoragePreuves[preuveIndex],
          nomFichier: editData.nomFichier,
          typeFichier: editData.typeFichier,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('preuves', JSON.stringify(localStoragePreuves));
      }

      // Update state
      setPreuve(prev => prev ? {
        ...prev,
        nomFichier: editData.nomFichier,
        typeFichier: editData.typeFichier,
        updatedAt: new Date().toISOString()
      } : null);

      setIsEditing(false);
      console.log('✅ Preuve updated');
      alert('Preuve mise à jour avec succès !');
    } catch (error: any) {
      console.error('Error updating preuve:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setEditData({
      nomFichier: preuve?.nomFichier || '',
      typeFichier: preuve?.typeFichier || ''
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!preuve || !window.confirm('Êtes-vous sûr de vouloir supprimer cette preuve ?')) {
      return;
    }

    try {
      // Remove from localStorage
      const localStoragePreuves = JSON.parse(localStorage.getItem('preuves') || '[]');
      const filteredPreuves = localStoragePreuves.filter((p: Preuve) => p._id !== preuveId);
      localStorage.setItem('preuves', JSON.stringify(filteredPreuves));
      
      console.log('✅ Preuve deleted from localStorage');
      alert('Preuve supprimée avec succès !');
      navigate('/preuves');
    } catch (error: any) {
      console.error('Error deleting preuve:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDownload = () => {
    if (!preuve) return;

    // Try to get stored file from localStorage
    const storedFile = localStorage.getItem(`preuve_file_${preuve.nomFichier}`);
    if (storedFile) {
      try {
        const fileData = JSON.parse(storedFile);
        console.log(`📁 Downloading stored file: ${preuve.nomFichier}`, fileData);
        
        const link = document.createElement('a');
        let blob;
        
        // Check if we have a valid data URL
        if (fileData.content && typeof fileData.content === 'string') {
          const base64Data = fileData.content.includes(',') ? fileData.content.split(',')[1] : fileData.content;
          try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Use the proper MIME type from the file data
            blob = new Blob([bytes], { type: fileData.type || preuve.typeFichier });
          } catch (base64Error) {
            console.error('Error with base64 decoding:', base64Error);
            // Try to create blob from the raw content
            blob = new Blob([fileData.content], { type: fileData.type || preuve.typeFichier });
          }
        } else {
          console.warn('No file content found in stored file data');
          throw new Error('No file content available');
        }
        
        const url = URL.createObjectURL(blob);
        link.href = url;
        
        // Use the correct filename and extension
        const correctFileName = preuve.nomFichier.includes('.') ? preuve.nomFichier : `${preuve.nomFichier}.pdf`;
        link.download = correctFileName;
        
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        alert(`✅ Fichier téléchargé: ${correctFileName}\n\nType: ${fileData.type || preuve.typeFichier}\nTaille: ${fileData.size ? formatFileSize(fileData.size) : 'N/A'}`);
        return;
      } catch (error) {
        console.error('Error downloading stored file:', error);
        alert(`❌ Erreur lors du téléchargement: ${error}\n\nLe fichier original n'a pas été trouvé ou corrompu.`);
      }
    }

    // If we don't have the stored file but we have a URL, try to handle that
    if (preuve.urlFichier && preuve.urlFichier.startsWith('blob:')) {
      try {
        const link = document.createElement('a');
        link.href = preuve.urlFichier;
        const correctFileName = preuve.nomFichier.includes('.') ? preuve.nomFichier : `${preuve.nomFichier}.pdf`;
        link.download = correctFileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`✅ Fichier téléchargé: ${correctFileName}\n\nTéléchargé depuis l'URL stockée.`);
        return;
      } catch (urlError) {
        console.error('Error with URL download:', urlError);
      }
    }

    // Final fallback: indicate no file available
    alert(`❌ Fichier non disponible\n\nLe fichier original n'a pas été trouvé. Veuillez le re-télécharger.`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement de la preuve...</p>
        </div>
      </div>
    );
  }

  if (error || !preuve) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
        <p className="text-gray-500 mb-4">{error || 'Preuve non trouvée'}</p>
        <Button variant="primary" onClick={() => navigate(-1)}>
          ← Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour
          </button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
              🏠 Tableau de bord
            </Button>
            {(isAdmin || isRSSI) && (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  📥 Télécharger
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  ✏️ Modifier
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={handleDelete}
                >
                  🗑️ Supprimer
                </Button>
              </>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEditing ? 'Modifier la preuve' : preuve.nom}
        </h1>
        <p className="text-slate-400">
          {isEditing ? 'Modifiez les informations de la preuve' : 'Détails de la preuve d\'audit'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-medium text-white">Informations générales</h2>
            </div>
            <div className="px-6 py-4 space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom de la preuve
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nomFichier}
                    onChange={(e) => setEditData(prev => ({ ...prev, nomFichier: e.target.value }))}
                    className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-white">{preuve.nomFichier}</p>
                )}
              </div>

              {/* Type de fichier */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type de fichier
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.typeFichier}
                    onChange={(e) => setEditData(prev => ({ ...prev, typeFichier: e.target.value }))}
                    className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-white">{preuve.typeFichier}</p>
                )}
              </div>

              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  URL du fichier
                </label>
                <p className="text-white font-mono text-sm break-all">{preuve.urlFichier}</p>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                  <Button variant="outline" onClick={handleCancel}>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Sauvegarder
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Preview */}
          <div className="bg-slate-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Aperçu du fichier</h3>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-6xl mb-4">{getFileIcon(preuve.typeFichier)}</div>
              <p className="text-sm text-slate-400 mb-4">
                {preuve.typeFichier}
              </p>
              <Button variant="outline" onClick={handleDownload} className="w-full">
                📥 Télécharger le fichier
              </Button>
            </div>
          </div>

          {/* Audit Information */}
          {audit && (
            <div className="bg-slate-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-slate-700">
                <h3 className="text-lg font-medium text-white">Audit associé</h3>
              </div>
              <div className="px-6 py-4">
                <h4 className="font-medium text-white mb-2">{audit.nom}</h4>
                <p className="text-sm text-slate-400 mb-2">{audit.type}</p>
                <p className="text-sm text-slate-400 mb-2">{audit.perimetre}</p>
                <p className="text-sm text-gray-500">
                  {audit.dateDebut} - {audit.dateFin}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  audit.statut === 'Terminé' ? 'bg-green-100 text-green-800' :
                  audit.statut === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-slate-800 text-slate-200'
                }`}>
                  {audit.statut}
                </span>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-slate-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Métadonnées</h3>
            </div>
            <div className="px-6 py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Créée le:</span>
                <span className="text-white">{new Date(preuve.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modifiée le:</span>
                <span className="text-white">{new Date(preuve.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="text-white font-mono text-xs">{preuve._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreuveDetail;
