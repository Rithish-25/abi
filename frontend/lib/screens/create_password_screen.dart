import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';
import '../widgets/password_field.dart';

/// Shown after OTP verification for an account that already has a profile but
/// no password yet — either a legacy account being upgraded, or a "forgot
/// password" reset. Brand-new numbers instead go through RegistrationScreen,
/// which collects the password alongside the rest of the profile.
class CreatePasswordScreen extends StatefulWidget {
  const CreatePasswordScreen({super.key});

  @override
  State<CreatePasswordScreen> createState() => _CreatePasswordScreenState();
}

class _CreatePasswordScreenState extends State<CreatePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit(AppState app) async {
    if (!(_formKey.currentState?.validate() ?? false) || _isSubmitting) return;
    setState(() => _isSubmitting = true);
    await app.setPasswordForExistingAccount(_passwordController.text);
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 28),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BackHeader(title: '', onBack: app.back),
            Text('Create a password', style: AppTextStyles.h1),
            const SizedBox(height: 6),
            Text('Set a password so you can log in faster next time.', style: AppTextStyles.body),
            const SizedBox(height: 28),
            PasswordField(
              label: 'Password',
              hintText: 'At least 6 characters',
              controller: _passwordController,
              validator: (v) => (v == null || v.length < 6) ? 'Password must be at least 6 characters' : null,
            ),
            const SizedBox(height: 20),
            PasswordField(
              label: 'Confirm Password',
              hintText: 'Re-enter your password',
              controller: _confirmController,
              validator: (v) => v != _passwordController.text ? 'Passwords do not match' : null,
            ),
            const Spacer(),
            AppButton(
              label: _isSubmitting ? 'Please wait...' : 'Set Password & Continue',
              onPressed: _isSubmitting ? null : () => _submit(app),
            ),
          ],
        ),
      ),
    );
  }
}
