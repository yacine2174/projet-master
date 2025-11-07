const Audit = require('../models/Audit');
const Constat = require('../models/Constat');
const Recommandation = require('../models/Recommandation');
const PlanAction = require('../models/PlanAction');
const Preuve = require('../models/Preuve');
const Projet = require('../models/Projet');
const SWOT = require('../models/SWOT');
const Risque = require('../models/Risques');
const Conception = require('../models/Conception');

// Normalize helpers (case-insensitive labels)
const norm = (s) => String(s || '').toLowerCase();

exports.getAuditSynthese = async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Audit.findById(id);
    if (!audit) return res.status(404).json({ message: 'Audit non trouvé' });

    // Fetch datasets
    const constats = await Constat.find({ audit: id }).populate('projet', '_id nom perimetre statut budget');
    console.log('[Synthese] audit', id, 'constats:', constats.length);
    const recommandations = await Recommandation.find({ constat: { $in: constats.map(c => c._id) } });

    // Plans d'action can be linked from recommandations.plansAction or reverse
    const paIdsFromRecs = recommandations.flatMap(r => Array.isArray(r.plansAction) ? r.plansAction : []);
    const planActionsByRec = await PlanAction.find({ _id: { $in: paIdsFromRecs } });

    // Reverse link: some schemas store reco ids inside planAction
    const planActionsReverse = await PlanAction.find({ recommandations: { $in: recommandations.map(r => r._id) } });
    const planActions = [...planActionsByRec, ...planActionsReverse].reduce((acc, pa) => {
      if (!acc.find(x => String(x._id) === String(pa._id))) acc.push(pa);
      return acc;
    }, []);

    const preuves = await Preuve.find({ audit: id });

    // Projects linked via populated constats.projet (unique)
    const projetsFromConstats = constats
      .map(c => (c.projet && c.projet._id ? c.projet : null))
      .filter(Boolean)
      .map(p => ({ _id: p._id, nom: p.nom, perimetre: p.perimetre, statut: p.statut, budget: p.budget }));
    const projetIds = constats
      .map(c => (c.projet && c.projet._id ? String(c.projet._id) : (c.projet ? String(c.projet) : null)))
      .filter(Boolean);
    // Fetch any remaining projects by ID to ensure completeness
    const existingIds = new Set(projetsFromConstats.map(p => String(p._id)));
    const missingIds = projetIds.filter(pid => !existingIds.has(String(pid)));
    const fetchedProjets = missingIds.length > 0 ? await Projet.find({ _id: { $in: missingIds } }) : [];
    const projets = [...projetsFromConstats, ...fetchedProjets].reduce((acc, p) => {
      const pid = String(p._id);
      if (!acc.find(x => String(x._id) === pid)) acc.push(p);
      return acc;
    }, []);
    console.log('[Synthese] projetIds from constats:', projetIds.length, 'unique projets resolved:', projets.length);

    // Fetch SWOT and Risks for those projects (map by projectId)
    const [swots, risques, conceptions] = await Promise.all([
      SWOT.find({ projet: { $in: projetIds } }),
      Risque.find({ projet: { $in: projetIds } }),
      Conception.find({ projet: { $in: projetIds } })
    ]);
    const swotByProjet = swots.reduce((acc, s) => {
      const key = String(s.projet);
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
    const risquesByProjet = risques.reduce((acc, r) => {
      const key = String(r.projet);
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    }, {});
    const conceptionsByProjet = conceptions.reduce((acc, c) => {
      const key = String(c.projet);
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});

    // Build stats
    const constatStats = {
      total: constats.length,
      ncMaj: constats.filter(c => norm(c.type) === 'nc maj' || norm(c.type) === 'nc majeure').length,
      ncMin: constats.filter(c => norm(c.type) === 'nc min' || norm(c.type) === 'nc mineure').length,
      observation: constats.filter(c => norm(c.type) === 'ps' || norm(c.type) === 'observation').length,
      critique: constats.filter(c => ['critique','élevée','elevee'].includes(norm(c.criticite))).length,
      moyenne: constats.filter(c => norm(c.criticite) === 'moyenne').length,
      faible: constats.filter(c => norm(c.criticite) === 'faible').length,
    };

    const recommandationStats = {
      total: recommandations.length,
      enAttente: recommandations.filter(r => norm(r.statut) === 'en attente').length,
      validee: recommandations.filter(r => norm(r.statut) === 'validée' || norm(r.statut) === 'validee').length,
      aRevoir: recommandations.filter(r => norm(r.statut) === 'à revoir' || norm(r.statut) === 'a revoir').length,
      critique: recommandations.filter(r => norm(r.priorite) === 'critique').length,
      elevee: recommandations.filter(r => norm(r.priorite) === 'élevée' || norm(r.priorite) === 'elevee').length,
      moyenne: recommandations.filter(r => norm(r.priorite) === 'moyenne').length,
      faible: recommandations.filter(r => norm(r.priorite) === 'faible').length,
    };

    const planActionStats = {
      total: planActions.length,
      enCours: planActions.filter(pa => norm(pa.statut) === 'en cours').length,
      termine: planActions.filter(pa => norm(pa.statut) === 'terminé' || norm(pa.statut) === 'termine').length,
      enAttente: planActions.filter(pa => norm(pa.statut) === 'en attente').length,
      critique: planActions.filter(pa => norm(pa.priorite) === 'critique').length,
      elevee: planActions.filter(pa => norm(pa.priorite) === 'élevée' || norm(pa.priorite) === 'elevee').length,
      moyenne: planActions.filter(pa => norm(pa.priorite) === 'moyenne').length,
      faible: planActions.filter(pa => norm(pa.priorite) === 'faible').length,
    };

    res.json({
      audit,
      data: {
        constats,
        recommandations,
        planActions,
        preuves,
        projets,
        swotByProjet,
        risquesByProjet,
        conceptionsByProjet,
      },
      stats: {
        constats: constatStats,
        recommandations: recommandationStats,
        planActions: planActionStats,
        preuves: { total: preuves.length },
      }
    });
  } catch (err) {
    console.error('Error building audit synthèse:', err);
    res.status(500).json({ message: err.message });
  }
};
