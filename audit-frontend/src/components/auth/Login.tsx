import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from URL params or location state
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get('redirect');
  const from = location.state?.from?.pathname || '/dashboard';
  const redirectPath = redirectParam || from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Attempting login...');
      const result = await login(email, password);
      console.log('📋 Login result:', result);
      
      if (result.success && result.user) {
        // Get user data from the login response
        const userData = result.user;
        console.log('👤 User data:', userData);
        
        // Determine the default redirect path based on role
        let defaultRedirectPath = '/dashboard';
        if (userData.role === 'ADMIN') {
          defaultRedirectPath = '/admin';
        } else if (userData.role === 'RSSI') {
          defaultRedirectPath = '/rssi';
        } else if (userData.role === 'SSI') {
          defaultRedirectPath = '/ssi';
        }
        
        // Use the redirect parameter if present, otherwise use the default path
        const finalRedirect = decodeURIComponent(redirectPath) || defaultRedirectPath;
        
        navigate(finalRedirect, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Connexion</h1>
            <p className="text-slate-400 mt-2">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

          <Input
            id="email"
            type="email"
            label="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            icon="📧"
          />

          <Input
            id="password"
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            required
            icon="🔐"
            showPasswordToggle
          />

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium"
          >
            Se connecter
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-sm text-slate-400">
            Pas encore de compte ?{' '}
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Comptes de démonstration:</h3>
          <div className="text-xs text-slate-400 space-y-1">
            <div><strong className="text-slate-300">Admin:</strong> admin@audit.com / admin123</div>
            <div><strong className="text-slate-300">RSSI:</strong> rssi@audit.com / rssi123</div>
            <div><strong className="text-slate-300">SSI:</strong> ssi@audit.com / ssi123</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
