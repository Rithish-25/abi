import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<String> downloadFile(String fileName, Uint8List bytes) async {
  File? file;
  try {
    if (Platform.isAndroid) {
      final downloadDir = Directory('/storage/emulated/0/Download');
      if (await downloadDir.exists()) {
        file = File('${downloadDir.path}/$fileName');
        await file.writeAsBytes(bytes);
      }
    }
  } catch (e) {
    // Ignore and fallback
  }

  if (file == null) {
    final directory = await getApplicationDocumentsDirectory();
    file = File('${directory.path}/$fileName');
    await file.writeAsBytes(bytes);
  }

  return file.path;
}

Future<void> shareFile(String fileName, Uint8List bytes, String subject) async {
  final directory = await getTemporaryDirectory();
  final file = File('${directory.path}/$fileName');
  await file.writeAsBytes(bytes);
  await Share.shareXFiles([XFile(file.path)], subject: subject);
}
