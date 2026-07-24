import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/primary_button.dart';

class BookingSuccessScreen extends StatelessWidget {
  const BookingSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(width: 88, height: 88, decoration: const BoxDecoration(color: AppColors.successTint, shape: BoxShape.circle), child: const Icon(Icons.check, size: 44, color: AppColors.success)),
          const SizedBox(height: 24),
          Text('Booking Confirmed!', style: AppTextStyles.h2, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(style: AppTextStyles.body.copyWith(fontSize: 13.5), children: [
              const TextSpan(text: 'Your booking '),
              TextSpan(text: app.lastBookingId ?? '', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const TextSpan(text: ' is confirmed. Our technician will visit tomorrow, 24 Jul between 7:00 - 8:00 AM.'),
            ]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          AppButton(label: 'View Booking', onPressed: () {
            app.selectedBookingId = app.lastBookingId;
            app.goTab('bookings', 'bookingDetails');
          }),
          const SizedBox(height: 12),
          AppButton(label: 'Back to Home', variant: ButtonVariant.outline, color: const Color(0xFF334155), onPressed: () => app.goTab('home', 'home')),
        ],
      ),
    );
  }
}
