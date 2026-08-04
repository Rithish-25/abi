import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../models/models.dart';

class RecordsScreen extends StatelessWidget {
  const RecordsScreen({super.key});

  void _showRecordDetail(BuildContext context, MedicalRecord rec) {
    final isPrescription = rec.type == 'prescription';
    final defaultImg = isPrescription ? 'assets/board1.jpg' : 'assets/cbc.jpg';
    final imagePath = rec.imageUrl.isNotEmpty ? rec.imageUrl : defaultImg;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          builder: (_, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 5,
                      decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isPrescription ? const Color(0xFFFFF7ED) : const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isPrescription ? 'Prescription' : 'Laboratory Report',
                          style: TextStyle(
                            color: isPrescription ? const Color(0xFFC2410C) : const Color(0xFF1D4ED8),
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(rec.date, style: AppTextStyles.caption),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(rec.title, style: AppTextStyles.h2.copyWith(fontSize: 18, color: AppColors.textPrimary)),
                  const SizedBox(height: 16),
                  const Text('ATTACHED DOCUMENT / IMAGE SCAN', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Image.asset(
                        imagePath,
                        width: double.infinity,
                        height: 240,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          height: 180,
                          color: AppColors.background,
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.description, size: 40, color: AppColors.primary),
                              SizedBox(height: 8),
                              Text('Document Attached', style: TextStyle(fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('TEXTED REPORT & NOTES', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.notes, size: 18, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text('Doctor Notes & Summary', style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          rec.notes.isNotEmpty
                              ? rec.notes
                              : (isPrescription
                                  ? 'Prescription record saved. Contains medication dosage and doctor instructions for lab testing.'
                                  : 'Complete Diagnostic Report. All tested parameters verified by Abirami Laboratory path-lab specialists.'),
                          style: AppTextStyles.body.copyWith(fontSize: 13, height: 1.5),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => Navigator.pop(ctx),
                          icon: const Icon(Icons.close, size: 16),
                          label: const Text('Close'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.textSecondary,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Medical Record shared successfully!')),
                            );
                          },
                          icon: const Icon(Icons.share, size: 16, color: Colors.white),
                          label: const Text('Share Record', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

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
                return InkWell(
                  onTap: () => _showRecordDetail(context, rec),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                    child: Row(children: [
                      Container(width: 40, height: 40, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)), child: Icon(iconData, color: Colors.white, size: 18)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(rec.title, style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                        const SizedBox(height: 2),
                        Text(rec.date, style: AppTextStyles.caption.copyWith(fontSize: 11.5)),
                        if (rec.notes.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Text(
                            rec.notes,
                            style: AppTextStyles.caption.copyWith(fontSize: 11, color: AppColors.textSecondary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ])),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(6)),
                        child: const Row(
                          children: [
                            Icon(Icons.image, size: 12, color: AppColors.primary),
                            SizedBox(width: 4),
                            Text('View', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
                    ]),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
