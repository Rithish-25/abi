import '../models/models.dart';

class MockData {
  static const List<BloodTest> tests = [
    BloodTest(
      id: 'cbc', name: 'CBC (Complete Blood Count)', short: 'Complete Blood Count',
      desc: 'Measures red cells, white cells & platelets to detect infections, anemia and blood disorders.',
      price: 299, mrp: 399, fasting: false, sample: 'Blood', report: 'Same day, by 6:00 PM',
      prep: 'No special preparation needed.',
      image: 'assets/cbc.jpg',
    ),
    BloodTest(
      id: 'sugar', name: 'Blood Sugar (Fasting / PP / HbA1c)', short: 'Blood Sugar',
      desc: 'Tracks fasting & post-meal glucose plus 3-month average sugar control (HbA1c).',
      price: 499, mrp: 650, fasting: true, sample: 'Blood', report: 'Same day, by 6:00 PM',
      prep: '8-10 hours fasting required before the test.',
      image: 'assets/sugar.jpg',
    ),
    BloodTest(
      id: 'thyroid', name: 'Thyroid Test', short: 'Thyroid Test',
      desc: 'Assesses thyroid gland function and hormone balance.',
      price: 599, mrp: 799, fasting: false, sample: 'Blood', report: 'Next day, by 10:00 AM',
      prep: 'No special preparation needed.',
      image: 'assets/thyroid.jpg',
    ),
    BloodTest(
      id: 'lipid', name: 'Lipid Profile', short: 'Lipid Profile',
      desc: 'Checks total cholesterol, HDL, LDL & triglycerides for heart health.',
      price: 649, mrp: 849, fasting: true, sample: 'Blood', report: 'Next day, by 10:00 AM',
      prep: '10-12 hours fasting required before the test.',
      image: 'assets/lipid.jpg',
    ),
    BloodTest(
      id: 'lft_kft', name: 'Liver & Kidney Test', short: 'Liver & Kidney Test',
      desc: 'Evaluates liver enzymes and kidney filtration markers together.',
      price: 899, mrp: 1199, fasting: true, sample: 'Blood', report: 'Next day, by 10:00 AM',
      prep: '8 hours fasting recommended.',
      image: 'assets/liver_kidney.jpg',
    ),
    BloodTest(
      id: 'urine', name: 'Urine Test', short: 'Urine Test',
      desc: 'Screens for infections, kidney issues & diabetes markers in urine.',
      price: 199, mrp: 249, fasting: false, sample: 'Urine', report: 'Same day, by 6:00 PM',
      prep: 'Collect the first morning sample if possible.',
      image: 'assets/urine.jpg',
    ),
    BloodTest(
      id: 'fever', name: 'Fever Tests (Dengue, Typhoid, Malaria)', short: 'Fever Tests',
      desc: 'Detects the most common fever-causing infections in one panel.',
      price: 1299, mrp: 1699, fasting: false, sample: 'Blood', report: 'Next day, by 10:00 AM',
      prep: 'No special preparation needed.',
      image: 'assets/fever.jpg',
    ),
  ];

  static const List<BloodTest> packages = [
    BloodTest(
      id: 'fullbody', name: 'Full Body Checkup', short: 'Full Body Checkup',
      desc: 'All 7 essential tests in one package - a complete health snapshot.',
      price: 2999, mrp: 5294, fasting: true, sample: 'Blood + Urine', report: 'Next day, by 10:00 AM',
      prep: '10-12 hours fasting required.', isPackage: true,
      includedTestIds: ['cbc', 'sugar', 'thyroid', 'lipid', 'lft_kft', 'urine', 'fever'],
    ),
    BloodTest(
      id: 'diabetes', name: 'Diabetes Care Package', short: 'Diabetes Care',
      desc: 'Sugar, Thyroid & Lipid - ideal for ongoing diabetes monitoring.',
      price: 1499, mrp: 1948, fasting: true, sample: 'Blood', report: 'Next day, by 10:00 AM',
      prep: '8-10 hours fasting required.', isPackage: true,
      includedTestIds: ['sugar', 'thyroid', 'lipid'],
    ),
  ];

  static List<BloodTest> get allItems => tests;

  static BloodTest findById(String id) => allItems.firstWhere((t) => t.id == id, orElse: () => tests.first);

  static const List<Category> categories = [
    Category('blood', 'Blood Tests', IconDataRef.blood),
    Category('diabetes', 'Diabetes Care', IconDataRef.diabetes),
    Category('heart', 'Heart Care', IconDataRef.heart),
    Category('thyroid', 'Thyroid Care', IconDataRef.thyroid),
    Category('fever', 'Fever Care', IconDataRef.fever),
  ];

  static List<FamilyMember> seedFamily() => [
        FamilyMember(id: 1, name: 'Karthik Raja', relation: 'Self', age: '34', gender: 'Male'),
        FamilyMember(id: 2, name: 'Meena Karthik', relation: 'Wife', age: '31', gender: 'Female'),
        FamilyMember(id: 3, name: 'Aadhira', relation: 'Daughter', age: '6', gender: 'Female'),
      ];

  static List<SavedAddress> seedAddresses() => [
        SavedAddress(id: 1, label: 'Home', line: '12, Bharathi Street, Thindal, Erode - 638012', phone: '9894913330'),
        SavedAddress(id: 2, label: 'Work', line: '45, Perundurai Road, Erode - 638011', phone: '9894913330'),
      ];

