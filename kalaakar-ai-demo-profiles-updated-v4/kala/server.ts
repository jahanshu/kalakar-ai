import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local and .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = 3000;

// Body parsers with sufficient limit for image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "kalaakar-ai",
        },
      },
    });
  }
  return aiClient;
}

// Fallback generator for offline/demo resiliency
function generateFallbackListing(story: string, photoName?: string) {
  const s = (story || "").toLowerCase();

  if (s.includes("saree") || s.includes("साड़ी") || s.includes("silk") || s.includes("रेशम") || s.includes("banarasi")) {
    return {
      title: "Hand-woven Banarasi Silk Saree",
      hindiTitle: "हाथ से बुनी बनारसी सिल्क साड़ी",
      category: "Textiles & Apparel",
      tags: ["Handloom", "Mulberry Silk", "Banarasi Zari", "Artisan Heritage"],
      description: "Meticulously hand-woven on a traditional pit-loom, this exquisite silk saree features intricate floral zari border motifs crafted over three days of dedicated artisan labor. Perfect for festive celebrations, weddings, and heirloom collections.",
      hindiDescription: "पारंपरिक हथकरघे पर बारीकी से बुनी गई यह उत्कृष्ट रेशमी साड़ी, तीन दिनों के समर्पण और श्रम से बनी है। उत्सवों और विशेष अवसरों के लिए एकदम उपयुक्त।",
      minPrice: 6500,
      maxPrice: 8500,
      priceJustification: "Calculated based on 3-day handloom weaving labor, pure mulberry silk threads, and traditional zari metal craftsmanship.",
      whatsappMessage: "✨ *Hand-woven Banarasi Silk Saree* ✨\nHandcrafted by master artisan with pure zari work. Direct from weaver.\n💰 Price: ₹6,500 - ₹8,500\n📦 Free pan-India shipping available! DM or reply to order.",
      instagramCaption: "Pure craftsmanship in every thread. 🌿 Hand-woven Banarasi Silk Saree crafted with centuries of tradition. DM to order directly from the weaver.\n\n#VocalForLocal #IndianArtisans #HandloomSaree #KalaakarAI #BanarasiSilk"
    };
  }

  if (s.includes("pot") || s.includes("clay") || s.includes("मिट्टी") || s.includes("terracotta") || s.includes("घड़ा") || s.includes("बर्तन")) {
    return {
      title: "Handcrafted Terracotta Decorative Vase",
      hindiTitle: "हस्तनिर्मित टेराकोटा सजावटी फूलदान",
      category: "Home Decor",
      tags: ["Terracotta", "Clay Pottery", "Eco-friendly", "Traditional Kiln"],
      description: "Sculpted from riverbed clay and baked in open woodfire kilns, this terracotta decorative pot showcases authentic tribal motifs etched by hand. Its porous, earthy finish adds organic warmth to modern living spaces and gardens.",
      hindiDescription: "प्राकृतिक नदी की मिट्टी से गढ़ा गया और पारंपरिक भट्टी में पकाया गया यह टेराकोटा फूलदान आपके घर को पारंपरिक सौम्यता प्रदान करता है।",
      minPrice: 950,
      maxPrice: 1350,
      priceJustification: "Reflects natural river clay purification, wheel-throwing time, and delicate hand-etched surface ornamentation.",
      whatsappMessage: "🏺 *Handcrafted Terracotta Decorative Vase* 🏺\nHand-molded clay with rustic tribal carvings. 100% natural and eco-friendly.\n💰 Price: ₹950 - ₹1,350\n📦 Direct from the artisan workshop! Reply to claim.",
      instagramCaption: "Bring earthy warmth into your sanctuary with our hand-molded Terracotta Vase. Each piece holds the fingerprints of its maker.\n\n#HandmadePottery #TerracottaLove #EcoFriendlyHome #ArtisanCraft #KalaakarAI"
    };
  }

  if (s.includes("toy") || s.includes("लकड़ी") || s.includes("wood") || s.includes("खिलौने") || s.includes("channapatna")) {
    return {
      title: "Heritage Painted Wooden Toys Set",
      hindiTitle: "पारंपरिक नक्काशीदार लकड़ी के खिलौने",
      category: "Toys & Dolls",
      tags: ["Teak Wood", "Vegetable Dyes", "Child-Safe", "Channapatna Style"],
      description: "Carved from sustainably sourced local wood and coated with vibrant non-toxic natural vegetable lacquers. These classic play-pieces combine heritage charm with safe, imaginative playtime for all ages.",
      hindiDescription: "प्राकृतिक लकड़ी और सुरक्षित वनस्पति रंगों से हाथ से तराशे गए खिलौने, जो बच्चों के लिए सुरक्षित और आकर्षक हैं।",
      minPrice: 1100,
      maxPrice: 1450,
      priceJustification: "Evaluated on seasoned wood turning, non-toxic organic dye polishing, and child-safe durability.",
      whatsappMessage: "🪵 *Heritage Painted Wooden Toys Set* 🪵\nCarved from sustainable wood with safe vegetable dyes. Perfect gift for kids & decor enthusiasts.\n💰 Price: ₹1,100 - ₹1,450\n📦 Order direct from artisan!",
      instagramCaption: "Timeless childhood joy handcrafted in natural wood. Non-toxic, vibrant, and made to last generations.\n\n#WoodenToys #SustainablePlay #HandmadeIndia #VocalForLocal #KalaakarAI"
    };
  }

  return {
    title: "Handcrafted Traditional Artisan Creation",
    hindiTitle: "हस्तनिर्मित पारंपरिक कारीगरी उत्पाद",
    category: "Home Decor",
    tags: ["Handmade", "Traditional Art", "Eco-friendly", "Authentic Heritage"],
    description: "A testament to generational craftsmanship, this authentic handmade piece is shaped using time-honored traditional techniques. Finished with natural raw materials to bring bespoke cultural elegance into modern homes.",
    hindiDescription: "पारंपरिक तकनीकों और प्राकृतिक सामग्रियों से निर्मित यह उत्पाद हस्तशिल्प और कारीगर की मेहनत का जीवंत प्रमाण है।",
    minPrice: 1200,
    maxPrice: 1600,
    priceJustification: "Estimated from manual handcraft hours, locally sourced sustainable materials, and regional artisan benchmarks.",
    whatsappMessage: "✨ *Handcrafted Traditional Artisan Creation* ✨\nHandmade with passion and authentic techniques.\n💰 Price: ₹1,200 - ₹1,600\n📦 Supporting local artisans. Message to purchase!",
    instagramCaption: "Every stitch and stroke tells a story of heritage and heart. Support local artisans today.\n\n#SupportArtisans #HandmadeWithLove #VocalForLocal #KalaakarAI"
  };
}

