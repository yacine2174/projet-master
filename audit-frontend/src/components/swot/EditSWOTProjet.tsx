import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';

const EditSWOTProjet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const swotId = searchParams.get('swot');
  const projetId = searchParams.get('projet');
  
  const [formData, setFormData] = useState({
    forces: [''],
    faiblesses: [''],
    opportunites: [''],
    menaces: ['']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Ensure any incoming value becomes a string array usable by .map()
  const normalizeList = (v: any): string[] => {
    if (Array.isArray(v)) return v.map((x) => (x == null ? '' : String(x)));
    if (typeof v === 'string') return [v];
    if (v == null) return [''];
    try { return [String(v)]; } catch { return ['']; }
  };

  useEffect(() => {
    if (swotId) {
      loadSWOT();
    }
  }, [swotId]);

  const loadSWOT = async () => {
    setError('');
    try {
      // Try backend first
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(`http://192.168.100.244:3000/api/swots/${swotId}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const swot = await res.json();
          setFormData({
            forces: normalizeList(swot.forces),
            faiblesses: normalizeList(swot.faiblesses),
            opportunites: normalizeList(swot.opportunites),
            menaces: normalizeList(swot.menaces)
          });
          return;
        }

        // If not found by ID, try by projet (some flows have 1 SWOT per projet)
        if (projetId) {
          const resByProjet = await fetch(`http://192.168.100.244:3000/api/swots/projet/${projetId}`, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (resByProjet.ok) {
            const list = await resByProjet.json();
            const first = Array.isArray(list) ? list[0] : null;
            if (first) {
              setFormData({
                forces: normalizeList(first.forces),
                faiblesses: normalizeList(first.faiblesses),
                opportunites: normalizeList(first.opportunites),
                menaces: normalizeList(first.menaces)
              });
              return;
            }
          }
        }
      } catch (apiErr) {
        console.log('SWOT API not available, using localStorage');
      }

      // Fallback: localStorage (two possible keys)
      const lsGlobal = JSON.parse(localStorage.getItem('swots') || '[]');
      const lsProject = JSON.parse(localStorage.getItem(`swots:${projetId}`) || '[]');
      const all = [...lsGlobal, ...lsProject];
      const swotLS = all.find((s: any) => s && (s._id === swotId || s.id === swotId));

      if (swotLS) {
        setFormData({
          forces: normalizeList(swotLS.forces),
          faiblesses: normalizeList(swotLS.faiblesses),
          opportunites: normalizeList(swotLS.opportunites),
          menaces: normalizeList(swotLS.menaces)
        });
      } else {
        // Try to pick by projet match when multiple entries exist
        const byProject = all.find((s: any) => s && (s.projet === projetId || s.projet?._id === projetId));
        if (byProject) {
          setFormData({
            forces: normalizeList(byProject.forces),
            faiblesses: normalizeList(byProject.faiblesses),
            opportunites: normalizeList(byProject.opportunites),
            menaces: normalizeList(byProject.menaces)
          });
          return;
        }
        // If there's only one SWOT for this project in localStorage, use it
        if (lsProject.length === 1) {
          const only = lsProject[0];
          setFormData({
            forces: normalizeList(only && only.forces),
            faiblesses: normalizeList(only && only.faiblesses),
            opportunites: normalizeList(only && only.opportunites),
            menaces: normalizeList(only && only.menaces)
          });
          return;
        }
        setError('SWOT non trouvé');
      }
    } catch (err) {
      console.error('Error loading SWOT:', err);
      setError('Erreur lors du chargement');
    }
  };

  const handleArrayChange = (field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Filter out empty items
      const filteredData = {
        forces: formData.forces.filter(f => f.trim()),
        faiblesses: formData.faiblesses.filter(f => f.trim()),
        opportunites: formData.opportunites.filter(f => f.trim()),
        menaces: formData.menaces.filter(f => f.trim())
      };

      // Try to update via API first
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`http://192.168.100.244:3000/api/swots/${swotId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(filteredData)
        });

        if (response.ok) {
          // Sync local caches for immediate UI reflection
          const storedSWOTs = JSON.parse(localStorage.getItem('swots') || '[]');
          const updatedSWOTs = storedSWOTs.map((s: any) => (s._id === swotId ? { ...s, ...filteredData, updatedAt: new Date().toISOString() } : s));
          localStorage.setItem('swots', JSON.stringify(updatedSWOTs));
          if (projetId) {
            const projKey = `swots:${projetId}`;
            const projList = JSON.parse(localStorage.getItem(projKey) || '[]');
            const updatedProj = projList.map((s: any) => (s._id === swotId ? { ...s, ...filteredData, updatedAt: new Date().toISOString() } : s));
            localStorage.setItem(projKey, JSON.stringify(updatedProj));
          }
          alert('Analyse SWOT modifiée avec succès !');
          window.location.href = `/swot/${swotId}`;
          return;
        }
      } catch (apiError) {
        console.log('API update failed, using localStorage fallback');
      }

      // Fallback: Update in localStorage
      const storedSWOTs = JSON.parse(localStorage.getItem('swots') || '[]');
      const updatedSWOTs = storedSWOTs.map((s: any) => {
        if (s._id === swotId) {
          return {
            ...s,
            ...filteredData,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      
      localStorage.setItem('swots', JSON.stringify(updatedSWOTs));
      if (projetId) {
        const projKey = `swots:${projetId}`;
        const projList = JSON.parse(localStorage.getItem(projKey) || '[]');
        const updatedProj = projList.map((s: any) => (s._id === swotId ? { ...s, ...filteredData, updatedAt: new Date().toISOString() } : s));
        localStorage.setItem(projKey, JSON.stringify(updatedProj));
      }
      
      alert('Analyse SWOT modifiée avec succès !');
      window.location.href = `/swot/${swotId}`;
    } catch (error: any) {
      setError('Erreur lors de la modification');
      console.error('Error updating SWOT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderArrayField = (
    field: 'forces' | 'faiblesses' | 'opportunites' | 'menaces',
    label: string,
    icon: string,
    color: string
  ) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <span className="mr-2">{icon}</span>
        {label}
      </h3>
      <div className="space-y-3">
        {formData[field].map((item, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={`${label} ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeArrayItem(field, index)}
              className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(field)}
          className={`w-full px-3 py-2 border-2 border-dashed ${color} rounded-md text-sm hover:bg-slate-700 transition-colors`}
        >
          + Ajouter
        </button>
      </div>
    </div>
  );

  if (error && !formData.forces.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Erreur</h2>
        <p className="text-gray-400 mb-4">{error}</p>
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
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">✏️ Modifier l'Analyse SWOT</h1>
        <p className="text-gray-400">Modifiez uniquement les items des quatre catégories : Forces, Faiblesses, Opportunités, Menaces</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SWOT Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Internal Factors */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
              Facteurs Internes
            </h2>
            {renderArrayField('forces', 'Forces', '💪', 'border-green-500')}
            {renderArrayField('faiblesses', 'Faiblesses', '⚠️', 'border-red-500')}
          </div>

          {/* External Factors */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
              Facteurs Externes
            </h2>
            {renderArrayField('opportunites', 'Opportunités', '🚀', 'border-blue-500')}
            {renderArrayField('menaces', 'Menaces', '⚡', 'border-orange-500')}
          </div>
        </div>

        

        {/* Submit Buttons */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Modification en cours...' : '💾 Enregistrer les modifications'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSWOTProjet;
