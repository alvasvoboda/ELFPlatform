from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
from orchestrator import AnalyticsOrchestrator
from agent_tools import extract_values

app = Flask(__name__)
CORS(app)

orchestrator = AnalyticsOrchestrator()

def generate_synthetic_data(num_points=500, pattern='day_ahead_full', noise_level=0.1):
    base_load = 40
    data = []

    for i in range(num_points):
        hour_of_day = i % 24
        day_of_week = (i // 24) % 7
        is_weekend = day_of_week >= 5

        if 'day_ahead' in pattern:
            if 6 <= hour_of_day < 9:
                daily_pattern = 48 + (hour_of_day - 6) * 2
            elif 9 <= hour_of_day < 17:
                daily_pattern = 55
            elif 17 <= hour_of_day < 20:
                daily_pattern = 58
            elif 20 <= hour_of_day < 22:
                daily_pattern = 50
            else:
                daily_pattern = 35

            if is_weekend:
                daily_pattern *= 0.85

            value = daily_pattern

            if 'seasonal' in pattern or 'full' in pattern:
                seasonal = 12 * np.sin(2 * np.pi * i / (24 * 365.25))
                value += seasonal

            if 'trend' in pattern or 'full' in pattern:
                trend = 0.01 * i
                value += trend

        elif pattern == 'realtime_random_walk':
            if i == 0:
                value = base_load
            else:
                value = data[-1]['value'] + np.random.normal(0, 2)

        elif pattern == 'realtime_spikes':
            hour_of_day_pattern = 40 + 10 * np.sin(2 * np.pi * hour_of_day / 24)
            value = hour_of_day_pattern

            if np.random.random() < 0.03:
                value += np.random.choice([-1, 1]) * 8

        else:
            value = base_load

        noise = np.random.normal(0, noise_level * value)
        value += noise

        timestamp = (datetime.now() - timedelta(hours=num_points - i)).isoformat()
        data.append({'timestamp': timestamp, 'value': float(value)})

    return data

def get_anomaly_guidance(pattern):
    guidance_map = {
        'day_ahead_trend': {
            'description': 'Day-Ahead Load with Trend: Long-term increasing or decreasing pattern overlaid on daily load cycles.',
            'typical_anomalies': [
                'Sustained deviations from baseline trend',
                'Phase shifts in daily patterns',
                'Structural breaks in trend line',
                'Unexpected weekday/weekend variations'
            ],
            'causes': [
                'Economic changes affecting demand',
                'Energy efficiency programs',
                'Distributed energy resource (DER) growth',
                'Evolving consumption patterns'
            ],
            'recommended_actions': [
                'Monthly model recalibration',
                'Track DER penetration levels',
                'Monitor for structural changes',
                'Review trend forecasts quarterly'
            ]
        },
        'day_ahead_seasonal': {
            'description': 'Day-Ahead Load with Seasonality: Annual cycles with daily patterns but no long-term trend.',
            'typical_anomalies': [
                'Out-of-season temperature events',
                'Holiday period irregularities',
                'Weekend pattern disruptions',
                'Unexpected seasonal peaks'
            ],
            'causes': [
                'Extreme weather events',
                'Holiday schedule changes',
                'Special events or outages',
                'Calendar effects'
            ],
            'recommended_actions': [
                'Seasonal model updates',
                'Weather forecast integration',
                'Holiday calendar maintenance',
                'Event schedule tracking'
            ]
        },
        'day_ahead_full': {
            'description': 'Day-Ahead Load with Trend and Seasonality: Complex pattern with both long-term trends and seasonal variations.',
            'typical_anomalies': [
                'Compound deviations (trend + seasonal)',
                'Multi-factor anomalies',
                'Regime changes',
                'Complex interaction effects'
            ],
            'causes': [
                'Multiple simultaneous factors',
                'Climate change impacts',
                'Market structure changes',
                'Technology adoption shifts'
            ],
            'recommended_actions': [
                'Comprehensive model reviews',
                'Multi-variable analysis',
                'Scenario planning',
                'Adaptive forecasting methods'
            ]
        },
        'realtime_random_walk': {
            'description': 'Real-Time Deviations with Random Walk: Forecast errors that accumulate and persist over time.',
            'typical_anomalies': [
                'Persistent forecast bias',
                'Cumulative error growth',
                'Directional drift',
                'Sustained over/under forecasting'
            ],
            'causes': [
                'Model specification errors',
                'Missing explanatory variables',
                'Changing load composition',
                'Insufficient model updates'
            ],
            'recommended_actions': [
                'Real-time bias correction',
                'Model retraining',
                'Add new features/variables',
                'Implement adaptive algorithms'
            ]
        },
        'realtime_spikes': {
            'description': 'Real-Time Deviations with Spikes: Sudden, short-duration load changes that are difficult to predict.',
            'typical_anomalies': [
                'Industrial load trips',
                'Large commercial starts/stops',
                'Transmission events',
                'Generator outages'
            ],
            'causes': [
                'Unscheduled outages',
                'Emergency demand response',
                'Equipment failures',
                'Operational events'
            ],
            'recommended_actions': [
                'Event detection systems',
                'Rapid model updates',
                'Operator notifications',
                'Post-event analysis'
            ]
        }
    }

    return guidance_map.get(pattern, guidance_map['day_ahead_full'])

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Analytics API is running'
    })

