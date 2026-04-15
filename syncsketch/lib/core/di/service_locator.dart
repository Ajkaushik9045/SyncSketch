import "package:get_it/get_it.dart";
import "package:shared_preferences/shared_preferences.dart";
import "package:syncsketch/core/logger/app_logger.dart";
import "package:syncsketch/core/logger/talker_sink.dart";
import "package:syncsketch/core/network/dio/dio_client.dart";
import "package:syncsketch/core/storage/theme_storage.dart";
import "package:syncsketch/core/theme/cubit/theme_cubit.dart";
import "package:talker/talker.dart";

final getIt = GetIt.instance;

Future<void> setupDI() async {
  // 1. Initialize SharedPreferences once
  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);


  final talker = Talker();
  getIt.registerSingleton<Talker>(talker);

  final logger = AppLogger([TalkerSink(talker)]);
  getIt.registerSingleton<AppLogger>(logger);


  // 3. Register network client with interceptors
  getIt.registerLazySingleton<DioClient>(() => DioClient(logger: logger));

  // 4. Register ThemeStorage
  getIt.registerLazySingleton<ThemeStorage>(
    () => ThemeStorage(getIt<SharedPreferences>()),
  );

  getIt.registerFactory<ThemeCubit>(() => ThemeCubit(getIt<ThemeStorage>()));
}
