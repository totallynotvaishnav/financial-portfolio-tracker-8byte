package com.portfolio.tracker.dto;

import jakarta.validation.constraints.NotBlank;

public class PortfolioUpdateRequest {

    @NotBlank(message = "Portfolio name is required")
    private String name;

    public PortfolioUpdateRequest() {
    }

    public PortfolioUpdateRequest(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
