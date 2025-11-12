import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import AppLayout from '../common/AppLayout';
import type { Audit, Constat, Preuve, Projet, Recommandation, PlanAction } from '../../types/audit';
import { auditAPI } from '../../api/api';
import config from '../../config/config';

const AuditSynthese: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [constats, setConstats] = useState<Constat[]>([]);
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [planActions, setPlanActions] = useState<PlanAction[]>([]);
  const [risquesByProjet, setRisquesByProjet] = useState<Record<string, any[]>>({});
  const [conceptionsByProjet, setConceptionsByProjet] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAuditData();
    }
  }, [id]);

  const loadAuditData = async () => {
    try {
      setIsLoading(true);
      
      // Try backend aggregation endpoint first
      if (id) {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`${config.apiBaseUrl}/audits/${id}/synthese`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const agg = await res.json();
            const hasLinked = (agg?.data?.constats?.length || 0) > 0 || (agg?.data?.projets?.length || 0) > 0;
            if (hasLinked) {
              if (agg.audit) setAudit(agg.audit);
              if (agg.data) {
                setConstats(agg.data.constats || []);
                setRecommandations(agg.data.recommandations || []);
                setPlanActions(agg.data.planActions || []);
                setPreuves(agg.data.preuves || []);
                setProjets(agg.data.projets || []);
                setRisquesByProjet(agg.data.risquesByProjet || {});
                setConceptionsByProjet(agg.data.conceptionsByProjet || {});
              }
              return; // only short-circuit if we actually received linked data
            }
          }
        } catch {}
      }

      // Load audit - check multiple storage locations
      let foundAudit = null;
      
      // Try 'newAudits' first
      const storedAudits = JSON.parse(localStorage.getItem('newAudits') || '[]');
      foundAudit = storedAudits.find((a: Audit) => a._id === id);
      
      // If not found, try 'audits'
      if (!foundAudit) {
        const audits = JSON.parse(localStorage.getItem('audits') || '[]');
        foundAudit = audits.find((a: Audit) => a._id === id);
      }
      
      // If still not found, try API
      if (!foundAudit && id) {
        try {
          const apiAudit = await auditAPI.getAudit(id);
          if (apiAudit) {
            foundAudit = apiAudit;
          }
        } catch (apiError) {
          console.log('API fetch failed, audit might be in localStorage only');
        }
      }
      
      if (foundAudit) {
        setAudit(foundAudit);
      } else {
        console.error('Audit not found in any storage location. ID:', id);
        console.log('Available audits in newAudits:', JSON.parse(localStorage.getItem('newAudits') || '[]').map((a: any) => a._id));
        console.log('Available audits in audits:', JSON.parse(localStorage.getItem('audits') || '[]').map((a: any) => a._id));
      }

      // Load constats (localStorage first, then API fallback)
      const storedConstats = JSON.parse(localStorage.getItem('constats') || '[]');
      let auditConstats = storedConstats.filter((c: any) => c.audit === id);
      if (auditConstats.length === 0 && id) {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`http://192.168.100.244:3000/api/constats`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const apiConstats = await res.json();
            auditConstats = apiConstats.filter((c: any) => c.audit === id);
          }
        } catch {}
      }
      setConstats(auditConstats);

      // Load preuves (local first, then API fallback)
      const storedPreuves = JSON.parse(localStorage.getItem('preuves') || '[]');
      let auditPreuves = storedPreuves.filter((p: any) => p.audit === id);
      if (auditPreuves.length === 0) {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`http://192.168.100.244:3000/api/preuves`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const apiPreuves = await res.json();
            auditPreuves = apiPreuves.filter((p: any) => p.audit === id);
          }
        } catch {}
      }
      setPreuves(auditPreuves);

      // Load projets (support both keys)
      const storedProjetsFr = JSON.parse(localStorage.getItem('projets') || '[]');
      const storedProjectsEn = JSON.parse(localStorage.getItem('projects') || '[]');
      let mergedProjects = [...storedProjetsFr, ...storedProjectsEn];
      // Fetch any missing projects referenced by constats
      try {
        const linkedIds: string[] = Array.from(new Set((auditConstats || []).map((c: any) => String(c.projet || '')).filter(Boolean)));
        const have = new Set(mergedProjects.map((p: any) => String((p && (p._id || p.id)) || '')));
        const missing = linkedIds.filter((id: string) => !have.has(id));
        if (missing.length > 0) {
          const token = localStorage.getItem('authToken');
          const fetched: any[] = [];
          for (const mid of missing) {
            try {
              const res = await fetch(`${config.apiBaseUrl}/projets/${mid}`, {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
              });
              if (res.ok) {
                const pj = await res.json();
                if (pj) fetched.push(pj);
              }
            } catch {}
          }
          if (fetched.length > 0) {
            mergedProjects = [...mergedProjects, ...fetched];
          }
        }
      } catch {}
      setProjets(mergedProjects);

      // Fallbacks for Risques/Conceptions by project from localStorage
      try {
        const risquesLS = JSON.parse(localStorage.getItem('risques') || '[]');
        const conceptionsLS = JSON.parse(localStorage.getItem('conceptions') || '[]');
        const risquesGrouped: Record<string, any[]> = {};
        risquesLS.forEach((r: any) => {
          const key = String(r.projet || '');
          if (!risquesGrouped[key]) risquesGrouped[key] = [];
          risquesGrouped[key].push(r);
        });
        const conceptionsGrouped: Record<string, any[]> = {};
        conceptionsLS.forEach((c: any) => {
          const key = String(c.projet || '');
          if (!conceptionsGrouped[key]) conceptionsGrouped[key] = [];
          conceptionsGrouped[key].push(c);
        });
        setRisquesByProjet(risquesGrouped);
        setConceptionsByProjet(conceptionsGrouped);
      } catch {}

      // Load recommandations (local first, then API fallback)
      const storedRecommandations = JSON.parse(localStorage.getItem('recommandations') || '[]');
      let auditRecommandations = storedRecommandations.filter((r: any) => 
        auditConstats.some((c: any) => c._id === r.constat)
      );
      if (auditRecommandations.length === 0) {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`http://192.168.100.244:3000/api/recommandations`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const apiRecs = await res.json();
            auditRecommandations = apiRecs.filter((r: any) => auditConstats.some((c: any) => c._id === r.constat));
          }
        } catch {}
      }
      setRecommandations(auditRecommandations);

      // Load plan actions (support both linkage directions, with API fallback)
      const storedPlanActions = JSON.parse(localStorage.getItem('planActions') || '[]');
      let auditPlanActions = storedPlanActions.filter((pa: any) =>
        auditRecommandations.some((r: any) => r.plansAction?.includes(pa._id) || (pa.recommandations?.includes?.(r._id)))
      );
      if (auditPlanActions.length === 0) {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`http://192.168.100.244:3000/api/plans-action`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const apiPA = await res.json();
            auditPlanActions = apiPA.filter((pa: any) => auditRecommandations.some((r: any) => r.plansAction?.includes(pa._id) || (pa.recommandations?.includes?.(r._id))));
          }
        } catch {}
      }
      setPlanActions(auditPlanActions);

    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