// Fallback generator for smart buyer replies
function generateFallbackSmartReply(
  productTitle: string = "Handcrafted Artisan Creation",
  productPrice: number | string = 1500,
  buyerQuery: string = "",
  artisanNote?: string
) {
  const q = (buyerQuery || "").toLowerCase();
  const price = typeof productPrice === "number" ? productPrice : parseInt(String(productPrice).replace(/[^0-9]/g, "")) || 1500;

  if (q.includes("discount") || q.includes("कम") || q.includes("सस्ता") || q.includes("cheap") || q.includes("₹") || q.includes("price") || q.includes("rs") || q.includes("rate") || q.includes("amazon") || q.includes("mehenga") || q.includes("expensive")) {
    return {
      buyerIntent: "Price Bargaining & Discount Request",
      sentiment: "Bargain Hunter",
      challengeLevel: "High",
      priceDefensePoints: [
        `Each piece requires over 24-48 hours of uninterrupted manual handcrafting, not automated factory machines.`,
        `Direct-from-weaver price of ₹${price.toLocaleString('en-IN')} guarantees 100% of proceeds reach the artisan family without middlemen cuts.`,
        `Uses authentic raw materials with organic finishes that last for decades.`
      ],
      strategies: [
        {
          id: "firm",
          name: "Firm on Value (No Discount)",
          hindiName: "मूल्य पर अडिग (शिल्प का सम्मान)",
          badge: "🛡️ Protect Margin",
          tacticAdvice: "Educates the buyer on the days of manual labor so they appreciate the fixed fair price.",
          englishMessage: `Namaste! 🙏 Thank you so much for loving our *${productTitle}*.\n\nSince this piece is 100% hand-crafted by master artisans over several days of dedicated work using natural materials, our price of *₹${price.toLocaleString('en-IN')}* is kept completely fair with zero middleman margins.\n\nUnlike factory machine items, every thread and curve is shaped by human hands. We hope you will support genuine Indian craftsmanship! Would you like us to reserve this piece for you? ✨`,
          hindiMessage: `नमस्ते! 🙏 हमारे *${productTitle}* को पसंद करने के लिए बहुत धन्यवाद। क्योंकि यह उत्पाद हमारे कारीगरों द्वारा कई दिनों की कड़ी मेहनत और शुद्ध प्राकृतिक सामग्री से बनाया गया है, इसलिए ₹${price.toLocaleString('en-IN')} का यह मूल्य पूरी तरह उचित है। इसमें कोई बिचौलिया नहीं है। हम मशीन नहीं, असली हाथ की कला बनाते हैं। क्या हम इसे आपके लिए पैक करें?`
        },
        {
          id: "compromise",
          name: "Win-Win Counter-Offer",
          hindiName: "सम्मानजनक समझौता (स्मार्ट डील)",
          badge: "🤝 Value-Add Offer",
          tacticAdvice: "Offers a complimentary handmade gift or modest bundle saving instead of devaluing the craft.",
          englishMessage: `Hello! 🌿 We truly value your interest in our *${productTitle}*.\n\nWhile our individual price is fixed at *₹${price.toLocaleString('en-IN')}* to honor our artisan's time, we'd love to make this special for you:\n\n🎁 *Complimentary Gift*: We will include a handcrafted artisan keepsake pouch / miniature diya with your order!\n🚚 *Free Safe Courier*: Pan-India door delivery on us.\n\n${artisanNote ? `Note: ${artisanNote}\n\n` : ''}Let us know if this works so we can begin safe packaging for you today! 📦`,
          hindiMessage: `नमस्ते! कारीगर की मेहनत का सम्मान करते हुए हम मुख्य मूल्य ₹${price.toLocaleString('en-IN')} कम नहीं कर सकते, लेकिन आपके लिए हम एक सुंदर हस्तनिर्मित उपहार (उपहार थैली/दीया) मुफ्त भेजेंगे और कूरियर चार्ज भी नहीं लेंगे। क्या हम आपका ऑर्डर बुक करें?`
        },
        {
          id: "closer",
          name: "Quick Deal Closer",
          hindiName: "त्वरित बिक्री समापन (तैयार ग्राहक)",
          badge: "⚡ Instant Checkout",
          tacticAdvice: "Give direct payment confirmation and priority dispatch assurance to capture the purchase right now.",
          englishMessage: `Namaste! We can confirm your order for *${productTitle}* at *₹${price.toLocaleString('en-IN')}* with priority dispatch today! 🚀\n\n✅ 100% Authentic Handcrafted Guarantee\n📦 Double-layer protective bubble packaging\n💳 Pay securely via UPI / GPay / PhonePe\n\nPlease share your delivery pincode and shipping address, and we will send the tracking receipt within 2 hours! 🙏`,
          hindiMessage: `नमस्ते! *${productTitle}* के लिए आपका ऑर्डर ₹${price.toLocaleString('en-IN')} में आज ही प्राथमिकता के साथ पैक किया जाएगा। कृपया अपना पिनकोड और पता भेजें, हम तुरंत ट्रैकिंग रसीद भेज देंगे।`
        }
      ]
    };
  }

  if (q.includes("bulk") || q.includes("wholesale") || q.includes("wedding") || q.includes("pieces") || q.includes("order") || q.includes("शादी") || q.includes("क्वांटिटी")) {
    const bulkPrice = Math.round(price * 0.88);
    return {
      buyerIntent: "Bulk & Event Gifting Inquiry",
      sentiment: "High Intent",
      challengeLevel: "Medium",
      priceDefensePoints: [
        `Handcrafted items require planned artisan production cycles to ensure consistent master quality.`,
        `Economies of material sourcing allow a thoughtful bulk discount for quantities above 10 pieces.`,
        `Customized artisan packaging and bespoke tags can be included for weddings and corporate events.`
      ],
      strategies: [
        {
          id: "compromise",
          name: "Tiered Bulk Privilege",
          hindiName: "थोक व शादी का विशेष मूल्य",
          badge: "📦 Volume Advantage",
          tacticAdvice: "Offer a structured volume tier that rewards larger quantities while maintaining healthy margin.",
          englishMessage: `Namaste! 🙏 We are delighted that you are considering our *${productTitle}* for your special occasion!\n\nFor bulk orders of 10+ pieces, we can offer a special direct-weaver rate of *₹${bulkPrice.toLocaleString('en-IN')} per piece* (regular ₹${price.toLocaleString('en-IN')}).\n\n✨ *Includes*: Customized artisan gift tags + sustainable jute box packing.\n⏳ *Handcraft Timeline*: 5-7 days for master perfection.\n\nHow many pieces do you need and by what date? We can prepare a sample for you right away! 🌸`,
          hindiMessage: `नमस्ते! आपके विशेष अवसर के लिए *${productTitle}* चुनने का धन्यवाद। 10 या उससे अधिक पीस के लिए हम विशेष कारीगर दर ₹${bulkPrice.toLocaleString('en-IN')} प्रति पीस दे सकते हैं। इसमें सुंदर जूट बॉक्स पैकिंग भी शामिल होगी। आपको कितने पीस और किस तारीख तक चाहिए?`
        },
        {
          id: "firm",
          name: "Quality Guarantee Focus",
          hindiName: "गुणवत्ता व समय सीमा",
          badge: "🛡️ Authenticity First",
          tacticAdvice: "Assure the buyer that every single piece in the bulk order will maintain identical master artisan quality.",
          englishMessage: `Hello! For orders of this scale, each *${productTitle}* is individually hand-shaped and inspected by our master artisan to ensure zero flaws.\n\nWe would be honored to craft these for your celebration. Let us confirm your required delivery date so we can reserve our loom/kiln schedule exclusively for your batch. 🙏`,
          hindiMessage: `नमस्ते! बड़े ऑर्डर में भी हर एक पीस हमारे मास्टर कारीगर द्वारा हाथ से परखा जाएगा। कृपया अपनी अंतिम डिलीवरी तारीख बताएं ताकि हम अपने करघे/भट्टी को आपके ऑर्डर के लिए आरक्षित कर सकें।`
        },
        {
          id: "closer",
          name: "Sample First Closer",
          hindiName: "सैंपल बुकिंग और पुष्टि",
          badge: "⚡ Sample First",
          tacticAdvice: "Close a single piece sample order immediately so the client can verify and approve the full batch.",
          englishMessage: `We can express dispatch 1 finished sample of *${productTitle}* to you today at *₹${price.toLocaleString('en-IN')}*, and adjust the difference in your final bulk order! 🚚\n\nShall we dispatch the sample to your address today? ✨`,
          hindiMessage: `हम आज ही आपके पते पर 1 सैंपल पीस भेज सकते हैं। जब आप पूरे बैच का ऑर्डर देंगे, तो यह राशि उसमें समायोजित कर दी जाएगी। क्या हम सैंपल भेजें?`
        }
      ]
    };
  }

  // Default / Authenticity / General Inquiry
  return {
    buyerIntent: "Authenticity & Craftsmanship Verification",
    sentiment: "Curious",
    challengeLevel: "Low",
    priceDefensePoints: [
      `100% verified artisan handcraft certified with traditional natural raw materials.`,
      `Safe shock-proof transit packaging tested for fragile deliveries across India & worldwide.`,
      `Includes signed artisan certificate of authenticity.`
    ],
    strategies: [
      {
        id: "firm",
        name: "Heritage Story & Proof",
        hindiName: "कला और प्रमाण की जानकारी",
        badge: "📜 Heritage Proof",
        tacticAdvice: "Highlight the authentic provenance and generational heritage to build unshakeable buyer trust.",
        englishMessage: `Namaste! 🙏 Thank you for inquiring about our *${productTitle}*.\n\nThis piece is 100% genuinely hand-crafted by our generational artisan family using traditional, eco-friendly methods. No toxic synthetic dyes or industrial molds are ever used.\n\n💰 Price: *₹${price.toLocaleString('en-IN')}*\n📦 Comes with an artisan signed authenticity card.\n\nWould you like to see a quick close-up video of the texture before we pack it? ✨`,
        hindiMessage: `नमस्ते! हमारे *${productTitle}* के बारे में पूछने के लिए धन्यवाद। यह पूरी तरह से शुद्ध पारंपरिक विधि से हाथ से बनाया गया है। इसमें कोई सिंथेटिक सामग्री नहीं है। इसके साथ कारीगर का हस्ताक्षर प्रमाण पत्र भी मिलेगा। मूल्य ₹${price.toLocaleString('en-IN')} है। क्या हम इसका वीडियो दिखाएं?`
      },
      {
        id: "closer",
        name: "Ready Dispatch Closer",
        hindiName: "तुरंत डिलीवरी के लिए तैयार",
        badge: "⚡ Fast Dispatch",
        tacticAdvice: "Guide the interested buyer directly to payment and door delivery.",
        englishMessage: `Hello! We have one pristine piece of *${productTitle}* ready for immediate dispatch at *₹${price.toLocaleString('en-IN')}*.\n\nWe provide multi-layer shockproof packing and complete tracking ID via WhatsApp. Would you like us to ship this to your address today? 📦✨`,
        hindiMessage: `नमस्ते! हमारे पास *${productTitle}* का एक तैयार पीस ₹${price.toLocaleString('en-IN')} में तुरंत भेजने के लिए उपलब्ध है। सुरक्षित पैकिंग के साथ ट्रैकिंग नंबर भी मिलेगा। क्या हम इसे आपके लिए बुक करें?`
      },
      {
        id: "compromise",
        name: "Artisan Care Guidance",
        hindiName: "देखभाल और उपयोग सलाह",
        badge: "🌿 Long Life Care",
        tacticAdvice: "Provide expert care tips to demonstrate artisanal mastery and remove buyer hesitation.",
        englishMessage: `Namaste! Handcrafted pieces like our *${productTitle}* are designed to age beautifully over years with simple gentle care.\n\nWe include complete care instructions in your package. Price is *₹${price.toLocaleString('en-IN')}* with direct artisan support. Let us know if you have any questions or are ready to order! 🙏`,
        hindiMessage: `नमस्ते! हमारे हाथ से बने *${productTitle}* की देखभाल बहुत आसान है और यह सालों-साल नया बना रहता है। हम पार्सल के साथ देखभाल निर्देश भी भेजेंगे। मूल्य ₹${price.toLocaleString('en-IN')} है। क्या हम आपके लिए ऑर्डर बुक करें?`
      }
    ]
  };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "Kalaकार AI",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Listing generation endpoint
app.post("/api/generate-listing", async (req, res) => {
  try {
    const {
      story,
      photoBase64,
      mimeType = "image/jpeg",
      tone = "warm-story",
      language = "hi",
      artisanName,
      region,
    } = req.body;

    const ai = getGenAIClient();

    if (!ai) {
      console.log("No GEMINI_API_KEY present; serving smart fallback listing");
      const fallback = generateFallbackListing(story);
      return res.json({
        success: true,
        data: fallback,
        source: "smart-engine",
        message: "Listing generated successfully with smart artisan engine",
      });
    }

    const systemPrompt = `You are Kalaकार AI, an expert cultural commerce assistant dedicated to empowering marginalized artisans, weavers, and craftspeople.
Your job is to analyze the artisan's spoken voice note/story (often in Hindi, Hinglish, or regional Indian language) and their product photo.
Turn this into a polished, high-value, buyer-ready catalog card that will sell on WhatsApp, Instagram, and curated craft markets.

Artisans often speak simply (e.g. mentioning material, days taken, village name, price idea). You must elevate their voice into an authentic, evocative, professional product listing without sounding synthetic or corporate.

Return STRICT JSON adhering to this schema:
{
  "title": "Compelling, concise English product title (3-7 words, e.g. 'Handcrafted Terracotta Decorative Vase')",
  "hindiTitle": "Hindi translated title in Devanagari script",
  "category": "One of: Home Decor | Textiles & Apparel | Pottery & Ceramics | Toys & Dolls | Jewelry & Accessories | Kitchen & Dining | Metal & Woodcraft",
  "tags": ["3 to 5 lowercase or title-case tags, e.g. Terracotta, Handmade, Earthy, Traditional Kiln"],
  "description": "Rich 2-3 sentence English product description highlighting raw materials, handcraft technique, cultural significance, and styling appeal for urban/global buyers.",
  "hindiDescription": "Accurate, respectful Hindi translation in Devanagari script so the artisan understands and approves it.",
  "minPrice": 1200,
  "maxPrice": 1500,
  "priceJustification": "Brief 1-sentence explanation of the fair market value (material, labor time, uniqueness).",
  "whatsappMessage": "Ready-to-send WhatsApp message with bold titles, bullets, price, and call-to-action.",
  "instagramCaption": "Engaging Instagram post text with 5-6 craft hashtags."
}`;

    const promptText = `Artisan Voice Note / Story Transcript:
"${story || 'Artisan handmade craft piece made with local natural materials.'}"

Artisan Name: ${artisanName || 'Traditional Artisan'}
Region / Craft Heritage: ${region || 'India'}
Preferred Tone: ${tone}
Requested Language: ${language}

Analyze the details, craftsmanship, cultural context, and fair market price. Generate the complete listing JSON.`;

    const contents: any[] = [];
    if (photoBase64 && typeof photoBase64 === "string" && photoBase64.length > 50) {
      // Clean base64 header if present
      const cleanBase64 = photoBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "";
    try {
      const parsed = JSON.parse(rawText);
      return res.json({
        success: true,
        data: parsed,
        source: "gemini-2.5-flash",
      });
    } catch (parseErr) {
      console.warn("Could not parse JSON response from Gemini, cleaning text:", rawText);
      // Attempt clean regex extraction
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({
          success: true,
          data: parsed,
          source: "gemini-2.5-flash",
        });
      }
      throw parseErr;
    }
  } catch (error: any) {
    console.error("Gemini API Error in /api/generate-listing:", error?.message || error);
    const fallback = generateFallbackListing(req.body.story || "");
    return res.json({
      success: true,
      data: fallback,
      source: "resilient-fallback",
      error: error?.message,
    });
  }
});

// Audio transcription endpoint
app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", samplePrompt } = req.body;

    if (samplePrompt) {
      return res.json({
        success: true,
        transcript: samplePrompt,
        source: "sample-preset",
      });
    }

    const ai = getGenAIClient();
    if (!ai || !audioBase64) {
      return res.json({
        success: true,
        transcript: "यह हाथ से बना हुआ सुंदर उत्पाद है, शुद्ध प्राकृतिक सामग्री से बना है और इसे बनाने में दो दिन का समय लगा है।",
        detectedLanguage: "Hindi (हिन्दी)",
        source: "mock-transcription",
      });
    }

    const cleanAudio = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType || "audio/webm",
            data: cleanAudio,
          },
        },
        {
          text: "Transcribe the spoken audio verbatim in its original Indian language (e.g. Hindi, Bengali, Tamil, or English). Do not translate, just transcribe accurately.",
        },
      ],
    });

    return res.json({
      success: true,
      transcript: response.text?.trim() || "",
      source: "gemini-2.5-flash",
    });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.json({
      success: true,
      transcript: "यह हाथ से बना हुआ सुंदर शिल्प है, जिसे स्थानीय सामग्री और पारंपरिक विधि से तैयार किया गया है।",
      source: "fallback",
    });
  }
});

