export type CampaignDef = {
  key: string;
  name: string;
  useCase: string;
};

export const ALWAYS_ENABLED_CAMPAIGNS = ["app_usage", "permissions"];

export const CAMPAIGNS: CampaignDef[] = [
  {
    key: "app_usage",
    name: "APP Usage Campaigns",
    useCase:
      "Use the last session date to communicate with users who are not opening the app, helping drive them back in.",
  },
  {
    key: "permissions",
    name: "Permissions Campaigns",
    useCase:
      "Send communications when mobile permissions (location, motion, optimisation, notifications) are not set correctly so users can get set up.",
  },
  {
    key: "welcome_comms",
    name: "Welcome Comms",
    useCase:
      "When a user is created they need to be sent communications detailing where they can download the app and how to log in.",
  },
  {
    key: "trip_and_usage_based",
    name: "Trip and Usage Based Campaigns",
    useCase:
      "When a user is logged in and taking part in a programme, send campaigns and rewards encouraging them to record journeys and take part in the programme.",
  },
  {
    key: "digital_driver_coaching",
    name: "Digital Driver Coaching",
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
    key: "product_code",
    name: "Product Code Campaigns",
    useCase:
      "Tailor communications based on the user's currently active product so campaign logic can target the right programme.",
  },
  {
    key: "crash",
    name: "Crash Campaigns",
    useCase:
      "When a crash of a certain probability is detected, trigger emergency and help communications.",
  },
];
