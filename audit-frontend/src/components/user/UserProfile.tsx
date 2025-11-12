import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import config from '../../config/config';

interface UserData {
  _id: string;
  nom: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    email: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/utilisateurs/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error('Erreur lors du chargement du profil');
      }

      const data = await response.json();
      setUserData(data);
      setFormData({
        nom: data.nom || '',
        email: data.email || ''
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/utilisateurs/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: userData?.nom || '',
      email: userData?.email || ''
    });
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'RSSI') return '/rssi';
    if (user.role === 'SSI') return '/ssi';
    return '/login';
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement du profil</p>
          <Button variant="primary" onClick={() => navigate(getDashboardPath())}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
            <p className="text-slate-400 mt-2">Gérez vos informations personnelles</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(getDashboardPath())}
          >
            ← Retour
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <span className="mr-2">✓</span>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <span className="mr-2">⚠</span>
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 bg-opacity-20 flex items-center justify-center text-3xl font-bold">
              {userData.nom.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{userData.nom}</h2>
              <p className="text-blue-100 mt-1">{userData.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-slate-800 bg-opacity-20 rounded-full text-sm font-medium">
                {userData.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
            {!isEditing && (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Modifier
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez votre nom complet"
                  required
                />
              ) : (
                <p className="px-4 py-2 bg-slate-900 rounded-lg text-white">{userData.nom}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez votre adresse e-mail"
                  required
                />
              ) : (
                <p className="px-4 py-2 bg-slate-900 rounded-lg text-white">{userData.email}</p>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rôle
              </label>
              <p className="px-4 py-2 bg-slate-800 rounded-lg text-slate-400 cursor-not-allowed">
                {userData.role}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Le rôle ne peut être modifié que par un administrateur
              </p>
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Informations du compte</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {userData.createdAt && (
                  <div>
                    <p className="text-gray-500">Compte créé le</p>
                    <p className="text-white font-medium">
                      {new Date(userData.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {userData.updatedAt && (
                  <div>
                    <p className="text-gray-500">Dernière modification</p>
                    <p className="text-white font-medium">
                      {new Date(userData.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !formData.nom.trim() || !formData.email.trim()}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

