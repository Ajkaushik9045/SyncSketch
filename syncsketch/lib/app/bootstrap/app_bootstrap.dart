import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:syncsketch/core/errors/error_handler.dart';
import 'package:talker_flutter/talker_flutter.dart';

Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  // 1. Setup Talker & Global Handler
  final talker = TalkerFlutter.init(
    settings: TalkerSettings(enabled: true, useConsoleLogs: true),
  );
  GlobalErrorHandler.init(talker);

  // 2. Capture Flutter Framework errors
  FlutterError.onError = (details) {
    GlobalErrorHandler.log(
      details.exception,
      details.stack,
      "Flutter Framework Error",
    );
  };

  // 3. Capture errors outside the Flutter context (Zones)
  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      // Catch errors in the Platform Dispatcher (Native/Async)
      PlatformDispatcher.instance.onError = (error, stack) {
        GlobalErrorHandler.log(error, stack, "Platform Error");
        return true;
      };

      // TODO: Add other async inits here (Firebase, Hive, etc.)
      // await Firebase.initializeApp();

      runApp(await builder());
    },
    (error, stackTrace) =>
        GlobalErrorHandler.log(error, stackTrace, "Uncaught Async Error"),
  );
}
