import "package:flutter/material.dart";
import "package:syncsketch/core/theme/app_colors.dart";

class AppTheme {
  static ThemeData light = _buildTheme(lightColors, Brightness.light);

  static ThemeData _buildTheme(AppColors colors, Brightness brightness) {
    return ThemeData(
      brightness: brightness,
      scaffoldBackgroundColor: colors.background,
      primaryColor: colors.primary,
      extensions: [colors],

      appBarTheme: AppBarTheme(
        backgroundColor: colors.surface,
        foregroundColor: colors.textPrimary,
        elevation: 0,
      ),
      dividerColor: colors.border,
      cardColor: colors.surface,

      textTheme: TextTheme(
        bodySmall: TextStyle(color: colors.textSecondary),
        bodyMedium: TextStyle(color: colors.textPrimary),
      ),

      colorScheme: ColorScheme(
        brightness: brightness,
        primary: colors.primary,
        onPrimary: Colors.white,
        secondary: colors.primary,
        onSecondary: Colors.white,
        error: colors.error,
        onError: Colors.white,
        surface: colors.surface,
        onSurface: colors.textPrimary,
      ),
    );
  }
}
