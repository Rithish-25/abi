import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../data/mock_data.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';

class CatalogueScreen extends StatelessWidget {
  const CatalogueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final items = app.filteredItems.take(7).toList();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(
            title: 'All Tests & Packages',
            onBack: app.back,
            action: GestureDetector(
              onTap: () => app.go('cart'),
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.shopping_cart_outlined, size: 20, color: Color(0xFF15803D)),
                  ),
                  if (app.cart.isNotEmpty)
                    Positioned(
                      top: -2,
                      right: -2,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFF15803D),
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${app.cart.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, i) {
                final t = items[i];
                final inCart = app.cart.contains(t.id);
                return InkWell(
                  onTap: () => app.openTest(t.id),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              width: 70,
                              height: 70,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.asset(
                                  t.image.isNotEmpty ? t.image : 'assets/cbc.jpg',
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(Icons.medical_services, color: Color(0xFF94A3B8), size: 26);
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(child: Text(t.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 14))),
                                      if (t.isPackage)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(color: AppColors.secondaryTint, borderRadius: BorderRadius.circular(100)),
                                          child: const Text('PACKAGE', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: AppColors.secondary)),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Text('Reports: 11 hrs', style: AppTextStyles.bodySmall.copyWith(fontSize: 11, color: AppColors.textMuted)),
                                      const Padding(
                                        padding: EdgeInsets.symmetric(horizontal: 6),
                                        child: Text('•', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                      ),
                                      Text('Parameters: 26', style: AppTextStyles.bodySmall.copyWith(fontSize: 11, color: AppColors.textMuted)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              width: 70,
                              alignment: Alignment.center,
                              child: Text('₹${t.price}', style: AppTextStyles.bodyBold.copyWith(fontSize: 15.5)),
                            ),
                            OutlinedButton(
                              onPressed: () => app.addToCart(t.id),
                              style: OutlinedButton.styleFrom(
                                backgroundColor: inCart ? const Color(0xFFF1F5F9) : const Color(0xFF15803D),
                                side: BorderSide(
                                  color: inCart ? const Color(0xFFCBD5E1) : const Color(0xFF15803D),
                                  width: 1.2,
                                ),
                                minimumSize: const Size(0, 32),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
                                padding: const EdgeInsets.symmetric(horizontal: 14),
                              ),
                              child: Text(
                                inCart ? 'Added' : 'Add to Cart',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                  color: inCart ? const Color(0xFF64748B) : Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
