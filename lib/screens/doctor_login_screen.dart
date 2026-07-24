import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class DoctorLoginScreen extends StatelessWidget {
  const DoctorLoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          BackHeader(title: '', onBack: app.back, padding: const EdgeInsets.only(top: 20, bottom: 8)),
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: AppColors.secondaryTint, borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.medical_services, color: AppColors.secondary, size: 28),
          ),
          const SizedBox(height: 24),
          Text('Doctor Portal', style: AppTextStyles.h1),
          const SizedBox(height: 6),
          Text('Refer patients, view their reports & track your commission.', style: AppTextStyles.body),
          const SizedBox(height: 28),
          Text('Registered mobile number', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
          const SizedBox(height: 8),
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(border: Border.all(color: app.doctorPhoneError ? AppColors.danger : AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(14)),
            child: Row(
              children: [
                Text('+91', style: AppTextStyles.bodyBold.copyWith(fontSize: 15)),
                const SizedBox(width: 8),
                Container(width: 1, height: 20, color: AppColors.border),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    onChanged: app.setDoctorPhone,
                    decoration: const InputDecoration(border: InputBorder.none, counterText: ''),
                    style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
          if (app.doctorPhoneError) ...[
            const SizedBox(height: 8),
            const Text('Enter a valid 10-digit mobile number not starting with 0', style: TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w500)),
          ],
          const Spacer(),
          AppButton(label: 'Send OTP & Continue', color: AppColors.secondary, onPressed: app.doctorLogin),
        ],
      ),
    );
  }
}
