import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface BiasSummaryPanelProps {
  biasData: number[][]; // 7 columns (days) × 24 rows (hours)
}

export const BiasSummaryPanel: React.FC<BiasSummaryPanelProps> = ({ biasData }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let maxPositiveBias = -Infinity;
  let maxPositiveHour = 0;
  let maxPositiveDay = 0;

  let maxNegativeBias = Infinity;
  let maxNegativeHour = 0;
  let maxNegativeDay = 0;

  let totalBias = 0;
  let count = 0;

  biasData.forEach((hourRow, hourIndex) => {
    hourRow.forEach((bias, dayIndex) => {
      totalBias += bias;
      count++;

      if (bias > maxPositiveBias) {
        maxPositiveBias = bias;
        maxPositiveHour = hourIndex + 1;
        maxPositiveDay = dayIndex;
      }

      if (bias < maxNegativeBias) {
        maxNegativeBias = bias;
        maxNegativeHour = hourIndex + 1;
        maxNegativeDay = dayIndex;
      }
    });
  });

  const overallBias = totalBias / count;

  let biasDirection: 'low' | 'high' | 'neutral' = 'neutral';
  let recommendation = 'as-is';

  if (overallBias > 1) {
    biasDirection = 'low';
    recommendation = `up ${overallBias.toFixed(1)}%`;
  } else if (overallBias < -1) {
    biasDirection = 'high';
    recommendation = `down ${Math.abs(overallBias).toFixed(1)}%`;
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="text-sm font-semibold text-red-900 mb-1">Most Dangerous Pattern (Short Risk)</div>
            <p className="text-sm text-red-800">
              <span className="font-bold">{daysOfWeek[maxPositiveDay]} HE{maxPositiveHour}</span> runs{' '}
              <span className="font-bold">{maxPositiveBias.toFixed(1)}% LOW</span> on average — consider bidding up
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingDown className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="text-sm font-semibold text-blue-900 mb-1">Most Common Overforecast (Long Risk)</div>
            <p className="text-sm text-blue-800">
              <span className="font-bold">{daysOfWeek[maxNegativeDay]} HE{maxNegativeHour}</span> runs{' '}
              <span className="font-bold">{Math.abs(maxNegativeBias).toFixed(1)}% HIGH</span> on average — consider bidding down
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-slate-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900 mb-2">Overall Bias</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Mean Error:</span>
                <span className={`text-lg font-bold ${
                  overallBias > 1 ? 'text-red-600' :
                  overallBias < -1 ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {overallBias > 0 ? '+' : ''}{overallBias.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    overallBias > 1 ? 'bg-red-500' :
                    overallBias < -1 ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(overallBias) * 10, 100)}%`,
                    marginLeft: overallBias < 0 ? 'auto' : '0'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 ${
        biasDirection === 'low' ? 'bg-red-50 border-red-300' :
        biasDirection === 'high' ? 'bg-blue-50 border-blue-300' :
        'bg-green-50 border-green-300'
      }`}>
        <div className="flex items-start gap-3">
          {biasDirection === 'low' ? (
            <TrendingUp className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          ) : biasDirection === 'high' ? (
            <TrendingDown className="text-blue-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div>
            <div className={`text-sm font-semibold mb-1 ${
              biasDirection === 'low' ? 'text-red-900' :
              biasDirection === 'high' ? 'text-blue-900' :
              'text-green-900'
            }`}>
              Recommendation
            </div>
            <p className={`text-sm ${
              biasDirection === 'low' ? 'text-red-800' :
              biasDirection === 'high' ? 'text-blue-800' :
              'text-green-800'
            }`}>
              Your forecast has a systematic <span className="font-bold">{biasDirection}</span> bias.
              In aggregate, bidding <span className="font-bold">{recommendation}</span> would reduce
              expected real-time exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
