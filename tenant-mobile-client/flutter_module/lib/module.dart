import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Export the tenant app widget for module integration
class FlutterModuleRoot extends StatelessWidget {
  const FlutterModuleRoot({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const TenantClientApp();
  }
}

// Import the main app widget
export 'main.dart' show TenantClientApp;
