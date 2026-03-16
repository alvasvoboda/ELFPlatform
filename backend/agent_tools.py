import numpy as np
from datetime import datetime, timedelta

def extract_values(data):
    if isinstance(data, list):
        if len(data) > 0 and isinstance(data[0], dict):
            return [float(d.get('value', 0)) for d in data]
        return [float(x) for x in data]
    return data

def calculate_statistics(values):
    values = np.array(values)
    return {
        'mean': float(np.mean(values)),
        'median': float(np.median(values)),
        'std': float(np.std(values)),
        'min': float(np.min(values)),
        'max': float(np.max(values)),
        'q25': float(np.percentile(values, 25)),
        'q75': float(np.percentile(values, 75))
    }

def calculate_trend(values):
    n = len(values)
    x = np.arange(n)
    coefficients = np.polyfit(x, values, 1)
    return float(coefficients[0])

def normalize_data(values):
    values = np.array(values)
    mean = np.mean(values)
    std = np.std(values)
    if std == 0:
        return values - mean
    return (values - mean) / std

def calculate_mape(actual, forecast):
    actual = np.array(actual)
    forecast = np.array(forecast)
    mask = actual != 0
    return float(np.mean(np.abs((actual[mask] - forecast[mask]) / actual[mask])) * 100)

def calculate_mae(actual, forecast):
    return float(np.mean(np.abs(np.array(actual) - np.array(forecast))))

def calculate_rmse(actual, forecast):
    return float(np.sqrt(np.mean((np.array(actual) - np.array(forecast)) ** 2)))

def calculate_bias(actual, forecast):
    return float(np.mean(np.array(forecast) - np.array(actual)))
