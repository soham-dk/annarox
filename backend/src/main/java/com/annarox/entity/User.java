package com.annarox.entity;

import java.time.LocalDateTime;

import com.annarox.enums.Role;
import com.annarox.enums.UserStatus;
import com.annarox.enums.UserStatus;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(unique = true, nullable = false, length = 15)
	private String phoneNumber;

	@Column(nullable = false, length = 100)
	private String password;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role = Role.USER;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	@Column
	private LocalDateTime updatedAt;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	private Wallet wallet;

	@Enumerated(EnumType.STRING)
	private UserStatus status = UserStatus.INACTIVE;

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
