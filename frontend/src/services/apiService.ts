import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    Portfolio,
    AssetRequest,
    Asset,
    StockPrice,
    ApiError,
    DiversificationInsight,
    MarketStatus,
    Transaction,
    SellAssetRequest,
    StockHistoricalData,
} from '../types';

class ApiService {
    private api: AxiosInstance;
    private readonly baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

    constructor() {
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.api.interceptors.request.use(
            (config) => {
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;
                const requestUrl: string = error.config?.url || '';
                const isAuthEndpoint =
                    requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

                if (status === 401 && !isAuthEndpoint) {
                    this.clearAuthToken();
                    window.location.href = '/login';
                }

                return Promise.reject(this.handleError(error));
            }
        );
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setAuthToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    private clearAuthToken(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    private handleError(error: any): ApiError {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            error: 'Network Error',
            message: error.message || 'An unexpected error occurred',
            timestamp: Date.now(),
        };
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await this.api.post(
                '/auth/login',
                credentials
            );
            const authData = response.data;

            this.setAuthToken(authData.token);
            localStorage.setItem('refreshToken', authData.refreshToken);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    id: authData.id,
                    username: authData.username,
                    email: authData.email,
                    roles: authData.roles,
                })
            );

            return authData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async register(userData: RegisterRequest): Promise<any> {
        try {
            const response = await this.api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    logout(): void {
        this.clearAuthToken();
    }

    async logoutWithServer(): Promise<void> {
        try {
            await this.api.post('/auth/logout');
        } catch (error) {
            console.error('Server logout failed:', error);
        } finally {
            this.clearAuthToken();
        }
    }

    getCurrentUser(): any {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getAuthToken();
    }

    async getUserPortfolios(userId: number): Promise<Portfolio[]> {
        try {
            const response: AxiosResponse<Portfolio[]> = await this.api.get(
                `/portfolios/user/${userId}`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getPortfolioDetails(portfolioId: number, userId: number): Promise<Portfolio> {
        try {
            const response: AxiosResponse<Portfolio> = await this.api.get(
                `/portfolios/${portfolioId}/user/${userId}`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createPortfolio(name: string, userId: number): Promise<Portfolio> {
        try {
            const response: AxiosResponse<Portfolio> = await this.api.post('/portfolios', {
                name,
                userId,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async addAssetToPortfolio(
        portfolioId: number,
        userId: number,
        assetData: AssetRequest
    ): Promise<Asset> {
        try {
            const response: AxiosResponse<Asset> = await this.api.post(
                `/portfolios/${portfolioId}/user/${userId}/assets`,
                assetData
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateAsset(
        portfolioId: number,
        userId: number,
        tickerSymbol: string,
        assetData: AssetRequest
    ): Promise<Asset> {
        try {
            const response: AxiosResponse<Asset> = await this.api.put(
                `/portfolios/${portfolioId}/user/${userId}/assets/${tickerSymbol}`,
                assetData
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async removeAssetFromPortfolio(
        portfolioId: number,
        userId: number,
        tickerSymbol: string
    ): Promise<void> {
        try {
            await this.api.delete(
                `/portfolios/${portfolioId}/user/${userId}/assets/${tickerSymbol}`
            );
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getStockPrice(symbol: string): Promise<StockPrice> {
        try {
            const response: AxiosResponse<StockPrice> = await this.api.get(
                `/stocks/${symbol}/price`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getMarketStatus(): Promise<MarketStatus> {
        try {
            const response: AxiosResponse<MarketStatus> = await this.api.get(
                '/stocks/market/status'
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async refreshMarketCache(): Promise<any> {
        try {
            const response = await this.api.post('/stocks/market/refresh-cache');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getPortfolioDiversificationInsights(
        portfolioId: number
    ): Promise<DiversificationInsight> {
        try {
            const response: AxiosResponse<DiversificationInsight> = await this.api.get(
                `/ai-insights/portfolio/${portfolioId}/diversification`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updatePortfolio(portfolioId: number, userId: number, name: string): Promise<Portfolio> {
        try {
            const response: AxiosResponse<Portfolio> = await this.api.put(
                `/portfolios/${portfolioId}/user/${userId}`,
                { name }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deletePortfolio(portfolioId: number, userId: number): Promise<void> {
        try {
            await this.api.delete(`/portfolios/${portfolioId}/user/${userId}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserTransactions(userId: number): Promise<Transaction[]> {
        try {
            const response: AxiosResponse<Transaction[]> = await this.api.get(
                `/portfolios/user/${userId}/transactions`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserSellTransactions(userId: number): Promise<Transaction[]> {
        try {
            const response: AxiosResponse<Transaction[]> = await this.api.get(
                `/portfolios/user/${userId}/transactions/sells`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getPortfolioTransactions(portfolioId: number): Promise<Transaction[]> {
        try {
            const response: AxiosResponse<Transaction[]> = await this.api.get(
                `/portfolios/${portfolioId}/transactions`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async sellAsset(
        portfolioId: number,
        userId: number,
        tickerSymbol: string,
        sellRequest: SellAssetRequest
    ): Promise<Transaction> {
        try {
            const response: AxiosResponse<Transaction> = await this.api.post(
                `/portfolios/${portfolioId}/user/${userId}/assets/${tickerSymbol}/sell`,
                sellRequest
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getStockHistory(symbol: string, days: number = 30): Promise<StockHistoricalData> {
        try {
            const response: AxiosResponse<StockHistoricalData> = await this.api.get(
                `/stocks/${symbol}/history`,
                {
                    params: { days },
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

export const apiService = new ApiService();
export default apiService;
