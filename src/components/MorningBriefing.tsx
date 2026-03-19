import React, { useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Copy, CheckCircle } from 'lucide-react';
import { DataPoint, Forecast } from '../types';

interface MorningBriefingProps {
  historicalData: DataPoint[];
  forecast?: Forecast;
}

interface HourlyBid {
  hourEnding: number;
  forecastLoad: number;
  uncertaintyBand: number;
  uncertaintyPercent: number;
  bidDirection: 'as-forecast' | 'up' | 'down';
  bidAdjustment: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({
  historicalData,
  forecast,
}) => {
  const [copied, setCopied] = React.useState(false);

  const hourlyBids = useMemo<HourlyBid[]>(() => {
    if (!forecast || forecast.forecast_data.values.length < 24) {
      return Array.from({ length: 24 }, (_, i) => ({
        hourEnding: i + 1,
        forecastLoad: 0,
        uncertaintyBand: 0,
        uncertaintyPercent: 0,
        bidDirection: 'as-forecast' as const,
        bidAdjustment: 0,
        riskLevel: 'LOW' as const,
      }));
    }

    const forecastValues = forecast.forecast_data.values.slice(0, 24);

    return forecastValues.map((load, index) => {
      const hourEnding = index + 1;

      let uncertaintyPercent = 2;
      if (hourEnding >= 7 && hourEnding <= 10) {
        uncertaintyPercent = 4;
      } else if (hourEnding >= 14 && hourEnding <= 20) {
        uncertaintyPercent = 5;
      } else if (hourEnding >= 21 || hourEnding <= 6) {
        uncertaintyPercent = 2;
      } else {
        uncertaintyPercent = 3;
      }

      const uncertaintyBand = load * (uncertaintyPercent / 100);

      const historicalSameHour = historicalData
        .filter((_, i) => i % 24 === index)
        .slice(-7);

      let bidDirection: 'as-forecast' | 'up' | 'down' = 'as-forecast';
      let bidAdjustment = 0;

      if (historicalSameHour.length > 0) {
        const avgHistorical = historicalSameHour.reduce((sum, dp) => sum + dp.value, 0) / historicalSameHour.length;
        const bias = ((avgHistorical - load) / load) * 100;

        if (bias > 2) {
          bidDirection = 'up';
          bidAdjustment = Math.round(load * 0.03);
        } else if (bias < -2) {
          bidDirection = 'down';
          bidAdjustment = -Math.round(load * 0.03);
        }
      }

      let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if ((hourEnding >= 14 && hourEnding <= 20) && uncertaintyPercent >= 5) {
        riskLevel = 'HIGH';
      } else if (bidDirection !== 'as-forecast') {
        riskLevel = 'MEDIUM';
      } else if (uncertaintyPercent >= 4) {
        riskLevel = 'MEDIUM';
      }

      return {
        hourEnding,
        forecastLoad: Math.round(load),
        uncertaintyBand: Math.round(uncertaintyBand),
        uncertaintyPercent,
        bidDirection,
        bidAdjustment,
        riskLevel,
      };
    });
  }, [forecast, historicalData]);

  const dailySummary = useMemo(() => {
    const totalLoad = hourlyBids.reduce((sum, hour) => sum + hour.forecastLoad, 0);
    const hoursWithAdjustment = hourlyBids.filter(h => h.bidDirection !== 'as-forecast').length;

    const shortRisk = hourlyBids
      .filter(h => h.bidDirection === 'down')
      .reduce((sum, hour) => sum + hour.forecastLoad * 0.03, 0);

    const longRisk = hourlyBids
      .filter(h => h.bidDirection === 'up')
      .reduce((sum, hour) => sum + hour.forecastLoad * 0.01, 0);

    return {
      totalLoad: Math.round(totalLoad),
      hoursWithAdjustment,
      shortRisk: Math.round(shortRisk),
      longRisk: Math.round(longRisk),
    };
  }, [hourlyBids]);

  const copyBidSheet = async () => {
    const headers = ['Hour Ending', 'Forecast Load (MW)', 'Uncertainty (±MW)', 'Bid Direction', 'Adjustment (MW)', 'Risk Level'];
    const rows = hourlyBids.map(hour => [
      hour.hourEnding,
      hour.forecastLoad,
      hour.uncertaintyBand,
      hour.bidDirection === 'as-forecast' ? 'As Forecast' :
        hour.bidDirection === 'up' ? `Bid UP +${hour.bidAdjustment} MW` :
        `Bid DOWN ${hour.bidAdjustment} MW`,
      hour.bidAdjustment,
      hour.riskLevel,
    ]);

    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t')),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getBidDirectionBadge = (hour: HourlyBid) => {
    if (hour.bidDirection === 'as-forecast') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
          <CheckCircle size={14} />
          Bid as forecast
        </span>
      );
    } else if (hour.bidDirection === 'up') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-semibold">
          <TrendingUp size={14} />
          Consider bidding UP +{hour.bidAdjustment} MW
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold">
          <TrendingDown size={14} />
          Consider bidding DOWN {hour.bidAdjustment} MW
        </span>
      );
    }
  };

  const getRiskBadge = (level: 'HIGH' | 'MEDIUM' | 'LOW') => {
    if (level === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold">
          <AlertTriangle size={12} />
          HIGH
        </span>
      );
    } else if (level === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded text-xs font-semibold">
          MEDIUM
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-400 text-white rounded text-xs font-semibold">
          LOW
        </span>
      );
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Day-Ahead Bid Review</h2>
          <p className="text-sm text-slate-600 mt-1">Tomorrow: {tomorrowFormatted}</p>
        </div>
        <button
          onClick={copyBidSheet}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Bid Sheet
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-sm font-medium opacity-90 mb-1">Total Forecast Load</div>
          <div className="text-3xl font-bold">{dailySummary.totalLoad.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-1">MWh</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-sm font-medium opacity-90 mb-1">Hours Flagged</div>
          <div className="text-3xl font-bold">{dailySummary.hoursWithAdjustment}</div>
          <div className="text-sm opacity-75 mt-1">Bid adjustments needed</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-sm font-medium opacity-90 mb-1">Short-Position Risk</div>
          <div className="text-3xl font-bold">{dailySummary.shortRisk.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-1">MW RT exposure</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-sm font-medium opacity-90 mb-1">Long-Position Risk</div>
          <div className="text-3xl font-bold">{dailySummary.longRisk.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-1">MW excess capacity</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Hour Ending
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Forecast Load (MW)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Uncertainty (±MW)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Bid Direction
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Risk Flag
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hourlyBids.map((hour) => (
                <tr
                  key={hour.hourEnding}
                  className={`hover:bg-slate-50 transition-colors ${
                    hour.riskLevel === 'HIGH' ? 'bg-red-50/30' :
                    hour.riskLevel === 'MEDIUM' ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                    HE {hour.hourEnding}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-slate-700">
                    {hour.forecastLoad.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-600">
                    <span className="font-mono">±{hour.uncertaintyBand.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-1">({hour.uncertaintyPercent}%)</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getBidDirectionBadge(hour)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {getRiskBadge(hour.riskLevel)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Bidding Guidance</p>
            <p>
              This review uses historical bias analysis to suggest bid adjustments. HIGH risk hours
              occur during peak demand with elevated uncertainty. Consider hedging strategies for
              hours with consistent directional bias. Short-position exposure (under-bidding)
              carries higher costs than long-position (over-bidding) in most markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
