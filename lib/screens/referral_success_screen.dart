import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class ReferralSuccessScreen extends StatelessWidget {
  const ReferralSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(width: 88, height: 88, decoration: const BoxDecoration(color: AppColors.secondaryTint, shape: BoxShape.circle), child: const Icon(Icons.check, size: 44, color: AppColors.secondary)),
          const SizedBox(height: 24),
          Text('Referral Submitted!', style: AppTextStyles.h2, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text("We've notified the patient to confirm & pay for their booking. You'll earn a commission once the report is delivered.", style: AppTextStyles.body, textAlign: TextAlign.center),
          const SizedBox(height: 24),
          AppButton(label: 'Back to Dashboard', color: AppColors.secondary, onPressed: () => app.goTab('doctor', 'doctorDashboard')),
        ],
      ),
    );
  }
}
