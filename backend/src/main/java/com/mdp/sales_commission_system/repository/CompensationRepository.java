package com.mdp.sales_commission_system.repository;

import com.mdp.sales_commission_system.model.CompensationProfile;
import java.util.Optional;

public interface CompensationRepository {
    Optional<CompensationProfile> findByUserId(String userId);

    CompensationProfile save(CompensationProfile profile);
}
