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
                const SizedBox(height: 40),
                Center(
                  child: Container(
                    width: 200,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
                    decoration: BoxDecoration(
                      color: AppColors.primaryTint,
                      border: Border.all(color: AppColors.primary, width: 1.5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                          child: const Icon(Icons.qr_code, color: AppColors.primary, size: 28),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'UPI (Google Pay, PhonePe, Paytm)',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.bodyBold.copyWith(fontSize: 13.5),
                        ),
                      ],
                    ),
                  ),
                ),
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
