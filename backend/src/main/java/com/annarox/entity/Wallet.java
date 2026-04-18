package com.annarox.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Wallet {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private BigDecimal balance = BigDecimal.ZERO;

	@OneToOne
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;
}