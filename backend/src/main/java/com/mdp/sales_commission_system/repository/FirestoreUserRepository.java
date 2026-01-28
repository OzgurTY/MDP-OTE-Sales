package com.mdp.sales_commission_system.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.mdp.sales_commission_system.model.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class FirestoreUserRepository implements UserRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "users";

    public FirestoreUserRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(firestore.collection(COLLECTION_NAME).document().getId());
        }
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME).document(user.getId()).set(user);
        try {
            future.get();
            return user;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving user to Firestore", e);
        }
    }

    @Override
    public Optional<User> findById(String id) {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        try {
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                return Optional.ofNullable(document.toObject(User.class));
            } else {
                return Optional.empty();
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching user from Firestore", e);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        CollectionReference users = firestore.collection(COLLECTION_NAME);
        Query query = users.whereEqualTo("email", email);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        try {
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            if (!documents.isEmpty()) {
                return Optional.ofNullable(documents.get(0).toObject(User.class));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching user by email", e);
        }
    }

    @Override
    public void deleteById(String id) {
        ApiFuture<WriteResult> writeResult = firestore.collection(COLLECTION_NAME).document(id).delete();
        try {
            writeResult.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error deleting user from Firestore", e);
        }
    }

    @Override
    public boolean existsById(String id) {
        try {
            DocumentSnapshot document = firestore.collection(COLLECTION_NAME).document(id).get().get();
            return document.exists();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error checking user existence", e);
        }
    }
}
