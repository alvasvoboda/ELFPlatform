export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface Insight {
  type: string;
  severity: 'info' | 'medium' | 'high';
  message: string;
}

export interface AnalysisResult {
  timestamp: string;
  analysis_type: string;
  statistical_analysis?: {
    descriptive_stats: {
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      q25: number;
      q75: number;
    };
    trend: number;
  };
  insights: Insight[];
}

export interface Forecast {
  timestamp: string;
  horizon: number;
  forecast_data: {
    values: number[];
  };
  confidence_intervals: {
    lower_95: number[];
    upper_95: number[];
  };
  insights: Insight[];
}

export interface Anomaly {
  index: number;
  value: number;
  method: string;
  z_score?: number;
  source?: string;
}

export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  agent_type?: string;
}

export interface AnomalyGuidance {
  description: string;
  typical_anomalies: string[];
  causes: string[];
  recommended_actions: string[];
}

export interface VendorMetrics {
  mape: number;
  mae: number;
  rmse: number;
  bias: number;
}

export interface Alert {
  alert_type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

export interface ConfidenceAssessment {
  confidence_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'neutral' | 'negative';
    detail: string;
  }>;
  recommendation: string;
  volatility: number;
  trend_alignment: number;
}
