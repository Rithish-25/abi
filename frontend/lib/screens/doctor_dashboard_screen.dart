import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/status_badge.dart';

class DoctorDashboardScreen extends StatelessWidget {
  const DoctorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 96),
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 32),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.secondary, Color(0xFF0D9488)],
              ),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Welcome,',
                            style: TextStyle(
                                color: Color(0xA6FFFFFF),
                                fontSize: 12,
                                fontWeight: FontWeight.w500)),
                        SizedBox(height: 2),
                        Text(app.doctorDisplayName,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
                    InkWell(
                      onTap: () => app.go('notifications'),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12)),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            const Icon(Icons.notifications_none,
                                color: Colors.white, size: 20),
                            if (app.notifications.isNotEmpty)
                              Positioned(
                                top: 4,
                                right: 4,
                                child: Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: const BoxDecoration(
                                    color: AppColors.danger,
                                    shape: BoxShape.circle,
                                  ),
                                  constraints: const BoxConstraints(
                                    minWidth: 14,
                                    minHeight: 14,
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${app.notifications.length}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 7.5,
                                        fontWeight: FontWeight.bold,
                                        height: 1.0,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(children: [
                  Expanded(
                      child: _StatBox(
                          label: 'Referrals',
                          value: '${app.doctorPatients.length}')),
                  const SizedBox(width: 12),
                  Expanded(
                      child: _StatBox(
                          label: 'This month',
                          value: '₹${app.doctorCommissionTotal}')),
                ]),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Expanded(
                      child: _ActionCard(
                          label: 'New Referral',
                          icon: Icons.add_circle_outline,
                          bg: AppColors.secondaryTint,
                          color: AppColors.secondary,
                          onTap: () => app.go('doctorReferral'))),
                  const SizedBox(width: 12),
                  Expanded(
                      child: _ActionCard(
                          label: 'Reports',
                          icon: Icons.assignment_outlined,
                          bg: AppColors.primaryTint,
                          color: AppColors.primary,
                          onTap: () => app.go('doctorReports'))),
                  const SizedBox(width: 12),
                  Expanded(
                      child: _ActionCard(
                          label: 'Earnings',
                          icon: Icons.account_balance_wallet_outlined,
                          bg: AppColors.warningTint,
                          color: AppColors.warning,
                          onTap: () => app.go('doctorCommission'))),
                ]),
                const SizedBox(height: 28),
                Text('Recent patients',
                    style: AppTextStyles.h3.copyWith(fontSize: 16)),
                const SizedBox(height: 14),
                ...app.doctorPatients.map((p) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(p.name,
                                      style: AppTextStyles.bodyBold.copyWith(
                                          fontSize: 14,
                                          color: AppColors.textPrimary)),
                                  StatusBadge(p.status),
                                ]),
                            const SizedBox(height: 6),
                            Text('${p.testSummary} · ${p.date}',
                                style: AppTextStyles.bodySmall.copyWith(
                                    fontSize: 12,
                                    color: AppColors.textSecondary)),
                          ]),
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  const _StatBox({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(14)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label,
              style: const TextStyle(color: Color(0x99FFFFFF), fontSize: 11)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700)),
        ]),
      );
}

class _ActionCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color bg;
  final Color color;
  final VoidCallback onTap;
  const _ActionCard(
      {required this.label,
      required this.icon,
      required this.bg,
      required this.color,
      required this.onTap});
  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16)),
          child: Column(children: [
            Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                    color: bg, borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: color, size: 18)),
            const SizedBox(height: 8),
            Text(label,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary),
                textAlign: TextAlign.center),
          ]),
        ),
      );
}
