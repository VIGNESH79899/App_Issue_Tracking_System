import {
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  UserRole,
  HistoryAction,
  NotificationType,
  SlaStatus,
  ProjectHealth,
  IncidentStatus,
  IncidentSeverity,
  EscalationLevel,
  ForecastPeriod,
  ForecastConfidence,
  ForecastDirection,
} from './enums.js';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: any[];
    stack?: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  /** Present in the admin user directory to show the project assignment limit. */
  projectCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDTO {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  version: string;
  ownerId?: string | null;
  owner?: UserDTO | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: string;
  applicationId: string;
  applicationName?: string;
  name: string;
  key: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  managerId?: string | null;
  manager?: UserDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberDTO {
  id: string;
  projectId: string;
  userId: string;
  user: UserDTO;
  roleInProject: UserRole;
  joinedAt: string;
}

export interface IssueDTO {
  id: string;
  issueKey: string;
  title: string;
  description: string;
  applicationId: string;
  applicationName?: string;
  projectId: string;
  projectName?: string;
  moduleComponent?: string | null;
  reporterId: string;
  reporter?: UserDTO;
  assigneeId?: string | null;
  assignee?: UserDTO | null;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  environment?: string | null;
  stepsToReproduce?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  dueDate?: string | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  commentsCount?: number;
  attachmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDTO {
  id: string;
  issueId: string;
  authorId: string;
  author?: UserDTO;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentDTO {
  id: string;
  issueId: string;
  uploadedById: string;
  uploadedBy?: UserDTO;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath?: string;
  createdAt: string;
}

export interface IssueHistoryDTO {
  id: string;
  issueId: string;
  changedById: string;
  changedBy?: UserDTO;
  actionType: HistoryAction;
  fieldChanged: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  issueId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponseData {
  user: UserDTO;
  token: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  database: boolean;
  timestamp: string;
  uptime: number;
}

export interface LifecycleDuration {
  status: IssueStatus;
  durationFormatted: string;
  durationHours: number;
  isCurrent: boolean;
  startedAt: string;
  endedAt: string | null;
}

export interface RelatedIssue {
  id: string;
  issueKey: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  relevanceScore: number;
  relationshipReason: string;
}

export interface AssigneeWorkloadSummary {
  assigneeId: string;
  assigneeName: string;
  totalAssigned: number;
  openAssigned: number;
  inProgressAssigned: number;
  criticalHighAssigned: number;
  overdueAgingAssigned: number;
  averageResolutionHours: number | null;
}

export interface SmartAssigneeRecommendation {
  userId: string;
  userName: string;
  userEmail: string;
  systemRole: UserRole;
  projectRole: UserRole;
  score: number;
  activeIssueCount: number;
  criticalHighIssueCount: number;
  averageResolutionHours: number | null;
  reasons: string[];
}

export interface SlaMetrics {
  responseDeadline: string;
  resolutionDeadline: string;
  responseStatus: SlaStatus;
  resolutionStatus: SlaStatus;
  responsePercentage: number;
  resolutionPercentage: number;
  responseRemainingHours: number;
  resolutionRemainingHours: number;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  isResponseSlaMet: boolean | null;
  isResolutionSlaMet: boolean | null;
}

export interface ProjectSlaSummary {
  totalActiveIssues: number;
  compliancePercentage: number;
  atRiskCount: number;
  breachedCount: number;
  avgResponseHours: number | null;
  avgResolutionHours: number | null;
  health: ProjectHealth;
}

export interface IssueIntelligence {
  issueAge: {
    formatted: string;
    hours: number;
  };
  timeSinceUpdate: {
    formatted: string;
    hours: number;
  };
  currentStatusDuration: {
    formatted: string;
    hours: number;
  };
  assignmentAge: {
    formatted: string;
    hours: number;
  } | null;
  lifecycleDurations: LifecycleDuration[];
  relatedIssues: RelatedIssue[];
  assigneeWorkload: AssigneeWorkloadSummary | null;
  sla?: SlaMetrics;
}

export interface AIRootCauseHypothesis {
  hypothesis: string;
  confidence: number;
  evidence: string[];
}

export interface AIRecommendedAction {
  action: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
}

export interface AIRiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
}

export interface AIIssueInsight {
  summary: string;
  rootCauseHypotheses: AIRootCauseHypothesis[];
  recommendedActions: AIRecommendedAction[];
  riskAssessment: AIRiskAssessment;
  testingRecommendations: string[];
  missingInformation: string[];
}

export interface AIInsightResponseData {
  issueId: string;
  generatedAt: string;
  provider: string;
  model: string;
  insights: AIIssueInsight;
}

export interface AITriageRecommendation<T = string> {
  value: T;
  confidence: number;
  reason: string;
}

export interface IssueQualityMetric {
  score: number;
  titleClarity: boolean;
  descriptionCompleteness: boolean;
  reproductionStepsProvided: boolean;
  expectedBehaviorProvided: boolean;
  actualBehaviorProvided: boolean;
  environmentSpecified: boolean;
  errorLogsProvided: boolean;
  moduleSpecified: boolean;
  reasons: string[];
}

export interface MissingInfoItem {
  field: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  howToObtain: string;
  whyItMatters: string;
}

export interface DuplicateCandidateItem {
  issueId: string;
  issueKey: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  similarityScore: number;
  reasons: string[];
}

export interface IssueTriageAnalysis {
  suggestedPriority: AITriageRecommendation<IssuePriority>;
  suggestedSeverity: AITriageRecommendation<IssueSeverity>;
  suggestedComponent: AITriageRecommendation<string>;
  qualityScore: IssueQualityMetric;
  duplicateCandidates: DuplicateCandidateItem[];
  missingInformation: MissingInfoItem[];
  reasoning: string;
}

export interface AnalyzeIssueInput {
  applicationId: string;
  projectId: string;
  title: string;
  description: string;
  moduleComponent?: string | null;
  environment?: string | null;
  stepsToReproduce?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  priority?: IssuePriority;
  severity?: IssueSeverity;
}

export interface ProjectHealthScore {
  score: number;
  level: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  breakdown: {
    slaPerformance: number;
    resolutionVelocity: number;
    criticalBacklog: number;
    developerCapacity: number;
    issueQuality: number;
    issueAging: number;
  };
  reasons: string[];
}

export interface PredictiveSlaRisk {
  issueId: string;
  issueKey: string;
  title: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'LIKELY_TO_BREACH';
  estimatedRiskScore: number;
  timeRemainingHours: number | null;
  factors: string[];
  recommendedAction: string;
}

export interface DeveloperCapacitySummary {
  developerId: string;
  developerName: string;
  activeIssues: number;
  inProgressIssues: number;
  criticalHighIssues: number;
  overdueIssues: number;
  averageResolutionHours: number | null;
  resolvedIssues: number;
  slaBreaches: number;
  capacityScore: number;
  capacityLevel: 'AVAILABLE' | 'NORMAL' | 'BUSY' | 'OVERLOADED';
  reasons: string[];
}

export interface ComponentRiskSummary {
  component: string;
  totalIssues: number;
  activeIssues: number;
  criticalIssues: number;
  highIssues: number;
  slaBreaches: number;
  recurringIssues: number;
  averageResolutionHours: number | null;
  averageQualityScore: number;
  recentGrowthPercentage: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
}

export interface EngineeringBottleneck {
  type:
    | 'DEVELOPER_CAPACITY'
    | 'SLA_BREACHES'
    | 'CRITICAL_BACKLOG'
    | 'COMPONENT_CONCENTRATION'
    | 'LONG_RESOLUTION_TIME'
    | 'ISSUE_INTAKE_SPIKE'
    | 'VERIFICATION_BACKLOG'
    | 'ASSIGNMENT_BACKLOG';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedCount: number;
  evidence: string[];
  recommendedAction: string;
}

export interface TrendPoint {
  date: string;
  created: number;
  resolved: number;
  breaches: number;
  critical: number;
}

export interface CriticalIssueSummary {
  issueId: string;
  issueKey: string;
  title: string;
  projectName: string;
  component: string;
  priority: IssuePriority;
  severity: IssueSeverity;
  status: IssueStatus;
  slaStatus: SlaStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'LIKELY_TO_BREACH';
  assigneeName: string | null;
  createdAt: string;
}

export interface AIProjectBriefing {
  executiveSummary: string;
  keyRisks: string[];
  positiveSignals: string[];
  recommendedActions: string[];
  areasToMonitor: string[];
  generatedAt: string;
}

export interface CommandCenterOverview {
  projectId: string;
  projectName: string;
  projectKey: string;
  health: ProjectHealthScore;
  activeIssueCount: number;
  criticalIssueCount: number;
  highPriorityCount: number;
  slaCompliancePercentage: number;
  slaBreachedCount: number;
  slaAtRiskCount: number;
  averageResolutionHours: number | null;
  averageResponseHours: number | null;
}

export interface IncidentTimelineDTO {
  id: string;
  incidentId: string;
  actorId: string;
  actorName: string;
  action: string;
  oldState?: string | null;
  newState?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface IncidentDTO {
  id: string;
  incidentKey: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  applicationId: string;
  applicationName?: string;
  moduleComponent?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  ownerId?: string | null;
  ownerName?: string | null;
  sourceIssueId?: string | null;
  sourceIssueKey?: string | null;
  detectedAt: string;
  acknowledgedAt?: string | null;
  investigatingAt?: string | null;
  mitigatingAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  impactSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentEscalationDTO {
  trigger: string;
  severity: EscalationLevel;
  evidence: string[];
  recommendedAction: string;
  createdAt: string;
}

export interface IncidentMetricsDTO {
  mttaHours: number | null;
  mttrHours: number | null;
  activeCount: number;
  sev1Count: number;
  sev2Count: number;
  slaBreachedCount: number;
  escalationCount: number;
  recurrenceRate: number;
}

export interface IncidentRecurrenceDTO {
  recurrenceCount: number;
  previousIncidents: { id: string; incidentKey: string; title: string; detectedAt: string }[];
  recurrenceRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
}

export interface PostIncidentAnalysisDTO {
  executiveSummary: string;
  rootCause: string;
  contributingFactors: string[];
  impactAssessment: string;
  whatWentWell: string[];
  whatWentWrong: string[];
  preventiveActions: string[];
  testingRecommendations: string[];
  monitoringRecommendations: string[];
  missingInformation: string[];
  generatedAt: string;
}

// ==========================================
// PHASE 8: PREDICTIVE ANALYTICS & FORECASTING
// ==========================================

export interface BacklogForecastPoint {
  date: string;
  projectedOpenIssues: number;
  projectedNewIssues: number;
  projectedResolvedIssues: number;
}

export interface BacklogForecast {
  currentBacklog: number;
  forecast7Days: number;
  forecast14Days: number;
  forecast30Days: number;
  direction: ForecastDirection;
  confidence: ForecastConfidence;
  points: BacklogForecastPoint[];
  explanation: string[];
}

export interface SlaForecast {
  currentCompliancePercentage: number;
  forecast7Days: number;
  forecast14Days: number;
  forecast30Days: number;
  direction: ForecastDirection;
  confidence: ForecastConfidence;
  expectedAtRiskIssues: number;
  expectedBreachedIssues: number;
  explanation: string[];
}

export interface DeveloperCapacityForecast {
  developerId: string;
  developerName: string;
  currentCapacity: string;
  projectedCapacity: string;
  activeIssues: number;
  projectedIssues7Days: number;
  projectedIssues14Days: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDaysToOverload: number | null;
  explanation: string[];
}

export interface ComponentForecast {
  component: string;
  currentRisk: string;
  projectedRisk: string;
  currentActiveIssues: number;
  projectedActiveIssues: number;
  growthPercentage: number;
  incidentTrend: string;
  confidence: ForecastConfidence;
  explanation: string[];
}

export interface IncidentForecast {
  currentIncidentCount: number;
  incidentsLast7Days: number;
  incidentsLast30Days: number;
  projectedIncidents14Days: number;
  recurrenceDirection: ForecastDirection;
  recurrenceRisk: string;
  confidence: ForecastConfidence;
  explanation: string[];
}

export interface ProjectDeliveryRisk {
  score: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentHealthScore: number;
  backlogPressure: number;
  slaPressure: number;
  capacityPressure: number;
  incidentPressure: number;
  resolutionPressure: number;
  confidence: ForecastConfidence;
  reasons: string[];
}

export interface AnalyticsOverview {
  projectId: string;
  projectName: string;
  projectKey: string;
  generatedAt: string;
  backlogForecast: BacklogForecast;
  slaForecast: SlaForecast;
  developerCapacityForecasts: DeveloperCapacityForecast[];
  componentForecasts: ComponentForecast[];
  incidentForecast: IncidentForecast;
  deliveryRisk: ProjectDeliveryRisk;
}

export interface AIAnalyticsBriefing {
  summary: string;
  keyRisks: string[];
  forecastHighlights: string[];
  recommendedFocusAreas: string[];
  generatedAt: string;
}
