import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import { Risque } from '../../types/audit';

const CreateRisqueProjet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet');
  
  const [formData, setFormData] = useState({
    description: '',
    type: 'Risque Technique',
    priorite: 'Faible',
    niveauRisque: 'Faible',
    impact: 'Faible',
    probabilite: 'Faible',
    decision: 'Réduire'
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

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('La description du risque est requise');
      return false;
    }
    if (formData.description.trim().length < 10) {
      setError('La description doit contenir au moins 10 caractères');
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
      const dataToSend = { ...formData, projet: projetId };
      console.log('📤 Sending Risque data:', dataToSend);
      
      const res = await fetch('http://192.168.100.244:3000/api/risques', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ API Error:', errorData);
        throw new Error(JSON.stringify(errorData));
      }
      const createdRisque = await res.json();
      console.log('✅ Risque created:', createdRisque);
      alert('Analyse des risques créée avec succès !');
      // Navigate back to project detail page
      window.location.href = `/projets/${projetId}`;
    } catch (error: any) {
      setError('Erreur lors de la création de l\'analyse des risques');
      console.error('Error creating risque:', error);
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
        <h1 className="text-3xl font-bold text-white">Créer une analyse des risques</h1>
        <p className="text-slate-400 mt-2">
          Analyse des risques pour le projet: <strong>{projet?.nom}</strong>
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
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez le risque en détail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Probabilité */}
            <div>
              <label htmlFor="probabilite" className="block text-sm font-medium text-slate-300 mb-2">
                Probabilité
              </label>
              <select
                id="probabilite"
                name="probabilite"
                value={formData.probabilite}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Élevée">Élevée</option>
              </select>
            </div>

            {/* Impact */}
            <div>
              <label htmlFor="impact" className="block text-sm font-medium text-slate-300 mb-2">
                Impact
              </label>
              <select
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Faible">Faible</option>
                <option value="Moyen">Moyen</option>
                <option value="Élevé">Élevé</option>
              </select>
            </div>

            {/* Niveau de risque */}
            <div>
              <label htmlFor="niveauRisque" className="block text-sm font-medium text-slate-300 mb-2">
                Niveau de risque
              </label>
              <select
                id="niveauRisque"
                name="niveauRisque"
                value={formData.niveauRisque}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Faible">Faible</option>
                <option value="Moyen">Moyen</option>
                <option value="Élevé">Élevé</option>
              </select>
            </div>
          </div>

          {/* Decision */}
          <div>
            <label htmlFor="decision" className="block text-sm font-medium text-slate-300 mb-2">
              Décision
            </label>
            <select
              id="decision"
              name="decision"
              value={formData.decision}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Accepter">Accepter</option>
              <option value="Réduire">Réduire</option>
              <option value="Transférer">Transférer</option>
              <option value="Empêcher">Empêcher</option>
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
            {isLoading ? 'Création...' : 'Créer l\'analyse des risques'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRisqueProjet;
