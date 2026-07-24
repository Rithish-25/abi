import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  @override
  void dispose() {
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final masked = app.phone.isEmpty ? '98765 43210' : '${app.phone.substring(0, app.phone.length.clamp(0,5))} ${app.phone.length > 5 ? app.phone.substring(5) : ''}';
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          BackHeader(title: '', onBack: app.back),
          Text('Verify your number', style: AppTextStyles.h1),
          const SizedBox(height: 6),
          Text('Enter the 4-digit code sent to +91 $masked', style: AppTextStyles.body),
          const SizedBox(height: 28),
          Row(
            children: List.generate(4, (i) {
              return Padding(
                padding: EdgeInsets.only(right: i < 3 ? 12 : 0),
                child: SizedBox(
                  width: 56, height: 60,
                  child: TextField(
                    focusNode: _focusNodes[i],
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    onChanged: (v) {
                      app.setOtpDigit(i, v);
                      if (v.isNotEmpty && i < 3) {
                        _focusNodes[i + 1].requestFocus();
                      } else if (v.isEmpty && i > 0) {
                        _focusNodes[i - 1].requestFocus();
                      }
                    },
                    cursorColor: const Color(0xFFEF4444),
                    decoration: InputDecoration(
                      counterText: '',
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: app.otpError ? AppColors.danger : (app.otp[i].isNotEmpty ? const Color(0xFFEF4444) : AppColors.border), width: 1.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: app.otpError ? AppColors.danger : const Color(0xFFEF4444), width: 1.5),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: app.otpError ? AppColors.danger : AppColors.border, width: 1.5),
                      ),
                    ),
                    style: AppTextStyles.h1.copyWith(fontSize: 22),
                  ),
                ),
              );
            }),
          ),
          if (app.otpError) ...[
            const SizedBox(height: 8),
            const Text('Incorrect code. Please enter the 4-digit code.', style: TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w500)),
          ],
          const SizedBox(height: 20),
          Row(
            children: [
              const Text("Didn't receive it? ", style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
              GestureDetector(
                onTap: app.resendOtp,
                child: const Text('Resend OTP', style: TextStyle(color: AppColors.secondary, fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const Spacer(),
          AppButton(label: 'Verify & Continue', onPressed: app.verifyOtp),
        ],
      ),
    );
  }
}
