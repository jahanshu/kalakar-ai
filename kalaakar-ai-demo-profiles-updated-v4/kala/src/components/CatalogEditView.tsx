import React, { useState } from 'react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { CatalogCard } from './CatalogCard';
import {
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Tag,
  Save,
  ArrowRight,
  Sliders,
  DollarSign,
  Heart
} from 'lucide-react';

interface CatalogEditViewProps {
  initialProduct: Product;
  language: Language;
  onPublish: (product: Product) => void;
  onSaveDraft: (product: Product) => void;
  onReGenerate: (tone: string) => Promise<void>;
  isReGenerating?: boolean;
}

export const CatalogEditView: React.FC<CatalogEditViewProps> = ({
  initialProduct,
  language,
  onPublish,
  onSaveDraft,
  onReGenerate,
  isReGenerating = false,
}) => {
  const t = TRANSLATIONS[language];

  // Editable fields
  const [title, setTitle] = useState(initialProduct.title);
  const [category, setCategory] = useState(initialProduct.category);
  const [tagsStr, setTagsStr] = useState(initialProduct.tags.join(', '));
  const [description, setDescription] = useState(initialProduct.description);
  const [minPrice, setMinPrice] = useState(initialProduct.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialProduct.maxPrice);
  const [selectedTone, setSelectedTone] = useState('warm-story');

  const categories = [
    'Home Decor',
    'Textiles & Apparel',
    'Pottery & Ceramics',
    'Toys & Dolls',
    'Jewelry & Accessories',
    'Kitchen & Dining',
    'Metal & Woodcraft',
  ];

  // Current synchronized product object for live preview
  const currentProduct: Product = {
    ...initialProduct,
    title,
    category,
    tags: tagsStr.split(',').map((s) => s.trim()).filter(Boolean),
    description,
    minPrice: Number(minPrice) || 0,
    maxPrice: Number(maxPrice) || 0,
  };

  const handlePublish = () => {
    onPublish({
      ...currentProduct,
      status: 'published',
    });
  };

  const handleDraft = () => {
    onSaveDraft({
      ...currentProduct,
      status: 'draft',
    });
  };

  const handleToneChangeAndRegenerate = async (tone: string) => {
    setSelectedTone(tone);
    await onReGenerate(tone);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-[#2A9D8F]/15 border border-[#2A9D8F]/30 flex items-center justify-center gap-2 text-center text-[#2A9D8F] font-bold text-xs sm:text-sm shadow-xs">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>{t.listingReady}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Catalog Card Preview (5 columns) */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765A05]">
              Live Catalog Preview
            </span>
            <span className="text-[11px] text-[#2A9D8F] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Instant Sync
            </span>
          </div>

          <CatalogCard
            product={currentProduct}
            language={language}
            isDetailedView={true}
          />
        </div>

        {/* Right Column: Edit AI Suggestions (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E3E2E0] shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E2E0]">
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1C1A] font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8E4E14]" />
              <span>{t.editAISuggestions}</span>
            </h2>

            {/* Tone selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[#534439] hidden sm:inline mr-1">Tone:</span>
              <select
                value={selectedTone}
                onChange={(e) => handleToneChangeAndRegenerate(e.target.value)}
                disabled={isReGenerating}
                className="text-xs py-1 px-2.5 rounded-lg border border-[#D8C2B5] bg-[#FAF9F6] text-[#534439] focus:outline-none focus:ring-1 focus:ring-[#8E4E14]"
              >
                <option value="warm-story">Warm Story</option>
                <option value="modern-luxury">Modern Luxury</option>
                <option value="heritage">Heritage Authentic</option>
              </select>
            </div>
          </div>

          {/* Product Title */}
          <div>
            <label className="block text-xs font-bold text-[#1A1C1A] mb-1.5 uppercase tracking-wider">
              {t.productTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold p-3 rounded-xl border border-[#E3E2E0] bg-[#FAF9F6] focus:bg-white focus:ring-2 focus:ring-[#8E4E14]/30 focus:border-[#8E4E14] focus:outline-none transition-all"
              placeholder="e.g. Handcrafted Terracotta Vase"
            />
          </div>

          {/* Category & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1C1A] mb-1.5 uppercase tracking-wider">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-[#E3E2E0] bg-[#FAF9F6] focus:bg-white focus:ring-2 focus:ring-[#8E4E14]/30 focus:border-[#8E4E14] focus:outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1C1A] mb-1.5 uppercase tracking-wider">
                {t.tagsLabel}
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-[#E3E2E0] bg-[#FAF9F6] focus:bg-white focus:ring-2 focus:ring-[#8E4E14]/30 focus:border-[#8E4E14] focus:outline-none transition-all"
                placeholder="Terracotta, Handmade, Earthy"
              />
            </div>
          </div>

          {/* AI Generated Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#1A1C1A] uppercase tracking-wider">
                {t.aiDescription}
              </label>
              <button
                type="button"
                onClick={() => onReGenerate(selectedTone)}
                disabled={isReGenerating}
                className="text-xs font-bold text-[#8E4E14] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReGenerating ? 'animate-spin' : ''}`} />
                <span>{isReGenerating ? 'Weaving...' : t.reGenerate}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#E3E2E0] bg-[#FAF9F6] focus:bg-white focus:ring-2 focus:ring-[#8E4E14]/30 focus:border-[#8E4E14] focus:outline-none leading-relaxed transition-all resize-none"
            />
          </div>

          {/* Suggested Price Range */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-2">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#8E4E14]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1A]">
                {t.suggestedPriceRange}
              </h4>
            </div>
            <p className="text-[11px] text-[#534439]">{t.basedOnSimilar}</p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#534439] mb-1">
                  {t.minPrice}
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-[#E3E2E0] bg-white focus:ring-1 focus:ring-[#8E4E14] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#534439] mb-1">
                  {t.maxPrice}
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-[#E3E2E0] bg-white focus:ring-1 focus:ring-[#8E4E14] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDraft}
              className="w-full sm:flex-1 py-3 px-5 rounded-full border border-[#8E4E14] text-[#8E4E14] font-bold text-xs hover:bg-[#8E4E14]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveAsDraft}</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#8E4E14] hover:bg-[#6F3800] text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.publishToCatalog}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
