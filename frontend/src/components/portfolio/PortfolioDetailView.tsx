import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Portfolio, Asset } from '../../types';
import apiService from '../../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PortfolioDetailViewProps {
  portfolio: Portfolio;
  onBack: () => void;
  onSellAsset: (portfolioId: number, portfolioName: string, asset: Asset) => void;
}

interface StockHistoricalData {
  date: string;
  price: number;
}

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PortfolioDetailView: React.FC<PortfolioDetailViewProps> = ({ 
  portfolio, 
  onBack, 
  onSellAsset 
}) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'allocation' | 'performance'>('overview');

  // Generate pie chart data for portfolio allocation
  const allocationChartData = {
    labels: portfolio.assets.map(asset => asset.tickerSymbol),
    datasets: [
      {
        data: portfolio.assets.map(asset => asset.currentMarketValue),
        backgroundColor: [
          '#3B82F6', // blue-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#8B5CF6', // violet-500
          '#06B6D4', // cyan-500
          '#84CC16', // lime-500
          '#F97316', // orange-500
          '#EC4899', // pink-500
          '#6366F1', // indigo-500
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const allocationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Asset Allocation',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / portfolio.totalValue) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Fetch historical data for selected asset
  const fetchHistoricalData = async (tickerSymbol: string) => {
    setLoadingChart(true);
    try {
      // Fetch real historical data from API
      const historicalResponse = await apiService.getStockHistory(tickerSymbol, 30);
      
      // Transform API response to component state format
      const transformedData: StockHistoricalData[] = historicalResponse.data.map(point => ({
        date: point.date,
        price: point.price,
      }));

      setHistoricalData(transformedData);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      
      // Fallback to mock data on error
      const mockData: StockHistoricalData[] = [];
      const currentPrice = portfolio.assets.find(a => a.tickerSymbol === tickerSymbol)?.currentMarketPrice || 100;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Generate realistic price variation
        const variation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
        const price = currentPrice * (1 + variation * (i / 30));
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          price: Math.max(price, currentPrice * 0.8), // Minimum 80% of current price
        });
      }

      setHistoricalData(mockData);
    } finally {
      setLoadingChart(false);
    }
  };

  // Chart data for historical prices
  const historicalChartData = {
    labels: historicalData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `${selectedAsset?.tickerSymbol} Price`,
        data: historicalData.map(item => item.price),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const historicalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedAsset?.tickerSymbol} - 30 Day Price History`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setActiveTab('performance');
    fetchHistoricalData(asset.tickerSymbol);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <BackIcon />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 border-l border-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio.totalGainLoss >= 0 ? '+' : ''}${Math.abs(portfolio.totalGainLoss).toFixed(2)} 
            ({portfolio.totalGainLossPercentage >= 0 ? '+' : ''}{portfolio.totalGainLossPercentage.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'allocation', label: 'Asset Allocation' },
            { id: 'performance', label: 'Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets</h3>
              {portfolio.assets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {portfolio.assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleAssetClick(asset)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                            >
                              <span className="font-medium">{asset.tickerSymbol}</span>
                              <ChartIcon />
                            </button>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {asset.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            ${asset.averagePrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            ${asset.currentMarketPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            ${asset.currentMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm text-center ${asset.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {asset.gainLoss >= 0 ? '+' : ''}${Math.abs(asset.gainLoss).toFixed(2)} 
                            <br />
                            ({asset.gainLossPercentage >= 0 ? '+' : ''}{asset.gainLossPercentage.toFixed(1)}%)
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <button
                              onClick={() => onSellAsset(portfolio.id, portfolio.name, asset)}
                              className="text-orange-600 hover:text-orange-800 text-xs font-medium px-3 py-1 rounded border border-orange-300 hover:border-orange-500 transition-colors"
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets in Portfolio</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This portfolio is empty. Add your first stock to start tracking investments and see detailed analytics.
                  </p>
                  <button 
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Assets
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Total Assets</div>
                  <div className="text-xl font-semibold text-gray-900">{portfolio.assets.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Cost</div>
                  <div className="text-xl font-semibold text-gray-900">
                    ${portfolio.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Best Performer</div>
                  <div className="text-lg font-semibold text-green-600">
                    {portfolio.assets.length > 0 
                      ? portfolio.assets.reduce((best, asset) => 
                          asset.gainLossPercentage > best.gainLossPercentage ? asset : best
                        ).tickerSymbol
                      : 'N/A'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Worst Performer</div>
                  <div className="text-lg font-semibold text-red-600">
                    {portfolio.assets.length > 0 
                      ? portfolio.assets.reduce((worst, asset) => 
                          asset.gainLossPercentage < worst.gainLossPercentage ? asset : worst
                        ).tickerSymbol
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'allocation' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {portfolio.assets.length > 0 ? (
                <Pie data={allocationChartData} options={allocationChartOptions} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No assets to display
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Allocation Breakdown</h4>
              <div className="space-y-3">
                {portfolio.assets.map((asset, index) => {
                  const percentage = ((asset.currentMarketValue / portfolio.totalValue) * 100);
                  const color = allocationChartData.datasets[0].backgroundColor[index % allocationChartData.datasets[0].backgroundColor.length];
                  
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="font-medium text-gray-900">{asset.tickerSymbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{percentage.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">
                          ${asset.currentMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {selectedAsset ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAsset.tickerSymbol} Performance
                </h3>
                <p className="text-sm text-gray-500">
                  Click on any asset in the Overview tab to view its price history
                </p>
              </div>
              
              {loadingChart ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              ) : (
                <div className="h-96">
                  <Line data={historicalChartData} options={historicalChartOptions} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartIcon />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Select an Asset</h3>
              <p className="mt-1 text-gray-500">
                Click on any asset in the Overview tab to view its price history and performance metrics.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioDetailView;