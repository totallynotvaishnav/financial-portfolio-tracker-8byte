package com.portfolio.tracker.controller;

import com.portfolio.tracker.dto.DiversificationInsightResponse;
import com.portfolio.tracker.service.AiInsightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai-insights")
public class AiInsightController {

    private final AiInsightService aiInsightService;

    public AiInsightController(AiInsightService aiInsightService) {
        this.aiInsightService = aiInsightService;
    }

    @GetMapping("/portfolio/{portfolioId}/diversification")
    public ResponseEntity<DiversificationInsightResponse> getPortfolioDiversificationInsights(
            @PathVariable Long portfolioId) {
        DiversificationInsightResponse insights = aiInsightService.generateDiversificationInsights(portfolioId);
        return ResponseEntity.ok(insights);
    }
}
