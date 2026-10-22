// Shared validation + sanitizing rules for the "Schedule Executive Architecture Briefing" form.
// Keep these rules in sync with supabase/migrations/20261024_harden_briefing_requests.sql

export type BriefingField =
  | 'name' | 'email' | 'company' | 'phone' | 'cloudFocus' | 'vmScale' | 'urgency' | 'notes';

export interface BriefingOption { value: string; label: string }

export const CLOUD_FOCUS_OPTIONS: BriefingOption[] = [
  { value: 'Azure AVS', label: 'Azure AVS' },
  { value: 'AWS VMC', label: 'AWS VMC' },
  { value: 'Google Cloud GCVE', label: 'Google Cloud GCVE' },
  { value: 'NSX-T Zero-Trust', label: 'NSX-T Zero-Trust' },
  { value: 'VMware VCF 5.x', label: 'VMware VCF 5.x' },
  { value: 'Nutanix NC2 on Azure', label: 'Nutanix NC2 on Azure' },
  { value: 'Multi-Cloud Evacuation', label: 'Multi-Cloud Evacuation' }
];

export const VM_SCALE_OPTIONS: BriefingOption[] = [
  { value: 'Under 250 VMs', label: 'Under 250 VMs' },
  { value: '250 - 500 VMs', label: '250 - 500 VMs' },
  { value: '500 - 1,500 VMs', label: '500 - 1,500 VMs' },
  { value: '1,500+ VMs', label: '1,500+ VMs (Multi-Petabyte)' }
];

export const URGENCY_OPTIONS: BriefingOption[] = [
  { value: 'Urgent (< 30 Days)', label: 'Urgent (< 30 Days)' },
  { value: 'Within 60 Days', label: 'Within 60 Days' },
  { value: 'Next 3 - 6 Months', label: 'Next 3 - 6 Months' },
  { value: 'Strategic Planning', label: 'Strategic Planning' }
];

export const LIMITS = {
  nameMax: 80,
  emailMax: 254,
  companyMax: 100,
  phoneMax: 20,
  notesMax: 2000,
  maxLinksInNotes: 2
};

const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const COMPANY_REGEX = /^[\p{L}\p{N}][\p{L}\p{N} &.,'’()/+#-]*$/u;
const EMAIL_REGEX =
  /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const PHONE_REGEX = /^\+?[0-9 ().-]+$/;

// Throwaway mailbox providers are not accepted as a "work email"
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org',
  'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'dispostable.com',
  'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com'
]);

/** Removes control characters, HTML tags and extra spaces from a single-line value. */
export function cleanSingleLine(value: string): string {
  return (value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same as above but keeps line breaks for the free-text notes field. */
export function cleanMultiLine(value: string): string {
  return (value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface BriefingFormValues {
  name: string;
  email: string;
  company: string;
  phone: string;
  cloudFocus: string;
  vmScale: string;
  urgency: string;
  notes: string;
}

export interface BriefingValidationResult {
  valid: boolean;
  errors: Partial<Record<BriefingField, string>>;
  clean: BriefingFormValues;
}

export function validateBriefingForm(values: BriefingFormValues): BriefingValidationResult {
  const errors: Partial<Record<BriefingField, string>> = {};

  const name = cleanSingleLine(values.name);
  const email = cleanSingleLine(values.email).toLowerCase();
  const company = cleanSingleLine(values.company);
  const phone = cleanSingleLine(values.phone);
  const notes = cleanMultiLine(values.notes);

  // Name: letters, spaces, . ' - only (no digits or symbols)
  const nameLetters = (name.match(/\p{L}/gu) || []).length;
  if (!name) {
    errors.name = 'Please enter your full name.';
  } else if (name.length > LIMITS.nameMax) {
    errors.name = `Name must be ${LIMITS.nameMax} characters or fewer.`;
  } else if (/[<>]/.test(values.name) || !NAME_REGEX.test(name) || nameLetters < 2 || /[ .'’-]{3,}/.test(name)) {
    errors.name = 'Name can contain letters, spaces, hyphens, apostrophes and full stops only.';
  }

  // Email: strict format, real domain ending, not a throwaway domain
  if (!email) {
    errors.email = 'Please enter your work email address.';
  } else if (email.length > LIMITS.emailMax || !EMAIL_REGEX.test(email) || email.includes('..')) {
    errors.email = 'Please enter a valid email address, for example name@company.com.';
  } else if (DISPOSABLE_EMAIL_DOMAINS.has(email.split('@')[1])) {
    errors.email = 'Please use your work email address, not a temporary mailbox.';
  }

  // Company
  if (!company) {
    errors.company = 'Please enter your organization name.';
  } else if (company.length < 2 || company.length > LIMITS.companyMax) {
    errors.company = `Organization name must be 2 to ${LIMITS.companyMax} characters.`;
  } else if (/[<>]/.test(values.company) || !COMPANY_REGEX.test(company) || !/\p{L}/u.test(company)) {
    errors.company = 'Organization name contains characters that are not allowed.';
  }

  // Phone (optional)
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (
      phone.length > LIMITS.phoneMax ||
      !PHONE_REGEX.test(phone) ||
      digits.length < 7 ||
      digits.length > 15
    ) {
      errors.phone = 'Enter a valid phone number (7 to 15 digits), for example +1 555 000 0000.';
    }
  }

  // Dropdowns: only the listed values are accepted
  if (!CLOUD_FOCUS_OPTIONS.some(o => o.value === values.cloudFocus)) {
    errors.cloudFocus = 'Please choose one of the listed focus areas.';
  }
  if (!VM_SCALE_OPTIONS.some(o => o.value === values.vmScale)) {
    errors.vmScale = 'Please choose one of the listed workload scales.';
  }
  if (!URGENCY_OPTIONS.some(o => o.value === values.urgency)) {
    errors.urgency = 'Please choose one of the listed timelines.';
  }

  // Notes (optional)
  if (notes.length > LIMITS.notesMax) {
    errors.notes = `Please keep this to ${LIMITS.notesMax} characters or fewer (currently ${notes.length}).`;
  } else if ((notes.match(/https?:\/\/|www\./gi) || []).length > LIMITS.maxLinksInNotes) {
    errors.notes = `Please include at most ${LIMITS.maxLinksInNotes} links.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: {
      name,
      email,
      company,
      phone,
      cloudFocus: values.cloudFocus,
      vmScale: values.vmScale,
      urgency: values.urgency,
      notes
    }
  };
}

// ---- Simple anti-spam: one request per minute per browser ----
const COOLDOWN_KEY = 'zaboraa_briefing_last_submit';
export const BRIEFING_COOLDOWN_MS = 60_000;

export function getBriefingCooldownRemainingMs(): number {
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, last + BRIEFING_COOLDOWN_MS - Date.now());
  } catch {
    return 0;
  }
}

export function markBriefingSubmitted(): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/** Turns raw database errors into messages a visitor can act on. */
export function friendlyBriefingError(message: string | null): string {
  const msg = message || '';
  if (/too many briefing requests/i.test(msg)) {
    return 'We have already received several requests from this email address. Please try again later or contact us directly.';
  }
  if (/violates check constraint|row-level security|invalid input/i.test(msg)) {
    return 'Some details were not accepted. Please review the form and try again.';
  }
  return msg || 'Failed to submit briefing request. Please try again.';
}
