import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _ageController = TextEditingController();
  final _addressController = TextEditingController();
  String _selectedGender = 'Male';

  final FocusNode _nameFocus = FocusNode();
  final FocusNode _ageFocus = FocusNode();
  final FocusNode _addressFocus = FocusNode();

  bool _isNameFocused = false;
  bool _isAgeFocused = false;
  bool _isAddressFocused = false;

  @override
  void initState() {
    super.initState();
    _nameFocus.addListener(() => setState(() => _isNameFocused = _nameFocus.hasFocus));
    _ageFocus.addListener(() => setState(() => _isAgeFocused = _ageFocus.hasFocus));
    _addressFocus.addListener(() => setState(() => _isAddressFocused = _addressFocus.hasFocus));
  }

  @override
  void dispose() {
    _nameController.dispose();
    _ageController.dispose();
    _addressController.dispose();
    _nameFocus.dispose();
    _ageFocus.dispose();
    _addressFocus.dispose();
    super.dispose();
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

                // Row for Age & Gender
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Age
                    Expanded(
                      flex: 4,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Age', style: AppTextStyles.bodySmallBold.copyWith(fontSize: 12)),
                          const SizedBox(height: 8),
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            height: 52,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              border: Border.all(
                                color: _isAgeFocused ? AppColors.primary : AppColors.border,
                                width: 1.5,
                              ),
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: _isAgeFocused
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
                              controller: _ageController,
                              focusNode: _ageFocus,
                              keyboardType: TextInputType.number,
                              textAlignVertical: TextAlignVertical.center,
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                hintText: 'Age',
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(vertical: 10),
                              ),
                              style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                              validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter age' : null,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),

                    // Gender Dropdown
                    Expanded(
                      flex: 6,
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
                const SizedBox(height: 40),

                // Submit Button
                AppButton(
                  label: 'Submit & Log In',
                  color: AppColors.primary,
                  onPressed: () {
                    if (_formKey.currentState?.validate() ?? false) {
                      app.registerPatient(
                        name: _nameController.text.trim(),
                        age: _ageController.text.trim(),
                        gender: _selectedGender,
                        address: _addressController.text.trim(),
                      );
                    }
                  },
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
