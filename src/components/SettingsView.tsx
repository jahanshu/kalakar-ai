import React, { useState } from 'react';
import { Language, ArtisanProfile } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import {
  User,
  Globe,
  Bell,
  Phone,
  HelpCircle,
  LogOut,
  MapPin,
  CheckCircle2,
  Edit2,
  Building2,
  ShieldCheck,
  Camera
} from 'lucide-react';

interface SettingsViewProps {
  language: Language;
  onToggleLanguage: () => void;
  artisan: ArtisanProfile;
  onUpdateArtisan: (updated: Partial<ArtisanProfile>) => void;
  onSignOut: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onToggleLanguage,
  artisan,
  onUpdateArtisan,
  onSignOut,
}) => {
  const t = TRANSLATIONS[language];

  const [inquiryNotif, setInquiryNotif] = useState(true);
  const [approvalNotif, setApprovalNotif] = useState(true);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyText, setStoryText] = useState(artisan.story);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateArtisan({ avatar: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStory = () => {
    onUpdateArtisan({ story: storyText });
    setIsEditingStory(false);
  };

  const handleCallHelper = () => {
    const cleanPhone = (artisan.phone || '').replace(/\s+/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] font-heading mb-1.5">
          {t.settings}
        </h1>
        <p className="text-sm sm:text-base text-[#534439]">{t.appPreferences}</p>
      </div>

      {/* Artisan Profile Card */}
      <div className="tactile-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E3E2E0] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0 flex flex-col items-center gap-2">
            {artisan.avatar ? (
              <img
                src={artisan.avatar}
                alt={artisan.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#FFDCC4] shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FFDCC4] border-4 border-white shadow-sm flex items-center justify-center text-2xl font-extrabold text-[#8E4E14]">
                {(artisan.name || '?').charAt(0).toUpperCase()}
              </div>
            )}

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8E4E14] text-white text-[11px] font-bold cursor-pointer hover:bg-[#6F3800] transition-all shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'फोटो अपलोड करें' : 'Upload photo'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A1C1A] font-heading">
                  {language === 'hi' ? artisan.hindiName : artisan.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#765A05] font-semibold">{artisan.title}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A9D8F]/15 text-[#2A9D8F] text-xs font-bold self-center sm:self-auto">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Artisan</span>
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-[#534439] pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8E4E14]" />
                {artisan.location}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#8E4E14]">{artisan.craft}</span>
            </div>

            {/* Artisan Story */}
            <div className="mt-4 pt-4 border-t border-[#E3E2E0] text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C1A]">
                  {t.myStory}
                </span>
                <button
                  onClick={() => setIsEditingStory(!isEditingStory)}
                  className="text-xs text-[#8E4E14] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingStory ? 'Cancel' : t.editStory}</span>
                </button>
              </div>

              {isEditingStory ? (
                <div className="space-y-2">
                  <textarea
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl border border-[#E3E2E0] bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#8E4E14]"
                  />
                  <button
                    onClick={handleSaveStory}
                    className="py-1.5 px-4 bg-[#8E4E14] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Save Story
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#534439] italic leading-relaxed">
                  "{artisan.story}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences & Notifications */}
      <div className="tactile-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E3E2E0] shadow-sm space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-[#1A1C1A] font-heading border-b border-[#E3E2E0] pb-3">
          {t.appPreferences}
        </h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E3E2E0] flex items-center justify-center text-[#8E4E14]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1C1A]">{t.language}</p>
              <p className="text-xs text-[#534439]">English / हिंदी (Devanagari)</p>
            </div>
          </div>

          <button
            onClick={onToggleLanguage}
            className="py-2 px-4 rounded-xl border border-[#D8C2B5] bg-[#FAF9F6] text-xs font-bold text-[#8E4E14] hover:border-[#8E4E14] transition-all cursor-pointer"
          >
            {language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}
          </button>
        </div>

        {/* Notifications */}
        <div className="space-y-4 pt-2 border-t border-[#E3E2E0]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1A1C1A]">{t.newInquiries}</p>
              <p className="text-xs text-[#534439]">{t.newInquiriesSub}</p>
            </div>
            <input
              type="checkbox"
              checked={inquiryNotif}
              onChange={(e) => setInquiryNotif(e.target.checked)}
              className="w-5 h-5 accent-[#8E4E14] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1A1C1A]">{t.productApprovals}</p>
              <p className="text-xs text-[#534439]">{t.productApprovalsSub}</p>
            </div>
            <input
              type="checkbox"
              checked={approvalNotif}
              onChange={(e) => setApprovalNotif(e.target.checked)}
              className="w-5 h-5 accent-[#8E4E14] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="tactile-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E3E2E0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E3E2E0] flex items-center justify-center text-[#8E4E14]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1C1A]">{language === 'hi' ? 'खाता' : 'Account'}</p>
              <p className="text-xs text-[#534439]">{language === 'hi' ? 'इस डिवाइस से अपने खाते से साइन आउट करें।' : 'Sign out of your account on this device.'}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full sm:w-auto py-2.5 px-5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>

      {/* Connected Accounts & NGO Helper Support */}
      <div className="tactile-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E3E2E0] shadow-sm space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-[#1A1C1A] font-heading border-b border-[#E3E2E0] pb-3">
          {t.connectedAccounts}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1C1A]">{artisan.ngoPartner}</p>
              <p className="text-xs text-[#534439]">{t.ngoHelper} • Varanasi District</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#2A9D8F] bg-[#2A9D8F]/10 px-2.5 py-1 rounded-full">
            Active
          </span>
        </div>

        {/* Need Help Box */}
        <div className="p-5 rounded-2xl bg-[#FFDCC4]/30 border border-[#FFB780]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-[#8E4E14] text-white flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1A1C1A]">{t.needHelp}</h4>
              <p className="text-xs text-[#534439] max-w-sm">{t.needHelpSub}</p>
            </div>
          </div>

          <button
            onClick={handleCallHelper}
            className="w-full sm:w-auto py-2.5 px-5 bg-[#8E4E14] hover:bg-[#6F3800] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs flex-shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>{t.callHelper}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
