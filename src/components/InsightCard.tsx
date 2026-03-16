import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Insight } from '../types';

interface InsightCardProps {
  insights: Insight[];
}

export const InsightCard: React.FC<InsightCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getInsightStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Info,
          iconColor: 'text-blue-500',
        };
    }
  };

  return (
    <div className="space-y-2">
      {insights.map((insight, index) => {
        const style = getInsightStyle(insight.severity);
        const Icon = style.icon;

        return (
          <div
            key={index}
            className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-start gap-3`}
          >
            <Icon className={`${style.iconColor} flex-shrink-0 mt-0.5`} size={20} />
            <div className="flex-1">
              <p className="text-sm text-slate-800">{insight.message}</p>
              <p className="text-xs text-slate-600 mt-1">{insight.type}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
