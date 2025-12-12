import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:firebase_auth/firebase_auth.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const TenantClientApp());
}

class TenantClientApp extends StatelessWidget {
  const TenantClientApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tenant Client',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}

// Simple API client for auth and requests
class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  // Configure your backend base URL via --dart-define=API_BASE=https://api.example.com
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://10.0.2.2:5010',
  );

  Future<LoginResult> loginWithFirebase({required String email, required String password}) async {
    // Try local backend auth first (for testing)
    try {
      final response = await _client.post(
        Uri.parse('$_baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'identifier': email, 'password': password}),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token'] as String?;
        final user = data['user'] as Map?;
        if (token == null) throw Exception('No token in response');
        final displayName = (user?['username'] ?? email) as String;
        return LoginResult(token: token, displayName: displayName);
      } else {
        throw Exception('Login failed: ${response.statusCode}');
      }
    } catch (e) {
      // Fallback to Firebase if backend auth fails
      try {
        final credential = await FirebaseAuth.instance.signInWithEmailAndPassword(email: email, password: password);
        final user = credential.user;
        if (user == null) {
          throw Exception('Firebase login failed');
        }
        final idToken = await user.getIdToken();
        if (idToken == null || idToken.isEmpty) {
          throw Exception('Failed to obtain Firebase ID token');
        }
        final displayName = user.displayName ?? user.email ?? email;
        return LoginResult(token: idToken, displayName: displayName);
      } catch (firebaseError) {
        throw Exception('Both backend and Firebase auth failed: $e, Firebase: $firebaseError');
      }
    }
  }
}

class LoginResult {
  LoginResult({required this.token, required this.displayName});
  final String token;
  final String displayName;
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _api = ApiClient();
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await _api.loginWithFirebase(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => TenantDashboard(
            tenantName: result.displayName,
            token: result.token,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Card(
            elevation: 4,
            margin: const EdgeInsets.all(24),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      'Tenant Login',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) => (v == null || v.isEmpty) ? 'Email is required' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _passwordController,
                      decoration: const InputDecoration(labelText: 'Password'),
                      obscureText: true,
                      validator: (v) => (v == null || v.isEmpty) ? 'Password is required' : null,
                    ),
                    const SizedBox(height: 16),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                      ),
                    ElevatedButton(
                      onPressed: _loading ? null : _handleLogin,
                      child: _loading
                          ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Login'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class TenantDashboard extends StatefulWidget {
  const TenantDashboard({super.key, required this.tenantName, required this.token});

  final String tenantName;
  final String token;

  @override
  State<TenantDashboard> createState() => _TenantDashboardState();
}

class _TenantDashboardState extends State<TenantDashboard> {
  final List<ServiceRequest> _requests = [
    ServiceRequest(title: 'Leaking faucet', status: RequestStatus.open, createdAt: DateTime.now().subtract(const Duration(days: 1))),
    ServiceRequest(title: 'Aircon maintenance', status: RequestStatus.inProgress, createdAt: DateTime.now().subtract(const Duration(days: 3))),
  ];

  void _addRequest(ServiceRequest request) {
    setState(() {
      _requests.insert(0, request);
    });
  }

  void _openNewRequestDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: NewRequestSheet(onSubmit: _addRequest),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tenant Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const LoginScreen()),
              (_) => false,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openNewRequestDialog,
        icon: const Icon(Icons.add),
        label: const Text('New Request'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Welcome, ${widget.tenantName}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('Submit maintenance requests and track status.'),
            const SizedBox(height: 16),
            Expanded(
              child: _requests.isEmpty
                  ? const Center(child: Text('No requests yet. Tap “New Request”.'))
                  : ListView.separated(
                      itemCount: _requests.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final r = _requests[index];
                        return Card(
                          child: ListTile(
                            title: Text(r.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('Created ${_friendlyDate(r.createdAt)}'),
                            trailing: _StatusChip(status: r.status),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class NewRequestSheet extends StatefulWidget {
  const NewRequestSheet({super.key, required this.onSubmit});

  final void Function(ServiceRequest request) onSubmit;

  @override
  State<NewRequestSheet> createState() => _NewRequestSheetState();
}

class _NewRequestSheetState extends State<NewRequestSheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    // TODO: Replace with API call to Property Management backend
    await Future.delayed(const Duration(milliseconds: 500));
    widget.onSubmit(
      ServiceRequest(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        status: RequestStatus.open,
        createdAt: DateTime.now(),
      ),
    );
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('New Request', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Title'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Title is required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
}

class ServiceRequest {
  ServiceRequest({
    required this.title,
    this.description,
    required this.status,
    required this.createdAt,
  });

  final String title;
  final String? description;
  final RequestStatus status;
  final DateTime createdAt;
}

enum RequestStatus { open, inProgress, closed }

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final RequestStatus status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      RequestStatus.open => Colors.orange,
      RequestStatus.inProgress => Colors.blue,
      RequestStatus.closed => Colors.green,
    };
    final label = switch (status) {
      RequestStatus.open => 'Open',
      RequestStatus.inProgress => 'In Progress',
      RequestStatus.closed => 'Closed',
    };
    return Chip(label: Text(label), backgroundColor: color.withOpacity(0.12), labelStyle: TextStyle(color: color));
  }
}

String _friendlyDate(DateTime dt) {
  final now = DateTime.now();
  final diff = now.difference(dt);
  if (diff.inDays >= 1) return '${diff.inDays}d ago';
  if (diff.inHours >= 1) return '${diff.inHours}h ago';
  return '${diff.inMinutes}m ago';
}
