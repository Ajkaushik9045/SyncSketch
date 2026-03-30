import 'package:flutter/material.dart';
import 'package:syncsketch/core/errors/error_handler.dart';
import 'package:talker_flutter/talker_flutter.dart';


class SyncSketch extends StatelessWidget {
  const SyncSketch({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Robust Flutter App',
      // Automatically logs every screen change
      navigatorObservers: [TalkerRouteObserver(GlobalErrorHandler.talker)],
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () => throw Exception("Manual Crash Test!"),
              child: const Text('Trigger Error'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.black12),
              onPressed: () {
                // Open the Talker Monitor UI
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => TalkerScreen(talker: GlobalErrorHandler.talker),
                ));
              },
              child: const Text('Open Logs Monitor'),
            ),
          ],
        ),
      ),
    );
  }
}