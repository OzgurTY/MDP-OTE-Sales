package com.mdp.sales_commission_system.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.mdp.sales_commission_system.model.CommissionRule;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
@Primary
public class FirestoreCommissionRuleRepository implements CommissionRuleRepository {

    private static final String COLLECTION_NAME = "rules";

    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public List<CommissionRule> findAll() {
        // Warning: This returns ALL rules from ALL users. Use findAllByUserId instead.
        return new ArrayList<>();
    }

    @Override
    public List<CommissionRule> findAllByUserId(String userId) {
        List<CommissionRule> rules = new ArrayList<>();
        try {
            CollectionReference collection = getFirestore().collection(COLLECTION_NAME);
            Query query = collection.whereEqualTo("userId", userId);
            ApiFuture<QuerySnapshot> future = query.get();

            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                CommissionRule rule = document.toObject(CommissionRule.class);
                rule.setId(document.getId());
                rules.add(rule);
            }

            if (rules.isEmpty()) {
                return new ArrayList<>();
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return rules;
    }

    @Override
    public Optional<CommissionRule> findById(String id) {
        try {
            DocumentSnapshot document = getFirestore().collection(COLLECTION_NAME).document(id).get().get();
            if (document.exists()) {
                CommissionRule rule = document.toObject(CommissionRule.class);
                rule.setId(document.getId());
                return Optional.of(rule);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public CommissionRule save(CommissionRule rule) {
        try {
            if (rule.getId() == null || rule.getId().isEmpty()) {
                ApiFuture<DocumentReference> future = getFirestore().collection(COLLECTION_NAME).add(rule);
                rule.setId(future.get().getId());
            } else {
                getFirestore().collection(COLLECTION_NAME).document(rule.getId()).set(rule).get();
            }
            return rule;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteById(String id) {
        try {
            getFirestore().collection(COLLECTION_NAME).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting rule from Firestore", e);
        }
    }
}
