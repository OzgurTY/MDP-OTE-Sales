package com.mdp.sales_commission_system.repository;

import com.mdp.sales_commission_system.model.Target;
import java.util.Optional;

public interface TargetRepository {
    Optional<Target> findByUserIdAndPeriod(String userId, String period);

    Target save(Target target);
}
