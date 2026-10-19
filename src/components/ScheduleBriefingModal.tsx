import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { X, Calendar, Phone, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function sanitizeBriefingUserId(userUid?: string | null, sessionUserId?: string | null): string | null {
  if (!userUid || typeof userUid !== 'string' || !UUID_REGEX.test(userUid)) {
    return null;
  }
  if (sessionUserId && sessionUserId === userUid && UUID_REGEX.test(sessionUserId)) {
    return sessionUserId;
  }
  return null;
}

export function processBriefingSubmissionResult(
  insertResult: { error: { message: string } | null } | null,
  isConfigured: boolean
): { success: boolean; errorMessage: string | null } {
  if (!isConfigured) {
    return {
      success: false,
      errorMessage: 'Database service is not configured (Supabase credentials missing). Please contact Wasim Sayyed directly by phone or email.'
    };
  }
  if (!insertResult) {
    return {
      success: false,
      errorMessage: 'No response received from database service. Please check your connection and try again.'
    };
  }
  if (insertResult.error) {
    return {
      success: false,
      errorMessage: insertResult.error.message || 'Failed to submit briefing request to database. Please try again.'
    };
  }
  return {
    success: true,
    errorMessage: null
  };
}

async function getVerifiedSupabaseUserId(userUid?: string | null): Promise<string | null> {
  if (!userUid || typeof userUid !== 'string' || !UUID_REGEX.test(userUid)) {
    return null;
  }
  try {
    const { data } = await supabase.auth.getSession();
    const sessionUserId = data?.session?.user?.id;
    return sanitizeBriefingUserId(userUid, sessionUserId);
  } catch {
    return null;
  }
}

export const ScheduleBriefingModal: React.FC = () => {
  const { siteConfig, isBriefingModalOpen, setIsBriefingModalOpen } = useCustomization();
  const { user } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [cloudFocus, setCloudFocus] = useState('Azure AVS');
  const [vmScale, setVmScale] = useState('500 - 1,500 VMs');
  const [urgency, setUrgency] = useState('Within 60 Days');
  const [notes, setNotes] = useState('');

  if (!isBriefingModalOpen) return null;

  const validateForm = (): boolean => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanCompany = company.trim();

    if (cleanName.length < 2) {
      setErrorMessage('Please provide your full name (at least 2 characters).');
      return false;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please provide a valid enterprise work email address.');
      return false;
    }

    if (cleanCompany.length < 2) {
      setErrorMessage('Please provide your enterprise organization name.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Database service is not configured (Supabase credentials missing). Please contact Wasim Sayyed directly by phone or email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const verifiedUserId = await getVerifiedSupabaseUserId(user?.uid);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim() || null,
        cloud_focus: cloudFocus,
        vm_scale: vmScale,
        urgency,
        notes: notes.trim() || null,
        status: 'new',
        user_id: verifiedUserId
      };

      const result = await supabase
        .from('briefing_requests')
        .insert([payload]);

      const outcome = processBriefingSubmissionResult(result, isSupabaseConfigured);
      if (!outcome.success) {
        setErrorMessage(outcome.errorMessage);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || 'A network error occurred while submitting your briefing request. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setIsBriefingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 lg:p-10 flex items-center justify-center animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schedule Executive Architecture Briefing</h3>
              <p className="text-xs text-slate-400">Direct 45-minute advisory session with Wasim Sayyed</p>
            </div>
          </div>
          <button
            onClick={() => setIsBriefingModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">Architecture Briefing Requested</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you, {name}. Your request has been recorded in the enterprise briefing registry. Principal Architect Wasim Sayyed will personally review your infrastructure profile and respond within 2 business hours.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 text-left max-w-sm mx-auto font-mono">
              <div>Focus: <span className="text-cyan-400 font-semibold">{cloudFocus}</span></div>
              <div>Scale: <span className="text-white">{vmScale}</span></div>
              <div>Priority: <span className="text-emerald-400">{urgency}</span></div>
              <div>Company: <span className="text-slate-300">{company}</span></div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={`tel:${siteConfig.founder.phone.replace(/\s+/g, '')}`}
                className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Directly Now ({siteConfig.founder.phone})</span>
              </a>
              <button
                onClick={handleReset}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Henderson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="david@enterprise.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Enterprise Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Financial Group"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Direct Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Primary Focus</label>
                <select
                  value={cloudFocus}
                  onChange={e => setCloudFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Azure AVS">Azure AVS</option>
                  <option value="AWS VMC">AWS VMC</option>
                  <option value="Google Cloud GCVE">Google Cloud GCVE</option>
                  <option value="NSX-T Zero-Trust">NSX-T Zero-Trust</option>
                  <option value="VMware VCF 5.x">VMware VCF 5.x</option>
                  <option value="Nutanix NC2 on Azure">Nutanix NC2 on Azure</option>
                  <option value="Multi-Cloud Evacuation">Multi-Cloud Evacuation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Workload Scale</label>
                <select
                  value={vmScale}
                  onChange={e => setVmScale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Under 250 VMs">Under 250 VMs</option>
                  <option value="250 - 500 VMs">250 - 500 VMs</option>
                  <option value="500 - 1,500 VMs">500 - 1,500 VMs</option>
                  <option value="1,500+ VMs">1,500+ VMs (Multi-Petabyte)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Timeline</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Urgent (< 30 Days)">Urgent (&lt; 30 Days)</option>
                  <option value="Within 60 Days">Within 60 Days</option>
                  <option value="Next 3 - 6 Months">Next 3 - 6 Months</option>
                  <option value="Strategic Planning">Strategic Planning</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Project Scope & Key Constraints</label>
              <textarea
                rows={3}
                placeholder="Mention datacenter lease expiries, storage capacity requirements, or compliance frameworks..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>NDA & Enterprise Confidentiality Guaranteed</span>
              </span>
              <span>Fast-track response (&lt; 2 hrs)</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Briefing Request...</span>
                </>
              ) : (
                <>
                  <span>Confirm Architecture Briefing Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
