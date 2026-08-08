import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/back_header.dart';

String _formatStatusTimestamp(DateTime dt) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final day = dt.day.toString().padLeft(2, '0');
  final month = months[dt.month - 1];
  final year = dt.year.toString();
  int hour = dt.hour % 12;
  if (hour == 0) hour = 12;
  final minute = dt.minute.toString().padLeft(2, '0');
  final ampm = dt.hour >= 12 ? 'PM' : 'AM';
  return '$day $month $year, $hour:$minute $ampm';
}

class BookingDetailsScreen extends StatelessWidget {
  const BookingDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final b = app.selectedBookingObj;
    final pipeline = ['Pending', 'Confirmed', 'Sample Collected', 'Under Process', 'Report Ready'];
    final isCancelled = b.status == 'Cancelled' || b.status == 'Rejected';
    
    int curIdx = 0;
    if (b.status == 'Confirmed') {
      curIdx = 1;
    } else if (b.status == 'Sample Collected') {
      curIdx = 2;
    } else if (b.status == 'Under Process') {
      curIdx = 3;
    } else if (b.status == 'Report Ready') {
      curIdx = 4;
    }

    Color circleColor(int i) {
      if (i > curIdx) return const Color(0xFFE2E8F0);
      switch (i) {
        case 0: return const Color(0xFFF97316); // Orange
        case 1: return const Color(0xFFDC2626); // Red
        case 2: return const Color(0xFF16A34A); // Green
        case 3: return const Color(0xFF2563EB); // Blue
        case 4: return const Color(0xFF16A34A); // Green
        default: return const Color(0xFF16A34A);
      }
    }

    Color lineColor(int i) {
      if (i >= curIdx) return const Color(0xFFE2E8F0);
      switch (i) {
        case 0: return const Color(0xFFF97316);
        case 1: return const Color(0xFFDC2626);
        case 2: return const Color(0xFF16A34A);
        case 3: return const Color(0xFF2563EB);
        default: return const Color(0xFF16A34A);
      }
    }

    String getSub(String step) {
      switch (step) {
        case 'Pending': return 'Booking received';
        case 'Confirmed': return b.slot;
        case 'Sample Collected': return 'Technician visited & collected sample';
        case 'Under Process': return 'Processing at central lab';
        case 'Report Ready': return 'Report published & ready to view';
        default: return '';
      }
    }

    final rejectedAt = b.timestampFor('Rejected');

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          BackHeader(title: 'Booking ${b.id}', onBack: app.back),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _Card(
                  child: isCancelled
                      ? Row(children: [
                          const Icon(Icons.cancel, color: AppColors.danger),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(b.status == 'Rejected' ? 'This booking was rejected' : 'This booking was cancelled', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                              if (b.status == 'Rejected' && rejectedAt != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 2),
                                  child: Text(_formatStatusTimestamp(rejectedAt), style: AppTextStyles.caption),
                                ),
                            ]),
                          ),
                        ])
                      : Column(
                          children: List.generate(pipeline.length, (i) {
                            final done = i <= curIdx;
                            final sub = getSub(pipeline[i]);
                            final changedAt = b.timestampFor(pipeline[i]);
                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(children: [
                                  Container(width: 22, height: 22, decoration: BoxDecoration(color: circleColor(i), shape: BoxShape.circle), child: done ? const Icon(Icons.check, size: 12, color: Colors.white) : null),
                                  if (i < pipeline.length - 1) Container(width: 2, height: 36, color: lineColor(i)),
                                ]),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.only(bottom: 20),
                                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                      Text(pipeline[i], style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: done ? AppColors.textPrimary : AppColors.textMuted)),
                                      if (done) Text(sub, style: AppTextStyles.caption),
                                      if (done && changedAt != null)
                                        Padding(
                                          padding: const EdgeInsets.only(top: 1),
                                          child: Text(_formatStatusTimestamp(changedAt), style: AppTextStyles.caption),
                                        ),
                                    ]),
                                  ),
                                ),
                              ],
                            );
                          }),
                        ),
                ),
                const SizedBox(height: 14),
                _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('TESTS BOOKED', style: AppTextStyles.caption.copyWith(letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  ...b.testNames.map((n) => Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Text(n, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w500, color: Color(0xFF334155))))),
                ])),
                const SizedBox(height: 14),
                _Card(child: Column(children: [
                  _Row('Patient', b.member),
                  _Row('Slot', b.slot),
                  _Row('Amount paid', '₹${b.amount}'),
                  _Row('Address', b.address),
                ])),
                const SizedBox(height: 14),
                 if (b.status == 'Report Ready') ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: SizedBox(
                      width: double.infinity,
                      height: 36,
                      child: ElevatedButton(
                        onPressed: app.openBookingReport,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF15803D), // solid green fill
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text(
                          'View Report',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                const SizedBox(height: 20),
              ],
            ),
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
  const _Row(this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary))),
        ]),
      );
}
