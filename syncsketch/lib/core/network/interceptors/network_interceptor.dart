
import 'package:dio/dio.dart';
import 'package:syncsketch/core/logger/app_logger.dart';

class NetworkInterceptor extends Interceptor {
  final AppLogger logger;

  NetworkInterceptor(this.logger);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';

    logger.info(
      "Api Request",
      data: {"methods": options.method, "url": options.uri.toString()},
    );
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    logger.info(
      'API Response',
      data: {
        'statusCode': response.statusCode,
        'url': response.requestOptions.uri.toString(),
      },
    );
    super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    logger.error('API Error', error: err, stackTrace: err.stackTrace);
    super.onError(err, handler);
  }
}
