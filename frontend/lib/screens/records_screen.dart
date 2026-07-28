import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';

class RecordsScreen extends StatelessWidget {
  const RecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 96),
        children: [
          BackHeader(
            title: 'Medical Records',
            onBack: () => app.goTab('home', 'home'),
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 12),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(children: [
              Expanded(
                child: InkWell(
                  onTap: () => app.setUploadMode('prescription'),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                    child: Column(children: [
                      Container(width: 44, height: 44, decoration: BoxDecoration(color: AppColors.primaryTint, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.description, color: AppColors.primary)),
                      const SizedBox(height: 10),
                      const Text('Upload Prescription', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary), textAlign: TextAlign.center),
                    ]),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: InkWell(
                  onTap: () => app.setUploadMode('report'),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                    child: Column(children: [
                      Container(width: 44, height: 44, decoration: BoxDecoration(color: AppColors.secondaryTint, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.file_upload, color: AppColors.secondary)),
                      const SizedBox(height: 10),
                      const Text('Upload Lab Report', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary), textAlign: TextAlign.center),
                    ]),
                  ),
                ),
              ),
            ]),
          ),
          const Padding(padding: EdgeInsets.fromLTRB(20, 16, 20, 10), child: Text('UPLOADED RECORDS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: app.records.map((rec) {
                final isPrescription = rec.type == 'prescription';
                final isBill = rec.type == 'bill' || rec.title.toLowerCase().contains('invoice') || rec.title.toLowerCase().contains('bill');
                final Color iconBg;
                final IconData iconData;
                if (isPrescription) {
                  iconBg = const Color(0xFFF97316);
                  iconData = Icons.medication;
                } else if (isBill) {
                  iconBg = const Color(0xFF8B5CF6);
                  iconData = Icons.wallet;
                } else {
                  iconBg = const Color(0xFFDC2626);
                  iconData = Icons.description;
                }
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                  child: Row(children: [
                    Container(width: 40, height: 40, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)), child: Icon(iconData, color: Colors.white, size: 18)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(rec.title, style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                      Text(rec.date, style: AppTextStyles.caption.copyWith(fontSize: 11.5)),
                    ])),
                    const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
                  ]),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
