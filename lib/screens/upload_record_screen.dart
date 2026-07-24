import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class UploadRecordScreen extends StatefulWidget {
  const UploadRecordScreen({super.key});
  @override
  State<UploadRecordScreen> createState() => _UploadRecordScreenState();
}

class _UploadRecordScreenState extends State<UploadRecordScreen> {
  final titleCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final title = app.uploadMode == 'prescription' ? 'Upload Prescription' : 'Upload Laboratory Report';
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          BackHeader(title: title, onBack: app.back),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
                    decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFCBD5E1))),
                    child: Column(children: [
                      Container(width: 48, height: 48, decoration: BoxDecoration(color: AppColors.primaryTint, borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.cloud_upload, color: AppColors.primary)),
                      const SizedBox(height: 14),
                      const Text('Tap to upload photo or PDF', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: 4),
                      const Text('JPG, PNG or PDF · up to 10MB', style: TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
                    ]),
                  ),
                  const SizedBox(height: 20),
                  const Text('Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 8),
                  TextField(controller: titleCtrl, decoration: AppTextStyles.inputDecoration(hintText: 'e.g. Dr. Senthil Kumar prescription')),
                  const SizedBox(height: 16),
                  const Text('Notes (optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 8),
                  TextField(maxLines: 3, decoration: AppTextStyles.inputDecoration(hintText: 'Any additional context')),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
            child: AppButton(label: 'Save Record', onPressed: () => app.saveRecord(titleCtrl.text)),
          ),
        ],
      ),
    );
  }
}
