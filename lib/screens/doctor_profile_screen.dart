import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';

class DoctorProfileScreen extends StatelessWidget {
  const DoctorProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final phone = app.doctorPhone.isNotEmpty ? app.doctorPhone : '98765 43210';

    return Container(
      color: AppColors.background,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 96),
        children: [
          // 1. Back button row
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                onPressed: () => app.goTab('doctor', 'doctorDashboard'),
              ),
            ),
          ),

          // 2. Doctor Header Card
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2), // Light red circle
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.medical_services,
                    color: Color(0xFFEF4444), // Red doctor briefcase/cross
                    size: 26,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dr. Ramesh Kumar',
                        style: TextStyle(
                          color: AppColors.textPrimary, // Deep navy
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Consultant Pathologist',
                        style: TextStyle(
                          color: AppColors.secondary, // Teal/Cyan
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '+91 $phone',
                        style: const TextStyle(
                          color: Color(0xFF64748B), // Slate grey
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.verified,
                  color: Color(0xFF10B981), // Green verified check
                  size: 22,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 3. Professional Credentials
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              'Professional Credentials',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildInfoRow('Qualifications', 'MBBS, MD (Pathology)'),
                const Divider(color: Color(0xFFF1F5F9), height: 24),
                _buildInfoRow('Registration No.', 'MCI-98745 (Tamil Nadu)'),
                const Divider(color: Color(0xFFF1F5F9), height: 24),
                _buildInfoRow('Specialty', 'Laboratory Medicine'),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4. Hospital / Clinic Info
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              'Practice Details',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildInfoRow('Hospital/Clinic', 'Abirami Diagnostic Lab'),
                const Divider(color: Color(0xFFF1F5F9), height: 24),
                _buildInfoRow('Location', 'Thindal, Erode, Tamil Nadu'),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 5. Earnings Summary
          const Padding(
            padding: EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              'Account & Payouts',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildInfoRow('Total Patients Referred', '${app.doctorPatients.length}'),
                const Divider(color: Color(0xFFF1F5F9), height: 24),
                _buildInfoRow('Total Earnings (Month)', '₹${app.doctorCommissionTotal}'),
                const Divider(color: Color(0xFFF1F5F9), height: 24),
                _buildInfoRow('Payout Account', 'xxxx xxxx 4321 (SBI)'),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // 6. Logout Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: InkWell(
              onTap: app.logout,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: double.infinity,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444), // Solid red logout
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Text(
                  'Logout',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text(
              'Abirami Laboratory (Doctor App) v1.0.0',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF64748B),
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 13.5,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
