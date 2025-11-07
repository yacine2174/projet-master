import React, { useEffect, useState } from 'react';
import AppLayout from '../common/AppLayout';
import { auditAPI, projetAPI, recommandationAPI, planActionAPI } from '../../api/api';

interface ReportData {
  auditsTotal: number;
  auditsCompleted: number;
  projectsTotal: number;
  constatsTotal: number;
  constatsCritical: number;
  recommandationsTotal: number;
  recommandationsPending: number;
  planActionsTotal: number;
  planActionsInProgress: number;
  recentItems: Array<{ type: string; title: string; when: string }>;
}

const ReportsDashboard: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      const [auditsApi, constatsApi, recsApi, plansApi, projectsApi] = await Promise.all([
        auditAPI.getAllAudits().catch(() => null),
        // If backend can’t return “all constats”, fallback to localStorage below
        auditAPI.getConstats('all').catch(() => null),
        recommandationAPI.getAllRecommandations().catch(() => null),
        planActionAPI.getAllPlanActions().catch(() => null),
        projetAPI.getAllProjets().catch(() => null),
      ]);

      const audits = Array.isArray(auditsApi)
        ? auditsApi
        : JSON.parse(localStorage.getItem('newAudits') || '[]');
      const constats = Array.isArray(constatsApi)
        ? constatsApi
        : JSON.parse(localStorage.getItem('constats') || '[]');
      const recommandations = Array.isArray(recsApi)
        ? recsApi
        : JSON.parse(localStorage.getItem('recommandations') || '[]');
      const planActions = Array.isArray(plansApi)
        ? plansApi
        : JSON.parse(localStorage.getItem('planActions') || '[]');
      const projects = Array.isArray(projectsApi)
        ? projectsApi
        : JSON.parse(localStorage.getItem('projects') || '[]');

      const auditsCompleted = audits.filter((a: any) => a.statut === 'Terminé').length;
      const constatsCritical = constats.filter((c: any) => (c.criticite || '').toLowerCase().includes('crit')).length;
      const recommandationsPending = recommandations.filter((r: any) => (r.statut || '').toLowerCase().includes('attente')).length;
      const planActionsInProgress = planActions.filter((p: any) => p.statut === 'En cours').length;

      const recent = [
        ...constats.slice(0, 2).map((c: any) => ({
          type: 'constat',
          title: c.description || 'Constat',
          when: new Date(c.createdAt || Date.now()).toLocaleDateString('fr-FR'),
        })),
        ...recommandations.slice(0, 2).map((r: any) => ({
          type: 'recommandation',
          title: r.titre || 'Recommandation',
          when: new Date(r.createdAt || Date.now()).toLocaleDateString('fr-FR'),
        })),
      ].slice(0, 4);

      setReportData({
        auditsTotal: audits.length,
        auditsCompleted,
        projectsTotal: projects.length,
        constatsTotal: constats.length,
        constatsCritical,
        recommandationsTotal: recommandations.length,
        recommandationsPending,
        planActionsTotal: planActions.length,
        planActionsInProgress,
        recentItems: recent,
      });
    } catch (e) {
      setReportData({
        auditsTotal: 0,
        auditsCompleted: 0,
        projectsTotal: 0,
        constatsTotal: 0,
        constatsCritical: 0,
        recommandationsTotal: 0,
        recommandationsPending: 0,
        planActionsTotal: 0,
        planActionsInProgress: 0,
        recentItems: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      </AppLayout>
    );
  }

  if (!reportData) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-gray-400">Aucune donnée disponible pour les rapports.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">📊 Rapports et Analytics</h1>
              <p className="text-slate-400">Tableau de bord des performances et statistiques</p>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>Période:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-2 py-1 border border-slate-700 bg-slate-900 rounded"
              >
                <option value="30d">30 jours</option>
                <option value="90d">90 jours</option>
                <option value="all">Tout</option>
              </select>
            </div>
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              ⚠️ {reportData.constatsCritical} constats critiques à traiter
            </div>
            <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
              ⏳ {reportData.planActionsInProgress} plans d’action en cours
            </div>
            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
              📝 {reportData.recommandationsPending} recommandations en attente
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-slate-800 rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">📋 Synthèse des données</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">En cours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Terminé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Audits</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{reportData.auditsTotal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{reportData.auditsTotal - reportData.auditsCompleted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400">{reportData.auditsCompleted}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">
                      {reportData.auditsTotal > 0 ? Math.round((reportData.auditsCompleted / reportData.auditsTotal) * 100) : 0}% complet
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Projets</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{reportData.projectsTotal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">Actif</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Constats</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{reportData.constatsTotal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{reportData.constatsCritical} critiques</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{reportData.constatsTotal - reportData.constatsCritical}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                      {reportData.constatsCritical} à traiter
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Plans d'action</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{reportData.planActionsTotal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">{reportData.planActionsInProgress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400">{reportData.planActionsTotal - reportData.planActionsInProgress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                      {reportData.planActionsTotal > 0 ? Math.round(((reportData.planActionsTotal - reportData.planActionsInProgress) / reportData.planActionsTotal) * 100) : 0}% terminé
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📅 Activité récente</h3>
          {reportData.recentItems.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune activité récente.</p>
          ) : (
            <div className="space-y-3">
              {reportData.recentItems.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 pb-3 border-b border-slate-700 last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'constat' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                      <span className="text-sm">{item.type === 'constat' ? '🔍' : '💡'}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.when}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'constat' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {item.type === 'constat' ? 'Constat' : 'Rec.'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparative Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Analyse comparative</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Ratio Constats/Audits</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {reportData.auditsTotal > 0 ? (reportData.constatsTotal / reportData.auditsTotal).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">Moyenne de constats par audit</div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Taux de résolution</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {reportData.constatsTotal > 0 ? Math.round(((reportData.constatsTotal - reportData.constatsCritical) / reportData.constatsTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">Constats traités vs total</div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Recommandations actives</span>
                  <span className="text-sm font-semibold text-yellow-400">{reportData.recommandationsPending}</span>
                </div>
                <div className="text-xs text-slate-500">En attente de validation</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Points d'attention</h3>
            <div className="space-y-3">
              {reportData.constatsCritical > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-300">Constats critiques</span>
                    <span className="text-lg font-bold text-red-400">{reportData.constatsCritical}</span>
                  </div>
                  <p className="text-xs text-red-400/70 mt-1">Action immédiate requise</p>
                </div>
              )}
              {reportData.planActionsInProgress > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-300">Plans en cours</span>
                    <span className="text-lg font-bold text-yellow-400">{reportData.planActionsInProgress}</span>
                  </div>
                  <p className="text-xs text-yellow-400/70 mt-1">Suivi nécessaire</p>
                </div>
              )}
              {reportData.recommandationsPending > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300">Recommandations</span>
                    <span className="text-lg font-bold text-blue-400">{reportData.recommandationsPending}</span>
                  </div>
                  <p className="text-xs text-blue-400/70 mt-1">À valider</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase">Santé globale</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {reportData.constatsTotal > 0 ? Math.round(((reportData.constatsTotal - reportData.constatsCritical) / reportData.constatsTotal) * 100) : 100}%
                </p>
              </div>
              <div className="text-3xl">🟢</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Taux de conformité</p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase">Efficacité</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {reportData.recommandationsTotal > 0 ? Math.round(((reportData.recommandationsTotal - reportData.recommandationsPending) / reportData.recommandationsTotal) * 100) : 0}%
                </p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Recommandations appliquées</p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase">Charge</p>
                <p className="text-2xl font-bold text-white mt-1">{reportData.planActionsInProgress}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Actions en attente</p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase">Couverture</p>
                <p className="text-2xl font-bold text-white mt-1">{reportData.auditsTotal}</p>
              </div>
              <div className="text-3xl">🔍</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Audits réalisés</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Répartition des constats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-300">Critiques</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-white">{reportData.constatsCritical}</span>
                  <span className="text-xs text-slate-500">
                    {reportData.constatsTotal > 0 ? Math.round((reportData.constatsCritical / reportData.constatsTotal) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-slate-300">Traités</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-white">{reportData.constatsTotal - reportData.constatsCritical}</span>
                  <span className="text-xs text-slate-500">
                    {reportData.constatsTotal > 0 ? Math.round(((reportData.constatsTotal - reportData.constatsCritical) / reportData.constatsTotal) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">Total des constats identifiés: <span className="text-white font-semibold">{reportData.constatsTotal}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Performance des plans d'action</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-slate-300">Terminés</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-white">{reportData.planActionsTotal - reportData.planActionsInProgress}</span>
                  <span className="text-xs text-slate-500">
                    {reportData.planActionsTotal > 0 ? Math.round(((reportData.planActionsTotal - reportData.planActionsInProgress) / reportData.planActionsTotal) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-slate-300">En cours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-white">{reportData.planActionsInProgress}</span>
                  <span className="text-xs text-slate-500">
                    {reportData.planActionsTotal > 0 ? Math.round((reportData.planActionsInProgress / reportData.planActionsTotal) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">Total des plans d'action: <span className="text-white font-semibold">{reportData.planActionsTotal}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Summary */}
        <div className="bg-slate-800 rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">💡 État des recommandations</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-900 rounded-lg">
                <p className="text-3xl font-bold text-white mb-2">{reportData.recommandationsTotal}</p>
                <p className="text-sm text-slate-400">Total</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-3xl font-bold text-yellow-400 mb-2">{reportData.recommandationsPending}</p>
                <p className="text-sm text-slate-400">En attente</p>
              </div>
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-3xl font-bold text-emerald-400 mb-2">{reportData.recommandationsTotal - reportData.recommandationsPending}</p>
                <p className="text-sm text-slate-400">Validées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-md p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">📥 Générer un rapport</h3>
            <span className="text-xs text-slate-500">Période: {selectedPeriod === '30d' ? '30 derniers jours' : selectedPeriod === '90d' ? '90 derniers jours' : 'Tout'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <span>📄</span>
              <span>PDF Complet</span>
            </button>
            <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <span>📊</span>
              <span>Excel</span>
            </button>
            <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <span>📋</span>
              <span>CSV</span>
            </button>
            <a href="/audits" className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <span>🔍</span>
              <span>Détail</span>
            </a>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">ℹ️ Contenu du rapport:</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Synthèse complète des audits et constats</li>
              <li>• Analyse détaillée des recommandations</li>
              <li>• Suivi des plans d'action et indicateurs de performance</li>
              <li>• Graphiques et tableaux de bord analytiques</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsDashboard;
