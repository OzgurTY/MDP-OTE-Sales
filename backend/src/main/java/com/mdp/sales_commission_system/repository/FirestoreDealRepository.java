package com.mdp.sales_commission_system.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.mdp.sales_commission_system.model.Deal;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
@Primary
public class FirestoreDealRepository implements DealRepository {

    private static final String COLLECTION_NAME = "deals";

    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public List<Deal> findAll() {
        List<Deal> deals = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = getFirestore().collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                Deal deal = document.toObject(Deal.class);
                deal.setId(document.getId());
                deals.add(deal);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return deals;
    }

    @Override
    public List<Deal> findByUserId(String userId) {
        List<Deal> deals = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = getFirestore().collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                Deal deal = document.toObject(Deal.class);
                deal.setId(document.getId());
                deals.add(deal);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return deals;
    }

    @Override
    public Deal save(Deal deal) {
        try {
            if (deal.getId() == null || deal.getId().isEmpty()) {
                ApiFuture<DocumentReference> future = getFirestore().collection(COLLECTION_NAME).add(deal);
                String id = future.get().getId();
                deal.setId(id);
                // Update with ID if needed, but usually we just set it on object
            } else {
                getFirestore().collection(COLLECTION_NAME).document(deal.getId()).set(deal).get();
            }
            return deal;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving deal to Firestore", e);
        }
    }

    @Override
    public void deleteById(String id) {
        try {
            getFirestore().collection(COLLECTION_NAME).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting deal from Firestore", e);
        }
    }
}
