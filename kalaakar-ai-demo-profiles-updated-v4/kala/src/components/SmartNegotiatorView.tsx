import React, { useState, useEffect, useRef } from 'react';
import { Product, Language, SmartReplyResult, ReplyStrategy, ArtisanProfile } from '../types';
import {
  Sparkles,
  MessageSquare,
  Send,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Shield,
  Handshake,
  Zap,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Mic,
  MicOff,
  ChevronRight,
  ExternalLink,
  Package,
  Clock,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

interface SmartNegotiatorViewProps {
  products: Product[];
  language: Language;
  artisan?: ArtisanProfile;
  onOpenShareModal?: (product: Product) => void;
  onSelectTab?: (tab: any) => void;
}

const SAMPLE_SCENARIOS = [
  {
    id: 'bargain',
    label: '💰 Aggressive Bargain',
    labelHi: '💰 भारी सौदेबाज़ी',
    buyerQuery:
      'Can you give this saree for ₹4,000? Local market has similar sarees for ₹1,500, why is yours ₹8,500?',
    buyerQueryHi:
      'क्या यह साड़ी ₹4,000 में मिलेगी? लोकल मार्केट में तो ऐसी साड़ियां ₹1,500 में मिल रही हैं, आपका दाम ₹8,500 क्यों है?',
    artisanNote: 'Takes 12 days on traditional pit loom. Pure mulberry silk yarn.',
  },
  {
    id: 'authenticity',
    label: '🧵 Pure Silk / Material Test',
    labelHi: '🧵 शुद्धता और सामग्री की जांच',
    buyerQuery:
      'Is this 100% pure silk and real zari or a polyester powerloom blend? How can I test its purity?',
    buyerQueryHi:
      'क्या यह 100% शुद्ध रेशम और असली ज़री है या पॉलिएस्टर मशीन की बनी है? इसकी शुद्धता की क्या गारंटी है?',
    artisanNote: 'Silk Mark certified, pure natural dyes, test burns leave pure ash.',
  },
  {
    id: 'bulk',
    label: '🎁 Wedding / Bulk Order (15 pcs)',
    labelHi: '🎁 शादी / थोक आर्डर (15 पीस)',
    buyerQuery:
      'We need 15 pieces for a wedding next Friday in Delhi. Can you deliver on time and give your best wholesale rate?',
    buyerQueryHi:
      'हमें अगले शुक्रवार तक दिल्ली में शादी के लिए 15 पीस चाहिए। क्या समय पर डिलीवरी हो जाएगी और थोक भाव क्या होगा?',
    artisanNote: 'Can dispatch 10 immediately, 5 in 3 days. Free gift tags included.',
  },
  {
    id: 'shipping',
    label: '✈️ Overseas / Fragile Delivery',
    labelHi: '✈️ विदेश / सुरक्षित डिलीवरी',
    buyerQuery:
      'I want to send this terracotta craft to my sister in the USA. Will it break during shipping and how will it be packed?',
    buyerQueryHi:
      'मैं यह टेराकोटा शिल्प अपनी बहन के लिए अमेरिका भेजना चाहता हूँ। क्या यह रास्ते में टूटेगा तो नहीं और पैकिंग कैसी होगी?',
    artisanNote: 'Triple-layer bubble wrap, thermo-foam cushioning, and heavy corrugated wooden box.',
  },
];

export const SmartNegotiatorView: React.FC<SmartNegotiatorViewProps> = ({
  products,
  language,
  artisan,
}) => {
  // Selected product to negotiate on
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Custom inputs
  const [customTitle, setCustomTitle] = useState(selectedProduct?.title || '');
  const [customPrice, setCustomPrice] = useState<number | string>(
    selectedProduct?.minPrice || 8500
  );
  const [buyerQuery, setBuyerQuery] = useState(SAMPLE_SCENARIOS[0].buyerQuery);
  const [artisanNote, setArtisanNote] = useState(SAMPLE_SCENARIOS[0].artisanNote);

  // Status & states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmartReplyResult | null>(null);
  const [activeStrategyId, setActiveStrategyId] = useState<'firm' | 'compromise' | 'closer'>('firm');
  const [replyLang, setReplyLang] = useState<'en' | 'hi'>('en');

  // Interactive tools
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sync selected product changes to inputs
  useEffect(() => {
    if (selectedProduct) {
      setCustomTitle(selectedProduct.title);
      setCustomPrice(selectedProduct.minPrice);
    }
  }, [selectedProductId]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn('Recognition abort error:', e);
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Handle Speech Recognition for artisan dictation
  const handleToggleRecord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस स्पीच उपलब्ध नहीं है। कृपया टाइप करें या त्वरित परिदृश्य चुनें।'
          : 'Voice speech recognition is not supported in this browser environment. Please type or select a sample scenario.'
      );
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Recognition stop error:', e);
        }
        recognitionRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setBuyerQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onerror = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
      recognitionRef.current = null;
    }
  };

  // Submit negotiation request to backend
  const handleGenerateReplies = async () => {
    if (!buyerQuery.trim() || buyerQuery.trim().length < 4) {
      setError(
        language === 'hi'
          ? 'कृपया ग्राहक का संदेश या सवाल दर्ज करें (कम से कम 4 अक्षर)'
          : 'Please enter the buyer message or question (at least 4 characters).'
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    const resolvedArtisanName = language === 'hi'
      ? (artisan?.hindiName || 'वेदांश')
      : (artisan?.name || 'Vedansh');

    try {
      const res = await fetch('/api/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: customTitle || selectedProduct?.title || 'Handcrafted Artisan Creation',
          productPrice: customPrice || selectedProduct?.minPrice || 1500,
          productCategory: selectedProduct?.category || 'Handicrafts',
          productDescription: selectedProduct?.description || '',
          buyerQuery: buyerQuery.trim(),
          artisanNote: artisanNote.trim(),
          artisanName: resolvedArtisanName,
          language,
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        // Default to first strategy
        if (json.data.strategies?.length > 0) {
          setActiveStrategyId(json.data.strategies[0].id);
        }
      } else {
        throw new Error(json.error || 'Failed to process inquiry');
      }
    } catch (err: any) {
      console.warn('Negotiator API fallback triggered:', err);
      const q = (buyerQuery || '').toLowerCase();
      const numPrice = typeof customPrice === 'number' ? customPrice : parseInt(String(customPrice).replace(/[^0-9]/g, '')) || 1500;
      const title = customTitle || selectedProduct?.title || 'Handcrafted Art Piece';
      const name = resolvedArtisanName;

      let fallbackResult: SmartReplyResult;

      if (q.includes('bulk') || q.includes('wholesale') || q.includes('wedding') || q.includes('pieces') || q.includes('शादी') || q.includes('थोक')) {
        const bulkRate = Math.round(numPrice * 0.88);
        fallbackResult = {
          buyerIntent: language === 'hi' ? 'शादी व थोक आर्डर पूछताछ' : 'Bulk & Wedding Event Gifting',
          sentiment: 'High Intent',
          challengeLevel: 'Medium',
          priceDefensePoints: [
            language === 'hi' ? 'मास्टर शिल्प गुणवत्ता बनाए रखने के लिए करघा/भट्टी का समय आरक्षित होता है।' : `Each ${title} is individually hand-shaped to ensure master craftsmanship.`,
            language === 'hi' ? '10 या अधिक पीस पर सामग्री बचत का लाभ सीधा खरीदार को मिलता है।' : `Direct weaver rate of ₹${bulkRate.toLocaleString('en-IN')} for 10+ quantities.`,
            language === 'hi' ? 'शादी व उपहारों के लिए विशेष हस्तनिर्मित टैग व जूट पैकिंग शामिल है।' : 'Includes bespoke artisan gift tags and eco-friendly packing.'
          ],
          strategies: [
            {
              id: 'compromise',
              name: 'Tiered Bulk Privilege',
              hindiName: 'थोक व शादी का विशेष मूल्य',
              badge: '📦 Volume Advantage',
              tacticAdvice: 'Offer a structured volume tier that rewards larger quantities while maintaining healthy margin.',
              englishMessage: `Namaste! 🙏 Thank you for considering our *${title}* for your celebration.\n\nFor 10+ pieces, we can offer a special direct-artisan rate of *₹${bulkRate.toLocaleString('en-IN')} per piece* (regular ₹${numPrice.toLocaleString('en-IN')}).\n\n🎁 *Includes*: Customized keepsake tags + sustainable packaging.\n🚚 *Dispatch*: Within 4-6 days.\n\nHow many pieces do you need? We can reserve our crafting schedule for you today! ✨`,
              hindiMessage: `नमस्ते! 🙏 आपके विशेष अवसर के लिए *${title}* चुनने का धन्यवाद। 10 या उससे अधिक पीस के लिए हम विशेष कारीगर दर ₹${bulkRate.toLocaleString('en-IN')} प्रति पीस दे सकते हैं। इसमें सुंदर जूट बॉक्स पैकिंग भी शामिल होगी। क्या हम आपका बैच आरक्षित करें?`
            },
            {
              id: 'firm',
              name: 'Quality Guarantee Focus',
              hindiName: 'गुणवत्ता व समय सीमा',
              badge: '🛡️ Authenticity First',
              tacticAdvice: 'Assure the buyer that every single piece in the bulk order will maintain identical master artisan quality.',
              englishMessage: `Hello! For orders of this scale, each *${title}* is individually hand-crafted by ${name} to guarantee flawless heritage standard.\n\nWe would be honored to craft these for you. Let us know your delivery date so we can reserve our workshop! 🙏`,
              hindiMessage: `नमस्ते! बड़े ऑर्डर में भी हर एक पीस हमारे मास्टर कारीगर ${name} द्वारा हाथ से परखा जाएगा। कृपया अपनी अंतिम डिलीवरी तारीख बताएं ताकि हम काम शुरू कर सकें।`
            },
            {
              id: 'closer',
              name: 'Sample First Closer',
              hindiName: 'सैंपल बुकिंग और पुष्टि',
              badge: '⚡ Sample First',
              tacticAdvice: 'Close a single piece sample order immediately so the client can verify and approve the full batch.',
              englishMessage: `We can express dispatch 1 finished sample piece of *${title}* to you today at *₹${numPrice.toLocaleString('en-IN')}*, and adjust the difference in your final bulk order! 🚚✨`,
              hindiMessage: `हम आज ही आपके पते पर 1 सैंपल पीस भेज सकते हैं। जब आप पूरे बैच का ऑर्डर देंगे, तो यह राशि उसमें समायोजित कर दी जाएगी। क्या हम सैंपल भेजें?`
            }
          ]
        };
      } else if (q.includes('discount') || q.includes('कम') || q.includes('सस्ता') || q.includes('cheap') || q.includes('₹') || q.includes('price') || q.includes('rate') || q.includes('mehenga') || q.includes('expensive')) {
        fallbackResult = {
          buyerIntent: language === 'hi' ? 'मूल्य सौदेबाज़ी व छूट अनुरोध' : 'Price Bargaining & Discount Request',
          sentiment: 'Bargain Hunter',
          challengeLevel: 'High',
          priceDefensePoints: [
            language === 'hi' ? 'हर उत्पाद को हाथ से बनाने में 24-48 घंटे का समय और शुद्ध प्राकृतिक सामग्री लगती है।' : `Requires 24-48 hours of manual handcrafting using natural river/handloom materials.`,
            language === 'hi' ? 'सीधा कारीगर मूल्य होने से 100% राशि कारीगर परिवार तक पहुँचती है, कोई बिचौलिया नहीं है।' : `Direct-from-artisan price of ₹${numPrice.toLocaleString('en-IN')} has 0% middleman commission.`,
            language === 'hi' ? 'मशीनी उत्पादों के विपरीत यह असली पारंपरिक कला है जो वर्षों तक चलती है।' : 'Authentic generational folk art that outlasts factory plastic clones.'
          ],
          strategies: [
            {
              id: 'firm',
              name: 'Firm on Value (No Discount)',
              hindiName: 'मूल्य पर अडिग (शिल्प का सम्मान)',
              badge: '🛡️ Protect Margin',
              tacticAdvice: 'Educates the buyer on the days of manual labor so they appreciate the fixed fair price.',
              englishMessage: `Namaste! 🙏 Thank you for loving our *${title}*.\n\nSince this piece is 100% hand-crafted by ${name} over several days of dedicated work using natural materials, our price of *₹${numPrice.toLocaleString('en-IN')}* is kept completely fair with zero middleman margins.\n\nUnlike factory machine items, every thread and curve is shaped by human hands. We hope you will support genuine Indian craftsmanship! Would you like us to reserve this piece for you? ✨`,
              hindiMessage: `नमस्ते! 🙏 हमारे *${title}* को पसंद करने के लिए धन्यवाद। क्योंकि यह उत्पाद हमारे कारीगरों द्वारा कई दिनों की कड़ी मेहनत और शुद्ध प्राकृतिक सामग्री से बनाया गया है, इसलिए ₹${numPrice.toLocaleString('en-IN')} का यह मूल्य पूरी तरह उचित है। हम मशीन नहीं, असली हाथ की कला बनाते हैं। क्या हम इसे आपके लिए पैक करें?`
            },
            {
              id: 'compromise',
              name: 'Win-Win Counter-Offer',
              hindiName: 'सम्मानजनक समझौता (स्मार्ट डील)',
              badge: '🤝 Value-Add Offer',
              tacticAdvice: 'Offers a complimentary handmade gift or modest bundle saving instead of devaluing the craft.',
              englishMessage: `Hello! 🌿 We truly value your interest in our *${title}*.\n\nWhile our individual price is fixed at *₹${numPrice.toLocaleString('en-IN')}* to honor our artisan's time, we'd love to make this special for you:\n\n🎁 *Complimentary Gift*: We will include a handcrafted keepsake pouch / miniature gift with your order!\n🚚 *Free Safe Courier*: Pan-India door delivery on us.\n\nLet us know if this works so we can begin safe packaging for you today! 📦`,
              hindiMessage: `नमस्ते! कारीगर की मेहनत का सम्मान करते हुए हम मुख्य मूल्य ₹${numPrice.toLocaleString('en-IN')} कम नहीं कर सकते, लेकिन आपके लिए हम एक सुंदर हस्तनिर्मित उपहार (उपहार थैली/दीया) मुफ्त भेजेंगे और कूरियर चार्ज भी नहीं लेंगे। क्या हम आपका ऑर्डर बुक करें?`
            },
            {
              id: 'closer',
              name: 'Quick Deal Closer',
              hindiName: 'त्वरित बिक्री समापन (तैयार ग्राहक)',
              badge: '⚡ Instant Checkout',
              tacticAdvice: 'Give direct payment confirmation and priority dispatch assurance to capture the purchase right now.',
              englishMessage: `Namaste! We can confirm your order for *${title}* at *₹${numPrice.toLocaleString('en-IN')}* with priority dispatch today! 🚀\n\n✅ 100% Authentic Handcrafted Guarantee\n📦 Double-layer protective bubble packaging\n💳 Pay securely via UPI / GPay / PhonePe\n\nPlease share your delivery pincode and address, and we will send the tracking receipt within 2 hours! 🙏`,
              hindiMessage: `नमस्ते! *${title}* के लिए आपका ऑर्डर ₹${numPrice.toLocaleString('en-IN')} में आज ही प्राथमिकता के साथ पैक किया जाएगा। कृपया अपना पिनकोड और पता भेजें, हम तुरंत ट्रैकिंग रसीद भेज देंगे।`
            }
          ]
        };
      } else {
        fallbackResult = {
          buyerIntent: language === 'hi' ? 'प्रामाणिकता व शिल्प विवरण पूछताछ' : 'Authenticity & Craftsmanship Verification',
          sentiment: 'Curious',
          challengeLevel: 'Low',
          priceDefensePoints: [
            language === 'hi' ? '100% प्रमाणित हस्तशिल्प जिसमें कोई सिंथेटिक रंग या केमिकल नहीं है।' : `100% certified artisan handcraft with natural sustainable materials.`,
            language === 'hi' ? 'सुरक्षित 3-लेयर पैकेजिंग जिससे पार्सल बिल्कुल सुरक्षित पहुंचे।' : 'Tested shock-proof protective packaging across India & international shipping.',
            language === 'hi' ? 'हस्तलिखित प्रामाणिकता कार्ड साथ मिलेगा।' : 'Includes signed artisan authenticity card.'
          ],
          strategies: [
            {
              id: 'firm',
              name: 'Heritage Story & Proof',
              hindiName: 'कला और प्रमाण की जानकारी',
              badge: '📜 Heritage Proof',
              tacticAdvice: 'Highlight the authentic provenance and generational heritage to build unshakeable buyer trust.',
              englishMessage: `Namaste! 🙏 Thank you for inquiring about our *${title}*.\n\nThis piece is 100% genuinely hand-crafted by ${name} using traditional, eco-friendly methods. No toxic synthetic dyes or industrial molds are ever used.\n\n💰 Price: *₹${numPrice.toLocaleString('en-IN')}*\n📦 Comes with a signed artisan authenticity card.\n\nWould you like to see a close-up photo of the texture before we pack it? ✨`,
              hindiMessage: `नमस्ते! हमारे *${title}* के बारे में पूछने के लिए धन्यवाद। यह पूरी तरह से शुद्ध पारंपरिक विधि से हाथ से बनाया गया है। इसके साथ कारीगर का हस्ताक्षर प्रमाण पत्र भी मिलेगा। मूल्य ₹${numPrice.toLocaleString('en-IN')} है। क्या हम इसका वीडियो या फोटो दिखाएं?`
            },
            {
              id: 'closer',
              name: 'Ready Dispatch Closer',
              hindiName: 'तुरंत डिलीवरी के लिए तैयार',
              badge: '⚡ Fast Dispatch',
              tacticAdvice: 'Guide the interested buyer directly to payment and door delivery.',
              englishMessage: `Hello! We have one finished piece of *${title}* ready for immediate dispatch at *₹${numPrice.toLocaleString('en-IN')}*.\n\nWe provide multi-layer shockproof packing and complete tracking ID via WhatsApp. Would you like us to ship this to your address today? 📦✨`,
              hindiMessage: `नमस्ते! हमारे पास *${title}* का एक तैयार पीस ₹${numPrice.toLocaleString('en-IN')} में तुरंत भेजने के लिए उपलब्ध है। सुरक्षित पैकिंग के साथ ट्रैकिंग नंबर भी मिलेगा। क्या हम इसे आपके लिए बुक करें?`
            },
            {
              id: 'compromise',
              name: 'Artisan Care Guidance',
              hindiName: 'देखभाल और उपयोग सलाह',
              badge: '🌿 Long Life Care',
              tacticAdvice: 'Provide expert care tips to demonstrate artisanal mastery and remove buyer hesitation.',
              englishMessage: `Namaste! Handcrafted pieces like our *${title}* are designed to age beautifully over years with gentle care.\n\nWe include complete care instructions in your package. Price is *₹${numPrice.toLocaleString('en-IN')}* with direct artisan support. Let us know if you have any questions or are ready to order! 🙏`,
              hindiMessage: `नमस्ते! हमारे हाथ से बने *${title}* की देखभाल बहुत आसान है और यह सालों-साल नया बना रहता है। हम पार्सल के साथ देखभाल निर्देश भी भेजेंगे। मूल्य ₹${numPrice.toLocaleString('en-IN')} है। क्या हम आपके लिए ऑर्डर बुक करें?`
            }
          ]
        };
      }

      setResult(fallbackResult);
      setActiveStrategyId(fallbackResult.strategies[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  // Active strategy helper
  const currentStrategy: ReplyStrategy | undefined = result?.strategies?.find(
    (s) => s.id === activeStrategyId
  ) || result?.strategies?.[0];

  const currentMessageText =
    replyLang === 'en'
      ? currentStrategy?.englishMessage || ''
      : currentStrategy?.hindiMessage || '';

  // Copy to clipboard
  const handleCopy = () => {
    if (!currentMessageText) return;
    navigator.clipboard.writeText(currentMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Open in WhatsApp
  const handleOpenWhatsApp = () => {
    if (!currentMessageText) return;
    const encoded = encodeURIComponent(currentMessageText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // Text to Speech
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      setError(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ (speech synthesis) समर्थित नहीं है।'
          : 'Speech playback is not supported in this browser environment.'
      );
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentMessageText.replace(/[*_#•]/g, ''));
    utterance.lang = replyLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech when strategy or language changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [activeStrategyId, replyLang]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#8E4E14] via-[#A85D1C] to-[#C86D24] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/95 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#FFDCC4]" />
              <span>{language === 'hi' ? 'AI ग्राहक मित्र' : 'AI Grahak Mitra'}</span>
              <span className="text-[10px] bg-[#FFDCC4] text-[#6F3800] px-1.5 py-0.2 rounded-full font-bold">
                NEW
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white mb-2">
              {language === 'hi'
                ? 'सौदेबाज़ी रक्षक व ग्राहक संवाद सहायक'
                : 'Artisan Negotiation Shield & Smart Reply'}
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              {language === 'hi'
                ? 'व्हाट्सएप या इंस्टाग्राम पर आने वाली कठिन सौदेबाज़ी और सवालों का प्रभावशाली जवाब दें। अपनी मेहनत का उचित मूल्य सुरक्षित रखें और अंग्रेजी व हिंदी में तुरंत डील फाइनल करें।'
                : 'Turn tough WhatsApp bargaining into profitable sales. Defend your handcraft labor and fair wage, reply in polished English, and understand every word in Hindi.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 flex flex-col gap-2 min-w-[220px]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFDCC4]">
              <Shield className="w-4 h-4" />
              <span>{language === 'hi' ? 'कारीगर सुरक्षा' : 'Artisan Shield Benefits'}</span>
            </div>
            <div className="text-xs text-white/90 space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A7F3D0]" />
                <span>{language === 'hi' ? 'बिना नुकसान के डील' : 'No Margin Slashing'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A7F3D0]" />
                <span>{language === 'hi' ? 'द्विभाषी (EN + HI) जवाब' : 'Dual English & Hindi'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A7F3D0]" />
                <span>{language === 'hi' ? '1-क्लिक व्हाट्सएप प्रेषण' : '1-Click WhatsApp Ready'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form vs Output Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF9F6] rounded-2xl border border-[#E3E2E0] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E2E0]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#8E4E14]" />
                <h2 className="text-base font-bold text-[#1A1C1A]">
                  {language === 'hi' ? '१. पूछताछ और उत्पाद चुनें' : '1. Inquiry & Craft Context'}
                </h2>
              </div>
              <span className="text-xs font-medium text-[#534439] bg-[#E3E2E0]/50 px-2 py-0.5 rounded-full">
                Step 1 of 2
              </span>
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#534439] mb-2">
                {language === 'hi' ? 'उत्पाद चुनें' : 'Select Product Being Inquired'}
              </label>
              <div className="space-y-2">
                <select
                  id="negotiator-product-select"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white border border-[#D8C2B5] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#1A1C1A] focus:outline-none focus:border-[#8E4E14] focus:ring-2 focus:ring-[#8E4E14]/15"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹{p.minPrice.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>

                {/* Selected Product Pill Card */}
                {selectedProduct && (
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E3E2E0]/80">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[#E3E2E0]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1A1C1A] truncate">
                        {language === 'hi' && selectedProduct.hindiTitle
                          ? selectedProduct.hindiTitle
                          : selectedProduct.title}
                      </p>
                      <p className="text-[11px] text-[#534439]">
                        {selectedProduct.category} • Listed: ₹{selectedProduct.minPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 1-Tap Realistic Scenarios / Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#534439]">
                  {language === 'hi' ? 'त्वरित नमूना पूछताछ (१-टैप परीक्षण)' : '1-Tap Sample Inquiries (Demo)'}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setBuyerQuery(language === 'hi' ? sc.buyerQueryHi : sc.buyerQuery);
                      setArtisanNote(sc.artisanNote);
                    }}
                    className="text-left text-[11px] font-semibold p-2.5 rounded-xl border border-[#D8C2B5]/80 bg-white hover:border-[#8E4E14] hover:bg-[#FFDCC4]/20 transition-all text-[#534439] hover:text-[#8E4E14] flex flex-col justify-between"
                  >
                    <span>{language === 'hi' ? sc.labelHi : sc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer's Message Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="buyer-query-textarea"
                  className="text-xs font-bold uppercase tracking-wider text-[#534439] flex items-center gap-1.5"
                >
                  <span>{language === 'hi' ? 'ग्राहक का सवाल / संदेश' : "Buyer's Inquiry Message"}</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                    isRecording
                      ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                      : 'bg-white border-[#D8C2B5] text-[#8E4E14] hover:bg-[#8E4E14]/10'
                  }`}
                  title="Speak inquiry in your own voice"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सुन रहे हैं...' : 'Listening...'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'बोलकर बताएं' : 'Voice Dictate'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  id="buyer-query-textarea"
                  rows={4}
                  value={buyerQuery}
                  onChange={(e) => {
                    setBuyerQuery(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    language === 'hi'
                      ? 'व्हाट्सएप या इंस्टाग्राम का संदेश यहाँ पेस्ट करें (जैसे: क्या ₹4,000 में मिलेगा? बाजार में सस्ता है...)'
                      : "Paste message from WhatsApp or Instagram (e.g., 'Can I get this for ₹4,000? Market has it cheaper')..."
                  }
                  className="w-full bg-white border border-[#D8C2B5] rounded-xl p-3 text-sm text-[#1A1C1A] placeholder:text-[#534439]/50 focus:outline-none focus:border-[#8E4E14] focus:ring-2 focus:ring-[#8E4E14]/15 resize-y"
                />
                <div className="flex justify-between items-center text-[10px] text-[#534439] mt-1 px-1">
                  <span>{language === 'hi' ? 'कम से कम ४ अक्षर आवश्यक' : 'Min 4 characters required'}</span>
                  <span>{buyerQuery.length} chars</span>
                </div>
              </div>
            </div>

            {/* Optional Artisan Notes */}
            <div>
              <label
                htmlFor="artisan-note-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#534439] mb-1.5"
              >
                {language === 'hi' ? 'आपकी शर्त / विशेष बात (वैकल्पिक)' : 'Your Bottom-line / Special Notes (Optional)'}
              </label>
              <input
                id="artisan-note-input"
                type="text"
                value={artisanNote}
                onChange={(e) => setArtisanNote(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'उदा: 12 दिन की बुनाई है, मुफ़्त उपहार थैली दे सकते हैं, दाम फिक्स है'
                    : 'e.g. 12 days pit-loom weaving, can give free cotton cover, minimum ₹8,000'
                }
                className="w-full bg-white border border-[#D8C2B5] rounded-xl px-3 py-2 text-xs text-[#1A1C1A] placeholder:text-[#534439]/50 focus:outline-none focus:border-[#8E4E14]"
              />
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              id="generate-negotiator-btn"
              type="button"
              disabled={isLoading || buyerQuery.trim().length < 4}
              onClick={handleGenerateReplies}
              className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isLoading || buyerQuery.trim().length < 4
                  ? 'bg-[#D8C2B5] text-white cursor-not-allowed'
                  : 'bg-[#8E4E14] hover:bg-[#6F3800] text-white cursor-pointer active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {language === 'hi' ? 'जवाब तैयार हो रहे हैं...' : 'Formulating Responses...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? 'रणनीतिक जवाब बनाएं (Generate Replies)'
                      : 'Generate 3 Strategic Replies'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output & WhatsApp Simulator (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading Animation State */}
          {isLoading && (
            <div className="bg-[#FAF9F6] rounded-2xl border border-[#E3E2E0] p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#FFDCC4] border-t-[#8E4E14] animate-spin" />
                <div className="absolute inset-2 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#8E4E14]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#1A1C1A] mb-2 font-heading">
                {language === 'hi' ? 'AI कारीगर रक्षा विश्लेषण जारी है' : 'Analyzing Buyer Intent & Craft Value...'}
              </h3>
              <p className="text-xs text-[#534439] max-w-md mb-6">
                {language === 'hi'
                  ? 'जेमिनी AI ग्राहक के मनोविज्ञान का अध्ययन कर रहा है और आपकी मेहनत का सम्मान करने वाले जवाब तैयार कर रहा है।'
                  : 'Gemini 3.8 Flash is evaluating buyer sentiment, crafting price defense points, and drafting bilingual WhatsApp replies.'}
              </p>

              {/* Step indicator */}
              <div className="w-full max-w-sm space-y-2 text-left">
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                    loadingStep >= 1
                      ? 'bg-white border-[#8E4E14]/30 text-[#1A1C1A]'
                      : 'bg-white/40 border-transparent text-[#534439]/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      loadingStep >= 1 ? 'bg-[#8E4E14] text-white' : 'bg-[#E3E2E0] text-[#534439]'
                    }`}
                  >
                    1
                  </div>
                  <span>
                    {language === 'hi'
                      ? 'ग्राहक के इरादे और सौदेबाज़ी के स्तर का विश्लेषण...'
                      : 'Analyzing buyer psychology & bargaining pressure...'}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                    loadingStep >= 2
                      ? 'bg-white border-[#8E4E14]/30 text-[#1A1C1A]'
                      : 'bg-white/40 border-transparent text-[#534439]/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      loadingStep >= 2 ? 'bg-[#8E4E14] text-white' : 'bg-[#E3E2E0] text-[#534439]'
                    }`}
                  >
                    2
                  </div>
                  <span>
                    {language === 'hi'
                      ? 'हथकरघा और सामग्री के आधार पर मूल्य सुरक्षा बिंदु तैयार करना...'
                      : 'Drafting authentic handcraft & fair wage defense points...'}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                    loadingStep >= 3
                      ? 'bg-white border-[#8E4E14]/30 text-[#1A1C1A]'
                      : 'bg-white/40 border-transparent text-[#534439]/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      loadingStep >= 3 ? 'bg-[#8E4E14] text-white' : 'bg-[#E3E2E0] text-[#534439]'
                    }`}
                  >
                    3
                  </div>
                  <span>
                    {language === 'hi'
                      ? 'व्हाट्सएप तैयार अंग्रेजी व हिंदी रणनीतिक जवाब बनाना...'
                      : 'Generating bilingual WhatsApp ready messages & audio...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Initial Blank State (Before Generating) */}
          {!isLoading && !result && (
            <div className="bg-[#FAF9F6] rounded-2xl border border-[#E3E2E0] p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-full bg-[#FFDCC4]/50 border border-[#FFB780]/40 flex items-center justify-center text-[#8E4E14] mb-4">
                <HeartHandshake className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1C1A] font-heading mb-2">
                {language === 'hi' ? 'तैयार हैं? पूछताछ दर्ज करें' : 'Ready to Negotiate with Confidence'}
              </h3>
              <p className="text-xs sm:text-sm text-[#534439] max-w-md mb-6 leading-relaxed">
                {language === 'hi'
                  ? 'बाईं ओर ग्राहक का सवाल दर्ज करें या त्वरित १-टैप बटन दबाएं। AI आपको ३ अलग-अलग रणनीतियां देगा ताकि आप बिना नुकसान के बिक्री कर सकें।'
                  : 'Enter the buyer inquiry on the left or click any 1-Tap Sample. Our AI will craft 3 balanced strategies (Firm on Value, Win-Win Deal, and Fast Closer).'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
                <div className="bg-white p-3 rounded-xl border border-[#E3E2E0]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E4E14] mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'शिल्प का सम्मान' : 'Firm on Value'}</span>
                  </div>
                  <p className="text-[11px] text-[#534439]">
                    {language === 'hi' ? 'मेहनत और असली सामग्री के आधार पर फिक्स रेट समझाएं।' : 'Refuse low-balls politely with handcraft facts.'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E3E2E0]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] mb-1">
                    <Handshake className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'स्मार्ट कॉम्बो' : 'Win-Win Deal'}</span>
                  </div>
                  <p className="text-[11px] text-[#534439]">
                    {language === 'hi' ? 'दाम गिराए बिना मुफ़्त उपहार या फ्री शिपिंग का सुझाव।' : 'Offer a free handmade perk instead of price cuts.'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E3E2E0]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'तुरंत क्लोजिंग' : 'Quick Closer'}</span>
                  </div>
                  <p className="text-[11px] text-[#534439]">
                    {language === 'hi' ? 'UPI पेमेंट और सुरक्षित पैकिंग का भरोसा देकर तुरंत आर्डर लें।' : 'UPI details & live dispatch reassurance.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Result State */}
          {!isLoading && result && (
            <div className="space-y-6">
              {/* Buyer Intent & Defense Points Card */}
              <div className="bg-[#FAF9F6] rounded-2xl border border-[#E3E2E0] p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E3E2E0]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#534439]">
                      {language === 'hi' ? 'ग्राहक का इरादा' : 'Buyer Intent'}:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFDCC4] text-[#6F3800] border border-[#FFB780]/50">
                      {result.buyerIntent}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#534439]">{language === 'hi' ? 'चुनौती स्तर:' : 'Challenge:'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        result.challengeLevel === 'High'
                          ? 'bg-red-100 text-red-800'
                          : result.challengeLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {result.challengeLevel}
                    </span>
                  </div>
                </div>

                {/* Artisan Price Defense Armor */}
                {result.priceDefensePoints?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E4E14] mb-2">
                      <Shield className="w-4 h-4 text-[#8E4E14]" />
                      <span>
                        {language === 'hi' ? 'आपके पक्ष के मजबूत तर्क (Value Armor)' : 'Your Craft Defense Points'}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {result.priceDefensePoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#1A1C1A]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 3 Strategy Selectors Tabs */}
              <div className="bg-[#FAF9F6] rounded-2xl border border-[#E3E2E0] p-2 flex flex-col sm:flex-row gap-2">
                {result.strategies.map((st) => {
                  const isSelected = activeStrategyId === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setActiveStrategyId(st.id)}
                      className={`flex-1 p-3 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border border-[#8E4E14] shadow-xs'
                          : 'hover:bg-white/60 border border-transparent text-[#534439]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#8E4E14]' : 'text-[#1A1C1A]'
                          }`}
                        >
                          {language === 'hi' ? st.hindiName : st.name}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-[#E3E2E0]/70 text-[#534439] font-medium">
                        {st.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Strategy Details Card & WhatsApp Simulation Preview */}
              {currentStrategy && (
                <div className="bg-[#FAF9F6] rounded-2xl border border-[#E3E2E0] p-5 sm:p-6 shadow-xs space-y-5">
                  {/* Strategy Description Banner */}
                  <div className="p-3 bg-[#EAE2B7]/20 border border-[#EAE2B7] rounded-xl flex items-start gap-2.5 text-xs text-[#534439]">
                    <Info className="w-4 h-4 text-[#8E4E14] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1A1C1A]">
                        {language === 'hi' ? 'रणनीति की सलाह: ' : 'Tactical Strategy: '}
                      </span>
                      <span>{currentStrategy.tacticAdvice}</span>
                    </div>
                  </div>

                  {/* Language Toggle for the Message */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3E2E0]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1C1A]">
                      <MessageSquare className="w-4 h-4 text-[#059669]" />
                      <span>{language === 'hi' ? 'व्हाट्सएप संदेश पूर्वावलोकन' : 'WhatsApp Ready Message'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-[#E3E2E0]/60 p-0.5 rounded-full">
                      <button
                        onClick={() => setReplyLang('en')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          replyLang === 'en'
                            ? 'bg-[#8E4E14] text-white shadow-xs'
                            : 'text-[#534439] hover:text-[#1A1C1A]'
                        }`}
                      >
                        English (For Buyer)
                      </button>
                      <button
                        onClick={() => setReplyLang('hi')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          replyLang === 'hi'
                            ? 'bg-[#8E4E14] text-white shadow-xs'
                            : 'text-[#534439] hover:text-[#1A1C1A]'
                        }`}
                      >
                        हिंदी (कारीगर के लिए)
                      </button>
                    </div>
                  </div>

                  {/* Simulated WhatsApp Chat Box */}
                  <div className="bg-[#EFEAE2] rounded-xl p-4 sm:p-5 border border-[#D1D7DB] relative shadow-inner">
                    <div className="max-w-[92%] sm:max-w-[85%] bg-white rounded-2xl rounded-tl-none p-4 shadow-sm text-sm text-[#111B21] space-y-2 border border-[#E9EDEF]">
                      <div className="flex items-center justify-between text-[11px] text-[#008069] font-bold border-b border-[#E9EDEF] pb-1.5 mb-1.5">
                        <span>
                          {language === 'hi'
                            ? `${artisan?.hindiName || 'वेदांश'} (कारीगर)`
                            : `${artisan?.name || 'Vedansh'} (Artisan)`}
                        </span>
                        <span className="text-[10px] text-[#667781]">Just now</span>
                      </div>

                      <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm font-normal">
                        {currentMessageText}
                      </div>

                      <div className="flex justify-end items-center gap-1 text-[10px] text-[#667781] pt-1">
                        <span>12:08 PM</span>
                        <span className="text-[#53BDEB]">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Audio Listen Button */}
                    <button
                      type="button"
                      onClick={handleToggleSpeak}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSpeaking
                          ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                          : 'bg-white border-[#D8C2B5] text-[#534439] hover:border-[#8E4E14] hover:text-[#8E4E14]'
                      }`}
                      title="Listen to message read aloud"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-amber-700" />
                          <span>{language === 'hi' ? 'रोकें' : 'Stop Audio'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-[#8E4E14]" />
                          <span>
                            {language === 'hi'
                              ? replyLang === 'hi'
                                ? 'हिंदी में सुनें'
                                : 'अंग्रेजी में सुनें'
                              : `Listen (${replyLang.toUpperCase()})`}
                          </span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2.5">
                      {/* Copy Message Button */}
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#D8C2B5] bg-white text-[#1A1C1A] hover:border-[#8E4E14] hover:bg-[#8E4E14]/5 transition-all shadow-2xs"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">
                              {language === 'hi' ? 'कॉपी हो गया!' : 'Copied!'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#534439]" />
                            <span>{language === 'hi' ? 'कॉपी करें' : 'Copy Text'}</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Direct Send Button */}
                      <button
                        type="button"
                        onClick={handleOpenWhatsApp}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-all shadow-sm active:scale-98"
                      >
                        <Send className="w-4 h-4" />
                        <span>{language === 'hi' ? 'व्हाट्सएप पर भेजें' : 'Send via WhatsApp'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
