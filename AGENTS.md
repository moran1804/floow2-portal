# Architecture rules

- Keep Insights synthetic records isolated from client telemetry and visibly labelled until a real journey source is connected, to prevent sample metrics being mistaken for live data.
- Use the existing protected admin layout and customer context for Insights, to preserve portal navigation and customer scope.