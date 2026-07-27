import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

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
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFEF2F2), Color(0xFFFEE2E2)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.danger.withOpacity(0.15), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: AppColors.danger.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.water_drop, color: AppColors.danger, size: 28),
          ),
          const SizedBox(height: 24),
          Text('Welcome back', style: AppTextStyles.h1),
          const SizedBox(height: 6),
          Text('Sign in with your mobile number to book tests & view reports.', style: AppTextStyles.body),
          const SizedBox(height: 28),
          Text('Mobile number', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
          const SizedBox(height: 8),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(
                color: app.phoneError 
                    ? AppColors.danger 
                    : (_isFocused ? AppColors.primary : AppColors.border), 
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(14),
              boxShadow: _isFocused && !app.phoneError
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.08),
                        blurRadius: 8,
                        spreadRadius: 1,
                      )
                    ]
                  : null,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text('+91', style: AppTextStyles.bodyBold.copyWith(fontSize: 15)),
                const SizedBox(width: 8),
                Container(width: 1, height: 20, color: AppColors.border),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    focusNode: _focusNode,
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    onChanged: app.setPhone,
                    textAlignVertical: TextAlignVertical.center,
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      counterText: '',
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
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
          AppButton(label: 'Send OTP', onPressed: app.phone.length == 10 ? app.requestOtp : null),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              'By continuing you agree to our Terms & Privacy Policy', 
              style: TextStyle(color: AppColors.textMuted, fontSize: 12), 
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: GestureDetector(
              onTap: app.goDoctorLogin,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text("Doctor's login", style: TextStyle(color: AppColors.secondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_forward_rounded, color: AppColors.secondary, size: 14),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

