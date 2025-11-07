import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import type { PointFort, CreatePointFortData } from '../../types/audit';

const PointsForts: React.FC = () => {
  const { id: auditId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pointsForts, setPointsForts] = useState<PointFort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreatePointFortData>({
    nom: '',
    description: '',
    controleNormatif: '',
    impact: 'faible'
  });

  useEffect(() => {
    if (auditId) {
      fetchPointsForts();
    }
  }, [auditId]);

  const fetchPointsForts = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const data = await auditAPI.getPointsForts(auditId);
      
      // Mock data for now
      const mockPointsForts: PointFort[] = [
        {
          _id: '1',
          auditId: auditId!,
          nom: 'Gestion des accès centralisée',
          description: 'Système LDAP bien configuré avec authentification multi-facteurs',
          controleNormatif: 'ISO 27001 - A.9.2.1',
          impact: 'élevé',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          auditId: auditId!,
          nom: 'Politique de sauvegarde',
          description: 'Sauvegardes automatisées quotidiennes avec tests de restauration',
          controleNormatif: 'ISO 27001 - A.12.3.1',
          impact: 'moyen',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      setPointsForts(mockPointsForts);
    } catch (error: any) {
      setError('Erreur lors du chargement des points forts');
      console.error('Error fetching points forts:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.description || !formData.controleNormatif) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const newPointFort = await auditAPI.createPointFort(auditId!, formData);
      
      // Mock success for now
      const newPointFort: PointFort = {
        _id: Date.now().toString(),
        auditId: auditId!,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setPointsForts(prev => [newPointFort, ...prev]);
      setFormData({
        nom: '',
        description: '',
        controleNormatif: '',
        impact: 'faible'
      });
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    }
  };

  const getImpactBadge = (impact: string) => {
    const impactConfig = {
      'faible': { bg: 'bg-green-100', text: 'text-green-800', label: 'Faible' },
      'moyen': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyen' },
      'élevé': { bg: 'bg-red-100', text: 'text-red-800', label: 'Élevé' }
    };

    const config = impactConfig[impact as keyof typeof impactConfig] || impactConfig.faible;
    
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
            + Ajouter un point fort
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Points Forts de l'Audit</h1>
        <p className="text-slate-400">
          Identifiez et documentez les points forts de votre audit de sécurité
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Point Fort Form */}
      {showForm && (
        <div className="mb-8 bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Ajouter un point fort</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-slate-400"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="nom"
                name="nom"
                type="text"
                label="Nom du point fort"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Gestion des accès centralisée"
                required
                icon="✅"
              />

              <Select
                id="impact"
                name="impact"
                label="Impact"
                value={formData.impact}
                onChange={handleChange}
                required
                icon="📊"
                options={[
                  { value: 'faible', label: 'Faible' },
                  { value: 'moyen', label: 'Moyen' },
                  { value: 'élevé', label: 'Élevé' }
                ]}
              />
            </div>

            <Input
              id="controleNormatif"
              name="controleNormatif"
              type="text"
              label="Contrôle normatif associé"
              value={formData.controleNormatif}
              onChange={handleChange}
              placeholder="Ex: ISO 27001 - A.9.2.1"
              required
              icon="📋"
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description détaillée
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez en détail ce point fort et son implémentation..."
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

      {/* Points Forts List */}
      {pointsForts.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-green-600 text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun point fort identifié</h3>
          <p className="text-gray-500 mb-4">
            Commencez par identifier les points forts de votre audit de sécurité
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Ajouter le premier point fort
          </Button>
        </div>
      ) : (
        <div className="bg-slate-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-white">
              Points Forts ({pointsForts.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pointsForts.map((pointFort) => (
              <div key={pointFort._id} className="px-6 py-4 hover:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{pointFort.nom}</h3>
                      {getImpactBadge(pointFort.impact)}
                    </div>
                    <p className="text-slate-400 mb-3">{pointFort.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">📋</span>
                        {pointFort.controleNormatif}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {new Date(pointFort.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 À propos des points forts :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Les points forts identifient les bonnes pratiques déjà en place</li>
          <li>• Ils doivent être liés aux contrôles de sécurité normatifs (ISO 27001, NIST, etc.)</li>
          <li>• L'impact permet d'évaluer l'importance de chaque point fort</li>
          <li>• Documentez-les avec des preuves et exemples concrets</li>
        </ul>
      </div>
    </div>
  );
};

export default PointsForts;
