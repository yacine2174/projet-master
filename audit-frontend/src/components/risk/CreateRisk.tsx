import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import type { CreateRisqueData, Projet } from '../../types/audit';

const CreateRisk: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Projet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateRisqueData>({
    projet: id || '',
    actifCible: '',
    menace: '',
    vulnerabilite: '',
    impact: 'Moyen',
    probabilite: 'Moyenne',
    niveau: 'Moyen',
    decision: 'À évaluer',
    description: '',
    preuves: [''],
    mesures: [''],
    responsable: '',
    echeance: '',
    statut: 'Planifié'
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      // Get project data from localStorage
      const localStorageProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const defaultProjects: Projet[] = [
        {
          _id: '1',
          nom: 'Sécurisation de l\'infrastructure réseau',
          perimetre: 'Infrastructure réseau et équipements',
          budget: 50000,
          priorite: 'Élevée',
          dateDebut: '2024-01-01',
          dateFin: '2024-06-30',
          statut: 'En cours',
          audit: 'audit1',
          creerPar: 'user1',
          risques: ['risque1'],
          constats: ['constat1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          nom: 'Formation sécurité pour les utilisateurs',
          perimetre: 'Formations et sensibilisation',
          budget: 15000,
          priorite: 'Moyenne',
          dateDebut: '2024-03-01',
          dateFin: '2024-12-31',
          statut: 'Planifié',
          audit: 'audit2',
          creerPar: 'user1',
          risques: ['risque2'],
          constats: ['constat2'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const allProjects = [...defaultProjects, ...localStorageProjects];
      const foundProject = allProjects.find(p => p._id === id);

      if (foundProject) {
        setProject(foundProject);
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: keyof Pick<CreateRisqueData, 'preuves' | 'mesures'>, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof Pick<CreateRisqueData, 'preuves' | 'mesures'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: ([...(prev[field] as string[]), ''])
    }));
  };

  const removeArrayItem = (field: keyof Pick<CreateRisqueData, 'preuves' | 'mesures'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_: string, i: number) => i !== index)
    }));
  };

  const calculateRiskLevel = () => {
    const impactScores = { 'Faible': 1, 'Moyen': 2, 'Élevé': 3, 'Critique': 4 };
    const probabilityScores = { 'Faible': 1, 'Moyenne': 2, 'Élevée': 3 };
    
    const impactScore = impactScores[formData.impact as keyof typeof impactScores] || 2;
    const probabilityScore = probabilityScores[formData.probabilite as keyof typeof probabilityScores] || 2;
    
    const riskScore = impactScore * probabilityScore;
    
    if (riskScore >= 9) return 'Critique';
    if (riskScore >= 6) return 'Élevé';
    if (riskScore >= 3) return 'Moyen';
    return 'Faible';
  };

  const validateForm = () => {
    if (!formData.actifCible.trim()) {
      setError('L\'actif cible est requis');
      return false;
    }
    if (!formData.menace.trim()) {
      setError('La menace est requise');
      return false;
    }
    if (!formData.vulnerabilite.trim()) {
      setError('La vulnérabilité est requise');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (formData.description.length < 10) {
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

      // Calculate risk level based on impact and probability
      const calculatedLevel = calculateRiskLevel();
      
      // Filter out empty items
      const filteredData = {
        ...formData,
        niveau: calculatedLevel,
        preuves: formData.preuves.filter(p => p.trim()),
        mesures: formData.mesures.filter(m => m.trim())
      };

      // Try backend API first
      try {
        const token = localStorage.getItem('authToken');
        // Map decision labels to backend-accepted values when possible
        const decisionMap: Record<string, string> = {
          'À évaluer': 'Accepter',
          'À traiter': 'Réduire',
          'À accepter': 'Accepter',
          'À transférer': 'Transférer'
        };
        const payload = {
          description: filteredData.description,
          type: filteredData.menace || filteredData.type || 'Risque',
          priorite: filteredData.priorite || 'Moyenne',
          niveauRisque: filteredData.niveau,
          impact: filteredData.impact,
          probabilite: filteredData.probabilite,
          decision: decisionMap[filteredData.decision] || filteredData.decision,
          projet: id,
          preuves: filteredData.preuves,
          mesures: filteredData.mesures,
        };

        const res = await fetch(`http://192.168.100.244:3000/api/risques`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const saved = await res.json();
          console.log('✅ Risk created in backend:', saved);
          alert('Risque créé avec succès !');
          navigate(`/projets/${id}`);
          return;
        }
      } catch (apiErr) {
        console.log('⚠️ Backend create failed, using localStorage fallback');
      }

      // Fallback: Create new risk locally
      const newRisk = {
        _id: `risk_${id}_${Date.now()}`,
        ...filteredData,
        type: filteredData.menace || filteredData.type || 'Risque',
        priorite: filteredData.priorite || 'Planifié',
        creerPar: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingRisks = JSON.parse(localStorage.getItem(`risks:${id}`) || '[]');
      existingRisks.push(newRisk);
      localStorage.setItem(`risks:${id}`, JSON.stringify(existingRisks));

      console.log('✅ Risk created and saved to localStorage:', newRisk);
      alert('Risque créé avec succès (hors ligne) !');
      navigate(`/projets/${id}`);
    } catch (err: any) {
      console.error('Error creating risk:', err);
      setError('Erreur lors de la création du risque');
    } finally {
      setIsLoading(false);
    }
  };

  const renderArrayField = (
    field: 'preuves' | 'mesures',
    label: string,
    icon: string,
    placeholder: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          {icon} {label}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field)}
        >
          + Ajouter
        </Button>
      </div>
      
      {formData[field].map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayChange(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {formData[field].length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => removeArrayItem(field, index)}
            >
              ✕
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/projects/${id}/risks`)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour à l'analyse des risques
          </button>
          <Button variant="secondary" onClick={() => navigate(`/projects/${id}`)}>
            🏠 Projet
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">⚠️ Identifier un nouveau risque</h1>
        <p className="text-slate-400">
          {project ? `Pour le projet: ${project.nom}` : 'Définissez les caractéristiques du risque'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Risk Creation Form */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations du risque</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actif Cible */}
            <div className="md:col-span-2">
              <Input
                id="actifCible"
                name="actifCible"
                type="text"
                label="Actif cible"
                value={formData.actifCible}
                onChange={handleChange}
                placeholder="Ex: Serveurs de production, Données sensibles, Infrastructure réseau"
                required
                icon="🎯"
              />
            </div>

            {/* Menace */}
            <div className="md:col-span-2">
              <Input
                id="menace"
                name="menace"
                type="text"
                label="Menace"
                value={formData.menace}
                onChange={handleChange}
                placeholder="Ex: Attaque par déni de service, Fuite de données, Intrusion malveillante"
                required
                icon="⚠️"
              />
            </div>

            {/* Vulnérabilité */}
            <div className="md:col-span-2">
              <Input
                id="vulnerabilite"
                name="vulnerabilite"
                type="text"
                label="Vulnérabilité"
                value={formData.vulnerabilite}
                onChange={handleChange}
                placeholder="Ex: Absence de protection DDoS, Chiffrement insuffisant, Configuration défaillante"
                required
                icon="🔓"
              />
            </div>

            {/* Impact */}
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
                { value: 'Élevé', label: 'Élevé' },
                { value: 'Critique', label: 'Critique' }
              ]}
            />

            {/* Probabilité */}
            <Select
              id="probabilite"
              name="probabilite"
              label="Probabilité"
              value={formData.probabilite}
              onChange={handleChange}
              required
              icon="📊"
              options={[
                { value: 'Faible', label: 'Faible' },
                { value: 'Moyenne', label: 'Moyenne' },
                { value: 'Élevée', label: 'Élevée' }
              ]}
            />

            {/* Décision */}
            <Select
              id="decision"
              name="decision"
              label="Décision"
              value={formData.decision}
              onChange={handleChange}
              required
              icon="🤔"
              options={[
                { value: 'À évaluer', label: 'À évaluer' },
                { value: 'À traiter', label: 'À traiter' },
                { value: 'À accepter', label: 'À accepter' },
                { value: 'À transférer', label: 'À transférer' }
              ]}
            />

            {/* Statut */}
            <Select
              id="statut"
              name="statut"
              label="Statut"
              value={formData.statut}
              onChange={handleChange}
              required
              icon="🔄"
              options={[
                { value: 'Planifié', label: 'Planifié' },
                { value: 'En cours', label: 'En cours' },
                { value: 'Terminé', label: 'Terminé' },
                { value: 'En attente', label: 'En attente' }
              ]}
            />

            {/* Responsable */}
            <div>
              <Input
                id="responsable"
                name="responsable"
                type="text"
                label="Responsable"
                value={formData.responsable}
                onChange={handleChange}
                placeholder="Ex: Équipe sécurité, Chef de projet"
                icon="👤"
              />
            </div>

            {/* Échéance */}
            <div>
              <Input
                id="echeance"
                name="echeance"
                type="date"
                label="Échéance"
                value={formData.echeance}
                onChange={handleChange}
                icon="📅"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📝 Description du risque
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez en détail le risque identifié, ses conséquences potentielles et son contexte..."
              className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Preuves et Mesures */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderArrayField('preuves', 'Preuves', '📋', 'Ex: Logs de sécurité, Rapport d\'audit, Test de pénétration')}
            {renderArrayField('mesures', 'Mesures de mitigation', '🛡️', 'Ex: Mise en place d\'un pare-feu, Formation des utilisateurs, Chiffrement renforcé')}
          </div>

          {/* Risk Level Preview */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">📊 Niveau de risque calculé :</h3>
            <div className="text-lg font-bold text-blue-800">
              {calculateRiskLevel()} 
              <span className="text-sm font-normal text-blue-600 ml-2">
                (Impact: {formData.impact} × Probabilité: {formData.probabilite})
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}/risks`)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer le risque'}
            </Button>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Identification des risques :</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• <strong>Actif cible :</strong> Ressource ou système à protéger</li>
          <li>• <strong>Menace :</strong> Source potentielle de dommage ou d'exploitation</li>
          <li>• <strong>Vulnérabilité :</strong> Faiblesse qui peut être exploitée par la menace</li>
          <li>• <strong>Impact :</strong> Conséquences potentielles si le risque se matérialise</li>
          <li>• <strong>Probabilité :</strong> Vraisemblance que le risque se réalise</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateRisk;
