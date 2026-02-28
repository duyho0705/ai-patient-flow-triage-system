import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCJ-lTXX83ocINOlbCQTKbiADzz3Loy5pQ",
    authDomain: "chronic-disease-manageme-bcba9.firebaseapp.com",
    projectId: "chronic-disease-manageme-bcba9",
    storageBucket: "chronic-disease-manageme-bcba9.firebasestorage.app",
    messagingSenderId: "621812476686",
    appId: "1:621812476686:web:e307781cae95fe089fc55f",
    measurementId: "G-8W9LH8CKX8"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const auth = getAuth(app);

const isPlaceholder = (val: string) => val.startsWith("YOUR_");

export const requestForToken = async () => {
    if (isPlaceholder(firebaseConfig.apiKey) || isPlaceholder("BEfsxY3t_YU2atsdHctnmVsa7hwdIyVZUXaddEpBpxDwUwhu5npU-5GIk4--P8CTxUdvHgR07HoscH_05riRzKc")) {
        console.warn("FCM placeholders detected. Skipping token request.");
        return null;
    }
    try {
        const currentToken = await getToken(messaging, {
            vapidKey: "BEfsxY3t_YU2atsdHctnmVsa7hwdIyVZUXaddEpBpxDwUwhu5npU-5GIk4--P8CTxUdvHgR07HoscH_05riRzKc",
        });
        if (currentToken) {
            console.log("Current token for client: ", currentToken);
            return currentToken;
        } else {
            console.log(
                "No registration token available. Request permission to generate one."
            );
            return null;
        }
    } catch (err) {
        console.log("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload: any) => {
            console.log("Payload received: ", payload);
            resolve(payload);
        });
    });
