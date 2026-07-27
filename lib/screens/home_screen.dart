import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../data/mock_data.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

IconData categoryIcon(IconDataRef ref) {
  switch (ref) {
    case IconDataRef.blood:
      return Icons.water_drop;
    case IconDataRef.packages:
      return Icons.inventory;
    case IconDataRef.diabetes:
      return Icons.monitor_heart;
    case IconDataRef.heart:
      return Icons.favorite;
    case IconDataRef.thyroid:
      return Icons.bubble_chart;
    case IconDataRef.fever:
      return Icons.thermostat;
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final notificationCount = app.notifications.length;

    return Container(
      color: AppColors.background,
      child: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.only(bottom: 96),
            children: [
              Container(
                padding: const EdgeInsets.fromLTRB(20, 50, 20, 24),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Good morning,', style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 12, fontWeight: FontWeight.w500)),
                              const Text('Karthik Raja', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            InkWell(
                              onTap: () => app.go('cart'),
                              child: Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(14)),
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                                    if (app.cart.isNotEmpty)
                                      Positioned(
                                        top: 5,
                                        right: 5,
                                        child: Container(
                                          padding: const EdgeInsets.all(3),
                                          decoration: const BoxDecoration(
                                            color: AppColors.danger,
                                            shape: BoxShape.circle,
                                          ),
                                          constraints: const BoxConstraints(
                                            minWidth: 15,
                                            minHeight: 15,
                                          ),
                                          child: Center(
                                            child: Text(
                                              '${app.cart.length}',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 8,
                                                fontWeight: FontWeight.bold,
                                                height: 1.0,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            InkWell(
                              onTap: () => app.go('notifications'),
                              child: Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(14)),
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    const Icon(Icons.notifications_none, color: Colors.white),
                                    if (notificationCount > 0)
                                      Positioned(
                                        top: 5,
                                        right: 5,
                                        child: Container(
                                          padding: const EdgeInsets.all(3),
                                          decoration: const BoxDecoration(
                                            color: AppColors.danger,
                                            shape: BoxShape.circle,
                                          ),
                                          constraints: const BoxConstraints(
                                            minWidth: 15,
                                            minHeight: 15,
                                          ),
                                          child: Center(
                                            child: Text(
                                              '$notificationCount',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 8,
                                                fontWeight: FontWeight.bold,
                                                height: 1.0,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    InkWell(
                      onTap: () => app.go('search'),
                      child: Container(
                        height: 48,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                        child: const Row(children: [Icon(Icons.search, color: AppColors.textSecondary, size: 18), SizedBox(width: 10), Text('Search tests, packages...', style: TextStyle(color: AppColors.textMuted, fontSize: 14))]),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const PromoCarousel(),
                    const SizedBox(height: 24),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text('Blood Test Packages', style: AppTextStyles.h4),
                      GestureDetector(onTap: () => app.go('catalogue'), child: const Text('See all', style: TextStyle(color: Color(0xFF15803D), fontSize: 12, fontWeight: FontWeight.w600))),
                    ]),
                    const SizedBox(height: 12),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.8,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                      ),
                      itemCount: MockData.tests.length,
                      itemBuilder: (_, i) {
                        final t = MockData.tests[i];
                        return InkWell(
                          onTap: () => app.openTest(t.id),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.15),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  t.image.isNotEmpty
                                      ? Image.asset(t.image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(
                                          color: AppColors.secondaryTint,
                                          child: const Icon(Icons.water_drop, size: 32, color: AppColors.secondary),
                                        ))
                                      : Container(
                                          color: AppColors.secondaryTint,
                                          child: const Icon(Icons.water_drop, size: 32, color: AppColors.secondary),
                                        ),
                                  Positioned(
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    child: Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.95),
                                        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            t.short,
                                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 1,
                                          ),
                                          const SizedBox(height: 6),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text('₹${t.price}', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  border: Border.all(color: const Color(0xFF15803D), width: 1.0),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: const Text(
                                                  'View Details',
                                                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w600, color: Color(0xFF15803D)),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 24),

                    const SizedBox(height: 4),
                    Text('Upload Medical Records', style: AppTextStyles.h4),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () => app.goTab('records', 'records'),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 24),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(children: [
                          Container(width: 56, height: 56, decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.description, color: AppColors.primary, size: 32)),
                          const SizedBox(width: 10),
                          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                            Text('Medical Records', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: AppColors.textPrimary)),
                            Text('Upload prescriptions', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                          ]),
                        ]),
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                      child: Row(children: [
                        Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.dangerTint, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.phone, color: AppColors.danger)),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                          Text('Need help?', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textPrimary)),
                          Text('Call the lab directly', style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                        ])),
                        const Text('9894913330', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                      ]),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Positioned(
            right: 16, bottom: 16,
            child: Column(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle, boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 20, offset: const Offset(0,8))]),
                  child: const Icon(Icons.phone, color: Colors.white, size: 20),
                ),
                const SizedBox(height: 12),
                Container(
                  width: 44, height: 44,
                  decoration: const BoxDecoration(color: Color(0xFF25D366), shape: BoxShape.circle, boxShadow: [BoxShadow(color: Color(0x6625D366), blurRadius: 20, offset: Offset(0,8))]),
                  child: const Icon(FontAwesomeIcons.whatsapp, color: Colors.white, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PromoCarousel extends StatefulWidget {
  const PromoCarousel({super.key});

  @override
  State<PromoCarousel> createState() => _PromoCarouselState();
}

class _PromoCarouselState extends State<PromoCarousel> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    precacheImage(const AssetImage('assets/1.jpg'), context);
    precacheImage(const AssetImage('assets/2.jpg'), context);
    precacheImage(const AssetImage('assets/3.jpg'), context);
  }

  void _startTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 4));
      if (!mounted) return false;
      final nextPage = (_currentPage + 1) % 3;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
      return true;
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slides = [
      {'image': 'assets/1.jpg', 'title': 'Full Body Checkup', 'subtitle': 'Complete health screening at best prices'},
      {'image': 'assets/2.jpg', 'title': 'Home Sample Collection', 'subtitle': 'Free sample pickup from your doorstep'},
      {'image': 'assets/3.jpg', 'title': 'Same Day Reports', 'subtitle': 'Get your reports within hours'},
    ];

    return Column(
      children: [
        SizedBox(
          height: 140,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (int page) {
              setState(() {
                _currentPage = page;
              });
            },
            itemCount: slides.length,
            itemBuilder: (context, index) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: CarouselItem(imagePath: slides[index]['image'] as String),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            slides.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _currentPage == index ? 16 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: _currentPage == index
                    ? AppColors.primary
                    : AppColors.primary.withOpacity(0.3),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class CarouselItem extends StatefulWidget {
  final String imagePath;
  const CarouselItem({super.key, required this.imagePath});

  @override
  State<CarouselItem> createState() => _CarouselItemState();
}

class _CarouselItemState extends State<CarouselItem> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Image.asset(
      widget.imagePath,
      fit: BoxFit.cover,
    );
  }
}
