import React from 'react';
import { ArtisanProfile, Language } from '../types';
import { X, Check, Sparkles } from 'lucide-react';

interface ArtisanSwitcherModalProps {
  currentArtisan: ArtisanProfile;
  onSelectArtisan: (artisan: ArtisanProfile) => void;
  onClose: () => void;
  language: Language;
}

export const SAMPLE_ARTISANS: ArtisanProfile[] = [
  {
    id: 'artisan-1',
    name: 'Vedansh',
    hindiName: 'वेदांश',
    title: 'Master Weaver & Clay Artisan',
    location: 'Varanasi, UP',
    craft: 'Handloom & Pottery',
    avatar: '/assets/profiles/vedansh.png',
    story: 'I have been weaving traditional textiles and shaping clay crafts for over 22 years. My work is inspired by the ghats of Varanasi.',
    ngoPartner: 'Srijan Foundation',
    phone: '+91 98765 43210',
    totalProducts: 42,
    activeListings: 38,
    totalShares: 156,
  },
  {
    id: 'artisan-2',
    name: 'Nitish',
    hindiName: 'नितिश',
    title: 'Terracotta & Ceramic Sculptor',
    location: 'Gorakhpur, UP',
    craft: 'Terracotta Sculptures',
    avatar: '/assets/profiles/nitish.png',
    story: 'Third-generation terracotta artisan. We specialize in elephant pots and ornate garden sculptures using alluvial clay.',
    ngoPartner: 'Gramin Shilp Samiti',
    phone: '+91 91234 56789',
    totalProducts: 28,
    activeListings: 24,
    totalShares: 92,
  },
  {
    id: 'artisan-3',
    name: 'Vaishu',
    hindiName: 'वैशु',
    title: 'Channapatna Wooden Toy Maker',
    location: 'Ramanagara, Karnataka',
    craft: 'Channapatna Toys',
    avatar: '/assets/profiles/vaishu.png',
    story: 'Carving child-safe lacquer toys using ivory wood and organic vegetable dyes for over 15 years.',
    ngoPartner: 'Maya Craft Collective',
    phone: '+91 98450 12345',
    totalProducts: 34,
    activeListings: 30,
    totalShares: 118,
  }
];

export const ArtisanSwitcherModal: React.FC<ArtisanSwitcherModalProps> = ({
  currentArtisan,
  onSelectArtisan,
  onClose,
  language,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E3E2E0] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#534439] hover:bg-[#E3E2E0]/50 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#8E4E14]" />
          <h3 className="text-xl font-bold text-[#1A1C1A] font-heading">
            {language === 'hi' ? 'कारीगर प्रोफ़ाइल चुनें' : 'Switch Artisan Profile'}
          </h3>
        </div>
        <p className="text-xs text-[#534439] mb-5">
          {language === 'hi'
            ? 'विभिन्न क्षेत्रीय शिल्पों के लिए अनुभव देखें।'
            : 'Simulate the app experience across different craft traditions.'}
        </p>

        <div className="space-y-3">
          {SAMPLE_ARTISANS.map((artisan) => {
            const isSelected = currentArtisan.id === artisan.id;

            return (
              <button
                key={artisan.id}
                onClick={() => {
                  onSelectArtisan(artisan);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#8E4E14] bg-[#FFDCC4]/30 ring-1 ring-[#8E4E14]'
                    : 'border-[#E3E2E0] hover:border-[#8E4E14]/40 bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {artisan.avatar ? (
                    <img
                      src={artisan.avatar}
                      alt={artisan.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-[#FFDCC4] text-[#8E4E14] flex items-center justify-center text-sm font-extrabold border-2 border-white shadow-xs flex-shrink-0">
                      {(artisan.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#1A1C1A] truncate">
                      {language === 'hi' ? artisan.hindiName : artisan.name}
                    </h4>
                    <p className="text-xs text-[#765A05] truncate">{artisan.craft}</p>
                    <p className="text-[10px] text-[#534439] truncate">{artisan.location}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#8E4E14] text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
