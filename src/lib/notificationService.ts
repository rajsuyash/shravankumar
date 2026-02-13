import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'booking_confirmed'
  | 'medical_clearance'
  | 'trip_reminder'
  | 'message_received'
  | 'sos_emergency';

export const NOTIFICATION_META: Record<string, { icon: string; color: string }> = {
  booking_confirmed: { icon: 'check_circle', color: 'text-green-600' },
  medical_clearance: { icon: 'health_and_safety', color: 'text-blue-600' },
  trip_reminder: { icon: 'event', color: 'text-amber-600' },
  message_received: { icon: 'chat', color: 'text-purple-600' },
  sos_emergency: { icon: 'emergency', color: 'text-red-600' },
};

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
  });
  if (error) console.error('Failed to create notification:', error);
}

export async function getRecentNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
  return (data || []) as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
  return count || 0;
}

export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) console.error('Failed to mark notification as read:', error);
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) console.error('Failed to mark all as read:', error);
}

export function subscribeToNotifications(
  userId: string,
  onNew: (notification: Notification) => void,
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new as Notification);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
