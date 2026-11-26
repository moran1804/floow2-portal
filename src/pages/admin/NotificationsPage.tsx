import { useEffect, useMemo, useState, type FormEvent } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Megaphone,
  Plus,
  Rocket,
  Send,
  Sparkles,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useCustomer } from "@/contexts/CustomerContext";
import {
  canSendNotifications,
  filterNotifications,
  type NotificationCategory,
  type NotificationFilter,
} from "@/lib/notifications";

const filters: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "release", label: "Releases" },
  { value: "feature", label: "Features" },
];

const categoryLabel = (category: NotificationCategory) =>
  category === "release" ? "Product release" : "New feature";

const NotificationsPage = () => {
  const { user } = useAuth();
  const { selectedCustomer, selectedCustomerId } = useCustomer();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    sendNotification,
    isSending,
    markRead,
    markAllRead,
    isMarkingAllRead,
  } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [category, setCategory] = useState<NotificationCategory>("release");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
    setFilter("all");
    setStatus(null);
    setPageError(null);
  }, [selectedCustomerId]);

  const visibleNotifications = useMemo(
    () => filterNotifications(notifications, filter),
    [notifications, filter],
  );
  const selected = notifications.find((notification) => notification.id === selectedId) ?? null;
  const canSend = canSendNotifications(Boolean(user));

  const openNotification = (id: string) => {
    setSelectedId(id);
    setPageError(null);
    const notification = notifications.find((item) => item.id === id);
    if (notification && !notification.read_at) {
      void markRead(id).catch((mutationError: Error) => setPageError(mutationError.message));
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!title.trim()) return setFormError("Enter a notification title.");
    if (!body.trim()) return setFormError("Enter the notification message.");

    try {
      await sendNotification({ category, title: title.trim(), body: body.trim() });
      setComposeOpen(false);
      setTitle("");
      setBody("");
      setCategory("release");
      setFilter("all");
      setStatus(`Notification sent to the ${selectedCustomer?.name ?? "selected client"} inbox.`);
    } catch (mutationError) {
      setFormError(mutationError instanceof Error ? mutationError.message : "The notification could not be sent.");
    }
  };

  const handleMarkAllRead = async () => {
    setPageError(null);
    setStatus(null);
    try {
      await markAllRead();
      setStatus("All notifications marked as read.");
    } catch (mutationError) {
      setPageError(mutationError instanceof Error ? mutationError.message : "Your inbox could not be updated.");
    }
  };

  return (
    <AdminLayout
      title="Notifications"
      crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Notifications" }]}
      actions={canSend ? (
        <Button onClick={() => { setComposeOpen(true); setStatus(null); }}>
          <Plus className="mr-2 h-4 w-4" />New notification
        </Button>
      ) : undefined}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-portal-navy">Inbox</h2>
            <p className="mt-1 text-sm text-portal-muted">
              Release news and feature updates for {selectedCustomer?.name ?? "the selected client"}.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-portal-navy text-portal-navy"
            disabled={!unreadCount || isMarkingAllRead}
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {isMarkingAllRead ? "Updating…" : "Mark all as read"}
          </Button>
        </div>

        {status && (
          <div role="status" className="mb-4 flex items-center gap-2 rounded-md border border-portal-border bg-status-active-bg px-4 py-3 text-sm text-status-active-fg">
            <Check className="h-4 w-4" />{status}
          </div>
        )}
        {(pageError || error) && (
          <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError ?? "Notifications could not be loaded. Please try again."}
          </p>
        )}

        <section className="overflow-hidden rounded-lg border border-portal-border bg-portal-panel">
          <div className="flex flex-wrap items-center gap-2 border-b border-portal-border bg-portal-panel-header px-4 py-3">
            {filters.map((item) => {
              const count = filterNotifications(notifications, item.value).length;
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-portal-navy bg-portal-navy text-portal-navy-foreground"
                      : "border-portal-border bg-portal-panel text-portal-navy hover:bg-portal-sidebar-active/50"
                  }`}
                >
                  {item.label}
                  <span className={`ml-2 text-xs ${active ? "text-portal-navy-foreground/80" : "text-portal-muted"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid min-h-[540px] lg:grid-cols-[390px_1fr]">
            <div className="border-b border-portal-border lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between border-b border-portal-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-portal-muted">
                <span>{visibleNotifications.length} {visibleNotifications.length === 1 ? "notification" : "notifications"}</span>
                <span>{unreadCount} unread</span>
              </div>
              {isLoading ? (
                <p className="p-6 text-sm text-portal-muted">Loading notifications…</p>
              ) : visibleNotifications.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <Bell className="mb-3 h-8 w-8 text-portal-muted" />
                  <p className="font-semibold text-portal-navy">No notifications here</p>
                  <p className="mt-1 text-sm text-portal-muted">Try another inbox filter.</p>
                </div>
              ) : (
                <div className="max-h-[650px] overflow-y-auto">
                  {visibleNotifications.map((notification) => {
                    const Icon = notification.category === "release" ? Rocket : Sparkles;
                    const isSelected = selectedId === notification.id;
                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => openNotification(notification.id)}
                        className={`flex w-full items-start gap-3 border-b border-portal-border px-5 py-4 text-left transition-colors last:border-b-0 ${
                          isSelected ? "bg-portal-sidebar-active/60" : "bg-portal-panel hover:bg-portal-surface"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                          notification.category === "release"
                            ? "bg-status-draft-bg text-status-draft-fg"
                            : "bg-status-active-bg text-status-active-fg"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start gap-2">
                            <span className={`flex-1 text-sm ${notification.read_at ? "font-medium" : "font-bold"} text-portal-navy`}>
                              {notification.title}
                            </span>
                            {!notification.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-portal-accent" aria-label="Unread" />}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-portal-muted">{notification.body}</span>
                          <span className="mt-2 block text-xs text-portal-muted">
                            {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
                          </span>
                        </span>
                        <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-portal-muted" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-portal-panel">
              {selected ? (
                <article className="p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      selected.category === "release"
                        ? "bg-status-draft-bg text-status-draft-fg"
                        : "bg-status-active-bg text-status-active-fg"
                    }`}>
                      {selected.category === "release" ? <Rocket className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {categoryLabel(selected.category)}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold leading-tight text-portal-navy sm:text-3xl">{selected.title}</h3>
                  <div className="mt-4 border-b border-portal-border pb-5 text-sm text-portal-muted">
                    <p>From <span className="font-semibold text-portal-text">{selected.sender_name}</span></p>
                    <p className="mt-1">{format(new Date(selected.sent_at), "d MMMM yyyy 'at' HH:mm")}</p>
                  </div>
                  <div className="mt-6 whitespace-pre-line text-sm leading-7 text-portal-text sm:text-base">
                    {selected.body}
                  </div>
                </article>
              ) : (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center p-8 text-center">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-portal-panel-header text-portal-navy">
                    <Megaphone className="h-7 w-7" />
                  </span>
                  <h3 className="text-lg font-bold text-portal-navy">Select a notification</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-portal-muted">
                    Choose an item from your inbox to read the full release or feature update.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Dialog open={composeOpen} onOpenChange={(open) => { setComposeOpen(open); if (!open) setFormError(null); }}>
        <DialogContent className="bg-portal-panel sm:max-w-2xl">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-2xl text-portal-navy">New notification</DialogTitle>
              <DialogDescription>
                Send a release or feature update to the {selectedCustomer?.name ?? "selected client"} portal inbox.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div>
                <label htmlFor="notification-category" className="mb-2 block text-sm font-semibold text-portal-text">Notification type</label>
                <select
                  id="notification-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as NotificationCategory)}
                  className="h-10 w-full rounded-md border border-input bg-portal-panel px-3 text-sm text-portal-text"
                >
                  <option value="release">Product release</option>
                  <option value="feature">New feature</option>
                </select>
              </div>
              <div>
                <label htmlFor="notification-title" className="mb-2 block text-sm font-semibold text-portal-text">Title</label>
                <Input
                  id="notification-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Portal release 2.9 is now available"
                  maxLength={140}
                />
              </div>
              <div>
                <label htmlFor="notification-body" className="mb-2 block text-sm font-semibold text-portal-text">Message</label>
                <Textarea
                  id="notification-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Tell users what has changed and anything they need to do."
                  className="min-h-40"
                  maxLength={4000}
                />
              </div>
              <p className="rounded-md bg-portal-surface px-4 py-3 text-xs leading-5 text-portal-muted">
                This creates an inbox notification only. It does not send an email or mobile push notification.
              </p>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSending}>
                <Send className="mr-2 h-4 w-4" />{isSending ? "Sending…" : "Send notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default NotificationsPage;
