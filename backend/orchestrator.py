import numpy as np
from statistical import StatisticalAgent
from ml_detectors import MLAgent
from timeseries_detectors import TimeSeriesAgent
from agent_tools import extract_values, calculate_mape, calculate_mae, calculate_rmse

class AnalyticsOrchestrator:
    def __init__(self):
        self.statistical_agent = StatisticalAgent()
        self.ml_agent = MLAgent()
        self.timeseries_agent = TimeSeriesAgent()

    def run_comprehensive_analysis(self, data):
        stat_results = self.statistical_agent.analyze(data)
        ml_results = self.ml_agent.analyze_patterns(data)
        ts_results = self.timeseries_agent.analyze_autocorrelation(data)

        all_insights = (
            stat_results.get('insights', []) +
            ml_results.get('pattern_insights', []) +
            ts_results.get('autocorrelation_insights', [])
        )

        return {
            'statistical_analysis': stat_results,
            'insights': all_insights
        }

    def detect_all_anomalies(self, data, sensitivity=0.95):
        statistical_anomalies = (
            self.statistical_agent.detect_anomalies_zscore(data, sensitivity) +
            self.statistical_agent.detect_anomalies_iqr(data)
        )

        ml_anomalies = (
            self.ml_agent.detect_anomalies_isolation_forest(data) +
            self.ml_agent.detect_moving_average_anomalies(data)
        )

        ts_anomalies = self.timeseries_agent.detect_seasonal_anomalies(data)

        seen_indices = set()
        unique_anomalies = []
        for anomaly in statistical_anomalies + ml_anomalies + ts_anomalies:
            if anomaly['index'] not in seen_indices:
                seen_indices.add(anomaly['index'])
                unique_anomalies.append(anomaly)

        unique_anomalies.sort(key=lambda x: x['index'])

        return {
            'statistical': statistical_anomalies,
            'ml_based': ml_anomalies,
            'timeseries': ts_anomalies,
            'summary': unique_anomalies
        }

    def generate_forecast(self, data, horizon=48):
        forecast_values = self.timeseries_agent.simple_forecast(data, horizon)

        lower_95 = [v * 0.9 for v in forecast_values]
        upper_95 = [v * 1.1 for v in forecast_values]

        values = extract_values(data)
        trend = np.polyfit(range(len(values)), values, 1)[0]

        insights = [{
            'type': 'forecast_trend',
            'severity': 'info',
            'message': f"Forecast shows {'increase' if trend > 0 else 'decrease'} of {abs(trend):.2f} per period."
        }]

        return {
            'values': forecast_values,
            'confidence_intervals': {
                'lower_95': lower_95,
                'upper_95': upper_95
            },
            'insights': insights
        }

    def calculate_forecast_confidence(self, vendor_forecast, historical_data, vendor_metrics=None):
        score = 0
        factors = []

        if vendor_metrics and 'mape' in vendor_metrics:
            mape = vendor_metrics['mape']

            if mape < 5:
                accuracy_score = 40
                impact = 'positive'
                detail = f"Excellent accuracy (MAPE: {mape:.1f}%)"
            elif mape < 10:
                accuracy_score = 30
                impact = 'positive'
                detail = f"Good accuracy (MAPE: {mape:.1f}%)"
            elif mape < 15:
                accuracy_score = 20
                impact = 'neutral'
                detail = f"Fair accuracy (MAPE: {mape:.1f}%)"
            else:
                accuracy_score = 10
                impact = 'negative'
                detail = f"Poor accuracy (MAPE: {mape:.1f}%)"

            score += accuracy_score
            factors.append({
                'factor': 'Vendor Accuracy',
                'impact': impact,
                'detail': detail
            })

        historical_values = extract_values(historical_data)
        volatility = np.std(historical_values) / np.mean(historical_values) if np.mean(historical_values) != 0 else 0

        if volatility < 0.1:
            stability_score = 30
            impact = 'positive'
            detail = "Low volatility"
        elif volatility < 0.3:
            stability_score = 20
            impact = 'neutral'
            detail = "Moderate volatility"
        else:
            stability_score = 10
            impact = 'negative'
            detail = "High volatility"

        score += stability_score
        factors.append({
            'factor': 'Data Stability',
            'impact': impact,
            'detail': detail
        })

        recent_trend = np.polyfit(range(len(historical_values[-48:])), historical_values[-48:], 1)[0]
        vendor_values = extract_values(vendor_forecast)
        forecast_trend = np.polyfit(range(len(vendor_values)), vendor_values, 1)[0]

        trend_diff = abs(recent_trend - forecast_trend)
        if trend_diff < 0.05:
            trend_score = 30
            impact = 'positive'
            detail = "Strong trend alignment"
        elif trend_diff < 0.15:
            trend_score = 20
            impact = 'neutral'
            detail = "Partial trend alignment"
        else:
            trend_score = 10
            impact = 'negative'
            detail = "Weak trend alignment"

        score += trend_score
        factors.append({
            'factor': 'Trend Alignment',
            'impact': impact,
            'detail': detail
        })

        if score >= 70:
            confidence_level = 'HIGH'
            recommendation = "Accept forecast as-is. High confidence in accuracy."
        elif score >= 40:
            confidence_level = 'MEDIUM'
            recommendation = "Review forecast and consider adjustments based on recent patterns."
        else:
            confidence_level = 'LOW'
            recommendation = "Request revised forecast. Current forecast has low confidence."

        return {
            'confidence_score': score,
            'confidence_level': confidence_level,
            'factors': factors,
            'recommendation': recommendation,
            'volatility': float(volatility),
            'trend_alignment': float(1 - min(trend_diff, 1))
        }

    def generate_alerts(self, historical_data, anomalies, vendor_forecast=None, vendor_metrics=None):
        alerts = []

        if len(anomalies) > 10:
            alerts.append({
                'alert_type': 'anomaly_count',
                'severity': 'high',
                'title': 'High Anomaly Activity',
                'description': f'Detected {len(anomalies)} anomalies in recent data. Investigate potential data quality issues or unusual load patterns.',
                'metadata': {'count': len(anomalies)}
            })
        elif len(anomalies) > 5:
            alerts.append({
                'alert_type': 'anomaly_count',
                'severity': 'medium',
                'title': 'Elevated Anomaly Count',
                'description': f'Detected {len(anomalies)} anomalies. Monitor for persistent issues.',
                'metadata': {'count': len(anomalies)}
            })

        values = extract_values(historical_data)
        recent_window = min(24, len(values) // 4)
        if len(values) > recent_window:
            recent_mean = np.mean(values[-recent_window:])
            overall_mean = np.mean(values)
            change_pct = ((recent_mean - overall_mean) / overall_mean) * 100

            if abs(change_pct) > 15:
                alerts.append({
                    'alert_type': 'pattern_shift',
                    'severity': 'high',
                    'title': 'Significant Pattern Shift',
                    'description': f'Average load has {"increased" if change_pct > 0 else "decreased"} by {abs(change_pct):.1f}% in last {recent_window} hours.',
                    'metadata': {'change_percent': float(change_pct)}
                })

        if vendor_forecast and vendor_metrics:
            vendor_values = extract_values(vendor_forecast)
            if len(vendor_values) > 0 and len(values) >= len(vendor_values):
                actual_values = values[-len(vendor_values):]
                deviation = abs(np.mean(vendor_values) - np.mean(actual_values)) / np.mean(actual_values) * 100

                if deviation > 20:
                    alerts.append({
                        'alert_type': 'forecast_deviation',
                        'severity': 'high',
                        'title': 'Large Forecast Deviation',
                        'description': f'Vendor forecast deviates from recent actuals by {deviation:.1f}%.',
                        'metadata': {'deviation_percent': float(deviation)}
                    })

            if 'mape' in vendor_metrics and vendor_metrics['mape'] > 15:
                alerts.append({
                    'alert_type': 'vendor_accuracy',
                    'severity': 'medium',
                    'title': 'Poor Vendor Accuracy',
                    'description': f'Vendor forecast accuracy is below acceptable threshold (MAPE: {vendor_metrics["mape"]:.1f}%).',
                    'metadata': {'mape': vendor_metrics['mape']}
                })

        return alerts
