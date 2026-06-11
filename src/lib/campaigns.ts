export type CampaignDef = {
  key: string;
  name: string;
  useCase: string;
};

export const ALWAYS_ENABLED_CAMPAIGNS = ["app_usage", "permissions", "welcome_comms"];

export const CAMPAIGNS: CampaignDef[] = [
  {
    key: "app_usage",
    name: "APP Usage Attributes",
    useCase:
      "Use the last session date to communicate with users who are not opening the app, helping drive them back in.",
  },
  {
    key: "permissions",
    name: "Permissions Attributes",
    useCase:
      "Send communications when mobile permissions (location, motion, optimisation, notifications) are not set correctly so users can get set up.",
  },
  {
    key: "welcome_comms",
    name: "User Attributes",
    useCase:
      "When a user is created they need to be sent communications detailing where they can download the app and how to log in.",
  },
  {
    key: "trip_and_usage_based",
    name: "Trip and Usage Based Attributes",
    useCase:
      "When a user is logged in and taking part in a programme, send campaigns and rewards encouraging them to record journeys and take part in the programme.",
  },
  {
    key: "digital_driver_coaching",
    name: "Scoring Attributes",
    useCase:
      "Serve driver coaching hints and tips based on the user's driver behaviour scoring, matching what is shown in the application.",
  },
  {
    key: "driver_cancellation",
    name: "Driver Cancellation",
    useCase:
      "When a driver is deactivated, ensure no further comms are sent to the customer as they are out of the programme.",
  },
  {
    key: "crash",
    name: "Crash Attributes",
    useCase:
      "When a crash of a certain probability is detected, trigger emergency and help communications.",
  },
];
