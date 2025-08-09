import {createFileRoute} from '@tanstack/react-router';
import {Suspense, useEffect} from 'react';

import {BackToTopButton} from '@/components/landing/BackToTopButton';
import {CookieConsent} from '@/components/landing/CookieConsent';
import {HeroSection} from '@/components/landing/HeroSection';
import {LandingHeader} from '@/components/landing/LandingHeader';
import {ProblemStatement} from '@/components/landing/ProblemStatement';
import {ScrollProgressIndicator} from '@/components/landing/ScrollProgressIndicator';
import {PricingSkeleton, SectionSkeleton} from '@/components/landing/SkeletonLoaders';
import {SolutionOverview} from '@/components/landing/SolutionOverview';
import {
    LazyCallToAction,
    LazyLandingFooter,
    LazyPlatformModules,
    LazyPricing,
    LazySocialProof,
    LazyTechnology,
    preloadImages,
} from '@/utils/performance';
import {SECTION_IDS} from '@/utils/smoothScroll';

export const Route = createFileRoute('/')({
    component: LandingPage,
});

function LandingPage() {
    useEffect(() => {
        preloadImages();

        document.title = 'LogisticCommerce - AI-Powered B2B Supply Chain Management Platform';

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Transform your supply chain with LogisticCommerce - the leading AI-powered B2B platform. Multi-warehouse management, real-time tracking, supplier marketplace, and comprehensive automation for enterprise logistics.'
            );
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content =
                'Transform your supply chain with LogisticCommerce - the leading AI-powered B2B platform. Multi-warehouse management, real-time tracking, supplier marketplace, and comprehensive automation for enterprise logistics.';
            document.head.appendChild(meta);
        }

        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute(
                'content',
                'supply chain management, B2B logistics, AI logistics, warehouse management, supplier marketplace, inventory tracking, enterprise logistics, supply chain automation'
            );
        } else {
            const meta = document.createElement('meta');
            meta.name = 'keywords';
            meta.content =
                'supply chain management, B2B logistics, AI logistics, warehouse management, supplier marketplace, inventory tracking, enterprise logistics, supply chain automation';
            document.head.appendChild(meta);
        }

        const ogTags = [
            {
                property: 'og:title',
                content: 'LogisticCommerce - AI-Powered B2B Supply Chain Management Platform',
            },
            {
                property: 'og:description',
                content:
                    'Transform your supply chain with our AI-powered B2B platform. Enterprise-grade logistics solutions.',
            },
            {property: 'og:type', content: 'website'},
            {property: 'og:site_name', content: 'LogisticCommerce'},
        ];

        ogTags.forEach(tag => {
            let ogMeta = document.querySelector(`meta[property="${tag.property}"]`);
            if (ogMeta) {
                ogMeta.setAttribute('content', tag.content);
            } else {
                ogMeta = document.createElement('meta');
                ogMeta.setAttribute('property', tag.property);
                ogMeta.setAttribute('content', tag.content);
                document.head.appendChild(ogMeta);
            }
        });

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'LogisticCommerce',
            description: 'AI-powered B2B supply chain management platform for enterprise logistics',
            category: 'Business Software',
            operatingSystem: 'Web-based',
            applicationCategory: 'BusinessApplication',
            offers: {
                '@type': 'Offer',
                category: 'Enterprise Software',
            },
        };

        let jsonLd = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
        if (jsonLd) {
            jsonLd.textContent = JSON.stringify(structuredData);
        } else {
            jsonLd = document.createElement('script') as HTMLScriptElement;
            jsonLd.type = 'application/ld+json';
            jsonLd.textContent = JSON.stringify(structuredData);
            document.head.appendChild(jsonLd);
        }
    }, []);

    return (
        <div className='min-h-screen'>
            {/* Scroll Progress Indicator */}
            <ScrollProgressIndicator/>

            {/* Navigation Header */}
            <LandingHeader/>

            {/* Hero Section - Premium gradient with animated elements */}
            <section id={SECTION_IDS.hero}>
                <HeroSection/>
            </section>

            {/* Problem Statement - Pain points in supply chain management */}
            <section id={SECTION_IDS.problem}>
                <ProblemStatement/>
            </section>

            {/* Solution Overview - How our platform solves these problems */}
            <section id={SECTION_IDS.solution}>
                <SolutionOverview/>
            </section>

            {/* Platform Modules - Detailed functionality breakdown */}
            <section id={SECTION_IDS.modules}>
                <Suspense fallback={<SectionSkeleton/>}>
                    <LazyPlatformModules/>
                </Suspense>
            </section>

            {/* Technology - Technical capabilities and integrations */}
            <section id={SECTION_IDS.technology}>
                <Suspense fallback={<SectionSkeleton/>}>
                    <LazyTechnology/>
                </Suspense>
            </section>

            {/* Pricing - Enterprise plans and ROI calculator */}
            <section id={SECTION_IDS.pricing}>
                <Suspense fallback={<PricingSkeleton/>}>
                    <LazyPricing/>
                </Suspense>
            </section>

            {/* Social Proof - Testimonials, metrics, and industry trust */}
            <section id={SECTION_IDS.testimonials}>
                <Suspense fallback={<SectionSkeleton/>}>
                    <LazySocialProof/>
                </Suspense>
            </section>

            {/* Call to Action - Multiple CTAs with urgency and social proof */}
            <section id={SECTION_IDS.contact}>
                <Suspense fallback={<SectionSkeleton/>}>
                    <LazyCallToAction/>
                </Suspense>
            </section>

            {/* Footer */}
            <Suspense fallback={<SectionSkeleton/>}>
                <LazyLandingFooter/>
            </Suspense>

            {/* Back to Top Button */}
            <BackToTopButton/>

            {/* Cookie Consent Banner */}
            <CookieConsent/>
        </div>
    );
}
