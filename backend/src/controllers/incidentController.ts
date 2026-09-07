import { Request, Response, NextFunction } from 'express';
import { incidentService } from '../services/incidentService.js';
import { incidentEscalationService } from '../services/incidentEscalationService.js';
import { incidentIntelligenceService } from '../services/incidentIntelligenceService.js';
import { postIncidentAnalysisService } from '../ai/postIncidentAnalysisService.js';

export const createIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incident = await incidentService.createIncident(req.user!, req.body);
    res.status(201).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, severity, status } = req.query;
    const incidents = await incidentService.getIncidents(req.user!, {
      projectId: projectId as string,
      severity: severity as any,
      status: status as any,
    });
    res.status(200).json({ success: true, data: incidents, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getIncidentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const incident = await incidentService.getIncidentById(req.user!, incidentId);
    res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const incident = await incidentService.acknowledgeIncident(req.user!, incidentId);
    res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const transitionIncidentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const { status } = req.body;
    const incident = await incidentService.transitionIncidentStatus(req.user!, incidentId, status);
    res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const assignIncidentOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const { ownerId } = req.body;
    const incident = await incidentService.assignIncidentOwner(req.user!, incidentId, ownerId);
    res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const resolveIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const { impactSummary } = req.body;
    const incident = await incidentService.resolveIncident(req.user!, incidentId, impactSummary);
    res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const closeIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const incident = await incidentService.closeIncident(req.user!, incidentId);
    res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const escalateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const issueId = req.params.id as string;
    const { severity, impactSummary } = req.body;
    const incident = await incidentService.escalateIssueToIncident(
      req.user!,
      issueId,
      severity,
      impactSummary
    );
    res.status(201).json({ success: true, data: incident, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getIncidentTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const timeline = await incidentService.getIncidentTimeline(req.user!, incidentId);
    res.status(200).json({ success: true, data: timeline, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getRelatedIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const issues = await incidentService.getRelatedIssues(req.user!, incidentId);
    res.status(200).json({ success: true, data: issues, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getEscalations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const escalations = await incidentEscalationService.evaluateIncidentEscalations(req.user!, incidentId);
    res.status(200).json({ success: true, data: escalations, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getIncidentMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.query;
    const metrics = await incidentIntelligenceService.getProjectIncidentMetrics(req.user!, projectId as string);
    res.status(200).json({ success: true, data: metrics, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getIncidentRecurrence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const recurrence = await incidentIntelligenceService.getIncidentRecurrence(req.user!, incidentId);
    res.status(200).json({ success: true, data: recurrence, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getPostIncidentAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incidentId = req.params.id as string;
    const analysis = await postIncidentAnalysisService.generateAnalysis(req.user!, incidentId);
    res.status(200).json({ success: true, data: analysis, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};
