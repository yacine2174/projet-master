import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import type { Risque, Projet } from '../../types/audit';

const RiskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [risk, setRisk] = useState<Risque | null>(null);
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

      // Fetch risk data from backend API
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/risques/${id}`, {
          headers
        });
        
        if (response.ok) {
          const risqueData = await response.json();
          setRisk(risqueData);
          
          // Fetch related project
          if (risqueData.projet) {
            // Extract project ID (handle both string and object formats)
            const projectId = typeof risqueData.projet === 'object' 
              ? risqueData.projet._id || risqueData.projet 
              : risqueData.projet;
            
            console.log('📂 Fetching project with ID:', projectId);
            
            const projectResponse = await fetch(`http://192.168.100.244:3000/api/projets/${projectId}`, {
              headers
            });
            if (projectResponse.ok) {
              const projectData = await projectResponse.json();
              setProject(projectData);
              console.log('✅ Project data loaded:', projectData);
            } else {
              console.error('❌ Failed to load project:', projectResponse.status);
            }
          }
          
          console.log('✅ Risk data loaded from API:', risqueData);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage fallback');
      }

      // Fallback to localStorage
      const storedRisques = JSON.parse(localStorage.getItem('risques') || '[]') as Risque[];
      const foundRisk = storedRisques.find(r => r._id === id);

      if (!foundRisk) {
        setError('Risque non trouvé');
        setIsLoading(false);
        return;
      }

      setRisk(foundRisk);
      
      // Load project from localStorage
      if (foundRisk.projet) {
        const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const foundProject = storedProjects.find((p: any) => p._id === foundRisk.projet);
        setProject(foundProject || null);
      }
      
      console.log('✅ Risk data loaded from localStorage:', foundRisk);
    } catch (error: any) {
      setError('Erreur lors du chargement des données');
      console.error('Error fetching risk data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce risque ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // Try to delete from backend API first
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/risques/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Risque supprimé avec succès !');
          window.location.href = project ? `/projets/${project._id}` : '/projects';
          return;
        }
      } catch (error) {
        console.log('Backend API not available, using localStorage');
      }
      
      // Fallback: Remove from localStorage
      const storedRisques = JSON.parse(localStorage.getItem('risques') || '[]');
      const filteredRisks = storedRisques.filter((r: Risque) => r._id !== id);
      localStorage.setItem('risques', JSON.stringify(filteredRisks));
      
      console.log('✅ Risk deleted from localStorage');
      alert('Risque supprimé avec succès !');
      window.location.href = project ? `/projets/${project._id}` : '/projects';
    } catch (error: any) {
      console.error('Error deleting risk:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getRiskBadge = (niveau: string) => {
    const config = {
      'Critique': { bg: 'bg-red-100', text: 'text-red-800', label: 'Critique' },
      'Élevé': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Élevé' },
      'Moyen': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyen' },
      'Faible': { bg: 'bg-green-100', text: 'text-green-800', label: 'Faible' }
    };

    const riskConfig = config[niveau as keyof typeof config] || config['Moyen'];
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${riskConfig.bg} ${riskConfig.text}`}>
        {riskConfig.label}
      </span>
    );
  };

  const getStatusBadge = (statut: string) => {
    const config = {
      'En cours': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      'Planifié': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Planifié' },
      'Terminé': { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminé' },
      'En attente': { bg: 'bg-slate-800', text: 'text-slate-200', label: 'En attente' }
    };

    const statusConfig = config[statut as keyof typeof config] || config['Planifié'];
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getDecisionBadge = (decision: string) => {
    const config = {
      'À traiter': { bg: 'bg-red-100', text: 'text-red-800', label: 'À traiter' },
      'À accepter': { bg: 'bg-green-100', text: 'text-green-800', label: 'À accepter' },
      'À transférer': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'À transférer' },
      'À évaluer': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'À évaluer' }
    };

    const decisionConfig = config[decision as keyof typeof config] || config['À évaluer'];
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${decisionConfig.bg} ${decisionConfig.text}`}>
        {decisionConfig.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !risk) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Erreur</h3>
        <p className="text-gray-500 mb-4">{error || 'Risque non trouvé'}</p>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Retour
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
            {project && (
              <Button variant="outline" onClick={() => navigate(`/projects/${project._id}`)}>
                🏠 Projet
              </Button>
            )}
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          ⚠️ Risque: {risk.nom || risk.type || 'Sans titre'}
        </h1>
        {project && (
          <p className="text-slate-400">
            Risque identifié pour le projet: <strong>{project.nom}</strong>
          </p>
        )}
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
          <span>📅 Créé le {new Date(risk.createdAt).toLocaleDateString('fr-FR')}</span>
          <span>🔄 Modifié le {new Date(risk.updatedAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Level */}
        <div className="bg-slate-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Niveau de risque</h3>
          <div className="text-center">
            {getRiskBadge(risk.niveauRisque || risk.niveau)}
            <div className="mt-2 text-sm text-slate-400">
              Impact: {risk.impact} × Probabilité: {risk.probabilite}
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="bg-slate-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Priorité</h3>
          <div className="text-center">
            {getStatusBadge(risk.priorite)}
          </div>
        </div>

        {/* Decision */}
        <div className="bg-slate-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Décision</h3>
          <div className="text-center">
            {getDecisionBadge(risk.decision)}
          </div>
        </div>
      </div>

      {/* Risk Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk Information */}
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">Informations du risque</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
              <p className="text-white">{risk.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-white">{risk.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Niveau de risque</h3>
              <p className="text-white">{risk.niveauRisque || risk.niveau}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Priorité</h3>
              <p className="text-white">{risk.priorite}</p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">Évaluation</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Impact</h3>
              <p className="text-white">{risk.impact}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Probabilité</h3>
              <p className="text-white">{risk.probabilite}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Décision</h3>
              <p className="text-white">{risk.decision}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Créé le</h3>
              <p className="text-white">{new Date(risk.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Matrix Visualization */}
      <div className="bg-slate-800 shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">📊 Matrice de risque</h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="text-sm font-medium text-slate-400">Probabilité</div>
              <div className="text-lg font-bold text-white">{risk.probabilite}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="text-sm font-medium text-slate-400">Impact</div>
              <div className="text-lg font-bold text-white">{risk.impact}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="text-sm font-medium text-slate-400">Niveau</div>
              <div className="text-lg font-bold text-white">{risk.niveauRisque || risk.niveau}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="text-sm font-medium text-slate-400">Décision</div>
              <div className="text-lg font-bold text-white">{risk.decision}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Gestion des risques :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Surveillance :</strong> Suivez l'évolution du risque et des mesures mises en place</li>
          <li>• <strong>Réévaluation :</strong> Revisitez régulièrement l'évaluation du risque</li>
          <li>• <strong>Communication :</strong> Informez les parties prenantes des décisions prises</li>
          <li>• <strong>Documentation :</strong> Conservez les preuves et traces des actions entreprises</li>
        </ul>
      </div>
    </div>
  );
};

export default RiskDetail;
