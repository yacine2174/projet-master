import React from 'react';
import { useNotifications } from '../components/common/NotificationSystem';
import { notificationTemplates } from './notificationHelper';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    entity: string; // 'audit', 'project', 'conception', etc.
    event: string; // 'status_changed', 'created', 'updated', etc.
    conditions?: { [key: string]: any };
  };
  actions: Array<{
    type: 'notification' | 'status_change' | 'email' | 'webhook';
    config: any;
  }>;
  enabled: boolean;
}

export interface WorkflowContext {
  entity: any;
  previousState?: any;
  user: any;
  timestamp: Date;
}

class WorkflowEngine {
  private rules: WorkflowRule[] = [];
  private notifications: any;

  constructor() {
    this.loadRules();
  }

  setNotifications(notifications: any) {
    this.notifications = notifications;
  }

  private loadRules() {
    // Load workflow rules from localStorage
    try {
      const stored = localStorage.getItem('workflowRules');
      if (stored) {
        this.rules = JSON.parse(stored);
      } else {
        // Initialize with default rules
        this.rules = this.getDefaultRules();
        this.saveRules();
      }
    } catch (error) {
      console.error('Error loading workflow rules:', error);
      this.rules = this.getDefaultRules();
    }
  }

  private saveRules() {
    try {
      localStorage.setItem('workflowRules', JSON.stringify(this.rules));
    } catch (error) {
      console.error('Error saving workflow rules:', error);
    }
  }

