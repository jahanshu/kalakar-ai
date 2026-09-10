import React, { useState } from 'react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { X, MessageCircle, Instagram, Copy, Download, Check, ExternalLink } from 'lucide-react';
import { exportCatalogCardAsImage } from '../utils/canvasExport';

interface ShareModalProps {
  product: Product | null;
  onClose: () => void;
  language: Language;
  artisanName?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  product,
  onClose,
  language,
  artisanName = 'Vedansh',
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);
  const [copiedInstagram, setCopiedInstagram] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  if (!product) return null;

  const shareText = product.whatsappMessage ||
    `✨ *${product.title}*\n${product.description}\n💰 Fair Price: ₹${product.minPrice} - ₹${product.maxPrice}\n🛍️ Direct Artisan Craft. Reply to order!`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInstagram = () => {
    const caption = `${product.title} ✨ Handcrafted with generational artistry.\n\n${product.description}\n\nPrice: ₹${product.minPrice} - ₹${product.maxPrice}\nDM to order directly from the artisan.\n\n#VocalForLocal #ArtisanCraft #KalaakarAI #IndianCraftsmanship`;
    navigator.clipboard?.writeText(caption);
    setCopiedInstagram(true);
    setTimeout(() => setCopiedInstagram(false), 2500);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportCatalogCardAsImage(product, artisanName);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E3E2E0] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#534439] hover:bg-[#E3E2E0]/50 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-[#1A1C1A] font-heading mb-1">
          Share Product Catalog
        </h3>
        <p className="text-xs text-[#534439] mb-5">
          Reach buyers on WhatsApp, social media, and craft groups with one tap.
        </p>

        {/* Small preview card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] mb-5">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#1A1C1A] truncate">{product.title}</h4>
            <p className="text-xs text-[#765A05] font-semibold">
              ₹{product.minPrice.toLocaleString('en-IN')} - ₹{product.maxPrice.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#2A9D8F] font-medium">✓ Ready for Instant Sharing</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <span>Share to WhatsApp (Direct Chat / Status)</span>
          </button>

          <button
            onClick={handleInstagram}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copiedInstagram
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#E76F51]/10 hover:bg-[#E76F51]/20 text-[#8E4E14]'
            }`}
          >
            {copiedInstagram ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Instagram Caption Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Instagram className="w-5 h-5 text-[#E76F51]" />
                <span>Copy Instagram Story & Post Caption</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              downloadDone
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-[#F4F3F1] hover:bg-[#E9E8E5] text-[#1A1C1A] border-[#D8C2B5]'
            }`}
          >
            {downloadDone ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Card Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-[#8E4E14]" />
                <span>{downloading ? 'Creating Image...' : 'Download Branded Card (PNG)'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl hover:bg-[#FAF9F6] text-[#534439] text-xs font-semibold flex items-center justify-center gap-2 border border-[#E3E2E0] transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#2A9D8F]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
