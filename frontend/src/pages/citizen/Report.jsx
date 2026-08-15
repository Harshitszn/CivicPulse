import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, MapPin, Camera, X, RefreshCw, CheckCircle2, Shield, User,
  AlertCircle, Image as ImageIcon, Sparkles, Check, Edit3, ArrowRight,
  Sliders, Cpu, Info,
} from 'lucide-react';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { usePincode } from '../../context/PincodeContext';

const CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'roads', label: '🛣️  Roads & Potholes', dept: 'Public Works Department' },
  { value: 'garbage', label: '🗑️  Garbage & Sanitation', dept: 'Sanitation & Solid Waste Management' },
  { value: 'water', label: '💧  Water Supply', dept: 'City Water Supply Board' },
  { value: 'drainage', label: '🏞️  Stormwater & Drainage', dept: 'Stormwater Drainage Department' },
  { value: 'streetlights', label: '💡  Street Lighting', dept: 'Electricity & Public Lighting Department' },
  { value: 'infra', label: '🌳  Public Infrastructure', dept: 'Pedestrian Infrastructure Dept' },
  { value: 'noise', label: '🔊  Noise & Nuisance', dept: 'Civic Regulation Enforcement' },
  { value: 'other', label: '📋  Other Municipal Issue', dept: 'General Municipal Administration' },
];

