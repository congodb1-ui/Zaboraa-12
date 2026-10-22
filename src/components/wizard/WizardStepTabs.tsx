import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, Plus, Edit2, Check } from 'lucide-react';
import { WizardState, ArchitectureTemplateChoice } from '../../types/wizardStateAdapter';
import { getAdminControlState, AdminTemplateDef } from '../../utils/adminParameterControls';
import { useCustomization } from '../../context/CustomizationContext';

export interface IndustryTemplatePreset {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  apply: (prevState: WizardState) => WizardState;
}

interface WizardStepTabsProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  wizardState: WizardState;
  onApplyTemplate: (templateChoice: ArchitectureTemplateChoice) => void;
  isCidrValid?: boolean;
  onOpenAdminStudio?: () => void;
}

const WIZARD_STEPS = [
  { step: 1, label: 'Objective', detail: 'Strategy & Scope' },
  { step: 2, label: 'Source', detail: 'On-Prem Inventory' },
  { step: 3, label: 'Landing Zone', detail: 'Cloud Foundation & VDI' },
  { step: 4, label: 'Security', detail: 'NVA & Perimeter' },
  { step: 5, label: 'Target & DR', detail: 'SDDC Sizing & Runbooks' }
];

export const WizardStepTabs: React.FC<WizardStepTabsProps> = ({
  currentStep,
  onSelectStep,
  wizardState,
  onApplyTemplate,
  onOpenAdminStudio
}) => {
  const { isAdmin } = useCustomization();
  const [templates, setTemplates] = useState<AdminTemplateDef[]>(() => {
    return getAdminControlState().templates;
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.templates) {
        setTemplates(e.detail.templates);
      }
    };
    window.addEventListener('zaboraa:admin-params-changed', handleUpdate);
    return () => window.removeEventListener('zaboraa:admin-params-changed', handleUpdate);
  }, []);

  const getProviderBadge = (provider: string) => {
    if (provider.includes('Azure')) return 'Azure';
    if (provider.includes('Google') || provider.includes('GCP')) return 'Google Cloud';
    if (provider.includes('AWS') || provider.includes('Amazon')) return 'AWS';
    if (provider.includes('Nutanix')) return 'Nutanix';
    return 'Hybrid';
  };

  const activeStep = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];
  const progressPercent = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="space-y-3">
      {/* Template picker: compact chips, same templates and same apply handler */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold text-white tracking-tight">Start from a template</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Optional. Loads a validated starting point you can fully customize.
            </span>
          </div>
          {isAdmin && onOpenAdminStudio && (
            <button
              type="button"
              onClick={onOpenAdminStudio}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
              title="Open Admin Parameter & Template Studio"
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Admin Studio</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((tmpl) => {
            const isSelected = wizardState.templateChoice === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onApplyTemplate(tmpl.id as ArchitectureTemplateChoice)}
                title={tmpl.subtitle || `${tmpl.nodeSku} · ${tmpl.interconnect}`}
                aria-pressed={isSelected}
                className={`group px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 shrink-0">
                  {getProviderBadge(tmpl.provider)}
                </span>
                <span className="text-xs font-semibold text-white whitespace-nowrap">{tmpl.title}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                {isAdmin && onOpenAdminStudio && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAdminStudio();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        onOpenAdminStudio();
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-cyan-300 transition"
                    title="Edit this template in Admin Studio"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}

          {isAdmin && onOpenAdminStudio && (
            <button
              type="button"
              onClick={onOpenAdminStudio}
              className="px-3 py-2 rounded-xl border border-dashed border-emerald-600/50 hover:border-emerald-500 bg-emerald-950/20 text-emerald-300 flex items-center gap-1.5 cursor-pointer transition text-xs font-bold"
              title="Add or remove architecture templates"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Slim progress stepper */}
      <div className="px-3 sm:px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">
            Step {currentStep} of {WIZARD_STEPS.length}
            <span className="text-slate-400 font-normal"> · {activeStep.label}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">{activeStep.detail}</span>
        </div>

        <div className="relative h-1 rounded-full bg-slate-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {WIZARD_STEPS.map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onSelectStep(s.step)}
                aria-current={isActive ? 'step' : undefined}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/60 border border-cyan-500 text-white'
                    : isCompleted
                    ? 'bg-slate-950/60 border border-slate-800 text-emerald-300 hover:border-slate-700'
                    : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="font-mono">{isCompleted ? '✓' : s.step}</span>
                <span className="hidden md:inline truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
