import 'package:dio/dio.dart';

import 'package:syncsketch/core/logger/app_logger.dart';
import 'package:syncsketch/core/network/interceptors/network_interceptor.dart';

class DioClient {
  final Dio dio;

  DioClient._(this.dio);

  factory DioClient({
    required AppLogger logger,
    String baseUrl = 'https://api.syncsketch.com',
  }) {
    final options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      responseType: ResponseType.json,
      validateStatus: (status) => status != null && status < 500,
    );

    final dio = Dio(options);

    dio.interceptors.addAll([NetworkInterceptor(logger)]);

    return DioClient._(dio);
  }

  Dio get client => dio;
}
