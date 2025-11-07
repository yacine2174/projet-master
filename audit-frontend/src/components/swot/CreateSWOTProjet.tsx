import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import { SWOT } from '../../types/audit';

const CreateSWOTProjet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet');
  
  const [formData, setFormData] = useState({
    forces: [''],
    faiblesses: [''],
    opportunites: [''],
    menaces: ['']
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [projet, setProjet] = useState<any>(null);

  useEffect(() => {
    console.log('🔍 CreateSWOTProjet - projetId from URL:', projetId);
    console.log('🔍 Is valid MongoDB ObjectId?', /^[a-f\d]{24}$/i.test(projetId || ''));
    if (projetId) {
      loadProjet();
    } else {
      setError('ID du projet manquant');
    }
  }, [projetId]);

  const loadProjet = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://192.168.100.244:3000/api/projets/${projetId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Projet non trouvé');
      const data = await res.json();
      setProjet(data);
    } catch (error) {
      console.error('Error loading projet:', error);
      setError('Erreur lors du chargement du projet');
    }
  };

  const handleArrayChange = (
    field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces',
    index: number,
    value: string
  ) => {
    const list = [...formData[field]];
    list[index] = value;
    setFormData({ ...formData, [field]: list });
  };

  const addArrayItem = (field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces', index: number) => {
    const list = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: list.length ? list : [''] });
  };

  const validateForm = () => {
    const hasAny = (arr: string[]) => arr.some(v => v && v.trim());
    if (!hasAny(formData.forces)) { setError('Au moins une Force est requise'); return false; }
    if (!hasAny(formData.faiblesses)) { setError('Au moins une Faiblesse est requise'); return false; }
    if (!hasAny(formData.opportunites)) { setError('Au moins une Opportunité est requise'); return false; }
    if (!hasAny(formData.menaces)) { setError('Au moins une Menace est requise'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const filtered = {
        forces: formData.forces.map(s => s.trim()).filter(Boolean),
        faiblesses: formData.faiblesses.map(s => s.trim()).filter(Boolean),
        opportunites: formData.opportunites.map(s => s.trim()).filter(Boolean),
        menaces: formData.menaces.map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch('http://192.168.100.244:3000/api/swots', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...filtered, projet: projetId })
      });
      if (!res.ok) throw new Error('Erreur API');
      const createdSWOT = await res.json();
      console.log('✅ SWOT created:', createdSWOT);
      alert('Analyse SWOT créée avec succès !');
      // Navigate back to project detail page to see the newly created SWOT
      window.location.href = `/projets/${projetId}`;
    } catch (error: any) {
      setError('Erreur lors de la création de l\'analyse SWOT');
      console.error('Error creating SWOT:', error);
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
        <h1 className="text-3xl font-bold text-white">Créer une analyse SWOT</h1>
        <p className="text-slate-400 mt-2">
          Analyse SWOT pour le projet: <strong>{projet?.nom}</strong>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Forces */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Forces <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.forces.map((item, index) => (
                <div key={`forces-${index}`} className="flex space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('forces', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-600 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Force ${index + 1}`}
                  />
                  <button type="button" onClick={() => removeArrayItem('forces', index)} className="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('forces')} className="w-full px-3 py-2 border-2 border-dashed border-slate-600 rounded-md text-sm hover:bg-slate-800">+ Ajouter</button>
            </div>
          </div>

          {/* Opportunités */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Opportunités <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.opportunites.map((item, index) => (
                <div key={`opportunites-${index}`} className="flex space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('opportunites', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-600 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Opportunité ${index + 1}`}
                  />
                  <button type="button" onClick={() => removeArrayItem('opportunites', index)} className="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('opportunites')} className="w-full px-3 py-2 border-2 border-dashed border-slate-600 rounded-md text-sm hover:bg-slate-800">+ Ajouter</button>
            </div>
          </div>

          {/* Faiblesses */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Faiblesses <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.faiblesses.map((item, index) => (
                <div key={`faiblesses-${index}`} className="flex space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('faiblesses', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-600 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Faiblesse ${index + 1}`}
                  />
                  <button type="button" onClick={() => removeArrayItem('faiblesses', index)} className="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('faiblesses')} className="w-full px-3 py-2 border-2 border-dashed border-slate-600 rounded-md text-sm hover:bg-slate-800">+ Ajouter</button>
            </div>
          </div>

          {/* Menaces */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Menaces <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.menaces.map((item, index) => (
                <div key={`menaces-${index}`} className="flex space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('menaces', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-600 rounded-md bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Menace ${index + 1}`}
                  />
                  <button type="button" onClick={() => removeArrayItem('menaces', index)} className="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('menaces')} className="w-full px-3 py-2 border-2 border-dashed border-slate-600 rounded-md text-sm hover:bg-slate-800">+ Ajouter</button>
            </div>
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
            {isLoading ? 'Création...' : 'Créer l\'analyse SWOT'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSWOTProjet;
