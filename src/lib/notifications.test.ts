import { describe, expect, it } from "vitest";
import {
  canSendNotifications,
  countUnread,
  filterNotifications,
  type PortalNotification,
} from "./notifications";

const notification = (overrides: Partial<PortalNotification>): PortalNotification => ({
  id: "notification-1",
  customer_id: "customer-1",
  category: "release",
  title: "Portal release",
  body: "Release details",
  sender_name: "The Floow",
  sent_at: "2026-11-26T09:00:00Z",
  read_at: null,
  ...overrides,
});

describe("notification inbox", () => {
  it("shows only unread notifications in the unread filter", () => {
    const items = [
      notification({ id: "unread" }),
      notification({ id: "read", read_at: "2026-11-26T10:00:00Z" }),
    ];

    expect(filterNotifications(items, "unread").map((item) => item.id)).toEqual(["unread"]);
    expect(countUnread(items)).toBe(1);
  });

  it("filters releases and features by their exact category", () => {
    const items = [
      notification({ id: "release", category: "release" }),
      notification({ id: "feature", category: "feature" }),
    ];

    expect(filterNotifications(items, "release").map((item) => item.id)).toEqual(["release"]);
    expect(filterNotifications(items, "feature").map((item) => item.id)).toEqual(["feature"]);
  });

  it("allows every signed-in portal user to send notifications", () => {
    expect(canSendNotifications(true)).toBe(true);
  });

  it("does not allow a signed-out visitor to send notifications", () => {
    expect(canSendNotifications(false)).toBe(false);
  });
});
