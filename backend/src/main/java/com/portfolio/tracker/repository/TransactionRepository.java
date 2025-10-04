package com.portfolio.tracker.repository;

import com.portfolio.tracker.entity.Transaction;
import com.portfolio.tracker.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByPortfolioId(Long portfolioId);

    List<Transaction> findByStockId(Long stockId);

    List<Transaction> findByPortfolioIdAndStockId(Long portfolioId, Long stockId);

    List<Transaction> findByTransactionType(TransactionType transactionType);

    @Query("SELECT t FROM Transaction t WHERE t.portfolio.user.id = :userId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdOrderByTransactionDateDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.portfolio.id = :portfolioId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByPortfolioIdAndTransactionDateBetween(@Param("portfolioId") Long portfolioId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
