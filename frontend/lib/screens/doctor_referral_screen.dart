import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/mock_data.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class DoctorReferralScreen extends StatefulWidget {
  const DoctorReferralScreen({super.key});
  @override
  State<DoctorReferralScreen> createState() => _DoctorReferralScreenState();
}

class _DoctorReferralScreenState extends State<DoctorReferralScreen> {
  final nameCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Refer a Patient', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                const Text('Patient name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                const SizedBox(height: 8),
                TextField(
                  controller: nameCtrl,
                  onChanged: (v) => app.refPatientName = v,
                  decoration: InputDecoration(
                    hintText: 'Full name',
                    hintStyle: AppTextStyles.body.copyWith(color: AppColors.textMuted),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.secondary, width: 1.5)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                  ),
                  style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                ),
                const SizedBox(height: 14),
                const Text('Patient mobile number', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                const SizedBox(height: 8),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  onChanged: (v) => app.refPatientPhone = v,
                  decoration: InputDecoration(
                    hintText: '98765 43210',
                    hintStyle: AppTextStyles.body.copyWith(color: AppColors.textMuted),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.secondary, width: 1.5)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                  ),
                  style: AppTextStyles.bodyBold.copyWith(fontSize: 15),
                ),
                const SizedBox(height: 20),
                const Text('Select blood tests', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                const SizedBox(height: 10),
                ...MockData.tests.map((t) {
                  final selected = app.refTests.contains(t.id);
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: InkWell(
                      onTap: () => app.toggleRefTest(t.id),
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.secondaryTint : Colors.white,
                          border: Border.all(color: selected ? AppColors.secondary : AppColors.border, width: 1.5),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(children: [
                          Container(
                            width: 20, height: 20,
                            decoration: BoxDecoration(color: selected ? AppColors.secondary : Colors.white, border: Border.all(color: selected ? AppColors.secondary : const Color(0xFFCBD5E1), width: 2), borderRadius: BorderRadius.circular(6)),
                            child: selected ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(t.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary))),
                          Text('₹${t.price}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        ]),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 10),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
            decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
            child: AppButton(label: 'Submit Referral', color: AppColors.secondary, onPressed: app.submitReferral),
          ),
        ],
      ),
    );
  }
}
