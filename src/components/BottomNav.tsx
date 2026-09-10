import React from 'react';
import { TabType, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Home, Package, BarChart3, Settings, Plus, Sparkles } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <>
      {/* Floating Action Button (Mobile Only) */}
      <button
        id="mobile-fab-add"
        aria-label="Add New Product"
        onClick={() => onSelectTab('add-new')}
        className="md:hidden fixed bottom-20 right-5 bg-[#8E4E14] text-white w-13 h-13 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-1.5 bg-[#FAF9F6] border-t border-[#E3E2E0] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'bg-[#F4A261]/20 text-[#8E4E14] font-semibold'
              : 'text-[#534439] hover:bg-[#E3E2E0]/40'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.home}</span>
        </button>

        <button
          onClick={() => onSelectTab('products')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'products'
              ? 'bg-[#F4A261]/20 text-[#8E4E14] font-semibold'
              : 'text-[#534439] hover:bg-[#E3E2E0]/40'
          }`}
        >
          <Package className={`w-5 h-5 ${currentTab === 'products' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.myProducts}</span>
        </button>

        <button
          onClick={() => onSelectTab('negotiator')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            currentTab === 'negotiator'
              ? 'bg-[#F4A261]/20 text-[#8E4E14] font-semibold'
              : 'text-[#534439] hover:bg-[#E3E2E0]/40'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentTab === 'negotiator' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.negotiator}</span>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E76F51]" />
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'analytics'
              ? 'bg-[#F4A261]/20 text-[#8E4E14] font-semibold'
              : 'text-[#534439] hover:bg-[#E3E2E0]/40'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${currentTab === 'analytics' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.analytics}</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'settings'
              ? 'bg-[#F4A261]/20 text-[#8E4E14] font-semibold'
              : 'text-[#534439] hover:bg-[#E3E2E0]/40'
          }`}
        >
          <Settings className={`w-5 h-5 ${currentTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.settings}</span>
        </button>
      </nav>
    </>
  );
};

