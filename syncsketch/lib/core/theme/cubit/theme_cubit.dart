import 'package:flutter/material.dart';
import 'package:syncsketch/core/storage/theme_storage.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ThemeCubit extends Cubit<ThemeMode> {
  final ThemeStorage storage;

  ThemeCubit(this.storage) : super(ThemeMode.system);

  void loadTheme() {
    final mode = storage.loadTheme();
    emit(mode);
  }

  Future<void> changeTheme(ThemeMode mode) async {
    await storage.saveTheme(mode);
    emit(mode);
  }
}
