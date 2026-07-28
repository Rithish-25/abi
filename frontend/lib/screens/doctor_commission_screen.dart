import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';

class DoctorCommissionScreen extends StatelessWidget {
  const DoctorCommissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Commission', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 96),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.secondary, Color(0xFF0D9488)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Total earned this month', style: TextStyle(color: Color(0xA6FFFFFF), fontSize: 12, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    Text('₹${app.doctorCommissionTotal}', style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 14),
                    Row(children: [
                      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Paid out', style: TextStyle(color: Color(0x99FFFFFF), fontSize: 11)),
                        Text('₹${app.doctorCommissionPaid}', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                      ]),
                      const SizedBox(width: 28),
                      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Pending', style: TextStyle(color: Color(0x99FFFFFF), fontSize: 11)),
                        Text('₹${app.doctorCommissionPending}', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                      ]),
                    ]),
                  ]),
                ),
                const SizedBox(height: 24),
                const Text('TRANSACTIONS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5)),
                const SizedBox(height: 12),
                ...app.doctorPatients.map((p) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.015),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(p.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 13.5, color: AppColors.textPrimary)),
                          const SizedBox(height: 3),
                          Text('${p.date} · ${p.status}', style: AppTextStyles.caption.copyWith(fontSize: 11.5, color: AppColors.textSecondary)),
                        ]),
                        Text('+₹${p.commission}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.success)),
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
