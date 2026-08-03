import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // FCM automatically handles displaying notifications in background/terminated state.
  // We can log it or perform background processing here.
  debugPrint("Handling a background message: ${message.messageId}");
}

class NotificationHelper {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    if (kIsWeb) return;

    try {
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/launcher_icon');

      const InitializationSettings initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
      );

      await _notificationsPlugin.initialize(
        initializationSettings,
      );

      final AndroidFlutterLocalNotificationsPlugin? androidImplementation =
          _notificationsPlugin.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      
      if (androidImplementation != null) {
        await androidImplementation.requestNotificationsPermission();
      }

      // Initialize Firebase Messaging
      final FirebaseMessaging messaging = FirebaseMessaging.instance;
      
      // Request FCM permission
      await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      // Register background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Handle foreground notifications
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint("FCM Foreground message received: ${message.notification?.title}");
        if (message.notification != null) {
          showNotification(
            id: message.hashCode,
            title: message.notification!.title ?? '',
            body: message.notification!.body ?? '',
          );
        }
      });
    } catch (e) {
      debugPrint("Failed to initialize local/FCM notifications: $e");
    }
  }

  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    if (kIsWeb) return;

    try {
      const AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        'abirami_channel', 
        'Abirami Laboratory Alerts', 
        channelDescription: 'Real-time updates for test bookings and referrals',
        importance: Importance.max,
        priority: Priority.high,
        ticker: 'ticker',
      );

      const NotificationDetails platformChannelSpecifics = NotificationDetails(
        android: androidPlatformChannelSpecifics,
      );

      await _notificationsPlugin.show(
        id,
        title,
        body,
        platformChannelSpecifics,
      );
    } catch (e) {
      debugPrint("Failed to show local notification: $e");
    }
  }

  // Topic subscription based on login session state
  static Future<void> syncTopics(String phone, bool isDoctor) async {
    if (kIsWeb || phone.isEmpty) return;
    try {
      final messaging = FirebaseMessaging.instance;
      if (isDoctor) {
        await messaging.subscribeToTopic('all_doctors');
        await messaging.subscribeToTopic('doctor_$phone');
        await messaging.unsubscribeFromTopic('all_users');
        await messaging.unsubscribeFromTopic('user_$phone');
      } else {
        await messaging.subscribeToTopic('all_users');
        await messaging.subscribeToTopic('user_$phone');
        await messaging.unsubscribeFromTopic('all_doctors');
        await messaging.unsubscribeFromTopic('doctor_$phone');
      }
      
      // Also save FCM token to user document in Firestore as a fallback standard integration
      final token = await messaging.getToken();
      if (token != null) {
        await FirebaseFirestore.instance
            .collection(isDoctor ? 'doctors' : 'users')
            .doc(phone)
            .set({
          'fcmToken': token,
        }, SetOptions(merge: true));
      }
    } catch (e) {
      debugPrint("Failed to sync FCM topics: $e");
    }
  }

  static Future<void> unsubscribeAll(String phone, bool isDoctor) async {
    if (kIsWeb || phone.isEmpty) return;
    try {
      final messaging = FirebaseMessaging.instance;
      if (isDoctor) {
        await messaging.unsubscribeFromTopic('all_doctors');
        await messaging.unsubscribeFromTopic('doctor_$phone');
      } else {
        await messaging.unsubscribeFromTopic('all_users');
        await messaging.unsubscribeFromTopic('user_$phone');
      }
    } catch (e) {
      debugPrint("Failed to unsubscribe FCM topics: $e");
    }
  }
}
