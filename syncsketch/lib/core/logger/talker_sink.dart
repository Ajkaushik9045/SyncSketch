
import 'package:syncsketch/core/logger/log_event.dart';
import 'package:syncsketch/core/logger/log_sink.dart';
import 'package:syncsketch/core/logger/log_level.dart';
import 'package:talker/talker.dart' hide LogLevel;


class TalkerSink implements LogSink {
  final Talker _talker;

  TalkerSink(this._talker);

  @override
  void log(LogEvent event) {
    final message = _formatMessage(event);

    switch (event.level) {
      case LogLevel.debug:
        _talker.debug(message);
        break;
      case LogLevel.info:
        _talker.info(message);
        break;
      case LogLevel.warning:
        _talker.warning(message);
        break;
      case LogLevel.error:
        _talker.error(message, event.error, event.stackTrace);
        break;
      case LogLevel.exception:
        _talker.handle(event.error!, event.stackTrace);
        break;
    }
  }

  String _formatMessage(LogEvent event) {
    if (event.data == null) return event.message;

    return '${event.message} | data: ${event.data}';
  }
}