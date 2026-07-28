import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class BackHeader extends StatelessWidget {
  final String title;
  final VoidCallback onBack;
  final EdgeInsets? padding;
  final Widget? action;
  const BackHeader({super.key, required this.title, required this.onBack, this.padding, this.action});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsets.fromLTRB(20, 50, 20, 8),
      child: Row(
        children: [
          InkWell(
            onTap: onBack,
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.chevron_left_rounded, size: 24, color: Colors.white),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(child: Text(title, style: AppTextStyles.h2, overflow: TextOverflow.ellipsis)),
          if (action != null) ...[
            const SizedBox(width: 12),
            action!,
          ],
        ],
      ),
    );
  }
}
