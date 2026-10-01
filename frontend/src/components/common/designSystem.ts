/**
 * AITS Enterprise Design System Tokens & Semantic Constants
 * Provides unified classes for layout, typography, borders, and status accents.
 */

export const typography = {
  pageTitle: 'text-2xl font-extrabold text-slate-900 tracking-tight',
  pageSubtitle: 'text-xs text-slate-500 mt-1',
  sectionTitle: 'text-xs font-bold text-slate-900 uppercase tracking-wider',
  cardTitle: 'text-sm font-bold text-slate-900 tracking-tight',
  bodyText: 'text-xs text-slate-700 leading-relaxed',
  mutedText: 'text-xs text-slate-500',
  caption: 'text-[11px] text-slate-400',
  codeMono: 'font-mono text-xs font-semibold',
  metricNumber: 'font-mono text-2xl font-extrabold text-slate-900 tracking-tight',
  tableHeader: 'text-[11px] font-bold text-slate-500 uppercase tracking-wider py-2.5 px-3.5',
};

export const surfaces = {
  panel: 'bg-white border border-slate-200/90 rounded-xl shadow-xs hover:shadow-subtle transition-all duration-200',
  panelSubtle: 'bg-slate-50/80 border border-slate-200/80 rounded-xl',
  panelDark: 'bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xs',
  cardHeader: 'px-5 py-3.5 border-b border-slate-100/90 flex items-center justify-between',
  cardBody: 'p-5',
  hoverRow: 'hover:bg-slate-50/80 cursor-pointer transition-colors',
};

export const statusColors = {
  OPEN: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Open',
  },
  ASSIGNED: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Assigned',
  },
  IN_PROGRESS: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'In Progress',
  },
  RESOLVED: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Resolved',
  },
  VERIFIED: {
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    label: 'Verified',
  },
  CLOSED: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    label: 'Closed',
  },
  REOPENED: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    label: 'Reopened',
  },
};

export const priorityColors = {
  LOW: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Low',
  },
  MEDIUM: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Medium',
  },
  HIGH: {
    badge: 'bg-amber-50 text-amber-800 border-amber-300',
    label: 'High',
  },
  CRITICAL: {
    badge: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    label: 'Critical',
  },
};

export const severityColors = {
  COSMETIC: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    label: 'Cosmetic',
  },
  MINOR: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Minor',
  },
  MODERATE: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    label: 'Moderate',
  },
  MAJOR: {
    badge: 'bg-amber-50 text-amber-700 border-amber-300',
    label: 'Major',
  },
  CRITICAL: {
    badge: 'bg-orange-50 text-orange-700 border-orange-300',
    label: 'Critical',
  },
  BLOCKER: {
    badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    label: 'Blocker',
  },
};

export const incidentSeverityColors = {
  SEV1: {
    badge: 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs',
    text: 'text-rose-700',
    label: 'SEV1 - Critical Outage',
  },
  SEV2: {
    badge: 'bg-orange-500 text-white border-orange-600 font-semibold',
    text: 'text-orange-700',
    label: 'SEV2 - Major Degradation',
  },
  SEV3: {
    badge: 'bg-amber-50 text-amber-800 border-amber-300',
    text: 'text-amber-800',
    label: 'SEV3 - Moderate Impact',
  },
  SEV4: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    label: 'SEV4 - Minor Issue',
  },
};
