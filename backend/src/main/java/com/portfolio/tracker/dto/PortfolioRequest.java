package com.portfolio.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PortfolioRequest {

    @NotBlank(message = "Portfolio name is required")
    private String name;

    @NotNull(message = "User ID is required")
    private Long userId;

    public PortfolioRequest() {
    }

    public PortfolioRequest(String name, Long userId) {
        this.name = name;
        this.userId = userId;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
