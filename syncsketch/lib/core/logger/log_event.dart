import 'package:syncsketch/core/logger/log_level.dart';

class LogEvent {
  final LogLevel level;
  final String message;
  final Map<String, dynamic>? data;
  final Object? error;
  final StackTrace? stackTrace;
  final DateTime timestamp;

  LogEvent({
    required this.level,
    required this.message,
    this.data,
    this.error,
    this.stackTrace,
  }) : timestamp = DateTime.now();
}
