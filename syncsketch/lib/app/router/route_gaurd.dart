import 'package:syncsketch/app/router/routes_path.dart';

class RouteGaurd {
  static String? authGaurd(bool isLoggedIn, String location) {
    final isAuthRoute =
        location == RoutesPath.login || location == RoutesPath.signUp;

    if (!isLoggedIn && !isAuthRoute) {
      return RoutesPath.login;
    }

    if (isLoggedIn && isAuthRoute) {
      return RoutesPath.home;
    }
    return null;
  }
}
