import React, { useState, useEffect, useMemo } from 'react';
import { Zap, TrendingUp, Activity, AlertCircle, BarChart3 } from 'lucide-react';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { InsightCard } from './components/InsightCard';
import { AnomalyGuidance } from './components/AnomalyGuidance';
import { AgentChat } from './components/AgentChat';
import { MorningBriefing } from './components/MorningBriefing';
import { VendorPerformance } from './components/VendorPerformance';
import { BiasHeatmap } from './components/BiasHeatmap';
import { BiasSummaryPanel } from './components/BiasSummaryPanel';
import { api } from './lib/api';
import { supabase, ensureAuthenticated } from './lib/supabase';
import { generateSyntheticBiasData, getBiasForHour } from './lib/biasCalculator';
import { DataPoint, AnalysisResult, Forecast, Anomaly, AnomalyGuidance as AnomalyGuidanceType, ChatMessage, VendorMetrics } from './types';

type TabType = 'briefing' | 'overview' | 'forecast' | 'anomalies' | 'agent';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [data, setData] = useState<DataPoint[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [anomalyGuidance, setAnomalyGuidance] = useState<AnomalyGuidanceType | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showActuals, setShowActuals] = useState(false);
  const [currentPattern, setCurrentPattern] = useState('day_ahead_full');
  const [showBiasOverlay, setShowBiasOverlay] = useState(false);

  const biasData = useMemo(() => generateSyntheticBiasData(), []);

  const [vendorMetrics] = useState<VendorMetrics>({
    mape: 8.5,
    mae: 125.3,
    rmse: 178.6,
    bias: -15.2,
  });

  useEffect(() => {
    const initializeApp = async () => {
      await ensureAuthenticated();
      generateData('day_ahead_full');
    };
    initializeApp();
  }, []);

  const generateData = async (pattern: string) => {
    setIsLoading(true);
    setCurrentPattern(pattern);
    try {
      await ensureAuthenticated();

      const result = await api.generateData({
        num_points: 500,
        pattern,
        noise_level: 0.1,
      });

      setData(result.data);

      const { data: insertData, error } = await supabase
        .from('datasets')
        .insert({
          name: `${pattern}_${new Date().toISOString()}`,
          description: `Synthetic load data with pattern: ${pattern}`,
          data: result.data,
          metadata: { pattern, summary: result.summary },
        })
        .select()
        .single();

      if (error) console.error('Error saving dataset:', error);
    } catch (error) {
      console.error('Error generating data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      await ensureAuthenticated();

      const result = await api.analyze(data, 'comprehensive');
      setAnalysisResult(result);

      await supabase.from('analysis_results').insert({
        analysis_type: result.analysis_type,
        results: result.statistical_analysis,
        insights: result.insights,
      });
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runForecast = async () => {
    setIsLoading(true);
    try {
      await ensureAuthenticated();

      const result = await api.forecast(data, 48);
      setForecast(result);

      await supabase.from('forecasts').insert({
        horizon: result.horizon,
        forecast_data: result.forecast_data,
        confidence_intervals: result.confidence_intervals,
      });
    } catch (error) {
      console.error('Error running forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAnomalies = async () => {
    setIsLoading(true);
    try {
      await ensureAuthenticated();

      const result = await api.detectAnomalies(data, 0.95, currentPattern);
      setAnomalies(result.summary);
      setAnomalyGuidance(result.guidance);

      await supabase.from('anomalies').insert({
        detection_method: 'multi-method',
        anomaly_data: result.summary,
        severity: result.summary.length > 10 ? 'high' : 'medium',
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      await ensureAuthenticated();

      const result = await api.queryAgent(message, { dataPoints: data.length });

      const agentMessage: ChatMessage = {
        role: 'agent',
        content: result.response.message,
        timestamp: result.timestamp,
        agent_type: result.agent_type,
      };

      setChatMessages((prev) => [...prev, agentMessage]);

      await supabase.from('agent_conversations').insert({
        query: message,
        agent_type: result.agent_type,
        response: result.response,
        context: { dataPoints: data.length },
      });

      if (result.response.suggested_action === 'forecast') {
        await runForecast();
        setActiveTab('forecast');
      } else if (result.response.suggested_action === 'detect_anomalies') {
        await detectAnomalies();
        setActiveTab('anomalies');
      } else if (result.response.suggested_action === 'analyze') {
        await runAnalysis();
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error querying agent:', error);
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString(),
        agent_type: 'error',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const stats = analysisResult?.statistical_analysis?.descriptive_stats || {
    mean: data.reduce((sum, d) => sum + d.value, 0) / data.length || 0,
    std: 0,
    min: Math.min(...data.map((d) => d.value)),
    max: Math.max(...data.map((d) => d.value)),
  };

  const actualsForComparison = forecast && showActuals ? data.slice(-forecast.horizon) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Electricity Load Forecasting Platform</h1>
              <p className="text-slate-600">AI-powered day-ahead and real-time load forecasting</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-600">Hours of Data</div>
              <BarChart3 className="text-blue-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{data.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-600">Avg Load (MW)</div>
              <Activity className="text-green-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.mean.toFixed(1)}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-600">Load Range (MW)</div>
              <TrendingUp className="text-purple-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {stats.min.toFixed(0)} - {stats.max.toFixed(0)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-600">Anomalies</div>
              <AlertCircle className="text-red-500" size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{anomalies.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Day-Ahead Forecasts:</div>
              <div className="flex flex-wrap gap-2">
                {['day_ahead_trend', 'day_ahead_seasonal', 'day_ahead_full'].map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => generateData(pattern)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      currentPattern === pattern
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pattern.replace('day_ahead_', '').charAt(0).toUpperCase() +
                      pattern.replace('day_ahead_', '').slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Real-Time Deviations:</div>
              <div className="flex flex-wrap gap-2">
                {['realtime_random_walk', 'realtime_spikes'].map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => generateData(pattern)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      currentPattern === pattern
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pattern.replace('realtime_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
                <button
                  onClick={runAnalysis}
                  disabled={isLoading}
                  className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'briefing', label: 'Morning Briefing', icon: AlertCircle },
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'forecast', label: 'Forecast', icon: TrendingUp },
            { id: 'anomalies', label: 'Anomalies', icon: AlertCircle },
            { id: 'agent', label: 'AI Agent', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-slate-700 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'briefing' && (
            <MorningBriefing
              historicalData={data}
              forecast={forecast || undefined}
            />
          )}

          {activeTab === 'overview' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <TimeSeriesChart data={data} title="Electricity Load Profile (MW)" />
              </div>

              {analysisResult && analysisResult.insights.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights</h3>
                  <InsightCard insights={analysisResult.insights} />
                </div>
              )}

              {analysisResult && analysisResult.statistical_analysis && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Load Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {Object.entries(analysisResult.statistical_analysis.descriptive_stats).map(
                      ([key, value]) => (
                        <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">
                            {key.toUpperCase()}
                          </div>
                          <div className="text-lg font-bold text-slate-800">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <VendorPerformance />
            </>
          )}

          {activeTab === 'forecast' && (
            <>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={runForecast}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  Generate Forecast
                </button>
                {forecast && (
                  <button
                    onClick={() => setShowActuals(!showActuals)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                  >
                    {showActuals ? 'Hide Actuals' : 'Compare to Actuals'}
                  </button>
                )}
              </div>

              {forecast && (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">48-Hour Load Forecast (MW)</h3>
                      <button
                        onClick={() => setShowBiasOverlay(!showBiasOverlay)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          showBiasOverlay
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {showBiasOverlay ? 'Hide' : 'Show'} bias overlay
                      </button>
                    </div>
                    <TimeSeriesChart
                      data={data.slice(-48)}
                      forecastData={forecast.forecast_data.values}
                      actualsData={actualsForComparison}
                      showErrorStats={showActuals}
                      biasOverlay={
                        showBiasOverlay
                          ? forecast.forecast_data.values.map((_, i) => getBiasForHour(biasData, i))
                          : undefined
                      }
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Historical + Forecast Overview
                    </h3>
                    <TimeSeriesChart
                      data={data}
                      forecastData={forecast.forecast_data.values}
                    />
                  </div>

                  {forecast.insights.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights</h3>
                      <InsightCard insights={forecast.insights} />
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Bias Diagnostic</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <BiasHeatmap biasData={biasData} />
                      </div>
                      <div>
                        <BiasSummaryPanel biasData={biasData} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!forecast && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                  <TrendingUp className="mx-auto mb-4 text-slate-300" size={48} />
                  <p className="text-slate-600 mb-2">No forecast generated yet</p>
                  <p className="text-sm text-slate-500">
                    Click "Generate Forecast" to create a 48-hour ahead prediction
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'anomalies' && (
            <>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={detectAnomalies}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  Detect Anomalies
                </button>
              </div>

              {anomalyGuidance && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Pattern Analysis</h3>
                  <AnomalyGuidance guidance={anomalyGuidance} />
                </div>
              )}

              {anomalies.length > 0 && (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <TimeSeriesChart
                      data={data}
                      anomalies={anomalies}
                      title="Load Anomaly Detection"
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Detected Anomalies ({anomalies.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {anomalies.slice(0, 20).map((anomaly, index) => (
                        <div
                          key={index}
                          className="bg-red-50 border border-red-200 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">Hour {anomaly.index}</div>
                            <div className="text-sm text-slate-600">
                              Detection: {anomaly.method}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {anomaly.value.toFixed(2)} MW
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {anomalies.length === 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                  <AlertCircle className="mx-auto mb-4 text-slate-300" size={48} />
                  <p className="text-slate-600 mb-2">No anomalies detected yet</p>
                  <p className="text-sm text-slate-500">
                    Click "Detect Anomalies" to analyze the data
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'agent' && (
            <AgentChat
              onSendMessage={handleAgentMessage}
              messages={chatMessages}
              isLoading={isChatLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
