import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class SavedAddressesScreen extends StatefulWidget {
  const SavedAddressesScreen({super.key});
  @override
  State<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends State<SavedAddressesScreen> {
  final lineCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  String label = 'Home';
  int? editingAddressId;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Saved Addresses', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                ...app.addresses.map((a) => Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Container(width: 36, height: 36, decoration: BoxDecoration(color: AppColors.secondaryTint, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.location_on, color: AppColors.secondary, size: 18)),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(a.label, style: AppTextStyles.bodyBold.copyWith(fontSize: 13.5)),
                          Text(a.line, style: AppTextStyles.bodySmall.copyWith(fontSize: 12)),
                          const SizedBox(height: 4),
                          Text(a.phone, style: AppTextStyles.caption.copyWith(fontSize: 11.5)),
                        ])),
                        IconButton(
                          icon: Icon(Icons.edit_rounded, color: editingAddressId == a.id ? AppColors.primary : AppColors.textSecondary, size: 18),
                          onPressed: () {
                            setState(() {
                              editingAddressId = a.id;
                              label = a.label;
                              lineCtrl.text = a.line;
                              phoneCtrl.text = a.phone;
                              if (!app.showAddAddress) {
                                app.toggleAddAddress();
                              }
                            });
                          },
                        ),
                      ]),
                    )),
                InkWell(
                  onTap: () {
                    setState(() {
                      editingAddressId = null;
                      lineCtrl.clear();
                      phoneCtrl.clear();
                    });
                    app.toggleAddAddress();
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5), borderRadius: BorderRadius.circular(16)),
                    child: Row(children: [
                      Icon(editingAddressId != null ? Icons.close : Icons.add, color: AppColors.primary),
                      const SizedBox(width: 10),
                      Text(editingAddressId != null ? 'Cancel editing' : 'Add new address', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13.5))
                    ]),
                  ),
                ),
                if (app.showAddAddress) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                    child: Column(children: [
                      DropdownButtonFormField<String>(
                        value: label,
                        items: const ['Home', 'Work', 'Other'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                        onChanged: (v) => setState(() => label = v ?? label),
                        decoration: AppTextStyles.inputDecoration(hintText: 'Address label'),
                      ),
                      const SizedBox(height: 10),
                      TextField(controller: lineCtrl, maxLines: 2, decoration: AppTextStyles.inputDecoration(hintText: 'Full address')),
                      const SizedBox(height: 10),
                      TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: AppTextStyles.inputDecoration(hintText: 'Contact number')),
                      const SizedBox(height: 10),
                      AppButton(
                        label: editingAddressId != null ? 'Update address' : 'Save address',
                        onPressed: () {
                          if (editingAddressId != null) {
                            app.updateAddress(editingAddressId!, label, lineCtrl.text, phoneCtrl.text);
                          } else {
                            app.addAddress(label, lineCtrl.text, phoneCtrl.text);
                          }
                          setState(() {
                            editingAddressId = null;
                            if (app.showAddAddress) {
                              app.toggleAddAddress();
                            }
                          });
                          lineCtrl.clear();
                          phoneCtrl.clear();
                        },
                      ),
                    ]),
                  ),
                ],
              ],
            ),
          ),
        ],
      )
    );
  }
}
