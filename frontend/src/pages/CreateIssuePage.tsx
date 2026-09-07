import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createIssueSchema,
  CreateIssueInput,
  IssuePriority,
  IssueSeverity,
  ApplicationDTO,
  ProjectDTO,
  IssueTriageAnalysis,
} from '@app-issue-track/shared';
import { issuesApi } from '../services/issuesApi';
import { applicationsApi } from '../services/applicationsApi';
import { projectsApi } from '../services/projectsApi';
import { triageApi } from '../services/triageApi';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { AITriagePanel } from '../components/ai-triage/AITriagePanel';
import { ArrowLeft, ArrowRight, Save, ShieldAlert, Sparkles, Check, Loader2 } from 'lucide-react';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

export const CreateIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<number>(1);

  // AI Triage State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageAnalysis, setTriageAnalysis] = useState<IssueTriageAnalysis | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateIssueInput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      priority: IssuePriority.MEDIUM,
      severity: IssueSeverity.MODERATE,
    },
  });

  const selectedAppId = watch('applicationId');
  const formValues = watch();

  useEffect(() => {
    async function loadMeta() {
      try {
        const apps = await applicationsApi.getApplications();
        setApplications(apps);
        if (apps.length > 0) {
          setValue('applicationId', apps[0].id);
        }
      } catch {
        toast.error('Failed to load applications metadata');
      } finally {
        setIsLoadingMeta(false);
      }
    }
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      projectsApi
        .getProjects(selectedAppId)
        .then((projs) => {
          setProjects(projs);
          if (projs.length > 0) {
            setValue('projectId', projs[0].id);
          } else {
            setValue('projectId', '');
          }
        })
        .catch(() => {
          setProjects([]);
          setValue('projectId', '');
        });
    }
  }, [selectedAppId, setValue]);

  const handleAnalyzeWithAI = async () => {
    const current = getValues();
    if (!current.title || !current.description) {
      toast.error('Title and Description Required', 'Please enter a title and description before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await triageApi.analyzeDraftIssue(current as any);
      setTriageAnalysis(res);
      toast.success('AI Triage Complete', 'Engineering triage recommendations and quality score generated.');
    } catch (err: any) {
      toast.error('Triage Analysis Notice', err.message || 'AI assistance unavailable; continuing with standard triage.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptPriority = (val: string) => {
    setValue('priority', val as IssuePriority);
    toast.info('Priority Updated', `Set priority to ${val}.`);
  };

  const handleAcceptSeverity = (val: string) => {
    setValue('severity', val as IssueSeverity);
    toast.info('Severity Updated', `Set severity to ${val}.`);
  };

  const handleAcceptComponent = (val: string) => {
    setValue('moduleComponent', val);
    toast.info('Component Updated', `Set component to ${val}.`);
  };

  const onSubmit = async (data: CreateIssueInput) => {
    setIsSubmitting(true);
    try {
      const created = await issuesApi.createIssue(data);
      toast.success('Issue Reported', `Created issue [${created.issueKey}] successfully.`);
      navigate(`/issues/${created.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to report issue.';
      toast.error('Submission Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMeta) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonLoader rows={2} height="h-20" />
        <SkeletonLoader rows={4} height="h-32" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-4 shadow-sm my-8">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-amber-900">No Project Assigned</h2>
            <p className="text-xs text-amber-700 max-w-lg mx-auto leading-relaxed">
              You haven't been assigned to a project yet. To report an application issue, ask an administrator or project manager to add you to a project.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Report New Issue</h1>
            <p className="text-xs text-slate-500">Provide detailed information for tracking and resolution</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold font-mono">
        <div className={`p-2 rounded border ${step === 1 ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          1. Scope & Basic Info
        </div>
        <div className={`p-2 rounded border ${step === 2 ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          2. Technical Context
        </div>
        <div className={`p-2 rounded border ${step === 3 ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          3. AI Triage & Quality
        </div>
        <div className={`p-2 rounded border ${step === 4 ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          4. Review & Submit
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle space-y-6">
        {/* STEP 1: SCOPE & BASIC INFO */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Step 1: Scope & Basic Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Target Application *"
                {...register('applicationId')}
                error={errors.applicationId?.message}
                options={applications.map((a) => ({ label: `${a.name} (${a.code})`, value: a.id }))}
              />

              <Select
                label="Project Context *"
                {...register('projectId')}
                error={errors.projectId?.message}
                options={projects.map((p) => ({ label: `${p.name} (${p.key})`, value: p.id }))}
                disabled={projects.length === 0}
              />
            </div>

            <Input
              label="Issue Summary / Title *"
              placeholder="e.g. Database connection pool timeout during checkout processing"
              {...register('title')}
              error={errors.title?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Module / Component"
                placeholder="e.g. PaymentGateway, AuthController"
                {...register('moduleComponent')}
                error={errors.moduleComponent?.message}
              />
              <Input
                label="Environment"
                placeholder="e.g. Production, Staging, QA"
                {...register('environment')}
                error={errors.environment?.message}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Technical Context
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: TECHNICAL CONTEXT */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Step 2: Technical Context & Details</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                placeholder="Describe the failure, observed error messages, or symptoms in detail..."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                {...register('description')}
              />
              {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Steps to Reproduce</label>
              <textarea
                rows={3}
                placeholder="1. Navigate to checkout page&#10;2. Click pay now under load&#10;3. Observe HTTP 500 timeout"
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono"
                {...register('stepsToReproduce')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Behavior</label>
                <textarea
                  rows={2}
                  placeholder="Payment completes within 2 seconds"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  {...register('expectedResult')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Observed Behavior</label>
                <textarea
                  rows={2}
                  placeholder="Connection pool timeout error HTTP 500"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                  {...register('actualResult')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Priority"
                {...register('priority')}
                options={Object.values(IssuePriority).map((p) => ({ label: p, value: p }))}
              />
              <Select
                label="Severity"
                {...register('severity')}
                options={Object.values(IssueSeverity).map((s) => ({ label: s, value: s }))}
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button type="button" variant="primary" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: AI Triage & Quality
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: AI TRIAGE & QUALITY */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3: AI Engineering Triage & Quality Analysis</h3>
                <p className="text-xs text-slate-500">Run Gemini AI analysis to evaluate quality, detect duplicates, and refine recommendations.</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isAnalyzing}
                  onClick={handleAnalyzeWithAI}
                  leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
                >
                  {triageAnalysis ? 'Re-analyze' : 'Analyze with Gemini'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep(4)}>
                  Skip AI Analysis
                </Button>
              </div>
            </div>

            {triageAnalysis ? (
              <AITriagePanel
                analysis={triageAnalysis}
                onAcceptPriority={handleAcceptPriority}
                onAcceptSeverity={handleAcceptSeverity}
                onAcceptComponent={handleAcceptComponent}
                onContinue={() => setStep(4)}
                onViewIssue={(issueId) => window.open(`/issues/${issueId}`, '_blank')}
              />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center space-y-3">
                <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">AI Triage is ready to analyze your draft report.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click <strong>Analyze with Gemini</strong> to evaluate report quality, discover project duplicates, and verify priority/severity.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button type="button" variant="primary" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Review & Submit
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Step 4: Final Review & Submission</h3>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Title:</span>
                  <span className="font-bold text-slate-900">{formValues.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority / Severity:</span>
                  <span className="font-mono font-bold text-slate-900">{formValues.priority} / {formValues.severity}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Module / Component:</span>
                  <span className="font-mono text-slate-900">{formValues.moduleComponent || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Environment:</span>
                  <span className="font-mono text-slate-900">{formValues.environment || 'N/A'}</span>
                </div>
              </div>

              {triageAnalysis && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-700">
                  <span>Evaluated Quality Score:</span>
                  <span className="font-mono font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                    {triageAnalysis.qualityScore.score} / 100
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Create Issue
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