const itemsFromCounts = (
  counts: Map<string, number>,
  palette: Record<string, string>,
  labelFix: (k: string) => string = (k) => k
) => Array.from(counts.entries()).map(([k, v]) => ({ label: labelFix(k), value: v, color: palette[k] || '#64748b' }));

const STATUT_COLORS: Record<string, string> = {
  'en attente': '#94a3b8',
  'validée': '#10b981',
  'validee': '#10b981',
  'à revoir': '#f59e0b',
  'a revoir': '#f59e0b',
};

  // Per-project helpers
  const idOf = (v: any): string => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && (v as any)._id) return String((v as any)._id);
    return String(v);
  };

  const recosForProject = (projetId: string) => {
    const pid = String(projetId);
    const constatIds = new Set(
      constats
        .filter((c) => idOf((c as any).projet) === pid)
        .map((c) => idOf((c as any)._id))
    );
    return recommandations.filter((r) => constatIds.has(idOf((r as any).constat)));
  };
  const conceptionsForProject = (projetId: string) => conceptionsByProjet[String(projetId)] || [];
  const risquesForProject = (projetId: string) => risquesByProjet[String(projetId)] || [];
  const constatsForProject = (projetId: string) => constats.filter((c) => idOf((c as any).projet) === String(projetId));

  // Calculate statistics
  const getConstatStats = () => {
    const normType = (t: any) => String(t || '').toLowerCase();
    const normCrit = (v: any) => String(v || '').toLowerCase();
    const stats = {
      total: constats.length,
      ncMaj: constats.filter(c => normType(c.type) === 'nc maj' || normType(c.type) === 'nc majeure').length,
      ncMin: constats.filter(c => normType(c.type) === 'nc min' || normType(c.type) === 'nc mineure').length,
      observation: constats.filter(c => normType(c.type) === 'ps' || normType(c.type) === 'observation').length,
      critique: constats.filter(c => ['critique','élevée','elevee'].includes(normCrit(c.criticite))).length,
      moyenne: constats.filter(c => normCrit(c.criticite) === 'moyenne').length,
      faible: constats.filter(c => normCrit(c.criticite) === 'faible').length,
    };
    return stats;
  };

  const getRecommandationStats = () => {
    const norm = (s: any) => String(s || '').toLowerCase();
    const stats = {
      total: recommandations.length,
      enAttente: recommandations.filter(r => norm(r.statut) === 'en attente').length,
      validee: recommandations.filter(r => norm(r.statut) === 'validée' || norm(r.statut) === 'validee').length,
      aRevoir: recommandations.filter(r => norm(r.statut) === 'à revoir' || norm(r.statut) === 'a revoir').length,
      critique: recommandations.filter(r => norm(r.priorite) === 'critique').length,
      elevee: recommandations.filter(r => norm(r.priorite) === 'élevée' || norm(r.priorite) === 'elevee').length,
      moyenne: recommandations.filter(r => norm(r.priorite) === 'moyenne').length,
      faible: recommandations.filter(r => norm(r.priorite) === 'faible').length,
    };
    return stats;
  };

  const getPlanActionStats = () => {
    const norm = (s: any) => String(s || '').toLowerCase();
    const stats = {
      total: planActions.length,
      enCours: planActions.filter(pa => norm(pa.statut) === 'en cours').length,
      termine: planActions.filter(pa => norm(pa.statut) === 'terminé' || norm(pa.statut) === 'termine').length,
      enAttente: planActions.filter(pa => norm(pa.statut) === 'en attente').length,
      critique: planActions.filter(pa => norm(pa.priorite) === 'critique').length,
      elevee: planActions.filter(pa => norm(pa.priorite) === 'élevée' || norm(pa.priorite) === 'elevee').length,
      moyenne: planActions.filter(pa => norm(pa.priorite) === 'moyenne').length,
      faible: planActions.filter(pa => norm(pa.priorite) === 'faible').length,
    };
    return stats;
  };

  const constatStats = getConstatStats();
  const recommandationStats = getRecommandationStats();
  const planActionStats = getPlanActionStats();

  // Calculate percentages for pie charts
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Lightweight SVG donut chart
  const DonutChart: React.FC<{
    title: string;
    items: { label: string; value: number; color: string }[];
    total: number;
  }> = ({ title, items, total }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const segments = items.map((it) => {
      const frac = total > 0 ? it.value / total : 0;
      const length = circumference * frac;
      const seg = { color: it.color, length, dasharray: `${length} ${circumference - length}`, offset };
      offset += length;
      return seg;
    });
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 200 200">
              <g transform="translate(100,100) rotate(-90)">
                <circle r={radius} cx={0} cy={0} fill="none" stroke="#334155" strokeWidth={24} />
                {segments.map((s, i) => (
                  <circle
                    key={i}
                    r={radius}
                    cx={0}
                    cy={0}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={24}
                    strokeDasharray={s.dasharray}
                    strokeDashoffset={-s.offset}
                    strokeLinecap="butt"
                  />
                ))}
                {/* inner hole for donut */}
                <circle r={radius - 18} cx={0} cy={0} fill="#0f172a" />
              </g>
              <text x="100" y="105" textAnchor="middle" className="fill-white" style={{ fontSize: 18, fontWeight: 700 }}>
                {total}
              </text>
            </svg>
          </div>
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: it.color }}></span>
                  <span className="text-gray-300">{it.label}</span>
                </div>
                <span className="text-gray-200 font-semibold">
                  {it.value} ({getPercentage(it.value, total)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!audit) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Audit non trouvé</h2>
          <Button onClick={() => navigate('/audits')}>Retour aux audits</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">📊 Synthèse de l'Audit</h2>
              <p className="text-gray-400">{audit.nom}</p>
            </div>
            <Button variant="outline" onClick={() => navigate(`/audits/${id}`)}>
              ← Retour à l'audit
            </Button>
          </div>
        </div>

        {/* Audit Information */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">📋 Informations de l'Audit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 text-sm">Nom:</span>
              <p className="text-white font-medium">{audit.nom}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Type:</span>
              <p className="text-white font-medium">{audit.type}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Périmètre:</span>
              <p className="text-white font-medium">{audit.perimetre}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Statut:</span>
              <p className="text-white font-medium">{audit.statut}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Date de début:</span>
              <p className="text-white font-medium">{new Date(audit.dateDebut).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Date de fin:</span>
              <p className="text-white font-medium">{new Date(audit.dateFin).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">{constatStats.total}</div>
              <div className="text-sm text-gray-400">Constats</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{recommandationStats.total}</div>
              <div className="text-sm text-gray-400">Recommandations</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">{planActionStats.total}</div>
              <div className="text-sm text-gray-400">Plans d'Action</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{preuves.length}</div>
              <div className="text-sm text-gray-400">Preuves</div>
            </div>
          </div>
        </div>

        {/* Constats List */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🔍 Liste des Constats</h3>
          {constats.length === 0 ? (
            <p className="text-gray-400">Aucun constat associé à cet audit</p>
          ) : (
            <div className="space-y-3">
              {constats.map((constat, index) => (
                <div key={constat._id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-medium">#{index + 1}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          constat.type === 'NC maj' ? 'bg-red-500/20 text-red-400' :
                          constat.type === 'NC min' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {constat.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          constat.criticite === 'Critique' || constat.criticite === 'Élevée' ? 'bg-red-500/20 text-red-400' :
                          constat.criticite === 'Moyenne' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {constat.criticite}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{constat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Graphiques par Projet: Statuts des actions + Criticités */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">📈 Graphiques par Projet</h3>
          {(() => {
            const linkedIds = new Set(constats.map((c) => idOf((c as any).projet)).filter(Boolean));
            const projectsForAudit = projets.filter((p) => linkedIds.has(idOf((p as any)._id)));
            return projectsForAudit.length === 0 ? (
            <p className="text-gray-400">Aucun projet lié aux constats de cet audit</p>
          ) : (
            <div className="space-y-6">
              {projectsForAudit.map((projet) => {
                const pid = (projet as any)._id;
                const recs = recosForProject(pid);
                const concs = conceptionsForProject(pid);
                const risks = risquesForProject(pid);
                const consts = constatsForProject(pid);

                // Statuts: recommandations + conceptions
                const statutCounts = new Map<string, number>();
                const inc = (k: string) => statutCounts.set(k, (statutCounts.get(k) || 0) + 1);
                recs.forEach((r: any) => inc(String(r.statut || '').toLowerCase()));
                concs.forEach((c: any) => inc(String(c.statut || '').toLowerCase()));

                // Criticités: constats.criticite + risques.niveauRisque
                const critCounts = new Map<string, number>();
                const incCrit = (k: string) => critCounts.set(k, (critCounts.get(k) || 0) + 1);
                consts.forEach((c: any) => incCrit(String(c.criticite || '').toLowerCase()));
                risks.forEach((r: any) => incCrit(String(r.niveauRisque || '').toLowerCase()));

                const statutItems = itemsFromCounts(statutCounts, STATUT_COLORS, (k) => k);
                // map criticité palette using PRIORITY_COLORS as severity colors
                const critPalette: Record<string, string> = {
                  'critique': '#ef4444',
                  'élevée': '#fb923c',
                  'elevee': '#fb923c',
                  'moyenne': '#f59e0b',
                  'faible': '#22c55e',
                  'élevé': '#fb923c',
                  'eleve': '#fb923c',
                  'moyen': '#f59e0b',
                };
                const critItems = itemsFromCounts(critCounts, critPalette, (k) => k.charAt(0).toUpperCase() + k.slice(1));

                return (
                  <div key={pid} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-semibold">{projet.nom}</h4>
                        <p className="text-xs text-gray-400">Périmètre: {projet.perimetre}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DonutChart title="Statuts des Actions" total={statutItems.reduce((s, i) => s + i.value, 0)} items={statutItems} />
                      <DonutChart title="Criticités" total={critItems.reduce((s, i) => s + i.value, 0)} items={critItems} />
                    </div>
                  </div>
                );
              })}
            </div>
          );})()}
        </div>

        {/* Global Charts Section (kept) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <DonutChart
            title="Types de Constats"
            total={constatStats.total}
            items={[
              { label: 'NC Majeure', value: constatStats.ncMaj, color: '#ef4444' },
              { label: 'NC Mineure', value: constatStats.ncMin, color: '#fb923c' },
              { label: 'Observation', value: constatStats.observation, color: '#3b82f6' },
            ]}
          />
          <DonutChart
            title="Criticité des Constats"
            total={constatStats.total}
            items={[
              { label: 'Critique/Élevée', value: constatStats.critique, color: '#ef4444' },
              { label: 'Moyenne', value: constatStats.moyenne, color: '#f59e0b' },
              { label: 'Faible', value: constatStats.faible, color: '#22c55e' },
            ]}
          />
          <DonutChart
            title="Priorités des Recommandations"
            total={recommandationStats.total}
            items={[
              { label: 'Critique', value: recommandationStats.critique, color: '#ef4444' },
              { label: 'Élevée', value: recommandationStats.elevee, color: '#fb923c' },
              { label: 'Moyenne', value: recommandationStats.moyenne, color: '#f59e0b' },
              { label: 'Faible', value: recommandationStats.faible, color: '#22c55e' },
            ]}
          />
          <DonutChart
            title="Statut des Plans d'Action"
            total={planActionStats.total}
            items={[
              { label: 'En Cours', value: planActionStats.enCours, color: '#3b82f6' },
              { label: 'Terminé', value: planActionStats.termine, color: '#10b981' },
              { label: 'En Attente', value: planActionStats.enAttente, color: '#f59e0b' },
            ]}
          />
        </div>

        {/* Additional Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">💡 Informations sur la Synthèse</h4>
          <ul className="text-sm text-blue-400 space-y-2">
            <li>• Cette synthèse présente une vue d'ensemble statistique de tous les éléments de l'audit</li>
            <li>• Les données incluent les constats, recommandations, plans d'action et preuves associés</li>
            <li>• Les pourcentages sont calculés automatiquement en fonction du nombre total d'éléments</li>
            <li>• Utilisez cette vue pour identifier rapidement les priorités et l'état d'avancement</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditSynthese;
