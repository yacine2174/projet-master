# PAS Data Analysis - Information Availability

## ✅ INFORMATION WE HAVE (Auto-fillable)

### Header Section
| PAS Field | Source | Entity | Field Name |
|-----------|--------|--------|------------|
| **Projet** | ✅ Available | `Projet` | `nom` |
| **Entreprise** | ✅ Available | `Projet` | `entrepriseNom` |
| **Date** | ✅ Auto | `PAS` | `dateDocument` (auto-generated) |
| **Version** | ✅ Available | `PAS` | `version` (default: 1.0) |

### 1. Objet du document
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| Project name | ✅ Available | `Projet` | `nom` |
| Basic description | ✅ Can generate | Auto | Template text |

### 2. Champ d'application
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **Locaux et infrastructures** | ✅ Available | `Projet` | `perimetre` |
| **Systèmes d'information** | ⚠️ Partial | `Projet` | `perimetre` (may include SI info) |
| **Personnels** | ❌ Missing | - | Not stored |

### 3. Références
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **Normes ISO** | ✅ Available | `Audit` → `Norme` | `normes[]` (e.g., ISO 27001, 27002) |
| **Politique de sécurité** | ⚠️ Partial | `Projet` | Can use `entrepriseNom` |
| **Réglementation** | ❌ Missing | - | Not stored (RGPD, Code du travail, etc.) |

### 4. Organisation de la sécurité
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **RSP (Nom, fonction)** | ✅ Available | `Utilisateur` (creerPar) | `nom`, `role` (RSSI/SSI) |
| **Rôles et responsabilités** | ❌ Missing | - | Not stored |

### 5. Analyse des risques
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **Identification des menaces** | ✅ Available | `SWOT` | `menaces` |
| **Évaluation des impacts** | ✅ Available | `Risque` | `impact` (Faible/Moyen/Élevé) |
| **Mesures de prévention** | ⚠️ Partial | `Risque` | `decision` (Accepter/Réduire/Transférer/Empêcher) |

