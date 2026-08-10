import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';
import '../widgets/password_field.dart';

class PasswordScreen extends StatefulWidget {
  const PasswordScreen({super.key});

  @override
  State<PasswordScreen> createState() => _PasswordScreenState();
}

class _PasswordScreenState extends State<PasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit(AppState app) async {
    if (_isSubmitting || _passwordController.text.isEmpty) return;
    setState(() => _isSubmitting = true);
    await app.loginWithPassword(_passwordController.text);
    if (!mounted) return;
    setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final masked = app.phone.isEmpty
        ? '98765 43210'
        : '${app.phone.substring(0, app.phone.length.clamp(0, 5))} ${app.phone.length > 5 ? app.phone.substring(5) : ''}';

    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 28),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BackHeader(title: '', onBack: app.back),
            Text('Enter your password', style: AppTextStyles.h1),
            const SizedBox(height: 6),
            Text('Signing in as +91 $masked', style: AppTextStyles.body),
            const SizedBox(height: 28),
            PasswordField(
              label: 'Password',
              controller: _passwordController,
            ),
            if (app.passwordError) ...[
              const SizedBox(height: 8),
              const Text(
                'Incorrect password. Please try again.',
                style: TextStyle(color: AppColors.danger, fontSize: 12.5, fontWeight: FontWeight.w600),
              ),
            ],
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: GestureDetector(
                onTap: app.forgotPassword,
                child: const Text(
                  'Forgot password?',
                  style: TextStyle(color: AppColors.secondary, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const Spacer(),
            AppButton(
              label: _isSubmitting ? 'Signing in...' : 'Login',
              onPressed: _isSubmitting ? null : () => _submit(app),
            ),
          ],
        ),
      ),
    );
  }
}
