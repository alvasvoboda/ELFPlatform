/*
  # Optimize RLS Performance and Fix Security Issues

  1. Performance Optimizations
    - Replace `auth.uid()` with `(select auth.uid())` in users table policies
    - This prevents re-evaluation of auth function for each row, improving query performance at scale
  
  2. Index Cleanup
    - Drop unused indexes on:
      - analysis_results.dataset_id
      - forecasts.dataset_id
      - anomalies.dataset_id
      - vendor_forecasts.dataset_id
      - vendor_performance_metrics.dataset_id
      - forecast_alerts.dataset_id
  
  3. Security Improvements - Fix RLS Policies
    - Replace "FOR ALL" policies with separate SELECT, INSERT, UPDATE, DELETE policies
    - Change from USING (true) to proper authenticated-only access
    - This is more secure and follows RLS best practices
    - Data is shared among authenticated users (no user_id column exists)
    
    Important Notes:
    - Tables don't have user_id columns, so data is shared
    - All authenticated users can access all data
    - This is intentional for the demo platform use case
    - Unauthenticated users have no access
*/

-- =============================================
-- 1. OPTIMIZE USERS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =============================================
-- 2. DROP UNUSED INDEXES
-- =============================================

DROP INDEX IF EXISTS idx_analysis_results_dataset_id;
DROP INDEX IF EXISTS idx_forecasts_dataset_id;
DROP INDEX IF EXISTS idx_anomalies_dataset_id;
DROP INDEX IF EXISTS idx_vendor_forecasts_dataset_id;
DROP INDEX IF EXISTS idx_vendor_performance_metrics_dataset_id;
DROP INDEX IF EXISTS idx_forecast_alerts_dataset_id;

-- =============================================
-- 3. FIX DATASETS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to datasets" ON datasets;
DROP POLICY IF EXISTS "Allow authenticated SELECT on datasets" ON datasets;
DROP POLICY IF EXISTS "Allow authenticated INSERT on datasets" ON datasets;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on datasets" ON datasets;
DROP POLICY IF EXISTS "Allow authenticated DELETE on datasets" ON datasets;

CREATE POLICY "Allow authenticated SELECT on datasets"
  ON datasets FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 4. FIX ANALYSIS_RESULTS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "Allow authenticated SELECT on analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "Allow authenticated INSERT on analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on analysis_results" ON analysis_results;
DROP POLICY IF EXISTS "Allow authenticated DELETE on analysis_results" ON analysis_results;

CREATE POLICY "Allow authenticated SELECT on analysis_results"
  ON analysis_results FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 5. FIX FORECASTS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to forecasts" ON forecasts;
DROP POLICY IF EXISTS "Allow authenticated SELECT on forecasts" ON forecasts;
DROP POLICY IF EXISTS "Allow authenticated INSERT on forecasts" ON forecasts;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on forecasts" ON forecasts;
DROP POLICY IF EXISTS "Allow authenticated DELETE on forecasts" ON forecasts;

CREATE POLICY "Allow authenticated SELECT on forecasts"
  ON forecasts FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 6. FIX ANOMALIES RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow authenticated SELECT on anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow authenticated INSERT on anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on anomalies" ON anomalies;
DROP POLICY IF EXISTS "Allow authenticated DELETE on anomalies" ON anomalies;

CREATE POLICY "Allow authenticated SELECT on anomalies"
  ON anomalies FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 7. FIX AGENT_CONVERSATIONS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to agent_conversations" ON agent_conversations;
DROP POLICY IF EXISTS "Allow authenticated SELECT on agent_conversations" ON agent_conversations;
DROP POLICY IF EXISTS "Allow authenticated INSERT on agent_conversations" ON agent_conversations;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on agent_conversations" ON agent_conversations;
DROP POLICY IF EXISTS "Allow authenticated DELETE on agent_conversations" ON agent_conversations;

CREATE POLICY "Allow authenticated SELECT on agent_conversations"
  ON agent_conversations FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 8. FIX VENDOR_FORECASTS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to vendor_forecasts" ON vendor_forecasts;
DROP POLICY IF EXISTS "Allow authenticated SELECT on vendor_forecasts" ON vendor_forecasts;
DROP POLICY IF EXISTS "Allow authenticated INSERT on vendor_forecasts" ON vendor_forecasts;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on vendor_forecasts" ON vendor_forecasts;
DROP POLICY IF EXISTS "Allow authenticated DELETE on vendor_forecasts" ON vendor_forecasts;

CREATE POLICY "Allow authenticated SELECT on vendor_forecasts"
  ON vendor_forecasts FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 9. FIX VENDOR_PERFORMANCE_METRICS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to vendor_performance_metrics" ON vendor_performance_metrics;
DROP POLICY IF EXISTS "Allow authenticated SELECT on vendor_performance_metrics" ON vendor_performance_metrics;
DROP POLICY IF EXISTS "Allow authenticated INSERT on vendor_performance_metrics" ON vendor_performance_metrics;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on vendor_performance_metrics" ON vendor_performance_metrics;
DROP POLICY IF EXISTS "Allow authenticated DELETE on vendor_performance_metrics" ON vendor_performance_metrics;

CREATE POLICY "Allow authenticated SELECT on vendor_performance_metrics"
  ON vendor_performance_metrics FOR SELECT
  TO authenticated
  USING (true);

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

-- =============================================
-- 10. FIX FORECAST_ALERTS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public access to forecast_alerts" ON forecast_alerts;
DROP POLICY IF EXISTS "Allow authenticated SELECT on forecast_alerts" ON forecast_alerts;
DROP POLICY IF EXISTS "Allow authenticated INSERT on forecast_alerts" ON forecast_alerts;
DROP POLICY IF EXISTS "Allow authenticated UPDATE on forecast_alerts" ON forecast_alerts;
DROP POLICY IF EXISTS "Allow authenticated DELETE on forecast_alerts" ON forecast_alerts;

CREATE POLICY "Allow authenticated SELECT on forecast_alerts"
  ON forecast_alerts FOR SELECT
  TO authenticated
  USING (true);

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