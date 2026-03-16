import os
import sys
from datetime import datetime, timedelta
import random

sys.path.append(os.path.dirname(__file__))

import json

vendor_data = {
    "vendor_name": "GridForecast Pro",
    "period_start": (datetime.now() - timedelta(days=30)).isoformat(),
    "period_end": datetime.now().isoformat(),
    "mape": 8.5,
    "mae": 125.3,
    "rmse": 178.6,
    "bias": -15.2,
    "total_forecasts": 48,
    "metadata": {
        "model_type": "LSTM",
        "training_period": "12 months",
        "features": ["temperature", "day_of_week", "hour_of_day"]
    }
}

print("Sample vendor performance metrics:")
print(json.dumps(vendor_data, indent=2))
print("\nTo insert this data, use the Supabase client in your frontend:")
print("await supabase.from('vendor_performance_metrics').insert(vendor_data);")
