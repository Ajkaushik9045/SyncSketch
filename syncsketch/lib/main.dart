import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:syncsketch/app/bootstrap/bootstrap.dart';

void main() async {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  final app = await bootstrap();
  FlutterNativeSplash.remove();
  runApp(app);
}
