import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsData {
  responseTime: {
    current: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  accuracy: {
    translation: number;
    triage: number;
    trend: 'up' | 'down' | 'stable';
  };
  volume: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  languages: Array<{
    language: string;
    calls: number;
    percentage: number;
  }>;
  urgency: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  performance: Array<{
    metric: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'needs_improvement';
  }>;
}

export default function AnalyticsDashboard() {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    // Simulate analytics data
    const mockData: AnalyticsData = {
      responseTime: {
        current: 2.3,
        average: 2.1,
        trend: 'up'
      },
      accuracy: {
        translation: 98.5,
        triage: 96.2,
        trend: 'up'
      },
      volume: {
        today: 47,
        thisWeek: 312,
        thisMonth: 1247
      },
      languages: [
        { language: 'Spanish', calls: 18, percentage: 38.3 },
        { language: 'Arabic', calls: 12, percentage: 25.5 },
        { language: 'Mandarin', calls: 8, percentage: 17.0 },
        { language: 'French', calls: 5, percentage: 10.6 },
        { language: 'Other', calls: 4, percentage: 8.5 }
      ],
      urgency: [
        { level: 'Critical', count: 12, percentage: 25.5 },
        { level: 'Medium', count: 23, percentage: 48.9 },
        { level: 'Low', count: 12, percentage: 25.5 }
      ],
      performance: [
        { metric: 'Response Time', value: 2.3, target: 3.0, status: 'excellent' },
        { metric: 'Translation Accuracy', value: 98.5, target: 95.0, status: 'excellent' },
        { metric: 'Triage Accuracy', value: 96.2, target: 90.0, status: 'excellent' },
        { metric: 'Call Resolution', value: 94.7, target: 90.0, status: 'excellent' }
      ]
    };
    setAnalytics(mockData);
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/20';
      case 'good': return 'text-blue-400 bg-blue-500/20';
      case 'needs_improvement': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className={`h-16 w-16 rounded-full backdrop-blur-md border flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
            theme === 'light' 
              ? 'bg-white/80 border-slate-200 shadow-lg' 
              : 'bg-white/10 border-white/20'
          }`}>
            <span className="text-3xl animate-spin">📊</span>
          </div>
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>Loading Analytics</h3>
          <p className={`transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>Gathering performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-lg">📈</span>
          </div>
        <div>
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>Performance Analytics</h2>
          <p className={`transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-600' : 'text-white/70'
          }`}>Real-time dispatch system metrics</p>
        </div>
        </div>
        
        {/* Time Range Selector */}
        <div className={`flex items-center gap-2 backdrop-blur-md rounded-xl p-1 border transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-slate-100 border-slate-200' 
            : 'bg-white/10 border-white/20'
        }`}>
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? theme === 'light' 
                    ? 'bg-blue-100 text-blue-700 shadow-lg' 
                    : 'bg-white/20 text-white shadow-lg'
                  : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{analytics.responseTime.current}s</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Avg Response Time</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTrendIcon(analytics.responseTime.trend)}</span>
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>vs {analytics.responseTime.average}s avg</span>
          </div>
        </div>

        <div className={`backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-lg">🎯</span>
            </div>
            <div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{analytics.accuracy.translation}%</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Translation Accuracy</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTrendIcon(analytics.accuracy.trend)}</span>
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>+2.1% from last week</span>
          </div>
        </div>

        <div className={`backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <span className="text-white text-lg">📞</span>
            </div>
            <div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{analytics.volume.today}</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Calls Today</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>+12% from yesterday</span>
          </div>
        </div>

        <div className={`backdrop-blur-md border rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 hover:bg-white hover:shadow-xl' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-lg">✅</span>
            </div>
            <div>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>94.7%</div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}>Resolution Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-600' : 'text-white/70'
            }`}>Above target (90%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            <span>🌍</span>
            Language Distribution
          </h3>
          <div className="space-y-3">
            {analytics.languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                    {lang.language.charAt(0)}
                  </div>
                  <span className={`transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-700' : 'text-white/90'
                  }`}>{lang.language}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-24 h-2 rounded-full overflow-hidden transition-colors duration-300 ${
                    theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
                  }`}>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                  <span className={`text-sm w-12 text-right transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-600' : 'text-white/70'
                  }`}>{lang.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Levels */}
        <div className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg' 
            : 'bg-white/5 border-white/10'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            <span>🚨</span>
            Urgency Distribution
          </h3>
          <div className="space-y-3">
            {analytics.urgency.map((urg, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${
                    urg.level === 'Critical' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                    urg.level === 'Medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    'bg-gradient-to-br from-green-500 to-emerald-500'
                  }`}>
                    {urg.level.charAt(0)}
                  </div>
                  <span className={`transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-700' : 'text-white/90'
                  }`}>{urg.level}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-24 h-2 rounded-full overflow-hidden transition-colors duration-300 ${
                    theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        urg.level === 'Critical' ? 'bg-gradient-to-r from-red-400 to-pink-400' :
                        urg.level === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                        'bg-gradient-to-r from-green-400 to-emerald-400'
                      }`}
                      style={{ width: `${urg.percentage}%` }}
                    />
                  </div>
                  <span className={`text-sm w-12 text-right transition-colors duration-300 ${
                    theme === 'light' ? 'text-slate-600' : 'text-white/70'
                  }`}>{urg.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {/* Performance Metrics */}
<div
  className={`backdrop-blur-md border rounded-xl p-6 transition-colors duration-300 ${
    theme === 'light'
      ? 'bg-white/80 border-slate-200 shadow-lg'
      : 'bg-white/5 border-white/10'
  }`}
>
  <h3
    className={`text-lg font-semibold mb-6 flex items-center gap-2 transition-colors duration-300 ${
      theme === 'light' ? 'text-slate-800' : 'text-white'
    }`}
  >
    <span>📊</span>
    Performance Metrics
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {analytics.performance.map((metric, index) => (
      <div
        key={index}
        className={`border rounded-xl p-4 transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white/60 border-slate-200'
            : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`font-medium transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-700' : 'text-white/90'
            }`}
          >
            {metric.metric}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              metric.status
            )}`}
          >
            {metric.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            {metric.metric.includes('Accuracy') ||
            metric.metric.includes('Resolution')
              ? `${metric.value}%`
              : `${metric.value}s`}
          </div>
          <div className="flex-1">
            <div
              className={`flex items-center justify-between text-sm mb-1 transition-colors duration-300 ${
                theme === 'light' ? 'text-slate-600' : 'text-white/70'
              }`}
            >
              <span>
                Target:{' '}
                {metric.metric.includes('Accuracy') ||
                metric.metric.includes('Resolution')
                  ? `${metric.target}%`
                  : `${metric.target}s`}
              </span>
              <span>{Math.round((metric.value / metric.target) * 100)}%</span>
            </div>
            <div
              className={`w-full h-2 rounded-full overflow-hidden transition-colors duration-300 ${
                theme === 'light' ? 'bg-slate-200' : 'bg-white/10'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metric.value >= metric.target
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                    : metric.value >= metric.target * 0.8
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                    : 'bg-gradient-to-r from-red-400 to-pink-400'
                }`}
                style={{
                  width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}
