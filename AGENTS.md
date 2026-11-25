# Architecture rules

- Keep Insights synthetic records isolated from client telemetry and visibly labelled until a real journey source is connected, to prevent sample metrics being mistaken for live data.
- Use the existing protected admin layout and customer context for Insights, to preserve portal navigation and customer scope.
- Store developer Apps per customer in the apps table with admin-only access, so each client manages its own app credentials config.
- Store the Braze API key and endpoint once per client (braze_configs, admin-only); per-product campaign toggles stay on products so the product editor and Campaigns config share one source.
- Store REST API credentials per customer in api_credentials (admin-only), so each client manages its own API access.
- Store webhook subscriptions and sent-event logs per customer (webhook_subscriptions, webhook_events; admin-only), so each client manages its own webhook targets.
- Store searchable app-user identities in customer-scoped insurer_users, separate from authentication accounts; use the invoker-rights search function and explicit client filters for search/account reads so identities never grant portal access.
- Keep the Impacts screen's presentation-only sample records visibly labelled and separate from client telemetry until a real impact source is connected, so examples cannot be mistaken for live cases.
- Share synthetic impact records between the list and protected report routes; use Leaflet/OpenStreetMap for sample journeys and show embedded Street View as unavailable until connected, so navigation stays consistent without fabricating live geographic evidence.
- Share customer-keyed browser search-matching preferences between Configuration and insurer search until server settings are connected; use parameterized exact/partial database searches for saved identities, while clearly labelling unconnected score, journey, file, impact, and acceptance sources.
- Debounce Smart match user searches and discard superseded responses on query, mode, or customer changes; keep Exact match submission-only to avoid stale or cross-client results.
- Render overview score gauges through the shared UserScoreTile using semantic score tokens, keeping sample score presentation separate from stored user data.
