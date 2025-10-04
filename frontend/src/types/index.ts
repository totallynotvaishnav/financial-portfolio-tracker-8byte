// API Types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    refreshToken: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface Asset {
    id: number;
    tickerSymbol: string;
    quantity: number;
    averagePrice: number;
    currentMarketPrice: number;
    currentMarketValue: number;
    gainLoss: number;
    gainLossPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface Portfolio {
    id: number;
    name: string;
    userId: number;
    createdAt: string;
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
    assets: Asset[];
}

export interface AssetRequest {
    tickerSymbol: string;
    quantity: number;
    averagePrice: number;
}

export interface StockPrice {
    symbol: string;
    price: number;
    timestamp: number;
}

export interface ApiError {
    status?: number;
    error: string;
    message: string;
    timestamp: number;
}

// UI State Types
export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface DiversificationInsight {
    portfolioId: number;
    portfolioName: string;
    diversificationScore: number; // 0-100
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    sectorAllocation: { [sector: string]: number }; // sector -> percentage
    recommendations: AssetRecommendation[];
    insights: string[];
    overallAssessment: string;
}

export interface AssetRecommendation {
    tickerSymbol: string;
    companyName: string;
    sector: string;
    suggestedAllocation: number; // as percentage
    rationale: string;
    estimatedPrice: number;
}

export interface MarketStatus {
    status: string;
    serviceInfo: string;
    timestamp: number;
}

// Transaction Types
export interface Transaction {
    id: number;
    transactionType: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' | 'MERGE';
    quantity: number;
    pricePerShare: number;
    totalAmount: number;
    fees: number;
    transactionDate: string;
    createdAt: string;
    portfolioId: number;
    portfolioName: string;
    tickerSymbol: string;
    realizedPnL?: number;
}

export interface SellAssetRequest {
    quantity: number;
    currentMarketPrice: number;
}

// Historical Data Types
export interface StockHistoricalData {
    symbol: string;
    data: PricePoint[];
    source: string;
    timestamp: number;
}

export interface PricePoint {
    date: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
}
