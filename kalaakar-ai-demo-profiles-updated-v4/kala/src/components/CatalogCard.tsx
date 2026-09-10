import React, { useState } from 'react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Share2, Edit3, Heart, Download, Sparkles, MessageCircle, Instagram, CheckCircle2 } from 'lucide-react';
import { exportCatalogCardAsImage } from '../utils/canvasExport';

interface CatalogCardProps {
  product: Product;
  language: Language;
  onEdit?: (product: Product) => void;
  onShare?: (product: Product) => void;
  artisanName?: string;
  isDetailedView?: boolean;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({
  product,
  language,
  onEdit,
  onShare,
  artisanName = 'Vedansh',
  isDetailedView = false,
}) => {
  const t = TRANSLATIONS[language];
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedInstagram, setCopiedInstagram] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await exportCatalogCardAsImage(product, artisanName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = product.whatsappMessage || 
      `✨ *${product.title}*\n${product.description}\n💰 Price: ₹${product.minPrice.toLocaleString('en-IN')} - ₹${product.maxPrice.toLocaleString('en-IN')}\n🛍️ Direct from artisan!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInstagramCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const caption = product.instagramCaption ||
      `${product.title} ✨ Handcrafted with generational artistry.\n\n${product.description}\n\nPrice: ₹${product.minPrice} - ₹${product.maxPrice}\nDM to order directly.\n\n#VocalForLocal #ArtisanMade #HandmadeIndia #KalaakarAI`;
    navigator.clipboard?.writeText(caption);
    setCopiedInstagram(true);
    setTimeout(() => setCopiedInstagram(false), 2500);
  };

  return (
    <article className="tactile-card rounded-2xl overflow-hidden flex flex-col border border-[#E3E2E0]/60 bg-white transition-all hover:shadow-md">
      {/* Product Image Box */}
      <div className="relative h-56 w-full bg-[#EFEEEB] overflow-hidden group">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 backdrop-blur-md rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs">
          {product.status === 'published' ? (
            <span className="bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center gap-1 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.published}</span>
            </span>
          ) : (
            <span className="bg-[#534439]/15 text-[#534439] flex items-center gap-1 px-1.5 py-0.5 rounded">
              <span>{t.draft}</span>
            </span>
          )}
        </div>

        {/* AI Enhanced badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#8E4E14] text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-[#E76F51]" />
          <span>AI Enhanced</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1A1C1A] font-heading line-clamp-1">
              {product.title}
            </h3>
            {product.hindiTitle && language === 'hi' && (
              <p className="text-xs text-[#765A05] font-medium">{product.hindiTitle}</p>
            )}
          </div>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="text-[#867468] hover:text-[#BA1A1A] p-1 transition-colors"
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#BA1A1A] text-[#BA1A1A]' : ''}`} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#534439] mb-3 flex-grow line-clamp-2 leading-relaxed">
          {language === 'hi' && product.hindiDescription ? product.hindiDescription : product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[11px] font-medium bg-[#C6E8F8]/40 text-[#2B4B58] px-2 py-0.5 rounded-md">
            {product.category}
          </span>
          {product.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="text-[11px] font-medium bg-[#E3E2E0]/50 text-[#534439] px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <hr className="border-[#E3E2E0]/70 my-2" />

        {/* Price & Action Row */}
        <div className="flex justify-between items-center pt-1">
          <div>
            <span className="text-[10px] text-[#765A05] block font-medium uppercase tracking-wider">
              {t.suggestedPriceRange}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#1A1C1A] font-heading">
              ₹{product.minPrice.toLocaleString('en-IN')}
              {product.maxPrice > product.minPrice && ` - ₹${product.maxPrice.toLocaleString('en-IN')}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-[#534439] hover:bg-[#E3E2E0]/60 rounded-full transition-colors cursor-pointer"
                title="Edit AI Suggestions"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {onShare && (
              <button
                onClick={() => onShare(product)}
                className="p-2 text-[#8E4E14] hover:bg-[#FFDCC4]/50 rounded-full transition-colors cursor-pointer"
                title="Share Listing"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleWhatsAppShare}
              className="p-2 text-[#2A9D8F] hover:bg-[#2A9D8F]/15 rounded-full transition-colors cursor-pointer"
              title="Share to WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed action bar (when used in catalog preview) */}
        {isDetailedView && (
          <div className="mt-4 pt-3 border-t border-[#E3E2E0] flex flex-col gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-2.5 px-4 bg-[#F4F3F1] hover:bg-[#E9E8E5] text-[#1A1C1A] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#D8C2B5] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#8E4E14]" />
              <span>{downloadSuccess ? t.downloadToast : isDownloading ? 'Generating...' : t.downloadCard}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="py-2 px-3 bg-[#2A9D8F]/10 hover:bg-[#2A9D8F]/20 text-[#2A9D8F] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.shareWhatsApp}</span>
              </button>

              <button
                onClick={handleInstagramCopy}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  copiedInstagram
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-[#E76F51]/10 hover:bg-[#E76F51]/20 text-[#E76F51]'
                }`}
              >
                {copiedInstagram ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    <span>{t.shareInstagram}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
