import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../common/Button';
import Select from '../common/Select';

const CreatePASProjet: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projet = searchParams.get('projet') || '';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<any>({
    version: '1.0',
    objet: '',
    champApplication: { locauxEtInfrastructures: '', systemesInformation: '', personnels: '' },
    references: { normes: [], politiques: [], reglementations: [] },
    organisationSecurite: { rspNomFonction: '', rolesEtResponsabilites: [] },
    mesuresSecurite: { physique: [], logique: [], organisationnelle: [] },
    pcaPra: {},
    suiviAudit: { kpis: [] },
    annexes: {}
  });

  const handleChange = (path: string, value: any) => {
    setForm((prev: any) => {
      const copy = { ...prev };
      const keys = path.split('.');
      let ref: any = copy;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch('http://192.168.100.244:3000/api/pas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, projet })
      });
      if (!res.ok) throw new Error('Erreur lors de la création du PAS');
      await res.json();
      navigate(`/pas/projet?projet=${projet}`);
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200">← Retour</button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</Button>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Créer un PAS</h1>
      {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>)}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Objet du document</label>
          <textarea className="w-full border border-slate-600 rounded p-2" rows={3}
            value={form.objet}
            onChange={e => handleChange('objet', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Locaux & Infrastructures</label>
            <textarea className="w-full border border-slate-600 rounded p-2" rows={2}
              value={form.champApplication.locauxEtInfrastructures}
              onChange={e => handleChange('champApplication.locauxEtInfrastructures', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Systèmes d'information</label>
            <textarea className="w-full border border-slate-600 rounded p-2" rows={2}
              value={form.champApplication.systemesInformation}
              onChange={e => handleChange('champApplication.systemesInformation', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Personnels</label>
            <textarea className="w-full border border-slate-600 rounded p-2" rows={2}
              value={form.champApplication.personnels}
              onChange={e => handleChange('champApplication.personnels', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Références - Normes</label>
            <input className="w-full border border-slate-600 rounded p-2" placeholder="ISO 27001, 27002"
              onChange={e => handleChange('references.normes', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Références - Politiques</label>
            <input className="w-full border border-slate-600 rounded p-2" placeholder="Politique sécu interne"
              onChange={e => handleChange('references.politiques', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Références - Réglementations</label>
            <input className="w-full border border-slate-600 rounded p-2" placeholder="RGPD, ..."
              onChange={e => handleChange('references.reglementations', e.target.value.split(',').map(s => s.trim()))} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">RSP (Nom, fonction)</label>
          <input className="w-full border border-slate-600 rounded p-2"
            value={form.organisationSecurite.rspNomFonction}
            onChange={e => handleChange('organisationSecurite.rspNomFonction', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Mesures de sécurité - Physique (séparées par virgule)</label>
          <input className="w-full border border-slate-600 rounded p-2"
            onChange={e => handleChange('mesuresSecurite.physique', e.target.value.split(',').map((s: string) => s.trim()))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Mesures de sécurité - Logique</label>
          <input className="w-full border border-slate-600 rounded p-2"
            onChange={e => handleChange('mesuresSecurite.logique', e.target.value.split(',').map((s: string) => s.trim()))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Mesures de sécurité - Organisationnelle</label>
          <input className="w-full border border-slate-600 rounded p-2"
            onChange={e => handleChange('mesuresSecurite.organisationnelle', e.target.value.split(',').map((s: string) => s.trim()))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">PCA/PRA - Sauvegarde & restauration</label>
            <input className="w-full border border-slate-600 rounded p-2" onChange={e => handleChange('pcaPra.sauvegardeRestauration', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Site de secours</label>
            <input className="w-full border border-slate-600 rounded p-2" onChange={e => handleChange('pcaPra.siteSecours', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Exercices</label>
            <input className="w-full border border-slate-600 rounded p-2" onChange={e => handleChange('pcaPra.exercices', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePASProjet;


