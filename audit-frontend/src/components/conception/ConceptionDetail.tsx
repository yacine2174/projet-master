import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import type { Conception, Projet } from '../../types/audit';

const ConceptionDetail: React.FC = () => {
  const params = useParams<{ id: string; conceptionId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Projet | null>(null);
  const [conception, setConception] = useState<Conception | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState<Partial<Conception>>({});

  const isRSSI = user?.role === 'RSSI';
  const isAdmin = user?.role === 'ADMIN';

  // Handle both route formats:
  // 1. /projects/:id/conception/:conceptionId (both id and conceptionId)
  // 2. /conceptions/:id (only conception id)
  const projectId = params.conceptionId ? params.id : undefined;
  const conceptionIdToFetch = params.conceptionId || params.id;

  useEffect(() => {
    if (isDeleting) return; // avoid refetch while navigating after delete
    if (conceptionIdToFetch) {
      fetchData();
    }
  }, [conceptionIdToFetch, isDeleting]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Fetching conception:', { projectId, conceptionIdToFetch });

      let foundConception: Conception | null = null;

      // Try to fetch from API first (with timeout)
      try {
        const token = localStorage.getItem('authToken');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`http://192.168.100.244:3000/api/conceptions/${conceptionIdToFetch}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          foundConception = await response.json();
          console.log('✅ Found conception from API');
        }
      } catch (err) {
        console.log('⚠️ API fetch failed or timed out, checking localStorage');
      }

      // Fallback: check localStorage
      if (!foundConception && projectId) {
        const conceptions = JSON.parse(localStorage.getItem(`conceptions:${projectId}`) || '[]');
        foundConception = conceptions.find((c: Conception) => c._id === conceptionIdToFetch) || null;
        console.log('📦 Checked localStorage for conception');
      }

      // If still not found, check all localStorage keys
      if (!foundConception) {
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('conceptions:'));
        for (const key of allKeys) {
          const conceptions = JSON.parse(localStorage.getItem(key) || '[]');
          foundConception = conceptions.find((c: Conception) => c._id === conceptionIdToFetch);
          if (foundConception) {
            console.log('✅ Found conception in localStorage:', key);
            break;
          }
        }
      }

      if (foundConception) {
        setConception(foundConception);
        setEditData(foundConception);
        
        // Get project info if we have the project ID from the conception
        const projId = projectId || (foundConception as any).projet;
        if (projId) {
          const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
          const foundProject = localStorageProjects.find((p: Projet) => p._id === projId);
          if (foundProject) {
            setProject(foundProject);
          }
        }
      } else {
        setError('Conception non trouvée');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(conception || {});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!conception) return;

      const updatedConception = {
        ...conception,
        ...editData,
        updatedAt: new Date().toISOString()
      };

      // Update in localStorage
      const conceptions = JSON.parse(localStorage.getItem(`conceptions:${id}`) || '[]');
      const updatedConceptions = conceptions.map((c: Conception) => 
        c._id === conceptionId ? updatedConception : c
      );
      localStorage.setItem(`conceptions:${id}`, JSON.stringify(updatedConceptions));

      setConception(updatedConception);
      setIsEditing(false);
      
      alert('Conception mise à jour avec succès !');
    } catch (err) {
      console.error('Error updating conception:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!conception) return;

    // Resolve IDs for both routing patterns
    const conceptionId = params.conceptionId ?? params.id; // '/projects/:id/conception/:conceptionId' or '/conceptions/:id'
    const projectId = (project && (project as any)._id)
      || (conception && (typeof (conception as any).projet === 'string' ? (conception as any).projet : (conception as any).projet?._id))
      || params.id
      || '';
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conception ?')) {
      setIsDeleting(true);
      // Optimistic hard redirect (synchronous) to avoid any refetch on deleted route
      // Redirect to projects list (safer, avoids 404 on missing project)
      window.location.replace('/projects');

      // Fire-and-forget API delete, with localStorage fallback
      (async () => {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`http://192.168.100.244:3000/api/conceptions/${conceptionId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!res.ok) throw new Error('Delete failed');
        } catch {
          // Fallback: remove from localStorage (both keys)
          if (projectId) {
            const projKey = `conceptions:${projectId}`;
            const projConceptions = JSON.parse(localStorage.getItem(projKey) || '[]');
            const updatedProj = projConceptions.filter((c: Conception) => c._id !== conceptionId);
            localStorage.setItem(projKey, JSON.stringify(updatedProj));
          }
          const globalList = JSON.parse(localStorage.getItem('conceptions') || '[]');
          const updatedGlobal = globalList.filter((c: Conception) => c._id !== conceptionId);
          localStorage.setItem('conceptions', JSON.stringify(updatedGlobal));
        }
      })();
    }
  };

  const handleDownload = () => {
    if (conception?.urlFichier) {
      const link = document.createElement('a');
      link.href = conception.urlFichier;
      link.download = conception.nomFichier;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-400">Chargement de la conception...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !conception) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-slate-400 mb-6">{error || 'Conception non trouvée'}</p>
          <Button onClick={() => navigate(-1)}>
            ← Retour
          </Button>
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
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour
          </button>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => {
              const projectId = (project && (project as any)._id)
                || (conception && (typeof (conception as any).projet === 'string' ? (conception as any).projet : (conception as any).projet?._id))
                || params.id
                || '';
              navigate(projectId ? `/projects/${projectId}` : '/projects');
            }}>
              🏠 Projet
            </Button>
            {isRSSI && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  ✏️ Modifier
                </Button>
                <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  🗑️ Supprimer
                </Button>
              </>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">🏗️ Détails de la conception</h1>
        <p className="text-slate-400">
          {project ? `Projet: ${project.nom}` : 'Conception de projet'}
        </p>
      </div>

      {/* Conception Details */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations de la conception</h2>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* File Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📄 Nom du fichier
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="nomFichier"
                  value={editData.nomFichier || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-white font-medium">{conception.nomFichier}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🏷️ Type de fichier
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="typeFichier"
                  value={editData.typeFichier || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-white font-medium">{conception.typeFichier}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📊 Statut
            </label>
            {isEditing ? (
              <select
                name="statut"
                value={editData.statut || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en attente">En attente</option>
                <option value="validée">Validée</option>
                <option value="à revoir">À revoir</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  conception.statut === 'validée' ? 'bg-green-100 text-green-800' :
                  conception.statut === 'à revoir' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {conception.statut}
                </span>
              </div>
            )}
          </div>

          {/* RSSI Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              💬 Commentaire RSSI
            </label>
            {isEditing ? (
              <textarea
                name="rssiCommentaire"
                value={editData.rssiCommentaire || ''}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ajoutez un commentaire..."
              />
            ) : (
              <p className="text-white">
                {conception.rssiCommentaire || 'Aucun commentaire'}
              </p>
            )}
          </div>

          {/* File Download */}
          {conception.urlFichier && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📁 Fichier
              </label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleDownload}>
                  📥 Télécharger le fichier
                </Button>
                <span className="text-sm text-gray-500">
                  {conception.nomFichier}
                </span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📅 Créé le
              </label>
              <p className="text-white">
                {new Date(conception.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔄 Modifié le
              </label>
              <p className="text-white">
                {new Date(conception.updatedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-900">
            <div className="flex items-center justify-end space-x-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSave}>
                💾 Sauvegarder
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptionDetail;