package com.portfolio.tracker.repository;

import com.portfolio.tracker.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByPortfolioId(Long portfolioId);

    Optional<Asset> findByPortfolioIdAndTickerSymbol(Long portfolioId, String tickerSymbol);

    @Query("SELECT a FROM Asset a WHERE a.portfolio.id = :portfolioId AND a.portfolio.user.id = :userId")
    List<Asset> findByPortfolioIdAndUserId(@Param("portfolioId") Long portfolioId, @Param("userId") Long userId);

    @Query("SELECT a FROM Asset a WHERE a.portfolio.user.id = :userId")
    List<Asset> findByUserId(@Param("userId") Long userId);

    boolean existsByPortfolioIdAndTickerSymbol(Long portfolioId, String tickerSymbol);

    void deleteByPortfolioIdAndTickerSymbol(Long portfolioId, String tickerSymbol);
}