  private getDefaultRules(): WorkflowRule[] {
    return [
      {
        id: 'audit-started',
        name: 'Audit Démarré',
        description: 'Notifier quand un audit passe en statut "En cours"',
        trigger: {
          entity: 'audit',
          event: 'status_changed',
          conditions: { newStatus: 'En cours' }
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'auditStarted',
              recipients: ['SSI', 'RSSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'audit-completed',
        name: 'Audit Terminé',
        description: 'Notifier quand un audit est terminé',
        trigger: {
          entity: 'audit',
          event: 'status_changed',
          conditions: { newStatus: 'Terminé' }
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'auditCompleted',
              recipients: ['SSI', 'RSSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'conception-submitted',
        name: 'Conception Soumise',
        description: 'Notifier le RSSI quand une conception est soumise',
        trigger: {
          entity: 'conception',
          event: 'status_changed',
          conditions: { newStatus: 'en attente' }
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'conceptionSubmitted',
              recipients: ['RSSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'conception-validated',
        name: 'Conception Validée',
        description: 'Notifier le SSI quand sa conception est validée',
        trigger: {
          entity: 'conception',
          event: 'status_changed',
          conditions: { newStatus: 'validée' }
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'conceptionValidated',
              recipients: ['SSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'conception-rejected',
        name: 'Conception Rejetée',
        description: 'Notifier le SSI quand sa conception est rejetée',
        trigger: {
          entity: 'conception',
          event: 'status_changed',
          conditions: { newStatus: 'à revoir' }
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'conceptionRejected',
              recipients: ['SSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'critical-risk-detected',
        name: 'Risque Critique Détecté',
        description: 'Alerter en cas de risque critique',
        trigger: {
          entity: 'risk',
          event: 'created',
          conditions: { niveau: 'critique' }
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'criticalRisk',
              recipients: ['SSI', 'RSSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'recommendation-overdue',
        name: 'Recommandation en Retard',
        description: 'Notifier les recommandations en retard',
        trigger: {
          entity: 'recommandation',
          event: 'overdue'
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'recommendationOverdue',
              recipients: ['SSI', 'RSSI']
            }
          }
        ],
        enabled: true
      },
      {
        id: 'project-budget-exceeded',
        name: 'Budget Projet Dépassé',
        description: 'Alerter si le budget d\'un projet est dépassé',
        trigger: {
          entity: 'project',
          event: 'budget_exceeded'
        },
        actions: [
          {
            type: 'notification',
            config: {
              template: 'budgetExceeded',
              recipients: ['SSI', 'RSSI']
            }
          }
        ],
        enabled: true
      }
    ];
  }

  async executeWorkflow(entity: string, event: string, context: WorkflowContext) {
    const matchingRules = this.rules.filter(rule => 
      rule.enabled &&
      rule.trigger.entity === entity &&
      rule.trigger.event === event &&
      this.evaluateConditions(rule.trigger.conditions, context)
    );

    for (const rule of matchingRules) {
      await this.executeActions(rule.actions, context);
    }
  }

  private evaluateConditions(conditions: any, context: WorkflowContext): boolean {
    if (!conditions) return true;

    for (const [key, value] of Object.entries(conditions)) {
      if (context.entity[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private async executeActions(actions: any[], context: WorkflowContext) {
    for (const action of actions) {
      switch (action.type) {
        case 'notification':
          await this.executeNotificationAction(action.config, context);
          break;
        case 'status_change':
          await this.executeStatusChangeAction(action.config, context);
          break;
        case 'email':
          await this.executeEmailAction(action.config, context);
          break;
        case 'webhook':
          await this.executeWebhookAction(action.config, context);
          break;
      }
    }
  }

  private async executeNotificationAction(config: any, context: WorkflowContext) {
    if (!this.notifications) return;

    const template = this.getNotificationTemplate(config.template, context);
    if (template) {
      this.notifications.addNotification(template);
    }
  }

  private getNotificationTemplate(templateName: string, context: WorkflowContext) {
    const templates: { [key: string]: any } = {
      auditStarted: {
        type: 'info',
        title: 'Audit Démarré',
        message: `L'audit "${context.entity.nom}" a été démarré.`,
        action: {
          label: 'Voir l\'audit',
          onClick: () => window.location.href = `/audits/${context.entity._id}`
        }
      },
      auditCompleted: {
        type: 'success',
        title: 'Audit Terminé',
        message: `L'audit "${context.entity.nom}" a été terminé avec succès.`,
        action: {
          label: 'Voir l\'audit',
          onClick: () => window.location.href = `/audits/${context.entity._id}`
        }
      },
      conceptionSubmitted: {
        type: 'info',
        title: 'Conception Soumise',
        message: `Une nouvelle conception "${context.entity.nomFichier}" nécessite votre validation.`,
        action: {
          label: 'Valider',
          onClick: () => window.location.href = `/projects/${context.entity.projet}/conception/${context.entity._id}`
        }
      },
      conceptionValidated: {
        type: 'success',
        title: 'Conception Validée',
        message: `Votre conception "${context.entity.nomFichier}" a été validée par le RSSI.`,
        action: {
          label: 'Voir la conception',
          onClick: () => window.location.href = `/projects/${context.entity.projet}/conception/${context.entity._id}`
        }
      },
      conceptionRejected: {
        type: 'warning',
        title: 'Conception Rejetée',
        message: `Votre conception "${context.entity.nomFichier}" a été rejetée et nécessite des modifications.`,
        action: {
          label: 'Modifier',
          onClick: () => window.location.href = `/projects/${context.entity.projet}/conception/${context.entity._id}`
        }
      },
      criticalRisk: {
        type: 'error',
        title: 'Risque Critique Détecté',
        message: `Un risque critique "${context.entity.nom}" a été identifié et nécessite une attention immédiate.`,
        action: {
          label: 'Voir le risque',
          onClick: () => window.location.href = `/projects/${context.entity.projet}/risks/${context.entity._id}`
        }
      },
      recommendationOverdue: {
        type: 'warning',
        title: 'Recommandation en Retard',
        message: `La recommandation "${context.entity.contenu.substring(0, 50)}..." est en retard.`,
        action: {
          label: 'Voir la recommandation',
          onClick: () => window.location.href = `/recommandations/${context.entity._id}`
        }
      },
      budgetExceeded: {
        type: 'error',
        title: 'Budget Dépassé',
        message: `Le budget du projet "${context.entity.nom}" a été dépassé.`,
        action: {
          label: 'Voir le projet',
          onClick: () => window.location.href = `/projects/${context.entity._id}`
        }
      }
    };

    return templates[templateName];
  }

  private async executeStatusChangeAction(config: any, context: WorkflowContext) {
    // Implement status change logic
    console.log('Executing status change action:', config, context);
  }

  private async executeEmailAction(config: any, context: WorkflowContext) {
    // Implement email sending logic
    console.log('Executing email action:', config, context);
  }

  private async executeWebhookAction(config: any, context: WorkflowContext) {
    // Implement webhook logic
    console.log('Executing webhook action:', config, context);
  }

  // Public methods for managing rules
  addRule(rule: WorkflowRule) {
    this.rules.push(rule);
    this.saveRules();
  }

  updateRule(id: string, updates: Partial<WorkflowRule>) {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      this.saveRules();
    }
  }

  deleteRule(id: string) {
    this.rules = this.rules.filter(rule => rule.id !== id);
    this.saveRules();
  }

  getRules(): WorkflowRule[] {
    return [...this.rules];
  }

  toggleRule(id: string) {
    const rule = this.rules.find(r => r.id === id);
    if (rule) {
      rule.enabled = !rule.enabled;
      this.saveRules();
    }
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();

// Hook for using workflow automation
export const useWorkflowAutomation = () => {
  const notifications = useNotifications();

  React.useEffect(() => {
    workflowEngine.setNotifications(notifications);
  }, [notifications]);

  const triggerWorkflow = async (entity: string, event: string, context: WorkflowContext) => {
    await workflowEngine.executeWorkflow(entity, event, context);
  };

  const addWorkflowRule = (rule: WorkflowRule) => {
    workflowEngine.addRule(rule);
  };

  const updateWorkflowRule = (id: string, updates: Partial<WorkflowRule>) => {
    workflowEngine.updateRule(id, updates);
  };

  const deleteWorkflowRule = (id: string) => {
    workflowEngine.deleteRule(id);
  };

  const getWorkflowRules = () => {
    return workflowEngine.getRules();
  };

  const toggleWorkflowRule = (id: string) => {
    workflowEngine.toggleRule(id);
  };

  return {
    triggerWorkflow,
    addWorkflowRule,
    updateWorkflowRule,
    deleteWorkflowRule,
    getWorkflowRules,
    toggleWorkflowRule
  };
};
