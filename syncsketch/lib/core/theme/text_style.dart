import 'package:flutter/material.dart';
import 'package:syncsketch/core/theme/theme_extension.dart';

class AppTextStyles {
  static TextStyle body(BuildContext context) =>
      TextStyle(color: context.color.textPrimary);

  static TextStyle headline(BuildContext context) => TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: context.color.textPrimary,
  );
}
