package com.arms.platform.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseUserService {

    @Autowired
    private Firestore firestore;

    @Autowired
    private FirebaseAuth firebaseAuth;

    private static final String USERS_COLLECTION = "users";

    /**
     * Get user by Firebase UID
     */
    public Map<String, Object> getUserByUid(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(USERS_COLLECTION).document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (document.exists()) {
            return document.getData();
        }
        return null;
    }

    /**
     * Get user by email
     */
    public Map<String, Object> getUserByEmail(String email) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(USERS_COLLECTION)
                .whereEqualTo("email", email)
                .limit(1)
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        if (!documents.isEmpty()) {
            Map<String, Object> userData = documents.get(0).getData();
            userData.put("uid", documents.get(0).getId());
            return userData;
        }
        return null;
    }

    /**
     * Create or update user
     */
    public void createOrUpdateUser(String uid, Map<String, Object> userData) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(USERS_COLLECTION).document(uid);
        
        // Add timestamp if creating new user
        if (!userData.containsKey("createdAt")) {
            userData.put("createdAt", FieldValue.serverTimestamp());
        }
        userData.put("updatedAt", FieldValue.serverTimestamp());
        
        ApiFuture<WriteResult> result = docRef.set(userData, SetOptions.merge());
        result.get();
    }

    /**
     * Search users by name or email
     */
    public List<Map<String, Object>> searchUsers(String query) throws ExecutionException, InterruptedException {
        List<Map<String, Object>> results = new ArrayList<>();
        
        // Search by email
        ApiFuture<QuerySnapshot> emailFuture = firestore.collection(USERS_COLLECTION)
                .whereGreaterThanOrEqualTo("email", query)
                .whereLessThanOrEqualTo("email", query + "\uf8ff")
                .limit(10)
                .get();

        for (QueryDocumentSnapshot document : emailFuture.get().getDocuments()) {
            Map<String, Object> userData = document.getData();
            userData.put("uid", document.getId());
            results.add(userData);
        }

        // Search by display name
        ApiFuture<QuerySnapshot> nameFuture = firestore.collection(USERS_COLLECTION)
                .whereGreaterThanOrEqualTo("displayName", query)
                .whereLessThanOrEqualTo("displayName", query + "\uf8ff")
                .limit(10)
                .get();

        for (QueryDocumentSnapshot document : nameFuture.get().getDocuments()) {
            Map<String, Object> userData = document.getData();
            userData.put("uid", document.getId());
            if (!results.stream().anyMatch(u -> u.get("uid").equals(document.getId()))) {
                results.add(userData);
            }
        }

        return results;
    }

    /**
     * Get user profile with upload count
     */
    public Map<String, Object> getUserProfile(String uid) throws ExecutionException, InterruptedException {
        Map<String, Object> userData = getUserByUid(uid);
        if (userData == null) {
            return null;
        }

        // Get upload count from materials collection
        ApiFuture<QuerySnapshot> materialsFuture = firestore.collection("materials")
                .whereEqualTo("uploadedBy", uid)
                .get();

        int uploadCount = materialsFuture.get().size();
        userData.put("uploadCount", uploadCount);
        userData.put("uid", uid);

        return userData;
    }

    /**
     * Get top uploaders (for rankings)
     */
    public List<Map<String, Object>> getTopUploaders(int limit) throws ExecutionException, InterruptedException {
        // Get all materials grouped by uploader
        ApiFuture<QuerySnapshot> materialsFuture = firestore.collection("materials").get();
        List<QueryDocumentSnapshot> materials = materialsFuture.get().getDocuments();

        // Count uploads per user
        Map<String, Integer> uploadCounts = new HashMap<>();
        for (QueryDocumentSnapshot material : materials) {
            String uploadedBy = material.getString("uploadedBy");
            if (uploadedBy != null) {
                uploadCounts.put(uploadedBy, uploadCounts.getOrDefault(uploadedBy, 0) + 1);
            }
        }

        // Get user details and sort by upload count
        List<Map<String, Object>> rankedUsers = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : uploadCounts.entrySet()) {
            Map<String, Object> userData = getUserByUid(entry.getKey());
            if (userData != null) {
                userData.put("uid", entry.getKey());
                userData.put("uploadCount", entry.getValue());
                rankedUsers.add(userData);
            }
        }

        // Sort by upload count descending
        rankedUsers.sort((a, b) -> {
            int countA = (int) a.getOrDefault("uploadCount", 0);
            int countB = (int) b.getOrDefault("uploadCount", 0);
            return Integer.compare(countB, countA);
        });

        return rankedUsers.subList(0, Math.min(limit, rankedUsers.size()));
    }

    /**
     * Verify Firebase ID token
     */
    public String verifyIdToken(String idToken) throws FirebaseAuthException {
        com.google.firebase.auth.FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
        return decodedToken.getUid();
    }

    /**
     * Get Firebase user record
     */
    public UserRecord getUserRecord(String uid) throws FirebaseAuthException {
        return firebaseAuth.getUser(uid);
    }
}
