package com.portfolio.tracker.service;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    public void removeToken(String token) {
        blacklistedTokens.remove(token);
    }

    public void clearAll() {
        blacklistedTokens.clear();
    }

    public int getBlacklistedTokenCount() {
        return blacklistedTokens.size();
    }
}
