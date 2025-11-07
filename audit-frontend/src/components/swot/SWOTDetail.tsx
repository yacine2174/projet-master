import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import type { SWOT, Projet } from '../../types/audit';

const SWOTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [swot, setSwot] = useState<SWOT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Fetch SWOT data from backend API
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/swots/${id}`, {
          headers
        });
        
        if (response.ok) {
          const swotData = await response.json();
          setSwot(swotData);
          
          // Fetch related project
          if (swotData.projet) {
            const projectId = typeof swotData.projet === 'object' 
              ? swotData.projet._id || swotData.projet 
              : swotData.projet;
            
            const projectResponse = await fetch(`http://192.168.100.244:3000/api/projets/${projectId}`, {
              headers
            });
            if (projectResponse.ok) {
              const projectData = await projectResponse.json();
              setProject(projectData);
            }
          }
          
          console.log('✅ SWOT data loaded from API:', swotData);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage fallback');
      }

      // Fallback to localStorage
      const storedSWOTs = JSON.parse(localStorage.getItem('swots') || '[]') as SWOT[];
      const foundSWOT = storedSWOTs.find(s => s._id === id);

      if (!foundSWOT) {
        setError('Analyse SWOT non trouvée');
        setIsLoading(false);
        return;
      }

      setSwot(foundSWOT);
      
      // Load project from localStorage
      if (foundSWOT.projet) {
        const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const foundProject = storedProjects.find((p: any) => p._id === foundSWOT.projet);
        setProject(foundProject || null);
      }
      
      console.log('✅ SWOT data loaded from localStorage:', foundSWOT);
    } catch (error: any) {
      setError('Erreur lors du chargement des données');
      console.error('Error fetching SWOT data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse SWOT ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // Try to delete from backend API first
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/swots/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Analyse SWOT supprimée avec succès !');
          window.location.href = project ? `/projets/${project._id}` : '/projects';
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage');
      }
      
      // Fallback: Remove from localStorage
      const storedSWOTs = JSON.parse(localStorage.getItem('swots') || '[]');
      const filteredSWOTs = storedSWOTs.filter((s: SWOT) => s._id !== id);
      localStorage.setItem('swots', JSON.stringify(filteredSWOTs));
      
      console.log('✅ SWOT deleted from localStorage');
      alert('Analyse SWOT supprimée avec succès !');
      window.location.href = project ? `/projets/${project._id}` : '/projects';
    } catch (error: any) {
      console.error('Error deleting SWOT:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !swot) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
        <p className="text-gray-500 mb-4">{error || 'Analyse SWOT non trouvée'}</p>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    );
  }

  const renderSWOTSection = (
    title: string,
    content: string | string[],
    icon: string,
    bgColor: string,
    textColor: string,
    borderColor: string
  ) => (
    <div className={`${bgColor} rounded-lg p-6 border-2 ${borderColor}`}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
      </div>

      {Array.isArray(content) ? (
        content.length ? (
          <ul className={`list-disc pl-5 space-y-1 ${textColor}`}>
            {content.map((item, idx) => (
              <li key={idx} className="text-sm">{item}</li>
            ))}
          </ul>
        ) : (
          <p className={`${textColor} text-sm italic`}>Aucun élément renseigné</p>
        )
      ) : content && content.trim() ? (
        <div className={`${textColor} text-sm whitespace-pre-wrap`}>
          {content}
        </div>
      ) : (
        <p className={`${textColor} text-sm italic`}>Aucun élément renseigné</p>
      )}
    </div>
  );

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
            <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
              🏠 Projet
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate(`/swot/projet/edit?swot=${id}&projet=${project?._id}`)}
            >
              ✏️ Modifier
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">📊 Analyse SWOT</h1>
        {project && (
          <p className="text-slate-400">
            Analyse SWOT pour le projet: <strong>{project.nom}</strong>
          </p>
        )}
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
          <span>📅 Créée le {new Date(swot.createdAt).toLocaleDateString('fr-FR')}</span>
          <span>🔄 Modifiée le {new Date(swot.updatedAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* SWOT Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Internal Factors */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            Facteurs Internes
          </h2>
          
          {renderSWOTSection(
            'Forces',
            swot.forces,
            '💪',
            'bg-green-50',
            'text-green-800',
            'border-green-200'
          )}
          
          {renderSWOTSection(
            'Faiblesses',
            swot.faiblesses,
            '⚠️',
            'bg-red-50',
            'text-red-800',
            'border-red-200'
          )}
        </div>

        {/* External Factors */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            Facteurs Externes
          </h2>
          
          {renderSWOTSection(
            'Opportunités',
            swot.opportunites,
            '🚀',
            'bg-blue-50',
            'text-blue-800',
            'border-blue-200'
          )}
          
          {renderSWOTSection(
            'Menaces',
            swot.menaces,
            '⚡',
            'bg-orange-50',
            'text-orange-800',
            'border-orange-200'
          )}
        </div>
      </div>

      {/* Recommendations */}
      {swot.recommandations && (
        <div className="bg-slate-800 shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white flex items-center">
              💡 Recommandations
            </h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-slate-300 leading-relaxed">{swot.recommandations}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default SWOTDetail;
