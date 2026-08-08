import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class SelectSlotScreen extends StatelessWidget {
  const SelectSlotScreen({super.key});

  static const List<String> _weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final today = DateTime.now();
    final days = List.generate(
      7,
      (i) => DateTime(today.year, today.month, today.day).add(Duration(days: i)),
    );

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Choose date & time', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                const SizedBox(height: 4),
                Text('SELECT DATE', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                const SizedBox(height: 10),
                SizedBox(
                  height: 74,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: days.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, i) {
                      final d = days[i];
                      final selected = d.year == app.selectedSlotDate.year &&
                          d.month == app.selectedSlotDate.month &&
                          d.day == app.selectedSlotDate.day;
                      final label = i == 0
                          ? 'Today'
                          : (i == 1 ? 'Tomorrow' : _weekdayShort[(d.weekday - 1) % 7]);
                      return InkWell(
                        onTap: () => app.selectSlotDate(d),
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          width: 64,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: selected ? AppColors.primaryTint : Colors.white,
                            border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: 1.5),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                label,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: selected ? AppColors.primary : AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                d.day.toString().padLeft(2, '0'),
                                style: AppTextStyles.bodyBold.copyWith(
                                  fontSize: 16,
                                  color: selected ? AppColors.primary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                Text('SELECT TIME SLOT', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                const SizedBox(height: 10),
                if (app.availableSlotTimes.isEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: AppColors.border, width: 1.5),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Text(
                      'No more slots available today. Please choose another date.',
                      style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
                ...app.availableSlotTimes.map((t) {
                  final selected = t == app.selectedSlotTime;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: InkWell(
                      onTap: () => app.selectSlotTime(t),
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primaryTint : Colors.white,
                          border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: 1.5),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(children: [
                              Icon(Icons.access_time_rounded, size: 18, color: selected ? AppColors.primary : AppColors.textSecondary),
                              const SizedBox(width: 10),
                              Text(
                                t,
                                style: AppTextStyles.bodyBold.copyWith(
                                  fontSize: 13.5,
                                  color: selected ? AppColors.primary : AppColors.textPrimary,
                                ),
                              ),
                            ]),
                            Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: selected ? AppColors.primary : const Color(0xFFCBD5E1), width: 2),
                              ),
                              child: selected
                                  ? Center(
                                      child: Container(
                                        width: 10,
                                        height: 10,
                                        decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                                      ),
                                    )
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 16),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
            child: AppButton(
              label: 'Continue',
              onPressed: app.selectedSlotTime.isEmpty ? null : () => app.go('bookingSummary'),
            ),
          ),
        ],
      ),
    );
  }
}
