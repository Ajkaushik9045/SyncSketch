import 'package:dio/dio.dart';
import 'package:syncsketch/core/network/interceptors/network_interceptor.dart';

class DioClient {
  final Dio dio;

  DioClient._(this.dio);

  factory DioClient({String baseUrl = 'https://api.syncsketch.com'}) {
    final options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      responseType: ResponseType.json,
    );

    final dio = Dio(options);
    dio.interceptors.add(NetworkInterceptor());

    return DioClient._(dio);
  }

  Dio get client => dio;
}
