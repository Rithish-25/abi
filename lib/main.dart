import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
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

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
  ));
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

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final showNav = _tabRootScreens.contains(app.screen);
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        // Navigate to home screen for both patient and doctor
        if (app.doctorLoggedIn) {
          app.go('doctorDashboard');
        } else {
          app.goTab('home', 'home');
        }
      },
      child: Scaffold(
        body: AnnotatedRegion<SystemUiOverlayStyle>(
          value: const SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
            statusBarBrightness: Brightness.light,
          ),
          child: Column(
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
        ),
      ),
    );
  }
}
