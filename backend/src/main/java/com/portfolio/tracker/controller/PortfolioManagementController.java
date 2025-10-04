package com.portfolio.tracker.controller;

import com.portfolio.tracker.dto.*;
import com.portfolio.tracker.service.PortfolioManagementService;
import com.portfolio.tracker.service.TransactionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/portfolios")
public class PortfolioManagementController {

    private final PortfolioManagementService portfolioService;
    private final TransactionService transactionService;

    public PortfolioManagementController(PortfolioManagementService portfolioService,
            TransactionService transactionService) {
        this.portfolioService = portfolioService;
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<PortfolioResponse> createPortfolio(@Valid @RequestBody PortfolioRequest request) {
        PortfolioResponse portfolio = portfolioService.createPortfolio(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(portfolio);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PortfolioResponse>> getUserPortfolios(@PathVariable Long userId) {
        List<PortfolioResponse> portfolios = portfolioService.getUserPortfolios(userId);
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioResponse> getPortfolioDetails(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        PortfolioResponse portfolioResponse = portfolioService.getPortfolioDetails(id, userId);
        return ResponseEntity.ok(portfolioResponse);
    }

    @PutMapping("/{portfolioId}/user/{userId}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @PathVariable Long portfolioId,
            @PathVariable Long userId,
            @RequestBody @Valid PortfolioUpdateRequest request) {
        PortfolioResponse portfolioResponse = portfolioService.updatePortfolio(
                portfolioId, userId, request.getName());
        return ResponseEntity.ok(portfolioResponse);
    }

    @PostMapping("/{portfolioId}/user/{userId}/assets")
    public ResponseEntity<AssetResponse> addAsset(
            @PathVariable Long portfolioId,
            @PathVariable Long userId,
            @Valid @RequestBody AssetRequest request) {
        AssetResponse asset = portfolioService.addAsset(portfolioId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(asset);
    }

    @PutMapping("/{portfolioId}/user/{userId}/assets/{tickerSymbol}")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long portfolioId,
            @PathVariable Long userId,
            @PathVariable String tickerSymbol,
            @Valid @RequestBody AssetRequest request) {
        AssetResponse asset = portfolioService.updateAsset(portfolioId, userId, tickerSymbol, request);
        return ResponseEntity.ok(asset);
    }

    @DeleteMapping("/{portfolioId}/user/{userId}/assets/{tickerSymbol}")
    public ResponseEntity<Void> removeAsset(
            @PathVariable Long portfolioId,
            @PathVariable Long userId,
            @PathVariable String tickerSymbol) {
        portfolioService.removeAsset(portfolioId, userId, tickerSymbol);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{portfolioId}/user/{userId}")
    public ResponseEntity<Void> deletePortfolio(
            @PathVariable Long portfolioId,
            @PathVariable Long userId) {
        portfolioService.deletePortfolio(portfolioId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{portfolioId}/user/{userId}/assets/{tickerSymbol}/sell")
    public ResponseEntity<TransactionResponse> sellAsset(
            @PathVariable Long portfolioId,
            @PathVariable Long userId,
            @PathVariable String tickerSymbol,
            @Valid @RequestBody SellAssetRequest request) {
        TransactionResponse transaction = portfolioService.sellAsset(
                portfolioId, userId, tickerSymbol, request.getQuantity(), request.getCurrentMarketPrice());
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getUserTransactions(@PathVariable Long userId) {
        List<TransactionResponse> transactions = transactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{portfolioId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getPortfolioTransactions(@PathVariable Long portfolioId) {
        List<TransactionResponse> transactions = transactionService.getPortfolioTransactions(portfolioId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}/transactions/sells")
    public ResponseEntity<List<TransactionResponse>> getUserSellTransactions(@PathVariable Long userId) {
        List<TransactionResponse> sellTransactions = transactionService.getSellTransactionsByUser(userId);
        return ResponseEntity.ok(sellTransactions);
    }
}
