import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '../common/Button';

interface PAS {
  _id: string;
  projet: string;
  version?: string;
  dateDocument?: string;
  objet?: string;
  createdAt?: string;
}

const PASProjetDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projetId = searchParams.get('projet') || '';
  const [items, setItems] = useState<PAS[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await fetch(`http://192.168.100.244:3000/api/pas/projet/${projetId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Erreur de chargement des PAS');
        const list = await res.json();
        setItems(Array.isArray(list) ? list : []);
      } catch (e: any) {
        setError(e.message || 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };
    if (projetId) load();
  }, [projetId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200">← Retour</button>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Plans d'Assurance Sécurité</h1>
      {isLoading && (<div className="py-8 text-center">Chargement...</div>)}
      {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>)}
      {items.length === 0 && !isLoading ? (
        <p className="text-slate-400">Aucun PAS pour ce projet.</p>
      ) : (
        <div className="space-y-3">
          {items.map(pas => (
            <div key={pas._id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Version {pas.version || '1.0'}</div>
                <div className="text-white font-medium">{pas.objet || 'PAS du projet'}</div>
                <div className="text-xs text-gray-500">{pas.dateDocument ? new Date(pas.dateDocument).toLocaleDateString('fr-FR') : ''}</div>
              </div>
              <Link to={`/pas/${pas._id}`} className="text-blue-600 hover:text-blue-800 text-sm">Voir</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PASProjetDashboard;


