import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { auditAPI } from '../../api/api';
import type { Constat, CreateConstatData } from '../../types/audit';

const Constats: React.FC = () => {
  const { id: auditId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [constats, setConstats] = useState<Constat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateConstatData>({
    description: '',
    type: 'NC maj',
    criticite: '',
    impact: '',
    probabilite: '',
    audit: auditId || '',
    projet: '',
    recommandations: []
  });

  const storageKey = `constats:${auditId}`;

  useEffect(() => {
    if (auditId) {
      fetchConstats();
      setFormData(prev => ({ ...prev, audit: auditId }));
    }
  }, [auditId]);

  const fetchConstats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Fetching constats for audit:', auditId);
      console.log('🔑 Storage key:', storageKey);
      
      const localConstats: Constat[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      console.log('📦 Local constats for this audit:', localConstats.length);
      
      // Check if there are any constats in the global constats storage that might be interfering
      const globalConstats = JSON.parse(localStorage.getItem('constats') || '[]');
      console.log('🌍 Global constats (should not be used here):', globalConstats.length);
      
      // Double-check that we're only using audit-specific constats
      const auditSpecificConstats = localConstats.filter(c => c.audit === auditId);
      console.log('🎯 Audit-specific constats:', auditSpecificConstats.length);

      // Try to fetch from real API first
      try {
        const apiConstats = await auditAPI.getConstats(auditId!);
        console.log('🌐 API constats:', apiConstats.length);
        // Merge with local stored constats (avoid duplicates by _id)
        const merged = [
          ...apiConstats,
          ...auditSpecificConstats.filter(lc => !apiConstats.some(ac => ac._id === lc._id))
        ];
        console.log('✅ Merged constats:', merged.length);
        setConstats(merged);
      } catch (apiError) {
        console.log('API not available, using localStorage data only');
        
        // Only use localStorage data, no mock data
        console.log('📋 Setting constats to audit-specific data only:', auditSpecificConstats.length);
        setConstats(auditSpecificConstats);
      }
    } catch (error: any) {
      setError('Erreur lors du chargement des constats');
      console.error('Error fetching constats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (constatId: string) => {
    try {
      // Try backend delete
      try {
        await auditAPI.deleteConstat(constatId);
      } catch (apiErr) {
        console.log('API delete failed or unavailable, removing locally');
      }
      // Update UI and localStorage
      setConstats(prev => prev.filter(c => c._id !== constatId));
      const existing: Constat[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify(existing.filter(c => c._id !== constatId)));
    } catch (e) {
      console.error('Delete constat error:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.type || !formData.criticite || !formData.impact || !formData.probabilite) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setError('');
      
      // Try to create constat via API first
      try {
        const newConstat = await auditAPI.createConstat(formData);
        console.log('✅ Constat created via API:', newConstat);
        setConstats(prev => [newConstat, ...prev]);
        // Persist to localStorage
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([newConstat, ...existing]));
      } catch (apiError) {
        console.log('API not available, using mock data');
        
        // Fallback to mock creation if API is not available
        const newConstat: Constat = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setConstats(prev => [newConstat, ...prev]);
        // Persist to localStorage
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([newConstat, ...existing]));
      }
      
      // Reset form
      setFormData({
        description: '',
        type: 'NC maj',
        criticite: '',
        impact: '',
        probabilite: '',
        audit: auditId || '',
        projet: '',
        recommandations: []
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'NC maj': { bg: 'bg-red-100', text: 'text-red-800', label: 'NC Majeur' },
      'NC min': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'NC Mineur' },
      'PS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Point de Satisfaction' },
      'PP': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Point Positif' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['NC maj'];
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      'Faible': { bg: 'bg-green-100', text: 'text-green-800', label: 'Faible' },
      'Moyen': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyen' },
      'Élevé': { bg: 'bg-red-100', text: 'text-red-800', label: 'Élevé' },
      'Moyenne': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyenne' },
      'Élevée': { bg: 'bg-red-100', text: 'text-red-800', label: 'Élevée' }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.Faible;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/audits/${auditId}`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour à l'audit
          </button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Ajouter un constat
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Constats de l'Audit</h1>
        <p className="text-slate-400">
          Documentez vos constats et recommandations selon les normes de sécurité
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Constat Form */}
      {showForm && (
        <div className="mb-8 bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Ajouter un constat</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-slate-400"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="type"
                name="type"
                label="Type de constat"
                value={formData.type}
                onChange={handleChange}
                required
                icon="🔍"
                options={[
                  { value: 'NC maj', label: 'Non-Conformité Majeure' },
                  { value: 'NC min', label: 'Non-Conformité Mineure' },
                  { value: 'PS', label: 'Point de Satisfaction' },
                  { value: 'PP', label: 'Point Positif' }
                ]}
              />

              <Select
                id="criticite"
                name="criticite"
                label="Criticité"
                value={formData.criticite}
                onChange={handleChange}
                required
                icon="⚠️"
                options={[
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyenne', label: 'Moyenne' },
                  { value: 'Élevée', label: 'Élevée' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="impact"
                name="impact"
                label="Impact"
                value={formData.impact}
                onChange={handleChange}
                required
                icon="💥"
                options={[
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyen', label: 'Moyen' },
                  { value: 'Élevé', label: 'Élevé' }
                ]}
              />

              <Select
                id="probabilite"
                name="probabilite"
                label="Probabilité"
                value={formData.probabilite}
                onChange={handleChange}
                required
                icon="🎲"
                options={[
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyenne', label: 'Moyenne' },
                  { value: 'Élevée', label: 'Élevée' }
                ]}
              />
            </div>

            <Input
              id="projet"
              name="projet"
              type="text"
              label="Projet associé (optionnel)"
              value={formData.projet}
              onChange={handleChange}
              placeholder="ID du projet si applicable"
              icon="📋"
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description du constat
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez en détail le constat identifié..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Ajouter
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Constats List */}
      {constats.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-orange-600 text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun constat identifié</h3>
          <p className="text-gray-500 mb-4">
            Commencez par documenter les constats de votre audit de sécurité
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Ajouter le premier constat
          </Button>
        </div>
      ) : (
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">
              Constats ({constats.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {constats.map((constat) => (
              <div key={constat._id} className="px-6 py-4 hover:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeBadge(constat.type)}
                      <h3 className="text-lg font-medium text-white">
                        {constat.description.length > 60 
                          ? `${constat.description.substring(0, 60)}...`
                          : constat.description
                        }
                      </h3>
                    </div>
                    
                    <p className="text-slate-400 mb-3">{constat.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Criticité:</span>
                        <div className="mt-1">{getLevelBadge(constat.criticite)}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Impact:</span>
                        <div className="mt-1">{getLevelBadge(constat.impact)}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Probabilité:</span>
                        <div className="mt-1">{getLevelBadge(constat.probabilite)}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Recommandations:</span>
                        <div className="mt-1 text-slate-400">
                          {constat.recommandations.length} recommandation(s)
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {new Date(constat.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {constat.projet && (
                        <span className="flex items-center">
                          <span className="mr-1">📋</span>
                          Projet: {constat.projet}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(constat._id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Types de constats selon les normes :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>NC Majeur :</strong> Non-conformité critique nécessitant une action immédiate</li>
          <li>• <strong>NC Mineur :</strong> Non-conformité importante mais non critique</li>
          <li>• <strong>PS :</strong> Point de satisfaction - bonnes pratiques observées</li>
          <li>• <strong>PP :</strong> Point positif - excellence dans l'implémentation</li>
          <li>• Chaque constat doit être associé aux contrôles normatifs appropriés</li>
        </ul>
      </div>
    </div>
  );
};

export default Constats;
