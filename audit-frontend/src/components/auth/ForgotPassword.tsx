import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api/api';
import Input from '../common/Input';
import Button from '../common/Button';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetStatus, setResetStatus] = useState<{
    status: string;
    requestedAt?: string;
    approvedAt?: string;
    adminNotes?: string;
  } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check for existing requests when email changes
  useEffect(() => {
    if (email && email.includes('@')) {
      // Debounce the status check
      const timeoutId = setTimeout(() => {
        checkResetStatus();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Sending forgot password request for email:', email);
      const result = await authAPI.forgotPassword(email);
      console.log('✅ Forgot password result:', result);
        setSuccess(true);
      // Check status immediately after creating request
      checkResetStatus();
    } catch (err: any) {
      console.error('💥 Forgot password error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  const checkResetStatus = async () => {
    if (!email) return;
    
    setIsCheckingStatus(true);
    try {
      const status = await authAPI.checkPasswordResetStatus(email);
      setResetStatus(status);
      
      // If there's an active request, show success state
      if (status.status !== 'none') {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error checking reset status:', err);
      // Don't show error for status check failures
    } finally {
      setIsCheckingStatus(false);
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
                <p className="text-sm text-yellow-600">
                  Votre demande de réinitialisation est en attente d'approbation par l'administrateur.
                  {resetStatus.requestedAt && (
                    <span className="block mt-1">
                      Demande créée le: {new Date(resetStatus.requestedAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </p>
                <button
                  onClick={checkResetStatus}
                  disabled={isCheckingStatus}
                  className="mt-2 text-xs text-yellow-700 hover:text-yellow-800 underline"
                >
                  {isCheckingStatus ? 'Vérification...' : 'Actualiser le statut'}
                </button>
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
                <h3 className="text-sm font-semibold text-green-700">Demande approuvée!</h3>
                <p className="text-sm text-green-600">
                  Votre demande a été approuvée par l'administrateur.
                  {resetStatus.approvedAt && (
                    <span className="block mt-1">
                      Approuvée le: {new Date(resetStatus.approvedAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {resetStatus.adminNotes && (
                    <span className="block mt-1">
                      Note: {resetStatus.adminNotes}
                    </span>
                  )}
                </p>
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  🔐 Réinitialiser mon mot de passe
                </Link>
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
                <p className="text-sm text-red-600">
                  Votre demande de réinitialisation a été rejetée par l'administrateur.
                  {resetStatus.approvedAt && (
                    <span className="block mt-1">
                      Rejetée le: {new Date(resetStatus.approvedAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {resetStatus.adminNotes && (
                    <span className="block mt-1">
                      Raison: {resetStatus.adminNotes}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => {
                    setResetStatus(null);
                    setSuccess(false);
                  }}
                  className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                >
                  Faire une nouvelle demande
                </button>
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
                <p className="text-sm text-blue-600">
                  Votre mot de passe a déjà été réinitialisé. Vous pouvez vous connecter avec votre nouveau mot de passe.
            </p>
            <Link
              to="/login"
                  className="mt-2 text-xs text-blue-700 hover:text-blue-800 underline"
            >
                  Aller à la page de connexion
            </Link>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show status check interface if there's an active request
  if (success || resetStatus) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Statut de votre demande</h1>
            <p className="text-slate-400">
              Vérifiez le statut de votre demande de réinitialisation de mot de passe
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">Vérifier une autre demande:</h3>
            <div className="flex items-center space-x-4">
              <Input
                id="checkEmail"
                name="checkEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre email"
                className="flex-1"
              />
              <Button
                onClick={checkResetStatus}
                disabled={isCheckingStatus || !email}
                loading={isCheckingStatus}
                size="sm"
              >
                Vérifier
              </Button>
            </div>
          </div>

          {getStatusMessage()}

          <div className="text-center space-y-4">
            <div>
              <button
                onClick={() => {
                  setResetStatus(null);
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-sm text-slate-400 hover:text-slate-200 underline"
              >
                Faire une nouvelle demande
              </button>
            </div>
            <div>
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-blue-600 text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié?</h1>
          <p className="text-slate-400">
            Entrez votre adresse email pour demander une réinitialisation de mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
              id="email"
            name="email"
              type="email"
            label="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            icon="📧"
            disabled={isLoading}
            />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
          </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Envoi en cours...' : 'Demander la réinitialisation'}
          </Button>

          <div className="text-center">
          <Link
            to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
              ← Retour à la connexion
          </Link>
        </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Information importante:</h3>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Votre demande sera envoyée à l'administrateur pour approbation</li>
            <li>• Vous recevrez une notification quand elle sera approuvée</li>
            <li>• Vous pourrez alors définir votre nouveau mot de passe</li>
            <li>• Le processus peut prendre quelques minutes à quelques heures</li>
            <li>• Vous pouvez vérifier le statut en entrant votre email</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