### 6. Mesures de sécurité
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **6.1 Sécurité physique** | ❌ Missing | - | Not stored (contrôle d'accès, vidéosurveillance, incendie) |
| **6.2 Sécurité logique** | ❌ Missing | - | Not stored (MFA, sauvegardes, chiffrement, pare-feu) |
| **6.3 Sécurité organisationnelle** | ❌ Missing | - | Not stored (formation, habilitation, confidentialité) |

### 7. Plan de continuité et reprise d'activité (PCA/PRA)
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **Procédures de sauvegarde** | ❌ Missing | - | Not stored |
| **Site de secours** | ❌ Missing | - | Not stored |
| **Exercices de simulation** | ❌ Missing | - | Not stored |

### 8. Suivi et audit
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **Réunions de suivi** | ❌ Missing | - | Not stored |
| **Audit interne** | ⚠️ Partial | `Audit` | `statut`, dates (but not follow-up schedule) |
| **KPI** | ✅ Available | `Audit` | `kpis[]` (label, valeur) |

### 9. Annexes
| Info | Source | Entity | Field Name |
|------|--------|--------|------------|
| **Fiches de sensibilisation** | ❌ Missing | - | Not stored |
| **Modèle de registre des incidents** | ❌ Missing | - | Not stored |
| **Contacts d'urgence** | ⚠️ Partial | `Projet` | `entrepriseContact` (partial) |

---

## 🔴 MISSING INFORMATION - Action Required

### Critical Missing Fields (Should be added to existing entities)

#### **PROJET Entity - Add these fields:**
```javascript
// Security and Personnel Information
personnelsInternes: { type: String }, // "Équipe interne: 5 personnes (développeurs, analysts)"
personnelsExternes: { type: String }, // "Sous-traitants: 2 consultants externes"
contactsUrgence: [{ 
  nom: String, 
  fonction: String, 
  telephone: String, 
  email: String 
}],

// Compliance
reglementations: [{ type: String }], // ["RGPD", "Code du travail", "NIS 2"]
```

#### **New Entity Required: MESURES_SECURITE**
This is completely missing and should be created:
```javascript
// models/MesureSecurite.js
const mesureSecuriteSchema = new mongoose.Schema({
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet', required: true },
  
  // 6.1 Sécurité physique
  securitePhysique: {
    controleAcces: { type: String }, // "Badge RFID + code PIN"
    videosurveillance: { type: String }, // "Caméras 24/7 avec enregistrement 30 jours"
    protectionIncendie: { type: String } // "Détecteurs + extincteurs + alarme"
  },
  
  // 6.2 Sécurité logique
  securiteLogique: {
    authentification: { type: String }, // "MFA obligatoire pour tous les accès"
    sauvegardes: { type: String }, // "Sauvegardes quotidiennes + tests mensuels"
    chiffrement: { type: String }, // "AES-256 pour données sensibles"
    pareFeuAntivirus: { type: String } // "Pare-feu Fortigate + Kaspersky à jour"
  },
  
  // 6.3 Sécurité organisationnelle
  securiteOrganisationnelle: {
    formation: { type: String }, // "Formation annuelle obligatoire"
    habilitation: { type: String }, // "Procédure d'habilitation validée par RSSI"
    confidentialite: { type: String } // "Clause de confidentialité pour tous sous-traitants"
  }
});
```

#### **New Entity Required: PCA_PRA**
```javascript
// models/PCAPRA.js
const pcaPraSchema = new mongoose.Schema({
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet', required: true },
  
  sauvegardeRestauration: {
    frequence: { type: String }, // "Quotidienne"
    support: { type: String }, // "Cloud AWS S3 + NAS local"
    rpo: { type: String }, // "RPO: 24h, RTO: 4h"
    tests: { type: String } // "Tests trimestriels de restauration"
  },
  
  siteSecours: {
    type: { type: String }, // "Site de secours externalisé"
    localisation: { type: String }, // "Paris La Défense"
    capacite: { type: String } // "Capacité: 100% de la production"
  },
  
  exercicesSimulation: [{
    type: { type: String }, // "Simulation cyberattaque"
    frequence: { type: String }, // "Annuelle"
    derniereDate: { type: Date },
    prochaineDate: { type: Date }
  }]
});
```

#### **AUDIT Entity - Add these fields:**
```javascript
// Follow-up and governance
suiviSecurite: {
  reunionsFrequence: { type: String }, // "Mensuelles"
  reunionsProchaine: { type: Date },
  auditInterneFrequence: { type: String }, // "Semestriel"
  auditInterneProchain: { type: Date }
},

// Documentation
annexes: {
  fichesSensibilisation: [{ type: String }], // URLs or file references
  registreIncidents: { type: String } // URL to incident register
}
```

---

## 📊 SUMMARY

### Auto-fillable (Current State)
- ✅ **60%** can be auto-filled from existing data:
  - Project basic info (nom, entreprise, dates)
  - Risk analysis (from SWOT + Risque entities)
  - Some references (from Audit → Normes)
  - KPIs (from Audit.kpis)
  - RSP info (from Utilisateur)

### Requires New Data (Missing)
- ❌ **40%** requires new data storage:
  - Personnel details (internal/external teams)
  - Security measures (physical, logical, organizational) - **CRITICAL**
  - PCA/PRA details (backup, disaster recovery) - **CRITICAL**
  - Follow-up schedules (meetings, audits)
  - Annexes (training materials, incident register, emergency contacts)
  - Compliance regulations list

---

## 🎯 RECOMMENDED ACTIONS

### Priority 1 (Critical for PAS)
1. Create `MesureSecurite` entity with physical/logical/organizational security measures
2. Create `PCAPRA` entity with backup/recovery/disaster plans
3. Add `personnelsInternes`, `personnelsExternes`, `reglementations` to `Projet`

### Priority 2 (Important for completeness)
4. Add `suiviSecurite` and `annexes` fields to `Audit`
5. Add `contactsUrgence` array to `Projet`

### Priority 3 (Nice to have)
6. Create a `RolesResponsabilites` entity to store detailed security roles beyond just RSP

---

## 🔄 Current Auto-Generation Logic
The current `pasController.js` auto-generation uses:
- ✅ `Projet` → nom, perimetre, entrepriseNom
- ✅ `Audit` → normes, kpis
- ✅ `SWOT` → menaces (for risk identification)
- ✅ `Risque` → impact, decision
- ✅ `Utilisateur` → nom, role (for RSP)

**But it fills missing sections with generic placeholder text**, which is not ideal for a production PAS document.

