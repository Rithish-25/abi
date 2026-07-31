import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final methods = [
      ('upi', 'UPI (Google Pay, PhonePe, Paytm)', Icons.qr_code),
      ('cod', 'Pay at Home (COD)', Icons.home),
    ];
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Payment', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Column(children: [
                    const Text('Amount to pay', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                    const SizedBox(height: 4),
                    Text('₹${(app.cartTotal * app.selectedMemberIds.length) + app.homeCollectionFee}', style: AppTextStyles.h1.copyWith(fontSize: 32)),
                  ]),
                ),
                Text('CHOOSE PAYMENT METHOD', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                const SizedBox(height: 10),
                ...methods.map((m) {
                  final selected = app.paymentMethod == m.$1;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: InkWell(
                      onTap: () => app.setPaymentMethod(m.$1),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primaryTint : Colors.white,
                          border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: 1.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(children: [
                          Container(width: 36, height: 36, decoration: BoxDecoration(color: AppColors.primaryTint, borderRadius: BorderRadius.circular(10)), child: Icon(m.$3, color: AppColors.primary, size: 18)),
                          const SizedBox(width: 12),
                          Expanded(child: Text(m.$2, style: AppTextStyles.bodyBold.copyWith(fontSize: 13.5))),
                          Container(
                            width: 20, height: 20,
                            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: selected ? AppColors.primary : const Color(0xFFCBD5E1), width: 2)),
                            child: selected ? Center(child: Container(width: 11, height: 11, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle))) : null,
                          ),
                        ]),
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
            child: AppButton(label: 'Pay ₹${(app.cartTotal * app.selectedMemberIds.length) + app.homeCollectionFee}', onPressed: app.confirmBooking),
          ),
        ],
      ),
    );
  }
}
