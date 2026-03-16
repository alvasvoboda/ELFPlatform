import numpy as np
from scipy import signal
from agent_tools import extract_values

class TimeSeriesAgent:
    def __init__(self):
        self.name = "TimeSeries Agent"

    def simple_forecast(self, data, horizon=48):
        values = np.array(extract_values(data))

        n = len(values)
        x = np.arange(n)

        trend_coeffs = np.polyfit(x, values, 1)
        trend = np.poly1d(trend_coeffs)

        detrended = values - trend(x)

        period = 24
        if len(values) >= period * 2:
            seasonal = np.array([np.mean(detrended[i::period]) for i in range(period)])
        else:
            seasonal = np.zeros(period)

        forecast_values = []
        for i in range(horizon):
            future_idx = n + i
            trend_component = trend(future_idx)
            seasonal_component = seasonal[i % period]
            forecast_values.append(float(trend_component + seasonal_component))

        return forecast_values

    def detect_seasonal_anomalies(self, data, period=24):
        values = np.array(extract_values(data))

        if len(values) < period * 2:
            return []

        hourly_patterns = [[] for _ in range(period)]
        for i, value in enumerate(values):
            hour = i % period
            hourly_patterns[hour].append(value)

        hourly_means = [np.mean(pattern) if pattern else 0 for pattern in hourly_patterns]
        hourly_stds = [np.std(pattern) if len(pattern) > 1 else 1 for pattern in hourly_patterns]

        anomalies = []
        for i, value in enumerate(values):
            hour = i % period
            if hourly_stds[hour] > 0:
                z = abs(value - hourly_means[hour]) / hourly_stds[hour]
                if z > 3:
                    anomalies.append({
                        'index': int(i),
                        'value': float(value),
                        'method': 'seasonal'
                    })

        return anomalies

    def analyze_autocorrelation(self, data):
        values = extract_values(data)

        insights = []

        if len(values) > 48:
            lag_24 = self._calculate_autocorrelation(values, 24)
            if lag_24 > 0.7:
                insights.append({
                    'type': 'seasonality',
                    'severity': 'info',
                    'message': f"Strong 24-hour seasonality detected (r={lag_24:.2f})."
                })

        return {
            'autocorrelation_insights': insights
        }

    def _calculate_autocorrelation(self, values, lag):
        values = np.array(values)
        n = len(values)

        if lag >= n:
            return 0.0

        mean = np.mean(values)
        var = np.var(values)

        if var == 0:
            return 0.0

        autocov = np.sum((values[:n-lag] - mean) * (values[lag:] - mean)) / n

        return autocov / var
