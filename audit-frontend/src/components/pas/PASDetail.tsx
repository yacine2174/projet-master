import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../common/Button';

const PASDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://192.168.100.244:3000/api/pas/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Erreur de chargement');
        const data = await res.json();
        setItem(data);
      } catch (e: any) {
        setError(e.message || 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (isLoading) return <div className="py-8 text-center">Chargement...</div>;
  if (error) return (
    <div className="text-center py-8">
      <div className="mb-4 text-red-600">{error}</div>
      <Button variant="primary" onClick={() => navigate(-1)}>← Retour</Button>
    </div>
  );
  if (!item) return null;

  const generatePDF = () => {
    const pasHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plan Assurance Sécurité (PAS)</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; font-size: 24px; }
    h2 { color: #34495e; margin-top: 30px; font-size: 18px; font-weight: 600; }
    .header-info { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; }
    .header-info p { margin: 5px 0; }
    .section { margin: 20px 0; page-break-inside: avoid; }
    .subsection { margin-left: 20px; margin-top: 10px; }
    ul { margin: 10px 0; padding-left: 30px; }
    li { margin: 5px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .grid-item { padding: 10px; background: #f8f9fa; border-radius: 4px; }
    .grid-item-label { font-weight: 600; color: #555; font-size: 14px; margin-bottom: 5px; }
    @media print { body { max-width: 100%; } }
  </style>
</head>
<body>
  <h1>Plan Assurance Sécurité (PAS)</h1>
  
  <div class="header-info">
    <p><strong>Projet :</strong> ${item.projet?.nom || '[Nom du projet]'}</p>
    <p><strong>Entreprise :</strong> ${item.projet?.entrepriseNom || '[Nom de l\'entreprise]'}</p>
    <p><strong>Date :</strong> ${new Date(item.dateDocument).toLocaleDateString('fr-FR')}</p>
    <p><strong>Version :</strong> ${item.version}</p>
  </div>

  <div class="section">
    <h2>1. Objet du document</h2>
    <p>${item.objet || 'N/A'}</p>
  </div>

  <div class="section">
    <h2>2. Champ d'application</h2>
    <p>Le présent PAS couvre :</p>
    <ul>
      <li><strong>Les locaux et infrastructures utilisés pour le projet :</strong><br>${item.champApplication?.locauxEtInfrastructures || 'N/A'}</li>
      <li><strong>Les systèmes d'information et données traitées :</strong><br>${item.champApplication?.systemesInformation || 'N/A'}</li>
      <li><strong>Les personnels internes et externes intervenant sur le projet :</strong><br>${item.champApplication?.personnels || 'N/A'}</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. Références</h2>
    <ul>
      <li><strong>Normes :</strong> ${(item.references?.normes || []).join(', ') || 'N/A'}</li>
      <li><strong>Politique de sécurité interne :</strong> ${(item.references?.politiques || []).join(', ') || 'N/A'}</li>
      <li><strong>Réglementation en vigueur :</strong> ${(item.references?.reglementations || []).join(', ') || 'N/A'}</li>
    </ul>
  </div>

  <div class="section">
    <h2>4. Organisation de la sécurité</h2>
    <p><strong>Responsable Sécurité Projet (RSP) :</strong> ${item.organisationSecurite?.rspNomFonction || 'N/A'}</p>
    <div class="subsection">
      <p><strong>Rôles et responsabilités :</strong></p>
      <ul>
        ${(item.organisationSecurite?.rolesEtResponsabilites || []).map((r: any) => 
          `<li><strong>${r.role || 'N/A'} :</strong> ${r.responsabilite || 'N/A'}</li>`
        ).join('')}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>5. Analyse des risques</h2>
    
    ${(item.swotAnalyses || []).length > 0 ? `
    <div class="subsection">
      <h3 style="color: #2c3e50; font-size: 16px; margin-top: 15px; margin-bottom: 10px;">Analyses SWOT</h3>
      ${(item.swotAnalyses || []).map((swot: any, index: number) => `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
          <p style="font-weight: 600; color: #555; margin-bottom: 10px;">Analyse #${index + 1} - ${new Date(swot.createdAt).toLocaleDateString('fr-FR')}</p>
          <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="font-weight: 600; color: #27ae60; margin-bottom: 5px;">💪 Forces</p>
              <p style="white-space: pre-wrap;">${swot.forces || 'N/A'}</p>
            </div>
            <div>
              <p style="font-weight: 600; color: #e74c3c; margin-bottom: 5px;">⚠️ Faiblesses</p>
              <p style="white-space: pre-wrap;">${swot.faiblesses || 'N/A'}</p>
            </div>
            <div>
              <p style="font-weight: 600; color: #3498db; margin-bottom: 5px;">🚀 Opportunités</p>
              <p style="white-space: pre-wrap;">${swot.opportunites || 'N/A'}</p>
            </div>
            <div>
              <p style="font-weight: 600; color: #e67e22; margin-bottom: 5px;">⚡ Menaces</p>
              <p style="white-space: pre-wrap;">${swot.menaces || 'N/A'}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${(item.risques || []).length > 0 ? `
    <div class="subsection">
      <h3 style="color: #2c3e50; font-size: 16px; margin-top: 15px; margin-bottom: 10px;">Analyse Détaillée des Risques</h3>
      ${(item.risques || []).map((risque: any, index: number) => `
        <div style="margin-bottom: 15px; padding: 12px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
          <p style="font-weight: 600; color: #856404; margin-bottom: 8px;">Risque #${index + 1} - ${new Date(risque.createdAt).toLocaleDateString('fr-FR')}</p>
          <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div><strong>Description:</strong> ${risque.description || 'N/A'}</div>
            <div><strong>Type:</strong> ${risque.type || 'N/A'}</div>
            <div><strong>Priorité:</strong> <span style="color: ${risque.priorite === 'Élevée' ? '#e74c3c' : risque.priorite === 'Moyenne' ? '#f39c12' : '#27ae60'};">${risque.priorite || 'N/A'}</span></div>
            <div><strong>Niveau de risque:</strong> ${risque.niveauRisque || 'N/A'}</div>
            <div><strong>Impact:</strong> ${risque.impact || 'N/A'}</div>
            <div><strong>Probabilité:</strong> ${risque.probabilite || 'N/A'}</div>
            <div style="grid-column: 1 / -1;"><strong>Décision:</strong> ${risque.decision || 'N/A'}</div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${(item.analyseRisques?.menaces || []).length > 0 || (item.analyseRisques?.evaluationImpacts || []).length > 0 || (item.analyseRisques?.mesuresPrevention || []).length > 0 ? `
    <div class="subsection">
      <h3 style="color: #2c3e50; font-size: 16px; margin-top: 15px; margin-bottom: 10px;">Synthèse de l'Analyse</h3>
      ${(item.analyseRisques?.menaces || []).length > 0 ? `
        <div style="margin-bottom: 10px;">
          <p style="font-weight: 600; margin-bottom: 5px;">Identification des menaces :</p>
          <ul style="margin-left: 20px;">
            ${(item.analyseRisques?.menaces || []).map((m: string) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${(item.analyseRisques?.evaluationImpacts || []).length > 0 ? `
        <div style="margin-bottom: 10px;">
          <p style="font-weight: 600; margin-bottom: 5px;">Évaluation des impacts :</p>
          <ul style="margin-left: 20px;">
            ${(item.analyseRisques?.evaluationImpacts || []).map((e: string) => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${(item.analyseRisques?.mesuresPrevention || []).length > 0 ? `
        <div style="margin-bottom: 10px;">
          <p style="font-weight: 600; margin-bottom: 5px;">Mesures de prévention retenues :</p>
          <ul style="margin-left: 20px;">
            ${(item.analyseRisques?.mesuresPrevention || []).map((m: string) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2>6. Mesures de sécurité</h2>
    <div class="subsection">
      <p><strong>6.1 Sécurité physique :</strong></p>
      <ul>
        ${(item.mesuresSecurite?.physique || []).map((p: string) => `<li>${p}</li>`).join('')}
      </ul>
    </div>
    <div class="subsection">
      <p><strong>6.2 Sécurité logique :</strong></p>
      <ul>
        ${(item.mesuresSecurite?.logique || []).map((l: string) => `<li>${l}</li>`).join('')}
      </ul>
    </div>
    <div class="subsection">
      <p><strong>6.3 Sécurité organisationnelle :</strong></p>
      <ul>
        ${(item.mesuresSecurite?.organisationnelle || []).map((o: string) => `<li>${o}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>7. Plan de continuité et reprise d'activité (PCA/PRA)</h2>
    <div class="subsection">
      <p><strong>Procédures de sauvegarde et de restauration :</strong></p>
      ${item.pcaPra?.sauvegardeRestauration?.procedures ? `<p>${item.pcaPra.sauvegardeRestauration.procedures}</p>` : ''}
      ${item.pcaPra?.sauvegardeRestauration?.frequenceTests ? `<p><strong>Fréquence des tests :</strong> ${item.pcaPra.sauvegardeRestauration.frequenceTests}</p>` : ''}
      ${!item.pcaPra?.sauvegardeRestauration?.procedures && !item.pcaPra?.sauvegardeRestauration?.frequenceTests ? '<p>N/A</p>' : ''}
    </div>
    <div class="subsection">
      <p><strong>Site de secours :</strong></p>
      ${item.pcaPra?.siteSecours?.description ? `<p>${item.pcaPra.siteSecours.description}</p>` : ''}
      ${item.pcaPra?.siteSecours?.adresse ? `<p><strong>Adresse :</strong> ${item.pcaPra.siteSecours.adresse}</p>` : ''}
      ${!item.pcaPra?.siteSecours?.description && !item.pcaPra?.siteSecours?.adresse ? '<p>N/A</p>' : ''}
    </div>
    <div class="subsection">
      <p><strong>Exercices de simulation de crise :</strong></p>
      ${item.pcaPra?.exercices?.description ? `<p>${item.pcaPra.exercices.description}</p>` : ''}
      ${item.pcaPra?.exercices?.frequence ? `<p><strong>Fréquence :</strong> ${item.pcaPra.exercices.frequence}</p>` : ''}
      ${!item.pcaPra?.exercices?.description && !item.pcaPra?.exercices?.frequence ? '<p>N/A</p>' : ''}
    </div>
  </div>

  <div class="section">
    <h2>8. Suivi et audit</h2>
    <ul>
      <li><strong>Réunions de suivi sécurité :</strong> ${item.suiviAudit?.reunions || 'N/A'}</li>
      <li><strong>Audit interne :</strong> ${item.suiviAudit?.auditInterne || 'N/A'}</li>
      <li><strong>Indicateurs de performance sécurité (KPI) :</strong>
        <ul>${(item.suiviAudit?.kpis || []).map((k: any) => `<li>${k.label}: ${k.valeur}</li>`).join('')}</ul>
      </li>
    </ul>
  </div>

  <div class="section">
    <h2>9. Annexes</h2>
    <ul>
      <li><strong>Fiches de sensibilisation sécurité :</strong>
        ${(Array.isArray(item.annexes?.sensibilisation) 
          ? `<ul>${item.annexes.sensibilisation.map((s: string) => `<li>${s}</li>`).join('')}</ul>` 
          : item.annexes?.sensibilisation || 'N/A')}
      </li>
      <li><strong>Modèle de registre des incidents :</strong> ${item.annexes?.modeleRegistreIncidents || 'N/A'}</li>
      <li><strong>Contacts d'urgence :</strong>
        ${(Array.isArray(item.annexes?.contactsUrgence) 
          ? `<ul>${item.annexes.contactsUrgence.map((c: string) => `<li>${c}</li>`).join('')}</ul>` 
          : item.annexes?.contactsUrgence || 'N/A')}
      </li>
    </ul>
  </div>
</body>
</html>
    `;

    // Create a blob and download
    const blob = new Blob([pasHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAS_${item.projet?.nom || 'document'}_v${item.version}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Open in new window for printing as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pasHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200">← Retour</button>
        <Button variant="primary" onClick={generatePDF}>📄 Télécharger PDF</Button>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">PAS - Version {item.version}</h1>
      <div className="text-sm text-gray-500 mb-6">Date: {item.dateDocument ? new Date(item.dateDocument).toLocaleDateString('fr-FR') : ''}</div>

      <div className="space-y-6">
        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">1. Objet du document</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{item.objet || '-'}</p>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">2. Champ d'application</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div>
              <div className="text-sm text-gray-500">Locaux & Infrastructures</div>
              <div className="whitespace-pre-wrap">{item?.champApplication?.locauxEtInfrastructures || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Systèmes d'information</div>
              <div className="whitespace-pre-wrap">{item?.champApplication?.systemesInformation || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-500">Personnels</div>
              <div className="whitespace-pre-wrap">{item?.champApplication?.personnels || '-'}</div>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">3. Références</h2>
          <div className="text-slate-300 text-sm">
            <div><span className="text-gray-500">Normes:</span> {(item?.references?.normes || []).join(', ') || '-'}</div>
            <div><span className="text-gray-500">Politiques:</span> {(item?.references?.politiques || []).join(', ') || '-'}</div>
            <div><span className="text-gray-500">Réglementations:</span> {(item?.references?.reglementations || []).join(', ') || '-'}</div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">4. Organisation de la sécurité</h2>
          <div className="text-slate-300">
            <p className="mb-2"><span className="text-gray-500">Responsable Sécurité Projet (RSP):</span> {item?.organisationSecurite?.rspNomFonction || '-'}</p>
            <div className="text-sm">
              <p className="font-medium mb-1">Rôles et responsabilités:</p>
              <ul className="list-disc list-inside space-y-1">
                {(item?.organisationSecurite?.rolesEtResponsabilites || []).map((r: any, idx: number) => (
                  <li key={idx}><strong>{r.role}:</strong> {r.responsabilite}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-3">5. Analyse des risques</h2>
          
          {/* SWOT Analyses */}
          {(item?.swotAnalyses || []).length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-slate-200 mb-2">Analyses SWOT</h3>
              <div className="space-y-4">
                {(item?.swotAnalyses || []).map((swot: any, index: number) => (
                  <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p className="text-sm font-semibold text-slate-300 mb-3">
                      Analyse #{index + 1} - {new Date(swot.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="font-semibold text-green-800 mb-2">💪 Forces</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{swot.forces || 'N/A'}</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="font-semibold text-red-800 mb-2">⚠️ Faiblesses</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{swot.faiblesses || 'N/A'}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-800 mb-2">🚀 Opportunités</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{swot.opportunites || 'N/A'}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3">
                        <p className="font-semibold text-orange-800 mb-2">⚡ Menaces</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{swot.menaces || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Risk Analysis */}
          {(item?.risques || []).length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-slate-200 mb-2">Analyse Détaillée des Risques</h3>
              <div className="space-y-3">
                {(item?.risques || []).map((risque: any, index: number) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      Risque #{index + 1} - {new Date(risque.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Description:</span> {risque.description || 'N/A'}</div>
                      <div><span className="font-medium">Type:</span> {risque.type || 'N/A'}</div>
                      <div>
                        <span className="font-medium">Priorité:</span>{' '}
                        <span className={
                          risque.priorite === 'Élevée' ? 'text-red-600 font-semibold' :
                          risque.priorite === 'Moyenne' ? 'text-orange-600 font-semibold' :
                          'text-green-600 font-semibold'
                        }>
                          {risque.priorite || 'N/A'}
                        </span>
                      </div>
                      <div><span className="font-medium">Niveau:</span> {risque.niveauRisque || 'N/A'}</div>
                      <div><span className="font-medium">Impact:</span> {risque.impact || 'N/A'}</div>
                      <div><span className="font-medium">Probabilité:</span> {risque.probabilite || 'N/A'}</div>
                      <div className="col-span-2"><span className="font-medium">Décision:</span> {risque.decision || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synthesis */}
          {((item?.analyseRisques?.menaces || []).length > 0 || 
            (item?.analyseRisques?.evaluationImpacts || []).length > 0 || 
            (item?.analyseRisques?.mesuresPrevention || []).length > 0) && (
            <div>
              <h3 className="text-md font-semibold text-slate-200 mb-2">Synthèse de l'Analyse</h3>
              <div className="space-y-3 text-sm">
                {(item?.analyseRisques?.menaces || []).length > 0 && (
                  <div>
                    <p className="font-medium text-slate-300 mb-1">Identification des menaces:</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {(item?.analyseRisques?.menaces || []).map((m: string, idx: number) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(item?.analyseRisques?.evaluationImpacts || []).length > 0 && (
                  <div>
                    <p className="font-medium text-slate-300 mb-1">Évaluation des impacts:</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {(item?.analyseRisques?.evaluationImpacts || []).map((e: string, idx: number) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(item?.analyseRisques?.mesuresPrevention || []).length > 0 && (
                  <div>
                    <p className="font-medium text-slate-300 mb-1">Mesures de prévention:</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {(item?.analyseRisques?.mesuresPrevention || []).map((m: string, idx: number) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">6. Mesures de sécurité</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-slate-300 mb-1">6.1 Sécurité physique:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {(item?.mesuresSecurite?.physique || []).map((p: string, idx: number) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-300 mb-1">6.2 Sécurité logique:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {(item?.mesuresSecurite?.logique || []).map((l: string, idx: number) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-300 mb-1">6.3 Sécurité organisationnelle:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {(item?.mesuresSecurite?.organisationnelle || []).map((o: string, idx: number) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">7. Plan de continuité et reprise d'activité (PCA/PRA)</h2>
          <div className="text-slate-300 space-y-4 text-sm">
            <div>
              <p className="font-medium text-white mb-1">Procédures de sauvegarde et de restauration:</p>
              {item?.pcaPra?.sauvegardeRestauration?.procedures && (
                <p className="text-slate-400 mb-1">{item.pcaPra.sauvegardeRestauration.procedures}</p>
              )}
              {item?.pcaPra?.sauvegardeRestauration?.frequenceTests && (
                <p className="text-slate-400"><span className="font-medium">Fréquence des tests:</span> {item.pcaPra.sauvegardeRestauration.frequenceTests}</p>
              )}
              {!item?.pcaPra?.sauvegardeRestauration?.procedures && !item?.pcaPra?.sauvegardeRestauration?.frequenceTests && (
                <p className="text-gray-400">-</p>
              )}
            </div>
            <div>
              <p className="font-medium text-white mb-1">Site de secours:</p>
              {item?.pcaPra?.siteSecours?.description && (
                <p className="text-slate-400 mb-1">{item.pcaPra.siteSecours.description}</p>
              )}
              {item?.pcaPra?.siteSecours?.adresse && (
                <p className="text-slate-400"><span className="font-medium">Adresse:</span> {item.pcaPra.siteSecours.adresse}</p>
              )}
              {!item?.pcaPra?.siteSecours?.description && !item?.pcaPra?.siteSecours?.adresse && (
                <p className="text-gray-400">-</p>
              )}
            </div>
            <div>
              <p className="font-medium text-white mb-1">Exercices de simulation de crise:</p>
              {item?.pcaPra?.exercices?.description && (
                <p className="text-slate-400 mb-1">{item.pcaPra.exercices.description}</p>
              )}
              {item?.pcaPra?.exercices?.frequence && (
                <p className="text-slate-400"><span className="font-medium">Fréquence:</span> {item.pcaPra.exercices.frequence}</p>
              )}
              {!item?.pcaPra?.exercices?.description && !item?.pcaPra?.exercices?.frequence && (
                <p className="text-gray-400">-</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">8. Suivi et audit</h2>
          <div className="text-slate-300 space-y-2 text-sm">
            <div><span className="font-medium">Réunions de suivi sécurité:</span> {item?.suiviAudit?.reunions || '-'}</div>
            <div><span className="font-medium">Audit interne:</span> {item?.suiviAudit?.auditInterne || '-'}</div>
            <div>
              <p className="font-medium mb-1">Indicateurs de performance sécurité (KPI):</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                {(item?.suiviAudit?.kpis || []).map((k: any, idx: number) => (
                  <li key={idx}>{k.label}: {k.valeur}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold mb-2">9. Annexes</h2>
          <div className="text-slate-300 space-y-2 text-sm">
            <div>
              <p className="font-medium mb-1">Fiches de sensibilisation sécurité:</p>
              {Array.isArray(item?.annexes?.sensibilisation) ? (
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {item.annexes.sensibilisation.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">{item?.annexes?.sensibilisation || '-'}</p>
              )}
            </div>
            <div><span className="font-medium">Modèle de registre des incidents:</span> {item?.annexes?.modeleRegistreIncidents || '-'}</div>
            <div>
              <p className="font-medium mb-1">Contacts d'urgence:</p>
              {Array.isArray(item?.annexes?.contactsUrgence) ? (
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {item.annexes.contactsUrgence.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">{item?.annexes?.contactsUrgence || '-'}</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PASDetail;


