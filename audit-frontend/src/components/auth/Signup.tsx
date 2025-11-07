import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    confirmPassword: '',
    role: 'SSI' as 'SSI' | 'RSSI'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.nom || !formData.email || !formData.motDePasse || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    // Name validation - must contain at least 2 words
    const nameWords = formData.nom.trim().split(/\s+/).filter(word => word.length > 0);
    if (nameWords.length < 2) {
      setError('Le nom doit contenir au moins 2 mots (prénom et nom)');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Password validation - minimum 8 characters with complexity
    if (formData.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Password complexity check
    const hasLetter = /[a-zA-Z]/.test(formData.motDePasse);
    const hasNumber = /\d/.test(formData.motDePasse);
    if (!hasLetter || !hasNumber) {
      setError('Le mot de passe doit contenir au moins une lettre et un chiffre');
      return false;
    }

    if (formData.motDePasse !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { nom, email, motDePasse, role } = formData;
      console.log('🔄 Sending signup data:', { nom, email, role, motDePasse: '***' });
      const result = await signup({ nom, email, motDePasse, role });
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('💥 Signup error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Inscription</h1>
          <p className="text-slate-400 mt-2">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <Input
            id="nom"
            name="nom"
            type="text"
            label="Nom complet"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Votre nom complet"
            required
            icon="👤"
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Adresse email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            required
            icon="📧"
          />

          <Select
            id="role"
            name="role"
            label="Rôle"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'SSI', label: 'SSI (Sécurité des Systèmes d\'Information)' },
              { value: 'RSSI', label: 'RSSI (Responsable Sécurité des Systèmes d\'Information)' }
            ]}
            required
            icon="🛡️"
          />

          <Input
            id="motDePasse"
            name="motDePasse"
            type="password"
            label="Mot de passe"
            value={formData.motDePasse}
            onChange={handleChange}
            placeholder="Minimum 8 caractères (lettre + chiffre)"
            required
            icon="🔐"
            showPasswordToggle
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            required
            icon="🔐"
            showPasswordToggle
          />

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
            size="lg"
          >
            S'inscrire
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Information importante:</h3>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Le nom doit contenir au moins 2 mots (prénom et nom)</li>
            <li>• Le mot de passe doit contenir au moins 8 caractères</li>
            <li>• Le mot de passe doit contenir au moins une lettre et un chiffre</li>
            <li>• Après l'inscription, votre compte sera en attente d'approbation par l'administrateur</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;
