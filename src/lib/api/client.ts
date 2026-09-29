/**
 * Minimal API Client Utilities
 * Clean, typed HTTP wrappers for calling LessonFoundry API routes.
 */

import type { z } from 'zod';
import type {
  CreateUnitSchema,
  UpdateUnitSchema,
  CreateSourceSchema,
  CreateObjectiveSchema,
  UpdateObjectiveSchema,
  CreateAssetSchema,
  UpdateAssetSchema,
  CreateReviewSchema,
  UpdateReviewSchema,
  ResolveQualityIssueSchema,
  CreateUnitVersionSchema,
} from '@/server/schemas';

export type CreateUnitPayload = z.infer<typeof CreateUnitSchema>;
export type UpdateUnitPayload = z.infer<typeof UpdateUnitSchema>;
export type CreateSourcePayload = z.infer<typeof CreateSourceSchema>;
export type CreateObjectivePayload = z.infer<typeof CreateObjectiveSchema>;
export type UpdateObjectivePayload = z.infer<typeof UpdateObjectiveSchema>;
export type CreateAssetPayload = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetPayload = z.infer<typeof UpdateAssetSchema>;
export type CreateReviewPayload = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewPayload = z.infer<typeof UpdateReviewSchema>;
export type ResolveQualityIssuePayload = z.infer<typeof ResolveQualityIssueSchema>;
export type CreateUnitVersionPayload = z.infer<typeof CreateUnitVersionSchema>;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorData: { error?: string; message?: string; details?: unknown } = {};
    try {
      errorData = await res.json();
    } catch {
      // Non-JSON response
    }
    throw new ApiError(
      errorData.message || errorData.error || `HTTP error ${res.status}`,
      res.status,
      errorData.details
    );
  }

  return res.json() as Promise<T>;
}

// ── Units
export const apiClient = {
  // Units
  getUnits: () => request<unknown[]>('/api/units'),
  getUnitById: (id: string) => request<unknown>(`/api/units/${encodeURIComponent(id)}`),
  createUnit: (data: CreateUnitPayload) =>
    request<unknown>('/api/units', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUnit: (id: string, data: UpdateUnitPayload) =>
    request<unknown>(`/api/units/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteUnit: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/units/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Sources
  getSources: (unitId: string) =>
    request<unknown[]>(`/api/units/${encodeURIComponent(unitId)}/sources`),
  createSource: (unitId: string, data: Omit<CreateSourcePayload, 'unitId'>) =>
    request<unknown>(`/api/units/${encodeURIComponent(unitId)}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Objectives
  getObjectives: (unitId: string) =>
    request<unknown[]>(`/api/units/${encodeURIComponent(unitId)}/objectives`),
  createObjective: (unitId: string, data: Omit<CreateObjectivePayload, 'unitId'>) =>
    request<unknown>(`/api/units/${encodeURIComponent(unitId)}/objectives`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateObjective: (unitId: string, objectiveId: string, data: UpdateObjectivePayload) =>
    request<unknown>(
      `/api/units/${encodeURIComponent(unitId)}/objectives?objectiveId=${encodeURIComponent(objectiveId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),
  deleteObjective: (unitId: string, objectiveId: string) =>
    request<{ success: boolean; message: string }>(
      `/api/units/${encodeURIComponent(unitId)}/objectives?objectiveId=${encodeURIComponent(objectiveId)}`,
      {
        method: 'DELETE',
      }
    ),

  // Assets
  getAssets: (unitId: string) =>
    request<unknown[]>(`/api/units/${encodeURIComponent(unitId)}/assets`),
  createAsset: (unitId: string, data: Omit<CreateAssetPayload, 'unitId'>) =>
    request<unknown>(`/api/units/${encodeURIComponent(unitId)}/assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAsset: (unitId: string, assetId: string, data: UpdateAssetPayload) =>
    request<unknown>(
      `/api/units/${encodeURIComponent(unitId)}/assets?assetId=${encodeURIComponent(assetId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  // Reviews
  getReviews: (unitId: string, assetId?: string) => {
    const query = assetId ? `?assetId=${encodeURIComponent(assetId)}` : '';
    return request<unknown[]>(`/api/units/${encodeURIComponent(unitId)}/reviews${query}`);
  },
  createReview: (unitId: string, data: CreateReviewPayload) =>
    request<unknown>(`/api/units/${encodeURIComponent(unitId)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReview: (unitId: string, reviewId: string, data: UpdateReviewPayload) =>
    request<unknown>(
      `/api/units/${encodeURIComponent(unitId)}/reviews?reviewId=${encodeURIComponent(reviewId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  // Quality Issues
  getQualityIssues: (unitId: string) =>
    request<unknown[]>(`/api/units/${encodeURIComponent(unitId)}/quality`),
  updateQualityIssueStatus: (
    unitId: string,
    issueId: string,
    data: ResolveQualityIssuePayload
  ) =>
    request<unknown>(
      `/api/units/${encodeURIComponent(unitId)}/quality?issueId=${encodeURIComponent(issueId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  // Versions
  getVersions: (unitId: string) =>
    request<unknown[]>(`/api/units/${encodeURIComponent(unitId)}/versions`),
  createVersionSnapshot: (unitId: string, data: Omit<CreateUnitVersionPayload, 'unitId'>) =>
    request<unknown>(`/api/units/${encodeURIComponent(unitId)}/versions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
