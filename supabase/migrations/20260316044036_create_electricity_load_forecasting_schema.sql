/*
  # Electricity Load Forecasting Platform Schema

  1. New Tables
    - `datasets`
      - `id` (uuid, primary key)
      - `name` (text) - Dataset name
      - `description` (text) - Dataset description
      - `data` (jsonb) - Array of DataPoint objects with timestamp and value
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `analysis_results`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, foreign key to datasets)
      - `analysis_type` (text) - Type of analysis performed
      - `results` (jsonb) - Analysis results data
      - `insights` (jsonb) - Array of insight objects
      - `created_at` (timestamptz)
    
    - `forecasts`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, foreign key to datasets)
      - `horizon` (integer) - Forecast horizon in hours
      - `forecast_data` (jsonb) - Forecast values and metadata
      - `confidence_intervals` (jsonb) - Upper and lower confidence bounds
      - `created_at` (timestamptz)
    
    - `anomalies`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, foreign key to datasets)
      - `detection_method` (text) - Method used for detection
      - `anomaly_data` (jsonb) - Array of anomaly objects
      - `severity` (text) - Severity level
      - `created_at` (timestamptz)
    
    - `agent_conversations`
      - `id` (uuid, primary key)
      - `query` (text) - User query
      - `agent_type` (text) - Type of agent that handled the query
      - `response` (jsonb) - Agent response data
      - `context` (jsonb) - Conversation context
      - `created_at` (timestamptz)
    
    - `vendor_forecasts`
      - `id` (uuid, primary key)
      - `vendor_name` (text) - Vendor name
      - `dataset_id` (uuid, foreign key to datasets)
      - `forecast_date` (timestamptz) - Date of forecast
      - `forecast_values` (jsonb) - Array of forecast values
      - `actual_values` (jsonb) - Array of actual values
      - `horizon` (integer) - Forecast horizon
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamptz)
    
    - `vendor_performance_metrics`
      - `id` (uuid, primary key)
      - `vendor_name` (text) - Vendor name
      - `dataset_id` (uuid, foreign key to datasets)
      - `period_start` (timestamptz) - Start of evaluation period
      - `period_end` (timestamptz) - End of evaluation period
      - `mape` (numeric) - Mean Absolute Percentage Error
      - `mae` (numeric) - Mean Absolute Error
      - `rmse` (numeric) - Root Mean Squared Error
      - `bias` (numeric) - Average forecast bias
      - `total_forecasts` (integer) - Number of forecasts evaluated
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamptz)
    
    - `forecast_alerts`
      - `id` (uuid, primary key)
      - `dataset_id` (uuid, foreign key to datasets)
      - `alert_type` (text) - Type of alert
      - `severity` (text) - Severity level (high/medium/low)
      - `title` (text) - Alert title
      - `description` (text) - Alert description
      - `metadata` (jsonb) - Additional metadata
      - `is_resolved` (boolean) - Resolution status
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add public access policies for demo purposes (SELECT, INSERT, UPDATE, DELETE allowed)
*/

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  insights jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  horizon integer NOT NULL,
  forecast_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_intervals jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  detection_method text NOT NULL,
  anomaly_data jsonb DEFAULT '[]'::jsonb,
  severity text,
  created_at timestamptz DEFAULT now()
);

-- Create agent_conversations table
CREATE TABLE IF NOT EXISTS agent_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  agent_type text NOT NULL,
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create vendor_forecasts table
CREATE TABLE IF NOT EXISTS vendor_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  forecast_date timestamptz NOT NULL,
  forecast_values jsonb DEFAULT '[]'::jsonb,
  actual_values jsonb DEFAULT '[]'::jsonb,
  horizon integer NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create vendor_performance_metrics table
CREATE TABLE IF NOT EXISTS vendor_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  mape numeric NOT NULL,
  mae numeric NOT NULL,
  rmse numeric NOT NULL,
  bias numeric NOT NULL,
  total_forecasts integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create forecast_alerts table
CREATE TABLE IF NOT EXISTS forecast_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable Row Level Security on all tables
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_alerts ENABLE ROW LEVEL SECURITY;

-- Create public access policies for demo purposes
CREATE POLICY "Public access to datasets"
  ON datasets FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to analysis_results"
  ON analysis_results FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to forecasts"
  ON forecasts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to anomalies"
  ON anomalies FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to agent_conversations"
  ON agent_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to vendor_forecasts"
  ON vendor_forecasts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to vendor_performance_metrics"
  ON vendor_performance_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to forecast_alerts"
  ON forecast_alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analysis_results_dataset_id ON analysis_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_dataset_id ON forecasts(dataset_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_dataset_id ON anomalies(dataset_id);
CREATE INDEX IF NOT EXISTS idx_vendor_forecasts_dataset_id ON vendor_forecasts(dataset_id);
CREATE INDEX IF NOT EXISTS idx_vendor_forecasts_vendor_name ON vendor_forecasts(vendor_name);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_metrics_dataset_id ON vendor_performance_metrics(dataset_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_metrics_vendor_name ON vendor_performance_metrics(vendor_name);
CREATE INDEX IF NOT EXISTS idx_forecast_alerts_dataset_id ON forecast_alerts(dataset_id);
CREATE INDEX IF NOT EXISTS idx_forecast_alerts_severity ON forecast_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_forecast_alerts_is_resolved ON forecast_alerts(is_resolved);