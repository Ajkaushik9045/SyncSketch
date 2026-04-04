// ignore_for_file: public_member_api_docs, sort_constructors_first
import "package:flutter/material.dart";

@immutable
class AppColors extends ThemeExtension<AppColors> {
  final Color primary;
  final Color background;
  final Color surface;
  final Color textPrimary;
  final Color textSecondary;
  final Color border;
  final Color error;

  const AppColors({
    required this.primary,
    required this.background,
    required this.surface,
    required this.textPrimary,
    required this.textSecondary,
    required this.border,
    required this.error,
  });

  @override
  AppColors copyWith({
    Color? primary,
    Color? background,
    Color? surface,
    Color? textPrimary,
    Color? textSecondary,
    Color? border,
    Color? error,
  }) {
    return AppColors(
      primary: primary ?? this.primary,
      background: background ?? this.background,
      surface: surface ?? this.surface,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      border: border ?? this.border,
      error: error ?? this.error,
    );
  }

  @override
  ThemeExtension<AppColors> lerp(
    covariant ThemeExtension<AppColors>? other,
    double t,
  ) {
    if (other is! AppColors) return this;
    return AppColors(
      primary: Color.lerp(primary, other.primary, t)!,
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      border: Color.lerp(border, other.border, t)!,
      error: Color.lerp(error, other.error, t)!,
    );
  }
}

const lightColors = AppColors(
  primary: Color(0xFF0066FF),
  background: Color(0xFFFFFFFF),
  surface: Color(0xFFF5F5F5),
  textPrimary: Color(0xFF111111),
  textSecondary: Color(0xFF666666),
  border: Color(0xFFE0E0E0),
  error: Color(0xFFB00020),
);

const darkColors = AppColors(
  primary: Color(0xFF4D8DFF),
  background: Color(0xFF121212),
  surface: Color(0xFF1E1E1E),
  textPrimary: Color(0xFFFFFFFF),
  textSecondary: Color(0xFFBBBBBB),
  border: Color(0xFF2C2C2C),
  error: Color(0xFFCF6679),
);
