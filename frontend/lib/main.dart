import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'state/app_state.dart';
import 'theme/app_colors.dart';
import 'widgets/bottom_nav_bar.dart';

import 'screens/splash_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/otp_screen.dart';
import 'screens/home_screen.dart';
import 'screens/search_screen.dart';
import 'screens/catalogue_screen.dart';
import 'screens/test_details_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/select_member_screen.dart';
import 'screens/select_address_screen.dart';
import 'screens/booking_summary_screen.dart';
import 'screens/payment_screen.dart';
import 'screens/booking_success_screen.dart';
import 'screens/bookings_screen.dart';
import 'screens/booking_details_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/report_viewer_screen.dart';
import 'screens/records_screen.dart';
import 'screens/upload_record_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/family_members_screen.dart';
import 'screens/saved_addresses_screen.dart';
import 'screens/doctor_login_screen.dart';
import 'screens/doctor_dashboard_screen.dart';
import 'screens/doctor_referral_screen.dart';
import 'screens/referral_success_screen.dart';
import 'screens/doctor_reports_screen.dart';
import 'screens/doctor_commission_screen.dart';
import 'screens/doctor_profile_screen.dart';
import 'screens/registration_screen.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: "assets/.env");
  } catch (e) {
    debugPrint("Failed to load .env file: $e");
  }
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
  ));
  
  try {
    await Firebase.initializeApp(
      options: FirebaseOptions(
        apiKey: dotenv.env['FIREBASE_API_KEY'] ?? '',
        authDomain: dotenv.env['FIREBASE_AUTH_DOMAIN'] ?? '',
        projectId: dotenv.env['FIREBASE_PROJECT_ID'] ?? '',
        storageBucket: dotenv.env['FIREBASE_STORAGE_BUCKET'] ?? '',
        messagingSenderId: dotenv.env['FIREBASE_MESSAGING_SENDER_ID'] ?? '',
        appId: dotenv.env['FIREBASE_APP_ID'] ?? '',
      ),
    );
  } catch (e) {
    debugPrint("Firebase init failed: $e");
  }

  runApp(const AbiramiLabApp());
}

class AbiramiLabApp extends StatelessWidget {
  const AbiramiLabApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(),
      child: MaterialApp(
        title: 'Abirami Laboratory',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          scaffoldBackgroundColor: AppColors.background,
          colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary, primary: AppColors.primary, secondary: AppColors.secondary),
          textTheme: GoogleFonts.outfitTextTheme(),
          fontFamily: GoogleFonts.outfit().fontFamily,
        ),
        home: const AppRoot(),
      ),
    );
  }
}

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  static const _tabRootScreens = {'home', 'reports', 'search', 'bookings', 'records', 'profile', 'doctorDashboard', 'catalogue', 'doctorProfile', 'doctorReferral', 'doctorCommission', 'doctorReports'};

  Widget _buildScreen(String screen) {
    switch (screen) {
      case 'splash':
        return const SplashScreen();
      case 'onboarding':
        return const OnboardingScreen();
      case 'login':
        return const LoginScreen();
      case 'otp':
        return const OtpScreen();
      case 'registration':
        return const RegistrationScreen();
      case 'home':
        return const HomeScreen();
      case 'search':
        return const SearchScreen();
      case 'catalogue':
        return const CatalogueScreen();
      case 'testDetails':
        return const TestDetailsScreen();
      case 'cart':
        return const CartScreen();
      case 'selectMember':
        return const SelectMemberScreen();
      case 'selectAddress':
        return const SelectAddressScreen();
      case 'bookingSummary':
        return const BookingSummaryScreen();
      case 'payment':
        return const PaymentScreen();
      case 'bookingSuccess':
        return const BookingSuccessScreen();
      case 'bookings':
        return const BookingsScreen();
      case 'bookingDetails':
        return const BookingDetailsScreen();
      case 'reports':
        return const ReportsScreen();
      case 'reportViewer':
        return const ReportViewerScreen();
      case 'records':
        return const RecordsScreen();
      case 'uploadRecord':
        return const UploadRecordScreen();
      case 'notifications':
        return const NotificationsScreen();
      case 'profile':
        return const ProfileScreen();
      case 'familyMembers':
        return const FamilyMembersScreen();
      case 'savedAddresses':
        return const SavedAddressesScreen();
      case 'doctorLogin':
        return const DoctorLoginScreen();
      case 'doctorDashboard':
        return const DoctorDashboardScreen();
      case 'doctorReferral':
        return const DoctorReferralScreen();
      case 'referralSuccess':
        return const ReferralSuccessScreen();
      case 'doctorReports':
        return const DoctorReportsScreen();
      case 'doctorCommission':
        return const DoctorCommissionScreen();
      case 'doctorProfile':
        return const DoctorProfileScreen();
      default:
        return const HomeScreen();
    }
  }

  Future<void> _showExitDialog(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Exit App', style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to exit?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Exit', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    if (result == true) {
      SystemNavigator.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isKeyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;
    final showNav = _tabRootScreens.contains(app.screen) && !(app.screen == 'search' && isKeyboardOpen);
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (didPop) return;
        if (app.screen == 'home' || app.screen == 'doctorDashboard') {
          await _showExitDialog(context);
        } else if (app.screen == 'bookings' || app.screen == 'reports' || app.screen == 'records' || app.screen == 'profile') {
          app.goTab('home', 'home');
        } else {
          app.back();
        }
      },
      child: Scaffold(
        body: AnnotatedRegion<SystemUiOverlayStyle>(
          value: const SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
            statusBarBrightness: Brightness.light,
          ),
          child: Stack(
            children: [
              Column(
                children: [
                  Expanded(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      transitionBuilder: (child, animation) {
                        final offsetAnimation = Tween<Offset>(
                          begin: const Offset(0.08, 0.0),
                          end: Offset.zero,
                        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
                        return SlideTransition(
                          position: offsetAnimation,
                          child: FadeTransition(
                            opacity: animation,
                            child: child,
                          ),
                        );
                      },
                      child: KeyedSubtree(key: ValueKey(app.screen), child: _buildScreen(app.screen)),
                    ),
                  ),
                  if (showNav) const BottomNavBar(),
                ],
              ),
              // Floating headset & WhatsApp support buttons (User module pages only)
              if (app.activeTab != 'doctor' &&
                  !['splash', 'onboarding', 'login', 'doctorLogin', 'otp', 'registration'].contains(app.screen) &&
                  !isKeyboardOpen)
                Positioned(
                  right: 16,
                  bottom: 96, // Positioned at a consistent height above bottom bars to prevent content overlap
                  child: Column(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.4),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            )
                          ],
                        ),
                        child: const Icon(Icons.headset_mic, color: Colors.white, size: 20),
                      ),
                      if (app.screen == 'home' || app.screen == 'profile') ...[
                        const SizedBox(height: 12),
                        Container(
                          width: 44,
                          height: 44,
                          decoration: const BoxDecoration(
                            color: Color(0xFF25D366),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Color(0x6625D366),
                                blurRadius: 20,
                                offset: Offset(0, 8),
                              )
                            ],
                          ),
                          child: const Icon(FontAwesomeIcons.whatsapp, color: Colors.white, size: 20),
                        ),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
