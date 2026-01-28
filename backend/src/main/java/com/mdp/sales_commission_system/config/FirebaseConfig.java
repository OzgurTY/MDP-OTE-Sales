package com.mdp.sales_commission_system.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");

        if (serviceAccount == null) {
            throw new IOException("serviceAccountKey.json not found in resources");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        } else {
            return FirebaseApp.getInstance();
        }
    }

    @Bean
    public com.google.cloud.firestore.Firestore firestore(FirebaseApp firebaseApp) {
        return com.google.firebase.cloud.FirestoreClient.getFirestore(firebaseApp);
    }
}
