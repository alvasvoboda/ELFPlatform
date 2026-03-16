import React from 'react';
import { TrendingUp, Lightbulb, Wrench } from 'lucide-react';
import { AnomalyGuidance as AnomalyGuidanceType } from '../types';

interface AnomalyGuidanceProps {
  guidance: AnomalyGuidanceType;
}

export const AnomalyGuidance: React.FC<AnomalyGuidanceProps> = ({ guidance }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">Pattern Description</h4>
          <p className="text-sm text-blue-800">{guidance.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-red-600" size={18} />
            <h5 className="font-semibold text-slate-800">Typical Anomalies</h5>
          </div>
          <ul className="space-y-1">
            {guidance.typical_anomalies.map((anomaly, index) => (
              <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{anomaly}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-amber-600" size={18} />
            <h5 className="font-semibold text-slate-800">Common Causes</h5>
          </div>
          <ul className="space-y-1">
            {guidance.causes.map((cause, index) => (
              <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="text-green-600" size={18} />
            <h5 className="font-semibold text-slate-800">Recommended Actions</h5>
          </div>
          <ul className="space-y-1">
            {guidance.recommended_actions.map((action, index) => (
              <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
