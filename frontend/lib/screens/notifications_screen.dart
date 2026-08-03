import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';

IconData _notifIcon(String kind) {
  switch (kind) {
    case 'report':
      return Icons.description;
    case 'truck':
      return Icons.water_drop;
    case 'check':
      return Icons.calendar_month;
    case 'offer':
      return Icons.wallet;
    default:
      return Icons.home;
  }
}

Color _notifBg(String kind) {
  switch (kind) {
    case 'report':
      return const Color(0xFF14532D); // Dark green
    case 'truck':
      return const Color(0xFF15803D); // Vibrant green
    case 'check':
      return const Color(0xFFB91C1C); // Red
    case 'offer':
      return const Color(0xFF7E22CE); // Purple
    default:
      return const Color(0xFFC2410C); // Orange
  }
}

Color _notifColor(String kind) {
  return Colors.white;
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(
            title: 'Notifications',
            onBack: app.back,
            action: app.notifications.isNotEmpty
                ? TextButton(
                    onPressed: app.clearNotifications,
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'Clear All',
                      style: AppTextStyles.bodyBold.copyWith(
                        color: AppColors.primary,
                        fontSize: 14,
                      ),
                    ),
                  )
                : null,
          ),
          Expanded(
            child: app.notifications.isEmpty
                ? Center(
                    child: Text(
                      'No notifications yet',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                    itemCount: app.notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final n = app.notifications[i];
                      return Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                            color: n.read ? AppColors.background : Colors.white,
                            border: Border.all(color: AppColors.border),
                            borderRadius: BorderRadius.circular(16)),
                        child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                      color: _notifBg(n.kind),
                                      borderRadius: BorderRadius.circular(10)),
                                  child: Icon(_notifIcon(n.kind),
                                      color: _notifColor(n.kind), size: 18)),
                              const SizedBox(width: 12),
                              Expanded(
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                    Text(n.title,
                                        style: AppTextStyles.bodyBold
                                            .copyWith(fontSize: 13)),
                                    const SizedBox(height: 3),
                                    Text(n.body,
                                        style: AppTextStyles.bodySmall
                                            .copyWith(fontSize: 12)),
                                    const SizedBox(height: 4),
                                    Text(n.time, style: AppTextStyles.caption),
                                  ])),
                            ]),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
