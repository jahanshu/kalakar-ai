import React from 'react';
import { TabType, Language, ArtisanProfile } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Globe, User, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
  onToggleLanguage: () => void;
  artisan: ArtisanProfile;
  onOpenArtisanSwitcher: () => void;
  showArtisanSwitcher?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  artisan,
  onOpenArtisanSwitcher,
  showArtisanSwitcher = true,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex justify-between items-center w-full px-8 py-3.5 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E3E2E0]/70 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <span className="text-2xl font-extrabold tracking-tight text-[#8E4E14] font-heading flex items-center gap-1.5">
              Kala<span className="text-[#E76F51]">कार</span> AI
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FFDCC4] text-[#6F3800] border border-[#FFB780]/50">
              Artisan MVP
            </span>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex items-center gap-7">
          <button
            id="nav-home"
            onClick={() => onSelectTab('home')}
            className={`text-sm font-semibold transition-all pb-1 ${
              currentTab === 'home'
                ? 'text-[#8E4E14] font-bold border-b-2 border-[#8E4E14]'
                : 'text-[#534439] hover:text-[#1A1C1A]'
            }`}
          >
            {t.home}
          </button>
          <button
            id="nav-products"
            onClick={() => onSelectTab('products')}
            className={`text-sm font-semibold transition-all pb-1 ${
              currentTab === 'products'
                ? 'text-[#8E4E14] font-bold border-b-2 border-[#8E4E14]'
                : 'text-[#534439] hover:text-[#1A1C1A]'
            }`}
          >
            {t.myProducts}
          </button>
          <button
            id="nav-negotiator"
            onClick={() => onSelectTab('negotiator')}
            className={`text-sm font-semibold transition-all pb-1 flex items-center gap-1.5 ${
              currentTab === 'negotiator'
                ? 'text-[#8E4E14] font-bold border-b-2 border-[#8E4E14]'
                : 'text-[#534439] hover:text-[#1A1C1A]'
            }`}
          >
            <span>{t.negotiator}</span>
            <span className="text-[10px] bg-[#FFDCC4] text-[#6F3800] px-1.5 py-0.2 rounded-full font-bold">
              AI
            </span>
          </button>
          <button
            id="nav-analytics"
            onClick={() => onSelectTab('analytics')}
            className={`text-sm font-semibold transition-all pb-1 ${
              currentTab === 'analytics'
                ? 'text-[#8E4E14] font-bold border-b-2 border-[#8E4E14]'
                : 'text-[#534439] hover:text-[#1A1C1A]'
            }`}
          >
            {t.analytics}
          </button>
          <button
            id="nav-settings"
            onClick={() => onSelectTab('settings')}
            className={`text-sm font-semibold transition-all pb-1 ${
              currentTab === 'settings'
                ? 'text-[#8E4E14] font-bold border-b-2 border-[#8E4E14]'
                : 'text-[#534439] hover:text-[#1A1C1A]'
            }`}
          >
            {t.settings}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLanguage}
            title="Switch English / हिंदी"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8C2B5] bg-white text-xs font-semibold text-[#534439] hover:border-[#8E4E14] hover:text-[#8E4E14] transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#8E4E14]" />
            <span>{language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</span>
          </button>

          {showArtisanSwitcher && (
            <button
              id="artisan-profile-btn"
              onClick={onOpenArtisanSwitcher}
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-[#D8C2B5] bg-white hover:border-[#8E4E14] transition-all text-xs font-medium text-[#1A1C1A] shadow-xs"
            >
              {artisan.avatar ? (
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#8E4E14]/30"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-[#FFDCC4] text-[#8E4E14] flex items-center justify-center text-[10px] font-extrabold">
                  {(artisan.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="font-semibold text-xs">{language === 'hi' ? artisan.hindiName : artisan.name}</span>
            </button>
          )}

          {/* Add New Product Button */}
          <button
            id="add-new-header-btn"
            onClick={() => onSelectTab('add-new')}
            className="bg-[#8E4E14] hover:bg-[#6F3800] text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="flex md:hidden justify-between items-center w-full px-4 py-3 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E3E2E0] sticky top-0 z-40">
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-1.5 focus:outline-none"
        >
          <span className="text-xl font-extrabold tracking-tight text-[#8E4E14] font-heading">
            Kala<span className="text-[#E76F51]">कार</span> AI
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLanguage}
            className="p-1.5 rounded-full border border-[#D8C2B5] bg-white text-xs font-semibold text-[#534439]"
            title="Toggle Language"
          >
            <Globe className="w-4 h-4 text-[#8E4E14]" />
          </button>

          {showArtisanSwitcher && (
            <button
              onClick={onOpenArtisanSwitcher}
              className="p-1 rounded-full border border-[#8E4E14]/40"
            >
              {artisan.avatar ? (
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-[#FFDCC4] text-[#8E4E14] flex items-center justify-center text-[10px] font-extrabold">
                  {(artisan.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => onSelectTab('add-new')}
            className="bg-[#8E4E14] text-white p-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addNew}</span>
          </button>
        </div>
      </header>
    </>
  );
};
