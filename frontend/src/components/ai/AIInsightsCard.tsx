import React, { useState, useEffect, useCallback } from 'react';
import { DiversificationInsight } from '../../types';
import apiService from '../../services/apiService';

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

interface AIInsightsCardProps {
  portfolioId: number;
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ portfolioId }) => {
  const [insights, setInsights] = useState<DiversificationInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPortfolioDiversificationInsights(portfolioId);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getRiskColorClasses = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h3 className="text-lg font-semibold text-gray-900">Loading AI Insights...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchInsights}
              className="ml-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">No AI insights available for this portfolio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Portfolio Insights</h3>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshIcon />
          <span className="ml-2">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Diversification Score</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreColor(insights.diversificationScore)}`}
                  style={{ width: `${insights.diversificationScore}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">{insights.diversificationScore}/100</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Risk Level</p>
          <div className="inline-flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColorClasses(insights.riskLevel)}`}>
              <WarningIcon />
              <span className="ml-1">{insights.riskLevel}</span>
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Sector Allocation</p>
          <div className="space-y-2">
            {Object.entries(insights.sectorAllocation).map(([sector, percentage], index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{sector}</span>
                  <span className="font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">AI Recommendations</p>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-3 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUpIcon />
                  <span className="font-semibold text-gray-900 text-sm">{rec.tickerSymbol}</span>
                  <span className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-600">{rec.companyName}</span>
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">{rec.sector}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{rec.rationale}</p>
                <p className="text-xs text-gray-500">
                  Suggested allocation: {rec.suggestedAllocation}% • Est. \${rec.estimatedPrice.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <LightbulbIcon />
          <p className="text-sm font-medium text-gray-700">AI Insights</p>
        </div>
        <ul className="space-y-2">
          {insights.insights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-sm text-gray-600">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {insights.overallAssessment && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Overall Assessment</p>
          <p className="text-sm text-gray-600">{insights.overallAssessment}</p>
        </div>
      )}
    </div>
  );
};

export default AIInsightsCard;
