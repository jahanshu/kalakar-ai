import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface AIProcessingViewProps {
  language: Language;
}

export const AIProcessingView: React.FC<AIProcessingViewProps> = ({ language }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      en: 'Transcribing spoken voice note...',
      hi: 'बोली गई आवाज का विश्लेषण हो रहा है...',
    },
    {
      en: 'Analyzing materials, handloom effort & heritage...',
      hi: 'शिल्प सामग्री, मेहनत और तकनीक की पहचान...',
    },
    {
      en: 'Weaving buyer-ready English description & search tags...',
      hi: 'आकर्षक विवरण और सर्च टैग तैयार किए जा रहे हैं...',
    },
    {
      en: 'Benchmarking fair regional artisan price range...',
      hi: 'उचित क्षेत्रीय मूल्य सीमा का मूल्यांकन...',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center animate-in fade-in">
      {/* Central Animated Orb */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8E4E14] to-[#F4A261] flex items-center justify-center text-white shadow-xl animate-pulse">
          <Sparkles className="w-12 h-12" />
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-[#E7C268] border-dashed animate-spin duration-1000" />
      </div>

      <h2 className="text-2xl font-extrabold text-[#1A1C1A] font-heading mb-2">
        {language === 'hi' ? 'Kalaकार AI कारीगरी संजो रहा है...' : 'Kalaकार AI is Weaving Your Listing...'}
      </h2>
      <p className="text-sm text-[#534439] max-w-sm mb-8">
        {language === 'hi'
          ? 'आपकी आवाज और फोटो को सुंदर अंग्रेजी कैटलॉग कार्ड में बदला जा रहा है।'
          : 'Turning your spoken story and craft photo into a ready-to-sell listing.'}
      </p>

      {/* Steps checklist */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E3E2E0] shadow-sm space-y-3.5 text-left">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                isCurrent ? 'bg-[#FFDCC4]/30 text-[#8E4E14] font-semibold' : 'text-[#534439]'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#2A9D8F] flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-[#8E4E14] animate-spin flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#D8C2B5] flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm">
                {language === 'hi' ? step.hi : step.en}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skeleton Card Preview beneath */}
      <div className="w-full max-w-md mt-8 p-4 bg-white/60 rounded-2xl border border-[#E3E2E0] space-y-3 opacity-60">
        <div className="h-32 bg-[#E3E2E0] rounded-xl animate-pulse" />
        <div className="h-4 bg-[#E3E2E0] rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-[#E3E2E0] rounded w-full animate-pulse" />
        <div className="h-3 bg-[#E3E2E0] rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
};
