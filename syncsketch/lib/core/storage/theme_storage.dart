import "package:flutter/material.dart";
import 'package:shared_preferences/shared_preferences.dart';

class ThemeStorage {
  final SharedPreferences _prefs;
  static const _key = "theme_mode";

  ThemeStorage(this._prefs);

  Future<void> saveTheme(ThemeMode mode) async {
    await _prefs.setString(_key, mode.name);
  }

  ThemeMode loadTheme() {
    final themeString = _prefs.getString(_key);

    // Using a quick search to find the matching enum
    return ThemeMode.values.firstWhere(
      (e) => e.name == themeString,
      orElse: () => ThemeMode.system,
    );
  }
}
