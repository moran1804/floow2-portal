import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCustomer } from "@/contexts/CustomerContext";
import {
  countUnread,
  type NotificationCategory,
  type PortalNotification,
} from "@/lib/notifications";

type SendNotificationInput = {
  category: NotificationCategory;
  title: string;
  body: string;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const { selectedCustomerId } = useCustomer();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", selectedCustomerId, user?.id] as const;

  const query = useQuery({
    queryKey,
    enabled: Boolean(user && selectedCustomerId),
    queryFn: async (): Promise<PortalNotification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, customer_id, category, title, body, sender_name, sent_at")
        .eq("customer_id", selectedCustomerId!)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      if (!data.length) return [];

      const { data: reads, error: readsError } = await supabase
        .from("notification_reads")
        .select("notification_id, read_at")
        .eq("user_id", user!.id)
        .in("notification_id", data.map((notification) => notification.id));
      if (readsError) throw readsError;

      const readDates = new Map(reads.map((read) => [read.notification_id, read.read_at]));
      return data.map((notification) => ({
        ...notification,
        category: notification.category as NotificationCategory,
        read_at: readDates.get(notification.id) ?? null,
      }));
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const sendMutation = useMutation({
    mutationFn: async (input: SendNotificationInput) => {
      if (!user || !selectedCustomerId) throw new Error("Select a client and sign in again.");
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          ...input,
          customer_id: selectedCustomerId,
          created_by: user.id,
          sender_name: user.email ?? "Portal administrator",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error("Sign in again to update your inbox.");
      const { error } = await supabase.from("notification_reads").upsert(
        { notification_id: notificationId, user_id: user.id },
        { onConflict: "notification_id,user_id", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PortalNotification[]>(queryKey);
      queryClient.setQueryData<PortalNotification[]>(queryKey, (current = []) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: notification.read_at ?? new Date().toISOString() }
            : notification,
        ),
      );
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in again to update your inbox.");
      const unread = (query.data ?? []).filter((notification) => !notification.read_at);
      if (!unread.length) return;
      const { error } = await supabase.from("notification_reads").upsert(
        unread.map((notification) => ({ notification_id: notification.id, user_id: user.id })),
        { onConflict: "notification_id,user_id", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PortalNotification[]>(queryKey);
      const readAt = new Date().toISOString();
      queryClient.setQueryData<PortalNotification[]>(queryKey, (current = []) =>
        current.map((notification) => ({ ...notification, read_at: notification.read_at ?? readAt })),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: invalidate,
  });

  const notifications = query.data ?? [];
  return {
    notifications,
    unreadCount: countUnread(notifications),
    isLoading: query.isLoading,
    error: query.error,
    sendNotification: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
};
