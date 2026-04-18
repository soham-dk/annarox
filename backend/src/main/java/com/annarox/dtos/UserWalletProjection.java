package com.annarox.dtos;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Value;

public interface UserWalletProjection {
    Long getId();
    String getPhoneNumber();
    String getStatus();
    
    // This looks into the linked Wallet entity and grabs the balance
    @Value("#{target.wallet != null ? target.wallet.balance : 0.0}")
    BigDecimal getBalance();
}
