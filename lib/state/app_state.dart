import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/mock_data.dart';
import '../models/models.dart';

class AppState extends ChangeNotifier {
  String screen = 'splash';
  final List<String> history = [];
  bool _isLoggedIn = false;
  bool _isDoctor = false;
  String _savedPhone = '';

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
      if (_isLoggedIn) {
        phone = _savedPhone;
        doctorLoggedIn = _isDoctor;
        if (_isDoctor) {
          doctorPhone = _savedPhone;
          activeTab = 'doctor';
        } else {
          activeTab = 'home';
        }
      } else {
        phone = '';
        doctorLoggedIn = false;
        doctorPhone = '';
        activeTab = 'home';
      }
      notifyListeners();
    } catch (e) {
      // ignore
    }
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

  Future<void> _saveLoginState(bool loggedIn, bool isDoc, String phoneNum) async {
    _isLoggedIn = loggedIn;
    _isDoctor = isDoc;
    _savedPhone = phoneNum;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', loggedIn);
      await prefs.setBool('is_doctor', isDoc);
      await prefs.setString('user_phone', phoneNum);
    } catch (e) {
      // ignore
    }
  }
  String activeTab = 'home';

  // auth
  String phone = '';
  List<String> otp = ['', '', '', ''];
  bool phoneError = false;
  bool otpError = false;
  String doctorPhone = '';
  bool doctorLoggedIn = false;
  bool doctorPhoneError = false;

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
  int selectedMemberId = 1;
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
  late List<AppNotification> notifications = MockData.seedNotifications();

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
    notifyListeners();
  }

  void back() {
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
      await _saveLoginState(true, false, phone);
      goTab('home', 'home');
    } else {
      otpError = true;
      notifyListeners();
    }
  }

  void goDoctorLogin() => go('doctorLogin');
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
    if (doctorPhone.length != 10 || doctorPhone.startsWith('0')) {
      doctorPhoneError = true;
      notifyListeners();
      return;
    }
    doctorLoggedIn = true;
    activeTab = 'doctor';
    history.clear();
    screen = 'doctorDashboard';
    await _saveLoginState(true, true, doctorPhone);
    notifyListeners();
  }

  Future<void> logout() async {
    await _saveLoginState(false, false, '');
    screen = 'login';
    activeTab = 'home';
    history.clear();
    phone = '';
    doctorPhone = '';
    doctorLoggedIn = false;
    doctorPhoneError = false;
    phoneError = false;
    otp = ['', '', '', ''];
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
    return MockData.allItems.where((t) {
      final matchSearch = search.isEmpty || t.name.toLowerCase().contains(search.toLowerCase());
      final matchFilter = selectedFilter == 'all' ||
          (selectedFilter == 'tests' && !t.isPackage) ||
          (selectedFilter == 'packages' && t.isPackage);
      return matchSearch && matchFilter;
    }).toList();
  }

  BloodTest get selectedTest => selectedTestId == null ? MockData.tests.first : MockData.findById(selectedTestId!);

  // ----- cart -----
  void addToCart(String id) {
    if (!cart.contains(id)) cart.add(id);
    notifyListeners();
  }

  void removeFromCart(String id) {
    cart.remove(id);
    notifyListeners();
  }

  List<BloodTest> get cartItems => cart.map(MockData.findById).toList();
  int get cartTotal => cartItems.fold(0, (a, c) => a + c.price);
  int get cartMrpTotal => cartItems.fold(0, (a, c) => a + c.mrp);
  int get cartSavings => cartMrpTotal - cartTotal;

  // ----- family / address -----
  void selectMember(int id) {
    selectedMemberId = id;
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

  void addFamilyMember(String name, String relation, String age, String gender) {
    if (name.trim().isEmpty) return;
    final id = family.map((m) => m.id).reduce((a, b) => a > b ? a : b) + 1;
    family.add(FamilyMember(id: id, name: name, relation: relation, age: age.isEmpty ? '-' : age, gender: gender));
    selectedMemberId = id;
    showAddMember = false;
    notifyListeners();
  }

  void toggleAddAddress() {
    showAddAddress = !showAddAddress;
    notifyListeners();
  }

  void addAddress(String label, String line, String phoneNo) {
    if (line.trim().isEmpty) return;
    final id = addresses.map((a) => a.id).reduce((a, b) => a > b ? a : b) + 1;
    addresses.add(SavedAddress(id: id, label: label, line: line, phone: phoneNo.isEmpty ? '9894913330' : phoneNo));
    selectedAddressId = id;
    showAddAddress = false;
    notifyListeners();
  }

  FamilyMember get selectedMember => family.firstWhere((m) => m.id == selectedMemberId, orElse: () => family.first);
  SavedAddress get selectedAddress => addresses.firstWhere((a) => a.id == selectedAddressId, orElse: () => addresses.first);

  // ----- booking -----
  void confirmBooking() {
    final items = cartItems;
    final total = items.fold(0, (a, c) => a + c.price);
    final id = 'AB' + (2300 + bookings.length + (DateTime.now().millisecond % 90)).toString();
    bookings.insert(
      0,
      Booking(
        id: id,
        date: '23/07/2026',
        testNames: items.map((c) => c.name).toList(),
        member: selectedMember.name,
        status: 'Confirmed',
        amount: total,
        address: selectedAddress.line,
        slot: '24/07/2026, 7:30 AM',
      ),
    );
    lastBookingId = id;
    cart.clear();
    history.clear();
    screen = 'bookingSuccess';
    notifyListeners();
  }

  void openBooking(String id) {
    selectedBookingId = id;
    go('bookingDetails');
  }

  Booking get selectedBookingObj => bookings.firstWhere((b) => b.id == selectedBookingId, orElse: () => bookings.first);

  void openReport(String id) {
    selectedReportId = id;
    go('reportViewer');
  }

  void openBookingReport() {
    selectedReportId = selectedBookingId;
    go('reportViewer');
  }

  LabReport get selectedReportObj =>
      reports.firstWhere((r) => r.id == selectedReportId, orElse: () => reports.first);

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
    final id = records.isEmpty ? 1 : records.map((r) => r.id).reduce((a, b) => a > b ? a : b) + 1;
    records.insert(0, MedicalRecord(id: id, type: uploadMode ?? 'report', title: title.isEmpty ? 'Untitled record' : title, date: '23/07/2026'));
    goTab('records', 'records');
  }

  void markNotifRead() {
    for (final n in notifications) {
      n.read = true;
    }
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
    final items = refTests.map(MockData.findById).toList();
    final commission = (items.fold(0, (a, c) => a + c.price) * 0.1).round();
    final id = doctorPatients.isEmpty ? 1 : doctorPatients.map((p) => p.id).reduce((a, b) => a > b ? a : b) + 1;
    doctorPatients.insert(
      0,
      DoctorPatient(
        id: id,
        name: refPatientName,
        phone: refPatientPhone,
        tests: items.map((t) => t.name).toList(),
        date: '23/07/2026',
        status: 'Confirmed',
        commission: commission,
      ),
    );
    refPatientName = '';
    refPatientPhone = '';
    refTests.clear();
    history.clear();
    screen = 'referralSuccess';
    notifyListeners();
  }

  int get doctorCommissionTotal => doctorPatients.fold(0, (a, p) => a + p.commission);
  int get doctorCommissionPaid => (doctorCommissionTotal * 0.75).round();
  int get doctorCommissionPending => doctorCommissionTotal - doctorCommissionPaid;

  void setDemoState(String s) {
    demoState = s;
    notifyListeners();
  }
}
