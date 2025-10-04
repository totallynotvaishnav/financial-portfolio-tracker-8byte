import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Portfolio, Transaction } from '../types';
import apiService from '../services/apiService';
import PortfolioDetailView from './portfolio/PortfolioDetailView';
import AIInsightsCard from './ai/AIInsightsCard';
import Loader, { ButtonLoader } from './Loader';

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
  </svg>
);

const PortfolioIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const AddIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, change, changeType = 'neutral', icon }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUpIcon />;
    if (changeType === 'negative') return <TrendingDownIcon />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${getChangeColor()}`}>
              <span className="mr-1">{change}</span>
              {getChangeIcon() && <div className="w-4 h-4">{getChangeIcon()}</div>}
            </div>
          )}
        </div>
        <div className="text-gray-400 ml-4">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
      active
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPortfolio, setEditingPortfolio] = useState<{ id: number; name: string } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [addStockForm, setAddStockForm] = useState({
    portfolioId: '',
    tickerSymbol: '',
    quantity: '',
    averagePrice: ''
  });
  const [addStockLoading, setAddStockLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });
  const [sellAssetModal, setSellAssetModal] = useState<{
    show: boolean;
    portfolioId: number;
    portfolioName: string;
    asset: any;
    quantity: string;
  }>({ show: false, portfolioId: 0, portfolioName: '', asset: null, quantity: '' });
  const [sellTransactions, setSellTransactions] = useState<Transaction[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    show: boolean;
    portfolioId: number;
    portfolioName: string;
  }>({ show: false, portfolioId: 0, portfolioName: '' });
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });
  const [createPortfolioLoading, setCreatePortfolioLoading] = useState(false);
  const [updatePortfolioLoading, setUpdatePortfolioLoading] = useState(false);
  const [deletePortfolioLoading, setDeletePortfolioLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [selectedAIPortfolioId, setSelectedAIPortfolioId] = useState<number | null>(null);

  const calculateRealizedPnL = React.useMemo(() => {
    const realizedByPortfolio: { [portfolioId: number]: { totalRealized: number; transactions: Transaction[] } } = {};
    
    sellTransactions.forEach(transaction => {
      if (!realizedByPortfolio[transaction.portfolioId]) {
        realizedByPortfolio[transaction.portfolioId] = { totalRealized: 0, transactions: [] };
      }
      realizedByPortfolio[transaction.portfolioId].totalRealized += transaction.realizedPnL || 0;
      realizedByPortfolio[transaction.portfolioId].transactions.push(transaction);
    });
    
    Object.keys(realizedByPortfolio).forEach(portfolioId => {
      realizedByPortfolio[Number(portfolioId)].transactions.sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
    });
    
    return realizedByPortfolio;
  }, [sellTransactions]);

  const summaryData = React.useMemo(() => {
    if (!portfolios.length) {
      return {
        totalValue: '$0.00',
        totalGainLoss: '$0.00',
        gainLossPercent: '0.0%',
        gainLossType: 'neutral' as const,
        numberOfAssets: '0',
        bestPerformer: 'N/A',
        totalRealizedPnL: '$0.00'
      };
    }

    const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
    const totalCost = portfolios.reduce((sum, p) => sum + p.totalCost, 0);
    const totalUnrealizedGainLoss = totalValue - totalCost;
    
    const totalRealizedPnL = Object.values(calculateRealizedPnL).reduce((sum, portfolio) => sum + portfolio.totalRealized, 0);
    
    const totalGainLoss = totalUnrealizedGainLoss + totalRealizedPnL;
    const gainLossPercent = totalCost > 0 ? ((totalGainLoss / totalCost) * 100) : 0;
    const totalAssets = portfolios.reduce((sum, p) => sum + p.assets.length, 0);
    
    let bestAsset: any = null;
    let bestPerformance = -Infinity;
    portfolios.forEach(portfolio => {
      portfolio.assets.forEach(asset => {
        if (asset.gainLossPercentage > bestPerformance) {
          bestPerformance = asset.gainLossPercentage;
          bestAsset = asset;
        }
      });
    });

    const gainLossType: 'positive' | 'negative' | 'neutral' = totalGainLoss > 0 ? 'positive' : totalGainLoss < 0 ? 'negative' : 'neutral';

    return {
      totalValue: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalGainLoss: `${totalGainLoss >= 0 ? '+' : ''}$${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gainLossPercent: `${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(1)}%`,
      gainLossType,
      numberOfAssets: totalAssets.toString(),
      bestPerformer: bestAsset ? `${bestAsset.tickerSymbol} +${bestAsset.gainLossPercentage.toFixed(1)}%` : 'N/A',
      totalRealizedPnL: `${totalRealizedPnL >= 0 ? '+' : ''}$${Math.abs(totalRealizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
  }, [portfolios, calculateRealizedPnL]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user?.id) return;
      
      try {
        const data = await apiService.getUserPortfolios(user.id);
        setPortfolios(data);
      } catch (error) {
        showErrorModal('Error', 'Failed to fetch portfolios. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSellTransactions = async () => {
      if (!user?.id) return;
      
      try {
        const transactions = await apiService.getUserSellTransactions(user.id);
        setSellTransactions(transactions);
      } catch (error) {
        // Silently fail - transactions are supplementary data
      }
    };

    fetchPortfolios();
    fetchSellTransactions();
  }, [user]);

  // Auto-select first portfolio with assets for AI insights when portfolios load
  useEffect(() => {
    if (portfolios.length > 0 && selectedAIPortfolioId === null) {
      const portfolioWithAssets = portfolios.find(p => p.assets.length > 0);
      if (portfolioWithAssets) {
        setSelectedAIPortfolioId(portfolioWithAssets.id);
      }
    }
  }, [portfolios, selectedAIPortfolioId]);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreatePortfolio = async () => {
    if (!user?.id || !newPortfolioName.trim()) {
      setValidationErrors({ portfolioName: 'Portfolio name is required' });
      return;
    }

    setCreatePortfolioLoading(true);
    clearValidationErrors();

    try {
      const newPortfolio = await apiService.createPortfolio(newPortfolioName.trim(), user.id);
      setPortfolios(prev => [...prev, newPortfolio]);
      setNewPortfolioName('');
      setShowCreateDialog(false);
      showSuccessModal('Portfolio Created', `"${newPortfolio.name}" has been successfully created.`);
    } catch (error) {
      showErrorModal('Creation Failed', 'Failed to create portfolio. Please check your connection and try again.');
    } finally {
      setCreatePortfolioLoading(false);
    }
  };

  const handleEditPortfolio = async () => {
    if (!user?.id || !editingPortfolio || !editingPortfolio.name.trim()) {
      setValidationErrors({ editPortfolioName: 'Portfolio name is required' });
      return;
    }

    setUpdatePortfolioLoading(true);
    clearValidationErrors();

    try {
      const updatedPortfolio = await apiService.updatePortfolio(
        editingPortfolio.id,
        user.id,
        editingPortfolio.name.trim()
      );
      setPortfolios(prev => 
        prev.map(p => p.id === editingPortfolio.id ? updatedPortfolio : p)
      );
      setEditingPortfolio(null);
      showSuccessModal('Portfolio Updated', `Portfolio name has been successfully updated to "${updatedPortfolio.name}".`);
    } catch (error) {
      showErrorModal('Update Failed', 'Failed to update portfolio. Please check your connection and try again.');
    } finally {
      setUpdatePortfolioLoading(false);
    }
  };

  const handleDeletePortfolio = (portfolioId: number, portfolioName: string) => {
    setDeleteConfirmModal({
      show: true,
      portfolioId,
      portfolioName
    });
  };

  const confirmDeletePortfolio = async () => {
    if (!user?.id) return;

    setDeletePortfolioLoading(true);

    try {
      await apiService.deletePortfolio(deleteConfirmModal.portfolioId, user.id);
      setPortfolios(prev => prev.filter(p => p.id !== deleteConfirmModal.portfolioId));
      setDeleteConfirmModal({ show: false, portfolioId: 0, portfolioName: '' });
      showSuccessModal('Portfolio Deleted', `"${deleteConfirmModal.portfolioName}" has been successfully deleted.`);
    } catch (error) {
      showErrorModal('Deletion Failed', 'Failed to delete portfolio. Please check your connection and try again.');
    } finally {
      setDeletePortfolioLoading(false);
    }
  };

  const cancelDeletePortfolio = () => {
    setDeleteConfirmModal({ show: false, portfolioId: 0, portfolioName: '' });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deleteConfirmModal.show) {
        cancelDeletePortfolio();
      }
    };

    if (deleteConfirmModal.show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [deleteConfirmModal.show]);

  const handleAddStockFormChange = (field: string, value: string) => {
    setAddStockForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      showErrorModal('Authentication Error', 'Please log in again to continue.');
      return;
    }

    const fields = {
      portfolioId: addStockForm.portfolioId,
      tickerSymbol: addStockForm.tickerSymbol.trim(),
      quantity: addStockForm.quantity,
      averagePrice: addStockForm.averagePrice
    };

    if (!validateForm(fields)) {
      return;
    }

    const quantity = parseFloat(addStockForm.quantity);
    const averagePrice = parseFloat(addStockForm.averagePrice);

    if (quantity <= 0 || averagePrice <= 0) {
      setValidationErrors({
        quantity: quantity <= 0 ? 'Quantity must be greater than 0' : '',
        averagePrice: averagePrice <= 0 ? 'Price must be greater than 0' : ''
      });
      return;
    }

    try {
      setAddStockLoading(true);
      clearValidationErrors();
      
      const portfolioId = parseInt(addStockForm.portfolioId);
      const tickerSymbol = addStockForm.tickerSymbol.toUpperCase().trim();
      
      try {
        // First, try to add the asset (this will fail if asset already exists)
        await apiService.addAssetToPortfolio(
          portfolioId,
          user.id,
          {
            tickerSymbol: tickerSymbol,
            quantity: quantity,
            averagePrice: averagePrice
          }
        );
        
        showSuccessModal('Asset Added', 'Asset added successfully to your portfolio!');
      } catch (error: any) {
        // If asset already exists (409 error), update it instead
        if (error.status === 409 || error.message?.includes('already exists')) {
          const portfolio = portfolios.find(p => p.id === portfolioId);
          const existingAsset = portfolio?.assets.find(a => a.tickerSymbol === tickerSymbol);
          
          if (existingAsset) {
            // Calculate new average price using weighted average formula
            const existingQuantity = existingAsset.quantity;
            const existingAvgPrice = existingAsset.averagePrice;
            
            const newTotalQuantity = existingQuantity + quantity;
            const newAveragePrice = ((existingQuantity * existingAvgPrice) + (quantity * averagePrice)) / newTotalQuantity;
            
            // Update the asset with new quantity and average price
            await apiService.updateAsset(
              portfolioId,
              user.id,
              tickerSymbol,
              {
                tickerSymbol: tickerSymbol,
                quantity: newTotalQuantity,
                averagePrice: newAveragePrice
              }
            );
            
            showSuccessModal(
              'Asset Updated', 
              `Asset updated successfully! New quantity: ${newTotalQuantity.toFixed(2)}, New average price: $${newAveragePrice.toFixed(2)}`
            );
          } else {
            throw error; // Re-throw if we can't find the existing asset
          }
        } else {
          throw error; // Re-throw other errors
        }
      }

      setAddStockForm({
        portfolioId: '',
        tickerSymbol: '',
        quantity: '',
        averagePrice: ''
      });

      const updatedPortfolios = await apiService.getUserPortfolios(user.id);
      setPortfolios(updatedPortfolios);

    } catch (error) {
      showErrorModal('Asset Operation Failed', 'Failed to add or update asset. Please check the stock symbol and try again.');
    } finally {
      setAddStockLoading(false);
    }
  };

  const handleSellAsset = (portfolioId: number, portfolioName: string, asset: any) => {
    setSellAssetModal({
      show: true,
      portfolioId,
      portfolioName,
      asset,
      quantity: ''
    });
  };

  const handleSellAssetConfirm = async () => {
    if (!user?.id || !sellAssetModal.asset) {
      showErrorModal('Authentication Error', 'Please log in again to continue.');
      return;
    }

    const sellQuantity = parseFloat(sellAssetModal.quantity);
    const currentQuantity = sellAssetModal.asset.quantity;
    const currentMarketPrice = sellAssetModal.asset.currentMarketPrice || sellAssetModal.asset.averagePrice;

    if (sellQuantity <= 0 || sellQuantity > currentQuantity) {
      setValidationErrors({
        sellQuantity: `Please enter a valid quantity between 1 and ${currentQuantity}`
      });
      return;
    }

    try {
      clearValidationErrors();
      // Use new sell API endpoint
      const transaction = await apiService.sellAsset(
        sellAssetModal.portfolioId,
        user.id,
        sellAssetModal.asset.tickerSymbol,
        {
          quantity: sellQuantity,
          currentMarketPrice: currentMarketPrice
        }
      );

      // Show success modal with realized P&L from API response
      const realizedPnL = transaction.realizedPnL || 0;
      const realizedPnLPercent = sellQuantity > 0 ? ((realizedPnL / (sellAssetModal.asset.averagePrice * sellQuantity)) * 100) : 0;

      if (sellQuantity === currentQuantity) {
        showSuccessModal(
          'Asset Sold', 
          `All ${sellQuantity} shares of ${sellAssetModal.asset.tickerSymbol} have been sold and removed from your portfolio.\\n\\nRealized P&L: ${realizedPnL >= 0 ? '+' : ''}$${Math.abs(realizedPnL).toFixed(2)} (${realizedPnLPercent >= 0 ? '+' : ''}${realizedPnLPercent.toFixed(1)}%)`
        );
      } else {
        const remainingQuantity = currentQuantity - sellQuantity;
        showSuccessModal(
          'Shares Sold', 
          `${sellQuantity} shares of ${sellAssetModal.asset.tickerSymbol} have been sold. You still have ${remainingQuantity} shares remaining.\\n\\nRealized P&L: ${realizedPnL >= 0 ? '+' : ''}$${Math.abs(realizedPnL).toFixed(2)} (${realizedPnLPercent >= 0 ? '+' : ''}${realizedPnLPercent.toFixed(1)}%)`
        );
      }

      const [updatedPortfolios, updatedTransactions] = await Promise.all([
        apiService.getUserPortfolios(user.id),
        apiService.getUserSellTransactions(user.id)
      ]);
      
      setPortfolios(updatedPortfolios);
      setSellTransactions(updatedTransactions);
      setSellAssetModal({ show: false, portfolioId: 0, portfolioName: '', asset: null, quantity: '' });
    } catch (error) {
      showErrorModal('Sale Failed', 'Failed to sell asset. Please check your connection and try again.');
    }
  };

  const navItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', id: 'Dashboard' },
    { icon: <PortfolioIcon />, label: 'Portfolio', id: 'Portfolio' },
    { icon: <AddIcon />, label: 'Add Stock', id: 'AddStock' },
    { icon: <AnalyticsIcon />, label: 'AI Analytics', id: 'AI Analytics' },
  ];

  const showSuccessModal = (title: string, message: string) => {
    setSuccessModal({ show: true, title, message });
  };

  const hideSuccessModal = () => {
    setSuccessModal({ show: false, title: '', message: '' });
  };

  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  const hideErrorModal = () => {
    setErrorModal({ show: false, title: '', message: '' });
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const validateForm = (fields: { [key: string]: any }): boolean => {
    const errors: { [key: string]: string } = {};
    
    Object.entries(fields).forEach(([key, value]) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[key] = 'This field is required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const SellAssetModal = () => {
    if (!sellAssetModal.show) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Sell {sellAssetModal.asset?.tickerSymbol}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    From portfolio: {sellAssetModal.portfolioName}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600">
                      Current holdings: <span className="font-medium">{sellAssetModal.asset?.quantity}</span> shares
                    </p>
                    <p className="text-sm text-gray-600">
                      Average price: <span className="font-medium">${sellAssetModal.asset?.averagePrice?.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Current market price: <span className="font-medium">${(sellAssetModal.asset?.currentMarketPrice || sellAssetModal.asset?.averagePrice)?.toFixed(2)}</span>
                    </p>
                    <p className={`text-sm font-medium ${
                      (sellAssetModal.asset?.currentMarketPrice || sellAssetModal.asset?.averagePrice) >= sellAssetModal.asset?.averagePrice 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      Unrealized P&L per share: {((sellAssetModal.asset?.currentMarketPrice || sellAssetModal.asset?.averagePrice) >= sellAssetModal.asset?.averagePrice ? '+' : '')}${
                        (((sellAssetModal.asset?.currentMarketPrice || sellAssetModal.asset?.averagePrice) - sellAssetModal.asset?.averagePrice) || 0).toFixed(2)
                      }
                    </p>
                  </div>
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity to sell *
                    </label>
                    <input
                      type="number"
                      value={sellAssetModal.quantity}
                      onChange={(e) => setSellAssetModal(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="Enter quantity to sell"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="1"
                      max={sellAssetModal.asset?.quantity}
                      step="any"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the number of shares you want to sell (max: {sellAssetModal.asset?.quantity})
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:col-start-2 sm:text-sm"
                onClick={handleSellAssetConfirm}
                disabled={!sellAssetModal.quantity || parseFloat(sellAssetModal.quantity) <= 0}
              >
                Sell Shares
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={() => setSellAssetModal({ show: false, portfolioId: 0, portfolioName: '', asset: null, quantity: '' })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SuccessModal = () => {
    if (!successModal.show) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {successModal.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {successModal.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                onClick={hideSuccessModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ErrorModal = () => {
    if (!errorModal.show) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {errorModal.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {errorModal.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                onClick={hideErrorModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while initial data is being fetched
  if (loading) {
    return <Loader fullScreen text="Loading your portfolios..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              {sidebarOpen ? <XIcon /> : <MenuIcon />}
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-gray-900">Portfolio Tracker</h1>
            </div>
          </div>

          {/* Right side - User Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <UserIcon />
              <span className="ml-2 font-medium hidden sm:block">{user?.username}</span>
              <ChevronDownIcon />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogoutIcon />
                    <span className="ml-2">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`
          fixed top-16 left-0 bottom-0 z-30 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-6 overflow-y-auto">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeNav === item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      setSidebarOpen(false);
                      setSelectedPortfolio(null); // Reset portfolio detail view when navigating
                    }}
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            {activeNav === 'Dashboard' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
                  <p className="text-gray-600">Welcome back, {user?.username}! Here's your portfolio overview.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <SummaryCard
                    title="Total Portfolio Value"
                    value={summaryData.totalValue}
                    change={summaryData.gainLossPercent}
                    changeType={summaryData.gainLossType}
                    icon={<DollarIcon />}
                  />
                  <SummaryCard
                    title="Total Gain/Loss (Unrealized + Realized)"
                    value={summaryData.totalGainLoss}
                    change={summaryData.gainLossPercent}
                    changeType={summaryData.gainLossType}
                    icon={summaryData.gainLossType === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  />
                  <SummaryCard
                    title="Realized P&L"
                    value={summaryData.totalRealizedPnL}
                    icon={<ChartIcon />}
                  />
                  <SummaryCard
                    title="Number of Assets"
                    value={summaryData.numberOfAssets}
                    icon={<ChartIcon />}
                  />
                  <SummaryCard
                    title="Best Performer"
                    value={summaryData.bestPerformer}
                    changeType="positive"
                    icon={<TrendingUpIcon />}
                  />
                </div>
              </>
            )}

            {activeNav === 'Portfolio' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Management</h2>
                <p className="text-gray-600">Manage your investment portfolios and view detailed performance.</p>
              </div>
            )}

            {activeNav === 'AddStock' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Stock</h2>
                <p className="text-gray-600">Add new assets to your portfolios.</p>
              </div>
            )}

            {activeNav === 'AI Analytics' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analytics</h2>
                <p className="text-gray-600">AI-powered insights and recommendations for your investments.</p>
              </div>
            )}

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div>
                  {selectedPortfolio ? (
                    <PortfolioDetailView 
                      portfolio={selectedPortfolio}
                      onBack={() => {
                        setSelectedPortfolio(null);
                        setActiveNav('Dashboard'); // Ensure we're back on Dashboard when going back
                      }}
                      onSellAsset={handleSellAsset}
                    />
                  ) : (
                    <>
                      {/* Dashboard Content */}
                      {activeNav === 'Dashboard' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Portfolio Overview
                      </h3>
                      {portfolios.length > 0 ? (
                        <div className="space-y-6">
                          {portfolios.map((portfolio) => (
                            <div 
                              key={portfolio.id} 
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                              onClick={() => setSelectedPortfolio(portfolio)}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="text-md font-medium text-gray-900 mb-1 flex items-center">
                                    {portfolio.name}
                                    <svg className="w-4 h-4 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </h4>
                                  <p className="text-sm text-gray-500">{portfolio.assets.length} assets • Click to view details</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900 mb-2">
                                    ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                  <div className="text-xs text-gray-500 mb-1">CURRENT VALUE</div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">UNREALIZED</div>
                                    <div className={`text-sm font-semibold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {portfolio.totalGainLoss >= 0 ? '+' : ''}${Math.abs(portfolio.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className={`text-xs ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      ({portfolio.totalGainLossPercentage >= 0 ? '+' : ''}{portfolio.totalGainLossPercentage.toFixed(1)}%)
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">REALIZED</div>
                                    {calculateRealizedPnL[portfolio.id] ? (
                                      <div className={`text-sm font-semibold ${calculateRealizedPnL[portfolio.id].totalRealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {calculateRealizedPnL[portfolio.id].totalRealized >= 0 ? '+' : ''}${Math.abs(calculateRealizedPnL[portfolio.id].totalRealized).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    ) : (
                                      <div className="text-sm font-semibold text-gray-400">$0.00</div>
                                    )}
                                    <div className="text-xs text-gray-400">from sales</div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">TOTAL P&L</div>
                                    {calculateRealizedPnL[portfolio.id] ? (
                                      <div className={`text-sm font-bold ${ 
                                        (portfolio.totalGainLoss + calculateRealizedPnL[portfolio.id].totalRealized) >= 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {(portfolio.totalGainLoss + calculateRealizedPnL[portfolio.id].totalRealized) >= 0 ? '+' : ''}${
                                          Math.abs(portfolio.totalGainLoss + calculateRealizedPnL[portfolio.id].totalRealized).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        }
                                      </div>
                                    ) : (
                                      <div className={`text-sm font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {portfolio.totalGainLoss >= 0 ? '+' : ''}${Math.abs(portfolio.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400">combined</div>
                                  </div>
                                </div>
                              </div>
                              {portfolio.assets.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {portfolio.assets.map((asset) => (
                                        <tr key={asset.id}>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                            {asset.tickerSymbol}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {asset.quantity}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                            ${asset.averagePrice.toFixed(2)}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                            ${asset.currentMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                          <td className={`px-4 py-2 whitespace-nowrap text-sm text-center ${asset.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {asset.gainLoss >= 0 ? '+' : ''}${Math.abs(asset.gainLoss).toFixed(2)} 
                                            ({asset.gainLossPercentage >= 0 ? '+' : ''}{asset.gainLossPercentage.toFixed(1)}%)
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                            <button
                                              onClick={() => handleSellAsset(portfolio.id, portfolio.name, asset)}
                                              className="text-orange-600 hover:text-orange-800 text-xs font-medium px-2 py-1 rounded border border-orange-300 hover:border-orange-500 transition-colors"
                                              title={`Sell ${asset.tickerSymbol}`}
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
                                <div className="text-center py-8 border-t">
                                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                  </div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">No Assets Yet</h4>
                                  <p className="text-sm text-gray-500 mb-3">Add your first stock to start tracking your investments</p>
                                  <button 
                                    onClick={() => {
                                      setActiveNav('AddStock');
                                      setSelectedPortfolio(null);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                  >
                                    Add Stock
                                  </button>
                                </div>
                              )}
                              {calculateRealizedPnL[portfolio.id] && calculateRealizedPnL[portfolio.id].transactions.length > 0 && (
                                <div className="border-t pt-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Sales</h5>
                                    <span className="text-xs text-gray-400">
                                      {calculateRealizedPnL[portfolio.id].transactions.length} transaction{calculateRealizedPnL[portfolio.id].transactions.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {calculateRealizedPnL[portfolio.id].transactions.slice(0, 3).map((transaction: Transaction, index: number) => (
                                      <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-xs">
                                        <div className="flex-1">
                                          <span className="text-gray-900 font-medium">{transaction.tickerSymbol}</span>
                                          <span className="text-gray-500 ml-2">{transaction.quantity} shares</span>
                                        </div>
                                        <div className="text-right">
                                          <div className={`font-medium ${(transaction.realizedPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {(transaction.realizedPnL || 0) >= 0 ? '+' : ''}${Math.abs(transaction.realizedPnL || 0).toFixed(2)}
                                          </div>
                                          <div className="text-gray-400 text-xs">{new Date(transaction.transactionDate).toLocaleDateString()}</div>
                                        </div>
                                      </div>
                                    ))}
                                    {calculateRealizedPnL[portfolio.id].transactions.length > 3 && (
                                      <div className="text-center text-xs text-gray-400 italic py-1">
                                        + {calculateRealizedPnL[portfolio.id].transactions.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Investment Journey</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Create your first portfolio to start tracking your investments and monitor your financial growth.
                          </p>
                          <button 
                            onClick={() => {
                              setActiveNav('Portfolio');
                              setSelectedPortfolio(null);
                            }}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Your First Portfolio
                          </button>
                        </div>
                      )}
                    </>
                      )}
                    </>
                  )}

                  {/* Portfolio Management Content */}
                  {activeNav === 'Portfolio' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Portfolio Management
                      </h3>
                      <div className="mb-4">
                        {!showCreateDialog ? (
                          <button 
                            onClick={() => setShowCreateDialog(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <AddIcon />
                            <span className="ml-2">Create New Portfolio</span>
                          </button>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-md font-medium text-gray-900 mb-3">Create New Portfolio</h4>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={newPortfolioName}
                                  onChange={(e) => {
                                    setNewPortfolioName(e.target.value);
                                    if (validationErrors.portfolioName) {
                                      setValidationErrors(prev => ({ ...prev, portfolioName: '' }));
                                    }
                                  }}
                                  placeholder="Portfolio name"
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    validationErrors.portfolioName ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  onKeyPress={(e) => e.key === 'Enter' && !createPortfolioLoading && handleCreatePortfolio()}
                                  disabled={createPortfolioLoading}
                                />
                                {validationErrors.portfolioName && (
                                  <p className="mt-1 text-sm text-red-600">{validationErrors.portfolioName}</p>
                                )}
                              </div>
                              <button
                                onClick={handleCreatePortfolio}
                                disabled={!newPortfolioName.trim() || createPortfolioLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center min-w-[80px] justify-center"
                              >
                                {createPortfolioLoading ? (
                                  <ButtonLoader text="" />
                                ) : (
                                  'Create'
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setShowCreateDialog(false);
                                  setNewPortfolioName('');
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {portfolios.length > 0 ? (
                        <div className="space-y-4">
                          {portfolios.map((portfolio) => (
                            <div key={portfolio.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  {editingPortfolio?.id === portfolio.id ? (
                                    <div className="flex gap-2 items-start">
                                      <div className="flex-1">
                                        <input
                                          type="text"
                                          value={editingPortfolio.name}
                                          onChange={(e) => {
                                            setEditingPortfolio({ ...editingPortfolio, name: e.target.value });
                                            if (validationErrors.editPortfolioName) {
                                              setValidationErrors(prev => ({ ...prev, editPortfolioName: '' }));
                                            }
                                          }}
                                          className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.editPortfolioName ? 'border-red-500' : 'border-gray-300'
                                          }`}
                                          onKeyPress={(e) => e.key === 'Enter' && !updatePortfolioLoading && handleEditPortfolio()}
                                          autoFocus
                                          disabled={updatePortfolioLoading}
                                        />
                                        {validationErrors.editPortfolioName && (
                                          <p className="mt-1 text-sm text-red-600">{validationErrors.editPortfolioName}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={handleEditPortfolio}
                                        disabled={!editingPortfolio.name.trim() || updatePortfolioLoading}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center min-w-[60px] justify-center"
                                      >
                                        {updatePortfolioLoading ? (
                                          <ButtonLoader text="" />
                                        ) : (
                                          'Save'
                                        )}
                                      </button>
                                      <button
                                        onClick={() => setEditingPortfolio(null)}
                                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <h4 className="text-md font-medium text-gray-900">{portfolio.name}</h4>
                                      <p className="text-sm text-gray-500">{portfolio.assets.length} assets</p>
                                    </div>
                                  )}
                                </div>
                                {editingPortfolio?.id !== portfolio.id && (
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => setEditingPortfolio({ id: portfolio.id, name: portfolio.name })}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePortfolio(portfolio.id, portfolio.name)}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600">No portfolios found. Create your first portfolio to get started.</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeNav === 'AddStock' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Add New Asset
                      </h3>
                      {portfolios.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">You need to create a portfolio first before adding assets.</p>
                          <button 
                            onClick={() => {
                              setActiveNav('Portfolio');
                              setSelectedPortfolio(null);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Go to Portfolio Management
                          </button>
                        </div>
                      ) : (
                        <div className="max-w-md">
                          <form onSubmit={handleAddStock} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Portfolio *
                              </label>
                              <select 
                                value={addStockForm.portfolioId}
                                onChange={(e) => handleAddStockFormChange('portfolioId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={addStockLoading}
                              >
                                <option value="">Select a portfolio</option>
                                {portfolios.map((portfolio) => (
                                  <option key={portfolio.id} value={portfolio.id}>
                                    {portfolio.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Symbol *
                              </label>
                              <input 
                                type="text" 
                                value={addStockForm.tickerSymbol}
                                onChange={(e) => handleAddStockFormChange('tickerSymbol', e.target.value)}
                                placeholder="e.g., AAPL, GOOGL, TSLA"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={addStockLoading}
                                style={{ textTransform: 'uppercase' }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity *
                              </label>
                              <input 
                                type="number" 
                                value={addStockForm.quantity}
                                onChange={(e) => handleAddStockFormChange('quantity', e.target.value)}
                                placeholder="Number of shares"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="any"
                                disabled={addStockLoading}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Purchase Price *
                              </label>
                              <input 
                                type="number" 
                                value={addStockForm.averagePrice}
                                onChange={(e) => handleAddStockFormChange('averagePrice', e.target.value)}
                                placeholder="Price per share"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                                disabled={addStockLoading}
                              />
                            </div>
                            <button 
                              type="submit"
                              disabled={addStockLoading}
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              {addStockLoading ? (
                                <ButtonLoader text="Adding..." />
                              ) : (
                                'Add Asset'
                              )}
                            </button>
                          </form>
                        </div>
                      )}
                    </>
                  )}

                  {activeNav === 'AI Analytics' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        AI-Powered Portfolio Insights
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="col-span-1">
                          <div className="flex items-center justify-between mb-4">
                            {portfolios.length > 0 && portfolios.some(p => p.assets.length > 0) && (
                              <div className="flex items-center gap-2">
                                <label htmlFor="ai-portfolio-select" className="text-sm text-gray-600">
                                  Select Portfolio:
                                </label>
                                <select
                                  id="ai-portfolio-select"
                                  value={selectedAIPortfolioId || ''}
                                  onChange={(e) => setSelectedAIPortfolioId(e.target.value ? Number(e.target.value) : null)}
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                  <option value="">Choose a portfolio...</option>
                                  {portfolios
                                    .filter(p => p.assets.length > 0)
                                    .map(portfolio => (
                                      <option key={portfolio.id} value={portfolio.id}>
                                        {portfolio.name} ({portfolio.assets.length} assets)
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}
                          </div>
                          {portfolios.length === 0 ? (
                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                              <p className="text-gray-600 text-sm">Create a portfolio and add assets to get AI-powered recommendations.</p>
                            </div>
                          ) : portfolios.every(p => p.assets.length === 0) ? (
                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                              <p className="text-gray-600 text-sm">Add assets to your portfolios to get AI-powered insights and recommendations.</p>
                            </div>
                          ) : selectedAIPortfolioId ? (
                            <AIInsightsCard portfolioId={selectedAIPortfolioId} />
                          ) : (
                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                              <p className="text-gray-600 text-sm">Select a portfolio from the dropdown above to view AI insights.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <SuccessModal />
      
      <ErrorModal />
      
      <SellAssetModal />

      {deleteConfirmModal.show && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelDeletePortfolio();
            }
          }}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Delete Portfolio
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the portfolio <span className="font-semibold text-gray-900">"{deleteConfirmModal.portfolioName}"</span>?
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This action cannot be undone and will permanently remove all portfolio data.
                </p>
              </div>
              <div className="flex gap-4 justify-center mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={cancelDeletePortfolio}
                  disabled={deletePortfolioLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 flex items-center min-w-[120px] justify-center"
                  onClick={confirmDeletePortfolio}
                  disabled={deletePortfolioLoading}
                >
                  {deletePortfolioLoading ? (
                    <ButtonLoader text="Deleting..." />
                  ) : (
                    'Delete Portfolio'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;