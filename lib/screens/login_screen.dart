import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(24, 50, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 56, height: 56,
            decoration: const BoxDecoration(color: AppColors.dangerTint, shape: BoxShape.rectangle, borderRadius: BorderRadius.all(Radius.circular(16))),
            child: const Icon(Icons.water_drop, color: AppColors.danger, size: 28),
          ),
          const SizedBox(height: 24),
          Text('Welcome back', style: AppTextStyles.h1),
          const SizedBox(height: 6),
          Text('Sign in with your mobile number to book tests & view reports.', style: AppTextStyles.body),
          const SizedBox(height: 28),
          Text('Mobile number', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
          const SizedBox(height: 8),
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              border: Border.all(color: app.phoneError ? AppColors.danger : AppColors.border, width: 1.5),
              borderRadius: BorderRadius.circular(14),
            ),
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
                    onChanged: app.setPhone,
                    decoration: const InputDecoration(border: InputBorder.none, counterText: ''),
                    style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
          if (app.phoneError) ...[
            const SizedBox(height: 8),
            const Text('Enter a valid 10-digit mobile number not starting with 0', style: TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w500)),
          ],
          const Spacer(),
          AppButton(label: 'Send OTP', onPressed: app.requestOtp),
          const SizedBox(height: 16),
          const Text('By continuing you agree to our Terms & Privacy Policy', style: TextStyle(color: AppColors.textMuted, fontSize: 12), textAlign: TextAlign.center),
          const SizedBox(height: 20),
          Center(
            child: GestureDetector(
              onTap: app.goDoctorLogin,
              child: const Text("Doctor's login  ->", style: TextStyle(color: AppColors.secondary, fontSize: 13, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }
}
