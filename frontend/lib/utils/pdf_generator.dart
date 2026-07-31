import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../models/models.dart';

Future<Uint8List> generateReportPdf(LabReport report, List<ReportRow> rows, {String labName = 'Abirami Laboratory', String labPhone = '9894913330'}) async {
  final pdf = pw.Document();

  pdf.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a4,
      build: (pw.Context context) {
        return pw.Padding(
          padding: const pw.EdgeInsets.all(24),
          child: pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Container(
                decoration: pw.BoxDecoration(
                  color: PdfColors.white,
                  border: pw.Border.all(color: const PdfColor.fromInt(0xFFE2E8F0), width: 1.5),
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(12)),
                ),
                child: pw.Column(
                  mainAxisSize: pw.MainAxisSize.min,
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    // 1. Blue Header (Matches App Theme)
                    pw.Container(
                      width: double.infinity,
                      padding: const pw.EdgeInsets.all(16),
                      decoration: const pw.BoxDecoration(
                        color: PdfColor.fromInt(0xFF2563EB), // Blue primary
                        borderRadius: pw.BorderRadius.only(
                          topLeft: pw.Radius.circular(10.5),
                          topRight: pw.Radius.circular(10.5),
                        ),
                      ),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            labName,
                            style: pw.TextStyle(
                              color: PdfColors.white,
                              fontWeight: pw.FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          pw.SizedBox(height: 2),
                          pw.Text(
                            'Thindal, Erode · NABL Accredited · Phone: $labPhone',
                            style: const pw.TextStyle(
                              color: PdfColor.fromInt(0xE6FFFFFF),
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // 2. Patient Details Row
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: const pw.BoxDecoration(
                        border: pw.Border(
                          bottom: pw.BorderSide(color: PdfColor.fromInt(0xFFE2E8F0), width: 1.5),
                        ),
                      ),
                      child: pw.Row(
                        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                        children: [
                          pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text(
                                'PATIENT NAME',
                                style: const pw.TextStyle(
                                  fontSize: 9,
                                  color: PdfColor.fromInt(0xFF94A3B8),
                                ),
                              ),
                              pw.SizedBox(height: 2),
                              pw.Text(
                                report.member,
                                style: pw.TextStyle(
                                  fontWeight: pw.FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.end,
                            children: [
                              pw.Text(
                                'REPORT DATE',
                                style: const pw.TextStyle(
                                  fontSize: 9,
                                  color: PdfColor.fromInt(0xFF94A3B8),
                                ),
                              ),
                              pw.SizedBox(height: 2),
                              pw.Text(
                                report.date,
                                style: pw.TextStyle(
                                  fontWeight: pw.FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // 3. Parameters Table Block (Aligned)
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(16),
                      child: pw.Column(
                        children: [
                          pw.Row(
                            children: [
                              pw.Expanded(
                                flex: 3,
                                child: pw.Text(
                                  'PARAMETER',
                                  style: pw.TextStyle(
                                    fontSize: 10,
                                    fontWeight: pw.FontWeight.bold,
                                    color: const PdfColor.fromInt(0xFF94A3B8),
                                  ),
                                ),
                              ),
                              pw.Expanded(
                                flex: 2,
                                child: pw.Text(
                                  'RESULT',
                                  style: pw.TextStyle(
                                    fontSize: 10,
                                    fontWeight: pw.FontWeight.bold,
                                    color: const PdfColor.fromInt(0xFF94A3B8),
                                  ),
                                ),
                              ),
                              pw.Expanded(
                                flex: 2,
                                child: pw.Text(
                                  'REFERENCE RANGE',
                                  style: pw.TextStyle(
                                    fontSize: 10,
                                    fontWeight: pw.FontWeight.bold,
                                    color: const PdfColor.fromInt(0xFF94A3B8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          pw.SizedBox(height: 6),
                          pw.Divider(color: const PdfColor.fromInt(0xFFE2E8F0), thickness: 1),
                          pw.SizedBox(height: 6),
                          ...rows.map((row) {
                            return pw.Padding(
                              padding: const pw.EdgeInsets.symmetric(vertical: 6),
                              child: pw.Row(
                                children: [
                                  pw.Expanded(
                                    flex: 3,
                                    child: pw.Text(
                                      row.name,
                                      style: const pw.TextStyle(
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                  pw.Expanded(
                                    flex: 2,
                                    child: pw.Text(
                                      row.value,
                                      style: pw.TextStyle(
                                        fontSize: 12,
                                        fontWeight: pw.FontWeight.bold,
                                        color: row.abnormal
                                            ? const PdfColor.fromInt(0xFFEF4444) // Abnormal/High (Red)
                                            : const PdfColor.fromInt(0xFF22C55E), // Normal (Green)
                                      ),
                                    ),
                                  ),
                                  pw.Expanded(
                                    flex: 2,
                                    child: pw.Text(
                                      row.range,
                                      style: const pw.TextStyle(
                                        fontSize: 11,
                                        color: PdfColor.fromInt(0xFF64748B),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Padding(
                padding: const pw.EdgeInsets.symmetric(horizontal: 4),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'Report ID: ${report.id}',
                      style: const pw.TextStyle(
                        fontSize: 9,
                        color: PdfColor.fromInt(0xFF94A3B8),
                      ),
                    ),
                    pw.Text(
                      'Abirami Laboratory - Certified PDF Report',
                      style: const pw.TextStyle(
                        fontSize: 9,
                        color: PdfColor.fromInt(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    ),
  );

  return pdf.save();
}
