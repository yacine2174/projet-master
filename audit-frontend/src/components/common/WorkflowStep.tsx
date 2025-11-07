import React from 'react';

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  accentColor?: string;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ number, title, description, accentColor = 'bg-emerald-700' }) => (
  <div className="flex items-start gap-4">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow ${accentColor}`}>{number}</div>
    <div>
      <div className="font-semibold text-white text-base mb-0.5">{title}</div>
      <div className="text-gray-400 text-xs leading-snug">{description}</div>
    </div>
  </div>
);

export default WorkflowStep;
