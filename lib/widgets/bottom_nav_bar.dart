import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';

class BottomNavBar extends StatelessWidget {
  const BottomNavBar({super.key});

  bool _isTabActive(String tabKey, String screenKey, bool isDoctor) {
    if (isDoctor) {
      return screenKey == tabKey;
    }
    // Patient active tab mapping:
    if (tabKey == 'home' && screenKey == 'home') return true;
    if (tabKey == 'catalogue' && (screenKey == 'catalogue' || screenKey == 'search' || screenKey == 'testDetails')) return true;
    if (tabKey == 'bookings' && (screenKey == 'bookings' || screenKey == 'bookingDetails')) return true;
    if (tabKey == 'reports' && (screenKey == 'reports' || screenKey == 'reportViewer')) return true;
    if (tabKey == 'profile' && screenKey == 'profile') return true;
    return false;
  }

  Widget _buildIcon(String key, bool active) {
    const activeColor = Color(0xFF15803D); // Forest green active color
    const inactiveColor = Color(0xFF64748B); // Slate grey inactive color
    final color = active ? activeColor : inactiveColor;

    switch (key) {
      // Patient tabs
      case 'home':
        return Icon(active ? Icons.home : Icons.home_outlined, color: color, size: 22);
      case 'catalogue': // Tests tab
        return Icon(active ? Icons.water_drop : Icons.water_drop_outlined, color: color, size: 22);
      case 'bookings': // Track tab
        return Icon(active ? Icons.calendar_month : Icons.calendar_month_outlined, color: color, size: 22);
      case 'reports': // Reports tab
        return Icon(active ? Icons.assignment : Icons.assignment_outlined, color: color, size: 22);
      case 'profile': // Profile tab
        return Icon(active ? Icons.person : Icons.person_outline_rounded, color: color, size: 22);

      // Doctor tabs
      case 'doctorDashboard':
        return Icon(active ? Icons.dashboard : Icons.dashboard_outlined, color: color, size: 22);
      case 'doctorReferral':
        return Icon(active ? Icons.add_circle : Icons.add_circle_outline, color: color, size: 22);
      case 'doctorReports':
        return Icon(active ? Icons.assignment : Icons.assignment_outlined, color: color, size: 22);
      case 'doctorCommission':
        return Icon(active ? Icons.payments : Icons.payments_outlined, color: color, size: 22);
      case 'doctorProfile':
        return Icon(active ? Icons.person : Icons.person_outline_rounded, color: color, size: 22);

      default:
        return Icon(Icons.circle, color: color, size: 22);
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isDoctor = app.activeTab == 'doctor';
    final tabs = isDoctor
        ? const [
            _NavTab('doctorDashboard', 'Dashboard'),
            _NavTab('doctorReferral', 'Refer'),
            _NavTab('doctorReports', 'Reports'),
            _NavTab('doctorCommission', 'Earnings'),
            _NavTab('doctorProfile', 'Profile'),
          ]
        : const [
            _NavTab('home', 'Home'),
            _NavTab('catalogue', 'Tests'),
            _NavTab('bookings', 'Bookings'),
            _NavTab('reports', 'Reports'),
            _NavTab('profile', 'Profile'),
          ];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      height: 72,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(36),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: tabs.map((t) {
          final active = _isTabActive(t.key, app.screen, isDoctor);
          final labelColor = active ? const Color(0xFF15803D) : const Color(0xFF64748B);

          return Expanded(
            child: Align(
              alignment: Alignment.center,
              child: InkWell(
                onTap: () {
                  app.goTab(isDoctor ? 'doctor' : t.key, t.key);
                },
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: active ? const Color(0xFF15803D) : Colors.transparent,
                      width: 1.2,
                    ),
                    color: active ? const Color(0xFF15803D).withOpacity(0.04) : Colors.transparent,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildIcon(t.key, active),
                      const SizedBox(height: 2),
                      Text(
                        t.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                          color: labelColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _NavTab {
  final String key;
  final String label;
  const _NavTab(this.key, this.label);
}
