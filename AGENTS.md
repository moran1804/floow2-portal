# Architecture rules

- Keep Insights synthetic records isolated from client telemetry and visibly labelled until a real journey source is connected, to prevent sample metrics being mistaken for live data.
- Use the existing protected admin layout and customer context for Insights, to preserve portal navigation and customer scope.- Store developer Apps per customer in the apps table with admin-only access, so each client manages its own app credentials config.
- Store the Braze API key and endpoint once per client (braze_configs, admin-only); per-product campaign toggles stay on products so the product editor and Campaigns config share one source.
- Store REST API credentials per customer in api_credentials (admin-only), so each client manages its own API access.
- Store webhook subscriptions and sent-event logs per customer (webhook_subscriptions, webhook_events; admin-only), so each client manages its own webhook targets.
- Keep insurer user search in the protected portal; show an explicit unavailable state until a real customer-scoped user data source is connected, so UI submissions never imply a completed search.
- Keep the Impacts screen's presentation-only sample records visibly labelled and separate from client telemetry until a real impact source is connected, so examples cannot be mistaken for live cases.
- Share synthetic impact records between the list and protected report routes; use Leaflet/OpenStreetMap for sample journeys and show embedded Street View as unavailable until connected, so navigation stays consistent without fabricating live geographic evidence.