// Sample images for quick selection in prototype
const SAMPLE_PHOTOS = [
  { label: 'Pothole', key: 'pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Garbage', key: 'garbage', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80' },
  { label: 'Water Leak', key: 'water', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Broken Light', key: 'light', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80' },
];

// AI Mock Classification Presets
const MOCK_AI_PRESETS = {
  pothole: {
    category: 'Road Damage',
    categorySlug: 'roads',
    issue: 'Large Pothole',
    department: 'Public Works Department',
    priority: 'High',
    estimatedResolution: '3–5 Days',
    confidence: '94%',
    title: 'Hazardous large pothole on main road corridor',
    description: 'Visual AI detected severe asphalt degradation forming a deep pothole on the active carriageway. Urgent patching required to prevent vehicle accidents.',
  },
  garbage: {
    category: 'Garbage & Sanitation',
    categorySlug: 'garbage',
    issue: 'Garbage Overflow',
    department: 'Sanitation & Solid Waste Management',
    priority: 'High',
    estimatedResolution: '1–2 Days',
    confidence: '96%',
    title: 'Overflowing garbage pile creating sanitation hazard',
    description: 'Visual AI detected uncollected solid municipal waste accumulating near public walkway. Priority clearance requested.',
  },
  water: {
    category: 'Water Supply',
    categorySlug: 'water',
    issue: 'Water Leakage',
    department: 'City Water Supply Board',
    priority: 'Urgent',
    estimatedResolution: '24–48 Hours',
    confidence: '98%',
    title: 'Burst pipe water leakage spilling on public street',
    description: 'Visual AI identified active clean water pipeline leak under pressure. Urgent valve isolation required.',
  },
  drainage: {
    category: 'Stormwater & Drainage',
    categorySlug: 'drainage',
    issue: 'Drainage Blockage',
    department: 'Stormwater Drainage Department',
    priority: 'High',
    estimatedResolution: '2–3 Days',
    confidence: '91%',
    title: 'Blocked storm drain causing localized waterlogging',
    description: 'Visual AI detected clogged drainage inlet grate resulting in stagnant water buildup on the road.',
  },
  light: {
    category: 'Street Lighting',
    categorySlug: 'streetlights',
    issue: 'Broken Streetlight',
    department: 'Electricity & Public Lighting Department',
    priority: 'Medium',
    estimatedResolution: '1–3 Days',
    confidence: '93%',
    title: 'Unfunctional streetlight luminaire causing dark patch',
    description: 'Visual AI detected broken or inactive streetlight fixture along public road stretch.',
  },
  footpath: {
    category: 'Public Infrastructure',
    categorySlug: 'infra',
    issue: 'Damaged Footpath',
    department: 'Pedestrian Infrastructure Dept',
    priority: 'Medium',
    estimatedResolution: '4–7 Days',
    confidence: '89%',
    title: 'Cracked paving tiles creating pedestrian hazard',
    description: 'Visual AI identified broken footpath tiles and uneven surface creating trip hazards for pedestrians.',
  },
};

const AI_STEPS = [
  'Analyzing image...',
  'Identifying issue...',
  'Determining category...',
  'Selecting department...',
  'Estimating priority...',
];

export default function Report() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNewComplaint, currentUser, registeredPincode } = usePincode();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // ── AI State ───────────────────────────────────────────────────────────────
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    pincode: '',
    address: '',
    priority: 'medium',
    isAnonymous: false,
  });

  const [errors, setErrors] = useState({});

  // Trigger AI Classification Pipeline
  const runAiClassification = (presetKey = 'pothole') => {
    setAiAnalyzing(true);
    setAiStepIndex(0);
    setAiResult(null);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep < AI_STEPS.length) {
        setAiStepIndex(currentStep);
      } else {
        clearInterval(interval);
        setAiAnalyzing(false);

        // Pick classification
        const classification = MOCK_AI_PRESETS[presetKey] || MOCK_AI_PRESETS.pothole;
        setAiResult(classification);

        // Auto-fill form fields with AI suggestions if currently blank or user wants suggestions
        setForm((f) => ({
          ...f,
          title: f.title || classification.title,
          description: f.description || classification.description,
          category: classification.categorySlug,
          priority: classification.priority.toLowerCase(),
        }));

        toast.info(`AI analysis complete: ${classification.issue} (${classification.confidence} confidence)`);
      }
    }, 450);
  };

  // ── Image Upload Handling ──────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setImagePreview(reader.result);
        setUploading(false);
        // Automatically start prototype AI analysis pipeline upon image upload
        runAiClassification('pothole');
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (sample) => {
    setUploading(true);
    setTimeout(() => {
      setImagePreview(sample.url);
      setUploading(false);
      // Run AI pipeline with corresponding sample key
      runAiClassification(sample.key);
    }, 400);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setAiResult(null);
    setAiAnalyzing(false);
    toast.info('Image and AI analysis removed');
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = 'Issue title is required';
    } else if (form.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }

    if (!form.category) {
      errs.category = 'Please select a category';
    }

    if (!form.description.trim()) {
      errs.description = 'Please describe the issue';
    } else if (form.description.trim().length < 10) {
      errs.description = 'Description should be at least 10 characters';
    }

    if (!form.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errs.pincode = 'Enter a valid 6-digit postal pincode';
    }

    return errs;
  };

  // ── Form Submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const complaintNum = Math.floor(10000 + Math.random() * 90000);
    const complaintId = `CP-${complaintNum}`;
    const selectedCategoryObj = CATEGORIES.find((c) => c.value === form.category);

    const newComplaint = {
      _id: complaintId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: selectedCategoryObj?.label.split(' ')[2] || aiResult?.category || 'General',
      categorySlug: form.category,
      pincode: form.pincode.trim(),
      ward: `Ward ${form.pincode.slice(-2)}`,
      address: form.address.trim() || `Pincode ${form.pincode}`,
      priority: form.priority || 'medium',
      department: selectedCategoryObj?.dept || aiResult?.department || 'General Municipal Administration',
      status: 'open',
      upvotes: 1,
      downvotes: 0,
      commentCount: 0,
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      aiAnalysis: aiResult ? { ...aiResult } : null,
      reportedBy: {
        name: form.isAnonymous ? 'Anonymous Resident' : (currentUser?.name || 'Priya Sharma'),
        avatar: form.isAnonymous ? null : (currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'),
        isAnonymous: form.isAnonymous,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      addNewComplaint(newComplaint);
    } catch (err) {
      console.warn('Context update error', err);
    }

    setLoading(false);
    toast.success(`Complaint #${complaintId} registered successfully!`);
    navigate(`/complaint/${complaintId}`, { state: { complaint: newComplaint } });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((er) => ({ ...er, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight flex items-center gap-2">
          Report an Issue
        </h1>
        <p className="text-xs text-secondary-500 mt-1 leading-relaxed">
          Submit civic complaints directly to your municipality with automatic prototype AI classification.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* ── Photo Upload Section ─────────────────────────────────────────── */}
        <div className="bg-surface border border-secondary-200 rounded-xl p-4 shadow-card">
          <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wide mb-2 flex items-center justify-between">
            <span>Issue Photo</span>
            <span className="text-[10px] text-secondary-400 font-normal">Optional but enables AI detection</span>
          </label>

          {uploading ? (
            <div className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-xl p-8 text-center flex flex-col items-center justify-center">
              <RefreshCw size={24} className="text-primary-600 animate-spin mb-2" />
              <p className="text-xs font-bold text-primary-700">Uploading photo...</p>
            </div>
          ) : imagePreview ? (
            /* Image Preview Card */
            <div className="relative rounded-xl overflow-hidden border border-secondary-200 bg-black aspect-video group">
              <img src={imagePreview} alt="Issue preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="cursor-pointer bg-white text-secondary-900 hover:bg-secondary-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors">
                  <RefreshCw size={13} />
                  Replace
                  <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-error text-white hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
                >
                  <X size={13} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* File Dropzone Input */
            <div>
              <label className="border-2 border-dashed border-secondary-300 hover:border-primary-500 rounded-xl p-6 text-center bg-secondary-50/50 hover:bg-primary-50/40 transition-all duration-normal flex flex-col items-center justify-center cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                  <Camera size={20} />
                </div>
                <p className="text-xs font-bold text-secondary-800 group-hover:text-primary-600 transition-colors">
                  Click or drag photo here to upload
                </p>
                <p className="text-[10px] text-secondary-400 mt-1">Triggers automatic prototype AI classification</p>
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
              </label>

              {/* Sample Photo selector */}
              <div className="mt-3">
                <p className="text-[11px] text-secondary-500 font-semibold mb-1.5">Or test with a demo photo + AI classification:</p>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.key}
                      type="button"
                      onClick={() => handleSelectSamplePhoto(sample)}
                      className="border border-secondary-200 rounded-lg p-1.5 text-center bg-white hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    >
                      <div className="h-10 rounded overflow-hidden mb-1">
                        <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-medium text-secondary-700 block truncate">{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── AI Analysis Pipeline Container ───────────────────────────────── */}
        {aiAnalyzing && (
          <div className="bg-primary-50/80 border border-primary-200 rounded-xl p-5 shadow-card animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary-600 animate-spin" />
              <span className="text-xs font-extrabold text-primary-700 tracking-wide uppercase">
                PROTOTYPE AI ANALYSIS IN PROGRESS
              </span>
            </div>

            {/* Step-by-step sequence messages */}
            <div className="space-y-2 mb-3">
              {AI_STEPS.map((step, idx) => (
                <div key={step} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    idx < aiStepIndex
                      ? 'bg-primary-600 text-white'
                      : idx === aiStepIndex
                      ? 'bg-primary-500 text-white animate-bounce'
                      : 'bg-primary-200 text-primary-400'
                  }`}>
                    {idx < aiStepIndex ? <Check size={10} /> : idx + 1}
                  </div>
                  <span className={idx === aiStepIndex ? 'font-bold text-primary-900' : idx < aiStepIndex ? 'text-primary-700' : 'text-primary-400'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-primary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-normal"
                style={{ width: `${((aiStepIndex + 1) / AI_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Display AI Classification Results Card ──────────────────────── */}
        {aiResult && !aiAnalyzing && (
          <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-primary-200 rounded-xl p-5 shadow-card animate-fade-in">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-primary-200/70">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-primary-900 uppercase tracking-wide">
                    Prototype AI Analysis
                  </span>
                  <span className="text-[10px] text-primary-600 block">Visual Recognition Engine</span>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-primary-600 text-white text-xs font-extrabold rounded-full shadow-sm">
                {aiResult.confidence} Confidence
              </span>
            </div>

            {/* Output Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div className="bg-white/80 rounded-lg p-2.5 border border-primary-100">
                <span className="text-[10px] font-bold text-secondary-400 uppercase block">Category</span>
                <span className="text-xs font-bold text-secondary-900">{aiResult.category}</span>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-primary-100">
                <span className="text-[10px] font-bold text-secondary-400 uppercase block">Detected Issue</span>
                <span className="text-xs font-bold text-primary-700">{aiResult.issue}</span>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-primary-100">
                <span className="text-[10px] font-bold text-secondary-400 uppercase block">Department</span>
                <span className="text-xs font-bold text-secondary-900 truncate block">{aiResult.department}</span>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-primary-100">
                <span className="text-[10px] font-bold text-secondary-400 uppercase block">Priority</span>
                <span className="text-xs font-bold text-amber-600">{aiResult.priority}</span>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-primary-100">
                <span className="text-[10px] font-bold text-secondary-400 uppercase block">Est. Resolution</span>
                <span className="text-xs font-bold text-emerald-700">{aiResult.estimatedResolution}</span>
              </div>
              <div className="bg-white/80 rounded-lg p-2.5 border border-primary-100">
                <span className="text-[10px] font-bold text-secondary-400 uppercase block">Status</span>
                <span className="text-xs font-bold text-primary-600">Auto-Applied ✓</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-primary-700 bg-white/60 p-2 rounded-lg border border-primary-100">
              <Info size={13} className="text-primary-600 flex-shrink-0" />
              <span>AI values pre-populated below. You can edit any value before submitting.</span>
            </div>
          </div>
        )}

        {/* ── Form Fields Card ─────────────────────────────────────────────── */}
        <div className="bg-surface border border-secondary-200 rounded-xl p-5 shadow-card space-y-4">
          {/* Category Dropdown */}
          <Select
            label="Issue Category"
            value={form.category}
            onChange={handleChange('category')}
            error={errors.category}
            id="report-category"
            required
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-secondary-700 uppercase tracking-wide mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                    form.priority === p
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Title */}
          <Input
            label="Issue Title"
            placeholder="e.g. Deep pothole causing accidents near bus stop"
            value={form.title}
            onChange={handleChange('title')}
            error={errors.title}
            id="report-title"
            maxLength={150}
            required
          />

          {/* Detailed Description */}
          <Textarea
            label="Detailed Description"
            placeholder="Provide relevant details — exact location, how long it has been present, severity, or safety hazards..."
            value={form.description}
            onChange={handleChange('description')}
            error={errors.description}
            id="report-description"
            rows={4}
            maxLength={1500}
            required
          />

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Pincode (6-digit)"
              placeholder="e.g. 560001"
              value={form.pincode}
              onChange={handleChange('pincode')}
              error={errors.pincode}
              id="report-pincode"
              maxLength={6}
              inputMode="numeric"
              required
            />
            <Input
              label="Landmark / Street Address"
              placeholder="e.g. Near MG Road Bus Stop 12"
              value={form.address}
              onChange={handleChange('address')}
              id="report-address"
            />
          </div>

          {/* Identity Privacy Selection */}
          <div className="pt-3 border-t border-secondary-100">
            <label className="block text-xs font-bold text-secondary-800 uppercase tracking-wide mb-2">
              Privacy Preference
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Public option */}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isAnonymous: false }))}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  !form.isAnonymous
                    ? 'border-primary-600 bg-primary-50/60 ring-1 ring-primary-600'
                    : 'border-secondary-200 bg-white hover:border-secondary-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${!form.isAnonymous ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-500'}`}>
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-900">Public Identity</p>
                  <p className="text-[10px] text-secondary-500">Post as Priya Sharma</p>
                </div>
              </button>

              {/* Anonymous option */}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isAnonymous: true }))}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  form.isAnonymous
                    ? 'border-primary-600 bg-primary-50/60 ring-1 ring-primary-600'
                    : 'border-secondary-200 bg-white hover:border-secondary-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${form.isAnonymous ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-500'}`}>
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-900">Post Anonymously</p>
                  <p className="text-[10px] text-secondary-500">Hide your name</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          icon={Upload}
          size="lg"
          className="shadow-sm font-bold text-sm py-3"
        >
          {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
        </Button>
      </form>
    </div>
  );
}
