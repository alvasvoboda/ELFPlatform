import { DataPoint, AnalysisResult, Forecast, Anomaly, AnomalyGuidance, VendorMetrics, Alert, ConfidenceAssessment } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async generateData(params: { num_points: number; pattern: string; noise_level: number }) {
    const response = await fetch(`${API_BASE_URL}/generate-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return response.json();
  },

  async analyze(data: DataPoint[], analysisType: string = 'comprehensive'): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, analysis_type: analysisType }),
    });
    return response.json();
  },

  async forecast(data: DataPoint[], horizon: number = 48): Promise<Forecast> {
    try {
      const response = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, horizon }),
      });

      if (!response.ok) {
        throw new Error('Backend unavailable');
      }

      return response.json();
    } catch (error) {
      console.warn('Backend unavailable, using synthetic forecast generation');
      return this.generateSyntheticForecast(data, horizon);
    }
  },

  generateSyntheticForecast(data: DataPoint[], horizon: number = 48): Forecast {
    const values = data.map(d => d.value);
    const recentValues = values.slice(-48);
    const forecastValues: number[] = [];

    for (let i = 0; i < horizon; i++) {
      const hourOfDay = i % 24;
      const recentAvg = recentValues.slice(-24).reduce((sum, val) => sum + val, 0) / 24;

      let hourPattern = 1.0;
      if (hourOfDay >= 6 && hourOfDay < 9) {
        hourPattern = 1.15;
      } else if (hourOfDay >= 9 && hourOfDay < 17) {
        hourPattern = 1.25;
      } else if (hourOfDay >= 17 && hourOfDay < 20) {
        hourPattern = 1.3;
      } else if (hourOfDay >= 20 && hourOfDay < 22) {
        hourPattern = 1.1;
      } else {
        hourPattern = 0.85;
      }

      const noise = (Math.random() - 0.5) * 2;
      const forecastValue = recentAvg * hourPattern + noise;
      forecastValues.push(forecastValue);
    }

    const lowerBound = forecastValues.map(v => v * 0.9);
    const upperBound = forecastValues.map(v => v * 1.1);

    const avgValue = forecastValues.reduce((sum, val) => sum + val, 0) / forecastValues.length;
    const lastValue = values[values.length - 1];
    const trend = avgValue > lastValue ? 'increase' : 'decrease';

    return {
      timestamp: new Date().toISOString(),
      horizon,
      forecast_data: {
        values: forecastValues,
      },
      confidence_intervals: {
        lower_95: lowerBound,
        upper_95: upperBound,
      },
      insights: [
        {
          type: 'forecast_trend',
          severity: 'info',
          message: `Forecast shows ${trend} of ${Math.abs(avgValue - lastValue).toFixed(2)} MW on average.`,
        },
      ],
    };
  },

  async detectAnomalies(data: DataPoint[], sensitivity: number = 0.95, patternType: string = 'day_ahead_full'): Promise<{
    timestamp: string;
    sensitivity: number;
    anomalies: { statistical: Anomaly[]; ml_based: Anomaly[]; timeseries: Anomaly[] };
    summary: Anomaly[];
    insights: any[];
    guidance: AnomalyGuidance;
  }> {
    const response = await fetch(`${API_BASE_URL}/detect-anomalies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, sensitivity, pattern_type: patternType }),
    });
    return response.json();
  },

  async queryAgent(query: string, context: Record<string, unknown> = {}) {
    const response = await fetch(`${API_BASE_URL}/agents/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });
    return response.json();
  },

  async calculateForecastConfidence(
    vendorForecast: DataPoint[] | number[],
    historicalData: DataPoint[] | number[],
    vendorMetrics?: VendorMetrics
  ): Promise<ConfidenceAssessment> {
    const response = await fetch(`${API_BASE_URL}/forecast/confidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor_forecast: vendorForecast,
        historical_data: historicalData,
        vendor_metrics: vendorMetrics,
      }),
    });
    return response.json();
  },

  async generateAlerts(
    historicalData: DataPoint[],
    anomalies: Anomaly[],
    vendorForecast?: DataPoint[],
    vendorMetrics?: VendorMetrics
  ): Promise<{ alerts: Alert[] }> {
    const response = await fetch(`${API_BASE_URL}/alerts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        historical_data: historicalData,
        anomalies,
        vendor_forecast: vendorForecast,
        vendor_metrics: vendorMetrics,
      }),
    });
    return response.json();
  },
};
