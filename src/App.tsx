import React, { useState, useEffect } from 'react';
import {
  Language,
  TabType,
  Product,
  ArtisanProfile,
} from './types';
import {
  INITIAL_ARTISAN,
  INITIAL_PRODUCTS,
  TRANSLATIONS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CatalogCard } from './components/CatalogCard';
import { LandingHero } from './components/LandingHero';
import { AddNewProductWizard } from './components/AddNewProductWizard';
import { AIProcessingView } from './components/AIProcessingView';
import { CatalogEditView } from './components/CatalogEditView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { SmartNegotiatorView } from './components/SmartNegotiatorView';
import { AuthScreen } from './components/AuthScreen';
import { ensureDemoUsers, getCurrentUser, getUserProductsKey, getLegacyProductsKey, signOut, updateCurrentUser } from './auth';
import { ShareModal } from './components/ShareModal';
import { ArtisanSwitcherModal } from './components/ArtisanSwitcherModal';
import {
  Package,
  Layers,
  Share2,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function App() {
  // Global App States
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [artisan, setArtisan] = useState<ArtisanProfile>(INITIAL_ARTISAN);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Products are now isolated per signed-in user.
  const [products, setProducts] = useState<Product[]>([]);

  // Active Creation Wizard States
  const [creationStage, setCreationStage] = useState<'input' | 'processing' | 'edit'>('input');
  const [currentDraftProduct, setCurrentDraftProduct] = useState<Product | null>(null);
  const [isReGenerating, setIsReGenerating] = useState(false);

  // Modals & Popups
  const [activeShareProduct, setActiveShareProduct] = useState<Product | null>(null);
  const [isArtisanSwitcherOpen, setIsArtisanSwitcherOpen] = useState(false);

  // Product List Filter & Search
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Restore the signed-in session and initialise the demo account once.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        await ensureDemoUsers(INITIAL_ARTISAN);
        const user = getCurrentUser();

        if (!cancelled && user) {
          setCurrentUserId(user.id);
          setArtisan(user.artisan);

          const userProductsKey = getUserProductsKey(user.id);
          const saved = localStorage.getItem(userProductsKey);

          if (saved) {
            setProducts(JSON.parse(saved));
          } else if (user.id === 'user-demo') {
            // Migrate the old single-user storage once, if it exists.
            const legacy = localStorage.getItem(getLegacyProductsKey());
            const initial = legacy ? JSON.parse(legacy) : INITIAL_PRODUCTS;
            setProducts(initial);
            localStorage.setItem(userProductsKey, JSON.stringify(initial));
          } else {
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Failed to restore authentication session:', error);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // Sync products to the currently signed-in user's storage.
  useEffect(() => {
    if (!currentUserId) return;
    try {
      localStorage.setItem(getUserProductsKey(currentUserId), JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products, currentUserId]);

  const t = TRANSLATIONS[language];

  const handleAuthenticated = ({ artisan: authenticatedArtisan }: { artisan: ArtisanProfile }) => {
    const user = getCurrentUser();
    if (!user) return;

    setCurrentUserId(user.id);
    setArtisan(authenticatedArtisan);

    const saved = localStorage.getItem(getUserProductsKey(user.id));
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch {
        setProducts([]);
      }
    } else {
      setProducts(['user-demo', 'user-vedansh-demo', 'user-nitish-demo', 'user-vaishu-demo'].includes(user.id) ? INITIAL_PRODUCTS : []);
    }

    setCurrentTab('home');
    setCreationStage('input');
  };

  const handleLogout = () => {
    signOut();
    setCurrentUserId(null);
    setProducts([]);
    setArtisan(INITIAL_ARTISAN);
    setCurrentTab('home');
    setCurrentDraftProduct(null);
  };

  const handleUpdateArtisan = (updates: Partial<ArtisanProfile>) => {
    setArtisan((previous) => {
      const updated = { ...previous, ...updates };
      if (currentUserId) {
        updateCurrentUser({ artisan: updated, name: updated.name });
      }
      return updated;
    });
  };

  // Handle Generate Listing from Photo + Voice Story
  const handleStartGenerating = async (data: {
    photoUrl: string;
    photoBase64?: string;
    story: string;
  }) => {
    setCreationStage('processing');

    try {
      // Call our backend Express API route
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: data.photoUrl,
          photoBase64: data.photoBase64,
          story: data.story,
          language,
          artisanName: language === 'hi' ? artisan.hindiName : artisan.name,
          region: artisan.location,
        }),
      });

      let aiResult;
      if (response.ok) {
        aiResult = await response.json();
      } else {
        throw new Error('Backend generation returned status ' + response.status);
      }

      const listing = aiResult.data || aiResult;

      // Create new draft product
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        title: listing.title || 'Handcrafted Heritage Art Piece',
        hindiTitle: listing.hindiTitle,
        category: listing.category || 'Home Decor',
        tags: listing.tags || ['Handmade', 'Artisan Crafted', 'Authentic'],
        description: listing.description || data.story,
        hindiDescription: listing.hindiDescription,
        minPrice: listing.minPrice || 1200,
        maxPrice: listing.maxPrice || 1500,
        imageUrl: data.photoUrl,
        voiceTranscript: data.story,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        views: 1,
        shares: 0,
        inquiries: 0,
        whatsappMessage: listing.whatsappMessage,
        instagramCaption: listing.instagramCaption,
      };

      setCurrentDraftProduct(newProduct);
      setCreationStage('edit');
    } catch (err) {
      console.warn('API call fallback triggered:', err);
      const s = (data.story || '').toLowerCase();
      let fallback: Product;

      if (s.includes('saree') || s.includes('साड़ी') || s.includes('silk') || s.includes('रेशम') || s.includes('banarasi')) {
        fallback = {
          id: 'prod-' + Date.now(),
          title: 'Hand-woven Banarasi Silk Saree',
          hindiTitle: 'हाथ से बुनी बनारसी सिल्क साड़ी',
          category: 'Textiles & Apparel',
          tags: ['Handloom', 'Mulberry Silk', 'Banarasi Zari', 'Artisan Heritage'],
          description: 'Meticulously hand-woven on a traditional pit-loom with intricate floral zari border motifs crafted over three days of dedicated artisan labor.',
          hindiDescription: 'पारंपरिक हथकरघे पर बारीकी से बुनी गई यह उत्कृष्ट रेशमी साड़ी, तीन दिनों के समर्पण और श्रम से बनी है।',
          minPrice: 8000,
          maxPrice: 10000,
          imageUrl: data.photoUrl,
          voiceTranscript: data.story,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          views: 1,
          shares: 0,
          inquiries: 0,
          whatsappMessage: '✨ *Hand-woven Banarasi Silk Saree* ✨\nHandcrafted pure silk zari work. Direct from Varanasi weaver.\n💰 Price: ₹8,000 - ₹10,000',
        };
      } else if (s.includes('toy') || s.includes('लकड़ी') || s.includes('wood') || s.includes('खिलौने')) {
        fallback = {
          id: 'prod-' + Date.now(),
          title: 'Heritage Painted Wooden Toys Set',
          hindiTitle: 'पारंपरिक नक्काशीदार लकड़ी के खिलौने',
          category: 'Toys & Dolls',
          tags: ['Teak Wood', 'Organic Lacquer', 'Child Safe', 'Handmade'],
          description: 'Carved from sustainably sourced local wood and coated with vibrant non-toxic natural vegetable dyes. Smooth rounded edges for safe imaginative play.',
          hindiDescription: 'प्राकृतिक लकड़ी और सुरक्षित वनस्पति रंगों से हाथ से तराशे गए पारंपरिक खिलौने।',
          minPrice: 1200,
          maxPrice: 1400,
          imageUrl: data.photoUrl,
          voiceTranscript: data.story,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          views: 1,
          shares: 0,
          inquiries: 0,
          whatsappMessage: '🪵 *Heritage Painted Wooden Toys Set* 🪵\nCarved from sustainable wood with safe vegetable dyes.\n💰 Price: ₹1,200 - ₹1,400',
        };
      } else if (s.includes('brass') || s.includes('पीतल') || s.includes('दीपक') || s.includes('diya')) {
        fallback = {
          id: 'prod-' + Date.now(),
          title: 'Handcrafted Heritage Brass Diya',
          hindiTitle: 'हस्तनिर्मित पारंपरिक पीतल का मयूर दीपक',
          category: 'Home Decor',
          tags: ['Brass', 'Lost-wax Cast', 'Traditional Metalcraft', 'Puja Essential'],
          description: 'Cast from pure bell-metal brass using the generational lost-wax casting technique. Features intricate peacock engravings and hand-buffed golden luster.',
          hindiDescription: 'खोया-मोम ढलाई विधि से शुद्ध पीतल में निर्मित मयूर नक्काशीदार पारंपरिक दीपक।',
          minPrice: 2000,
          maxPrice: 2500,
          imageUrl: data.photoUrl,
          voiceTranscript: data.story,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          views: 1,
          shares: 0,
          inquiries: 0,
          whatsappMessage: '🪔 *Handcrafted Heritage Brass Diya* 🪔\nCast in pure brass with intricate peacock engraving.\n💰 Price: ₹2,000 - ₹2,500',
        };
      } else {
        fallback = {
          id: 'prod-' + Date.now(),
          title: 'Handcrafted Terracotta Decorative Vase',
          hindiTitle: 'हस्तनिर्मित टेराकोटा नक्काशीदार गुलदस्ता',
          category: 'Home Decor',
          tags: ['Terracotta', 'Handmade', 'Tribal Motifs', 'Natural Clay'],
          description: 'Hand-turned on traditional potters wheel using alluvial clay from river banks. Sun-dried and kiln-baked with intricate geometric tribal etchings.',
          hindiDescription: 'पारंपरिक कुम्हार के चाक पर शुद्ध चिकनी मिट्टी से गढ़ा गया सुंदर सजावटी बर्तन।',
          minPrice: 1200,
          maxPrice: 1500,
          imageUrl: data.photoUrl,
          voiceTranscript: data.story,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          views: 1,
          shares: 0,
          inquiries: 0,
          whatsappMessage: '🏺 *Handcrafted Terracotta Decorative Vase* 🏺\nHand-molded river clay with tribal etchings.\n💰 Price: ₹1,200 - ₹1,500',
        };
      }

      setCurrentDraftProduct(fallback);
      setCreationStage('edit');
    }
  };

  // Handle re-generation with different tone
  const handleReGenerate = async (tone: string) => {
    if (!currentDraftProduct) return;
    setIsReGenerating(true);

    try {
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: currentDraftProduct.imageUrl,
          story: currentDraftProduct.voiceTranscript || currentDraftProduct.description,
          language,
          artisanName: artisan.name,
          region: artisan.location,
          tone,
        }),
      });

      if (response.ok) {
        const aiResult = await response.json();
        const listing = aiResult.data || aiResult;
        setCurrentDraftProduct({
          ...currentDraftProduct,
          description: listing.description || currentDraftProduct.description,
          tags: listing.tags || currentDraftProduct.tags,
          title: listing.title || currentDraftProduct.title,
        });
      }
    } catch (e) {
      console.error('Re-generate error:', e);
    } finally {
      setIsReGenerating(false);
    }
  };

  // Publish / Save Handlers
  const handlePublishListing = (finalProduct: Product) => {
    setProducts((prev) => [finalProduct, ...prev.filter((p) => p.id !== finalProduct.id)]);
    showToast(t.successToast);
    setCurrentDraftProduct(null);
    setCreationStage('input');
    setCurrentTab('products');
  };

  const handleSaveDraft = (draftProduct: Product) => {
    setProducts((prev) => [draftProduct, ...prev.filter((p) => p.id !== draftProduct.id)]);
    showToast('Product saved as draft!');
    setCurrentDraftProduct(null);
    setCreationStage('input');
    setCurrentTab('products');
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesStatus =
      filterStatus === 'all' ? true : p.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.tags.some((tag) => tag.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#8E4E14] text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#1A1C1A]">Loading Kalaकार AI...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <AuthScreen
        language={language}
        defaultArtisan={INITIAL_ARTISAN}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1C1A] selection:bg-[#FFDCC4] selection:text-[#6F3800]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1A1C1A] text-white px-5 py-3 rounded-full text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'add-new') {
            setCreationStage('input');
          }
        }}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
        artisan={artisan}
        showArtisanSwitcher={currentUserId === 'user-demo'}
        onOpenArtisanSwitcher={() => setIsArtisanSwitcherOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-grow pb-24 md:pb-12">
        {/* TAB 1: HOME */}
        {currentTab === 'home' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 animate-in fade-in">
            {/* Top Greeting & Metric Stats Bar (Image 1, 21) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] font-heading">
                    {language === 'hi' ? `नमस्ते, ${artisan.hindiName}!` : `Namaste, ${artisan.name}!`}
                  </h1>
                  <p className="text-sm text-[#534439]">{t.subtitle}</p>
                </div>

                <button
                  onClick={() => {
                    setCurrentTab('add-new');
                    setCreationStage('input');
                  }}
                  className="bg-[#8E4E14] hover:bg-[#6F3800] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNew}</span>
                </button>
              </div>

              {/* 3 Metric Summary Pills */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div className="tactile-card rounded-2xl p-4 sm:p-5 bg-white border border-[#E3E2E0] flex flex-col justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-[#534439] uppercase tracking-wider">
                    {t.totalProducts}
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] font-heading">
                      {products.length}
                    </span>
                  </div>
                </div>

                <div className="tactile-card rounded-2xl p-4 sm:p-5 bg-white border border-[#E3E2E0] flex flex-col justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-[#534439] uppercase tracking-wider">
                    {t.activeListings}
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#2A9D8F] font-heading">
                      {products.filter((p) => p.status === 'published').length}
                    </span>
                  </div>
                </div>

                <div className="tactile-card rounded-2xl p-4 sm:p-5 bg-white border border-[#E3E2E0] flex flex-col justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-[#534439] uppercase tracking-wider">
                    {t.totalShares}
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#8E4E14] font-heading">
                      {products.reduce((acc, curr) => acc + curr.shares, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Landing Hero & 4 Step Workflow (Image 3, 15) */}
            <LandingHero
              language={language}
              onStartSelling={() => {
                setCurrentTab('add-new');
                setCreationStage('input');
              }}
              onOpenNegotiator={() => setCurrentTab('negotiator')}
            />

            {/* Recent Products Row */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1C1A] font-heading">
                  {t.recentProducts}
                </h2>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="text-xs font-bold text-[#8E4E14] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.viewAll}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 3).map((prod) => (
                  <CatalogCard
                    key={prod.id}
                    product={prod}
                    language={language}
                    artisanName={artisan.name}
                    onShare={(p) => setActiveShareProduct(p)}
                    onEdit={(p) => {
                      setCurrentDraftProduct(p);
                      setCreationStage('edit');
                      setCurrentTab('add-new');
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Site Footer */}
            <footer className="mt-10 rounded-3xl bg-[#1A1C1A] text-white overflow-hidden">
              <div className="px-6 sm:px-10 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 block mb-3">
                      {t.supportedBy}
                    </span>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                      <span>CRAFTMARK INDIA</span>
                      <span>•</span>
                      <span>RURALINDIA ALLIANCE</span>
                      <span>•</span>
                      <span>ARTISAN CO-OP GUILD</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60 mr-1">Follow us</span>
                    <a
                      href="https://www.instagram.com/k_jahanshu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/10 transition-all"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-6 py-4 text-center">
                <p className="text-xs text-white/50">
                  © 2026 Kalaakar AI. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        )}

        {/* TAB 2: MY PRODUCTS */}
        {currentTab === 'products' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] font-heading mb-1">
                  {t.myProducts}
                </h1>
                <p className="text-xs sm:text-sm text-[#534439]">
                  Manage, share and track your handcrafted item listings.
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentTab('add-new');
                  setCreationStage('input');
                }}
                className="bg-[#8E4E14] hover:bg-[#6F3800] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNew}</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#E3E2E0]/50 rounded-xl max-w-fit">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === 'all'
                      ? 'bg-white text-[#1A1C1A] shadow-xs'
                      : 'text-[#534439] hover:text-[#1A1C1A]'
                  }`}
                >
                  {t.all} ({products.length})
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === 'published'
                      ? 'bg-white text-[#2A9D8F] shadow-xs'
                      : 'text-[#534439] hover:text-[#1A1C1A]'
                  }`}
                >
                  {t.published} ({products.filter((p) => p.status === 'published').length})
                </button>
                <button
                  onClick={() => setFilterStatus('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === 'draft'
                      ? 'bg-white text-[#8E4E14] shadow-xs'
                      : 'text-[#534439] hover:text-[#1A1C1A]'
                  }`}
                >
                  {t.draft} ({products.filter((p) => p.status === 'draft').length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#867468]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E3E2E0] bg-white text-xs text-[#1A1C1A] focus:outline-none focus:ring-1 focus:ring-[#8E4E14]"
                />
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredProducts.map((prod) => (
                  <CatalogCard
                    key={prod.id}
                    product={prod}
                    language={language}
                    artisanName={artisan.name}
                    onShare={(p) => setActiveShareProduct(p)}
                    onEdit={(p) => {
                      setCurrentDraftProduct(p);
                      setCreationStage('edit');
                      setCurrentTab('add-new');
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="tactile-card rounded-3xl p-12 text-center bg-white border border-[#E3E2E0] space-y-4">
                <Package className="w-12 h-12 text-[#867468] mx-auto opacity-50" />
                <h3 className="text-base font-bold text-[#1A1C1A]">No products found</h3>
                <p className="text-xs text-[#534439]">
                  Try adjusting your search query or create a new craft listing.
                </p>
                <button
                  onClick={() => {
                    setCurrentTab('add-new');
                    setCreationStage('input');
                  }}
                  className="bg-[#8E4E14] text-white px-5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNew}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD NEW PRODUCT FLOW (Wizard -> AI Processing -> Catalog Edit) */}
        {currentTab === 'add-new' && (
          <div>
            {creationStage === 'input' && (
              <AddNewProductWizard
                language={language}
                onStartGenerating={handleStartGenerating}
                onCancel={() => setCurrentTab('home')}
              />
            )}

            {creationStage === 'processing' && (
              <AIProcessingView language={language} />
            )}

            {creationStage === 'edit' && currentDraftProduct && (
              <CatalogEditView
                initialProduct={currentDraftProduct}
                language={language}
                onPublish={handlePublishListing}
                onSaveDraft={handleSaveDraft}
                onReGenerate={handleReGenerate}
                isReGenerating={isReGenerating}
              />
            )}
          </div>
        )}

        {/* TAB 4: SMART NEGOTIATOR & BUYER INQUIRY ASSISTANT */}
        {currentTab === 'negotiator' && (
          <SmartNegotiatorView
            products={products}
            language={language}
            artisan={artisan}
            onOpenShareModal={(p) => setActiveShareProduct(p)}
            onSelectTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* TAB 5: ANALYTICS */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            language={language}
            products={products}
            onViewProduct={(p) => setActiveShareProduct(p)}
          />
        )}

        {/* TAB 6: SETTINGS */}
        {currentTab === 'settings' && (
          <SettingsView
            language={language}
            onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
            artisan={artisan}
            onUpdateArtisan={handleUpdateArtisan}
            onSignOut={handleLogout}
          />
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        product={activeShareProduct}
        onClose={() => setActiveShareProduct(null)}
        language={language}
        artisanName={language === 'hi' ? artisan.hindiName : artisan.name}
      />

      {/* Artisan Switcher Modal */}
      {isArtisanSwitcherOpen && currentUserId === 'user-demo' && (
        <ArtisanSwitcherModal
          currentArtisan={artisan}
          onSelectArtisan={(selected) => handleUpdateArtisan(selected)}
          onClose={() => setIsArtisanSwitcherOpen(false)}
          language={language}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'add-new') {
            setCreationStage('input');
          }
        }}
        language={language}
      />
    </div>
  );
}

export default App;
