import numpy as np
from scipy import stats
from agent_tools import extract_values, calculate_statistics, calculate_trend

class StatisticalAgent:
    def __init__(self):
        self.name = "Statistical Agent"

    def analyze(self, data):
        values = extract_values(data)

        descriptive_stats = calculate_statistics(values)
        trend = calculate_trend(values)

        insights = self.generate_insights(descriptive_stats, trend, values)

        return {
            'descriptive_stats': descriptive_stats,
            'trend': trend,
            'insights': insights
        }

    def detect_anomalies_zscore(self, data, sensitivity=0.95):
        values = np.array(extract_values(data))

        z_threshold = stats.norm.ppf((1 + sensitivity) / 2)

        mean = np.mean(values)
        std = np.std(values)

        if std == 0:
            return []

        z_scores = np.abs((values - mean) / std)

        anomalies = []
        for i, (value, z_score) in enumerate(zip(values, z_scores)):
            if z_score > z_threshold:
                anomalies.append({
                    'index': int(i),
                    'value': float(value),
                    'method': 'z-score',
                    'z_score': float(z_score)
                })

        return anomalies

    def detect_anomalies_iqr(self, data):
        values = np.array(extract_values(data))

        q25 = np.percentile(values, 25)
        q75 = np.percentile(values, 75)
        iqr = q75 - q25

        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr

        anomalies = []
        for i, value in enumerate(values):
            if value < lower_bound or value > upper_bound:
                anomalies.append({
                    'index': int(i),
                    'value': float(value),
                    'method': 'iqr'
                })

        return anomalies

    def generate_insights(self, stats, trend, values):
        insights = []

        cv = stats['std'] / stats['mean'] if stats['mean'] != 0 else 0

        if cv > 0.5:
            insights.append({
                'type': 'variability',
                'severity': 'high',
                'message': f"High variability detected (CV: {cv:.2f}). Data shows significant fluctuations."
            })
        elif cv > 0.3:
            insights.append({
                'type': 'variability',
                'severity': 'medium',
                'message': f"Moderate variability detected (CV: {cv:.2f})."
            })
        else:
            insights.append({
                'type': 'variability',
                'severity': 'info',
                'message': f"Low variability detected (CV: {cv:.2f}). Data is relatively stable."
            })

        if abs(trend) > 0.1:
            direction = "increasing" if trend > 0 else "decreasing"
            insights.append({
                'type': 'trend',
                'severity': 'medium',
                'message': f"Clear {direction} trend detected. Slope: {trend:.4f} per period."
            })

        return insights
