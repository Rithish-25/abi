import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/empty_state.dart';
import '../widgets/primary_button.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final items = app.cartItems;
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'My Cart', onBack: app.back),
          if (items.isEmpty)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: EmptyState(
                  icon: Icons.shopping_cart,
                  title: 'Your cart is empty',
                  message: 'Add a blood test or health package to get started.',
                  actionLabel: 'Browse Tests',
                  onAction: () => app.go('catalogue'),
                ),
              ),
            )
          else ...[
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  ...items.map((c) => Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)), child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(c.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 13.5)),
                              const SizedBox(height: 4),
                              Text('₹${c.price}', style: AppTextStyles.bodyBold.copyWith(fontSize: 14)),
                            ]),
                            InkWell(
                              onTap: () => app.removeFromCart(c.id),
                              borderRadius: BorderRadius.circular(10),
                              child: Container(width: 32, height: 32, decoration: BoxDecoration(color: AppColors.dangerTint, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.delete_outline, size: 16, color: AppColors.danger)),
                            ),
                          ],
                        ),
                      )),
                  InkWell(
                    onTap: () => app.go('catalogue'),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(children: const [Icon(Icons.add, color: AppColors.primary, size: 18), SizedBox(width: 8), Text('Add more tests', style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600))]),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('Total (${items.length} items)', style: AppTextStyles.body.copyWith(fontSize: 13)),
                    Text('₹${app.cartTotal}', style: AppTextStyles.h4.copyWith(fontSize: 16)),
                  ]),
                  const SizedBox(height: 4),
                  Text('You save ₹${app.cartSavings} on this order', style: const TextStyle(color: AppColors.success, fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 14),
                  AppButton(label: 'Proceed · ₹${app.cartTotal}', onPressed: () => app.go('selectMember')),
                ],
              ),
            ),
          ],
        ],
      )
    );
  }
}
