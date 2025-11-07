import { useNotifications } from '../components/common/NotificationSystem';

// Helper function to create common notifications
export const createNotification = {
  success: (title: string, message: string, action?: { label: string; onClick: () => void }) => ({
    type: 'success' as const,
    title,
    message,
    action
  }),

  error: (title: string, message: string, action?: { label: string; onClick: () => void }) => ({
    type: 'error' as const,
    title,
    message,
    action
  }),

  warning: (title: string, message: string, action?: { label: string; onClick: () => void }) => ({
    type: 'warning' as const,
    title,
    message,
    action
  }),

  info: (title: string, message: string, action?: { label: string; onClick: () => void }) => ({
    type: 'info' as const,
    title,
    message,
    action
  })
};

// Common notification templates
export const notificationTemplates = {
  auditCreated: (auditName: string) => 
    createNotification.success(
      'Audit créé',
      `L'audit "${auditName}" a été créé avec succès.`,
      { label: 'Voir l\'audit', onClick: () => {} }
    ),

  auditUpdated: (auditName: string) =>
    createNotification.success(
      'Audit mis à jour',
      `L'audit "${auditName}" a été mis à jour avec succès.`
    ),

  auditStatusChanged: (auditName: string, newStatus: string) =>
    createNotification.info(
      'Statut modifié',
      `Le statut de l'audit "${auditName}" a été changé en "${newStatus}".`
    ),

  projectCreated: (projectName: string) =>
    createNotification.success(
      'Projet créé',
      `Le projet "${projectName}" a été créé avec succès.`,
      { label: 'Voir le projet', onClick: () => {} }
    ),

  projectUpdated: (projectName: string) =>
    createNotification.success(
      'Projet mis à jour',
      `Le projet "${projectName}" a été mis à jour avec succès.`
    ),

  conceptionSubmitted: (conceptionName: string) =>
    createNotification.info(
      'Conception soumise',
      `La conception "${conceptionName}" a été soumise pour validation RSSI.`
    ),

  conceptionValidated: (conceptionName: string) =>
    createNotification.success(
      'Conception validée',
      `La conception "${conceptionName}" a été validée par le RSSI.`
    ),

  conceptionRejected: (conceptionName: string) =>
    createNotification.warning(
      'Conception rejetée',
      `La conception "${conceptionName}" a été rejetée par le RSSI.`
    ),

  normeCreated: (normeName: string) =>
    createNotification.success(
      'Norme créée',
      `La norme "${normeName}" a été créée avec succès.`
    ),

  preuveUploaded: (preuveName: string) =>
    createNotification.success(
      'Preuve uploadée',
      `La preuve "${preuveName}" a été uploadée avec succès.`
    ),

  recommandationCreated: (recommandationTitle: string) =>
    createNotification.success(
      'Recommandation créée',
      `La recommandation "${recommandationTitle}" a été créée avec succès.`
    ),

  recommandationStatusChanged: (recommandationTitle: string, newStatus: string) =>
    createNotification.info(
      'Statut de recommandation modifié',
      `Le statut de la recommandation "${recommandationTitle}" a été changé en "${newStatus}".`
    ),

  constatCreated: (constatDescription: string) =>
    createNotification.success(
      'Constat créé',
      `Le constat "${constatDescription.substring(0, 50)}..." a été créé avec succès.`
    ),

  planActionCreated: (planActionTitle: string) =>
    createNotification.success(
      'Plan d\'action créé',
      `Le plan d'action "${planActionTitle}" a été créé avec succès.`
    ),

  fileUploaded: (fileName: string) =>
    createNotification.success(
      'Fichier uploadé',
      `Le fichier "${fileName}" a été uploadé avec succès.`
    ),

  fileDownloaded: (fileName: string) =>
    createNotification.info(
      'Fichier téléchargé',
      `Le fichier "${fileName}" a été téléchargé.`
    ),

  errorOccurred: (operation: string, error: string) =>
    createNotification.error(
      'Erreur',
      `Une erreur s'est produite lors de ${operation}: ${error}`
    ),

  validationError: (field: string) =>
    createNotification.warning(
      'Erreur de validation',
      `Le champ "${field}" contient des erreurs. Veuillez vérifier votre saisie.`
    ),

  networkError: () =>
    createNotification.error(
      'Erreur de connexion',
      'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      { label: 'Réessayer', onClick: () => window.location.reload() }
    ),

  unauthorized: () =>
    createNotification.error(
      'Accès non autorisé',
      'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
      { label: 'Se reconnecter', onClick: () => window.location.href = '/login' }
    ),

  sessionExpired: () =>
    createNotification.warning(
      'Session expirée',
      'Votre session a expiré. Veuillez vous reconnecter.',
      { label: 'Se reconnecter', onClick: () => window.location.href = '/login' }
    )
};

// Hook to easily add notifications
export const useNotificationHelper = () => {
  const { addNotification } = useNotifications();

  return {
    notifySuccess: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification(createNotification.success(title, message, action));
    },
    notifyError: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification(createNotification.error(title, message, action));
    },
    notifyWarning: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification(createNotification.warning(title, message, action));
    },
    notifyInfo: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification(createNotification.info(title, message, action));
    },
    notifyTemplate: (template: ReturnType<typeof createNotification.success>) => {
      addNotification(template);
    }
  };
};
