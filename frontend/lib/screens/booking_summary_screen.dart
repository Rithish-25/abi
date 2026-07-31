import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';
import '../widgets/primary_button.dart';

class BookingSummaryScreen extends StatelessWidget {
  const BookingSummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final items = app.cartItems;
    final member = app.selectedMember;
    final address = app.selectedAddress;
    final selectedMembers = app.family.where((m) => app.selectedMemberIds.contains(m.id)).toList();

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Booking Summary', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('TESTS', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                  const SizedBox(height: 10),
                  ...items.map((c) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Expanded(child: Text(c.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF334155)))),
                          Text('₹${c.price}', style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                        ]),
                      )),
                ])),
                const SizedBox(height: 14),
                _Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('PATIENTS (${selectedMembers.length})', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                          GestureDetector(
                            onTap: () => app.go('selectMember'),
                            child: const Text('Change', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ...selectedMembers.map((m) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 14,
                                  backgroundColor: AppColors.primaryTint,
                                  child: Text(
                                    m.name.isNotEmpty ? m.name[0].toUpperCase() : '',
                                    style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(m.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 13)),
                                    Text('${m.relation} · ${m.age} yrs · ${m.gender}', style: AppTextStyles.bodySmall.copyWith(fontSize: 11)),
                                  ],
                                ),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _Card(child: Row(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('COLLECTION ADDRESS', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                    const SizedBox(height: 4),
                    Text(address.label, style: AppTextStyles.bodyBold.copyWith(fontSize: 14)),
                    Text(address.line, style: AppTextStyles.bodySmall.copyWith(fontSize: 12)),
                  ])),
                  GestureDetector(onTap: () => app.go('selectAddress'), child: const Text('Change', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600))),
                ])),
                const SizedBox(height: 14),
                _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('SLOT', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                  const SizedBox(height: 10),
                  const Text('Tomorrow, 24 Jul · 7:00 - 8:00 AM', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  Text(app.homeCollectionFee > 0 ? 'Home sample collection fee: ₹${app.homeCollectionFee}' : 'Free home sample collection', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ])),
                const SizedBox(height: 14),
                _Card(child: Column(children: [
                  _Row('Item total', '₹${app.cartMrpTotal * selectedMembers.length}'),
                  _Row('Discount', '-₹${app.cartSavings * selectedMembers.length}', color: AppColors.success),
                  _Row('Home collection fee', app.homeCollectionFee > 0 ? '₹${app.homeCollectionFee}' : 'Free', color: app.homeCollectionFee > 0 ? AppColors.textPrimary : AppColors.success),
                  const Divider(height: 20, color: AppColors.border),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('To pay', style: AppTextStyles.bodyBold.copyWith(fontSize: 14)),
                    Text('₹${(app.cartTotal * selectedMembers.length) + app.homeCollectionFee}', style: AppTextStyles.h2.copyWith(fontSize: 17)),
                  ]),
                ])),
                const SizedBox(height: 16),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
            child: AppButton(label: 'Proceed to Pay · ₹${(app.cartTotal * selectedMembers.length) + app.homeCollectionFee}', onPressed: () => app.go('payment')),
          ),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
        child: child,
      );
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  const _Row(this.label, this.value, {this.color});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: color ?? AppColors.textPrimary)),
        ]),
      );
}
