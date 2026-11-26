export type NotificationCategory = "release" | "feature";
export type NotificationFilter = "all" | "unread" | NotificationCategory;

export type PortalNotification = {
  id: string;
  customer_id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  sender_name: string;
  sent_at: string;
  read_at: string | null;
};

export const filterNotifications = (
  notifications: PortalNotification[],
  filter: NotificationFilter,
) => notifications.filter((notification) => {
  if (filter === "all") return true;
  if (filter === "unread") return notification.read_at === null;
  return notification.category === filter;
});

export const countUnread = (notifications: PortalNotification[]) =>
  notifications.filter((notification) => notification.read_at === null).length;

// The database enforces this same rule; this only controls whether the action is shown.
export const canSendNotifications = (isSignedIn: boolean) => isSignedIn;
