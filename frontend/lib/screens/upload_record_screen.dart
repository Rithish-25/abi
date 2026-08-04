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
  final notesCtrl = TextEditingController();
  String? selectedImagePath;

  final List<Map<String, String>> _sampleImages = const [
    {'name': 'Prescription 1', 'path': 'assets/board1.jpg', 'type': 'prescription'},
    {'name': 'Prescription 2', 'path': 'assets/board2.jpg', 'type': 'prescription'},
    {'name': 'CBC Report', 'path': 'assets/cbc.jpg', 'type': 'report'},
    {'name': 'Sugar Report', 'path': 'assets/sugar.jpg', 'type': 'report'},
    {'name': 'Thyroid Report', 'path': 'assets/thyroid.jpg', 'type': 'report'},
    {'name': 'Lipid Profile', 'path': 'assets/lipid.jpg', 'type': 'report'},
    {'name': 'Fever Package', 'path': 'assets/fever.jpg', 'type': 'report'},
  ];

  void _pickDocument(String defaultType) {
    final filtered = _sampleImages.where((i) => i['type'] == defaultType).toList();
    final items = filtered.isNotEmpty ? filtered : _sampleImages;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select Medical Document / Photo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              const Text('Choose a document scan or sample file to attach:', style: TextStyle(fontSize: 12.5, color: AppColors.textMuted)),
              const SizedBox(height: 16),
              SizedBox(
                height: 140,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) {
                    final item = items[i];
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          selectedImagePath = item['path'];
                          if (titleCtrl.text.isEmpty) {
                            titleCtrl.text = item['name']!;
                          }
                        });
                        Navigator.pop(ctx);
                      },
                      child: Container(
                        width: 110,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: selectedImagePath == item['path'] ? AppColors.primary : AppColors.border,
                            width: selectedImagePath == item['path'] ? 2.5 : 1.0,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                child: Image.asset(item['path']!, fit: BoxFit.cover),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(6),
                              child: Text(
                                item['name']!,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    setState(() {
                      selectedImagePath = items.first['path'];
                    });
                    Navigator.pop(ctx);
                  },
                  icon: const Icon(Icons.photo_library, size: 18),
                  label: const Text('Attach Default Sample Document'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isPrescription = app.uploadMode == 'prescription';
    final title = isPrescription ? 'Upload Prescription' : 'Upload Laboratory Report';
    final activeImage = selectedImagePath ?? (isPrescription ? 'assets/board1.jpg' : 'assets/cbc.jpg');

    return Container(
      color: Colors.white,
      child: Column(
        children: [
          BackHeader(title: title, onBack: app.back),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  InkWell(
                    onTap: () => _pickDocument(app.uploadMode ?? 'report'),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: selectedImagePath != null ? AppColors.primary : const Color(0xFFCBD5E1), width: selectedImagePath != null ? 2 : 1),
                      ),
                      child: Column(
                        children: [
                          if (selectedImagePath != null || true) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Stack(
                                children: [
                                  Image.asset(
                                    activeImage,
                                    height: 160,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                  ),
                                  Positioned(
                                    top: 10,
                                    right: 10,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.7),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 14),
                                          SizedBox(width: 4),
                                          Text('Image Ready', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.refresh, size: 16, color: AppColors.primary),
                                const SizedBox(width: 6),
                                Text(
                                  selectedImagePath != null ? 'Change Attached Image / PDF' : 'Tap to select document / photo',
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 8),
                  TextField(
                    controller: titleCtrl,
                    decoration: AppTextStyles.inputDecoration(
                      hintText: isPrescription ? 'e.g. Dr. Senthil Kumar prescription' : 'e.g. Annual Blood Checkup Report',
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Notes (optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 8),
                  TextField(
                    controller: notesCtrl,
                    maxLines: 3,
                    decoration: AppTextStyles.inputDecoration(hintText: 'Add lab values, doctor advice, or additional notes...'),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
            child: AppButton(
              label: 'Save Record',
              onPressed: () {
                app.saveRecord(
                  titleCtrl.text,
                  notes: notesCtrl.text,
                  imageUrl: activeImage,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
