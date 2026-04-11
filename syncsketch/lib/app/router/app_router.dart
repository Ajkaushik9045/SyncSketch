import 'package:go_router/go_router.dart';
import 'package:syncsketch/app/router/route_gaurd.dart';
import 'package:syncsketch/app/router/routes_name.dart';
import 'package:syncsketch/app/router/routes_path.dart';
import 'package:syncsketch/features/home/home.dart';

class AppRouter {
  final bool isLoggedIn;

  AppRouter({required this.isLoggedIn});

  late final GoRouter router = GoRouter(
    initialLocation: RoutesPath.splash,
    redirect: (context, state) {
      return RouteGaurd.authGaurd(isLoggedIn, state.matchedLocation);
    },

    routes: [
      GoRoute(
        name: RoutesName.home,
        path: RoutesPath.home,
        builder: (context, state) => const Home(),
      ),
    ],
  );
}
