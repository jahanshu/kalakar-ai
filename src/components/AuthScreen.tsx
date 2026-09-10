import React, { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { ArtisanProfile, Language } from '../types';
import { demoCredentials, DEMO_PROFILES, signIn, signUp } from '../auth';

interface AuthScreenProps {
  language: Language;
  defaultArtisan: ArtisanProfile;
  onAuthenticated: (user: { artisan: ArtisanProfile }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  language,
  defaultArtisan,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hi = language === 'hi';

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setError('');
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(hi ? 'कृपया केवल फोटो अपलोड करें।' : 'Please upload an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(hi ? 'फोटो 2 MB से छोटी होनी चाहिए।' : 'Profile photo must be smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(hi ? 'कृपया ईमेल और पासवर्ड भरें।' : 'Please enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError(hi ? 'कृपया अपना नाम भरें।' : 'Please enter your name.');
        return;
      }
      if (password.length < 6) {
        setError(hi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError(hi ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const user = await signIn(email, password);
        onAuthenticated({ artisan: user.artisan });
      } else {
        const artisan: ArtisanProfile = {
          ...defaultArtisan,
          id: `artisan-${Date.now()}`,
          name: name.trim(),
          avatar: avatar || '',
          hindiName: name.trim(),
          story: hi
            ? 'मेरी कारीगरी मेरी परंपरा और मेरी पहचान है।'
            : 'My craft is my tradition and my identity.',
          totalProducts: 0,
          activeListings: 0,
          totalShares: 0,
        };
        const user = await signUp({ name, email, password, artisan });
        onAuthenticated({ artisan: user.artisan });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setMode('signin');
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError('');
  };

  const selectDemoProfile = async (profile: (typeof DEMO_PROFILES)[number]) => {
    setError('');
    setLoading(true);
    try {
      const user = await signIn(profile.email, profile.password);
      onAuthenticated({ artisan: user.artisan });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open demo profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-white border border-[#E3E2E0] shadow-2xl">
        <div className="hidden lg:flex relative bg-[#8E4E14] text-white p-10 flex-col justify-between min-h-[680px] overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FFDCC4]/20" />
          <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-[#2A9D8F]/20" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              AI-powered cultural commerce
            </div>
            <h1 className="mt-8 text-5xl font-extrabold font-heading leading-tight">
              {hi ? 'आपकी कला, आपकी पहचान।' : 'Your craft. Your story. Your market.'}
            </h1>
            <p className="mt-5 text-white/80 leading-relaxed max-w-md">
              {hi
                ? 'Kalaकार AI आपकी आवाज़ और तस्वीर से आपकी हस्तकला को सुंदर डिजिटल लिस्टिंग में बदलने में मदद करता है।'
                : 'Kalaकार AI helps artisans turn a photo and their voice into a polished digital product listing.'}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {['20 sec', 'Hindi + English', 'AI Listing'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 border border-white/15 p-4">
                <p className="text-xs font-semibold text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-2xl font-extrabold text-[#1A1C1A] font-heading">Kalaकार AI</p>
              <p className="text-xs text-[#765A05] font-semibold mt-1">
                {hi ? 'कारीगरों के लिए डिजिटल साथी' : 'Digital companion for artisans'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-xs font-bold text-[#8E4E14] hover:underline"
            >
              {mode === 'signin' ? (hi ? 'साइन अप' : 'Sign Up') : (hi ? 'साइन इन' : 'Sign In')}
            </button>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-[#1A1C1A] font-heading">
              {mode === 'signin' ? (hi ? 'वापसी पर स्वागत है' : 'Welcome back') : (hi ? 'खाता बनाएं' : 'Create your account')}
            </h2>
            <p className="text-sm text-[#534439] mt-2">
              {mode === 'signin'
                ? (hi ? 'अपने कारीगर डैशबोर्ड में साइन इन करें।' : 'Sign in to your artisan dashboard.')
                : (hi ? 'अपनी डिजिटल कारीगरी यात्रा शुरू करें।' : 'Start your digital craft journey.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#534439] mb-1.5">{hi ? 'नाम' : 'Full name'}</label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#867468]" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={hi ? 'अपना नाम' : 'Your name'}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#D8C2B5] bg-[#FAF9F6] text-sm outline-none focus:ring-2 focus:ring-[#FFDCC4] focus:border-[#8E4E14]"
                  />
                </div>

              {/* Profile Photo */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#534439] mb-1.5">
                  {hi ? 'प्रोफ़ाइल फोटो (वैकल्पिक)' : 'Profile photo (optional)'}
                </label>
                <label className="flex items-center gap-3 w-full px-3 py-3 rounded-xl border border-[#D8C2B5] bg-[#FAF9F6] cursor-pointer hover:border-[#8E4E14] transition-all">
                  {avatar ? (
                    <img src={avatar} alt="Profile preview" className="w-10 h-10 rounded-full object-cover border-2 border-[#FFDCC4]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white border border-[#D8C2B5] flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[#8E4E14]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A1C1A]">
                      {avatar ? (hi ? 'फोटो बदलें' : 'Change photo') : (hi ? 'फोटो चुनें' : 'Choose a photo')}
                    </p>
                    <p className="text-[10px] text-[#867468]">JPG, PNG · max 2 MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#534439] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#867468]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#D8C2B5] bg-[#FAF9F6] text-sm outline-none focus:ring-2 focus:ring-[#FFDCC4] focus:border-[#8E4E14]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#534439] mb-1.5">{hi ? 'पासवर्ड' : 'Password'}</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#867468]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={hi ? 'कम से कम 6 अक्षर' : 'At least 6 characters'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#D8C2B5] bg-[#FAF9F6] text-sm outline-none focus:ring-2 focus:ring-[#FFDCC4] focus:border-[#8E4E14]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#867468]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#534439] mb-1.5">{hi ? 'पासवर्ड दोबारा भरें' : 'Confirm password'}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={hi ? 'पासवर्ड दोहराएं' : 'Repeat password'}
                  autoComplete="new-password"
                  className="w-full px-3 py-3 rounded-xl border border-[#D8C2B5] bg-[#FAF9F6] text-sm outline-none focus:ring-2 focus:ring-[#FFDCC4] focus:border-[#8E4E14]"
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#8E4E14] hover:bg-[#6F3800] disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading
                ? (hi ? 'कृपया प्रतीक्षा करें...' : 'Please wait...')
                : mode === 'signin'
                  ? (hi ? 'साइन इन करें' : 'Sign In')
                  : (hi ? 'खाता बनाएं' : 'Create Account')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {mode === 'signin' && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-[#E3E2E0]" />
                <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#9B887C]">
                  {hi ? 'डेमो प्रोफ़ाइल' : 'DEMO PROFILES'}
                </p>
                <div className="h-px flex-1 bg-[#E3E2E0]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => selectDemoProfile(profile)}
                    className="group rounded-2xl border border-[#E3E2E0] bg-white p-3.5 text-left shadow-sm hover:border-[#8E4E14]/40 hover:shadow-md transition-all"
                    aria-label={`Use ${profile.name} demo profile`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.artisan.avatar}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#1A1C1A] truncate group-hover:text-[#8E4E14]">{profile.name}</p>
                        <p className="text-[11px] text-[#765A05] mt-0.5 truncate">{profile.artisan.craft}</p>
                        <p className="text-[10px] text-[#867468] mt-0.5 truncate">{profile.artisan.location}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          )}

          <p className="text-[11px] text-[#867468] text-center mt-6 leading-relaxed">
            {hi
              ? 'Prototype mode: account data इस browser में सुरक्षित रूप से demo storage में रखा जाता है।'
              : 'Prototype mode: account data is stored locally in this browser for the demo.'}
          </p>
        </div>
      </div>
    </div>
  );
};
