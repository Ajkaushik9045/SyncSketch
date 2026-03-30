import 'package:talker_flutter/talker_flutter.dart';

class GlobalErrorHandler {
  static late final Talker talker;

  static void init(Talker talkerInstance) {
    talker = talkerInstance;
  }

  //Primary method to log error across the app
  static void log(Object error, [StackTrace? stack, String? message]) {
    talker.handle(error, stack, message);

    // Example: Add your production analytics here
    // FirebaseCrashlytics.instance.recordError(error, stack);
  }

  static void info(String message) => talker.info(message);
}
