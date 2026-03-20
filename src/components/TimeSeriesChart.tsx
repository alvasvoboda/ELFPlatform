import React from 'react';
import { DataPoint, Anomaly } from '../types';

interface TimeSeriesChartProps {
  data: DataPoint[];
  forecastData?: number[];
  actualsData?: DataPoint[];
  anomalies?: Anomaly[];
  title?: string;
  showErrorStats?: boolean;
  biasOverlay?: number[];
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  forecastData,
  actualsData,
  anomalies,
  title,
  showErrorStats = false,
  biasOverlay,
}) => {
  const width = 1000;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = [
    ...data.map(d => d.value),
    ...(forecastData || []),
    ...(actualsData?.map(d => d.value) || []),
  ];

  const minValue = Math.min(...allValues) * 0.95;
  const maxValue = Math.max(...allValues) * 1.05;

  const scaleX = (index: number, total: number) =>
    padding.left + (index / (total - 1)) * chartWidth;
  const scaleY = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  const createPath = (values: number[], startIndex = 0) => {
    return values
      .map((value, i) => {
        const x = scaleX(startIndex + i, data.length + (forecastData?.length || 0));
        const y = scaleY(value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const dataPath = createPath(data.map(d => d.value));

  const forecastPath = forecastData ? createPath(forecastData, data.length) : '';

  const actualsPath = actualsData
    ? createPath(
        actualsData.map(d => d.value),
        data.length
      )
    : '';

  const getBiasColor = (bias: number): string => {
    if (bias > 3) return 'rgba(185, 28, 28, 0.15)';
    if (bias > 1) return 'rgba(252, 165, 165, 0.15)';
    if (bias > -1) return 'rgba(255, 255, 255, 0)';
    if (bias > -3) return 'rgba(147, 197, 253, 0.15)';
    return 'rgba(29, 78, 216, 0.15)';
  };

  let errorStats = null;
  if (showErrorStats && forecastData && actualsData) {
    const mae =
      actualsData.reduce((sum, d, i) => sum + Math.abs(d.value - forecastData[i]), 0) /
      actualsData.length;
    const mape =
      (actualsData.reduce(
        (sum, d, i) => sum + Math.abs((d.value - forecastData[i]) / d.value),
        0
      ) /
        actualsData.length) *
      100;
    const rmse = Math.sqrt(
      actualsData.reduce((sum, d, i) => sum + Math.pow(d.value - forecastData[i], 2), 0) /
        actualsData.length
    );

    errorStats = { mae, mape, rmse };
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}

      {errorStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">MAE</div>
            <div className="text-2xl font-bold text-blue-900">{errorStats.mae.toFixed(2)} MW</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 mb-1">MAPE</div>
            <div className="text-2xl font-bold text-green-900">{errorStats.mape.toFixed(2)}%</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 mb-1">RMSE</div>
            <div className="text-2xl font-bold text-purple-900">{errorStats.rmse.toFixed(2)} MW</div>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full border border-slate-200 rounded-lg bg-white">
        <defs>
          <linearGradient id="dataGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.05 }} />
          </linearGradient>
          <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 0.02 }} />
          </linearGradient>
        </defs>

        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartHeight * t;
          const value = maxValue - (maxValue - minValue) * t;
          return (
            <g key={t}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-slate-500"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        <path
          d={`${dataPath} L ${scaleX(data.length - 1, data.length + (forecastData?.length || 0))} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
          fill="url(#dataGradient)"
        />

        <path
          d={dataPath}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2.5"
        />

        {biasOverlay && forecastData && (
          <>
            {biasOverlay.map((bias, i) => {
              if (i === 0) return null;
              const x1 = scaleX(data.length + i - 1, data.length + forecastData.length);
              const x2 = scaleX(data.length + i, data.length + forecastData.length);
              return (
                <rect
                  key={`bias-${i}`}
                  x={x1}
                  y={padding.top}
                  width={x2 - x1}
                  height={chartHeight}
                  fill={getBiasColor(bias)}
                />
              );
            })}
          </>
        )}

        {forecastData && (
          <>
            <path
              d={`${forecastPath} L ${scaleX(data.length + forecastData.length - 1, data.length + forecastData.length)} ${padding.top + chartHeight} L ${scaleX(data.length, data.length + forecastData.length)} ${padding.top + chartHeight} Z`}
              fill="url(#forecastGradient)"
            />
            <path
              d={forecastPath}
              fill="none"
              stroke="rgb(147, 51, 234)"
              strokeWidth="2.5"
              strokeDasharray="5,5"
            />
          </>
        )}

        {actualsData && (
          <path
            d={actualsPath}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2.5"
          />
        )}

        {anomalies?.map((anomaly) => {
          const x = scaleX(anomaly.index, data.length);
          const y = scaleY(anomaly.value);
          return (
            <g key={anomaly.index}>
              <circle cx={x} cy={y} r="10" fill="rgb(239, 68, 68)" opacity="0.2" />
              <circle cx={x} cy={y} r="6" fill="rgb(239, 68, 68)" />
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span className="text-slate-600">Actual Data</span>
        </div>
        {forecastData && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-purple-500 border-dashed border-t-2 border-purple-500"></div>
            <span className="text-slate-600">Forecast</span>
          </div>
        )}
        {actualsData && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500"></div>
            <span className="text-slate-600">Actuals (for comparison)</span>
          </div>
        )}
        {anomalies && anomalies.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-600">Anomalies ({anomalies.length})</span>
          </div>
        )}
      </div>
    </div>
  );
};
