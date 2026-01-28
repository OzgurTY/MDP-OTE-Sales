package com.mdp.sales_commission_system.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.mdp.sales_commission_system.model.CompensationProfile;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
@Primary
public class FirestoreCompensationRepository implements CompensationRepository {

    private static final String COLLECTION_NAME = "compensation_profiles";

    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public Optional<CompensationProfile> findByUserId(String userId) {
        try {
            // Document ID = userId for simple lookup, or query field
            // Let's assume document ID is userId to ensure 1-1 uniqueness easily
            DocumentSnapshot document = getFirestore().collection(COLLECTION_NAME).document(userId).get().get();
            if (document.exists()) {
                CompensationProfile profile = document.toObject(CompensationProfile.class);
                return Optional.of(profile);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public CompensationProfile save(CompensationProfile profile) {
        try {
            // Use userId as document key
            getFirestore().collection(COLLECTION_NAME).document(profile.getUserId()).set(profile).get();
            return profile;
        } catch (Exception e) {
            throw new RuntimeException("Error saving compensation profile", e);
        }
    }
}
