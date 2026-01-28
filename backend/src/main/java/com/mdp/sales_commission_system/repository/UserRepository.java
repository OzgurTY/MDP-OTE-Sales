package com.mdp.sales_commission_system.repository;

import com.mdp.sales_commission_system.model.User;
import java.util.Optional;

public interface UserRepository {
    User save(User user);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    void deleteById(String id);

    boolean existsById(String id);
}
