import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../api/api';
import Input from '../common/Input';
import Button from '../common/Button';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetStatus, setResetStatus] = useState<{
    status: string;
    message: string;
    canReset: boolean;
  } | null>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
      checkResetStatus(email);
    }
  }, [searchParams]);

  const checkResetStatus = async (email: string) => {
    try {
      const status = await authAPI.checkPasswordResetStatus(email);
      setResetStatus({
        status: status.status,
        message: status.status === 'none' ? 'Aucune demande active' : '',
        canReset: status.status === 'approved'
      });
    } catch (err: any) {
      setResetStatus({
        status: 'error',
        message: 'Erreur lors de la vérification du statut',
        canReset: false
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    const hasLetter = /[a-zA-Z]/.test(formData.newPassword);
    const hasNumber = /\d/.test(formData.newPassword);
    if (!hasLetter || !hasNumber) {
      setError('Le mot de passe doit contenir au moins une lettre et un chiffre');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
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

    if (!resetStatus?.canReset) {
      setError('Votre demande de réinitialisation n\'est pas encore approuvée par l\'administrateur');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.resetPassword(formData.email, formData.newPassword);
      setSuccess('Mot de passe mis à jour avec succès! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!resetStatus) return null;

    switch (resetStatus.status) {
      case 'pending':
        return (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              <div>
                <h3 className="text-sm font-semibold text-yellow-700">Demande en attente</h3>
                <p className="text-sm text-yellow-600">Votre demande de réinitialisation est en attente d'approbation par l'administrateur.</p>
              </div>
            </div>
          </div>
        );
      case 'approved':
        return (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <div>
                <h3 className="text-sm font-semibold text-green-700">Demande approuvée</h3>
                <p className="text-sm text-green-600">Votre demande a été approuvée. Vous pouvez maintenant définir votre nouveau mot de passe.</p>
              </div>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <div>
                <h3 className="text-sm font-semibold text-red-700">Demande rejetée</h3>
                <p className="text-sm text-red-600">Votre demande de réinitialisation a été rejetée. Veuillez contacter l'administrateur.</p>
              </div>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">✅</span>
              <div>
                <h3 className="text-sm font-semibold text-blue-700">Mot de passe déjà réinitialisé</h3>
                <p className="text-sm text-blue-600">Votre mot de passe a déjà été réinitialisé. Vous pouvez vous connecter avec votre nouveau mot de passe.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mb-6 p-4 bg-slate-900 border border-slate-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-slate-400 mr-2">❓</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Statut inconnu</h3>
                <p className="text-sm text-slate-400">Impossible de déterminer le statut de votre demande.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">🔐 Réinitialisation du mot de passe</h1>
          <p className="text-slate-400">Définissez votre nouveau mot de passe</p>
        </div>

        {getStatusMessage()}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={!!searchParams.get('email')}
          />

          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="Nouveau mot de passe"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Minimum 8 caractères (lettre + chiffre)"
            required
            icon="🔐"
            showPasswordToggle
            disabled={!resetStatus?.canReset}
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Répétez votre nouveau mot de passe"
            required
            icon="🔒"
            showPasswordToggle
            disabled={!resetStatus?.canReset}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !resetStatus?.canReset}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              ← Retour à la connexion
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Information importante:</h3>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Le mot de passe doit contenir au moins 8 caractères</li>
            <li>• Le mot de passe doit contenir au moins une lettre et un chiffre</li>
            <li>• Vous ne pouvez réinitialiser votre mot de passe que si votre demande a été approuvée</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
