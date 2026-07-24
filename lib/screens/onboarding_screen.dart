import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final ob = app.onboarding[app.obIndex];
    return Container(
      child: Column(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(32, 50, 32, 0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: double.infinity,
                    height: 200,
                    decoration: BoxDecoration(color: AppColors.primaryTint, borderRadius: BorderRadius.circular(20)),
                    alignment: Alignment.center,
                    child: Text('illustration placeholder', style: TextStyle(fontFamily: 'monospace', fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(height: 32),
                  Text(ob['title']!, style: AppTextStyles.h2, textAlign: TextAlign.center),
                  const SizedBox(height: 10),
                  Text(ob['body']!, style: AppTextStyles.body, textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(app.onboarding.length, (i) {
                final active = i == app.obIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: active ? 20 : 8,
                  height: 8,
                  decoration: BoxDecoration(color: active ? AppColors.primary : AppColors.border, borderRadius: BorderRadius.circular(4)),
                );
              }),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
            child: Row(
              children: [
                Expanded(
                  child: AppButton(label: 'Skip', variant: ButtonVariant.outline, color: AppColors.textSecondary, onPressed: app.skipOnboarding),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: AppButton(label: app.obIndex >= app.onboarding.length - 1 ? 'Get Started' : 'Next', onPressed: app.nextOnboarding),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
