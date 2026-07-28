import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTextStyles {
  AppTextStyles._();
  static TextStyle _base(double size, FontWeight w, Color c, {double? height, double? letterSpacing}) =>
      GoogleFonts.outfit(fontSize: size, fontWeight: w, color: c, height: height, letterSpacing: letterSpacing);

  static TextStyle h1 = _base(22, FontWeight.w800, AppColors.primary, letterSpacing: -0.2);
  static TextStyle h2 = _base(20, FontWeight.w800, AppColors.primary);
  static TextStyle h3 = _base(17, FontWeight.w700, AppColors.primary);
  static TextStyle h4 = _base(15, FontWeight.w700, AppColors.primary);
  static TextStyle bodyBold = _base(14, FontWeight.w600, AppColors.textPrimary);
  static TextStyle body = _base(14, FontWeight.w400, AppColors.textSecondary, height: 1.5);
  static TextStyle bodySmallBold = _base(12.5, FontWeight.w600, AppColors.textPrimary);
  static TextStyle bodySmall = _base(12, FontWeight.w400, AppColors.textSecondary, height: 1.5);
  static TextStyle caption = _base(11, FontWeight.w500, AppColors.textMuted);
  static TextStyle price = _base(16, FontWeight.w700, AppColors.textPrimary);
  static TextStyle priceLg = _base(22, FontWeight.w800, AppColors.textPrimary);
  static TextStyle buttonLabel = _base(15, FontWeight.w700, Colors.white);
  static TextStyle navLabel = _base(10, FontWeight.w600, AppColors.textMuted);

  static InputDecoration inputDecoration({required String hintText}) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMuted),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
      ),
    );
  }
}
