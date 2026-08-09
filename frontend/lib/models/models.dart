class BloodTest {
  final String id;
  final String name;
  final String short;
  final String desc;
  final int price;
  final int mrp;
  final bool fasting;
  final String sample;
  final String report;
  final String prep;
  final bool isPackage;
  final List<String> includedTestIds;
  final String image;

  const BloodTest({
    required this.id,
    required this.name,
    required this.short,
    required this.desc,
    required this.price,
    required this.mrp,
    required this.fasting,
    required this.sample,
    required this.report,
    required this.prep,
    this.isPackage = false,
    this.includedTestIds = const [],
    this.image = '',
  });

  int get discountPct => mrp == 0 ? 0 : (100 - (price * 100 / mrp)).round();
}

class Category {
  final String id;
  final String label;
  final IconDataRef icon;
  const Category(this.id, this.label, this.icon);
}

/// Lightweight enum-like ref so we don't need to import material in models.
enum IconDataRef { blood, packages, diabetes, heart, thyroid, fever }

class FamilyMember {
  final int id;
  String name;
  String relation;
  String age;
  String gender;
  FamilyMember({required this.id, required this.name, required this.relation, required this.age, required this.gender});
  String get initial => name.isNotEmpty ? name[0] : '?';
}

class SavedAddress {
  final int id;
  String label;
  String line;
  String phone;
  SavedAddress({required this.id, required this.label, required this.line, required this.phone});
}

class Booking {
  final String id;
  final String date;
  final List<String> testNames;
  final String member;
  String status; // Confirmed, Sample Collected, Report Ready, Cancelled
  final int amount;
  final String address;
  final String slot;
  final String paymentMethod; // upi, cod
  // Each entry: { status: <String>, timestamp: <ISO 8601 String> } — one immutable record per status change
  final List<Map<String, dynamic>> statusHistory;

  Booking({
    required this.id,
    required this.date,
    required this.testNames,
    required this.member,
    required this.status,
    required this.amount,
    required this.address,
    required this.slot,
    required this.paymentMethod,
    this.statusHistory = const [],
  });

  String get testSummary => testNames.join(' + ');

  // Finds this status's own timestamp in the history, if the admin has ever set it
  DateTime? timestampFor(String status) {
    for (final entry in statusHistory.reversed) {
      if (entry['status'] == status && entry['timestamp'] != null) {
        return DateTime.tryParse(entry['timestamp'].toString())?.toLocal();
      }
    }
    return null;
  }
}

class LabReport {
  final String id;
  final String name;
  final String date;
  final String member;
  final String status; // Report Ready, Pending
  const LabReport({required this.id, required this.name, required this.date, required this.member, this.status = 'Report Ready'});
}

class ReportRow {
  final String name;
  final String value;
  final String range;
  final bool abnormal;
  const ReportRow({required this.name, required this.value, required this.range, this.abnormal = false});
}

class MedicalRecord {
  final int id;
  final String type; // prescription | report
  final String title;
  final String date;
  final String notes;
  final String imageUrl;

  const MedicalRecord({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    this.notes = '',
    this.imageUrl = '',
  });
}

class AppNotification {
  final int id;
  final String kind; // check, report, truck, offer
  final String title;
  final String body;
  final String time;
  bool read;
  AppNotification({
    required this.id,
    required this.kind,
    required this.title,
    required this.body,
    required this.time,
    this.read = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'kind': kind,
    'title': title,
    'body': body,
    'time': time,
    'read': read,
  };

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as int,
      kind: json['kind'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      time: json['time'] as String,
      read: json['read'] as bool? ?? false,
    );
  }
}

class Complaint {
  final String id;
  final String userId; // phone number of the submitting user
  final String userName;
  final String message;
  final String status; // 'Pending Response' | 'Admin Responded' | 'Resolved'
  final String adminReply;
  final String timestamp; // ISO 8601, for sorting
  final String dateString; // human-readable, for display
  final String repliedDateString;

  const Complaint({
    required this.id,
    required this.userId,
    required this.userName,
    required this.message,
    required this.status,
    this.adminReply = '',
    this.timestamp = '',
    this.dateString = '',
    this.repliedDateString = '',
  });
}

class DoctorPatient {
  final int id;
  final String name;
  final String phone;
  final List<String> tests;
  final String date;
  String status;
  final int commission;
  DoctorPatient({
    required this.id,
    required this.name,
    required this.phone,
    required this.tests,
    required this.date,
    required this.status,
    required this.commission,
  });
  String get testSummary => tests.join(' + ');
}
