package com.portfolio.tracker.repository;

import com.portfolio.tracker.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);

    List<Stock> findBySectorIgnoreCase(String sector);

    List<Stock> findByIndustryIgnoreCase(String industry);

    @Query("SELECT s FROM Stock s WHERE UPPER(s.companyName) LIKE UPPER(CONCAT('%', :searchTerm, '%')) OR UPPER(s.symbol) LIKE UPPER(CONCAT('%', :searchTerm, '%'))")
    List<Stock> findByCompanyNameOrSymbolContainingIgnoreCase(String searchTerm);
}
