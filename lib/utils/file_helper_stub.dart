import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<void> downloadFile(String fileName, Uint8List bytes) async {
  final directory = await getApplicationDocumentsDirectory();
  final file = File('${directory.path}/$fileName');
  await file.writeAsBytes(bytes);
  
  // On mobile, downloading saves the file and opens a share sheet so the user can save or open it
  await Share.shareXFiles([XFile(file.path)], text: 'Saved report $fileName');
}

Future<void> shareFile(String fileName, Uint8List bytes, String subject) async {
  final directory = await getTemporaryDirectory();
  final file = File('${directory.path}/$fileName');
  await file.writeAsBytes(bytes);
  await Share.shareXFiles([XFile(file.path)], subject: subject);
}
