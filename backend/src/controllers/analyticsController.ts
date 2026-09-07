import { Request, Response, NextFunction } from 'express';
import { analyticsAggregationService } from '../services/analytics/analyticsAggregationService.js';
import { backlogForecastService } from '../services/analytics/backlogForecastService.js';
import { slaForecastService } from '../services/analytics/slaForecastService.js';
import { capacityForecastService } from '../services/analytics/capacityForecastService.js';
import { componentForecastService } from '../services/analytics/componentForecastService.js';
import { incidentForecastService } from '../services/analytics/incidentForecastService.js';
import { deliveryRiskService } from '../services/analytics/deliveryRiskService.js';
import { analyticsBriefingService } from '../ai/analyticsBriefingService.js';
import { ApiError } from '../middlewares/errorHandler.js';

function parseProjectId(projectIdValue: unknown): string | undefined {
  if (projectIdValue === undefined) {
    return undefined;
  }

  if (typeof projectIdValue !== 'string') {
    throw ApiError.badRequest('projectId query parameter must be a string');
  }

  const projectId = projectIdValue.trim();
  if (!projectId) {
    throw ApiError.badRequest('projectId query parameter cannot be empty');
  }

  return projectId;
}

export const getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    const overview = await analyticsAggregationService.getAnalyticsOverview(req.user!, projectId);
    res.status(200).json({ success: true, data: overview, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getBacklogForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: null, timestamp: new Date().toISOString() });
      return;
    }
    const forecast = await backlogForecastService.forecastBacklog(req.user!, projectId);
    res.status(200).json({ success: true, data: forecast, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getSlaForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: null, timestamp: new Date().toISOString() });
      return;
    }
    const forecast = await slaForecastService.forecastSla(req.user!, projectId);
    res.status(200).json({ success: true, data: forecast, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getCapacityForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
      return;
    }
    const forecast = await capacityForecastService.forecastDeveloperCapacity(req.user!, projectId);
    res.status(200).json({ success: true, data: forecast, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getComponentForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
      return;
    }
    const forecast = await componentForecastService.forecastComponents(req.user!, projectId);
    res.status(200).json({ success: true, data: forecast, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getIncidentForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: null, timestamp: new Date().toISOString() });
      return;
    }
    const forecast = await incidentForecastService.forecastIncidents(req.user!, projectId);
    res.status(200).json({ success: true, data: forecast, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: null, timestamp: new Date().toISOString() });
      return;
    }
    const risk = await deliveryRiskService.calculateDeliveryRisk(req.user!, projectId);
    res.status(200).json({ success: true, data: risk, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getBriefing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseProjectId(req.query.projectId);
    if (!projectId) {
      res.status(200).json({ success: true, data: null, timestamp: new Date().toISOString() });
      return;
    }
    const briefing = await analyticsBriefingService.generateBriefing(req.user!, projectId);
    res.status(200).json({ success: true, data: briefing, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};
