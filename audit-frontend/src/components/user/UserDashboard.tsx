import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../common/AppLayout';
import MetricBlock from '../common/MetricBlock';
import { auditAPI, projetAPI, constatAPI, recommandationAPI, planActionAPI } from '../../api/api';

interface Audit {
  _id: string;
  nom: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  createdAt: string;
}

interface Projet {
  _id: string;
  nom: string;
  statut: string;
  createdAt: string;
}

interface Constat {
  _id: string;
  description: string;
  criticite: string;
  statut: string;
  createdAt: string;
}

interface Recommandation {
  _id: string;
  titre: string;
  statut: string;
  createdAt: string;
}

interface PlanAction {
  _id: string;
  titre: string;
  statut: string;
  dateEcheance: string;
  createdAt: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const isSSI = user?.role === 'SSI';
  const isRSSI = user?.role === 'RSSI';
  const canSeeAudits = isSSI || isRSSI;

  // Real data state
  const [audits, setAudits] = useState<Audit[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [constats, setConstats] = useState<Constat[]>([]);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [planActions, setPlanActions] = useState<PlanAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data from APIs
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Load audits
        if (canSeeAudits) {
          try {
            const auditsData = await auditAPI.getAllAudits();
            setAudits(Array.isArray(auditsData) ? auditsData : []);
          } catch (error) {
            console.log('Failed to load audits:', error);
            setAudits([]);
          }
        }

        // Load projets
        try {
          const projetsData = await projetAPI.getAllProjets();
          setProjets(Array.isArray(projetsData) ? projetsData : []);
        } catch (error) {
          console.log('Failed to load projets:', error);
          setProjets([]);
        }

        // Load constats
        try {
          const constatsData = await constatAPI.getAllConstats();
          setConstats(Array.isArray(constatsData) ? constatsData : []);
        } catch (error) {
          console.log('Failed to load constats:', error);
          setConstats([]);
        }

        // Load recommandations
        try {
          const recommandationsData = await recommandationAPI.getAllRecommandations();
          setRecommandations(Array.isArray(recommandationsData) ? recommandationsData : []);
        } catch (error) {
          console.log('Failed to load recommandations:', error);
          setRecommandations([]);
        }

        // Load plan actions
        try {
          const planActionsData = await planActionAPI.getAllPlanActions();
          setPlanActions(Array.isArray(planActionsData) ? planActionsData : []);
        } catch (error) {
          console.log('Failed to load plan actions:', error);
          setPlanActions([]);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [canSeeAudits]);

  // Calculate statistics
  const stats = {
    audits: {
      total: audits.length,
      inProgress: audits.filter(a => a.statut === 'En cours').length,
      completed: audits.filter(a => a.statut === 'Terminé').length,
      pending: audits.filter(a => a.statut === 'En attente').length
    },
    projets: {
      total: projets.length,
      active: projets.filter(p => p.statut === 'En cours' || p.statut === 'Actif').length,
      completed: projets.filter(p => p.statut === 'Terminé').length,
      pending: projets.filter(p => p.statut === 'En attente').length
    },
    constats: {
      total: constats.length,
      critical: constats.filter(c => c.criticite === 'Critique').length,
      minor: constats.filter(c => c.criticite === 'Mineur').length,
      pending: constats.filter(c => c.statut === 'En attente').length
    },
    recommandations: {
      total: recommandations.length,
      pending: recommandations.filter(r => r.statut === 'En attente').length,
      completed: recommandations.filter(r => r.statut === 'Validée').length
    },
    planActions: {
      total: planActions.length,
      pending: planActions.filter(p => p.statut === 'En attente').length,
      completed: planActions.filter(p => p.statut === 'Terminé').length,
      overdue: planActions.filter(p => {
        if (!p.dateEcheance) return false;
        return new Date(p.dateEcheance) < new Date() && p.statut !== 'Terminé';
      }).length
    }
  };

  // Get upcoming deadlines (next 30 days)
  const getUpcomingDeadlines = (): Array<{
    id: string;
    type: string;
    title: string;
    date: string;
    urgency: string;
    link: string;
  }> => {
    const upcoming: Array<{
      id: string;
      type: string;
      title: string;
      date: string;
      urgency: string;
      link: string;
    }> = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Add plan actions with deadlines
    planActions.forEach(plan => {
      if (plan.dateEcheance && plan.statut !== 'Terminé') {
        const deadline = new Date(plan.dateEcheance);
        if (deadline <= thirtyDaysFromNow && deadline >= new Date()) {
          upcoming.push({
            id: plan._id,
            type: 'plan-action',
            title: plan.titre,
            date: plan.dateEcheance,
            urgency: deadline.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? 'urgent' : 'normal',
            link: `/plans-action/${plan._id}`
          });
        }
      }
    });

    // Add audits with end dates
    audits.forEach(audit => {
      if (audit.dateFin && audit.statut !== 'Terminé') {
        const deadline = new Date(audit.dateFin);
        if (deadline <= thirtyDaysFromNow && deadline >= new Date()) {
          upcoming.push({
            id: audit._id,
            type: 'audit',
            title: audit.nom,
            date: audit.dateFin,
            urgency: deadline.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? 'urgent' : 'normal',
            link: `/audits/${audit._id}`
          });
        }
      }
    });

    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get items requiring RSSI review/approval
  const getRSSIReviewItems = (): Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    link: string;
    priority: string;
  }> => {
    if (!isRSSI) return [];
    
    const reviewItems: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      link: string;
      priority: string;
    }> = [];
    
    // Audits pending approval
    audits.filter(a => a.statut === 'En attente').forEach(audit => {
      reviewItems.push({
        id: audit._id,
        type: 'audit',
        title: audit.nom,
        description: 'Audit en attente d\'approbation',
        link: `/audits/${audit._id}`,
        priority: 'high'
      });
    });

    // Recommandations pending validation
    recommandations.filter(r => r.statut === 'En attente').forEach(rec => {
      reviewItems.push({
        id: rec._id,
        type: 'recommandation',
        title: rec.titre,
        description: 'Recommandation en attente de validation',
        link: `/recommandations/${rec._id}`,
        priority: 'medium'
      });
    });

    // Plan actions pending approval
    planActions.filter(p => p.statut === 'En attente').forEach(plan => {
      reviewItems.push({
        id: plan._id,
        type: 'plan-action',
        title: plan.titre,
        description: 'Plan d\'action en attente d\'approbation',
        link: `/plans-action/${plan._id}`,
        priority: 'medium'
      });
    });

    return reviewItems;
  };

