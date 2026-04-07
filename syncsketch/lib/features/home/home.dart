import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncsketch/core/theme/app_colors.dart';
import 'package:syncsketch/core/theme/cubit/theme_cubit.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              color: colors.primary,
              child: const Center(child: Text('Primary')),
            ),
            const SizedBox(height: 20),
            Container(
              width: 100,
              height: 100,
              color: colors.surface,
              child: Center(
                child: Text(
                  'Surface',
                  style: TextStyle(color: colors.textPrimary),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              width: 100,
              height: 100,
              color: colors.background,
              child: Center(
                child: Text(
                  'Background',
                  style: TextStyle(color: colors.textPrimary),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                final current = context.read<ThemeCubit>().state;
                final newMode = current == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
                context.read<ThemeCubit>().changeTheme(newMode);
              },
              child: const Text('Toggle Theme'),
            ),
          ],
        ),
      ),
    );
  }
}