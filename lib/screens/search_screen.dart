import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final results = app.filteredItems;
    final noResults = app.search.isNotEmpty && results.isEmpty;
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 12),
            child: Row(children: [
              InkWell(
                onTap: app.back,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: Colors.white),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(14)),
                  child: Row(children: [
                    const Icon(Icons.search, color: AppColors.textSecondary, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        autofocus: true,
                        onChanged: app.setSearch,
                        decoration: const InputDecoration(border: InputBorder.none, hintText: 'Search tests, packages...'),
                        style: AppTextStyles.bodyBold.copyWith(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ]),
                ),
              ),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(app.search.isNotEmpty ? '${results.length} result${results.length == 1 ? '' : 's'}' : 'Popular searches', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
              ],
            ),
          ),
          Expanded(
            child: noResults
                ? Center(child: Text('No tests found for "${app.search}"', style: const TextStyle(color: AppColors.textMuted, fontSize: 13, fontWeight: FontWeight.w500)))
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: results.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final t = results[i];
                      return InkWell(
                        onTap: () => app.openTest(t.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(16)),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(t.name, style: AppTextStyles.bodyBold.copyWith(fontSize: 13.5)),
                                  const SizedBox(height: 3),
                                  Text('${t.sample} sample · ${t.report}', style: AppTextStyles.caption.copyWith(fontSize: 11.5)),
                                ]),
                              ),
                              Text('₹${t.price}', style: AppTextStyles.bodyBold.copyWith(fontSize: 14)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      )
    );
  }
}
