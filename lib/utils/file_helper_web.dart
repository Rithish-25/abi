import 'dart:html' as html;
import 'dart:typed_data';

Future<void> downloadFile(String fileName, Uint8List bytes) async {
  final blob = html.Blob([bytes], 'application/pdf');
  final url = html.Url.createObjectUrlFromBlob(blob);
  html.AnchorElement(href: url)
    ..setAttribute('download', fileName)
    ..click();
  html.Url.revokeObjectUrl(url);
}

Future<void> shareFile(String fileName, Uint8List bytes, String subject) async {
  // On web browsers, sharing a generated binary file is done by downloading it
  await downloadFile(fileName, bytes);
}