// Smart Negotiator & Buyer Inquiry Assistant endpoint
app.post("/api/smart-reply", async (req, res) => {
  try {
    const {
      productTitle = "Handcrafted Artisan Creation",
      productPrice = 1500,
      productCategory = "Handicrafts",
      productDescription = "",
      buyerQuery,
      artisanNote = "",
      artisanName = "Artisan",
      language = "en",
    } = req.body;

    if (!buyerQuery || typeof buyerQuery !== "string" || buyerQuery.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Buyer inquiry text is required and must be at least 3 characters.",
      });
    }

    const ai = getGenAIClient();
    if (!ai) {
      console.log("No GEMINI_API_KEY present; serving smart fallback negotiation reply");
      const fallback = generateFallbackSmartReply(productTitle, productPrice, buyerQuery, artisanNote);
      return res.json({
        success: true,
        data: fallback,
        source: "smart-engine",
      });
    }

    const systemPrompt = `You are Kalaकार AI "Grahak Mitra" (Artisan Negotiation & Buyer Reply Assistant).
You empower traditional Indian handloom weavers, potters, and folk artisans who sell crafts via WhatsApp & Instagram.
Artisans often face aggressive bargaining, buyers comparing handmade crafts to cheap factory-molded plastics, or complex shipping/bulk inquiries.
Artisans often do not speak fluent English or know how to negotiate firmly without losing the buyer.

Your mission:
1. Analyze the buyer's query for intent, sentiment, and bargaining risk.
2. Formulate 3 distinct strategic responses that protect the artisan's fair living wage and honor handcraft labor while remaining warm, polite, and persuasive.
3. Formulate responses in WhatsApp-ready format (use bolding like *this*, clear bullet points, warm Indian cultural greeting 'Namaste 🙏', and relevant emojis).
4. Provide an accurate Hindi translation in Devanagari script for each strategy so the artisan understands exactly what will be sent to the buyer.

Return STRICT JSON matching this schema:
{
  "buyerIntent": "Brief label (e.g. 'Heavy Discount Bargaining', 'Authenticity Inquiry', 'Bulk & Wedding Gifting', 'Customization / Dispatch')",
  "sentiment": "One of: 'Skeptical' | 'Curious' | 'High Intent' | 'Bargain Hunter'",
  "challengeLevel": "One of: 'Low' | 'Medium' | 'High'",
  "priceDefensePoints": [
    "Point 1: Concrete craft fact (hours of manual labor, natural materials, pit-loom skill)",
    "Point 2: Comparison (why handmade cannot be compared to industrial mass-produced clones)",
    "Point 3: Fair trade impact (100% direct to artisan family, no middlemen)"
  ],
  "strategies": [
    {
      "id": "firm",
      "name": "Firm on Value (No Discount)",
      "hindiName": "मूल्य पर अडिग (शिल्प का सम्मान)",
      "badge": "🛡️ Protect Margin",
      "tacticAdvice": "Educates the customer on the multi-day labor and natural materials to maintain fixed fair pricing.",
      "englishMessage": "Polished, warm WhatsApp message with *bold*, emojis, and call to action.",
      "hindiMessage": "हिंदी अनुवाद ताकि कारीगर पूरी बात समझ सके।"
    },
    {
      "id": "compromise",
      "name": "Win-Win Counter-Offer",
      "hindiName": "सम्मानजनक समझौता (स्मार्ट डील)",
      "badge": "🤝 Value-Add Offer",
      "tacticAdvice": "Offers a small perk (e.g. complimentary handmade keepsake, small combo saving, or free delivery) without slashing core price.",
      "englishMessage": "...",
      "hindiMessage": "..."
    },
    {
      "id": "closer",
      "name": "Quick Deal Closer",
      "hindiName": "त्वरित बिक्री समापन (तैयार ग्राहक)",
      "badge": "⚡ Ready to Buy",
      "tacticAdvice": "Provides instant payment details (UPI), packing safety commitment, and dispatch schedule to seal the purchase right now.",
      "englishMessage": "...",
      "hindiMessage": "..."
    }
  ]
}`;

    const userPrompt = `Product: ${productTitle}
Listed Price: ₹${productPrice}
Category: ${productCategory}
Description / Craft Details: ${productDescription || "Authentic handmade piece by Indian artisan."}
Artisan Bottom Line / Notes: ${artisanNote || "Standard price. Artisan willing to provide safe packing."}
Artisan Name: ${artisanName}

Buyer's Message / WhatsApp Inquiry:
"${buyerQuery}"

Generate the complete JSON negotiation strategy with 3 distinct replies (Firm, Compromise, Closer) in both English and Hindi.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const rawText = response.text || "";
    try {
      const parsed = JSON.parse(rawText);
      return res.json({
        success: true,
        data: parsed,
        source: "gemini-2.5-flash",
      });
    } catch (parseErr) {
      console.warn("Could not parse JSON from Gemini in /api/smart-reply:", rawText);
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({
          success: true,
          data: parsed,
          source: "gemini-2.5-flash",
        });
      }
      throw parseErr;
    }
  } catch (error: any) {
    console.error("Error in /api/smart-reply:", error?.message || error);
    const fallback = generateFallbackSmartReply(
      req.body.productTitle,
      req.body.productPrice,
      req.body.buyerQuery,
      req.body.artisanNote
    );
    return res.json({
      success: true,
      data: fallback,
      source: "resilient-fallback",
      error: error?.message,
    });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kalaकार AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
