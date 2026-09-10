import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import {
  Camera,
  Mic,
  Sparkles,
  Share2,
  ArrowRight,
  Star,
  CheckCircle2,
  Play
} from 'lucide-react';

interface LandingHeroProps {
  language: Language;
  onStartSelling: () => void;
  onOpenNegotiator?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onStartSelling,
  onOpenNegotiator,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-12 sm:space-y-16 pb-6 animate-in fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#FAF9F6] to-[#F4F3F1]/80 rounded-3xl p-6 sm:p-10 border border-[#E3E2E0]/70 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1C1A] font-heading leading-tight tracking-tight">
            {t.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-[#534439] max-w-lg leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
            <button
              onClick={onStartSelling}
              className="bg-[#E76F51] hover:bg-[#D45D40] text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center gap-2 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <span>{t.startSellingNow}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            {onOpenNegotiator && (
              <button
                onClick={onOpenNegotiator}
                className="bg-white hover:bg-[#FAF9F6] border border-[#8E4E14] text-[#8E4E14] px-6 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#E76F51]" />
                <span>{language === 'hi' ? 'AI ग्राहक मित्र (स्मार्ट नेगोशिएटर)' : 'AI Grahak Mitra (Negotiator)'}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-[#765A05] font-semibold">
            ✦ 100% Free for Artisans & NGOs • Voice-First in Hindi & Regional Languages
          </p>
        </div>

        {/* Hero Interactive Illustration Mockup */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-xl border border-[#E3E2E0] relative group">
            {/* Mock browser header */}
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F]/70" />
              <span className="ml-2 text-[10px] text-[#867468] font-mono">kalaakar.ai/radha-crafts</span>
            </div>

            <div className="relative rounded-xl overflow-hidden mb-3 h-48 bg-[#EFEEEB]">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80"
                alt="Artisan Craft"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                <span>Terracotta Clay Pot</span>
                <span className="bg-[#8E4E14] px-2 py-0.5 rounded-full">₹950</span>
              </div>
            </div>

            {/* Pulsing Mic Indicator */}
            <div className="flex justify-center -mt-7 mb-2 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#E76F51] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Mic className="w-6 h-6" />
              </div>
            </div>

            {/* Skeleton generated listing lines */}
            <div className="space-y-1.5 px-2 pb-1">
              <div className="h-2.5 bg-[#E3E2E0] rounded w-full" />
              <div className="h-2.5 bg-[#E3E2E0] rounded w-5/6" />
              <div className="h-2.5 bg-[#E3E2E0] rounded w-4/6" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (4 Steps) */}
      <section className="space-y-8 text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1C1A] font-heading mb-1.5">
            {t.howItWorks}
          </h2>
          <p className="text-sm sm:text-base text-[#534439]">{t.howItWorksSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="tactile-card rounded-2xl p-6 flex flex-col items-center text-center border border-[#E3E2E0]/80">
            <div className="w-12 h-12 rounded-full bg-[#C6E8F8]/50 text-[#436370] flex items-center justify-center mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1C1A] font-heading mb-1">
              {t.step1Title}
            </h3>
            <p className="text-xs text-[#534439] leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="tactile-card rounded-2xl p-6 flex flex-col items-center text-center border border-[#E3E2E0]/80">
            <div className="w-12 h-12 rounded-full bg-[#FFDCC4]/60 text-[#8E4E14] flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1C1A] font-heading mb-1">
              {t.step2Title}
            </h3>
            <p className="text-xs text-[#534439] leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="tactile-card rounded-2xl p-6 flex flex-col items-center text-center border border-[#E3E2E0]/80">
            <div className="w-12 h-12 rounded-full bg-[#FFDF96]/50 text-[#765A05] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1C1A] font-heading mb-1">
              {t.step3Title}
            </h3>
            <p className="text-xs text-[#534439] leading-relaxed">
              {t.step3Desc}
            </p>
          </div>

          {/* Step 4 */}
          <div className="tactile-card rounded-2xl p-6 flex flex-col items-center text-center border border-[#E3E2E0]/80">
            <div className="w-12 h-12 rounded-full bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1C1A] font-heading mb-1">
              {t.step4Title}
            </h3>
            <p className="text-xs text-[#534439] leading-relaxed">
              {t.step4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3E2E0] shadow-sm max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
            alt="Lakshmi Devi"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#FFDCC4] flex-shrink-0 shadow-sm"
          />

          <div className="space-y-2">
            <div className="flex justify-center sm:justify-start items-center gap-1 text-[#E7C268]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            <blockquote className="text-xs sm:text-sm text-[#534439] italic leading-relaxed">
              {t.testimonialQuote}
            </blockquote>

            <div>
              <p className="text-sm font-bold text-[#1A1C1A] font-heading">
                {t.testimonialAuthor}
              </p>
              <p className="text-xs text-[#765A05]">{t.testimonialRole}</p>
            </div>
          </div>
        </div>
      </section>



    </div>
  );
};
