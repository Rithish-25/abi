import 'package:flutter/material.dart';

class AppColors {
  AppColors._();
  static const primary = Color(0xFF2563EB);
  static const primaryDark = Color(0xFF1D4ED8);
  static const secondary = Color(0xFF14B8A6);
  static const secondaryDark = Color(0xFF0D9488);
  static const background = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF64748B);
  static const textMuted = Color(0xFF94A3B8);
  static const border = Color(0xFFE2E8F0);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  static const primaryTint = Color(0xFFEFF6FF);
  static const secondaryTint = Color(0xFFF0FDFA);
  static const successTint = Color(0xFFF0FDF4);
  static const warningTint = Color(0xFFFEF3C7);
  static const dangerTint = Color(0xFFFEF2F2);

  static Color statusColor(String status) {
    switch (status) {
      case 'Report Ready':
        return success;
      case 'Sample Collected':
        return warning;
      case 'Confirmed':
        return primary;
      case 'Cancelled':
      case 'Rejected':
        return danger;
      default:
        return textSecondary;
    }
  }

  static Color statusTint(String status) {
    switch (status) {
      case 'Report Ready':
        return successTint;
      case 'Sample Collected':
        return warningTint;
      case 'Confirmed':
        return primaryTint;
      case 'Cancelled':
      case 'Rejected':
        return dangerTint;
      default:
        return const Color(0xFFF1F5F9);
    }
  }
}
