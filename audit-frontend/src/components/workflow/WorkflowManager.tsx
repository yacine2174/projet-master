import React, { useState, useEffect } from 'react';
import { useWorkflowAutomation, WorkflowRule } from '../../utils/workflowAutomation';
import Button from '../common/Button';

const WorkflowManager: React.FC = () => {
  const {
    getWorkflowRules,
    addWorkflowRule,
    updateWorkflowRule,
    deleteWorkflowRule,
    toggleWorkflowRule
  } = useWorkflowAutomation();

  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);

  useEffect(() => {
    setRules(getWorkflowRules());
  }, [getWorkflowRules]);

  const handleToggleRule = (id: string) => {
    toggleWorkflowRule(id);
    setRules(getWorkflowRules());
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette règle de workflow ?')) {
      deleteWorkflowRule(id);
      setRules(getWorkflowRules());
    }
  };

  const handleAddRule = (rule: Omit<WorkflowRule, 'id'>) => {
    const newRule: WorkflowRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    addWorkflowRule(newRule);
    setRules(getWorkflowRules());
    setShowAddForm(false);
  };

  const handleUpdateRule = (id: string, updates: Partial<WorkflowRule>) => {
    updateWorkflowRule(id, updates);
    setRules(getWorkflowRules());
    setEditingRule(null);
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getEntityIcon = (entity: string) => {
    const icons: { [key: string]: string } = {
      'audit': '🔍',
      'project': '📋',
      'conception': '📄',
      'risk': '⚠️',
      'recommandation': '📋',
      'constat': '🔍',
      'planAction': '📅'
    };
    return icons[entity] || '📝';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">⚙️ Gestion des Workflows</h1>
            <p className="text-slate-400">Automatisez les processus et notifications</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
          >
            ➕ Nouvelle Règle
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getEntityIcon(rule.trigger.entity)}</span>
                  <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rule.enabled)}`}>
                    {rule.enabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-slate-400 mb-3">{rule.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-300">Déclencheur:</span>
                    <p className="text-slate-400">
                      {rule.trigger.entity} - {rule.trigger.event}
                    </p>
                    {rule.trigger.conditions && (
                      <p className="text-gray-500 text-xs">
                        Conditions: {JSON.stringify(rule.trigger.conditions)}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Actions:</span>
                    <p className="text-slate-400">
                      {rule.actions.map(action => action.type).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    rule.enabled 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {rule.enabled ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-white mb-2">Aucune règle de workflow</h3>
          <p className="text-slate-400 mb-4">Créez votre première règle pour automatiser les processus.</p>
          <Button variant="primary" onClick={() => setShowAddForm(true)}>
            Créer une règle
          </Button>
        </div>
      )}

      {/* Add/Edit Rule Form */}
      {(showAddForm || editingRule) && (
        <RuleForm
          rule={editingRule}
          onSave={editingRule ? (updates) => handleUpdateRule(editingRule.id, updates) : handleAddRule}
          onCancel={() => {
            setShowAddForm(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
};

interface RuleFormProps {
  rule?: WorkflowRule | null;
  onSave: (rule: Omit<WorkflowRule, 'id'>) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    entity: rule?.trigger.entity || 'audit',
    event: rule?.trigger.event || 'status_changed',
    conditions: rule?.trigger.conditions || {},
    actions: rule?.actions || [{ type: 'notification', config: {} }],
    enabled: rule?.enabled ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRule: Omit<WorkflowRule, 'id'> = {
      name: formData.name,
      description: formData.description,
      trigger: {
        entity: formData.entity,
        event: formData.event,
        conditions: formData.conditions
      },
      actions: formData.actions,
      enabled: formData.enabled
    };

    onSave(newRule);
  };

  const entityOptions = [
    { value: 'audit', label: 'Audit' },
    { value: 'project', label: 'Projet' },
    { value: 'conception', label: 'Conception' },
    { value: 'risk', label: 'Risque' },
    { value: 'recommandation', label: 'Recommandation' },
    { value: 'constat', label: 'Constat' },
    { value: 'planAction', label: 'Plan d\'Action' }
  ];

  const eventOptions = [
    { value: 'created', label: 'Créé' },
    { value: 'updated', label: 'Mis à jour' },
    { value: 'status_changed', label: 'Statut modifié' },
    { value: 'deleted', label: 'Supprimé' },
    { value: 'overdue', label: 'En retard' },
    { value: 'budget_exceeded', label: 'Budget dépassé' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {rule ? 'Modifier la règle' : 'Nouvelle règle de workflow'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nom de la règle
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Entité
                </label>
                <select
                  value={formData.entity}
                  onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {entityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Événement
                </label>
                <select
                  value={formData.event}
                  onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value }))}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded"
              />
              <label htmlFor="enabled" className="ml-2 text-sm text-slate-300">
                Règle activée
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {rule ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;
