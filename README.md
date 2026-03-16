# Electricity Load Forecasting Platform

An AI-powered electricity load forecasting platform designed for utility operators to analyze historical load data, generate forecasts, detect anomalies, and assess vendor forecast accuracy.

## Features

- **Morning Briefing Dashboard**: Daily operational briefing with alerts and forecast confidence assessment
- **Pattern Analysis**: Analyze 5 different load patterns (day-ahead trend/seasonal/full, real-time random walk/spikes)
- **48-Hour Forecasting**: Generate load forecasts using time series analysis
- **Multi-Method Anomaly Detection**: Statistical, ML, and time series-based anomaly detection
- **Vendor Performance Tracking**: Monitor and evaluate vendor forecast accuracy
- **AI Agent**: Natural language interface for data analysis queries

## Technology Stack

### Frontend
- React 18.3.1 with TypeScript
- Vite 5.4.2
- Tailwind CSS 3.4.1
- Lucide React (icons)
- Supabase JS 2.57.4

### Backend
- Python 3.x with Flask
- NumPy, Pandas (data processing)
- Scikit-learn (machine learning)
- SciPy, Statsmodels (statistical analysis)

### Database
- Supabase (PostgreSQL) with Row Level Security

## Setup Instructions

### 1. Frontend Setup

Install dependencies:
```bash
npm install
```

Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:
```bash
npm run dev
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`.

### 3. Database Setup

The database schema has already been created via Supabase migrations. The following tables are available:

- `datasets` - Historical load data
- `analysis_results` - Analysis outputs
- `forecasts` - Generated forecasts
- `anomalies` - Detected anomalies
- `agent_conversations` - AI agent chat history
- `vendor_forecasts` - Vendor forecast data
- `vendor_performance_metrics` - Vendor accuracy metrics
- `forecast_alerts` - Generated alerts

## Usage Guide

### Pattern Selection

Choose from 5 different load patterns:

**Day-Ahead Patterns:**
- **Trend**: Long-term increasing/decreasing pattern with daily cycles
- **Seasonal**: Annual cycles with daily patterns, no long-term trend
- **Full**: Complete pattern with trend + seasonality + daily cycles

**Real-Time Patterns:**
- **Random Walk**: Forecast errors that accumulate over time
- **Spikes**: Sudden short-duration load changes

### Tabs

1. **Morning Briefing**: View daily operational summary, confidence assessment, and active alerts
2. **Overview**: Examine historical data, statistics, and insights
3. **Forecast**: Generate 48-hour ahead forecasts and compare to actuals
4. **Anomalies**: Detect and investigate unusual load patterns
5. **AI Agent**: Ask natural language questions about your data

### Workflow Examples

#### Generate and Analyze Data
1. Select a load pattern (e.g., "Full")
2. Click "Analyze" to run comprehensive analysis
3. Review insights and statistics in the Overview tab

#### Create Forecasts
1. Navigate to the Forecast tab
2. Click "Generate Forecast"
3. Optionally click "Compare to Actuals" to see error metrics

#### Detect Anomalies
1. Navigate to the Anomalies tab
2. Click "Detect Anomalies"
3. Review pattern-specific guidance and detected anomalies

#### Use AI Agent
1. Navigate to the AI Agent tab
2. Type a query like "Forecast next 24 hours"
3. Agent will respond and optionally trigger the appropriate analysis

## API Endpoints

The Flask backend provides the following endpoints:

- `GET /api/health` - Health check
- `POST /api/generate-data` - Generate synthetic load data
- `POST /api/analyze` - Run comprehensive analysis
- `POST /api/forecast` - Generate forecasts
- `POST /api/detect-anomalies` - Detect anomalies
- `POST /api/agents/query` - Query the AI agent
- `POST /api/forecast/confidence` - Calculate forecast confidence
- `POST /api/alerts/generate` - Generate operational alerts

## Build for Production

Build the frontend:
```bash
npm run build
```

The output will be in the `dist/` directory.

## Project Structure

```
├── backend/
│   ├── app.py                    # Flask server
│   ├── orchestrator.py           # Multi-agent coordinator
│   ├── statistical.py            # Statistical analysis agent
│   ├── ml_detectors.py           # Machine learning agent
│   ├── timeseries_detectors.py   # Time series agent
│   ├── agent_tools.py            # Utility functions
│   └── requirements.txt          # Python dependencies
├── src/
│   ├── components/
│   │   ├── TimeSeriesChart.tsx
│   │   ├── InsightCard.tsx
│   │   ├── AnomalyGuidance.tsx
│   │   ├── AgentChat.tsx
│   │   ├── MorningBriefing.tsx
│   │   └── VendorPerformance.tsx
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   └── supabase.ts           # Supabase client
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main application
│   └── main.tsx                  # Entry point
└── README.md
```

## Key Metrics

### Forecast Accuracy
- **MAPE**: Mean Absolute Percentage Error
- **MAE**: Mean Absolute Error
- **RMSE**: Root Mean Squared Error
- **Bias**: Average forecast bias

### Confidence Levels
- **HIGH** (≥70 points): Accept forecast as-is
- **MEDIUM** (40-69 points): Review forecast
- **LOW** (<40 points): Request revised forecast

## License

This project is for demonstration purposes.
