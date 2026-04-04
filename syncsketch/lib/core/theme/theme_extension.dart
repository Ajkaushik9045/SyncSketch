import 'package:flutter/material.dart';
import 'package:syncsketch/core/theme/app_colors.dart';

extension ThemeX on BuildContext {
  AppColors get color => Theme.of(this).extension<AppColors>()!;
}
