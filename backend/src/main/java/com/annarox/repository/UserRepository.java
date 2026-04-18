package com.annarox.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.annarox.dtos.UserWalletProjection;
import com.annarox.entity.User;
import com.annarox.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

//    List<User> findByRole(Role role);
    
    @EntityGraph(attributePaths = {"wallet"}) // Ensures one query
    List<UserWalletProjection> findByRole(Role role);

    public boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findById(Long id);

}