  static List<Booking> seedBookings() => [
        Booking(id: 'AB2314', date: '20/07/2026', testNames: ['CBC (Complete Blood Count)', 'Blood Sugar (Fasting / PP / HbA1c)'], member: 'Karthik Raja', status: 'Report Ready', amount: 798, address: '12, Bharathi Street, Thindal, Erode - 638012', slot: '20/07/2026, 7:30 AM', paymentMethod: 'upi'),
        Booking(id: 'AB2298', date: '21/07/2026', testNames: ['Thyroid Test', 'Lipid Profile'], member: 'Meena Karthik', status: 'Sample Collected', amount: 1248, address: '12, Bharathi Street, Thindal, Erode - 638012', slot: '23/07/2026, 8:00 AM', paymentMethod: 'upi'),
        Booking(id: 'AB2276', date: '18/07/2026', testNames: ['Thyroid Test'], member: 'Karthik Raja', status: 'Confirmed', amount: 599, address: '45, Perundurai Road, Erode - 638011', slot: '24/07/2026, 7:00 AM', paymentMethod: 'cod'),
        Booking(id: 'AB2250', date: '02/07/2026', testNames: ['Urine Test'], member: 'Aadhira', status: 'Cancelled', amount: 199, address: '12, Bharathi Street, Thindal, Erode - 638012', slot: '-', paymentMethod: 'cod'),
      ];

  static List<LabReport> seedReports() => const [
        LabReport(id: 'AB2314', name: 'CBC + Blood Sugar', date: '20/07/2026', member: 'Karthik Raja', status: 'Report Ready'),
        LabReport(id: 'AB2199', name: 'Lipid Profile', date: '28/06/2026', member: 'Karthik Raja', status: 'Report Ready'),
        LabReport(id: 'AB2144', name: 'Thyroid Test', date: '12/06/2026', member: 'Meena Karthik', status: 'Pending'),
      ];

  static Map<String, List<ReportRow>> reportRows = {
    'AB2314': const [
      ReportRow(name: 'Hemoglobin', value: '13.8 g/dL', range: '13-17'),
      ReportRow(name: 'WBC Count', value: '7,200 /uL', range: '4,000-11,000'),
      ReportRow(name: 'Platelet Count', value: '2.4 L/uL', range: '1.5-4.5 L'),
      ReportRow(name: 'Fasting Sugar', value: '108 mg/dL', range: '70-100', abnormal: true),
      ReportRow(name: 'HbA1c', value: '5.9 %', range: '<5.7', abnormal: true),
    ],
    'AB2199': const [
      ReportRow(name: 'Total Cholesterol', value: '176 mg/dL', range: '<200'),
      ReportRow(name: 'HDL', value: '42 mg/dL', range: '>40'),
      ReportRow(name: 'LDL', value: '110 mg/dL', range: '<100', abnormal: true),
      ReportRow(name: 'Triglycerides', value: '138 mg/dL', range: '<150'),
    ],
    'AB2144': const [
      ReportRow(name: 'Hemoglobin', value: '12.9 g/dL', range: '12-16'),
      ReportRow(name: 'Fasting Sugar', value: '92 mg/dL', range: '70-100'),
      ReportRow(name: 'TSH', value: '2.1 uIU/mL', range: '0.4-4.0'),
      ReportRow(name: 'Creatinine', value: '0.9 mg/dL', range: '0.6-1.3'),
    ],
  };

  static List<MedicalRecord> seedRecords() => const [
        MedicalRecord(id: 1, type: 'prescription', title: 'Dr. Senthil Kumar - Homeopathy', date: '14/07/2026'),
        MedicalRecord(id: 2, type: 'report', title: 'Apollo Diagnostics - Vitamin D', date: '02/06/2026'),
      ];

  static List<AppNotification> seedNotifications() => [
        AppNotification(id: 1, kind: 'report', title: 'Report Ready', body: 'Your CBC + Blood Sugar report (AB2314) is now available.', time: '2h ago', read: false),
        AppNotification(id: 2, kind: 'truck', title: 'Sample Collected', body: 'Our technician collected your sample for booking AB2298.', time: '1d ago', read: false),
        AppNotification(id: 3, kind: 'check', title: 'Booking Confirmed', body: 'Your appointment AB2276 is confirmed for 24 Jul, 7:00 AM.', time: '2d ago', read: true),
        AppNotification(id: 4, kind: 'offer', title: 'Health Camp This Weekend', body: 'Free BP & Sugar screening at Abirami Lab, Thindal.', time: '3d ago', read: true),
      ];

  static List<DoctorPatient> seedDoctorPatients() => [
        DoctorPatient(id: 1, name: 'Ramesh Kumar', phone: '9876543210', tests: ['CBC (Complete Blood Count)', 'Lipid Profile'], date: '18/07/2026', status: 'Report Ready', commission: 65),
        DoctorPatient(id: 2, name: 'Priya S', phone: '9865321470', tests: ['Thyroid Test', 'Liver & Kidney Test'], date: '20/07/2026', status: 'Sample Collected', commission: 150),
        DoctorPatient(id: 3, name: 'Suresh Babu', phone: '9843217650', tests: ['Thyroid Test'], date: '12/07/2026', status: 'Confirmed', commission: 60),
      ];
}
