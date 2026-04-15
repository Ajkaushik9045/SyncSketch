import 'log_event.dart';
import 'log_level.dart';
import 'log_sink.dart';
import 'package:flutter/foundation.dart';

class AppLogger {
  final List<LogSink> _sinks;

  AppLogger(this._sinks);

  void _log(LogEvent event) {
    if (!_shouldLog(event.level)) return;

    for (final sink in _sinks) {
      sink.log(event);
    }
  }

  bool _shouldLog(LogLevel level) {
    if (kDebugMode) return true;

    // In release → only warnings & above
    return level.index >= LogLevel.warning.index;
  }

  void debug(String message, {Map<String, dynamic>? data}) {
    _log(LogEvent(level: LogLevel.debug, message: message, data: data));
  }

  void info(String message, {Map<String, dynamic>? data}) {
    _log(LogEvent(level: LogLevel.info, message: message, data: data));
  }

  void warning(String message, {Map<String, dynamic>? data}) {
    _log(LogEvent(level: LogLevel.warning, message: message, data: data));
  }

  void error(String message, {Object? error, StackTrace? stackTrace}) {
    _log(LogEvent(
      level: LogLevel.error,
      message: message,
      error: error,
      stackTrace: stackTrace,
    ));
  }

  void exception(Object error, StackTrace stackTrace) {
    _log(LogEvent(
      level: LogLevel.exception,
      message: error.toString(),
      error: error,
      stackTrace: stackTrace,
    ));
  }
}