  // Get current workflow step based on actual data
  const getCurrentWorkflowStep = () => {
    if (audits.length === 0) return 1; // No audits, start with creating one
    if (audits.some(a => a.statut === 'En cours')) return 2; // Has active audit, work on constats
    if (constats.length > 0 && recommandations.length === 0) return 3; // Has constats, need recommandations
    if (recommandations.length > 0 && projets.length === 0) return 4; // Has recommandations, need projets
    return 4; // Default to projects
  };

  const currentStep = getCurrentWorkflowStep();
  const upcomingDeadlines = getUpcomingDeadlines();
  const rssiReviewItems = getRSSIReviewItems();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 0) return `${Math.abs(diffDays)}j en retard`;
    if (diffDays <= 7) return `Dans ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };


  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 text-red-400 bg-red-500/10';
      case 'medium': return 'border-orange-500 text-orange-400 bg-orange-500/10';
      case 'low': return 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
      default: return 'border-gray-500 text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des données...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-full mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bonjour, {user?.nom} 👋
          </h2>
          <p className="text-gray-400 text-lg">
            Voici un aperçu de votre activité et des métriques importantes
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {canSeeAudits && (
            <MetricBlock
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Audits"
              value={stats.audits.total}
              description={`${stats.audits.inProgress} en cours`}
              accentColor="text-emerald-400"
            />
          )}

          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            label="Projets"
            value={stats.projets.total}
            description={`${stats.projets.active} actifs`}
            accentColor="text-blue-400"
          />

          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
            label="Constats"
            value={stats.constats.total}
            description={`${stats.constats.critical} critiques`}
            accentColor="text-purple-400"
          />

          <MetricBlock
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            label="Plans d'Action"
            value={stats.planActions.total}
            description={`${stats.planActions.pending} en attente`}
            accentColor="text-orange-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Workflow Steps & RSSI Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workflow d'Audit - Now shows actual audits */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6">🔄 Workflow d'Audit</h3>
              <div className="space-y-4">
                {/* Step 1: Create Audit */}
                <div className={`card flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  currentStep === 1 ? 'border-emerald-500 bg-emerald-600/10 shadow-lg shadow-emerald-500/10' : 
                  currentStep > 1 ? 'border-emerald-600 bg-emerald-600/20' : 'border-gray-700 bg-gray-800'
                }`}>
                  <div className="flex-shrink-0">
                    {currentStep > 1 ? (
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === 1 ? 'bg-emerald-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400'
                      }`}>
                        1
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">Créer un Audit</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      {audits.length === 0 ? 'Aucun audit créé' : `${audits.length} audit(s) créé(s)`}
                    </p>
                    {currentStep === 1 && (
                      <Link to="/audits/new" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        Créer un audit
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Step 2: Constats */}
                <div className={`card flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  currentStep === 2 ? 'border-emerald-500 bg-emerald-600/10 shadow-lg shadow-emerald-500/10' : 
                  currentStep > 2 ? 'border-emerald-600 bg-emerald-600/20' : 'border-gray-700 bg-gray-800'
                }`}>
                  <div className="flex-shrink-0">
                    {currentStep > 2 ? (
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === 2 ? 'bg-emerald-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400'
                      }`}>
                        2
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">Constats & Preuves</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      {constats.length === 0 ? 'Aucun constat identifié' : `${constats.length} constat(s) identifié(s)`}
                    </p>
                    {currentStep === 2 && (
                      <Link to="/constats/new" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        Ajouter un constat
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Step 3: Recommandations */}
                <div className={`card flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  currentStep === 3 ? 'border-emerald-500 bg-emerald-600/10 shadow-lg shadow-emerald-500/10' : 
                  currentStep > 3 ? 'border-emerald-600 bg-emerald-600/20' : 'border-gray-700 bg-gray-800'
                }`}>
                  <div className="flex-shrink-0">
                    {currentStep > 3 ? (
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === 3 ? 'bg-emerald-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400'
                      }`}>
                        3
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">Recommandations</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      {recommandations.length === 0 ? 'Aucune recommandation' : `${recommandations.length} recommandation(s)`}
                    </p>
                    {currentStep === 3 && (
                      <Link to="/recommandations/new" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        Créer une recommandation
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Step 4: Projets */}
                <div className={`card flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  currentStep === 4 ? 'border-emerald-500 bg-emerald-600/10 shadow-lg shadow-emerald-500/10' : 'border-gray-700 bg-gray-800'
                }`}>
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep === 4 ? 'bg-emerald-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400'
                    }`}>
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">Projets & PAS</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      {projets.length === 0 ? 'Aucun projet créé' : `${projets.length} projet(s) créé(s)`}
                    </p>
                    {currentStep === 4 && (
                      <Link to="/projects/new" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        Créer un projet
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RSSI Review Section - Only for RSSI users */}
            {isRSSI && rssiReviewItems.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-6">🔍 À Réviser / Approuver</h3>
                <div className="space-y-3">
                  {rssiReviewItems.map((item, index) => (
                    <Link key={index} to={item.link} className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityClass(item.priority)}`}>
                          {item.priority === 'high' ? 'Urgent' : 'Normal'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Completed Audits */}
          <div className="lg:col-span-1 space-y-6">
            {/* À venir / Prochaines échéances - Now with clickable links */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6">📅 À venir / Prochaines échéances</h3>
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((deadline, index) => (
                    <Link key={index} to={deadline.link} className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${deadline.urgency === 'urgent' ? 'bg-red-400' : 'bg-orange-400'}`}></div>
                          <div>
                            <p className="text-gray-300 font-medium">{deadline.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{deadline.type.replace('-', ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-mono ${deadline.urgency === 'urgent' ? 'text-red-400' : 'text-orange-400'}`}>
                            {formatDate(deadline.date)}
                          </p>
                          {deadline.urgency === 'urgent' && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">URGENT</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Aucune échéance à venir.</p>
                )}
              </div>
            </div>

            {/* Audits Terminés - Expanded */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">✅ Audits Terminés</h3>
                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                  {audits.filter(a => a.statut === 'Terminé').length} audit(s)
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {audits.filter(a => a.statut === 'Terminé').length > 0 ? (
                  audits.filter(a => a.statut === 'Terminé').map((audit, index) => (
                    <Link key={index} to={`/audits/${audit._id}`} className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-emerald-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-300 font-medium text-base">{audit.nom}</p>
                            <p className="text-sm text-gray-500">{formatDate(audit.dateFin || audit.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="status-badge status-completed text-sm">Terminé</span>
                          <div className="mt-1">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Aucun audit terminé.</p>
                    <p className="text-slate-400 text-xs mt-1">Les audits terminés apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserDashboard;
