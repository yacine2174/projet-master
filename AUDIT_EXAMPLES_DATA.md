# 📋 Exemples de Données Réelles pour Audits de Sécurité

Ce document contient des exemples complets et réalistes de données pour tester le système d'audit de sécurité. Chaque exemple suit strictement le workflow défini : Audit → Constats → (Recommandations → Plans d'Action) → Projet → (SWOT, Conception, Risques) → PAS.

---

## 🗂️ Workflow et Ordre de Création des Données

1. **Créer un Audit** (point de départ)
2. **Ajouter des Constats** à l'audit
3. **Pour chaque Constat :**
   - Créer une ou plusieurs Recommandations
   - Pour chaque Recommandation, créer un ou plusieurs Plans d'Action
   - Créer un Projet (après le constat, jamais avant)
   - Pour chaque Projet : créer une analyse SWOT, une Conception, et un ou plusieurs Risques
4. **Après validation du Projet :** Générer le PAS avec toutes les informations du projet

**Schéma de relation :**
- Audit → Constats → (Recommandations → Plans d'Action)
- Constat → Projet → (SWOT, Conception, Risques) → PAS

> **Important :**  
> Respectez strictement cet ordre. Un projet est créé pour chaque constat (ou groupe de constats), jamais avant.  
> N'utilisez que les champs réellement présents dans le programme.

---

## 🏢 EXEMPLE 1: Audit de Sécurité - Banque Commerciale

### 1. AUDIT

**Informations de l'Audit :**
- **id**: AUDIT1
- **type**: Audit Technique
- **périmètre**: Applications web et mobiles de banque en ligne
- **objectifs**: Sécurisation des accès, conformité PCI DSS, protection des données clients
- **dateDébut**: 01/01/2025
- **dateFin**: 30/06/2025
- **normes**: ISO/IEC 27001:2013, PCI DSS v4.0
- **réglementations**: RGPD, Directive NIS 2, Règlement eIDAS, DSP2
- **entreprise**: Banque Centrale de Commerce (BCC)
- **contact**: Marie Dupont - DSI - marie.dupont@bcc-bank.fr - +33 1 45 67 89 01

---

### 2. CONSTATS pour AUDIT1

#### **Constat 1 - MFA Non Activée**
- **id**: C1
- **audit**: AUDIT1
- **description**: MFA non activée sur 120 comptes administrateurs (40% du total)
- **type**: Technique
- **criticité**: Élevée
- **impact**: Risque d'accès non autorisé à des systèmes critiques en cas de compromission de credentials
- **probabilité**: Élevée

##### Recommandations pour C1
- **id**: R1
- **constat**: C1
- **contenu**: Déploiement MFA généralisé
- **priorité**: Élevée
- **complexité**: Faible
- **statut**: En attente

###### Plans d'Action pour R1
- **id**: PA1
- **recommandation**: R1
- **titre**: Activation MFA pour comptes privilégiés
- **description**: Communication et formation des administrateurs, activation progressive par groupes de 30 comptes, vérification et support utilisateurs, activation forcée pour comptes restants
- **priorité**: Élevée
- **responsable**: Sophie Bernard (Ingénieur Sécurité)
- **échéance**: 31/01/2025
- **budget**: 5 000 €

##### Projet pour C1
- **id**: P1
- **constat**: C1
- **nom**: Projet MFA Administrateurs
- **périmètre**: Comptes administrateurs SI
- **budget**: 5 000 €
- **priorité**: Élevée
- **dateDébut**: 01/02/2025
- **dateFin**: 31/03/2025
- **statut**: En cours

###### SWOT pour P1
- **id**: S1
- **projet**: P1
- **forces**: Équipe sécurité expérimentée, budget dédié, solution Duo Security déjà déployée
- **faiblesses**: MFA non généralisé, documentation obsolète, résistance au changement
- **opportunités**: Budget SIEM, migration cloud, formation continue
- **menaces**: Attaques ransomware, pénurie de talents, phishing ciblé

###### Conception pour P1
- **id**: CO1
- **projet**: P1
- **nomFichier**: MFA_Design.pdf
- **typeFichier**: PDF
- **commentaire**: Architecture MFA validée avec Duo Security, intégration Active Directory

###### Risques pour P1
- **id**: RI1
- **projet**: P1
- **description**: Retard de déploiement MFA
- **type**: Organisationnel
- **priorité**: Moyenne
- **niveauRisque**: Moyen
- **impact**: Élevé
- **probabilité**: Moyenne

---

#### **Constat 2 - Serveurs Hors Support**
- **id**: C2
- **audit**: AUDIT1
- **description**: 23 serveurs Windows Server 2012 R2 hors support étendu encore en production
- **type**: Technique
- **criticité**: Critique
- **impact**: Exposition à des vulnérabilités sans correctif disponible
- **probabilité**: Élevée

##### Recommandations pour C2
- **id**: R2
- **constat**: C2
- **contenu**: Migration serveurs hors support
- **priorité**: Critique
- **complexité**: Élevée
- **statut**: En attente

###### Plans d'Action pour R2
- **id**: PA2
- **recommandation**: R2
- **titre**: Migration Windows Server 2012 R2
- **description**: Inventaire détaillé et analyse compatibilité applications, migration 8 serveurs non-critiques (DEV/TEST), migration 10 serveurs pré-production, migration 5 serveurs production avec plan de rollback, décommissionnement définitif
- **priorité**: Critique
- **responsable**: Thomas Petit (Admin Système)
- **échéance**: 30/06/2025
- **budget**: 80 000 €

##### Projet pour C2
- **id**: P2
- **constat**: C2
- **nom**: Projet Migration Windows Server
- **périmètre**: Infrastructure serveurs
- **budget**: 80 000 €
- **priorité**: Critique
- **dateDébut**: 01/02/2025
- **dateFin**: 30/06/2025
- **statut**: En cours

###### SWOT pour P2
- **id**: S2
- **projet**: P2
- **forces**: Équipe technique expérimentée, budget validé, plan de migration détaillé
- **faiblesses**: Applications legacy, contraintes de production, complexité technique
- **opportunités**: Modernisation infrastructure, amélioration sécurité, formation équipes
- **menaces**: Risque d'arrêt production, incompatibilités applications, retards

###### Conception pour P2
- **id**: CO2
- **projet**: P2
- **nomFichier**: Migration_Architecture.pdf
- **typeFichier**: PDF
- **commentaire**: Architecture de migration vers Windows Server 2022 avec plan de rollback

###### Risques pour P2
- **id**: RI2
- **projet**: P2
- **description**: Incompatibilité applications lors de la migration
- **type**: Technique
- **priorité**: Élevée
- **niveauRisque**: Élevé
- **impact**: Critique
- **probabilité**: Moyenne

---

#### **Constat 3 - Politique Mots de Passe**
- **id**: C3
- **audit**: AUDIT1
- **description**: Politique de mot de passe insuffisante (8 caractères minimum au lieu de 14 recommandés)
- **type**: Technique
- **criticité**: Moyenne
- **impact**: Facilitation des attaques par force brute ou dictionnaire
- **probabilité**: Moyenne

##### Recommandations pour C3
- **id**: R3
- **constat**: C3
- **contenu**: Renforcement politique de mots de passe
- **priorité**: Moyenne
- **complexité**: Faible
- **statut**: En attente

###### Plans d'Action pour R3
- **id**: PA3
- **recommandation**: R3
- **titre**: Renforcement politique mots de passe
- **description**: Modification GPO Active Directory pour imposer 14 caractères minimum, rotation 90 jours, historique 24 mots de passe, complexité obligatoire
- **priorité**: Moyenne
- **responsable**: Thomas Petit (Admin Système)
- **échéance**: 28/02/2025
- **budget**: 2 000 €

##### Projet pour C3
- **id**: P3
- **constat**: C3
- **nom**: Projet Renforcement Mots de Passe
- **périmètre**: Politique Active Directory
- **budget**: 2 000 €
- **priorité**: Moyenne
- **dateDébut**: 01/03/2025
- **dateFin**: 31/03/2025
- **statut**: Planifié

###### SWOT pour P3
- **id**: S3
- **projet**: P3
- **forces**: GPO Active Directory en place, équipe technique compétente
- **faiblesses**: Résistance utilisateurs, applications legacy
- **opportunités**: Amélioration sécurité, formation utilisateurs
- **menaces**: Augmentation tickets support, résistance au changement

###### Conception pour P3
- **id**: CO3
- **projet**: P3
- **nomFichier**: Password_Policy_Design.pdf
- **typeFichier**: PDF
- **commentaire**: Nouvelle politique de mots de passe avec GPO Active Directory

###### Risques pour P3
- **id**: RI3
- **projet**: P3
- **description**: Augmentation des tickets support utilisateurs
- **type**: Organisationnel
- **priorité**: Faible
- **niveauRisque**: Faible
- **impact**: Faible
- **probabilité**: Élevée

---

#### **Constat 4 - Chiffrement Postes Mobiles**
- **id**: C4
- **audit**: AUDIT1
- **description**: Absence de chiffrement des données sur 15 ordinateurs portables de direction
- **type**: Technique
- **criticité**: Élevée
- **impact**: Risque de fuite de données en cas de perte ou vol
- **probabilité**: Moyenne

##### Recommandations pour C4
- **id**: R4
- **constat**: C4
- **contenu**: Chiffrement des postes mobiles
- **priorité**: Élevée
- **complexité**: Faible
- **statut**: En attente

###### Plans d'Action pour R4
- **id**: PA4
- **recommandation**: R4
- **titre**: Déploiement BitLocker
- **description**: Déploiement BitLocker via GPO sur tous les ordinateurs portables, intégration avec Active Directory pour récupération des clés, formation utilisateurs
- **priorité**: Élevée
- **responsable**: Claire Dubois (Développeur Sécurité)
- **échéance**: 15/02/2025
- **budget**: 3 000 €

##### Projet pour C4
- **id**: P4
- **constat**: C4
- **nom**: Projet Chiffrement Postes Mobiles
- **périmètre**: Ordinateurs portables direction
- **budget**: 3 000 €
- **priorité**: Élevée
- **dateDébut**: 01/02/2025
- **dateFin**: 28/02/2025
- **statut**: En cours

###### SWOT pour P4
- **id**: S4
- **projet**: P4
- **forces**: BitLocker intégré Windows, GPO Active Directory, équipe technique
- **faiblesses**: Performance postes, formation utilisateurs
- **opportunités**: Sécurisation données, conformité RGPD
- **menaces**: Perte clés de récupération, résistance utilisateurs

###### Conception pour P4
- **id**: CO4
- **projet**: P4
- **nomFichier**: BitLocker_Deployment.pdf
- **typeFichier**: PDF
- **commentaire**: Déploiement BitLocker avec récupération via Active Directory

###### Risques pour P4
- **id**: RI4
- **projet**: P4
- **description**: Perte des clés de récupération BitLocker
- **type**: Technique
- **priorité**: Moyenne
- **niveauRisque**: Moyen
- **impact**: Élevé
- **probabilité**: Faible

---

### 3. PAS pour Projets Validés

#### **PAS pour Projet P1 (MFA Administrateurs)**
- **id**: PAS1
- **projet**: P1
- **audit**: AUDIT1
- **version**: 1.0
- **dateCreation**: 01/04/2025
- **champApplication**: Comptes administrateurs SI
- **references**: ISO/IEC 27001:2013, PCI DSS v4.0, RGPD
- **organisationSecurite**: RSSI, équipe sécurité, DPO
- **analyseRisques**: Retard MFA, phishing, accès non autorisé
- **mesuresSecurite**: MFA Duo Security, formation, monitoring
- **pcaPra**: Sauvegarde, site secours, exercices
- **swotAnalyses**: (voir SWOT S1 ci-dessus)
- **risques**: (voir risques RI1 ci-dessus)

#### **PAS pour Projet P2 (Migration Windows Server)**
- **id**: PAS2
- **projet**: P2
- **audit**: AUDIT1
- **version**: 1.0
- **dateCreation**: 01/07/2025
- **champApplication**: Infrastructure serveurs
- **references**: ISO/IEC 27001:2013, PCI DSS v4.0
- **organisationSecurite**: RSSI, équipe technique, DSI
- **analyseRisques**: Incompatibilité applications, arrêt production
- **mesuresSecurite**: Migration progressive, tests, plan de rollback
- **pcaPra**: Sauvegarde, site secours, exercices
- **swotAnalyses**: (voir SWOT S2 ci-dessus)
- **risques**: (voir risques RI2 ci-dessus)

---

## 🏥 EXEMPLE 2: Audit de Sécurité - Hôpital Universitaire

### 1. AUDIT

**Informations de l'Audit :**
- **id**: AUDIT2
- **type**: Audit Organisationnel
- **périmètre**: Infrastructure réseau et équipements médicaux connectés
- **objectifs**: Sécurisation équipements médicaux, conformité HDS, protection données patients
- **dateDébut**: 15/01/2025
- **dateFin**: 31/12/2025
- **normes**: HDS (Hébergeur de Données de Santé), ISO/IEC 27001:2013, IEC 62304
- **réglementations**: RGPD, Code de la Santé Publique, Doctrine technique ARS
- **entreprise**: Centre Hospitalier Universitaire de Santé (CHUS)
- **contact**: Dr. Laurent Moreau - Directeur SI - laurent.moreau@chu-sante.fr - +33 4 76 12 34 56

---

### 2. CONSTATS pour AUDIT2

#### **Constat 1 - Équipements Médicaux Non Inventoriés**
- **id**: C5
- **audit**: AUDIT2
- **description**: 180 équipements médicaux connectés (pompes, moniteurs) non inventoriés dans CMDB
- **type**: Technique
- **criticité**: Critique
- **impact**: Impossibilité de gérer les vulnérabilités et mises à jour de sécurité
- **probabilité**: Élevée

##### Recommandations pour C5
- **id**: R5
- **constat**: C5
- **contenu**: Inventaire exhaustif équipements médicaux IoT
- **priorité**: Critique
- **complexité**: Moyenne
- **statut**: En attente

###### Plans d'Action pour R5
- **id**: PA5
- **recommandation**: R5
- **titre**: Inventaire et sécurisation équipements médicaux
- **description**: Acquisition outil découverte réseau (Armis ou Claroty), scan passif de tous les segments réseau, identification et catalogage équipements, analyse vulnérabilités et priorisation, intégration CMDB et plan de remédiation
- **priorité**: Critique
- **responsable**: Isabelle Roux (Ingénieur biomédical)
- **échéance**: 30/06/2025
- **budget**: 30 000 €

##### Projet pour C5
- **id**: P5
- **constat**: C5
- **nom**: Projet Inventaire Équipements Médicaux
- **périmètre**: Équipements médicaux connectés
- **budget**: 30 000 €
- **priorité**: Critique
- **dateDébut**: 01/02/2025
- **dateFin**: 30/06/2025
- **statut**: En cours

###### SWOT pour P5
- **id**: S5
- **projet**: P5
- **forces**: Équipe biomédicale expérimentée, budget validé, outils spécialisés
- **faiblesses**: Équipements non documentés, contraintes hospitalières
- **opportunités**: Amélioration sécurité, conformité HDS, formation équipes
- **menaces**: Interruption soins, résistance personnel médical

###### Conception pour P5
- **id**: CO5
- **projet**: P5
- **nomFichier**: Medical_Devices_Inventory.pdf
- **typeFichier**: PDF
- **commentaire**: Méthodologie d'inventaire des équipements médicaux connectés

###### Risques pour P5
- **id**: RI5
- **projet**: P5
- **description**: Interruption des soins pendant l'inventaire
- **type**: Organisationnel
- **priorité**: Élevée
- **niveauRisque**: Élevé
- **impact**: Critique
- **probabilité**: Faible

---

#### **Constat 2 - Comptes Partagés DPI**
- **id**: C6
- **audit**: AUDIT2
- **description**: Partage d'identifiants de connexion au DPI entre médecins d'un même service (constaté dans 4 services sur 12)
- **type**: Organisationnel
- **criticité**: Élevée
- **impact**: Non-traçabilité des accès aux dossiers patients, non-conformité RGPD
- **probabilité**: Très élevée

##### Recommandations pour C6
- **id**: R6
- **constat**: C6
- **contenu**: Suppression comptes partagés et déploiement SSO médical
- **priorité**: Élevée
- **complexité**: Élevée
- **statut**: En attente

###### Plans d'Action pour R6
- **id**: PA6
- **recommandation**: R6
- **titre**: Déploiement SSO médical
- **description**: Désactivation immédiate des comptes génériques, déploiement solution SSO avec carte CPS, formation médecins, mise en place d'audits d'accès trimestriels
- **priorité**: Élevée
- **responsable**: Émilie Gauthier (Chef de projet DPI)
- **échéance**: 30/09/2025
- **budget**: 50 000 €

##### Projet pour C6
- **id**: P6
- **constat**: C6
- **nom**: Projet SSO Médical
- **périmètre**: Accès DPI
- **budget**: 50 000 €
- **priorité**: Élevée
- **dateDébut**: 01/03/2025
- **dateFin**: 30/09/2025
- **statut**: Planifié

###### SWOT pour P6
- **id**: S6
- **projet**: P6
- **forces**: Solution SSO disponible, équipe projet dédiée
- **faiblesses**: Résistance médecins, complexité technique
- **opportunités**: Conformité RGPD, traçabilité accès
- **menaces**: Interruption soins, formation utilisateurs

###### Conception pour P6
- **id**: CO6
- **projet**: P6
- **nomFichier**: SSO_Medical_Design.pdf
- **typeFichier**: PDF
- **commentaire**: Architecture SSO avec cartes CPS pour accès DPI

###### Risques pour P6
- **id**: RI6
- **projet**: P6
- **description**: Résistance des médecins au changement
- **type**: Organisationnel
- **priorité**: Moyenne
- **niveauRisque**: Moyen
- **impact**: Moyen
- **probabilité**: Élevée

---

### 3. PAS pour Projets Validés

#### **PAS pour Projet P5 (Inventaire Équipements Médicaux)**
- **id**: PAS3
- **projet**: P5
- **audit**: AUDIT2
- **version**: 1.0
- **dateCreation**: 01/07/2025
- **champApplication**: Équipements médicaux connectés
- **references**: HDS, ISO/IEC 27001:2013, IEC 62304
- **organisationSecurite**: Responsable SI, Ingénieur biomédical, DPO
- **analyseRisques**: Interruption soins, vulnérabilités équipements
- **mesuresSecurite**: Inventaire, segmentation, monitoring
- **pcaPra**: Sauvegarde, site secours, exercices
- **swotAnalyses**: (voir SWOT S5 ci-dessus)
- **risques**: (voir risques RI5 ci-dessus)

---

## 🏭 EXEMPLE 3: Audit de Sécurité - Industrie Pharmaceutique

### 1. AUDIT

**Informations de l'Audit :**
- **id**: AUDIT3
- **type**: Audit Technique
- **périmètre**: Serveurs de production et systèmes SCADA
- **objectifs**: Sécurisation OT/SCADA, conformité FDA, protection processus production
- **dateDébut**: 01/02/2025
- **dateFin**: 31/08/2025
- **normes**: FDA 21 CFR Part 11, ISO/IEC 27001:2013, IEC 62443 (ISA/IEC), GAMP 5
- **réglementations**: BPF (Bonnes Pratiques de Fabrication), RGPD, Directive 2001/83/CE
- **entreprise**: PharmaLife Industries SAS
- **contact**: Béatrice Fontaine - Directrice Qualité & IT - beatrice.fontaine@pharmalife.com - +33 3 89 45 67 89

---

### 2. CONSTATS pour AUDIT3

#### **Constat 1 - SCADA Windows 7**
- **id**: C7
- **audit**: AUDIT3
- **description**: 35 systèmes SCADA sous Windows 7 Embedded hors support Microsoft (fin janvier 2020)
- **type**: Technique
- **criticité**: Critique
- **impact**: Exposition à 150+ CVE sans correctif disponible, non-conformité future FDA
- **probabilité**: Élevée

##### Recommandations pour C7
- **id**: R7
- **constat**: C7
- **contenu**: Migration SCADA vers OS supportés
- **priorité**: Critique
- **complexité**: Très élevée
- **statut**: En attente

###### Plans d'Action pour R7
- **id**: PA7
- **recommandation**: R7
- **titre**: Migration progressive SCADA Windows 10 IoT
- **description**: Analyse détaillée compatibilité applications + POC sur 1 système non-critique, migration 5 systèmes non-critiques (packaging) + validation CSV, migration 10 systèmes semi-critiques (conditionnement), migration 10 systèmes production (fermentation), migration 10 derniers systèmes critiques (remplissage aseptique)
- **priorité**: Critique
- **responsable**: Caroline Mercier (Responsable OT Security) + Laurent Girard (Ingénieur validation)
- **échéance**: 31/03/2026
- **budget**: 1 800 000 €

##### Projet pour C7
- **id**: P7
- **constat**: C7
- **nom**: Projet Migration SCADA
- **périmètre**: Systèmes SCADA production
- **budget**: 1 800 000 €
- **priorité**: Critique
- **dateDébut**: 01/03/2025
- **dateFin**: 31/03/2026
- **statut**: Planifié

###### SWOT pour P7
- **id**: S7
- **projet**: P7
- **forces**: Budget validé, équipe OT expérimentée, plan détaillé
- **faiblesses**: Complexité technique, contraintes production
- **opportunités**: Modernisation infrastructure, conformité FDA
- **menaces**: Arrêt production, incompatibilités, retards

###### Conception pour P7
- **id**: CO7
- **projet**: P7
- **nomFichier**: SCADA_Migration_Architecture.pdf
- **typeFichier**: PDF
- **commentaire**: Architecture de migration SCADA vers Windows 10 IoT LTSC

###### Risques pour P7
- **id**: RI7
- **projet**: P7
- **description**: Arrêt de production lors de la migration
- **type**: Technique
- **priorité**: Critique
- **niveauRisque**: Critique
- **impact**: Critique
- **probabilité**: Moyenne

---

### 3. PAS pour Projets Validés

#### **PAS pour Projet P7 (Migration SCADA)**
- **id**: PAS4
- **projet**: P7
- **audit**: AUDIT3
- **version**: 1.0
- **dateCreation**: 01/04/2026
- **champApplication**: Systèmes SCADA production
- **references**: FDA 21 CFR Part 11, ISO/IEC 27001:2013, IEC 62443
- **organisationSecurite**: Directeur IT, Responsable OT Security, Ingénieur validation
- **analyseRisques**: Arrêt production, incompatibilités, retards
- **mesuresSecurite**: Migration progressive, tests, validation CSV
- **pcaPra**: Sauvegarde, site secours, exercices
- **swotAnalyses**: (voir SWOT S7 ci-dessus)
- **risques**: (voir risques RI7 ci-dessus)

---

## 🏢 EXEMPLE 4: Audit de Sécurité - Entreprise E-commerce

### 1. AUDIT

**Informations de l'Audit :**
- **id**: AUDIT4
- **type**: Audit Technique
- **périmètre**: Solutions de sécurité (WAF, SIEM, EDR) et applications web
- **objectifs**: Sécurisation plateforme e-commerce, conformité PCI DSS, protection données clients
- **dateDébut**: 01/03/2025
- **dateFin**: 31/07/2025
- **normes**: ISO/IEC 27001:2013, PCI DSS v4.0, OWASP Top 10
- **réglementations**: RGPD, DSP2, Directive sur le commerce électronique
- **entreprise**: ShopOnline France SAS
- **contact**: Alexandre Petit - CTO - alexandre.petit@shoponline.fr - +33 1 82 34 56 78

---

### 2. CONSTATS pour AUDIT4

#### **Constat 1 - Secrets en Clair dans Git**
- **id**: C8
- **audit**: AUDIT4
- **description**: 78 secrets (clés API, tokens, mots de passe) trouvés en clair dans historique Git de 45 repositories
- **type**: Technique
- **criticité**: Critique
- **impact**: Compromission potentielle complète de l'infrastructure cloud
- **probabilité**: Élevée

##### Recommandations pour C8
- **id**: R8
- **constat**: C8
- **contenu**: Migration secrets vers AWS Secrets Manager
- **priorité**: Critique
- **complexité**: Moyenne
- **statut**: En attente

###### Plans d'Action pour R8
- **id**: PA8
- **recommandation**: R8
- **titre**: Sécurisation gestion des secrets
- **description**: Scan TruffleHog de tous repos + inventaire secrets, rotation urgente secrets exposés (78 identifiés), setup AWS Secrets Manager + IAM policies, migration progressive secrets par application (15 apps), implémentation pre-commit hooks + formation devs
- **priorité**: Critique
- **responsable**: Mathieu Dubois (Lead DevSecOps) + Sarah Cohen (Security Engineer)
- **échéance**: 15/05/2025
- **budget**: 15 000 €

##### Projet pour C8
- **id**: P8
- **constat**: C8
- **nom**: Projet Sécurisation Secrets
- **périmètre**: Gestion des secrets
- **budget**: 15 000 €
- **priorité**: Critique
- **dateDébut**: 01/03/2025
- **dateFin**: 15/05/2025
- **statut**: En cours

###### SWOT pour P8
- **id**: S8
- **projet**: P8
- **forces**: Équipe DevSecOps compétente, AWS Secrets Manager disponible
- **faiblesses**: Nombreux secrets exposés, résistance développeurs
- **opportunités**: Amélioration sécurité, automatisation
- **menaces**: Compromission infrastructure, fuite secrets

###### Conception pour P8
- **id**: CO8
- **projet**: P8
- **nomFichier**: Secrets_Management_Design.pdf
- **typeFichier**: PDF
- **commentaire**: Architecture de gestion des secrets avec AWS Secrets Manager

###### Risques pour P8
- **id**: RI8
- **projet**: P8
- **description**: Compromission des secrets pendant la migration
- **type**: Technique
- **priorité**: Critique
- **niveauRisque**: Critique
- **impact**: Critique
- **probabilité**: Faible

---

### 3. PAS pour Projets Validés

#### **PAS pour Projet P8 (Sécurisation Secrets)**
- **id**: PAS5
- **projet**: P8
- **audit**: AUDIT4
- **version**: 1.0
- **dateCreation**: 01/06/2025
- **champApplication**: Gestion des secrets
- **references**: ISO/IEC 27001:2013, PCI DSS v4.0, OWASP Top 10
- **organisationSecurite**: CTO, Lead DevSecOps, Security Engineer
- **analyseRisques**: Compromission secrets, fuite infrastructure
- **mesuresSecurite**: AWS Secrets Manager, rotation automatique, pre-commit hooks
- **pcaPra**: Sauvegarde, site secours, exercices
- **swotAnalyses**: (voir SWOT S8 ci-dessus)
- **risques**: (voir risques RI8 ci-dessus)

---

## 📚 Notes d'Utilisation

### Comment utiliser ces exemples:

1. **Pour les Audits**: Utilisez les informations de la section "AUDIT" avec les normes appropriées
2. **Pour les Constats**: Chaque constat est lié à un audit spécifique
3. **Pour les Recommandations**: Chaque recommandation est liée à un constat
4. **Pour les Plans d'Action**: Chaque plan d'action est lié à une recommandation
5. **Pour les Projets**: Chaque projet est créé pour un constat spécifique
6. **Pour SWOT**: Chaque projet a une analyse SWOT unique
7. **Pour Conception**: Chaque projet a une conception documentée
8. **Pour Risques**: Chaque projet peut avoir plusieurs risques
9. **Pour PAS**: Généré après validation du projet avec toutes les informations

### Conseils:

- Respectez strictement l'ordre de création : Audit → Constats → Recommandations → Plans d'Action → Projet → SWOT/Conception/Risques → PAS
- Un projet est créé pour chaque constat, jamais avant
- N'utilisez que les champs réellement présents dans le programme
- Adaptez les dates et budgets selon vos besoins de test
- Chaque exemple est complet et permet de tester toutes les fonctionnalités

### Secteurs couverts:

1. **Banque** - Audit technique avec focus infrastructure et compliance financière
2. **Santé** - Audit organisationnel avec équipements médicaux et HDS
3. **Industrie** - Audit technique OT/SCADA avec conformité FDA
4. **E-commerce** - Audit technique cloud avec focus DevSecOps

Bonne utilisation ! 🚀