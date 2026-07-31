import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';
import '../data/mock_data.dart';
import '../models/models.dart';

class AppState extends ChangeNotifier {
  String screen = 'splash';
  final List<String> history = [];
  bool _isLoggedIn = false;
  bool _isDoctor = false;
  String _savedPhone = '';
  String _savedDoctorName = '';

  List<BloodTest> _dbTests = [];
  Map<String, List<ReportRow>> _dbReportRows = {};
  StreamSubscription<QuerySnapshot>? _notifSub;
  DateTime? doctorSessionStart;

  String supportPhone = '9894913330';
  String labBrandingName = 'Abirami Laboratory';
  int homeCollectionFee = 150;
  bool enableTechnicianLogistics = true;

  AppState() {
    phone = '';
    doctorLoggedIn = false;
    doctorPhone = '';
    activeTab = 'home';
    _init();
  }

  Future<void> _init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isLoggedIn = prefs.getBool('is_logged_in') ?? false;
      _savedPhone = prefs.getString('user_phone') ?? '';
      _isDoctor = prefs.getBool('is_doctor') ?? false;
      _savedDoctorName = prefs.getString('doctor_name') ?? '';

      // Load cart items
      final savedCart = prefs.getStringList('cart_items');
      if (savedCart != null) {
        cart.clear();
        cart.addAll(savedCart);
      }

