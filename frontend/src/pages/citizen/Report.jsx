import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Camera, X, CheckCircle2 } from 'lucide-react';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  { value: '',             label: 'Select a category...' },
  { value: 'roads',        label: '🛣️  Roads & Potholes' },
  { value: 'water',        label: '💧  Water Supply' },
  { value: 'electricity',  label: '⚡  Electricity' },
  { value: 'sanitation',   label: '🗑️  Sanitation & Waste' },
  { value: 'parks',        label: '🌳  Parks & Public Spaces' },
  { value: 'streetlights', label: '💡  Street Lights' },
  { value: 'drainage',     label: '🏞️  Drainage' },
  { value: 'noise',        label: '🔊  Noise Pollution' },
  { value: 'encroachment', label: '🚧  Encroachment' },
  { value: 'other',        label: '📋  Other' },
];

export default function Report() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    pincode: '', address: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Please select a category';
    if (!form.pincode.match(/^\d{6}$/)) e.pincode = 'Enter a valid 6-digit pincode';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    // Simulate submit
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success('Complaint submitted successfully!');
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-secondary-900">Complaint Submitted!</h2>
          <p className="text-sm text-secondary-400 mt-1">Your issue has been registered and will be reviewed shortly.</p>
          <p className="text-xs text-secondary-400 mt-0.5">Complaint ID: #CP-{Math.floor(Math.random() * 90000 + 10000)}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate('/feed')}>Browse Feed</Button>
          <Button variant="ghost" onClick={() => { setSubmitted(false); setForm({ title: '', description: '', category: '', pincode: '', address: '' }); }}>
            Report Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-secondary-900">Report an Issue</h1>
        <p className="text-xs text-secondary-400 mt-0.5">Help your community by reporting civic problems.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Category */}
          <Select
            label="Category"
            value={form.category}
            onChange={handleChange('category')}
            error={errors.category}
            id="report-category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          {/* Title */}
          <Input
            label="Issue Title"
            placeholder="e.g. Deep pothole causing accidents near bus stop"
            value={form.title}
            onChange={handleChange('title')}
            error={errors.title}
            id="report-title"
            maxLength={200}
          />

          {/* Description */}
          <Textarea
            label="Describe the issue"
            placeholder="Please describe the problem in detail — location, duration, impact on residents..."
            value={form.description}
            onChange={handleChange('description')}
            error={errors.description}
            id="report-description"
            rows={5}
            maxLength={2000}
          />

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pincode"
              placeholder="560001"
              value={form.pincode}
              onChange={handleChange('pincode')}
              error={errors.pincode}
              id="report-pincode"
              maxLength={6}
              inputMode="numeric"
            />
            <Input
              label="Landmark / Address"
              placeholder="Near bus stop"
              value={form.address}
              onChange={handleChange('address')}
              id="report-address"
            />
          </div>

          {/* Photo upload (UI only) */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Add Photos (optional)
            </label>
            <div className="border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-all duration-fast cursor-pointer group">
              <Camera size={20} className="mx-auto text-secondary-300 group-hover:text-primary-500 mb-2 transition-colors" />
              <p className="text-xs text-secondary-400 group-hover:text-primary-600 transition-colors">
                Tap to add photos
              </p>
              <p className="text-[10px] text-secondary-300 mt-0.5">JPG, PNG up to 5MB each</p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={Upload}
            size="lg"
          >
            Submit Complaint
          </Button>
        </div>
      </form>
    </div>
  );
}
