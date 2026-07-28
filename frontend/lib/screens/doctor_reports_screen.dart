import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/status_badge.dart';
import '../widgets/primary_button.dart';

class DoctorReportsScreen extends StatelessWidget {
  const DoctorReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Patient Reports', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 96),
              children: app.doctorPatients.map((p) {
                final ready = p.status == 'Report Ready';
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
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
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text(p.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 14, color: AppColors.textPrimary)),
                      StatusBadge(p.status),
                    ]),
                    const SizedBox(height: 6),
                    Text('${p.testSummary} · ${p.date}', style: AppTextStyles.bodySmall.copyWith(fontSize: 12, color: AppColors.textSecondary)),
                    const SizedBox(height: 12),
                    if (ready)
                      AppButton(
                        label: 'View Report',
                        variant: ButtonVariant.outline,
                        color: AppColors.secondary,
                        onPressed: () => app.openReport('AB2314'),
                      )
                    else
                      const Text('Report not published yet', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textMuted), textAlign: TextAlign.center),
                  ]),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
