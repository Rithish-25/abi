import 'dart:html' as html;
import 'dart:typed_data';

Future<String> downloadFile(String fileName, Uint8List bytes) async {
  final blob = html.Blob([bytes], 'application/pdf');
  final url = html.Url.createObjectUrlFromBlob(blob);
  html.AnchorElement(href: url)
    ..setAttribute('download', fileName)
    ..click();
  html.Url.revokeObjectUrl(url);
  return 'Downloads folder';
}

Future<void> shareFile(String fileName, Uint8List bytes, String subject) async {
  await downloadFile(fileName, bytes);
}
