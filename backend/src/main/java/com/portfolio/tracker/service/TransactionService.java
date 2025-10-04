package com.portfolio.tracker.service;

import com.portfolio.tracker.dto.TransactionResponse;
import com.portfolio.tracker.entity.*;
import com.portfolio.tracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getPortfolioTransactions(Long portfolioId) {
        List<Transaction> transactions = transactionRepository.findByPortfolioId(portfolioId);
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getSellTransactionsByUser(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        return transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.SELL)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setTransactionType(transaction.getTransactionType());
        response.setQuantity(transaction.getQuantity());
        response.setPricePerShare(transaction.getPricePerShare());
        response.setTotalAmount(transaction.getTotalAmount());
        response.setFees(transaction.getFees());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setPortfolioId(transaction.getPortfolio().getId());
        response.setPortfolioName(transaction.getPortfolio().getPortfolioName());
        response.setTickerSymbol(transaction.getStock().getSymbol());

        // Calculate realized P&L for sell transactions
        if (transaction.getTransactionType() == TransactionType.SELL) {
            // Get the average cost basis from the portfolio's current asset
            Portfolio portfolio = transaction.getPortfolio();
            Asset asset = portfolio.getAssets().stream()
                    .filter(a -> a.getTickerSymbol().equals(transaction.getStock().getSymbol()))
                    .findFirst()
                    .orElse(null);

            if (asset != null) {
                BigDecimal costBasis = asset.getAveragePrice().multiply(transaction.getQuantity());
                BigDecimal saleProceeds = transaction.getTotalAmount();
                BigDecimal realizedPnL = saleProceeds.subtract(costBasis);
                response.setRealizedPnL(realizedPnL);
            }
        }

        return response;
    }
}
