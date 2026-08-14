import apiClient from "@/api/apiClient";
import type { NotificationItem } from "@/types";

export interface RawNotification {
  id: number | string;
  recipient?: number | string;
  notification_type: string;
  title: string;
  body: string;
  related_model?: string | null;
  related_id?: number | string | null;
  read_at?: string | null;
  is_read?: boolean;
  created_at: string;
}

export function mapRawNotificationToModel(raw: RawNotification): NotificationItem {
  const isRead = raw.is_read ?? (raw.read_at != null);

  return {
    id: String(raw.id),
    title: raw.title,
    body: raw.body,
    notificationType: (raw.notification_type as any) || "general",
    isRead,
    createdAt: raw.created_at || new Date().toISOString(),
    relatedModel: raw.related_model || undefined,
    relatedModelId: raw.related_id ? String(raw.related_id) : undefined,
    relatedId: raw.related_id ? String(raw.related_id) : undefined,
  };
}

/**
 * GET /api/notifications/inbox/
 */
export async function getNotificationsList(): Promise<NotificationItem[]> {
  try {
    const response = await apiClient.get<RawNotification[] | { results: RawNotification[] }>(
      "/notifications/inbox/"
    );
    const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
    return list.map(mapRawNotificationToModel);
  } catch (err) {
    console.warn("Backend API /notifications/inbox/ error:", err);
    return [];
  }
}

/**
 * GET /api/notifications/inbox/unread-count/
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const response = await apiClient.get<{ unread_count: number }>(
      "/notifications/inbox/unread-count/"
    );
    return response.data?.unread_count ?? 0;
  } catch (err) {
    console.warn("Backend API /notifications/inbox/unread-count/ error:", err);
    return 0;
  }
}

/**
 * POST /api/notifications/inbox/{id}/read/
 */
export async function markNotificationReadAPI(id: string): Promise<NotificationItem> {
  const response = await apiClient.post<RawNotification>(`/notifications/inbox/${id}/read/`);
  return mapRawNotificationToModel(response.data);
}

/**
 * POST /api/notifications/inbox/mark-all-read/
 */
export async function markAllNotificationsReadAPI(): Promise<{ message: string; updated_count: number }> {
  const response = await apiClient.post<{ message: string; updated_count: number }>(
    "/notifications/inbox/mark-all-read/"
  );
  return response.data;
}

/**
 * POST /api/notifications/device-tokens/
 */
export async function registerDeviceTokenAPI(payload: {
  fcm_token: string;
  platform?: string;
}): Promise<{ id: number | string; fcm_token: string }> {
  const response = await apiClient.post<{ id: number | string; fcm_token: string }>(
    "/notifications/device-tokens/",
    {
      fcm_token: payload.fcm_token,
      platform: payload.platform || "web",
    }
  );
  return response.data;
}

/**
 * POST /api/notifications/device-tokens/deactivate/
 */
export async function deactivateDeviceTokenAPI(
  fcmToken: string
): Promise<{ message: string; success: boolean }> {
  const response = await apiClient.post<{ message: string; success: boolean }>(
    "/notifications/device-tokens/deactivate/",
    {
      fcm_token: fcmToken,
    }
  );
  return response.data;
}
