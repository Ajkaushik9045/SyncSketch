import "package:get_it/get_it.dart";
import "package:shared_preferences/shared_preferences.dart";
import "package:syncsketch/core/network/dio/dio_client.dart";
import "package:syncsketch/core/storage/theme_storage.dart";
import "package:syncsketch/core/theme/cubit/theme_cubit.dart";

final getIt = GetIt.instance;

Future<void> setupDI() async {
  // 1. Initialize SharedPreferences once
  final prefs = await SharedPreferences.getInstance();

  // 2. Register it as a regular Singleton
  getIt.registerSingleton<SharedPreferences>(prefs);

  // 3. Register network client with interceptors
  getIt.registerLazySingleton<DioClient>(() => DioClient());

  // 4. Register ThemeStorage
  getIt.registerLazySingleton<ThemeStorage>(
    () => ThemeStorage(getIt<SharedPreferences>()),
  );

  getIt.registerFactory<ThemeCubit>(() => ThemeCubit(getIt<ThemeStorage>()));
}
