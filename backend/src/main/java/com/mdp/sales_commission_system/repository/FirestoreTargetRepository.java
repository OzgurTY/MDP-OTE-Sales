package com.mdp.sales_commission_system.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.mdp.sales_commission_system.model.Target;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
@Primary
public class FirestoreTargetRepository implements TargetRepository {

    private static final String COLLECTION_NAME = "targets";

    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public Optional<Target> findByUserIdAndPeriod(String userId, String period) {
        try {
            ApiFuture<QuerySnapshot> future = getFirestore().collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId)
                    .whereEqualTo("period", period)
                    .get();

            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            if (!documents.isEmpty()) {
                Target target = documents.get(0).toObject(Target.class);
                target.setId(documents.get(0).getId());
                return Optional.of(target);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public Target save(Target target) {
        try {
            // Check if exists
            if (target.getId() != null) {
                getFirestore().collection(COLLECTION_NAME).document(target.getId()).set(target).get();
            } else {
                // Check if one already exists for this period/user to avoid dupes logic (simple
                // version)
                Optional<Target> existing = findByUserIdAndPeriod(target.getUserId(), target.getPeriod());
                if (existing.isPresent()) {
                    target.setId(existing.get().getId());
                    getFirestore().collection(COLLECTION_NAME).document(target.getId()).set(target).get();
                    return target;
                }

                ApiFuture<DocumentReference> future = getFirestore().collection(COLLECTION_NAME).add(target);
                target.setId(future.get().getId());
            }
            return target;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving target to Firestore", e);
        }
    }
}
