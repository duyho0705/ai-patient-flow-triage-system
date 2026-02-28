importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCJ-lTXX83ocINOlbCQTKbiADzz3Loy5pQ",
    authDomain: "chronic-disease-manageme-bcba9.firebaseapp.com",
    projectId: "chronic-disease-manageme-bcba9",
    storageBucket: "chronic-disease-manageme-bcba9.firebasestorage.app",
    messagingSenderId: "621812476686",
    appId: "1:621812476686:web:e307781cae95fe089fc55f",
    measurementId: "G-8W9LH8CKX8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
