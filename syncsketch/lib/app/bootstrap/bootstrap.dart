import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncsketch/app/app.dart';
import 'package:syncsketch/core/di/service_locator.dart';
import 'package:syncsketch/core/theme/cubit/theme_cubit.dart';

Future<Widget> bootstrap() async {
  await setupDI();

  final themeCubit = getIt<ThemeCubit>();
  themeCubit.loadTheme();

  return BlocProvider(create: (_) => themeCubit, child: const App());
}
