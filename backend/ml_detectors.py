import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from agent_tools import extract_values

class MLAgent:
    def __init__(self):
        self.name = "ML Agent"

    def detect_anomalies_isolation_forest(self, data, contamination=0.1):
        values = np.array(extract_values(data)).reshape(-1, 1)

        if len(values) < 10:
            return []

        clf = IsolationForest(contamination=contamination, random_state=42)
        predictions = clf.fit_predict(values)

        anomalies = []
        for i, (value, pred) in enumerate(zip(values.flatten(), predictions)):
            if pred == -1:
                anomalies.append({
                    'index': int(i),
                    'value': float(value),
                    'method': 'isolation_forest'
                })

        return anomalies

    def detect_anomalies_dbscan(self, data, eps=2.0, min_samples=5):
        values = np.array(extract_values(data)).reshape(-1, 1)

        if len(values) < min_samples:
            return []

        clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(values)
        labels = clustering.labels_

        anomalies = []
        for i, (value, label) in enumerate(zip(values.flatten(), labels)):
            if label == -1:
                anomalies.append({
                    'index': int(i),
                    'value': float(value),
                    'method': 'dbscan'
                })

        return anomalies

    def detect_moving_average_anomalies(self, data, window=24, threshold=2.0):
        values = np.array(extract_values(data))

        if len(values) < window:
            return []

        moving_avg = np.convolve(values, np.ones(window)/window, mode='valid')

        moving_std = np.array([np.std(values[max(0, i-window):i+1])
                               for i in range(len(values))])

        anomalies = []
        for i in range(window-1, len(values)):
            avg_idx = i - (window - 1)
            if avg_idx < len(moving_avg):
                deviation = abs(values[i] - moving_avg[avg_idx])
                if moving_std[i] > 0 and deviation > threshold * moving_std[i]:
                    anomalies.append({
                        'index': int(i),
                        'value': float(values[i]),
                        'method': 'moving_average'
                    })

        return anomalies

    def analyze_patterns(self, data):
        values = extract_values(data)

        insights = []

        recent_window = min(24, len(values) // 4)
        if len(values) > recent_window:
            recent_mean = np.mean(values[-recent_window:])
            overall_mean = np.mean(values)

            if abs(recent_mean - overall_mean) / overall_mean > 0.1:
                change_pct = ((recent_mean - overall_mean) / overall_mean) * 100
                insights.append({
                    'type': 'pattern_shift',
                    'severity': 'high' if abs(change_pct) > 15 else 'medium',
                    'message': f"Recent pattern shift detected. Average load has changed by {change_pct:.1f}% in last {recent_window} hours."
                })

        return {
            'pattern_insights': insights
        }
