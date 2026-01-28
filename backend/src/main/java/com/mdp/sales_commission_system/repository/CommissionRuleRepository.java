package com.mdp.sales_commission_system.repository;

import com.mdp.sales_commission_system.model.CommissionRule;
import java.util.List;
import java.util.Optional;

public interface CommissionRuleRepository {
    List<CommissionRule> findAll();

    List<CommissionRule> findAllByUserId(String userId);

    Optional<CommissionRule> findById(String id);

    CommissionRule save(CommissionRule rule);

    void deleteById(String id);
}
