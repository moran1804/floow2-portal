// Presentation-only client staff permissions from the supplied matrix.
export const CLIENT_PREVIEW_ROLES = ["Client Account Manager", "Client Team Manager", "Client Developer", "Client Claims Advisor", "Client Customer Service Advisor"] as const;
export const CLIENT_ROLE_PERMISSIONS = {
  "audits/logs/read": [],
  "audits/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer"
  ],
  "auth/list": [],
  "braze/configuration/read": [],
  "braze/configuration/write": [],
  "braze/requests/read": [],
  "braze/requests/replay": [],
  "feature_subscriptions/read": [
    "Client Account Manager",
    "Client Developer"
  ],
  "feature_subscriptions/write": [],
  "feedback/read": [
    "Client Account Manager"
  ],
  "feedback/write": [],
  "floow_clients/apps/create": [
    "Client Account Manager",
    "Client Developer"
  ],
  "floow_clients/apps/delete": [],
  "floow_clients/apps/read": [
    "Client Account Manager",
    "Client Developer"
  ],
  "floow_clients/config/read": [
    "Client Account Manager",
    "Client Developer",
    "Client Customer Service Advisor"
  ],
  "floow_clients/config/write": [
    "Client Account Manager"
  ],
  "floow_clients/create": [],
  "floow_clients/delete": [],
  "floow_clients/list": [],
  "floow_clients/modes_of_transport/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "floow_clients/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "floow_clients/staff/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer"
  ],
  "floow_clients/staff/write": [
    "Client Account Manager"
  ],
  "impacts/case_status/write": [
    "Client Account Manager",
    "Client Claims Advisor"
  ],
  "impacts/create": [],
  "impacts/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer",
    "Client Claims Advisor"
  ],
  "impacts/update": [],
  "journeys/events/read": [],
  "journeys/insights/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer"
  ],
  "journeys/list": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "journeys/mode_of_transport/write": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "journeys/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "journeys/revisions/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "journeys/upload": [],
  "policies/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "policies/write": [],
  "product_features/read": [
    "Client Account Manager",
    "Client Developer"
  ],
  "products/read": [
    "Client Account Manager",
    "Client Developer",
    "Client Customer Service Advisor"
  ],
  "products/terms/read": [
    "Client Account Manager",
    "Client Developer",
    "Client Customer Service Advisor"
  ],
  "products/terms/write": [
    "Client Account Manager"
  ],
  "products/terms_acceptance/read": [
    "Client Account Manager",
    "Client Developer",
    "Client Customer Service Advisor"
  ],
  "products/terms_acceptance/write": [],
  "products/write": [
    "Client Account Manager"
  ],
  "reports/delivery/read": [
    "Client Account Manager",
    "Client Developer"
  ],
  "reports/delivery/retry": [
    "Client Account Manager"
  ],
  "reports/delivery/write": [
    "Client Account Manager",
    "Client Developer"
  ],
  "reports/read": [
    "Client Account Manager",
    "Client Developer"
  ],
  "reports/write": [
    "Client Account Manager"
  ],
  "scores/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "users/files/read": [],
  "users/files/write": [],
  "users/personalisation/write": [],
  "users/read": [
    "Client Account Manager",
    "Client Team Manager",
    "Client Developer",
    "Client Claims Advisor",
    "Client Customer Service Advisor"
  ],
  "users/usage_reset/delete": [
    "Client Account Manager"
  ],
  "users/usage_reset/read": [
    "Client Account Manager",
    "Client Developer",
    "Client Customer Service Advisor"
  ],
  "users/usage_reset/write": [
    "Client Account Manager"
  ],
  "users/write": [
    "Client Account Manager"
  ],
  "webhooks/read": [
    "Client Account Manager",
    "Client Developer"
  ],
  "webhooks/write": [
    "Client Account Manager",
    "Client Developer"
  ]
} as const;
