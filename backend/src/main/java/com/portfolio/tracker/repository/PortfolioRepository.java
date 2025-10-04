package com.portfolio.tracker.repository;

import com.portfolio.tracker.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUserId(Long userId);

    Optional<Portfolio> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT p FROM Portfolio p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Portfolio> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT p FROM Portfolio p "
            + "LEFT JOIN FETCH p.assets "
            + "WHERE p.id = :portfolioId")
    Optional<Portfolio> findByIdWithAssets(@Param("portfolioId") Long portfolioId);

    boolean existsByPortfolioNameAndUserId(String portfolioName, Long userId);
}
