import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArrowRight, Droplet, Eye, Shield, FlaskConical, Award, Heart } from 'lucide-react';
import { checkPageDraft } from '@/lib/draft-mode';
import { getHeaderProps, getFooterProps } from '@/lib/get-header-props';

export const metadata: Metadata = {
  title: "Our Story | Archie's Remedies",
  description: "The new standard in eye care. Where safety meets sophistication. Discover how Archie's Remedies is reimagining preservative-free relief.",
};

export default async function OurStoryPage() {
  // Check if this page is draft - redirects if needed
  await checkPageDraft('our-story');

  const headerProps = await getHeaderProps();

  const missionModules = [
    {
      icon: Droplet,
      title: 'Why Preservative-Free?',
      description: 'Traditional eye drops contain preservatives that can irritate sensitive eyes over time. We removed them entirely.',
    },
    {
      icon: FlaskConical,
      title: 'Single-Dose Purity',
      description: 'Each vial is hermetically sealed and sterile. One use, one dose, zero contamination risk.',
    },
    {
      icon: Eye,
      title: 'Ophthalmologist Tested',
      description: 'Developed with eye care professionals. Clinically tested for safety and efficacy.',
    },
    {
      icon: Shield,
      title: 'Clean Formula',
      description: 'No questionable ingredients. No artificial fragrances. Just what your eyes need, nothing they don\'t.',
    },
    {
      icon: Award,
      title: 'Made in USA',
      description: 'Manufactured in FDA-registered facilities with rigorous quality control standards.',
    },
    {
      icon: Heart,
      title: 'Safe for Everyone',
      description: 'Gentle enough for daily use. Safe for contact lens wearers, children, and sensitive eyes.',
    },
  ];

  return (
    <>
      <Header {...headerProps} />

      <main>
        {/* ============================================
            SECTION 1: CINEMATIC HERO (Full Width Macro)
            ============================================ */}
        <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-[#0a0a0a]">
          {/* Background Image - Macro Eye/Texture */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1494869042583-f6c911f04b4c?q=80&w=2070&auto=format&fit=crop"
              alt="Macro close-up of human eye"
              fill
              className="object-cover opacity-70"
              priority
            />
            {/* Gradient Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          </div>

          {/* Centered Text Overlay */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center px-6 max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight mb-6">
                THE NEW STANDARD<br />IN EYE CARE
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
                Where safety meets sophistication.<br className="hidden md:block" />
                Preservative-free relief, reimagined.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 2: FOUNDER'S LETTER (50/50 Split)
            ============================================ */}
        <section className="py-20 md:py-28 lg:py-32 bg-[var(--cream)]">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Editorial Portrait */}
              <div className="relative">
                <div className="aspect-[4/5] relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                    alt="Founder of Archie's Remedies"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Floating accent element */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--primary)] rounded-full opacity-60 blur-3xl" />
              </div>

              {/* Right: The Letter */}
              <div className="lg:pl-8">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-8">
                  Letter from the Founder
                </span>

                <div className="space-y-6 text-[var(--foreground)]" style={{ lineHeight: '1.85' }}>
                  <p className="text-lg md:text-xl font-light">
                    I created Archie&apos;s because I was tired of compromising.
                  </p>

                  <p className="text-[var(--muted-foreground)]">
                    After the industry recalls, I realized the world needed something different&mdash;a
                    drop that was safe, effective, and beautiful. No preservatives. No question marks.
                    No settling for &ldquo;good enough.&rdquo;
                  </p>

                  <p className="text-[var(--muted-foreground)]">
                    When my own family was affected by contaminated eye drops, I knew I couldn&apos;t
                    wait for someone else to solve the problem. I partnered with ophthalmologists,
                    formulators, and manufacturing experts to create what should have existed all along.
                  </p>

                  <p className="text-[var(--muted-foreground)]">
                    Every single-dose vial we produce represents our commitment to your eye health.
                    No shortcuts. No compromises. Just clean, effective relief you can trust.
                  </p>

                  <p className="text-[var(--muted-foreground)]">
                    This isn&apos;t just about eye drops. It&apos;s about raising the standard for
                    what we put in and around our bodies. It&apos;s about transparency, integrity,
                    and the belief that you deserve better.
                  </p>
                </div>

                {/* Signature */}
                <div className="mt-10 pt-8 border-t border-[var(--border)]">
                  <p className="font-serif italic text-xl text-[var(--foreground)]">
                    Yours in health,
                  </p>
                  <p className="mt-2 text-lg font-medium text-[var(--foreground)]">
                    The Archie&apos;s Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 3: THE MISSION (Modular Grid)
            ============================================ */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-4">
                <span className="w-8 h-px bg-[var(--foreground)]" />
                Our Mission
                <span className="w-8 h-px bg-[var(--foreground)]" />
              </span>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight">
                What Makes Us Different
              </h2>
            </div>

            {/* 3x2 Editorial Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
              {missionModules.map((module, index) => (
                <div
                  key={index}
                  className="bg-white p-8 md:p-10 group hover:bg-[var(--cream)] transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] transition-colors duration-300">
                    <module.icon className="w-5 h-5 text-[var(--foreground)]" />
                  </div>
                  <h3 className="text-lg font-medium mb-3 tracking-tight">
                    {module.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: THE TIMELINE (Visual Journey)
            ============================================ */}
        <section className="py-20 md:py-28 bg-[var(--cream)]">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-4">
                  <span className="w-8 h-px bg-[var(--foreground)]" />
                  Our Journey
                  <span className="w-8 h-px bg-[var(--foreground)]" />
                </span>
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight">
                  From Concern to Creation
                </h2>
              </div>

              {/* Timeline */}
              <div className="space-y-12">
                <TimelineItem
                  year="2023"
                  title="The Wake-Up Call"
                  description="Major eye drop recalls expose contamination risks in products millions trusted daily. We knew there had to be a better way."
                />
                <TimelineItem
                  year="2023"
                  title="Research & Development"
                  description="Partnering with leading ophthalmologists and formulators to develop a truly safe, preservative-free solution."
                />
                <TimelineItem
                  year="2024"
                  title="Archie's is Born"
                  description="Launching with a single promise: eye care you can trust. No preservatives. No compromises. Just relief."
                />
                <TimelineItem
                  year="Today"
                  title="Raising the Standard"
                  description="Thousands of happy customers later, we continue to innovate and expand our clean eye care line."
                  isLast
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 5: LIFESTYLE CTA FOOTER
            ============================================ */}
        <section className="relative py-32 md:py-40 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2022&auto=format&fit=crop"
              alt="Person enjoying life with clear, healthy eyes"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[var(--foreground)]/60" />
          </div>

          {/* Content */}
          <div className="relative container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-white tracking-tight mb-6">
                Experience the Relief
              </h2>
              <p className="text-lg text-white/70 mb-10 max-w-lg mx-auto">
                Join thousands who have made the switch to clean,
                preservative-free eye care.
              </p>
              <Link
                href="/products/eye-drops"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-[var(--foreground)] rounded-full font-medium hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300"
              >
                Shop the Drops
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer {...getFooterProps(headerProps.settings)} />
    </>
  );
}

// Timeline Component
function TimelineItem({
  year,
  title,
  description,
  isLast = false,
}: {
  year: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-6 md:gap-10">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-[var(--primary)] border-4 border-[var(--cream)] ring-2 ring-[var(--primary)]" />
        {!isLast && (
          <div className="w-px flex-1 bg-[var(--border)] mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12">
        <span className="text-sm font-semibold text-[var(--primary-dark)] tracking-wide">
          {year}
        </span>
        <h3 className="text-xl font-medium mt-1 mb-2">{title}</h3>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
