package com.portfolio.tracker.service;

import com.portfolio.tracker.dto.*;
import com.portfolio.tracker.entity.*;
import com.portfolio.tracker.repository.*;
import com.portfolio.tracker.exception.ResourceNotFoundException;
import com.portfolio.tracker.exception.DuplicateResourceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PortfolioManagementService {

    private final PortfolioRepository portfolioRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final MarketPriceService marketPriceService;
    private final TransactionRepository transactionRepository;
    private final StockRepository stockRepository;

    public PortfolioManagementService(PortfolioRepository portfolioRepository,
            AssetRepository assetRepository,
            UserRepository userRepository,
            MarketPriceService marketPriceService,
            TransactionRepository transactionRepository,
            StockRepository stockRepository) {
        this.portfolioRepository = portfolioRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.marketPriceService = marketPriceService;
        this.transactionRepository = transactionRepository;
        this.stockRepository = stockRepository;
    }

    public PortfolioResponse createPortfolio(PortfolioRequest request) {
        // Verify user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // Check if portfolio name already exists for this user
        if (portfolioRepository.existsByPortfolioNameAndUserId(request.getName(), request.getUserId())) {
            throw new DuplicateResourceException("Portfolio with name '" + request.getName() + "' already exists for this user");
        }

        Portfolio portfolio = new Portfolio();
        portfolio.setPortfolioName(request.getName());
        portfolio.setUser(user);
        portfolio.setInitialInvestment(BigDecimal.ZERO);
        portfolio.setCurrentValue(BigDecimal.ZERO);

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);

        return new PortfolioResponse(
                savedPortfolio.getId(),
                savedPortfolio.getPortfolioName(),
                savedPortfolio.getUser().getId(),
                savedPortfolio.getCreatedAt(),
                List.of() // Empty assets list for new portfolio
        );
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioDetails(Long portfolioId, Long userId) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        List<Asset> assets = assetRepository.findByPortfolioId(portfolioId);
        List<AssetResponse> assetResponses = assets.stream()
                .map(this::convertToAssetResponse)
                .collect(Collectors.toList());

        return new PortfolioResponse(
                portfolio.getId(),
                portfolio.getPortfolioName(),
                portfolio.getUser().getId(),
                portfolio.getCreatedAt(),
                assetResponses
        );
    }

    @Transactional(readOnly = true)
    public List<PortfolioResponse> getUserPortfolios(Long userId) {
        List<Portfolio> portfolios = portfolioRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return portfolios.stream()
                .map(portfolio -> {
                    List<Asset> assets = assetRepository.findByPortfolioId(portfolio.getId());
                    List<AssetResponse> assetResponses = assets.stream()
                            .map(this::convertToAssetResponse)
                            .collect(Collectors.toList());

                    return new PortfolioResponse(
                            portfolio.getId(),
                            portfolio.getPortfolioName(),
                            portfolio.getUser().getId(),
                            portfolio.getCreatedAt(),
                            assetResponses
                    );
                })
                .collect(Collectors.toList());
    }

    public AssetResponse addAsset(Long portfolioId, Long userId, AssetRequest request) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        // Check if asset already exists in portfolio
        if (assetRepository.existsByPortfolioIdAndTickerSymbol(portfolioId, request.getTickerSymbol().toUpperCase())) {
            throw new DuplicateResourceException("Asset " + request.getTickerSymbol() + " already exists in this portfolio");
        }

        // Validate ticker symbol
        if (!marketPriceService.isTickerSupported(request.getTickerSymbol())) {
            throw new IllegalArgumentException("Invalid ticker symbol: " + request.getTickerSymbol());
        }

        Asset asset = new Asset(
                request.getTickerSymbol().toUpperCase(),
                request.getQuantity(),
                request.getAveragePrice(),
                portfolio
        );

        Asset savedAsset = assetRepository.save(asset);
        return convertToAssetResponse(savedAsset);
    }

    public AssetResponse updateAsset(Long portfolioId, Long userId, String tickerSymbol, AssetRequest request) {
        // Verify portfolio exists and belongs to user
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        Asset asset = assetRepository.findByPortfolioIdAndTickerSymbol(portfolioId, tickerSymbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Asset " + tickerSymbol + " not found in portfolio"));

        asset.setQuantity(request.getQuantity());
        asset.setAveragePrice(request.getAveragePrice());

        Asset updatedAsset = assetRepository.save(asset);
        return convertToAssetResponse(updatedAsset);
    }

    public TransactionResponse sellAsset(Long portfolioId, Long userId, String tickerSymbol, BigDecimal quantity, BigDecimal currentMarketPrice) {
        // Verify portfolio exists and belongs to user
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        Asset asset = assetRepository.findByPortfolioIdAndTickerSymbol(portfolioId, tickerSymbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Asset " + tickerSymbol + " not found in portfolio"));

        if (asset.getQuantity().compareTo(quantity) < 0) {
            throw new IllegalArgumentException("Cannot sell more shares than owned. Available: " + asset.getQuantity() + ", Requested: " + quantity);
        }

        // Find or create stock
        Stock stock = stockRepository.findBySymbol(tickerSymbol.toUpperCase())
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setSymbol(tickerSymbol.toUpperCase());
                    newStock.setCompanyName(tickerSymbol.toUpperCase() + " Inc.");
                    newStock.setCurrentPrice(currentMarketPrice);
                    return stockRepository.save(newStock);
                });

        // Create sell transaction
        Transaction transaction = new Transaction();
        transaction.setTransactionType(TransactionType.SELL);
        transaction.setQuantity(quantity);
        transaction.setPricePerShare(currentMarketPrice);
        transaction.setTotalAmount(quantity.multiply(currentMarketPrice));
        transaction.setPortfolio(portfolio);
        transaction.setStock(stock);
        transaction = transactionRepository.save(transaction);

        // Update or remove asset
        if (asset.getQuantity().compareTo(quantity) == 0) {
            // Selling all shares - remove asset
            assetRepository.delete(asset);
        } else {
            // Partial sale - update quantity
            asset.setQuantity(asset.getQuantity().subtract(quantity));
            assetRepository.save(asset);
        }

        // Create response with realized P&L
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setTransactionType(transaction.getTransactionType());
        response.setQuantity(transaction.getQuantity());
        response.setPricePerShare(transaction.getPricePerShare());
        response.setTotalAmount(transaction.getTotalAmount());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setPortfolioId(portfolio.getId());
        response.setPortfolioName(portfolio.getPortfolioName());
        response.setTickerSymbol(stock.getSymbol());

        // Calculate realized P&L
        BigDecimal costBasis = asset.getAveragePrice().multiply(quantity);
        BigDecimal saleProceeds = transaction.getTotalAmount();
        BigDecimal realizedPnL = saleProceeds.subtract(costBasis);
        response.setRealizedPnL(realizedPnL);

        return response;
    }

    /**
     * Remove asset from portfolio (without creating transaction record)
     */
    public void removeAsset(Long portfolioId, Long userId, String tickerSymbol) {
        // Verify portfolio exists and belongs to user
        portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        Asset asset = assetRepository.findByPortfolioIdAndTickerSymbol(portfolioId, tickerSymbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Asset " + tickerSymbol + " not found in portfolio"));

        assetRepository.delete(asset);
    }

    /**
     * Update portfolio name
     */
    public PortfolioResponse updatePortfolio(Long portfolioId, Long userId, String name) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        // Check if new name already exists for this user (excluding current portfolio)
        if (!portfolio.getPortfolioName().equals(name)
                && portfolioRepository.existsByPortfolioNameAndUserId(name, userId)) {
            throw new DuplicateResourceException("Portfolio with name '" + name + "' already exists for this user");
        }

        portfolio.setPortfolioName(name);
        portfolioRepository.save(portfolio);

        // Get updated portfolio details with assets
        return getPortfolioDetails(portfolioId, userId);
    }

    /**
     * Delete entire portfolio
     */
    public void deletePortfolio(Long portfolioId, Long userId) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        // Delete all transactions associated with this portfolio first
        List<Transaction> transactions = transactionRepository.findByPortfolioId(portfolioId);
        if (!transactions.isEmpty()) {
            transactionRepository.deleteAll(transactions);
        }

        // Now delete the portfolio (assets will be cascade deleted automatically)
        portfolioRepository.delete(portfolio);
    }

    /**
     * Convert Asset entity to AssetResponse with current market data
     */
    private AssetResponse convertToAssetResponse(Asset asset) {
        BigDecimal currentPrice = marketPriceService.getMarketPrice(asset.getTickerSymbol());

        return new AssetResponse(
                asset.getId(),
                asset.getTickerSymbol(),
                asset.getQuantity(),
                asset.getAveragePrice(),
                currentPrice,
                asset.getCreatedAt(),
                asset.getUpdatedAt()
        );
    }
}
