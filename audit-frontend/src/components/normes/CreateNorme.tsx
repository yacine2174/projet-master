import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import type { CreateNormeData } from '../../types/audit';
import AppLayout from '../common/AppLayout';

const CreateNorme: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateNormeData>({
    nom: '',
    categorie: '',
    version: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom de la norme est requis');
      return false;
    }
    if (formData.nom.length < 3) {
      setError('Le nom doit contenir au moins 3 caractères');
      return false;
    }
    if (!formData.categorie.trim()) {
      setError('La catégorie est requise');
      return false;
    }
    if (!formData.version.trim()) {
      setError('La version est requise');
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

      // Create new norme with mock ID
      const newNorme = {
        _id: `norme_${Date.now()}`,
        ...formData,
        audits: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingNormes = JSON.parse(localStorage.getItem('normes') || '[]');
      existingNormes.push(newNorme);
      localStorage.setItem('normes', JSON.stringify(existingNormes));

      console.log('✅ Norme created and saved to localStorage:', newNorme);
      
      // Show success message
      alert('Norme créée avec succès !');
      
      // Navigate back to normes dashboard
      navigate('/normes');
    } catch (err: any) {
      console.error('Error creating norme:', err);
      setError('Erreur lors de la création de la norme');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Sécurité de l\'information',
    'Protection des données',
    'Qualité',
    'Sécurité des paiements',
    'Contrôle interne',
    'Gouvernance',
    'Gestion des risques',
    'Continuité d\'activité',
    'Conformité réglementaire',
    'Autre'
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/normes')}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Retour aux normes
          </button>
          <Button variant="secondary" onClick={() => navigate(user?.role === 'SSI' ? '/ssi' : user?.role === 'RSSI' ? '/rssi' : '/admin')}>
            🏠 Tableau de bord
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">📋 Créer une nouvelle norme</h1>
        <p className="text-slate-400">
          Ajoutez une nouvelle norme ou standard de conformité à votre système
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Norme Creation Form */}
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Informations de la norme</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* Nom */}
          <div className="mb-6">
            <Input
              id="nom"
              name="nom"
              type="text"
              label="Nom de la norme"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: ISO 27001:2022, RGPD, PCI DSS"
              required
              icon="📋"
            />
          </div>

          {/* Catégorie */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🏷️ Catégorie
            </label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div className="mb-6">
            <Input
              id="version"
              name="version"
              type="text"
              label="Version"
              value={formData.version}
              onChange={handleChange}
              placeholder="Ex: 2022, 2018, 4.0, 2017"
              required
              icon="🔢"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📝 Description détaillée
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Décrivez en détail la norme, ses objectifs, son périmètre d'application, les exigences principales..."
              className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/normes')}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer la norme'}
            </Button>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Création de normes :</h4>
        <ul className="text-xs text-blue-400 space-y-1">
          <li>• <strong>Nom :</strong> Utilisez le nom officiel de la norme (ex: ISO 27001:2022)</li>
          <li>• <strong>Catégorie :</strong> Choisissez la catégorie qui correspond le mieux au domaine</li>
          <li>• <strong>Version :</strong> Indiquez la version ou l'année de publication</li>
          <li>• <strong>Description :</strong> Décrivez les objectifs et exigences principales</li>
          <li>• <strong>Utilisation :</strong> Les normes créées pourront être associées aux audits</li>
        </ul>
      </div>
    </div>
  </AppLayout>
  );
};

export default CreateNorme;
