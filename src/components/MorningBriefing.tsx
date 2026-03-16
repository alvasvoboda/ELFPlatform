import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle, X } from 'lucide-react';
import { DataPoint, Anomaly, VendorMetrics, Alert, ConfidenceAssessment } from '../types';
import { api } from '../lib/api';

interface MorningBriefingProps {
  historicalData: DataPoint[];
  anomalies: Anomaly[];
  vendorForecast?: DataPoint[];
  vendorMetrics?: VendorMetrics;
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({
  historicalData,
  anomalies,
  vendorForecast,
  vendorMetrics,
}) => {
  const [confidence, setConfidence] = useState<ConfidenceAssessment | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBriefingData = async () => {
      setLoading(true);
      try {
        if (vendorForecast && vendorMetrics) {
          const confidenceResult = await api.calculateForecastConfidence(
            vendorForecast,
            historicalData,
            vendorMetrics
          );
          setConfidence(confidenceResult);
        }

        const alertsResult = await api.generateAlerts(
          historicalData,
          anomalies,
          vendorForecast,
          vendorMetrics
        );
        setAlerts(alertsResult.alerts);
      } catch (error) {
        console.error('Error loading briefing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBriefingData();
  }, [historicalData, anomalies, vendorForecast, vendorMetrics]);

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">MEDIUM</span>;
      case 'LOW':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">LOW</span>;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-amber-500 text-white rounded text-xs font-semibold">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-semibold">LOW</span>;
      default:
        return null;
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Morning Briefing</h2>
        <div className="text-sm text-slate-600">{today}</div>
      </div>

      {confidence && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Forecast Confidence Assessment</h3>
            {getConfidenceBadge(confidence.confidence_level)}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Confidence Score</span>
              <span className="text-2xl font-bold text-slate-800">{confidence.confidence_score}/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  confidence.confidence_score >= 70
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : confidence.confidence_score >= 40
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${confidence.confidence_score}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 font-medium">{confidence.recommendation}</p>
          </div>

          <div className="space-y-3">
            {confidence.factors.map((factor, index) => (
              <div key={index} className="flex items-start gap-3">
                {factor.impact === 'positive' ? (
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                ) : factor.impact === 'negative' ? (
                  <X className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex-shrink-0 mt-0.5"></div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{factor.factor}: {factor.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Active Alerts</h3>
          <span className="text-sm text-slate-600">{alerts.length} total</span>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
            <p>No active alerts. All systems normal.</p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                    <h4 className="font-semibold text-slate-800">{alert.title}</h4>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-sm text-slate-600 ml-7">{alert.description}</p>
                {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                  <div className="mt-3 ml-7 flex gap-4 text-xs text-slate-500">
                    {alert.metadata.count !== undefined && (
                      <div className="flex items-center gap-1">
                        <span>Count:</span>
                        <span className="font-semibold">{alert.metadata.count as number}</span>
                      </div>
                    )}
                    {alert.metadata.change_percent !== undefined && (
                      <div className="flex items-center gap-1">
                        {(alert.metadata.change_percent as number) > 0 ? (
                          <TrendingUp className="text-red-500" size={14} />
                        ) : (
                          <TrendingDown className="text-green-500" size={14} />
                        )}
                        <span className="font-semibold">{Math.abs(alert.metadata.change_percent as number).toFixed(1)}% change</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
