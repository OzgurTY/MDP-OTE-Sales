package com.mdp.sales_commission_system.repository;

import com.mdp.sales_commission_system.model.Deal;
import java.util.List;

public interface DealRepository {
    List<Deal> findAll();

    List<Deal> findByUserId(String userId);

    Deal save(Deal deal);

    void deleteById(String id);
}
