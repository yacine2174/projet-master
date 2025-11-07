import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../api/api';
import type { User, SignupData } from '../api/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      const cachedUser = localStorage.getItem('authUser');

      // Hydrate immediately from cache if present
      if (cachedUser && token) {
        try {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
        }
      }
      
      setIsLoading(false);
    };

    // Check auth status on initial load
    checkAuthStatus();

    // Listen for unauthorized events from API service
    const handleUnauthorized = () => {
      console.log('Received unauthorized event, logging out...');
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Basic validation
      if (!email || !password) {
        return { success: false, message: 'Veuillez fournir un email et un mot de passe' };
      }

      // Clear any existing auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      const response = await authAPI.login({ email, motDePasse: password });
      
      if (!response.token || !response.utilisateur) {
        return { success: false, message: 'Réponse invalide du serveur' };
      }
      
      const { token, utilisateur: userData } = response;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        message: 'Connexion réussie!', 
        user: userData 
      };
      
    } catch (error: any) {
      // Handle different types of errors
      let message = 'Erreur de connexion';
      
      if (error.response) {
        // Server responded with an error status
        message = error.response.data?.message || 
                 error.message || 
                 `Erreur serveur (${error.response.status})`;
      } else if (error.request) {
        // Request was made but no response received
        message = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else {
        // Something else happened
        message = error.message || 'Une erreur inconnue est survenue';
      }
      
      // Clear any partial auth data on error
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: false, message };
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      await authAPI.signup(userData);
      return { success: true, message: 'Inscription réussie! En attente d\'approbation admin.' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur d\'inscription';
      return { success: false, message };
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?redirect=${redirect}`;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { message } = await authAPI.forgotPassword(email);
      return { success: true, message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la demande de réinitialisation';
      return { success: false, message };
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const { message } = await authAPI.resetPassword(email, newPassword);
      return { success: true, message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation';
      return { success: false, message };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  // Debug authentication state
  console.log('🔍 AuthContext state:', {
    user: user ? { id: user._id, role: user.role, status: user.status } : null,
    isAuthenticated: !!user,
    isLoading,
    hasToken: !!localStorage.getItem('authToken'),
    hasCachedUser: !!localStorage.getItem('authUser')
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
