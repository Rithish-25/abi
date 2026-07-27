import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) context.read<AppState>().goNextFromSplash();
    });
  }

  @override
  Widget build(BuildContext context) {
    return const ColoredBox(
      color: Colors.white,
      child: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 32),
          child: Image(
            image: AssetImage('assets/splah.jpg'),
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