      // Load notifications
      final savedNotifsStr = prefs.getString('notifications_list');
      if (savedNotifsStr != null) {
        final List<dynamic> decoded = jsonDecode(savedNotifsStr);
        notifications = decoded
            .map((item) =>
                AppNotification.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        notifications = [];
      }

      // Trigger basic Firestore listeners for everyone
      _setupCatalogListener();
      _setupGlobalNotificationsListener();
      _setupSettingsListener();

      if (_isLoggedIn) {
        phone = _savedPhone;
        doctorLoggedIn = _isDoctor;
        if (_isDoctor) {
          doctorPhone = _savedPhone;
          doctorName = _savedDoctorName;
          activeTab = 'doctor';
          doctorPatients = [];
          doctorSessionStart = DateTime.now();
        } else {
          activeTab = 'home';
        }
        _setupListenersForUser();
      } else {
        phone = '';
        doctorLoggedIn = false;
        doctorPhone = '';
        doctorName = '';
        activeTab = 'home';
      }
      notifyListeners();
    } catch (e) {
      notifications = [];
    }
  }

  void _setupCatalogListener() {
    try {
      FirebaseFirestore.instance.collection('tests').snapshots().listen(
          (snapshot) {
        final List<BloodTest> loadedTests = [];
        for (var doc in snapshot.docs) {
          final data = doc.data();
          loadedTests.add(BloodTest(
            id: doc.id,
            name: data['name'] ?? '',
            short: data['short'] ?? '',
            desc: data['desc'] ?? '',
            price: data['price'] ?? 0,
            mrp: data['mrp'] ?? 0,
            fasting: data['fasting'] ?? false,
            sample: data['sample'] ?? '',
            report: data['report'] ?? '',
            prep: data['prep'] ?? '',
            image: data['image'] ?? '',
            isPackage: data['isPackage'] ?? false,
            includedTestIds: data['includedTestIds'] != null
                ? List<String>.from(data['includedTestIds'])
                : [],
          ));
        }
        if (loadedTests.isNotEmpty) {
          _dbTests = loadedTests;
          notifyListeners();
        }
      }, onError: (err) {
        debugPrint("Catalog listener error: $err");
      });
    } catch (e) {
      debugPrint("Firestore catalog connection failed: $e");
    }
  }

  void _setupSettingsListener() {
    try {
      FirebaseFirestore.instance.collection('settings').doc('global').snapshots().listen((snapshot) {
        if (snapshot.exists) {
          final data = snapshot.data();
          if (data != null) {
            if (data['labPhone'] != null) {
              supportPhone = data['labPhone'].toString();
            }
            if (data['labName'] != null) {
              labBrandingName = data['labName'].toString();
            }
            if (data['collectionFee'] != null) {
              homeCollectionFee = (data['collectionFee'] as num).toInt();
            }
            if (data['enableTechnicianLogistics'] != null) {
              enableTechnicianLogistics = data['enableTechnicianLogistics'] as bool;
            }
            notifyListeners();
          }
        }
      }, onError: (err) => debugPrint("Settings listener error: $err"));
    } catch (_) {}
  }

  void _setupGlobalNotificationsListener() {
    try {
      _notifSub?.cancel();
      _notifSub = FirebaseFirestore.instance.collection('notifications').snapshots().listen(
          (snapshot) {
        final List<AppNotification> loadedNotifs = [];
        final activePhone = doctorLoggedIn ? doctorPhone : phone;
        for (var doc in snapshot.docs) {
          final data = doc.data();
          final targetType = data['targetType'] ?? 'all_users';
          final targetPhone = data['targetPhone'] ?? '';
          final targetRole = (data['targetRole'] ?? '').toString();
          final roleMatchesSession = targetRole.isEmpty ||
              (doctorLoggedIn && targetRole == 'doctor') ||
              (!doctorLoggedIn && targetRole == 'user');

          final String notifTimeStr = data['timestamp'] ?? '';
          bool isFresh = true;
          if (doctorLoggedIn && doctorSessionStart != null && notifTimeStr.isNotEmpty) {
            try {
              final notifTime = DateTime.parse(notifTimeStr);
              if (notifTime.isBefore(doctorSessionStart!)) {
                isFresh = false;
              }
            } catch (_) {}
          }

          final appliesToCurrentSession = isFresh && (
              (targetType == 'all_users' && !doctorLoggedIn) ||
                  (targetType == 'all_doctors' && doctorLoggedIn) ||
                  (targetType == 'specific' &&
                      targetPhone == activePhone &&
                      roleMatchesSession)
          );

          if (appliesToCurrentSession) {
            loadedNotifs.add(AppNotification(
              id: loadedNotifs.length + 1,
              kind: _notificationKindFromData(data),
              title: data['title'] ?? '',
              body: data['body'] ?? '',
              time: data['dateString'] ?? 'Just now',
              read: false,
            ));
          }
        }
        notifications = loadedNotifs;
        notifyListeners();
      }, onError: (err) => debugPrint("Notifications listener error: $err"));
    } catch (_) {}
  }

  String _notificationKindFromData(Map<String, dynamic> data) {
    final explicitKind = (data['kind'] ?? '').toString().trim();
    if (explicitKind.isNotEmpty) return explicitKind;

    final content =
        '${data['title'] ?? ''} ${data['body'] ?? ''}'.toLowerCase();
    if (content.contains('report')) return 'report';
    if (content.contains('sample')) return 'truck';
    if (content.contains('booking') || content.contains('appointment')) {
      return 'check';
    }
    return 'offer';
  }

  void _setupListenersForUser() {
    if (phone.isEmpty && doctorPhone.isEmpty) return;

    final targetPhone = doctorLoggedIn ? doctorPhone : phone;

    // Auto-claim seed bookings for this user session in Firestore
    try {
      final List<String> seedDocIds = ['AB2314', 'AB2298', 'AB2276', 'AB2250'];
      for (var docId in seedDocIds) {
        FirebaseFirestore.instance
            .collection('bookings')
            .doc(docId)
            .get()
            .then((docSnap) {
          if (docSnap.exists) {
            final data = docSnap.data();
            if (data != null && data['userId'] != targetPhone) {
              debugPrint(
                  "LOG CLAIM BOOKING: claiming $docId for user $targetPhone");
              FirebaseFirestore.instance
                  .collection('bookings')
                  .doc(docId)
                  .update({'userId': targetPhone});
            } else {
              debugPrint(
                  "LOG CLAIM BOOKING: $docId already claimed by $targetPhone");
            }
          } else {
            debugPrint(
                "LOG CLAIM BOOKING: $docId does not exist in Firestore yet");
          }
        });
      }
    } catch (e) {
      debugPrint("LOG CLAIM BOOKING ERROR: $e");
    }

    // 1. Listen to user bookings
    try {
      FirebaseFirestore.instance
          .collection('bookings')
          .where('userId', isEqualTo: targetPhone)
          .snapshots()
          .listen((snapshot) {
        debugPrint(
            "LOG BOOKINGS TRIGGERED: targetPhone=$targetPhone, docCount=${snapshot.docs.length}");
        final List<Booking> loadedBookings = [];
        for (var doc in snapshot.docs) {
          final data = doc.data();
          debugPrint(
              "LOG BOOKING: id=${doc.id}, status=${data['status']}, userId=${data['userId']}");
          String status = data['status'] ?? 'Confirmed';
          if (status == 'Reports Ready') {
            status = 'Report Ready';
          }
          loadedBookings.add(Booking(
            id: doc.id,
            date: data['date'] ?? '',
            testNames: data['testNames'] != null
                ? List<String>.from(data['testNames'])
                : [],
            member: data['member'] ?? '',
            status: status,
            amount: data['amount'] ?? 0,
            address: data['address'] ?? '',
            slot: data['slot'] ?? '',
          ));
        }
        bookings = loadedBookings;
        notifyListeners();
      });
    } catch (_) {}

    // 2. Listen to diagnostic reports
    try {
      FirebaseFirestore.instance
          .collection('reports')
          .snapshots()
          .listen((snapshot) {
        final List<LabReport> loadedReports = [];
        final Map<String, List<ReportRow>> loadedRows = {};
        for (var doc in snapshot.docs) {
          final data = doc.data();
          final String reportId = doc.id;

          // Only load reports for the logged in user or their family member
          final memberName = data['member'] ?? '';

          loadedReports.add(LabReport(
            id: reportId,
            name: data['name'] ?? '',
            date: data['date'] ?? '',
            member: memberName,
            status: data['status'] ?? 'Report Ready',
          ));

          final List<dynamic>? rawRows = data['rows'];
          if (rawRows != null) {
            loadedRows[reportId] = rawRows.map((item) {
              final rowMap = item as Map<String, dynamic>;
              return ReportRow(
                name: rowMap['name'] ?? '',
                value: rowMap['value'] ?? '',
                range: rowMap['range'] ?? '',
                abnormal: rowMap['abnormal'] ?? false,
              );
            }).toList();
          }
        }
        if (loadedReports.isNotEmpty) {
          reports = loadedReports;
          _dbReportRows = loadedRows;
          notifyListeners();
        }
      });
    } catch (_) {}

    // 3. Listen to family members
    try {
      FirebaseFirestore.instance
          .collection('users')
          .doc(targetPhone)
          .collection('family')
          .snapshots()
          .listen((snapshot) async {
        if (snapshot.docs.isEmpty) {
          final colRef = FirebaseFirestore.instance
              .collection('users')
              .doc(targetPhone)
              .collection('family');
          await colRef.doc('1').set({
            'id': 1,
            'name': userName,
            'relation': 'Self',
            'age': '34',
            'gender': 'Male',
          });
          await colRef.doc('2').set({
            'id': 2,
            'name': 'Meena Karthik',
            'relation': 'Wife',
            'age': '31',
            'gender': 'Female',
          });
          await colRef.doc('3').set({
            'id': 3,
            'name': 'Aadhira',
            'relation': 'Daughter',
            'age': '6',
            'gender': 'Female',
          });
          return;
        }
        final List<FamilyMember> loaded = [];
        for (var doc in snapshot.docs) {
          final data = doc.data();
          loaded.add(FamilyMember(
            id: data['id'] ?? 0,
            name: data['name'] ?? '',
            relation: data['relation'] ?? '',
            age: data['age'] ?? '',
            gender: data['gender'] ?? '',
          ));
        }
        loaded.sort((a, b) => a.id.compareTo(b.id));
        family = loaded;
        notifyListeners();
      });
    } catch (_) {}

    // 4. Listen to saved addresses
    try {
      FirebaseFirestore.instance
          .collection('users')
          .doc(targetPhone)
          .collection('addresses')
          .snapshots()
          .listen((snapshot) async {
        if (snapshot.docs.isEmpty) {
          final colRef = FirebaseFirestore.instance
              .collection('users')
              .doc(targetPhone)
              .collection('addresses');
          await colRef.doc('1').set({
            'id': 1,
            'label': 'Home',
            'line': '12, Bharathi Street, Thindal, Erode - 638012',
            'phone': targetPhone,
          });
          await colRef.doc('2').set({
            'id': 2,
            'label': 'Work',
            'line': '45, Perundurai Road, Erode - 638011',
            'phone': targetPhone,
          });
          return;
        }
        final List<SavedAddress> loaded = [];
        for (var doc in snapshot.docs) {
          final data = doc.data();
          loaded.add(SavedAddress(
            id: data['id'] ?? 0,
            label: data['label'] ?? '',
            line: data['line'] ?? '',
            phone: data['phone'] ?? '',
          ));
        }
        loaded.sort((a, b) => a.id.compareTo(b.id));
        addresses = loaded;
        notifyListeners();
      });
    } catch (_) {}

    // 5. Listen to doctor patient referrals (if doctor)
    if (doctorLoggedIn) {
      try {
        FirebaseFirestore.instance
            .collection('doctors')
            .doc(doctorPhone)
            .collection('patients')
            .snapshots()
            .listen((snapshot) {
          final List<DoctorPatient> loaded = [];
          for (var doc in snapshot.docs) {
            final data = doc.data();
            loaded.add(DoctorPatient(
              id: data['id'] ?? 0,
              name: data['name'] ?? '',
              phone: data['phone'] ?? '',
              tests:
                  data['tests'] != null ? List<String>.from(data['tests']) : [],
              date: data['date'] ?? '',
              status: data['status'] ?? 'Confirmed',
              commission: data['commission'] ?? 0,
            ));
          }
          doctorPatients = loaded;
          notifyListeners();
        });
      } catch (_) {}
    }

    // 6. Listen to user profile (to sync userName dynamically)
    try {
      FirebaseFirestore.instance
          .collection('users')
          .doc(targetPhone)
          .snapshots()
          .listen((snapshot) {
        if (snapshot.exists) {
          final data = snapshot.data();
          if (data != null && data['name'] != null) {
            final String dbName = data['name'] as String;
            userName = dbName;
            notifyListeners();

            // Sync Self family member doc '1' in lockstep
            FirebaseFirestore.instance
                .collection('users')
                .doc(targetPhone)
                .collection('family')
                .doc('1')
                .set({
              'id': 1,
              'name': dbName,
              'relation': 'Self',
              'age': '34',
              'gender': 'Male',
            }, SetOptions(merge: true));
          }
        }
      });
    } catch (_) {}
  }

  Future<void> _saveCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('cart_items', cart);
    } catch (_) {}
  }

  Future<void> _saveNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<Map<String, dynamic>> encoded =
          notifications.map((n) => n.toJson()).toList();
      await prefs.setString('notifications_list', jsonEncode(encoded));
    } catch (_) {}
  }

  void goNextFromSplash() {
    if (_isLoggedIn) {
      if (_isDoctor) {
        goTab('doctor', 'doctorDashboard');
      } else {
        goTab('home', 'home');
      }
    } else {
      goOnboarding();
    }
  }

  Future<void> _saveLoginState(bool loggedIn, bool isDoc, String phoneNum,
      {String? savedDoctorName}) async {
    _isLoggedIn = loggedIn;
    _isDoctor = isDoc;
    _savedPhone = phoneNum;
    _savedDoctorName = savedDoctorName ?? '';
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', loggedIn);
      await prefs.setBool('is_doctor', isDoc);
      await prefs.setString('user_phone', phoneNum);
      if (isDoc && _savedDoctorName.isNotEmpty) {
        await prefs.setString('doctor_name', _savedDoctorName);
      } else {
        await prefs.remove('doctor_name');
      }
    } catch (_) {}
  }

  String activeTab = 'home';

  // auth
  String phone = '';
  String userName = 'Karthik Raja';
  List<String> otp = ['', '', '', ''];
  bool phoneError = false;
  bool otpError = false;
  String doctorPhone = '';
  bool doctorLoggedIn = false;
  String doctorName = '';
  bool doctorNameError = false;
  bool doctorPhoneError = false;
  String get doctorDisplayName {
    final trimmed = doctorName.trim();
    if (trimmed.isEmpty) return 'Dr. Senthil Kumar';
    final normalized = trimmed.toLowerCase();
    if (normalized.startsWith('dr.') || normalized.startsWith('dr ')) {
      return trimmed;
    }
    return 'Dr. $trimmed';
  }

  // onboarding
  int obIndex = 0;
  final List<Map<String, String>> onboarding = const [
    {'image': 'assets/board1.jpg'},
    {'image': 'assets/board2.jpg'},
    {'image': 'assets/board3.jpg'},
  ];

  // catalogue / search
  String search = '';
  String selectedFilter = 'all'; // all | tests | packages
  String? selectedTestId;

  // cart
  final List<String> cart = [];

  // booking flow
  late List<FamilyMember> family = MockData.seedFamily();
  late List<SavedAddress> addresses = MockData.seedAddresses();
  List<int> selectedMemberIds = [1];
  int selectedAddressId = 1;
  String paymentMethod = 'upi';
  String? lastBookingId;
  bool showAddMember = false;
  bool showAddAddress = false;

  late List<Booking> bookings = MockData.seedBookings();
  String? selectedBookingId;
  late List<LabReport> reports = MockData.seedReports();
  String? selectedReportId;
  String reportSearch = '';
  String reportFilter = 'all'; // all | completed | pending
  late List<MedicalRecord> records = MockData.seedRecords();
  String? uploadMode;
  List<AppNotification> notifications = [];

  // doctor
  late List<DoctorPatient> doctorPatients = MockData.seedDoctorPatients();
  String refPatientName = '';
  String refPatientPhone = '';
  final List<String> refTests = [];

  // demo edge states
  String demoState = 'empty';

  // ----- navigation -----
  void go(String s) {
    history.add(screen);
    screen = s;
    notifyListeners();
  }

  void goTab(String tab, String s) {
    activeTab = tab;
    screen = s;
    history.clear();
    search = '';
    notifyListeners();
  }

  void back() {
    if (screen == 'search') {
      search = '';
    }
    if (history.isNotEmpty) {
      screen = history.removeLast();
    } else {
      screen = doctorLoggedIn ? 'doctorDashboard' : 'home';
    }
    notifyListeners();
  }

  // ----- onboarding / auth -----
  void goOnboarding() => go('onboarding');
  void skipOnboarding() => go('login');
  void setObIndex(int index) {
    obIndex = index;
    notifyListeners();
  }

  void nextOnboarding() {
    if (obIndex >= onboarding.length - 1) {
      go('login');
    } else {
      obIndex++;
      notifyListeners();
    }
  }

  void setPhone(String v) {
    var cleaned = v.replaceAll(RegExp(r'[^0-9]'), '');
    while (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
    phone = cleaned;
    phoneError = false;
    notifyListeners();
  }

  void requestOtp() {
    if (phone.length != 10 || phone.startsWith('0')) {
      phoneError = true;
      notifyListeners();
      return;
    }
    otp = ['', '', '', ''];
    otpError = false;
    doctorPhone = '';
    doctorName = '';

    // Generate random 4-digit OTP code and write to Firestore
    final generatedOtp = (1000 + (DateTime.now().millisecond % 9000)).toString();
    try {
      FirebaseFirestore.instance.collection('otp_logs').doc(phone).set({
        'phone': phone,
        'code': generatedOtp,
        'type': 'Patient Login',
        'name': userName.isEmpty ? 'Karthik Raja' : userName,
        'timestamp': FieldValue.serverTimestamp(),
        'status': 'Pending',
      });
    } catch (_) {}

    go('otp');
  }

  void setOtpDigit(int i, String v) {
    v = v.replaceAll(RegExp(r'[^0-9]'), '');
    if (v.length > 1) v = v.substring(0, 1);
    otp[i] = v;
    otpError = false;
    notifyListeners();
  }

  void resendOtp() {
    otp = ['', '', '', ''];
    otpError = false;
    notifyListeners();
  }

  Future<void> verifyOtp() async {
    if (otp.join().length == 4) {
      if (doctorPhone.isNotEmpty && doctorName.isNotEmpty) {
        // Log in as Doctor!
        doctorLoggedIn = true;
        activeTab = 'doctor';
        history.clear();
        screen = 'doctorDashboard';
        doctorPatients = [];
        notifications = [];
        doctorSessionStart = DateTime.now();
        _setupGlobalNotificationsListener();
        await _saveLoginState(true, true, doctorPhone, savedDoctorName: doctorName);

        try {
          FirebaseFirestore.instance.collection('otp_logs').doc(doctorPhone).update({
            'status': 'Verified',
          });
          FirebaseFirestore.instance.collection('users').doc(doctorPhone).set({
            'id': doctorPhone,
            'phone': doctorPhone,
            'name': doctorDisplayName,
            'role': 'doctor',
            'relation': 'Self',
            'age': '45',
            'gender': 'Male',
          }, SetOptions(merge: true));

          FirebaseFirestore.instance.collection('doctors').doc(doctorPhone).set({
            'id': doctorPhone,
            'name': doctorDisplayName,
            'phone': doctorPhone,
            'specialty': 'General Physician',
            'totalReferrals': 0,
            'totalCommission': 0,
          }, SetOptions(merge: true));
        } catch (_) {}
      } else {
        // Log in as Patient!
        try {
          final userSnap = await FirebaseFirestore.instance.collection('users').doc(phone).get();
          if (userSnap.exists) {
            final data = userSnap.data();
            if (data != null && data['name'] != null) {
              userName = data['name'] as String;
            }
            await _saveLoginState(true, false, phone);
            try {
              FirebaseFirestore.instance.collection('otp_logs').doc(phone).update({
                'status': 'Verified',
              });
            } catch (_) {}
            _setupListenersForUser();
            _setupGlobalNotificationsListener();
            goTab('home', 'home');
          } else {
            go('registration');
          }
        } catch (_) {
          await _saveLoginState(true, false, phone);
          _setupListenersForUser();
          _setupGlobalNotificationsListener();
          goTab('home', 'home');
        }
      }
    } else {
      otpError = true;
      notifyListeners();
    }
  }

  Future<void> registerPatient({
    required String name,
    required String age,
    required String gender,
    required String address,
  }) async {
    userName = name;
    await _saveLoginState(true, false, phone);

    try {
      final batch = FirebaseFirestore.instance.batch();
      
      final userDoc = FirebaseFirestore.instance.collection('users').doc(phone);
      batch.set(userDoc, {
        'id': phone,
        'phone': phone,
        'name': name,
        'role': 'user',
        'relation': 'Self',
        'age': age,
        'gender': gender,
      }, SetOptions(merge: true));

      final familyDoc = userDoc.collection('family').doc('1');
      batch.set(familyDoc, {
        'id': 1,
        'name': name,
        'relation': 'Self',
        'age': age,
        'gender': gender,
      }, SetOptions(merge: true));

      final addressDoc = userDoc.collection('addresses').doc('1');
      batch.set(addressDoc, {
        'id': 1,
        'label': 'Home',
        'line': address,
        'phone': phone,
      }, SetOptions(merge: true));

      await batch.commit();

      try {
        FirebaseFirestore.instance.collection('otp_logs').doc(phone).update({
          'status': 'Verified',
        });
      } catch (_) {}
    } catch (_) {}

    _setupListenersForUser();
    _setupGlobalNotificationsListener();
    goTab('home', 'home');
  }

  void goDoctorLogin() => go('doctorLogin');
  void setDoctorName(String v) {
    doctorName = v.replaceAll(RegExp(r'\s+'), ' ').trimLeft();
    doctorNameError = false;
    notifyListeners();
  }

  void setDoctorPhone(String v) {
    var cleaned = v.replaceAll(RegExp(r'[^0-9]'), '');
    while (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
    doctorPhone = cleaned;
    doctorPhoneError = false;
    notifyListeners();
  }

  Future<void> doctorLogin() async {
    if (doctorName.trim().isEmpty) {
      doctorNameError = true;
      notifyListeners();
      return;
    }
    if (doctorPhone.length != 10 || doctorPhone.startsWith('0')) {
      doctorPhoneError = true;
      notifyListeners();
      return;
    }
    otp = ['', '', '', ''];
    otpError = false;
    phone = '';

    // Generate random 4-digit OTP code and write to Firestore
    final generatedOtp = (1000 + (DateTime.now().millisecond % 9000)).toString();
    try {
      FirebaseFirestore.instance.collection('otp_logs').doc(doctorPhone).set({
        'phone': doctorPhone,
        'code': generatedOtp,
        'type': 'Doctor Login',
        'name': doctorDisplayName,
        'timestamp': FieldValue.serverTimestamp(),
        'status': 'Pending',
      });
    } catch (_) {}

    go('otp');
  }

  Future<void> logout() async {
    await _saveLoginState(false, false, '');
    screen = 'login';
    activeTab = 'home';
    history.clear();
    phone = '';
    doctorPhone = '';
    doctorLoggedIn = false;
    doctorName = '';
    doctorNameError = false;
    doctorPhoneError = false;
    phoneError = false;
    otp = ['', '', '', ''];
    notifications = [];
    _setupGlobalNotificationsListener();
    notifyListeners();
  }

  // ----- search / catalogue -----
  void setSearch(String v) {
    search = v;
    notifyListeners();
  }

  void setFilter(String f) {
    selectedFilter = f;
    notifyListeners();
  }

  void openTest(String id) {
    selectedTestId = id;
    go('testDetails');
  }

  List<BloodTest> get filteredItems {
    final list = allItems;
    return list.where((t) {
      final matchSearch =
          search.isEmpty || t.name.toLowerCase().contains(search.toLowerCase());
      final matchFilter = selectedFilter == 'all' ||
          (selectedFilter == 'tests' && !t.isPackage) ||
          (selectedFilter == 'packages' && t.isPackage);
      return matchSearch && matchFilter;
    }).toList();
  }

  BloodTest get selectedTest {
    final list = _dbTests.isNotEmpty ? _dbTests : MockData.tests;
    return selectedTestId == null
        ? list.first
        : list.firstWhere((t) => t.id == selectedTestId,
            orElse: () => list.first);
  }

  // ----- cart -----
  void addToCart(String id) {
    if (!cart.contains(id)) {
      cart.add(id);
      _saveCart();
    }
    notifyListeners();
  }

  void removeFromCart(String id) {
    if (cart.remove(id)) {
      _saveCart();
    }
    notifyListeners();
  }

  List<BloodTest> get cartItems {
    final list = allItems;
    return cart
        .map((id) => list.firstWhere((t) => t.id == id,
            orElse: () => MockData.findById(id)))
        .toList();
  }

  int get cartTotal => cartItems.fold(0, (a, c) => a + c.price);
  int get cartMrpTotal => cartItems.fold(0, (a, c) => a + c.mrp);
  int get cartSavings => cartMrpTotal - cartTotal;

  // ----- family / address -----
  void selectMember(int id) {
    if (selectedMemberIds.contains(id)) {
      if (selectedMemberIds.length > 1) {
        selectedMemberIds.remove(id);
      }
    } else {
      selectedMemberIds.add(id);
    }
    notifyListeners();
  }

  void selectAddress(int id) {
    selectedAddressId = id;
    notifyListeners();
  }

  void setPaymentMethod(String m) {
    paymentMethod = m;
    notifyListeners();
  }

  void toggleAddMember() {
    showAddMember = !showAddMember;
    notifyListeners();
  }

  void addFamilyMember(
      String name, String relation, String age, String gender) {
    if (name.trim().isEmpty) return;
    final id = family.isEmpty
        ? 1
        : family.map((m) => m.id).reduce((a, b) => a > b ? a : b) + 1;
    final newMember = FamilyMember(
        id: id,
        name: name,
        relation: relation,
        age: age.isEmpty ? '-' : age,
        gender: gender);
    family.add(newMember);

    // Save to Firestore subcollection /users/{phone}/family
    final targetPhone = doctorLoggedIn ? doctorPhone : phone;
    if (targetPhone.isNotEmpty) {
      try {
        FirebaseFirestore.instance
            .collection('users')
            .doc(targetPhone)
            .collection('family')
            .doc(id.toString())
            .set({
          'id': id,
          'name': name,
          'relation': relation,
          'age': age.isEmpty ? '-' : age,
          'gender': gender,
        });
      } catch (_) {}
    }

    selectedMemberIds = [id];
    showAddMember = false;
    notifyListeners();
  }

  void toggleAddAddress() {
    showAddAddress = !showAddAddress;
    notifyListeners();
  }

  void addAddress(String label, String line, String phoneNo) {
    if (line.trim().isEmpty) return;
    final id = addresses.isEmpty
        ? 1
        : addresses.map((a) => a.id).reduce((a, b) => a > b ? a : b) + 1;
    final newAddress = SavedAddress(
        id: id,
        label: label,
        line: line,
        phone: phoneNo.isEmpty ? '9894913330' : phoneNo);
    addresses.add(newAddress);

    // Save to Firestore subcollection /users/{phone}/addresses
    final targetPhone = doctorLoggedIn ? doctorPhone : phone;
    if (targetPhone.isNotEmpty) {
      try {
        FirebaseFirestore.instance
            .collection('users')
            .doc(targetPhone)
            .collection('addresses')
            .doc(id.toString())
            .set({
          'id': id,
          'label': label,
          'line': line,
          'phone': newAddress.phone,
        });
      } catch (_) {}
    }

    selectedAddressId = id;
    showAddAddress = false;
    notifyListeners();
  }

  void updateAddress(int id, String label, String line, String phoneNo) {
    if (line.trim().isEmpty) return;

    // Update local list
    final idx = addresses.indexWhere((a) => a.id == id);
    if (idx != -1) {
      addresses[idx] = SavedAddress(
          id: id,
          label: label,
          line: line,
          phone: phoneNo.isEmpty ? '9894913330' : phoneNo);
    }

    // Update in Firestore
    final targetPhone = doctorLoggedIn ? doctorPhone : phone;
    if (targetPhone.isNotEmpty) {
      try {
        FirebaseFirestore.instance
            .collection('users')
            .doc(targetPhone)
            .collection('addresses')
            .doc(id.toString())
            .update({
          'label': label,
          'line': line,
          'phone': phoneNo.isEmpty ? '9894913330' : phoneNo,
        });
      } catch (_) {}
    }

    notifyListeners();
  }

  FamilyMember get selectedMember =>
      family.firstWhere((m) => selectedMemberIds.contains(m.id),
          orElse: () => family.first);

  String get selectedMembersNames {
    final selected = family
        .where((m) => selectedMemberIds.contains(m.id))
        .map((m) => m.name)
        .toList();
    if (selected.isEmpty) return 'No member selected';
    return selected.join(', ');
  }

  SavedAddress get selectedAddress =>
      addresses.firstWhere((a) => a.id == selectedAddressId,
          orElse: () => addresses.first);

  // ----- booking -----
  void confirmBooking() {
    final items = cartItems;
    final total =
        (items.fold(0, (a, c) => a + c.price) * selectedMemberIds.length) + homeCollectionFee;
    final id =
        'AB${2300 + bookings.length + (DateTime.now().millisecond % 90)}';
    final newBooking = Booking(
      id: id,
      date: '23/07/2026',
      testNames: items.map((c) => c.name).toList(),
      member: selectedMembersNames,
      status: 'Confirmed',
      amount: total,
      address: selectedAddress.line,
      slot: '24/07/2026, 7:30 AM',
    );
    bookings.insert(0, newBooking);

    // Save to Firestore bookings collection
    final targetPhone = doctorLoggedIn ? doctorPhone : phone;
    try {
      FirebaseFirestore.instance.collection('bookings').doc(id).set({
        'id': id,
        'date': newBooking.date,
        'testNames': newBooking.testNames,
        'testSummary': newBooking.testSummary,
        'member': newBooking.member,
        'status': newBooking.status,
        'amount': newBooking.amount,
        'address': newBooking.address,
        'slot': newBooking.slot,
        'assignedTech': '',
        'userId': targetPhone,
        'timestamp': FieldValue.serverTimestamp(),
      });
    } catch (_) {}

    lastBookingId = id;
    cart.clear();
    _saveCart();
    history.clear();
    screen = 'bookingSuccess';
    notifyListeners();
  }

  void openBooking(String id) {
    selectedBookingId = id;
    go('bookingDetails');
  }

  Booking get selectedBookingObj =>
      bookings.firstWhere((b) => b.id == selectedBookingId,
          orElse: () => bookings.first);

  void openReport(String id) {
    selectedReportId = id;
    go('reportViewer');
  }

  void openBookingReport() {
    selectedReportId = selectedBookingId;
    go('reportViewer');
  }

  LabReport get selectedReportObj => reports
      .firstWhere((r) => r.id == selectedReportId, orElse: () => reports.first);

  List<ReportRow> getReportRows(String reportId) {
    return _dbReportRows[reportId] ??
        (MockData.reportRows[reportId] ?? MockData.reportRows['AB2314']!);
  }

  void setReportSearch(String v) {
    reportSearch = v;
    notifyListeners();
  }

  void setReportFilter(String f) {
    reportFilter = f;
    notifyListeners();
  }

  List<LabReport> get filteredReports {
    return reports.where((r) {
      final matchSearch = reportSearch.isEmpty ||
          r.name.toLowerCase().contains(reportSearch.toLowerCase()) ||
          r.member.toLowerCase().contains(reportSearch.toLowerCase());
      final matchFilter = reportFilter == 'all' ||
          (reportFilter == 'completed' && r.status == 'Report Ready') ||
          (reportFilter == 'pending' && r.status != 'Report Ready');
      return matchSearch && matchFilter;
    }).toList();
  }

  void setUploadMode(String m) {
    uploadMode = m;
    go('uploadRecord');
  }

  void saveRecord(String title) {
    final id = records.isEmpty
        ? 1
        : records.map((r) => r.id).reduce((a, b) => a > b ? a : b) + 1;
    records.insert(
        0,
        MedicalRecord(
            id: id,
            type: uploadMode ?? 'report',
            title: title.isEmpty ? 'Untitled record' : title,
            date: '23/07/2026'));
    goTab('records', 'records');
  }

  void markNotifRead() {
    for (final n in notifications) {
      n.read = true;
    }
    _saveNotifications();
    notifyListeners();
  }

  // ----- doctor -----
  void toggleRefTest(String id) {
    if (refTests.contains(id)) {
      refTests.remove(id);
    } else {
      refTests.add(id);
    }
    notifyListeners();
  }

  void submitReferral() {
    if (refPatientName.trim().isEmpty || refTests.isEmpty) return;
    final list = allItems;
    final items = refTests
        .map((id) => list.firstWhere((t) => t.id == id,
            orElse: () => MockData.findById(id)))
        .toList();
    final commission = (items.fold(0, (a, c) => a + c.price) * 0.1).round();
    final id = doctorPatients.isEmpty
        ? 1
        : doctorPatients.map((p) => p.id).reduce((a, b) => a > b ? a : b) + 1;

    final newPatient = DoctorPatient(
      id: id,
      name: refPatientName,
      phone: refPatientPhone,
      tests: items.map((t) => t.name).toList(),
      date: '23/07/2026',
      status: 'Confirmed',
      commission: commission,
    );
    doctorPatients.insert(0, newPatient);

    // Save to Firestore under subcollection /doctors/{doctorPhone}/patients
    if (doctorPhone.isNotEmpty) {
      try {
        final docRef =
            FirebaseFirestore.instance.collection('doctors').doc(doctorPhone);

        docRef.collection('patients').doc(id.toString()).set({
          'id': id,
          'name': refPatientName,
          'phone': refPatientPhone,
          'tests': newPatient.tests,
          'date': '23/07/2026',
          'status': 'Confirmed',
          'commission': commission,
        });

        docRef.get().then((docSnap) {
          if (docSnap.exists) {
            final data = docSnap.data() ?? {};
            final currentReferrals = data['totalReferrals'] ?? 0;
            final currentCommission = data['totalCommission'] ?? 0;
            docRef.update({
              'totalReferrals': currentReferrals + 1,
              'totalCommission': currentCommission + commission,
            });
          } else {
            docRef.set({
              'id': doctorPhone,
              'name': doctorDisplayName,
              'phone': doctorPhone,
              'specialty': 'Diabetologist',
              'totalReferrals': 1,
              'totalCommission': commission,
            }, SetOptions(merge: true));
          }
        });
      } catch (_) {}
    }

    refPatientName = '';
    refPatientPhone = '';
    refTests.clear();
    history.clear();
    screen = 'referralSuccess';
    notifyListeners();
  }

  int get doctorCommissionTotal =>
      doctorPatients.fold(0, (a, p) => a + p.commission);
  int get doctorCommissionPaid => (doctorCommissionTotal * 0.75).round();
  int get doctorCommissionPending =>
      doctorCommissionTotal - doctorCommissionPaid;

  List<BloodTest> get bloodTests {
    final list = _dbTests.isNotEmpty ? _dbTests : MockData.tests;
    return list.where((t) => !t.isPackage).toList();
  }

  List<BloodTest> get healthPackages {
    final list = _dbTests.isNotEmpty ? _dbTests : MockData.packages;
    return list.where((t) => t.isPackage).toList();
  }

  List<BloodTest> get allItems {
    final list = _dbTests.isNotEmpty ? _dbTests : MockData.allItems;
    return list.where((t) => !t.isPackage).toList();
  }

  BloodTest findById(String id) {
    final list = _dbTests.isNotEmpty ? _dbTests : MockData.allItems;
    return list.firstWhere((t) => t.id == id,
        orElse: () => MockData.findById(id));
  }

  Future<void> updateUserName(String newName) async {
    if (newName.trim().isEmpty) return;
    userName = newName;
    notifyListeners();

    final targetPhone = doctorLoggedIn ? doctorPhone : phone;
    if (targetPhone.isNotEmpty) {
      try {
        await FirebaseFirestore.instance
            .collection('users')
            .doc(targetPhone)
            .update({
          'name': newName,
        });

        // Update Self family member name as well
        await FirebaseFirestore.instance
            .collection('users')
            .doc(targetPhone)
            .collection('family')
            .doc('1')
            .update({
          'name': newName,
        });
      } catch (_) {}
    }
  }

  void setDemoState(String s) {
    demoState = s;
    notifyListeners();
  }
}
