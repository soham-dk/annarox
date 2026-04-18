package com.annarox.entity;

import java.time.LocalDateTime;

import com.annarox.enums.RoundStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private String name; // "Morning", "Afternoon"

	@Enumerated(EnumType.STRING)
	private RoundStatus status; // OPEN, CLOSED, DRAWN

	private Integer winningNumber; // nullable

	private LocalDateTime openedAt;
	private LocalDateTime drawnAt;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	@Column
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}
}