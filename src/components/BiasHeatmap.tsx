import React from 'react';

interface BiasHeatmapProps {
  biasData: number[][]; // 7 columns (days) × 24 rows (hours)
}

export const BiasHeatmap: React.FC<BiasHeatmapProps> = ({ biasData }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getBiasColor = (bias: number) => {
    if (bias > 3) return 'bg-red-700 text-white';
    if (bias > 1) return 'bg-red-300 text-slate-800';
    if (bias > -1) return 'bg-white text-slate-700';
    if (bias > -3) return 'bg-blue-300 text-slate-800';
    return 'bg-blue-700 text-white';
  };

  const getBiasColorRGB = (bias: number): string => {
    if (bias > 3) return 'rgb(185, 28, 28)';
    if (bias > 1) return 'rgb(252, 165, 165)';
    if (bias > -1) return 'rgb(255, 255, 255)';
    if (bias > -3) return 'rgb(147, 197, 253)';
    return 'rgb(29, 78, 216)';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-xs text-slate-600">
        <span className="font-semibold">Color Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-700 rounded"></div>
          <span>&gt;+3% (Short Risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span>+1% to +3%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-slate-300 rounded"></div>
          <span>±1% (Neutral)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-300 rounded"></div>
          <span>-1% to -3%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-700 rounded"></div>
          <span>&lt;-3% (Long Risk)</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-2 py-2 text-left font-semibold text-slate-700 border-r border-slate-300 sticky left-0 bg-slate-100 z-10">
                Hour
              </th>
              {daysOfWeek.map((day) => (
                <th key={day} className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {biasData.map((hourRow, hourIndex) => (
              <tr key={hourIndex} className="border-t border-slate-200">
                <td className="px-2 py-2 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50 sticky left-0 z-10">
                  HE{hourIndex + 1}
                </td>
                {hourRow.map((bias, dayIndex) => (
                  <td
                    key={dayIndex}
                    className={`px-3 py-2 text-center border-r border-slate-100 last:border-r-0 ${getBiasColor(bias)}`}
                    title={`${daysOfWeek[dayIndex]} HE${hourIndex + 1}: ${bias > 0 ? '+' : ''}${bias.toFixed(1)}%`}
                  >
                    {bias > 0 ? '+' : ''}{bias.toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const getBiasColorForChart = (bias: number): string => {
  if (bias > 3) return 'rgba(185, 28, 28, 0.15)';
  if (bias > 1) return 'rgba(252, 165, 165, 0.15)';
  if (bias > -1) return 'rgba(255, 255, 255, 0)';
  if (bias > -3) return 'rgba(147, 197, 253, 0.15)';
  return 'rgba(29, 78, 216, 0.15)';
};
