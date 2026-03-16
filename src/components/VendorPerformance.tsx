import React, { useEffect, useState } from 'react';
import { Target, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VendorPerformanceProps {
  datasetId?: string;
}

interface VendorMetric {
  id: string;
  vendor_name: string;
  mape: number;
  mae: number;
  rmse: number;
  bias: number;
  total_forecasts: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export const VendorPerformance: React.FC<VendorPerformanceProps> = ({ datasetId }) => {
  const [metrics, setMetrics] = useState<VendorMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    loadMetrics();
  }, [datasetId, selectedPeriod]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - selectedPeriod);

      let query = supabase
        .from('vendor_performance_metrics')
        .select('*')
        .gte('created_at', periodStart.toISOString())
        .order('created_at', { ascending: false });

      if (datasetId) {
        query = query.eq('dataset_id', datasetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error loading vendor metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRating = (mape: number) => {
    if (mape < 5) return { label: 'Excellent', color: 'bg-green-500' };
    if (mape < 10) return { label: 'Good', color: 'bg-blue-500' };
    if (mape < 15) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.vendor_name]) {
      acc[metric.vendor_name] = [];
    }
    acc[metric.vendor_name].push(metric);
    return acc;
  }, {} as Record<string, VendorMetric[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Vendor Performance</h3>
        <div className="flex gap-2">
          {[30, 60, 90].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as 30 | 60 | 90)}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period} days
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && Object.keys(groupedMetrics).length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-600">No vendor performance data available.</p>
          <p className="text-sm text-slate-500 mt-2">Vendor metrics will appear here once forecast data is collected.</p>
        </div>
      )}

      {!loading && Object.entries(groupedMetrics).map(([vendorName, vendorMetrics]) => {
        const latestMetric = vendorMetrics[0];
        const rating = getRating(latestMetric.mape);

        let trend = null;
        if (vendorMetrics.length > 1) {
          const previousMape = vendorMetrics[1].mape;
          const change = ((latestMetric.mape - previousMape) / previousMape) * 100;
          trend = { change, improving: change < 0 };
        }

        return (
          <div key={vendorName} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-800">{vendorName}</h4>
                {trend && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-600">Trend:</span>
                    <div className={`flex items-center gap-1 text-sm ${trend.improving ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.improving ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                      <span className="font-semibold">{Math.abs(trend.change).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
              <span className={`${rating.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                {rating.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} />
                  <span className="text-sm opacity-90">MAPE</span>
                </div>
                <div className="text-2xl font-bold">{latestMetric.mape.toFixed(2)}%</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} />
                  <span className="text-sm opacity-90">MAE</span>
                </div>
                <div className="text-2xl font-bold">{latestMetric.mae.toFixed(2)}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} />
                  <span className="text-sm opacity-90">RMSE</span>
                </div>
                <div className="text-2xl font-bold">{latestMetric.rmse.toFixed(2)}</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} />
                  <span className="text-sm opacity-90">Bias</span>
                </div>
                <div className="text-2xl font-bold">{latestMetric.bias.toFixed(2)}</div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm text-slate-600">
                <div>
                  Period: {new Date(latestMetric.period_start).toLocaleDateString()} - {new Date(latestMetric.period_end).toLocaleDateString()}
                </div>
                <div>{latestMetric.total_forecasts} forecasts evaluated</div>
              </div>

              {rating.label === 'Excellent' && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">✓ Excellent Performance:</span> This vendor is delivering highly accurate forecasts.
                  </p>
                </div>
              )}

              {rating.label === 'Poor' && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">⚠ Performance Issue:</span> Consider reviewing forecast methodology with vendor.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
