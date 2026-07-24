import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/mock_data.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class ReportViewerScreen extends StatelessWidget {
  const ReportViewerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final r = app.selectedReportObj;
    final rows = MockData.reportRows[r.id] ?? MockData.reportRows['AB2314']!;
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: r.name, onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                Container(decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)), child: Column(children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      color: AppColors.primary,
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                        Text('Abirami Laboratory', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                        Text('Thindal, Erode · NABL Accredited', style: TextStyle(color: Color(0xCCFFFFFF), fontSize: 11)),
                      ]),
                    ),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.border))),
                      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('Patient', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          Text(r.member, style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                        ]),
                        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                          const Text('Report Date', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          Text(r.date, style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                        ]),
                      ]),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(children: [
                        Row(children: const [
                          Expanded(flex: 3, child: Text('PARAMETER', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.textMuted))),
                          Expanded(flex: 2, child: Text('RESULT', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.textMuted))),
                          Expanded(flex: 2, child: Text('RANGE', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.textMuted))),
                        ]),
                        const Divider(height: 16, color: AppColors.border),
                        ...rows.map((row) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(children: [
                                Expanded(flex: 3, child: Text(row.name, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: Color(0xFF334155)))),
                                Expanded(flex: 2, child: Text(row.value, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: row.abnormal ? AppColors.warning : AppColors.success))),
                                Expanded(flex: 2, child: Text(row.range, style: const TextStyle(fontSize: 11, color: AppColors.textMuted))),
                              ]),
                            )),
                      ]),
                    ),
                  ]),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
            child: Row(children: [
              Expanded(child: AppButton(label: 'Share', icon: Icons.ios_share, variant: ButtonVariant.outline, color: const Color(0xFF334155), onPressed: () {})),
              const SizedBox(width: 12),
              Expanded(child: AppButton(label: 'Download', icon: Icons.download, onPressed: () {})),
            ]),
          ),
        ],
      ),
    );
  }
}
