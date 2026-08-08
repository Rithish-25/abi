import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';
import '../widgets/password_field.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _selectedGender = 'Male';
  DateTime? _selectedDob;

  final FocusNode _nameFocus = FocusNode();
  final FocusNode _addressFocus = FocusNode();

  bool _isNameFocused = false;
  bool _isAddressFocused = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _nameFocus.addListener(() => setState(() => _isNameFocused = _nameFocus.hasFocus));
    _addressFocus.addListener(() => setState(() => _isAddressFocused = _addressFocus.hasFocus));
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nameFocus.dispose();
    _addressFocus.dispose();
    super.dispose();
  }

  String _formatDob(DateTime d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${d.day.toString().padLeft(2, '0')} ${months[d.month - 1]} ${d.year}';
  }

  String _dobForStorage(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

  String _computeAge(DateTime dob) {
    final now = DateTime.now();
    int age = now.year - dob.year;
    if (now.month < dob.month || (now.month == dob.month && now.day < dob.day)) {
      age--;
    }
    return age.toString();
  }

  Future<void> _pickDob(FormFieldState<DateTime> field) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDob ?? DateTime(now.year - 25, now.month, now.day),
      firstDate: DateTime(now.year - 120),
      lastDate: now,
    );
    if (picked != null) {
      setState(() => _selectedDob = picked);
      field.didChange(picked);
    }
  }

  Future<void> _submit(AppState app) async {
    if (!(_formKey.currentState?.validate() ?? false) || _isSubmitting) return;
    setState(() => _isSubmitting = true);
    await app.registerPatient(
      name: _nameController.text.trim(),
      dob: _dobForStorage(_selectedDob!),
      age: _computeAge(_selectedDob!),
      gender: _selectedGender,
      address: _addressController.text.trim(),
      password: _passwordController.text,
    );
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                Text('Complete Registration', style: AppTextStyles.h1),
                const SizedBox(height: 6),
                Text(
                  'Set up your profile to start booking tests and view your lab reports.',
                  style: AppTextStyles.body,
                ),
                const SizedBox(height: 28),

                // Full Name
                Text('Full Name', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
                const SizedBox(height: 8),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 52,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    border: Border.all(
                      color: _isNameFocused ? AppColors.primary : AppColors.border,
                      width: 1.5,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: _isNameFocused
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.08),
                              blurRadius: 8,
                              spreadRadius: 1,
                            )
                          ]
                        : null,
                  ),
                  child: TextFormField(
                    controller: _nameController,
                    focusNode: _nameFocus,
                    textCapitalization: TextCapitalization.words,
                    textAlignVertical: TextAlignVertical.center,
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Enter your full name',
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                    style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                  ),
                ),
                const SizedBox(height: 20),

                // Row for Date of Birth & Gender
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Date of Birth
                    Expanded(
                      flex: 5,
                      child: FormField<DateTime>(
                        validator: (_) => _selectedDob == null ? 'Select DOB' : null,
                        builder: (field) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Date of Birth', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
                              const SizedBox(height: 8),
                              InkWell(
                                borderRadius: BorderRadius.circular(14),
                                onTap: () => _pickDob(field),
                                child: Container(
                                  height: 52,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    border: Border.all(
                                      color: field.hasError ? AppColors.danger : AppColors.border,
                                      width: 1.5,
                                    ),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  alignment: Alignment.centerLeft,
                                  child: Row(
                                    children: [
                                      const Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.textSecondary),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _selectedDob == null ? 'Select date' : _formatDob(_selectedDob!),
                                          overflow: TextOverflow.ellipsis,
                                          style: AppTextStyles.bodyBold.copyWith(
                                            fontSize: 14,
                                            color: _selectedDob == null ? AppColors.textMuted : AppColors.textPrimary,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              if (field.hasError)
                                Padding(
                                  padding: const EdgeInsets.only(top: 6),
                                  child: Text(field.errorText!, style: const TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w500)),
                                ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 16),

                    // Gender Dropdown
                    Expanded(
                      flex: 5,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Gender', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
                          const SizedBox(height: 8),
                          Container(
                            height: 52,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              border: Border.all(
                                color: AppColors.border,
                                width: 1.5,
                              ),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            alignment: Alignment.center,
                            child: DropdownButtonFormField<String>(
                              value: _selectedGender,
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                              style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                              onChanged: (String? val) {
                                if (val != null) {
                                  setState(() {
                                    _selectedGender = val;
                                  });
                                }
                              },
                              items: const [
                                DropdownMenuItem(value: 'Male', child: Text('Male')),
                                DropdownMenuItem(value: 'Female', child: Text('Female')),
                                DropdownMenuItem(value: 'Other', child: Text('Other')),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Initial Address
                Text('Initial Address', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
                const SizedBox(height: 8),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    border: Border.all(
                      color: _isAddressFocused ? AppColors.primary : AppColors.border,
                      width: 1.5,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: _isAddressFocused
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.08),
                              blurRadius: 8,
                              spreadRadius: 1,
                            )
                          ]
                        : null,
                  ),
                  child: TextFormField(
                    controller: _addressController,
                    focusNode: _addressFocus,
                    textCapitalization: TextCapitalization.sentences,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Enter your home address',
                      isDense: true,
                    ),
                    style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your address' : null,
                  ),
                ),
                const SizedBox(height: 20),

                // Create Password
                PasswordField(
                  label: 'Create Password',
                  hintText: 'At least 6 characters',
                  controller: _passwordController,
                  validator: (v) => (v == null || v.length < 6) ? 'Password must be at least 6 characters' : null,
                ),
                const SizedBox(height: 20),

                // Confirm Password
                PasswordField(
                  label: 'Confirm Password',
                  hintText: 'Re-enter your password',
                  controller: _confirmPasswordController,
                  validator: (v) => v != _passwordController.text ? 'Passwords do not match' : null,
                ),
                const SizedBox(height: 40),

                // Submit Button
                AppButton(
                  label: _isSubmitting ? 'Please wait...' : 'Submit & Log In',
                  color: AppColors.primary,
                  onPressed: _isSubmitting ? null : () => _submit(app),
                ),
                const SizedBox(height: 16),

                // Cancel / Back to Login
                AppButton(
                  label: 'Cancel',
                  variant: ButtonVariant.text,
                  color: AppColors.textSecondary,
                  onPressed: app.logout,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
