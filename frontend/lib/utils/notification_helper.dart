import 'dart:convert';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
  debugPrint("FCM Background message received: ${message.messageId}");
}

class NotificationHelper {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Function(Map<String, dynamic> data)? _onNotificationTap;
  static Map<String, dynamic>? _pendingInitialPayload;

  static const AndroidNotificationChannel _androidChannel = AndroidNotificationChannel(
    'abirami_channel',
    'Abirami Laboratory Alerts',
    description: 'Real-time updates for test bookings and referrals',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  static Future<void> init({Function(Map<String, dynamic> data)? onNotificationTap}) async {
    if (kIsWeb) return;

    if (onNotificationTap != null) {
      _onNotificationTap = onNotificationTap;
    }

    try {
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/launcher_icon');

      const InitializationSettings initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
      );

      await _notificationsPlugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          debugPrint("Local notification clicked with payload: ${response.payload}");
          Map<String, dynamic> data = {'screen': 'notifications'};
          if (response.payload != null && response.payload!.isNotEmpty) {
            try {
              data = jsonDecode(response.payload!);
            } catch (_) {}
          }
          _handleTap(data);
        },
      );

      final AndroidFlutterLocalNotificationsPlugin? androidImplementation =
          _notificationsPlugin.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();

      if (androidImplementation != null) {
        await androidImplementation.createNotificationChannel(_androidChannel);
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

      // Set foreground notification options
      await messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // Register background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Subscribe to global user topic for real-time broadcasts & register device FCM token
      try {
        await messaging.subscribeToTopic('all_users');
        final token = await messaging.getToken();
        if (token != null) {
          debugPrint("FCM Device Token: $token");
          await FirebaseFirestore.instance.collection('device_tokens').doc(token).set({
            'token': token,
            'updatedAt': FieldValue.serverTimestamp(),
          }, SetOptions(merge: true));
        }
      } catch (e) {
        debugPrint("Failed to subscribe to all_users topic or save token: $e");
      }

      // 1. Foreground messaging listener
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint("FCM Foreground message received: ${message.notification?.title}");
        if (message.notification != null) {
          showNotification(
            id: message.hashCode,
            title: message.notification!.title ?? '',
            body: message.notification!.body ?? '',
            payload: jsonEncode(message.data.isNotEmpty ? message.data : {'screen': 'notifications'}),
          );
        }
      });

      // 2. Background messaging tap listener (App was in background)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint("FCM Message opened app from background: ${message.data}");
        _handleTap(message.data.isNotEmpty ? message.data : {'screen': 'notifications'});
      });

      // 3. Terminated state launch message (App was completely terminated)
      final RemoteMessage? initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint("FCM Initial message launched terminated app: ${initialMessage.data}");
        final payload = initialMessage.data.isNotEmpty ? initialMessage.data : {'screen': 'notifications'};
        _pendingInitialPayload = payload;
        _handleTap(payload);
      }
    } catch (e) {
      debugPrint("Failed to initialize local/FCM notifications: $e");
    }
  }

  static void setNotificationTapHandler(Function(Map<String, dynamic> data) handler) {
    _onNotificationTap = handler;
    if (_pendingInitialPayload != null) {
      final payload = _pendingInitialPayload!;
      _pendingInitialPayload = null;
      handler(payload);
    }
  }

  static void _handleTap(Map<String, dynamic> data) {
    if (_onNotificationTap != null) {
      _onNotificationTap!(data);
    } else {
      _pendingInitialPayload = data;
    }
  }

  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    if (kIsWeb) return;

    try {
      final AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        _androidChannel.id,
        _androidChannel.name,
        channelDescription: _androidChannel.description,
        importance: Importance.max,
        priority: Priority.high,
        ticker: 'ticker',
        playSound: true,
        enableVibration: true,
      );

      final NotificationDetails platformChannelSpecifics = NotificationDetails(
        android: androidPlatformChannelSpecifics,
      );

      await _notificationsPlugin.show(
        id,
        title,
        body,
        platformChannelSpecifics,
        payload: payload,
      );
    } catch (e) {
      debugPrint("Failed to show local notification: $e");
    }
  }

  // Topic subscription based on login session state
  static Future<void> syncTopics(String phone, bool isDoctor) async {
    if (kIsWeb) return;
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.subscribeToTopic('all_users');
      if (isDoctor) {
        await messaging.subscribeToTopic('all_doctors');
        if (phone.isNotEmpty) {
          await messaging.subscribeToTopic('doctor_$phone');
          await messaging.unsubscribeFromTopic('user_$phone');
        }
      } else {
        if (phone.isNotEmpty) {
          await messaging.subscribeToTopic('user_$phone');
          await messaging.unsubscribeFromTopic('doctor_$phone');
        }
      }

      final token = await messaging.getToken();
      if (token != null && phone.isNotEmpty) {
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
