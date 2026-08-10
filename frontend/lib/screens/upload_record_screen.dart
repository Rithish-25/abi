import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
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
  File? selectedImageFile;
  bool _isSaving = false;

  Future<void> _pickFrom(ImageSource source) async {
    try {
      final XFile? picked = await ImagePicker().pickImage(source: source, imageQuality: 85);
      if (picked == null) return;
      setState(() => selectedImageFile = File(picked.path));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open ${source == ImageSource.camera ? 'camera' : 'gallery'}: $e')),
      );
    }
  }

  void _pickDocument() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Attach Medical Document / Photo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                const Text('Take a new photo or choose one from your gallery.', style: TextStyle(fontSize: 12.5, color: AppColors.textMuted)),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: AppColors.primaryTint, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.photo_camera_rounded, color: AppColors.primary),
                  ),
                  title: const Text('Take Photo', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickFrom(ImageSource.camera);
                  },
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: AppColors.secondaryTint, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.photo_library_rounded, color: AppColors.secondary),
                  ),
                  title: const Text('Choose from Gallery', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickFrom(ImageSource.gallery);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _handleSave(AppState app) async {
    if (selectedImageFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please attach a photo of the document first.')),
      );
      return;
    }
    setState(() => _isSaving = true);
    final error = await app.saveRecord(
      titleCtrl.text,
      notes: notesCtrl.text,
      imageFile: selectedImageFile!,
    );
    if (!mounted) return;
    setState(() => _isSaving = false);
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isPrescription = app.uploadMode == 'prescription';
    final title = isPrescription ? 'Upload Prescription' : 'Upload Laboratory Report';

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
                    onTap: _pickDocument,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: selectedImageFile != null ? AppColors.primary : const Color(0xFFCBD5E1),
                          width: selectedImageFile != null ? 2 : 1,
                        ),
                      ),
                      child: selectedImageFile != null
                          ? Column(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Stack(
                                    children: [
                                      Image.file(
                                        selectedImageFile!,
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
                                const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.refresh, size: 16, color: AppColors.primary),
                                    SizedBox(width: 6),
                                    Text(
                                      'Change Attached Photo',
                                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                                    ),
                                  ],
                                ),
                              ],
                            )
                          : Padding(
                              padding: const EdgeInsets.symmetric(vertical: 28),
                              child: Column(
                                children: const [
                                  Icon(Icons.add_a_photo_rounded, size: 32, color: AppColors.primary),
                                  SizedBox(height: 10),
                                  Text(
                                    'Tap to attach a photo of your document',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Camera or gallery',
                                    style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
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
              label: _isSaving ? 'Uploading...' : 'Save Record',
              onPressed: _isSaving ? null : () => _handleSave(app),
            ),
          ),
        ],
      ),
    );
  }
}
