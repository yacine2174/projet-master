# ✅ PAS Data Now Comes from AUDIT (Not Project)

## 🎯 What Changed?

The PAS (Plan d'Assurance Sécurité) context information is now stored in the **Audit** instead of the **Project**. This makes more sense because:
- The audit is the security assessment
- Multiple projects can share the same audit
- Company/personnel info is more relevant to the audit scope

---

## 📝 How to Fill PAS Data

### **When Creating a NEW Audit**

1. Go to **Create Audit** page
2. Fill Steps 1-2 (Basic info, Context, Objectives)
3. **In Step 3 (Planning)** you'll see:
   - Date fields (required)
   - **NEW: PAS Information Section** 📄

4. Fill the PAS fields:
   ```
   🏢 Nom de l'Entreprise: "Acme Corp"
      → Appears in: "Politiques de sécurité"
   
   📞 Contact Entreprise: "contact@entreprise.fr"
   
   👥 Personnels Internes: "5 développeurs, 2 analysts, 1 chef de projet"
      → Appears in: "Champ d'application - Personnels"
   
   👤 Personnels Externes: "2 consultants externes en cybersécurité"
      → Appears in: "Champ d'application - Personnels"
   
   📋 Réglementations (one per line):
      RGPD
      ISO 27001
      Code du travail
      NIS 2
      → Appears in: "Références - Réglementations"
   ```

5. Complete Step 4 (Select Normes)
6. Create the audit

---

### **For EXISTING Audits**

To edit an existing audit and add PAS data, you need to edit the audit:

1. Go to **Audits** list
2. Click on your audit
3. Click **"Edit"** button
4. Update the PAS fields
5. Save

*Note: If the Audit detail page doesn't have edit functionality yet, let me know and I'll add it!*

---

## 🔄 How It Works

```
Audit (contains PAS context)
  ├── entrepriseNom → Politiques section
  ├── personnelsInternes → Champ d'application
  ├── personnelsExternes → Champ d'application
  └── reglementations[] → Références

          ↓ (linked to)

Project
  └── Uses audit data automatically

          ↓ (when PAS is generated)

PAS Document
  ├── Section 2: Champ d'application
  │   └── Personnels: [from audit.personnelsInternes + personnelsExternes]
  └── Section 3: Références
      ├── Politiques: [from audit.entrepriseNom]
      └── Réglementations: [from audit.reglementations]
```

---

## 🚀 Next Steps

1. **Refresh your browser** (Ctrl+F5)
2. **Create a new audit** or **edit existing audit**
3. **Fill the PAS information** in Step 3
4. **Create a project** linked to that audit
5. **Generate PAS** → All audit data appears automatically!

---

## ✅ Benefits

- **One source of truth**: Fill data once in the audit
- **Consistency**: All projects using the same audit get the same context
- **Less duplication**: No need to re-enter company info for each project
- **Makes sense**: Company context belongs to the security assessment (audit), not individual projects

---

## 🔍 What if I already filled data in Projects?

Don't worry! The old project fields still exist in the backend for backward compatibility. However:
- **NEW PAS generation** will read from the **Audit** first
- If audit fields are empty, it falls back to project fields
- You should gradually **migrate data from projects to audits**

---

## 📌 Summary

| Field | Old Location | New Location | Appears in PAS |
|-------|--------------|--------------|----------------|
| Nom de l'Entreprise | ~~Project~~ | **Audit** | Politiques |
| Contact Entreprise | ~~Project~~ | **Audit** | - |
| Personnels Internes | ~~Project~~ | **Audit** | Champ d'application |
| Personnels Externes | ~~Project~~ | **Audit** | Champ d'application |
| Réglementations | ~~Project~~ | **Audit** | Références |

---

## 🎉 You're All Set!

The backend is restarting now. Once ready, create/edit an audit and you'll see the PAS fields in Step 3! 

