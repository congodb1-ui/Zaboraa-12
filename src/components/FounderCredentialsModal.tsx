import React, { useState, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import {
  X,
  CheckCircle2,
  Save,
  Award,
  User,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const FounderCredentialsModal: React.FC = () => {
  const {
    isFounderModalOpen,
    setIsFounderModalOpen,
    siteConfig,
    updateFounderCredentials
  } = useCustomization();

  const { founder } = siteConfig;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertInput, setNewCertInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (founder) {
      setName(founder.name || 'Wasim Sayyed');
      setRole(founder.role || 'Lead Principal Multi-Cloud Solutions Architect');
      setLocation(founder.location || 'Dallas, TX · Global Availability');
      setEmail(founder.email || 'wasim@zaboraa.com');
      setPhone(founder.phone || '+1 (800) 555-0199');
      setBio(founder.bio || '');
      setCertifications(founder.certifications || []);
    }
  }, [founder, isFounderModalOpen]);

  if (!isFounderModalOpen) return null;

  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    setCertifications(prev => [...prev, newCertInput.trim()]);
    setNewCertInput('');
  };

  const handleRemoveCert = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide a name.');
      return;
    }

    updateFounderCredentials({
      name: name.trim(),
      role: role.trim(),
      location: location.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      certifications: certifications.length > 0 ? certifications : ['VMware Certified Design Expert']
    });

    setNotification('Founder profile, credentials, and certifications updated successfully!');
    setTimeout(() => {
      setNotification(null);
      setIsFounderModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        data-theme-container="dark"
        className="dark-card dark-feature-container relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-xs text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Founder Credentials, Experience & Bio Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Modify principal architect titles, verified specializations, executive bio, and direct booking details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFounderModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Architect Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Executive Title / Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-medium focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Location & Presence</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Direct Contact Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Direct Telephone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Executive Bio & Architectural Background
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed text-xs"
              required
            />
          </div>

          {/* Certifications Management */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Verified Certifications & Credentials ({certifications.length})</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Displayed on Founder Authority Card</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => {
                        const updated = [...certifications];
                        updated[idx] = e.target.value;
                        setCertifications(updated);
                      }}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none focus:text-white w-full truncate"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-70 group-hover:opacity-100"
                    title="Remove certification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Certification Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCertInput}
                onChange={(e) => setNewCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCert();
                  }
                }}
                placeholder="Add certification (e.g. VCAP-NV Deploy 2026, Azure Solutions Architect Expert)..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Credential</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFounderModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
