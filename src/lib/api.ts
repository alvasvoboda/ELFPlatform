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
    const response = await fetch(`${API_BASE_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, horizon }),
    });
    return response.json();
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
