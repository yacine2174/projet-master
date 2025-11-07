import React from 'react';

interface MetricBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentColor?: string;
  description?: string;
}

const MetricBlock: React.FC<MetricBlockProps> = ({ icon, label, value, accentColor = 'text-emerald-400', description }) => (
  <div className="flex items-center gap-4 bg-gray-900/80 rounded-xl border border-gray-800 px-5 py-4 min-w-[160px]">
    <span className={`text-2xl font-bold ${accentColor}`}>{icon}</span>
    <div className="flex-1">
      <div className="text-xs font-medium text-gray-400 uppercase mb-0.5">{label}</div>
      <div className={`text-2xl font-bold text-white leading-snug`}>{value}</div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  </div>
);

export default MetricBlock;
