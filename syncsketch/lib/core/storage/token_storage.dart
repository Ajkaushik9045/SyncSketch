import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  final FlutterSecureStorage storage;

  TokenStorage(this.storage);

  static const _access = "access_token";
  static const _refresh = "refresh_token";

  Future<void> saveToken({
    required String access,
    required String refresh,
  }) async {
    await storage.write(key: _access, value: access);
    await storage.write(key: _refresh, value: refresh);
  }

  Future<String?> getAccessToken() async {
    return await storage.read(key: _access);
  }

  Future<String?> getRefreshToken() async {
    return await storage.read(key: _refresh);
  }

  Future<void> clearToken() async {
    await storage.deleteAll();
  }
}
