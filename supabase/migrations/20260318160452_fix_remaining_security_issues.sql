/*
  # Fix Remaining Security Issues

  ## Changes Made
  
  1. Add Indexes on Foreign Keys
     - Create indexes for all foreign key columns to improve query performance
     - These indexes help with JOIN operations and CASCADE deletes
  
  2. Implement Proper RLS Policies
     - Keep SELECT available for anon users (read-only demo access)
     - Restrict INSERT, UPDATE, DELETE to authenticated users only
     - This provides better security while maintaining demo functionality
  
  ## Security Model
  
  - Anonymous users: Read-only access (SELECT)
  - Authenticated users: Full CRUD access
  - Production recommendation: Further restrict based on user ownership
*/

-- Add indexes on all foreign key columns for better query performance
CREATE INDEX IF NOT EXISTS idx_analysis_results_dataset_id 
  ON analysis_results(dataset_id);

CREATE INDEX IF NOT EXISTS idx_forecasts_dataset_id 
  ON forecasts(dataset_id);

CREATE INDEX IF NOT EXISTS idx_anomalies_dataset_id 
  ON anomalies(dataset_id);

CREATE INDEX IF NOT EXISTS idx_vendor_forecasts_dataset_id 
  ON vendor_forecasts(dataset_id);

CREATE INDEX IF NOT EXISTS idx_vendor_performance_metrics_dataset_id 
  ON vendor_performance_metrics(dataset_id);

CREATE INDEX IF NOT EXISTS idx_forecast_alerts_dataset_id 
  ON forecast_alerts(dataset_id);

-- Drop overly permissive anon policies for INSERT, UPDATE, DELETE
-- Keep only SELECT for anon users

-- datasets table
DROP POLICY IF EXISTS "Allow anon INSERT on datasets" ON datasets;
DROP POLICY IF EXISTS "Allow anon UPDATE on datasets" ON datasets;
DROP POLICY IF EXISTS "Allow anon DELETE on datasets" ON datasets;

CREATE POLICY "Allow authenticated INSERT on datasets"
  ON datasets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on datasets"
  ON datasets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on datasets"
  ON datasets FOR DELETE
  TO authenticated
  USING (true);

-- analysis_results table
DROP POLICY IF EXISTS "Allow anon INSERT on analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "Allow anon UPDATE on analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "Allow anon DELETE on analysis_results" ON analysis_results;

CREATE POLICY "Allow authenticated INSERT on analysis_results"
  ON analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on analysis_results"
  ON analysis_results FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on analysis_results"
  ON analysis_results FOR DELETE
  TO authenticated
  USING (true);

-- forecasts table
DROP POLICY IF EXISTS "Allow anon INSERT on forecasts" ON forecasts;
DROP POLICY IF EXISTS "Allow anon UPDATE on forecasts" ON forecasts;
DROP POLICY IF EXISTS "Allow anon DELETE on forecasts" ON forecasts;

CREATE POLICY "Allow authenticated INSERT on forecasts"
  ON forecasts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on forecasts"
  ON forecasts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on forecasts"
  ON forecasts FOR DELETE
  TO authenticated
  USING (true);

-- anomalies table
DROP POLICY IF EXISTS "Allow anon INSERT on anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow anon UPDATE on anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow anon DELETE on anomalies" ON anomalies;

CREATE POLICY "Allow authenticated INSERT on anomalies"
  ON anomalies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on anomalies"
  ON anomalies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on anomalies"
  ON anomalies FOR DELETE
  TO authenticated
  USING (true);

-- agent_conversations table
DROP POLICY IF EXISTS "Allow anon INSERT on agent_conversations" ON agent_conversations;
DROP POLICY IF EXISTS "Allow anon UPDATE on agent_conversations" ON agent_conversations;
DROP POLICY IF EXISTS "Allow anon DELETE on agent_conversations" ON agent_conversations;

CREATE POLICY "Allow authenticated INSERT on agent_conversations"
  ON agent_conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on agent_conversations"
  ON agent_conversations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on agent_conversations"
  ON agent_conversations FOR DELETE
  TO authenticated
  USING (true);

-- vendor_forecasts table
DROP POLICY IF EXISTS "Allow anon INSERT on vendor_forecasts" ON vendor_forecasts;
DROP POLICY IF EXISTS "Allow anon UPDATE on vendor_forecasts" ON vendor_forecasts;
DROP POLICY IF EXISTS "Allow anon DELETE on vendor_forecasts" ON vendor_forecasts;

CREATE POLICY "Allow authenticated INSERT on vendor_forecasts"
  ON vendor_forecasts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on vendor_forecasts"
  ON vendor_forecasts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on vendor_forecasts"
  ON vendor_forecasts FOR DELETE
  TO authenticated
  USING (true);

-- vendor_performance_metrics table
DROP POLICY IF EXISTS "Allow anon INSERT on vendor_performance_metrics" ON vendor_performance_metrics;
DROP POLICY IF EXISTS "Allow anon UPDATE on vendor_performance_metrics" ON vendor_performance_metrics;
DROP POLICY IF EXISTS "Allow anon DELETE on vendor_performance_metrics" ON vendor_performance_metrics;

CREATE POLICY "Allow authenticated INSERT on vendor_performance_metrics"
  ON vendor_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on vendor_performance_metrics"
  ON vendor_performance_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on vendor_performance_metrics"
  ON vendor_performance_metrics FOR DELETE
  TO authenticated
  USING (true);

-- forecast_alerts table
DROP POLICY IF EXISTS "Allow anon INSERT on forecast_alerts" ON forecast_alerts;
DROP POLICY IF EXISTS "Allow anon UPDATE on forecast_alerts" ON forecast_alerts;
DROP POLICY IF EXISTS "Allow anon DELETE on forecast_alerts" ON forecast_alerts;

CREATE POLICY "Allow authenticated INSERT on forecast_alerts"
  ON forecast_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated UPDATE on forecast_alerts"
  ON forecast_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated DELETE on forecast_alerts"
  ON forecast_alerts FOR DELETE
  TO authenticated
  USING (true);