import 'dart:developer';

import 'package:dio/dio.dart';

class NetworkInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';

    log('[NetworkInterceptor] Request: ${options.method} ${options.uri}',
        name: 'NetworkInterceptor');
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    log('[NetworkInterceptor] Response: ${response.statusCode} ${response.requestOptions.uri}',
        name: 'NetworkInterceptor');
    super.onResponse(response, handler);
  }

  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    log('[NetworkInterceptor] Error: ${err.type} ${err.requestOptions.uri} - ${err.message}',
        name: 'NetworkInterceptor');
    super.onError(err, handler);
  }
}