@app.route('/api/generate-data', methods=['POST'])
def generate_data():
    try:
        params = request.json
        num_points = params.get('num_points', 500)
        pattern = params.get('pattern', 'day_ahead_full')
        noise_level = params.get('noise_level', 0.1)

        data = generate_synthetic_data(num_points, pattern, noise_level)

        values = [d['value'] for d in data]
        summary = {
            'count': len(data),
            'mean': float(np.mean(values)),
            'std': float(np.std(values)),
            'min': float(np.min(values)),
            'max': float(np.max(values))
        }

        return jsonify({
            'data': data,
            'summary': summary
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        params = request.json
        data = params.get('data', [])

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        result = orchestrator.run_comprehensive_analysis(data)

        return jsonify({
            'timestamp': datetime.now().isoformat(),
            'analysis_type': 'comprehensive',
            'statistical_analysis': result['statistical_analysis'],
            'insights': result['insights']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast', methods=['POST'])
def forecast():
    try:
        params = request.json
        data = params.get('data', [])
        horizon = params.get('horizon', 48)

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        result = orchestrator.generate_forecast(data, horizon)

        return jsonify({
            'timestamp': datetime.now().isoformat(),
            'horizon': horizon,
            'forecast_data': {
                'values': result['values']
            },
            'confidence_intervals': result['confidence_intervals'],
            'insights': result['insights']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect-anomalies', methods=['POST'])
def detect_anomalies():
    try:
        params = request.json
        data = params.get('data', [])
        sensitivity = params.get('sensitivity', 0.95)
        pattern_type = params.get('pattern_type', 'day_ahead_full')

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        anomalies = orchestrator.detect_all_anomalies(data, sensitivity)

        guidance = get_anomaly_guidance(pattern_type)

        insights = []
        if len(anomalies['summary']) > 10:
            insights.append({
                'type': 'anomaly_count',
                'severity': 'high',
                'message': f"High number of anomalies detected ({len(anomalies['summary'])}). Investigate data quality."
            })

        return jsonify({
            'timestamp': datetime.now().isoformat(),
            'sensitivity': sensitivity,
            'anomalies': anomalies,
            'summary': anomalies['summary'][:20],
            'insights': insights,
            'guidance': guidance
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/agents/query', methods=['POST'])
def agent_query():
    try:
        params = request.json
        query = params.get('query', '').lower()
        context = params.get('context', {})

        if 'forecast' in query or 'predict' in query:
            agent_type = 'forecasting'
            response = {
                'message': 'I can generate forecasts for your load data. Use the Forecast tab to create 48-hour ahead predictions.',
                'suggested_action': 'forecast',
                'parameters': {'horizon': 48}
            }
        elif 'anomal' in query or 'outlier' in query or 'unusual' in query:
            agent_type = 'anomaly_detection'
            response = {
                'message': 'I can detect anomalies using multiple methods including statistical, machine learning, and time series approaches.',
                'suggested_action': 'detect_anomalies',
                'parameters': {'sensitivity': 0.95}
            }
        elif 'pattern' in query or 'trend' in query or 'seasonal' in query:
            agent_type = 'pattern_analysis'
            response = {
                'message': 'I can analyze patterns including trends, seasonality, and correlations in your data.',
                'suggested_action': 'analyze',
                'parameters': {'analysis_type': 'comprehensive'}
            }
        else:
            agent_type = 'general'
            response = {
                'message': 'I can help with forecasting, anomaly detection, and pattern analysis. What would you like to know?'
            }

        return jsonify({
            'query': query,
            'agent_type': agent_type,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/confidence', methods=['POST'])
def forecast_confidence():
    try:
        params = request.json
        vendor_forecast = params.get('vendor_forecast', [])
        historical_data = params.get('historical_data', [])
        vendor_metrics = params.get('vendor_metrics', {})

        if not vendor_forecast or not historical_data:
            return jsonify({'error': 'Missing required data'}), 400

        result = orchestrator.calculate_forecast_confidence(
            vendor_forecast,
            historical_data,
            vendor_metrics
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/generate', methods=['POST'])
def generate_alerts():
    try:
        params = request.json
        historical_data = params.get('historical_data', [])
        anomalies = params.get('anomalies', [])
        vendor_forecast = params.get('vendor_forecast')
        vendor_metrics = params.get('vendor_metrics')

        if not historical_data:
            return jsonify({'error': 'Missing historical data'}), 400

        alerts = orchestrator.generate_alerts(
            historical_data,
            anomalies,
            vendor_forecast,
            vendor_metrics
        )

        return jsonify({'alerts': alerts})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
