import React, { useState, useRef, useEffect } from 'react';
import { Language, SampleCraft } from '../types';
import { TRANSLATIONS, QUICK_SAMPLES } from '../data/mockData';
import {
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Play,
  Square,
  RefreshCw,
  Info,
  Upload,
  AlertCircle
} from 'lucide-react';

interface AddNewProductWizardProps {
  language: Language;
  onStartGenerating: (data: {
    photoUrl: string;
    photoBase64?: string;
    story: string;
  }) => void;
  onCancel: () => void;
}

export const AddNewProductWizard: React.FC<AddNewProductWizardProps> = ({
  language,
  onStartGenerating,
  onCancel,
}) => {
  const t = TRANSLATIONS[language];

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Story & Audio state
  const [story, setStory] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Refs for media
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Handle Photo File Upload
  const processImageFile = (file: File) => {
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Voice recording logic with MediaRecorder + Web Speech fallback
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // If story was empty, provide realistic transcribed text
        if (!story.trim()) {
          setStory(
            language === 'hi'
              ? 'यह हस्तनिर्मित टेराकोटा का बर्तन है, जिसे नदी की चिकनी मिट्टी से चाक पर गढ़ा गया है और धूप में सुखाकर भट्टी में पकाया है। मूल्य लगभग ₹1,200 होना चाहिए।'
              : 'This is a handcrafted terracotta vase, hand-turned on the wheel with river clay and woodfire baked. Estimated price around ₹1,200 to ₹1,500.'
          );
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      // Attempt Browser Web Speech Recognition for live Hindi/English transcription if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript + ' ';
            }
            if (transcript.trim()) {
              setStory(transcript.trim());
            }
          };
          recognition.onerror = () => {
            recognitionRef.current = null;
          };
          recognition.onend = () => {
            recognitionRef.current = null;
          };
          recognition.start();
        } catch (recErr) {
          console.log('Web speech recognition note:', recErr);
        }
      }
    } catch (err) {
      console.warn('Microphone access denied or unavailable, using simulated recording:', err);
      // Simulated recording for demo environments where iframe blocks mic
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated stop
      if (!story.trim()) {
        setStory(
          language === 'hi'
            ? 'यह हस्तनिर्मित टेराकोटा का बर्तन है, जिसे नदी की चिकनी मिट्टी से चाक पर गढ़ा गया है और धूप में सुखाकर भट्टी में पकाया है। मूल्य लगभग ₹1,200 होना चाहिए।'
            : 'This is a handcrafted terracotta pot made with natural clay on traditional wheel. Beautiful tribal motifs on surface. Value approx ₹1,200.'
        );
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Speech recognition stop error:', e);
      }
      recognitionRef.current = null;
    }

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const toggleAudioPlayback = () => {
    if (!recordedAudioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(recordedAudioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn('Speech recognition abort error:', e);
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Quick Preset Selector for instant demo
  const selectQuickSample = (sample: SampleCraft) => {
    setSelectedSampleId(sample.id);
    setPhotoUrl(sample.imageUrl);
    setPhotoBase64(''); // URL is sufficient
    setStory(sample.voiceTranscript);
  };

  const isReadyToGenerate = Boolean(photoUrl && story.trim());

  const handleGenerate = () => {
    if (!isReadyToGenerate) return;
    onStartGenerating({
      photoUrl,
      photoBase64,
      story: story.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-in fade-in">
      {/* Header */}
      <div className="text-center md:text-left mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] font-heading mb-1.5">
          {language === 'hi' ? 'नया उत्पाद जोड़ें' : 'Add New Product'}
        </h1>
        <p className="text-sm sm:text-base text-[#534439]">
          {language === 'hi'
            ? 'अपनी रचना की तस्वीर लें और पेशेवर लिस्टिंग बनाने के लिए इसकी कहानी बताएं।'
            : 'Capture your creation and tell its story to generate a professional listing.'}
        </p>
      </div>

      {/* Quick Demo Presets Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-[#E3E2E0] shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-[#8E4E14]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#8E4E14]">
            {t.quickPresets}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {QUICK_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => selectQuickSample(sample)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                selectedSampleId === sample.id
                  ? 'border-[#8E4E14] bg-[#FFDCC4]/30 ring-1 ring-[#8E4E14]'
                  : 'border-[#E3E2E0] hover:border-[#8E4E14]/50 bg-[#FAF9F6]'
              }`}
            >
              <img
                src={sample.imageUrl}
                alt={sample.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1A1C1A] truncate">
                  {language === 'hi' ? sample.hindiName : sample.name}
                </p>
                <span className="text-[10px] text-[#765A05] font-semibold">{sample.estimatedPrice}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Step 1: Photo */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-base sm:text-lg font-bold text-[#1A1C1A] font-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8E4E14] text-white text-xs flex items-center justify-center font-sans">
                1
              </span>
              <span>{language === 'hi' ? 'चरण १: फोटो' : 'Step 1: Photo'}</span>
            </h2>
            <span className="text-[11px] font-semibold text-[#8E4E14] bg-[#FFDCC4] px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`tactile-card rounded-2xl p-6 flex flex-col items-center justify-center text-center flex-grow min-h-[340px] border transition-all ${
              isDragging ? 'border-[#8E4E14] bg-[#FFDCC4]/10' : 'border-[#E3E2E0]'
            }`}
          >
            {photoUrl ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4 shadow-xs">
                  <img
                    src={photoUrl}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    <span>Photo Ready</span>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#8E4E14] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#C6E8F8]/50 text-[#436370] flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 stroke-[1.75]" />
                </div>

                <h3 className="text-sm font-bold text-[#1A1C1A] mb-1">
                  {t.uploadPhotoPrompt}
                </h3>
                <p className="text-xs text-[#534439] max-w-xs mb-6">
                  {t.uploadPhotoSub}
                </p>

                {imageError && (
                  <div className="mb-4 px-3 py-2 bg-[#FFD8D8] text-[#BA1A1A] rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#E3E2E0]/60 hover:bg-[#E3E2E0] text-[#1A1C1A] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{t.gallery}</span>
                  </button>

                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#8E4E14] hover:bg-[#6F3800] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.camera}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>
        </div>

        {/* Step 2: Story (Voice Note) */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-base sm:text-lg font-bold text-[#1A1C1A] font-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8E4E14] text-white text-xs flex items-center justify-center font-sans">
                2
              </span>
              <span>{language === 'hi' ? 'चरण २: कहानी' : 'Step 2: Story'}</span>
            </h2>
            <span className="text-[11px] font-semibold text-[#8E4E14] bg-[#FFDCC4] px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <div className="tactile-card rounded-2xl p-6 flex flex-col items-center justify-center text-center flex-grow min-h-[340px] border border-[#E3E2E0]">
            <h3 className="text-sm font-bold text-[#1A1C1A] mb-1">
              {t.describeProduct}
            </h3>
            <p className="text-xs text-[#534439] max-w-xs mb-6">
              {t.describeProductSub}
            </p>

            {/* Central Circular Microphone Button */}
            <div className="relative my-2">
              <button
                id="record-story-btn"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isRecording
                    ? 'bg-[#E76F51] text-white animate-pulse-record ring-4 ring-[#E76F51]/30'
                    : 'bg-[#FDF6EE] hover:bg-[#FFDCC4] text-[#8E4E14] border-2 border-[#E7C268]'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 fill-white" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>
            </div>

            {/* Recording status / timer */}
            <p className="text-xs font-semibold mt-3 text-[#534439]">
              {isRecording ? (
                <span className="text-[#E76F51] flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-ping" />
                  {t.recordingActive} ({recordDuration}s)
                </span>
              ) : story.trim() ? (
                <span className="text-[#2A9D8F] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Story Recorded</span>
                </span>
              ) : (
                t.tapToRecord
              )}
            </p>

            {/* Transcript preview / manual edit fallback */}
            <div className="w-full mt-4">
              <div className="relative">
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'अपनी भाषा में बोलें या यहाँ लिखें (जैसे: यह हाथ से बनी सिल्क साड़ी है...)'
                      : 'Spoken transcript or craft notes will appear here...'
                  }
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-[#E3E2E0] bg-[#FAF9F6] text-[#1A1C1A] focus:ring-1 focus:ring-[#8E4E14] focus:outline-none resize-none leading-relaxed"
                />
                {story && (
                  <span className="absolute bottom-2 right-2 text-[10px] text-[#765A05] bg-white/80 px-1.5 rounded">
                    Voice Note
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Generate Button */}
      <div className="flex flex-col items-center justify-center pt-2">
        <button
          id="generate-listing-btn"
          disabled={!isReadyToGenerate}
          onClick={handleGenerate}
          className={`py-3.5 px-8 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            isReadyToGenerate
              ? 'bg-[#8E4E14] hover:bg-[#6F3800] text-white hover:scale-102 active:scale-98 shadow-md'
              : 'bg-[#E3E2E0] text-[#867468] cursor-not-allowed opacity-80'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.generateListing}</span>
        </button>

        <p className="text-[11px] text-[#867468] mt-2 font-medium">
          {isReadyToGenerate
            ? '✓ Ready to weave professional catalog card'
            : t.completeBothSteps}
        </p>
      </div>
    </div>
  );
};
