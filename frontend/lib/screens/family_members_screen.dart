import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class FamilyMembersScreen extends StatefulWidget {
  const FamilyMembersScreen({super.key});
  @override
  State<FamilyMembersScreen> createState() => _FamilyMembersScreenState();
}

class _FamilyMembersScreenState extends State<FamilyMembersScreen> {
  final nameCtrl = TextEditingController();
  final ageCtrl = TextEditingController();
  String relation = 'Son';

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Family Members', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                ...app.family.map((m) => Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)), child: Row(children: [
                        Container(width: 44, height: 44, decoration: const BoxDecoration(color: AppColors.primaryTint, shape: BoxShape.circle), alignment: Alignment.center, child: Text(m.initial, style: AppTextStyles.h4.copyWith(color: AppColors.primary))),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(m.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 14)),
                          Text('${m.relation} · ${m.age} yrs · ${m.gender}', style: AppTextStyles.bodySmall.copyWith(fontSize: 12)),
                        ])),
                      ]),
                    )),
                InkWell(
                  onTap: app.toggleAddMember,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5), borderRadius: BorderRadius.circular(16)),
                    child: const Row(children: [Icon(Icons.add, color: AppColors.primary), SizedBox(width: 10), Text('Add family member', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13.5))]),
                  ),
                ),
                if (app.showAddMember) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                    child: Column(children: [
                      TextField(controller: nameCtrl, decoration: AppTextStyles.inputDecoration(hintText: 'Full name')),
                      const SizedBox(height: 10),
                      Row(children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: relation,
                            items: const ['Son', 'Daughter', 'Wife', 'Husband', 'Father', 'Mother', 'Self'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                            onChanged: (v) => setState(() => relation = v ?? relation),
                            decoration: AppTextStyles.inputDecoration(hintText: 'Relation'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(width: 85, child: TextField(controller: ageCtrl, keyboardType: TextInputType.number, decoration: AppTextStyles.inputDecoration(hintText: 'Age'))),
                      ]),
                      const SizedBox(height: 10),
                      AppButton(label: 'Save member', onPressed: () {
                        app.addFamilyMember(nameCtrl.text, relation, ageCtrl.text, 'Male');
                        nameCtrl.clear();
                        ageCtrl.clear();
                      }),
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
