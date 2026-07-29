import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class DoctorLoginScreen extends StatefulWidget {
  const DoctorLoginScreen({super.key});

  @override
  State<DoctorLoginScreen> createState() => _DoctorLoginScreenState();
}

class _DoctorLoginScreenState extends State<DoctorLoginScreen> {
  final FocusNode _nameFocusNode = FocusNode();
  final FocusNode _phoneFocusNode = FocusNode();
  bool _isNameFocused = false;
  bool _isPhoneFocused = false;

  @override
  void initState() {
    super.initState();
    _nameFocusNode.addListener(() {
      setState(() {
        _isNameFocused = _nameFocusNode.hasFocus;
      });
    });
    _phoneFocusNode.addListener(() {
      setState(() {
        _isPhoneFocused = _phoneFocusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _nameFocusNode.dispose();
    _phoneFocusNode.dispose();
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
                colors: [Color(0xFFF0FDFA), Color(0xFFCCFBF1)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                  color: AppColors.secondary.withOpacity(0.15), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: AppColors.secondary.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.medical_services,
                color: AppColors.secondary, size: 28),
          ),
          const SizedBox(height: 24),
          Text('Doctor Portal', style: AppTextStyles.h1),
          const SizedBox(height: 6),
          Text('Refer patients, view their reports & track your commission.',
              style: AppTextStyles.body),
          const SizedBox(height: 28),
          Text('Doctor name',
              style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
          const SizedBox(height: 8),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(
                color: app.doctorNameError
                    ? AppColors.danger
                    : (_isNameFocused ? AppColors.secondary : AppColors.border),
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(14),
              boxShadow: _isNameFocused && !app.doctorNameError
                  ? [
                      BoxShadow(
                        color: AppColors.secondary.withOpacity(0.08),
                        blurRadius: 8,
                        spreadRadius: 1,
                      )
                    ]
                  : null,
            ),
            child: TextField(
              focusNode: _nameFocusNode,
              textCapitalization: TextCapitalization.words,
              onChanged: app.setDoctorName,
              textAlignVertical: TextAlignVertical.center,
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                hintText: 'Enter doctor name',
                contentPadding: EdgeInsets.symmetric(vertical: 10),
              ),
              style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
            ),
          ),
          if (app.doctorNameError) ...[
            const SizedBox(height: 8),
            const Text('Enter the doctor name',
                style: TextStyle(
                    color: AppColors.danger,
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ],
          const SizedBox(height: 20),
          Text('Registered mobile number',
              style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
          const SizedBox(height: 8),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(
                color: app.doctorPhoneError
                    ? AppColors.danger
                    : (_isPhoneFocused
                        ? AppColors.secondary
                        : AppColors.border),
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(14),
              boxShadow: _isPhoneFocused && !app.doctorPhoneError
                  ? [
                      BoxShadow(
                        color: AppColors.secondary.withOpacity(0.08),
                        blurRadius: 8,
                        spreadRadius: 1,
                      )
                    ]
                  : null,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text('+91',
                    style: AppTextStyles.bodyBold.copyWith(fontSize: 15)),
                const SizedBox(width: 8),
                Container(width: 1, height: 20, color: AppColors.border),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    focusNode: _phoneFocusNode,
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    onChanged: app.setDoctorPhone,
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
          if (app.doctorPhoneError) ...[
            const SizedBox(height: 8),
            const Text(
                'Enter a valid 10-digit mobile number not starting with 0',
                style: TextStyle(
                    color: AppColors.danger,
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ],
          const Spacer(),
          AppButton(
            label: 'Continue',
            color: AppColors.secondary,
            onPressed:
                app.doctorPhone.length == 10 && app.doctorName.trim().isNotEmpty
                    ? app.doctorLogin
                    : null,
          ),
          const SizedBox(height: 24),
          Center(
            child: GestureDetector(
              onTap: () => app.go('login'),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text("Users login",
                      style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_forward_rounded,
                      color: AppColors.primary, size: 14),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
