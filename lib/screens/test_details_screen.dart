import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/mock_data.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class TestDetailsScreen extends StatelessWidget {
  const TestDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final t = app.selectedTest;
    final inCart = app.cart.contains(t.id);
    final included = t.includedTestIds.map(MockData.findById).toList();

    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                Container(
                  height: 200,
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        t.image.isNotEmpty
                            ? Image.asset(t.image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(
                                color: AppColors.primaryTint,
                                child: const Icon(Icons.water_drop, size: 64, color: AppColors.secondary),
                              ))
                            : Container(
                                color: AppColors.primaryTint,
                                child: const Icon(Icons.water_drop, size: 64, color: AppColors.secondary),
                              ),
                        Positioned(
                          top: 16,
                          left: 16,
                          child: InkWell(
                            onTap: app.back,
                            borderRadius: BorderRadius.circular(20),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.08),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: AppColors.primary),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(t.name, style: AppTextStyles.h3.copyWith(fontSize: 19)),
                      const SizedBox(height: 6),
                      Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
                        Text('₹${t.price}', style: AppTextStyles.priceLg),
                        const SizedBox(width: 8),
                        Text('₹${t.mrp}', style: const TextStyle(fontSize: 13, color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                        const SizedBox(width: 8),
                        Text('${t.discountPct}% off', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success)),
                      ]),
                      const SizedBox(height: 20),
                      Row(children: [
                        Expanded(child: _InfoBox(label: 'Sample', value: t.sample)),
                        const SizedBox(width: 10),
                        Expanded(child: _InfoBox(label: 'Report', value: t.report)),
                        const SizedBox(width: 10),
                        Expanded(child: _InfoBox(label: 'Fasting', value: t.fasting ? 'Required' : 'Not required')),
                      ]),
                      const SizedBox(height: 20),
                      Text('About this test', style: AppTextStyles.bodyBold),
                      const SizedBox(height: 8),
                      Text(t.desc, style: AppTextStyles.body),
                      const SizedBox(height: 20),
                      Text('Preparation', style: AppTextStyles.bodyBold),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12)),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Icon(Icons.info_outline, color: AppColors.warning, size: 18),
                          const SizedBox(width: 10),
                          Expanded(child: Text(t.prep, style: AppTextStyles.body.copyWith(color: const Color(0xFF334155)))),
                        ]),
                      ),
                      if (t.isPackage) ...[
                        const SizedBox(height: 20),
                        Text('Included tests', style: AppTextStyles.bodyBold),
                        const SizedBox(height: 10),
                        ...included.map((it) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(children: [
                                const Icon(Icons.check_circle_outline, size: 16, color: AppColors.success),
                                const SizedBox(width: 10),
                                Text(it.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF334155))),
                              ]),
                            )),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
            child: inCart
                ? AppButton(label: 'Go to Cart', onPressed: () => app.go('cart'))
                : AppButton(label: 'Add to Cart · ₹${t.price}', onPressed: () => app.addToCart(t.id)),
          ),
        ],
      ),
    );
  }
}

class _InfoBox extends StatelessWidget {
  final String label;
  final String value;
  const _InfoBox({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)),
      child: Column(children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary), textAlign: TextAlign.center),
      ]),
    );
  }
}
